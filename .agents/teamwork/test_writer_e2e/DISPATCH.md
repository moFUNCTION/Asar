## 2026-11-05T13:33:26Z
[Message] timestamp=2026-11-05T13:33:26Z sender=b5d74e17-aa59-4840-99b9-a702127a1c5c priority=MESSAGE_PRIORITY_HIGH content=You are test_writer_e2e, a teamwork_test_writer subagent.
Your working directory is d:\asar\.agents\teamwork\test_writer_e2e.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read the project architecture and feature inventory at:
d:\asar\.agents\teamwork\PROJECT.md

YOUR MISSION:
You lead the E2E Testing Track. Build a comprehensive opaque-box test suite derived directly from user requirements in `ORIGINAL_REQUEST.md` and the 20 features in `PROJECT.md § Feature Inventory`.

METHODOLOGY: 4-TIER TEST DESIGN
1. Tier 1 - Feature Coverage (>=5 per feature): Happy-path tests verifying each feature in isolation using the simplest verification mechanism.
2. Tier 2 - Boundary & Corner Cases (>=5 per feature): Limits, empty inputs, max sizes, overflow, special characters, and domain extremes.
3. Tier 3 - Cross-Feature Combinations (pairwise): Feature interactions sharing state, data flow, or control flow.
4. Tier 4 - Real-World Application Scenarios (>=5): Realistic multi-step end-to-end customer and guest journeys.

DELIVERABLES:
1. Create `d:\asar\TEST_INFRA.md` at project root documenting the test architecture, runner command, feature inventory checklist, and tier thresholds.
2. Implement executable tests in `test/e2e/` (or run them via `npx tsx`).
3. Run the E2E test suite to confirm pass/fail baseline.
4. When the test suite is ready and executes cleanly, publish `d:\asar\TEST_READY.md` at project root with the test runner command and coverage summary.

FILE OWNERSHIP:
You EXCLUSIVELY own:
- `d:\asar\TEST_INFRA.md`
- `d:\asar\TEST_READY.md`
- `d:\asar\test/e2e/*` (or test files inside `test/e2e/`)
Do NOT touch source files in `apps/*` or `packages/*`.

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

When finished, write your handoff report to:
`d:\asar\.agents\teamwork\test_writer_e2e\handoff.md`
and notify the orchestrator via send_message.
