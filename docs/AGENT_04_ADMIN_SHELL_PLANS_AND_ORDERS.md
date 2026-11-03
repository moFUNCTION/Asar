# AGENT 04 — Admin Console Shell, Dynamic Plan Builder & Manual Payment Verification Queue

> **Agent Role:** Admin Operations, Plan Quotas & Payment Verification Engineer  
> **Target Workspace:** `apps/Admin` (Port `3001`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Admin/src/index.css` *(Modify to apply `docs/ASAR_DESIGN_SYSTEM.md` luxury tokens)*
* `apps/Admin/src/App.tsx` *(Modify)*
* `apps/Admin/src/components/layout/AdminShell.tsx` *(Create)*
* `apps/Admin/src/components/dashboard/AdminOverview.tsx` *(Create)*
* `apps/Admin/src/components/plans/PlanBuilderStudio.tsx` *(Create)*
* `apps/Admin/src/components/orders/OrdersQueueManager.tsx` *(Create)*
* `apps/Admin/src/components/orders/PaymentReceiptInspector.tsx` *(Create)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** create or modify any files inside `apps/Admin/src/components/booth-studio/*` (Strictly owned by **Agent 05**).
* Do **NOT** create or modify any files inside `apps/Admin/src/components/invitation-studio/*` (Strictly owned by **Agent 06**).
* Do **NOT** touch `apps/Booth`, `apps/Main`, `apps/Invitation`, or `packages/*`.

### 🤝 Cross-Agent Integration Contract in `apps/Admin/src/App.tsx`:
In `apps/Admin/src/App.tsx`, import the studios built by Agent 05 and Agent 06 using these exact signatures:
```tsx
import { BoothMemoryStudio } from "./components/booth-studio";
import { InvitationStudio } from "./components/invitation-studio";
```
When the Admin switches to the `"booth-studio"` tab, render:
`<BoothMemoryStudio orderId={selectedOrderId} onBack={() => setActiveTab("orders")} />`
When the Admin switches to the `"invitation-studio"` tab, render:
`<InvitationStudio orderId={selectedOrderId} onBack={() => setActiveTab("orders")} />`

---

## 2. Exact Implementation Requirements

### 2.1. `AdminShell.tsx` — Editorial Luxury Studio Workspace Layout
* Design `apps/Admin` using the **Warm Vintage Editorial Luxury** palette from `docs/ASAR_DESIGN_SYSTEM.md` (`#FBF7F2` Warm Alabaster canvas, `#231F20` Deep Espresso text, `#6B1D28` Royal Maroon active pills, `#D4AF37` Champagne Gold borders).
* Top/Side navigation bar with 5 primary studio tabs:
  1. **`Overview` (`dashboard`)**: Live KPIs & quick actions.
  2. **`Plans & Limits` (`plans`)**: Dynamic Plan & Quota Builder for Booth & Invitation.
  3. **`Orders & Payments` (`orders`)**: Manual Payment Screenshot Verification & 7-Stage Order Pipeline Manager (with badge count of pending payments).
  4. **`Booth Memory Studio` (`booth-studio`)**: Launches `<BoothMemoryStudio />` (Agent 05).
  5. **`Invitation Builder` (`invitation-studio`)**: Launches `<InvitationStudio />` (Agent 06).
* Include quick links to open `Main Hub (:3000)`, `Booth App (:3002)`, and `Invitation App (:3003)`.

---

### 2.2. `PlanBuilderStudio.tsx` — Dynamic Plan, Custom Features & Quota Manager
Allows the Admin to create, edit, duplicate, toggle (`isActive`), and delete plans for both **`booth`** and **`invitation`** services:
1. **Service Filter Tabs:** `All Plans` · `🎙️ Booth Plans` · `✉️ Invitation Plans`.
2. **Interactive Plan Editor Drawer / Modal:**
   * **Identity & Pricing:** Plan Name (`name`), Subtitle (`subtitle`), Primary Badge (`badge`), Sub-badge (`subBadge`), Price (`price`), Currency (`EGP`), and Card Theme Variant (`"ivory-royal"` vs. `"noir-obsidian"`).
   * **Custom Specific Features Builder (`featuresJson`):**
     * Dynamic list where Admin can add/remove/reorder custom feature strings (e.g., *"6 hours of full evening celebration coverage"*, *"Custom QR code cards for guest tables"*).
   * **Enforced Quotas & Limits Matrix (`limitsJson`):**
     * Numeric steppers & boolean toggles:
       * `coverageHours` (e.g. `3`, `6`, `12`)
       * `maxVoiceRecords` (e.g. `80`, `150`, or `-1` for Unlimited)
       * `maxGalleryPhotos` (e.g. `20`, `100`, or `-1` for Unlimited)
       * `maxCustomCategories` (e.g. `4`, `8`)
       * `hasVideoHighlight` (`boolean` switch)
       * `hasGuestBookTab` (`boolean` switch)
       * `allowBulkZipDownload` (`boolean` switch)
       * `hostingDurationDays` (e.g. `365`, `730`)
       * `maxRsvpCapacity` (For Invitation plans, e.g. `150`, `300`, `1000`)
   * **Add-ons Catalog Manager (`addonsJson`):** Manage optional add-ons (Name, Price, Badge).
3. **Persistence:** Saves to Appwrite collection `"plans"` AND syncs to `localStorage` (`"asar_synced_plans"`) so changes immediately reflect in `apps/Booth` and `apps/Invitation`.

---

### 2.3. `OrdersQueueManager.tsx` & `PaymentReceiptInspector.tsx`
1. **Filterable Orders Queue:**
   * Filter by Service (`All`, `Booth`, `Invitation`) and by Pipeline Stage (`All`, `Pending Payment`, `Payment Rejected`, `Awaiting Client Assets`, `Event Scheduled`, `Audio Mastering`, `Studio Curation`, `Published`).
2. **Manual Payment Screenshot Inspector (`PaymentReceiptInspector.tsx`):**
   * Displays the client's payment details (`paymentMethod`: InstaPay / Vodafone Cash / Bank Transfer, `amount`, submission timestamp) alongside a high-resolution **Zoomable Screenshot Preview** (`<AppwriteImage>` or uploaded receipt preview).
   * **Action 1 — `✓ Approve Payment`:**
     * Marks payment `status = "approved"`, advances `order.orderStatus = "awaiting_client_assets"`, and notifies the client in real time so their Asset Submission Form unlocks!
   * **Action 2 — `✕ Reject Payment`:**
     * Opens a reason input (e.g., *"Screenshot is blurry / transfer amount incomplete"*), marks payment `status = "rejected"`, sets `order.orderStatus = "payment_rejected"`, and prompts the client to upload a new screenshot in their Order Tracker.
3. **7-Stage Order Pipeline Controller & Client Assets Viewer:**
   * Admin can view the assets submitted by the client (`ClientSubmittedAssets`: Couple Hero Photo, Couple Title, Date, Venue, Quote, Requested RSVP Fields) and advance the order stage (`event_scheduled` → `audio_mastering` → `studio_curation` → `published`).
   * Direct studio launch button on every order row:
     * If `serviceType === "booth"` → **`🎙️ Open in Booth Memory Studio →`** (sets `selectedOrderId` and switches to `booth-studio`).
     * If `serviceType === "invitation"` → **`✉️ Open in Invitation Builder →`** (sets `selectedOrderId` and switches to `invitation-studio`).

