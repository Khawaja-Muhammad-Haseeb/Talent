import os
from groq import Groq


async def generate_certificate_summary(stage1, stage2, stage3, final_score, level):
    name = stage2.get("name") or stage1.get("name") or "Developer"
    domain = stage2.get("domain") or stage1.get("domain") or "Software Development"
    top_skills = stage1.get("topSkills", [])
    top_languages = stage2.get("topLanguages", [])
    notable_projects = [p.get("name") for p in stage2.get("notableProjects", [])[:3]]
    challenge_title = stage3.get("challenge", {}).get("title", "Domain Challenge")
    challenge_score = stage3.get("evaluation", {}).get("score", 0)
    resume_summary = stage1.get("summary", "")

    system_prompt = """You are writing a professional credential summary for a developer 
skill certificate. Write exactly 2 sentences in third person.
Sentence 1: who they are and what they specialise in.
Sentence 2: what was verified and how strong the evidence was.
Be specific - mention actual skills, languages, and domain.
Do not be generic. Do not use filler phrases.
Respond with only the 2 sentences. No JSON. No formatting. 
Just the plain text paragraph."""

    user_message = f"""Name: {name}
Domain: {domain}
Level: {level}
Final Score: {final_score}/10
Top Skills: {top_skills}
Top Languages: {top_languages}
Notable Projects: {notable_projects}
Challenge Completed: {challenge_title}
Challenge Score: {challenge_score}/10
Resume Summary: {resume_summary}"""

    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        return (
            f"{name} is a verified {level} {domain} developer assessed through "
            "resume analysis, GitHub verification, and a live domain challenge."
        )

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            max_tokens=200,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        text = response.choices[0].message.content if response.choices else ""
        cleaned = (text or "").strip()
        if cleaned:
            return cleaned
    except Exception:
        pass

    return (
        f"{name} is a verified {level} {domain} developer assessed through "
        "resume analysis, GitHub verification, and a live domain challenge."
    )
