import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Target 1: Order Pipeline Transitions
import {
  isValidTransition,
  getNextValidStates,
  ORDER_PIPELINE_STAGES,
  ORDER_STAGE_SEQUENCE,
  getOrderStageProgress,
} from "../../../packages/react-appwrite/src/AsarDomain/orderPipeline.ts";
import type { OrderStatus } from "../../../packages/react-appwrite/src/AsarDomain/models.ts";

// Target 2: Filename Parsing
import { parseVoiceFilename as parseVoiceFilenameCore } from "../../../packages/react-appwrite/src/AsarDomain/audioAnalyzer.ts";
import {
  parseVoiceFilename as parseVoiceFilenameAdmin,
  generateFallbackAudioMetadata,
  isKnownCategory,
  mapCategory,
} from "../src/components/booth-studio/BulkVoiceUploader.tsx";

// Target 3: Dynamic Form Schema Validation
import {
  validateFormSchema,
  enforceMandatoryEmailConstraint,
  MANDATORY_SYSTEM_FIELDS,
  type DynamicFormField,
} from "../src/components/invitation-studio/DynamicFormSchemaBuilder.tsx";
import {
  validateRsvpForm,
  isValidEmail,
} from "../../../apps/Invitation/src/components/renderer/DynamicRsvpForm.tsx";

// Target 4: Audio Analyzer Waveform Generation
import { generateDeterministicWaveform } from "../../../packages/react-appwrite/src/AsarDomain/audioAnalyzer.ts";

// Target 5: EmailJS Payload Construction & Capacity Calculation
import {
  sendRsvpDecisionEmail,
  buildQrCodeImageUrl,
} from "../../../packages/react-appwrite/src/AsarDomain/emailJsService.ts";
import { calculateCapacityStats } from "../../../apps/Main/src/components/mailbox/CapacityProgressBar.tsx";
import type { InvitationRsvp } from "../../../packages/react-appwrite/src/AsarDomain/models.ts";

// ============================================================================
// ADVERSARIAL STRESS SUITE: AGENT 01 - AGENT 10 EMPIRICAL VERIFICATION
// ============================================================================

describe("Adversarial Empirical Stress Harness: Agent 01 - Agent 10 Deliverables", () => {
  // --------------------------------------------------------------------------
  // 1. ORDER PIPELINE STATE MACHINE & TRANSITIONS
  // --------------------------------------------------------------------------
  describe("1. Order Pipeline Transitions & State Machine Integrity", () => {
    it("should accept all documented valid forward transitions", () => {
      assert.equal(isValidTransition("pending_payment", "awaiting_client_assets"), true);
      assert.equal(isValidTransition("pending_payment", "payment_rejected"), true);
      assert.equal(isValidTransition("payment_rejected", "pending_payment"), true);
      assert.equal(isValidTransition("awaiting_client_assets", "event_scheduled"), true);
      assert.equal(isValidTransition("event_scheduled", "audio_mastering"), true);
      assert.equal(isValidTransition("event_scheduled", "published"), true);
      assert.equal(isValidTransition("audio_mastering", "studio_curation"), true);
      assert.equal(isValidTransition("audio_mastering", "published"), true);
      assert.equal(isValidTransition("studio_curation", "published"), true);
      assert.equal(isValidTransition("published", "studio_curation"), true); // Admin tweak allowance
    });

    it("should allow idempotent self-transitions for all valid states", () => {
      const allStates: OrderStatus[] = [
        "pending_payment",
        "payment_rejected",
        "awaiting_client_assets",
        "event_scheduled",
        "audio_mastering",
        "studio_curation",
        "published",
      ];
      for (const st of allStates) {
        assert.equal(isValidTransition(st, st), true, `State ${st} self-transition must be valid`);
      }
    });

    it("should strictly reject invalid backwards transitions", () => {
      // Published cannot go back to awaiting_client_assets, event_scheduled, or pending_payment
      assert.equal(isValidTransition("published", "awaiting_client_assets"), false);
      assert.equal(isValidTransition("published", "event_scheduled"), false);
      assert.equal(isValidTransition("published", "pending_payment"), false);
      assert.equal(isValidTransition("published", "payment_rejected"), false);
      assert.equal(isValidTransition("published", "audio_mastering"), false);

      // Studio curation cannot go back to awaiting_client_assets or pending_payment
      assert.equal(isValidTransition("studio_curation", "awaiting_client_assets"), false);
      assert.equal(isValidTransition("studio_curation", "pending_payment"), false);
      assert.equal(isValidTransition("studio_curation", "event_scheduled"), false);

      // Audio mastering cannot regress to payment
      assert.equal(isValidTransition("audio_mastering", "pending_payment"), false);
      assert.equal(isValidTransition("audio_mastering", "payment_rejected"), false);
      assert.equal(isValidTransition("audio_mastering", "awaiting_client_assets"), false);

      // Event scheduled cannot regress to pending payment
      assert.equal(isValidTransition("event_scheduled", "pending_payment"), false);
      assert.equal(isValidTransition("event_scheduled", "payment_rejected"), false);

      // Awaiting client assets cannot jump back to payment_rejected directly
      assert.equal(isValidTransition("awaiting_client_assets", "payment_rejected"), false);
    });

    it("should strictly reject invalid forward skip transitions", () => {
      // Pending payment cannot skip directly to published, audio_mastering, or studio_curation
      assert.equal(isValidTransition("pending_payment", "published"), false);
      assert.equal(isValidTransition("pending_payment", "audio_mastering"), false);
      assert.equal(isValidTransition("pending_payment", "studio_curation"), false);
      assert.equal(isValidTransition("pending_payment", "event_scheduled"), false);

      // Payment rejected cannot skip to published or awaiting_client_assets
      assert.equal(isValidTransition("payment_rejected", "published"), false);
      assert.equal(isValidTransition("payment_rejected", "awaiting_client_assets"), false);
      assert.equal(isValidTransition("payment_rejected", "studio_curation"), false);

      // Awaiting client assets cannot skip to published or studio_curation
      assert.equal(isValidTransition("awaiting_client_assets", "published"), false);
      assert.equal(isValidTransition("awaiting_client_assets", "studio_curation"), false);
      assert.equal(isValidTransition("awaiting_client_assets", "audio_mastering"), false);
    });

    it("should reject completely fictitious or malformed state inputs", () => {
      // Fictitious states: "draft", "delivered", "cancelled", "refunded", empty string
      assert.equal(isValidTransition("draft" as OrderStatus, "delivered" as OrderStatus), false);
      assert.equal(isValidTransition("draft" as OrderStatus, "pending_payment"), false);
      assert.equal(isValidTransition("pending_payment", "delivered" as OrderStatus), false);
      assert.equal(isValidTransition("published", "cancelled" as OrderStatus), false);
      assert.equal(isValidTransition("" as OrderStatus, "published"), false);
      assert.equal(isValidTransition(null as unknown as OrderStatus, "published"), false);
      assert.equal(isValidTransition(undefined as unknown as OrderStatus, "published"), false);
    });

    it("REMEDIATED: isValidTransition rejects fictitious states even if from === to", () => {
      const isSelfFictitiousAllowed = isValidTransition("draft" as OrderStatus, "draft" as OrderStatus);
      assert.equal(isSelfFictitiousAllowed, false, "Fictitious self-transitions must be rejected");
    });

    it("getNextValidStates should return exact expected next states", () => {
      assert.deepEqual(getNextValidStates("pending_payment"), ["payment_rejected", "awaiting_client_assets"]);
      assert.deepEqual(getNextValidStates("payment_rejected"), ["pending_payment"]);
      assert.deepEqual(getNextValidStates("awaiting_client_assets"), ["event_scheduled"]);
      assert.deepEqual(getNextValidStates("event_scheduled"), ["audio_mastering", "published"]);
      assert.deepEqual(getNextValidStates("audio_mastering"), ["studio_curation", "published"]);
      assert.deepEqual(getNextValidStates("studio_curation"), ["published"]);
      assert.deepEqual(getNextValidStates("published"), ["studio_curation"]);

      // Unrecognized states must return empty array without crashing
      assert.deepEqual(getNextValidStates("draft" as OrderStatus), []);
      assert.deepEqual(getNextValidStates("" as OrderStatus), []);
      assert.deepEqual(getNextValidStates(null as unknown as OrderStatus), []);
      assert.deepEqual(getNextValidStates(undefined as unknown as OrderStatus), []);
    });

    it("getOrderStageProgress should correctly calculate step percentages and completion flags", () => {
      const pubProgress = getOrderStageProgress("published");
      assert.equal(pubProgress.isCompleted, true);
      assert.equal(pubProgress.progressPercent, 100);
      assert.equal(pubProgress.requiresClientAction, false);

      const rejectedProgress = getOrderStageProgress("payment_rejected");
      assert.equal(rejectedProgress.requiresClientAction, true);
      assert.equal(rejectedProgress.isCompleted, false);

      const assetsProgress = getOrderStageProgress("awaiting_client_assets");
      assert.equal(assetsProgress.requiresClientAction, true);

      // Unknown state should fallback gracefully to pending_payment
      const unknownProgress = getOrderStageProgress("unknown_status" as OrderStatus);
      assert.equal(unknownProgress.stageInfo.key, "pending_payment");
      assert.equal(unknownProgress.isCompleted, false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. FILENAME PARSING STRESS TESTS
  // --------------------------------------------------------------------------
  describe("2. Filename Parsing Stress Tests (Admin & Core Analyzers)", () => {
    it("handles filenames with multiple consecutive and scattered underscores", () => {
      const input = "Friends_Nour_Hassan_Best_Friend_VIP.mp3";
      const resAdmin = parseVoiceFilenameAdmin(input);
      assert.equal(resAdmin.category, "Friends");
      assert.ok(resAdmin.speakerName.length > 0);
      assert.ok(resAdmin.speakerRole.length > 0);

      const resCore = parseVoiceFilenameCore(input);
      assert.equal(resCore.category, "Friends");
      assert.equal(resCore.speakerName, "Nour");
      assert.equal(resCore.speakerRole, "Hassan");
    });

    it("handles filenames with leading, trailing, and repeated underscores", () => {
      const inputs = ["___Nour_Hassan_Brother___.mp3", "__REC__042__.wav", "_Ahmed_Sayed_.mp3"];
      for (const fn of inputs) {
        const resAdmin = parseVoiceFilenameAdmin(fn);
        assert.ok(resAdmin.speakerName, `Admin parser failed on ${fn}`);
        const resCore = parseVoiceFilenameCore(fn);
        assert.ok(resCore.speakerName, `Core parser failed on ${fn}`);
      }
    });

    it("handles multiple hyphens, dashes, and varied spacing", () => {
      const inputs = [
        "Family - Ahmed - El - Sayed - Brother.mp3",
        "Friends---Layla-Kamal---Friend.wav",
        "Colleagues - Dr. Tarek - Mostafa - Mentor.m4a",
      ];
      for (const fn of inputs) {
        const resAdmin = parseVoiceFilenameAdmin(fn);
        assert.ok(resAdmin.speakerName);
        assert.ok(resAdmin.speakerRole);
      }
    });

    it("parses Arabic text, categories, roles, and mixed Arabic-English accurately", () => {
      // Pure Arabic 3-part with dash
      const arabic1 = "عائلة - أحمد السيد - أخ.mp3";
      const resAdmin1 = parseVoiceFilenameAdmin(arabic1);
      assert.equal(resAdmin1.category, "Family");
      assert.equal(resAdmin1.speakerName, "أحمد السيد");
      assert.equal(resAdmin1.speakerRole, "أخ");

      // Arabic category with underscores
      const arabic2 = "أصدقاء_منى زكي_صديقة العروسة.mp3";
      const resAdmin2 = parseVoiceFilenameAdmin(arabic2);
      assert.equal(resAdmin2.category, "Friends");
      assert.equal(resAdmin2.speakerName, "منى زكي");
      assert.equal(resAdmin2.speakerRole, "صديقة العروسة");

      // Arabic role with folder name
      const arabic3 = "عمرو دياب_صديق.mp3";
      const resAdmin3 = parseVoiceFilenameAdmin(arabic3, "الأهل");
      assert.equal(resAdmin3.category, "Family");
      assert.equal(resAdmin3.speakerName, "عمرو دياب");
      assert.equal(resAdmin3.speakerRole, "صديق");

      // Mixed Arabic and English
      const mixed = "Special Guests - دكتور مجدي يعقوب - VIP.mp3";
      const resAdminMixed = parseVoiceFilenameAdmin(mixed);
      assert.equal(resAdminMixed.category, "Special Guests");
      assert.equal(resAdminMixed.speakerName, "دكتور مجدي يعقوب");
    });

    it("handles filenames without extensions cleanly", () => {
      const noExt1 = "Friends_Nour Hassan_Best Friend";
      const resAdmin1 = parseVoiceFilenameAdmin(noExt1);
      assert.equal(resAdmin1.category, "Friends");
      assert.equal(resAdmin1.speakerName, "Nour Hassan");
      assert.equal(resAdmin1.speakerRole, "Best Friend");

      const noExt2 = "Family - Omar & Layla - Bride & Groom";
      const resAdmin2 = parseVoiceFilenameAdmin(noExt2);
      assert.equal(resAdmin2.category, "Family");
      assert.ok(resAdmin2.speakerName.includes("Omar"));

      const noExtRec = "REC_049";
      const resAdminRec = parseVoiceFilenameAdmin(noExtRec);
      assert.equal(resAdminRec.speakerName, "Voice Memory #49");
    });

    it("Core parser (audioAnalyzer.ts) survives corrupted, zero-length, whitespace-only, and extreme inputs safely", () => {
      const malformedInputs = [
        "",
        "   ",
        "\t\n",
        ".mp3",
        "....",
        "----",
        "____",
        "!@#$%^&*()",
        "a".repeat(1000) + ".mp3",
      ];

      for (const input of malformedInputs) {
        assert.doesNotThrow(() => {
          const res = parseVoiceFilenameCore(input);
          assert.ok(res.speakerName, `Core speakerName missing for "${input.slice(0, 20)}"`);
          assert.ok(res.category, `Core category missing for "${input.slice(0, 20)}"`);
        });
      }

      // Null and undefined safety for core
      const nullCore = parseVoiceFilenameCore(null as unknown as string);
      assert.ok(nullCore.speakerName);
      const undefinedCore = parseVoiceFilenameCore(undefined as unknown as string);
      assert.ok(undefinedCore.speakerName);
    });

    it("Admin parser (BulkVoiceUploader.tsx) handles delimiter-only and malformed inputs safely without crashing", () => {
      const delimiterInputs = ["____", "----", "____.mp3", "----.wav"];

      for (const input of delimiterInputs) {
        assert.doesNotThrow(() => {
          const res = parseVoiceFilenameAdmin(input);
          assert.ok(res.speakerName);
        }, `Expected parseVoiceFilenameAdmin to safely parse delimiter-only input "${input}"`);
      }

      // Non-delimiter malformed inputs do not crash
      const safeInputs = ["", "   ", ".mp3", "....", "!@#$%^&*()", "a".repeat(500) + ".mp3"];
      for (const input of safeInputs) {
        assert.doesNotThrow(() => {
          const res = parseVoiceFilenameAdmin(input);
          assert.ok(res.speakerName);
        });
      }
    });

    it("correctly normalizes numbered tracks (REC_0001, Track-05, 01_Ahmed)", () => {
      const r1 = parseVoiceFilenameAdmin("REC_0007.mp3");
      assert.equal(r1.speakerName, "Voice Memory #7");

      const r2 = parseVoiceFilenameAdmin("Track-09.wav");
      assert.equal(r2.speakerName, "Voice Memory #9");

      const r3 = parseVoiceFilenameAdmin("03_Karim_Waly_Family.mp3");
      assert.equal(r3.clipId, "03");
      assert.equal(r3.speakerName, "Karim Waly");
      assert.equal(r3.category, "Family");
    });
  });

  // --------------------------------------------------------------------------
  // 3. DYNAMIC FORM SCHEMA VALIDATION & STRICT GUEST EMAIL ENFORCEMENT
  // --------------------------------------------------------------------------
  describe("3. Dynamic Form Schema Validation & guestEmail Lockdown", () => {
    it("STRICT CONSTRAINT: guestEmail can NEVER be removed from schema without failing validation", () => {
      // Missing guestEmail entirely
      const noEmailSchema: DynamicFormField[] = [
        {
          id: "guestName",
          label: "Full Name",
          type: "text",
          required: true,
          isSystemLocked: true,
        },
        {
          id: "guestPhone",
          label: "Phone",
          type: "tel",
          required: false,
        },
      ];

      const res = validateFormSchema(noEmailSchema);
      assert.equal(res.isValid, false, "Schema without guestEmail MUST NOT be valid");
      assert.ok(
        res.errors.some((e) => e.includes("guestEmail")),
        "Error message must explicitly mention missing guestEmail"
      );
    });

    it("STRICT CONSTRAINT: guestEmail can NEVER be marked optional (required: false)", () => {
      const optionalEmailSchema: DynamicFormField[] = [
        {
          id: "guestName",
          label: "Full Name",
          type: "text",
          required: true,
          isSystemLocked: true,
        },
        {
          id: "guestEmail",
          label: "Email Address",
          type: "email",
          required: false, // Adversarial tampering
          isSystemLocked: false,
        },
      ];

      const res = validateFormSchema(optionalEmailSchema);
      assert.equal(res.isValid, false, "Schema with optional guestEmail MUST NOT be valid");
      assert.ok(
        res.errors.some((e) => e.includes("must be marked as required")),
        "Error message must specify guestEmail must be required"
      );
    });

    it("STRICT CONSTRAINT: guestEmail can NEVER have non-email type", () => {
      const invalidTypeSchema: DynamicFormField[] = [
        {
          id: "guestName",
          label: "Full Name",
          type: "text",
          required: true,
        },
        {
          id: "guestEmail",
          label: "Email Address",
          type: "text", // Invalid type (should be email)
          required: true,
        },
      ];

      const res = validateFormSchema(invalidTypeSchema);
      assert.equal(res.isValid, false, "Schema with non-email guestEmail type MUST NOT be valid");
      assert.ok(res.errors.some((e) => e.includes("must have type 'email'")));
    });

    it("enforceMandatoryEmailConstraint MUST heal and re-lock guestEmail regardless of input tampering", () => {
      // 1. Completely empty input
      const healed1 = enforceMandatoryEmailConstraint([]);
      const email1 = healed1.find((f) => f.id === "guestEmail");
      const name1 = healed1.find((f) => f.id === "guestName");
      assert.ok(email1);
      assert.equal(email1.required, true);
      assert.equal(email1.type, "email");
      assert.equal(email1.isSystemLocked, true);
      assert.ok(name1);
      assert.equal(name1.required, true);

      // 2. Tampered schema with required=false, type=text
      const tampered: DynamicFormField[] = [
        {
          id: "guestEmail",
          label: "Fake Email",
          type: "text",
          required: false,
          isSystemLocked: false,
        },
      ];
      const healed2 = enforceMandatoryEmailConstraint(tampered);
      const email2 = healed2.find((f) => f.id === "guestEmail");
      assert.ok(email2);
      assert.equal(email2.required, true);
      assert.equal(email2.type, "email");
      assert.equal(email2.isSystemLocked, true);
    });

    it("rejects empty form schemas, null, and non-array schemas", () => {
      const resEmpty = validateFormSchema([]);
      assert.equal(resEmpty.isValid, false);
      assert.ok(resEmpty.errors[0].includes("empty"));

      const resNull = validateFormSchema(null as unknown as DynamicFormField[]);
      assert.equal(resNull.isValid, false);

      const resUndef = validateFormSchema(undefined as unknown as DynamicFormField[]);
      assert.equal(resUndef.isValid, false);
    });

    it("detects and rejects duplicate field IDs", () => {
      const duplicateSchema: DynamicFormField[] = [
        ...MANDATORY_SYSTEM_FIELDS,
        {
          id: "specialSong",
          label: "Song Request 1",
          type: "text",
          required: false,
        },
        {
          id: "specialSong", // Duplicate ID
          label: "Song Request 2",
          type: "text",
          required: false,
        },
      ];

      const res = validateFormSchema(duplicateSchema);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.some((e) => e.includes("Duplicate field ID") && e.includes("specialSong")));
    });

    it("detects and rejects empty options in select, radio, and checkbox fields", () => {
      const emptyOptionsSchema: DynamicFormField[] = [
        ...MANDATORY_SYSTEM_FIELDS,
        {
          id: "tableSelect",
          label: "Table Selection",
          type: "select",
          required: true,
          options: [], // Empty
        },
        {
          id: "dietRadio",
          label: "Dietary",
          type: "radio",
          required: true,
          options: ["   ", ""], // All blank strings
        },
      ];

      const res = validateFormSchema(emptyOptionsSchema);
      assert.equal(res.isValid, false);
      assert.ok(res.errors.length >= 2);
    });

    it("rigorously tests email regex against adversarial email inputs", () => {
      const invalidEmails = [
        "",
        "   ",
        "plainaddress",
        "@missingusername.com",
        "username@.com",
        "user name@domain.com",
        "user@domain..com",
        "user@",
        "user@domain",
        "<script>alert(1)</script>@domain.com",
        "user@domain,com",
        "user@domain@another.com",
        "user@-domain.com",
      ];

      for (const email of invalidEmails) {
        assert.equal(isValidEmail(email), false, `Should reject invalid email: "${email}"`);
      }

      const validEmails = [
        "karim@example.com",
        "omar.layla@four-seasons.com.eg",
        "vip.guest+table1@asar.audio",
        "user_123@sub.domain.org",
        "guest-rsvp@wedding.events",
      ];

      for (const email of validEmails) {
        assert.equal(isValidEmail(email), true, `Should accept valid email: "${email}"`);
      }
    });

    it("RSVP submission validation rejects negative companions and missing required fields", () => {
      // Missing name
      const resNoName = validateRsvpForm({ guestEmail: "valid@example.com" });
      assert.equal(resNoName.isValid, false);
      assert.ok(resNoName.errors.guestName);

      // Missing email
      const resNoEmail = validateRsvpForm({ guestName: "Karim" });
      assert.equal(resNoEmail.isValid, false);
      assert.ok(resNoEmail.errors.guestEmail);

      // Negative companions
      const resNegCompanions = validateRsvpForm({
        guestName: "Karim",
        guestEmail: "karim@example.com",
        companionsCount: -3,
      });
      assert.equal(resNegCompanions.isValid, false);
      assert.ok(resNegCompanions.errors.companionsCount);
    });
  });

  // --------------------------------------------------------------------------
  // 4. AUDIO ANALYZER WAVEFORM GENERATION
  // --------------------------------------------------------------------------
  describe("4. Audio Analyzer Waveform Generation Resilience & Range", () => {
    it("consistently produces exactly 48 normalized peaks in [0.15 .. 1.0] without NaN or Infinity", () => {
      const seeds = [
        "wedding_memory_01.mp3",
        "voice_clip_track_42.wav",
        "Family - Ahmed - Brother",
        "",
        "0",
        "تسجيل صوتي عائلي باللغة العربية",
        "✨🎉🎵🎙️",
        "A".repeat(5000),
      ];

      for (const seed of seeds) {
        const peaks = generateDeterministicWaveform(seed, 48);
        assert.equal(peaks.length, 48, `Peak count should be 48 for seed "${seed.slice(0, 15)}"`);

        for (let i = 0; i < peaks.length; i++) {
          const peak = peaks[i];
          assert.equal(typeof peak, "number");
          assert.equal(Number.isNaN(peak), false, `Peak ${i} is NaN for seed "${seed.slice(0, 15)}"`);
          assert.equal(Number.isFinite(peak), true, `Peak ${i} is infinite for seed "${seed.slice(0, 15)}"`);
          assert.ok(
            peak >= 0.15 && peak <= 1.0,
            `Peak ${i} value ${peak} is out of bounds [0.15, 1.0] for seed "${seed.slice(0, 15)}"`
          );
        }
      }
    });

    it("demonstrates strict determinism across multiple executions", () => {
      const seed = "Deterministic_Seed_Test_4567";
      const run1 = generateDeterministicWaveform(seed, 48);
      const run2 = generateDeterministicWaveform(seed, 48);
      const run3 = generateDeterministicWaveform(seed, 48);

      assert.deepEqual(run1, run2);
      assert.deepEqual(run2, run3);
    });

    it("survives extreme seeds: numbers, negative numbers, NaN, Infinity", () => {
      const extremeSeeds = [0, -1, -9999999, 123456789, NaN, Infinity, -Infinity];

      for (const s of extremeSeeds) {
        assert.doesNotThrow(() => {
          const peaks = generateDeterministicWaveform(s as unknown as string, 48);
          assert.equal(peaks.length, 48);
          for (const p of peaks) {
            assert.equal(Number.isNaN(p), false);
            assert.equal(Number.isFinite(p), true);
            assert.ok(p >= 0.15 && p <= 1.0);
          }
        });
      }
    });

    it("fallback audio metadata generator in Admin produces bounded waveform", () => {
      const meta = generateFallbackAudioMetadata("test_track.mp3", 400000, 48);
      assert.equal(meta.waveformPeaks.length, 48);
      assert.match(meta.durationFormatted, /^\d+:\d{2}$/);
      assert.ok(meta.durationSeconds >= 18);

      for (const peak of meta.waveformPeaks) {
        assert.ok(peak >= 0.15 && peak <= 1.0);
        assert.equal(Number.isNaN(peak), false);
        assert.equal(Number.isFinite(peak), true);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. EMAILJS PAYLOAD CONSTRUCTION & CAPACITY CALCULATION
  // --------------------------------------------------------------------------
  describe("5. EmailJS Payload Construction & Venue Capacity Calculation", () => {
    it("correctly formats approved payload: includes QR code URL, pass link, and positive confirmation", async () => {
      const result = await sendRsvpDecisionEmail({
        decision: "approved",
        toEmail: "mohamed.hassan@example.com",
        toName: "Mohamed Hassan",
        eventTitle: "Athar Luxury Wedding",
        eventDate: "15 September 2026",
        eventTime: "8:00 PM",
        venueName: "Four Seasons Hotel",
        passToken: "INV-PASS-4491-Z",
        rsvpId: "rsvp-athar-101",
      });

      assert.equal(result.success, true);
      assert.equal(result.simulated, true);
      assert.ok(result.qrCodeUrl, "Approved decision MUST include qrCodeUrl");
      assert.ok(result.qrCodeUrl.includes("create-qr-code") || result.qrCodeUrl.includes("avatars/qr"));
      assert.ok(result.emailSubject.includes("تأكيد حضوركم"));
      assert.ok(result.emailBodyPreview.includes("Mohamed Hassan"));
      assert.ok(result.emailBodyPreview.includes("mohamed.hassan@example.com"));
      assert.ok(result.emailBodyPreview.includes("Decision: APPROVED"));
      assert.ok(result.emailBodyPreview.includes("INV-PASS-4491-Z") || result.emailBodyPreview.includes("rsvp-athar-101"));
    });

    it("correctly formats declined payload: excludes QR code, includes diplomatic venue capacity regret", async () => {
      const result = await sendRsvpDecisionEmail({
        decision: "declined",
        toEmail: "declined.guest@example.com",
        toName: "Declined Guest",
        eventTitle: "Athar Luxury Wedding",
        eventDate: "15 September 2026",
        venueName: "Four Seasons Hotel",
      });

      assert.equal(result.success, true);
      assert.equal(result.simulated, true);
      assert.equal(result.qrCodeUrl, undefined, "Declined decision MUST NOT include qrCodeUrl");
      assert.ok(result.emailSubject.includes("بخصوص دعوتكم لحضور"));
      assert.ok(result.emailBodyPreview.includes("Decision: DECLINED"));
      assert.ok(
        result.emailBodyPreview.includes("السعة الاستيعابية المتاحة بالقاعة"),
        "Declined email MUST contain diplomatic capacity apology message"
      );
    });

    it("capacity calculation handles 0 seats and negative capacity safely without NaN or Infinity", () => {
      // 0 max capacity
      const statsZero = calculateCapacityStats({
        rsvps: [{ guestName: "G1", status: "approved", companionsCount: 0 }],
        maxCapacity: 0,
      });
      assert.equal(statsZero.maxCapacity, 1, "0 capacity should floor at 1 to prevent division by zero");
      assert.equal(Number.isNaN(statsZero.percentage), false);
      assert.equal(Number.isFinite(statsZero.percentage), true);
      assert.equal(statsZero.remainingSeats, 0);

      // Negative max capacity
      const statsNeg = calculateCapacityStats({
        rsvps: [{ guestName: "G1", status: "approved", companionsCount: 1 }],
        maxCapacity: -100,
      });
      assert.equal(statsNeg.maxCapacity, 1, "Negative capacity should floor at 1");
      assert.equal(Number.isNaN(statsNeg.percentage), false);
      assert.equal(statsNeg.remainingSeats, 0);
    });

    it("capacity calculation handles overcapacity cleanly: remainingSeats floor at 0, isAtCapacity true, statusColor maroon", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Host Group",
          status: "approved",
          companionsCount: 199, // 1 + 199 = 200 seats requested
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 150,
      });

      assert.equal(stats.confirmedSeats, 200);
      assert.equal(stats.maxCapacity, 150);
      assert.equal(stats.percentage, 133);
      assert.equal(stats.remainingSeats, 0, "Remaining seats must floor at 0 when overcapacity");
      assert.equal(stats.isAtCapacity, true);
      assert.equal(stats.isNearCapacity, false);
      assert.equal(stats.statusColor, "maroon");
    });

    it("capacity calculation normalizes negative and malformed companions cleanly", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Negative Companions",
          status: "approved",
          companionsCount: -10, // Should normalize to 0
        },
        {
          guestName: "NaN Companions",
          status: "approved",
          companionsCount: NaN as unknown as number, // Should normalize to 0
        },
        {
          guestName: "Undefined Companions",
          status: "approved",
          companionsCount: undefined, // Should normalize to 0
        },
        {
          guestName: "String Companions",
          status: "pending",
          companionsCount: "five" as unknown as number, // Should normalize to 0
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 50,
      });

      // 3 approved guests with 0 companions each = 3 seats
      assert.equal(stats.confirmedSeats, 3);
      // 1 pending guest with 0 companions = 1 seat
      assert.equal(stats.pendingSeats, 1);
      assert.equal(stats.remainingSeats, 47);
    });

    it("buildQrCodeImageUrl generates consistent brand-colored fallback QR URLs", () => {
      const url = buildQrCodeImageUrl("https://asar.audio/pass/guest-1", 500);
      assert.ok(url.includes("api.qrserver.com"));
      assert.ok(url.includes("color=6B1D28"));
      assert.ok(url.includes("bgcolor=FBF7F2"));
      assert.ok(url.includes("500x500"));
    });
  });
});
