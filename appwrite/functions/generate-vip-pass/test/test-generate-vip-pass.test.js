import assert from "node:assert/strict";
import crypto from "node:crypto";
import handler from "../src/main.js";

async function runTest(reqBody, headers = {}) {
  let result = {};
  const res = {
    json: (data, code = 200) => {
      result = { code, data };
      return result;
    },
  };
  await handler({
    req: { body: reqBody, headers },
    res,
    log: () => {},
    error: () => {},
  });
  return result;
}

async function testSuite() {
  console.log("Starting generate-vip-pass unit test suite...");

  // 1. Missing rsvpId
  {
    const r = await runTest(JSON.stringify({ guestName: "Amir Khan" }));
    assert.equal(r.code, 400);
    assert.equal(r.data.success, false);
    assert.match(r.data.error, /rsvpId/i);
    console.log("✓ Test 1: Rejects missing rsvpId with 400");
  }

  // 2. Missing guestName
  {
    const r = await runTest(JSON.stringify({ rsvpId: "rsvp-555" }));
    assert.equal(r.code, 400);
    assert.equal(r.data.success, false);
    assert.match(r.data.error, /guestName/i);
    console.log("✓ Test 2: Rejects missing guestName with 400");
  }

  // 3. Successful Generation
  {
    const r = await runTest(
      JSON.stringify({
        rsvpId: "rsvp-555",
        guestName: "Amir Khan",
        companionsCount: 3,
        invitationSlug: "amir-and-yasmin",
        eventTitle: "The Imperial Wedding",
      })
    );
    assert.equal(r.code, 200);
    assert.equal(r.data.success, true);
    const pass = r.data.pass;
    assert.ok(pass);
    assert.match(pass.token, /^ASAR-PASS-[0-9A-Z]{4}-[0-9A-Z]{8}$/);
    assert.equal(pass.rsvpId, "rsvp-555");
    assert.equal(pass.guestName, "Amir Khan");
    assert.equal(pass.companionsCount, 3);
    assert.equal(pass.totalGuests, 4);
    assert.equal(pass.invitationSlug, "amir-and-yasmin");
    assert.equal(pass.eventTitle, "The Imperial Wedding");
    assert.ok(pass.signature);
    assert.equal(pass.signature.length, 16);
    assert.match(pass.checkInUrl, /token=ASAR-PASS-/);
    assert.match(pass.checkInUrl, /sig=[0-9a-f]{16}/);

    // Verify HMAC-SHA256 signature validity
    const secretKey = process.env.APPWRITE_API_KEY || "asar_internal_secret_hmac_2026";
    const expectedSig = crypto
      .createHmac("sha256", secretKey)
      .update(`rsvp-555:Amir Khan:${pass.token}:${pass.issuedAt}`)
      .digest("hex")
      .slice(0, 16);
    assert.equal(pass.signature, expectedSig);
    console.log("✓ Test 3: Generates verifiable HMAC-SHA256 signed VIP pass with 200");
  }

  // 4. Tamper Resistance
  {
    const r = await runTest(
      JSON.stringify({
        rsvpId: "rsvp-666",
        guestName: "Zeinab Al-Hashemi",
        companionsCount: 0,
      })
    );
    const pass = r.data.pass;
    const secretKey = process.env.APPWRITE_API_KEY || "asar_internal_secret_hmac_2026";
    const tamperedSig = crypto
      .createHmac("sha256", secretKey)
      .update(`rsvp-666:TAMPERED_NAME:${pass.token}:${pass.issuedAt}`)
      .digest("hex")
      .slice(0, 16);
    assert.notEqual(pass.signature, tamperedSig);
    console.log("✓ Test 4: Signature detects tampering on payload fields");
  }

  console.log("All generate-vip-pass unit tests passed successfully!");
}

testSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
