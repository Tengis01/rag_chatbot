# Local setup (Fedora 44)

Run from the repository root, as your normal user:

```bash
bash scripts/setup-fedora.sh
export PATH="$HOME/.local/bin:$PATH"
bash scripts/check-environment.sh
```

The installer asks for sudo authentication in your terminal, installs packages
from Fedora's official repositories, installs the `packageManager` version of
pnpm into `~/.local`, then runs `pnpm install --frozen-lockfile`. Add the PATH
line to your shell configuration if `~/.local/bin` is not already included.
Do not run the whole script with sudo: project dependencies should belong to you.

## Included tools

| Area | Tools |
|---|---|
| Web/API/mobile JavaScript | Node.js 24 (matching Dockerfiles), npm, pnpm 11.6.0 |
| Project libraries | Lockfile versions of TypeScript, React, Vite, Fastify, Better Auth, Expo, NativeWind and Turborepo |
| Native dependency builds | GCC C++, make, Python, Node headers |
| Report | XeLaTeX, latexmk, Biber, LaTeX packages including IEEE bibliography style and algorithm listings |
| Fonts/PDF inspection | Liberation Serif/Sans/Mono, Fontconfig (dependency), Poppler |
| Android connection | adb through android-tools; Android Studio launcher already present in this environment |
| Extra requested language | Go; the current application has no Go module |

React, Vite, Fastify, Better Auth, TypeScript and Expo are workspace dependencies,
not separate system applications. Keep their versions in the existing manifests
and lockfile. Do not install the legacy global `expo-cli`.

Package names were checked with Fedora 44 repository metadata: Node is
`nodejs24`/`nodejs24-npm`; Biber is `biber`, not `texlive-biber`.
See [Fedora packages](https://packages.fedoraproject.org/) and
[pnpm installation](https://pnpm.io/installation).

## Database and API

Docker CLI and Compose are installed already. First check daemon access:

```bash
docker info
```

On this machine, this currently fails with socket permission denied even outside
the agent sandbox. Resolve Docker access in your host session before starting
services. Do not make the socket world-writable. Starting the existing local
daemon with `sudo systemctl start docker` and running an individual Docker
command with sudo are options if appropriate to your host setup.

Once Docker access works, start only the database for host development:

```bash
docker compose up -d postgres
```

Host `pnpm dev` does not load the repository-root `.env` used by Compose.
This setup filled the previously absent backend-only keys in `apps/api/.env`:

- `DATABASE_URL`: host-accessible connection URL; use `127.0.0.1` and the
  published `POSTGRES_PORT` from root `.env`, not Compose's `postgres` hostname.
- `GEMINI_API_KEY`: copied the existing root Gemini key without displaying it.
- `BETTER_AUTH_SECRET`: generated a private random 32-byte value.

Do not paste credentials into docs or frontend variables. Existing API values
were preserved; only missing keys were appended and file permissions set to 0600.
Root and frontend `.env` files and existing Compose configuration are preserved.
Credential validity and database connectivity have not yet been tested.
API startup applies pending migrations and marks interrupted ingestion jobs as
failed; avoid starting a second API against a database processing documents.
Never use `docker compose down -v` to prepare an existing database.

```bash
pnpm --filter api dev
# A second terminal:
pnpm --filter web dev
# A third terminal, once API is running:
curl --fail http://localhost:4000/health
```

## Mobile

```bash
pnpm --filter mobile exec expo start --lan
# With a configured Android emulator:
pnpm --filter mobile android
```

The app currently targets Expo SDK 53. Use a matching Expo Go/development client;
installing the newest Expo Go is not proof of compatibility. Android SDK,
emulator/system image and phone connectivity still require verification in
Android Studio. The setup script installs adb, not a full emulator or an APK.
The existing Java installation is OpenJDK 25; native Gradle/JDK compatibility
has not been checked. `expo export` only checks JavaScript bundles.

## Report and checks

```bash
pnpm typecheck
pnpm build
pnpm report:build
# Equivalent without Node/pnpm:
(cd report && latexmk)
```

`report/.latexmkrc` selects XeLaTeX; latexmk invokes Biber for the IEEE
bibliography. A normal build writes `report/main.pdf`. Existing figures are
already present, so Mermaid/Chromium are not needed to compile the report.
`report/figures/build.sh` downloads Mermaid CLI via npx when regenerating figures;
that separate pipeline has not been installed or run during this setup.

Times New Roman currently resolves to Liberation Serif. The report has an
explicit Liberation fallback and also supports user-supplied licensed Times
fonts in `report/fonts/` (`times.ttf`, `timesbd.ttf`, `timesi.ttf`, `timesbi.ttf`).
Installing the compiler does not install proprietary Microsoft fonts.

## Verification status (2026-09-10)

System installation completed by the user. Verified Node 24.18.0, pnpm 11.6.0,
Go 1.26.8, adb 37.0.0 and LaTeX/Biber. `pnpm typecheck` and `pnpm build` pass,
including web/API and Android/iOS JavaScript exports. The agent needed approved
sandbox escalation for Expo's `~/.expo` cache and adb's `~/.android` directory.

Report forced compilation succeeds: 42 A4 pages, nine overfull-box warnings,
no missing glyphs/unresolved references. Cover and final appendix were rendered
and inspected. Report content/styles were preserved; layout cleanup is separate.
The corrected `pnpm report:build` command loads `report/.latexmkrc`.

Docker socket access remains denied outside the sandbox, and sudo still requires
terminal authentication. `/health` on port 4000 refuses connection; database/API
startup and device runtime verification remain pending. The agent's `.git` view
is empty, so Git diff/status is unavailable here; do not initialize a replacement
repository. Host login shell also reports missing `~/.deno/env` in its startup
files; this unrelated shell configuration was not changed.
