# Backend Contract

This frontend consumes the **firmcase-os** backend API.

## Repositories

| Repo | Location | Port |
|------|----------|------|
| Backend (`clerck`) | `../clerck` | 8080 |
| Frontend (`clerck_ui`) | this repo | 5173 |

## Contract Source

The backend generates a filtered OpenAPI spec at `docs/frontend-openapi.json`
(excludes worker-internal routes). Regenerate it with:

```bash
cd ../clerck && make frontend-openapi
```

## Syncing Types

```bash
npm run sync:contract      # copies ../clerck/docs/frontend-openapi.json → contracts/
npm run generate:types     # generates src/generated/api-types.ts via openapi-typescript
npm run check:contract     # CI guard — regenerates and fails if output differs
```

To pull from a running backend instead (manual convenience only):

```bash
npm run sync:contract:live   # GET http://localhost:8080/api/v1/openapi-frontend.json
npm run generate:types
```

## Expected Backend Ref

<!-- Update this each time you run sync:contract -->
**clerck commit**: `7124c74` — `docs(web): mark native ui as legacy`

## API Base / Dev Proxy

In development, Vite proxies all `/api` requests to `http://127.0.0.1:8080`
(configured in `vite.config.ts`). No `VITE_API_BASE` env var is needed for
local dev. The API client at `src/api/client.ts` prepends `/api/v1` to all
endpoint paths; the proxy transparently forwards them to the backend.
