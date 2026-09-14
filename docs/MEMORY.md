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

### Git restored after laptop backup transfer (2026-09-14)

- Restored 13 missing primary Git checkouts and verified the existing ICSI405 checkout: all 14 main branches match live GitHub origin/main, SSH authenticates as Tengis01, no unmerged entries, Git connectivity checks pass. See `docs/GIT_RECOVERY.md` for exact folder → repo mapping.
- RAG remote HEAD is 5beb519. App code matched; all approved report/setup/local config files were preserved byte-for-byte. Existing report/setup work stays uncommitted, alongside these recovery notes. No real merge operation existed after .git deletion; no invented merge commit or push.
- Other folders were not universally identical to GitHub: retained Spring MySQL edits, Nogoolin README plus substantial untracked app files, AI notebook edit, ECEN README/script edits and extra course files. ICSI301 is the latest Webapp_FindHire checkout; old findhire is linked on recovery/legacy-findhire at inferred historical base b089006, with local edits intact.
- Restored 19 absent ECEN files; normalized transfer-related CRLF/file modes with original-file archives. Sparse checkout omits tracked generated files; five large repos use partial history blobs fetched on demand. ECEN's URL-less Wireshark gitlink remains excluded (ERR-055).
- Private recovery archives/evidence: `/home/tengis/Documents/Tengis/.git-recovery-20260914/`. Before adding recovery docs, every archived RAG file matched the worktree. pnpm typecheck/build passed (5/5 Turbo cache hits); git diff --check passed. No app/PDF content edits, backend runtime or database operations.
- Next: review/commit wanted local changes; additional unmatched folders need their actual repo URLs. Do not claim untracked Nogoolin/course files are backed up remotely. Current report remains the accepted 40-page version.

### Heading indentation aligned with paragraphs (2026-09-14 follow-up)

- User requested Heading 1/2 to start at the same indent as body paragraphs. Updated numbered/unnumbered chapter headings and sections in `report/dics.sty`; kept existing sizes, vertical gaps and wrapped-heading behavior. Subsections and contents/list formatting are unchanged.
- Capture the section indent before `raggedright` resets `parindent` (ERR-053). PDF coordinates confirm chapter number, section number and paragraph first word all start at x=102.972 pt on a representative page.
- `pnpm report:build` succeeds; PDF remains 40 A4 pages, with no overfull boxes, oversized floats, missing glyphs or unresolved references. Checked short/long heading renders and all-page text bounds. Original diagrams and prose remain unchanged.

### Original Mermaid diagrams restored; spacing tightened (2026-09-14 follow-up)

- User rejected simplified print diagrams and explicitly requested the previous default Mermaid appearance, changing only diagrams and nearby whitespace. This supersedes the vector/print-variant decision below.
- Restored all ten original saved PNG exports and their original detailed Mermaid sources; sources are byte-identical to the pre-rollback backup. Removed six `*-print.mmd`/PDF variants and custom print config/CSS. Updated figure rendering script to use original sources/default theme (PNG default, optional PDF).
- Current Mermaid 11.17.0 rerender did not reproduce the older saved layout (RAG became too tall); use the existing PNGs for this exact visual restoration. Optional regenerated PDFs are not embedded. Inspect any future rerender before replacing these images (ERR-052).
- Tightened float/caption gaps and used `[!htbp]` with `placeins[section,above,below]` to permit compact placement while retaining section proximity. Original figure widths restored. All other approved report content, margins, body spacing, heading styles, tables and appendix code remain unchanged.
- Latest `report/main.pdf`: **40 A4 pages**, down from 44. `pnpm report:build` and figure-script syntax pass; no overfull boxes, oversized floats, missing glyphs or unresolved references/citations. All 40 rendered pages visually reviewed; no text outside page bounds. Nonfigure content in edited chapters matches the backup.
- Current embedded figures are raster originals; the previous 8.5+ pt/vector audit no longer applies. See `docs/REPORT_PRINT_CHECK.md`. No app changes/tests; earlier font, screenshot and runtime limitations remain.

### School formatting and print preparation verified (2026-09-14)

- User explicitly approved school margins/12 pt and items 1–8, with body line spacing kept at 1.0 and program confirmed as «Програм хангамж». Those changes were already partly present; completed overflow fixes and print preparation. Latest `report/main.pdf`: **44 A4 pages**, no overfull boxes, missing glyphs or unresolved references/citations.
- Preserved 3/2/2.5/2 cm + includefoot, 16 pt wrapping chapters, introduction, code list, descriptive appendix, unnumbered conclusion, bottom listing captions and eight actually cited bibliography entries. No report prose rewrite or app changes.
- All ten embedded diagrams now use vector PDFs; six print variants simplify broad diagrams with original detailed Mermaid sources retained. ER shows logical relationships, with columns/SQL in appendix. Neutral print theme and CLI 11.17.0 render script/config/CSS added. Smallest diagram text about 8.5+ pt at print size; see `docs/REPORT_PRINT_CHECK.md` for limits.
- Figure placement uses htbp with section barriers. Long identifier wrapping, table/list caption fit and appendix listing pagination fixed. All-page contact sheets and final appendix renders checked; PDF bounds pass. Pipeline/MMR excerpts still match application source verbatim.
- Remaining: genuine TNR/Arial fonts (currently Liberation fallback), actual web/mobile screenshots, same-logo higher-resolution/vector source if available (existing logo ~190 ppi), signed forms/order and user/physical-print review. No fabricated screenshots, signatures or scores. Font changes require a new layout check.
- Application typecheck/build already passed during environment setup; not rerun for report-only edits. Docker/API/device runtime remains blocked separately. Temporary QA files disappear between resumed environments (ERR-039); do not rely on old /tmp snapshots.


### Fedora installation verified (2026-09-10 follow-up)

- User completed the setup script. Verified Node 24.18.0, pnpm 11.6.0, Go 1.26.8, adb 37.0.0, XeLaTeX/latexmk/Biber and workspace dependencies are installed.
- `pnpm typecheck` passes. `pnpm build` passes for all five workspace tasks, including web production bundle, API TypeScript and Android/iOS Expo exports (api-client remains a placeholder). First build was blocked writing `~/.expo`; approved escalation resolved it without application changes. adb likewise needs host access for `~/.android` (ERR-046).
- Forced report compilation succeeds, 42 A4 pages. Fixed `report:build` to `cd report && latexmk`, because `latexmk -cd ...` did not load report-local rc. Verified the corrected command reads `.latexmkrc`. Inspected cover and final appendix render; current sources have nine overfull-box warnings, no missing glyphs/unresolved references. Fonts fall back to Liberation; layout cleanup remains pending, not a compiler-install failure. No report content/style edits.
- Docker socket still denies access outside sandbox; `sudo -n docker info` still needs password. Escalated `/health` confirms nothing listening on port 4000. Database/API startup and physical-phone/native APK verification remain pending. No DB mutations or Gemini calls.
- Setup task is complete for installed compilers/dependencies and build validation; remaining runtime blocker is host Docker permission/session configuration. User shell also sources a missing `.deno/env` file (ERR-048); unrelated shell files were not edited.


### Fedora environment preparation (2026-09-10; installation blocked on sudo)

- Follow-up: granted owner execute permission (`chmod u+x scripts/setup-fedora.sh`) and launched the script with sandbox escalation. It stopped at the sudo password prompt; cancelled without installing packages. User must run it in an interactive terminal.

- Inspected current report build configuration, required docs and workspace manifests. Current TeX sources already differ from the historical template review below (3/2/2.5/2 cm margins, 16 pt headings, explicit font fallback); did not alter report sources or regenerate the existing PDF.
- Added `scripts/setup-fedora.sh`: official Fedora packages for Node 24/npm, native build tools, Go, adb, XeLaTeX/latexmk/Biber and required report packages/fonts; installs the manifest's pnpm version into `~/.local` then workspace dependencies with a frozen lockfile. Added read-only `scripts/check-environment.sh`, `pnpm env:check`, `pnpm report:build` and `docs/LOCAL_SETUP.md`.
- Prepared absent `DATABASE_URL`, `GEMINI_API_KEY`, and `BETTER_AUTH_SECRET` in ignored `apps/api/.env`, preserving existing values: local published DB port, copied existing Gemini key and generated random auth secret; chmod 0600. No secret values printed; root/frontend env files unchanged. Validity/connectivity remain untested.
- Actual installation is **not complete**: sudo requires user terminal authentication. Node/npm/pnpm, Go, adb and TeX tools are still absent; Docker/Compose binaries exist but daemon socket access is denied even with sandbox escalation. Android Studio launcher/Java 25 exist; SDK/emulator unverified. Times New Roman resolves to Liberation Serif.
- Verification: shell syntax and package JSON parse pass; environment checker correctly reports missing tools/daemon access and present API keys. `pnpm typecheck` and `pnpm build` fail before running because pnpm is absent. No API, PDF, or device runtime verification. Agent `.git` view is empty, so no Git status/diff possible (ERR-041–045).
- Next: user runs `bash scripts/setup-fedora.sh` in their terminal (sudo password stays there), then resume dependency/build/PDF verification and Docker access. No application dependency upgrades or cloud deployment performed.

### School template reviewed; implementation awaits approval (2026-09-10)

- User supplied `report/МКУТ_ДИПЛОМ__ДАДЛАГЫН_АЖЛЫН_ТАЙЛАН_БИЧИХ_ЗАГВАР.zip` and explicitly requested a comparison/list before changes. Read its complete TeX/style guidance; findings and archive file/line references are in `docs/REPORT_TEMPLATE_REVIEW.md`.
- Main template differences: 3/2/2.5/2 cm margins with `includefoot`, 12 pt Times New Roman/Arial, body `baselinestretch=1.66`, introduction, enabled code list, descriptively named appendices and unnumbered conclusion. Current TNR/Arial font requests resolve to Liberation substitutes. Template contents target a bachelor thesis, so two title pages/author declaration/co-supervisor must not be assumed mandatory for this internship.
- Do not copy the template wholesale: it contains uppercase `A4`, conflicting list geometry/letterpaper request, old duplicate-TOC setup, oversized chapter headings and fixed oversized title layout. Preserve prior bug fixes. Figure/table repagination will be needed after approved font/margin changes; final page count is unknown.
- Report sources, existing 32-page PDF and supplied ZIP remain untouched. Only review/memory/task docs changed; no template compilation, font installation or application tests performed. Next: user selects changes, then implementation.

### Technical appendix completed (2026-09-10)

- Replaced the empty `report/subfiles/appendix.tex` placeholder with four sections: five RAG tables/indices plus the error-message migration; the actual `processDocument` function; actual `rerankWithMmr` function with dependency explanation; and local startup/verification commands with smoke-test limitations and side effects.
- SQL omits comments and some blank lines but preserves statements; TypeScript function excerpts match the current source verbatim. Cited repository paths and existing report references. Auth schema is explicitly referenced separately, not misrepresented as included; the main chapter's vector-search SQL was not duplicated. No invented screenshots, credentials, signed forms or test outputs.
- Kept all earlier report text, horizontal/vertical margins and global styles unchanged. Only appendix listings use a locally scoped smaller code font; adjusted pagination so function declarations/bodies and SQL closing lines do not become isolated fragments.
- Verification: `latexmk -silent` succeeds, 32 A4 pages with a three-page appendix (physical pages 30–32). Checked all four source excerpts, reference resolution, lack of overfull boxes/missing glyphs, rendered appendix pages and `git diff --check`. No application source changes; documented commands were not executed and no accounts/API usage were created by this report task.
- Next: user's read-through. Actual web/mobile screenshots, signed/stamped forms/director's order and bibliography finishing remain separate pending items.

### Report vertical margins reduced after visual feedback (2026-09-10)

- User superseded the previous 3 cm top/bottom requirement because it left too much unused space around figures/tables; explicitly requested changing only vertical margins. Changed only `top` and `bottom` in `report/dics.sty` to **1.5 cm**. Left 2.5 cm/right 1 cm, heading styles, figure/table sizes and placement, spacing and all report content remain unchanged.
- Compared compiled PDFs at 3 cm (34 pages), 2 cm (33 pages), 1.8 cm (31 pages) and 1.5 cm (30 pages). A coarse grayscale blank-row comparison across body pages also favored 1.5 cm (3309 total versus 4340 at 3 cm); this is a comparison of tested layouts, not proof of a universal optimum. Retained 1.5 cm after inspecting a figure/table page and the performance-table page. Chapter endings and the unfinished appendix naturally still leave space; no out-of-scope content/float changes made.
- Verification: final `latexmk -silent` succeeds with no overfull boxes, missing glyphs or unresolved references. PDF text stays within the page; footer numbers remain outside the body margin as before. Next: user visual review; prior report finishing items remain outstanding.

### Report page layout polished (2026-09-10)

- Renamed the TOC to “Агуулга”, centered its title once on the first page, and removed running headers on continuation pages. Removed list-specific geometry overrides and negative title offsets.
- Set one A4 body layout throughout: left 2.5 cm, right 1 cm, top/bottom 3 cm (`ignoreheadfoot`; page numbers remain in the footer). Cover now follows the available text height without paragraph indentation or page enlargement.
- Standardized numbered/unnumbered chapter headings to 14 pt with 18 pt line height and automatic wrapping. Inset listing line numbers and added break opportunities to three long technical identifiers; report wording and code-listing bodies were not changed.
- Verification: `latexmk -silent` succeeded; `report/main.pdf` is now 34 A4 pages, with no overfull boxes, missing glyphs or unresolved references/citations. PDF text contains “Агуулга” once and no “ГАРЧИГ”; inspected cover, both TOC pages and representative long chapter headings, and checked all pages' text bounds. `git diff --check` passes. No application changes or application checks needed.
- Next: user's visual review and the outstanding report finishing items below. Preserve supplied forms, original DOCX and existing title-page information. Temporary inspection files may disappear between resumed environments; regenerate them from current sources when needed (ERR-039).

### Latest hosting direction: personal $200 trial only (2026-09-09)

- User explicitly rejects PAYG and says a personal account has $200 credit; wants a 16-GiB VM during the trial, aiming to spend at most $190. Supersedes earlier multi-month/upgrade recommendations. No cloud changes authorized/performed.
- Rechecked Korea Central meters: recommend D4as_v6 (4 vCPU / 16 GiB, $0.224/hour), 128-GiB E10 Standard SSD ($9.60/month) and IPv4 ($0.005/hour): 30-day base $174.48 before extras. D4as_v5 fallback $165.84. Details in `docs/AZURE_BUDGET.md`; check quota/capacity and Gen2 NVMe image compatibility before creation.
- Keep trial spending limit enabled; $190 is a planning target, not configurable hard credit cap. Confirm actual credit/expiry and take off-Azure backups before trial end. Do not upgrade, create replacement trial accounts, or start deployment based on this research alone.

### Ordinary Azure Free Account follow-up (2026-09-09)

- User confirmed the original $200 trial credit is consumed and requested research into remaining free services, not deployment or subscription upgrade. Researched official Free Account rules and app fit; expanded `docs/AZURE_BUDGET.md`.
- Remaining first-year allowances may cover B2ats_v2 + PostgreSQL B1MS + **two exact 64-GB P6 disks** (newly verified in the general Free Account catalog). This can reduce the VM setup to roughly $3.65/month for one IPv4 before extras, if all relevant allowances remain active. Previous E4/E6 disk estimates did not assume this P6 entitlement. Static Web Apps Free + App Service F1 + eligible free PostgreSQL is a possible $0-within-allowances demo alternative, with CPU/idle and ingestion reliability limits; not a production guarantee.
- PAYG is required after trial exhaustion. Before any upgrade, inspect existing paid resources: Microsoft warns disabled resources can reactivate and start billing. Actual benefit expiry, exact meters, region/quota and current resources remain unverified; ask for redacted subscription/free-service screenshots. No cloud, report or application changes made. Research resumed; deployment remains unauthorized.

### Completed plan and supervisor review integrated (2026-09-09)

- User paused Azure work because obtaining Student credit is troublesome and switched back to the report. Read `report/2026-dadlaga_tulvlguu_last.docx` and the school guideline. The new DOCX contains 12 completed plan rows (all `сайн`), per-task supervisor comments, and a supervisor statement/evaluation proposal; no director's order or signature images are present.
- Replaced the blank plan in `report/subfiles/plan.tex` with the supplied table: original English task descriptions, dates, ratings and Mongolian supervisor comments preserved, including planned BullMQ/SSE (the existing conclusion still explains actual deviations). Two pages, repeated table header, existing `tab:internship-plan` reference retained. Copied the statement verbatim into `subfiles/supervisor-review.tex`, formatted as one page and inserted immediately after the title through `main-pre.tex`, with a TOC entry. Moved the future director-order insertion point there as well.
- Preserved the user's title-page `Callpro` / `Хөгжүүлэгч Т.Билгүүн` edits, original DOCX bytes, all other report chapters, and prior Azure notes. Did not invent the missing review date, numeric score or signatures. A signed/stamped official statement and director's order remain outstanding under the school guideline; the supplied text is not presented as a signed scan.
- Verification: `latexmk -silent` succeeds; `main.pdf` is 33 A4 pages. Checked all 60 table cells and all four statement/evaluation paragraphs against DOCX, original SHA-256 unchanged, page order and absence of blank pages verified. Visually inspected PDF page 2 (review), pages 7–8 (plan). No new overfull boxes, missing glyphs or unresolved references; pre-existing template warnings remain. `git diff --check` passes. No application changes; app build/typecheck not relevant to this document-only task.
- Next: user review, fill/obtain the actual date/score/signatures and official director's order, then finish screenshots/appendix/bibliography. Source major says “Програм хангамж”, while the existing title template says “Мэдээллийн технологи”; both were preserved rather than guessing the student's official program. Temporary source PDF and pre-edit copies are in `/tmp/rag-report-forms.PArwJK/`.

### Azure budget research (2026-09-09)

- **Follow-up supersedes the original duration target:** user accepts roughly three months. Rechecked Central/South meters; now recommend a simple all-in-one Korea Central B1ms (1 vCPU / 2 GiB) + 64-GiB Standard SSD + one IPv4, 24/7: $27.43/month, $82.29/three average months before variable extras, no free benefits assumed. Four-GiB B2als_v2 + 32-GiB SSD/IP costs $120.642/three months Central or $112.758 South, so needs shorter uptime or extra budget. Details in `docs/AZURE_BUDGET.md`; no deployment authorized or performed. Existing report edits and the new report DOCX were left untouched.
- User requested a Korea-region hosting recommendation: $100 Student credit for four months, prioritize this app with up to two optional small projects. Researched current official offer/specifications and live retail price meters; details and source queries are in `docs/AZURE_BUDGET.md`.
- Conditional preference: B2ats_v2 API/static-web VM + eligible free PostgreSQL Flexible Server B1MS. Base cost with E4 SSD and one IPv4 is $6.05/month if both compute allowances apply, or $14.591/month if only PostgreSQL is free. Eligibility, remaining free months, region/quota, and app capacity are unverified.
- Without free DB benefits, all-in-one 1-GiB B2ats_v2 fits cost but is memory-constrained. All-in-one 2-GiB B1ms costs $25.03/month before variable extras; four months slightly exceed $100. Four-GiB B2als_v2 costs $40.214/month with disk/IP. Historical Monarch D4as_v5 is not suitable for this budget.
- Next: verify subscription benefits and Korea availability, then obtain the user's deployment choice. Production compose/build, database migration/TLS, load tests, backups and spend monitoring remain future work. No cloud or application changes made; user's existing `report/main.tex` modification left untouched.

### Context refresh (2026-09-08)

- Read AGENTS.md, CLAUDE.md, the required project docs, progress/design references, and architecture diagrams; cross-checked the chat/retrieval/ingestion code and migration startup. Next action awaits the user's next task; no application changes or runtime verification performed in this orientation session.
- Treat older notes as historical: PROJECT_BRIEF still mentions Supabase; CLAUDE.md's two-model fallback and destructive schema workflow are superseded by the current three-model chain (`gemini-2.5-pro → flash → flash-lite`) and startup SQL migrations. The mobile purple brand decision remains pending for web unification.
- The existing, uncommitted `report/subfiles/company.tex` now contains a CallPro Labs introduction and internship duties, so the older “organization unknown” blocker below is stale. Its content was read, not edited or independently fact-checked. Existing `report.zip` was also left untouched.
- Pending verification/deployment/report checklist items below remain unverified in this session; reconcile stale checklist entries when that area is next requested.

### Report editorial review (2026-09-08)

- Read all report LaTeX chapters, front matter, plan, appendix, and bibliography for the user's requested initial opinion on wording. Report files were not edited; no compilation or external fact-check was performed.
- Main editorial issues: literal English translations, repetitive chapter introductions and explanatory endings, inflated self-assessment in chapters 7–8, inconsistent narrative voice, and claims stronger than the recorded verification. Preserve concrete implementation/debugging details and the author's internship experience.
- Suggested direction: restrained student report voice; first person for personal duties/learning, direct descriptions for system behavior; consistent terminology and shorter sentences. Review wording such as “шударга хариу”, “хамгийн үнэ цэнтэй өв”, “production түвшний ... иж бүрэн туршлага”. Distinguish the original threshold setting from a theoretical standard and document-status polling from answer streaming.
- Next: discuss the editorial assessment with the user before applying a prose revision; keep the approved plan, code listings, formulas, citations, and existing company edits intact during this review stage.

### Report prose revision completed (2026-09-08)

- User approved the editorial changes. Revised chapters 2–8 (`company`, `research`, `design`, `implementation`, `results`, `skills`, `conclusion`) to use direct Mongolian prose, fewer repeated introductions, consistent terminology, and restrained first-person descriptions of personal work/learning. Edited the user's existing CallPro Labs chapter in place while retaining its supplied company and internship information; no external fact-check was performed.
- Replaced literal translations (“хоолой”, “амьд хариу”, “стекийн эсрэг”), evaluative claims (“шударга хариу”, “хамгийн үнэ цэнтэй өв”), and overstated completion/production claims. Clarified original versus theoretical threshold, polling versus response streaming, approximate token counts, up-to-20 retrieval results, eight total embedding attempts, and incomplete 500k/physical-phone verification.
- Verification: `latexmk -silent` succeeded, producing `report/main.pdf` (31 A4 pages); no undefined references/citations or missing glyphs. Compared against a pre-edit snapshot: code-listing bodies, display equations, quoted system prompt, citation keys, labels, figure paths, approved plan, main/front matter, appendix, and bibliography are unchanged. Inspected rendered design, skills, and conclusion pages. Body overflows fixed; existing title/heading and package warnings remain (ERR-032). No application code changed, so application build/typecheck and API smoke tests were not run.
- Next: user's read-through of the revised PDF. Existing report finishing work remains: screenshots, title-page fields, signed scans, appendix content, bibliography cleanup, and optional font/template polish. `report.zip` was not regenerated. Pre-edit snapshot is temporarily available at `/tmp/rag-report-edit.oOQ559/`.

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

### Report progress (2026-07-15)

- Typography pass (user feedback "looks unfeeling, line spacing too far"): body line spacing 1.66→1.0 — root cause was `\doublespace` at end of main-pre.tex applying to whole body; new `\normalspace` command (baselinestretch 1.0) in dics.sty, used in main-pre.tex. TOC/lists keep doublespace (template convention). Section heading skips rebalanced in dics.sty: more space above than below (section 1.8em/0.7em, subsection 1.4em/0.5em, was 1em/1em). Report 37→30 pages. Also added future-work bullet to 8.3: structured table extraction + multimodal image/diagram indexing from PDFs (user request).

- Ch7 Ур чадвар + Ch8 Дүгнэлт WRITTEN (2 pages each, body pp. 26–29): Ch7 = 7.1 theory→practice / 7.2 engineering practices / 7.3 methods (ERR-log, layered diagnosis, honest verification). Ch8 = 8.1 plan 12/12 with honest deviations (BullMQ→setImmediate, SSE dropped, threshold interim) + mobile as unplanned extra; 8.2 org proposal kept ORG-AGNOSTIC (org still unknown — revisit wording if user wants org-specific detail); 8.3 future work (query translation, deploy+CI/CD, EAS, OCR, streaming). Report ~37 pages, compiles clean. TEXT of all chapters now done EXCEPT Ch2 (blocked on user org info). Other remaining: screenshots 5.4/5.5, \nocite{*} removal (fastify/betterauth/expo still uncited), title-page blanks, signed scans, TNR font swap.

- Ch3 Даалгаврын тодорхойлолт ба судалгаа WRITTEN (5 pages, body pp. 4–8): 3.1 problem statement + 6 requirements incl. zero-budget; 3.2 RAG theory \cite{lewis2020rag} + new rag-flow.png (figures/src/rag-flow.mmd, conceptual 3-stage diagram); 3.3 cosine formula + HNSW + pgvector-vs-dedicated choice + cross-lingual caveat forward-ref → 6.2; 3.4 GENERAL MMR formula (abstract sim₁/sim₂ per Carbonell — concrete Jaccard version stays in Ch5, no duplication); 3.5 Gemini selection + free-tier RPM/TPM/RPD framing forward-ref → 6.3. Figure placed AFTER the RAG-advantages paragraph (with [H] before it, ⅓ page blank appeared on p.5). Report 34 pages, compiles clean, all refs/cites resolve. Remaining: Ch2 (company — user info), Ch7 (skills), Ch8 (дүгнэлт); screenshots 5.4/5.5.

- Ch6 Туршилт ба үр дүн WRITTEN (4 pages): methodology + 3 problem stories (ERR-021 cross-lingual w/ masking-layers insight; ERR-027/028 w/ TPM empirics and bind-mount lesson; boot loop w/ 3 compounding bugs) + performance longtable (500k row honestly marked as partially verified — daemon crash). Labels sec:problem-crosslingual / -large-paste / -bootloop live here (Ch4/Ch5 refs point at them). Report 30 pages. Chapters remaining: 3 (судалгаа), 2 (company — needs user info), 7 (skills), 8 (дүгнэлт); screenshots for 5.4/5.5.

- Ch4 Системийн зохиомж WRITTEN (5 pages): 4.1 architecture + deliberate simplifications (incl. honest BullMQ→setImmediate plan deviation), 4.2 tech-choice longtable (zero-budget criterion), 4.3 ER diagram (`er-diagram.png` — new mermaid source `figures/src/er-diagram.mmd`) + 5 design decisions, 4.4 modules table. Cross-refs: → Зураг 5.1/5.2, → sec:impl-docker (new label in implementation.tex 5.6). First real \cite calls live (geminiapi, malkov2018hnsw → IEEE [1]/[2]). Report now 27 pages.

- Ch5 Хэрэгжүүлэлт WRITTEN (7 pages): 6 sections, 4 listings (chunker, match_chunks SQL, api-base probe, Dockerfile), MMR formula, SYSTEM_INSTRUCTION quote, 2 diagram figures. Style locked: neutral past narrative + English tech terms as-is (user choice, matches their ECEN326 style). Report now 23 pages, compiles clean.
- Figures pipeline: `report/figures/build.sh` (npx @mermaid-js/mermaid-cli, white bg, scale 2), sources `figures/src/*.mmd`. Generated: architecture.png (for Ch4), ingestion-flow.png, chat-sequence.png.
- IMPORTANT code-vs-docs correction: generator fallback chain in code is `gemini-2.5-pro → gemini-2.5-flash → gemini-2.5-flash-lite` (generator.ts:76-80) — NOT the 2-model chain older docs claim. Also schema comment "text-embedding-004" is stale; real model gemini-embedding-001. Report follows the code.
- Cross-refs: implementation.tex references `sec:problem-crosslingual` / `sec:problem-large-paste` labels now placed in results.tex (Ch6) — keep them when writing Ch6.
- Screenshot placeholders (commented \includegraphics + TODO) in 5.4/5.5 wait for user-captured PNGs in report/figures/.
- Plan table col 2 narrowed 8cm→7.3cm (was overfull). Remaining known overfulls: long uppercase chapter titles (template quirk, cosmetic).

## Diagram set round 2 — Core UML + C4 (2026-07-15 late)

User wanted "every possible useful diagram like requirement standards"; approved plan = Core UML + C4 (deselected code-level + Gantt). NEW: `docs/diagrams/state.md` (doc lifecycle + mobile routing states), `docs/diagrams/sequence/auth-flow.md`, `docs/diagrams/deployment.md` (compose + Azure target), `docs/diagrams/c4.md` (Context + Container; Container is docs-only since architecture.png covers that level in report). Report got 5 new figures (src in figures/src/): c4-context (4.1), doc-state (4.4), auth-sequence (5.3), mobile-routing (5.5), deployment (5.6). Layout fixes: ER figure moved after 4.3 bullet list, doc-state at 0.58\textwidth, modules table col widened 3.6→4.7cm (mono `modules/conversations` overflowed cell — pre-existing bug). c4-context.png was magick-trimmed (mermaid C4 renders with huge margins). Report 32 pages, clean. VS Code mermaid preview: Ctrl+Shift+V / Ctrl+K V (bierner.markdown-mermaid installed).

## Docs & Diagrams complete (2026-07-15)

All four TASKS "Docs & Diagrams" items done (report paused per user): NEW `docs/diagrams/sequence/ingestion-pipeline.md` (full upload/paste→ready sequence incl. backoff loop + notes), NEW `docs/diagrams/er.md` (5 app + 4 auth tables, design-notes), NEW `docs/diagrams/use-case.md` (use-case diagram + happy-path flow). FIXED stale fallback chain in `docs/diagrams/sequence/chat-workflow.md` (now pro→flash→flash-lite per generator.ts). All mermaid blocks validated via mmdc. Note: TASKS previously said `sequence.md` flat file — actual convention is `sequence/` folder.

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
