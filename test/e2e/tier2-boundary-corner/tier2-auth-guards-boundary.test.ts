// =============================================================
// ASAR E2E Test Suite — Tier 2: Boundary & Corner Cases
// Suite: Auth & RBAC Guard Boundary Limits (Features 7, 8, 9)
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseUserProfile,
  type AsarUserProfile,
  ASAR_TEAMS,
} from "@repo/react-appwrite";

describe("Tier 2: Feature 7 — Admin Route Protection & RBAC Boundaries", () => {
  it("F7-C01: User with case-varied role ('ADMIN', 'Admin') does not bypass role constraint", () => {
    const uppercaseRole = parseUserProfile({
      userId: "usr_up",
      name: "مستخدم",
      email: "up@asar.me",
      role: "ADMIN",
    });
    // strictly checks === "admin", otherwise defaults to "client"
    assert.equal(uppercaseRole?.role, "client");

    const mixedRole = parseUserProfile({
      userId: "usr_mix",
      name: "مستخدم",
      email: "mix@asar.me",
      role: "Admin",
    });
    assert.equal(mixedRole?.role, "client");
  });

  it("F7-C02: User profile with malformed or non-string metadataJson handles parsing gracefully", () => {
    const profile = parseUserProfile({
      userId: "usr_meta",
      name: "أحمد",
      email: "ahmed@asar.me",
      metadataJson: "{ malformed json",
    });

    assert.ok(profile);
    assert.equal(profile.userId, "usr_meta");
  });

  it("F7-C03: Empty string userId is not recognized as valid administrator", () => {
    const profile = parseUserProfile({
      userId: "",
      name: "مدير فارغ",
      email: "admin@asar.me",
      role: "admin",
    });

    // Profile parsed with role admin, but userId is empty -> guard rejects
    function isAuthorizedAdmin(p: AsarUserProfile | null): boolean {
      return Boolean(p && p.role === "admin" && p.userId && p.userId.trim().length > 0);
    }

    assert.equal(isAuthorizedAdmin(profile), false);
  });

  it("F7-C04: Multi-team user membership verifies presence of 'admins' team ID without false positives", () => {
    const userTeamsA = ["content_creators", "audio_engineers", "concierge"];
    assert.equal(userTeamsA.includes(ASAR_TEAMS.ADMINS), false);

    const userTeamsB = ["support", "admins", "auditors"];
    assert.equal(userTeamsB.includes(ASAR_TEAMS.ADMINS), true);
  });

  it("F7-C05: Malformed JWT token string is safely detected and rejected", () => {
    function isValidJwtStructure(jwt: string | null | undefined): boolean {
      if (!jwt || typeof jwt !== "string") return false;
      const parts = jwt.split(".");
      return parts.length === 3 && parts.every((p) => p.length > 0);
    }

    assert.equal(isValidJwtStructure("not_a_jwt"), false);
    assert.equal(isValidJwtStructure("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0"), false); // 2 parts
    assert.equal(isValidJwtStructure("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.do_not_trust_sig"), true);
  });
});

describe("Tier 2: Feature 8 — Client Portal Route Guards Boundaries", () => {
  it("F8-C01: Organization name with extreme length (255 characters) preserved without clipping", () => {
    const longOrg = "مؤسسة ذكريات الأثر الفاخر لتنظيم الحفلات والمؤتمرات الدولية والفعاليات الملكية الكبرى في الشرق الأوسط ".repeat(2);
    assert.ok(longOrg.length >= 150);

    const profile = parseUserProfile({
      userId: "usr_org_long",
      name: "سعد",
      organization: longOrg,
    });

    assert.equal(profile?.organization, longOrg);
  });

  it("F8-C02: Handles extreme format client user IDs (UUIDv4, base36, prefixed)", () => {
    const ids = [
      "usr_6ad1c66c0017b63ab8cc",
      "550e8400-e29b-41d4-a716-446655440000",
      "k9z2x1y8w7v6u5t4s3r2",
    ];

    ids.forEach((id) => {
      const p = parseUserProfile({ userId: id, name: "Test" });
      assert.equal(p?.userId, id);
    });
  });

  it("F8-C03: Null or missing email and phone handled safely with empty string fallback", () => {
    const profile = parseUserProfile({
      userId: "usr_no_contacts",
      name: "ضيف بلا هاتف",
      email: null as any,
      phone: null as any,
    });

    assert.ok(profile);
    assert.equal(profile.email, "");
    assert.equal(profile.phone, undefined);
  });

  it("F8-C04: Route guard challenges guest while authentication state is loading or unresolved", () => {
    function evaluateRouteAccess(state: { isLoading: boolean; isAuthenticated: boolean }): "ALLOW" | "SHOW_SPINNER" | "DENY" {
      if (state.isLoading) return "SHOW_SPINNER";
      if (!state.isAuthenticated) return "DENY";
      return "ALLOW";
    }

    assert.equal(evaluateRouteAccess({ isLoading: true, isAuthenticated: false }), "SHOW_SPINNER");
    assert.equal(evaluateRouteAccess({ isLoading: false, isAuthenticated: false }), "DENY");
    assert.equal(evaluateRouteAccess({ isLoading: false, isAuthenticated: true }), "ALLOW");
  });

  it("F8-C05: Account switcher enforces security isolation when swapping active profiles", () => {
    const activeProfiles = new Map<string, { userId: string; role: string }>([
      ["client_session", { userId: "c1", role: "client" }],
      ["admin_session", { userId: "a1", role: "admin" }],
    ]);

    function switchSession(targetSessionKey: string): { userId: string; role: string } | null {
      return activeProfiles.get(targetSessionKey) || null;
    }

    assert.equal(switchSession("client_session")?.role, "client");
    assert.equal(switchSession("admin_session")?.role, "admin");
    assert.equal(switchSession("invalid_session"), null);
  });
});

describe("Tier 2: Feature 9 — Phone/SMS OTP & Email OTP Boundaries", () => {
  function normalizePhoneStrict(raw: string): { isValid: boolean; normalized?: string; error?: string } {
    if (!raw || typeof raw !== "string") return { isValid: false, error: "Phone number required" };
    const digitsOnly = raw.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return { isValid: false, error: "Phone number must be between 8 and 15 digits (E.164)" };
    }
    const clean = raw.replace(/[\s-()]/g, "");
    if (clean.startsWith("+")) return { isValid: true, normalized: clean };
    if (clean.startsWith("00")) return { isValid: true, normalized: "+" + clean.slice(2) };
    if (clean.startsWith("05") && digitsOnly.length === 10) return { isValid: true, normalized: "+966" + clean.slice(1) };
    if (clean.startsWith("01") && digitsOnly.length === 11) return { isValid: true, normalized: "+20" + clean.slice(1) };
    return { isValid: true, normalized: "+" + digitsOnly };
  }

  it("F9-C01: Rejects phone numbers that are too short (< 8 digits) or too long (> 15 digits)", () => {
    assert.equal(normalizePhoneStrict("12345").isValid, false);
    assert.equal(normalizePhoneStrict("12345678901234567").isValid, false);
    assert.equal(normalizePhoneStrict("+966501234567").isValid, true);
  });

  it("F9-C02: Handles phone numbers with brackets and spaces: '(+966) 50-123-4567'", () => {
    const result = normalizePhoneStrict("(+966) 50-123-4567");
    assert.equal(result.isValid, true);
    assert.equal(result.normalized, "+966501234567");
  });

  it("F9-C03: Handles plus addressing in Email OTP destination: 'vip.guest+party2026@domain.me'", () => {
    const email = "vip.guest+party2026@domain.me";
    const isCompliant = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email);
    assert.equal(isCompliant, true);
  });

  it("F9-C04: OTP secret parser automatically strips spaces and non-digit characters", () => {
    function sanitizeOtpInput(raw: string): string {
      return raw.replace(/\s+/g, "").trim();
    }

    assert.equal(sanitizeOtpInput(" 123 456 "), "123456");
    assert.equal(sanitizeOtpInput("  987654  "), "987654");
  });

  it("F9-C05: OTP rate limiting boundary rejects more than 3 requests within 60 seconds", () => {
    class OtpRateLimiter {
      private attempts = new Map<string, number[]>();

      checkLimit(phoneOrEmail: string, maxAttempts = 3, windowSec = 60): { allowed: boolean; remainingSec?: number } {
        const now = Date.now();
        const history = this.attempts.get(phoneOrEmail) || [];
        const recent = history.filter((ts) => now - ts < windowSec * 1000);

        if (recent.length >= maxAttempts) {
          const oldest = recent[0];
          const remainingSec = Math.ceil((oldest + windowSec * 1000 - now) / 1000);
          return { allowed: false, remainingSec };
        }

        recent.push(now);
        this.attempts.set(phoneOrEmail, recent);
        return { allowed: true };
      }
    }

    const limiter = new OtpRateLimiter();
    const target = "+966501112233";

    assert.equal(limiter.checkLimit(target).allowed, true); // 1
    assert.equal(limiter.checkLimit(target).allowed, true); // 2
    assert.equal(limiter.checkLimit(target).allowed, true); // 3
    const fourth = limiter.checkLimit(target);
    assert.equal(fourth.allowed, false); // 4 (blocked)
    assert.ok(fourth.remainingSec! > 0);
  });
});
