# Build log

Append-only. Newest first. One dated entry per change.

## 2026-11-13: Sign-out, kan v0.7.0-pdlime.4
- **Done:** `NEXT_PUBLIC_SIGN_OUT_URL` (`compose.yaml`) and the `UserMenu.tsx` Logout change: Kan sign-out, then `https://auth.pdlime.net/flows/-/default/invalidation/`. Checker `28 passed, 1 failed` — C24 only, the recorded upstream-files exception. Checkpoint "Before kan v0.7.0-pdlime.4" on GLaDOS.
- **Released:** `v0.7.0-pdlime.4` → `ghcr.io/call-me-bones/kan:v0.7.0-pdlime.4` (`sha256:c86a20e912ea…`)
- **Result:** Build compiled; healthy after about 4 seconds; 0 restarts, no errors in the log. `http://192.168.86.210:3001/__ENV.js` includes `"NEXT_PUBLIC_SIGN_OUT_URL":"https://auth.pdlime.net/flows/-/default/invalidation/"`. Craig to test Logout.

## 2026-11-13: Icons, kan v0.7.0-pdlime.3
- **Done:** PdLime Kan icon set from `kan-favicon-pack.zip` ("Kora" in the SVG renamed to "Kan"): new `favicon.ico`, `favicon.svg`, 16/32 PNGs, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`; links in `PageHead.tsx`; 192 px icon in `manifest.json`. Checker: `28 passed, 1 failed` — C24 only, the recorded upstream-files exception (`docs/decisions.md`). Checkpoint "Before kan v0.7.0-pdlime.3" taken on GLaDOS.
- **Released:** `v0.7.0-pdlime.3` → `ghcr.io/call-me-bones/kan:v0.7.0-pdlime.3` (`sha256:5c3a88c06bbd…`)
- **Result:** Healthy after about 4 seconds; migrations applied, 0 restarts. From Lime-PC, `:3001` serves all five icons byte-identical to the repo, the manifest lists both icons, and `/login` has the three icon links.

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
