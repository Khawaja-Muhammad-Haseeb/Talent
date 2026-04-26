# Talent GitHub Scanner (Stage 2)

Stage 2 enriches the Stage 1 resume profile using GitHub or portfolio evidence.

## Modules

- `server/main.py`: FastAPI entrypoint, CORS, Stage 2 router.
- `app/routes/github_analyzer.py`: Stage 2 endpoints.
- `app/services/github_fetcher.py`: GitHub API aggregation.
- `app/services/portfolio_fetcher.py`: portfolio scraping via Jina reader.
- `app/services/profile_enricher.py`: Groq profile enrichment.

## Endpoints

- `POST /api/stage2/github`
- `POST /api/stage2/portfolio`
