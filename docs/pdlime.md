# PdLime additions to kan

## Files added (upstream untouched)
| File | Purpose |
|---|---|
| `compose.yaml` | Wheatley deployment; `app` + `db` services |
| `docs/pdlime.md` | This file |
| `docs/decisions.md` | Decision log (already present) |
| `docs/build-log.md` | Build log (already present) |

## Custom build rationale
Kan's `apps/web/Dockerfile` `web` target (`Dockerfile:83-101`) runs `bootstrap.cjs` as `CMD`.
`bootstrap.cjs` does three things in order:
1. Writes `public/__ENV.js` from all `NEXT_PUBLIC_*` env vars (`bootstrap.cjs:9-12`)
2. If `RUN_MIGRATIONS=true`, runs `drizzle-kit migrate` from the embedded `./migrate/` stage, **stripping `NODE_ENV`** so `drizzle.config.ts:7` keeps SSL off — correct for plain Postgres (`bootstrap.cjs:36-57`)
3. Starts the Next.js standalone server (`bootstrap.cjs:60`)

This is the same single-container pattern used in upstream's `cloud/docker-stack.yml:10`. No separate migration container is needed.

## Env choices
| Var | Value | Source |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://kan.pdlime.net` | Edge public name |
| `BETTER_AUTH_SECRET` | from `.env` | Better-auth session secret |
| `POSTGRES_URL` | `postgres://kan:<pass>@db:5432/kan` | `packages/db/src/client.ts:14` reads `POSTGRES_URL` |
| `POSTGRES_PASSWORD` | from `.env` | Same secret as in `POSTGRES_URL` |
| `NEXT_PUBLIC_ALLOW_CREDENTIALS` | `"true"` | `.env.example:39-43` — needed for first-user creation |
| `NEXT_PUBLIC_DISABLE_SIGN_UP` | `"false"` initially, `"true"` after first user | `.env.example:44` |
| `RUN_MIGRATIONS` | `"true"` | `bootstrap.cjs:36-57` |
| `OIDC_CLIENT_ID` | from `.env` | `packages/auth/src/plugins.ts:20` — `genericOAuth` `clientId` |
| `OIDC_CLIENT_SECRET` | from `.env` | `packages/auth/src/plugins.ts:21` — `genericOAuth` `clientSecret` |
| `OIDC_DISCOVERY_URL` | from `.env` | `packages/auth/src/plugins.ts:22` — OIDC discovery |

The three `OIDC_*` values configure the `genericOAuth` plugin (`better-auth ^1.4.6`, `packages/auth/src/plugins.ts:18-31`; wired via `createPlugins(db)` in `packages/auth/src/auth.ts:64`). Set all three in `~/stacks/kan/.env` to enable sign-in. **Required Authentik Redirect URI:** `https://kan.pdlime.net/api/auth/callback/oidc`.

## Port 3001
Wheatley port 3000 is already used by LibreChat. Kan's container listens on 3000 internally (`EXPOSE 3000`, `Dockerfile:100`); we map host `3001:3000`.

## Edge
Public name: `https://kan.pdlime.net` (Caddy, port 443 only, per `pdlime-edge`).
Internal access from Lime-PC for health checks: `http://192.168.86.210:3001/api/health`.

## Unverified
- Postgres 16 vs kan migrations: upstream uses `postgres:15`; template uses `postgres:16-alpine`. Verify before first release.