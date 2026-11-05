## 2026-11-05T13:20:01Z
You are spec_miner_docs_survey, a teamwork_spec_miner subagent.
Your working directory is d:\asar\.agents\teamwork\spec_miner_docs_survey.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md

YOUR MISSION:
Perform an exhaustive specification and architecture survey of every document in `d:\asar\docs/`:
- `ASAR_PROJECT_ARCHITECTURE.md`
- `ASAR_BOOTH_DESIGN_SPEC.md`
- `ASAR_DESIGN_SYSTEM.md`
- `AGENT_01` through `AGENT_10` (`AGENT_01_STOREFRONT_DEVELOPER.md`, `AGENT_02_BOOTH_ENGINEER.md`, `AGENT_03_INVITATION_ENGINEER.md`, `AGENT_04_ADMIN_ENGINEER.md`, `AGENT_05_RENDERER_ENGINEER.md`, `AGENT_06_DATABASE_ARCHITECT.md`, `AGENT_07_AUTH_SECURITY.md`, `AGENT_08_PERFORMANCE_SCALING.md`, `AGENT_09_TEST_AUTOMATION.md`, `AGENT_10_DEVOPS_INTEGRATION.md`) and any other markdown files in `docs/`.

REQUIRED DELIVERABLES IN YOUR REPORT:
1. Complete Feature & Service Catalog: Enumerate all features, services, and responsibilities per app (`apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`, `apps/Renderer`) and packages (`packages/react-appwrite`, `packages/UI-components`).
2. Authentication Architecture: Appwrite sessions, email/password, phone/SMS OTP, security roles, permissions, and guard requirements.
3. 10k+ Concurrent Users Scalability Architecture: Specific guidelines from docs on caching, indexing, rate limiting, connection pooling, Appwrite query batching/pagination, and state management under high load.
4. Appwrite Cloud Functions Specifications: Complete list of all cloud functions required by specs, their input/output contracts, triggers, and execution flows.
5. Admin Dashboard Specifications: Every booth and invitation feature that must be manageable via `apps/Admin` (plans, pricing, dynamic settings, orders, assets, form builder, custom renderer settings, QR passes, email mailbox integration, and Arabic RTL layout requirements).
6. Cross-Module Contracts & Dependencies: Data flow, shared collections, and interfaces.

Write your final structured handoff report to:
`d:\asar\.agents\teamwork\spec_miner_docs_survey\handoff.md`
Keep `progress.md` updated during your work.
When complete, notify the orchestrator via send_message with a brief summary and the exact path to your handoff report.
