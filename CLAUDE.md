# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contract Discipline

`clerck_ui` is the canonical product frontend. The backend repo at `/Users/aksingh/clerck` owns workflow truth and HTTP contracts.

Before changing readiness, filing, export, draft approval, AI chat, job, or permission flows, read:

1. `/Users/aksingh/clerck/docs/FRONTEND_OPERATING_MODEL.md`
2. `/Users/aksingh/clerck/docs/CONTRACTS.md`
3. `docs/CONTRACTS_CONSUMER.md`
4. the relevant backend `FRONTY_*_HANDOFF.md`

Do not duplicate backend policy in React state. Prefer backend booleans, capabilities, stable readiness keys, and `ApiError.detail_code`.

Contract-sensitive work should happen on a branch, not directly on `main`.

## Build & Dev Commands

```bash
npm run dev        # Start dev server on http://localhost:5173
npm run build      # Type-check (tsc -b) then Vite production build
npm run preview    # Preview production build locally
```

No test framework is configured yet. No linter/formatter scripts exist in package.json.

## Architecture

**Clerck UI** is a legal case management and AI-assisted document drafting SPA. It's a client-only React 19 + TypeScript app built with Vite that proxies API calls to a backend at `127.0.0.1:8080`.

### Routing (TanStack Router)

All route definitions live in `src/router.tsx` (including some inline components like `InlineCreateMatter`). Routes are nested under an `AuthGuard → AppShell` root layout:

- `/clerk/$matterId` — Clerk intake flow (3-step: upload evidence → describe dispute → order documents)
- `/lawyer/$matterId` — Lawyer workspace with two modes: **review** (evidence + claims) and **draft** (multi-panel editor with AI drawer)
- `/caseloom-v2/$matterId` — IDE-style case workspace (v2 redesign of `/caseloom`)

### Data Flow

**Server state** uses TanStack Query. Custom hooks in `src/hooks/` wrap `useQuery`/`useMutation` and call typed endpoint functions from `src/api/endpoints/`. Query keys are centralized in `src/lib/query-keys.ts` for cache invalidation. Default stale time is 30 seconds.

**Client state** uses Zustand stores in `src/stores/`:
- `auth-store` — auth mode (bearer vs dev-headers), token, actor, role; persisted to localStorage
- `workspace-store` — current mode (review/draft), selected panels, settings dialog state
- `caseloom-v2-store` — dashboard filters and selection
- `theme-store` — light/dark toggle

### API Client

`src/api/client.ts` is a fetch-based HTTP client that reads auth state from `useAuthStore` to set headers. All endpoint modules in `src/api/endpoints/` export typed namespace objects (e.g., `mattersApi.list()`, `draftsApi.getSections()`).

Auth supports two modes: `bearer` (token in Authorization header) or `dev-headers` (X-Firmcase-Actor + X-Firmcase-Role headers).

### UI Layer

Components follow a shadcn-style pattern: primitives in `src/components/ui/` (built on Radix UI), composed into feature panels in `src/features/`. Styling is Tailwind CSS v4 with custom OKLch color tokens defined in `src/globals.css`. Font is DM Sans.

### Type System

All domain types live in `src/types/` (~20 files). Key enums in `src/types/enums.ts`: `MatterStatus`, `Role`, `DraftStatus`, `JobType`, `JobStatus`, `HandoffStatus`, `ArtifactKind`.

## Key Conventions

- **Path alias:** `@/*` maps to `src/*` (configured in both tsconfig and vite)
- **API pattern:** endpoint function → custom hook → component. Never call `fetch` directly from components.
- **Mutations** invalidate relevant query keys on success via `queryClient.invalidateQueries`
- **Error handling:** API errors are typed as `ApiError` with `status` and `detail_code` fields

## Domain Rules (from backend)

The backend repo (`clerck`) defines invariants the frontend must respect:

- **Matter flow:** `Intake` → `Under Review` → `Client Approved` → `Filed` (status transitions are enforced server-side)
- **Intake gate is hard:** No AI research or drafting may begin until dispute type template, mandatory context inputs, and free-text narrative are all completed. The backend returns `INTAKE_GATE_INCOMPLETE` if violated.
- **V1 required drafts:** `demand_letter`, `chronology_memo`, `exhibit_index` — these three must exist for matter completion
- **Immutable versions:** Section amendments and regenerations create new `draft_versions`, never mutate prior versions
- **Evidence drift → stale sections:** When new evidence is uploaded, impacted draft sections are marked stale. Approval is blocked until stale sections are refreshed (backend returns `STALE_SECTIONS_BLOCK_APPROVAL`)
- **Viewer collaborators** can read drafts and post section comments but cannot mutate drafts
- **Roles:** `admin`, `records_owner`, `reviewer`, `drafter`, `worker` — `drafter` is the lawyer-stage operator
- **API errors** include machine-readable `detail_code` strings (80+ codes). The frontend `ApiError` class captures these for conditional UI handling.

## Known Constraints

- `matter_class` is hardcoded to 4 values (`general_dispute`, `debt_recovery`, `employment_dispute`, `regulatory_enforcement`) — enforced by backend validation. The frontend hardcodes these in `MATTER_CLASSES` in `router.tsx`. See `BACKEND_NOTE_matter_class.md` for context.
- Vite proxy routes (`/auth`, `/matters`, `/ai-threads`, `/jobs`, `/artifacts`, etc.) are configured in `vite.config.ts` — if new backend routes are added, the proxy config must be updated.
- Backend is managed by a separate team ("backy"). The frontend is client-only and never runs backend code.
