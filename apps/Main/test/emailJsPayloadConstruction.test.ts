import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  buildQrCodeImageUrl,
  sendRsvpDecisionEmail,
} from "../../../packages/react-appwrite/src/AsarDomain/emailJsService.ts";
import type { InvitationRsvp } from "../../../packages/react-appwrite/src/AsarDomain/models.ts";

export interface CapacityStats {
  confirmedSeats: number;
  pendingSeats: number;
  declinedSeats: number;
  totalRequestedSeats: number;
  maxCapacity: number;
  percentage: number;
  remainingSeats: number;
  isNearCapacity: boolean;
  isAtCapacity: boolean;
  statusColor: "emerald" | "amber" | "maroon";
}

/**
 * Calculates seat allocation and capacity metrics based on guest submissions and max capacity.
 * Each guest reservation occupies (1 + companionsCount) seats.
 */
export function calculateCapacityStats(params: {
  rsvps: Partial<InvitationRsvp>[];
  maxCapacity?: number;
}): CapacityStats {
  const { rsvps, maxCapacity = 150 } = params;
  const safeCapacity = Math.max(1, maxCapacity);

  let confirmedSeats = 0;
  let pendingSeats = 0;
  let declinedSeats = 0;

  for (const rsvp of rsvps) {
    const companions = Math.max(0, Number(rsvp.companionsCount) || 0);
    const guestSeats = 1 + companions;

    if (rsvp.status === "approved") {
      confirmedSeats += guestSeats;
    } else if (rsvp.status === "declined") {
      declinedSeats += guestSeats;
    } else {
      pendingSeats += guestSeats;
    }
  }

  const totalRequestedSeats = confirmedSeats + pendingSeats + declinedSeats;
  const rawPercentage = (confirmedSeats / safeCapacity) * 100;
  const percentage = Math.round(rawPercentage);
  const remainingSeats = Math.max(0, safeCapacity - confirmedSeats);
  const isNearCapacity = percentage >= 80 && percentage < 100;
  const isAtCapacity = percentage >= 100;

  let statusColor: "emerald" | "amber" | "maroon" = "emerald";
  if (isAtCapacity) {
    statusColor = "maroon";
  } else if (isNearCapacity) {
    statusColor = "amber";
  }

  return {
    confirmedSeats,
    pendingSeats,
    declinedSeats,
    totalRequestedSeats,
    maxCapacity: safeCapacity,
    percentage,
    remainingSeats,
    isNearCapacity,
    isAtCapacity,
    statusColor,
  };
}

describe("ASAR Agent 10 — RSVP Capacity & EmailJS Payload Engine", () => {
  describe("Capacity Calculation & Thresholds", () => {
    test("calculates seats correctly for approved, pending, and declined guests", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Guest 1",
          status: "approved",
          companionsCount: 2, // 1 + 2 = 3 seats
        },
        {
          guestName: "Guest 2",
          status: "approved",
          companionsCount: 0, // 1 + 0 = 1 seat
        },
        {
          guestName: "Guest 3",
          status: "pending",
          companionsCount: 1, // 1 + 1 = 2 seats
        },
        {
          guestName: "Guest 4",
          status: "declined",
          companionsCount: 3, // 1 + 3 = 4 seats
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 100,
      });

      assert.equal(stats.confirmedSeats, 4, "Confirmed seats should be 3 + 1 = 4");
      assert.equal(stats.pendingSeats, 2, "Pending seats should be 2");
      assert.equal(stats.declinedSeats, 4, "Declined seats should be 4");
      assert.equal(stats.totalRequestedSeats, 10, "Total requested seats should be 10");
      assert.equal(stats.maxCapacity, 100);
      assert.equal(stats.percentage, 4, "4 / 100 = 4%");
      assert.equal(stats.remainingSeats, 96, "100 - 4 = 96 remaining seats");
      assert.equal(stats.isNearCapacity, false);
      assert.equal(stats.isAtCapacity, false);
      assert.equal(stats.statusColor, "emerald");
    });

    test("identifies approaching capacity (80% - 99%) as amber alert", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Group A",
          status: "approved",
          companionsCount: 84, // 1 + 84 = 85 seats
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 100,
      });

      assert.equal(stats.confirmedSeats, 85);
      assert.equal(stats.percentage, 85);
      assert.equal(stats.remainingSeats, 15);
      assert.equal(stats.isNearCapacity, true, "85% should trigger isNearCapacity");
      assert.equal(stats.isAtCapacity, false);
      assert.equal(stats.statusColor, "amber");
    });

    test("identifies capacity reached (>= 100%) as maroon alert", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Group Full",
          status: "approved",
          companionsCount: 149, // 1 + 149 = 150 seats
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 150,
      });

      assert.equal(stats.confirmedSeats, 150);
      assert.equal(stats.percentage, 100);
      assert.equal(stats.remainingSeats, 0);
      assert.equal(stats.isNearCapacity, false);
      assert.equal(stats.isAtCapacity, true, "100% should trigger isAtCapacity");
      assert.equal(stats.statusColor, "maroon");
    });

    test("handles overcapacity gracefully with 0 remaining seats floor", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Group Over",
          status: "approved",
          companionsCount: 159, // 1 + 159 = 160 seats (exceeding 150)
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 150,
      });

      assert.equal(stats.confirmedSeats, 160);
      assert.equal(stats.percentage, 107);
      assert.equal(stats.remainingSeats, 0, "Remaining seats cannot be negative");
      assert.equal(stats.isAtCapacity, true);
      assert.equal(stats.statusColor, "maroon");
    });

    test("normalizes negative companions to zero", () => {
      const mockRsvps: Partial<InvitationRsvp>[] = [
        {
          guestName: "Test Negative",
          status: "approved",
          companionsCount: -5,
        },
      ];

      const stats = calculateCapacityStats({
        rsvps: mockRsvps,
        maxCapacity: 50,
      });

      assert.equal(stats.confirmedSeats, 1, "Negative companions should normalize to 0 (1 seat total)");
    });

    test("handles empty list of RSVPs gracefully", () => {
      const stats = calculateCapacityStats({
        rsvps: [],
        maxCapacity: 200,
      });

      assert.equal(stats.confirmedSeats, 0);
      assert.equal(stats.pendingSeats, 0);
      assert.equal(stats.declinedSeats, 0);
      assert.equal(stats.percentage, 0);
      assert.equal(stats.remainingSeats, 200);
      assert.equal(stats.statusColor, "emerald");
    });
  });

  describe("QR Code URL Generation", () => {
    test("builds high-contrast luxury fallback QR image URL with ASAR brand colors", () => {
      const testUrl = "https://asar.audio/pass/rsvp-123?token=INV-PASS-XYZ";
      const qrUrl = buildQrCodeImageUrl(testUrl, 400);

      assert.ok(qrUrl.includes("api.qrserver.com/v1/create-qr-code"));
      assert.ok(qrUrl.includes("color=6B1D28"), "Must use Royal Maroon #6B1D28");
      assert.ok(qrUrl.includes("bgcolor=FBF7F2"), "Must use Warm Alabaster #FBF7F2");
      assert.ok(qrUrl.includes("400x400"));
      assert.ok(qrUrl.includes(encodeURIComponent(testUrl)));
    });

    test("builds Appwrite Avatars QR endpoint URL when endpoint and projectId are configured", () => {
      const testUrl = "https://asar.audio/pass/rsvp-abc";
      const qrUrl = buildQrCodeImageUrl(
        testUrl,
        500,
        "https://cloud.appwrite.io/v1",
        "asar-project-prod"
      );

      assert.ok(qrUrl.startsWith("https://cloud.appwrite.io/v1/avatars/qr"));
      assert.ok(qrUrl.includes("size=500"));
      assert.ok(qrUrl.includes("project=asar-project-prod"));
      assert.ok(qrUrl.includes(encodeURIComponent(testUrl)));
    });
  });

  describe("EmailJS Payload Construction & Automated Dispatch", () => {
    test("constructs valid approved decision payload and runs in safe simulation mode", async () => {
      const result = await sendRsvpDecisionEmail({
        decision: "approved",
        toEmail: "karim.waly@example.com",
        toName: "Karim Waly",
        eventTitle: "The Wedding of Omar & Layla",
        eventDate: "14 August 2026",
        eventTime: "7:30 PM",
        venueName: "Four Seasons Alexandria",
        passToken: "INV-PASS-8942-X",
        rsvpId: "rsvp-123",
      });

      assert.equal(result.success, true);
      assert.equal(result.simulated, true, "Should simulate when live credentials missing");
      assert.ok(result.emailSubject.includes("The Wedding of Omar & Layla"));
      assert.ok(result.emailSubject.includes("تأكيد حضوركم"));
      assert.ok(result.qrCodeUrl !== undefined, "Approved decision must include qrCodeUrl");
      assert.ok(result.emailBodyPreview.includes("Karim Waly"));
      assert.ok(result.emailBodyPreview.includes("karim.waly@example.com"));
      assert.ok(result.emailBodyPreview.includes("Decision: APPROVED"));
      assert.ok(result.emailBodyPreview.includes("Four Seasons Alexandria"));
    });

    test("constructs valid declined decision payload with polite venue capacity constraint message", async () => {
      const result = await sendRsvpDecisionEmail({
        decision: "declined",
        toEmail: "ahmed.selim@example.com",
        toName: "Ahmed Selim",
        eventTitle: "The Wedding of Omar & Layla",
        eventDate: "14 August 2026",
        venueName: "Four Seasons Alexandria",
      });

      assert.equal(result.success, true);
      assert.equal(result.simulated, true);
      assert.ok(result.emailSubject.includes("The Wedding of Omar & Layla"));
      assert.equal(result.qrCodeUrl, undefined, "Declined decision must not attach QR code");
      assert.ok(result.emailBodyPreview.includes("Ahmed Selim"));
      assert.ok(result.emailBodyPreview.includes("Decision: DECLINED"));
      assert.ok(
        result.emailBodyPreview.includes("السعة الاستيعابية المتاحة بالقاعة"),
        "Must contain polite venue capacity constraint message"
      );
    });

    test("supports custom message override in payload", async () => {
      const customMessage = "نرحب بكم بكل سرور في مناسبتنا الخاصة!";
      const result = await sendRsvpDecisionEmail({
        decision: "approved",
        toEmail: "vip@example.com",
        toName: "VIP Guest",
        eventTitle: "Athar Leadership Gala",
        customMessage,
      });

      assert.equal(result.success, true);
      assert.ok(result.emailBodyPreview.includes(customMessage));
    });
  });
});
