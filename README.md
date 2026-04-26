# Talent — Developer Skill Verification Platform

Talent is a multi-stage developer assessment platform that verifies real-world skills progressively, not through a single resume snapshot.

It combines:
- resume parsing and evidence extraction,
- GitHub/portfolio verification,
- a domain-specific coding/design challenge,
- and final certificate issuance with public verification.

---

## What This Project Does

Talent evaluates a developer in stages and carries context forward through a shared frontend state pipeline:

1. **Stage 1 — Resume Analyzer**
   - Upload PDF/DOCX resume.
   - Extract text + links.
   - Fetch linked content through Jina Reader.
   - Generate structured profile + score via Groq.

2. **Stage 2 — GitHub & Portfolio Scanner**
   - Scan public GitHub profile or portfolio URL.
   - Build evidence-based profile enrichment.
   - Compare online proof vs resume claims.
   - Recompute confidence and direction for challenge domain.

3. **Stage 3 — Domain Challenge**
   - Generate a personalized challenge from prior context.
   - Accept solution (code, pseudocode, or explanation).
   - Evaluate performance with calibrated scoring and feedback.

4. **Stage 5 — Certificate & Verification**
   - Compute weighted final score from Stages 1/2/3.
   - Decide certificate eligibility and level.
   - Generate credential + summary.
   - Upload credential JSON to IPFS (Pinata).
   - Public verification by credential ID.

> Stage 4 (Interview) is intentionally skipped in current implementation.

---

## How It Works (High-Level Architecture)

### Frontend
- **Single shared React app**: `Resume_Analyzer/client`
- Uses routing to move stage-to-stage.
- Uses global context (`DeveloperContext`) to persist pipeline state:
  - `stage1`, `stage2`, `stage3`, `stage4`, `stage5`

### Backends (separate services)
- `Resume_Analyzer/server` → Stage 1 API
- `GitHub_scanner/server` → Stage 2 API
- `Challenge/server` → Stage 3 API
- `Certificate/server` → Stage 5 API

This modular approach keeps each stage isolated, easier to debug, and independently deployable.

---

## Stage-by-Stage Technical Flow

## Stage 1: Resume Analyzer

### Input
- Resume file (PDF or DOCX)

### Process
- Parse text from file.
- Extract URLs from resume content.
- Fetch URL contents via `https://r.jina.ai/{url}`.
- Send combined evidence to Groq for structured assessment.

### Output
- Candidate profile + score + rationale + strengths + skills + verified links.
- `nextStageContext` used by Stage 2.

---

## Stage 2: GitHub/Portfolio Scanner

### Input
- Stage 1 context from React global state.
- GitHub username **or** portfolio URL.

### Process
- For GitHub:
  - Fetch user profile, repos, languages, and recent activity.
- For Portfolio:
  - Scrape via Jina reader, follow key links.
- Merge new evidence with Stage 1 profile.
- Run Groq enrichment to produce updated profile.

### Output
- `enrichedProfile` + source data (`githubData` or `portfolioData`)
- Stored in `developerProfile.stage2`

---

## Stage 3: Domain Challenge

### Input
- Stage 1 + Stage 2 context

### Process
- Generate personalized challenge based on:
  - domain,
  - experience level,
  - proven skills/languages.
- User submits solution.
- Evaluate with strict scoring rubric via Groq.

### Output
- Challenge object + evaluation report
- Stored in `developerProfile.stage3`

---

## Stage 5: Certificate & Verification

### Input
- Stage 1 + Stage 2 + Stage 3 context

### Score Calculation
- Resume score × 0.20
- GitHub combined score × 0.30
- Challenge score × 0.50
- Final score rounded to 1 decimal

### Eligibility
- Must map to certificate level (Beginner/Intermediate/Professional)
- Additional rule: if challenge recommendation is `Not Recommended` and final score < 6.0, certificate is denied

### Process
- Generate credential metadata (ID, dates, issuer, standard).
- Generate 2-sentence recruiter summary via Groq.
- Upload credential JSON to IPFS via Pinata.
- Save issued credential in memory for demo verification.

### Output
- Issued credential object + IPFS URLs + public verification route.

---

## Public Verification

Public route:
- `/verify/:credentialId`

Backend verification endpoint:
- `GET /api/stage5/verify/{credential_id}`

IPFS proof endpoint:
- `GET /api/stage5/ipfs/{ipfs_hash}`

This allows recruiter-style verification without requiring internal system access.

---

## Key Design Decisions

- **Shared frontend + separate stage backends** for clean modularity.
- **Context-driven pipeline memory** avoids copy/paste between stages.
- **Evidence-first scoring** prioritizes verifiable work over claims.
- **Graceful degradation**:
  - if IPFS upload fails, local demo credential still works;
  - if summary AI fails, fallback summary is used.
- **Print/download-ready certificate** generated as PDF from backend.

---

## Running the Project

Run each backend in separate terminals:

- Stage 1: port `5000`
- Stage 2: port `8001`
- Stage 3: port `8002`
- Stage 5: port `8003`
- Frontend: `3000`

Module-level setup docs:
- `Resume_Analyzer/SETUP.md`
- `GitHub_scanner/SETUP.md`
- `Challenge/SETUP.md`
- `Certificate/SETUP.md`

---

## Current Limitations

1. **Stage 4 Interview is not implemented**
   - Flow currently jumps from Stage 3 to Stage 5.

2. **Verification storage is in-memory (demo mode)**
   - Issued credentials reset on backend restart.
   - Production should index credentials in durable DB and/or IPFS indexer.

3. **IPFS upload depends on Pinata token scope and service status**
   - Misconfigured JWT can block decentralized publish step.

4. **No auth/user accounts yet**
   - The current flow is session-level, not identity-bound.

5. **No anti-abuse/rate limiting**
   - Public endpoints should be protected in production.

6. **No background jobs/queue**
   - Long AI operations are handled inline, which can affect UX under load.

---

## Future Improvements

1. **Implement Stage 4 Interview Module**
   - Structured behavioral + technical interview scoring.
   - Add cross-stage confidence blending before certificate issuance.

2. **Production-grade verification architecture**
   - Durable credential store + signed records.
   - Resolve verification directly from IPFS/CIDs + signature checks.

3. **Authentication and candidate dashboard**
   - Historical attempts, progress tracking, and certificate history.

4. **Richer evaluator signals**
   - Static code checks, test-case execution sandboxes, and plagiarism checks.

5. **Observability**
   - Trace IDs, centralized logs, latency/error dashboards.

6. **Security hardening**
   - Secret management, stricter CORS, request validation, and API rate limits.

---

## Demo Summary (Current Best Flow)

1. Upload resume → get Stage 1 score/profile.
2. Scan GitHub/portfolio → get Stage 2 enriched profile.
3. Complete challenge → get Stage 3 evaluation.
4. Issue certificate → copy credential ID.
5. Verify publicly at `/verify/{credentialId}`.

This demonstrates a complete evidence-backed skill verification lifecycle.
