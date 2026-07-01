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
- [x] Fix swapped component files in `apps/mobile/components/` (`DocumentPicker.tsx` ↔ `MessageBubble.tsx`) — ERR-020

---

## Retrieval & Generation Fixes ✅

- [x] Diagnose cross-lingual retrieval failure (Latin query vs Cyrillic Mongolian chunks → ~0.35 cosine, below old 0.7 threshold)
- [x] Lower `threshold` from `0.7` to `0.1` (interim) in `retrieval.service.ts`
- [x] Lower `lambda` from `0.7` to `0.5` (interim) in `retrieval.service.ts`
- [x] Rewrite `generator.ts` SYSTEM_INSTRUCTION: always respond in source document's language/script regardless of query language
- [x] Add `useMMR: boolean = true` parameter to `retrieveChunks()`
- [x] When `useMMR=false`: return top-k by raw similarity (no MMR rerank)
- [x] Add `useMMR` to `/chat` Zod schema and pass through to retrieval
- [x] Fix model fallback chain: remove `gemini-3.5-flash` (paid-tier only), new chain `gemini-2.5-flash → gemini-2.5-flash-lite`
- [x] Create `docs/diagrams/sequence.md` — Mermaid chat workflow sequence diagram
- [x] Establish diagram convention: `.md` files with embedded ```mermaid blocks, not `.mmd`

---
## Phase 2: Mobile Client (Expo) ✅

- [x] Connect mobile client to live API (`EXPO_PUBLIC_API_URL`, LAN-compatible)
- [x] Implement Mobile Home screen (onboarding, greeting) and transition animations
- [x] Implement Mobile Workspace screen layout (chat area + composer + modal picker)
- [x] Implement Document upload / paste interaction in mobile composer (reused DocumentPicker modal)
- [x] Implement Persistent Chat messages with grounded sources presentation (via MessageBubble)

---

## Phase 3: Retrieval Quality

### 🔴 Priority 1 — Query Expansion / Language-Aware Retrieval
> Architecture decided. Interim fix active (`threshold=0.1`, `lambda=0.5`). Not yet built.

- [ ] Add `detected_language` column to `documents` table (new DB migration)
- [ ] Add language detection step to `apps/api/src/modules/ingestion/pipeline.ts`
- [ ] Add `translateQuery()` helper — `retrieval.service.ts` or new `query-expansion.ts`
- [ ] Pass `detected_language` from `chat.routes.ts` through to retrieval layer
- [ ] Restore `threshold → 0.6–0.7` and `lambda → 0.7` once query expansion is stable

### 🟡 Priority 2 — MMR Toggle UI
> Backend fully done. Frontend toggle only remaining.

- [ ] Add toggle button in `apps/web/src/components/workspace/Composer.tsx`
- [ ] User-facing label: `"Олон талт хариу"` — avoid "MMR" jargon
- [ ] Wire to `useMMR: boolean` in chat API request body

### 🔵 Priority 3 — Threshold / Lambda UI Controls
> Deferred. Power-user feature, not MVP-critical.

- [ ] Expose `threshold` as advanced/debug query param
- [ ] Lambda slider in workspace UI

---

## Phase 4: Auth

### 🔴 Priority 1 — Better Auth Integration
> Better Auth chosen: framework-agnostic, Fastify + Expo adapters, stores in own PostgreSQL. Replaces hardcoded `DEMO_USER_ID`.

- [ ] Install `better-auth` in `apps/api`, configure Fastify plugin
- [ ] Add `users` and `sessions` tables (Better Auth migration)
- [ ] Implement email + password sign up / sign in endpoints
- [ ] Replace `DEMO_USER_ID` constant with `session.user.id` in all routes
  - `chat.routes.ts`
  - `documents.routes.ts`
  - `conversations.routes.ts`
- [ ] Add auth middleware to protect all non-public routes
- [ ] Install `better-auth/client` in `apps/web`, wire login/register pages
- [ ] Install `better-auth/expo` in `apps/mobile`, wire auth flow

---

## Phase 5: Mobile Polish

### 🟡 Priority 1 — UI Fixes
- [ ] Remove voice record button from mobile Composer
- [ ] Add document picker button to mobile Composer (mirror web workspace)

### 🔵 Priority 2 — Native App Build (EAS)
> Currently running via Expo Go. Goal: standalone APK installable without Expo Go.

- [ ] Configure EAS Build (`eas.json`, `eas build:configure`)
- [ ] Build Android APK via `eas build -p android --profile preview`
- [ ] Test install on physical device
- [ ] App Store / Google Play — post-MVP

---

## Phase 6: Infrastructure

### 🔴 Priority 1 — Docker Build Optimization
> Currently `pnpm install` runs from scratch on every build. Fix: layer cache.

- [ ] Reorder `Dockerfile` — copy `pnpm-lock.yaml` + `package.json` first, then `pnpm install`, then `COPY . .`
- [ ] Verify cache hit on second build (no code change → install layer skipped)

### 🟡 Priority 2 — CI/CD (GitHub Actions)
> Triggers on push to `main`. Backend deploy to Droplet, frontend auto-deploys via Vercel.

- [ ] Create `.github/workflows/deploy.yml`
  - `pnpm install` → `build` → `smoke-test.sh`
  - Docker image build → push to GHCR
  - SSH into Droplet → `docker compose pull` → `docker compose up -d`
  - `/health` check after deploy
- [ ] Set GitHub Secrets: `DROPLET_HOST`, `DROPLET_USER`, `DROPLET_SSH_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`
- [ ] Branch strategy: `main` (production) → `dev` (staging) → `feature/*` (PRs)

### 🔵 Priority 3 — Deployment
> GitHub Student Pack: DigitalOcean $200 credit + Namecheap free `.me` domain.

- [ ] Provision DigitalOcean Droplet (1GB RAM, $6/mo)
- [ ] Install Docker + Docker Compose on Droplet
- [ ] Configure Nginx reverse proxy + SSL via Let's Encrypt
- [ ] Set `DATABASE_URL` + `GEMINI_API_KEY` as Droplet environment variables
- [ ] Connect GitHub repo to Vercel (frontend auto-deploy on push)
- [ ] Set `VITE_API_URL=https://api.yourdomain.me` in Vercel env variables
- [ ] Point Namecheap domain → Droplet IP (A record), `api.` subdomain

---

## Docs & Diagrams

- [x] `docs/diagrams/sequence.md` — Chat workflow sequence diagram (Mermaid)
- [ ] `docs/diagrams/sequence.md` — Add ingestion pipeline sequence diagram
- [ ] `docs/diagrams/er.md` — Database ER diagram
- [ ] `docs/diagrams/use-case.md` — User flow use case diagram