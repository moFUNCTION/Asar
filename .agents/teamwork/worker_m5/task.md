# Task Assignment: Milestone 5 Worker
Admin Full Feature Management & Appwrite Persistence:
1. Wire Appwrite persistence in BoothMemoryStudio.tsx: Save booth memories and voice records directly to asar-db (ASAR_COLLECTIONS.MEMORIES and VOICE_RECORDS) in addition to cache.
2. Integrate RSVP Mailbox into apps/Admin: Provide an AdminRsvpMailbox view / tab in apps/Admin allowing admins to inspect incoming RSVPs, review venue capacity, and trigger approve/decline decisions via process-rsvp-action.
3. Admin Route Protection: Wrap Admin routes in App.tsx with <RequireAuth> and <HasTeam teamId="admins">, adding an Admin Login view or prompt for unauthenticated access.
4. Add Mailbox tab to AdminShell.tsx right-hand vertical tabs menu.
5. Verify clean compilation (npx tsc -b apps/Admin) and run test suites (npm test and E2E tests).
Report to d:\asar\.agents\teamwork\worker_m5\handoff.md.
