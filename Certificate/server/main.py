import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.certificate_router import router as certificate_router

LOCAL_ENV_PATH = Path(__file__).resolve().parent / ".env"
GLOBAL_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=GLOBAL_ENV_PATH)
load_dotenv(dotenv_path=LOCAL_ENV_PATH, override=False)

app = FastAPI(title="Talent Stage 5 - Certificate Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(certificate_router, prefix="/api/stage5")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Stage 5 certificate backend running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8003")), reload=True)
