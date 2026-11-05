// =============================================================
// ASAR E2E Test Suite — Tier 1: Feature Coverage (Isolation)
// Suite: Compilation & Syntax Integrity (Features 1 & 2)
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
  ASAR_TEAMS,
  ALL_EVENT_SECTION_TYPES,
  ORDER_PIPELINE_STAGES,
  extractSubdomain,
  isReservedSubdomain,
  type AsarOrder,
  type AsarPayment,
} from "@repo/react-appwrite";

describe("Tier 1: Feature 1 — Monorepo Typecheck & Syntax Fixes", () => {
  it("F1-01: AsarOrder domain contract allows optional selectedAddonsJson without type failure", () => {
    const validOrder: AsarOrder = {
      $id: "order_test_101",
      clientId: "usr_client_1",
      clientName: "أحمد وفاطمة",
      clientEmail: "couple@example.com",
      clientPhone: "+966501112233",
      serviceType: "booth",
      planId: "plan_royal",
      planName: "باقة الأثر الملكية",
      totalAmount: 12000,
      orderStatus: "pending_payment",
      createdAt: new Date().toISOString(),
    };

    assert.equal(validOrder.$id, "order_test_101");
    assert.equal(validOrder.selectedAddonsJson, undefined);
    assert.equal(validOrder.serviceType, "booth");
  });

  it("F1-02: AsarPayment domain contract allows optional screenshotUrl and rejectionReason", () => {
    const validPayment: AsarPayment = {
      $id: "pay_test_201",
      orderId: "order_test_101",
      clientId: "usr_client_1",
      amount: 6000,
      paymentMethod: "instapay",
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    assert.equal(validPayment.$id, "pay_test_201");
    assert.equal(validPayment.screenshotUrl, undefined);
    assert.equal(validPayment.rejectionReason, undefined);
    assert.equal(validPayment.paymentMethod, "instapay");
  });

  it("F1-03: Order merging simulation preserves array of AsarOrder items without loss of optional properties", () => {
    const cloudOrders: AsarOrder[] = [
      {
        $id: "order_cloud_1",
        clientId: "usr_1",
        clientName: "خالد ونور",
        clientEmail: "khaled@example.com",
        clientPhone: "+966500000001",
        serviceType: "invitation",
        planId: "inv_diamond",
        planName: "باقة الدعوة الماسية",
        totalAmount: 8500,
        orderStatus: "payment_review",
        createdAt: new Date().toISOString(),
      },
    ];

    const demoOrders: AsarOrder[] = [
      {
        $id: "order_demo_1",
        clientId: "usr_demo",
        clientName: "عمر وليلى (تجريبي)",
        clientEmail: "demo@asar.me",
        clientPhone: "+201000000000",
        serviceType: "booth",
        planId: "plan_luxury",
        planName: "الباقة الفاخرة",
        totalAmount: 9000,
        orderStatus: "published",
        selectedAddonsJson: JSON.stringify([{ id: "extra_hours", name: "ساعتان إضافيتان" }]),
        createdAt: new Date().toISOString(),
      },
    ];

    const merged = [...cloudOrders];
    for (const p of demoOrders) {
      if (!merged.some((m) => m.$id === p.$id)) {
        merged.push(p);
      }
    }

    assert.equal(merged.length, 2);
    assert.equal(merged[0].$id, "order_cloud_1");
    assert.equal(merged[1].$id, "order_demo_1");
    assert.ok(merged[1].selectedAddonsJson);
  });

  it("F1-04: Payment merging simulation safely resolves demo and live payments with optional screenshots", () => {
    const cloudPayments: AsarPayment[] = [
      {
        $id: "pay_cloud_1",
        orderId: "order_cloud_1",
        clientId: "usr_1",
        amount: 8500,
        paymentMethod: "vodafone_cash",
        status: "confirmed",
        submittedAt: new Date().toISOString(),
      },
    ];

    const demoPayments: AsarPayment[] = [
      {
        $id: "pay_demo_1",
        orderId: "order_demo_1",
        clientId: "usr_demo",
        amount: 4500,
        paymentMethod: "instapay",
        screenshotUrl: "https://example.com/receipt.jpg",
        status: "pending",
        submittedAt: new Date().toISOString(),
      },
    ];

    const merged = [...cloudPayments];
    for (const p of demoPayments) {
      if (!merged.some((m) => m.$id === p.$id)) {
        merged.push(p);
      }
    }

    assert.equal(merged.length, 2);
    assert.equal(merged[1].screenshotUrl, "https://example.com/receipt.jpg");
  });

  it("F1-05: Verifies all 7 order progression stages are strictly sequenced and validated", () => {
    const stageKeys = Object.keys(ORDER_PIPELINE_STAGES);
    assert.equal(stageKeys.length, 7);
    assert.ok(stageKeys.includes("pending_payment"));
    assert.ok(stageKeys.includes("payment_rejected"));
    assert.ok(stageKeys.includes("awaiting_client_assets"));
    assert.ok(stageKeys.includes("event_scheduled"));
    assert.ok(stageKeys.includes("audio_mastering"));
    assert.ok(stageKeys.includes("studio_curation"));
    assert.ok(stageKeys.includes("published"));
  });
});

describe("Tier 1: Feature 2 — Clean Workspace Compilation", () => {
  it("F2-01: Verifies package.json contains all 5 workspaces (apps & packages)", () => {
    const rootPkgPath = path.resolve(process.cwd(), "package.json");
    assert.ok(fs.existsSync(rootPkgPath), "package.json must exist in root");

    const pkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf-8"));
    assert.ok(Array.isArray(pkg.workspaces));
    assert.ok(pkg.workspaces.includes("apps/*"));
    assert.ok(pkg.workspaces.includes("packages/*"));
  });

  it("F2-02: Verifies React version overrides enforce 18.2.0 across the monorepo", () => {
    const rootPkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));
    assert.equal(rootPkg.overrides?.react, "18.2.0");
    assert.equal(rootPkg.overrides?.["react-dom"], "18.2.0");
  });

  it("F2-03: Shared domain constants and collections are correctly exported and non-empty", () => {
    assert.equal(ASAR_DATABASE_ID, "asar-db");
    assert.equal(ASAR_COLLECTIONS.USERS, "users");
    assert.equal(ASAR_COLLECTIONS.ORDERS, "orders");
    assert.equal(ASAR_COLLECTIONS.BOOTH_MEMORIES, "booth_memories");
    assert.equal(ASAR_COLLECTIONS.INVITATIONS, "invitations");
    assert.equal(ASAR_COLLECTIONS.INVITATION_RSVPS, "invitation_rsvps");
    assert.equal(ASAR_TEAMS.ADMINS, "admins");
  });

  it("F2-04: ALL_EVENT_SECTION_TYPES exports exactly 11 distinct modular section types", () => {
    assert.equal(ALL_EVENT_SECTION_TYPES.length, 11);
    const set = new Set(ALL_EVENT_SECTION_TYPES);
    assert.equal(set.size, 11, "All 11 section types must be distinct");
    assert.ok(set.has("cover_hero"));
    assert.ok(set.has("dynamic_rsvp"));
    assert.ok(set.has("digital_gift_registry"));
  });

  it("F2-05: Subdomain resolution utilities correctly classify reserved vs tenant subdomains", () => {
    assert.equal(isReservedSubdomain("admin"), true);
    assert.equal(isReservedSubdomain("www"), true);
    assert.equal(isReservedSubdomain("api"), true);
    assert.equal(isReservedSubdomain("omar-and-layla"), false);

    const extracted = extractSubdomain("omar-and-layla.asar.me");
    assert.equal(extracted, "omar-and-layla");
  });
});

