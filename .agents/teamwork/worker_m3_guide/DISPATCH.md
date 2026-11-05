# Worker Dispatch: Milestone 3 — Comprehensive Agent Onboarding Guide (`docs/AGENT_GUIDE.md`)

## Mandate
Create `docs/AGENT_GUIDE.md` documenting every part of the repository—including system architecture, application boundaries, shared packages, data flows, routing models, testing conventions, and development practices—so future agents can continue work cleanly without conflicts.

## Required References (Read First)
1. `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY)
2. `d:\asar\.agents\teamwork\orchestrator\PROJECT.md`
3. `d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md` (Definitive blueprint and specification for `docs/AGENT_GUIDE.md`)
4. `d:\asar\.agents\teamwork\spec_miner_survey_guide\handoff.md`

## Exclusive File Ownership (Write Boundaries)
You EXCLUSIVELY own and may create/modify ONLY this file:
- `docs/AGENT_GUIDE.md`

## Implementation Tasks
1. Follow the comprehensive structure laid out in `d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md`:
   - Monorepo Overview & High-Level Architecture (Turborepo, package manager, port topology: Main 3000, Admin 3001, Booth 3002, Invitation 3003, Renderer 3004).
   - Application Boundaries & File Ownership Map (Table of apps, responsibilities, entry points, route trees, and strict isolation rules).
   - Shared Packages Reference (`@repo/react-appwrite`, `@repo/ui-components`, `@repo/assets-shared`, typescript/eslint configs).
   - 4-Tier Subdomain Dynamic Storefront Engine (Query override, route param, hostname subdomain, fallback; RFC 6761 `*.localhost` local multi-tenancy; reserved subdomains; URL generators).
   - End-to-End Data Flows:
     - Flow 1: Invitation Lifecycle (Admin configuration -> sectionsConfigJson -> Subdomain resolution -> Modular dispatcher -> RSVP submission -> VIP Pass -> Mailbox).
     - Flow 2: Booth Audio Guestbook Lifecycle (Admin setup -> Bulk audio dropzone -> smart filename parser -> 48-peak waveform calculation -> Subdomain resolution -> Interactive telephone chime & playback -> Photo gallery).
   - Conflict-Prevention Rules for Multi-Agent Workflows (Exclusive file ownership, interface contract-first rule, no direct cross-app imports).
   - Safe Verification Practices (Crucial user rule: DO NOT over-run `npm run build`; use targeted typechecking via `tsc --noEmit -p apps/<App>/tsconfig.app.json` and fast test execution via `npx tsx --test <test_path>`).
   - Coding Standards, TypeScript Guidelines & ASAR Warm Vintage Editorial Luxury Design Tokens.

## Constraints & Mandatory Warnings
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULE: Do not over-run `npm run build` without any reason, and do not make scripts or code generators without reason.

## Verification
- Verify that `docs/AGENT_GUIDE.md` exists and contains all required sections.
- Ensure all file paths, port numbers, package names, and test commands documented in the guide are 100% accurate.
- Write your completion handoff report to `d:\asar\.agents\teamwork\worker_m3_guide\handoff.md`.


## 2026-11-04T22:29:37Z
You are worker_m3_guide, a teamwork_worker implementation agent.
Your working directory is d:\asar\.agents\teamwork\worker_m3_guide.
You MUST read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting your work.
Read d:\asar\.agents\teamwork\worker_m3_guide\DISPATCH.md, d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md, and docs/ASAR_PROJECT_ARCHITECTURE.md for full technical details.

Your mission:
Implement Milestone 3: Comprehensive Agent Onboarding Guide (docs/AGENT_GUIDE.md).
Create docs/AGENT_GUIDE.md following the complete, exhaustive blueprint in d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md.
Document every part of the repository:
- Architectural overview & monorepo dependency graph
- Application boundaries, route trees, entry points, and write isolation rules for Admin, Booth, Invitation, Main, Renderer
- Shared packages (@repo/react-appwrite, @repo/ui-components, @repo/assets-shared)
- 4-Tier Subdomain Dynamic Storefront Engine, RFC 6761 local multi-tenancy (*.localhost), reserved subdomains
- End-to-end data flows (Invitation lifecycle and Booth audio guestbook lifecycle)
- Multi-agent conflict prevention rules & file ownership standards
- Safe verification practices (CRITICAL: DO NOT over-run npm run build; use targeted tsc --noEmit and npx tsx --test)
- Coding standards, TypeScript rules, and ASAR Warm Vintage Editorial luxury design tokens

Exclusive file ownership: ONLY touch docs/AGENT_GUIDE.md.
MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
USER RULE: Do not over-run npm run build without reason, do not make scripts or code generators without reason.

Verify that docs/AGENT_GUIDE.md is complete, highly detailed, and matches live repo paths and commands.
Deliver your handoff report to d:\asar\.agents\teamwork\worker_m3_guide\handoff.md and notify me via send_message.
