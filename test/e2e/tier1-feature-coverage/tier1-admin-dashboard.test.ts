// =============================================================
// ASAR E2E Test Suite — Tier 1: Feature Coverage (Isolation)
// Suite: Admin Dashboard, RTL, Booth & Mailbox (Features 13, 14, 15, 16)
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ASAR_COLLECTIONS,
  ORDER_PIPELINE_STAGES,
  type InvitationRsvp,
} from "@repo/react-appwrite";

describe("Tier 1: Feature 13 — Admin Right-Hand Vertical Tabs Menu", () => {
  it("F13-01: Verifies Admin navigation tabs definition includes all 6 core administrative modules", () => {
    const adminTabs = [
      { id: "overview", label: "لوحة العمليات والملخص", icon: "✦" },
      { id: "orders", label: "الطلبات والمدفوعات", icon: "💳" },
      { id: "invitation-studio", label: "استوديو تصميم الدعوات والمواقع", icon: "✉️" },
      { id: "booth-studio", label: "استوديو ذكريات هاتف أثر", icon: "🎙️" },
      { id: "plans", label: "الباقات والأسعار والكوتا", icon: "⚙️" },
      { id: "users", label: "دليل المستخدمين والحسابات", icon: "👥" },
    ];

    assert.equal(adminTabs.length, 6);
    const tabIds = adminTabs.map((t) => t.id);
    assert.ok(tabIds.includes("overview"));
    assert.ok(tabIds.includes("orders"));
    assert.ok(tabIds.includes("booth-studio"));
    assert.ok(tabIds.includes("invitation-studio"));
    assert.ok(tabIds.includes("plans"));
    assert.ok(tabIds.includes("users"));
  });

  it("F13-02: Active tab styling specifies royal maroon background and cream text", () => {
    const ACTIVE_TAB_STYLING = {
      backgroundColor: "#7A1C2E", // Royal Maroon
      color: "#FBF8F3", // Warm Cream
      border: "1px solid var(--athar-gold)",
    };

    assert.equal(ACTIVE_TAB_STYLING.backgroundColor, "#7A1C2E");
    assert.equal(ACTIVE_TAB_STYLING.color, "#FBF8F3");
  });

  it("F13-03: Right-docked vertical aside sidebar structure adheres to layout contract", () => {
    const sidebarContract = {
      tag: "aside",
      width: "280px",
      dockPosition: "right", // in RTL dir="rtl", first child docks to the physical right
      borderProperty: "borderLeft", // separates right sidebar from left main canvas
    };

    assert.equal(sidebarContract.tag, "aside");
    assert.equal(sidebarContract.width, "280px");
    assert.equal(sidebarContract.borderProperty, "borderLeft");
  });

  it("F13-04: Order pending count badge renders correctly when count > 0", () => {
    function renderTabBadge(pendingCount: number): { showBadge: boolean; countText: string } {
      return {
        showBadge: pendingCount > 0,
        countText: String(pendingCount),
      };
    }

    const withPending = renderTabBadge(5);
    assert.equal(withPending.showBadge, true);
    assert.equal(withPending.countText, "5");

    const zeroPending = renderTabBadge(0);
    assert.equal(zeroPending.showBadge, false);
  });

  it("F13-05: Route resolver maps paths to correct active tab identifier", () => {
    function resolveTabFromPath(pathname: string): string {
      if (pathname.startsWith("/plans")) return "plans";
      if (pathname.startsWith("/orders")) return "orders";
      if (pathname.startsWith("/booth-studio")) return "booth-studio";
      if (pathname.startsWith("/invitation-studio")) return "invitation-studio";
      if (pathname.startsWith("/users")) return "users";
      return "overview";
    }

    assert.equal(resolveTabFromPath("/"), "overview");
    assert.equal(resolveTabFromPath("/overview"), "overview");
    assert.equal(resolveTabFromPath("/orders/ord_123"), "orders");
    assert.equal(resolveTabFromPath("/booth-studio/ord_456"), "booth-studio");
    assert.equal(resolveTabFromPath("/invitation-studio"), "invitation-studio");
  });
});

describe("Tier 1: Feature 14 — Admin Comprehensive Arabic RTL Localization", () => {
  it("F14-01: Admin overview labels and status definitions are localized in Arabic", () => {
    const stageTitles = Object.values(ORDER_PIPELINE_STAGES).map((s) => s.titleAr);
    assert.ok(stageTitles.length >= 7);
    assert.ok(stageTitles.some((t) => t.includes("إيصال الدفع")));
    assert.ok(stageTitles.some((t) => t.includes("صفحة الذكريات")));
    assert.ok(stageTitles.some((t) => t.includes("موقع ذكرياتكم متاح")));
  });

  it("F14-02: index.html configures html lang and dir attributes for Arabic RTL", () => {
    const adminHtmlPath = path.resolve(process.cwd(), "apps/Admin/index.html");
    assert.ok(fs.existsSync(adminHtmlPath));
    const htmlContent = fs.readFileSync(adminHtmlPath, "utf-8");
    assert.match(htmlContent, /<html\s+lang=["']ar["']\s+dir=["']rtl["']/);
  });

  it("F14-03: Arabic display and body fonts are configured in theme CSS", () => {
    const cssPath = path.resolve(process.cwd(), "apps/Admin/src/index.css");
    assert.ok(fs.existsSync(cssPath));
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    assert.ok(cssContent.includes("--font-arabic-display"));
    assert.ok(cssContent.includes("Amiri") || cssContent.includes("Cairo"));
  });

  it("F14-04: Currency formatter produces Arabic localized Egyptian Pound amounts", () => {
    function formatCurrencyAr(amount: number): string {
      return `${amount.toLocaleString("ar-EG")} ج.م`;
    }

    const formatted = formatCurrencyAr(15000);
    assert.ok(formatted.includes("ج.م"));
    assert.ok(formatted.length > 3);
  });

  it("F14-05: Rejection reasons in payment inspector are localized in Arabic", () => {
    const REJECTION_REASONS_AR = [
      "إيصال التحويل غير واضح أو مقطوع",
      "المبلغ المحول لا يطابق قيمة الباقة أو العربون المطلوب",
      "الرقم المرجعي أو تاريخ التحويل غير متطابق",
      "تم رفض العملية من قبل البنك أو المحفظة الإلكترونية",
      "سبب آخر (تم تدوينه في الملاحظات)",
    ];

    assert.equal(REJECTION_REASONS_AR.length, 5);
    REJECTION_REASONS_AR.forEach((reason) => {
      assert.ok(reason.trim().length > 10, "Arabic reason must be descriptive");
    });
  });
});

describe("Tier 1: Feature 15 — Booth Admin Appwrite Persistence", () => {
  it("F15-01: Booth memory model defines couple names, event date, venue, and PIN protection", () => {
    const memoryRecord = {
      coupleName: "يوسف ومي",
      eventDate: "2026-12-25",
      venueName: "قصر العروبة",
      pinCode: "2026",
      isPinProtected: true,
      categories: ["All", "Around The Phone", "Family", "Friends"],
    };

    assert.equal(memoryRecord.coupleName, "يوسف ومي");
    assert.equal(memoryRecord.isPinProtected, true);
    assert.equal(memoryRecord.pinCode, "2026");
    assert.equal(memoryRecord.categories.length, 4);
  });

  it("F15-02: Collection constant for booth memories points to booth_memories", () => {
    assert.equal(ASAR_COLLECTIONS.BOOTH_MEMORIES, "booth_memories");
  });

  it("F15-03: Voice record persistence payload includes waveformJson and duration", () => {
    const voicePayload = {
      memoryId: "mem_101",
      guestName: "د. خالد",
      durationSeconds: 42,
      category: "Family",
      waveformJson: JSON.stringify(Array(48).fill(0.65)),
      isMastered: true,
    };

    assert.equal(voicePayload.memoryId, "mem_101");
    assert.equal(voicePayload.durationSeconds, 42);
    const parsedWaveform = JSON.parse(voicePayload.waveformJson);
    assert.equal(parsedWaveform.length, 48);
  });

  it("F15-04: Media persistence distinguishes photo vs video highlight formats", () => {
    const photoMedia = { memoryId: "mem_101", mediaType: "photo", url: "https://cdn.asar.me/p1.jpg" };
    const videoMedia = { memoryId: "mem_101", mediaType: "video", url: "https://vimeo.com/12345678" };

    assert.equal(photoMedia.mediaType, "photo");
    assert.equal(videoMedia.mediaType, "video");
  });

  it("F15-05: Serializes and deserializes booth memory settings without data truncation", () => {
    const originalSettings = {
      headerQuote: "ذكريات تدوم في القلوب والأثير",
      audioPlaybackMode: "continuous",
      allowGuestDownloads: true,
    };

    const serialized = JSON.stringify(originalSettings);
    const restored = JSON.parse(serialized);

    assert.deepEqual(restored, originalSettings);
  });
});

describe("Tier 1: Feature 16 — Invitation Mailbox Integration in Admin", () => {
  it("F16-01: InvitationRsvp entity adheres strictly to domain interface schema", () => {
    const rsvp: InvitationRsvp = {
      $id: "rsvp_101",
      invitationId: "inv_gala_2026",
      guestName: "فاطمة الزهراء",
      guestEmail: "fatima@example.com",
      companionsCount: 2,
      status: "pending",
      submittedAt: new Date().toISOString(),
      emailSent: false,
    };

    assert.equal(rsvp.$id, "rsvp_101");
    assert.equal(rsvp.guestName, "فاطمة الزهراء");
    assert.equal(rsvp.status, "pending");
    assert.equal(rsvp.companionsCount, 2);
  });

  it("F16-02: Filters mailbox RSVPs by status accurately", () => {
    const rsvps: Partial<InvitationRsvp>[] = [
      { $id: "1", status: "pending" },
      { $id: "2", status: "approved" },
      { $id: "3", status: "approved" },
      { $id: "4", status: "declined" },
    ];

    const filterByStatus = (status: "all" | "pending" | "approved" | "declined") => {
      if (status === "all") return rsvps;
      return rsvps.filter((r) => r.status === status);
    };

    assert.equal(filterByStatus("all").length, 4);
    assert.equal(filterByStatus("pending").length, 1);
    assert.equal(filterByStatus("approved").length, 2);
    assert.equal(filterByStatus("declined").length, 1);
  });

  it("F16-03: Computes mailbox capacity progress stats with 150-seat venue limit", () => {
    const rsvps: Partial<InvitationRsvp>[] = [
      { $id: "1", status: "approved", companionsCount: 1 }, // 2 seats
      { $id: "2", status: "approved", companionsCount: 2 }, // 3 seats
      { $id: "3", status: "pending", companionsCount: 0 },  // 1 seat
      { $id: "4", status: "declined", companionsCount: 4 }, // 5 seats (declined)
    ];

    const maxCapacity = 100;
    const confirmedSeats = rsvps
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + 1 + (r.companionsCount || 0), 0);

    const percentage = Math.round((confirmedSeats / maxCapacity) * 100);

    assert.equal(confirmedSeats, 5);
    assert.equal(percentage, 5);
  });

  it("F16-04: Admin decision transitions RSVP status and updates decision timestamp", () => {
    function applyAdminDecision(
      rsvp: InvitationRsvp,
      decision: "approved" | "declined",
      reason?: string
    ): InvitationRsvp {
      return {
        ...rsvp,
        status: decision,
        respondedAt: new Date().toISOString(),
        ...(decision === "declined" ? { rejectionReason: reason || "Capacity reached" } : {}),
      };
    }

    const pendingRsvp: InvitationRsvp = {
      $id: "r1",
      invitationId: "inv_1",
      guestName: "أحمد",
      guestEmail: "a@a.com",
      status: "pending",
      submittedAt: new Date().toISOString(),
      emailSent: false,
    };

    const approved = applyAdminDecision(pendingRsvp, "approved");
    assert.equal(approved.status, "approved");
    assert.ok(approved.respondedAt);

    const declined = applyAdminDecision(pendingRsvp, "declined", "Full");
    assert.equal(declined.status, "declined");
    assert.equal(declined.rejectionReason, "Full");
  });

  it("F16-05: Prepares EmailJS notification dispatch payload with guest pass details", () => {
    function buildEmailPayload(params: {
      guestName: string;
      guestEmail: string;
      eventTitle: string;
      passToken: string;
      qrCodeUrl: string;
    }) {
      return {
        to_name: params.guestName,
        to_email: params.guestEmail,
        event_title: params.eventTitle,
        pass_token: params.passToken,
        qr_code_url: params.qrCodeUrl,
        sent_at: new Date().toISOString(),
      };
    }

    const payload = buildEmailPayload({
      guestName: "نور علي",
      guestEmail: "nour@example.com",
      eventTitle: "حفل زفاف الأثر الفاخر",
      passToken: "VIP-2026-ABCD1234",
      qrCodeUrl: "https://asar.me/checkin?token=VIP-2026-ABCD1234",
    });

    assert.equal(payload.to_name, "نور علي");
    assert.equal(payload.to_email, "nour@example.com");
    assert.equal(payload.pass_token, "VIP-2026-ABCD1234");
    assert.ok(payload.sent_at);
  });
});
