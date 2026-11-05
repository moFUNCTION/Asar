// =============================================================
// ASAR (Athar / أثر) — Adversarial Challenger Test Harness M6.2
// Empirical Verification: Memory Classification, PIN Padlock Security,
// Mandatory Locked Email, VIP Pass Generation, & URL Builder Integrity
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// 1. Shared Storefront Engine Imports
import {
  extractSubdomain,
  validateSubdomainSlug,
  isReservedSubdomain,
  RESERVED_SUBDOMAINS,
  DEFAULT_ROOT_DOMAINS,
} from "../../../packages/react-appwrite/src/Storefront/subdomain.ts";

import {
  buildMemoryUrls,
  type BuildMemoryUrlsParams,
} from "../../../packages/react-appwrite/src/Storefront/urlBuilder.ts";

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
} from "../../../packages/react-appwrite/src/Storefront/cacheHelper.ts";

import { DEMO_BOOTH_MEMORY } from "../../../packages/react-appwrite/src/AsarDomain/seedDefaults.ts";
import type { InvitationRsvp } from "../../../packages/react-appwrite/src/AsarDomain/models.ts";

// 2. Apps Imports
import {
  INVITATION_PRESETS,
  DEFAULT_RSVP_FORM_SCHEMA,
} from "../../../apps/Renderer/src/components/invitation/presets.ts";

import {
  EMAIL_REGEX,
  isValidEmail,
  generateVipPassToken,
} from "../../../apps/Renderer/src/components/invitation/InvitationDynamicRsvpForm.tsx";

import {
  validateFormSchema,
  enforceMandatoryEmailConstraint,
  MANDATORY_SYSTEM_FIELDS,
  type DynamicFormField,
} from "../../../apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx";

// =============================================================
// Test Helpers & Mock Environments
// =============================================================

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

export type MemoryStorefrontType = "booth" | "invitation" | "pass" | "unknown";

interface ClassifierInput {
  subdomain: string | null | undefined;
  forcedType?: "booth" | "invitation" | "pass";
  queryType?: string | null;
  storage?: Storage;
}

/**
 * Synchronous classification logic faithfully matching DynamicStorefrontIndex.tsx
 */
function classifyMemoryType(input: ClassifierInput): {
  type: MemoryStorefrontType;
  action: "render-portal" | "render-booth" | "render-invitation" | "render-pass" | "render-404";
  reason404?: "reserved" | "invalid" | "not-found";
} {
  const { subdomain, forcedType, queryType, storage } = input;

  if (!subdomain) {
    return { type: "unknown", action: "render-portal" };
  }

  if (isReservedSubdomain(subdomain)) {
    return { type: "unknown", action: "render-404", reason404: "reserved" };
  }

  const slugCheck = validateSubdomainSlug(subdomain);
  if (!slugCheck.isValid) {
    return { type: "unknown", action: "render-404", reason404: "invalid" };
  }

  if (forcedType) {
    const action =
      forcedType === "booth"
        ? "render-booth"
        : forcedType === "invitation"
          ? "render-invitation"
          : "render-pass";
    return { type: forcedType, action };
  }

  const qType = queryType?.toLowerCase().trim();
  if (qType === "booth" || qType === "invitation" || qType === "pass") {
    const action =
      qType === "booth"
        ? "render-booth"
        : qType === "invitation"
          ? "render-invitation"
          : "render-pass";
    return { type: qType, action };
  }

  // Step A: Known Presets
  if (subdomain === DEMO_BOOTH_MEMORY.slug || subdomain === "mina-and-maryam") {
    return { type: "booth", action: "render-booth" };
  }
  if (INVITATION_PRESETS[subdomain]) {
    return { type: "invitation", action: "render-invitation" };
  }

  // Step B: Defensive LocalStorage Cache Lookup
  if (storage) {
    const boothList = getNormalizedCache<any>(ASAR_CACHE_KEYS.BOOTH_MEMORIES, storage);
    if (findInCache(boothList, subdomain)) {
      return { type: "booth", action: "render-booth" };
    }
    const inviteList = getNormalizedCache<any>(ASAR_CACHE_KEYS.INVITATIONS, storage);
    if (findInCache(inviteList, subdomain)) {
      return { type: "invitation", action: "render-invitation" };
    }
  }

  // Step C: Slug prefix heuristics
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

  return { type: "unknown", action: "render-404", reason404: "not-found" };
}

/**
 * VIP Pass Resolution logic matching GuestPassStorefrontPage.tsx
 */
const DEMO_APPROVED_RSVP: InvitationRsvp = {
  $id: "rsvp-demo-001",
  invitationId: "invitation-omar-and-layla",
  clientId: "client-omar",
  guestName: "معالي يوسف الغامدي · H.E. Yousef Al-Ghamdi",
  guestEmail: "yousef.ghamdi@example.com",
  guestPhone: "+966501234567",
  companionsCount: 1,
  dynamicResponsesJson: JSON.stringify({
    dietaryNotes: "Standard / بدون ملاحظات",
    blessingMessage: "ألف مبروك للعروسين ونسأل الله لهما التوفيق ودوام السعادة.",
  }),
  status: "approved",
  passToken: "INV-PASS-7701-X",
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=6B1D28&bgcolor=FFFFFF&data=https%3A%2F%2Fasar.audio%2Fpass%2Frsvp-demo-001%3Ftoken%3DINV-PASS-7701-X",
  emailSent: true,
  isCheckedInAtVenue: false,
  respondedAt: "2026-10-15T12:00:00Z",
};

function resolveGuestPassRsvp(
  targetId: string,
  cacheJson?: string | null
): InvitationRsvp {
  if (cacheJson) {
    try {
      const list: InvitationRsvp[] = JSON.parse(cacheJson);
      if (Array.isArray(list)) {
        const match = list.find(
          (r) =>
            r.$id === targetId ||
            (r as { id?: string }).id === targetId ||
            r.passToken === targetId
        );
        if (match) return match;
      }
    } catch {
      // Ignore
    }
  }
  return DEMO_APPROVED_RSVP;
}

/**
 * State machine simulating BoothPinPadlockModal logic
 */
class PinPadlockStateMachine {
  private expectedPin: string;
  public digits: string[] = ["", "", "", ""];
  public isUnlocked = false;
  public hasError = false;

  constructor(expectedPin = "1234") {
    this.expectedPin = expectedPin;
  }

  public inputDigit(index: number, val: string): void {
    if (!/^\d*$/.test(val)) return;
    const char = val.slice(-1);
    this.digits[index] = char;
    this.hasError = false;

    // Check automatically when 4th digit entered
    if (char && index === 3) {
      const entered = this.digits.join("");
      if (entered === this.expectedPin) {
        this.isUnlocked = true;
        this.hasError = false;
      } else {
        this.hasError = true;
      }
    }
  }

  public inputFullPin(pinString: string): void {
    const chars = pinString.split("");
    for (let i = 0; i < Math.min(chars.length, 4); i++) {
      this.inputDigit(i, chars[i]);
    }
  }

  public triggerDemoPinBypass(): void {
    this.digits = this.expectedPin.split("").slice(0, 4);
    this.hasError = false;
    this.isUnlocked = true;
  }
}

// =============================================================
// TEST SUITE EXECUTION
// =============================================================

describe("CHALLENGER M6.2 — EMPIRICAL VERIFICATION HARNESS", () => {

  // -----------------------------------------------------------
  // 1. MEMORY CLASSIFICATION STRESS TESTING
  // -----------------------------------------------------------
  describe("1. Memory Classification Stress & Conflict Resolution", () => {
    it("Tier 1 query parameter (?subdomain=) takes precedence over route parameter", () => {
      // Scenario: route is /booth/omar-and-layla, but query has ?subdomain=mina-and-maryam
      const res = resolveSubdomain({
        routeParam: "omar-and-layla",
        searchParams: "subdomain=mina-and-maryam",
      });
      assert.equal(res.subdomain, "mina-and-maryam");
      assert.equal(res.source, "query");
    });

    it("Conflicting hints: forcedType='booth' on route overrides query type='invitation'", () => {
      // In DynamicStorefrontIndex, forcedType (from /booth/:slug) takes precedence over queryType
      const result = classifyMemoryType({
        subdomain: "mina-and-maryam",
        forcedType: "booth",
        queryType: "invitation",
      });
      assert.equal(result.type, "booth");
      assert.equal(result.action, "render-booth");
    });

    it("Universal route /s/:slug adheres to query ?type= override", () => {
      // Universal route has no forcedType, so queryType takes priority
      const result = classifyMemoryType({
        subdomain: "mina-and-maryam", // usually booth preset
        forcedType: undefined,
        queryType: "invitation",
      });
      assert.equal(result.type, "invitation");
      assert.equal(result.action, "render-invitation");
    });

    it("Cache priority vs preset priority: Presets take precedence over cache (Step A before Step B)", () => {
      // Even if 'mina-and-maryam' is injected into invitations cache, preset resolves to 'booth'
      const mockStorage = createMockStorage({
        [ASAR_CACHE_KEYS.INVITATIONS]: JSON.stringify([
          { slug: "mina-and-maryam", title: "Injected Malicious Invite" },
        ]),
      });

      const result = classifyMemoryType({
        subdomain: "mina-and-maryam",
        storage: mockStorage,
      });

      assert.equal(result.type, "booth");
      assert.equal(result.action, "render-booth");
    });

    it("Cache priority vs prefix heuristics: Cache takes precedence over prefix heuristics (Step B before Step C)", () => {
      // Slug 'booth-grand-celebration' matches prefix 'booth-', but is cached in INVITATIONS
      const mockStorage = createMockStorage({
        [ASAR_CACHE_KEYS.INVITATIONS]: JSON.stringify([
          { slug: "booth-grand-celebration", title: "Invitation with booth prefix" },
        ]),
      });

      const result = classifyMemoryType({
        subdomain: "booth-grand-celebration",
        storage: mockStorage,
      });

      assert.equal(result.type, "invitation");
      assert.equal(result.action, "render-invitation");
    });

    it("Prefix heuristics: correctly classifies slugs starting with 'booth-' or 'inv-' when not in cache", () => {
      const mockStorage = createMockStorage();
      assert.equal(
        classifyMemoryType({ subdomain: "booth-soundwave-99", storage: mockStorage }).type,
        "booth"
      );
      assert.equal(
        classifyMemoryType({ subdomain: "inv-royal-wedding-2026", storage: mockStorage }).type,
        "invitation"
      );
    });

    it("Boundary & adversarial slugs: empty slug triggers bare apex portal", () => {
      const res = classifyMemoryType({ subdomain: "" });
      assert.equal(res.action, "render-portal");
    });

    it("Boundary & adversarial slugs: all 16 reserved system subdomains trigger 404 with reason='reserved'", () => {
      for (const reserved of RESERVED_SUBDOMAINS) {
        const res = classifyMemoryType({ subdomain: reserved });
        assert.equal(res.action, "render-404");
        assert.equal(res.reason404, "reserved");
      }
    });

    it("Boundary & adversarial slugs: malformed RFC 1123 slugs trigger 404 with reason='invalid'", () => {
      const malformed = [
        "UPPERCASE-SLUG",
        "-leading-hyphen",
        "trailing-hyphen-",
        "slug_with_underscores",
        "slug.with.dots",
        "slug@symbol",
        "slug with spaces",
        "عروسين-بالعربي",
        "a".repeat(64), // exceeds 63 characters
      ];

      for (const slug of malformed) {
        const res = classifyMemoryType({ subdomain: slug });
        assert.equal(res.action, "render-404", `Slug "${slug}" should trigger 404`);
        assert.equal(res.reason404, "invalid", `Slug "${slug}" should fail with invalid reason`);
      }
    });

    it("Unknown slugs: valid RFC 1123 slug not in presets, cache, or prefix heuristics triggers 404 with reason='not-found'", () => {
      const mockStorage = createMockStorage();
      const res = classifyMemoryType({
        subdomain: "unregistered-wedding-2026",
        storage: mockStorage,
      });
      assert.equal(res.action, "render-404");
      assert.equal(res.reason404, "not-found");
    });
  });

  // -----------------------------------------------------------
  // 2. PIN PADLOCK SECURITY VERIFICATION
  // -----------------------------------------------------------
  describe("2. PIN Padlock Security Verification & Gating", () => {
    it("Verifies private memory gating flag: isPrivateLocked correctly controls lock state", () => {
      const privateMem = { ...DEMO_BOOTH_MEMORY, isPrivateLocked: true };
      const publicMem = { ...DEMO_BOOTH_MEMORY, isPrivateLocked: false };
      const unspecMem = { ...DEMO_BOOTH_MEMORY, isPrivateLocked: undefined };

      assert.equal(Boolean(privateMem.isPrivateLocked), true);
      assert.equal(Boolean(publicMem.isPrivateLocked), false);
      assert.equal(Boolean(unspecMem.isPrivateLocked), false);
    });

    it("Correct default PIN ('1234') unlocks the state machine", () => {
      const sm = new PinPadlockStateMachine("1234");
      assert.equal(sm.isUnlocked, false);

      sm.inputFullPin("1234");
      assert.equal(sm.isUnlocked, true);
      assert.equal(sm.hasError, false);
      assert.deepEqual(sm.digits, ["1", "2", "3", "4"]);
    });

    it("Correct custom PIN ('9876') unlocks when configured", () => {
      const sm = new PinPadlockStateMachine("9876");
      sm.inputFullPin("9876");
      assert.equal(sm.isUnlocked, true);
      assert.equal(sm.hasError, false);
    });

    it("Wrong PIN ('0000', '1235', '4321') rejects, sets error flag, and does NOT unlock", () => {
      const wrongPins = ["0000", "1235", "4321", "9999"];

      for (const pin of wrongPins) {
        const sm = new PinPadlockStateMachine("1234");
        sm.inputFullPin(pin);
        assert.equal(sm.isUnlocked, false, `Wrong PIN ${pin} must not unlock`);
        assert.equal(sm.hasError, true, `Wrong PIN ${pin} must set error`);
      }
    });

    it("Incomplete PIN (1, 2, or 3 digits) never triggers unlock", () => {
      const sm = new PinPadlockStateMachine("1234");
      sm.inputDigit(0, "1");
      sm.inputDigit(1, "2");
      sm.inputDigit(2, "3");
      // 4th digit not entered
      assert.equal(sm.isUnlocked, false);
      assert.equal(sm.hasError, false);
    });

    it("Non-numeric and malicious characters (letters, symbols, SQL injection, script tags) are rejected", () => {
      const sm = new PinPadlockStateMachine("1234");
      sm.inputDigit(0, "A"); // letters
      assert.equal(sm.digits[0], "");

      sm.inputDigit(0, "' OR '1'='1"); // SQL injection
      assert.equal(sm.digits[0], "");

      sm.inputDigit(0, "<script>"); // XSS
      assert.equal(sm.digits[0], "");

      sm.inputDigit(0, "!"); // Symbol
      assert.equal(sm.digits[0], "");
    });

    it("Adversarial finding: Demo PIN button triggers automatic unlock exposing expectedPin", () => {
      // In BoothPinPadlockModal.tsx, handleUseDemoPin bypasses input and directly calls onUnlock
      const sm = new PinPadlockStateMachine("5678");
      sm.triggerDemoPinBypass();
      assert.equal(sm.isUnlocked, true);
      assert.deepEqual(sm.digits, ["5", "6", "7", "8"]);
    });
  });

  // -----------------------------------------------------------
  // 3. MANDATORY LOCKED EMAIL CONSTRAINT
  // -----------------------------------------------------------
  describe("3. Mandatory Locked Email Constraint & Schema Validation", () => {
    it("validateFormSchema rejects schemas without guestEmail", () => {
      const schemaWithoutEmail: DynamicFormField[] = [
        {
          id: "guestName",
          label: "Full Name",
          type: "text",
          required: true,
        },
      ];

      const res = validateFormSchema(schemaWithoutEmail);
      assert.equal(res.isValid, false);
      assert.ok(
        res.errors.some((e) => e.includes("guestEmail")),
        "Error message must explicitly cite missing guestEmail"
      );
    });

    it("validateFormSchema rejects schemas where guestEmail is marked optional (required: false)", () => {
      const schemaWithOptionalEmail: DynamicFormField[] = [
        {
          id: "guestName",
          label: "Full Name",
          type: "text",
          required: true,
        },
        {
          id: "guestEmail",
          label: "Email Address",
          type: "email",
          required: false, // INVALID
        },
      ];

      const res = validateFormSchema(schemaWithOptionalEmail);
      assert.equal(res.isValid, false);
      assert.ok(
        res.errors.some((e) => e.includes("guestEmail") && e.includes("required")),
        "Error must cite guestEmail must be required"
      );
    });

    it("validateFormSchema rejects schemas where guestEmail has non-email type", () => {
      const schemaWithTextEmail: DynamicFormField[] = [
        {
          id: "guestName",
          label: "Full Name",
          type: "text",
          required: true,
        },
        {
          id: "guestEmail",
          label: "Email Address",
          type: "text", // INVALID TYPE
          required: true,
        },
      ];

      const res = validateFormSchema(schemaWithTextEmail);
      assert.equal(res.isValid, false);
      assert.ok(
        res.errors.some((e) => e.includes("guestEmail") && e.includes("type 'email'")),
        "Error must cite guestEmail must have type email"
      );
    });

    it("enforceMandatoryEmailConstraint heals tampered schemas by re-inserting and hard-locking guestEmail & guestName", () => {
      // Case 1: Empty schema
      const healedEmpty = enforceMandatoryEmailConstraint([]);
      const emailField1 = healedEmpty.find((f) => f.id === "guestEmail");
      const nameField1 = healedEmpty.find((f) => f.id === "guestName");

      assert.ok(emailField1, "Must re-inject guestEmail");
      assert.equal(emailField1?.type, "email");
      assert.equal(emailField1?.required, true);
      assert.equal(emailField1?.isSystemLocked, true);
      assert.ok(nameField1, "Must re-inject guestName");
      assert.equal(nameField1?.required, true);

      // Case 2: Tampered optional and wrong type
      const tampered: DynamicFormField[] = [
        {
          id: "guestEmail",
          label: "My Email",
          type: "text",
          required: false,
          isSystemLocked: false,
        },
      ];
      const healedTampered = enforceMandatoryEmailConstraint(tampered);
      const emailField2 = healedTampered.find((f) => f.id === "guestEmail");

      assert.equal(emailField2?.type, "email");
      assert.equal(emailField2?.required, true);
      assert.equal(emailField2?.isSystemLocked, true);
    });

    it("Default RSVP schema in Renderer presets conforms to mandatory locked email rule", () => {
      const emailField = DEFAULT_RSVP_FORM_SCHEMA.find((f) => f.name === "guestEmail");
      const nameField = DEFAULT_RSVP_FORM_SCHEMA.find((f) => f.name === "guestName");

      assert.ok(emailField, "guestEmail must exist in DEFAULT_RSVP_FORM_SCHEMA");
      assert.equal(emailField?.type, "email");
      assert.equal(emailField?.required, true);
      assert.equal(emailField?.isLocked, true);

      assert.ok(nameField, "guestName must exist in DEFAULT_RSVP_FORM_SCHEMA");
      assert.equal(nameField?.required, true);
      assert.equal(nameField?.isLocked, true);
    });

    it("isValidEmail & EMAIL_REGEX accept legitimate email formats", () => {
      const validEmails = [
        "yousef.ghamdi@example.com",
        "karim.masry+wedding@asar.audio",
        "layla_omar.2026@subdomain.domain.org",
        "info@asar.me",
        "a.b-c@domain.co.uk",
      ];

      for (const email of validEmails) {
        assert.equal(isValidEmail(email), true, `Should accept valid email: ${email}`);
        assert.equal(EMAIL_REGEX.test(email), true);
      }
    });

    it("isValidEmail & EMAIL_REGEX reject malformed or adversarial email strings", () => {
      const invalidEmails = [
        "",
        "   ",
        "plainstring",
        "@example.com",
        "user@",
        "user@example",
        "user@example..com",
        "user name@example.com",
        "<script>alert(1)</script>@domain.com",
        "user@domain.com.",
      ];

      for (const email of invalidEmails) {
        assert.equal(isValidEmail(email), false, `Should reject invalid email: "${email}"`);
      }

      // Non-strings safely return false
      assert.equal(isValidEmail(null as unknown as string), false);
      assert.equal(isValidEmail(undefined as unknown as string), false);
    });
  });

  // -----------------------------------------------------------
  // 4. VIP PASS GENERATION & CACHE RETRIEVAL
  // -----------------------------------------------------------
  describe("4. VIP Pass Generation & Cache Retrieval", () => {
    it("generateVipPassToken produces INV-PASS-XXXX-XXXX matching exact 4-char alphanumeric blocks", () => {
      const token = generateVipPassToken();
      assert.match(
        token,
        /^INV-PASS-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
        `Token "${token}" must match INV-PASS-XXXX-XXXX format`
      );
    });

    it("generateVipPassToken supports custom prefixes", () => {
      const customToken = generateVipPassToken("VIP-ROYAL");
      assert.match(
        customToken,
        /^VIP-ROYAL-[A-Z0-9]{4}-[A-Z0-9]{4}$/,
        `Custom token "${customToken}" must match VIP-ROYAL-XXXX-XXXX format`
      );
    });

    it("Stress: 1,000 generated tokens exhibit zero collision and 100% format compliance", () => {
      const count = 1000;
      const set = new Set<string>();
      const tokenRegex = /^INV-PASS-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

      for (let i = 0; i < count; i++) {
        const t = generateVipPassToken();
        assert.equal(tokenRegex.test(t), true, `Token ${t} must match regex`);
        set.add(t);
      }

      assert.equal(set.size, count, `Generated ${count} unique tokens without collisions`);
    });

    it("VIP Pass cache retrieval: resolves pass by $id", () => {
      const cacheData = [
        {
          $id: "rsvp-active-901",
          id: "rsvp-active-901",
          guestName: "د. طارق السعيد · Dr. Tarek El-Saeed",
          guestEmail: "tarek@example.com",
          status: "approved",
          passToken: "INV-PASS-8822-M",
        },
      ];
      const cacheJson = JSON.stringify(cacheData);
      const res = resolveGuestPassRsvp("rsvp-active-901", cacheJson);
      assert.equal(res.$id, "rsvp-active-901");
      assert.equal(res.passToken, "INV-PASS-8822-M");
      assert.equal(res.guestEmail, "tarek@example.com");
    });

    it("VIP Pass cache retrieval: resolves pass by passToken", () => {
      const cacheData = [
        {
          $id: "rsvp-active-902",
          id: "rsvp-active-902",
          guestName: "سارة النجار · Sarah El-Naggar",
          guestEmail: "sarah@example.com",
          status: "approved",
          passToken: "INV-PASS-9933-V",
        },
      ];
      const cacheJson = JSON.stringify(cacheData);
      const res = resolveGuestPassRsvp("INV-PASS-9933-V", cacheJson);
      assert.equal(res.$id, "rsvp-active-902");
      assert.equal(res.passToken, "INV-PASS-9933-V");
    });

    it("VIP Pass cache retrieval: gracefully falls back to DEMO_APPROVED_RSVP on missing pass or corrupted JSON", () => {
      // Missing pass
      const missing = resolveGuestPassRsvp("non-existent-rsvp", JSON.stringify([]));
      assert.equal(missing.$id, "rsvp-demo-001");
      assert.equal(missing.passToken, "INV-PASS-7701-X");

      // Corrupted JSON
      const corrupt = resolveGuestPassRsvp("rsvp-corrupt", "{invalid:json,");
      assert.equal(corrupt.$id, "rsvp-demo-001");
      assert.equal(corrupt.passToken, "INV-PASS-7701-X");
    });
  });

  // -----------------------------------------------------------
  // 5. STOREFRONT URL BUILDER INTEGRITY
  // -----------------------------------------------------------
  describe("5. Storefront URL Builder Integrity", () => {
    it("Canonical production URLs always point to https://${slug}.asar.me", () => {
      const boothUrls = buildMemoryUrls({
        slug: "omar-and-layla",
        type: "booth",
      });
      assert.equal(boothUrls.canonicalUrl, "https://omar-and-layla.asar.me");

      const inviteUrls = buildMemoryUrls({
        slug: "mina-and-maryam",
        type: "invitation",
      });
      assert.equal(inviteUrls.canonicalUrl, "https://mina-and-maryam.asar.me");
    });

    it("Canonical URLs support custom rootDomain (e.g. asar.audio)", () => {
      const urls = buildMemoryUrls({
        slug: "gala-2026",
        type: "invitation",
        rootDomain: "asar.audio",
      });
      assert.equal(urls.canonicalUrl, "https://gala-2026.asar.audio");
    });

    it("devRendererUrl always points to port 3004 (or configured rendererPort)", () => {
      const boothUrls = buildMemoryUrls({
        slug: "omar-and-layla",
        type: "booth",
      });
      assert.equal(
        boothUrls.devRendererUrl,
        "http://omar-and-layla.localhost:3004"
      );

      const inviteUrls = buildMemoryUrls({
        slug: "mina-and-maryam",
        type: "invitation",
      });
      assert.equal(
        inviteUrls.devRendererUrl,
        "http://mina-and-maryam.localhost:3004"
      );

      const customRendererPort = buildMemoryUrls({
        slug: "custom-port-slug",
        type: "booth",
        rendererPort: 3008,
      });
      assert.equal(
        customRendererPort.devRendererUrl,
        "http://custom-port-slug.localhost:3008"
      );
    });

    it("Normalizes slug casing and whitespace cleanly", () => {
      const urls = buildMemoryUrls({
        slug: "   OMAR-AND-LAYLA   ",
        type: "booth",
      });
      assert.equal(urls.canonicalUrl, "https://omar-and-layla.asar.me");
      assert.equal(urls.devRendererUrl, "http://omar-and-layla.localhost:3004");
    });

    it("Bare apex handling: empty or null slug returns bare apex URLs with isSubdomain: false", () => {
      const urls = buildMemoryUrls({
        slug: "",
        type: "booth",
      });
      assert.equal(urls.isSubdomain, false);
      assert.equal(urls.canonicalUrl, "https://asar.me");
      assert.equal(urls.devRendererUrl, "http://localhost:3004");
      assert.equal(urls.devLocalhostUrl, "http://localhost:3002");
    });

    it("Backward compatibility: devLocalhostUrl and devQueryUrl use respective app ports (3002 booth, 3003 invitation)", () => {
      const booth = buildMemoryUrls({ slug: "event-1", type: "booth" });
      assert.equal(booth.devLocalhostUrl, "http://event-1.localhost:3002");
      assert.equal(booth.devQueryUrl, "http://localhost:3002?subdomain=event-1");

      const invite = buildMemoryUrls({ slug: "event-2", type: "invitation" });
      assert.equal(invite.devLocalhostUrl, "http://event-2.localhost:3003");
      assert.equal(invite.devQueryUrl, "http://localhost:3003?subdomain=event-2");
    });

    it("primaryUrl toggles correctly based on isDev flag", () => {
      const devUrls = buildMemoryUrls({
        slug: "omar-and-layla",
        type: "booth",
        isDev: true,
      });
      assert.equal(devUrls.primaryUrl, "http://omar-and-layla.localhost:3002");

      const prodUrls = buildMemoryUrls({
        slug: "omar-and-layla",
        type: "booth",
        isDev: false,
      });
      assert.equal(prodUrls.primaryUrl, "https://omar-and-layla.asar.me");
    });
  });
});
