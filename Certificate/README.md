# Talent Certificate System (Stage 5)

Stage 5 calculates the final weighted score, issues a credential, stores it on IPFS, and supports public verification.

## Modules

- `server/main.py`: FastAPI entrypoint and Stage 5 router.
- `app/routes/certificate_router.py`: generate, verify, and IPFS fetch endpoints.
- `app/services/score_calculator.py`: weighted score + eligibility logic.
- `app/services/credential_generator.py`: credential ID + issuance metadata.
- `app/services/summary_generator.py`: Groq-generated 2-sentence certificate summary.
- `app/services/ipfs_uploader.py`: Pinata upload for decentralized storage.

## Endpoints

- `POST /api/stage5/generate`
- `GET /api/stage5/verify/{credential_id}`
- `GET /api/stage5/ipfs/{ipfs_hash}`
