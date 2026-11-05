# Milestone 1: Shared Storefront Engine & URL Alignment

## Context
You are a worker implementing Milestone 1 of the ASAR monorepo update.
Original Request: d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Scope Document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

## Exclusive Write Ownership
You own and may ONLY edit files within:
`packages/react-appwrite/src/Storefront/*`
`packages/react-appwrite/test/*`

## Objectives
1. In `packages/react-appwrite/src/Storefront/urlBuilder.ts`:
   - Update `BuildMemoryUrlsParams` to accept optional `rendererPort?: number` (defaulting to 3004).
   - Update `MemoryUrls` interface to include `devRendererUrl: string` (e.g., `http://${slug}.localhost:${rendererPort || 3004}`).
   - Ensure existing properties (`canonicalUrl`, `devLocalhostUrl`, `devQueryUrl`, `isSubdomain`, `primaryUrl`) remain 100% backward compatible.
2. In `packages/react-appwrite/src/Storefront/cacheHelper.ts` (create if needed):
   - Implement safe JSON cache normalization helper for `localStorage` caches (`asar_booth_memories_cache`, `asar_invitations_cache`).
   - Defensively handle both single-object and array schemas so callers can reliably retrieve arrays of records.
   - Export this helper from `packages/react-appwrite/src/Storefront/index.ts` and `packages/react-appwrite/src/index.ts`.
3. In `packages/react-appwrite/test/storefront.test.ts`:
   - Update/add test cases verifying `rendererPort` and `devRendererUrl` generation.
   - Verify cache normalization helper.
4. Verification:
   - Run: `node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts` (must pass 100%).
   - Run: `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json` (must exit 0 with 0 errors).
   - User Rule: DO NOT run `npm run build` without reason. Use `tsc --noEmit` and test commands.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Deliverable
Write your completion report to `d:\asar\.agents\teamwork\worker_milestone_1\handoff.md` and send a message back.


## 2026-11-03T22:15:32Z
You are worker_milestone_1 (Role: Storefront Engine Worker).
Your working directory is d:\asar\.agents\teamwork\worker_milestone_1\
MANDATORY: Read ORIGINAL_REQUEST.md at d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md and task instructions in d:\asar\.agents\teamwork\worker_milestone_1\DISPATCH.md before starting work.
Scope document: d:\asar\.agents\teamwork\orchestrator_1\PROJECT.md

Exclusive Write Ownership:
`packages/react-appwrite/src/Storefront/*`
`packages/react-appwrite/test/*`

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Implement Milestone 1:
1. Update `packages/react-appwrite/src/Storefront/urlBuilder.ts` to support `rendererPort?: number` (default 3004) and `devRendererUrl` (`http://${slug}.localhost:${rendererPort || 3004}`). Preserve backward compatibility.
2. Add cache normalization helper in `packages/react-appwrite/src/Storefront/cacheHelper.ts` to defensively parse `asar_booth_memories_cache` and `asar_invitations_cache` (single object vs array).
3. Export from `Storefront/index.ts` and `src/index.ts`.
4. Update unit tests in `packages/react-appwrite/test/storefront.test.ts` to test these additions.
5. Verify `node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts` passes 100% and `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json` exits 0.
User rule: DO NOT over run npm run build without reason. Do not make scripts or code generators unless needed.

Write handoff to d:\asar\.agents\teamwork\worker_milestone_1\handoff.md and send a message back when complete.
