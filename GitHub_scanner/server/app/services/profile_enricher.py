import json
import os
import httpx
from fastapi import HTTPException

SYSTEM_PROMPT = """You are an expert technical assessor for Talent, a platform that verifies 
informal developer talent globally. You are running Stage 2 of a multi-stage 
assessment pipeline.

You already have a Stage 1 analysis from the developer's resume. You now have 
additional data from their GitHub profile and/or portfolio website. Your job is 
to enrich and update the developer profile with this new evidence.

Be evidence-based. GitHub data is harder to fake than a resume. If GitHub 
activity contradicts resume claims, trust GitHub more. If GitHub strongly 
confirms resume claims, increase the score. If GitHub shows active commits, 
real projects, and language consistency with the resume, this is a strong signal.

Respond ONLY with valid JSON. No markdown. No backticks. No explanation. Pure JSON.

{
  "name": "developer name",
  "domain": "updated primary domain based on all evidence",
  "experienceLevel": "Beginner or Intermediate or Professional",
  "resumeScore": <stage 1 score keep as received>,
  "githubScore": <integer 1-10 based on GitHub/portfolio evidence alone>,
  "combinedScore": <integer 1-10 weighted: resume 35% + github 65%>,
  "scoreChange": "Increased by X or Decreased by X or No change",
  "scoreChangeReason": "one sentence explaining why score changed or stayed same",
  "updatedStrongPoints": [
    "strong point verified by both resume and GitHub",
    "strong point 2",
    "strong point 3",
    "strong point 4",
    "strong point 5"
  ],
  "newDiscoveries": [
    "something found in GitHub/portfolio not mentioned in resume"
  ],
  "topLanguages": ["lang1", "lang2", "lang3"],
  "activityInsight": "one sentence about coding activity and consistency",
  "notableProjects": [
    {
      "name": "repo or project name",
      "description": "what it does and why it is notable",
      "url": "link if available"
    }
  ],
  "profileConsistency": "High or Medium or Low",
  "consistencyNote": "one sentence on whether resume claims match GitHub reality",
  "updatedSummary": "3 sentence narrative combining resume and GitHub evidence",
  "readyForChallenge": true,
  "recommendedChallengeDomain": "specific domain for Stage 3 e.g. Machine Learning, React Frontend, REST API Design, DevOps Pipelines"
}

Scoring guide for githubScore:
1-3: No real projects, empty or nearly empty profile
4-5: Mostly tutorials, forks, or repos with no descriptions
6-7: Real projects with descriptions, consistent commits, clear domain focus
8-9: Strong portfolio, active contributions, repos with stars or forks
10: Exceptional — open source impact, high followers, impactful projects"""


def _parse_json(text: str) -> dict:
    cleaned = (text or "").strip().replace("```json", "").replace("```", "").strip()
    return json.loads(cleaned)


async def enrich_profile(stage1_context: dict, github_data: dict | None, portfolio_data: dict | None):
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing.")

    user_message = f"""STAGE 1 RESUME ANALYSIS CONTEXT:
{json.dumps(stage1_context, indent=2)}

GITHUB DATA:
{json.dumps(github_data, indent=2)}

PORTFOLIO DATA:
{json.dumps(portfolio_data, indent=2)}

Generate the enriched developer profile now."""

    payload = {
        "model": "llama-3.3-70b-versatile",
        "temperature": 0.2,
        "max_tokens": 1800,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0)) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json=payload,
            )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Profile enrichment failed. Please try again.")
        data = response.json()
        text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content", "")
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="Profile enrichment failed. Please try again."
        ) from error

    try:
        return _parse_json(text)
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="Profile enrichment failed. Please try again."
        ) from error
