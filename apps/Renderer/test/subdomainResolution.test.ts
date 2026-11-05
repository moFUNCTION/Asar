// =============================================================
// ASAR (Athar / أثر) — Dedicated Dynamic Storefront Renderer
// Subdomain Resolution & 4-Tier Hierarchy Automated Test Suite
// Verified with: node --experimental-strip-types --test
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  RESERVED_SUBDOMAINS,
  RESERVED_SUBDOMAIN_LIST,
  validateSubdomainSlug,
  isReservedSubdomain,
  extractSubdomain,
} from "../../../packages/react-appwrite/src/Storefront/subdomain.ts";

import {
  resolveSubdomain,
  type UseSubdomainOptions,
} from "../../../packages/react-appwrite/src/Storefront/useSubdomain.ts";

describe("ASAR Renderer — 4-Tier Subdomain Resolution Hierarchy", () => {
  it("Tier 1: Query parameter (?subdomain=) takes absolute precedence over route, hostname, and fallback", () => {
    const result = resolveSubdomain({
      searchParams: "?subdomain=query-override",
      routeParam: "route-slug",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
      allowQueryOverride: true,
    });

    assert.equal(result.subdomain, "query-override");
    assert.equal(result.source, "query");
    assert.equal(result.isSubdomain, true);
  });

  it("Tier 1: Alternative query parameters (?memory= and ?event=) take precedence", () => {
    const memoryRes = resolveSubdomain({
      searchParams: "?memory=booth-ceremony",
      routeParam: "route-slug",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
    });
    assert.equal(memoryRes.subdomain, "booth-ceremony");
    assert.equal(memoryRes.source, "query");
    assert.equal(memoryRes.isSubdomain, true);

    const eventRes = resolveSubdomain({
      searchParams: new URLSearchParams("event=invitation-gala"),
      routeParam: "route-slug",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
    });
    assert.equal(eventRes.subdomain, "invitation-gala");
    assert.equal(eventRes.source, "query");
    assert.equal(eventRes.isSubdomain, true);
  });

  it("Tier 1: When allowQueryOverride is false, query parameter is bypassed in favor of routeParam", () => {
    const result = resolveSubdomain({
      searchParams: "?subdomain=ignored-query",
      routeParam: "active-route-slug",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
      allowQueryOverride: false,
    });

    assert.equal(result.subdomain, "active-route-slug");
    assert.equal(result.source, "param");
    assert.equal(result.isSubdomain, true);
  });

  it("Tier 2: Route parameter takes precedence over hostname and fallback when query param is absent", () => {
    const result = resolveSubdomain({
      routeParam: "explicit-route-memory",
      hostname: "host-slug.localhost:3004",
      fallbackSubdomain: "fallback-slug",
    });

    assert.equal(result.subdomain, "explicit-route-memory");
    assert.equal(result.source, "param");
    assert.equal(result.isSubdomain, true);
  });

  it("Tier 3: Hostname subdomain is resolved when query and route params are absent", () => {
    const result = resolveSubdomain({
      hostname: "mina-and-maryam.localhost:3004",
      fallbackSubdomain: "fallback-slug",
    });

    assert.equal(result.subdomain, "mina-and-maryam");
    assert.equal(result.source, "hostname");
    assert.equal(result.isSubdomain, true);
  });

  it("Tier 4: Fallback subdomain is resolved when hostname is bare apex without query or route params", () => {
    const result = resolveSubdomain({
      hostname: "localhost:3004",
      fallbackSubdomain: "default-wedding",
    });

    assert.equal(result.subdomain, "default-wedding");
    assert.equal(result.source, "fallback");
    assert.equal(result.isSubdomain, true);
  });

  it("Hierarchy exhaustion: returns null when bare localhost is accessed with no fallback or params", () => {
    const result = resolveSubdomain({
      hostname: "localhost:3004",
    });

    assert.equal(result.subdomain, null);
    assert.equal(result.source, null);
    assert.equal(result.isSubdomain, false);
  });
});

describe("ASAR Renderer — RFC 6761 *.localhost Loopback & Hostname Parsing", () => {
  it("extracts valid subdomains from RFC 6761 *.localhost on Renderer port 3004", () => {
    assert.equal(
      extractSubdomain("mina-and-maryam.localhost:3004"),
      "mina-and-maryam"
    );
    assert.equal(
      extractSubdomain("omar-and-layla.localhost:3004"),
      "omar-and-layla"
    );
    assert.equal(
      extractSubdomain("cairo-jazz-festival.localhost:3004"),
      "cairo-jazz-festival"
    );
    assert.equal(
      extractSubdomain("asar-leadership-gala.localhost:3004"),
      "asar-leadership-gala"
    );
  });

  it("strips HTTP and HTTPS protocols and paths from hostname", () => {
    assert.equal(
      extractSubdomain("http://mina-and-maryam.localhost:3004/s/mina-and-maryam"),
      "mina-and-maryam"
    );
    assert.equal(
      extractSubdomain("https://omar-and-layla.localhost:3004/invitation/omar-and-layla?preview=true"),
      "omar-and-layla"
    );
  });

  it("extracts subdomains from production apex domains (*.asar.me and *.asar.audio)", () => {
    assert.equal(extractSubdomain("mina-and-maryam.asar.me"), "mina-and-maryam");
    assert.equal(extractSubdomain("omar-and-layla.asar.audio"), "omar-and-layla");
    assert.equal(extractSubdomain("https://royal-summit.asar.me:443/pass"), "royal-summit");
  });

  it("supports custom white-labeled root domains via rootDomains option", () => {
    assert.equal(
      extractSubdomain("vip-event.royal-celebrations.com:3004", {
        rootDomains: ["royal-celebrations.com"],
      }),
      "vip-event"
    );
  });
});

describe("ASAR Renderer — Bare Apex Detection (Showcase Portal Trigger)", () => {
  it("returns null for bare localhost hostname on port 3004", () => {
    assert.equal(extractSubdomain("localhost:3004"), null);
    assert.equal(extractSubdomain("localhost"), null);
    assert.equal(extractSubdomain("http://localhost:3004/"), null);
  });

  it("returns null for IPv4 loopback and local addresses (127.0.0.1, 0.0.0.0, LAN IPs)", () => {
    assert.equal(extractSubdomain("127.0.0.1:3004"), null);
    assert.equal(extractSubdomain("127.0.0.1"), null);
    assert.equal(extractSubdomain("http://127.0.0.1:3004/s/"), null);
    assert.equal(extractSubdomain("0.0.0.0:3004"), null);
    assert.equal(extractSubdomain("192.168.1.150:3004"), null);
    assert.equal(extractSubdomain("10.0.0.1:3004"), null);
  });

  it("returns null for bare production apex root domains", () => {
    assert.equal(extractSubdomain("asar.me"), null);
    assert.equal(extractSubdomain("https://asar.me/"), null);
    assert.equal(extractSubdomain("asar.audio"), null);
    assert.equal(extractSubdomain("asar.audio:443"), null);
  });

  it("resolveSubdomain triggers bare apex portal state (isSubdomain: false)", () => {
    const resBare = resolveSubdomain({ hostname: "localhost:3004" });
    assert.equal(resBare.subdomain, null);
    assert.equal(resBare.isSubdomain, false);
    assert.equal(resBare.source, null);

    const resIp = resolveSubdomain({ hostname: "127.0.0.1:3004" });
    assert.equal(resIp.subdomain, null);
    assert.equal(resIp.isSubdomain, false);
  });
});

describe("ASAR Renderer — Reserved System Subdomains Rejection & 404 Trigger", () => {
  const RESERVED_NAMES = [
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

  it("identifies all 16 reserved system subdomains in RESERVED_SUBDOMAINS", () => {
    assert.equal(RESERVED_SUBDOMAIN_LIST.length >= 16, true);
    for (const name of RESERVED_NAMES) {
      assert.equal(
        RESERVED_SUBDOMAINS.has(name),
        true,
        `Expected ${name} to be in RESERVED_SUBDOMAINS`
      );
      assert.equal(
        isReservedSubdomain(name),
        true,
        `Expected isReservedSubdomain("${name}") to be true`
      );
    }
  });

  it("rejects reserved subdomains in validateSubdomainSlug with an explicit error", () => {
    for (const name of RESERVED_NAMES) {
      const result = validateSubdomainSlug(name);
      assert.equal(result.isValid, false);
      assert.ok(
        result.error?.includes("reserved"),
        `Error for "${name}" must explain that the name is reserved`
      );
    }
  });

  it("extractSubdomain returns null for reserved subdomains across localhost and production apex", () => {
    for (const name of RESERVED_NAMES) {
      assert.equal(
        extractSubdomain(`${name}.localhost:3004`),
        null,
        `Reserved subdomain "${name}.localhost:3004" must resolve to null`
      );
      assert.equal(
        extractSubdomain(`${name}.asar.me`),
        null,
        `Reserved subdomain "${name}.asar.me" must resolve to null`
      );
    }
  });

  it("extractSubdomain rejects query parameter override containing reserved names", () => {
    for (const name of RESERVED_NAMES) {
      const res = extractSubdomain("localhost:3004", {
        searchParams: `?subdomain=${name}`,
      });
      assert.equal(res, null, `Query override with reserved "${name}" must resolve to null`);
    }
  });

  it("resolveSubdomain treats reserved names as non-subdomains", () => {
    const res = resolveSubdomain({
      hostname: "admin.localhost:3004",
    });
    assert.equal(res.subdomain, null);
    assert.equal(res.isSubdomain, false);

    const resRoute = resolveSubdomain({
      routeParam: "api",
    });
    assert.equal(resRoute.subdomain, null);
    assert.equal(resRoute.isSubdomain, false);
  });
});

describe("ASAR Renderer — RFC 1123 Slug Validation Boundary & Adversarial Cases", () => {
  it("accepts valid RFC 1123 single-character and short slugs", () => {
    assert.equal(validateSubdomainSlug("a").isValid, true);
    assert.equal(validateSubdomainSlug("z").isValid, true);
    assert.equal(validateSubdomainSlug("0").isValid, true);
    assert.equal(validateSubdomainSlug("9").isValid, true);
    assert.equal(validateSubdomainSlug("m1").isValid, true);
  });

  it("accepts standard multi-hyphen slugs", () => {
    assert.equal(validateSubdomainSlug("mina-and-maryam").isValid, true);
    assert.equal(validateSubdomainSlug("the-royal-wedding-2026").isValid, true);
    assert.equal(validateSubdomainSlug("a-b-c-d-e-f").isValid, true);
  });

  it("accepts maximum 63 character slugs (RFC 1123 boundary limit)", () => {
    // Exact 63 characters: 'a' + 30 * '-b' + '-c' = 1 + 60 + 2 = 63 chars
    const maxSlug = "a" + "-b".repeat(30) + "-c";
    assert.equal(maxSlug.length, 63);
    assert.equal(validateSubdomainSlug(maxSlug).isValid, true);
  });

  it("rejects slugs exceeding 63 characters (RFC 1123 overflow)", () => {
    const tooLongSlug = "a".repeat(64);
    const result = validateSubdomainSlug(tooLongSlug);
    assert.equal(result.isValid, false);
    assert.ok(result.error?.includes("63"));
  });

  it("rejects leading or trailing hyphens", () => {
    const leading = validateSubdomainSlug("-mina-and-maryam");
    assert.equal(leading.isValid, false);
    assert.ok(leading.error?.includes("hyphen"));

    const trailing = validateSubdomainSlug("mina-and-maryam-");
    assert.equal(trailing.isValid, false);
    assert.ok(trailing.error?.includes("hyphen"));
  });

  it("rejects uppercase characters (subdomain must be lowercase)", () => {
    const mixed = validateSubdomainSlug("Mina-And-Maryam");
    assert.equal(mixed.isValid, false);
    assert.ok(mixed.error?.includes("lowercase"));

    const upper = validateSubdomainSlug("WEDDING");
    assert.equal(upper.isValid, false);
  });

  it("rejects special characters, spaces, and punctuation", () => {
    const invalidChars = [
      "mina_maryam", // underscore
      "mina.maryam", // dot
      "mina maryam", // space
      "mina@maryam", // at sign
      "mina#maryam", // hash
      "mina$maryam", // dollar
      "mina!maryam", // exclamation
      "mina/maryam", // slash
      "mina\\maryam", // backslash
    ];

    for (const invalid of invalidChars) {
      const result = validateSubdomainSlug(invalid);
      assert.equal(
        result.isValid,
        false,
        `Expected slug "${invalid}" to be invalid`
      );
    }
  });

  it("rejects empty, null, undefined, or whitespace-only inputs safely", () => {
    assert.equal(validateSubdomainSlug("").isValid, false);
    assert.equal(validateSubdomainSlug("   ").isValid, false);
    assert.equal(validateSubdomainSlug(null as unknown as string).isValid, false);
    assert.equal(validateSubdomainSlug(undefined as unknown as string).isValid, false);
    assert.equal(validateSubdomainSlug(12345 as unknown as string).isValid, false);
  });
});
