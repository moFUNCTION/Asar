import { describe, it } from "node:test";
import assert from "node:assert";
import {
  ALL_EVENT_SECTION_TYPES,
  type EventSectionType,
  parseModularWebsiteConfig,
  validateModularWebsiteConfig,
  createDefaultModularWebsiteConfig,
} from "@repo/react-appwrite";
import {
  SECTION_CATALOG,
  createDefaultSectionForType,
} from "../src/components/invitation-studio/SectionPaletteModal";
import { projectModernSectionsToLegacyBlocks } from "../src/components/invitation-studio/SectionBlocksManager";

describe("Admin Modular Website Creation Editor (M2 Test Suite)", () => {
  it("verifies SECTION_CATALOG contains all 11 required modular section types", () => {
    assert.strictEqual(SECTION_CATALOG.length, 11);
    const catalogTypes = SECTION_CATALOG.map((item) => item.type);

    ALL_EVENT_SECTION_TYPES.forEach((expectedType) => {
      assert.ok(
        catalogTypes.includes(expectedType),
        `SECTION_CATALOG must include section type '${expectedType}'`
      );
    });

    SECTION_CATALOG.forEach((item) => {
      assert.ok(item.title.trim().length > 0, `Title for ${item.type} must be non-empty`);
      assert.ok(item.titleAr.trim().length > 0, `Arabic title for ${item.type} must be non-empty`);
      assert.ok(item.description.trim().length > 0, `Description for ${item.type} must be non-empty`);
      assert.ok(item.icon.trim().length > 0, `Icon for ${item.type} must be non-empty`);
      assert.ok(item.badge.trim().length > 0, `Badge for ${item.type} must be non-empty`);
    });
  });

  it("verifies createDefaultSectionForType instantiates valid section instances for every type", () => {
    ALL_EVENT_SECTION_TYPES.forEach((type, index) => {
      const section = createDefaultSectionForType(type, index + 1, {
        coupleTitle: "Omar & Layla",
        eventDate: "2026-11-20",
        venueName: "Four Seasons Hotel, Alexandria",
      });

      assert.strictEqual(section.type, type);
      assert.strictEqual(section.order, index + 1);
      assert.strictEqual(section.enabled, true);
      assert.ok(section.id.length > 0);
      assert.ok(section.title.length > 0);

      if (type === "cover_hero") {
        assert.strictEqual((section as any).coupleTitle, "Omar & Layla");
        assert.strictEqual((section as any).waxSealMonogram, "O&L");
      }
      if (type === "dynamic_rsvp") {
        assert.strictEqual((section as any).isLocked, true);
        const hasLockedEmail = (section as any).formSchema.some(
          (f: any) => f.type === "email" && f.required && f.locked
        );
        assert.ok(hasLockedEmail, "dynamic_rsvp default instance must contain locked email field");
      }
      if (type === "digital_gift_registry") {
        assert.ok((section as any).accounts.length >= 2);
      }
      if (type === "event_schedule") {
        assert.ok((section as any).scheduleItems.length >= 2);
      }
      if (type === "photo_gallery") {
        assert.ok((section as any).images.length >= 2);
      }
      if (type === "background_audio") {
        assert.ok((section as any).songTitle.length > 0);
        assert.ok((section as any).audioUrl.length > 0);
      }
    });
  });

  it("verifies full 11-section config created via palette defaults passes validateModularWebsiteConfig", () => {
    const sections = ALL_EVENT_SECTION_TYPES.map((type, idx) =>
      createDefaultSectionForType(type, idx + 1, {
        coupleTitle: "Tarek & Mona",
        eventDate: "2026-12-15",
        venueName: "Grand Nile Ballroom",
      })
    );

    const config = {
      version: "2.0" as const,
      sections,
    };

    const result = validateModularWebsiteConfig(config);
    assert.strictEqual(
      result.isValid,
      true,
      `Config should be valid but got errors: ${result.errors.join(", ")}`
    );
  });

  it("verifies projectModernSectionsToLegacyBlocks safely projects 11 modern sections to legacy blocks", () => {
    const config = createDefaultModularWebsiteConfig({
      coupleTitle: "Omar & Layla",
      eventDate: "2026-11-20",
      venueName: "Four Seasons Hotel, Alexandria",
    });

    const legacyBlocks = projectModernSectionsToLegacyBlocks(config.sections);
    assert.strictEqual(legacyBlocks.length, config.sections.length);

    // Verify key mappings
    const hero = legacyBlocks.find((b) => b.type === "hero");
    assert.ok(hero);
    assert.strictEqual(hero.mainTitle, "Omar & Layla");

    const rsvp = legacyBlocks.find((b) => b.type === "rsvp_form");
    assert.ok(rsvp);
    assert.strictEqual(rsvp.isLocked, true);
  });

  it("verifies dual-tier JSON roundtrip persistence preserves all section properties", () => {
    const originalConfig = createDefaultModularWebsiteConfig({
      coupleTitle: "Omar & Layla",
      eventDate: "2026-11-20",
      venueName: "Four Seasons Hotel, Alexandria",
    });

    // Simulate serialization into Appwrite sectionsConfigJson
    const serializedJson = JSON.stringify(originalConfig);

    // Simulate deserialization
    const restoredConfig = parseModularWebsiteConfig(serializedJson);

    assert.strictEqual(restoredConfig.version, "2.0");
    assert.strictEqual(restoredConfig.sections.length, 11);

    // Check specific section properties survived roundtrip
    const hero = restoredConfig.sections.find((s) => s.type === "cover_hero");
    assert.ok(hero);
    assert.strictEqual((hero as any).coupleTitle, "Omar & Layla");

    const audio = restoredConfig.sections.find((s) => s.type === "background_audio");
    assert.ok(audio);
    assert.strictEqual((audio as any).songTitle, "Clair de Lune (Acoustic Piano & Strings)");

    const gift = restoredConfig.sections.find((s) => s.type === "digital_gift_registry");
    assert.ok(gift);
    assert.strictEqual((gift as any).accounts.length, 2);

    const rsvp = restoredConfig.sections.find((s) => s.type === "dynamic_rsvp");
    assert.ok(rsvp);
    assert.strictEqual((rsvp as any).isLocked, true);
  });
});
