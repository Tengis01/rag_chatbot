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

## 🔥 Current Bugs — Priority Order updated 2026-07-02 (evening)

> New order: A (mobile boot loop) → B (large paste fails) → C (data persistence for prod) → then Priority 5 manual Azure deploy → Priority 4 CI/CD → Priority 6 EAS.

### Priority A — Mobile boot loop on physical phone (P0 — app unusable on real device) ✅

> **Symptom**: onboarding OK → press start → ~3 min loading animation → onboarding starts again. Login screen and workspace never appear.
> **Diagnosis**: `app/index.tsx` catch block routes to `/onboarding` on ANY error. On a physical phone, `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` is an **emulator-only address** — unreachable from a real phone — so `authClient.getSession()` hangs until the network timeout (minutes), throws, and the catch sends the user back to onboarding. Three compounding bugs: wrong error fallback route, no timeout on the session check, emulator-only API URL on a physical device.

- [x] `app/index.tsx`: when onboarding IS complete, failures route to `/login` — never back to `/onboarding`; onboarding finish goes through `/` so the session check decides
- [x] `authClient.getSession()` + probing wrapped in 5s `Promise.race` timeout
- [x] NEW `lib/api-base.ts`: liveness-probes ALL candidates in parallel (`EXPO_PUBLIC_API_URLS` home/office list + Metro `hostUri` LAN IP + `10.0.2.2` emulator + localhost) via `GET /health` with 2s timeout; first alive wins, cached, re-probed after network errors. `EXPO_PUBLIC_API_URL` = hard override for prod builds. Auth client rewrites request origin at call time via `customFetchImpl`.
- [x] `apps/mobile/.env`: `EXPO_PUBLIC_API_URLS=http://192.168.1.10:4000` (home; add office IP when known)
- [ ] Re-test on the physical phone: onboarding → login → register → workspace → upload → chat

### Priority B — Large paste (~50k chars) never finishes processing ✅

> **Symptom**: 50,000-character raw text via paste → document never reaches `ready`.
> **Likely area**: ~40–100 chunks hit Gemini embedding limits — batch size / request payload size / per-input 2048-token truncation / free-tier rate limits (RPM). Must reproduce with API logs before fixing. Failure is currently silent (`failed` status with no reason).

- [x] Reproduced: instant `429 RESOURCE_EXHAUSTED` on first oversized batch → ERR-027. Bonus find: 500k-char paste got Fastify `413` (Cyrillic = 2 bytes/char > 1MB default bodyLimit) → `bodyLimit: 4MB`
- [x] `embedder.ts` rewritten: token-budgeted batches (≤15 items / ~6k tokens via exported `estimateTokens`), 3s pacing, 30s timeout, exponential backoff + jitter on 429/5xx (8 attempts, honors `retryDelay`)
- [x] Failure reason stored (`documents.error_message`, migration 003) and shown in web + mobile document lists
- [x] Verified live: 50k → 50 chunks / 5 batches / ready in ~95s INCLUDING riding out five consecutive 429s; 500k paste accepted and processing through ~42 paced batches
- [x] Model research → DECISIONS.md: OpenAI API has NO free tier (misconception corrected); Gemini stays (best free tier); Groq = fallback candidate; Mistral rejected (data-training opt-in); OpenRouter `:free` unreliable
- [x] ERR-028 logged: Docker Desktop bind mount served STALE code after inode-replacing writes — `docker compose restart` + `docker exec grep` to verify

### Priority C — Data persistence across rebuilds (production must never lose data) ✅

> **Clarification**: plain `docker compose up --build` does NOT wipe Postgres — the `postgres_data` named volume survives builds. Data is lost on `docker compose down -v`, which is the documented LOCAL schema-apply workflow. Production needs incremental migrations instead of destroy-and-recreate.

- [x] `infra/postgres/migrations/` + runner (`apps/api/src/shared/db/migrate.ts`) applied at API startup, tracked in `schema_migrations`, per-file transactions; verified: applied once, idempotent across restarts
- [x] Convention: `infra/postgres/init/` frozen; all future schema changes = `NNN_*.sql` migrations (003+). First: `003_document_error_message.sql`
- [x] pgAdmin compose service (`--profile tools`, port 5050) with persistent `pgadmin_data` volume
- [x] DB_SCHEMA.md workflow rewritten (local down -v optional; prod = migrations only, NEVER down -v); DECISIONS.md entry added
- [ ] Nightly `pg_dump` backup cron on the VM (lands with the deploy task)

---

### Priority D — UI Polish (workspace + mobile feel "null" vs the landing page)
> Strategy: **don't design anything new — extend the existing design system everywhere.** `docs/design.md` + `apps/web/src/index.css` tokens ARE the spec; the landing page follows them (that's why it feels good), workspace/mobile drift from them. Never pick colors by hand: reuse tokens. Steal layouts from ChatGPT/Perplexity (design.md already cites them), colors from our own palette.

**D1 — Unify mobile palette with web tokens (highest impact, mechanical)**

- [ ] Mobile uses purple (`#7c2bca`, `#9c69ed`, `#ceb3f6`) while web is blue (`hsl(217 91% 60%)` + `--primary-glow` cyan) — mirror web's HSL tokens into `apps/mobile/tailwind.config.js` and replace hardcoded hex values across mobile components/screens
- [ ] One radius language + 4px spacing scale on mobile (stop mixing `rounded-xl/2xl/3xl` arbitrarily)

**D2 — Workspace "finish" patterns (checklist, not taste)**

- [ ] Empty states: zero-documents and zero-conversations get a friendly guided card (upload CTA), not a blank panel
- [ ] Skeleton loaders instead of bare spinners (document list, conversation list, message history)
- [ ] Toast notifications for errors/success instead of inline red boxes
- [ ] Hover/focus polish pass on all interactive elements (buttons, list rows, source cards)

**D3 — Implement the unbuilt parts of design.md (zero-risk, spec already written)**

- [ ] Composer typing-placeholder animation (typewriter cycle, ~70ms/char per spec §6.2)
- [ ] Suggested-question chips in empty chat state
- [ ] Source-card hover-expand previews + animated match-percentage bars per spec

**D4 — Component quality via shadcn/ui (fixes "bad at choosing components")**

- [ ] Adopt shadcn/ui (design.md already names it as base; stack matches) for dialogs, dropdowns, toasts, tabs, form inputs — restyled with existing tokens
- [ ] Replace hand-rolled modal/popover/input implementations in workspace with shadcn equivalents

---

## Priority Order (updated)

### Priority 1 — Docker Build Optimization (Phase 6) ✅
> Dockerfiles already had the correct layer order; the real cache-buster was missing workspace manifests (`apps/mobile/package.json`, `packages/api-client/package.json`) in the pre-install COPY layer.

- [x] Reorder `Dockerfile` — copy `pnpm-lock.yaml` + `package.json` first, then `pnpm install`, then `COPY . .` (was already correct)
- [x] Add missing `apps/mobile/package.json` + `packages/api-client/package.json` to the pre-install COPY layer in both `apps/api/Dockerfile` and `apps/web/Dockerfile`
- [x] Verify cache hit on second build (no code change → `RUN pnpm install --frozen-lockfile` shows CACHED for both api and web images)

---

### Priority 2 — Mobile UI Fixes (Phase 5) ✅
- [x] Remove voice record button (Mic + `handleVoicePress` Alert) from mobile greeting Ask bar in `app/workspace.tsx`
- [x] Add document picker button to mobile Composer (`onOpenPicker` prop + `Plus` button in `components/Composer.tsx`, mirrors web Composer's `onPlusClick`), wired to the existing picker modal
- [ ] Verify on physical device / emulator (typecheck passes; needs visual check in Expo Go)

---

### Priority 2.5 — Mobile API Client Fixes (ERR-024) ✅
> User report: could not add a file on mobile and could not see processing status. Root cause: `apps/mobile/lib/api.ts` drifted from actual backend responses.

- [x] Fix `sendMessage` response type: backend `/chat` returns `{ conversationId, reply, sources }`, not `{ conversationId, message }` — assistant replies never rendered (same class as ERR-013)
- [x] Add missing `getDocumentStatus()` to `lib/api.ts` (`GET /documents/:id/status`)
- [x] Add 3s document status polling in `app/workspace.tsx` (pending/processing → ready/failed), mirroring web `WorkspacePage`
- [x] Stop auto-selecting still-`pending` uploads in `handleDocumentAdded` — chat 400s on non-ready docs; auto-select now happens when polling sees `ready`
- [x] Fix source shape mismatch: map backend `{ chunkId, documentId, content, … }` → UI `{ documentTitle, preview, … }` via `mapSources()` (titles resolved from documents list); `SourceCard` shows preview + fallback title
- [x] Map sources when loading conversation history (`/conversations/:id/messages`) too
- [x] Guard: sending with no document selected now opens the picker with a hint instead of a raw Zod 400
- [x] Remove stray `userId` fields from request bodies (backend uses `DEMO_USER_ID` server-side)
- [x] `pnpm --filter mobile typecheck` passes
- [ ] End-to-end check on emulator (upload → status turns ready → chat → sources render)

---

### Priority 3 — Auth (Phase 4) ✅
> Better Auth chosen: framework-agnostic, Fastify + Expo adapters, stores in own PostgreSQL. Replaces hardcoded `DEMO_USER_ID`.

- [x] Install `better-auth` in `apps/api`, mount `/api/auth/*` handler in Fastify (`shared/auth.ts` + Request-bridge in `index.ts`)
- [x] Add auth tables via `infra/postgres/init/002_auth.sql` (`user`, `session`, `account`, `verification` — camelCase quoted columns, UUID ids via `advanced.database.generateId = randomUUID`)
- [x] Email + password sign up / sign in (scrypt-hashed password in `account.password`; verified hashed in DB)
- [x] Replace `DEMO_USER_ID` with `session.user.id` in all routes (401 guard via `shared/session.ts` `requireUser()`)
  - `chat.routes.ts`
  - `documents.routes.ts` (upload/paste/list/status)
  - `conversations.routes.ts`
- [x] Auth middleware protects all non-public routes (`/health`, `/config`, `/api/auth/*` stay public)
- [x] `better-auth/react` in `apps/web`: `lib/auth-client.ts`, `/login` page (Mongolian, glass design), `RequireAuth` wrapper on `/workspace`, logout + email in `WorkspaceTopBar`, `credentials: "include"` in `api.ts`
- [x] `@better-auth/expo` in `apps/mobile`: `lib/auth-client.ts` (SecureStore), `app/login.tsx`, session-based routing in `app/index.tsx`, Cookie header in `lib/api.ts`, logout in `Sidebar`; peer deps `expo-secure-store`, `expo-network`, `expo-web-browser` (ERR-025)
- [x] `scripts/smoke-test.sh` updated: signs up throwaway user, asserts 401 unauthenticated, cookie jar for all protected calls — full suite passes
- [x] `BETTER_AUTH_SECRET` in `apps/api/.env` + docker-compose (dev default)
- [ ] Log in on real devices (web browser + Expo Go) to verify UI flows end-to-end

---

### Priority 4 — CI/CD (Phase 6) — target is now the Azure VM
> Triggers on push to `main`. Deploys to Azure VM "Monarch" (40.82.138.44, Ubuntu 24.04, Korea Central).
> **Prerequisite: manual deploy (Priority 5) must succeed first — automate only what already works.**

- [ ] Create `.github/workflows/deploy.yml`
  - `pnpm install` → `build` → `smoke-test.sh`
  - SSH into Azure VM → `cd ~/rag-chatbot` (**MUST cd explicitly** — VM also hosts game servers in sibling folders) → `git pull` → `docker compose up -d --build`
  - `/health` check after deploy
- [ ] Set GitHub Secrets: `AZURE_VM_HOST` (40.82.138.44), `AZURE_VM_USER` (monarch), `AZURE_VM_SSH_KEY`, `GEMINI_API_KEY`, `BETTER_AUTH_SECRET`
- [ ] **NEVER `docker system prune -a` in CI** — it would delete the game-server images (Necesse/Valheim) on the shared VM; use narrow `docker image prune` or nothing
- [ ] Branch strategy: `main` (production) → `dev` (staging) → `feature/*` (PRs)

---

### Priority 5 — Deployment (Phase 6) — Azure VM (replaces DigitalOcean plan)
> Azure $200 free trial (30-day expiry). VM "Monarch" is provisioned and shared with game servers (Necesse now, Valheim later) — see DECISIONS.md 2026-07-02 for isolation rules.

**Done (VM provisioning):**

- [x] Azure VM: Standard D4as v5 (4 vCPU / 16 GiB, AMD), Ubuntu 24.04 LTS, Korea Central Zone 1, 64 GiB Standard SSD
- [x] Static public IP 40.82.138.44; SSH key auth (`monarch` user, Ed25519); local `~/.ssh/config` alias `ssh monarch`
- [x] Docker CE + Compose plugin installed; `monarch` in docker group
- [x] NSG inbound: SSH (22)

**Remaining (RAG deploy — manual first, then CI/CD):**

- [ ] Make GitHub repo **private** before cloning to the VM (verified locally: no `.env` ever committed, only placeholder `.env.example`)
- [ ] Clone to `~/rag-chatbot` on VM (GitHub PAT), write production `.env` (`GEMINI_API_KEY`, strong `BETTER_AUTH_SECRET`, `DATABASE_URL`)
- [ ] Production compose adjustments: web must be a static build behind Nginx (current compose runs Vite dev server), tighten Better Auth `trustedOrigins` + CORS from reflect-any-origin to the real domain
- [ ] Nginx reverse proxy + SSL (Let's Encrypt) on VM; open NSG ports 80/443 (ports must not collide with Necesse 14159/udp)
- [ ] `docker compose up -d --build` in `~/rag-chatbot`, verify `/health` + smoke test against the VM
- [ ] Azure Cost Management: budget alerts at $150/$180
- [ ] Domain (Namecheap `.me` from Student Pack) → A record to 40.82.138.44

> Frontend note: Vercel auto-deploy is still an option for `apps/web` (then only the API lives on the VM); decide during deploy.

---

### Priority 6 — Native App Build / EAS (Phase 5)
> Currently running via Expo Go. Goal: standalone APK installable without Expo Go.

- [ ] Configure EAS Build (`eas.json`, `eas build:configure`)
- [ ] Build Android APK via `eas build -p android --profile preview`
- [ ] Test install on physical device
- [ ] App Store / Google Play — post-MVP

---

### Priority 7 — Retrieval Quality: Query Expansion / Language-Aware Retrieval (Phase 3) — Optional Future Improvement
> Interim fix active (`threshold=0.1`, `lambda=0.5`). Deprioritized — not urgent, revisit later.

- [ ] Add `detected_language` column to `documents` table (new DB migration)
- [ ] Add language detection step to `apps/api/src/modules/ingestion/pipeline.ts`
- [ ] Add `translateQuery()` helper — `retrieval.service.ts` or new `query-expansion.ts`
- [ ] Pass `detected_language` from `chat.routes.ts` through to retrieval layer
- [ ] Restore `threshold → 0.6–0.7` and `lambda → 0.7` once query expansion is stable

### Priority 8 — MMR Toggle UI (Phase 3)
> Backend fully done. Frontend toggle only remaining.

- [ ] Add toggle button in `apps/web/src/components/workspace/Composer.tsx`
- [ ] User-facing label: `"Олон талт хариу"` — avoid "MMR" jargon
- [ ] Wire to `useMMR: boolean` in chat API request body

### Priority 9 — Threshold / Lambda UI Controls (Phase 3)
> Deferred. Power-user feature, not MVP-critical.

- [ ] Expose `threshold` as advanced/debug query param
- [ ] Lambda slider in workspace UI

---

## Docs & Diagrams

- [x] `docs/diagrams/sequence.md` — Chat workflow sequence diagram (Mermaid)
- [ ] `docs/diagrams/sequence.md` — Add ingestion pipeline sequence diagram
- [ ] `docs/diagrams/er.md` — Database ER diagram
- [ ] `docs/diagrams/use-case.md` — User flow use case diagram