import asyncio
import httpx


async def fetch_one(client: httpx.AsyncClient, url: str):
    try:
        response = await client.get(f"https://r.jina.ai/{url}")
        if response.status_code != 200:
            return None
        return {
            "url": url,
            "content": response.text[:1500],
        }
    except Exception:
        return None


async def fetch_links(urls: list[str]) -> list[dict]:
    if not urls:
        return []

    timeout = httpx.Timeout(8.0)
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
        tasks = [fetch_one(client, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=False)
    return [result for result in results if result]
