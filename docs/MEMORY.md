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

Infrastructure, config layer, dual ingestion paths, the complete Retrieval & Chat backend features, the module-based backend refactor, the decomposed Day 5 frontend UI/Landing components, the scaffolded Expo + Expo Router + NativeWind mobile app, cross-lingual retrieval + generation fixes, and the complete Mobile Client onboarding, greeting, chat, sidebar, and branding integrations are all complete. The visible frontend copy is localized to Mongolian. The web/mobile workspace packages are correctly integrated into the pnpm workspace.

Completed so far:

- Day 1 complete: monorepo running, schema applied, DB connected, `/health`, `/config` working.
- Day 2 complete: `/documents/upload`, `/documents/paste`, `/documents` (GET) working.
- Day 3 complete: Background embedding pipeline implemented. `POST /documents/upload` and `POST /documents/paste` now insert as `pending`, launch the processing pipeline asynchronously, and return immediate response. `/documents/:id/status` monitors processing state.
- Day 4 complete: Migrated `match_chunks` DB function to support `UUID[]`. Created retrieval with pgvector matching and MMR reranking. Created generator with model fallbacks. Implemented `/chat`, `/conversations`, and `/conversations/:id/messages` endpoints with full query scoping by `user_id`.
- Refactor complete: Reorganized `apps/api/src/` from flat `lib/` + `routes/` to feature-module structure (`modules/documents`, `modules/ingestion`, `modules/retrieval`, `modules/chat`, `modules/conversations`, `shared/`). Health and config routes remain in `routes/`. Smoke test script added at `scripts/smoke-test.sh`. Placeholder `packages/api-client` added for future web/mobile shared code.
- Day 5 frontend & Component Decomp complete: Rebuilt `apps/web` with Tailwind, Framer Motion, React Router. Split monolithic files into clean sub-components: `Navbar`, `Hero`, `WorkspacePreview`, `Capabilities`, `MobileShowcase`, `FinalCta`, `Footer` for landing page; and `WorkspaceTopBar`, `ConversationSidebar`, `ChatThread`, `Composer`, `SourcesPanel`, `SourceCard`, `MessageBubble` for the workspace. Everything consumes the live backend `api.ts` client.
- Collapsible Sidebar & PDF Logo complete: Added smooth collapsible transition to the workspace sidebar column using grid layouts and `PanelLeftClose`/`PanelLeftOpen` icons. Replaced the Gemini-like `Sparkles` logo icon with a document `FileText` icon.
- Unified Import Modal & Document Manager complete: Moved PDF upload and Paste text buttons into a unified center-screen overlay triggered by a `+` button in the chat input bar. Added pre-upload size/character limit measurement bars matching session resource indicators. Moved the "+ New Chat" button to the top of the sidebar, and converted the document selection status badge in the chat header into a fully-functional document status dropdown popover.
- Landing Header Links & Cursor Spotlight complete: Removed the dull mockup navigation links from the landing header and replaced them with functional links pointing directly to the landing page sections (`#workspace-preview`, `#capabilities`, `#mobile`). Tightened the cursor spotlight blur radius and opacity for better contrast, and disabled the mouse-glow effect completely on `/workspace` routes.
- Mongolian UI localization complete: Translated the visible landing page, workspace UI, config/loading states, and fallback user-facing messages to Mongolian. Updated the UI font stack to include `Noto Sans` so Cyrillic/Mongolian text renders correctly.
- LAN / mobile access complete: App is now fully accessible from a phone on the same WiFi. Three issues fixed: (1) `api.ts` API_BASE changed to use `window.location.hostname` fallback. (2) `ConfigContext.tsx` had a separate hardcoded `localhost:4000` — fixed with same pattern. (3) Fastify CORS changed to `origin: true` (reflect-origin) so any LAN IP is accepted. Stale `VITE_API_URL` env var removed from docker-compose web service. See ERR-016, ERR-017.
- Mobile responsive improvements: The `WorkspacePreview` component is now dynamically scaled down to fit mobile viewport widths using `ResizeObserver` and CSS `transform: scale()`, keeping the desktop ratio intact on mobile. The redundant 3rd CTA button in the `Hero` section was removed, and bottom padding was adjusted to prevent layout overlap on smaller screens. Added a mobile slide-over drawer for the workspace sidebar using `AnimatePresence` and a menu toggle button (`PanelLeftOpen`) in the workspace header, resolving mobile document status tracking issues and preventing double-uploads. Document list buttons were also made text-adaptive for smaller screens.
- Mobile App Scaffolding: Configured `apps/mobile` with Expo, Expo Router (file-based navigation), and NativeWind (Tailwind CSS v3 for React Native). Generated customized config files, clean layout structure, and synchronized the monorepo package workspace.
- Mobile component bug fix: `DocumentPicker.tsx` and `MessageBubble.tsx` had their content swapped during scaffolding. Both files rewritten with correct implementations. See ERR-020.
- Cross-lingual retrieval fix: Latin/English queries against Cyrillic Mongolian chunks produced ~0.35 cosine similarity, well below the old `threshold=0.7`. Fixed by lowering `threshold` to `0.1` (interim) and `lambda` to `0.5` in `retrieval.service.ts`. Rewritten `generator.ts` SYSTEM_INSTRUCTION now explicitly instructs the model to always respond in the source document's language/script. See ERR-021.
- MMR toggle implemented: `retrieveChunks()` accepts `useMMR: boolean = true`. When `false`, returns top-k by raw similarity; when `true`, applies MMR rerank (top-20 → best 5, Jaccard diversity, λ=0.5). `useMMR` added to `/chat` Zod schema and passed through. Frontend toggle UI pending.
- Model fallback chain corrected: Removed `gemini-3.5-flash` (paid-tier only as of May 2026). New chain: `gemini-2.5-flash → gemini-2.5-flash-lite` (both free-tier GA). See DECISIONS.md.
- Sequence diagram created: `docs/diagrams/sequence.md` — Mermaid sequence diagram of the full chat workflow. Convention: `.md` files with embedded mermaid blocks (GitHub renders automatically); `.mmd` files abandoned.
- Mobile Onboarding Flow complete: Built the 4-slide onboarding carousel with interactive pager, animation-revealing pages, and skip buttons in `app/onboarding.tsx`.
- Mobile Root Redirection Loader: Configured `app/index.tsx` to read the onboarding complete status from `AsyncStorage` and perform an immediate, flicker-free router replacement.
- Mobile Chat & Greeting Workspace: Built the central greeting screen in `app/workspace.tsx` displaying the logo, greeting text, and a rich "Ask bar" with a voice mic placeholder and a document selection pill. Added modal sheet integration displaying `DocumentPicker`. Supported message log layout and active chat state switching.
- Mobile Animated Sidebar Drawer: Developed `components/Sidebar.tsx` displaying current conversation threads and enabling the user to start a new chat or load an existing chat. Integrated edge-swipe gestures using a Reanimated shared value to toggle the drawer.
- Mobile Custom Assets: Pillow-generated custom 1024x1024 app icon, adaptive foreground icon, and splash screen brand assets. Updated display name to "RAG" in `app.json`.
- Docker build layer caching fixed (2026-07-02): Both Dockerfiles already copied manifests before `pnpm install`, but were missing `apps/mobile/package.json` and `packages/api-client/package.json` — a lockfile/workspace mismatch that busted the install layer. Added both COPY lines to `apps/api/Dockerfile` and `apps/web/Dockerfile`. Verified: second `docker compose build` shows `RUN pnpm install --frozen-lockfile → CACHED` for both api and web images.
- Mobile Composer fixes (2026-07-02): Removed the voice record Mic button and its `handleVoicePress` Alert from the greeting Ask bar in `app/workspace.tsx`. Added an `onOpenPicker` prop with a `Plus` document-picker button to `components/Composer.tsx` (mirrors web Composer's `onPlusClick` pattern), wired to the existing document picker modal via `handleOpenPicker`. `pnpm --filter mobile typecheck` passes; visual check on device still pending.
- Better Auth complete (2026-07-02, Priority 3): Email+password auth live across all three apps, all data in local Postgres. API: `shared/auth.ts` (betterAuth instance on the shared pg Pool, UUID ids via `advanced.database.generateId`, expo plugin, reflect-origin trustedOrigins for LAN dev), Fetch-API bridge on `/api/auth/*` in `index.ts`, `shared/session.ts` `requireUser()` guards every documents/chat/conversations route (401), `DEMO_USER_ID` removed from routes. DB: `infra/postgres/init/002_auth.sql` — `"user"`, `"session"`, `"account"` (scrypt-hashed password), `"verification"`, camelCase quoted columns. Web: `/login` page (glass design, Mongolian), `RequireAuth` on `/workspace`, logout in TopBar, `credentials: "include"`. Mobile: `app/login.tsx`, session-routing in `app/index.tsx` (onboarding → login → workspace), SecureStore cookie attached in `lib/api.ts` via `authClient.getCookie()`, logout in Sidebar; needed peer deps expo-secure-store/expo-network/expo-web-browser (ERR-025). Verified: smoke test signs up a user, asserts 401 unauthenticated, full paste→ready→chat→sources flow passes with cookies; password confirmed scrypt-hashed in DB; `pnpm typecheck` + `pnpm build` 5/5 green. `BETTER_AUTH_SECRET` in `apps/api/.env` + compose default.
- Mobile API client fixed (2026-07-02, ERR-024): `apps/mobile/lib/api.ts` had drifted from real backend responses — user couldn't add files or see processing status on the phone. Fixed four bugs: (1) added missing `getDocumentStatus()` + 3s polling effect in `workspace.tsx` (docs were stuck "pending" locally, so DocumentPicker kept them unselectable); (2) `sendMessage` now parses `/chat`'s real `{ conversationId, reply, sources }` response instead of the nonexistent `res.message` (assistant replies never rendered — same class as ERR-013); (3) backend source shape `{ chunkId, documentId, content, … }` mapped to UI `{ documentTitle, preview }` via `mapSources()` in workspace (titles resolved from the documents list, applied to both live chat and loaded history); (4) `handleDocumentAdded` no longer auto-selects still-pending docs (chat 400s on non-ready docs) — auto-select happens when polling sees `ready`. Also: empty-selection guard opens the picker, stray `userId` request fields removed. Typecheck passes; on-device e2e (upload → ready → chat → sources) still pending.

## Current Local URLs

Frontend:    http://localhost:5173
Backend:     http://localhost:4000 (unless overridden by API_PORT in .env)
Health:      http://localhost:4000/health
Config:      http://localhost:4000/config
Status:      http://localhost:4000/documents/:id/status
Chat:        http://localhost:4000/chat
Conversations: http://localhost:4000/conversations

## Deployment Target (2026-07-02): Azure VM "Monarch"

Standard D4as v5 (4 vCPU / 16 GiB), Ubuntu 24.04, Korea Central, static IP **40.82.138.44**, user `monarch` (SSH alias `ssh monarch`). Docker CE installed. **Shared with game servers** (Necesse live at `~/necesse/`, 14159/udp; Valheim later) — RAG goes in `~/rag-chatbot/` with its own compose file. Rules: always `cd ~/rag-chatbot` before compose in deploy scripts; never `docker system prune -a` on the VM; NSG currently only allows SSH (22) — 80/443 to be opened for RAG. Azure trial credit $200, 30 days. See DECISIONS.md 2026-07-02.

## Priorities A/B/C fixed (2026-07-02 evening)

- **A — Mobile boot loop**: new `lib/api-base.ts` liveness-probes all candidate API addresses in parallel (`EXPO_PUBLIC_API_URLS` home/office list, Metro `hostUri` LAN IP, `10.0.2.2` emulator, localhost) via `/health` with 2s timeouts; first alive wins, cached, re-probed after network errors. `app/index.tsx`: 5s timeout on session check; failures route to `/login`, never back to `/onboarding`. Auth client rewrites request origin at call time (`customFetchImpl`). Physical-phone re-test still pending.
- **B — Large-paste ingestion (ERR-027/028)**: `embedder.ts` rewritten — token-budgeted batches (≤15 items/~6k tokens), 3s pacing, 30s timeout, exponential backoff on 429 (free-tier embedding TPM ≈ 20–25k/min empirically). Fastify `bodyLimit` → 4MB (Cyrillic 500k chars ≈ 1MB UTF-8 exceeded 1MB default). Failure reason stored in `documents.error_message` and shown in both UIs. Verified: 50k → ready in ~95s riding out five 429s; 500k (492 chunks/41 batches) processes with pacing. ERR-028: Docker Desktop bind mount can serve stale code after inode-replacing writes — restart container + `docker exec grep` to verify.
- **C — Migrations**: `apps/api/src/shared/db/migrate.ts` runs at API startup, applies `infra/postgres/migrations/NNN_*.sql` once each (tracked in `schema_migrations`, per-file transactions; verified idempotent). `init/` is frozen. pgAdmin compose service (`--profile tools`) with persistent volume. Production rule: NEVER `down -v`.

## UI Polish + Retrieval Controls shipped (2026-07-02 late)

- **P8 ✅** MMR toggle in web Composer ("Олон талт хариу" pill, Shuffle icon); **P9 ✅** threshold/lambda sliders in a Composer settings popover + `/chat` Zod schema params (verified: threshold 0.95 → no-context/0 sources, 0.1 → answer/5 sources).
- **D2 ✅** `ToastProvider` (replaces global error bar; success toasts on upload/paste), `ChatThreadSkeleton` + sidebar skeletons, guided empty-state card (upload CTA when no ready docs / suggested-question chips when ready). **D3 ✅** typewriter composer placeholder (design.md §6.2), suggested chips wired, source hover-previews confirmed already present.
- **D1 ⚠️ REVERSED + deferred**: mobile PURPLE (#7c2bca family) is the CURRENT brand; design.md/web blue is stale (user correction — almost repainted mobile wrong). Open decision: re-hue web → purple. **D4 deferred** (shadcn refactor postponed until after color decision).
- **Robustness**: API startup now sweeps orphaned pending/processing documents → `failed` with honest error message (in-memory text store can't survive restarts; found via Docker Desktop daemon crash killing the 500k test mid-pipeline).
- **Known gap**: full 500k paste → ready run never observed end-to-end (daemon crash at batch ~16/41; mechanics proven by 50k run + partial progress). Re-run when convenient.
- Docker Desktop daemon crashed twice today on its own — if API suddenly refuses connections, `systemctl --user restart docker-desktop` then `docker compose up -d postgres api`.

## Physical phone test round 2 → Priority E fixes (2026-07-03)

- User tested on the real phone: **boot loop GONE**, auth + upload + chat work ("pretty good almost done"). Five feedback items, all fixed same day (TASKS Priority E):
  - **ERR-030** onboarding opt-out: "Дахиж харуулахгүй" checkbox was rendered but never read (`setOnboardingComplete(true)` unconditional). New policy: opt-out suppresses onboarding **only while the Better Auth session is valid**; expired/absent session → onboarding again. Onboarding routes directly to `/workspace`//`/login`, never back through `/`.
  - **ERR-029** chat thread touch-scroll dead after long chats: full-screen sidebar-swipe `Gesture.Pan()` ate vertical drags. Fixed with `hitSlop({left:0,width:40})` + `activeOffsetX(15)` + `failOffsetY(±10)`; ScrollView padding moved to `contentContainerStyle`.
  - Mobile MMR toggle (Composer Shuffle button + "MMR" pill on greeting bar, `useMMR` → `/chat`), paste counter `N / 500,000 тэмдэгт` (red + save disabled when over), sidebar "Шинэ чат"/close both `h-11`, suggested-question chips on mobile empty screen (web parity).
- `pnpm typecheck` green (5/5). Needs one more phone pass to confirm.
- **Round 2b (same day)**: mobile Composer standardized to the web layout — "Олон талт хариу" labeled pill + `SlidersHorizontal` settings button on the RIGHT of the input; settings opens a threshold/λ slider popover (Modal + `@react-native-community/slider`, new dep) with reset; mobile now sends `threshold`/`lambda` to `/chat` (full P8+P9 parity). Typecheck + `expo export` green.

## NEW PHASE: Internship report (2026-07-14)

Project moved to report-writing phase (МУИС үйлдвэрлэлийн дадлагын тайлан, XeLaTeX, Mongolian, Times New Roman 11pt, IEEE references). `report/` folder created:

- Base = colleague's МУИС МКУТ template (dics.sty by М.Золжаргал/Г.Амарсанаа) from Дадлага.zip; adapted `main.tex`: 12pt→11pt, removed deprecated `xltxtra`/`xunicode`/`[T2A]fontenc`/`babel mongolian`, font = Liberation Serif (TNR metric twin; swap line commented in main.tex when real TNR installed), added `biblatex style=ieee` + `references.bib` (8 starter entries: RAG, MMR, HNSW papers + tool docs), `pdfpages` for signed scan inserts.
- `subfiles/plan.tex` = the REAL approved plan (2026-06-15, 12 tasks, from `2026-dadlaga_tulvlguu.docx`), translated to Mongolian. Original English wording (incl. BullMQ/SSE which differ from actual implementation) preserved in the docx in `report/reference-materials/`.
- Chapter skeletons with TODO outlines: company (blank fields for org), research (RAG/embeddings/MMR/Gemini), design (architecture/stack/DB), implementation (pipeline/retrieval/auth/web/mobile/docker), results (problem→solution stories: ERR-021 cross-lingual, ERR-027 429 backoff, boot loop), skills, conclusion, appendix.
- School requirements (`2026-Үйлдвэрлэлийн дадлагын удирдамж.docx`): report structure MUST be Нүүр → Удирдагчийн үнэлгээ → Захирлын тушаал → Төлөвлөгөө → Тайлан → Хавсралт (placeholders via commented `\includepdf` in main.tex). Grading: удирдагч 10 + бичилт 45 (шинжилгээ 15, асуудал/шийдэл 15, баримт 15) + хамгаалалт 45. Deadline: submit first week of September 2026, defend second week.
- Compile: `cd report && latexmk` (.latexmkrc pins xelatex+biber). **TeX Live not yet installed** — user must run dnf install (sudo needed). Empty fields user will fill: organization, supervisor, date.
- Blank student fields filled from ECEN326 lab PDF: Ц.Тэнгис 22B1NUM6249.

## Current Next Step

1. **Physical phone re-test (Priority E verification)** — onboarding checkbox policy, scroll after a long chat, MMR pill, paste counter.
2. **Manual deploy to Azure VM (Priority 5)** — repo private → clone → prod `.env` → prod compose (static web behind Nginx, or Vercel for web) → SSL → NSG 80/443 → verify; add nightly `pg_dump` cron (Priority C leftover).
3. **CI/CD (Priority 4, after manual deploy)**, then **EAS build (Priority 6)**.



## Demo User ID (historical)

Auth is live (Better Auth, 2026-07-02) — routes now use `session.user.id` via `requireUser()`. The old fixed UUID `00000000-0000-0000-0000-000000000001` is no longer used by any route; the constant remains in `shared/constants.ts` only for reference/seeding.

## Important Constraints

- Keep MVP simple.
- Do not add OCR yet.
- Do not add payments yet.
- Do not expose DATABASE_URL or GEMINI_API_KEY to frontend — ever.
- Do not query documents across users.
- Always store messages so users can continue previous chats.
- Every DB query must include a `user_id` filter.
- Frontend config (limits, flags) comes from `GET /config`, not from `.env` files.
