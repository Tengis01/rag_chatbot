# DECISIONS.md

## Decision Log

This file records important project decisions.

---

## 2026-06-15 — Use React + Vite

Reason:

- Lightweight MVP frontend.
- Familiar enough for fast development.
- Easy to deploy separately.

---

## 2026-06-15 — Use Fastify

Reason:

- Structured API framework.
- Good TypeScript support.
- Good for file upload and streaming endpoints.
- Better long-term API structure than plain Express.

---

## 2026-06-15 — Use Supabase Postgres + pgvector

Reason:

- Stores normal app data and vector embeddings in one database.
- Good for RAG MVP.
- Avoids a separate vector database at the beginning.
- Deploy-friendly.

---

## 2026-06-15 — Use Gemini

Reason:

- Budget-friendly.
- Supports generation and embeddings.
- Good enough for MVP.

---

## 2026-06-15 — Use pnpm + Turborepo

Reason:

- Frontend, backend, and shared types can live in one monorepo.
- Easier to run dev/build/typecheck across apps.
- Shared TypeScript types reduce frontend/backend mismatch.

---

## 2026-06-15 — Optimize agent docs for Codex

Reason:

- User can use Codex free access.
- User does not have Claude Pro.
- Codex uses `AGENTS.md` as repository guidance.
- `CLAUDE.md` is not necessary for this workflow.

---

## 2026-06-15 — Use local Postgres instead of Supabase

Reason:

- Avoid extra cloud dependency during early development.
- pgvector works identically on local Postgres (`pgvector/pgvector:pg16`).
- Backend connects via `pg` npm package using `DATABASE_URL`.
- No Supabase client, auth, or storage is used.
- Can switch to a managed Postgres (Supabase, Neon, Railway) for production later with no code changes — just update `DATABASE_URL`.

---

## 2026-06-15 — Frontend runtime config fetched from GET /config

Reason:

- Avoids duplicate env values maintained separately in frontend and backend.
- Frontend has a single bootstrap env var: `VITE_API_URL`.
- All non-secret config (upload limits, supported types, feature flags) lives in the backend and is served via `GET /config`.
- Secrets (`DATABASE_URL`, `GEMINI_API_KEY`) never leave the backend.

---

## 2026-06-16 — Import CommonJS Packages via createRequire

Reason:

- This project is configured as ESM TypeScript.
- CommonJS packages (such as `pdf-parse`) that do not export standard ESM defaults will crash if imported via `import pdfParse from "pdf-parse"`.
- Using `createRequire` pattern (`import { createRequire } from "module"; const require = createRequire(import.meta.url); const { PDFParse } = require("pdf-parse");`) allows seamless compatibility without having to downgrade the project ESM setup. See `pdf-extractor.ts` for the reference implementation.

---

## 2026-06-17 — pdf-parse v2 uses class-based API (breaking change from v1)

Reason:

- `pdf-parse@2.x` is a complete rewrite and breaks v1 compatibility.
- **v1** exported a plain function: `const pdf = require('pdf-parse'); pdf(buffer)`
- **v2** exports a `PDFParse` class: `const { PDFParse } = require('pdf-parse'); new PDFParse({ data: buffer }).getText()`
- The project pinned `^2.4.5` so the v2 class API must always be used in `pdf-extractor.ts`.
- See `docs/ERRORS.md` ERR-009 for full details and the fix.

---

## 2026-06-18 — Refactor Backend into Domain-Based Modules

Reason:

- Avoid folder bloat inside `apps/api/src/lib/` and `apps/api/src/routes/` as the application grows.
- Re-organize directories based on domain modules (`chat`, `documents`, `conversations`, `ingestion`, `retrieval`) so files related to the same feature are grouped together.
- Keep system-level and configuration routes (like `/health` and `/config`) in `routes/` to preserve separation between system services and business domains.
- Do not introduce path aliases yet to avoid build/tooling complexities in the monorepo; rely on clear relative imports.

---

## 2026-06-18 — Add integration smoke testing suite

Reason:

- Manual endpoint verification becomes tedious and error-prone as the API path surface increases.
- Create an automated `scripts/smoke-test.sh` script to verify health checks, config parameters, document ingestion, background pipeline status updates, and vector-backed chat retrieval.
- Run the smoke test suite prior to, during, and after refactoring actions to ensure no regressions occur.

---

## 2026-06-18 — Prepare monorepo packages for shared client libraries

Reason:

- In anticipation of developing web and mobile clients in the future, structure the Turborepo root workspace to support reusable shared modules.
- Create `packages/shared/` for shared interfaces, schemas, and types.
- Create `packages/api-client/` as a placeholder package to eventually contain standard API call helpers, to prevent duplication between web and mobile repositories.

---

## 2026-06-23 — Frontend UI Stack & Glassmorphism Design System

Reason:

- Adopted Tailwind CSS, Framer Motion, and React Router (v7 / react-router-dom) to build an immersive, responsive frontend.
- Standardized custom CSS custom properties (tokens) in `src/index.css` for a unified dark deep-blue AI aesthetic (using glassmorphism utilities like `.glass`, `.glass-strong`, and gradient helpers like `.bg-gradient-primary`, `.text-gradient`).
- Configured a global `CursorSpotlight` tracking system and page routing wrapper `PageTransition` to give a polished, high-fidelity native application feel.

---

## 2026-06-23 — Component Decomposition of Landing & Workspace Pages

Reason:

- Avoid monolithic bloat by decomposing `Landing.tsx` and `WorkspacePage.tsx` into single-responsibility, reusable sub-components.
- **Landing Sub-components**: `Navbar` (scroll-aware sticky navigation), `Hero` (interactive parallax floating cards + particle animations), `WorkspacePreview` (frozen workspace mockup using mock data), `Capabilities` (3D-tilt scroll-reveal cards), `MobileShowcase` (animated phone preview), `FinalCta`, and `Footer`.
- **Workspace Sub-components**: `WorkspaceTopBar` (health and title headers), `ConversationSidebar` (chat selection & client-side search), `ChatThread` (typing indicators & message log), `Composer` (pulsing in-flight send bar), `SourcesPanel` (right panel for active chat sources), `SourceCard` (progress match visualizers), and `MessageBubble` (collapsible source snippet chips).
- Kept the `/workspace` page strictly connected to the live `/config` and RAG API endpoints, keeping mock data (`src/data/mock.ts`) isolated *only* to the static landing preview.

---

## 2026-06-24 — Enable LAN/Mobile access via Reflect-Origin CORS and Dynamic API Hostname

Reason:

- Allowed users to test and demo the document RAG chatbot on their mobile phones on the same local network.
- Setting `origin: true` (reflect-origin mode) in `@fastify/cors` dynamically accepts any origin hostname matching the client IP (e.g. `192.168.x.x`), ensuring credentials mode works without throwing CORS errors.
- Fallbacks in `api.ts` and `ConfigContext.tsx` dynamically query `window.location.hostname` to compute the API base URL, avoiding hardcoded `localhost:4000` URLs.

---

## 2026-06-24 — Proportional Scale-to-fit Desktop Preview on Mobile Viewports

Reason:

- The `WorkspacePreview` component is a complex desktop RAG workspace mock layout. Reflowing it into a single column on mobile made it unreadable and defeated its purpose of showing how the desktop app looks.
- Locked the inner preview wrapper to a static `960px` desktop width.
- Used a `ResizeObserver` along with CSS `transform: scale(...)` to dynamically measure the parent container's available width and scale the desktop layout down proportionally on mobile viewports.
- The parent container height is set to `scaledHeight` to prevent blank layout gaps, ensuring the element occupies exactly the correct vertical space without manual viewport breakpoints.

---

## 2026-06-24 — Scaffold Mobile App using Expo Router and NativeWind

Reason:

- Initiated the Phase 2 mobile client integration.
- Selected Expo Router for file-system based native routing and NativeWind (Tailwind CSS v3 for React Native) to share styling patterns and deep-dark aesthetic choices with the web frontend.
- Configured as a pnpm workspace package `mobile` to share code/types in the monorepo.

---

## 2026-06-30 — Gemini Model Fallback Chain Corrected

Reason:

- `gemini-3.5-flash` was in the fallback chain but is **paid-tier only** as of May 2026; it caused silent failures on the free tier when primary models were quota-limited.
- `gemma-4-31b-it` required special thought-block stripping and is no longer the best fallback choice.
- New chain: `gemini-2.5-flash` → `gemini-2.5-flash-lite`. Both are free-tier, GA (not preview), and do not require special response parsing.
- Considered `gemini-2.5-pro` but rejected: 5 RPM / 100 RPD quota is too restrictive for interactive chat usage.
- Decision rationale: RAG generation only needs to synthesize already-retrieved context in Mongolian — complex reasoning is not needed. Retrieval quality matters more than generation model novelty.

---

## 2026-06-30 — Diagram File Convention: .md with Embedded Mermaid Blocks

Reason:

- GitHub automatically renders `mermaid` fenced code blocks inside `.md` files.
- `.mmd` files do not render on GitHub and require extra tooling (Mermaid CLI, VS Code extension) to view.
- Convention established: one `.md` file per diagram category (`sequence.md`, `class.md`, `use-case.md`, `er.md`) under `docs/diagrams/`, with multiple diagrams per file under `##` headings.

---

## 2026-06-30 — Cross-Lingual Retrieval: Interim Threshold Fix + SYSTEM_INSTRUCTION Rewrite

Reason:

- Two compounding bugs caused cross-lingual retrieval to fail entirely:
  1. **Retrieval layer**: Cosine similarity between a Latin/English query embedding and Cyrillic Mongolian chunk embeddings is ~0.35 — well below the original `threshold=0.7`. All chunks were filtered out, producing empty context.
  2. **Generation layer**: With empty context, the LLM fell back to its own parametric knowledge and responded in the query's language (English) instead of the document's language (Mongolian Cyrillic).
- **Interim fix**: `threshold` lowered to `0.1`, `lambda` to `0.5` in `retrieval.service.ts`. Acknowledging this is permissive and may admit loosely related chunks.
- **SYSTEM_INSTRUCTION rewrite**: The model is now explicitly instructed to always respond in the source document's language/script, regardless of the language of the user's question.
- **Proper fix (planned)**: Query expansion / language-aware retrieval — see next decision entry.

---

## 2026-06-30 — Query Expansion Architecture: Document Language Detection + Single Query Translation (Planned)

Reason:

- Two approaches considered for solving cross-lingual retrieval structurally:
  - **Approach A (Query Expansion)**: Translate query into 2–3 language variants, embed each, merge+dedupe results by highest score. Works for mixed-language docs but costs 3× embed + 3× search calls per request.
  - **Approach B (Document Language Detection + Single Translation)**: At ingestion, detect document's primary language/script once, store as `documents.detected_language`. At query time, fetch that column for the target docs, translate the user's query into the document's language (single LLM call), embed once, single pgvector search.
- **Decision**: Implement Approach B. Faster (1 embed vs 3), simpler backend logic, sufficient for documents with a dominant language (Mongolian Cyrillic).
- Tradeoff accepted: weaker on genuinely mixed-language documents; can be upgraded to Approach A later if needed.
- Once stable, `threshold` to be restored to `0.6–0.7` and `lambda` to `0.7`.
- Action items: migration for `detected_language` column, language detection in `pipeline.ts`, `translateQuery()` helper in retrieval, pass detected language from `chat.routes.ts`.

---

## 2026-07-02 — Better Auth for email+password authentication (API + Web + Expo)

Reason:

- Framework-agnostic TypeScript auth that runs **inside the Fastify process** — no external auth service, no vendor lock-in.
- All auth data lives in the existing local Postgres: `"user"` (email), `"account"` (scrypt-hashed password), `"session"` (cookie tokens), `"verification"`. Schema in `infra/postgres/init/002_auth.sql` with quoted camelCase columns (Better Auth's default mapping).
- `advanced.database.generateId = randomUUID()` so auth ids are UUIDs, compatible with the existing `user_id UUID` columns on documents/chunks/conversations/messages — no app-table migration needed.
- Fastify has no first-party plugin; the official recipe bridges Fastify requests to Better Auth's Fetch-API handler on `/api/auth/*` (see `apps/api/src/index.ts`).
- `trustedOrigins` reflects the request origin in dev (matches the CORS `origin: true` posture so LAN phone testing keeps working) plus the `ragchatbot://` app scheme; tighten to an allowlist for production.
- Web: `better-auth/react` client, httpOnly session cookie, `credentials: "include"` on all API fetches.
- Expo: `@better-auth/expo` plugin stores the session cookie in SecureStore; our custom `lib/api.ts` attaches it via `authClient.getCookie()`. Requires peer deps `expo-secure-store`, `expo-network`, `expo-web-browser` (the last two are lazily imported by the plugin — missing ones break `expo export`, see ERR-025).
- Route protection via `shared/session.ts` `requireUser()` (401 without session); `DEMO_USER_ID` fully removed from routes.

---

## 2026-07-02 — Add CLAUDE.md alongside AGENTS.md (supersedes 2026-06-15 "Codex only" decision)

Reason:

- The 2026-06-15 decision skipped `CLAUDE.md` because the workflow was Codex-only. The workflow now includes Claude Code, which auto-loads `CLAUDE.md`.
- Division of labor: **AGENTS.md = the rules** (cross-tool standard read by Codex/Cursor/etc.: docs workflow, ERRORS.md format, security and RAG rules); **CLAUDE.md = the map** (architecture deep-dive, commands, known gotchas distilled from ERRORS.md). CLAUDE.md points to AGENTS.md and does not duplicate it.
- Do not delete either file; keep both current. AGENTS.md staleness fixed at the same time (docs/ is git-tracked, mobile app + auth are built).
