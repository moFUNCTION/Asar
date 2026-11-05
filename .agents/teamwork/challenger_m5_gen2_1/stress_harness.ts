// =============================================================
// ASAR Milestone 5 — Empirical Adversarial Stress Harness
// Modular Section Schema, Parsing, Migration, & Reordering
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
} from "../../../packages/react-appwrite/src/AsarDomain/sections.ts";

import {
  DEFAULT_SECTION_BLOCKS,
  projectModernSectionsToLegacyBlocks,
  type InvitationSectionBlock,
} from "../../../apps/Admin/src/components/invitation-studio/SectionBlocksManager.tsx";

// -------------------------------------------------------------
// Helper: Replicate Admin Reordering Logic from SectionBlocksManager
// -------------------------------------------------------------
function simulateMoveSection(
  currentSections: EventSection[],
  index: number,
  direction: "up" | "down"
): EventSection[] {
  if (index < 0 || index >= currentSections.length) {
    return currentSections; // Safe bounds guard
  }
  if (direction === "up" && index === 0) return currentSections;
  if (direction === "down" && index === currentSections.length - 1) return currentSections;

  const targetSec = currentSections[index];
  const newIndex = direction === "up" ? index - 1 : index + 1;
  const destSec = currentSections[newIndex];

  const next = [...currentSections];
  next[index] = { ...destSec, order: index + 1 };
  next[newIndex] = { ...targetSec, order: newIndex + 1 };
  return next.map((s, i) => ({ ...s, order: i + 1 }));
}

function simulateDeleteSection(
  currentSections: EventSection[],
  id: string
): EventSection[] {
  const target = currentSections.find((s) => s.id === id);
  if (!target || target.isLocked || target.type === "dynamic_rsvp" || target.type === "cover_hero") {
    return currentSections;
  }
  const filtered = currentSections.filter((s) => s.id !== id);
  return filtered.map((s, i) => ({ ...s, order: i + 1 }));
}

function simulateInsertFromPalette(
  currentSections: EventSection[],
  newSection: EventSection
): EventSection[] {
  const rsvpIdx = currentSections.findIndex((s) => s.type === "dynamic_rsvp");
  const next = [...currentSections];
  if (rsvpIdx !== -1) {
    next.splice(rsvpIdx, 0, newSection);
  } else {
    next.push(newSection);
  }
  return next.map((s, i) => ({ ...s, order: i + 1 }));
}

function normalizeDenseOrders(sections: EventSection[]): EventSection[] {
  return sections.map((s, i) => ({ ...s, order: i + 1 }));
}

// =============================================================
// SUITE 1: SCHEMA BOUNDARIES & HOSTILE/CORRUPT INPUTS
// =============================================================

test("Stress Suite 1.1: null and undefined payloads return valid default config", () => {
  const nullParsed = parseModularWebsiteConfig(null);
  assert.equal(nullParsed.version, "2.0");
  assert.equal(nullParsed.sections.length, 11);
  assert.equal(validateModularWebsiteConfig(nullParsed).isValid, true);

  const undefParsed = parseModularWebsiteConfig(undefined);
  assert.equal(undefParsed.version, "2.0");
  assert.equal(undefParsed.sections.length, 11);
  assert.equal(validateModularWebsiteConfig(undefParsed).isValid, true);
});

test("Stress Suite 1.2: empty string, whitespace string, and corrupt JSON return valid default config", () => {
  const corruptInputs = [
    "",
    "   ",
    "\t\n  \r\n",
    "{ corrupted JSON",
    "undefined",
    "null",
    "true",
    "false",
    "12345",
    '"just a string"',
  ];

  for (const input of corruptInputs) {
    const parsed = parseModularWebsiteConfig(input);
    assert.equal(parsed.version, "2.0", `Failed on input: ${input}`);
    assert.ok(parsed.sections.length >= 11, `Expected at least 11 sections for: ${input}`);
    const res = validateModularWebsiteConfig(parsed);
    assert.equal(res.isValid, true, `Validation failed for input: ${input}: ${res.errors.join(", ")}`);
  }
});

test("Stress Suite 1.3: empty array, empty sections, and non-array sections fallback to default config", () => {
  const boundaryObjects = [
    [],
    "[]",
    {},
    "{}",
    { version: "2.0", sections: [] },
    '{"version":"2.0","sections":[]}',
    { version: "2.0", sections: "not-an-array" },
    { sections: [] },
    { sections: null },
  ];

  for (const obj of boundaryObjects) {
    const parsed = parseModularWebsiteConfig(obj);
    assert.equal(parsed.version, "2.0");
    assert.equal(parsed.sections.length, 11);
    assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
  }
});

test("Stress Suite 1.4: unknown / corrupt section types fallback gracefully to custom_highlight", () => {
  const rawSections = [
    { type: "exploit_unknown_type", title: "Weird Section" },
    { type: 9999, title: "Numeric Type" },
    { type: null, title: "Null Type" },
    { type: "", title: "Empty Type" },
  ];

  const parsed = parseModularWebsiteConfig({
    version: "2.0",
    sections: rawSections,
  });

  assert.equal(parsed.sections.length, 4);
  for (const sec of parsed.sections) {
    assert.equal(sec.type, "custom_highlight");
    assert.ok(sec.id.startsWith("sec-custom_highlight-"));
  }
  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 1.5: missing mandatory fields in sections are auto-repaired with safe defaults", () => {
  const degradedSection = {
    // missing id, title, enabled, order
    type: "cover_hero",
  };

  const parsed = parseModularWebsiteConfig([degradedSection]);
  assert.equal(parsed.sections.length, 1);
  const hero = parsed.sections[0] as CoverHeroSection;

  assert.equal(hero.type, "cover_hero");
  assert.ok(hero.id.length > 0);
  assert.equal(hero.title, "Section");
  assert.equal(hero.enabled, true);
  assert.equal(hero.order, 1);
  assert.equal(hero.coupleTitle, "Event Celebration");
});

test("Stress Suite 1.6: deep corrupt properties in concrete types normalize to safe defaults", () => {
  const deeplyCorrupt = [
    {
      type: "couple_story",
      milestones: "invalid_not_an_array",
    },
    {
      type: "event_schedule",
      scheduleItems: null,
    },
    {
      type: "photo_gallery",
      images: 42,
      categories: "invalid",
      layoutMode: "non-existent-layout",
    },
    {
      type: "wishing_wall",
      maxMessageLength: -100, // Negative length
    },
    {
      type: "digital_gift_registry",
      accounts: "not-array",
    },
    {
      type: "dynamic_rsvp",
      formSchema: "not-array",
    },
  ];

  const parsed = parseModularWebsiteConfig(deeplyCorrupt);
  assert.equal(parsed.sections.length, 6);

  const story = parsed.sections[0] as CoupleStorySection;
  assert.deepEqual(story.milestones, []);

  const schedule = parsed.sections[1] as EventScheduleSection;
  assert.deepEqual(schedule.scheduleItems, []);

  const gallery = parsed.sections[2] as PhotoGallerySection;
  assert.deepEqual(gallery.images, []);
  assert.deepEqual(gallery.categories, ["All"]);
  assert.equal(gallery.layoutMode, "masonry");

  const wishing = parsed.sections[3] as WishingWallSection;
  assert.equal(wishing.maxMessageLength, 300); // Repaired to default 300

  const gift = parsed.sections[4] as DigitalGiftRegistrySection;
  assert.deepEqual(gift.accounts, []);

  const rsvp = parsed.sections[5] as DynamicRsvpSection;
  assert.ok(Array.isArray(rsvp.formSchema));
  assert.ok(rsvp.formSchema.some((f) => f.type === "email" && f.locked && f.required));
});

test("Stress Suite 1.7: validateModularWebsiteConfig catches and reports all malformed constraints", () => {
  // Test 1: missing version
  const res1 = validateModularWebsiteConfig({ sections: [] });
  assert.equal(res1.isValid, false);
  assert.ok(res1.errors.some((e) => e.includes("Invalid version")));

  // Test 2: non-array sections
  const res2 = validateModularWebsiteConfig({ version: "2.0", sections: "foo" });
  assert.equal(res2.isValid, false);
  assert.ok(res2.errors.some((e) => e.includes("Sections must be an array")));

  // Test 3: empty sections
  const res3 = validateModularWebsiteConfig({ version: "2.0", sections: [] });
  assert.equal(res3.isValid, false);
  assert.ok(res3.errors.some((e) => e.includes("contain at least one section")));

  // Test 4: duplicate IDs
  const res4 = validateModularWebsiteConfig({
    version: "2.0",
    sections: [
      { id: "dup-1", type: "custom_highlight", title: "H1", enabled: true, order: 1, quoteText: "Q" },
      { id: "dup-1", type: "custom_highlight", title: "H2", enabled: true, order: 2, quoteText: "Q" },
    ],
  });
  assert.equal(res4.isValid, false);
  assert.ok(res4.errors.some((e) => e.includes("Duplicate section id 'dup-1'")));

  // Test 5: non-numeric order
  const res5 = validateModularWebsiteConfig({
    version: "2.0",
    sections: [
      { id: "sec-1", type: "custom_highlight", title: "H1", enabled: true, order: "first", quoteText: "Q" },
    ],
  });
  assert.equal(res5.isValid, false);
  assert.ok(res5.errors.some((e) => e.includes("numeric 'order'")));

  // Test 6: dynamic_rsvp missing locked email
  const res6 = validateModularWebsiteConfig({
    version: "2.0",
    sections: [
      {
        id: "sec-rsvp",
        type: "dynamic_rsvp",
        title: "RSVP",
        enabled: true,
        order: 1,
        formSchema: [{ id: "f1", name: "guestName", type: "text", required: true, locked: true }],
      },
    ],
  });
  assert.equal(res6.isValid, false);
  assert.ok(res6.errors.some((e) => e.includes("must contain a required, locked email field")));
});

// =============================================================
// SUITE 2: BACKWARD COMPATIBILITY MIGRATION
// =============================================================

test("Stress Suite 2.1: full DEFAULT_SECTION_BLOCKS migrates into valid EventSection[]", () => {
  const parsed = parseModularWebsiteConfig(DEFAULT_SECTION_BLOCKS);
  assert.equal(parsed.version, "2.0");
  assert.equal(parsed.sections.length, DEFAULT_SECTION_BLOCKS.length);

  const validation = validateModularWebsiteConfig(parsed);
  assert.equal(validation.isValid, true, `Validation failed: ${validation.errors.join(", ")}`);

  // Verify type mapping
  const hero = parsed.sections.find((s) => s.type === "cover_hero") as CoverHeroSection;
  assert.ok(hero);
  assert.equal(hero.coupleTitle, "Omar & Layla");
  assert.equal(hero.dateDisplay, "20 November 2026");

  const countdown = parsed.sections.find((s) => s.type === "live_countdown") as LiveCountdownSection;
  assert.ok(countdown);
  assert.equal(countdown.heading, "Counting Down to Our Forever");

  const story = parsed.sections.find((s) => s.type === "couple_story") as CoupleStorySection;
  assert.ok(story);
  assert.equal(story.milestones.length, 4);
  assert.equal(story.milestones[0].title, "Welcome Drinks & Red Carpet");

  const gallery = parsed.sections.find((s) => s.type === "photo_gallery") as PhotoGallerySection;
  assert.ok(gallery);
  assert.equal(gallery.images.length, 4);

  const venue = parsed.sections.find((s) => s.type === "venue_location") as VenueLocationSection;
  assert.ok(venue);
  assert.equal(venue.venueName, "Four Seasons Hotel Alexandria");
  assert.equal(venue.dressCodeSwatches?.length, 4);

  const rsvp = parsed.sections.find((s) => s.type === "dynamic_rsvp") as DynamicRsvpSection;
  assert.ok(rsvp);
  assert.equal(rsvp.isLocked, true);
});

test("Stress Suite 2.2: alternative legacy type aliases map to expected modern types", () => {
  const legacyAliases = [
    { type: "hero", expected: "cover_hero" },
    { type: "cover", expected: "cover_hero" },
    { type: "cover_hero", expected: "cover_hero" },
    { type: "story", expected: "couple_story" },
    { type: "story_timeline", expected: "couple_story" },
    { type: "milestones", expected: "couple_story" },
    { type: "schedule", expected: "event_schedule" },
    { type: "timeline", expected: "event_schedule" },
    { type: "gallery", expected: "photo_gallery" },
    { type: "album", expected: "photo_gallery" },
    { type: "wishing_wall", expected: "wishing_wall" },
    { type: "guestbook", expected: "wishing_wall" },
    { type: "wishes", expected: "wishing_wall" },
    { type: "gift_registry", expected: "digital_gift_registry" },
    { type: "blessing_box", expected: "digital_gift_registry" },
    { type: "bank_qr", expected: "digital_gift_registry" },
    { type: "audio", expected: "background_audio" },
    { type: "music_player", expected: "background_audio" },
    { type: "venue", expected: "venue_location" },
    { type: "location_map", expected: "venue_location" },
    { type: "countdown", expected: "live_countdown" },
    { type: "countdown_timer", expected: "live_countdown" },
    { type: "rsvp", expected: "dynamic_rsvp" },
    { type: "rsvp_form", expected: "dynamic_rsvp" },
    { type: "custom_highlight", expected: "custom_highlight" },
  ];

  for (const alias of legacyAliases) {
    const parsed = parseModularWebsiteConfig([{ type: alias.type, title: `Test ${alias.type}` }]);
    assert.equal(parsed.sections[0].type, alias.expected, `Alias '${alias.type}' did not map to '${alias.expected}'`);
  }
});

test("Stress Suite 2.3: projectModernSectionsToLegacyBlocks handles all 11 modern types without throw", () => {
  const defaultCfg = createDefaultModularWebsiteConfig();
  const projected = projectModernSectionsToLegacyBlocks(defaultCfg.sections);

  assert.equal(projected.length, 11);
  assert.ok(projected.some((b) => b.type === "hero"));
  assert.ok(projected.some((b) => b.type === "countdown"));
  assert.ok(projected.some((b) => b.type === "story_timeline"));
  assert.ok(projected.some((b) => b.type === "gallery"));
  assert.ok(projected.some((b) => b.type === "venue_map"));
  assert.ok(projected.some((b) => b.type === "rsvp_form"));
  assert.ok(projected.some((b) => b.type === "custom_highlight"));

  // Verify non-breaking round-trip back to modern
  const roundtripped = parseModularWebsiteConfig(projected);
  assert.equal(roundtripped.sections.length, 11);
  assert.equal(validateModularWebsiteConfig(roundtripped).isValid, true);
});

test("Stress Suite 2.4: mixed array of legacy blocks and modern sections in single payload parses cleanly", () => {
  const mixedPayload = [
    { type: "cover_hero", id: "sec-1", title: "Modern Hero", coupleTitle: "A & B", enabled: true, order: 1 },
    { type: "story_timeline", id: "leg-2", title: "Legacy Story", timelineItems: [{ id: "t1", time: "10am", title: "Meet", description: "Hello" }], isVisible: true, order: 2 },
    { type: "wishing_wall", id: "sec-3", title: "Modern Wishes", moderationRequired: false, greetingPrompt: "P", placeholder: "Pl", allowReactions: true, maxMessageLength: 200, enabled: true, order: 3 },
  ];

  const parsed = parseModularWebsiteConfig(mixedPayload);
  assert.equal(parsed.sections.length, 3);
  assert.equal(parsed.sections[0].type, "cover_hero");
  assert.equal(parsed.sections[1].type, "couple_story");
  assert.equal(parsed.sections[2].type, "wishing_wall");
  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

// =============================================================
// SUITE 3: REORDERING OPERATIONS & DENSE ORDER NORMALIZATION
// =============================================================

test("Stress Suite 3.1: reordering boundaries (index 0 up, last index down) are safe no-ops", () => {
  const cfg = createDefaultModularWebsiteConfig();
  const initialSections = [...cfg.sections];

  // Boundary 1: index 0 moving UP
  const afterUp0 = simulateMoveSection(initialSections, 0, "up");
  assert.deepEqual(afterUp0.map((s) => s.id), initialSections.map((s) => s.id));
  assert.deepEqual(afterUp0.map((s) => s.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  // Boundary 2: last index moving DOWN
  const lastIdx = initialSections.length - 1;
  const afterDownLast = simulateMoveSection(initialSections, lastIdx, "down");
  assert.deepEqual(afterDownLast.map((s) => s.id), initialSections.map((s) => s.id));
  assert.deepEqual(afterDownLast.map((s) => s.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

  // Out of bounds guards
  const afterNegative = simulateMoveSection(initialSections, -1, "up");
  assert.deepEqual(afterNegative, initialSections);
  const afterOver = simulateMoveSection(initialSections, 999, "down");
  assert.deepEqual(afterOver, initialSections);
});

test("Stress Suite 3.2: middle swap moves section and produces dense consecutive 1..N order", () => {
  const cfg = createDefaultModularWebsiteConfig();
  const sections = [...cfg.sections];

  const secAt3 = sections[3]; // 4th section (index 3)
  const secAt2 = sections[2]; // 3rd section (index 2)

  // Move index 3 UP to index 2
  const movedUp = simulateMoveSection(sections, 3, "up");
  assert.equal(movedUp[2].id, secAt3.id);
  assert.equal(movedUp[3].id, secAt2.id);

  // Check strict consecutive ordering
  for (let i = 0; i < movedUp.length; i++) {
    assert.equal(movedUp[i].order, i + 1, `Order mismatch at index ${i}`);
  }

  // Move index 2 DOWN back to index 3
  const movedDown = simulateMoveSection(movedUp, 2, "down");
  assert.equal(movedDown[3].id, secAt3.id);
  assert.equal(movedDown[2].id, secAt2.id);

  for (let i = 0; i < movedDown.length; i++) {
    assert.equal(movedDown[i].order, i + 1, `Order mismatch at index ${i}`);
  }
});

test("Stress Suite 3.3: moving section at index 1 up places it at index 0 with order 1", () => {
  const cfg = createDefaultModularWebsiteConfig();
  const originalSec0 = cfg.sections[0];
  const originalSec1 = cfg.sections[1];

  const reordered = simulateMoveSection(cfg.sections, 1, "up");
  assert.equal(reordered[0].id, originalSec1.id);
  assert.equal(reordered[0].order, 1);
  assert.equal(reordered[1].id, originalSec0.id);
  assert.equal(reordered[1].order, 2);

  // Still passes validation
  assert.equal(validateModularWebsiteConfig({ version: "2.0", sections: reordered }).isValid, true);
});

test("Stress Suite 3.4: sparse, negative, or duplicate order numbers are normalized to dense 1..N", () => {
  const messySections: EventSection[] = [
    { id: "s-1", type: "cover_hero", title: "Hero", enabled: true, order: -10, coupleTitle: "A & B", dateDisplay: "2026", venueDisplay: "V" },
    { id: "s-2", type: "wishing_wall", title: "Wishes", enabled: true, order: 0, moderationRequired: false, greetingPrompt: "P", placeholder: "Pl", allowReactions: true, maxMessageLength: 200 },
    { id: "s-3", type: "photo_gallery", title: "Gallery", enabled: true, order: 55, layoutMode: "masonry", images: [], categories: ["All"] },
    { id: "s-4", type: "custom_highlight", title: "Quote", enabled: true, order: 55, quoteText: "Q" }, // Duplicate order 55
    { id: "s-5", type: "background_audio", title: "Music", enabled: true, order: 999, songTitle: "Song", artistName: "Art", audioUrl: "u", autoPlayNotice: "n", loopEnabled: true, initialMuted: false },
  ];

  const dense = normalizeDenseOrders(messySections);
  assert.deepEqual(dense.map((s) => s.order), [1, 2, 3, 4, 5]);

  const validation = validateModularWebsiteConfig({ version: "2.0", sections: dense });
  assert.equal(validation.isValid, true);
});

test("Stress Suite 3.5: palette insertion inserts before dynamic_rsvp and keeps orders dense", () => {
  const cfg = createDefaultModularWebsiteConfig();
  const initialCount = cfg.sections.length;

  const newHighlight: EventSection = {
    id: "sec-custom_highlight-new",
    type: "custom_highlight",
    title: "Brand New VIP Section",
    enabled: true,
    order: 0,
    quoteText: "VIP Text",
  };

  const updated = simulateInsertFromPalette(cfg.sections, newHighlight);
  assert.equal(updated.length, initialCount + 1);

  // Dynamic RSVP should still be the last section
  const lastSec = updated[updated.length - 1];
  assert.equal(lastSec.type, "dynamic_rsvp");

  // Verify the new section was placed right before dynamic_rsvp
  const insertedSec = updated[updated.length - 2];
  assert.equal(insertedSec.id, "sec-custom_highlight-new");

  // Verify dense order
  for (let i = 0; i < updated.length; i++) {
    assert.equal(updated[i].order, i + 1);
  }
});

test("Stress Suite 3.6: deletion normalizes remaining orders to 1..(N-1) and respects lock protection", () => {
  const cfg = createDefaultModularWebsiteConfig();
  const initialCount = cfg.sections.length;

  // Attempt to delete locked cover_hero — must be rejected
  const tryHeroDelete = simulateDeleteSection(cfg.sections, cfg.sections[0].id);
  assert.equal(tryHeroDelete.length, initialCount);

  // Attempt to delete dynamic_rsvp — must be rejected
  const rsvp = cfg.sections.find((s) => s.type === "dynamic_rsvp")!;
  const tryRsvpDelete = simulateDeleteSection(cfg.sections, rsvp.id);
  assert.equal(tryRsvpDelete.length, initialCount);

  // Delete an unlocked middle section (e.g., photo_gallery)
  const gallery = cfg.sections.find((s) => s.type === "photo_gallery")!;
  const afterDelete = simulateDeleteSection(cfg.sections, gallery.id);
  assert.equal(afterDelete.length, initialCount - 1);
  assert.equal(afterDelete.some((s) => s.id === gallery.id), false);

  // Check dense ordering after deletion
  for (let i = 0; i < afterDelete.length; i++) {
    assert.equal(afterDelete[i].order, i + 1);
  }
});

// =============================================================
// SUITE 4: ENABLING/DISABLING TOGGLE STATES & SERIALIZATION
// =============================================================

test("Stress Suite 4.1: disabled sections survive JSON serialization / parsing roundtrip with enabled: false", () => {
  const cfg = createDefaultModularWebsiteConfig();

  // Disable 3 sections: audio, wishing wall, countdown
  const modifiedSections = cfg.sections.map((s) => {
    if (s.type === "background_audio" || s.type === "wishing_wall" || s.type === "live_countdown") {
      return { ...s, enabled: false };
    }
    return s;
  });

  const modifiedConfig: ModularWebsiteConfig = {
    ...cfg,
    sections: modifiedSections,
  };

  const serialized = JSON.stringify(modifiedConfig);
  const parsed = parseModularWebsiteConfig(serialized);

  assert.equal(parsed.sections.length, 11);

  const audio = parsed.sections.find((s) => s.type === "background_audio")!;
  assert.equal(audio.enabled, false);

  const wishes = parsed.sections.find((s) => s.type === "wishing_wall")!;
  assert.equal(wishes.enabled, false);

  const countdown = parsed.sections.find((s) => s.type === "live_countdown")!;
  assert.equal(countdown.enabled, false);

  const hero = parsed.sections.find((s) => s.type === "cover_hero")!;
  assert.equal(hero.enabled, true);

  // Config with disabled sections is valid
  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 4.2: website config with ALL sections disabled remains valid and preserves disabled states", () => {
  const cfg = createDefaultModularWebsiteConfig();
  const allDisabledSections = cfg.sections.map((s) => ({ ...s, enabled: false }));
  const allDisabledConfig: ModularWebsiteConfig = {
    ...cfg,
    sections: allDisabledSections,
  };

  const serialized = JSON.stringify(allDisabledConfig);
  const parsed = parseModularWebsiteConfig(serialized);

  assert.equal(parsed.sections.length, 11);
  for (const s of parsed.sections) {
    assert.equal(s.enabled, false);
  }
  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 4.3: storefront rendering simulation accurately excludes disabled sections", () => {
  const cfg = createDefaultModularWebsiteConfig();

  // Set 4 sections disabled
  const disabledTypes = new Set(["photo_gallery", "wishing_wall", "digital_gift_registry", "background_audio"]);
  const configured = cfg.sections.map((s) => ({
    ...s,
    enabled: !disabledTypes.has(s.type),
  }));

  // ModularSectionDispatcher simulation logic
  const flowSections = configured
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.type !== "background_audio");

  const backgroundAudioSection = configured.find((s) => s.enabled && s.type === "background_audio");

  // Audio is disabled so backgroundAudioSection must be undefined
  assert.equal(backgroundAudioSection, undefined);

  // Flow sections must not contain any disabled types
  assert.equal(flowSections.length, 11 - 4);
  for (const s of flowSections) {
    assert.equal(s.enabled, true);
    assert.equal(disabledTypes.has(s.type), false);
  }
});

test("Stress Suite 4.4: isLocked: true and deep complex fields survive roundtrip intact", () => {
  const cfg = createDefaultModularWebsiteConfig({
    coupleTitle: "Farouk & Nariman",
    eventDate: "2026-10-10",
    venueName: "Montaza Palace Alexandria",
  });

  const serialized = JSON.stringify(cfg);
  const parsed = parseModularWebsiteConfig(serialized);

  const rsvp = parsed.sections.find((s) => s.type === "dynamic_rsvp") as DynamicRsvpSection;
  assert.equal(rsvp.isLocked, true);
  assert.equal(rsvp.formSchema.length, 4);

  const venue = parsed.sections.find((s) => s.type === "venue_location") as VenueLocationSection;
  assert.equal(venue.dressCodeSwatches?.length, 4);
  assert.equal(venue.mapCoordinates?.lat, 31.2435);

  const story = parsed.sections.find((s) => s.type === "couple_story") as CoupleStorySection;
  assert.equal(story.milestones.length, 3);
  assert.equal(story.milestones[0].yearOrDate, "October 2021");
});

// =============================================================
// SUITE 5: EXTREME PAYLOADS & STRESS SCENARIOS
// =============================================================

test("Stress Suite 5.1: 65 modular sections in single website config parse, validate, and order cleanly", () => {
  const baseSections = createDefaultModularWebsiteConfig().sections;
  const largeSections: EventSection[] = [];

  // Replicate 6 sets of sections (66 sections)
  for (let cycle = 0; cycle < 6; cycle++) {
    for (const sec of baseSections) {
      largeSections.push({
        ...sec,
        id: `sec-${sec.type}-c${cycle}-${largeSections.length + 1}`,
        order: largeSections.length + 1,
        title: `${sec.title} (Cycle ${cycle + 1})`,
      });
    }
  }

  assert.equal(largeSections.length, 66);

  const config: ModularWebsiteConfig = {
    version: "2.0",
    sections: largeSections,
  };

  const serialized = JSON.stringify(config);
  const parsed = parseModularWebsiteConfig(serialized);

  assert.equal(parsed.sections.length, 66);
  const validation = validateModularWebsiteConfig(parsed);
  assert.equal(validation.isValid, true, `Validation failed: ${validation.errors.join(", ")}`);

  // Test reordering inside 66 sections
  const reordered = simulateMoveSection(parsed.sections, 50, "up");
  assert.equal(reordered.length, 66);
  assert.equal(reordered[49].id, parsed.sections[50].id);
  for (let i = 0; i < reordered.length; i++) {
    assert.equal(reordered[i].order, i + 1);
  }
});

test("Stress Suite 5.2: high density sections (50 milestones, 80 gallery images, 40 schedule items)", () => {
  const milestones = Array.from({ length: 50 }, (_, i) => ({
    id: `mile-${i + 1}`,
    yearOrDate: `Year ${2000 + i}`,
    title: `Milestone ${i + 1}`,
    description: `Detailed description for milestone ${i + 1} with ample text content.`,
    imageUrl: `https://example.com/img-${i + 1}.jpg`,
  }));

  const images = Array.from({ length: 80 }, (_, i) => ({
    id: `img-${i + 1}`,
    url: `https://example.com/photo-${i + 1}.jpg`,
    caption: `Caption for photo ${i + 1}`,
    category: i % 2 === 0 ? "Ceremony" : "Party",
  }));

  const scheduleItems = Array.from({ length: 40 }, (_, i) => ({
    id: `sch-${i + 1}`,
    time: `${(i % 12) + 1}:00 PM`,
    eventName: `Event Step ${i + 1}`,
    locationName: `Hall ${(i % 5) + 1}`,
    address: "Alexandria, Egypt",
  }));

  const denseConfig: ModularWebsiteConfig = {
    version: "2.0",
    sections: [
      {
        id: "sec-story-dense",
        type: "couple_story",
        title: "50 Milestones Story",
        enabled: true,
        order: 1,
        milestones,
      },
      {
        id: "sec-gallery-dense",
        type: "photo_gallery",
        title: "80 Photos Gallery",
        enabled: true,
        order: 2,
        layoutMode: "masonry",
        images,
        categories: ["All", "Ceremony", "Party"],
      },
      {
        id: "sec-schedule-dense",
        type: "event_schedule",
        title: "40 Items Schedule",
        enabled: true,
        order: 3,
        scheduleItems,
      },
    ],
  };

  const serialized = JSON.stringify(denseConfig);
  const parsed = parseModularWebsiteConfig(serialized);

  assert.equal(parsed.sections.length, 3);
  const s1 = parsed.sections[0] as CoupleStorySection;
  assert.equal(s1.milestones.length, 50);

  const s2 = parsed.sections[1] as PhotoGallerySection;
  assert.equal(s2.images.length, 80);

  const s3 = parsed.sections[2] as EventScheduleSection;
  assert.equal(s3.scheduleItems.length, 40);

  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 5.3: Unicode, Arabic, RTL, and Emojis maintain exact byte fidelity", () => {
  const arabicTitle = "💍 أثر الفرح — حفل زفاف كريم ونور 🏛️ (VIP & Special Edition) 🌟";
  const arabicSubtitle = "دعوة خاصة لحضور ليلة العمر في قصر المنتزه الإسكندرية 🕊️ ✨";
  const arabicNote = "نرجو تأكيد الحضور قبل الأول من نوفمبر ٢٠٢٦ 💌";

  const config: ModularWebsiteConfig = {
    version: "2.0",
    sections: [
      {
        id: "sec-hero-ar",
        type: "cover_hero",
        title: arabicTitle,
        titleAr: arabicTitle,
        enabled: true,
        order: 1,
        coupleTitle: "كريم & نور",
        dateDisplay: "٢٠ نوفمبر ٢٠٢٦",
        venueDisplay: "فندق فور سيزونز، الإسكندرية",
        tagline: arabicSubtitle,
      },
      {
        id: "sec-highlight-ar",
        type: "custom_highlight",
        title: "كلمة شكر وتقدير",
        titleAr: "كلمة شكر وتقدير",
        enabled: true,
        order: 2,
        quoteText: arabicNote,
        badge: "✦ دعوة كريمة",
        backgroundStyle: "burgundy",
      },
    ],
  };

  const serialized = JSON.stringify(config);
  const parsed = parseModularWebsiteConfig(serialized);

  assert.equal(parsed.sections[0].title, arabicTitle);
  const hero = parsed.sections[0] as CoverHeroSection;
  assert.equal(hero.coupleTitle, "كريم & نور");
  assert.equal(hero.tagline, arabicSubtitle);

  const highlight = parsed.sections[1] as CustomHighlightSection;
  assert.equal(highlight.quoteText, arabicNote);

  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 5.4: hostile injection payloads (XSS, quotes, special chars) survive serialization cleanly", () => {
  const hostilePayload = {
    version: "2.0",
    sections: [
      {
        id: "sec-xss",
        type: "custom_highlight",
        title: "<script>alert('xss')</script>",
        quoteText: 'He said: "Hello \'world\'" & <test/> \n\r\t / \\',
        enabled: true,
        order: 1,
      },
    ],
  };

  const serialized = JSON.stringify(hostilePayload);
  const parsed = parseModularWebsiteConfig(serialized);

  assert.equal(parsed.sections[0].title, "<script>alert('xss')</script>");
  const highlight = parsed.sections[0] as CustomHighlightSection;
  assert.equal(highlight.quoteText, 'He said: "Hello \'world\'" & <test/> \n\r\t / \\');

  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 5.5: prototype pollution attempts (__proto__, constructor) do not pollute Object prototype", () => {
  const pollutionPayload = JSON.parse(`{
    "version": "2.0",
    "__proto__": { "polluted": "yes" },
    "constructor": { "prototype": { "polluted": "yes" } },
    "sections": [
      {
        "id": "sec-pollute",
        "type": "custom_highlight",
        "title": "Pollution Test",
        "quoteText": "Clean",
        "enabled": true,
        "order": 1,
        "__proto__": { "polluted": "yes" }
      }
    ]
  }`);

  const parsed = parseModularWebsiteConfig(pollutionPayload);

  // Check prototype pollution did not occur
  const testObj: any = {};
  assert.equal(testObj.polluted, undefined, "Prototype pollution detected!");
  assert.equal((Object.prototype as any).polluted, undefined, "Object.prototype was polluted!");

  assert.equal(parsed.sections.length, 1);
  assert.equal(validateModularWebsiteConfig(parsed).isValid, true);
});

test("Stress Suite 5.6: high-throughput benchmark: 1,000 parse & validate cycles execute in under 1,000ms", () => {
  const sampleJson = JSON.stringify(createDefaultModularWebsiteConfig());
  const iterations = 1000;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const parsed = parseModularWebsiteConfig(sampleJson);
    const valid = validateModularWebsiteConfig(parsed);
    if (!valid.isValid) {
      throw new Error(`Failed validation on iteration ${i}`);
    }
  }
  const durationMs = performance.now() - start;

  assert.ok(
    durationMs < 1000,
    `Performance benchmark failed: 1,000 cycles took ${durationMs.toFixed(2)}ms (expected < 1,000ms)`
  );
  console.log(`      ⚡ Benchmark: 1,000 parse & validate cycles completed in ${durationMs.toFixed(2)}ms (${(durationMs / iterations).toFixed(3)}ms/cycle)`);
});

// =============================================================
// SUITE 6: ADVERSARIAL INTERACTIVE FEATURES & SCALE REORDERING
// =============================================================

test("Stress Suite 6.1: RSVP Email validation strictly rejects adversarial/malformed strings", async () => {
  const { isValidEmail } = await import(
    "../../../apps/Invitation/src/components/modular-renderer/sections/InteractiveRsvpSection.tsx"
  );

  const validEmails = [
    "karim.elmasry@gmail.com",
    "nour+wedding@domain.co.uk",
    "vip_guest@subdomain.example.org",
    "a.b.c@hospitality.me",
  ];

  for (const email of validEmails) {
    assert.equal(isValidEmail(email), true, `Expected valid: ${email}`);
  }

  const invalidEmails = [
    "",
    "   ",
    "not-an-email",
    "@missing-user.com",
    "missing-at-sign.com",
    "spaces in@address.com",
    "double@@domain.com",
    "user@.com",
    "user@domain.",
    "<script>alert(1)</script>@domain.com",
    null as any,
    undefined as any,
    12345 as any,
  ];

  for (const email of invalidEmails) {
    assert.equal(isValidEmail(email), false, `Expected invalid: ${email}`);
  }
});

test("Stress Suite 6.2: RSVP Pass Token generates 1,000 collision-free formatted tokens", async () => {
  const { generatePassToken } = await import(
    "../../../apps/Invitation/src/components/modular-renderer/sections/InteractiveRsvpSection.tsx"
  );

  const tokenSet = new Set<string>();
  const tokenRegex = /^INV-PASS-[A-Z0-9]{4}-[A-Z0-9]+$/;

  for (let i = 0; i < 1000; i++) {
    const token = generatePassToken("INV-PASS");
    assert.match(token, tokenRegex, `Invalid token format: ${token}`);
    assert.equal(tokenSet.has(token), false, `Collision detected on iteration ${i}: ${token}`);
    tokenSet.add(token);
  }
  assert.equal(tokenSet.size, 1000);
});

test("Stress Suite 6.3: Live Countdown calculation handles past, corrupted, and distant dates safely", async () => {
  const { calculateTimeRemaining } = await import(
    "../../../apps/Invitation/src/components/modular-renderer/sections/LiveCountdownSection.tsx"
  );

  // Past date
  const past = calculateTimeRemaining("1999-12-31T23:59:59Z");
  assert.equal(past.isCompleted, true);
  assert.equal(past.days, 0);
  assert.equal(past.hours, 0);

  // Invalid date string
  const invalid = calculateTimeRemaining("not-a-valid-date");
  assert.equal(invalid.isCompleted, true);
  assert.equal(invalid.days, 0);

  // Far future date
  const future = calculateTimeRemaining("2050-01-01T00:00:00Z");
  assert.equal(future.isCompleted, false);
  assert.ok(future.days > 8000);
});

test("Stress Suite 6.4: Scale reordering on 100 items handles repeated shifts without drift", () => {
  const items: EventSection[] = Array.from({ length: 100 }, (_, i) => ({
    id: `sec-scale-${i + 1}`,
    type: "custom_highlight",
    title: `Section ${i + 1}`,
    enabled: true,
    order: i + 1,
    quoteText: `Text ${i + 1}`,
  }));

  let current = items;
  // Move item at index 99 up 50 times
  for (let step = 99; step > 49; step--) {
    current = simulateMoveSection(current, step, "up");
  }

  assert.equal(current.length, 100);
  // Item originally at index 99 should now be at index 49
  assert.equal(current[49].id, "sec-scale-100");

  // Orders must strictly be 1..100
  for (let i = 0; i < current.length; i++) {
    assert.equal(current[i].order, i + 1, `Order drift at index ${i}`);
  }
});

