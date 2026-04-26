# Talent Resume Analyzer (Stage 1)

Short web app to analyze a developer resume and return a structured skill report.

## Modules (How It Works)

- `client/` (React): upload resume, show loading steps, display score + report.
- `server/main.py` (FastAPI): exposes `POST /api/analyze`.
- `server/py_services/parse_resume.py`: extracts text from PDF/DOCX.
- `server/py_services/extract_links.py`: finds and filters URLs from resume text.
- `server/py_services/fetch_links.py`: fetches link content via `https://r.jina.ai/{url}`.
- `server/py_services/groq_analyzer.py`: sends resume + links to Groq and parses strict JSON output.

## API Response

`/api/analyze` returns the full report object plus `nextStageContext` for Stage 2 pipeline usage.
