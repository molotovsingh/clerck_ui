# Contract Consumer Guide

## Purpose

This repo is the canonical product frontend for Clerck.

The backend repo, `clerck`, owns product truth and HTTP contracts. This frontend consumes those contracts through typed endpoint wrappers, hooks, and UI adapters.

Backend source of truth:

- `/Users/aksingh/clerck/docs/FRONTEND_OPERATING_MODEL.md`
- `/Users/aksingh/clerck/docs/CONTRACTS.md`
- `/Users/aksingh/clerck/docs/FRONTY_APPROVAL_LOOP_HANDOFF.md`
- `/Users/aksingh/clerck/docs/FRONTY_CASELOOM_CHAT_HANDOFF.md`
- local OpenAPI from the running backend: `http://127.0.0.1:8080/openapi.json`

## Ownership Boundary

`clerck_ui` owns:

- routing and navigation
- layout and panel composition
- interaction design
- client-side cache invalidation
- loading, empty, and error states
- endpoint wrappers and TypeScript payload types

`clerck_ui` does not own:

- approval policy
- export eligibility
- readiness derivation
- stale-section calculation
- AI reply policy
- workflow transition truth

When the UI needs to know whether an action is allowed, prefer backend-returned booleans, capabilities, readiness checks, or `detail_code` values.

## Required Read Order

Before implementing contract-sensitive UI work, read:

1. `/Users/aksingh/clerck/docs/FRONTEND_OPERATING_MODEL.md`
2. `/Users/aksingh/clerck/docs/CONTRACTS.md`
3. the relevant `FRONTY_*_HANDOFF.md` file
4. OpenAPI from the running backend

The embedded UI in `clerck/app/web/static/lawyer` is a reference consumer, not a source of product truth.

## Implementation Rules

1. Use `src/api/endpoints/*` for HTTP calls.
2. Use `src/hooks/*` for TanStack Query integration.
3. Keep query keys in `src/lib/query-keys.ts`.
4. Update `src/types/*` when backend payloads add fields.
5. Refresh or invalidate queries after writes when backend state is authoritative.
6. Branch on stable fields such as `readiness.ready_for_court_bundle`, `readiness.checks[].key`, and `ApiError.detail_code`.
7. Do not branch on prose fields such as `detail`, `message`, or `checks[].detail`.

## Current Backend-Owned Contract Surfaces

### Approval and Filing

Use:

- `GET /matters/{matter_public_id}/readiness`
- `GET /matters/{matter_public_id}/drafts`
- `GET /matters/{matter_public_id}/drafts/required-v1`
- `POST /matters/{matter_public_id}/exports`

Rules:

- use `ready_for_court_bundle` for filing readiness
- use `ready_for_client_approval` only for client-approval readiness
- use `/drafts/required-v1` for required-document checklist rendering
- use draft `has_stale_sections` and `stale_section_count` from the backend
- prefill export approval fields from readiness when available

### AI Thread Chat

Use:

- `POST /matters/{matter_public_id}/ai-threads`
- `GET /matters/{matter_public_id}/ai-threads`
- `POST /ai-threads/{thread_public_id}/messages`
- `GET /ai-threads/{thread_public_id}/messages`

Rules:

- when no thread exists, create a thread and then post the original user message to that new thread
- posting a user message stores the user turn and creates an assistant reply in the same thread
- the message POST response returns the user message only
- invalidate/refetch thread messages after posting

## Review Checklist

Before opening or merging contract-sensitive frontend work:

1. `npm run ci` passes.
2. The work uses endpoint wrappers, not component-level `fetch`.
3. New backend fields have TypeScript types.
4. Writes invalidate the right query keys.
5. Filing uses `ready_for_court_bundle`.
6. Client approval uses `ready_for_client_approval`.
7. UI decisions do not duplicate backend policy.
8. Error-specific UI branches on `ApiError.detail_code`.

## If The Contract Is Missing Something

Do not guess in the frontend.

Record the backend gap against `clerck` with:

- endpoint
- missing field or invariant
- UI flow being blocked
- expected payload example

Then wait for an additive backend contract change.
