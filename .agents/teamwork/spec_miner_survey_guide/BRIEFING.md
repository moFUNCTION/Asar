# BRIEFING — 2026-11-04T22:23:00Z

## Mission
Perform an exhaustive architectural and structural mapping of the entire ASAR repository to produce the definitive blueprint and specification for docs/AGENT_GUIDE.md.

## 🔒 My Identity
- Archetype: teamwork_spec_miner
- Roles: Specification Miner, Architecture Investigator
- Working directory: d:\asar\.agents\teamwork\spec_miner_survey_guide
- Original parent: a430ae53-2fe7-48fd-ac1e-0455ee026f23
- Milestone: Architectural Mapping & Agent Guide Specification

## 🔒 Key Constraints
- Strictly READ-ONLY: Do NOT modify any application or package code, tests, or configurations.
- Adhere to user rule: Do not run `npm run build` unnecessarily; do not create ad-hoc scripts or code generators unless strictly needed.
- Write artifacts ONLY within d:\asar\.agents\teamwork\spec_miner_survey_guide.
- Deliver blueprint at d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md and handoff.md.
- Notify parent agent (a430ae53-2fe7-48fd-ac1e-0455ee026f23) with send_message upon completion.

## Current Parent
- Conversation ID: a430ae53-2fe7-48fd-ac1e-0455ee026f23
- Updated: 2026-11-04T22:23:00Z

## Task Summary
- **What to build**: Blueprint and specification document for `docs/AGENT_GUIDE.md`.
- **Success criteria**: Exhaustive mapping covering Monorepo architecture, application boundaries (Admin, Booth, Invitation, Main, Renderer), shared packages, end-to-end data flows, and conflict-prevention/agent onboarding protocols.
- **Interface contracts**: `docs/ASAR_PROJECT_ARCHITECTURE.md`, `ORIGINAL_REQUEST.md`, `DISPATCH.md`.
- **Code layout**: Root monorepo at `d:\asar`, `apps/*`, `packages/*`.

## Key Decisions Made
- Mapped all 5 applications (`Admin`, `Booth`, `Invitation`, `Main`, `Renderer`) and their port assignments (3001, 3002, 3003, 3000, 3004).
- Mapped all 5 packages (`react-appwrite`, `UI-components`, `assets-shared`, `typescript-config`, `eslint-config`).
- Traced both complete end-to-end lifecycles: Invitation (Booking -> Studio -> Subdomain Resolution -> Client Viewing -> RSVP -> Mailbox -> EmailJS -> Scanner) and Booth (Booking -> 7-Stage Pipeline -> Bulk Voice Studio -> Waveforms -> Memory Website -> Download).
- Formulated strict future agent guidelines: safe verification via targeted `tsc --noEmit` and `npx tsx` (avoiding expensive `npm run build`), file ownership boundaries, Chakra UI v3 recipes, and zero-stub policy.
- Completed definitive specification at `agent_guide_spec.md`.

## Artifact Index
- `d:\asar\.agents\teamwork\spec_miner_survey_guide\DISPATCH.md` — Dispatch mandate and instructions
- `d:\asar\.agents\teamwork\spec_miner_survey_guide\BRIEFING.md` — Situational awareness and identity
- `d:\asar\.agents\teamwork\spec_miner_survey_guide\progress.md` — Liveness heartbeat and milestone tracking
- `d:\asar\.agents\teamwork\spec_miner_survey_guide\agent_guide_spec.md` — Full blueprint and specification for AGENT_GUIDE.md
- `d:\asar\.agents\teamwork\spec_miner_survey_guide\handoff.md` — 5-component handoff report
