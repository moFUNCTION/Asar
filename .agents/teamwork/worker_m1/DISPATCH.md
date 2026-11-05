## 2026-11-04T00:27:51Z

You are an expert full-stack TypeScript engineer implementing Milestone 1 (M1: Architecture Documentation & Shared Modular Section Domain Engine).
Your working directory is: d:\asar\.agents\teamwork\worker_m1

MANDATORY FIRST STEP:
Read d:\asar\.agents\teamwork\ORIGINAL_REQUEST.md to understand the exact requirements and constraints.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER RULES:
- dont over run npm run build without any reason
- and dont make scripts or code generators without anyreason , only make that if its needed

REFERENCE MATERIALS TO READ FIRST:
1. `d:\asar\.agents\teamwork\orchestrator\PROJECT.md`
2. `d:\asar\.agents\teamwork\spec_miner_survey_1\competitive_analysis.md`
3. `d:\asar\.agents\teamwork\survey_explorer_1\admin_modular_editor_analysis.md`

FILES YOU OWN EXCLUSIVELY:
- `docs/COMPETITIVE_ANALYSIS.md`
- `d:\asar\PROJECT.md`
- `docs/ASAR_PROJECT_ARCHITECTURE.md`
- `packages/react-appwrite/src/AsarDomain/sections.ts`
- `packages/react-appwrite/src/AsarDomain/index.ts`
- `packages/react-appwrite/src/index.ts`
- `packages/react-appwrite/test/sections.test.ts`

TASKS:
1. Publish `docs/COMPETITIVE_ANALYSIS.md` by incorporating the comprehensive competitive benchmark from `d:\asar\.agents\teamwork\spec_miner_survey_1\competitive_analysis.md`.
2. Sync `d:\asar\PROJECT.md` with `d:\asar\.agents\teamwork\orchestrator\PROJECT.md`.
3. Update `docs/ASAR_PROJECT_ARCHITECTURE.md` to incorporate the modular section website creation editor architecture in Admin, the discriminated union schema, component responsibilities across Admin, Invitation, and Booth, and the end-to-end data flow.
4. Implement `packages/react-appwrite/src/AsarDomain/sections.ts`:
   - Define all 11 `EventSectionType` literals:
     `"cover_hero" | "couple_story" | "event_schedule" | "photo_gallery" | "wishing_wall" | "digital_gift_registry" | "background_audio" | "venue_location" | "live_countdown" | "custom_highlight" | "dynamic_rsvp"`
   - Define strongly-typed section models:
     * `CoverHeroSection`: coupleTitle, dateDisplay, venueDisplay, headline, coverImageUrl, countdownEnabled, audioPromptBadge
     * `CoupleStorySection`: title, subtitle, milestones array ({ id, yearOrDate, title, description, imageUrl })
     * `EventScheduleSection`: title, subtitle, scheduleItems array ({ id, time, eventName, locationName, address, mapUrl, dressCode, calendarSummary, calendarDescription })
     * `PhotoGallerySection`: title, subtitle, layoutMode ("masonry" | "grid" | "carousel"), images array ({ id, url, caption, category }), categories string[]
     * `WishingWallSection`: title, subtitle, moderationRequired, greetingPrompt, placeholder, allowReactions, maxMessageLength
     * `DigitalGiftRegistrySection`: title, subtitle, greetingNote, accounts array ({ id, bankName, accountNumber, accountHolder, branchName, qrImageUrl, transferMemo, currency }), cashGiftingEnabled, cashGiftingInstructions
     * `BackgroundAudioSection`: title, songTitle, artistName, audioUrl, autoPlayNotice, loopEnabled, initialMuted
     * `VenueLocationSection`: venueName, address, mapCoordinates, mapEmbedUrl, parkingNote, dressCodeTitle, dressCodeSwatches ({ hex, label })
     * `LiveCountdownSection`: targetDateIso, heading, completedMessage
     * `CustomHighlightSection`: badge, title, quoteText, author, backgroundStyle, imageUrl
     * `DynamicRsvpSection`: title, subtitle, deadlineDate, capacityLimit, formSchema (DynamicFormField array with locked email), allowPlusOnes, maxCompanions, askDietary, askTransportation
   - Define discriminated union `EventSection`.
   - Define `ModularWebsiteConfig` (version: "2.0", sections: EventSection[], themeConfig, metadata).
   - Implement `createDefaultModularWebsiteConfig(options?: Partial<{ coupleTitle: string; eventDate: string; venueName: string }>): ModularWebsiteConfig`.
   - Implement `parseModularWebsiteConfig(raw: unknown): ModularWebsiteConfig`: must gracefully migrate legacy flat `InvitationSectionBlock[]` or unparsed JSON with zero crashes into modern `EventSection[]`.
   - Implement `validateModularWebsiteConfig(config: unknown): { isValid: boolean; errors: string[] }`.
   - Re-export everything from `packages/react-appwrite/src/AsarDomain/index.ts` and `packages/react-appwrite/src/index.ts`.
5. Create automated unit test suite `packages/react-appwrite/test/sections.test.ts`:
   - Test default config generation.
   - Test parsing valid modern config.
   - Test migration parser from legacy flat blocks.
   - Test validation of corrupted/missing data.
   - Test serialization and roundtrip integrity.
6. Run verification:
   - `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json`
   - `node --experimental-strip-types --test packages/react-appwrite/test/sections.test.ts`
   - `node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts`
7. Write your handoff report to `d:\asar\.agents\teamwork\worker_m1\handoff.md`.
8. Send a completion message back to the orchestrator (conversation ID: 1702b5c8-8740-4f25-b6f5-898d68518b3a).
