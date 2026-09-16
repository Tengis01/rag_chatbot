# TASKS.md

## Jarvis deployment — manual first, then CI/CD (2026-09-14)

Current plan: `docs/DEPLOYMENT_PLAN.md`. It supersedes the historical Monarch/git-pull/on-VM-CI-build details in Priority 4/5 below. The first deployment deliberately builds on the VM for learning; later CI builds on GitHub and deploys versioned GHCR images.

- [x] Confirm learning objective, SSH alias, active Student Pack and lack of domain; inspect Jarvis resources/Valheim/Docker/UFW read-only.
- [x] Prepare phased plan with acceptance gates, domain costs, backup/restore, rollback, CI/CD and 27-day exit preparation.
- [x] Claim Student Pack domain: user registered `ragchatbot.dev` at Name.com (2026-09-15).
- [ ] Record exact Azure expiry and inspect Azure NSG before publishing.
- [x] Prepare production Docker/Compose/Nginx, environment validation, auth/proxy/CORS, upload/request bounds and migration packaging; run relevant tests/builds.
- [x] Manually build and deploy to `/home/tengis/rag-chatbot` as Compose project `rag-prod`; verify DB persistence and Valheim isolation.
- [x] Verify public Cloudflare NS delegation after user changes Name.com: both public resolvers return marek/mckinley (2026-09-15).
- [x] Confirm Cloudflare zone Active from user dashboard (2026-09-16).
- [x] Diagnose/fix connector file permissions (ERR-062); preserve owner-only token and non-root connector.
- [x] Replace UUID in token file with real connector token (ERR-063), recreate connector and verify four registered connections and zero restarts.
- [x] Verify both published ingress routes and public API HTTPS health/CORS/unauthenticated rejection.
- [x] Replace old apex A with tunnel CNAME; verify public web/API HTTPS 200, frontend JS, and public API auth/isolation/upload smoke (ERR-064 fixed, 2026-09-16).
- [x] Verify real browser session and UI flow (user acceptance, 2026-09-16).
- [ ] Verify mobile session plus live document ingestion/chat/source flows (deferred by user).
- [x] Review and commit validated Cloudflare production Compose and deployment evidence; no push or redeploy (2026-09-16).
- [x] Implement admission/drain, backup/scratch-restore helpers, initial restore and checksum-verified off-VM copies; write runbook/evidence.
- [ ] Verify maintenance rejection with active ingestion, manual previous-image rollback, daily backup/retention and recurring off-VM copies.
- [ ] Add Actions CI and SHA-tagged GHCR images; verify VM can pull and manually deploy the same artifacts.
- [ ] Add restricted SSH deployment script/workflow with pinned host key and serialized releases; validate workflow_dispatch before main auto deploy.
- [ ] Record monitoring/demo evidence; rehearse restore in final week and export final backups before expiry.

## Git recovery after laptop transfer — 2026-09-14

- [x] Verify existing SSH identity; map and reconnect all 14 supplied repositories to the correct primary folders, preserving ICSI405's existing metadata.
- [x] Restore RAG history/tracking without changing approved source/report/configuration; verify no conflicts, byte preservation, typecheck/build and Git integrity.
- [x] Preserve real local edits and extra files; archive originals before normalizing transfer line endings/modes or updating proven older files.
- [x] Restore 19 missing ECEN files, omit tracked generated transfer exclusions with sparse checkout, and link legacy findhire separately.
- [x] Record mappings, recovery archives, partial clone behavior and remaining local-only work in docs/GIT_RECOVERY.md.
- [ ] Review/commit desired local RAG/Nogoolin/other changes; no commits or pushes were performed by recovery.
- [ ] If needed, provide URLs for unmatched folders and ECEN's unconfigured Wireshark gitlink (ERR-055).

## Heading indentation — 2026-09-14

- [x] Align chapter/section heading starts with paragraph indentation; preserve existing diagram/layout choices and verify 40-page PDF, heading coordinates, wrapping and page bounds.

## Original diagram restoration — 2026-09-14 follow-up

- [x] Restore all ten original default Mermaid diagrams and saved PNG exports; remove simplified print variants/custom theme, preserving other report changes.
- [x] Tighten figure/caption/paragraph spacing and restore original widths; verify 40-page A4 PDF, all-page renders, bounds, references and unchanged nonfigure prose.
- [x] Update render script and print audit to distinguish original raster exports from the superseded vector variants.

## Current Phase

Build the RAG backend pipeline and real chat UI.

## Fedora development environment — 2026-09-10

- [x] Inspect report compiler/packages, existing runtimes, manifests and local configuration; verify Fedora package names from official repository metadata.
- [x] Add reusable Fedora setup and read-only environment check scripts, report build command and `docs/LOCAL_SETUP.md`.
- [x] Prepare missing backend env keys for host development without exposing secrets or replacing existing configuration.
- [x] Check shell syntax/JSON and run environment inventory; record blocked application check attempts.
- [x] Complete system installation and pinned pnpm/workspace dependencies; typecheck and full build pass (Expo export required sandbox escalation for its cache).
- [ ] Resolve host Docker socket permissions, start/verify local PostgreSQL and API health without removing existing volumes.
- [x] Compile report with XeLaTeX/Biber (42 pages), inspect warnings and sample PDF renders; correct report command to load local rc.
- [x] Resolve report overfull-box warnings; final 44-page print layout verified on 2026-09-14. Genuine TNR/Arial remain pending.
- [ ] Verify SDK-53-compatible mobile client, Android SDK/emulator and physical device connectivity. Go is requested tooling, not an application architecture change.

## School template review — 2026-09-10

- [x] Inspect supplied school ZIP and compare margins, fonts, spacing, headings, front matter, lists and appendices; record recommendations in `docs/REPORT_TEMPLATE_REVIEW.md` without altering report files/PDF.
- [x] User approved alignment and items 1–8, keeping 1.0 body spacing and confirming «Програм хангамж»; thesis-only material not added.
- [x] Complete alignment, vector print diagrams, identifier/table/list wrapping and code pagination; verify 44-page PDF and bounds. See docs/REPORT_PRINT_CHECK.md.
- [ ] Supply genuine TNR/Arial, actual web/mobile screenshots and signed forms/order; review physical print and optional higher-resolution logo.

## Report appendix — 2026-09-10

- [x] Complete technical appendix with source-verified RAG schema/migration, ingestion and MMR functions, plus local verification commands and honest smoke-test limits.
- [x] Build 32-page PDF; inspect the three appendix pages and verify code excerpts/references without changing global margins or running application tests.

## Report layout — 2026-09-10

- [x] Follow-up: compare 2 cm, 1.8 cm and 1.5 cm vertical margins; select 1.5 cm top/bottom (30 pages) to reduce unused space. Supersedes the 3 cm vertical setting below; only the two geometry values changed, horizontal margins and all other report formatting/content preserved.
- [x] Show centered “Агуулга” only on the first TOC page; remove duplicate continuation-page headers.
- [x] Apply A4 margins throughout: left 2.5 cm, right 1 cm, top/bottom 3 cm; remove list-specific overrides and adapt the cover.
- [x] Set chapter headings to 14 pt with automatic wrapping; keep code line numbers and long identifiers inside the text area.
- [x] Rebuild 34-page PDF, inspect cover/TOC/long headings, check text bounds and confirm no overfull boxes or unresolved references.
- [ ] User visual review of the updated report; remaining forms and content finishing items below still apply.

## Report forms integration — 2026-09-09

- [x] Read `report/2026-dadlaga_tulvlguu_last.docx`; replace the blank plan with all 12 supplied ratings/comments and preserve the original planned tasks.
- [x] Add the supervisor statement/evaluation immediately after the title; retain exact body text and leave absent score/date/signatures blank. Keep the future director-order slot in the correct front-matter position.
- [x] Rebuild 33-page PDF; verify all source table cells/review paragraphs, unchanged DOCX, TOC/reference links, and rendered review/plan pages.
- [ ] Obtain/fill actual statement date, supervisor score and signatures; obtain the signed/stamped official statement and director's order required by the guideline.
- [ ] Confirm official program naming: supplied statement says “Програм хангамж”; existing title template says “Мэдээллийн технологи”. Neither was silently changed.

## Azure budget planning — 2026-09-09

Latest direction: user rejects PAYG and wants to use existing personal $200 trial credit for a 16-GiB VM, targeting $190 total during the remaining trial. Student/free-service-upgrade options below are historical; deployment is not yet authorized.

- [x] Recheck 16-GiB Korea Central VM prices for 30 days: D4as_v6 + 128-GiB Standard SSD/IP recommended at $174.48 base; v5 fallback $165.84.
- [ ] If deployment is requested: confirm actual trial expiry/credit, spending limit and v6 quota/image compatibility; prepare production services and off-Azure backup before expiry. Do not upgrade to PAYG.
- [x] Research post-trial free-service eligibility and app fit; verify P6 disk allowance, free PostgreSQL, Static Web Apps, App Service F1 and Container Apps constraints.
- [ ] Before any PAYG upgrade, inspect existing paid resources and actual free-service expiry/meters; obtain explicit upgrade/deployment approval. Budget alerts are not a hard spending cap.
- [x] Re-evaluate after user relaxed target to three months: recommend all-in-one B1ms + 64-GiB SSD/IP at $82.29 base for three months; verify four-GiB Central/South alternatives still exceed $100 for three months.
- [x] Research current Korea-region Azure retail prices and Student allowances for a $100/four-month budget; record conditional recommendations in `docs/AZURE_BUDGET.md`.
- [ ] Confirm actual remaining credit/free-service entitlement and Korea Central VM/PostgreSQL availability before selecting a deployment.
- [ ] After user approval: prepare lean production deployment, verify PostgreSQL extension/TLS/schema migration if using managed DB, and measure small-VM memory/CPU/ingestion behavior before adding projects.
- [ ] Configure cost monitoring and tested backups as part of deployment; no resources provisioned during research.

## Context refresh — 2026-09-08

- [x] Read agent instructions and project memory; cross-check current RAG code, migration startup, and report state before the user's next task.
- [x] Read the full LaTeX report and prepare an initial editorial assessment (word choice, narrative voice, repetition, and overstatement); no report edits requested at this review stage.
- [x] Revise chapters 2–8 after user approval: simplify phrasing, unify narrative voice/terminology, remove inflated claims, and clarify verification limits. Preserve code listings, equations, quoted prompt, citations, figures, approved plan, and supplied internship information.
- [x] Rebuild the revised report (31 A4 pages), compare protected LaTeX content with the pre-edit snapshot, and inspect sample rendered pages; fix body-text overflows (ERR-032).
- [ ] User read-through of the revised PDF; complete existing report finishing items (screenshots, title-page details, scans, appendix, bibliography).
- [ ] When resuming the relevant work, reconcile historical docs/checklists with current files (Supabase references, generation fallback, migration workflow, completed TeX/ER prep, and the existing CallPro Labs company chapter). Orientation did not validate application runtime or report compilation.

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
- [x] Re-test on the physical phone: onboarding → login → register → workspace → upload → chat (2026-07-03: "pretty good, almost done" — boot loop gone; remaining feedback tracked in Priority E below)

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

**D1 — Palette unification (DIRECTION REVERSED, decision pending)**

> ⚠️ 2026-07-02: the mobile PURPLE (`#7c2bca` family) is the CURRENT brand — design.md's blue tokens are the stale previous version (user confirmation). Unification direction is web → purple, NOT mobile → blue. User chose "decide later".

- [ ] DECIDE: re-hue web `index.css` tokens (primary/glow/gradients) to the purple family, or keep web blue / mobile purple split
- [ ] Update design.md token section to the purple palette once decided
- [ ] One radius language + 4px spacing scale on mobile (stop mixing `rounded-xl/2xl/3xl` arbitrarily)

**D2 — Workspace "finish" patterns ✅**

- [x] Empty states: guided glass card in chat thread — upload CTA when no ready documents, suggested questions when ready; conversation sidebar empty copy improved
- [x] Skeleton loaders: `ChatThreadSkeleton` (message history) + pulse rows in ConversationSidebar
- [x] Toasts: new `ToastProvider` (glass, auto-dismiss, error/success/info) replaces the global error bar; upload/paste now confirm with success toasts. Inline send-error banner kept (it has retry)
- [x] Hover/focus: composer focus ring, popover/settings hover states (part of new components)

**D3 — Implement the unbuilt parts of design.md ✅**

- [x] Composer typing-placeholder animation (`useTypewriter`: 70ms type / 30ms delete / 1200ms pause, Mongolian phrases)
- [x] Suggested-question chips in empty chat state (3 Mongolian starters, click = send)
- [x] Source-card hover-expand previews + animated match bars — already implemented, verified present

**D4 — Component quality via shadcn/ui (NOT STARTED — deliberately deferred)**

> Deferred 2026-07-02: D2/D3 delivered the highest-value pieces (toasts, skeletons, empty states) natively with existing tokens; a full shadcn refactor of modals/popovers is a larger visual-regression risk for less gain now. Revisit after the brand-color decision (D1).

- [ ] Adopt shadcn/ui for dialogs, dropdowns, tabs, form inputs — restyled with existing tokens
- [ ] Replace hand-rolled modal/popover implementations in workspace with shadcn equivalents

### Priority E — Physical-phone test round 2 feedback (2026-07-03) ✅

> User tested on the phone: "pretty good almost done". Five issues found; all fixed same day (ERR-029, ERR-030).

- [x] **Onboarding shown/skipped wrongly** (ERR-030): `handleStart` saved the "Дахиж харуулахгүй" opt-out unconditionally — checkbox was never consulted. New policy: opt-out only suppresses onboarding **while the login session is valid**; expired/absent session → onboarding shows again. Onboarding now routes directly to `/workspace` or `/login` (never back through `/` — no loop possible)
- [x] **Chat thread stopped touch-scrolling** (ERR-029): full-screen sidebar-swipe `Gesture.Pan()` captured vertical drags before the ScrollView. Constrained with `hitSlop({left:0,width:40})` + `activeOffsetX(15)` + `failOffsetY(±10)`; ScrollView padding moved to `contentContainerStyle`
- [x] **MMR toggle missing on mobile**: Shuffle toggle in Composer + "MMR" pill on the greeting ask bar; `useMMR` sent to `/chat` (parity with web P8)
- [x] **Paste character counter**: now shows `N / 500,000 тэмдэгт`, turns red and disables "Хадгалах" when over the backend limit
- [x] **Sidebar button heights**: "Шинэ чат" and close button both pinned to 44px (`h-11`)
- [x] **Bonus (parity)**: suggested starter questions on the mobile empty screen (same 3 Mongolian questions as web)
- [x] **Round 2b — Composer standardized to web layout** (user feedback 2026-07-03): MMR pill labeled **"Олон талт хариу"** (was icon-only/"MMR"), placed on the **right side** of the input (was left beside the add button), plus the missing **retrieval settings button** (`SlidersHorizontal`) opening a threshold ("Хамаарлын босго") + lambda ("Олон талт байдал (λ)") slider popover with live values, explainer, and "Анхдагч утга сэргээх" reset — full P9 parity. `threshold`/`lambda` now sent from mobile `/chat` calls. New dep: `@react-native-community/slider` (expo install). Verified: typecheck + `expo export` green
- [ ] Re-test on the physical phone (onboarding policy, scroll after long chat, "Олон талт хариу" pill + sliders popover, counter)

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

### Priority 8 — MMR Toggle UI (Phase 3) ✅

- [x] Toggle pill in `Composer.tsx` (Shuffle icon, active = primary tint, tooltip explains behavior)
- [x] Label: `"Олон талт хариу"` — no "MMR" jargon
- [x] Wired to `useMMR` in chat request body; verified end-to-end via curl

### Priority 9 — Threshold / Lambda UI Controls (Phase 3) ✅

- [x] `threshold` + `lambda` added to `/chat` Zod schema (0–1, defaults 0.1/0.5 per ERR-021 interim fix) and passed to `retrieveChunks`
- [x] Settings popover in Composer (sliders icon): "Хамаарлын босго" + "Олон талт байдал (λ)" sliders with live values, explainer text, reset-to-defaults
- [x] Verified: threshold 0.95 → honest no-context reply (0 sources); 0.1 → grounded answer (5 sources)

---

## Phase 7: Internship Report (started 2026-07-14) — `report/`

> МУИС XeLaTeX template (Mongolian, 11pt, IEEE refs). Structure per удирдамж: Нүүр → Үнэлгээ → Тушаал → Төлөвлөгөө → Тайлан → Хавсралт. Deadline: submit early September 2026.

- [x] Analyze colleague template (Дадлага.zip) + school docx (удирдамж, төлөвлөгөө)
- [x] `report/` scaffold: adapted main.tex (11pt, modern preamble, biblatex ieee, pdfpages), dics.sty, main-pre.tex, .latexmkrc, .gitignore entries
- [x] Real approved plan table (12 tasks, 06.15–07.02) in `subfiles/plan.tex` (Mongolian translation)
- [x] Chapter skeletons: company / research / design / implementation / results / skills / conclusion / appendix
- [x] Starter `references.bib` (RAG, MMR, HNSW, pgvector, Gemini, Fastify, Better Auth, Expo)
- [ ] Install TeX Live: `sudo dnf install texlive-scheme-medium texlive-collection-langcyrillic texlive-subfiles texlive-tocloft texlive-nomencl texlive-algorithms texlive-algorithmicx texlive-upgreek texlive-biblatex-ieee biber latexmk`
- [ ] First successful `latexmk` compile (verify title page, TOC, plan table, bibliography)
- [x] Install TeX Live (texlive-was, not texlive-upgreek), LaTeX Workshop in VS Code (XeLaTeX recipe in `.vscode/settings.json`, removed conflicting vscode-pdf ext)
- [x] First successful compile: 16 pages, A4 (fixed stray `\\` in title, letterpaper→a4paper in class + dics.sty TOC geometry, `@default_files` pinned in .latexmkrc, Table→Хүснэгт caption, temp `\nocite{*}`)

### Writing plan (target ~28–35 pages; write in order 5 → 4 → 6 → 3 → 2 → 7 → 8)

**Prep (before Ch5)**

- [x] Figures pipeline: Mermaid → PNG via `report/figures/build.sh` (npx mmdc, white bg, scale 2; sources in `figures/src/*.mmd`)
- [x] Draw architecture diagram (`architecture.png`, for Ch4) + ingestion-flow (`ingestion-flow.png`) + chat sequence (`chat-sequence.png`, redrawn from docs/diagrams with threshold/lambda + real 3-model chain)
- [ ] Draw ER diagram (documents, chunks, conversations, messages, conversation_documents, auth tables)
- [ ] Capture web screenshots: landing, workspace+sources, retrieval-settings popover
- [ ] Capture mobile screenshots: onboarding, login, chat, sidebar

**Бүлэг 1 — Төлөвлөгөө ✅** (2 pages, real approved plan)

- [x] Filled all 12 Биелэлт/үнэлгээ rows from the supplied completed DOCX (2026-09-09); plan remains two pages.

**Бүлэг 2 — Байгууллагын танилцуулга** (~2–3 pages) — BLOCKED on user input

- [ ] User provides: org name, founding year, field, size, team, supervisor role, IT systems used
- [ ] 2.1 Ерөнхий мэдээлэл · 2.2 Бүтэц (+ optional org chart) · 2.3 МТ орчин (удирдамж §3.1–3.3)

**Бүлэг 3 — Даалгаврын тодорхойлолт ба судалгаа ✅ done (2026-07-15)** — 5 pages

- [x] 3.1 Problem statement + requirements (Mongolian docs, citations, multi-user, PDF+paste, zero-budget) as 6-item list
- [x] 3.2 RAG concept + rag-flow.png diagram (new `figures/src/rag-flow.mmd`), why not fine-tuning \cite{lewis2020rag}
- [x] 3.3 Embedding/vector search: cosine formula, ANN/HNSW \cite{malkov2018hnsw}, pgvector-vs-dedicated-DB choice \cite{pgvector}, cross-lingual caveat → 6.2
- [x] 3.4 General MMR formula (sim₁/sim₂ abstract, per Carbonell) \cite{carbonell1998mmr}; concrete Jaccard/λ impl deferred to Ch5 (no duplication)
- [x] 3.5 Gemini model selection (embedding 768d ↔ VECTOR(768), 2.5 family fallback rationale) + free-tier RPM/TPM/RPD framing that sets up 6.3 \cite{geminiapi}

**Бүлэг 4 — Системийн зохиомж ✅ done (2026-07-15)** — 5 pages

- [x] 4.1 Architecture + diagram, deliberate simplifications (no ORM, no external vector DB, setImmediate over BullMQ, in-process auth)
- [x] 4.2 Tech choice table (8 layers, zero-budget criterion, Gemini vs OpenAI free-tier cite)
- [x] 4.3 DB design: ER diagram (er-diagram.png generated), 5 design decisions (VECTOR(768), HNSW, user_id denorm, sources JSONB snapshot, CASCADE), init vs migrations
- [x] 4.4 Modules table (7 rows), state machine + sequence figure cross-refs to Ch5, /config principle

**Бүлэг 5 — Хэрэгжүүлэлт ✅ text done (2026-07-15)** — 7 pages; screenshots still pending

- [x] 5.1 Ingestion: pdf-parse/createRequire, async setImmediate + polling, chunker listing (Cyrillic-aware), embedder batching, tx vector insert + ingestion-flow figure
- [x] 5.2 Retrieval+generation: match_chunks SQL listing, MMR formula (λ·sim−(1−λ)·maxJaccard), fallback chain **gemini-2.5-pro→flash→flash-lite (per code!)**, SYSTEM_INSTRUCTION quote, sources JSONB, chat-sequence figure
- [x] 5.3 Auth: Better Auth in-process, scrypt, cookie vs SecureStore, requireUser + user_id double-filter invariant
- [x] 5.4 Web client text (dynamic API base, conditional polling, MMR pill + sliders) — screenshots = commented placeholders
- [x] 5.5 Mobile client text (routing, parallel liveness probe listing, composer parity) — screenshots = commented placeholders
- [x] 5.6 Docker: compose services, layer-cache Dockerfile listing, migration runner
- [ ] Insert web screenshots (web-workspace.png, web-settings.png) — placeholders ready in implementation.tex
- [ ] Insert mobile screenshots (mobile-onboarding/chat/sidebar.png) — placeholders ready

**Бүлэг 6 — Туршилт ба үр дүн ✅ done (2026-07-15)** — 4 pages, асуудал→оношилгоо→шийдэл→баталгаажуулалт structure

- [x] 6.1 Methodology: smoke-test.sh full flow, typecheck/build, curl param tests, 2 phone rounds
- [x] 6.2 Асуудал 1 ERR-021 (incl. masking-bugs insight, honest interim-fix framing + query-translation future)
- [x] 6.3 Асуудал 2 ERR-027/028 (TPM quota empirics, Cyrillic 2-byte 413 story, error_message UX fix, ERR-028 bind-mount lesson)
- [x] 6.4 Асуудал 3 boot loop (3 compounding bugs, emulator-vs-phone diagnosis difficulty)
- [x] 6.5 Performance table (3k/50k/500k rows; 500k honestly marked partially-verified)

**Бүлэг 7 — Ур чадвар ✅ done (2026-07-15)** — 2 pages

- [x] 7.1 theory→practice (papers→code, hypothesis testing w/ 0.35 measurement, zero-budget tradeoffs)
- [x] 7.2 engineering practices (backend/SQL/migrations, rate-limit patterns, cross-platform, auth/security mindset, Docker/monorepo)
- [x] 7.3 working methods (layered diagnosis, ERR-NNN/decision-log culture, verification-based dev, honest gap reporting)
- [ ] (optional) weave in user's personal notes on org experience once org known

**Бүлэг 8 — Дүгнэлт ✅ done (2026-07-15)** — 2 pages

- [x] 8.1 Plan fulfillment 12/12 + honest deviations (BullMQ→setImmediate, SSE dropped, threshold 0.7→0.1 interim) + unplanned extra (mobile client)
- [x] 8.2 Proposal to organization (удирдамж §3.3): internal knowledge assistant / help-center first line; org-agnostic wording (org still unknown); 3 preconditions (hosting+backup, paid-tier evaluation, access-policy)
- [x] 8.3 Future work: query translation, prod deploy+CI/CD, EAS, OCR, streaming

**Finishing**

- [ ] Remove temp `\nocite{*}` once chapters have real \cite commands
- [x] User filled title-page organization/supervisor (`Callpro`, `Хөгжүүлэгч Т.Билгүүн`); preserved during integration, publication year remains 2026.
- [x] Хавсралт: RAG schema SQL/migration, ingestion/MMR code and local verification procedure (2026-09-10); three pages, checked against repository source.
- [ ] Add actual extra screenshots when captured; no fabricated or placeholder screenshots were inserted into the completed technical appendix.
- [x] Insert supplied supervisor statement/evaluation text in front matter (2026-09-09).
- [ ] Replace with signed/stamped official statement when available; insert director's order via `\includepdf` in `main-pre.tex` (not supplied in the new DOCX).
- [ ] Optional: install real Times New Roman and swap font line in main.tex
- [ ] Full read-through + submit first week of September, defense second week

---

## Docs & Diagrams ✅ (2026-07-15)

- [x] `docs/diagrams/sequence/chat-workflow.md` — Chat workflow sequence diagram (Mermaid); fallback chain corrected to `gemini-2.5-pro → flash → flash-lite` (was stale 2-model chain)
- [x] `docs/diagrams/sequence/ingestion-pipeline.md` — Ingestion pipeline sequence diagram (upload/paste → pending → chunker → batched embedder w/ backoff loop → tx vector store → ready/failed + polling loop; key-properties notes)
- [x] `docs/diagrams/er.md` — Full ER diagram (5 app tables + 4 Better Auth tables incl. session/account/verification, CASCADE/denorm/JSONB-snapshot annotations + design-notes section)
- [x] `docs/diagrams/use-case.md` — Use case diagram (11 use cases grouped auth/docs/chat with include/extend edges) + happy-path user flow chart
- All mermaid blocks validated with mmdc (render clean)

### Diagram set round 2 — Core UML + C4 (2026-07-15, user-approved plan)

- [x] `docs/diagrams/state.md` — document lifecycle state diagram (incl. restart-sweep edges) + mobile routing state diagram (ERR-030 no-path-back-to-onboarding policy)
- [x] `docs/diagrams/sequence/auth-flow.md` — signup/login (web cookie vs mobile SecureStore rects) + protected-request 401 guard sequence
- [x] `docs/diagrams/deployment.md` — current Docker Compose topology + planned Azure VM "Monarch" prod topology (Nginx/SSL/NSG/pg_dump)
- [x] `docs/diagrams/c4.md` — C4 Level 1 Context + Level 2 Container (container level marked docs-only: architecture.png already covers it in report)
- [x] Report figures added (5 new .mmd sources + PNGs): c4-context → 4.1, doc-state → 4.4 (Зураг 4.4), auth-sequence → 5.3 (Зураг 5.3), mobile-routing → 5.5 (Зураг 5.4), deployment → 5.6 (Зураг 5.5)
- [x] Fixed while inserting: ER figure moved after design-decisions list (page-gap), doc-state width 0.58\textwidth to fit, modules table col 3.6→4.7cm (`modules/conversations` overflowed — pre-existing)
- [x] Report 32 pages, clean compile, 0 undefined refs
- Deselected by user: code-level diagrams (component/class/DFD), Gantt

- [x] Grant owner execute permission to `scripts/setup-fedora.sh` and attempt execution (2026-09-10); installation remains blocked by sudo authentication (ERR-042).
