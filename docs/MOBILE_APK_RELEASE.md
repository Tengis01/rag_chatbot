# Android APK demo release

This is an Android-only, directly installable demo release. It does not use Expo Go, Metro, a local laptop IP, or the Android emulator API alias. The EAS `preview` profile embeds `https://api.ragchatbot.dev` as `EXPO_PUBLIC_API_URL`, so the app uses the public production API.

## One-time Expo setup

1. Create an Expo account at [expo.dev](https://expo.dev/signup), then verify the email address.
2. From the repository root, run `pnpm dlx eas-cli@24.5.0 login` and sign in.
3. Run `cd apps/mobile && pnpm dlx eas-cli@24.5.0 init`. Confirm the account/project name in the interactive prompt. This writes the non-secret EAS project ID into `apps/mobile/app.json`.
4. Commit and push that change before building. `eas.json` deliberately requires a clean committed worktree.

## Build and verify

```bash
pnpm typecheck
EXPO_NO_DOTENV=1 EXPO_PUBLIC_API_URL=https://api.ragchatbot.dev pnpm --filter mobile build
pnpm mobile:apk:config
pnpm mobile:apk
```

EAS creates a signed APK. Download it from the EAS build page, install it on an Android phone, and test signup/login, one small text or PDF upload, ready status, a grounded chat reply with sources, and logout/login. The APK may require Android's per-browser or file-manager permission to install unknown apps.

## Public GitHub release

Before changing repository visibility, run the tracked-file secret scan below. It must not report a private key, actual Gemini key, database URL with a real password, Better Auth secret, tunnel token, or backup.

```bash
git grep -n -I -E '(BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{20,}|github_pat_|eyJ[A-Za-z0-9_-]{30,})' || true
git ls-files | rg '(^|/)(\.env($|\.)|.*\.pem$|.*\.key$|secrets|backups)' || true
```

In GitHub repository **Settings → General → Danger Zone**, change visibility to Public. Then create a public release in **Releases → Draft a new release**:

- Tag: `v1.0.0-demo`
- Title: `RAG Chatbot v1.0.0 demo`
- Asset: `RAG-Chatbot-v1.0.0.apk`
- Notes: Android APK; install outside Expo Go; the demo API is temporarily hosted at `api.ragchatbot.dev` and will be unavailable after the Azure VM is shut down.

Open the Release asset link in a browser where you are not signed in to GitHub and confirm the APK downloads. Do not publish the APK until the installed-phone test has passed.
