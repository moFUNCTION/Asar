# Milestone 5: Automated Testing Suite (Unit & Integration)

## Context
You are a test writer implementing Milestone 5 of the ASAR monorepo update.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

## Exclusive Write Ownership
You own and may ONLY edit files within:
`apps/Renderer/test/*`

## Objectives
1. Implement comprehensive automated unit and integration tests under `apps/Renderer/test/`:
   - `apps/Renderer/test/subdomainResolution.test.ts`:
     - Test 4-tier resolution hierarchy (query param > route param > RFC 6761 `*.localhost` hostname > fallback).
     - Test bare apex detection (`localhost:3004`, `127.0.0.1:3004`) resulting in null subdomain (Showcase Portal trigger).
     - Test reserved system subdomains (`admin`, `api`, `auth`, `main`, etc.) resulting in rejection / 404.
     - Test RFC 1123 slug validation boundary cases.
   - `apps/Renderer/test/memoryClassifier.test.ts`:
     - Test conditional classification into Booth Memory vs Invitation Memory.
     - Test preset resolution: `"mina-and-maryam"` -> Booth, `"omar-and-layla"` -> Invitation.
     - Test cache integration: finding records in `ASAR_CACHE_KEYS.BOOTH_MEMORIES` and `ASAR_CACHE_KEYS.INVITATIONS` via `cacheHelper`.
     - Test route/prefix heuristics (`/booth/`, `/memory/`, `/m/`, `/invitation/`, `/event/`, `/e/`, `/s/`).
     - Test unknown slugs returning null / 404.
   - `apps/Renderer/test/storefrontRouting.test.ts`:
     - Test React Router navigation paths: `/`, `/s/:slug`, `/booth/:slug`, `/invitation/:slug`, `/pass/:rsvpId`, and catch-all `*`.
     - Test VIP Pass token resolution and route parameter extraction.
2. Execution & Verification:
   - Run: `node --experimental-strip-types --test apps/Renderer/test/*.test.ts` (or `npx tsx --test apps/Renderer/test/*.test.ts`).
   - Run all existing monorepo unit tests:
     - `node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts`
     - `node --experimental-strip-types --test packages/react-appwrite/test/domain.test.ts`
     - `node --experimental-strip-types --test apps/Admin/test/formSchemaValidation.test.ts`
     - `node --experimental-strip-types --test apps/Admin/test/filenameParser.test.ts`
     - `node --experimental-strip-types --test apps/Invitation/test/dynamicRsvpFormValidation.test.ts`
   - Run `npx tsc --noEmit -p apps/Renderer/tsconfig.json` to verify 0 type errors.
   - User Rule: DO NOT run `npm run build` without reason. Use `tsc --noEmit` and test commands.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your completion report to `d:\asar\.agents\teamwork\worker_milestone_5\handoff.md` and send a message back.

## 2026-11-03T23:01:16Z
[Message] timestamp=2026-11-03T23:01:16Z sender=5b9b91d8-2ae1-48a5-9c39-c7909b1a52d5 priority=MESSAGE_PRIORITY_HIGH content=You are worker_milestone_5 (Role: Renderer Test Suite Writer).
Your working directory is d:\asar\.agents\teamwork\worker_milestone_5\
MANDATORY: Read ORIGINAL_REQUEST.md at d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md and task instructions in d:\asar\.agents\teamwork\worker_milestone_5\DISPATCH.md before starting work.
Scope document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md
