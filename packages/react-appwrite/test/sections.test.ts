// =============================================================
// ASAR (Athar / أثر) — Modular Section Domain Engine Unit Tests
// Verified with: node --experimental-strip-types --test
// =============================================================

import test from "node:test";
import assert from "node:assert/strict";

import {
  ALL_EVENT_SECTION_TYPES,
  DEFAULT_LOCKED_RSVP_EMAIL_FIELD,
  createDefaultModularWebsiteConfig,
  parseModularWebsiteConfig,
  validateModularWebsiteConfig,
  type EventSectionType,
  type EventSection,
  type ModularWebsiteConfig,
  type CoverHeroSection,
  type CoupleStorySection,
  type EventScheduleSection,
  type PhotoGallerySection,
  type WishingWallSection,
  type DigitalGiftRegistrySection,
  type BackgroundAudioSection,
  type VenueLocationSection,
  type LiveCountdownSection,
  type CustomHighlightSection,
  type DynamicRsvpSection,
} from "../src/AsarDomain/sections.ts";

// -------------------------------------------------------------
// 1. Section Type Literals & Default Factory
// -------------------------------------------------------------
test("Modular Domain: ALL_EVENT_SECTION_TYPES contains exactly the 11 required section types", () => {
  const expectedTypes: EventSectionType[] = [
    "cover_hero",
    "couple_story",
    "event_schedule",
    "photo_gallery",
    "wishing_wall",
    "digital_gift_registry",
    "background_audio",
    "venue_location",
    "live_countdown",
    "custom_highlight",
    "dynamic_rsvp",
  ];

  assert.equal(ALL_EVENT_SECTION_TYPES.length, 11);
  for (const t of expectedTypes) {
    assert.ok(ALL_EVENT_SECTION_TYPES.includes(t), `Missing expected section type literal: ${t}`);
  }
});

test("createDefaultModularWebsiteConfig: generates valid 11-section v2.0 config", () => {
  const config = createDefaultModularWebsiteConfig({
    coupleTitle: "Omar & Layla",
    eventDate: "2026-11-20",
    venueName: "Four Seasons Alexandria",
  });

  assert.equal(config.version, "2.0");
  assert.equal(config.sections.length, 11);

  // Validate all types are represented
  const presentTypes = config.sections.map((s) => s.type);
  for (const t of ALL_EVENT_SECTION_TYPES) {
    assert.ok(presentTypes.includes(t), `Default config missing section type: ${t}`);
  }

  // Check section order is sequential
  for (let i = 0; i < config.sections.length; i++) {
    assert.equal(config.sections[i].order, i + 1);
  }

  // Validate CoverHero section specifics
  const hero = config.sections.find((s) => s.type === "cover_hero") as CoverHeroSection;
  assert.ok(hero);
  assert.equal(hero.coupleTitle, "Omar & Layla");
  assert.equal(hero.dateDisplay, "2026-11-20");
  assert.equal(hero.venueDisplay, "Four Seasons Alexandria");
  assert.equal(hero.countdownEnabled, true);

  // Validate LiveCountdown section specifics
  const countdown = config.sections.find((s) => s.type === "live_countdown") as LiveCountdownSection;
  assert.ok(countdown);
  assert.ok(countdown.targetDateIso.includes("2026-11-20"));

  // Validate DynamicRsvp section specifics & locked email
  const rsvp = config.sections.find((s) => s.type === "dynamic_rsvp") as DynamicRsvpSection;
  assert.ok(rsvp);
  assert.equal(rsvp.isLocked, true);
  assert.equal(rsvp.allowPlusOnes, true);
  const emailField = rsvp.formSchema.find((f) => f.type === "email");
  assert.ok(emailField);
  assert.equal(emailField.locked, true);
  assert.equal(emailField.required, true);

  // Pass validation
  const validation = validateModularWebsiteConfig(config);
  assert.equal(validation.isValid, true);
  assert.equal(validation.errors.length, 0);
});

// -------------------------------------------------------------
// 2. parseModularWebsiteConfig: Robustness on Empty / Corrupted Data
// -------------------------------------------------------------
test("parseModularWebsiteConfig: handles null, undefined, empty, and invalid JSON safely with zero crashes", () => {
  const testCases = [
    null,
    undefined,
    "",
    "   ",
    "not-json",
    "{ corrupted json",
    12345,
    true,
    false,
    {},
    [],
    { version: "unknown" },
  ];

  for (const input of testCases) {
    const parsed = parseModularWebsiteConfig(input);
    assert.ok(parsed, "Parser should never return null or undefined");
    assert.equal(parsed.version, "2.0");
    assert.ok(Array.isArray(parsed.sections));
    assert.ok(parsed.sections.length > 0);
    const validation = validateModularWebsiteConfig(parsed);
    assert.equal(validation.isValid, true);
  }
});

// -------------------------------------------------------------
// 3. parseModularWebsiteConfig: Modern Config Parsing
// -------------------------------------------------------------
test("parseModularWebsiteConfig: cleanly parses already valid modern config", () => {
  const initial = createDefaultModularWebsiteConfig({
    coupleTitle: "Kareem & Nour",
    eventDate: "2026-12-15",
    venueName: "Kempinski Nile Hotel",
  });

  const jsonString = JSON.stringify(initial);
  const parsed = parseModularWebsiteConfig(jsonString);

  assert.equal(parsed.version, "2.0");
  assert.equal(parsed.sections.length, 11);

  const hero = parsed.sections.find((s) => s.type === "cover_hero") as CoverHeroSection;
  assert.equal(hero.coupleTitle, "Kareem & Nour");
  assert.equal(hero.venueDisplay, "Kempinski Nile Hotel");

  const rsvp = parsed.sections.find((s) => s.type === "dynamic_rsvp") as DynamicRsvpSection;
  assert.ok(rsvp.formSchema.some((f) => f.type === "email" && f.locked && f.required));
});

// -------------------------------------------------------------
// 4. parseModularWebsiteConfig: Legacy Flat Block Migration
// -------------------------------------------------------------
test("parseModularWebsiteConfig: seamlessly migrates legacy flat blocks into modern EventSection models", () => {
  const legacyFlatBlocks = [
    {
      id: "legacy-hero-1",
      type: "hero",
      title: "Hero Banner",
      mainTitle: "Tarek & Dina",
      overline: "CELEBRATING",
      datePill: "18 December 2026",
      venuePill: "Mena House, Giza",
      coverImageUrl: "https://example.com/tarek-dina.jpg",
      isVisible: true,
      order: 1,
    },
    {
      id: "legacy-countdown-2",
      type: "countdown",
      title: "Timer",
      countdownHeading: "Time Until Forever",
      targetDate: "2026-12-18T18:00:00Z",
      isVisible: true,
      order: 2,
    },
    {
      id: "legacy-story-3",
      type: "story_timeline",
      title: "Our Story",
      timelineItems: [
        { id: "item-1", time: "2022", title: "First Met", description: "At university" },
        { id: "item-2", time: "2024", title: "Engagement", description: "In Paris" },
      ],
      isVisible: true,
      order: 3,
    },
    {
      id: "legacy-gallery-4",
      type: "gallery",
      title: "Photo Album",
      galleryImages: [
        "https://example.com/photo1.jpg",
        "https://example.com/photo2.jpg",
      ],
      galleryMode: "grid",
      isVisible: true,
      order: 4,
    },
    {
      id: "legacy-venue-5",
      type: "venue_map",
      title: "Location",
      venueName: "Marriott Mena House",
      venueAddress: "6 Pyramids Road, Giza",
      mapUrl: "https://maps.google.com/?q=Mena+House",
      parkingNote: "Valet on premises",
      isVisible: true,
      order: 5,
    },
    {
      id: "legacy-rsvp-6",
      type: "rsvp_form",
      title: "RSVP Now",
      isVisible: true,
      order: 6,
      // Legacy blocks often omit email schema or have empty fields
    },
    {
      id: "legacy-note-7",
      type: "custom_highlight",
      title: "Special Note",
      highlightBadge: "✦ A NOTE FROM HOSTS",
      highlightText: "We look forward to hosting you.",
      isVisible: false,
      order: 7,
    },
  ];

  const parsed = parseModularWebsiteConfig(legacyFlatBlocks);

  assert.equal(parsed.version, "2.0");
  assert.equal(parsed.sections.length, 7);

  // Check CoverHero migration
  const hero = parsed.sections[0] as CoverHeroSection;
  assert.equal(hero.type, "cover_hero");
  assert.equal(hero.coupleTitle, "Tarek & Dina");
  assert.equal(hero.dateDisplay, "18 December 2026");
  assert.equal(hero.venueDisplay, "Mena House, Giza");
  assert.equal(hero.coverImageUrl, "https://example.com/tarek-dina.jpg");
  assert.equal(hero.enabled, true);

  // Check LiveCountdown migration
  const countdown = parsed.sections[1] as LiveCountdownSection;
  assert.equal(countdown.type, "live_countdown");
  assert.equal(countdown.heading, "Time Until Forever");
  assert.equal(countdown.targetDateIso, "2026-12-18T18:00:00Z");

  // Check CoupleStory migration
  const story = parsed.sections[2] as CoupleStorySection;
  assert.equal(story.type, "couple_story");
  assert.equal(story.milestones.length, 2);
  assert.equal(story.milestones[0].yearOrDate, "2022");
  assert.equal(story.milestones[0].title, "First Met");

  // Check PhotoGallery migration
  const gallery = parsed.sections[3] as PhotoGallerySection;
  assert.equal(gallery.type, "photo_gallery");
  assert.equal(gallery.images.length, 2);
  assert.equal(gallery.images[0].url, "https://example.com/photo1.jpg");
  assert.equal(gallery.layoutMode, "grid");

  // Check VenueLocation migration
  const venue = parsed.sections[4] as VenueLocationSection;
  assert.equal(venue.type, "venue_location");
  assert.equal(venue.venueName, "Marriott Mena House");
  assert.equal(venue.address, "6 Pyramids Road, Giza");
  assert.equal(venue.parkingNote, "Valet on premises");

  // Check DynamicRsvp migration & automatic injection of locked email
  const rsvp = parsed.sections[5] as DynamicRsvpSection;
  assert.equal(rsvp.type, "dynamic_rsvp");
  assert.equal(rsvp.isLocked, true);
  assert.ok(Array.isArray(rsvp.formSchema));
  const emailField = rsvp.formSchema.find((f) => f.type === "email");
  assert.ok(emailField, "Migrated RSVP must guarantee a locked email field");
  assert.equal(emailField.locked, true);
  assert.equal(emailField.required, true);

  // Check CustomHighlight migration
  const highlight = parsed.sections[6] as CustomHighlightSection;
  assert.equal(highlight.type, "custom_highlight");
  assert.equal(highlight.badge, "✦ A NOTE FROM HOSTS");
  assert.equal(highlight.quoteText, "We look forward to hosting you.");
  assert.equal(highlight.enabled, false);

  // Validate the migrated config is 100% valid
  const validation = validateModularWebsiteConfig(parsed);
  assert.equal(validation.isValid, true);
  assert.equal(validation.errors.length, 0);
});

// -------------------------------------------------------------
// 5. validateModularWebsiteConfig: Architectural Constraints
// -------------------------------------------------------------
test("validateModularWebsiteConfig: rejects corrupted or invalid configuration payloads", () => {
  // Not an object
  assert.equal(validateModularWebsiteConfig(null).isValid, false);
  assert.equal(validateModularWebsiteConfig("string").isValid, false);

  // Wrong version
  assert.equal(
    validateModularWebsiteConfig({ version: "1.0", sections: [] }).isValid,
    false
  );

  // Non-array sections
  assert.equal(
    validateModularWebsiteConfig({ version: "2.0", sections: "not-an-array" }).isValid,
    false
  );

  // Empty sections array
  assert.equal(
    validateModularWebsiteConfig({ version: "2.0", sections: [] }).isValid,
    false
  );

  // Duplicate IDs
  const duplicateIdConfig: ModularWebsiteConfig = {
    version: "2.0",
    sections: [
      {
        id: "duplicate-id",
        type: "cover_hero",
        title: "Cover",
        enabled: true,
        order: 1,
        coupleTitle: "A & B",
        dateDisplay: "2026-11-20",
        venueDisplay: "Venue",
      },
      {
        id: "duplicate-id",
        type: "live_countdown",
        title: "Countdown",
        enabled: true,
        order: 2,
        targetDateIso: "2026-11-20T00:00:00Z",
        heading: "Countdown",
        completedMessage: "Done",
      },
    ],
  };
  const dupResult = validateModularWebsiteConfig(duplicateIdConfig);
  assert.equal(dupResult.isValid, false);
  assert.ok(dupResult.errors.some((e) => e.includes("Duplicate section id")));

  // Missing locked email field in dynamic_rsvp
  const missingEmailRsvpConfig: ModularWebsiteConfig = {
    version: "2.0",
    sections: [
      {
        id: "sec-rsvp",
        type: "dynamic_rsvp",
        title: "RSVP",
        enabled: true,
        order: 1,
        formSchema: [
          {
            id: "f1",
            name: "guestName",
            labelEn: "Name",
            labelAr: "الاسم",
            type: "text",
            required: true,
          },
        ],
        allowPlusOnes: true,
        maxCompanions: 3,
        askDietary: true,
        askTransportation: false,
      },
    ],
  };
  const rsvpResult = validateModularWebsiteConfig(missingEmailRsvpConfig);
  assert.equal(rsvpResult.isValid, false);
  assert.ok(rsvpResult.errors.some((e) => e.includes("locked email field")));

  // Empty coupleTitle in cover_hero
  const emptyHeroTitleConfig: ModularWebsiteConfig = {
    version: "2.0",
    sections: [
      {
        id: "sec-hero",
        type: "cover_hero",
        title: "Cover",
        enabled: true,
        order: 1,
        coupleTitle: "  ",
        dateDisplay: "2026-11-20",
        venueDisplay: "Venue",
      },
    ],
  };
  const heroResult = validateModularWebsiteConfig(emptyHeroTitleConfig);
  assert.equal(heroResult.isValid, false);
  assert.ok(heroResult.errors.some((e) => e.includes("non-empty 'coupleTitle'")));
});

// -------------------------------------------------------------
// 6. Roundtrip Serialization & Order Integrity
// -------------------------------------------------------------
test("Modular Domain: JSON serialization roundtrip preserves all 11 sections, ordering and field values", () => {
  const original = createDefaultModularWebsiteConfig({
    coupleTitle: "Youssef & Mariam",
    eventDate: "2026-10-10",
    venueName: "El Gouna Red Sea",
  });

  // Mutate order to simulate user drag-and-drop reordering
  original.sections[0].order = 2; // cover_hero moved to order 2
  original.sections[1].order = 1; // background_audio moved to order 1
  original.sections[4].enabled = false; // toggle off event_schedule

  const serialized = JSON.stringify(original);
  const restored = parseModularWebsiteConfig(serialized);

  assert.equal(restored.version, "2.0");
  assert.equal(restored.sections.length, 11);

  const hero = restored.sections.find((s) => s.type === "cover_hero");
  assert.ok(hero);
  assert.equal(hero.order, 2);

  const audio = restored.sections.find((s) => s.type === "background_audio");
  assert.ok(audio);
  assert.equal(audio.order, 1);

  const schedule = restored.sections.find((s) => s.type === "event_schedule");
  assert.ok(schedule);
  assert.equal(schedule.enabled, false);

  const validation = validateModularWebsiteConfig(restored);
  assert.equal(validation.isValid, true);
});
