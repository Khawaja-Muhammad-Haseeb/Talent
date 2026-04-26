import re
from io import BytesIO
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.services.score_calculator import calculate_final_score
from app.services.credential_generator import generate_credential
from app.services.summary_generator import generate_certificate_summary
from app.services.ipfs_uploader import upload_to_ipfs

router = APIRouter()

ISSUED_CREDENTIALS = {}


class GenerateRequest(BaseModel):
    stage1_context: dict
    stage2_context: dict
    stage3_context: dict


@router.post("/generate")
async def generate_certificate(payload: GenerateRequest):
    stage1 = payload.stage1_context
    stage2 = payload.stage2_context
    stage3 = payload.stage3_context

    score_data = calculate_final_score(stage1, stage2, stage3)
    if not score_data["eligible"]:
        reason = (
            "Based on challenge performance, a certificate cannot be issued at this time. Keep building and try again."
            if stage3.get("evaluation", {}).get("certificationRecommendation") == "Not Recommended"
            and score_data["finalScore"] < 6.0
            else "Final score is below certificate threshold. Keep practicing and try again."
        )
        return {"eligible": False, "reason": reason, "scoreData": score_data}

    name = stage2.get("name") or stage1.get("name") or "Developer"
    domain = stage2.get("domain") or stage1.get("domain") or "Software Development"

    credential_meta = generate_credential(
        name=name,
        domain=domain,
        level=score_data["level"],
        final_score=score_data["finalScore"],
    )
    summary = await generate_certificate_summary(
        stage1, stage2, stage3, score_data["finalScore"], score_data["level"]
    )

    credential = {
        "credentialId": credential_meta["credentialId"],
        "issuedAt": credential_meta["issuedAt"],
        "issuedDate": credential_meta["issuedDate"],
        "expiryDate": credential_meta["expiryDate"],
        "issuer": "TalentMap Protocol",
        "standard": "W3C Verifiable Credential (mock)",
        "name": name,
        "domain": domain,
        "level": score_data["level"],
        "finalScore": score_data["finalScore"],
        "resumeScore": score_data["resumeScore"],
        "githubScore": score_data["githubScore"],
        "challengeScore": score_data["challengeScore"],
        "topSkills": stage1.get("topSkills", []),
        "topLanguages": stage2.get("topLanguages", []),
        "notableProjects": stage2.get("notableProjects", []),
        "challengeCompleted": {
            "title": stage3.get("challenge", {}).get("title"),
            "domain": stage3.get("challenge", {}).get("domain"),
            "difficulty": stage3.get("challenge", {}).get("difficulty"),
            "score": stage3.get("evaluation", {}).get("score"),
        },
        "certificateSummary": summary,
        "blockchain": "Polygon Mumbai (mock anchor)",
        "version": "1.0",
    }

    ipfs = None
    warning = None
    try:
        ipfs = await upload_to_ipfs(credential)
        credential.update(ipfs)
    except HTTPException:
        warning = "IPFS upload failed. Certificate stored locally for demo."

    ISSUED_CREDENTIALS[credential["credentialId"]] = credential

    return {
        "eligible": True,
        "credential": credential,
        "ipfs": ipfs,
        "warning": warning,
    }


@router.get("/verify/{credential_id}")
async def verify_credential(credential_id: str):
    if not re.match(r"^TMP-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$", credential_id):
        return {"found": False, "message": "Credential not found. The ID may be incorrect."}

    credential = ISSUED_CREDENTIALS.get(credential_id)
    if not credential:
        return {"found": False, "message": "Credential not found. The ID may be incorrect."}
    return {"found": True, "credential": credential}


@router.get("/ipfs/{ipfs_hash}")
async def fetch_from_ipfs(ipfs_hash: str):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}")
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="IPFS record not found.")
    return response.json()


@router.get("/download/{credential_id}")
async def download_certificate_pdf(credential_id: str):
    credential = ISSUED_CREDENTIALS.get(credential_id)
    if not credential:
        raise HTTPException(status_code=404, detail="Credential not found. The ID may be incorrect.")

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 60

    def line(text, size=11, gap=18):
        nonlocal y
        pdf.setFont("Helvetica", size)
        pdf.drawString(50, y, text)
        y -= gap

    pdf.setTitle(f"Talent Certificate - {credential_id}")
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, y, "Certificate of Verified Skill")
    y -= 28
    line(f"Name: {credential.get('name', 'Unknown')}", 12)
    line(f"Domain: {credential.get('domain', 'Unknown')}", 12)
    line(f"Level: {credential.get('level', 'Unknown')}", 12)
    line(f"Final Score: {credential.get('finalScore', 0)} / 10", 12)
    line(f"Resume: {credential.get('resumeScore', 0)} / 10")
    line(f"GitHub: {credential.get('githubScore', 0)} / 10")
    line(f"Challenge: {credential.get('challengeScore', 0)} / 10")
    y -= 8
    line("Summary:", 12)

    summary = credential.get("certificateSummary", "")
    words = summary.split()
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if len(candidate) > 95:
            line(current, 10, 14)
            current = word
        else:
            current = candidate
    if current:
        line(current, 10, 14)

    y -= 8
    line(f"Credential ID: {credential.get('credentialId', '')}", 11)
    line(f"Issued: {credential.get('issuedDate', '')} | Expiry: {credential.get('expiryDate', '')}", 11)
    line(f"IPFS Hash: {credential.get('ipfsHash', 'Not available')}", 9)
    line("Issuer: TalentMap Protocol", 10)

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    filename = f"{credential_id}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
