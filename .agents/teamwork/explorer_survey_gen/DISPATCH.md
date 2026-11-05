# Dispatch Assignment: Generation Stability & Workflow Audit

## Identity & Role
- Agent Name: `explorer_survey_gen`
- Role: Read-only exploration agent (`teamwork_explorer`)
- Working Directory: `d:\asar\.agents\teamwork\explorer_survey_gen`

## Mandate & Scope
Perform an in-depth audit of Invitation and Booth memory generation workflows across the entire ASAR monorepo (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`, and `packages/*`).
Assess production readiness, reliability, state synchronization, edge-case resilience, resource/memory constraints, and test coverage (including the existing 144+ unit and stress tests).

## Required References to Read
1. `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY - read first)
2. `docs/ASAR_PROJECT_ARCHITECTURE.md`
3. Monorepo codebase:
   - `apps/Booth/src/components/memory/*`, `apps/Booth/src/hooks/*`, `apps/Booth/src/services/*`
   - `apps/Invitation/src/components/*`, `apps/Invitation/src/pages/*`, `apps/Invitation/src/hooks/*`
   - `apps/Admin/src/components/invitation-studio/*`, `apps/Admin/src/components/plans/*`
   - `apps/Renderer/src/*` (or dynamic memory renderer implementation)
   - `packages/react-appwrite/src/*` and test suites across the monorepo (`packages/react-appwrite/test/*`, `apps/*/test/*` or `apps/*/__tests__/*`)

## Concrete Investigation Tasks
1. Map the complete generation lifecycle for Invitations:
   - Template/section configuration, data hydration, dynamic preview, pass generation (QR code/pass rendering), export/saving, and error boundaries.
   - Standard and edge-case inputs (empty sections, oversized payloads, unicode/RTL Arabic characters, missing images/audio, invalid subdomains).
2. Map the complete generation lifecycle for Booth Memories:
   - Voice/audio capture, playback processing, photo gallery generation, video highlights, memory timeline compilation, memory export/rendering.
   - Resource management (memory leaks, unbounded event listeners, blob URL cleanup, canvas/media resource disposal).
3. Investigate the existing repository test suite:
   - Locate and catalog all existing tests (144+ unit and stress tests).
   - Identify test commands (e.g. `npm test`, vitest, jest) without running excessive builds.
   - Identify any gaps or flaky areas in generation workflows.
4. Detail concrete failure modes, crash risks, or state desynchronization points.

## Constraints
- Strictly READ-ONLY. Do NOT modify source code or tests.
- Do NOT run `npm run build` without clear necessity.
- Produce a structured handoff report at `d:\asar\.agents\teamwork\explorer_survey_gen\generation_stability_audit.md` and `handoff.md`.


## 2026-11-04T22:14:27Z
Received message from a430ae53-2fe7-48fd-ac1e-0455ee026f23:
You are explorer_survey_gen, a read-only exploration agent.
Your working directory is d:\asar\.agents\teamwork\explorer_survey_gen.
You MUST read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting your work.
Also read d:\asar\.agents\teamwork\explorer_survey_gen\DISPATCH.md for your complete mandate.

Your mission:
Audit Invitation and Booth memory generation across the workspace apps (Admin, Booth, Invitation, Main, Renderer) for production readiness and stability.
Investigate:
1. Invitation generation lifecycle, template configuration, dynamic preview, pass rendering, export, error handling, standard and edge cases (empty sections, oversized payloads, RTL Arabic text, missing media, invalid subdomains).
2. Booth memory generation lifecycle, voice/audio capture, playback processing, photo gallery generation, video highlights, memory timeline, resource management (memory leaks, unbounded event listeners, blob URL cleanup, canvas/media disposal).
3. Test suite audit: Locate all 144+ unit and stress tests in the repo, catalog test suites, identify commands to run them cleanly without running unnecessary `npm run build`.
4. Identify concrete failure modes, crash risks, or state desynchronization points.

Do NOT modify any code or tests.
Produce your detailed audit at d:\asar\.agents\teamwork\explorer_survey_gen\generation_stability_audit.md and deliver your handoff.md.
When finished, notify me with send_message.
