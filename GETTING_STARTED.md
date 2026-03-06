# Getting Started

Local development guide for **clerck_ui** (the Clerck frontend).

## Prerequisites

- Node.js 20+
- The [clerck](../clerck) backend repo cloned alongside this repo
- Python 3.11+ (for the backend)

## 1. Start the backend

```bash
cd ../clerck
make run          # starts FastAPI on http://localhost:8080
```

Verify it's up:

```bash
curl -sf http://localhost:8080/health
```

## 2. Start the frontend

```bash
npm install       # first time only
npm run dev       # starts Vite dev server on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 3. Authenticate (dev mode)

The login page defaults to **dev-header authentication** — no real credentials needed:

1. Enter any name (e.g. "admin")
2. Optionally expand "Advanced options" to pick a role (`admin`, `records_owner`, `reviewer`, `drafter`, `worker`)
3. Click "Sign in"

This sets `X-Firmcase-Actor` and `X-Firmcase-Role` headers on all API requests. The backend accepts these in dev mode without a real token.

To use a **bearer token** instead, click "Sign in with API token" and enter a `fc_tok_*` token.

## 4. API proxy

Vite proxies all `/api/*` requests to `http://127.0.0.1:8080` (configured in `vite.config.ts`). No env vars needed for local dev.

## 5. Run tests

```bash
npm test              # 31 unit/integration tests (vitest)
npm run test:e2e      # 3 Playwright browser smoke tests (needs backend running)
npm run typecheck     # TypeScript type checking
npm run lint          # ESLint
```

## 6. Sync backend types

When the backend API changes, regenerate the TypeScript types:

```bash
npm run sync:contract      # copy OpenAPI spec from ../clerck/docs/
npm run generate:types     # regenerate src/generated/api-types.ts
```

See [BACKEND_COMPAT.md](./BACKEND_COMPAT.md) for details on contract management and the pinned backend ref.

## Key ports

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8080      |
| API docs | http://localhost:8080/docs |
