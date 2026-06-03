# UniPharma (Monorepo)

UniPharma is a platform that connects **pharmacy owners** with **pharmacy professionals** based on location, skills, and availability.

## Tech stack

- **Monorepo**: pnpm workspaces
- **Frontend**: Vite + React + Tailwind + Radix UI (`artifacts/unipharma`)
- **Backend**: Node.js + Express + Drizzle + Postgres (`artifacts/api-server`)
- **Shared libs**: `lib/db`, `lib/api-zod`, `lib/api-client-react`

## Prerequisites

- Node.js (recommended: recent LTS)
- pnpm
- PostgreSQL (local or remote)

## Install

```bash
pnpm install
```

> This repo enforces **pnpm**. `npm install` / `yarn` will fail by design.

## Environment variables

Create env files from examples:

- `artifacts/api-server/.env.example` → create your own env in the way you prefer (PowerShell, `.env` + loader, CI secrets, etc.)
- `artifacts/unipharma/.env.example` → create `artifacts/unipharma/.env` for Vite

For Netlify deployments, set `API_URL` to the backend origin, for example
`https://your-api-service.onrender.com`. The web app proxies `/api/*` through a
Netlify function.

## Run (dev)

### Backend (API)

PowerShell example:

```powershell
$env:DATABASE_URL="postgres://user:pass@localhost:5432/unipharma"
$env:PORT="8080"
$env:SESSION_SECRET="change-me"
pnpm --filter @workspace/api-server dev
```

### Frontend (Web)

PowerShell example:

```powershell
$env:PORT="5173"
$env:BASE_PATH="/"
$env:VITE_API_URL="http://localhost:8080"
$env:VITE_GOOGLE_CLIENT_ID="your-google-client-id"
pnpm --filter @workspace/unipharma dev
```

## Workspace scripts

- `pnpm run build`: typecheck + build all packages
- `pnpm run typecheck`: typecheck libs + artifacts
