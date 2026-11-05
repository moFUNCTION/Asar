// =============================================================
// ASAR E2E Test Suite — Tier 1: Feature Coverage (Isolation)
// Suite: Serverless Cloud Functions (Features 3, 4, 5, 6)
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  executeGenerateVipPass,
  evaluateProcessRsvpActionContract,
  createMockOpenRuntimesContext,
} from "../helpers/e2eTestHarness.ts";

describe("Tier 1: Feature 3 — process-rsvp-action Build Config Fix", () => {
  const configPath = path.resolve(process.cwd(), "appwrite/appwrite.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const fnConfig = config.functions.find((f: any) => f.$id === "process-rsvp-action");

  it("F3-01: appwrite.config.json defines process-rsvp-action with runtime node-22", () => {
    assert.ok(fnConfig, "process-rsvp-action function must exist in appwrite.config.json");
    assert.equal(fnConfig.runtime, "node-22");
  });

  it("F3-02: Entrypoint is configured as src/main.js", () => {
    assert.equal(fnConfig.entrypoint, "src/main.js");
    assert.equal(fnConfig.path, "functions/process-rsvp-action");
  });

  it("F3-03: Execute permissions strictly require team:admins and users", () => {
    assert.ok(Array.isArray(fnConfig.execute));
    assert.ok(fnConfig.execute.includes("team:admins"));
    assert.ok(fnConfig.execute.includes("users"));
  });

  it("F3-04: functions/process-rsvp-action/package.json specifies node-appwrite dependency", () => {
    const fnPkgPath = path.resolve(process.cwd(), "appwrite/functions/process-rsvp-action/package.json");
    assert.ok(fs.existsSync(fnPkgPath));
    const fnPkg = JSON.parse(fs.readFileSync(fnPkgPath, "utf-8"));
    assert.ok(fnPkg.dependencies["node-appwrite"]);
  });

  it("F3-05: Function timeout and hardware specification adhere to SLA limits", () => {
    assert.ok(fnConfig.timeout <= 30, "Timeout must be <= 30s");
    assert.equal(fnConfig.enabled, true);
    assert.equal(fnConfig.logging, true);
  });
});

describe("Tier 1: Feature 4 — process-rsvp-action Handler Logic & Security", () => {
  it("F4-01: Action 'approve' transitions RSVP status to 'approved' with HTTP 200", async () => {
    const mockDb = new Map<string, any>([
      ["rsvp_101", { guestEmail: "lina@example.com", guestName: "لينا سعيد", companionsCount: 1, status: "pending" }],
    ]);

    const result = await evaluateProcessRsvpActionContract(
      { rsvpId: "rsvp_101", action: "approve" },
      mockDb
    );

    assert.equal(result.statusCode, 200);
    assert.equal(result.data.success, true);
    assert.equal(result.data.action, "approve");
    assert.equal(result.data.status, "approved");
    assert.equal(mockDb.get("rsvp_101").status, "approved");
  });

  it("F4-02: Approval generates pass token conforming to VIP-XXXX-YYYY format", async () => {
    const result = await evaluateProcessRsvpActionContract({
      rsvpId: "rsvp_format_check",
      action: "approve",
    });

    assert.equal(result.statusCode, 200);
    const token = result.data.passToken;
    assert.ok(token, "Pass token must be returned");
    assert.match(token, /^VIP-[A-Z0-9]{4}-[A-Z0-9]{8}$/);
  });

  it("F4-03: Approval produces valid checkin qrCodeUrl pointing to asar.me", async () => {
    const result = await evaluateProcessRsvpActionContract({
      rsvpId: "rsvp_qr_check",
      action: "approve",
    });

    assert.equal(result.statusCode, 200);
    const qrUrl = result.data.qrCodeUrl;
    assert.ok(qrUrl.startsWith("https://asar.me/checkin?"));
    assert.ok(qrUrl.includes(`token=${result.data.passToken}`));
    assert.ok(qrUrl.includes("rsvp=rsvp_qr_check"));
  });

  it("F4-04: Action 'decline' transitions RSVP status to 'declined' with reason", async () => {
    const mockDb = new Map<string, any>([
      ["rsvp_202", { guestEmail: "tareq@example.com", guestName: "طارق سليم", companionsCount: 0, status: "pending" }],
    ]);

    const result = await evaluateProcessRsvpActionContract(
      { rsvpId: "rsvp_202", action: "decline", rejectionReason: "Venue full capacity reached" },
      mockDb
    );

    assert.equal(result.statusCode, 200);
    assert.equal(result.data.success, true);
    assert.equal(result.data.status, "declined");
    assert.equal(result.data.rejectionReason, "Venue full capacity reached");
    assert.equal(mockDb.get("rsvp_202").status, "declined");
  });

  it("F4-05: Missing rsvpId or action returns HTTP 400 validation error", async () => {
    const missingAction = await evaluateProcessRsvpActionContract({ rsvpId: "rsvp_err" });
    assert.equal(missingAction.statusCode, 400);
    assert.equal(missingAction.data.success, false);

    const missingRsvp = await evaluateProcessRsvpActionContract({ action: "approve" });
    assert.equal(missingRsvp.statusCode, 400);
    assert.equal(missingRsvp.data.success, false);
  });
});

describe("Tier 1: Feature 5 — generate-vip-pass HMAC Signing Verification", () => {
  it("F5-01: Generates digital VIP pass with ASAR-PASS-XXXX-YYYY token structure", async () => {
    const result = await executeGenerateVipPass({
      rsvpId: "rsvp_pass_001",
      guestName: "سارة المنصوري",
      companionsCount: 2,
      invitationSlug: "omar-and-layla",
      eventTitle: "زفاف عمر وليلى",
    });

    assert.equal(result.statusCode, 200);
    assert.equal(result.data.success, true);
    const pass = result.data.pass;
    assert.ok(pass);
    assert.match(pass.token, /^ASAR-PASS-[A-F0-9]{4}-[A-F0-9]{8}$/);
    assert.equal(pass.guestName, "سارة المنصوري");
  });

  it("F5-02: Verifies tamper-evident HMAC-SHA256 signature is exactly 16 hex characters", async () => {
    const result = await executeGenerateVipPass({
      rsvpId: "rsvp_pass_sig",
      guestName: "كريم يوسف",
      companionsCount: 0,
    });

    assert.equal(result.statusCode, 200);
    const signature = result.data.pass.signature;
    assert.match(signature, /^[a-f0-9]{16}$/);
  });

  it("F5-03: Verifies checkInUrl contains both token and sig query parameters", async () => {
    const result = await executeGenerateVipPass({
      rsvpId: "rsvp_url_test",
      guestName: "مريم عبد الله",
      invitationSlug: "royal-gala",
    });

    assert.equal(result.statusCode, 200);
    const checkInUrl = result.data.pass.checkInUrl;
    assert.ok(checkInUrl.startsWith("https://royal-gala.asar.me/checkin?"));
    assert.ok(checkInUrl.includes(`token=${result.data.pass.token}`));
    assert.ok(checkInUrl.includes(`sig=${result.data.pass.signature}`));
  });

  it("F5-04: Computes totalGuests correctly as companionsCount + 1", async () => {
    const result = await executeGenerateVipPass({
      rsvpId: "rsvp_party",
      guestName: "عائلة آل نهيان",
      companionsCount: 4,
    });

    assert.equal(result.statusCode, 200);
    assert.equal(result.data.pass.companionsCount, 4);
    assert.equal(result.data.pass.totalGuests, 5);
  });

  it("F5-05: Missing guestName returns HTTP 400 error", async () => {
    const result = await executeGenerateVipPass({
      rsvpId: "rsvp_no_name",
    });

    assert.equal(result.statusCode, 400);
    assert.equal(result.data.success, false);
    assert.ok(result.data.error.includes("guestName"));
  });
});

describe("Tier 1: Feature 6 — Cloud Functions Mock & Live Verification", () => {
  it("F6-01: Mock context handles stringified JSON payloads seamlessly", async () => {
    const rawJsonString = JSON.stringify({
      rsvpId: "rsvp_json_str",
      guestName: "هشام مصطفى",
      companionsCount: 1,
    });

    const result = await executeGenerateVipPass(rawJsonString);
    assert.equal(result.statusCode, 200);
    assert.equal(result.data.pass.guestName, "هشام مصطفى");
  });

  it("F6-02: OpenRuntimes logger outputs informative execution messages", async () => {
    const result = await executeGenerateVipPass({
      rsvpId: "rsvp_logger",
      guestName: "سلمى فؤاد",
      companionsCount: 1,
    });

    assert.equal(result.statusCode, 200);
    assert.ok(result.logs.length > 0);
    assert.ok(result.logs.some((l) => l.includes("Generated digital pass")));
  });

  it("F6-03: Verifies non-existent RSVP in database returns HTTP 404", async () => {
    const mockDb = new Map<string, any>(); // empty db
    const result = await evaluateProcessRsvpActionContract(
      { rsvpId: "non_existent_rsvp_id", action: "approve" },
      mockDb
    );

    assert.equal(result.statusCode, 404);
    assert.equal(result.data.success, false);
  });

  it("F6-04: Responds with HTTP 400 on unexpected action values", async () => {
    const result = await evaluateProcessRsvpActionContract({
      rsvpId: "rsvp_bad_action",
      action: "maybe_later",
    });

    assert.equal(result.statusCode, 400);
    assert.equal(result.data.success, false);
    assert.ok(result.data.error.includes("Invalid action"));
  });

  it("F6-05: Generates independent unique passes across consecutive invocations", async () => {
    const res1 = await executeGenerateVipPass({ rsvpId: "rsvp_1", guestName: "ضيف 1" });
    const res2 = await executeGenerateVipPass({ rsvpId: "rsvp_2", guestName: "ضيف 2" });

    assert.equal(res1.statusCode, 200);
    assert.equal(res2.statusCode, 200);
    assert.notEqual(res1.data.pass.token, res2.data.pass.token);
    assert.notEqual(res1.data.pass.signature, res2.data.pass.signature);
  });
});
