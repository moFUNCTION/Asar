# ASAR Admin Console & Authentication Technical Audit Report

> **Workspace:** `apps/Admin` (Port `3001`)  
> **Reference System:** `d:\lyder-eco` (Admin & Auth Reference Architecture)  
> **Design Specification:** `docs/ASAR_DESIGN_SYSTEM.md` & `docs/ASAR_PROJECT_ARCHITECTURE.md`  
> **Author:** `explorer_admin_and_auth` (Teamwork Explorer)  
> **Date:** 2026-11-05  

---

## Executive Summary

A comprehensive technical investigation of `apps/Admin` was conducted, covering:
1. **Typography & Styling Audit** (Cairo font integration, CSS token architecture, Chakra UI v3 default system behavior, and alignment with the ASAR Warm Vintage Editorial luxury design system).
2. **Usability & UX Flaws Audit** (All routes, layouts, views, broken navigation, compilation errors, and dummy/mocked components across studios and queues).
3. **Authentication & Session Journey Audit** (Appwrite Account API integration, session persistence across page refreshes, RBAC verification via Appwrite Teams, and comparison with `d:\lyder-eco` reference implementation).
4. **Actionable Fix Recommendations & Technical Blueprints** (Concrete, step-by-step blueprints for implementers to make `apps/Admin` fully ship-ready).

---

## 1. Typography & Styling Audit

### 1.1. Current Typography Configuration
- **HTML Font Loading (`apps/Admin/index.html`)**:
  - Line 10 loads Google Fonts via `<link>`:
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    ```
  - Preconnect tags for `fonts.googleapis.com` and `fonts.gstatic.com` are present on lines 8–9.
  - All Cairo weights requested (`300`, `400`, `500`, `600`, `700`, `800`, `900`) are included in the Google Fonts query string.
- **Global CSS Configuration (`apps/Admin/src/index.css`)**:
  - Line 1 repeats the Google Font import via `@import`.
  - Lines 42–44 declare font variables:
    ```css
    --font-arabic-display: 'Amiri', 'Aref Ruqaa', 'Playfair Display', serif;
    --font-latin-display: 'Playfair Display', 'Amiri', serif;
    --font-body: 'Cairo', system-ui, -apple-system, sans-serif;
    ```
  - Lines 63–71 set:
    ```css
    html, body {
      min-height: 100vh;
      background-color: var(--athar-bg-primary);
      color: var(--athar-text-body);
      font-family: var(--font-body);
      line-height: 1.6;
    }
    ```

### 1.2. Identified Typography & Design Flaws
1. **Chakra UI v3 Token Disconnect**:
   - In `apps/Admin/src/main.tsx` (line 16), Chakra is initialized with `<ChakraProvider value={defaultSystem}>`.
   - In Chakra UI v3 (`@chakra-ui/react: ^3.32.0`), primitive components (`<Heading>`, `<Text>`, `<Button>`, `<Input>`, `<Badge>`) generate internal CSS variables (`--chakra-fonts-heading`, `--chakra-fonts-body`).
   - Because `defaultSystem` is used without theme token customization, `--chakra-fonts-body` defaults to `ui-sans-serif, system-ui, sans-serif` instead of `'Cairo'`, and `--chakra-fonts-heading` defaults to system sans-serif instead of `'Amiri'`. Consequently, any Chakra component that sets its own font tokens bypasses Cairo.
2. **Missing CSS Variables (`--font-sans` and `--font-mono`)**:
   - `apps/Admin/src/components/layout/AdminShell.tsx` (line 441) declares:
     ```tsx
     fontFamily: "var(--font-sans)",
     ```
     However, `--font-sans` is **never declared** in `:root` inside `apps/Admin/src/index.css`. As a result, all sidebar tab navigation buttons fall back to the browser's default font.
   - `apps/Admin/src/components/auth/AdminLoginView.tsx` (lines 352 & 356) declares:
     ```tsx
     <Text fontWeight="800" fontFamily="var(--font-mono)">admin@asar.me</Text>
     ```
     `--font-mono` is also **not defined** in `:root`.
3. **Hardcoded Hex Colors Violating Luxury Tokens**:
   - Multiple components hardcode arbitrary hex colors instead of the design system tokens from `docs/ASAR_DESIGN_SYSTEM.md`:
     - `AdminShell.tsx` (line 431): `backgroundColor: isActive ? "#7A1C2E" : "transparent"` (should be `var(--athar-maroon)` `#6B1D28`).
     - `AdminLoginView.tsx` (lines 140, 310, 334): `bg="#7A1C2E"` and `color="#FBF8F3"` (should be `var(--athar-maroon)` and `var(--athar-bg-primary)`).
     - `OrdersQueueManager.tsx` and `BoothMemoryStudio.tsx`: sporadic hardcoded `#8C6F12` and `#8C6D46` instead of `--athar-gold` or `--athar-status-warning`.
4. **Lack of Poetic Display Typography in Headings**:
   - Display headings in `AdminShell` and `AdminOverview` sometimes omit `fontFamily="var(--font-arabic-display)"` and use generic font weights, diminishing the luxury editorial aesthetic.

---

## 2. Usability & UX Flaws Audit

### 2.1. Compilation Errors & Broken Code (Verified via `tsc`)
Running `npx tsc -p apps/Admin/tsconfig.app.json --noEmit` revealed fatal errors:

| File & Line | Error Code | Exact Error Message | Impact |
| :--- | :--- | :--- | :--- |
| `src/components/layout/AdminShell.tsx:356, 367` | `TS2304` | `Cannot find name 'profile'.` | **Critical Runtime Crash**: Accessing `profile` free variable throws `ReferenceError: profile is not defined` when rendering user profile. |
| `src/components/users/UsersManager.tsx:233` | `TS2552` | `Cannot find name 'fetchUsers'. Did you mean 'setUsers'?` | **Broken UI Action**: Clicking "Refresh" button crashes or fails to compile. |
| `src/components/users/UsersManager.tsx:234, 240` | `TS2304` | `Cannot find name 'isLoading'.` | **Broken UI State**: Variable `isLoading` does not exist (`isDocsLoading` was destructured but not used). |
| `src/components/users/UsersManager.tsx:99` | `TS2345` | `Argument of type 'AsarUserProfile' is not assignable to parameter of type 'AsarUserProfile & Document'.` | **Type Failure**: Incompatible collection merge logic. |
| `src/App.tsx:395, 409` | `TS2345` | `Argument of type 'AsarOrder' is not assignable to parameter of type 'AsarOrder & Document'.` | **Type Failure**: Missing Document system metadata properties (`$collectionId`, `$databaseId`, etc.). |
| `src/components/orders/OrdersQueueManager.tsx:111` | `TS6133` | `'updatePaymentDoc' is declared but its value is never read.` | **Functional Bug**: Approving/rejecting payment updates order status in DB, but never updates the payment document in `payments` collection. |
| `src/App.tsx:26, 301, 354` | `TS6133` | `'useMutations'`, `'databases'`, `'user'` are declared but never read. | Unused variables causing build/lint warnings. |

### 2.2. Dummy / Mocked Data & Disconnected Workflows

1. **Disconnected Order Selection in Booth Memory Studio (`apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx`)**:
   - Line 41 declares a hardcoded `DEFAULT_ORDERS` array (`ord_mina_maryam_01`, `ord_tarek_nour_02`, `ord_karim_salma_03`).
   - When an administrator in `OrdersQueueManager` clicks **`🎙️ Open in Booth Memory Studio`** for a real order (e.g. `ORD-8821`), it routes to `/booth-studio/ORD-8821`.
   - In `BoothMemoryStudio.tsx:199`:
     ```ts
     const activeOrder = DEFAULT_ORDERS.find((o) => o.id === selectedOrderId) || DEFAULT_ORDERS[0];
     ```
     Because `ORD-8821` is not in `DEFAULT_ORDERS`, it silently falls back to `DEFAULT_ORDERS[0]` (`ord_mina_maryam_01`).
   - The actual order data from Appwrite and client-submitted assets (`clientSubmittedAssetsJson`) are **completely discarded**.
2. **Disconnected Order Selection in Invitation Studio (`apps/Admin/src/components/invitation-studio/InvitationStudio.tsx`)**:
   - Line 77 declares a hardcoded `DEMO_ORDERS` record (`ORD-915`, `ORD-104`).
   - When opened with `ORD-8819`, it falls back to `ORD-915`.
   - Line 468 hardcodes `clientId: "client-demo-user"` rather than using the real order's client ID.
3. **Simulated Persistence in Booth Memory Studio**:
   - In `BoothMemoryStudio.tsx` (lines 270–305):
     ```ts
     localStorage.setItem("asar_booth_memories_cache", JSON.stringify(updatedMemory));
     localStorage.setItem("asar_booth_voices_cache", JSON.stringify(voiceRecords));
     localStorage.setItem("asar_booth_media_cache", JSON.stringify(mediaItems));
     await new Promise((res) => setTimeout(res, 400));
     ```
     Clicking **`🚀 Save & Publish Memory Website`** does NOT write to Appwrite collections (`booth_memories`, `booth_voice_records`, `booth_media`) or storage buckets at all! It only persists to `localStorage` and executes a fake `setTimeout`.
4. **Mocked Audio & Media Ingestion**:
   - In `BulkVoiceUploader.tsx`: Voices dropped or simulated are converted to transient in-memory `blob:` URLs. No chunked upload (`useUpload`) to Appwrite bucket `booth_mastered_audio` or batch insert (`useBatchOperations().bulkCreate`) into `booth_voice_records` is performed.
   - In `MediaAndTabsEditor.tsx`: Photos are converted to local `URL.createObjectURL(file)` and never uploaded to Appwrite bucket `booth_gallery_media`. They disappear upon page reload.
5. **Incomplete CRUD in Plan Builder Studio (`apps/Admin/src/components/plans/PlanBuilderStudio.tsx`)**:
   - Lines 384–406: When creating a **new** plan (`!editingPlan`), it only pushes the plan to local React state and `localStorage`. It **never calls** `databases.createDocument("asar-db", "plans", ...)`!
   - Deleting a plan (`handleDeletePlan`) only filters local state; it never deletes the document from Appwrite (`databases.deleteDocument`).
   - Toggling active status (`handleToggleActive`) only modifies local state without syncing `isActive` to Appwrite.
6. **Payment Receipt Queue Desynchronization (`OrdersQueueManager.tsx`)**:
   - `handleApprovePayment` (line 176) updates `orders` collection via `updateOrderDoc`, but never calls `updatePaymentDoc(paymentId, { status: "approved" })` to update the `payments` collection.
   - `handleRejectPayment` (line 216) similarly leaves the payment record in `pending` status in Appwrite.
7. **Users Role Synchronization (`UsersManager.tsx`)**:
   - Line 107 updates the database document in collection `users`, but does not call the Appwrite Cloud Function `sync-user-role` or update Appwrite Teams membership (`teams.createMembership("admins", ...)`). Appwrite internal RBAC (`team:admins`) remains unchanged.

### 2.3. UX & Interaction Flaws
- **Inconsistent Alert Systems**: Rather than a central toast provider, every view renders its own ad-hoc fixed notification `<Box>`:
  - `actionAlert` in `OrdersQueueManager` (top right, 20px)
  - `notification` in `BoothMemoryStudio` (top right, 1.2rem)
  - `toast` in `InvitationStudio` (floating bottom)
  - `actionNotice` in `UsersManager` (top left, 20px)
- **Hardcoded Credentials in Login Form**: In `AdminLoginView.tsx`, the form inputs default to `"admin@asar.me"` and `"AsarAdmin@2026"`. While helpful for quick local testing, this should be an explicit helper card rather than pre-populating controlled input fields.
- **Studio Navigation Trap**: Navigating to `/booth-studio` or `/invitation-studio` directly from the sidebar without an `orderId` parameter displays the first mock order without an order selector modal, confusing administrators about which wedding they are editing.

---

## 3. Authentication & Session Journey Audit

### 3.1. Current Auth Implementation Analysis
- **Entry Points & Guards**:
  - `apps/Admin/src/App.tsx`:
    - Reads auth state from `useAdminAuth()`.
    - Procedurally guards the application:
      ```tsx
      if (authLoading) return <LoadingScreen />;
      if (!isAuthenticated) return <AdminLoginView onSuccess={() => navigate("/overview")} />;
      if (!isVerifiedAdmin) return <AdminLoginView isForbidden onSuccess={() => navigate("/overview")} />;
      return <AdminShell>...</AdminShell>;
      ```
  - `AdminShell.tsx` (lines 92–148):
    - Redundantly checks `!authLoading && user && !isVerifiedAdmin` and renders a full-page authorization error screen, which duplicates the guard in `App.tsx`.
- **RBAC Logic (`useAdminAuth.ts`)**:
  - Checks user membership in Appwrite Team `admins` via `teams.list()` and `teams.listMemberships(ASAR_TEAMS.ADMINS)`.
  - Fallback checks: `userRoles` (`admin`, `verified-admin`, `superadmin`), `user.labels`, `user.prefs.role`, `dbUserRecord.role`, or email domain (`@asar.me`).
  - Staging/Demo fallback: If email is `admin@asar.me`, sets mock user in `localStorage.setItem("asar_admin_session", ...)`.
- **Session Persistence Across Page Refreshes**:
  - Managed by `@repo/react-appwrite/src/Provider/AppwriteProvider.tsx`:
    - `activeSessionSecret` stored in `localStorage` under `asar:active_session`.
    - Stored secret is restored onto Appwrite `Client` via `useEffect`:
      ```ts
      useEffect(() => {
        if (activeSessionSecret && client) {
          client.setSession(activeSessionSecret);
        }
      }, [activeSessionSecret, client]);
      ```
    - **Timing Vulnerability**: Because `useEffect` runs asynchronously after initial mount, the initial `account.get()` call triggered by `useUser()` can fire before `client.setSession()` has been called. If third-party cookies are blocked (which is common across different ports `localhost:3001` vs `fra.cloud.appwrite.io`), `account.get()` throws a 401 unauthenticated error on the very first frame.
- **Missing Auth Workflows**:
  - No Password Reset / Forgot Password flow (`account.createRecovery`).
  - No Admin Registration / Team Invitation flow (`account.create` or `teams.createMembership`).
  - No multi-factor authentication (MFA) enforcement for root administrators.

### 3.2. Detailed Comparison with Reference Implementation (`d:\lyder-eco`)

| Architectural Dimension | `d:\lyder-eco` Implementation | `apps/Admin` (Current Asar) | Target Solution for Asar |
| :--- | :--- | :--- | :--- |
| **Auth Layout & Brand UX** | `Pages/Auth/components/AuthLayout.tsx`: Split-screen layout. Left side features animated gradients, luxury logo, title, and 3 platform capability badges. Right side features form card. | `AdminLoginView.tsx`: Single centered box with raw hex colors and no visual branding assets. | Adopt the split-screen luxury `AuthLayout` styled with Athar Warm Alabaster canvas, Royal Maroon hero side, and Champagne Gold accents. |
| **Route Protection & Guards** | Declarative `<RequireAuth>` and state-driven `getRedirectTarget()` (`/login`, `/email-verify`, `/apply`, `/pending`, `/app`). | Procedural `if (!isAuthenticated)` block in `App.tsx` + duplicate check in `AdminShell.tsx`. | Utilize `<RequireAuth>` and `<AdminGuard>` wrapper components from `@repo/react-appwrite` with unified loading states. |
| **Auth Feature Completeness** | Dedicated pages for `Login`, `Register` (multi-step wizard with role selection), and `ForgetPassword` with email dispatch. | Only `AdminLoginView.tsx` with login form. No forgot password, no registration. | Implement `AdminLoginView`, `AdminForgotPasswordView`, and `AdminRegisterView` with `@repo/react-appwrite` hooks (`createRecovery`, `register`). |
| **Form Handling & Validation** | `react-hook-form` with validation rules (regex email validation, min password length) and error messages. | Plain React `useState` with minimal validation and raw browser alerts. | Implement `react-hook-form` in all auth forms with luxury styled error badges. |
| **Session Secret Synchronization** | Synchronously sets active session secret and subscribes to `authEvents` (`SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`). | Sets session secret in `useEffect`, leaving a potential 1-frame race condition on cold refresh. | Initialize `client.setSession()` synchronously in `AppwriteProvider` initialization and handle events cleanly. |
| **RBAC Synchronization** | Two-tier verification: Appwrite Teams (`ADMIN_TEAM_ID`) + Database collection `admin_requests` with approval status. | Multiple fallback checks, but database role toggle in `UsersManager` does not update Appwrite Teams membership. | Trigger `sync-user-role` Appwrite Cloud Function when toggling roles to ensure Database and Teams stay in sync. |

---

## 4. Actionable Fix Recommendations & Technical Blueprints

### Blueprint 1: Typography & Luxury Theme Tokens Fix

#### Objective
Ensure Cairo font (weights 300, 400, 500, 600, 700, 800) is natively used by all Chakra UI v3 components and plain HTML elements, and eliminate all missing CSS variables.

#### Steps
1. **Declare Missing CSS Variables in `apps/Admin/src/index.css`**:
   Add to `:root`:
   ```css
   /* Font Stacks */
   --font-arabic-display: 'Amiri', 'Aref Ruqaa', 'Playfair Display', serif;
   --font-latin-display: 'Playfair Display', 'Amiri', serif;
   --font-body: 'Cairo', system-ui, -apple-system, sans-serif;
   --font-sans: 'Cairo', system-ui, -apple-system, sans-serif;
   --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

   /* Chakra UI v3 System Font Token Overrides */
   --chakra-fonts-heading: var(--font-arabic-display);
   --chakra-fonts-body: var(--font-body);
   --chakra-fonts-mono: var(--font-mono);
   ```
2. **Create Custom Chakra v3 System (`apps/Admin/src/theme.ts`)**:
   ```ts
   import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

   const config = defineConfig({
     theme: {
       tokens: {
         fonts: {
           heading: { value: "'Amiri', 'Playfair Display', serif" },
           body: { value: "'Cairo', system-ui, -apple-system, sans-serif" },
           mono: { value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
         },
         colors: {
           athar: {
             maroon: { value: "#6B1D28" },
             maroonDark: { value: "#5B1621" },
             gold: { value: "#D4AF37" },
             bgPrimary: { value: "#FBF7F2" },
             bgSecondary: { value: "#F4EFEA" },
             textTitle: { value: "#231F20" },
             textBody: { value: "#4A4240" },
             textMuted: { value: "#7A6F6D" },
           },
         },
       },
     },
   });

   export const adminSystem = createSystem(defaultConfig, config);
   ```
3. **Update `apps/Admin/src/main.tsx`**:
   Pass `adminSystem` to `<ChakraProvider value={adminSystem}>`.

---

### Blueprint 2: Usability & Code Health Fixes

#### Objective
Fix all TypeScript compilation errors and broken variables in `apps/Admin`.

#### Steps
1. **Fix `AdminShell.tsx` (Lines 356 & 367)**:
   - In `AdminShell.tsx`:
     Change:
     ```tsx
     {(profile?.name || user.name || "م")[0]}
     {profile?.name || user.name || "مدير النظام"}
     ```
     To:
     ```tsx
     {(user.name || user.email || "م")[0]}
     {user.name || user.email || "مدير النظام"}
     ```
2. **Fix `UsersManager.tsx` (Lines 72, 99, 233, 234, 240)**:
   - Destructure `refetch` from `useCollection`:
     ```tsx
     const { data: cloudUsers, loading: isDocsLoading, refetch } =
       useCollection<AsarUserProfile>(ASAR_DATABASE_ID, ASAR_COLLECTIONS.USERS, {
         realtime: true,
       });
     ```
   - Replace `fetchUsers` with `refetch`, and replace `isLoading` with `isDocsLoading`.
   - Fix array merge typing:
     ```tsx
     setUsers((prev) => {
       const merged = [...(cloudUsers as AsarUserProfile[])];
       for (const p of prev) {
         if (!merged.some((m) => m.userId === p.userId)) {
           merged.push(p);
         }
       }
       return merged;
     });
     ```
3. **Fix `App.tsx` (Lines 395 & 409)**:
   - Cast cloud arrays when merging:
     ```tsx
     setOrders((prev) => {
       const merged = [...(cloudOrders as AsarOrder[])];
       for (const p of prev) {
         if (!merged.some((m) => m.$id === p.$id)) {
           merged.push(p);
         }
       }
       return merged;
     });
     ```
   - Clean up unused imports (`useMutations`, `databases`, `user`).
4. **Fix `OrdersQueueManager.tsx` (Lines 111, 176, 216)**:
   - Call `updatePaymentDoc` when approving or rejecting payments:
     ```tsx
     await updatePaymentDoc(paymentId, {
       status: "approved",
       reviewedAt: new Date().toISOString(),
     });
     ```

---

### Blueprint 3: Replacing Dummy Studios with Real Appwrite Wiring

#### Objective
Connect `BoothMemoryStudio` and `InvitationStudio` directly to live Appwrite collections, storage buckets, and order pipelines.

#### Steps
1. **Pass Orders into Studios**:
   - In `App.tsx`, pass `orders` into `BoothStudioRouteWrapper` and `InvitationStudioRouteWrapper`:
     ```tsx
     const BoothStudioRouteWrapper: React.FC<{ orders: AsarOrder[]; onBack: () => void }> = ({ orders, onBack }) => {
       const { orderId } = useParams<{ orderId?: string }>();
       const selectedOrder = orders.find((o) => o.$id === orderId) || orders.find((o) => o.serviceType === "booth") || null;
       return <BoothMemoryStudio orderId={orderId || null} initialOrder={selectedOrder} onBack={onBack} />;
     };
     ```
2. **Wire Real Appwrite Persistence in `BoothMemoryStudio.tsx`**:
   - In `handleSaveAndPublish`:
     ```ts
     // 1. Persist Memory document
     await databases.updateDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.BOOTH_MEMORIES, memoryDocId, memoryPayload)
       .catch(() => databases.createDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.BOOTH_MEMORIES, memoryDocId, memoryPayload));

     // 2. Advance Order status to "published"
     if (selectedOrderId) {
       await databases.updateDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.ORDERS, selectedOrderId, {
         orderStatus: "published",
       });
     }
     ```
3. **Wire Audio Upload in `BulkVoiceUploader.tsx`**:
   - Use `storage.createFile(ASAR_BUCKETS.BOOTH_MASTERED_AUDIO, ID.unique(), file)` for dropped tracks.
   - Insert records into `booth_voice_records` collection using `databases.createDocument`.
4. **Wire Plan Builder CRUD (`PlanBuilderStudio.tsx`)**:
   - On new plan creation:
     ```ts
     await databases.createDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.PLANS, payload.$id, payload);
     ```
   - On plan deletion:
     ```ts
     await databases.deleteDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.PLANS, planId);
     ```
   - On status toggle:
     ```ts
     await databases.updateDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.PLANS, planId, { isActive: !currentActive });
     ```

---

### Blueprint 4: Luxury Authentication & Session Journey Overhaul

#### Objective
Transform `AdminLoginView` into a full luxury authentication journey inspired by `d:\lyder-eco` (`AuthLayout`, `LoginForm`, `ForgotPasswordForm`).

#### Steps
1. **Create `AdminAuthLayout.tsx`**:
   - Split-screen layout (50/50 on desktop):
     - **Right Side (RTL Brand Anchor)**: Royal Maroon canvas (`#6B1D28`) with animated gold gradients, Athar seal, Amiri Arabic title (*"أثر — منصة العمليات وإدارة الحفلات الفاخرة"*), and three luxury feature badges (Realtime Pipeline, Audio Engineering Studio, Bespoke Invitations).
     - **Left Side**: Warm Alabaster canvas (`#FBF7F2`) with centered ivory card (`rgba(255,255,255,0.95)`), Champagne Gold borders, Cairo typography, and tabbed view (`Login` / `Forgot Password`).
2. **Implement Password Recovery (`AdminForgotPasswordView.tsx`)**:
   - Uses `useAuthActions().createRecovery(email, `${window.location.origin}/reset-password`)`.
   - Displays clear success feedback in Arabic with estimated delivery time.
3. **Synchronous Session Secret Initialization in `AppwriteProvider`**:
   - Ensure `client.setSession(activeSessionSecret)` is called immediately during client creation in `useMemo` so that no outgoing requests suffer from unauthenticated 401 race conditions on page reload.
4. **Declarative Route Guarding**:
   - Replace procedural if-blocks with a dedicated `<AdminGuard>` component:
     ```tsx
     <Route
       path="/*"
       element={
         <AdminGuard>
           <AdminShell ... />
         </AdminGuard>
       }
     />
     ```
     `<AdminGuard>` shows a branded luxury loading animation, redirects unauthenticated users to `/auth`, and presents a clear, diplomatic permission gate if the account lacks `team:admins` membership.

---

## 5. Summary of Recommended Implementation Order

1. **Step 1 (Zero-Risk TypeScript Fixes)**: Fix `profile` error in `AdminShell.tsx`, `fetchUsers`/`isLoading` errors in `UsersManager.tsx`, and collection type merges in `App.tsx`.
2. **Step 2 (Typography Tokens)**: Add `--font-sans`, `--font-mono`, `--chakra-fonts-*` in `index.css` and configure `adminSystem` with Cairo in `theme.ts`.
3. **Step 3 (Real Appwrite CRUD)**: Wire `databases.createDocument` / `deleteDocument` in `PlanBuilderStudio.tsx`, wire `updatePaymentDoc` in `OrdersQueueManager.tsx`, and pass live orders into `BoothMemoryStudio` and `InvitationStudio`.
4. **Step 4 (Auth & Luxury Redesign)**: Implement `AdminAuthLayout.tsx` with Cairo font, luxury editorial aesthetic, and full login + password recovery journeys.
