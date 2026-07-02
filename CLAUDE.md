# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Required reading and workspace memory

**Read `AGENTS.md` first** — it is the primary agent guide. The `docs/` directory is this project's persistent memory and MUST be read before changes and updated after them:

- `docs/MEMORY.md` — current status + next steps (update after every work session)
- `docs/TASKS.md` — task checklist with priority ordering (check off completed work)
- `docs/ERRORS.md` — every bug gets a sequential ERR-NNN entry (read the Quick Reference Gotchas table before debugging; never reuse or delete IDs)
- `docs/DECISIONS.md` — architecture decision log (append when decisions change)
- `docs/DB_SCHEMA.md` — database schema reference

Note: `AGENTS.md` says `docs/` is gitignored, but git actually tracks it. Also its "MVP Scope: do not build mobile app" is stale — `apps/mobile` exists and is a first-class client.

## Commands

```bash
pnpm dev / build / typecheck        # turbo, all workspaces
pnpm --filter api|web|mobile <cmd>  # single workspace
pnpm docker:up / docker:down        # full stack (postgres + api + web)
bash scripts/smoke-test.sh          # integration test: sign-up → 401 check → paste → ready → chat → sources
```

- There are no unit tests; `smoke-test.sh` against a running stack (`docker compose up -d postgres api`) is the verification tool, plus `pnpm typecheck` and `pnpm build`.
- Mobile "build" is `expo export` (bundle check only); dev flow is `npx expo start --android` in `apps/mobile`.
- **Schema changes**: SQL init scripts in `infra/postgres/init/` only run on a fresh volume. Apply with `docker compose down -v && docker compose up --build` (destroys local data — this is the accepted workflow).
- URLs: web http://localhost:5173, API http://localhost:4000 (`/health`, `/config`).

## Architecture

pnpm + Turborepo monorepo. Three clients of one Fastify API; all data in one local Postgres (pgvector/pgvector:pg16 container) via the `pg` package — no ORM, no Supabase. AI = Gemini REST (generation + embeddings), key in `apps/api/.env`.

### Backend (`apps/api/src`) — domain modules

- `modules/documents` — upload (multipart PDF → pdf-parse v2 class API via createRequire) and paste routes; both insert a `pending` document, stash extracted text in an in-memory store, and kick off ingestion with `setImmediate`, returning immediately. Clients poll `GET /documents/:id/status`.
- `modules/ingestion` — `pipeline.ts` drives pending → processing → ready/failed: `chunker.ts` (~500 tokens, 15% overlap, Cyrillic-aware token estimates) → `embedder.ts` (Gemini `gemini-embedding-001`, 768 dims — must match `VECTOR(768)` in schema) → `vector-store.ts` (batch insert in a transaction).
- `modules/retrieval` — `retrieval.service.ts` calls the `match_chunks` SQL function (cosine similarity, HNSW index), then optional MMR rerank (top-20 → best 5, Jaccard diversity). Current `threshold=0.1`, `lambda=0.5` are a deliberate interim fix for cross-lingual retrieval (ERR-021) — do not "restore" them to 0.7 without implementing query translation first (see DECISIONS.md).
- `modules/chat` — `/chat` route: validate (Zod) → verify all documentIds are `ready` and owned by the user → embed question → retrieve → `generator.ts` (Gemini with fallback chain `gemini-2.5-flash → gemini-2.5-flash-lite`; free-tier only, don't add paid models) → persist both messages with sources JSONB. Response shape is `{ conversationId, reply, sources }`.
- `modules/conversations` — history endpoints backed by `conversation-store.ts`.
- `shared/` — `db/db.ts` (single pg Pool), `auth.ts` + `session.ts` (see below). System routes `/health`, `/config` live in `routes/` and are the only public endpoints besides `/api/auth/*`.

### Auth (Better Auth, runs in-process)

- `shared/auth.ts` configures Better Auth on the shared pg Pool; `index.ts` bridges Fastify → its Fetch-API handler at `/api/auth/*`. Tables (`"user"`, `"session"`, `"account"`, `"verification"`) are in `infra/postgres/init/002_auth.sql` with **quoted camelCase columns**; ids are UUIDs via `advanced.database.generateId` so they match the `user_id UUID` columns on app tables.
- Every protected route starts with `const user = await requireUser(req, reply); if (!user) return;` and every DB query filters by that `user.id`. Never let one user's query see another's rows.
- Web sends the session cookie with `credentials: "include"`; mobile stores it in SecureStore (`@better-auth/expo`) and `lib/api.ts` attaches it via `authClient.getCookie()`. `@better-auth/expo` lazily imports `expo-network`/`expo-web-browser` — removing them breaks `expo export` with a cryptic chunk assertion (ERR-025).

### Frontend contract gotchas (source of past bugs)

- Web (`apps/web/src/lib/api.ts`) is the canonical API client; mobile (`apps/mobile/lib/api.ts`) mirrors it but maps responses into mobile types (e.g. backend source `{chunkId, documentId, content, similarity}` → UI `{documentTitle, preview}` via `mapSources` in `workspace.tsx`). Keep the two in sync — response-shape drift caused ERR-013 and ERR-024. `packages/api-client` is a placeholder for eventually sharing this.
- Documents are only selectable/chat-able when `status === "ready"`; both clients poll status every 3s and auto-select on ready. `/chat` 400s if any selected doc isn't ready.
- API base URLs are dynamic for LAN/phone testing: web falls back to `window.location.hostname:4000`, mobile uses `EXPO_PUBLIC_API_URL` (`apps/mobile/.env`, `10.0.2.2:4000` for Android emulator). Never hardcode `localhost:4000` in frontend code (ERR-016/017).
- All user-facing UI copy is **Mongolian** (Cyrillic); keep new UI text consistent. Web is React+Vite+Tailwind with a glassmorphism token system in `src/index.css`; mobile is Expo Router + NativeWind.

### Environment

- Secrets (`DATABASE_URL`, `GEMINI_API_KEY`, `BETTER_AUTH_SECRET`) live in `apps/api/.env` and docker-compose env — never in frontend code. Frontend runtime config comes from `GET /config`, not env vars.
- Project is ESM TypeScript throughout; CommonJS-only packages need the `createRequire` pattern (see `pdf-extractor.ts`).
