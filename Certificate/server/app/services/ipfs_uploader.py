import os
import json
import httpx
from fastapi import HTTPException


async def upload_to_ipfs(credential_data: dict) -> dict:
    pinata_jwt = (os.getenv("PINATA_JWT") or "").strip()
    if not pinata_jwt:
        raise HTTPException(500, "IPFS upload failed. Check your Pinata JWT token.")

    # Pinata v3 upload endpoint (legacy pinJSON endpoint is deprecated for new keys).
    url = "https://uploads.pinata.cloud/v3/files"
    file_name = f"TalentMap-{credential_data['credentialId']}.json"
    file_bytes = json.dumps(credential_data, ensure_ascii=True, indent=2).encode("utf-8")

    files = {
        "file": (file_name, file_bytes, "application/json"),
    }
    form_data = {
        "name": file_name,
        "network": "public",
    }
    headers = {
        "Authorization": f"Bearer {pinata_jwt}",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            url, data=form_data, files=files, headers=headers, timeout=30
        )

    if response.status_code not in (200, 201):
        detail = "IPFS upload failed. Check your Pinata JWT token."
        try:
            body = response.json()
            message = (
                body.get("error", {}).get("reason")
                or body.get("error", {}).get("details")
                or body.get("message")
                or response.text
            )
            if message:
                detail = f"IPFS upload failed. {message}"
        except Exception:
            if response.text:
                detail = f"IPFS upload failed. {response.text[:200]}"
        raise HTTPException(500, detail)

    data = response.json()
    # Pinata v3 response: { data: { cid: "..." } }
    ipfs_hash = (
        data.get("data", {}).get("cid")
        or data.get("IpfsHash")  # legacy fallback
    )
    if not ipfs_hash:
        raise HTTPException(500, "IPFS upload failed. Missing IPFS hash in Pinata response.")

    return {
        "ipfsHash": ipfs_hash,
        "ipfsUrl": f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}",
        "publicUrl": f"https://ipfs.io/ipfs/{ipfs_hash}",
    }
