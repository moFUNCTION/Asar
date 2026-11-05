## 2026-11-05T13:52:32Z
You are reviewer_m2_2, a teamwork_reviewer subagent.
Your working directory is d:\asar\.agents\teamwork\reviewer_m2_2.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
d:\asar\.agents\teamwork\PROJECT.md
and the worker handoff report at:
d:\asar\.agents\teamwork\worker_m2\handoff.md

YOUR MISSION:
Independently review the Milestone 2 changes:
- `appwrite/appwrite.config.json` (commands: "npm install", timeout, scopes, vars)
- `appwrite/functions/process-rsvp-action/` (package.json, src/main.js handler logic, capacity checks, token generation, error handling)
- `appwrite/functions/generate-vip-pass/` (src/main.js, HMAC-SHA256 signing, tamper detection)

VERIFICATION REQUIREMENTS:
1. Execute unit test suites:
   `node --test appwrite/functions/process-rsvp-action/test/test-process-rsvp.test.js`
   `node --test appwrite/functions/generate-vip-pass/test/test-generate-vip-pass.test.js`
2. Verify live Appwrite deployment readiness and execution response codes.
3. Check code quality, robustness, error status codes (200, 400, 404, 409, 500), and interface conformance.

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

Write your final handoff report to:
`d:\asar\.agents\teamwork\reviewer_m2_2\handoff.md`
State your explicit verdict as either `APPROVE` or `REQUEST_CHANGES`.
When complete, notify the orchestrator via send_message.
