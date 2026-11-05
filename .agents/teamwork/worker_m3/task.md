# Task Assignment: Milestone 3 Worker
Authentication & 10k+ Scalability Data Architecture:
1. Route protection in apps/Admin: Wrap routes in <RequireAuth> and <HasTeam teamId="admins">. Add Admin login view/state.
2. Route protection in apps/Main: Wrap /account/* in <RequireAuth>. Fix Defect M1-CHALLENGE-01 in ClientAccountShell.tsx (align stage mapping with orderPipeline.ts).
3. Phone/SMS OTP in apps/Main: Expose Phone/SMS OTP and Email OTP tabs in apps/Main/src/components/auth/AuthModal.tsx using useAuthActions.ts.
4. 10k+ Scalability:
   - CacheFusionStore.ts: Enforce 500-entry max capacity limit with LRU eviction.
   - appwrite.config.json: Add missing database indexes (invitation_rsvps.guestEmail, wishing_wall_messages.[invitationId, $createdAt]).
Report to d:\asar\.agents\teamwork\worker_m3\handoff.md.
