// =============================================================
// ASAR (Athar / أثر) — Dedicated Dynamic Storefront Renderer
// Memory Type Classifier & Cache Integration Automated Test Suite
// Verified with: node --experimental-strip-types --test
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ASAR_CACHE_KEYS,
  getNormalizedCache,
  findInCache,
  getBoothMemoriesCache,
  getInvitationsCache,
  setNormalizedCache,
  normalizeCacheArray,
} from "../../../packages/react-appwrite/src/Storefront/cacheHelper.ts";

import {
  isReservedSubdomain,
  validateSubdomainSlug,
} from "../../../packages/react-appwrite/src/Storefront/subdomain.ts";

import { DEMO_BOOTH_MEMORY } from "../../../packages/react-appwrite/src/AsarDomain/seedDefaults.ts";
import { INVITATION_PRESETS } from "../src/components/invitation/presets.ts";

export type MemoryStorefrontType = "booth" | "invitation" | "pass" | "unknown";

export interface ClassifierTestInput {
  subdomain: string | null | undefined;
  forcedType?: "booth" | "invitation" | "pass";
  queryType?: string | null;
  storage?: Storage;
}

/**
 * Mock localStorage factory for isolated test execution
 */
function createMockStorage(initialData: Record<string, string> = {}): Storage {
  const store: Record<string, string> = { ...initialData };
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

/**
 * Authoritative synchronous memory classification algorithm
 * Identical to DynamicStorefrontIndex.tsx resolution logic
 */
function classifyMemoryType(input: ClassifierTestInput): {
  type: MemoryStorefrontType;
  action: "render-portal" | "render-booth" | "render-invitation" | "render-pass" | "render-404";
  reason404?: "reserved" | "invalid" | "not-found";
} {
  const { subdomain, forcedType, queryType, storage } = input;

  // 1. Bare apex check
  if (!subdomain) {
    return { type: "unknown", action: "render-portal" };
  }

  // 2. Reserved subdomain check
  if (isReservedSubdomain(subdomain)) {
    return { type: "unknown", action: "render-404", reason404: "reserved" };
  }

  // 3. RFC 1123 validation check
  const slugValidation = validateSubdomainSlug(subdomain);
  if (!slugValidation.isValid) {
    return { type: "unknown", action: "render-404", reason404: "invalid" };
  }

  // 4. Forced Type (from explicit routes: /booth/:slug, /invitation/:slug, /pass/:rsvpId)
  if (forcedType) {
    const action =
      forcedType === "booth"
        ? "render-booth"
        : forcedType === "invitation"
          ? "render-invitation"
          : "render-pass";
    return { type: forcedType, action };
  }

  // 5. Query type override (?type=booth, ?type=invitation, ?type=pass)
  if (queryType) {
    const cleanQuery = queryType.toLowerCase().trim();
    if (cleanQuery === "booth") return { type: "booth", action: "render-booth" };
    if (cleanQuery === "invitation") return { type: "invitation", action: "render-invitation" };
    if (cleanQuery === "pass") return { type: "pass", action: "render-pass" };
  }

  // 6. Known Presets
  if (subdomain === DEMO_BOOTH_MEMORY.slug || subdomain === "mina-and-maryam") {
    return { type: "booth", action: "render-booth" };
  }
  if (INVITATION_PRESETS[subdomain]) {
    return { type: "invitation", action: "render-invitation" };
  }

  // 7. Defensive LocalStorage Cache Lookup
  const boothList = getBoothMemoriesCache<any>(storage);
  const foundBooth =
    findInCache<any>(boothList, subdomain) ||
    findInCache<any>(ASAR_CACHE_KEYS.BOOTH_MEMORIES, subdomain, storage);
  if (foundBooth) {
    return { type: "booth", action: "render-booth" };
  }

  const inviteList = getInvitationsCache<any>(storage);
  const foundInvite =
    findInCache<any>(inviteList, subdomain) ||
    findInCache<any>(ASAR_CACHE_KEYS.INVITATIONS, subdomain, storage);
  if (foundInvite) {
    return { type: "invitation", action: "render-invitation" };
  }

  // 8. Slug prefix heuristics
  if (subdomain.startsWith("booth-") || subdomain.startsWith("audio-")) {
    return { type: "booth", action: "render-booth" };
  }
  if (
    subdomain.startsWith("inv-") ||
    subdomain.startsWith("invitation-") ||
    subdomain.startsWith("event-")
  ) {
    return { type: "invitation", action: "render-invitation" };
  }

  // 9. Unknown slug -> Luxury 404
  return { type: "unknown", action: "render-404", reason404: "not-found" };
}

describe("ASAR Memory Classifier — Preset Resolution", () => {
  it("resolves 'mina-and-maryam' and DEMO_BOOTH_MEMORY.slug to Booth Memory", () => {
    const res = classifyMemoryType({ subdomain: "mina-and-maryam" });
    assert.equal(res.type, "booth");
    assert.equal(res.action, "render-booth");

    const resDemo = classifyMemoryType({ subdomain: DEMO_BOOTH_MEMORY.slug });
    assert.equal(resDemo.type, "booth");
    assert.equal(resDemo.action, "render-booth");
  });

  it("resolves 'omar-and-layla' canonical wedding preset to Invitation Memory", () => {
    assert.ok(INVITATION_PRESETS["omar-and-layla"]);
    const res = classifyMemoryType({ subdomain: "omar-and-layla" });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });

  it("resolves 'cairo-jazz-festival' preset to Invitation Memory", () => {
    assert.ok(INVITATION_PRESETS["cairo-jazz-festival"]);
    const res = classifyMemoryType({ subdomain: "cairo-jazz-festival" });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });

  it("resolves 'asar-leadership-gala' preset to Invitation Memory", () => {
    assert.ok(INVITATION_PRESETS["asar-leadership-gala"]);
    const res = classifyMemoryType({ subdomain: "asar-leadership-gala" });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });
});

describe("ASAR Memory Classifier — Route Hints & Forced Types", () => {
  it("forces Booth classification for explicit /booth/:slug route hint", () => {
    const res = classifyMemoryType({
      subdomain: "arbitrary-couple-slug",
      forcedType: "booth",
    });
    assert.equal(res.type, "booth");
    assert.equal(res.action, "render-booth");
  });

  it("forces Invitation classification for explicit /invitation/:slug route hint", () => {
    const res = classifyMemoryType({
      subdomain: "arbitrary-event-slug",
      forcedType: "invitation",
    });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });

  it("forces VIP Pass classification for explicit /pass/:rsvpId route hint", () => {
    const res = classifyMemoryType({
      subdomain: "rsvp-token-7701",
      forcedType: "pass",
    });
    assert.equal(res.type, "pass");
    assert.equal(res.action, "render-pass");
  });

  it("forcedType overrides presets (e.g. forcing invitation on mina-and-maryam)", () => {
    const res = classifyMemoryType({
      subdomain: "mina-and-maryam",
      forcedType: "invitation",
    });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });
});

describe("ASAR Memory Classifier — Query Parameter Overrides (?type=)", () => {
  it("overrides automatic classification with ?type=booth", () => {
    const res = classifyMemoryType({
      subdomain: "omar-and-layla", // preset is invitation, but query forces booth
      queryType: "booth",
    });
    assert.equal(res.type, "booth");
    assert.equal(res.action, "render-booth");
  });

  it("overrides automatic classification with ?type=invitation", () => {
    const res = classifyMemoryType({
      subdomain: "mina-and-maryam", // preset is booth, but query forces invitation
      queryType: "invitation",
    });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });

  it("handles case-insensitivity and whitespace in queryType", () => {
    const resUpper = classifyMemoryType({
      subdomain: "custom-memory",
      queryType: "  BOOTH  ",
    });
    assert.equal(resUpper.type, "booth");

    const resMixed = classifyMemoryType({
      subdomain: "custom-event",
      queryType: "Invitation",
    });
    assert.equal(resMixed.type, "invitation");
  });

  it("ignores invalid queryType and falls back to normal classification", () => {
    const res = classifyMemoryType({
      subdomain: "mina-and-maryam",
      queryType: "unsupported_type",
    });
    assert.equal(res.type, "booth"); // resolves to booth via preset
  });
});

describe("ASAR Memory Classifier — LocalStorage Cache Integration", () => {
  it("classifies single-object Booth Memory schema from ASAR_CACHE_KEYS.BOOTH_MEMORIES", () => {
    const mockStorage = createMockStorage({
      [ASAR_CACHE_KEYS.BOOTH_MEMORIES]: JSON.stringify({
        id: "booth-cached-001",
        slug: "karim-and-salma",
        coupleTitle: "Karim & Salma",
        isPublished: true,
      }),
    });

    const res = classifyMemoryType({
      subdomain: "karim-and-salma",
      storage: mockStorage,
    });
    assert.equal(res.type, "booth");
    assert.equal(res.action, "render-booth");
  });

  it("classifies array of Booth Memories from ASAR_CACHE_KEYS.BOOTH_MEMORIES", () => {
    const mockStorage = createMockStorage({
      [ASAR_CACHE_KEYS.BOOTH_MEMORIES]: JSON.stringify([
        { slug: "couple-one", coupleTitle: "One" },
        { slug: "couple-two", coupleTitle: "Two" },
      ]),
    });

    const res1 = classifyMemoryType({
      subdomain: "couple-one",
      storage: mockStorage,
    });
    assert.equal(res1.type, "booth");

    const res2 = classifyMemoryType({
      subdomain: "couple-two",
      storage: mockStorage,
    });
    assert.equal(res2.type, "booth");
  });

  it("classifies array of Invitations from ASAR_CACHE_KEYS.INVITATIONS", () => {
    const mockStorage = createMockStorage({
      [ASAR_CACHE_KEYS.INVITATIONS]: JSON.stringify([
        {
          id: "inv-001",
          slug: "luxury-annual-symposium",
          eventTitle: "Annual Symposium 2026",
          occasionType: "corporate",
        },
      ]),
    });

    const res = classifyMemoryType({
      subdomain: "luxury-annual-symposium",
      storage: mockStorage,
    });
    assert.equal(res.type, "invitation");
    assert.equal(res.action, "render-invitation");
  });

  it("matches cache items by Appwrite $id or id identifier", () => {
    const mockStorage = createMockStorage({
      [ASAR_CACHE_KEYS.INVITATIONS]: JSON.stringify([
        {
          $id: "doc-invite-999",
          slug: "diplomatic-dinner",
          eventTitle: "Diplomatic Dinner",
        },
      ]),
    });

    const found = findInCache(ASAR_CACHE_KEYS.INVITATIONS, "doc-invite-999", mockStorage);
    assert.ok(found);
    assert.equal((found as any).slug, "diplomatic-dinner");
  });

  it("gracefully handles corrupt JSON in storage without throwing", () => {
    const mockStorage = createMockStorage({
      [ASAR_CACHE_KEYS.BOOTH_MEMORIES]: "{ broken json corrupted ...",
      [ASAR_CACHE_KEYS.INVITATIONS]: "[ null, undefined, false ]",
    });

    const res = classifyMemoryType({
      subdomain: "unknown-corrupt-slug",
      storage: mockStorage,
    });
    assert.equal(res.type, "unknown");
    assert.equal(res.action, "render-404");
  });
});

describe("ASAR Memory Classifier — Route & Prefix Heuristics", () => {
  it("classifies slugs starting with 'booth-' or 'audio-' as Booth Memory", () => {
    assert.equal(
      classifyMemoryType({ subdomain: "booth-alexandria-2026" }).type,
      "booth"
    );
    assert.equal(
      classifyMemoryType({ subdomain: "audio-guestbook-elgouna" }).type,
      "booth"
    );
    assert.equal(
      classifyMemoryType({ subdomain: "booth-42" }).type,
      "booth"
    );
  });

  it("classifies slugs starting with 'inv-', 'invitation-', or 'event-' as Invitation Memory", () => {
    assert.equal(
      classifyMemoryType({ subdomain: "inv-wedding-celebration" }).type,
      "invitation"
    );
    assert.equal(
      classifyMemoryType({ subdomain: "invitation-summer-soiree" }).type,
      "invitation"
    );
    assert.equal(
      classifyMemoryType({ subdomain: "event-pyramids-charity-gala" }).type,
      "invitation"
    );
  });
});

describe("ASAR Memory Classifier — Unknown Slugs & 404 Fallbacks", () => {
  it("returns unknown / render-404 (reason: not-found) for unrecognized slugs", () => {
    const res = classifyMemoryType({
      subdomain: "unregistered-private-event-2026",
    });
    assert.equal(res.type, "unknown");
    assert.equal(res.action, "render-404");
    assert.equal(res.reason404, "not-found");
  });

  it("returns unknown / render-404 (reason: reserved) for reserved system subdomains", () => {
    for (const reserved of ["admin", "api", "auth", "storefront", "main"]) {
      const res = classifyMemoryType({ subdomain: reserved });
      assert.equal(res.type, "unknown");
      assert.equal(res.action, "render-404");
      assert.equal(res.reason404, "reserved");
    }
  });

  it("returns unknown / render-404 (reason: invalid) for invalid RFC 1123 slugs", () => {
    const resInvalid = classifyMemoryType({ subdomain: "-invalid-leading-hyphen" });
    assert.equal(resInvalid.type, "unknown");
    assert.equal(resInvalid.action, "render-404");
    assert.equal(resInvalid.reason404, "invalid");

    const resSpecial = classifyMemoryType({ subdomain: "mina_maryam" });
    assert.equal(resSpecial.type, "unknown");
    assert.equal(resSpecial.action, "render-404");
    assert.equal(resSpecial.reason404, "invalid");
  });

  it("returns unknown / render-portal for bare apex (null or empty subdomain)", () => {
    const resNull = classifyMemoryType({ subdomain: null });
    assert.equal(resNull.type, "unknown");
    assert.equal(resNull.action, "render-portal");

    const resEmpty = classifyMemoryType({ subdomain: "" });
    assert.equal(resEmpty.type, "unknown");
    assert.equal(resEmpty.action, "render-portal");
  });
});
