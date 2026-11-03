# AGENT 07 — Invitation Service Showcase Landing Page, Plan Selector & Request/Payment Modal

> **Agent Role:** Invitation Marketing Showcase & Custom Order Flow Engineer  
> **Target Workspace:** `apps/Invitation` (Port `3003`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Invitation/src/components/landing/InvitationHeader.tsx` *(Create)*
* `apps/Invitation/src/components/landing/InvitationHero.tsx` *(Create)*
* `apps/Invitation/src/components/landing/OccasionsShowcaseSection.tsx` *(Create)*
* `apps/Invitation/src/components/landing/FeaturesAndMailboxSection.tsx` *(Create)*
* `apps/Invitation/src/components/landing/InvitationPackagesSection.tsx` *(Create)*
* `apps/Invitation/src/components/landing/InvitationBookingModal.tsx` *(Create)*
* `apps/Invitation/src/components/landing/InvitationFooter.tsx` *(Create)*
* `apps/Invitation/src/pages/InvitationLandingPage.tsx` *(Create)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** modify `apps/Invitation/src/App.tsx` or `apps/Invitation/src/index.css` (Strictly owned by **Agent 08**).
* Do **NOT** touch `apps/Invitation/src/components/renderer/*`, `apps/Invitation/src/components/pass/*`, `apps/Invitation/src/pages/CustomEventPage.tsx`, or `apps/Invitation/src/pages/GuestPassPage.tsx` (Strictly owned by **Agent 08**).
* Do **NOT** touch `apps/Booth`, `apps/Admin`, `apps/Main`, or `packages/*`.

### 🤝 Export Contract (`apps/Invitation/src/pages/InvitationLandingPage.tsx`):
```tsx
export interface InvitationLandingPageProps {
  onPreviewEvent?: (slug: string) => void;
  onPreviewPass?: (rsvpId: string) => void;
}
export const InvitationLandingPage: React.FC<InvitationLandingPageProps>;
export default InvitationLandingPage;
```

---

## 2. Exact Implementation Requirements

### 2.1. `InvitationLandingPage.tsx` — Luxury Editorial Showcase for ASAR Invitations
Build an Awwwards-caliber Arabic RTL (`dir="rtl"`) landing page for **ASAR Digital Invitations & Bespoke Event Websites (أَثَـــر للدعوات الرقمية ومواقع المناسبات المخصصة)** following `docs/ASAR_DESIGN_SYSTEM.md`:

1. **`InvitationHeader.tsx`:**
   * Sticky frosted header with Athar brand logo, section links (`المناسبات`, `مميزات النظام`, `صندوق الردود و QR`, `الباقات`, `معاينة حية`), a **"معاينة دعوة حية (Live Demo)"** button (`onPreviewEvent?.("omar-and-layla")`), and **"اطلب موقع دعوتك الآن"** CTA.
2. **`InvitationHero.tsx`:**
   * Fullscreen hero with `@repo/ui-components` (`GradientWaves`, `BlurText`, `SplitText`, `FadeContent`, `Magnet`).
   * Headline: *"دعوتك ليست مجرد بطاقة... بل موقع تفاعلي يخلّد مناسبتك."* (*"More Than An Invitation. A Bespoke Digital Experience."*).
   * Highlights that clients get a custom-built event website (Weddings, Engagements, Festivals, VIP Galas, Corporate Summits), a tailored Dynamic RSVP Form, a dedicated **Client Account Mailbox**, and automated **EmailJS QR Code Pass** delivery.
3. **`OccasionsShowcaseSection.tsx` ("Not Just a Template — Built for Every Celebration"):**
   * Interactive cards showcasing the 4 signature occasion styles that the Admin can craft:
     1. **حفلات الزفاف والخطوبة الملكية (Royal Weddings & Engagements)**
     2. **المهرجانات والفعاليات الفنية (Music & Cultural Festivals)**
     3. **حفلات العشاء والمؤتمرات الكبرى (VIP Galas & Corporate Summits)**
     4. **حفلات التخرج والذكريات السنوية (Graduations & Milestone Anniversaries)**
   * Each card includes a **"معاينة هذا التصميم ↗"** button calling `onPreviewEvent?.(presetSlug)`.
4. **`FeaturesAndMailboxSection.tsx` (How the Dynamic Form, Mailbox & QR Flow Works):**
   * Visual 4-step journey explaining the unique ASAR Invitation architecture:
     1. **تخصيص الحقول (Custom Form Fields):** You choose the exact questions your guests answer (plus mandatory email).
     2. **صندوق بريد خاص في حسابك (Dedicated Account Mailbox):** Every guest RSVP lands instantaneously in your Client Account Mailbox.
     3. **قبول أو اعتذار بضغطة زر (One-Click Approve or Decline):** You control your venue capacity effortlessly.
     4. **إرسال تلقائي عبر البريد (Automated EmailJS & QR Pass):** Approved guests automatically receive their **Invitation QR Code Pass**, while declined requests receive a polite venue capacity apology email.
5. **`InvitationPackagesSection.tsx`:**
   * Fetches active `"invitation"` plans from Appwrite (`plans` collection) or `localStorage` (`"asar_synced_plans"`), falling back to two luxury tiers:
     * **Tier 1: باقة دعوة أثر الكلاسيكية (`2,500 EGP`)** — Custom Wedding/Event Website, Countdown, Venue Map, Dynamic RSVP Form (up to 150 RSVPs), Client Account Mailbox, and Automated EmailJS QR Passes.
     * **Tier 2: باقة أثر الملكية للمناسبات الكبرى VIP (`4,500 EGP`)** — Bespoke Multi-Section Website with 3D Photo Gallery, Unlimited RSVPs & Custom Form Fields, VIP Gate QR Scanner, Custom Branding, and 1-Year Memory Hosting.

---

### 2.2. `InvitationBookingModal.tsx` — 4-Step Custom Invitation Order & Payment Wizard
When a client clicks **"اطلب موقع دعوتك الآن"**, open a 4-step modal (`dir="rtl"`):
1. **Step 1 — تفاصيل المناسبة (Event & Host Details):**
   * Client Name, Partner/Organization Name, Email (`clientEmail *`), WhatsApp Phone, Occasion Type (`زفاف` | `خطوبة` | `مهرجان` | `حفل/مؤتمر` | `تخرج`), Event Date, Venue Name, and **Maximum Venue Capacity (`maxVenueCapacity *`, e.g., `150` guests)**.
2. **Step 2 — الباقة والحقول المطلوبة في نموذج التسجيل (Plan & Requested Dynamic Form Fields):**
   * Select Invitation Plan (`2,500 EGP` vs `4,500 EGP`).
   * **Interactive "Requested RSVP Form Fields" Selector:**
     * Shows locked mandatory fields: `✓ الاسم بالكامل (Full Name)` & `✓ البريد الإلكتروني (Email - Required for QR Delivery)`.
     * Allows the client to check or type any additional fields they want the Admin to add to their Invitation's RSVP form (e.g., `رقم الهاتف`, `عدد المرافقين`, `صلة القرابة / فئة الضيف`, `ملاحظات غذائية`, `كلمة تهنئة للذكرى`, or custom text fields!).
3. **Step 3 — الدفع اليدوي ورفع صورة التحويل (Manual Payment Screenshot Upload):**
   * InstaPay / Vodafone Cash / Bank Transfer details + drag-and-drop payment screenshot uploader (uploads to `"payment_receipts"` bucket and shows image preview).
4. **Step 4 — تأكيد الطلب ورابط المتابعة وصندوق البريد:**
   * Creates the Order (`serviceType: "invitation"`, `orderStatus: "pending_payment"`, saving `requestedRsvpFields` and `maxVenueCapacity` inside `clientSubmittedAssetsJson`) and Payment record in Appwrite (and `localStorage` `"asar_orders_cache"`).
   * Displays the Order ID and a direct button to open the **Client Account Portal & RSVP Mailbox (`http://localhost:3000/account`)**.

