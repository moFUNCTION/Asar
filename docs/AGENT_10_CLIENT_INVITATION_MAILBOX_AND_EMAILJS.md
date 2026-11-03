# AGENT 10 — Client Account RSVP Mailbox, Capacity Meter & EmailJS Approval/Decline Automation

> **Agent Role:** Client RSVP Mailbox, QR Pass Generator & EmailJS Integration Engineer  
> **Target Workspace:** `apps/Main` (Port `3000`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Main/src/components/mailbox/ClientRsvpMailbox.tsx` *(Create)*
* `apps/Main/src/components/mailbox/CapacityMeterBar.tsx` *(Create)*
* `apps/Main/src/components/mailbox/RsvpSubmissionInspector.tsx` *(Create)*
* `apps/Main/src/components/mailbox/EmailPreviewAndConfigModal.tsx` *(Create)*
* `apps/Main/src/components/mailbox/index.ts` *(Create — must export `{ ClientRsvpMailbox }`)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** modify `apps/Main/src/App.tsx`, `apps/Main/src/index.css`, or any files inside `apps/Main/src/components/{home,auth,account}/*` (Strictly owned by **Agent 09**).
* Do **NOT** touch `apps/Booth`, `apps/Admin`, `apps/Invitation`, or `packages/*`.

### 🤝 Export Contract (`apps/Main/src/components/mailbox/index.ts`):
```tsx
export interface ClientRsvpMailboxProps {
  invitationId?: string | null;
  clientId?: string;
}
export const ClientRsvpMailbox: React.FC<ClientRsvpMailboxProps>;
```

---

## 2. Exact Implementation Requirements

### 2.1. `ClientRsvpMailbox.tsx` — Real-Time Guest RSVP Inbox in Client Account Pages
When guests fill out the dynamic form on a client's generated Invitation website (`apps/Invitation`), their responses are sent to the **Client's Mailbox** inside their Account Pages (`apps/Main`).

* **Data Synchronization:**
  * Queries Appwrite collection `"invitation_rsvps"` (with realtime WebSocket subscription via `@repo/react-appwrite`) AND merges any submissions stored in `localStorage` (`"asar_invitation_rsvps_cache"`), pre-populated with realistic sample guest submissions (Pending, Approved, Declined) so the Mailbox works immediately!
* **Top Mailbox Header & Controls:**
  * Event Selector (e.g., *"حفل زفاف عمر وليلى — The Wedding of Omar & Layla"*).
  * **Filter Tabs with Live Counts:**
    * `الكل (All)` · `⏳ قيد المراجعة (Pending)` · `✓ مقبول — تم إرسال QR (Approved)` · `✕ اعتذار السعة (Declined)`
  * **Search Input:** Search guests by Name, Email, or Phone.
  * **Action Buttons:**
    * `⚙️ إعدادات ومعاينة قوالب EmailJS` (Opens `EmailPreviewAndConfigModal.tsx`).
    * `📥 تصدير قائمة المدعوين المؤكدين (CSV)`.

---

### 2.2. `CapacityMeterBar.tsx` — Live Venue Capacity & Seat Tracker
* Displays a luxury visual progress bar tracking:
  * **Confirmed Seats (`Approved Guests + Companions`)** vs. **Max Venue Capacity (`maxCapacity`, e.g., `150` seats)**.
  * **Pending Seats Requested** and **Remaining Available Seats**.
* Color-codes the progress bar:
  * Normal (`< 80%` capacity): Emerald & Champagne Gold.
  * Approaching Full (`80% – 99%`): Warm Amber alert.
  * Capacity Reached (`100%+`): Royal Maroon alert reminding the client that declining additional RSVPs will send the polite **Venue Capacity Constraint** email.

---

### 2.3. `RsvpSubmissionInspector.tsx` — Dynamic Form Answers & Approve/Decline Engine
Displayed in the right pane of the split-view Mailbox when the client selects a guest submission from the inbox list:

1. **Guest Identity Header:**
   * Guest Full Name (`guestName`)
   * **Verified Guest Email (`guestEmail` — Required field badge `✉️ البريد الإلكتروني المعتمد للإرسال`)**
   * Phone / WhatsApp (`guestPhone`), Companions Count (`companionsCount`), Submission Timestamp, and Current Status Badge (`Pending` | `Approved` | `Declined`).
2. **Dynamic Custom Form Responses Grid:**
   * Parses `dynamicResponsesJson` and renders every custom field that the guest answered on the Invitation form (e.g., *صلة القرابة / الفئة*, *عدد المرافقين*, *الملاحظات الغذائية*, *كلمة التهنئة للذكرى*).
3. **Host Decision Controls (Wired Directly to EmailJS & QR Generation):**
   * **Button 1 — `✓ قبول الدعوة وإرسال كود الدخول (Approve & Send QR via EmailJS)`:**
     * Generates a unique cryptographic `passToken` (e.g., `INV-PASS-8942-X`).
     * Constructs the guest's digital pass link: `http://localhost:3003?pass=${rsvp.$id}&token=${passToken}`.
     * Generates the high-contrast **Invitation QR Code image URL** (`buildQrCodeImageUrl`).
     * Updates the RSVP document in Appwrite (`status = "approved"`, `passToken`, `qrCodeUrl`, `emailSent = true`).
     * Dispatches the **Approval Email** to `rsvp.guestEmail` via **EmailJS** (`https://api.emailjs.com/api/v1.0/email/send`) containing the personalized greeting, event details, and the embedded **Invitation QR Code**!
     * Immediately displays the generated **Invitation QR Code Pass** and an **"Email Sent to `guestEmail` ✓ (View Sent Email Preview)"** confirmation inside the inspector!
   * **Button 2 — `✕ اعتذار بسبب اكتمال السعة (Decline & Send Capacity Apology via EmailJS)`:**
     * Updates the RSVP document in Appwrite (`status = "declined"`, `emailSent = true`).
     * Dispatches the **Capacity Decline Email** to `rsvp.guestEmail` via **EmailJS** containing the polite, dignified message explaining that **venue capacity constraints make accommodating the invitation difficult**:
       > *"نشكر لكم مشاعركم الطيبة ورغبتكم في مشاركتنا فرحتنا. نظراً لمحدودية سعة القاعة واكتمال العدد المسموح به، يَصعُب علينا للأسف تأكيد مقاعد إضافية في الوقت الحالي. نقدّر تفهمكم ومحبتكم الغالية. / Due to strict venue capacity limitations, we are unfortunately unable to confirm additional seats at this time..."*
     * Displays an **"Apology Email Sent to `guestEmail` ✓ (View Sent Email Preview)"** confirmation.

---

### 2.4. `EmailPreviewAndConfigModal.tsx` — EmailJS Configuration & Live Email Previewer
* Allows the client or developer to:
  1. Inspect the exact HTML/Text email that was sent (or will be sent) to the guest for both the **Approved (with embedded QR Code)** and **Declined (Venue Capacity Apology)** states.
  2. Configure or test custom EmailJS credentials (`Service ID`, `Public Key`, `Approved Template ID`, `Declined Template ID`) right from the UI if desired, while defaulting to `import.meta.env.VITE_EMAILJS_*`.

