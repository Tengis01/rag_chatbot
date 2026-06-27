# TASKS.md

## Current Phase

Build the RAG backend pipeline and real chat UI.

---

## Done ✅

- [x] Select stack
  - [x] React + Vite frontend
  - [x] Fastify backend
  - [x] Local Postgres + pgvector (Docker)
  - [x] Gemini (generation + embeddings)
  - [x] pnpm + Turborepo
- [x] Create all project docs (PROJECT_BRIEF, MEMORY, DECISIONS, ERRORS, DB_SCHEMA)
- [x] Docker Compose running (postgres, api, web)
- [x] Fix Vite Docker host binding (ERR-001)
- [x] Remove Supabase — use local Postgres with `pg` package
- [x] Write Postgres schema to `infra/postgres/init/001_schema.sql`
  - [x] pgvector extension
  - [x] documents table
  - [x] chunks table (VECTOR(768) for Gemini text-embedding-004)
  - [x] conversations table
  - [x] messages table
  - [x] conversation_documents table
  - [x] match_chunks function
  - [x] HNSW index on chunks.embedding
- [x] Create `apps/api/src/lib/db.ts` (Postgres Pool via DATABASE_URL)
- [x] Update `/health` to ping DB and return `db: "connected"`
- [x] Create `GET /config` endpoint (non-secret runtime config)
- [x] Create `ConfigProvider` + `useConfig()` hook in frontend
- [x] Wrap app in `ConfigProvider` in `main.tsx`
- [x] Replace Vite template `App.tsx` with component using `useConfig()`
- [x] Apply Schema & Verify DB (Run `docker compose down -v && docker compose up --build`)
- [x] Confirm GET /health returns `{ db: "connected" }`
- [x] Confirm GET /config returns expected JSON
- [x] Confirm frontend shows config values at http://localhost:5173
- [x] Organize route structure (health.ts, config.ts, documents.ts)
- [x] Create apps/api/src/lib/constants.ts
- [x] Create apps/api/src/lib/pdf-extractor.ts
- [x] Create apps/api/src/lib/document-store.ts (temporary)
- [x] Install `pdf-parse` in apps/api
- [x] POST /documents/upload
- [x] POST /documents/paste
- [x] GET /documents
- [x] Update /config with maxUploadSizeMb, supportedFileTypes, maxPasteLength

---

- [x] Create apps/api/src/lib/chunker.ts (~500 tokens, 15% overlap, Cyrillic/Mongolian awareness)
- [x] Add GEMINI_API_KEY to apps/api/.env (real key loaded)
- [x] Create apps/api/src/lib/embedder.ts (Gemini gemini-embedding-001 batch REST, outputDimensionality 768)
- [x] Create apps/api/src/lib/vector-store.ts (storeChunks, deleteChunks, matchChunks via pgvector)
- [x] Create apps/api/src/lib/pipeline.ts (processDocument background flow pending -> processing -> ready)
- [x] Consume and delete documentTextStore after chunking
- [x] Verify chunks + embeddings stored correctly in pgvector (7 chunks, 768 dimensions verified)
- [x] Create apps/api/src/lib/retrieval.ts (vector search via match_chunks)
- [x] Create POST /chat route (full RAG flow)
- [x] Store messages + sources in DB
- [x] Create GET /conversations route
- [x] Create GET /conversations/:id/messages route

---

- [x] Refactor backend to module-based structure
  - [x] Add smoke test script (`scripts/smoke-test.sh`)
  - [x] Move `lib/` files to `modules/` (documents, ingestion, retrieval, chat, conversations)
  - [x] Move shared files (db, constants) to `shared/`
  - [x] Keep `routes/health.ts` and `routes/config.ts` as system routes
  - [x] Update all import paths
  - [x] TypeScript build passes
  - [x] Docker rebuild passes
  - [x] Post-refactor smoke test passes
  - [x] Add `packages/api-client` placeholder for future shared code

---

## Next: Frontend Chat UI

- [x] Rebuild `apps/web` scaffold (Tailwind, Framer Motion, React Router, path aliases)
- [x] Landing page with hero, features, pipeline section
- [x] Workspace layout (sidebar + chat window)
- [x] Upload UI (PDF file picker)
- [x] Paste text UI (modal)
- [x] Document list panel with status polling
- [x] Conversation sidebar
- [x] Chat message display with expandable source snippets
- [x] Wire all API calls using `VITE_API_URL`
- [x] Decompose page into landing/workspace sub-components
- [x] Implement collapsible sidebar in WorkspacePage with CSS grid transitions
- [x] Change logo icon from Sparkles (Gemini-like) to FileText (PDF/Doc) in top bars and mobile mockups
- [x] Add unified Import Modal with PDF/Paste tabs, pre-upload file size and character measurement bars
- [x] Move upload and paste actions into chat composer `+` button, move "+ New Chat" to the top, and add document status popover dropdown to chat header
- [x] Clean up mock landing page navigation links and add scrolling jump anchors to actual introduction sections
- [x] Tighten mouse spotlight glow and completely disable the blur overlay inside the workspace page
- [x] Localize visible frontend UI copy to Mongolian and update the font stack for Cyrillic rendering
- [x] Enable LAN / mobile access: fix CORS to `origin: true`, replace all `localhost:4000` fallbacks with `window.location.hostname:4000` in `api.ts` and `ConfigContext.tsx`, bind postgres to `127.0.0.1`, remove stale `VITE_API_URL` from docker-compose (ERR-016, ERR-017), clean up redundant Hero button, implement a CSS scale-to-fit zoom wrapper for the `WorkspacePreview` component, and add a toggleable mobile slide-over sidebar drawer for the workspace page to monitor document ingestion/statuses.
- [ ] End-to-end smoke test with Docker Compose (upload → chat → sources → reload)
- [x] Scaffold `apps/mobile` with Expo + Expo Router + NativeWind and configure pnpm workspace
- [x] Merge `apps/mobile/.gitignore` into root `.gitignore`

---

## Phase 2: Mobile Client (Expo)

- [ ] Connect mobile client with live API base URL (LAN auto-discovery or manual entry)
- [ ] Implement Mobile Home screen and transition animations
- [ ] Implement Mobile Workspace screen layout (sidebar list + chat area)
- [ ] Implement Document upload / paste interaction in mobile composer
- [ ] Implement Persistent Chat messages with grounded sources presentation

---

## Upgrade ideas
- [ ] Update question language type. example user import cyrillic mongolian text pdf and ask latin mongolian or english the answers should be cyrillic mongolian no matter what.
- [ ] understanding threshold and lambda value
- [ ] toggle rerank button. MMR toggle button default active and untoggle then ask question default top k similarity works. if toggle active then ask question current top 
20 to find best 5 will work.

## Later (post-MVP)

- [ ] Add Supabase Auth (or JWT) for real user_id
- [ ] Replace demo UUID with real auth user_id in all queries
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render or Railway
- [ ] Switch DATABASE_URL to managed Postgres for production
- [ ] Set `VITE_API_BASE_URL` to the production API URL on Vercel (the `window.location.hostname` fallback only works for local dev)
