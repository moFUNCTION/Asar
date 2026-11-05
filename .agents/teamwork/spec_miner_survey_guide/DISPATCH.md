# Dispatch Assignment: Repository Architecture & Agent Guide Specification

## Identity & Role
- Agent Name: `spec_miner_survey_guide`
- Role: Read-only specification investigator (`teamwork_spec_miner`)
- Working Directory: `d:\asar\.agents\teamwork\spec_miner_survey_guide`

## Mandate & Scope
Perform an exhaustive architectural and structural mapping of the entire ASAR repository to produce the definitive blueprint and specification for `docs/AGENT_GUIDE.md`.
The guide must document every part of the repository—including system architecture, application boundaries, shared packages, data flows, routing models, state management, testing conventions, and development practices—so future agents can continue work cleanly without conflicts.

## Required References to Read
1. `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY - read first)
2. `docs/ASAR_PROJECT_ARCHITECTURE.md`
3. Monorepo root files: `package.json`, `turbo.json`, `pnpm-workspace.yaml` / workspaces configuration, `tsconfig.json`
4. All application structures:
   - `apps/Admin` (structure, routes, dependencies, state management)
   - `apps/Booth` (structure, routes, dependencies, audio/memory subsystems)
   - `apps/Invitation` (structure, routes, dynamic section renderer)
   - `apps/Main` (structure, routes, client portal)
   - `apps/Renderer` (structure, subdomain detection, rendering pipeline)
5. Shared packages:
   - `packages/react-appwrite` (domain models, Appwrite integration, collections, services)
   - `packages/UI-components` (shared luxury UI components)
   - `packages/eslint-config`, `packages/typescript-config`

## Concrete Investigation Tasks
1. Map complete Monorepo Architecture:
   - Dependency graph between apps and packages.
   - Build and dev workflows (Turborepo pipeline, caching, scripts).
   - Package manager and workspace conventions.
2. Define Application Boundaries & Responsibilities:
   - Exact purpose, scope, route table, entry points, and write boundaries for each app.
   - Rules preventing cross-app leakage or conflicting file edits.
3. Trace End-to-End Data Flows:
   - Invitation creation -> Admin configuration -> Subdomain resolution -> Client viewing -> RSVP submission -> Notification/Mailbox.
   - Booth booking -> Memory generation -> Audio/photo aggregation -> Client viewing & download.
   - Backend service layer (Appwrite collections, buckets, authentication, mock/offline fallback mode).
4. Establish Conflict-Prevention & Agent Onboarding Protocols:
   - File ownership rules for multi-agent workflows.
   - Safe verification practices (avoiding unnecessary `npm run build`, linting conventions, test runners).
   - TypeScript standards, error handling patterns, and coding guidelines.
5. Produce a comprehensive specification for `docs/AGENT_GUIDE.md`.

## Constraints
- Strictly READ-ONLY. Do NOT modify source code or tests.
- Produce a structured handoff report at `d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md` and `handoff.md`.

## 2026-11-04T22:14:36Z
You are spec_miner_survey_guide, a read-only specification investigator.
Your working directory is d:\asar\.agents\teamwork\spec_miner_survey_guide.
You MUST read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting your work.
Also read d:\asar\.agents\teamwork\spec_miner_survey_guide\DISPATCH.md and docs/ASAR_PROJECT_ARCHITECTURE.md.

Your mission:
Perform an exhaustive architectural and structural mapping of the entire ASAR repository to produce the definitive blueprint and specification for docs/AGENT_GUIDE.md.
Investigate:
1. Complete monorepo architecture: Root configuration (package.json, turbo.json, pnpm-workspace.yaml, tsconfig), package dependencies, build pipelines, caching.
2. Application boundaries & responsibilities: Exact purpose, routes, components, and file write boundaries for Admin, Booth, Invitation, Main, Renderer.
3. Shared packages: packages/react-appwrite, packages/UI-components, tooling configs.
4. End-to-end data flows: Invitation creation/management -> Subdomain resolution -> Client viewing -> RSVP submission -> Mailbox. Booth booking -> Memory generation -> Audio/photo aggregation -> Client viewing & download.
5. Future agent guidelines: Conflict-prevention rules, file ownership, safe verification (avoiding unnecessary `npm run build`), TypeScript standards, ESLint practices.

Do NOT modify any code or tests.
Produce your detailed blueprint at d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md and deliver your handoff.md.
When finished, notify me with send_message.
