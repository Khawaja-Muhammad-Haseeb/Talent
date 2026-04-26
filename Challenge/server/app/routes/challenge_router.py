from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.challenge_generator import generate_challenge
from app.services.solution_evaluator import evaluate_solution

router = APIRouter()


class GenerateRequest(BaseModel):
    stage1_context: dict
    stage2_context: dict


class EvaluateRequest(BaseModel):
    challenge: dict
    solution: str
    stage1_context: dict
    stage2_context: dict


@router.post("/generate")
async def generate(payload: GenerateRequest):
    challenge = await generate_challenge(payload.stage1_context, payload.stage2_context)
    return {"challenge": challenge}


@router.post("/evaluate")
async def evaluate(payload: EvaluateRequest):
    if not payload.solution.strip():
        raise HTTPException(status_code=400, detail="Please write your solution before submitting")
    evaluation = await evaluate_solution(
        challenge=payload.challenge,
        solution=payload.solution,
        stage1_context=payload.stage1_context,
        stage2_context=payload.stage2_context,
    )
    return {"evaluation": evaluation}
