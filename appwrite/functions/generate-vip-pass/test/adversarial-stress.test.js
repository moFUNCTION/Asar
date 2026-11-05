import assert from "node:assert/strict";
import crypto from "node:crypto";
import handler from "../src/main.js";

async function runHandler(reqOptions) {
  let result = {};
  const res = {
    json: (data, code = 200) => {
      result = { code, data };
      return result;
    },
  };

  const req = {
    ...reqOptions,
  };

  await handler({
    req,
    res,
    log: () => {},
    error: () => {},
  });

  return result;
}

function verifyHmacSignature(pass, secretKey = process.env.APPWRITE_API_KEY || "asar_internal_secret_hmac_2026") {
  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(`${pass.rsvpId}:${pass.guestName}:${pass.token}:${pass.issuedAt}`)
    .digest("hex")
    .slice(0, 16);
  return pass.signature === expected;
}

async function runAdversarialSuite() {
  console.log("===============================================================");
  console.log("ADVERSARIAL STRESS SUITE: generate-vip-pass");
  console.log("===============================================================");

  // --- Category A: Missing / Invalid Parameters ---
  console.log("\n[Category A] Stress-testing missing and empty parameters...");
  const invalidRsvpCases = [
    { guestName: "Sarah Al-Thani" },
    { rsvpId: "", guestName: "Sarah Al-Thani" },
    { rsvpId: null, guestName: "Sarah Al-Thani" },
    { rsvpId: undefined, guestName: "Sarah Al-Thani" },
  ];

  for (const c of invalidRsvpCases) {
    const res = await runHandler({ bodyJson: c });
    assert.equal(res.code, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /Missing required parameters/i);
  }
  console.log("✓ Rejection confirmed for all missing rsvpId variants");

  const invalidNameCases = [
    { rsvpId: "rsvp-valid-1" },
    { rsvpId: "rsvp-valid-1", guestName: "" },
    { rsvpId: "rsvp-valid-1", guestName: null },
    { rsvpId: "rsvp-valid-1", guestName: undefined },
  ];

  for (const c of invalidNameCases) {
    const res = await runHandler({ bodyJson: c });
    assert.equal(res.code, 400);
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /Missing required parameters/i);
  }
  console.log("✓ Rejection confirmed for all missing guestName variants");

  // --- Category B: HMAC Signature Cryptographic Verification ---
  console.log("\n[Category B] Verifying cryptographic HMAC-SHA256 signature integrity...");
  {
    const res = await runHandler({
      bodyJson: {
        rsvpId: "rsvp-sig-001",
        guestName: "Prince Sultan",
        companionsCount: 2,
        invitationSlug: "royal-gala",
        eventTitle: "The Royal Gala Dinner",
      },
    });

    assert.equal(res.code, 200);
    assert.equal(res.data.success, true);
    const pass = res.data.pass;
    assert.ok(pass);
    assert.equal(pass.signature.length, 16);
    assert.match(pass.signature, /^[0-9a-f]{16}$/);

    const isValid = verifyHmacSignature(pass);
    assert.ok(isValid, "HMAC signature MUST match expected SHA-256 digest calculation");
    console.log("✓ Cryptographic HMAC signature mathematically verified against independent oracle");
  }

  // --- Category C: Adversarial Tampering Tests ---
  console.log("\n[Category C] Adversarial tampering and spoofing attempts...");
  {
    const res = await runHandler({
      bodyJson: {
        rsvpId: "rsvp-tamper-target",
        guestName: "Original Legitimate Guest",
        companionsCount: 1,
      },
    });
    const legitPass = res.data.pass;
    const secretKey = process.env.APPWRITE_API_KEY || "asar_internal_secret_hmac_2026";

    // Tamper 1: Scalper transfers pass to another guest
    {
      const tamperedPass = { ...legitPass, guestName: "Malicious Ticket Scalper" };
      assert.strictEqual(
        verifyHmacSignature(tamperedPass, secretKey),
        false,
        "Tampering with guestName must invalidate signature"
      );
      console.log("✓ Attack 1 thwarted: Tampering guestName invalidates signature");
    }

    // Tamper 2: Swapping token
    {
      const tamperedPass = { ...legitPass, token: "ASAR-PASS-DEAD-BEEFCAFE" };
      assert.strictEqual(
        verifyHmacSignature(tamperedPass, secretKey),
        false,
        "Tampering with token must invalidate signature"
      );
      console.log("✓ Attack 2 thwarted: Tampering pass token invalidates signature");
    }

    // Tamper 3: Replaying against another RSVP ID
    {
      const tamperedPass = { ...legitPass, rsvpId: "rsvp-forged-other-event" };
      assert.strictEqual(
        verifyHmacSignature(tamperedPass, secretKey),
        false,
        "Tampering with rsvpId must invalidate signature"
      );
      console.log("✓ Attack 3 thwarted: Tampering rsvpId invalidates signature");
    }

    // Tamper 4: Modifying timestamp
    {
      const tamperedPass = { ...legitPass, issuedAt: "2029-01-01T00:00:00.000Z" };
      assert.strictEqual(
        verifyHmacSignature(tamperedPass, secretKey),
        false,
        "Tampering with issuedAt must invalidate signature"
      );
      console.log("✓ Attack 4 thwarted: Tampering issuedAt invalidates signature");
    }

    // Tamper 5: Attacker forging signature with their own attacker secret key
    {
      const attackerKey = "malicious_attacker_key_secret_xyz";
      const forgedSig = crypto
        .createHmac("sha256", attackerKey)
        .update(`${legitPass.rsvpId}:${legitPass.guestName}:${legitPass.token}:${legitPass.issuedAt}`)
        .digest("hex")
        .slice(0, 16);
      const forgedPass = { ...legitPass, signature: forgedSig };
      assert.strictEqual(
        verifyHmacSignature(forgedPass, secretKey),
        false,
        "Forged signature using wrong secret key must be rejected"
      );
      console.log("✓ Attack 5 thwarted: Forged signature using attacker secret key is rejected");
    }
  }

  // --- Category D: Companions and Total Guests Calculations ---
  console.log("\n[Category D] Testing companions count boundary calculations...");
  const companionCases = [
    { companionsCount: 0, expectedTotal: 1 },
    { companionsCount: 1, expectedTotal: 2 },
    { companionsCount: 10, expectedTotal: 11 },
    { companionsCount: "3", expectedTotal: 4 },
    { companionsCount: undefined, expectedTotal: 1 },
    { companionsCount: null, expectedTotal: 1 },
  ];

  for (const { companionsCount, expectedTotal } of companionCases) {
    const res = await runHandler({
      bodyJson: {
        rsvpId: "rsvp-companion-test",
        guestName: "Host Test",
        companionsCount,
      },
    });
    assert.equal(res.code, 200);
    assert.equal(res.data.pass.totalGuests, expectedTotal);
  }
  console.log("✓ Total guests calculations robust across numbers, strings, nulls, and undefined");

  // --- Category E: Token Format & Uniqueness (5,000 passes) ---
  console.log("\n[Category E] Stress-testing token entropy and collision resistance (5,000 passes)...");
  {
    const tokens = new Set();
    const BATCH_SIZE = 5000;
    for (let i = 0; i < BATCH_SIZE; i++) {
      const res = await runHandler({
        bodyJson: {
          rsvpId: `rsvp-entropy-${i}`,
          guestName: `Guest ${i}`,
        },
      });
      assert.equal(res.code, 200);
      const token = res.data.pass.token;
      assert.match(token, /^ASAR-PASS-[0-9A-Z]{4}-[0-9A-Z]{8}$/);
      assert.ok(!tokens.has(token), `Collision found on token ${token} at iteration ${i}!`);
      tokens.add(token);
    }
    assert.equal(tokens.size, BATCH_SIZE);
    console.log(`✓ 5,000 uniquely generated ASAR-PASS tokens tested with 0 collisions`);
  }

  // --- Category F: OpenRuntimes Payload Variations ---
  console.log("\n[Category F] Stress-testing OpenRuntimes payload variations for generate-vip-pass...");
  {
    // 1. req.bodyJson (parsed object)
    const res1 = await runHandler({ bodyJson: { rsvpId: "rsvp-bodyJson", guestName: "Test 1" } });
    assert.equal(res1.code, 200);
    assert.equal(res1.data.pass.rsvpId, "rsvp-bodyJson");
    console.log("✓ req.bodyJson (object) successfully handled");

    // 2. req.bodyText (JSON string)
    const res2 = await runHandler({ bodyText: JSON.stringify({ rsvpId: "rsvp-bodyText", guestName: "Test 2" }) });
    assert.equal(res2.code, 200);
    assert.equal(res2.data.pass.rsvpId, "rsvp-bodyText");
    console.log("✓ req.bodyText (JSON string) successfully handled");

    // 3. req.body (JSON string)
    const res3 = await runHandler({ body: JSON.stringify({ rsvpId: "rsvp-body-str", guestName: "Test 3" }) });
    assert.equal(res3.code, 200);
    assert.equal(res3.data.pass.rsvpId, "rsvp-body-str");
    console.log("✓ req.body (JSON string) successfully handled");

    // 4. req.body (object)
    const res4 = await runHandler({ body: { rsvpId: "rsvp-body-obj", guestName: "Test 4" } });
    assert.equal(res4.code, 200);
    assert.equal(res4.data.pass.rsvpId, "rsvp-body-obj");
    console.log("✓ req.body (object) successfully handled");

    // 5. Malformed JSON string in bodyText
    const res5 = await runHandler({ bodyText: "{ corrupt: json" });
    assert.equal(res5.code, 400);
    assert.equal(res5.data.success, false);
    assert.match(res5.data.error, /Invalid JSON/i);
    console.log("✓ Malformed JSON in bodyText returns 400");

    // 6. Empty body
    const res6 = await runHandler({});
    assert.equal(res6.code, 400);
    assert.match(res6.data.error, /Missing required parameters/i);
    console.log("✓ Empty body returns 400 with missing parameters");
  }

  console.log("\n===============================================================");
  console.log("ALL ADVERSARIAL STRESS TESTS FOR generate-vip-pass PASSED!");
  console.log("===============================================================");
}

runAdversarialSuite().catch((err) => {
  console.error("Adversarial test failed:", err);
  process.exit(1);
});
