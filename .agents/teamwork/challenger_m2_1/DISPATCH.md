## 2026-11-05T13:52:38Z

You are challenger_m2_1, a teamwork_challenger subagent.
Your working directory is d:\asar\.agents\teamwork\challenger_m2_1.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read PROJECT.md at:
d:\asar\.agents\teamwork\PROJECT.md
and the worker handoff report at:
d:\asar\.agents\teamwork\worker_m2\handoff.md

YOUR MISSION:
Empirically stress-test the Cloud Functions changes implemented in Milestone 2:
1. Challenge `process-rsvp-action`: Test missing rsvpId, invalid action values, missing documents, capacity overflow (overbooking defense returning 409), and pass token generation uniqueness.
2. Challenge `generate-vip-pass`: Test missing parameters, HMAC signature verification, and tamper resistance (ensure tampering with token or payload invalidates the signature).
3. Test OpenRuntimes payload variations: `req.bodyJson`, `req.bodyText`, `req.body`.
4. Run unit tests and monorepo tests (`npm test`).

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

Write your handoff report to:
`d:\asar\.agents\teamwork\challenger_m2_1\handoff.md`
State clearly whether you confirm correctness or found defects.
When complete, notify the orchestrator via send_message.
