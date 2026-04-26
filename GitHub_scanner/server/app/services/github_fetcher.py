from datetime import datetime, timedelta, timezone
import os
import httpx
from fastapi import HTTPException


def _headers() -> dict:
    headers = {"Accept": "application/vnd.github.v3+json"}
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    if token:
        headers["Authorization"] = f"token {token}"
    return headers


def _account_age_years(created_at: str) -> float:
    created = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    return round(max((now - created).days / 365.25, 0), 1)


def _activity_level(recent_commit_count: int) -> str:
    if recent_commit_count > 20:
        return "Active"
    if recent_commit_count >= 5:
        return "Moderate"
    return "Inactive"


async def fetch_github_data(username: str) -> dict:
    clean_username = (username or "").strip()
    if not clean_username:
        raise HTTPException(status_code=400, detail="GitHub username is required.")

    headers = _headers()
    base = "https://api.github.com"
    timeout = httpx.Timeout(15.0)

    async with httpx.AsyncClient(headers=headers, timeout=timeout) as client:
        user_response = await client.get(f"{base}/users/{clean_username}")
        if user_response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail="GitHub user not found. Check the username and try again.",
            )
        if user_response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="GitHub rate limit reached. Add a GITHUB_TOKEN to your .env to increase limits.",
            )
        user_response.raise_for_status()
        user = user_response.json()

        repos_response = await client.get(
            f"{base}/users/{clean_username}/repos?per_page=50&sort=updated"
        )
        if repos_response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="GitHub rate limit reached. Add a GITHUB_TOKEN to your .env to increase limits.",
            )
        repos_response.raise_for_status()
        repos = repos_response.json()

        non_forked = [repo for repo in repos if not repo.get("fork", False)]
        repos_by_stars = sorted(
            non_forked,
            key=lambda repo: int(repo.get("stargazers_count") or 0),
            reverse=True,
        )
        top_repos = repos_by_stars[:8]

        language_totals = {}
        for repo in repos_by_stars[:5]:
            repo_name = repo.get("name")
            if not repo_name:
                continue
            language_response = await client.get(
                f"{base}/repos/{clean_username}/{repo_name}/languages"
            )
            if language_response.status_code != 200:
                continue
            for language, byte_count in language_response.json().items():
                language_totals[language] = language_totals.get(language, 0) + int(byte_count)

        language_breakdown = {}
        total_bytes = sum(language_totals.values())
        if total_bytes > 0:
            for language, byte_count in sorted(
                language_totals.items(), key=lambda item: item[1], reverse=True
            )[:8]:
                language_breakdown[language] = round((byte_count / total_bytes) * 100, 1)

        events_response = await client.get(
            f"{base}/users/{clean_username}/events/public?per_page=30"
        )
        if events_response.status_code == 403:
            raise HTTPException(
                status_code=403,
                detail="GitHub rate limit reached. Add a GITHUB_TOKEN to your .env to increase limits.",
            )
        events_response.raise_for_status()
        events = events_response.json()

        cutoff = datetime.now(timezone.utc) - timedelta(days=90)
        recent_commit_count = 0
        for event in events:
            if event.get("type") != "PushEvent":
                continue
            created_at = event.get("created_at")
            if not created_at:
                continue
            event_time = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            if event_time >= cutoff:
                recent_commit_count += 1

    return {
        "username": clean_username,
        "name": user.get("name") or clean_username,
        "bio": user.get("bio") or "",
        "location": user.get("location") or "",
        "avatar_url": user.get("avatar_url") or "",
        "public_repos": int(user.get("public_repos") or 0),
        "followers": int(user.get("followers") or 0),
        "account_age_years": _account_age_years(user.get("created_at") or datetime.now(timezone.utc).isoformat()),
        "top_repos": [
            {
                "name": repo.get("name") or "",
                "description": repo.get("description") or "",
                "language": repo.get("language") or "Unknown",
                "stars": int(repo.get("stargazers_count") or 0),
                "forks": int(repo.get("forks_count") or 0),
                "topics": repo.get("topics") or [],
                "url": repo.get("html_url") or "",
            }
            for repo in top_repos
        ],
        "language_breakdown": language_breakdown,
        "top_languages": list(language_breakdown.keys()),
        "recent_commit_count": recent_commit_count,
        "activity_level": _activity_level(recent_commit_count),
    }
