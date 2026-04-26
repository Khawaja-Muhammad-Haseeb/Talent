import json
import os
from fastapi import HTTPException
from groq import Groq


def _clean_json(raw_text: str) -> dict:
    cleaned = (raw_text or "").strip().replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


async def evaluate_solution(
    challenge: dict,
    solution: str,
    stage1_context: dict,
    stage2_context: dict,
) -> dict:
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="Evaluation failed. Please try again.")

    name = stage2_context.get("name") or stage1_context.get("name") or "Developer"
    domain = stage2_context.get("domain") or stage1_context.get("domain") or "General"
    level = stage2_context.get("experienceLevel") or stage1_context.get("experienceLevel") or "Intermediate"
    top_skills = stage1_context.get("topSkills", [])

    system_prompt = """You are a strict but fair senior technical evaluator for Talent, a global 
developer verification platform. You are evaluating a developer's solution 
to a domain-specific challenge.

You have full context about the developer from their resume and GitHub analysis.
Use this context to calibrate your evaluation - a Beginner solving a Beginner 
challenge should be evaluated on foundational correctness, while a Professional 
solving a Professional challenge should be evaluated on depth, trade-offs, 
and real-world applicability.

Be honest. Partial credit is valid. An incomplete solution that shows strong 
reasoning can score higher than a complete solution that shows no understanding.

Respond ONLY with valid JSON. No markdown. No backticks. Pure JSON.

{
  "score": <integer 0 to 10>,
  "passed": <true if score is 6 or above>,
  "verdict": "one punchy sentence verdict on the solution",
  "feedback": "3 to 4 sentences of specific, constructive feedback 
    referencing the actual solution content",
  "breakdown": {
    "problemUnderstanding": <0 to 3>,
    "solutionCorrectness": <0 to 4>,
    "codeQualityOrClarity": <0 to 3>
  },
  "strongAspects": [
    "something the developer did well 1",
    "something the developer did well 2"
  ],
  "improvements": [
    "specific improvement suggestion 1",
    "specific improvement suggestion 2"
  ],
  "levelAppropriate": true or false,
  "certificationRecommendation": "Recommended or Borderline or Not Recommended",
  "certificationNote": "one sentence on whether this performance 
    supports issuing a skill certificate"
}

Scoring guide:
0-3: No meaningful attempt or completely incorrect
4-5: Partial understanding, significant gaps
6-7: Solid solution, correct approach, minor issues
8-9: Strong solution, good reasoning, well explained
10: Exceptional - complete, insightful, beyond expectations"""

    user_message = f"""DEVELOPER PROFILE:
Name: {name}
Domain: {domain}
Experience Level: {level}
Top Skills: {top_skills}

CHALLENGE GIVEN:
Title: {challenge.get("title")}
Problem: {challenge.get("problemStatement")}
Requirements: {challenge.get("requirements")}
Difficulty: {challenge.get("difficulty")}

SOLUTION SUBMITTED:
{solution}

Evaluate this solution now."""

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=1000,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        result = response.choices[0].message.content if response.choices else ""
        return _clean_json(result)
    except Exception as error:
        raise HTTPException(status_code=500, detail="Evaluation failed. Please try again.") from error
