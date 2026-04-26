# Talent Domain Challenge (Stage 3)

Stage 3 generates a personalized technical challenge and evaluates the submitted solution.

## Modules

- `server/main.py`: FastAPI app, CORS, Stage 3 router.
- `server/app/routes/challenge_router.py`: generate + evaluate endpoints.
- `server/app/services/challenge_generator.py`: builds challenge from Stage 1 + Stage 2 context.
- `server/app/services/solution_evaluator.py`: scores and explains solution quality.

## Endpoints

- `POST /api/stage3/generate`
- `POST /api/stage3/evaluate`
