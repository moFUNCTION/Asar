// =============================================================
// ASAR (Athar / أثر) — Core Domain Unit Test Suite
// Verified with: node --experimental-strip-types --test
// =============================================================

import test from "node:test";
import assert from "node:assert/strict";

import {
  ASAR_DATABASE_ID,
  ASAR_COLLECTIONS,
  ASAR_BUCKETS,
} from "../src/AsarDomain/collections.ts";

import {
  safeJsonParse,
  parsePlanFeatures,
  parsePlanLimits,
  parsePlanAddons,
  parseClientAssets,
  parseWaveformPeaks,
  parseCategories,
  parseFormSchema,
  parseUserProfile,
  DEFAULT_PLAN_LIMITS,
} from "../src/AsarDomain/models.ts";

import {
  ORDER_PIPELINE_STAGES,
  ORDER_STAGE_SEQUENCE,
  isValidTransition,
  getNextValidStates,
  getOrderStatusColor,
  getOrderStatusLabel,
  getOrderStageProgress,
} from "../src/AsarDomain/orderPipeline.ts";

import {
  formatDuration,
  generateDeterministicWaveform,
  generateWaveformFromPCM,
  extractAudioMetadata,
  parseVoiceFilename,
} from "../src/AsarDomain/audioAnalyzer.ts";

import {
  buildQrCodeImageUrl,
  sendRsvpDecisionEmail,
} from "../src/AsarDomain/emailJsService.ts";

import {
  DEFAULT_BOOTH_PLANS,
  DEFAULT_INVITATION_PLANS,
  DEMO_BOOTH_MEMORY,
  DEMO_BOOTH_VOICE_RECORDS,
  DEMO_INVITATION,
  DEMO_INVITATION_RSVPS,
} from "../src/AsarDomain/seedDefaults.ts";

// -------------------------------------------------------------
// 1. Appwrite Canonical IDs & Storage Buckets
// -------------------------------------------------------------
test("Appwrite Canonical IDs: database, collections, and buckets", () => {
  assert.equal(ASAR_DATABASE_ID, "asar-db");

  // All 8 required collections
  assert.equal(ASAR_COLLECTIONS.PLANS, "plans");
  assert.equal(ASAR_COLLECTIONS.ORDERS, "orders");
  assert.equal(ASAR_COLLECTIONS.PAYMENTS, "payments");
  assert.equal(ASAR_COLLECTIONS.BOOTH_MEMORIES, "booth_memories");
  assert.equal(ASAR_COLLECTIONS.BOOTH_VOICE_RECORDS, "booth_voice_records");
  assert.equal(ASAR_COLLECTIONS.BOOTH_MEDIA, "booth_media");
  assert.equal(ASAR_COLLECTIONS.INVITATIONS, "invitations");
  assert.equal(ASAR_COLLECTIONS.INVITATION_RSVPS, "invitation_rsvps");

  // All 5 required storage buckets
  assert.equal(ASAR_BUCKETS.PAYMENT_RECEIPTS, "payment_receipts");
  assert.equal(ASAR_BUCKETS.CLIENT_RAW_ASSETS, "client_raw_assets");
  assert.equal(ASAR_BUCKETS.BOOTH_MASTERED_AUDIO, "booth_mastered_audio");
  assert.equal(ASAR_BUCKETS.BOOTH_GALLERY_MEDIA, "booth_gallery_media");
  assert.equal(ASAR_BUCKETS.INVITATION_ASSETS, "invitation_assets");
});

// -------------------------------------------------------------
// 2. Safe JSON Parsers & Model Helpers
// -------------------------------------------------------------
test("Safe JSON Parsers: handles valid, malformed, and missing data gracefully", () => {
  // safeJsonParse
  assert.deepEqual(safeJsonParse('{"a":1}', {}), { a: 1 });
  assert.deepEqual(safeJsonParse("invalid json", { fallback: true }), { fallback: true });
  assert.deepEqual(safeJsonParse(null, [1, 2]), [1, 2]);
  assert.deepEqual(safeJsonParse(undefined, "default"), "default");
  assert.deepEqual(safeJsonParse({ already: "object" }, {}), { already: "object" });

  // parsePlanFeatures
  assert.deepEqual(parsePlanFeatures({ featuresJson: '["Feature A", "Feature B"]' }), [
    "Feature A",
    "Feature B",
  ]);
  assert.deepEqual(parsePlanFeatures({ featuresJson: "not-json" }), []);
  assert.deepEqual(parsePlanFeatures(null), []);

  // parsePlanLimits with default fallbacks
  const customLimits = parsePlanLimits({
    limitsJson: JSON.stringify({ maxVoiceRecords: 120, hasVideoHighlight: true }),
  });
  assert.equal(customLimits.maxVoiceRecords, 120);
  assert.equal(customLimits.hasVideoHighlight, true);
  assert.equal(customLimits.hostingDurationDays, 365); // Merged with default

  const fallbackLimits = parsePlanLimits(null);
  assert.deepEqual(fallbackLimits, DEFAULT_PLAN_LIMITS);

  // parsePlanAddons
  const addons = parsePlanAddons({
    addonsJson: JSON.stringify([{ id: "add1", name: "Sign", price: 500 }]),
  });
  assert.equal(addons.length, 1);
  assert.equal(addons[0].name, "Sign");
  assert.deepEqual(parsePlanAddons(null), []);

  // parseClientAssets
  const assets = parseClientAssets({
    clientSubmittedAssetsJson: JSON.stringify({ coupleTitle: "Mina & Maryam" }),
  });
  assert.equal(assets.coupleTitle, "Mina & Maryam");
  assert.deepEqual(parseClientAssets(undefined), {});

  // parseWaveformPeaks
  const peaks = parseWaveformPeaks(JSON.stringify([0.1, 0.5, 1.2]));
  assert.equal(peaks[0], 0.15); // Clamped to min 0.15
  assert.equal(peaks[1], 0.5);
  assert.equal(peaks[2], 1.0); // Clamped to max 1.0

  const defaultPeaks = parseWaveformPeaks(null, 48);
  assert.equal(defaultPeaks.length, 48);

  // parseCategories
  const categories = parseCategories(JSON.stringify(["Family", "Friends"]));
  assert.deepEqual(categories, ["Family", "Friends"]);
  assert.deepEqual(parseCategories(null), [
    "Family",
    "Friends",
    "Colleagues",
    "Special Guests",
  ]);
});

// -------------------------------------------------------------
// 3. 7-Stage Order Pipeline State Machine
// -------------------------------------------------------------
test("Order Pipeline: transitions, labels, and progress calculations", () => {
  // Check sequence and stages
  assert.equal(ORDER_STAGE_SEQUENCE.length, 6);
  assert.equal(Object.keys(ORDER_PIPELINE_STAGES).length, 7);

  // Transitions verification
  assert.equal(isValidTransition("pending_payment", "awaiting_client_assets"), true);
  assert.equal(isValidTransition("pending_payment", "payment_rejected"), true);
  assert.equal(isValidTransition("pending_payment", "published"), false);
  assert.equal(isValidTransition("payment_rejected", "pending_payment"), true);
  assert.equal(isValidTransition("awaiting_client_assets", "event_scheduled"), true);
  assert.equal(isValidTransition("studio_curation", "published"), true);
  assert.equal(isValidTransition("published", "studio_curation"), true);

  const nextStates = getNextValidStates("pending_payment");
  assert.deepEqual(nextStates, ["payment_rejected", "awaiting_client_assets"]);

  // Labels and Colors
  assert.equal(getOrderStatusColor("published"), "#1E6F50");
  assert.equal(getOrderStatusColor("payment_rejected"), "#9B2C2C");
  assert.ok(getOrderStatusLabel("pending_payment", "ar").includes("الدفع"));
  assert.equal(getOrderStatusLabel("pending_payment", "en"), "Payment Verification");

  // Progress metrics
  const p1 = getOrderStageProgress("pending_payment");
  assert.equal(p1.currentStepIndex, 1);
  assert.equal(p1.progressPercent, 14);
  assert.equal(p1.requiresClientAction, false);
  assert.equal(p1.isCompleted, false);

  const p2 = getOrderStageProgress("payment_rejected");
  assert.equal(p2.currentStepIndex, 2);
  assert.equal(p2.requiresClientAction, true);

  const p3 = getOrderStageProgress("awaiting_client_assets");
  assert.equal(p3.currentStepIndex, 3);
  assert.equal(p3.progressPercent, 43);
  assert.equal(p3.requiresClientAction, true);

  const p7 = getOrderStageProgress("published");
  assert.equal(p7.currentStepIndex, 7);
  assert.equal(p7.progressPercent, 100);
  assert.equal(p7.isCompleted, true);
  assert.equal(p7.requiresClientAction, false);

  // Fallback for unknown status
  const fallbackProgress = getOrderStageProgress("unknown_status" as any);
  assert.equal(fallbackProgress.currentStepIndex, 1);
});

// -------------------------------------------------------------
// 4. Web Audio Analyzer & Smart Filename Parser
// -------------------------------------------------------------
test("Audio Analyzer: duration formatting, waveform generation, and offline metadata extraction", async () => {
  // formatDuration
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(42), "0:42");
  assert.equal(formatDuration(72), "1:12");
  assert.equal(formatDuration(3605), "60:05");
  assert.equal(formatDuration(-10), "0:00");

  // generateDeterministicWaveform
  const wave1 = generateDeterministicWaveform("test-seed-1", 48);
  const wave2 = generateDeterministicWaveform("test-seed-1", 48);
  assert.equal(wave1.length, 48);
  assert.deepEqual(wave1, wave2); // Deterministic consistency

  for (const peak of wave1) {
    assert.ok(peak >= 0.15 && peak <= 1.0, `Peak ${peak} should be between 0.15 and 1.0`);
  }

  // generateWaveformFromPCM
  const pcm = new Float32Array(4800);
  for (let i = 0; i < pcm.length; i++) {
    pcm[i] = Math.sin(i / 100) * 0.8;
  }
  const pcmWave = generateWaveformFromPCM(pcm, 48);
  assert.equal(pcmWave.length, 48);
  assert.ok(pcmWave[0] >= 0.15);

  // extractAudioMetadata offline fallback with ArrayBuffer
  const dummyBuffer = new ArrayBuffer(64000);
  const metadata = await extractAudioMetadata(dummyBuffer, 48);
  assert.ok(metadata.durationSeconds > 0);
  assert.ok(metadata.durationFormatted.length >= 4);
  assert.equal(metadata.waveformPeaks.length, 48);
});

test("Smart Filename Parser: all 4 patterns (A, B, C, D)", () => {
  // Pattern A: Category_Speaker Name_Role.mp3
  const resA = parseVoiceFilename("Friends_Nour Hassan_Best Friend.mp3");
  assert.equal(resA.category, "Friends");
  assert.equal(resA.speakerName, "Nour Hassan");
  assert.equal(resA.speakerRole, "Best Friend");

  // Pattern B: Category - Speaker Name - Role.wav
  const resB = parseVoiceFilename("Family - Ahmed El Sayed - Brother.wav");
  assert.equal(resB.category, "Family");
  assert.equal(resB.speakerName, "Ahmed El Sayed");
  assert.equal(resB.speakerRole, "Brother");

  // Pattern C: Speaker Name - Role.m4a (uses folderName as category)
  const resC = parseVoiceFilename("Mona Khaled - Cousin.m4a", "VIP Family");
  assert.equal(resC.category, "VIP Family");
  assert.equal(resC.speakerName, "Mona Khaled");
  assert.equal(resC.speakerRole, "Cousin");

  // Pattern D1: Raw Recorder ID REC_001.mp3
  const resD1 = parseVoiceFilename("REC_001.mp3");
  assert.equal(resD1.speakerName, "Voice Memory #1");
  assert.equal(resD1.speakerRole, "Guest");
  assert.equal(resD1.category, "Friends");

  // Pattern D2: Raw track ID track_42.wav
  const resD2 = parseVoiceFilename("track_42.wav", "Colleagues");
  assert.equal(resD2.speakerName, "Voice Memory #42");
  assert.equal(resD2.speakerRole, "Guest");
  assert.equal(resD2.category, "Colleagues");

  // Pattern D3: Sanitized single name with hyphens
  const resD3 = parseVoiceFilename("tarek-mostafa.ogg");
  assert.equal(resD3.speakerName, "Tarek Mostafa");
  assert.equal(resD3.speakerRole, "Guest");

  // Edge Case: Empty or blank
  const resEmpty = parseVoiceFilename("");
  assert.equal(resEmpty.speakerName, "Special Guest");
  assert.equal(resEmpty.speakerRole, "Guest");
});

// -------------------------------------------------------------
// 5. EmailJS Service & QR Code Builder
// -------------------------------------------------------------
test("EmailJS & QR Code Service: QR URL generation and simulated dispatch", async () => {
  // buildQrCodeImageUrl with default public API
  const qrUrlDefault = buildQrCodeImageUrl("https://asar.audio/pass/123", 400);
  assert.ok(qrUrlDefault.includes("api.qrserver.com"));
  assert.ok(qrUrlDefault.includes("6B1D28")); // Brand maroon color
  assert.ok(qrUrlDefault.includes("FBF7F2")); // Brand alabaster bg

  // buildQrCodeImageUrl with Appwrite endpoint
  const qrUrlAppwrite = buildQrCodeImageUrl(
    "https://asar.audio/pass/123",
    500,
    "https://cloud.appwrite.io/v1",
    "project-asar"
  );
  assert.ok(qrUrlAppwrite.includes("cloud.appwrite.io/v1/avatars/qr"));
  assert.ok(qrUrlAppwrite.includes("project=project-asar"));

  // sendRsvpDecisionEmail (Approved simulated dispatch)
  const approvedResult = await sendRsvpDecisionEmail({
    decision: "approved",
    toEmail: "guest@example.com",
    toName: "Mariam",
    eventTitle: "The Wedding of Omar & Layla",
    rsvpId: "rsvp-123",
    passToken: "token-abc",
  });
  assert.equal(approvedResult.success, true);
  assert.equal(approvedResult.simulated, true);
  assert.ok(approvedResult.qrCodeUrl?.length);
  assert.ok(approvedResult.emailSubject.includes("تأكيد"));

  // sendRsvpDecisionEmail (Declined simulated dispatch with capacity note)
  const declinedResult = await sendRsvpDecisionEmail({
    decision: "declined",
    toEmail: "guest2@example.com",
    toName: "Karim",
    eventTitle: "The Wedding of Omar & Layla",
  });
  assert.equal(declinedResult.success, true);
  assert.equal(declinedResult.simulated, true);
  assert.equal(declinedResult.qrCodeUrl, undefined);
  assert.ok(declinedResult.emailBodyPreview.includes("السعة الاستيعابية"));
});

// -------------------------------------------------------------
// 6. Seed Defaults & Reference Consistency
// -------------------------------------------------------------
test("Seed Defaults: Default plans, Mina & Maryam demo memory and Image #1 voice records", () => {
  // DEFAULT_BOOTH_PLANS
  assert.equal(DEFAULT_BOOTH_PLANS.length, 2);
  const plan1 = DEFAULT_BOOTH_PLANS[0];
  assert.equal(plan1.price, 5500);
  assert.equal(plan1.themeVariant, "ivory-royal");
  const plan1Limits = parsePlanLimits(plan1);
  assert.equal(plan1Limits.maxVoiceRecords, 80);
  assert.equal(plan1Limits.coverageHours, 3);

  const plan2 = DEFAULT_BOOTH_PLANS[1];
  assert.equal(plan2.price, 7000);
  assert.equal(plan2.themeVariant, "noir-obsidian");
  const plan2Limits = parsePlanLimits(plan2);
  assert.equal(plan2Limits.hasVideoHighlight, true);
  assert.equal(plan2Limits.maxVoiceRecords, 150);

  // DEMO_BOOTH_MEMORY (Mina & Maryam)
  assert.equal(DEMO_BOOTH_MEMORY.slug, "mina-and-maryam");
  assert.equal(DEMO_BOOTH_MEMORY.coupleTitle, "Mina & Maryam");
  assert.equal(DEMO_BOOTH_MEMORY.highlightBadge, "Together Always");
  assert.equal(DEMO_BOOTH_MEMORY.eventDateDisplay, "12 July 2026");
  assert.equal(DEMO_BOOTH_MEMORY.eventLocationDisplay, "Alexandria, Egypt");

  // DEMO_BOOTH_VOICE_RECORDS (Exact 5 Speakers from Image #1)
  assert.equal(DEMO_BOOTH_VOICE_RECORDS.length, 5);
  const speakerNames = DEMO_BOOTH_VOICE_RECORDS.map((r) => r.speakerName);
  assert.deepEqual(speakerNames, [
    "Nour Hassan",
    "Ahmed El Sayed",
    "Mona Khaled",
    "Tarek Mostafa",
    "Grandma",
  ]);

  for (const record of DEMO_BOOTH_VOICE_RECORDS) {
    assert.ok(record.durationSeconds > 0);
    assert.ok(record.durationFormatted.includes(":"));
    const peaks = parseWaveformPeaks(record.waveformPeaksJson);
    assert.equal(peaks.length, 48);
  }

  // DEMO_INVITATION & Mandatory Locked Email Field
  assert.equal(DEMO_INVITATION.slug, "omar-and-layla");
  const formFields = parseFormSchema(DEMO_INVITATION.formSchemaJson);
  const emailField = formFields.find((f) => f.name === "guestEmail");
  assert.ok(emailField, "guestEmail field must be present in dynamic form schema");
  assert.equal(emailField.required, true, "guestEmail must be required");
  assert.equal(emailField.locked, true, "guestEmail must be locked per ASAR architectural rules");

  // DEMO_INVITATION_RSVPS
  assert.equal(DEMO_INVITATION_RSVPS.length, 3);
  const approvedRsvp = DEMO_INVITATION_RSVPS.find((r) => r.status === "approved");
  const declinedRsvp = DEMO_INVITATION_RSVPS.find((r) => r.status === "declined");
  assert.ok(approvedRsvp?.passToken);
  assert.ok(declinedRsvp?.guestEmail);

  // Users Collection & User Profile Model
  assert.equal(ASAR_COLLECTIONS.USERS, "users");

  const parsedProfile = parseUserProfile({
    $id: "usr_doc_1",
    userId: "usr_acc_1",
    name: "مروان الشامي",
    email: "marwan@example.com",
    role: "admin",
    phone: "+201012345678",
  });
  assert.ok(parsedProfile);
  assert.equal(parsedProfile.name, "مروان الشامي");
  assert.equal(parsedProfile.role, "admin");
  assert.equal(parsedProfile.locale, "ar");
});
