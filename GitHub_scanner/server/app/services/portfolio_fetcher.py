import re
import httpx
from fastapi import HTTPException

URL_PATTERN = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)


def _clean(url: str) -> str:
    return re.sub(r"[),.;!?]+$", "", (url or "").strip())


async def fetch_portfolio_data(portfolio_url: str) -> dict:
    clean_url = _clean(portfolio_url)
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        raise HTTPException(
            status_code=400,
            detail="Could not fetch portfolio. Make sure the URL is public and accessible.",
        )

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(15.0), follow_redirects=True) as client:
            portfolio_response = await client.get(f"https://r.jina.ai/{clean_url}")
            if portfolio_response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail="Could not fetch portfolio. Make sure the URL is public and accessible.",
                )
            content = (portfolio_response.text or "")[:4000]

            links = []
            seen = set()
            for match in URL_PATTERN.findall(content):
                link = _clean(match)
                if link == clean_url or link in seen:
                    continue
                seen.add(link)
                links.append(link)
                if len(links) >= 4:
                    break

            found_links = []
            for link in links:
                try:
                    link_response = await client.get(f"https://r.jina.ai/{link}")
                    if link_response.status_code == 200:
                        found_links.append({"url": link, "content": (link_response.text or "")[:800]})
                except Exception:
                    continue

            return {"url": clean_url, "content": content, "found_links": found_links}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail="Could not fetch portfolio. Make sure the URL is public and accessible.",
        ) from error
