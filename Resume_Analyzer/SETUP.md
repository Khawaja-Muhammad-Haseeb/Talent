# Setup Guide

## 1) Backend (FastAPI)

```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env`:

```env
GROQ_API_KEY=your_groq_key_here
```

Run backend:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

## 2) Frontend (React)

```bash
cd client
npm install
npm start
```

Frontend runs on `http://localhost:3000` and uses proxy to backend on `http://localhost:5000`.
