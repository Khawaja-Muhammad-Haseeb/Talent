import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.challenge_router import router as challenge_router

load_dotenv()

app = FastAPI(title="Talent Stage 3 - Challenge Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(challenge_router, prefix="/api/stage3")


@app.get("/")
async def root():
    return {"status": "ok", "message": "Stage 3 challenge backend running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8002")), reload=True)
