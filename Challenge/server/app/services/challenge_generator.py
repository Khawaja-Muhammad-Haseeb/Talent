import json
import os
from fastapi import HTTPException
from groq import Groq


def _clean_json(raw_text: str) -> dict:
    cleaned = (raw_text or "").strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        cleaned = cleaned[start : end + 1]
    return json.loads(cleaned)


async def generate_challenge(stage1_context: dict, stage2_context: dict) -> dict:
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="Challenge generation failed. Please try again.")

    domain = stage2_context.get("recommendedChallengeDomain") or stage2_context.get("domain") or "General Software Development"
    level = stage2_context.get("experienceLevel") or stage1_context.get("experienceLevel") or "Intermediate"
    top_languages = stage2_context.get("topLanguages", [])
    strong_points = stage2_context.get("updatedStrongPoints", [])
    name = stage2_context.get("name") or stage1_context.get("name") or "Developer"

    system_prompt = """You are a senior technical interviewer for Talent, a platform that verifies 
informal developer talent globally. Your job is to generate a single, 
focused, and fair technical challenge for a developer based on their 
specific domain, experience level, and known skills.

The challenge must be:
- Directly relevant to their domain - not generic
- Calibrated to their experience level
- Solvable in 20 to 40 minutes
- Concrete with a clear problem statement
- Accepting of solutions in any language or pseudocode

Challenge types by domain:
- Machine Learning / AI: model design, algorithm choice, data pipeline logic, 
  bias handling, evaluation metrics
- Full-Stack / Frontend / Backend: system design, API design, 
  component architecture, database schema, debugging scenario
- DevOps / Cloud: CI/CD pipeline design, containerization, 
  infrastructure as code, monitoring strategy
- Data Science: data cleaning approach, analysis methodology, 
  visualization choice, statistical reasoning
- Systems / OS: memory management, concurrency, process scheduling, 
  low-level design
- Cybersecurity: threat modeling, vulnerability identification, 
  secure design pattern
- Mobile: architecture pattern, state management, performance optimization

Level calibration:
- Beginner: foundational concept, one clear task, no tricks
- Intermediate: multi-step problem, requires design thinking
- Professional: open-ended, requires trade-off analysis, 
  no single right answer

Respond ONLY with valid JSON. No markdown. No backticks. Pure JSON.

{
  "challengeId": "unique 8 char alphanumeric string",
  "domain": "exact domain string from input",
  "difficulty": "Beginner or Intermediate or Professional",
  "type": "DSA or System Design or Implementation or Debugging or Architecture",
  "title": "short challenge title",
  "problemStatement": "full problem description written in plain English, 
    3 to 5 sentences, concrete and specific",
  "requirements": [
    "requirement 1 - what the solution must address",
    "requirement 2",
    "requirement 3"
  ],
  "exampleScenario": "a concrete real-world example that makes the 
    problem tangible, 1 to 2 sentences",
  "evaluationCriteria": [
    "what the evaluator will look for 1",
    "what the evaluator will look for 2",
    "what the evaluator will look for 3"
  ],
  "hints": [
    "optional hint 1 - reveal only if developer asks",
    "optional hint 2"
  ],
  "estimatedMinutes": 25,
  "languageNote": "Solutions accepted in any programming language, 
    pseudocode, or plain English explanation"
}"""

    user_message = f"""Generate a challenge for this developer:

Name: {name}
Domain: {domain}
Experience Level: {level}
Top Languages: {top_languages}
Strong Points: {strong_points}

Generate the challenge now."""

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
        parsed = _clean_json(result)
        parsed["domain"] = parsed.get("domain") or domain
        parsed["difficulty"] = parsed.get("difficulty") or level
        return parsed
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="Challenge generation failed. Please try again."
        ) from error
