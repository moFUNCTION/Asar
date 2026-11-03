# AGENT 09 — Unified Brand Hub, Client Auth, 7-Stage Live Order Tracker, Asset Submission Box & QR Hub

> **Agent Role:** Client Account Portal, Order Pipeline & Asset Concierge Engineer  
> **Target Workspace:** `apps/Main` (Port `3000`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Main/src/index.css` *(Modify to apply `docs/ASAR_DESIGN_SYSTEM.md` luxury tokens)*
* `apps/Main/src/App.tsx` *(Modify)*
* `apps/Main/src/components/home/BrandGatewayHome.tsx` *(Create)*
* `apps/Main/src/components/auth/ClientAuthModal.tsx` *(Create)*
* `apps/Main/src/components/account/ClientAccountShell.tsx` *(Create)*
* `apps/Main/src/components/account/OrderPipelineTracker.tsx` *(Create)*
* `apps/Main/src/components/account/PaymentReceiptUploader.tsx` *(Create)*
* `apps/Main/src/components/account/BoothClientAssetsForm.tsx` *(Create)*
* `apps/Main/src/components/account/ClientQrCodeHub.tsx` *(Create)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** create or modify any files inside `apps/Main/src/components/mailbox/*` (Strictly owned by **Agent 10**).
* Do **NOT** touch `apps/Booth`, `apps/Admin`, `apps/Invitation`, or `packages/*`.

### 🤝 Cross-Agent Integration Contract in `ClientAccountShell.tsx`:
Import the Client RSVP Mailbox created by Agent 10 using this exact signature:
```tsx
import { ClientRsvpMailbox } from "../mailbox";
```
When the client selects the `"mailbox"` tab in `ClientAccountShell.tsx`, render:
`<ClientRsvpMailbox invitationId={activeInvitationId} />`

---

## 2. Exact Implementation Requirements

### 2.1. `BrandGatewayHome.tsx` & `ClientAuthModal.tsx` — ASAR Unified Platform Hub
* Design `apps/Main` (`:3000`) with the **Warm Vintage Editorial Luxury** aesthetic (`docs/ASAR_DESIGN_SYSTEM.md`).
* Top Navigation Bar with Athar logo, quick switcher between:
  1. **`🏠 بوابة أثر الرئيسية (ASAR Brand Hub)`** — Showcases the two flagship services (**Athar Booth `:3002`** & **Athar Invitation `:3003`**) and the **Admin Studio (`:3001`)**.
  2. **`👤 حسابي ومتابعة الطلبات (My Account & Order Tracker)`** — Opens `ClientAccountShell.tsx`.
  3. **`✉️ صندوق بريد الدعوات (Invitation RSVP Mailbox)`** — Opens `ClientAccountShell.tsx` directly on the `"mailbox"` tab!
* `ClientAuthModal.tsx`: Supports Appwrite Email/Password Login & Registration (`useAuth`) plus a 1-click **"الدخول كعميل تجريبي (Demo Client: Mina & Maryam / Omar & Layla)"** so reviewers can immediately explore all Client Account features without friction.

---

### 2.2. `ClientAccountShell.tsx` & `OrderPipelineTracker.tsx` — Real-Time 7-Stage Order Status Tracker
To fulfill the core requirement that **the client must know exactly where they are and what the status of their order is at all times**, `OrderPipelineTracker.tsx` provides a transparent, interactive **7-Stage Concierge Pipeline**:

```
[1. مراجعة الدفع] ──> [2. حالة الإيصال] ──> [3. رفع الصور والنصوص] ──> [4. تأكيد الموعد] ──> [5. هندسة الصوت] ──> [6. تصميم الصفحة] ──> [7. جاهز + QR 🎉]
```

* Displays:
  * **Order Summary Header:** Order ID (`#ORD-902`), Service Badge (`🎙️ Athar Booth` or `✉️ Athar Invitation`), Plan Name (`حكاية أثر VIP`), Event Date & Venue, and Current Status Pill.
  * **Interactive 7-Step Visual Timeline:**
    * Completed stages glow in Emerald (`#1E6F50`) with checkmarks.
    * The active stage pulses in Royal Maroon (`#6B1D28`) & Champagne Gold (`#D4AF37`) with a detailed explanation of what is happening right now and who is acting (Client vs. Admin).
  * **Interactive Demo Stage Switcher (for testing):** A subtle toolbar allowing the reviewer to simulate how the client screen adapts across each of the 7 stages (`pending_payment`, `payment_rejected`, `awaiting_client_assets`, `event_scheduled`, `audio_mastering`, `studio_curation`, `published`).

---

### 2.3. `PaymentReceiptUploader.tsx` — Manual Payment Status & Screenshot Re-Upload
* Shows the client's uploaded payment screenshot thumbnail, payment method (`InstaPay` / `Vodafone Cash` / `Bank Transfer`), amount paid, and verification status (`Pending Review` | `Approved ✓` | `Rejected ✕`).
* **If `orderStatus === "payment_rejected"`:**
  * Highlights the Admin's `rejectionReason` inside a clear alert card and provides an immediate **Drag-and-Drop New Screenshot Uploader** (`payment_receipts` bucket) that resets the order status back to `"pending_payment"` for Admin re-verification.

---

### 2.4. `BoothClientAssetsForm.tsx` — Client-to-Admin Asset Handoff System
Because Booth memory creation is not automated and requires the client to send their photos and texts to the Admin so the Admin can refine and place them:
* Automatically unlocked once payment is approved (`awaiting_client_assets` or later).
* Allows the client to fill out and upload:
  1. **Couple Hero Cover Photo (`heroImageFileId`):** Drag-and-drop photo uploader (`client_raw_assets` bucket) with live preview.
  2. **Header Overline & Couple Names:** e.g., `"THE WEDDING OF"` and `"Mina & Maryam"`.
  3. **Celebration Date, City & Romantic Tag:** e.g., `"12 July 2026"`, `"Alexandria, Egypt"`, and `"Together Always"`.
  4. **Personal Couple Quote:** e.g., `"Every voice here is a piece of our forever ..."`.
  5. **Thank You Note for Guests:** Text for the `Thank You` tab on their Memory Website.
  6. **Custom Voice Filter Categories:** Tag chips (`Family`, `Friends`, `Colleagues`, `Special Guests` + ability to add custom categories).
* Clicking **"حفظ وإرسال البيانات للإدارة (Send Assets to Admin Studio)"** saves `clientSubmittedAssetsJson` on the Order document in Appwrite (and `localStorage` `"asar_orders_cache"`), making them immediately available to the Admin's **"One-Click Pull Client Submitted Assets"** button in `apps/Admin`!

---

### 2.5. `ClientQrCodeHub.tsx` — Client's Generated Landing QR Code & Print Kit
* Displays the client's high-resolution **Landing Page QR Code** (pointing to `http://localhost:3002?memory=${slug}` for Booth or `http://localhost:3003?event=${slug}` for Invitation).
* Framed in an Athar Royal Maroon & Champagne Gold keepsake card (*"Scan to Hear Our Wedding Memories — Mina & Maryam"*).
* Action Buttons:
  * **`📥 Download High-Res QR Code (PNG)`**
  * **`🖨️ Download Print-Ready Table Card`**
  * **`🔗 Open Live Memory / Invitation Website ↗`**

