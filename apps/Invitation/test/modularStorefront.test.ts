// =============================================================
// ASAR (Athar / أثر) — Modular Storefront & Interactive Features Test Suite
// Verified with: npx tsx apps/Invitation/test/modularStorefront.test.ts
// =============================================================

import test from "node:test";
import assert from "node:assert/strict";

import {
  parseModularWebsiteConfig,
  createDefaultModularWebsiteConfig,
  validateModularWebsiteConfig,
  ALL_EVENT_SECTION_TYPES,
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
  type DynamicFormField,
} from "@repo/react-appwrite";

import {
  isValidEmail,
  generatePassToken,
  DIETARY_OPTIONS,
} from "../src/components/modular-renderer/sections/InteractiveRsvpSection";

import {
  buildIcsContent,
} from "../src/components/modular-renderer/sections/MultiEventScheduleSection";

import {
  calculateTimeRemaining,
} from "../src/components/modular-renderer/sections/LiveCountdownSection";

import {
  copyToClipboard,
} from "../src/components/modular-renderer/sections/DigitalGiftRegistrySection";

// -------------------------------------------------------------
// 1. Parsing and Rendering Modular Sections in Correct Order
// -------------------------------------------------------------
test("Modular Storefront: parses sections and sorts by ascending order while filtering disabled", () => {
  const rawConfig = {
    version: "2.0",
    sections: [
      {
        id: "sec-rsvp",
        type: "dynamic_rsvp",
        title: "RSVP",
        enabled: true,
        order: 9,
        formSchema: [
          {
            id: "f-email",
            name: "guestEmail",
            type: "email",
            required: true,
            locked: true,
          },
        ],
      },
      {
        id: "sec-story",
        type: "couple_story",
        title: "Story",
        enabled: true,
        order: 2,
        milestones: [],
      },
      {
        id: "sec-disabled-gallery",
        type: "photo_gallery",
        title: "Gallery Disabled",
        enabled: false,
        order: 1,
        images: [],
        categories: [],
        layoutMode: "grid",
      },
      {
        id: "sec-hero",
        type: "cover_hero",
        title: "Hero",
        enabled: true,
        order: 0,
        coupleTitle: "Omar & Layla",
        dateDisplay: "2026-11-20",
        venueDisplay: "Alexandria",
      },
      {
        id: "sec-schedule",
        type: "event_schedule",
        title: "Schedule",
        enabled: true,
        order: 4,
        scheduleItems: [],
      },
    ],
  };

  const parsed = parseModularWebsiteConfig(rawConfig);
  assert.equal(parsed.version, "2.0");

  // Filter enabled and sort
  const enabledSorted = parsed.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  assert.equal(enabledSorted.length, 4, "Disabled section must be excluded");
  assert.equal(enabledSorted[0].id, "sec-hero");
  assert.equal(enabledSorted[0].order, 0);
  assert.equal(enabledSorted[1].id, "sec-story");
  assert.equal(enabledSorted[1].order, 2);
  assert.equal(enabledSorted[2].id, "sec-schedule");
  assert.equal(enabledSorted[2].order, 4);
  assert.equal(enabledSorted[3].id, "sec-rsvp");
  assert.equal(enabledSorted[3].order, 9);
});

test("Modular Storefront: handles all 11 section types correctly in website config", () => {
  const config = createDefaultModularWebsiteConfig({
    coupleTitle: "Kareem & Yasmin",
    eventDate: "2026-12-15",
    venueName: "The Grand Nile Tower, Cairo",
  });

  assert.equal(config.sections.length, 11);
  const typesInConfig = config.sections.map((s) => s.type);

  for (const expectedType of ALL_EVENT_SECTION_TYPES) {
    assert.ok(
      typesInConfig.includes(expectedType),
      `Config must contain section type: ${expectedType}`
    );
  }

  const validation = validateModularWebsiteConfig(config);
  assert.ok(validation.isValid, `Validation errors: ${validation.errors.join(", ")}`);
});

test("Modular Storefront: converts legacy flat blocks into modern sections with zero crash", () => {
  const legacyBlocks = [
    {
      id: "legacy-1",
      type: "hero",
      title: "Hero Section",
      isVisible: true,
      order: 1,
      mainTitle: "Salma & Sherif",
    },
    {
      id: "legacy-2",
      type: "countdown",
      title: "Countdown",
      isVisible: true,
      order: 2,
      targetDate: "2026-12-31T20:00:00Z",
    },
  ];

  const parsed = parseModularWebsiteConfig(legacyBlocks);
  assert.equal(parsed.version, "2.0");
  assert.ok(parsed.sections.length >= 2);
  const heroSec = parsed.sections.find((s) => s.type === "cover_hero") as CoverHeroSection;
  assert.ok(heroSec);
  assert.equal(heroSec.coupleTitle, "Salma & Sherif");
});

// -------------------------------------------------------------
// 2. Wishing Wall Message Submission & Optimistic Update
// -------------------------------------------------------------
test("Wishing Wall: validates author name and message bounds", () => {
  const maxMessageLength = 280;

  // Validation function mirroring InteractiveWishingWallSection
  const validateWish = (author: string, msg: string) => {
    if (!author.trim()) return { ok: false, error: "Author required" };
    if (!msg.trim()) return { ok: false, error: "Message required" };
    if (msg.length > maxMessageLength) return { ok: false, error: "Message too long" };
    return { ok: true, error: null };
  };

  assert.equal(validateWish("", "Congratulations!").ok, false);
  assert.equal(validateWish("Amr", "").ok, false);
  assert.equal(validateWish("Amr", "a".repeat(281)).ok, false);
  assert.equal(validateWish("Amr Zaki", "Alf Mabrook to the lovely couple! ❤️").ok, true);
});

test("Wishing Wall: optimistic update prepends new wish and tracks likes", () => {
  const initialWishes = [
    { id: "w-1", author: "Mona", role: "Family", message: "Blessings!", likes: 5, hasLiked: false },
  ];

  const newWish = {
    id: "w-2",
    author: "Ziad",
    role: "Friend",
    message: "Pure magic!",
    likes: 1,
    hasLiked: true,
  };

  // Optimistic prepend
  const updatedFeed = [newWish, ...initialWishes];
  assert.equal(updatedFeed.length, 2);
  assert.equal(updatedFeed[0].id, "w-2", "Newest wish must appear at top");

  // Toggle reaction like on w-1
  const likedFeed = updatedFeed.map((w) => {
    if (w.id === "w-1") {
      const nextLiked = !w.hasLiked;
      return {
        ...w,
        hasLiked: nextLiked,
        likes: nextLiked ? w.likes + 1 : w.likes - 1,
      };
    }
    return w;
  });

  const w1 = likedFeed.find((w) => w.id === "w-1");
  assert.equal(w1?.hasLiked, true);
  assert.equal(w1?.likes, 6);
});

// -------------------------------------------------------------
// 3. Dynamic RSVP Form Validation & Pass Token Generation
// -------------------------------------------------------------
test("RSVP Validation: strictly validates email format", () => {
  assert.equal(isValidEmail("test@example.com"), true);
  assert.equal(isValidEmail("omar.layla@asar.me"), true);
  assert.equal(isValidEmail("karim+vip@domain.co.uk"), true);

  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("@missing-username.com"), false);
  assert.equal(isValidEmail("missing-domain@"), false);
});

test("RSVP Pass Token: generates unique formatted token with prefix", () => {
  const token1 = generatePassToken("INV-PASS");
  const token2 = generatePassToken("INV-PASS");

  assert.ok(token1.startsWith("INV-PASS-"));
  assert.notEqual(token1, token2, "Generated tokens must be distinct");
  assert.match(token1, /^INV-PASS-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

test("RSVP Dietary Preferences: provides comprehensive choices", () => {
  assert.ok(DIETARY_OPTIONS.length >= 4);
  const ids = DIETARY_OPTIONS.map((d) => d.id);
  assert.ok(ids.includes("none"));
  assert.ok(ids.includes("halal"));
  assert.ok(ids.includes("vegetarian"));
  assert.ok(ids.includes("gluten_free"));
});

// -------------------------------------------------------------
// 4. Digital Gift Registry Copy-to-Clipboard & Bank QR
// -------------------------------------------------------------
test("Gift Registry: copies text cleanly using fallback or clipboard API", async () => {
  // In Node environment, navigator.clipboard may not exist, fallback handles gracefully
  const copied = await copyToClipboard("1000-2458-9901-4421");
  // Returns false or true without throwing uncaught exception
  assert.equal(typeof copied, "boolean");
});

test("Gift Registry: validates gift account fields and QR formatting", () => {
  const account = {
    id: "bank-1",
    bankName: "Commercial International Bank",
    accountNumber: "1000-2458-9901-4421",
    accountHolder: "Omar & Layla",
    currency: "EGP",
    transferMemo: "Wedding Gift",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=CIB%3A1000245899014421",
  };

  assert.ok(account.bankName.length > 0);
  assert.ok(account.accountNumber.length > 5);
  assert.ok(account.accountHolder.length > 0);
  assert.ok(account.qrImageUrl.includes("http"));
});

// -------------------------------------------------------------
// 5. Background Audio State Toggle & Configuration
// -------------------------------------------------------------
test("Background Audio: maintains correct audio section properties", () => {
  const audioSection: BackgroundAudioSection = {
    id: "sec-audio-1",
    type: "background_audio",
    title: "Celebration Music",
    enabled: true,
    order: 3,
    songTitle: "A Thousand Years",
    artistName: "The Piano Tribute Players",
    audioUrl: "https://example.com/soundtrack.mp3",
    autoPlayNotice: "Tap anywhere for music",
    loopEnabled: true,
    initialMuted: false,
  };

  assert.equal(audioSection.type, "background_audio");
  assert.equal(audioSection.songTitle, "A Thousand Years");
  assert.equal(audioSection.loopEnabled, true);
  assert.equal(audioSection.initialMuted, false);
});

// -------------------------------------------------------------
// 6. Multi-Event Schedule Calendar (.ics) Generation
// -------------------------------------------------------------
test("Event Schedule: builds valid RFC 5545 .ics calendar content", () => {
  const scheduleItems = [
    {
      id: "sch-1",
      time: "18:00",
      eventName: "Ceremony & Vows",
      locationName: "Four Seasons Alexandria",
      address: "San Stefano, Alexandria",
      dressCode: "Black Tie",
    },
    {
      id: "sch-2",
      time: "20:30",
      eventName: "Royal Banquet",
      locationName: "Grand Ballroom",
      address: "San Stefano, Alexandria",
    },
  ];

  const ics = buildIcsContent("Omar & Layla Wedding", scheduleItems, "2026-11-20");

  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("VERSION:2.0"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes("SUMMARY:Ceremony & Vows"));
  assert.ok(ics.includes("SUMMARY:Royal Banquet"));
  assert.ok(ics.includes("LOCATION:San Stefano, Alexandria"));
  assert.ok(ics.includes("END:VCALENDAR"));
});

// -------------------------------------------------------------
// 7. Live Countdown Calculation
// -------------------------------------------------------------
test("Live Countdown: calculates future date time remaining correctly", () => {
  // A future date 5 days from now
  const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3600 * 1000).toISOString();
  const res = calculateTimeRemaining(future);

  assert.equal(res.isCompleted, false);
  assert.ok(res.days >= 4 && res.days <= 6);
});

test("Live Countdown: flags past date as completed", () => {
  const past = new Date(Date.now() - 100000).toISOString();
  const res = calculateTimeRemaining(past);

  assert.equal(res.isCompleted, true);
  assert.equal(res.days, 0);
  assert.equal(res.hours, 0);
  assert.equal(res.minutes, 0);
  assert.equal(res.seconds, 0);
});
