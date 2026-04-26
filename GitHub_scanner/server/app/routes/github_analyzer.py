from pydantic import BaseModel
from fastapi import APIRouter

from app.services.github_fetcher import fetch_github_data
from app.services.portfolio_fetcher import fetch_portfolio_data
from app.services.profile_enricher import enrich_profile

router = APIRouter()


class GitHubScanRequest(BaseModel):
    username: str
    stage1_context: dict


class PortfolioScanRequest(BaseModel):
    url: str
    stage1_context: dict


@router.post("/github")
async def analyze_github(request: GitHubScanRequest):
    github_data = await fetch_github_data(request.username)
    enriched_profile = await enrich_profile(
        stage1_context=request.stage1_context, github_data=github_data, portfolio_data=None
    )
    return {"enrichedProfile": enriched_profile, "githubData": github_data}


@router.post("/portfolio")
async def analyze_portfolio(request: PortfolioScanRequest):
    portfolio_data = await fetch_portfolio_data(request.url)
    enriched_profile = await enrich_profile(
        stage1_context=request.stage1_context, github_data=None, portfolio_data=portfolio_data
    )
    return {"enrichedProfile": enriched_profile, "portfolioData": portfolio_data}
