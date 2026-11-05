# BRIEFING — 2026-11-05T16:57:00Z

## Mission
Implement complete and robust Appwrite Cloud Functions for Asar platform: send-rsvp-notification, sync-user-role, generate-vip-pass (persistence), check-user-exists, config updates, and ASAR_FUNCTIONS exports with full unit test coverage.

## 🔒 My Identity
- Archetype: teamwork_worker
- Roles: implementer, qa
- Working directory: d:\asar\.agents\teamwork\worker_m1_cloud_functions
- Original parent: c0cbc713-bb4b-4f5f-825c-c7aaa562056a
- Milestone: M1_CLOUD_FUNCTIONS

## 🔒 Key Constraints
- EXCLUSIVE WRITE OWNERSHIP:
  - `appwrite/functions/**/*`
  - `appwrite/appwrite.config.json`
  - `packages/react-appwrite/src/AsarDomain/collections.ts`
- Do NOT edit files in `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, or `apps/Renderer`.
- Do NOT run npm run build without reason.
- Do NOT make unnecessary scripts or code generators.
- Genuine implementation with no dummy facades or hardcoded cheat values.

## Current Parent
- Conversation ID: c0cbc713-bb4b-4f5f-825c-c7aaa562056a
- Updated: 2026-11-05T16:57:00Z

## Task Summary
- **What to build**: 
  1. Full business logic in `send-rsvp-notification` (OpenRuntimes Node 22, dual client fallback, EmailJS + Appwrite Messaging dispatch, update invitation_rsvps emailSent=true, unit tests).
  2. Full business logic in `sync-user-role` (users.*.create and direct invocations, check/create user doc in `users`, role update, `admins` team membership via teams.createMembership, unit tests).
  3. Complete `generate-vip-pass` (persist passToken & qrCodeUrl to invitation_rsvps if rsvpId provided, update unit tests).
  4. Implement reference function `check-user-exists` (node-appwrite users.list check, package.json, src/main.js, test).
  5. Update `appwrite/appwrite.config.json` (add check-user-exists, declare scopes and vars, add optional status attribute to users table).
  6. Update `packages/react-appwrite/src/AsarDomain/collections.ts` (export CHECK_USER_EXISTS in ASAR_FUNCTIONS).
  7. Verification: Run `node --test appwrite/functions/*/test/*.test.js`.
- **Success criteria**: All 5 functions fully implemented and tested with 100% test passing; config updated cleanly; collections.ts updated; no regressions.

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: None

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Key Decisions Made
- [TBD]

## Artifact Index
- DISPATCH.md — dispatch message and constraints
- BRIEFING.md — persistent working memory
- progress.md — task progress heartbeat
- handoff.md — final handoff report
