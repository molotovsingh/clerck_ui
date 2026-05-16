# Clerck UI, In Plain English

`clerck_ui` is the main product frontend for CaseLoom.

If `clerck` is the legal operations engine, `clerck_ui` is the cockpit. It is where a lawyer logs in, opens a matter, inspects evidence, talks to the AI assistant, reviews drafts, tracks readiness, and prepares the next action.

The key thing to understand: this repo should feel powerful, but it should not become the source of legal/workflow truth. The backend owns the rules. The frontend owns the experience.

## The Job Of This Repo

This app is a React + TypeScript single-page application built with Vite.

It does not run the legal workflow itself. It consumes backend HTTP contracts from `/Users/aksingh/clerck`.

The clean split is:

- `clerck` decides what is true.
- `clerck_ui` decides how that truth is shown and operated.

For example:

- Backend says whether a court bundle can be exported.
- Frontend shows the blocker, progress, button state, and next step.
- Backend says whether sections are stale.
- Frontend helps the user jump to the stale sections.
- Backend creates AI assistant replies.
- Frontend sends the user message and refetches the thread.

This sounds simple, but it is the difference between a maintainable outsourced frontend and a frontend that quietly forks the product.

## Codebase Map

The important folders are:

- `src/api/` contains typed endpoint wrappers. This is where HTTP calls should live.
- `src/hooks/` wraps those endpoints with TanStack Query. This is where fetching, mutation, and invalidation patterns belong.
- `src/types/` contains TypeScript shapes for backend payloads.
- `src/lib/query-keys.ts` centralizes cache keys.
- `src/stores/` contains Zustand client-state stores for auth, workspace state, theme, and CaseLoom shell state.
- `src/components/ui/` contains reusable UI primitives.
- `src/features/` contains product surfaces such as lawyer workspace, CaseLoom, filing wizard, AI panels, and status panels.
- `src/router.tsx` wires app routes together.
- `vite.config.ts` configures local dev proxying to the backend at `127.0.0.1:8080`.
- `docs/CONTRACTS_CONSUMER.md` is the frontend-side contract playbook.
- `CLAUDE.md` is the operating guide for Claude/fronty agents.

The frontend path should be:

```text
backend contract -> src/types -> src/api/endpoints -> src/hooks -> feature component
```

Avoid this path:

```text
component -> fetch -> guessed JSON -> local policy
```

That second path is how frontend/backend drift starts.

## Main Product Surfaces

### Home and shell

The app shell handles navigation and authentication. It supports dev-header auth for local work and bearer-token auth for staged/shared environments.

Local dev-header auth sends:

- `X-Firmcase-Actor`
- `X-Firmcase-Role`

Bearer auth sends:

- `Authorization: Bearer <token>`

### Clerk intake flow

The clerk-side flow is about creating or preparing a matter: evidence upload, dispute description, and intake structure.

### Lawyer workspace

The lawyer workspace is about reviewing matter material, drafts, readiness, filing, comments, and approval loop ergonomics.

This is where backend contract discipline is most important. Approval/export readiness must come from backend fields, not local frontend heuristics.

### CaseLoom IDE

CaseLoom is the more ambitious workspace. It feels like a case file explorer plus AI drafting cockpit:

- left side: matter files, sources, working outputs
- center: document or selected work surface
- right side: AI Legal Assistant chat
- status line: branch/matter-like context

The CaseLoom chat panel uses the backend AI thread contract:

1. create/list threads through `/matters/{matter_public_id}/ai-threads`
2. post messages through `/ai-threads/{thread_public_id}/messages`
3. refetch messages after posting

The message POST returns the user message only. The assistant reply is stored separately by the backend and appears after refetch.

## Local Development

Start the backend first:

```bash
cd /Users/aksingh/clerck
make run
```

Then start the frontend:

```bash
cd /Users/aksingh/clerck_ui
npm run dev -- --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:5173
```

Vite proxies API paths to:

```text
http://127.0.0.1:8080
```

If a new backend route is added and the frontend calls it during dev, check `vite.config.ts`. The route prefix may need to be added to the proxy list.

## Verification

Current repo gate:

```bash
npm run ci
```

Today this aliases:

```bash
npm run build
```

That means TypeScript build and Vite production build are the current hard checks. There is not yet a test runner or lint script in `package.json`.

## Contract Discipline

Before changing readiness, approval, filing, export, AI chat, jobs, permissions, or draft status UI, read:

- `/Users/aksingh/clerck/docs/FRONTEND_OPERATING_MODEL.md`
- `/Users/aksingh/clerck/docs/CONTRACTS.md`
- `docs/CONTRACTS_CONSUMER.md`
- the relevant `/Users/aksingh/clerck/docs/FRONTY_*_HANDOFF.md`

The most important rule:

Do not duplicate backend workflow decisions in React.

The frontend may display backend state, summarize it, cache it, and arrange it beautifully. It should not invent its own approval policy or export logic.

## Recent Lessons

### First chat message bug

CaseLoom chat originally had a dangerous interaction bug: the first send could create a thread but fail to post the typed message. From a user perspective, it looked like the app ignored them.

The correct flow is:

1. If there is no selected thread, create one.
2. Immediately post the original user text to that new thread.
3. Refetch messages.
4. Render both user and assistant turns.

This is a classic frontend async bug: state update and network workflow are not the same thing. Creating a thread is not the same as sending a message.

### The backend response shape matters

`POST /ai-threads/{thread_public_id}/messages` returns the created user message. It does not return the assistant reply. The assistant reply is available after message-list refetch.

If a component assumes the POST response includes everything, the UI will feel broken even if the backend is correct.

### Stubs prove plumbing, not intelligence

Stub-mode AI replies are useful for proving the chat flow. They do not prove legal usefulness.

Provider-mode testing is still required for quality, cost, latency, and prompt behavior. The latest smoke showed provider wiring reaches OpenAI, but the active key/account returned `429 Too Many Requests`.

## Good Frontend Engineering In This Repo

Good frontend work here means:

- preserve backend truth boundaries
- use typed API wrappers
- invalidate the right query keys after mutations
- render backend blockers clearly
- keep empty/error/loading states honest
- avoid hidden local policy
- keep visual polish without breaking contract discipline

For outsourced or agent-managed frontend work, the docs are not bureaucracy. They are the interface between teams.

When fronty is disciplined, backend and frontend can move independently. When fronty guesses, every feature becomes a reconciliation meeting.

## Current Known State

As of the latest local smoke:

- `clerck_ui/main` builds successfully.
- `clerck/main` CI is green.
- CaseLoom chat works locally in stub mode against a real Mehta/Skyline test matter.
- Provider-mode assistant generation is blocked by OpenAI `429 Too Many Requests` on the current key/account.
- Existing local fronty source edits are present in the workspace and should not be overwritten casually.

