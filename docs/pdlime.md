# PdLime additions to kan

## Files added
| File | Purpose |
|---|---|
| `compose.yaml` | Wheatley deployment; `app` + `db` services |
| `docs/pdlime.md` | This file |
| `docs/decisions.md` | Decision log |
| `docs/build-log.md` | Build log |

Upstream files changed by PdLime are listed under "Upstream files changed" below.

## Custom build
The image is `ghcr.io/call-me-bones/kan`, built from `apps/web/Dockerfile`, target `web` (`Dockerfile:109`). That stage runs `bootstrap.cjs` (`Dockerfile:130`), which does three things in order:
1. Writes `public/__ENV.js` from every `NEXT_PUBLIC_*` variable at run time (`bootstrap.cjs:30-37`), so those settings come from `compose.yaml` without a rebuild.
2. If `RUN_MIGRATIONS=true` (`bootstrap.cjs:49`), runs `drizzle-kit migrate` without `NODE_ENV` (`bootstrap.cjs:52-53`). That keeps SSL off for plain Postgres, because `packages/db/drizzle.config.ts:9` turns SSL on when `NODE_ENV` is `production`.
3. Starts the Next.js standalone server (`bootstrap.cjs:70`).

This is upstream's single-container pattern (`cloud/docker-stack.yml:9`, `RUN_MIGRATIONS=true`), so there's no separate migration container. Migrations run cleanly on `postgres:16-alpine`: "migrations applied successfully" (`docker logs kan`, 2026-11-13).

## Env choices
| Var | Value | Source |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://kan.pdlime.net` | Edge public name; also Better Auth's base URL (`packages/auth/src/auth.ts:14`) |
| `BETTER_AUTH_SECRET` | from `.env` | Better Auth session secret |
| `POSTGRES_URL` | `postgres://kan:<pass>@db:5432/kan` | `packages/db/src/client.ts:23` reads `POSTGRES_URL` |
| `POSTGRES_PASSWORD` | from `.env` | Same secret as in `POSTGRES_URL` |
| `NEXT_PUBLIC_ALLOW_CREDENTIALS` | `"false"` | Authentik (OIDC) is the only sign-in |
| `NEXT_PUBLIC_DISABLE_SIGN_UP` | `"false"`, always | `"true"` refuses a first OIDC sign-in without an invite (`packages/auth/src/hooks.ts:32-41`); Authentik's `pdlime-users` group decides who gets in |
| `NEXT_PUBLIC_OIDC_AUTO_SIGN_IN` | `"true"` | PdLime patch: `/login` starts the OIDC sign-in by itself (`apps/web/src/views/auth/login/index.tsx`) |
| `RUN_MIGRATIONS` | `"true"` | `bootstrap.cjs:49` |
| `OIDC_CLIENT_ID` | from `.env` | `packages/auth/src/plugins.ts:251`: `genericOAuth` `clientId` |
| `OIDC_CLIENT_SECRET` | from `.env` | `packages/auth/src/plugins.ts:252`: `genericOAuth` `clientSecret` |
| `OIDC_DISCOVERY_URL` | from `.env` | `packages/auth/src/plugins.ts:253`: `https://auth.pdlime.net/application/o/kan/.well-known/openid-configuration` |

`~/stacks/kan/.env` on Wheatley holds only `BETTER_AUTH_SECRET`, `POSTGRES_PASSWORD`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` and `OIDC_DISCOVERY_URL`. Every `NEXT_PUBLIC_*` value is set in `compose.yaml`.

## Sign-in (Authentik OIDC)
- **Provider:** Better Auth `genericOAuth`, `providerId: "oidc"`, scopes `openid email profile`, PKCE (`packages/auth/src/plugins.ts:243-291`). It is registered only when all three `OIDC_*` are set (`plugins.ts:243-245`).
- **Authentik redirect URI:** `https://kan.pdlime.net/api/auth/oauth2/callback/oidc`. better-auth is `1.4.6` (`pnpm-lock.yaml:4765`), and its `plugins/generic-oauth/routes.ts` defines `"/oauth2/callback/:providerId"`. The handler is `apps/web/src/pages/api/auth/[...all].ts`.
- **Flow:**
  1. The person opens `https://kan.pdlime.net`, and the edge's forward-auth check sends them to Authentik.
  2. After they sign in, Kan's `/` redirects to `/login` (`apps/web/src/middleware.ts:43-46`).
  3. `/login` starts the OIDC sign-in by itself. The person is already signed in to Authentik, so it returns at once.
  4. Kan creates the user on first sign-in and opens `/boards`.
- **Log out:** returning to Kan signs the person straight back in while their Authentik session lasts.

## Upstream files changed (Rule 11 exception, Craig 2026-11-13)
Re-check these on every upstream merge:
| File | Change |
|---|---|
| `apps/web/src/views/auth/login/index.tsx` | With `NEXT_PUBLIC_OIDC_AUTO_SIGN_IN=true` and no `error` query parameter, calls `authClient.signIn.oauth2({ providerId: "oidc" })` once on load and shows "Signing in…" |
| `apps/web/src/env.ts` | Declares `NEXT_PUBLIC_OIDC_AUTO_SIGN_IN` |
| `turbo.json` | Adds `NEXT_PUBLIC_OIDC_AUTO_SIGN_IN` to the env list |

## Port 3001
Wheatley's port 3000 is already used by LibreChat. Kan's container listens on 3000 (`EXPOSE 3000`, `Dockerfile:129`), mapped to host `3001:3000`.

## Edge
- **Public name:** `https://kan.pdlime.net`, through the PdLime edge (Caddy, port 443 only).
- **Route:** `PdLime-Edge/Caddyfile:51-58`, `@kan` with `import authentik`, forwarding to `192.168.86.210:3001`. Released in `edge.5`.
- **Every request is gated by Authentik:** `https://kan.pdlime.net/` without a session returns `302` to `https://auth.pdlime.net/application/o/authorize/...`.
- **Health check:** the deploy script runs `curl -fsS -o /dev/null http://localhost:3001/api/health` on Wheatley (`-Deploy-Scripts-/kan/components.psd1`, `Health`).

## Release and rollback
```powershell
& "\\GLaDOS\PdL-NAS\~ADMIN~\PdLime Projects\-Deploy-Scripts-\kan\Deploy-kan.ps1" -Component kan -Tag <tag>
& "\\GLaDOS\PdL-NAS\~ADMIN~\PdLime Projects\-Deploy-Scripts-\kan\Deploy-kan.ps1" -Component kan -Tag <earlier tag> -Rollback
```
Tags are `v0.7.0-pdlime.<n>`. The base release is `v0.7.0`.
