## 2026-11-05T13:33:51Z
You are worker_m2, a teamwork_worker subagent.
Your working directory is d:\asar\.agents\teamwork\worker_m2.
All your metadata, progress, and reports MUST be written to your working directory.

MANDATORY FIRST STEP:
Read the authoritative user request at:
d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md
Also read the project architecture at:
d:\asar\.agents\teamwork\PROJECT.md
and the survey findings at:
d:\asar\.agents\teamwork\explorer_functions_survey\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR MISSION (Milestone 2: Appwrite Cloud Functions Implementation & Verification):
1. Fix `appwrite/appwrite.config.json`:
   - On `process-rsvp-action`, change `"commands": ""` to `"commands": "npm install"`.
   - Ensure timeout, scopes, and environment variables are properly defined.
2. In `appwrite/functions/process-rsvp-action/`:
   - Run `npm install` inside `appwrite/functions/process-rsvp-action/` so `node-appwrite` and dependencies are properly resolved.
   - Refactor/enhance `src/main.js` to implement complete, production-ready handler logic:
     - Input validation: `rsvpId`, `action` ("approve" | "decline"), `rejectionReason`.
     - Read existing RSVP document from `asar-db.invitation_rsvps`.
     - If "approve": check venue capacity against maxVenueCapacity (atomic check), generate high-entropy pass token (`VIP-XXXX-YYYY`), generate QR checkin URL, update document with `status: "approved"`, `passToken`, `qrCodeUrl`, `respondedAt`.
     - If "decline": update document with `status: "declined"`, `rejectionReason`, `respondedAt`.
     - Robust error handling returning standardized JSON responses and proper HTTP status codes (200 for success, 400 for bad input, 404 for not found, 409 for capacity exceeded, 500 for server error).
3. In `appwrite/functions/generate-vip-pass/`:
   - Verify `src/main.js` generates HMAC-SHA256 signature, validates `rsvpId` and `guestName`, and returns the signed pass token payload.
4. Testing & Verification:
   - Test both functions locally using Node with mock requests.
   - Test execution against the live Appwrite instance (project `6ad1c66c0017b63ab8cc` in `.env`) or via Appwrite MCP tools (`functions_create_execution`). Verify both return HTTP 200.
   - Run monorepo test suite: `npm test`.

FILE OWNERSHIP:
You EXCLUSIVELY own:
- `d:\asar\appwrite/appwrite.config.json`
- `d:\asar\appwrite/functions/process-rsvp-action/*`
- `d:\asar\appwrite/functions/generate-vip-pass/*`
Do NOT modify files in `apps/*` or `packages/*`.

USER RULES:
- Do NOT over run `npm run build` without any reason.
- Do NOT make unnecessary scripts or code generators.

When finished, write your handoff report to:
`d:\asar\.agents\teamwork\worker_m2\handoff.md`
and notify the orchestrator via send_message.
