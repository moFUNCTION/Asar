# AGENT 02 — Booth Dynamic Plans, Live Booking Engine & Manual Payment Upload

> **Agent Role:** Booth Commercial & Payment Flow Engineer  
> **Target Workspace:** `apps/Booth` (Port `3002`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Booth/src/hooks/useBoothBooking.ts` *(Create)*
* `apps/Booth/src/components/sections/PackagesSection.tsx` *(Modify)*
* `apps/Booth/src/components/sections/AddonsSection.tsx` *(Modify)*
* `apps/Booth/src/components/sections/BookingModal.tsx` *(Modify)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** modify `apps/Booth/src/App.tsx` (owned by Agent 03).
* Do **NOT** touch `apps/Booth/src/components/memory/*` or `apps/Booth/src/pages/*` (owned by Agent 03).
* Do **NOT** touch any files in `apps/Admin`, `apps/Main`, `apps/Invitation`, or `packages/*`.
* Do **NOT** change the existing props interface of `PackagesSection` (`{ onSelectPackage: (pkgName: string) => void }`) or `BookingModal` (`{ isOpen: boolean; onClose: () => void; initialPackage?: string }`) so `apps/Booth/src/App.tsx` continues to work without any conflicts.

---

## 2. Exact Implementation Requirements

### 2.1. `useBoothBooking.ts` — Dynamic Plans Fetcher & Order/Payment Submission Hook
Create a clean custom hook in `apps/Booth/src/hooks/useBoothBooking.ts` that integrates with `@repo/react-appwrite` (`useAppwrite`, `ID`, `Query`):
1. **Dynamic Plans Fetching (`plans` collection):**
   * Queries Appwrite collection `"plans"` where `serviceType === "booth"` and `isActive === true` ordered by `sortOrder`.
   * **Graceful Fallback:** If the Appwrite collection is empty or unreachable in local dev, seamlessly falls back to the 2 rich default Booth packages (*"لحظة أثر"* `5,500 EGP` and *"حكاية أثر"* `7,000 EGP`) and default add-ons, plus merges any plans saved by the Admin in `localStorage` (`"asar_synced_plans"`) so cross-app testing works both with Appwrite Cloud and local dev!
2. **Order & Manual Payment Screenshot Submission:**
   * `submitBookingOrder(payload)`:
     * Uploads the client's payment screenshot `File` to Appwrite Storage bucket `"payment_receipts"` via `storage.createFile` (or generates a high-res data URL preview fallback if storage bucket isn't provisioned yet).
     * Creates the Order document in Appwrite collection `"orders"` with:
       * `serviceType: "booth"`
       * `orderStatus: "pending_payment"`
       * `clientName`, `partnerOrOrgName`, `clientEmail`, `clientPhone`, `eventDate`, `eventVenue`, `planId`, `planName`, `selectedAddonsJson`, `totalAmount`, `adminNotes`.
     * Creates the Payment document in Appwrite collection `"payments"` with:
       * `orderId`, `amount`, `paymentMethod` (`"instapay" | "vodafone_cash" | "bank_transfer"`), `screenshotFileId`, `status: "pending"`.
     * Also persists a synchronized copy to `localStorage` (`"asar_orders_cache"`) and returns `{ orderId, status: "pending_payment" }`.

---

### 2.2. `PackagesSection.tsx` — Dynamic Admin-Modifiable Plans & Limits Showcase
Upgrade `PackagesSection.tsx` while preserving its exact **Warm Vintage Editorial Luxury** aesthetic (both the `ivory-royal` card and the `noir-obsidian` VIP card):
* Render all active Booth plans returned by `useBoothBooking()`.
* If the Admin creates a 3rd custom plan or modifies features/prices/limits in the Admin Dashboard, `PackagesSection.tsx` automatically renders the updated price, badge, custom features checklist (`featuresJson`), and **Plan Quotas Strip** (e.g., badges showing `coverageHours` hours, `maxVoiceRecords` voice capacity, `maxGalleryPhotos` photos, `hasVideoHighlight` 30s reel, and `hostingDurationDays` cloud vault duration).
* Add a **"Preview Sample Memory Page (Mina & Maryam) →"** button beneath the packages that navigates to `?memory=mina-and-maryam` so visitors can experience what the final generated Booth Memory Website looks like!

---

### 2.3. `BookingModal.tsx` — 4-Step Booking + Manual Payment Screenshot Engine
Upgrade the existing 3-step `BookingModal.tsx` into a **4-Step Concierge Booking & Manual Payment Engine** (`dir="rtl"`, Chakra UI v3):

1. **Step 1 — بيانات العروسين والمناسبة (Celebration Details):**
   * Full Name (`yourName *`)
   * Partner's Name (`partnerName *`)
   * Email Address (`clientEmail *` — required to link their Client Account & order notifications)
   * WhatsApp Phone (`phone *`)
   * Event Date (`eventDate *`) & Venue/Region (`venue *`)
   * Special Notes (`notes`)

2. **Step 2 — اختيار الباقة والإضافات (Plan & Add-ons Selection):**
   * Dynamic cards for each active Booth Plan showing price, coverage hours, and key quota limits.
   * Interactive checklist for optional Add-ons (Express 48h delivery `+500 EGP`, Custom Calligraphy Sign `+500 EGP`, Extra Coverage Hour `+1,500 / +500 EGP`).
   * Live calculated **Total Price** and **Required Deposit Amount (العربون لتأكيد الحجز: مثلاً 1,500 ج.م أو كامل المبلغ)**.

3. **Step 3 — الدفع اليدوي ورفع إيصال التحويل (Manual Payment & Screenshot Upload):**
   * **Payment Method Selector Pills:**
     * `InstaPay (إنستاباي)`: Shows handle `athar.audio@instapay` + one-click Copy button.
     * `Vodafone Cash (فودافون كاش)`: Shows wallet number `0100 000 0000` + Copy button.
     * `Bank Transfer (تحويل بنكي)`: Shows IBAN / Account details + Copy button.
   * **Deposit vs. Full Payment Toggle:** Client chooses whether they transferred the Deposit (`1,500 EGP`) or Full Package Amount.
   * **Interactive Screenshot Dropzone:**
     * Allows client to drag-and-drop or select their payment screenshot image (`.jpg`, `.png`, `.webp`).
     * Displays a live image thumbnail preview of the uploaded receipt, file name, file size, and a "Replace Screenshot" button.
     * Validates that a payment screenshot is attached before allowing final submission.

4. **Step 4 — شاشة تأكيد الطلب ومتابعة الحالة (Confirmation & Order Tracker Link):**
   * Displays the generated **Order Reference ID** (e.g., `#ORD-8492`), current status badge (`قيد مراجعة الدفع من الإدارة — Pending Payment Approval`), and explains the next steps (once Admin approves the payment screenshot, the client can upload their Couple Hero Photo, Quote, and Categories).
   * Includes a prominent button: **"تتبع حالة طلبك الآن في حسابك (Track Order Status in Client Portal) →"** linking to `http://localhost:3000?orderId=${orderId}` as well as a direct link to preview the sample Memory Website (`?memory=mina-and-maryam`).

