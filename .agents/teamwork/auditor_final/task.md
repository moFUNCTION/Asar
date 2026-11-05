# Task Assignment: Final Forensic Integrity Auditor
Perform comprehensive forensic integrity audit across the entire production codebase:
1. Static analysis of git diffs across all modified files (apps/Admin, apps/Main, packages/react-appwrite, appwrite/).
2. Verify authentic logic: Ensure genuine implementations with NO hardcoding, NO dummy facades, NO test bypasses, NO @ts-ignore hacks.
3. Execution verification: Execute all test suites (npm test and npx tsx --test "test/e2e/**/*.test.ts") and verify live Appwrite Cloud status.
Report to d:\asar\.agents\teamwork\auditor_final\handoff.md with verdict CLEAN or INTEGRITY VIOLATION.
