# Setup Guide

## 1) Global Environment

Create one shared file at `Talent/.env`:

```env
GROQ_API_KEY=your_groq_key_here
GITHUB_TOKEN=optional_token_here
```

## 2) Stage 2 Backend

```bash
cd GitHub_scanner/server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## 3) Shared Frontend

Use the existing frontend in `Resume_Analyzer/client` on `http://localhost:3000`.
