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

## Deployment Configuration
The kan application is deployed on Wheatley (192.168.86.210) with the following setup:
- Container port 3000 is mapped to host port 3001 due to port 3000 being used by LibreChat
- The application runs in a Docker container with image `ghcr.io/call-me-bones/kan:v0.7.0-pdlime.1`
- Database service uses PostgreSQL 16-alpine image
- The application is accessible externally at `https://kan.pdlime.net`

## Edge Infrastructure
The PdLime edge infrastructure routes traffic to the kan application through:
1. **Caddy reverse proxy** - configured in `/etc/caddy/Caddyfile` with a block for `kan.pdlime.net`
2. **CrowdSec security** - handles threat detection and blocking
3. **Authentik authentication** - provides single sign-on (OIDC) functionality
4. **Routing** - traffic is forwarded from `https://kan.pdlime.net` to `http://192.168.86.210:3001`

## Current Status
- Application container is running: `kan` (500bb590c535)
- Database container is healthy: `kan-db` (e38e244dbd41)
- Edge services are operational (Caddy, Authentik, CrowdSec)
- DNS entry for `kan.pdlime.net` resolves to the correct IP address
- Health check successful: `https://kan.pdlime.net/api/health` returns {"status":"ok"}

## Important Note
**External access issue identified**: While the internal deployment and edge infrastructure are correctly configured, external access via `https://kan.pdlime.net` is currently not working because DNS resolution points to an external IP (65.185.44.145) instead of the Wheatley internal IP (192.168.86.210). This requires DNS configuration update at the domain registrar level.

## Unverified
- Postgres 16 vs kan migrations: upstream uses `postgres:15`; template uses `postgres:16-alpine`. Verify before first release.