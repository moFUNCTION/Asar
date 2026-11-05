// =============================================================
// ASAR (Athar / أثر) — Adversarial Subdomain & Cache Stress Test Harness
// Challenger M6.1 Verification Harness
// Verified with: node --experimental-strip-types --test
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  RESERVED_SUBDOMAINS,
  RESERVED_SUBDOMAIN_LIST,
  DEFAULT_ROOT_DOMAINS,
  validateSubdomainSlug,
  isReservedSubdomain,
  extractSubdomain,
} from "../../../packages/react-appwrite/src/Storefront/subdomain.ts";

import {
  resolveSubdomain,
  type UseSubdomainOptions,
} from "../../../packages/react-appwrite/src/Storefront/useSubdomain.ts";

import {
  ASAR_CACHE_KEYS,
  normalizeCacheArray,
  getNormalizedCache,
  findInCache,
  setNormalizedCache,
  getSafeLocalStorage,
  getBoothMemoriesCache,
  getInvitationsCache,
} from "../../../packages/react-appwrite/src/Storefront/cacheHelper.ts";

import {
  buildMemoryUrls,
} from "../../../packages/react-appwrite/src/Storefront/urlBuilder.ts";

// -------------------------------------------------------------
// In-Memory Storage Mocks for Node.js Testing
// -------------------------------------------------------------

class MockStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] || null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

class ThrowingStorage implements Storage {
  get length(): number {
    throw new Error("SecurityError: Access is denied");
  }
  clear(): void {
    throw new Error("SecurityError: Access is denied");
  }
  getItem(): string | null {
    throw new Error("SecurityError: Access is denied");
  }
  key(): string | null {
    throw new Error("SecurityError: Access is denied");
  }
  removeItem(): void {
    throw new Error("SecurityError: Access is denied");
  }
  setItem(): void {
    throw new Error("QuotaExceededError: storage limit reached");
  }
}

// =============================================================
// TEST SUITE 1: Extreme Hostnames & Port Attachments
// =============================================================

describe("Adversarial Stress — Extreme Hostnames & Ports", () => {
  it("handles standard and custom ports on RFC 6761 localhost", () => {
    assert.equal(extractSubdomain("mina-and-maryam.localhost:3004"), "mina-and-maryam");
    assert.equal(extractSubdomain("omar-and-layla.localhost:80"), "omar-and-layla");
    assert.equal(extractSubdomain("cairo-gala.localhost:443"), "cairo-gala");
    assert.equal(extractSubdomain("royal-event.localhost:8080"), "royal-event");
    assert.equal(extractSubdomain("summit-2026.localhost:65535"), "summit-2026");
  });

  it("handles production apex domains with ports attached", () => {
    assert.equal(extractSubdomain("mina-and-maryam.asar.me:443"), "mina-and-maryam");
    assert.equal(extractSubdomain("omar-and-layla.asar.audio:8443"), "omar-and-layla");
    assert.equal(extractSubdomain("custom-showcase.asar.me:3000"), "custom-showcase");
  });

  it("handles protocols (http://, https://, mixed case) and path appendages", () => {
    assert.equal(
      extractSubdomain("http://mina-and-maryam.localhost:3004/s/mina-and-maryam"),
      "mina-and-maryam"
    );
    assert.equal(
      extractSubdomain("HTTPS://OMAR-AND-LAYLA.LOCALHOST:3004/invitation/omar-and-layla?preview=true"),
      "omar-and-layla"
    );
    assert.equal(
      extractSubdomain("https://vip-gala.asar.me/pass/INV-9901#section-venue"),
      "vip-gala"
    );
  });

  it("handles surrounding whitespace and irregular whitespace safely", () => {
    assert.equal(
      extractSubdomain("   mina-and-maryam.localhost:3004   "),
      "mina-and-maryam"
    );
    assert.equal(
      extractSubdomain("\troyal-wedding.asar.me:443\n"),
      "royal-wedding"
    );
  });

  it("returns null for bare apex domains across ports and protocols", () => {
    assert.equal(extractSubdomain("localhost:3004"), null);
    assert.equal(extractSubdomain("localhost"), null);
    assert.equal(extractSubdomain("http://localhost:3004/"), null);
    assert.equal(extractSubdomain("https://localhost:8080/s/test"), null);
    assert.equal(extractSubdomain("asar.me"), null);
    assert.equal(extractSubdomain("asar.me:443"), null);
    assert.equal(extractSubdomain("https://asar.me/"), null);
    assert.equal(extractSubdomain("asar.audio"), null);
    assert.equal(extractSubdomain("http://asar.audio:80/"), null);
  });

  it("handles white-labeled custom rootDomains correctly", () => {
    const opts = { rootDomains: ["royal-celebrations.com", "atharguestbook.ae"] };
    assert.equal(
      extractSubdomain("sheikh-wedding.royal-celebrations.com:3004", opts),
      "sheikh-wedding"
    );
    assert.equal(
      extractSubdomain("dubai-expo.atharguestbook.ae", opts),
      "dubai-expo"
    );
    // Bare custom root returns null
    assert.equal(extractSubdomain("royal-celebrations.com", opts), null);
    assert.equal(extractSubdomain("atharguestbook.ae:443", opts), null);
  });

  it("returns null for malformed or non-string hostnames safely", () => {
    assert.equal(extractSubdomain(""), null);
    assert.equal(extractSubdomain("   "), null);
    assert.equal(extractSubdomain(null), null);
    assert.equal(extractSubdomain(undefined), null);
    assert.equal(extractSubdomain(12345 as unknown as string), null);
    assert.equal(extractSubdomain({} as unknown as string), null);
  });
});

// =============================================================
// TEST SUITE 2: Multi-Level Subdomains & Hierarchy Splitting
// =============================================================

describe("Adversarial Stress — Multi-Level Subdomains", () => {
  it("extracts the primary tenant label in multi-level localhost subdomains", () => {
    // In RFC 6761 *.localhost, sub.split('.')[0] extracts the leftmost tenant label
    assert.equal(extractSubdomain("a.b.c.localhost"), "a");
    assert.equal(extractSubdomain("tenant.dept.localhost:3004"), "tenant");
    assert.equal(extractSubdomain("foo-bar.baz.localhost:3004"), "foo-bar");
  });

  it("extracts the primary tenant label in multi-level production apex domains", () => {
    assert.equal(extractSubdomain("vip.wedding.asar.me"), "vip");
    assert.equal(extractSubdomain("gallery.ceremony.asar.audio"), "gallery");
  });

  it("rejects multi-level subdomain when the tenant label is a reserved system name", () => {
    // If leftmost label is reserved, it must be rejected
    assert.equal(extractSubdomain("admin.tenant1.localhost:3004"), null);
    assert.equal(extractSubdomain("api.services.asar.me"), null);
    assert.equal(extractSubdomain("cdn.assets.localhost:3004"), null);
  });

  it("accepts tenant label when inner label happens to be a reserved word", () => {
    // e.g. tenant-slug.admin.localhost:3004 -> tenant-slug is the leftmost label
    assert.equal(extractSubdomain("mina-and-maryam.admin.localhost:3004"), "mina-and-maryam");
    assert.equal(extractSubdomain("celebration.api.asar.me"), "celebration");
  });

  it("returns null when tenant label contains invalid characters in multi-level domain", () => {
    assert.equal(extractSubdomain("bad_label.service.localhost:3004"), null);
    assert.equal(extractSubdomain("-leading-hyphen.corp.localhost"), null);
    assert.equal(extractSubdomain("trailing-hyphen-.corp.localhost"), null);
  });
});

// =============================================================
// TEST SUITE 3: IP Addresses (IPv4 Loopback, LAN, Public, IPv6)
// =============================================================

describe("Adversarial Stress — IP Address Immunity", () => {
  it("never extracts subdomains from IPv4 loopback (127.0.0.1)", () => {
    assert.equal(extractSubdomain("127.0.0.1"), null);
    assert.equal(extractSubdomain("127.0.0.1:3004"), null);
    assert.equal(extractSubdomain("http://127.0.0.1:3004/s/mina-and-maryam"), null);
    assert.equal(extractSubdomain("127.0.1.1:8080"), null);
  });

  it("never extracts subdomains from wildcard IPv4 (0.0.0.0)", () => {
    assert.equal(extractSubdomain("0.0.0.0"), null);
    assert.equal(extractSubdomain("0.0.0.0:3004"), null);
    assert.equal(extractSubdomain("http://0.0.0.0:80/"), null);
  });

  it("never extracts subdomains from private / LAN IPv4 addresses", () => {
    assert.equal(extractSubdomain("192.168.1.1"), null);
    assert.equal(extractSubdomain("192.168.1.1:3004"), null);
    assert.equal(extractSubdomain("192.168.0.105:3004"), null);
    assert.equal(extractSubdomain("10.0.0.1"), null);
    assert.equal(extractSubdomain("10.10.10.10:8080"), null);
    assert.equal(extractSubdomain("172.16.0.1:3004"), null);
  });

  it("never extracts subdomains from public IPv4 addresses", () => {
    assert.equal(extractSubdomain("8.8.8.8"), null);
    assert.equal(extractSubdomain("8.8.8.8:53"), null);
    assert.equal(extractSubdomain("1.1.1.1:443"), null);
    assert.equal(extractSubdomain("93.184.216.34:80"), null);
  });

  it("never extracts subdomains from IPv6 loopback (::1 and [::1])", () => {
    assert.equal(extractSubdomain("::1"), null);
    assert.equal(extractSubdomain("[::1]"), null);
    assert.equal(extractSubdomain("[::1]:3004"), null);
    assert.equal(extractSubdomain("http://[::1]:3004/"), null);
  });

  it("never extracts subdomains from global or link-local IPv6 addresses", () => {
    assert.equal(extractSubdomain("fe80::1"), null);
    assert.equal(extractSubdomain("[fe80::1]:8080"), null);
    assert.equal(extractSubdomain("[2001:db8::1]:3004"), null);
    assert.equal(extractSubdomain("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), null);
  });

  it("resolveSubdomain triggers bare apex portal state for all IP formats", () => {
    const ipTargets = [
      "127.0.0.1:3004",
      "0.0.0.0:3004",
      "192.168.1.1:3004",
      "10.0.0.1:3004",
      "[::1]:3004",
      "[fe80::1]:8080",
    ];

    for (const host of ipTargets) {
      const res = resolveSubdomain({ hostname: host });
      assert.equal(
        res.subdomain,
        null,
        `Expected IP host ${host} to yield subdomain null`
      );
      assert.equal(
        res.isSubdomain,
        false,
        `Expected IP host ${host} to yield isSubdomain false`
      );
      assert.equal(
        res.source,
        null,
        `Expected IP host ${host} to yield source null`
      );
    }
  });
});

// =============================================================
// TEST SUITE 4: All 16 Reserved System Subdomains Exhaustive Audit
// =============================================================

describe("Adversarial Stress — All 16 Reserved Subdomains", () => {
  const ALL_16_RESERVED = [
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
  ] as const;

  it("verifies RESERVED_SUBDOMAINS contains exactly or at least all 16 canonical names", () => {
    assert.equal(ALL_16_RESERVED.length, 16);
    for (const name of ALL_16_RESERVED) {
      assert.ok(
        RESERVED_SUBDOMAINS.has(name),
        `Missing reserved name in Set: ${name}`
      );
      assert.ok(
        RESERVED_SUBDOMAIN_LIST.includes(name),
        `Missing reserved name in List: ${name}`
      );
    }
  });

  it("isReservedSubdomain returns true for all 16 reserved names across casing and whitespace", () => {
    for (const name of ALL_16_RESERVED) {
      assert.equal(isReservedSubdomain(name), true, `Failed for ${name}`);
      assert.equal(isReservedSubdomain(name.toUpperCase()), true, `Failed for ${name.toUpperCase()}`);
      assert.equal(isReservedSubdomain(`  ${name}  `), true, `Failed for whitespace ${name}`);
    }
  });

  it("validateSubdomainSlug rejects all 16 reserved names with explicit 'reserved' error", () => {
    for (const name of ALL_16_RESERVED) {
      const res = validateSubdomainSlug(name);
      assert.equal(res.isValid, false, `Slug "${name}" must be invalid`);
      assert.ok(
        res.error?.toLowerCase().includes("reserved"),
        `Error for "${name}" must contain 'reserved', got: "${res.error}"`
      );
    }
  });

  it("extractSubdomain returns null for all 16 reserved names on RFC 6761 localhost:3004", () => {
    for (const name of ALL_16_RESERVED) {
      const res = extractSubdomain(`${name}.localhost:3004`);
      assert.equal(
        res,
        null,
        `extractSubdomain("${name}.localhost:3004") must return null`
      );
    }
  });

  it("extractSubdomain returns null for all 16 reserved names on production asar.me", () => {
    for (const name of ALL_16_RESERVED) {
      const res = extractSubdomain(`${name}.asar.me`);
      assert.equal(
        res,
        null,
        `extractSubdomain("${name}.asar.me") must return null`
      );
    }
  });

  it("extractSubdomain rejects all 16 reserved names passed via query override", () => {
    for (const name of ALL_16_RESERVED) {
      const res = extractSubdomain("localhost:3004", {
        searchParams: `?subdomain=${name}`,
      });
      assert.equal(
        res,
        null,
        `extractSubdomain query override ?subdomain=${name} must return null`
      );
    }
  });

  it("resolveSubdomain rejects all 16 reserved names from hostname", () => {
    for (const name of ALL_16_RESERVED) {
      const res = resolveSubdomain({ hostname: `${name}.localhost:3004` });
      assert.equal(res.subdomain, null);
      assert.equal(res.isSubdomain, false);
      assert.equal(res.source, null);
    }
  });

  it("resolveSubdomain rejects all 16 reserved names from routeParam", () => {
    for (const name of ALL_16_RESERVED) {
      const res = resolveSubdomain({ routeParam: name });
      assert.equal(res.subdomain, null);
      assert.equal(res.isSubdomain, false);
      assert.equal(res.source, null);
    }
  });
});

// =============================================================
// TEST SUITE 5: RFC 1123 Boundary Fuzzing & Adversarial Inputs
// =============================================================

describe("Adversarial Stress — RFC 1123 Boundary Fuzzing", () => {
  it("accepts valid 1-character slugs (minimum RFC 1123 length)", () => {
    const chars = ["a", "b", "m", "z", "0", "1", "9"];
    for (const c of chars) {
      assert.equal(validateSubdomainSlug(c).isValid, true, `Single char "${c}" must be valid`);
    }
  });

  it("accepts valid 2-character slugs", () => {
    assert.equal(validateSubdomainSlug("m1").isValid, true);
    assert.equal(validateSubdomainSlug("99").isValid, true);
    assert.equal(validateSubdomainSlug("ab").isValid, true);
  });

  it("boundary test: accepts exact 63-character slug (RFC 1123 maximum limit)", () => {
    // 1 char 'a' + 30 * '-b' (60 chars) + '-c' (2 chars) = 63 characters
    const slug63 = "a" + "-b".repeat(30) + "-c";
    assert.equal(slug63.length, 63);
    const result = validateSubdomainSlug(slug63);
    assert.equal(result.isValid, true, `63-char slug must be valid: ${result.error}`);
  });

  it("boundary test: rejects 64-character slug (RFC 1123 overflow by 1 char)", () => {
    const slug64 = "a".repeat(64);
    assert.equal(slug64.length, 64);
    const result = validateSubdomainSlug(slug64);
    assert.equal(result.isValid, false);
    assert.ok(result.error?.includes("63"));
  });

  it("boundary test: rejects extreme length slugs (100 and 500 chars)", () => {
    assert.equal(validateSubdomainSlug("a".repeat(100)).isValid, false);
    assert.equal(validateSubdomainSlug("b".repeat(500)).isValid, false);
  });

  it("rejects leading hyphens across all permutations", () => {
    const candidates = ["-wedding", "--wedding", "-a", "-0", "-mina-and-maryam"];
    for (const c of candidates) {
      const res = validateSubdomainSlug(c);
      assert.equal(res.isValid, false, `Leading hyphen slug "${c}" must be invalid`);
      assert.ok(res.error?.includes("hyphen"));
    }
  });

  it("rejects trailing hyphens across all permutations", () => {
    const candidates = ["wedding-", "wedding--", "a-", "0-", "mina-and-maryam-"];
    for (const c of candidates) {
      const res = validateSubdomainSlug(c);
      assert.equal(res.isValid, false, `Trailing hyphen slug "${c}" must be invalid`);
      assert.ok(res.error?.includes("hyphen"));
    }
  });

  it("rejects solitary and only-hyphen strings", () => {
    const candidates = ["-", "--", "---", "----"];
    for (const c of candidates) {
      assert.equal(validateSubdomainSlug(c).isValid, false);
    }
  });

  it("accepts valid internal consecutive hyphens (RFC 1123 compliance)", () => {
    // In DNS / RFC 1123, internal consecutive hyphens like 'a--b' are legal label syntax (e.g. IDN punycode xn--)
    assert.equal(validateSubdomainSlug("foo--bar").isValid, true);
    assert.equal(validateSubdomainSlug("wedding---ceremony").isValid, true);
    assert.equal(validateSubdomainSlug("a--b--c").isValid, true);
  });

  it("rejects uppercase and mixed-case strings strictly in validateSubdomainSlug", () => {
    const mixed = [
      "Wedding",
      "WEDDING",
      "mina-And-maryam",
      "CairoGala",
      "Omar_And_Layla",
    ];
    for (const s of mixed) {
      const res = validateSubdomainSlug(s);
      assert.equal(res.isValid, false, `Mixed/upper slug "${s}" must fail validation`);
    }
  });

  it("rejects special characters, spaces, and punctuation fuzzing", () => {
    const illegalChars = [
      "mina_maryam",    // underscore
      "mina.maryam",    // dot
      "mina maryam",    // space
      "mina\tmaryam",   // tab
      "mina\nmaryam",   // newline
      "mina@maryam",    // at
      "mina#maryam",    // hash
      "mina$maryam",    // dollar
      "mina%maryam",    // percent
      "mina^maryam",    // caret
      "mina&maryam",    // ampersand
      "mina*maryam",    // asterisk
      "mina(maryam)",   // parens
      "mina+maryam",    // plus
      "mina=maryam",    // equals
      "mina/maryam",    // slash
      "mina\\maryam",   // backslash
      "mina:maryam",    // colon
      "mina;maryam",    // semicolon
      "mina'maryam",    // single quote
      'mina"maryam',    // double quote
      "mina<maryam>",   // angle brackets
      "mina?maryam",    // question mark
      "mina!maryam",    // exclamation mark
      "mina~maryam",    // tilde
    ];

    for (const bad of illegalChars) {
      const res = validateSubdomainSlug(bad);
      assert.equal(res.isValid, false, `Illegal slug "${bad}" must be invalid`);
    }
  });

  it("rejects emojis and surrogate pairs safely without crashing", () => {
    const emojis = ["💍", "🎉", "✨", "wedding👰groom", "❤️", "👑"];
    for (const emoji of emojis) {
      const res = validateSubdomainSlug(emoji);
      assert.equal(res.isValid, false, `Emoji "${emoji}" must be invalid`);
      assert.equal(extractSubdomain(`${emoji}.localhost:3004`), null);
    }
  });

  it("rejects UTF-8 Arabic and non-Latin unicode strings safely without crashing", () => {
    const arabicSlugs = ["أثر", "مينا-ومريم", "عرس", "حفل-زفاف-عمر-وليلى"];
    for (const ar of arabicSlugs) {
      const res = validateSubdomainSlug(ar);
      assert.equal(res.isValid, false, `Arabic slug "${ar}" must be invalid under RFC 1123 ASCII rules`);
      assert.equal(extractSubdomain(`${ar}.localhost:3004`), null);
    }
  });

  it("handles null, undefined, non-strings, and empty strings safely", () => {
    assert.equal(validateSubdomainSlug(null).isValid, false);
    assert.equal(validateSubdomainSlug(undefined).isValid, false);
    assert.equal(validateSubdomainSlug("").isValid, false);
    assert.equal(validateSubdomainSlug("   ").isValid, false);
    assert.equal(validateSubdomainSlug(12345 as unknown as string).isValid, false);
    assert.equal(validateSubdomainSlug([] as unknown as string).isValid, false);
    assert.equal(validateSubdomainSlug({} as unknown as string).isValid, false);
  });
});

// =============================================================
// TEST SUITE 6: Query Override Precedence & Precedence Bypass
// =============================================================

describe("Adversarial Stress — Query Override & Precedence", () => {
  it("Tier 1: ?subdomain= query parameter overrides routeParam, hostname, and fallback", () => {
    const res = resolveSubdomain({
      searchParams: "?subdomain=query-king",
      routeParam: "route-queen",
      hostname: "host-prince.localhost:3004",
      fallbackSubdomain: "fallback-knight",
      allowQueryOverride: true,
    });

    assert.equal(res.subdomain, "query-king");
    assert.equal(res.source, "query");
    assert.equal(res.isSubdomain, true);
  });

  it("Tier 1: ?memory= and ?event= query parameters work identically to ?subdomain=", () => {
    const resMem = resolveSubdomain({
      searchParams: "?memory=booth-suite",
      routeParam: "route-queen",
      hostname: "host-prince.localhost:3004",
    });
    assert.equal(resMem.subdomain, "booth-suite");
    assert.equal(resMem.source, "query");

    const resEvt = resolveSubdomain({
      searchParams: "?event=gala-night",
      routeParam: "route-queen",
      hostname: "host-prince.localhost:3004",
    });
    assert.equal(resEvt.subdomain, "gala-night");
    assert.equal(resEvt.source, "query");
  });

  it("Tier 1: query override normalizes uppercase and whitespace", () => {
    const res = resolveSubdomain({
      searchParams: "?subdomain=%20MINA-AND-MARYAM%20",
      hostname: "localhost:3004",
    });
    assert.equal(res.subdomain, "mina-and-maryam");
    assert.equal(res.source, "query");
    assert.equal(res.isSubdomain, true);
  });

  it("Precedence Bypass: when allowQueryOverride: false, query override is strictly ignored", () => {
    const res = resolveSubdomain({
      searchParams: "?subdomain=ignored-query-slug",
      routeParam: "enforced-route-slug",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
      allowQueryOverride: false,
    });

    assert.equal(res.subdomain, "enforced-route-slug");
    assert.equal(res.source, "param");
    assert.equal(res.isSubdomain, true);
  });

  it("Precedence Bypass: when allowQueryOverride: false and no routeParam, hostname wins", () => {
    const res = resolveSubdomain({
      searchParams: "?subdomain=ignored-query-slug",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
      allowQueryOverride: false,
    });

    assert.equal(res.subdomain, "host-slug");
    assert.equal(res.source, "hostname");
    assert.equal(res.isSubdomain, true);
  });

  it("Resilience: invalid query param falls through safely to routeParam or hostname", () => {
    // ?subdomain=admin is reserved -> Tier 1 fails -> falls to Tier 2 routeParam
    const resReserved = resolveSubdomain({
      searchParams: "?subdomain=admin",
      routeParam: "valid-route-memory",
      hostname: "valid-host.localhost:3004",
    });
    assert.equal(resReserved.subdomain, "valid-route-memory");
    assert.equal(resReserved.source, "param");

    // ?subdomain=bad_slug! -> Tier 1 fails -> falls to Tier 3 hostname
    const resInvalid = resolveSubdomain({
      searchParams: "?subdomain=bad_slug!",
      hostname: "valid-host.localhost:3004",
    });
    assert.equal(resInvalid.subdomain, "valid-host");
    assert.equal(resInvalid.source, "hostname");
  });

  it("Tier 2: routeParam normalizes uppercase and whitespace", () => {
    const res = resolveSubdomain({
      routeParam: "  OMAR-AND-LAYLA  ",
      hostname: "localhost:3004",
    });
    assert.equal(res.subdomain, "omar-and-layla");
    assert.equal(res.source, "param");
  });

  it("Tier 4: fallbackSubdomain is only reached when all higher tiers fail", () => {
    const res = resolveSubdomain({
      hostname: "localhost:3004",
      fallbackSubdomain: "default-wedding-memory",
    });
    assert.equal(res.subdomain, "default-wedding-memory");
    assert.equal(res.source, "fallback");
    assert.equal(res.isSubdomain, true);
  });
});

// =============================================================
// TEST SUITE 7: LocalStorage Cache Normalization & Schema Corruption Stress
// =============================================================

describe("Adversarial Stress — LocalStorage Cache Schema Corruptions", () => {
  it("handles completely invalid JSON strings without throwing and returns []", () => {
    const badStrings = [
      "{ unclosed json",
      "[1, 2, ",
      "{ foo: bar }",
      "undefined",
      "<xml>not json</xml>",
      "",
      "   ",
      "NaN",
    ];

    for (const bad of badStrings) {
      assert.deepEqual(normalizeCacheArray(bad), [], `Failed to return [] for: ${bad}`);
    }
  });

  it("handles primitive JSON values without throwing and returns []", () => {
    const primitives = ["123", '"just a string"', "true", "false", "null"];
    for (const p of primitives) {
      assert.deepEqual(normalizeCacheArray(p), [], `Failed for primitive JSON: ${p}`);
    }
  });

  it("handles null and undefined input safely and returns []", () => {
    assert.deepEqual(normalizeCacheArray(null), []);
    assert.deepEqual(normalizeCacheArray(undefined), []);
  });

  it("handles single-record objects by wrapping them into an array [record]", () => {
    const singleObj = {
      id: "booth-01",
      slug: "mina-and-maryam",
      title: "Mina & Maryam Wedding",
    };
    const normalized = normalizeCacheArray(singleObj);
    assert.equal(Array.isArray(normalized), true);
    assert.equal(normalized.length, 1);
    assert.equal(normalized[0].slug, "mina-and-maryam");
  });

  it("handles wrapped objects with standard envelope keys (items, memories, invitations, documents, list, data)", () => {
    const wrappers = [
      { items: [{ id: "1", slug: "slug-items" }] },
      { memories: [{ id: "2", slug: "slug-memories" }] },
      { invitations: [{ id: "3", slug: "slug-invitations" }] },
      { documents: [{ id: "4", slug: "slug-documents" }] },
      { list: [{ id: "5", slug: "slug-list" }] },
      { data: [{ id: "6", slug: "slug-data" }] },
    ];

    for (const w of wrappers) {
      const normalized = normalizeCacheArray(w);
      assert.equal(Array.isArray(normalized), true);
      assert.equal(normalized.length, 1);
      assert.ok(normalized[0].slug.startsWith("slug-"));
    }
  });

  it("handles empty object ({}) by returning []", () => {
    assert.deepEqual(normalizeCacheArray({}), []);
  });

  it("filters out nulls, undefined, and non-object elements inside arrays", () => {
    const dirtyArray = [
      null,
      undefined,
      42,
      "dirty string",
      true,
      { id: "clean-1", slug: "clean-slug-1" },
      null,
      { id: "clean-2", slug: "clean-slug-2" },
      false,
    ];

    const cleaned = normalizeCacheArray(dirtyArray);
    assert.equal(cleaned.length, 2);
    assert.equal(cleaned[0].slug, "clean-slug-1");
    assert.equal(cleaned[1].slug, "clean-slug-2");
  });

  it("findInCache finds records by slug, id, and Appwrite $id with case-insensitivity", () => {
    const records = [
      { id: "uuid-001", slug: "mina-and-maryam", title: "Booth Memory" },
      { $id: "appwrite-002", slug: "omar-and-layla", title: "Invitation Memory" },
      { id: "uuid-003", slug: "cairo-jazz-festival", title: "Festival" },
    ];

    // Find by slug
    assert.equal(findInCache(records, "mina-and-maryam")?.id, "uuid-001");
    assert.equal(findInCache(records, "  MINA-AND-MARYAM  ")?.id, "uuid-001");

    // Find by id
    assert.equal(findInCache(records, "uuid-001")?.slug, "mina-and-maryam");

    // Find by Appwrite $id
    assert.equal(findInCache(records, "appwrite-002")?.slug, "omar-and-layla");
    assert.equal(findInCache(records, "APPWRITE-002")?.slug, "omar-and-layla");

    // Not found
    assert.equal(findInCache(records, "non-existent-slug"), null);
    assert.equal(findInCache(records, ""), null);
  });

  it("findInCache safely skips records without id or slug without false matches", () => {
    const dirtyRecords = [
      { title: "No slug or id" } as any,
      { foo: "bar" } as any,
      { id: "valid-record", slug: "valid-slug" },
    ];

    assert.equal(findInCache(dirtyRecords, "valid-slug")?.id, "valid-record");
    assert.equal(findInCache(dirtyRecords, "non-existent"), null);
  });

  it("getNormalizedCache reads from storage and returns normalized array", () => {
    const storage = new MockStorage();
    storage.setItem(
      ASAR_CACHE_KEYS.BOOTH_MEMORIES,
      JSON.stringify({ id: "bm-1", slug: "live-booth" })
    );

    const result = getBoothMemoriesCache(storage);
    assert.equal(result.length, 1);
    assert.equal(result[0].slug, "live-booth");
  });

  it("getNormalizedCache handles corrupt JSON in storage gracefully", () => {
    const storage = new MockStorage();
    storage.setItem(ASAR_CACHE_KEYS.BOOTH_MEMORIES, "{ corrupted json syntax");

    const result = getBoothMemoriesCache(storage);
    assert.deepEqual(result, []);
  });

  it("setNormalizedCache upserts items cleanly and overwrites matching identifiers", () => {
    const storage = new MockStorage();

    // 1. Insert first item
    const item1 = { id: "item-1", slug: "slug-one", title: "Version 1" };
    assert.equal(setNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, item1, storage), true);

    let cache = getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, storage);
    assert.equal(cache.length, 1);
    assert.equal(cache[0].title, "Version 1");

    // 2. Upsert updated version with same id
    const item1Updated = { id: "item-1", slug: "slug-one", title: "Version 2 (Updated)" };
    assert.equal(setNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, item1Updated, storage), true);

    cache = getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, storage);
    assert.equal(cache.length, 1);
    assert.equal(cache[0].title, "Version 2 (Updated)");

    // 3. Upsert second distinct item
    const item2 = { id: "item-2", slug: "slug-two", title: "Second Item" };
    assert.equal(setNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, item2, storage), true);

    cache = getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, storage);
    assert.equal(cache.length, 2);
  });

  it("handles ThrowingStorage (e.g. sandboxed iframes or QuotaExceededError) safely", () => {
    const throwingStorage = new ThrowingStorage();

    // getNormalizedCache must not throw
    const result = getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, throwingStorage);
    assert.deepEqual(result, []);

    // setNormalizedCache must return false and not throw
    const writeResult = setNormalizedCache(
      ASAR_CACHE_KEYS.BOOTH_MEMORIES,
      { id: "test", slug: "test" },
      throwingStorage
    );
    assert.equal(writeResult, false);
  });
});

// =============================================================
// TEST SUITE 8: URL Builder Boundary & Port Alignment Stress
// =============================================================

describe("Adversarial Stress — URL Builder Edge Scenarios", () => {
  it("builds correct production and dev URLs for standard booth slug", () => {
    const urls = buildMemoryUrls({
      slug: "mina-and-maryam",
      type: "booth",
      isDev: true,
    });

    assert.equal(urls.canonicalUrl, "https://mina-and-maryam.asar.me");
    assert.equal(urls.devLocalhostUrl, "http://mina-and-maryam.localhost:3002");
    assert.equal(urls.devRendererUrl, "http://mina-and-maryam.localhost:3004");
    assert.equal(urls.devQueryUrl, "http://localhost:3002?subdomain=mina-and-maryam");
    assert.equal(urls.isSubdomain, true);
    assert.equal(urls.primaryUrl, "http://mina-and-maryam.localhost:3002");
  });

  it("builds correct production and dev URLs for standard invitation slug", () => {
    const urls = buildMemoryUrls({
      slug: "omar-and-layla",
      type: "invitation",
      isDev: false,
    });

    assert.equal(urls.canonicalUrl, "https://omar-and-layla.asar.me");
    assert.equal(urls.devLocalhostUrl, "http://omar-and-layla.localhost:3003");
    assert.equal(urls.devRendererUrl, "http://omar-and-layla.localhost:3004");
    assert.equal(urls.devQueryUrl, "http://localhost:3003?subdomain=omar-and-layla");
    assert.equal(urls.isSubdomain, true);
    assert.equal(urls.primaryUrl, "https://omar-and-layla.asar.me");
  });

  it("handles empty or blank slug by generating bare apex / localhost URLs", () => {
    const urls = buildMemoryUrls({
      slug: "",
      type: "booth",
      isDev: false,
    });

    assert.equal(urls.canonicalUrl, "https://asar.me");
    assert.equal(urls.devLocalhostUrl, "http://localhost:3002");
    assert.equal(urls.devRendererUrl, "http://localhost:3004");
    assert.equal(urls.isSubdomain, false);
    assert.equal(urls.primaryUrl, "https://asar.me");
  });

  it("handles custom rootDomain with leading dot stripping", () => {
    const urls = buildMemoryUrls({
      slug: "royal-summit",
      type: "invitation",
      rootDomain: ".royal-celebrations.com",
    });

    assert.equal(urls.canonicalUrl, "https://royal-summit.royal-celebrations.com");
  });

  it("handles boundary 63-character slug in URL builder cleanly", () => {
    const maxSlug = "a" + "-b".repeat(30) + "-c";
    assert.equal(maxSlug.length, 63);

    const urls = buildMemoryUrls({
      slug: maxSlug,
      type: "booth",
    });

    assert.equal(urls.canonicalUrl, `https://${maxSlug}.asar.me`);
    assert.equal(urls.devRendererUrl, `http://${maxSlug}.localhost:3004`);
  });
});
