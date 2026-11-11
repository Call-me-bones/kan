# Decisions

Append-only. Newest first. Never edit or delete existing entries.

## 2026-11-11 — Repo setup
- **Upstream:** `kanbn/kan`, default branch `main`
- **Base tag:** `v0.7.0` (newest release, 2026-11-04)
- **Working branch:** `pdlime` (upstream app, outside Zora)
- **Tag scheme:** `v0.7.0-pdlime.1`, `v0.7.0-pdlime.2`, …
- **App name:** `kan`
- **Domain (planned):** `https://kan.pdlime.net` (via edge, deploy phase)
- **Deploy folder:** `-Deploy-Scripts-\kan\` (own repo, not Zora)
- **Build host:** Lime-PC (`192.168.86.100`), registry `ghcr.io/call-me-bones/kan`
