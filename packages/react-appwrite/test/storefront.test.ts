// =============================================================
// ASAR (Athar / أثر) — Storefront Subdomain Engine Unit Tests
// Verified with: node --experimental-strip-types --test
// =============================================================

import test from "node:test";
import assert from "node:assert/strict";

import {
  RESERVED_SUBDOMAINS,
  RESERVED_SUBDOMAIN_LIST,
  validateSubdomainSlug,
  isReservedSubdomain,
  extractSubdomain,
} from "../src/Storefront/subdomain.ts";

import {
  buildMemoryUrls,
} from "../src/Storefront/urlBuilder.ts";

import {
  ASAR_CACHE_KEYS,
  normalizeCacheArray,
  getNormalizedCache,
  findInCache,
  setNormalizedCache,
  getBoothMemoriesCache,
  getInvitationsCache,
} from "../src/Storefront/cacheHelper.ts";

import {
  resolveSubdomain,
} from "../src/Storefront/useSubdomain.ts";

import type {
  BoothMemory,
  AsarInvitation,
} from "../src/AsarDomain/models.ts";

// -------------------------------------------------------------
// 1. Reserved Subdomains List & Helpers
// -------------------------------------------------------------
test("Reserved Subdomains: contains all required system subdomains", () => {
  const expectedReserved = [
    "admin",
    "api",
    "booth",
    "main",
    "invitation",
    "app",
    "cdn",
    "mail",
    "auth",
    "dev",
    "staging",
    "test",
    "www",
    "storefront",
    "status",
    "account",
  ];

  for (const name of expectedReserved) {
    assert.equal(
      RESERVED_SUBDOMAINS.has(name),
      true,
      `Expected "${name}" to be in RESERVED_SUBDOMAINS`
    );
    assert.equal(
      isReservedSubdomain(name),
      true,
      `Expected isReservedSubdomain("${name}") to be true`
    );
  }

  assert.equal(RESERVED_SUBDOMAIN_LIST.length >= 16, true);
  assert.equal(isReservedSubdomain("mina-and-maryam"), false);
});

// -------------------------------------------------------------
// 2. RFC 1123 Subdomain Slug Validator
// -------------------------------------------------------------
test("validateSubdomainSlug: accepts RFC 1123 compliant slugs", () => {
  // Single alphanumeric character
  assert.equal(validateSubdomainSlug("a").isValid, true);
  assert.equal(validateSubdomainSlug("9").isValid, true);

  // Standard alphanumeric and hyphens
  assert.equal(validateSubdomainSlug("mina-and-maryam").isValid, true);
  assert.equal(validateSubdomainSlug("wedding-2026").isValid, true);
  assert.equal(validateSubdomainSlug("omar-and-layla").isValid, true);
  assert.equal(validateSubdomainSlug("luxury-event-42").isValid, true);

  // Max 63 characters
  const maxSlug = "a" + "-b".repeat(30) + "-c"; // 1 + 60 + 2 = 63 chars
  assert.equal(maxSlug.length, 63);
  assert.equal(validateSubdomainSlug(maxSlug).isValid, true);
});

test("validateSubdomainSlug: rejects invalid and reserved slugs", () => {
  // Empty or missing
  assert.equal(validateSubdomainSlug("").isValid, false);
  assert.equal(validateSubdomainSlug("   ").isValid, false);
  assert.equal(validateSubdomainSlug(null as any).isValid, false);
  assert.equal(validateSubdomainSlug(undefined as any).isValid, false);

  // Leading or trailing hyphens
  const leading = validateSubdomainSlug("-wedding");
  assert.equal(leading.isValid, false);
  assert.ok(leading.error?.includes("hyphen"));

  const trailing = validateSubdomainSlug("wedding-");
  assert.equal(trailing.isValid, false);
  assert.ok(trailing.error?.includes("hyphen"));

  // Uppercase letters
  const upper = validateSubdomainSlug("Mina-And-Maryam");
  assert.equal(upper.isValid, false);
  assert.ok(upper.error?.includes("lowercase"));

  // Special characters & spaces
  assert.equal(validateSubdomainSlug("mina_maryam").isValid, false);
  assert.equal(validateSubdomainSlug("mina.maryam").isValid, false);
  assert.equal(validateSubdomainSlug("mina maryam").isValid, false);
  assert.equal(validateSubdomainSlug("mina@maryam").isValid, false);

  // Length > 63 characters
  const tooLong = "a".repeat(64);
  const lenRes = validateSubdomainSlug(tooLong);
  assert.equal(lenRes.isValid, false);
  assert.ok(lenRes.error?.includes("63"));

  // Reserved names
  for (const reserved of ["admin", "api", "booth", "main", "invitation", "www"]) {
    const res = validateSubdomainSlug(reserved);
    assert.equal(res.isValid, false, `Slug "${reserved}" should be rejected as reserved`);
    assert.ok(res.error?.includes("reserved"));
  }
});

// -------------------------------------------------------------
// 3. Subdomain Extractor (Hostname & Query Override)
// -------------------------------------------------------------
test("extractSubdomain: extracts RFC 6761 localhost subdomains", () => {
  assert.equal(
    extractSubdomain("mina-and-maryam.localhost"),
    "mina-and-maryam"
  );
  assert.equal(
    extractSubdomain("mina-and-maryam.localhost:3002"),
    "mina-and-maryam"
  );
  assert.equal(
    extractSubdomain("http://mina-and-maryam.localhost:3003/booking"),
    "mina-and-maryam"
  );
  assert.equal(
    extractSubdomain("omar-and-layla.localhost:3003"),
    "omar-and-layla"
  );
});

test("extractSubdomain: extracts production apex subdomains", () => {
  assert.equal(extractSubdomain("wedding.asar.me"), "wedding");
  assert.equal(extractSubdomain("wedding.asar.me:443"), "wedding");
  assert.equal(extractSubdomain("mina-and-maryam.asar.audio"), "mina-and-maryam");
  assert.equal(extractSubdomain("https://vip.asar.me/pass"), "vip");

  // Custom root domains option
  assert.equal(
    extractSubdomain("luxury.royal-weddings.com", {
      rootDomains: ["royal-weddings.com"],
    }),
    "luxury"
  );
});

test("extractSubdomain: returns null for bare apex, localhost, and IPs", () => {
  assert.equal(extractSubdomain("localhost"), null);
  assert.equal(extractSubdomain("localhost:3002"), null);
  assert.equal(extractSubdomain("127.0.0.1"), null);
  assert.equal(extractSubdomain("127.0.0.1:3002"), null);
  assert.equal(extractSubdomain("0.0.0.0:3000"), null);
  assert.equal(extractSubdomain("asar.me"), null);
  assert.equal(extractSubdomain("asar.audio"), null);
  assert.equal(extractSubdomain("https://asar.me/"), null);
});

test("extractSubdomain: returns null for reserved subdomains", () => {
  assert.equal(extractSubdomain("admin.localhost:3002"), null);
  assert.equal(extractSubdomain("api.asar.me"), null);
  assert.equal(extractSubdomain("www.asar.me"), null);
  assert.equal(extractSubdomain("storefront.asar.me"), null);
  assert.equal(extractSubdomain("account.asar.me"), null);
});

test("extractSubdomain: handles query param overrides", () => {
  // Query param override on bare localhost
  assert.equal(
    extractSubdomain("localhost:3002", {
      searchParams: "?subdomain=mina-and-maryam",
    }),
    "mina-and-maryam"
  );

  // Alternative ?memory= query param
  assert.equal(
    extractSubdomain("localhost:3002", {
      searchParams: "?memory=mina-and-maryam",
    }),
    "mina-and-maryam"
  );

  // Alternative ?event= query param
  assert.equal(
    extractSubdomain("localhost:3003", {
      searchParams: "?event=omar-and-layla",
    }),
    "omar-and-layla"
  );

  // URLSearchParams instance
  const params = new URLSearchParams("subdomain=custom-gala");
  assert.equal(
    extractSubdomain("localhost:3002", { searchParams: params }),
    "custom-gala"
  );

  // Query override takes precedence over hostname when enabled
  assert.equal(
    extractSubdomain("other-event.localhost:3002", {
      searchParams: "?subdomain=override-event",
    }),
    "override-event"
  );

  // Query override ignored when allowQueryOverride is false
  assert.equal(
    extractSubdomain("host-event.localhost:3002", {
      searchParams: "?subdomain=ignored-event",
      allowQueryOverride: false,
    }),
    "host-event"
  );

  // Reserved query parameter is rejected
  assert.equal(
    extractSubdomain("localhost:3002", {
      searchParams: "?subdomain=admin",
    }),
    null
  );
});

// -------------------------------------------------------------
// 4. Memory URL Builder (Booth & Invitation)
// -------------------------------------------------------------
test("buildMemoryUrls: generates correct URLs for Booth service", () => {
  const boothUrls = buildMemoryUrls({
    slug: "mina-and-maryam",
    type: "booth",
  });

  assert.equal(
    boothUrls.canonicalUrl,
    "https://mina-and-maryam.asar.me"
  );
  assert.equal(
    boothUrls.devLocalhostUrl,
    "http://mina-and-maryam.localhost:3002"
  );
  assert.equal(
    boothUrls.devRendererUrl,
    "http://mina-and-maryam.localhost:3004"
  );
  assert.equal(
    boothUrls.devQueryUrl,
    "http://localhost:3002?subdomain=mina-and-maryam"
  );
  assert.equal(boothUrls.isSubdomain, true);
  assert.equal(boothUrls.primaryUrl, "https://mina-and-maryam.asar.me");

  // In development mode, primaryUrl points to devLocalhostUrl
  const devUrls = buildMemoryUrls({
    slug: "mina-and-maryam",
    type: "booth",
    isDev: true,
  });
  assert.equal(devUrls.primaryUrl, "http://mina-and-maryam.localhost:3002");

  // Custom port
  const customPortUrls = buildMemoryUrls({
    slug: "mina-and-maryam",
    type: "booth",
    port: 8080,
  });
  assert.equal(
    customPortUrls.devLocalhostUrl,
    "http://mina-and-maryam.localhost:8080"
  );
  assert.equal(
    customPortUrls.devQueryUrl,
    "http://localhost:8080?subdomain=mina-and-maryam"
  );

  // Custom rendererPort
  const customRendererUrls = buildMemoryUrls({
    slug: "mina-and-maryam",
    type: "booth",
    rendererPort: 3009,
  });
  assert.equal(
    customRendererUrls.devRendererUrl,
    "http://mina-and-maryam.localhost:3009"
  );
});

test("buildMemoryUrls: generates correct URLs for Invitation service", () => {
  const invUrls = buildMemoryUrls({
    slug: "omar-and-layla",
    type: "invitation",
  });

  assert.equal(
    invUrls.canonicalUrl,
    "https://omar-and-layla.asar.me"
  );
  assert.equal(
    invUrls.devLocalhostUrl,
    "http://omar-and-layla.localhost:3003"
  );
  assert.equal(
    invUrls.devRendererUrl,
    "http://omar-and-layla.localhost:3004"
  );
  assert.equal(
    invUrls.devQueryUrl,
    "http://localhost:3003?subdomain=omar-and-layla"
  );
  assert.equal(invUrls.isSubdomain, true);

  // Custom root domain (e.g. asar.audio)
  const audioUrls = buildMemoryUrls({
    slug: "omar-and-layla",
    type: "invitation",
    rootDomain: "asar.audio",
  });
  assert.equal(
    audioUrls.canonicalUrl,
    "https://omar-and-layla.asar.audio"
  );
});

test("buildMemoryUrls: handles empty or missing slug gracefully", () => {
  const emptyUrls = buildMemoryUrls({
    slug: "",
    type: "booth",
  });

  assert.equal(emptyUrls.isSubdomain, false);
  assert.equal(emptyUrls.canonicalUrl, "https://asar.me");
  assert.equal(emptyUrls.devLocalhostUrl, "http://localhost:3002");
  assert.equal(emptyUrls.devRendererUrl, "http://localhost:3004");
  assert.equal(emptyUrls.devQueryUrl, "http://localhost:3002");

  // Custom rendererPort on empty slug
  const emptyCustom = buildMemoryUrls({
    slug: "",
    type: "booth",
    rendererPort: 3009,
  });
  assert.equal(emptyCustom.devRendererUrl, "http://localhost:3009");
});

// -------------------------------------------------------------
// 5. 4-Tier Resolution Hierarchy (resolveSubdomain)
// -------------------------------------------------------------
test("resolveSubdomain: adheres strictly to the 4-tier resolution hierarchy", () => {
  // Tier 1: Query parameter overrides all others
  const t1 = resolveSubdomain({
    searchParams: "?subdomain=query-slug",
    routeParam: "route-slug",
    hostname: "host-slug.localhost:3002",
    fallbackSubdomain: "fallback-slug",
  });
  assert.equal(t1.subdomain, "query-slug");
  assert.equal(t1.source, "query");
  assert.equal(t1.isSubdomain, true);

  // Tier 2: Route param when query is absent
  const t2 = resolveSubdomain({
    routeParam: "route-slug",
    hostname: "host-slug.localhost:3002",
    fallbackSubdomain: "fallback-slug",
  });
  assert.equal(t2.subdomain, "route-slug");
  assert.equal(t2.source, "param");
  assert.equal(t2.isSubdomain, true);

  // Tier 3: Hostname subdomain when query and route are absent
  const t3 = resolveSubdomain({
    hostname: "host-slug.localhost:3002",
    fallbackSubdomain: "fallback-slug",
  });
  assert.equal(t3.subdomain, "host-slug");
  assert.equal(t3.source, "hostname");
  assert.equal(t3.isSubdomain, true);

  // Tier 4: Fallback when hostname is bare localhost and no params
  const t4 = resolveSubdomain({
    hostname: "localhost:3002",
    fallbackSubdomain: "fallback-slug",
  });
  assert.equal(t4.subdomain, "fallback-slug");
  assert.equal(t4.source, "fallback");
  assert.equal(t4.isSubdomain, true);

  // No match
  const tNone = resolveSubdomain({
    hostname: "localhost:3002",
  });
  assert.equal(tNone.subdomain, null);
  assert.equal(tNone.source, null);
  assert.equal(tNone.isSubdomain, false);
});

// -------------------------------------------------------------
// 6. Domain Model Augmentations
// -------------------------------------------------------------
test("Domain Models: BoothMemory and AsarInvitation include subdomain and customDomain", () => {
  const memory: BoothMemory = {
    slug: "mina-and-maryam",
    subdomain: "mina-and-maryam",
    customDomain: "minaandmaryam.com",
    coupleTitle: "Mina & Maryam",
    isPrivateLocked: false,
    isPublished: true,
  };

  assert.equal(memory.subdomain, "mina-and-maryam");
  assert.equal(memory.customDomain, "minaandmaryam.com");

  const invitation: AsarInvitation = {
    slug: "omar-and-layla",
    subdomain: "omar-and-layla",
    customDomain: "omarandlayla.wedding",
    eventTitle: "The Wedding of Omar & Layla",
    occasionType: "wedding",
    eventDate: "2026-10-15",
    venueName: "Four Seasons Alexandria",
    isPublished: true,
  };

  assert.equal(invitation.subdomain, "omar-and-layla");
  assert.equal(invitation.customDomain, "omarandlayla.wedding");
});

// -------------------------------------------------------------
// 7. Storefront LocalStorage Cache Normalizer (cacheHelper)
// -------------------------------------------------------------

function createMockStorage(initial: Record<string, string> = {}): Storage {
  const store: Record<string, string> = { ...initial };
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

test("normalizeCacheArray: handles corrupt, empty, and primitive inputs safely", () => {
  assert.deepEqual(normalizeCacheArray(null), []);
  assert.deepEqual(normalizeCacheArray(undefined), []);
  assert.deepEqual(normalizeCacheArray(""), []);
  assert.deepEqual(normalizeCacheArray("   "), []);
  assert.deepEqual(normalizeCacheArray("invalid json {not: valid}"), []);
  assert.deepEqual(normalizeCacheArray(12345), []);
  assert.deepEqual(normalizeCacheArray(true), []);
  assert.deepEqual(normalizeCacheArray({}), []);
});

test("normalizeCacheArray: normalizes single-object schemas (e.g. Booth Memory Studio save)", () => {
  // Case A: Raw JSON string of a single record object
  const singleBoothObj = {
    slug: "mina-and-maryam",
    coupleTitle: "Mina & Maryam",
    isPublished: true,
  };
  const normalizedA = normalizeCacheArray(JSON.stringify(singleBoothObj));
  assert.equal(Array.isArray(normalizedA), true);
  assert.equal(normalizedA.length, 1);
  assert.deepEqual(normalizedA[0], singleBoothObj);

  // Case B: Direct JavaScript object passed
  const directObj = { id: "booth_42", slug: "sarah-and-ali" };
  const normalizedB = normalizeCacheArray(directObj);
  assert.equal(normalizedB.length, 1);
  assert.deepEqual(normalizedB[0], directObj);
});

test("normalizeCacheArray: normalizes array schemas (e.g. Invitation list)", () => {
  const list = [
    { slug: "inv-1", eventTitle: "Gala Night" },
    { slug: "inv-2", eventTitle: "Royal Wedding" },
  ];
  const normalized = normalizeCacheArray(JSON.stringify(list));
  assert.equal(normalized.length, 2);
  assert.deepEqual(normalized, list);

  // Filters out null or primitive items within array
  const dirtyArray = [
    { slug: "valid-1" },
    null,
    undefined,
    "garbage",
    { slug: "valid-2" },
  ];
  const cleaned = normalizeCacheArray(dirtyArray);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0].slug, "valid-1");
  assert.equal(cleaned[1].slug, "valid-2");
});

test("normalizeCacheArray: unpacks envelope wrapper objects", () => {
  const wrappedItems = {
    items: [{ slug: "wrapped-1" }, { slug: "wrapped-2" }],
  };
  assert.equal(normalizeCacheArray(wrappedItems).length, 2);

  const wrappedMemories = {
    memories: [{ slug: "mem-1" }],
  };
  assert.equal(normalizeCacheArray(wrappedMemories).length, 1);

  const wrappedInvitations = {
    invitations: [{ slug: "inv-1" }],
  };
  assert.equal(normalizeCacheArray(wrappedInvitations).length, 1);

  const wrappedDocs = {
    documents: [{ slug: "doc-1" }],
  };
  assert.equal(normalizeCacheArray(wrappedDocs).length, 1);
});

test("getNormalizedCache: safely reads and normalizes from storage", () => {
  const mockStorage = createMockStorage({
    [ASAR_CACHE_KEYS.BOOTH_MEMORIES]: JSON.stringify({
      slug: "booth-single",
      coupleTitle: "Single Booth",
    }),
    [ASAR_CACHE_KEYS.INVITATIONS]: JSON.stringify([
      { slug: "inv-1", eventTitle: "Wedding 1" },
      { slug: "inv-2", eventTitle: "Wedding 2" },
    ]),
  });

  // Booth memories stored as single object is normalized to array
  const boothList = getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, mockStorage);
  assert.equal(boothList.length, 1);
  assert.equal(boothList[0].slug, "booth-single");

  // Invitations stored as array remains array
  const invList = getNormalizedCache(ASAR_CACHE_KEYS.INVITATIONS, mockStorage);
  assert.equal(invList.length, 2);
  assert.equal(invList[0].slug, "inv-1");

  // Non-existent key returns empty array
  const missing = getNormalizedCache("non_existent_key", mockStorage);
  assert.deepEqual(missing, []);

  // Null storage returns empty array
  assert.deepEqual(getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, null), []);
});

test("findInCache: accurately finds records by slug, id, or $id", () => {
  const mockRecords = [
    { id: "rec_1", slug: "mina-and-maryam", coupleTitle: "Mina & Maryam" },
    { $id: "doc_99", slug: "omar-and-layla", eventTitle: "Omar & Layla" },
  ];

  // Match by slug
  const bySlug = findInCache(mockRecords, "mina-and-maryam");
  assert.ok(bySlug);
  assert.equal(bySlug?.id, "rec_1");

  // Match case-insensitively
  const caseInsensitive = findInCache(mockRecords, "MINA-AND-MARYAM");
  assert.ok(caseInsensitive);
  assert.equal(caseInsensitive?.id, "rec_1");

  // Match by id
  const byId = findInCache(mockRecords, "rec_1");
  assert.ok(byId);
  assert.equal(byId?.slug, "mina-and-maryam");

  // Match by $id (Appwrite document ID)
  const byAppwriteId = findInCache(mockRecords, "doc_99");
  assert.ok(byAppwriteId);
  assert.equal(byAppwriteId?.slug, "omar-and-layla");

  // Not found
  assert.equal(findInCache(mockRecords, "unknown-slug"), null);
  assert.equal(findInCache(mockRecords, ""), null);

  // Reading via storage key
  const mockStorage = createMockStorage({
    [ASAR_CACHE_KEYS.BOOTH_MEMORIES]: JSON.stringify({
      slug: "stored-memory",
      coupleTitle: "Stored Memory",
    }),
  });
  const foundInStorage = findInCache(
    ASAR_CACHE_KEYS.BOOTH_MEMORIES,
    "stored-memory",
    mockStorage
  );
  assert.ok(foundInStorage);
  assert.equal(foundInStorage?.slug, "stored-memory");
});

test("setNormalizedCache: writes arrays and upserts single records safely", () => {
  const mockStorage = createMockStorage();

  // 1. Write full array
  const initialArray = [{ slug: "first-event" }];
  const success1 = setNormalizedCache(
    ASAR_CACHE_KEYS.INVITATIONS,
    initialArray,
    mockStorage
  );
  assert.equal(success1, true);
  assert.equal(
    getNormalizedCache(ASAR_CACHE_KEYS.INVITATIONS, mockStorage).length,
    1
  );

  // 2. Upsert a new single record into existing cache
  const newItem = { slug: "second-event" };
  const success2 = setNormalizedCache(
    ASAR_CACHE_KEYS.INVITATIONS,
    newItem,
    mockStorage
  );
  assert.equal(success2, true);
  const updatedList = getNormalizedCache(
    ASAR_CACHE_KEYS.INVITATIONS,
    mockStorage
  );
  assert.equal(updatedList.length, 2);
  assert.equal(updatedList[0].slug, "first-event");
  assert.equal(updatedList[1].slug, "second-event");

  // 3. Upsert updating existing item by slug
  const updatedFirst = { slug: "first-event", updated: true };
  setNormalizedCache(ASAR_CACHE_KEYS.INVITATIONS, updatedFirst, mockStorage);
  const listAfterUpdate = getNormalizedCache(
    ASAR_CACHE_KEYS.INVITATIONS,
    mockStorage
  );
  assert.equal(listAfterUpdate.length, 2);
  const foundFirst = listAfterUpdate.find((e: any) => e.slug === "first-event");
  assert.equal((foundFirst as any)?.updated, true);
});

test("getBoothMemoriesCache & getInvitationsCache: retrieve typed data from default keys", () => {
  const mockStorage = createMockStorage({
    [ASAR_CACHE_KEYS.BOOTH_MEMORIES]: JSON.stringify({
      slug: "booth-wedding",
      coupleTitle: "Booth Wedding",
    }),
    [ASAR_CACHE_KEYS.INVITATIONS]: JSON.stringify([
      { slug: "invitation-gala" },
    ]),
  });

  const booth = getBoothMemoriesCache(mockStorage);
  assert.equal(booth.length, 1);
  assert.equal(booth[0].slug, "booth-wedding");

  const invitations = getInvitationsCache(mockStorage);
  assert.equal(invitations.length, 1);
  assert.equal(invitations[0].slug, "invitation-gala");
});

