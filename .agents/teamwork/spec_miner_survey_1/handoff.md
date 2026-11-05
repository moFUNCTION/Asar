# Handoff Report: Competitive Specification Mining & Analysis

**Author:** `teamwork_spec_miner` (Survey Investigator 1)  
**Date:** 2026-11-04T00:25:00Z  
**Type:** Hard Handoff  
**Workspace:** `d:\asar\.agents\teamwork\spec_miner_survey_1`  
**Primary Deliverable:** `d:\asar\.agents\teamwork\spec_miner_survey_1\competitive_analysis.md`

---

## 1. Observation

1. **Competitor Platform Investigation (`https://chungdoi.com/wedding-website`):**
   * Investigated live via `read_url_content` and web search. The site is a Next.js single-link wedding invitation and website platform.
   * Observed JSON-LD schema definitions:
     * `"featureList": ["Free online wedding invitation maker", "Hundreds of beautiful templates", "Mobile responsive design", "Easy sharing via link or QR code", "No sign-up required to start", "QR code for gift money", "Google Maps venue navigation", "RSVP and guest management", "Photo gallery", "Countdown timer", "Multilingual support"]`.
     * Guide page (`https://chungdoi.com/create-wedding-invitation`) JSON-LD schema confirms full section breakdown:
       `["Couple info", "Family info", "Ceremony", "Reception", "Wedding day schedule", "Countdown and add to calendar", "Photo gallery", "RSVP", "Guestbook", "Gift box", "Thank-you note", "Envelope", "Background music"]`.
   * Live UI observation:
     * Background audio: Vinyl record rotating floating widget on screen corner, tap-to-play with unmute handling, curated audio library or custom upload.
     * Gift box ("Hộp mừng cưới"): Auto-generates standard VietQR code for Vietnamese banks, displaying account holder name, account number, 1-tap copy button, and auto-filled transfer memo (`Mung cuoi [Guest]`).
     * Wishing Wall ("Sổ lưu bút online"): Public congratulations cards with guest name, timestamp, congratulatory message, and reaction counters.
     * Smart RSVP: Inline form and modal dialog, guest name lookup or personalized link, attendance status, party size, transport/shuttle bus query (`Need a shuttle?`), meal preferences, dietary notes, and real-time dashboard sync.
     * Envelope: Interactive virtual envelope opening animation with wax seal and guest's personalized name on the envelope cover.

2. **Benchmark Platforms (WithJoy & Zola):**
   * **WithJoy (`withjoy.com`):** Smart RSVP with guest party lookup, sub-event permissions, multi-event schedules (rehearsal dinner, ceremony, reception, post-wedding brunch), zero-fee cash registry funds, and digital guestbook.
   * **Zola (`zola.com`):** Modular drag-and-drop website editor with custom blocks, deep registry integration (physical gifts, honeymoon funds), multi-event itineraries with dress codes, photo galleries, and collapsible FAQ accordions.

3. **Current ASAR Codebase State:**
   * `docs/ASAR_PROJECT_ARCHITECTURE.md` (lines 568–575): Documents a 3-layer visual builder for `apps/Admin` and custom event storefront in `apps/Invitation`.
   * `apps/Invitation/src/components/renderer/types.ts` (lines 70–85): `SectionBlockConfig` currently only defines:
     `type: "hero" | "countdown" | "schedule" | "timeline" | "gallery" | "map" | "venue_and_dress" | "rsvp"`.
   * `apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx` (lines 3–11): `SectionBlockType` only supports:
     `type: "hero" | "countdown" | "story_timeline" | "gallery" | "venue_map" | "custom_highlight" | "rsvp_form"`.
   * `packages/react-appwrite/src/AsarDomain/models.ts` (lines 214–225): `InvitationSectionBlock` only has:
     `type: "hero" | "countdown" | "story" | "schedule" | "location_map" | "gallery" | "rsvp_form" | "custom_text"`.
   * Missing in ASAR currently: Dedicated models and components for `wishing_wall` (interactive guestbook), `music_player` (floating vinyl soundtrack widget), `blessing_box` (digital gift registry / bank QR), `multi_event_schedule` (multi-venue sub-events), and `dress_code_faq` (expanded attire palette + FAQs).

---

## 2. Logic Chain

1. **Premise 1:** The user request (`ORIGINAL_REQUEST.md`) requires analyzing competitor wedding platforms (including `https://chungdoi.com/wedding-website`, WithJoy, and Zola) and establishing a modular section-based website creation editor in Admin with modern interactive features across Invitation and Booth.
2. **Premise 2:** Observations from ChungDoi, WithJoy, and Zola demonstrate that leading wedding website platforms require 10+ standard modular sections: Hero with countdown and virtual envelope, Love Story milestone timeline, Multi-event schedule with direct navigation, Interactive wishing wall with real-time blessings, Floating background music player, Digital blessing box with banking QR and 1-tap copy, Smart RSVP with party size / meals / transport, Lightbox photo gallery, Location map, and Dress code with FAQ accordion.
3. **Premise 3:** ASAR's existing data contracts (`models.ts` and `types.ts`) and Admin editor (`SectionBlocksManager.tsx`) currently only implement 6–7 basic blocks, omitting the wishing wall, floating audio player, blessing box QR, multi-event itinerary, and FAQ accordion.
4. **Premise 4:** Therefore, to achieve competitive parity and satisfy requirements R1, R2, and R3, ASAR must expand its section schema, implement the missing modular section configurations in `apps/Admin`, create the corresponding interactive renderer components in `apps/Invitation`, and align the photo/audio pipeline with `apps/Booth`.
5. **Conclusion:** The comprehensive competitive survey document at `d:\asar\.agents\teamwork\spec_miner_survey_1\competitive_analysis.md` provides the exact technical and architectural blueprints, interface definitions, 37 discovered features, and 15 handled edge cases required to guide the architecture update and implementation work.

---

## 3. Caveats

* **Zero-Implementation Constraint:** In accordance with the role instructions as a read-only specification miner, no source code files in `packages/` or `apps/` were modified. Only research metadata was written to `d:\asar\.agents\teamwork\spec_miner_survey_1`.
* **VietQR vs. MENA/Global Banking Standards:** ChungDoi relies specifically on VietQR (NAPAS 247). For ASAR's primary Egyptian/Arab and international markets, the Blessing Box schema was generalized in the analysis to support InstaPay, Vodafone Cash, Bank Transfer / IBAN, alongside VietQR or QR image URLs.
* **Audio Autoplay Policies:** Mobile browsers enforce strict user gesture requirements before playing audio. The proposed architecture accounts for this by binding audio initialization to the user's tap on the virtual envelope wax seal or floating vinyl player.

---

## 4. Conclusion

The competitive investigation is complete. A 37-feature, 10-section competitive teardown and architectural delta analysis has been produced in:
`d:\asar\.agents\teamwork\spec_miner_survey_1\competitive_analysis.md`.

This report provides the orchestrator, architect, and developer agents with:
1. Complete benchmark matrices comparing ChungDoi, WithJoy, Zola, and ASAR.
2. Step-by-step user journeys for both Admin/Couple creators and Wedding Guests.
3. Detailed component breakdowns and TypeScript configuration schemas for all 10+ modular sections.
4. Formal Specification Miner tables: 37 Features Discovered and 15 Edge Cases.
5. Exact schema additions for `packages/react-appwrite` and component plans for `apps/Admin`, `apps/Invitation`, and `apps/Booth`.

---

## 5. Verification Method

To independently verify this survey:
1. Inspect the deliverable file:
   `view_file` on `d:\asar\.agents\teamwork\spec_miner_survey_1\competitive_analysis.md`.
2. Verify live competitor source data:
   Inspect `https://chungdoi.com/wedding-website` and `https://chungdoi.com/create-wedding-invitation` (or the local snapshot in cache).
3. Verify existing ASAR gaps:
   `view_file` on `d:\asar\packages\react-appwrite\src\AsarDomain\models.ts` (lines 214–230) and `d:\asar\apps\Admin\src\components\invitation-studio\SectionBlocksManager.tsx` (lines 3–11) to confirm absence of `wishing_wall`, `blessing_box`, and `music_player` section block types.
