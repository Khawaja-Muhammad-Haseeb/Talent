import os
import traceback
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from py_services.parse_resume import parse_resume
from py_services.extract_links import extract_links
from py_services.fetch_links import fetch_links
from py_services.groq_analyzer import groq_analyzer

load_dotenv()

app = FastAPI(title="Talent Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Talent Resume Analyzer API is running.",
        "endpoints": {"analyze": "POST /api/analyze"},
    }


@app.post("/api/analyze")
async def analyze_resume(resume: UploadFile = File(...)):
    filename = (resume.filename or "").lower()
    if resume.content_type not in ALLOWED_MIME_TYPES and not (
        filename.endswith(".pdf") or filename.endswith(".docx")
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed. Please upload a valid resume.",
        )

    file_bytes = await resume.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        resume_text = parse_resume(file_bytes, filename, resume.content_type or "")
        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this file. Please ensure it is not a scanned image PDF.",
            )

        links = extract_links(resume_text)
        linked_content = await fetch_links(links)
        report = await groq_analyzer(resume_text, linked_content)

        return {
            **report,
            "nextStageContext": report,
        }
    except HTTPException:
        raise
    except ValueError as error:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        traceback.print_exc()
        message = str(error)
        if "authentication failed" in message.lower() or "invalid api key" in message.lower():
            raise HTTPException(status_code=401, detail=message) from error
        raise HTTPException(
            status_code=500, detail="Analysis failed. Please try again."
        ) from error
    except Exception as error:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=str(error) or "Unexpected server error while analyzing resume.",
        ) from error


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "5000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
