# Day 1 & 2 — Completion Summary
Date: 2026-06-16

---

## Day 1 — Infrastructure & Schema ✅

### Хийгдсэн зүйлс
- Monorepo (pnpm 11.6.0 + Turborepo) бүрэн ажиллаж байна
- Docker Compose: postgres (pgvector/pgvector:pg16), api (port 4000), web (port 5173) — бүгд healthy
- pgvector extension enabled
- Schema applied via infra/postgres/init/001_schema.sql:
  - documents, chunks, conversations, messages, conversation_documents tables
  - match_chunks() vector search function
  - HNSW index on chunks.embedding (vector_cosine_ops)
  - VECTOR(768) — confirmed for text-embedding-004
- apps/api/src/lib/db.ts — pg Pool, DATABASE_URL-аас холбогдоно
- GET /health → { ok: true, service: "document-rag-api", db: "connected" }
- GET /config → { appName, maxUploadSizeMb: 20, supportedFileTypes: ["pdf"], maxPasteLength: 500000 }
- Supabase бүрэн хасагдсан — local Postgres only
- Frontend config centralization: VITE_API_URL нэг л env var, бусдыг /config-ээс авна
- apps/web/src/context/ConfigContext.tsx — ConfigProvider + useConfig() hook

### Шийдвэрүүд
- Supabase ашиглахгүй, local Postgres (MVP)
- Frontend runtime config → GET /config endpoint
- DEMO_USER_ID = "00000000-0000-0000-0000-000000000001" (auth хүртэл)
- Credentials: postgres/postgres (local dev only)

### Гарсан алдаа & засвар
- ERR-001: Vite Docker дотор ажиллахгүй → host: '0.0.0.0', usePolling: true (өмнө засагдсан)
- routes/index.ts хуучин файл устгагдаагүй байсан → гараар устгасан
- db.ts-д export нэр хоорондоо таарахгүй байсан → export const db болгон нэгтгэсэн

---

## Day 2 — Dual Ingestion Paths ✅

### Хийгдсэн зүйлс

**Route structure зохион байгуулалт:**
- apps/api/src/index.ts → зөвхөн setup + register, inline route logic байхгүй
- apps/api/src/routes/health.ts — /health route
- apps/api/src/routes/config.ts — /config route
- apps/api/src/routes/documents.ts — бүх document routes

**Шинэ lib файлууд:**
- apps/api/src/lib/constants.ts → DEMO_USER_ID
- apps/api/src/lib/pdf-extractor.ts → extractTextFromPDF(buffer)
- apps/api/src/lib/document-store.ts → temporary in-memory Map (Day 3 хэрэглэнэ)

**API endpoints:**
- POST /documents/upload → PDF buffer → extract → DB insert → 201
- POST /documents/paste → JSON text → validate → DB insert → 201
- GET /documents → DEMO_USER_ID-аар жагсаалт → 200

**Validations:**
- Upload: PDF only (mimetype + extension), max 20MB, scanned PDF rejection
- Paste: 10–500,000 chars

### Гарсан алдаа & засвар

**ERR-002: pdf-parse @types байсан ч pdf-parse өөрөө package.json-д байхгүй**
- Шалтгаан: pnpm add хийхдээ @types/pdf-parse л нэмсэн, pdf-parse мартсан
- Засвар: pnpm --filter api add pdf-parse → docker compose up --build
- Сургамж: types болон implementation package тусдаа — хоёуланг нэмэхээ шалгах

**ERR-003: pdf-parse ESM default import алдаа**
- Шалтгаан: pdf-parse нь CommonJS module, ESM-д import pdfParse from "pdf-parse" ажиллахгүй
- Алдаа: SyntaxError: The requested module 'pdf-parse' does not provide an export named 'default'
- Засвар:
```ts
  import { createRequire } from "module";
  const require = createRequire(import.meta.url);
  const pdfParse = require("pdf-parse");
```
- Сургамж: CommonJS package-уудыг ESM project-д ашиглахад createRequire pattern хэрэглэх

**ERR-004: GET /documents route "/documents/:id" гэж буруу бичигдсэн**
- Шалтгаан: Copy-paste typo — ":id" parameter санаандгүй нэмэгдсэн
- Алдаа: Route GET:/documents not found (404)
- Засвар: app.get("/documents/:id") → app.get("/documents")
- Сургамж: Route path-уудыг curl-аар тест хийсний дараа 404 гарвал эхлээд route definition шалгах

### Одоогийн байдал
- POST /documents/paste — ✅ ажиллаж байна, DB-д хадгалагдаж байна
- POST /documents/upload — ✅ ажиллаж байна (text-based PDF)
- GET /documents — ✅ ажиллаж байна
- Scanned PDF → 422 + descriptive error (intentional, tesseract.js Day 9-д авч үзнэ)
- document-store.ts Map — extracted text-ийг Day 3 chunker хүртэл хадгалж байна

---

## Day 3 — Background Ingestion Pipeline ✅

### Хийгдсэн зүйлс
- **Smart Chunker**: `apps/api/src/modules/ingestion/chunker.ts` үүсгэсэн. ~500 tokens, 15% overlap, Cyrillic/Mongolian тэмдэгтүүдийг таньж токен тооцоолно (Mongolian: 2.5 chars/token, Latin: 4 chars/token). Sentence boundary, paragraph, newline, space зэргээр ухаалгаар хуваана.
- **REST Embeddings**: `apps/api/src/modules/ingestion/embedder.ts` REST API-аар Gemini `gemini-embedding-001` ашиглан 768 хэмжээст вектор үүсгэнэ.
- **pgvector Vector Store**: `apps/api/src/modules/ingestion/vector-store.ts` үүсгэсэн. Хэрэглэгчийн баримтын chunks болон embeddings хадгалах `storeChunks`, `deleteChunks` функцүүдийг transaction дотор batch-оор хийнэ.
- **Asynchronous Processing Pipeline**: `apps/api/src/modules/ingestion/pipeline.ts` ашиглан `pending` -> `processing` -> `ready` эсвэл `failed` төлөвт шилжих background урсгал хийсэн. `setImmediate`-ээр шууд хариу өгөөд ард нь ажилладаг.
- **Status Endpoint**: `GET /documents/:id/status` хэрэглэгч өөрийн баримтын боловсруулалтын төлөвийг шалгах боломжтой.

---

## Day 4 — Vector Retrieval & Chat Generation ✅

### Хийгдсэн зүйлс
- **Array matching**: `match_chunks` SQL функцийг олон `UUID[]` document ids хүлээж авдаг болгон шинэчилсэн.
- **MMR (Maximal Marginal Relevance) Reranker**: Вектор хайлтаас олдсон chunks дээр diversity penalty болон Jaccard similarity ашиглан хамгийн хэрэгцээтэй 5 context chunks сонгодог болгосон.
- **Generative Fallback Suite**: Gemini-ийн free-tier quota-д тэсвэртэй байх үүднээс fallback шатлал хийсэн: `gemini-3.5-flash` -> `gemini-2.0-flash` -> `gemma-4-31b-it`. Gemma-ийн thought blocks-ийг шүүж цэвэр текст өгнө.
- **Endpoints**:
  - `POST /chat` — RAG урсгал (хайлт -> rerank -> generate -> message persistence with sources).
  - `GET /conversations` — хэрэглэгчийн түүхэн чатууд.
  - `GET /conversations/:id/messages` — тухайн чатын бүх мессежүүд болон RAG sources.

---

## Backend Refactor — Modular Architecture Reorganization ✅

### Хийгдсэн зүйлс
- **Module Folders**: Backend кодыг `lib/` болон `routes/` гэж хавтгай байлгахын оронд domain тус бүрээр нь `modules/` дотор хувааж зохион байгуулсан:
  - `modules/documents/` — PDF parse, documents routes, in-memory store.
  - `modules/ingestion/` — chunker, embedder, vector store, background pipeline.
  - `modules/retrieval/` — vector retrieval service.
  - `modules/chat/` — generator fallback logic, chat routes.
  - `modules/conversations/` — conversation database persistence, conversations routes.
  - `shared/` — shared DB pool connection, global constants.
- **Smoke Tests**: `scripts/smoke-test.sh` интеграцийн тест нэмж, бүх API болон background pipeline зөв ажиллаж байгааг баталгаажуулсан.
- **Monorepo Preparation**: Ирээдүйд вэб болон гар утасны апп-д зориулсан reusable API client бичихэд бэлэн болгон `packages/api-client/` үүсгэж workspace-д нэгтгэсэн.

---

## Day 5 — Frontend & Polish & LAN / Mobile Access ✅

### Хийгдсэн зүйлс

**Вэб дизайн болон хэрэглэгчийн интерфэйс:**
- **Tailwind & Framer Motion**: `apps/web` төслийг Tailwind CSS, Framer Motion, болон React Router ашиглан шинэчлэн, glassmorphism өнгө аяс бүхий AI chatbot-ийн дизайнтай болгосон.
- **Component Decomposition**: landing болон workspace хуудсуудыг жижиг component-уудад хуваасан (`Navbar`, `Hero`, `Capabilities`, `WorkspacePreview`, `WorkspaceTopBar`, `ConversationSidebar`, `ChatThread`, `Composer`, `SourcesPanel`).
- **Collapsible Sidebar**: Workspace-ийн зүүн sidebar-ийг эвхэгддэг/дэлгэгддэг болгож, нэмэлт зай ашиглалтыг сайжруулсан.
- **Unified Import Modal**: PDF оруулах болон Текст хуулж наах хэсгийг нэгдсэн нэг modal overlay болгон нэгтгэж, файл хэмжээ болон тэмдэгтийн тоо хэмжигч хөгжүүлсэн.

**Хэлний нутагшуулалт:**
- UI харагдах бүх бичвэр, статус, алдааны мэдээллүүдийг Монгол хэл рүү хөрвүүлж нутагшуулсан. Кирилл үсгийн фонт уншигдахад зориулж Noto Sans font-ийг холбосон.

**Сүлжээ болон Утаснаас хандах боломж (LAN Access):**
- **CORS API update**: `apps/api/src/index.ts`-д Fastify CORS-ийг `origin: true` (reflect-origin) болгосноор ижил сүлжээн дэх ямар ч IP-аас (жишээ нь гар утас) хандах боломжтой болсон.
- **Dynamic API Base**: `api.ts` болон `ConfigContext.tsx` файлуудын API_BASE хаягийг `window.location.hostname` ашигладаг болгож шинэчилсэн. Ингэснээр хэрэглэгч утаснаасаа компьютерынхоо IP хаягаар холбогдоход автоматаар API руу зөв хандана.
- **Docker Compose update**: Postgres ports холболтыг `127.0.0.1` болгон хязгаарлаж гадны сүлжээнээс database руу шууд хандахыг хаасан. Вэб container дэх хуучирсан `VITE_API_URL` env variable-ийг устгасан.

**Гар утасны харагдацын тохиргоо (Mobile Responsiveness):**
- **Desktop Preview Zoom**: Landing хуудас дээрх ажлын талбарын загварыг (WorkspacePreview) гар утсан дээр харахад хагарч байсныг засч, `ResizeObserver` болон CSS `transform: scale()` ашиглан утасны дэлгэцэнд яг тааруулж пропорционалиар жижигрүүлж харуулдаг болгосон.
- **Hero CTA buttons**: Redundant 3 дахь товчийг хасч, дэлгэц дээрх байршлыг сайжруулсан.



---

## Retrieval & Generation Fixes — 2026-06-30 ✅

### Хийгдсэн зүйлс

**Cross-lingual retrieval bug — оношлогдож засагдсан:**

- **Шалтгаан (2 давхарга):**
  - Давхарга 1 (retrieval): Latin/English query нь Cyrillic Mongolian chunks-тай ~0.35 cosine similarity өгдөг. Хуучин `threshold=0.7` эдгээрийг бүгдийг шүүж хаядаг байсан → хоосон контекст.
  - Давхарга 2 (generation): Хоосон контекстэд LLM өөрийн мэдлэгийг ашиглан query-н хэл дээр (Latin/English) хариулдаг байсан.
- **Засвар:**
  - `retrieval.service.ts`: `threshold` → `0.1`, `lambda` → `0.5` (завсрын утга)
  - `generator.ts` SYSTEM_INSTRUCTION дахин бичигдсэн: query-н хэл ямар ч байсан баримт бичгийн хэл/бичгийн систем дээр хариулахыг тодорхой зааварласан
- **Мэдэгдэж буй хязгаарлалт:** threshold=0.1 их зөвшөөрдөг — тохироогүй chunks оруулж ирж болно. Энэ нь query expansion хийгдэх хүртэлх завсрын шийдэл.

**MMR toggle — хэрэгжүүлэгдсэн:**

- `retrieveChunks()` функц: `useMMR: boolean = true` параметр нэмэгдсэн
- `useMMR=false` үед: raw similarity-ээр top-k буцаана (MMR rerank байхгүй)
- `useMMR=true` үед: top-20 candidate → MMR rerank (Jaccard word-overlap diversity, λ=0.5) → шилдэг 5
- `chat.routes.ts`: `useMMR` Zod schema-д нэмэгдсэн (optional, default true), задалж, `retrieveChunks()`-д дамжуулсан
- Frontend toggle (Composer component) — одоохондоо хэрэгжүүлэгдээгүй, дараагийн session-д хийгдэнэ

**Model fallback chain — засагдсан:**

- `gemini-3.5-flash`-ийг fallback chain-аас хасав — энэ model нь 2026 оны 5 сараас эхлэн **paid-tier only**; free tier дээр чимээгүй алдаатай байсан
- Шинэ chain: `gemini-2.5-flash → gemini-2.5-flash-lite` (хоёулаа free-tier, GA/stable, preview биш)
- `gemini-2.5-pro`-г авч үзсэн ч татгалзсан: 5 RPM / 100 RPD quota нь чат хэрэглэгч цагт хэт хязгаарлагдмал

**Sequence diagram үүсгэгдсэн:**

- Шинэ файл: `docs/diagrams/sequence.md` — бүрэн чат урсгалын Mermaid sequence diagram (embed → retrieve → MMR/no-MMR branch → generate → fallback → persist → respond)
- Convention: `.md` files with embedded mermaid blocks (GitHub renders automatically); `.mmd` files abandoned.

### Оношлогооны арга

- Эхлээд `threshold=0`, `lambda=0` тавьж debugging хийсэн (root cause тусгаарлах: chunks огт хоосон уу эсвэл deduplication асуудал уу)
- Чуулган олдоогүй тохиолдолд `Thinking...` зогссон болохыг ажигласан

---

## Mobile App Redesign & Onboarding — 2026-06-30 ✅

### Хийгдсэн зүйлс

**4-slide Onboarding Carousel:**
- `app/onboarding.tsx`: Horizontal pager-view onboarding carousel with slide/fade and parallax effects on graphics.
- Copy adapted from web landing page (`Hero.tsx`, `Capabilities.tsx`, `FinalCta.tsx`) to keep brand messaging uniform.
- "Don't show this again" AsyncStorage persistence (`lib/storage.ts`) and "Skip" button.

**Root Redirection Screen:**
- `app/index.tsx`: Clean loader checking onboarding completed flag. Instantly routes to `/workspace` or `/onboarding`.

**ChatGPT-style Chat Workspace:**
- `app/workspace.tsx`: Rebuilt as the main app entry point after onboarding.
- Greeting state (messages.length === 0): Logo mark, welcome text, large Ask bar card with text input, mic icon placeholder, and document selection pill.
- Active state (messages.length > 0): Collapses Ask bar to composer at the bottom; renders scrollable conversation bubble log.
- Document selection bottom sheet modal: Reuses existing `DocumentPicker` component inside a Modal overlay.

**Swipe-to-Open Sidebar Drawer:**
- `components/Sidebar.tsx`: Swipeable drawer sliding from left (`translateX(-280)` to `0`). Lists conversations using `api.listConversations()` and loads select chat's history. Dismissed by swiping left or clicking backdrop.
- Edge-swipe detector in `workspace.tsx` lets users open the sidebar drawer by dragging right from the left screen edge.

**App Branding and Name:**
- Generated clean 1024x1024 branding PNG assets (`icon.png`, `adaptive-icon.png`, `splash-icon.png`) with gradient-square + sparkles glyph via Pillow script.
- Configured `app.json` to change the app display name from "RAG Chatbot" to **"RAG"**, pointing all icon fields to the new assets.
- Resolved build and TypeScript issues successfully.

## Current Next Step

1. **MMR toggle UI** — Add toggle button in `apps/web/src/components/workspace/Composer.tsx`; label as "Олон талт хариу" (diverse answers), not "MMR". Wire to `useMMR` in chat request body (backend already supports it).
2. **Query Expansion / Language-Aware Retrieval** — Add `detected_language` column to `documents` table (new migration), detect language at ingestion, translate query at chat time, then restore `threshold` to `0.6–0.7`. See DECISIONS.md for full architecture.
3. **Mobile app end-to-end testing** — Run and test the Expo app on physical device/emulator.
4. **End-to-end smoke test** — Full Docker Compose test: upload → chat → sources → reload.
