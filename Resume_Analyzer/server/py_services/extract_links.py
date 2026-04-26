import re
from urllib.parse import urlparse

BLOCKED_DOMAINS = ("gmail.com", "outlook.com", "yahoo.com")
URL_PATTERN = re.compile(r"https?://[^\s<>\"']+", re.IGNORECASE)


def normalize_url(url: str) -> str:
    return re.sub(r"[),.;!?]+$", "", url)


def extract_links(text: str) -> list[str]:
    matches = URL_PATTERN.findall(text or "")
    unique_urls = []
    seen = set()

    for raw_url in matches:
        cleaned_url = normalize_url(raw_url)
        if cleaned_url in seen:
            continue

        try:
            hostname = (urlparse(cleaned_url).hostname or "").replace("www.", "").lower()
        except Exception:
            hostname = ""

        if not hostname:
            continue
        if any(domain in hostname for domain in BLOCKED_DOMAINS):
            continue

        seen.add(cleaned_url)
        unique_urls.append(cleaned_url)
        if len(unique_urls) >= 8:
            break

    return unique_urls
