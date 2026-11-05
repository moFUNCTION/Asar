# Challenger Dispatch: M4 Challenger 1 — Generation Stability & Resource Management Adversarial Verification

## Role & Mandate
You are `challenger_m4_1`, a `teamwork_challenger` adversarial verifier.
Your mission: Empirically stress-test the generation stability and resource management fixes implemented in Milestone 1.

## Required References (Read First)
1. `d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY)
2. `d:\asar\.agents\teamwork\orchestrator\PROJECT.md`
3. `d:\asar\.agents\teamwork\worker_m1_gen\handoff.md`

## Adversarial Verification Targets
1. Stress-test pass URL resolution:
   - Verify `buildMemoryUrls` behavior with edge cases: empty slug, unicode slug, reserved subdomains, localhost vs remote host origin.
   - Verify that pass links never output malformed URLs.
2. Stress-test Object URL cleanup:
   - Validate that `activeObjectUrlsRef` in `BulkVoiceUploader.tsx` and `MediaAndTabsEditor.tsx` correctly registers and revokes URLs upon simulated drop of 100+ items and on unmount.
3. Stress-test Booth real audio streaming:
   - Validate error handling in `BoothMemoryPage.tsx` when `record.audioUrl` is empty, invalid, 404, or blocked by browser autoplay policy.
4. Stress-test scanner route parsing:
   - In `ScannerRouteView.tsx`, test `extractTokenOrId` and `validatePassTokenFormat` against edge inputs: empty strings, undefined, null, oversized strings (>1000 chars), SQL injection patterns, special characters, URLs with query parameters. Confirm zero crashes.

## Constraints
DO NOT create ad-hoc files or permanent test suites in source directories. If you write an empirical test, clean it up or keep it in your working directory.
USER RULE: Do not over-run `npm run build` without reason.

## Verdict
Deliver your verdict (`APPROVE` or `CHALLENGE`) in:
`d:\asar\.agents\teamwork\challenger_m4_1\handoff.md`

## 2026-11-04T22:43:02Z
You are challenger_m4_1, a teamwork_challenger adversarial verifier.
Your working directory is d:\asar\.agents\teamwork\challenger_m4_1.
You MUST read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md before starting your work.
Read d:\asar\.agents\teamwork\challenger_m4_1\DISPATCH.md for complete instructions.

Your mission:
Empirically stress-test the generation stability and resource management fixes:
1. Stress-test pass URL resolution with edge cases (empty slug, unicode, reserved subdomains, localhost vs remote host origin).
2. Stress-test Object URL cleanup in BulkVoiceUploader and MediaAndTabsEditor (simulated drops and unmount revocation).
3. Stress-test Booth real audio streaming (empty, 404, autoplay blocks).
4. Stress-test scanner route parsing (empty, null, oversized strings, special characters). Confirm zero crashes.

Do NOT leave permanent files in source code directories.
Deliver your formal verdict (APPROVE or CHALLENGE) in d:\asar\.agents\teamwork\challenger_m4_1\handoff.md and notify me via send_message.

