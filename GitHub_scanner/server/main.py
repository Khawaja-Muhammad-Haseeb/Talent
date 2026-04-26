import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.github_analyzer import router as github_analyzer_router

GLOBAL_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=GLOBAL_ENV_PATH)

app = FastAPI(title="Talent Stage 2 - GitHub Scanner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(github_analyzer_router, prefix="/api/stage2")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Stage 2 backend running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8001")), reload=True)
