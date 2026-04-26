import json
import os
import traceback
import httpx

SYSTEM_PROMPT = """You are an expert technical recruiter and developer skill assessor working for Talent, a platform that verifies informal developer talent globally. Your job is to analyze a developer's resume and any linked content, then generate a structured assessment.

You must respond ONLY with a valid JSON object. No markdown. No explanation outside the JSON. No backticks. Pure JSON only.

The JSON must follow this exact structure:
{
  "name": "candidate full name or Unknown if not found",
  "domain": "primary technical domain e.g. Full-Stack Development, Machine Learning, DevOps, Mobile Development, Data Science, Systems Programming, Cybersecurity",
  "experienceLevel": "Beginner or Intermediate or Professional",
  "score": <integer from 1 to 10>,
  "scoreRationale": "2 sentences explaining exactly why this score was given",
  "strongPoints": [
    "specific strong point 1",
    "specific strong point 2",
    "specific strong point 3",
    "specific strong point 4",
    "specific strong point 5"
  ],
  "topSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "verifiedLinks": [
    {
      "url": "the url",
      "type": "GitHub or Portfolio or Certificate or Project or Other",
      "summary": "one sentence about what was found at this link",
      "verified": true or false
    }
  ],
  "certifications": ["certification1", "certification2", "certification3", "certification4", "certification5"],
  "redFlags": ["any concern or gap noticed, or empty array if none"],
  "summary": "3 sentence overall narrative about this developer that a recruiter would find useful"
}

Scoring guide:
1-3: Very early stage, minimal real skills demonstrated
4-5: Some skills shown but limited depth or missing verification
6-7: Solid developer with demonstrable skills and some verified work
8-9: Strong developer with verified projects, consistent history, clear domain depth
10: Exceptional - rare, only for candidates with outstanding verified work

Be honest and strict. A resume with no verified links should not score above 6 regardless of claims."""


def _parse_model_json(text: str) -> dict:
    cleaned = (text or "").strip()
    if not cleaned:
        raise json.JSONDecodeError("Empty model response", "", 0)

    # Handle code-fenced JSON responses gracefully.
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json\n", "", 1).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise
        return json.loads(cleaned[start : end + 1])


async def groq_analyzer(resume_text: str, linked_content_array: list[dict]) -> dict:
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is missing in server/.env")

    user_message = f"""Analyze the following developer resume.

RESUME TEXT:
{resume_text}

LINKED CONTENT FOUND AND FETCHED:
{json.dumps(linked_content_array, indent=2)}

Generate the full structured assessment now."""

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
            provider_error = ""
            try:
                provider_error = (response.json() or {}).get("error", {}).get("message", "")
            except Exception:
                provider_error = response.text[:500]
            if "invalid api key" in provider_error.lower():
                raise RuntimeError(
                    "Groq authentication failed. Please set a valid GROQ_API_KEY in server/.env."
                )
            if provider_error:
                raise RuntimeError(f"Groq API error: {provider_error}")
            raise RuntimeError("Analysis failed. Please try again.")

        data = response.json()
        text = ((data.get("choices") or [{}])[0].get("message") or {}).get("content", "")
        return _parse_model_json(text)
    except json.JSONDecodeError as error:
        raise RuntimeError("Analysis failed. Please try again.") from error
    except RuntimeError:
        raise
    except Exception as error:
        traceback.print_exc()
        raise RuntimeError(str(error) or "Analysis failed. Please try again.") from error
