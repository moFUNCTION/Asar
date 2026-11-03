# AGENT 08 — Custom Event Website Renderer, Dynamic RSVP Form & Digital Guest QR Pass

> **Agent Role:** Custom Invitation Renderer, Dynamic Form Engine & QR Pass Specialist  
> **Target Workspace:** `apps/Invitation` (Port `3003`)  
> **Mandatory Design Reference:** `docs/ASAR_DESIGN_SYSTEM.md`  
> **Mandatory Architecture Reference:** `docs/ASAR_PROJECT_ARCHITECTURE.md`

---

## 1. Strict Parallel Execution Boundaries (Zero-Conflict Rules)

### ✅ Files You Own (CREATE / MODIFY ONLY THESE):
* `apps/Invitation/src/index.css` *(Modify to apply `docs/ASAR_DESIGN_SYSTEM.md` luxury tokens)*
* `apps/Invitation/src/App.tsx` *(Modify)*
* `apps/Invitation/src/components/renderer/ThemeWrapper.tsx` *(Create)*
* `apps/Invitation/src/components/renderer/HeroBlock.tsx` *(Create)*
* `apps/Invitation/src/components/renderer/CountdownBlock.tsx` *(Create)*
* `apps/Invitation/src/components/renderer/StoryTimelineBlock.tsx` *(Create)*
* `apps/Invitation/src/components/renderer/GalleryBlock.tsx` *(Create)*
* `apps/Invitation/src/components/renderer/VenueMapAndDressCodeBlock.tsx` *(Create)*
* `apps/Invitation/src/components/renderer/DynamicRsvpFormBlock.tsx` *(Create)*
* `apps/Invitation/src/components/pass/GuestQrPassCard.tsx` *(Create)*
* `apps/Invitation/src/components/pass/VenueQrScanner.tsx` *(Create)*
* `apps/Invitation/src/pages/CustomEventPage.tsx` *(Create)*
* `apps/Invitation/src/pages/GuestPassPage.tsx` *(Create)*

### 🚫 Files You Must NEVER Touch:
* Do **NOT** create or modify any files inside `apps/Invitation/src/components/landing/*` or `apps/Invitation/src/pages/InvitationLandingPage.tsx` (Strictly owned by **Agent 07**).
* Do **NOT** touch `apps/Booth`, `apps/Admin`, `apps/Main`, or `packages/*`.

### 🤝 Cross-Agent Integration Contract in `apps/Invitation/src/App.tsx`:
Import `InvitationLandingPage` from `./pages/InvitationLandingPage` (created by Agent 07) and route between the 3 views:
1. Default (`/`): `<InvitationLandingPage onPreviewEvent={(slug) => setView({ mode: "event", slug })} onPreviewPass={(rsvpId) => setView({ mode: "pass", rsvpId })} />`
2. Event View (`/e/:slug` or `?event=:slug`): `<CustomEventPage slug={slug} onBack={() => ...} onOpenPass={(rsvpId) => ...} />`
3. Guest QR Pass View (`/pass/:rsvpId` or `?pass=:rsvpId`): `<GuestPassPage rsvpId={rsvpId} onBack={() => ...} />`
Also include a floating switcher pill in the bottom-left corner so reviewers can jump between `1. صفحة خدمات الدعوات (Landing)`, `2. موقع دعوة مخصص حي (Custom Event Demo)`, and `3. بطاقة الدخول والـ QR (Approved Guest QR Pass)`.

---

## 2. Exact Implementation Requirements

### 2.1. `CustomEventPage.tsx` & `ThemeWrapper.tsx` — Flexible Multi-Occasion Event Website
* Loads the invitation document by `slug` from Appwrite collection `"invitations"` or `localStorage` (`"asar_invitations_cache"`), with built-in rich presets for:
  * `"omar-and-layla"` (Luxury Royal Wedding in Alexandria)
  * `"cairo-jazz-festival"` (Cultural & Music Festival Showcase)
  * `"asar-leadership-gala"` (Noir VIP Gala & Corporate Summit)
* `ThemeWrapper.tsx` dynamically applies the Admin-configured `themeConfigJson` (Custom primary/secondary/background colors, `Amiri`/`Playfair Display`/`Cairo` typography, RTL/LTR direction, and optional `@repo/ui-components` `GradientWaves`, `SplashCursor`, or `GlowCursor`).
* Iterates over the ordered `sectionsConfigJson` blocks and renders:
  1. **`HeroBlock.tsx`:** Cover image, animated title (`BlurText` / `SplitText`), occasion badge, date/time/venue pills, and smooth scroll CTA to the RSVP Form.
  2. **`CountdownBlock.tsx`:** Live ticking Days / Hours / Minutes / Seconds countdown cards.
  3. **`StoryTimelineBlock.tsx`:** Visual timeline of milestones (e.g., Couple's love story or Festival/Gala schedule).
  4. **`GalleryBlock.tsx`:** Interactive photo showcase (supports `CircularGallery`, `DecayCard` polaroids, or Bento grid).
  5. **`VenueMapAndDressCodeBlock.tsx`:** Venue details, Google Maps action button, and Dress Code palette swatches.
  6. **`DynamicRsvpFormBlock.tsx`:** The dynamic data-collection form configured by the Admin.

---

### 2.2. `DynamicRsvpFormBlock.tsx` — Dynamic Guest Form & Client Mailbox Delivery
This component renders the exact custom fields defined by the Admin in `invitation.formSchemaJson`:
1. **Dynamic Field Renderer:**
   * Supports `text`, `email`, `tel`, `number`, `select`, `radio`, `checkbox`, and `textarea`.
   * **Strict Validation Rule:** Always enforces that **`guestName`** and **`guestEmail` (`type="email"`, valid email format)** are filled out and required! Includes a helper caption under the email input: *"سيتم إرسال بطاقة الدعوة الخاصة بك (QR Code) أو حالة تأكيد الحضور إلى هذا البريد الإلكتروني."*
2. **Submission to Client's Account Mailbox:**
   * When the guest submits the form:
     * Creates a new document in Appwrite collection `"invitation_rsvps"` (and syncs to `localStorage` `"asar_invitation_rsvps_cache"` so the Client Mailbox in `apps/Main` receives it immediately):
       * `invitationId`, `clientId`, `guestName`, `guestEmail`, `guestPhone`, `companionsCount`, `dynamicResponsesJson` (JSON object of all custom field labels and answers), `status: "pending"`.
     * Displays an elegant confirmation card:
       * **"تم إرسال بياناتك بنجاح إلى صاحب الدعوة! (Your RSVP Has Been Sent to the Host's Mailbox)"**
       * Explains that once the host reviews and approves the request in their Mailbox, the guest will receive an automated email via **EmailJS** containing their personal **Invitation QR Code Pass** (or a capacity notice if the venue is full).

---

### 2.3. `GuestQrPassCard.tsx` & `VenueQrScanner.tsx` — Approved Guest's Digital QR Code Pass
When the Client approves a guest's RSVP in their Mailbox, the guest receives an email with their QR Code and a link to `/pass/:rsvpId` (`GuestPassPage.tsx`):
* **Luxury Digital Pass Card (`GuestQrPassCard.tsx`):**
  * Styled like a royal embossed boarding pass / VIP invitation ticket (`TiltedCard` 3D tilt effect with gold foil border).
  * Shows Event Title, Date, Time, Venue, Guest Name (`guestName`), Approved Seats (`companionsCount`), Pass Verification Status (`✓ CONFIRMED ENTRY PASS`), and the high-contrast scannable **Invitation QR Code** (`buildQrCodeImageUrl`).
  * Includes **"Download Pass as Image / Print"** and **"Open Venue Gate Scanner Simulation"** (`VenueQrScanner.tsx` — allows the host/security to verify the QR token and mark `isCheckedInAtVenue = true`).

