# MEMORY.md

## Purpose

This file helps AI agents continue from the last stopping point.
Update it after important progress.

## Current Project

Document RAG Chatbot MVP

## Selected Stack

- React + Vite frontend
- Fastify backend
- Local Postgres (pgvector/pgvector:pg16) via Docker Compose — **no Supabase**
- `pg` npm package for DB connection (DATABASE_URL)
- Gemini generation and embeddings
- pnpm workspace
- Turborepo

## Current Status

Infrastructure, config layer, dual ingestion paths, the complete Day 4 Retrieval & Chat backend features, and the module-based backend refactor are all fully functional.

Completed so far:

- Day 1 complete: monorepo running, schema applied, DB connected, `/health`, `/config` working.
- Day 2 complete: `/documents/upload`, `/documents/paste`, `/documents` (GET) working.
- Day 3 complete: Background embedding pipeline implemented. `POST /documents/upload` and `POST /documents/paste` now insert as `pending`, launch the processing pipeline asynchronously, and return immediate response. `/documents/:id/status` monitors processing state.
- Day 4 complete: Migrated `match_chunks` DB function to support `UUID[]`. Created retrieval with pgvector matching and MMR reranking. Created generator with model fallbacks (`gemini-3.5-flash` -> `gemini-2.0-flash` -> `gemma-4-31b-it`). Implemented `/chat`, `/conversations`, and `/conversations/:id/messages` endpoints with full query scoping by `user_id`.
- Refactor complete: Reorganized `apps/api/src/` from flat `lib/` + `routes/` to feature-module structure (`modules/documents`, `modules/ingestion`, `modules/retrieval`, `modules/chat`, `modules/conversations`, `shared/`). Health and config routes remain in `routes/`. Smoke test script added at `scripts/smoke-test.sh`. Placeholder `packages/api-client` added for future web/mobile shared code.

## Current Local URLs

Frontend:    http://localhost:5173
Backend:     http://localhost:4000 (unless overridden by API_PORT in .env)
Health:      http://localhost:4000/health
Config:      http://localhost:4000/config
Status:      http://localhost:4000/documents/:id/status
Chat:        http://localhost:4000/chat
Conversations: http://localhost:4000/conversations

## Current Next Step

Build the frontend UI features (Day 5):

1. Connect the frontend to the backend `/documents` and `/config` endpoints.
2. Implement PDF upload and text paste UI.
3. Build the chat interface, supporting conversation selection and creating new conversations.
4. Render grounding source snippets correctly for assistant replies.


## Demo User ID (MVP)

Until auth is added, use this fixed UUID as `user_id` in all queries:

```
00000000-0000-0000-0000-000000000001
```

## Important Constraints

- Keep MVP simple.
- Do not add OCR yet.
- Do not add payments yet.
- Do not expose DATABASE_URL or GEMINI_API_KEY to frontend — ever.
- Do not query documents across users.
- Always store messages so users can continue previous chats.
- Every DB query must include a `user_id` filter.
- Frontend config (limits, flags) comes from `GET /config`, not from `.env` files.
