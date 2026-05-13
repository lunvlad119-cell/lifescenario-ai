# LifeScenario AI — Standalone Build

This repo can be run as a standalone app preserving your existing codebase and UX improvements.

## Quick start (local)

```bash
pnpm install
pnpm dev
```

- Web client: `http://localhost:8081`
- API server: started by `pnpm dev` via `dev:server`

## Mobile preview

```bash
pnpm ios
# or
pnpm android
```

## Standalone Docker run

```bash
docker compose up --build
```

Then open: `http://localhost:8081`

## What is included

- Existing project architecture and screens from your repository
- Global city selection + persisted preferences
- Create flow sticky Next/Generate controls and safe-area-aware bottom actions
- UI polish improvements already committed in this branch

## Notes

If you need a permanent public URL, deploy this repo to your hosting provider (Manus/Vercel/Render/etc.).
