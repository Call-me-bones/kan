# Decisions

Append-only. Newest first. Never edit or delete existing entries.

## 2026-11-12 — Sign-in: Authentik OIDC (Better Auth `genericOAuth` plugin)
- **Decision:** Enable OIDC sign-in. Kan's OIDC provider is Better Auth's `genericOAuth` plugin (`better-auth ^1.4.6`, `packages/auth/package.json:43`), configured in `packages/auth/src/plugins.ts:18-31` and wired in via `createPlugins(db)` (`packages/auth/src/auth.ts:64`). Three vars in `~/stacks/kan/.env`: `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_DISCOVERY_URL`.
- **Redirect URI (set in the Authentik app):** `https://kan.pdlime.net/api/auth/callback/oidc` (= `NEXT_PUBLIC_BASE_URL` + `/api/auth` + `/callback/oidc`; provider `id` defaults to `oidc`).
- **Why:** The `genericOAuth` provider reads the three vars (each default `""`, `plugins.ts:19-28`), so sign-in is active only when all three are set. `BETTER_AUTH_TRUSTED_ORIGINS` is not set — `auth.ts:21` already prepends the `NEXT_PUBLIC_BASE_URL` origin to `trustedOrigins`.
- **Alternatives:** Native `google`/`microsoft`/`azure-ad` plugins (harder to route through Authentik); custom OAuth handler (rejected — `genericOAuth` is the supported path).

## 2026-11-11 — Deploy: single-container build, port, Postgres
- **Decision:** `ghcr.io/call-me-bones/kan` built from `apps/web/Dockerfile --target web`. Migrations run in-container via `bootstrap.cjs` (`RUN_MIGRATIONS=true`); no separate migrate container. Host port `3001:3000` (3000 used by LibreChat). `postgres:16-alpine`. Credentials sign-in only; S3, SMTP, Stripe, Redis, OAuth all off.
- **Why:** `bootstrap.cjs:9-60` writes `__ENV.js`, runs `drizzle-kit migrate` (stripping `NODE_ENV` for plain Postgres), then starts Next.js — same single-container pattern as upstream `cloud/docker-stack.yml:10`. Postgres 16 per pdlime-deploy template.
- **Alternatives:** Separate migrate container (redundant with `bootstrap.cjs`); `postgres:15` (upstream version, inconsistent with PdLime template); S3/SMTP/OAuth/Stripe (not needed for initial PdLime use)

## 2026-11-11 — Repo setup
- **Upstream:** `kanbn/kan`, default branch `main`
- **Base tag:** `v0.7.0` (newest release, 2026-11-04)
- **Working branch:** `pdlime` (upstream app, outside Zora)
- **Tag scheme:** `v0.7.0-pdlime.1`, `v0.7.0-pdlime.2`, …
- **App name:** `kan`
- **Domain (planned):** `https://kan.pdlime.net` (via edge, deploy phase)
- **Deploy folder:** `-Deploy-Scripts-\kan\` (own repo, not Zora)
- **Build host:** Lime-PC (`192.168.86.100`), registry `ghcr.io/call-me-bones/kan`
