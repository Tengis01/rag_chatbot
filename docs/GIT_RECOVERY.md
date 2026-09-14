# Git recovery — 2026-09-14

All paths below are relative to `/home/tengis/Documents/Tengis`. SSH authenticated successfully as `Tengis01`. All 14 primary checkouts use the supplied SSH origin, track `origin/main`, and were verified against live GitHub `refs/heads/main`. Their local HEADs equal the remote HEADs; this does **not** mean all working folders are clean or that local-only files are backed up remotely.

## Folder mapping

| Folder | GitHub repository | Verified HEAD | Working files |
|---|---|---|---|
| `rag_chatbot` | `Tengis01/rag_chatbot` | `5beb519` | Approved report, setup scripts and docs preserved as uncommitted changes; app source matches remote. |
| `ICSI301` | `Tengis01/Webapp_FindHire` | `84ad29c` | Clean. Correct current checkout is ICSI301; updated two files whose local blobs were older remote versions. |
| `ICSI201/lab9` | `Tengis01/ICSI201_OPP` | `5ab731f` | Tracked files clean after restoring line endings/modes and the newer README; .idea/ and JavaTest/ preserved untracked. |
| `ICSI304` | `Tengis01/ICSI304_PDA` | `4b8bf37` | Clean; partial clone, current files seeded from matching local content. |
| `ICSI401` | `Tengis01/ICSI401_MobileDevelopment` | `fa7c90f` | Clean; all 795 tracked files matched. |
| `ICSI204` | `Tengis01/ICSI204_AI` | `0b77995` | Local lab9/2.2-FNN-NumPy.ipynb edit and extra lecture PPTX retained; partial clone. |
| `Javaproject/ICSI201JavaSpring/demo` | `Tengis01/ICSI201_SpringJavaWeb` | `502fcbd` | Six local edits retained, including MySQL locally versus PostgreSQL remotely; line endings/modes normalized. |
| `ICSI203/videogamesalesprediction` | `Tengis01/Probabliity_Statistiks` | `7f66832` | Clean; partial clone, all six current tracked files matched. |
| `ICSI207` | `Tengis01/ICSI207_Operator-_system` | `55049ad` | Tracked files clean; extra lab PDFs, biy daalt/ and lab7/ preserved untracked; partial clone. |
| `ECEN326` | `Tengis01/ECEN326_LinuxServer` | `95f6e62` | Restored 19 absent files; two local edits (README/install script) and original loose PDFs retained; partial clone. Old Wireshark gitlink excluded; see below. |
| `Nogoolin` | `Tengis01/Nogoolin` | `bfe98d8` | Local README edit and substantial untracked application/scaffolding preserved. Remote contains only 22 tracked files; this folder is not fully backed up on GitHub. |
| `local-discord-bot` | `Tengis01/Local_discord_bot` | `527f1a2` | Clean; existing ignored .env preserved. |
| `Tengis01` | `Tengis01/Tengis01` | `f94594c` | Created profile checkout in Tengis01/ because no matching existing folder was present. |
| `ICSI405` | `Tengis01/ICSI405-BB` | `a424e3f` | Existing checkout retained; fetched origin and verified clean/current. |

## RAG reconciliation

- The user confirmed `.git` was removed while making the laptop backup. Restored remote Git history and tracking without checking out over existing files.
- Remote `main` is `5beb519` (`report update`). Application source already matched it. Approved report/layout/diagram changes and Fedora setup remain visible as local modifications/new files.
- There was no surviving merge operation or divergent local commit graph to merge. `git ls-files -u` is empty; no conflict markers were found. No synthetic merge commit was created.
- Before updating these recovery notes, every file in the pre-recovery RAG archive matched the working folder byte-for-byte, including the 40-page PDF, original PNG diagrams, code, local environment files and setup scripts.
- `pnpm typecheck` and `pnpm build` both passed using valid Turbo cache hits (5/5 tasks). `git diff --check` passed. No backend source changes, DB startup, health check, Gemini requests, PDF rebuild, commits or pushes were performed.

## Older static FindHire folder

`findhire/` is also linked to `Tengis01/Webapp_FindHire`, on local branch `recovery/legacy-findhire` with no upstream. The best matching historical commit was `b089006` (26 of 28 files match after line-ending normalization). This is an inferred comparison base, not a recovered original HEAD. Local `index.html`, `styles.css` and untracked `com/review-card.js` remain. This historical checkout is intentionally not at current main; `ICSI301/` is the current main checkout.

## Omitted generated files and partial history

- Repository-local sparse checkout excludes tracked dependencies/caches removed for the transfer: RAG `.pnpm-store/`; ICSI301 `node_modules/`, `.DS_Store` and `server.log`; ICSI207 `lab1/build/`; the missing Python caches/macOS metadata in ICSI204; old logs in ECEN326.
- These are local Git metadata settings, not remote deletions. Installed RAG node_modules and existing environment files were preserved.
- ICSI304, ICSI207, ICSI204, statistics and ECEN326 use partial clones. Commit/tree history is present; matching current blobs were seeded from existing files. Older file contents can be fetched automatically over SSH when needed. All primary repositories passed `git fsck --connectivity-only --no-dangling`.
- ECEN326 tracks `lab1/wireshark-src` as a gitlink but supplies no `.gitmodules` URL. Its source was not in the backup. Excluded that entry from sparse checkout rather than inventing a URL or downloading Wireshark. Actual submodule recovery requires its intended remote URL; see ERR-055.

## Backups and preservation

Recovery directory: `/home/tengis/Documents/Tengis/.git-recovery-20260914/` (owner-only directory).

- `rag-local-before.tar.gz`: original RAG source/report/configuration snapshot; excludes dependencies/build caches and Git metadata. Contains private local configuration; keep private.
- `*-before-normalization.tar.gz` and `ECEN326-before-mode-fix.tar.gz`: original contents and modes for files normalized or updated to known newer remote versions.
- `verification.json`, `rag-preservation-check.json`, `ecen-restored.json` and `findhire-legacy-match.json`: inspection evidence. Verification status counts predate these final documentation additions and the final ECEN sparse-gitlink/mode correction.
- Download staging clones remain in this directory; some full clones timed out and are incomplete. Working repositories have their own Git objects, no alternates pointing to the staging directories.
- Existing `.env` files and SSH keys were not replaced or printed. ICSI301 already has `.env` tracked in its remote history; this recovery did not introduce or publish it. Review that existing history separately before further sharing.

## Folders without a supplied matching repository

Other folders (for example Book, CSII201, CSII202, ECEN213, ICSI202, ICSI214, ICSI251, ICSI303, ICSI311, ICSI334, ICSI403, ICSI263, ICSI438, JavascriptTutorial, SOCI102 and UnrealEngine) were preserved. No arbitrary Git repositories were created for them. Parent course folders can contain one of the specifically linked nested repositories above without themselves being repositories.

## Remaining work

- Review/commit the desired RAG changes when ready; no push was requested or performed.
- Local changes/untracked files in Nogoolin, Spring, ICSI204, ECEN326, ICSI207, OPP and legacy FindHire remain local. They must not be described as already backed up on GitHub.
- Supply a repository URL for any additional folder that should be connected, and the Wireshark submodule URL if that optional source tree is needed.
