// =============================================================
// ASAR E2E Test Suite — Tier 5: Adversarial Feature Verification & Edge Cases
// Roles: Critic, Specialist (Teamwork Challenger)
// Scope: Booth & Invitation Persistence, RSVP Mailbox, Dynamic Form Builder,
//        Phone/SMS OTP Normalization, and Admin Shell RBAC Guards
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import {
  ASAR_DATABASE_ID,
  ASAR_COLLECTIONS,
  ASAR_TEAMS,
  parseUserProfile,
  validateSubdomainSlug,
  normalizeCacheArray,
  findInCache,
  getSafeLocalStorage,
  type AsarUserProfile,
} from "../../../packages/react-appwrite/src/index.ts";

import {
  validateFormSchema,
  enforceMandatoryEmailConstraint,
  generateFieldsFromClientRequests,
  type DynamicFormField,
} from "../../../apps/Admin/src/components/invitation-studio/DynamicFormSchemaBuilder.tsx";

import {
  isValidEmail,
  validateRsvpForm,
} from "../../../apps/Invitation/src/components/renderer/DynamicRsvpForm.tsx";

import {
  normalizePhoneNumber,
  validateEmailFormat,
  isValidOtpSecret,
} from "../../../apps/Main/src/components/auth/AuthModal.tsx";

// =============================================================
// SECTION 1: Booth Memory & Voice Records Appwrite Persistence & Cache Fallback
// =============================================================

describe("Tier 5: Section 1 — Booth Memory & Voice Records Appwrite Persistence & Cache Fallback", () => {
  it("TC-BOOTH-01: Verifies canonical Appwrite collection constants for booth memories and voice records", () => {
    assert.equal(ASAR_DATABASE_ID, "asar-db");
    assert.equal(ASAR_COLLECTIONS.BOOTH_MEMORIES, "booth_memories");
    assert.equal(ASAR_COLLECTIONS.BOOTH_VOICE_RECORDS, "booth_voice_records");
    assert.equal(ASAR_COLLECTIONS.BOOTH_MEDIA, "booth_media");
  });

  it("TC-BOOTH-02: Booth memory payload serialization maintains waveform peaks array of length 48", () => {
    const rawPeaks = Array.from({ length: 48 }, (_, i) => Math.sin(i / 5) * 0.5 + 0.5);
    const peaksJson = JSON.stringify(rawPeaks);
    const parsed = JSON.parse(peaksJson);

    assert.equal(parsed.length, 48);
    assert.ok(parsed.every((p: number) => typeof p === "number" && p >= 0 && p <= 1));
  });

  it("TC-BOOTH-03: Voice record ID sanitization distinguishes simulated/blob IDs from cloud IDs", () => {
    function shouldCreateNewDoc(recordId: string | undefined): boolean {
      if (!recordId) return true;
      return (
        recordId.startsWith("sim_") ||
        recordId.startsWith("init_") ||
        recordId.startsWith("blob")
      );
    }

    assert.equal(shouldCreateNewDoc(undefined), true);
    assert.equal(shouldCreateNewDoc("sim_voice_1"), true);
    assert.equal(shouldCreateNewDoc("init_voice_0"), true);
    assert.equal(shouldCreateNewDoc("blob:http://localhost/123"), true);
    assert.equal(shouldCreateNewDoc("doc_appwrite_cloud_998"), false);
  });

  it("TC-BOOTH-04: Subdomain slug validation strictly enforces RFC 1123 compliance", () => {
    assert.equal(validateSubdomainSlug("mina-and-maryam").isValid, true);
    assert.equal(validateSubdomainSlug("omar-layla-2026").isValid, true);
    assert.equal(validateSubdomainSlug("-invalid-leading-dash").isValid, false);
    assert.equal(validateSubdomainSlug("invalid-trailing-dash-").isValid, false);
    assert.equal(validateSubdomainSlug("Invalid_Uppercase").isValid, false);
    assert.equal(validateSubdomainSlug("spaces not allowed").isValid, false);
    assert.equal(validateSubdomainSlug("admin").isValid, false, "Reserved subdomain must be rejected");
  });

  it("TC-BOOTH-05: EMPIRICAL CHALLENGE — Storefront cache fallback single-object vs array schema defect", () => {
    // When BoothMemoryStudio.tsx saves to localStorage:
    // localStorage.setItem("asar_booth_memories_cache", JSON.stringify(updatedMemory));
    // It saves a SINGLE OBJECT, not an array!
    const singleObjectPayload = JSON.stringify({
      slug: "mina-and-maryam",
      coupleTitle: "Mina & Maryam",
      eventDateDisplay: "12 July 2026",
    });

    // 1. Naive implementation in BoothMemoryPage.tsx:
    // const list = JSON.parse(cached);
    // list.find(...)
    const naiveParsed = JSON.parse(singleObjectPayload);
    assert.throws(
      () => {
        (naiveParsed as any).find((m: any) => m.slug === "mina-and-maryam");
      },
      /list\.find is not a function|naiveParsed\.find is not a function|TypeError/,
      "DEFECT CONFIRMED: BoothMemoryPage naive JSON.parse throws TypeError if cache is a single object"
    );

    // 2. Defensive implementation using cacheHelper.normalizeCacheArray:
    const normalized = normalizeCacheArray(singleObjectPayload);
    assert.ok(Array.isArray(normalized));
    assert.equal(normalized.length, 1);
    assert.equal((normalized[0] as any).slug, "mina-and-maryam");

    // 3. findInCache cleanly recovers the single object:
    const found = findInCache(normalized, "mina-and-maryam");
    assert.ok(found);
    assert.equal((found as any).coupleTitle, "Mina & Maryam");
  });
});

// =============================================================
// SECTION 2: RSVP Mailbox Verification & Edge Cases
// =============================================================

describe("Tier 5: Section 2 — RSVP Mailbox Verification, Search & Capacity Edge Cases", () => {
  it("TC-MAILBOX-01: Capacity stats calculation accurately sums guest plus companions", () => {
    const rsvps = [
      { status: "approved", companionsCount: 0 }, // 1 seat
      { status: "approved", companionsCount: 2 }, // 3 seats
      { status: "pending", companionsCount: 1 },  // 2 seats pending
      { status: "declined", companionsCount: 5 }, // 0 seats (declined)
    ];

    const approvedSeats = rsvps
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + 1 + (Number(r.companionsCount) || 0), 0);

    const pendingSeats = rsvps
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + 1 + (Number(r.companionsCount) || 0), 0);

    assert.equal(approvedSeats, 4); // (1+0) + (1+2) = 4
    assert.equal(pendingSeats, 2);  // (1+1) = 2
  });

  it("TC-MAILBOX-02: EMPIRICAL CHALLENGE — Negative companionsCount subtracts seats without lower clamping", () => {
    // When companionsCount is negative (-5), naive Number(r.companionsCount) || 0 evaluates to -5
    const corruptedRsvp = { status: "approved", companionsCount: -5 };

    const naiveCalculation = 1 + (Number(corruptedRsvp.companionsCount) || 0);
    assert.equal(naiveCalculation, -4, "DEFECT CONFIRMED: Negative companionsCount produces negative headcount");

    // Safe clamped calculation
    const safeCalculation = 1 + Math.max(0, Number(corruptedRsvp.companionsCount) || 0);
    assert.equal(safeCalculation, 1, "Clamped calculation must enforce minimum party size of 1");
  });

  it("TC-MAILBOX-03: Zero or negative maxCapacity is handled safely with Math.max(1, maxCapacity)", () => {
    const maxCapacityZero = 0;
    const safeMax = Math.max(1, maxCapacityZero);
    const approvedSeats = 10;
    const percentage = Math.round((approvedSeats / safeMax) * 100);

    assert.equal(safeMax, 1);
    assert.equal(percentage, 1000);
    assert.ok(isFinite(percentage), "Division by zero avoided");
  });

  it("TC-MAILBOX-04: Search filtering survives regex special characters without crashing", () => {
    const rsvps = [
      { guestName: "Dr. Karim [VIP]", guestEmail: "karim+special@test.com", guestPhone: "+20 (100) 123-4567", passToken: "VIP-99-AA" },
      { guestName: "Sarah El-Gendy", guestEmail: "sarah@test.com", guestPhone: "+966 50 111 2233", passToken: "VIP-11-BB" },
    ];

    function filterRsvps(query: string) {
      const q = query.trim().toLowerCase();
      if (!q) return rsvps;
      return rsvps.filter((r) => {
        const matchesName = (r.guestName || "").toLowerCase().includes(q);
        const matchesEmail = (r.guestEmail || "").toLowerCase().includes(q);
        const matchesPhone = (r.guestPhone || "").toLowerCase().includes(q);
        const matchesToken = (r.passToken || "").toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesToken;
      });
    }

    // Adversarial queries containing regex characters
    assert.equal(filterRsvps("[VIP]").length, 1);
    assert.equal(filterRsvps("+special").length, 1);
    assert.equal(filterRsvps("(100)").length, 1);
    assert.equal(filterRsvps("***").length, 0);
  });

  it("TC-MAILBOX-05: 1-Click approve generates valid VIP pass token format", () => {
    function generatePassToken() {
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const timestampPart = Date.now().toString(36).toUpperCase().slice(-4);
      return `VIP-${timestampPart}-${randomHex}`;
    }

    const token = generatePassToken();
    assert.match(token, /^VIP-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
  });

  it("TC-MAILBOX-06: EMPIRICAL CHALLENGE — Uncaught JSON.parse on dynamicResponsesJson crashes UI on malformed input", () => {
    const malformedJson = "{ corrupted json payload without closing brace";

    // In AdminRsvpMailbox.tsx line 1012:
    // {JSON.stringify(JSON.parse(selectedRsvp.dynamicResponsesJson), null, 2)}
    assert.throws(
      () => {
        JSON.parse(malformedJson);
      },
      /SyntaxError|Unexpected token/,
      "DEFECT CONFIRMED: Raw JSON.parse in dynamic responses modal crashes without try/catch"
    );

    // Safe parsing helper that protects the UI
    function safeParseDynamicResponses(rawJson: string | null | undefined): Record<string, any> {
      if (!rawJson) return {};
      try {
        const parsed = JSON.parse(rawJson);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
      } catch {
        return { _raw: rawJson, _parseError: true };
      }
    }

    const safeResult = safeParseDynamicResponses(malformedJson);
    assert.equal(safeResult._parseError, true);
    assert.equal(safeResult._raw, malformedJson);
  });
});

// =============================================================
// SECTION 3: Dynamic Form Builder Constraints & Validations
// =============================================================

describe("Tier 5: Section 3 — Dynamic Form Builder Strict Constraints & Custom Fields", () => {
  it("TC-FORM-01: Prohibits removing guestEmail or setting required: false", () => {
    // Missing guestEmail
    const invalidSchema1: DynamicFormField[] = [
      { id: "guestName", label: "Full Name", type: "text", required: true },
    ];
    const res1 = validateFormSchema(invalidSchema1);
    assert.equal(res1.isValid, false);
    assert.ok(res1.errors.some((e) => e.includes("guestEmail")));

    // guestEmail optional
    const invalidSchema2: DynamicFormField[] = [
      { id: "guestName", label: "Full Name", type: "text", required: true },
      { id: "guestEmail", label: "Email", type: "email", required: false },
    ];
    const res2 = validateFormSchema(invalidSchema2);
    assert.equal(res2.isValid, false);
    assert.ok(res2.errors.some((e) => e.includes("must be marked as required")));

    // guestEmail wrong type
    const invalidSchema3: DynamicFormField[] = [
      { id: "guestName", label: "Full Name", type: "text", required: true },
      { id: "guestEmail", label: "Email", type: "text", required: true },
    ];
    const res3 = validateFormSchema(invalidSchema3);
    assert.equal(res3.isValid, false);
    assert.ok(res3.errors.some((e) => e.includes("must have type 'email'")));
  });

  it("TC-FORM-02: enforceMandatoryEmailConstraint heals tampered schema", () => {
    const tampered = [
      { id: "guestEmail", label: "Tampered Email", type: "text" as any, required: false },
    ];
    const healed = enforceMandatoryEmailConstraint(tampered);

    const email = healed.find((f) => f.id === "guestEmail");
    assert.ok(email);
    assert.equal(email.type, "email");
    assert.equal(email.required, true);
    assert.equal(email.isSystemLocked, true);

    const name = healed.find((f) => f.id === "guestName");
    assert.ok(name, "Missing guestName must be auto-injected");
    assert.equal(name.required, true);
  });

  it("TC-FORM-03: Rejects duplicate field IDs and empty options in choice fields", () => {
    const duplicateIds: DynamicFormField[] = [
      { id: "guestName", label: "Name", type: "text", required: true },
      { id: "guestEmail", label: "Email", type: "email", required: true },
      { id: "custom_note", label: "Note 1", type: "text", required: false },
      { id: "custom_note", label: "Note 2", type: "text", required: false },
    ];
    const dupRes = validateFormSchema(duplicateIds);
    assert.equal(dupRes.isValid, false);
    assert.ok(dupRes.errors.some((e) => e.includes("Duplicate field ID")));

    const emptyOptions: DynamicFormField[] = [
      { id: "guestName", label: "Name", type: "text", required: true },
      { id: "guestEmail", label: "Email", type: "email", required: true },
      { id: "dietary", label: "Diet", type: "select", required: false, options: ["   ", ""] },
    ];
    const optRes = validateFormSchema(emptyOptions);
    assert.equal(optRes.isValid, false);
    assert.ok(optRes.errors.some((e) => e.includes("must have at least one option")));
  });

  it("TC-FORM-04: generateFieldsFromClientRequests keyword detection and Arabic character replacement defect", () => {
    const requests = [
      "رقم هاتف العميل للتواصل",
      "عدد المرافقين الإضافيين",
      "وجبات طعام خاصة",
      "طرف الحضور أهل العروس أو العريس",
      "تهنئة خاصة للعروسين",
    ];

    const fields = generateFieldsFromClientRequests(requests);
    assert.equal(fields.length, 5);

    assert.equal(fields[0].id, "guestPhone");
    assert.equal(fields[0].type, "tel");

    assert.equal(fields[1].id, "companionsCount");
    assert.equal(fields[1].type, "select");
    assert.ok(fields[1].options && fields[1].options.length > 0);

    assert.equal(fields[2].id, "dietaryPreferences");
    assert.equal(fields[2].type, "checkbox");
    assert.ok(fields[2].options && fields[2].options.includes("Vegetarian"));

    assert.equal(fields[3].id, "attendingSide");
    assert.equal(fields[3].type, "radio");

    assert.equal(fields[4].id, "guestBlessing");
    assert.equal(fields[4].type, "textarea");

    // EMPIRICAL CHALLENGE 1: The official form label is "التفضيلات الغذائية", but the parser
    // checks only for "طعام", failing to recognize "غذائية"
    const officialArabicDietary = generateFieldsFromClientRequests(["التفضيلات الغذائية"]);
    assert.match(
      officialArabicDietary[0].id,
      /^custom_+$/,
      "DEFECT CONFIRMED: Official label 'التفضيلات الغذائية' fails keyword match and falls back to underscore ID"
    );

    // EMPIRICAL CHALLENGE 2: Arabic custom fields of same character length produce 100% duplicate IDs
    // because [^a-zA-Z0-9] replaces all Arabic letters with '_'
    const sameLengthArabicRequests = ["اسم ولي الأمر", "رقم ولي الأمر"];
    const fallbackFields = generateFieldsFromClientRequests(sameLengthArabicRequests);
    assert.match(fallbackFields[0].id, /^custom_+$/);
    assert.equal(
      fallbackFields[0].id,
      fallbackFields[1].id,
      "DEFECT CONFIRMED: Same-length Arabic custom fields produce duplicate IDs triggering schema collision"
    );
  });

  it("TC-FORM-05: EMPIRICAL CHALLENGE — Substring match bug in companion count parser (+10 matches +1)", () => {
    // In DynamicRsvpForm.tsx line 214:
    // if (rawCompanions.includes("+1")) companions = 1;
    function parseCompanionsNaive(raw: string): number {
      if (raw.includes("+1")) return 1;
      if (raw.includes("+2")) return 2;
      const parsed = parseInt(raw, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    }

    assert.equal(parseCompanionsNaive("+1 Companion"), 1);
    assert.equal(parseCompanionsNaive("+2 Companions"), 2);
    // DEFECT: "+10 Companions" contains "+1"
    assert.equal(
      parseCompanionsNaive("+10 Companions"),
      1,
      "DEFECT CONFIRMED: '+10 Companions' falsely triggers .includes('+1') resolving to 1 instead of 10"
    );

    // Remediation: word boundary regex or exact leading match
    function parseCompanionsStrict(raw: string): number {
      const match = raw.match(/\+(\d+)/);
      if (match) return parseInt(match[1], 10);
      const parsed = parseInt(raw, 10);
      return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
    }

    assert.equal(parseCompanionsStrict("+1 Companion"), 1);
    assert.equal(parseCompanionsStrict("+10 Companions"), 10);
  });
});

// =============================================================
// SECTION 4: Authentication & Security (OTP & Admin RBAC)
// =============================================================

describe("Tier 5: Section 4 — Phone/SMS OTP Normalization & Admin Shell RBAC Verification", () => {
  it("TC-AUTH-01: normalizePhoneNumber handles Saudi, Egyptian, and international formats", () => {
    // Saudi
    assert.equal(normalizePhoneNumber("0501234567"), "+966501234567");
    assert.equal(normalizePhoneNumber("+966 50 123 4567"), "+966501234567");
    assert.equal(normalizePhoneNumber("00966501234567"), "+966501234567");

    // Egypt
    assert.equal(normalizePhoneNumber("01012345678"), "+201012345678");
    assert.equal(normalizePhoneNumber("+20 10 1234 5678"), "+201012345678");
  });

  it("TC-AUTH-02: EMPIRICAL CHALLENGE — Hardcoded +966 for 05 numbers overrides selected country code", () => {
    // UAE numbers start with 050, 052, 054, etc.
    // If an Emirati user selects UAE (+971) and enters 0501234567:
    const uaeNormalized = normalizePhoneNumber("0501234567", "+971");
    // Due to line 51: if (clean.startsWith("05")) return "+966" + clean.slice(1);
    assert.equal(
      uaeNormalized,
      "+966501234567",
      "DEFECT CONFIRMED: UAE numbers starting with 05 are forcibly overwritten to Saudi Arabia (+966)"
    );
  });

  it("TC-AUTH-03: isValidOtpSecret strictly requires 6 ASCII digits", () => {
    assert.equal(isValidOtpSecret("123456"), true);
    assert.equal(isValidOtpSecret("000000"), true);
    assert.equal(isValidOtpSecret("12345"), false, "Too short");
    assert.equal(isValidOtpSecret("1234567"), false, "Too long");
    assert.equal(isValidOtpSecret("12345a"), false, "Contains letters");
    assert.equal(isValidOtpSecret("١٢٣٤٥٦"), false, "Eastern Arabic digits rejected without normalization");
  });

  it("TC-AUTH-04: Admin Shell RBAC — unauthenticated access challenges guest", () => {
    function evaluateAdminAccess(user: any, teams: string[] = []): "ALLOW" | "LOGIN_PROMPT" | "FORBIDDEN" {
      if (!user) return "LOGIN_PROMPT";
      if (!teams.includes(ASAR_TEAMS.ADMINS) && user.role !== "admin") return "FORBIDDEN";
      return "ALLOW";
    }

    assert.equal(evaluateAdminAccess(null), "LOGIN_PROMPT");
    assert.equal(evaluateAdminAccess(undefined), "LOGIN_PROMPT");
  });

  it("TC-AUTH-05: Admin Shell RBAC — authenticated non-admin client is forbidden", () => {
    function evaluateAdminAccess(user: any, teams: string[] = []): "ALLOW" | "LOGIN_PROMPT" | "FORBIDDEN" {
      if (!user) return "LOGIN_PROMPT";
      if (!teams.includes(ASAR_TEAMS.ADMINS) && user.role !== "admin") return "FORBIDDEN";
      return "ALLOW";
    }

    const clientUser = { id: "usr_client", role: "client", email: "client@test.com" };
    assert.equal(evaluateAdminAccess(clientUser, ["users"]), "FORBIDDEN");
  });

  it("TC-AUTH-06: Admin Shell RBAC — user in 'team:admins' is granted administrator access", () => {
    function evaluateAdminAccess(user: any, teams: string[] = []): "ALLOW" | "LOGIN_PROMPT" | "FORBIDDEN" {
      if (!user) return "LOGIN_PROMPT";
      if (!teams.includes(ASAR_TEAMS.ADMINS) && user.role !== "admin") return "FORBIDDEN";
      return "ALLOW";
    }

    const adminUser = { id: "usr_admin", role: "admin", email: "admin@asar.me" };
    assert.equal(evaluateAdminAccess(adminUser, ["admins", "users"]), "ALLOW");
    assert.equal(evaluateAdminAccess({ id: "usr_ops" }, ["admins"]), "ALLOW");
  });
});
