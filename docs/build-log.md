# Build log

Append-only. Newest first. One dated entry per change.

## 2026-11-12: Sign-in, kan (OIDC docs + compose env)
- **Done:** Documented Authentik OIDC sign-in — `genericOAuth` plugin (`packages/auth/src/plugins.ts:18-31`, `better-auth ^1.4.6`), Redirect URI `https://kan.pdlime.net/api/auth/callback/oidc`. Added `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` / `OIDC_DISCOVERY_URL` (all `${...:?...}`) to `compose.yaml`.
- **Released:** — (docs + compose only; no image rebuild yet)
- **Result:** `docs/decisions.md`, `docs/pdlime.md`, `compose.yaml` updated; OIDC values to be set in `~/stacks/kan/.env` at deploy.

## 2026-11-11: Deploy, kan v0.7.0-pdlime.1
- **Done:** Created `compose.yaml` (app + db, `3001:3000`, `postgres:16-alpine`) and `docs/pdlime.md`. Created `-Deploy-Scripts-\kan\` (Deploy-kan.ps1, components.psd1, README.md). First deploy failed (tag already existed locally); succeeded on third attempt.
- **Released:** `v0.7.0-pdlime.1` → `ghcr.io/call-me-bones/kan:v0.7.0-pdlime.1`
- **Result:** `kan-db` healthy, `kan` running: `Up  0.0.0.0:3001->3000/tcp` (deploy log `2026-11-11_135025`)

## 2026-11-11: Repo, kan v0.7.0
- **Done:** Cloned `kanbn/kan` @ `v0.7.0`, wired remotes (upstream push blocked), created `pdlime` branch, seeded `docs/`.
- **Released:** —
- **Result:** `pdlime` tracking `[origin/pdlime]`, `docs/decisions.md` + `docs/build-log.md` committed.
