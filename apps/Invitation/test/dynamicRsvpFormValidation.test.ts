import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  validateRsvpForm,
  isValidEmail,
  generatePassToken,
  DEFAULT_DYNAMIC_SCHEMA,
} from "../src/components/renderer/DynamicRsvpForm";
import { buildQrCodeImageUrl } from "../src/components/pass/PassQrCode";
import type { DynamicFormField, InvitationRsvpDocument } from "../src/components/renderer/types";

describe("ASAR Invitation — Dynamic RSVP Form & QR Pass Engine", () => {
  describe("1. Mandatory Email Enforcement", () => {
    it("should reject submission when guestEmail is missing", () => {
      const result = validateRsvpForm({ guestName: "كريم الألفي" });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.guestEmail);
      assert.match(result.errors.guestEmail, /البريد الإلكتروني مطلوب/);
    });

    it("should reject submission when guestEmail is null or empty string", () => {
      const resultEmpty = validateRsvpForm({ guestName: "كريم الألفي", guestEmail: "" });
      assert.strictEqual(resultEmpty.isValid, false);
      assert.ok(resultEmpty.errors.guestEmail);

      const resultWhitespace = validateRsvpForm({ guestName: "كريم الألفي", guestEmail: "    " });
      assert.strictEqual(resultWhitespace.isValid, false);
      assert.ok(resultWhitespace.errors.guestEmail);
    });
  });

  describe("2. Email Format Validation (Regex)", () => {
    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "plainaddress",
        "@missingusername.com",
        "username@.com",
        "user name@domain.com",
        "user@domain..com",
        "user@",
      ];

      for (const email of invalidEmails) {
        assert.strictEqual(isValidEmail(email), false, `Should be invalid: ${email}`);
        const result = validateRsvpForm({
          guestName: "سارة محمود",
          guestEmail: email,
        });
        assert.strictEqual(result.isValid, false);
        assert.ok(result.errors.guestEmail);
      }
    });

    it("should accept RFC-compliant email formats", () => {
      const validEmails = [
        "karim@example.com",
        "omar.layla@four-seasons.com.eg",
        "vip.guest+table1@asar.audio",
        "user1234@sub.domain.org",
      ];

      for (const email of validEmails) {
        assert.strictEqual(isValidEmail(email), true, `Should be valid: ${email}`);
        const result = validateRsvpForm({
          guestName: "سارة محمود",
          guestEmail: email,
        });
        assert.strictEqual(result.isValid, true);
        assert.deepStrictEqual(result.errors, {});
      }
    });
  });

  describe("3. Mandatory Name Enforcement", () => {
    it("should reject empty or whitespace guestName", () => {
      const result = validateRsvpForm({
        guestName: "",
        guestEmail: "valid@example.com",
      });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.guestName);

      const resultWhitespace = validateRsvpForm({
        guestName: "   ",
        guestEmail: "valid@example.com",
      });
      assert.strictEqual(resultWhitespace.isValid, false);
      assert.ok(resultWhitespace.errors.guestName);
    });

    it("should accept valid guestName", () => {
      const result = validateRsvpForm({
        guestName: "معالي يوسف الغامدي",
        guestEmail: "yousef.ghamdi@example.com",
      });
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.guestName, undefined);
    });
  });

  describe("4. Companions Count Bounds & Validation", () => {
    it("should accept zero companions", () => {
      const result = validateRsvpForm({
        guestName: "أحمد شوقي",
        guestEmail: "ahmed@example.com",
        companionsCount: 0,
      });
      assert.strictEqual(result.isValid, true);
    });

    it("should accept positive companions count", () => {
      const result = validateRsvpForm({
        guestName: "أحمد شوقي",
        guestEmail: "ahmed@example.com",
        companionsCount: 2,
      });
      assert.strictEqual(result.isValid, true);
    });

    it("should reject negative companions count", () => {
      const result = validateRsvpForm({
        guestName: "أحمد شوقي",
        guestEmail: "ahmed@example.com",
        companionsCount: -2,
      });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.companionsCount);
    });
  });

  describe("5. Dynamic Schema Custom Field Validation", () => {
    const customSchema: DynamicFormField[] = [
      ...DEFAULT_DYNAMIC_SCHEMA,
      {
        id: "f-vip-code",
        name: "vipCode",
        label: "كود الطاولة المخصصة · VIP Table Code",
        type: "text",
        required: true,
      },
    ];

    it("should reject when required custom field is missing", () => {
      const result = validateRsvpForm(
        {
          guestName: "منى خالد",
          guestEmail: "mona@example.com",
        },
        customSchema
      );
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.vipCode);
    });

    it("should pass when required custom field is supplied", () => {
      const result = validateRsvpForm(
        {
          guestName: "منى خالد",
          guestEmail: "mona@example.com",
          vipCode: "VIP-GOLD-77",
        },
        customSchema
      );
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.vipCode, undefined);
    });
  });

  describe("6. Pass Token Generation", () => {
    it("should generate token with expected INV-PASS prefix and alphanumeric segments", () => {
      const token = generatePassToken();
      assert.match(token, /^INV-PASS-[A-Z0-9]{4}-[A-Z0-9]+$/);
    });

    it("should generate distinct tokens on consecutive calls", () => {
      const token1 = generatePassToken();
      const token2 = generatePassToken();
      assert.notStrictEqual(token1, token2);
    });
  });

  describe("7. QR Code Image URL Construction", () => {
    it("should generate Appwrite Avatars QR endpoint when endpoint and project configured", () => {
      const data = "http://localhost:3003?pass=rsvp-123&token=INV-PASS-7701";
      const url = buildQrCodeImageUrl(data, 240, {
        endpoint: "https://cloud.appwrite.io/v1",
        project: "asar-project",
      });

      assert.ok(url.startsWith("https://cloud.appwrite.io/v1/avatars/qr"));
      assert.ok(url.includes("project=asar-project"));
      assert.ok(url.includes("size=240"));
      assert.ok(url.includes(encodeURIComponent(data)));
    });

    it("should generate public SVG/PNG QR with maroon and white colors when Appwrite offline", () => {
      const data = "http://localhost:3003?pass=rsvp-123&token=INV-PASS-7701";
      const url = buildQrCodeImageUrl(data, 240, {
        color: "#6B1D28",
        bgColor: "#FFFFFF",
      });

      assert.ok(url.startsWith("https://api.qrserver.com/v1/create-qr-code/"));
      assert.ok(url.includes("color=6B1D28"));
      assert.ok(url.includes("bgcolor=FFFFFF"));
      assert.ok(url.includes(encodeURIComponent(data)));
    });
  });

  describe("8. Venue Gate Scanner Check-in Verification Logic", () => {
    const verifiedRsvp: InvitationRsvpDocument = {
      $id: "rsvp-checkin-test",
      id: "rsvp-checkin-test",
      invitationId: "omar-and-layla",
      guestName: "د. هاني عازر",
      guestEmail: "hani.azer@example.com",
      companionsCount: 1,
      dynamicResponsesJson: JSON.stringify({}),
      status: "approved",
      passToken: "INV-PASS-VIP-9001",
      isCheckedInAtVenue: false,
    };

    function simulateCheckIn(
      rsvp: InvitationRsvpDocument,
      scannedToken: string
    ): { success: boolean; isDuplicate: boolean; updatedRsvp?: InvitationRsvpDocument } {
      if (rsvp.passToken !== scannedToken) {
        return { success: false, isDuplicate: false };
      }
      if (rsvp.isCheckedInAtVenue) {
        return { success: false, isDuplicate: true };
      }
      return {
        success: true,
        isDuplicate: false,
        updatedRsvp: {
          ...rsvp,
          isCheckedInAtVenue: true,
          checkedInAt: new Date().toISOString(),
        },
      };
    }

    it("should permit entry on valid first-time token scan", () => {
      const result = simulateCheckIn(verifiedRsvp, "INV-PASS-VIP-9001");
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.isDuplicate, false);
      assert.strictEqual(result.updatedRsvp?.isCheckedInAtVenue, true);
      assert.ok(result.updatedRsvp?.checkedInAt);
    });

    it("should flag duplicate check-in when same token is scanned again", () => {
      const firstScan = simulateCheckIn(verifiedRsvp, "INV-PASS-VIP-9001");
      assert.ok(firstScan.updatedRsvp);

      const secondScan = simulateCheckIn(firstScan.updatedRsvp, "INV-PASS-VIP-9001");
      assert.strictEqual(secondScan.success, false);
      assert.strictEqual(secondScan.isDuplicate, true);
    });

    it("should reject forged or mismatched pass tokens", () => {
      const forgedScan = simulateCheckIn(verifiedRsvp, "INV-PASS-FORGED-000");
      assert.strictEqual(forgedScan.success, false);
      assert.strictEqual(forgedScan.isDuplicate, false);
    });
  });
});
