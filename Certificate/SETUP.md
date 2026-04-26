# Setup Guide

## 1) Environment

Use either:
- shared `Talent/.env` (recommended), or
- local `Certificate/server/.env`

Required values:

```env
GROQ_API_KEY=your_groq_key_here
PINATA_JWT=your_pinata_jwt_here
```

## 2) Run Stage 5 Backend

```bash
cd Certificate/server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8003
```

## 3) Shared Frontend

Run existing frontend in `Resume_Analyzer/client` and open:
- `/certificate` for issuance
- `/verify/{credentialId}` for public verification
