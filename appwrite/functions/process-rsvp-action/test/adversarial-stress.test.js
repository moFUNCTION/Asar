import assert from "node:assert/strict";
import handler from "../src/main.js";

async function runHandler(reqOptions, mockDb) {
  let result = {};
  const res = {
    json: (data, code = 200) => {
      result = { code, data };
      return result;
    },
  };

  const req = {
    _mockDatabases: mockDb,
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

function createMockDb({
  rsvpDoc = null,
  invitationDoc = null,
  approvedDocs = [],
  throwOnGetRsvp = false,
} = {}) {
  let updatedDocData = null;

  const mockDb = {
    getDocument: async (db, col, id) => {
      if (col === "invitation_rsvps") {
        if (throwOnGetRsvp || !rsvpDoc) {
          throw new Error("RSVP document not found in Appwrite");
        }
        return { $id: id, ...rsvpDoc };
      }
      if (col === "invitations") {
        if (!invitationDoc) {
          throw new Error("Invitation document not found");
        }
        return { $id: id, ...invitationDoc };
      }
      throw new Error(`Unknown collection ${col}`);
    },
    listDocuments: async (db, col, queries) => {
      return { documents: approvedDocs };
    },
    updateDocument: async (db, col, id, data) => {
      updatedDocData = { $id: id, ...rsvpDoc, ...data };
      return updatedDocData;
    },
    getUpdatedData: () => updatedDocData,
  };

  return mockDb;
}

async function runAdversarialSuite() {
  console.log("===============================================================");
  console.log("ADVERSARIAL STRESS SUITE: process-rsvp-action");
  console.log("===============================================================");

  // --- Category A: Missing / Malformed rsvpId ---
  console.log("\n[Category A] Stress-testing missing and malformed rsvpId inputs...");
  const invalidRsvpIds = [
    undefined,
    null,
    "",
    "   ",
    "\t\n",
    12345,
    true,
    false,
    {},
    [],
    NaN,
  ];

  for (const invalidId of invalidRsvpIds) {
    const res = await runHandler({ bodyJson: { rsvpId: invalidId, action: "approve" } });
    assert.equal(res.code, 400, `Expected 400 for rsvpId: ${JSON.stringify(invalidId)}`);
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /rsvpId/i);
  }
  console.log(`✓ Passed ${invalidRsvpIds.length} boundary checks for rsvpId validation`);

  // --- Category B: Invalid action values ---
  console.log("\n[Category B] Stress-testing invalid action values...");
  const invalidActions = [
    undefined,
    null,
    "",
    "   ",
    "APPROVE",
    "DECLINE",
    "Approve",
    "Decline",
    "maybe",
    "pending",
    "confirmed",
    1,
    0,
    true,
    {},
    ["approve"],
  ];

  for (const action of invalidActions) {
    const res = await runHandler({ bodyJson: { rsvpId: "valid-rsvp-id", action } });
    assert.equal(res.code, 400, `Expected 400 for action: ${JSON.stringify(action)}`);
    assert.equal(res.data.success, false);
    assert.match(res.data.error, /Invalid action/i);
  }
  console.log(`✓ Passed ${invalidActions.length} boundary checks for action validation`);

  // --- Category C: Missing Document (404) ---
  console.log("\n[Category C] Stress-testing missing document handling...");
  {
    const mockDb = createMockDb({ throwOnGetRsvp: true });
    const res = await runHandler({ bodyJson: { rsvpId: "ghost-doc-404", action: "approve" } }, mockDb);
    assert.equal(res.code, 404);
    assert.equal(res.data.success, false);
    assert.equal(res.data.error, "RSVP document not found.");
    console.log("✓ Correctly returns HTTP 404 when RSVP document is not found in database");
  }

  // --- Category D: Capacity Overflow & Overbooking Defense ---
  console.log("\n[Category D] Stress-testing capacity overflow & overbooking defense...");

  // Subtest D1: Exactly at max capacity (boundary condition)
  {
    // maxCapacity: 20, existing approved: 18 (e.g. 9 guests with 1 companion each = 18), incoming: 1 guest + 1 companion = 2
    // 18 + 2 = 20 <= 20 => MUST PASS (200)
    const mockDb = createMockDb({
      rsvpDoc: { invitationId: "inv-capacity-test", companionsCount: 1, guestName: "Boundary Guest" },
      invitationDoc: { maxCapacity: 20 },
      approvedDocs: [
        { $id: "doc-1", companionsCount: 8 }, // 9 guests
        { $id: "doc-2", companionsCount: 8 }, // 9 guests
      ],
    });
    const res = await runHandler({ bodyJson: { rsvpId: "rsvp-exact-boundary", action: "approve" } }, mockDb);
    assert.equal(res.code, 200, "Should succeed when total matches maxCapacity exactly");
    assert.equal(res.data.success, true);
    assert.equal(res.data.status, "approved");
    console.log("✓ Subtest D1: Exactly at capacity limit (20/20) succeeds with 200");
  }

  // Subtest D2: Exactly 1 over capacity (boundary condition)
  {
    // maxCapacity: 20, existing approved: 19, incoming: 1 guest + 1 companion = 2 => 21 > 20 => 409
    const mockDb = createMockDb({
      rsvpDoc: { invitationId: "inv-capacity-test", companionsCount: 1, guestName: "Overflow Guest" },
      invitationDoc: { maxCapacity: 20 },
      approvedDocs: [
        { $id: "doc-1", companionsCount: 9 }, // 10 guests
        { $id: "doc-2", companionsCount: 8 }, // 9 guests
      ],
    });
    const res = await runHandler({ bodyJson: { rsvpId: "rsvp-overflow-1", action: "approve" } }, mockDb);
    assert.equal(res.code, 409, "Should return 409 when exceeding by 1");
    assert.equal(res.data.success, false);
    assert.equal(res.data.currentCapacity, 19);
    assert.equal(res.data.maxCapacity, 20);
    assert.equal(res.data.requested, 2);
    assert.match(res.data.error, /capacity limit reached/i);
    console.log("✓ Subtest D2: Over capacity by 1 seat (19 + 2 > 20) rejected with 409 Conflict");
  }

  // Subtest D3: Grossly over capacity
  {
    const mockDb = createMockDb({
      rsvpDoc: { invitationId: "inv-capacity-test", companionsCount: 5 },
      invitationDoc: { maxCapacity: 10 },
      approvedDocs: [{ $id: "doc-1", companionsCount: 9 }], // 10 guests
    });
    const res = await runHandler({ bodyJson: { rsvpId: "rsvp-gross-overflow", action: "approve" } }, mockDb);
    assert.equal(res.code, 409);
    assert.equal(res.data.success, false);
    assert.equal(res.data.currentCapacity, 10);
    assert.equal(res.data.requested, 6);
    console.log("✓ Subtest D3: Gross capacity overflow (10 + 6 > 10) rejected with 409 Conflict");
  }

  // Subtest D4: Override maxVenueCapacity via payload
  {
    // DB invitation has maxCapacity: 100, but payload specifies maxVenueCapacity: 15
    const mockDb = createMockDb({
      rsvpDoc: { invitationId: "inv-override", companionsCount: 2 }, // requested: 3
      invitationDoc: { maxCapacity: 100 },
      approvedDocs: [{ $id: "doc-1", companionsCount: 13 }], // current: 14
    });
    // 14 + 3 = 17 > 15
    const res = await runHandler({
      bodyJson: {
        rsvpId: "rsvp-override-test",
        action: "approve",
        maxVenueCapacity: 15,
      },
    }, mockDb);
    assert.equal(res.code, 409);
    assert.equal(res.data.maxCapacity, 15);
    console.log("✓ Subtest D4: maxVenueCapacity in payload successfully enforces stricter ceiling");
  }

  // Subtest D5: Idempotency when re-approving an already approved document
  {
    // Current doc is in the approvedDocs list!
    // filter(doc => doc.$id !== rsvpId) should NOT double count it!
    const currentRsvpId = "rsvp-already-approved";
    const mockDb = createMockDb({
      rsvpDoc: { $id: currentRsvpId, invitationId: "inv-idempotent", companionsCount: 1, status: "approved" },
      invitationDoc: { maxCapacity: 10 },
      approvedDocs: [
        { $id: currentRsvpId, companionsCount: 1, status: "approved" }, // this doc
        { $id: "other-doc", companionsCount: 7, status: "approved" }, // 8 guests
      ],
    });
    // If not filtered, current (8) + this doc in list (2) + incoming (2) = 12 > 10 (would falsely fail 409).
    // With filter: other docs = 8 + incoming (2) = 10 <= 10 => SUCKSESS!
    const res = await runHandler({ bodyJson: { rsvpId: currentRsvpId, action: "approve" } }, mockDb);
    assert.equal(res.code, 200, "Idempotent re-approval should not double-count its own seats");
    console.log("✓ Subtest D5: Re-approving already approved RSVP does not double-count capacity");
  }

  // --- Category E: Pass Token Generation Uniqueness & Entropy ---
  console.log("\n[Category E] Stress-testing pass token entropy and collision resistance (5,000 passes)...");
  {
    const generatedTokens = new Set();
    const mockDb = createMockDb({
      rsvpDoc: { invitationId: "inv-entropy", companionsCount: 0 },
      invitationDoc: { maxCapacity: 100000 },
      approvedDocs: [],
    });

    const BATCH_COUNT = 5000;
    for (let i = 0; i < BATCH_COUNT; i++) {
      const res = await runHandler({ bodyJson: { rsvpId: `rsvp-entropy-${i}`, action: "approve" } }, mockDb);
      assert.equal(res.code, 200);
      const token = res.data.passToken;
      assert.match(token, /^VIP-[0-9A-F]{4}-[0-9A-F]{4}$/, `Token ${token} should match VIP-XXXX-YYYY format`);
      assert.ok(!generatedTokens.has(token), `Collision detected on token: ${token} at iteration ${i}!`);
      generatedTokens.add(token);
    }
    assert.equal(generatedTokens.size, BATCH_COUNT);
    console.log(`✓ 5,000 uniquely generated VIP tokens tested with 0 collisions (100% uniqueness)`);
  }

  // --- Category F: OpenRuntimes Payload Variations ---
  console.log("\n[Category F] Stress-testing OpenRuntimes payload variations...");
  {
    const mockDb = createMockDb({
      rsvpDoc: { invitationId: "inv-openruntimes", companionsCount: 0 },
      invitationDoc: { maxCapacity: 50 },
      approvedDocs: [],
    });

    // 1. req.bodyJson (parsed object)
    const res1 = await runHandler({ bodyJson: { rsvpId: "rsvp-bodyJson", action: "approve" } }, mockDb);
    assert.equal(res1.code, 200);
    assert.equal(res1.data.rsvpId, "rsvp-bodyJson");
    console.log("✓ req.bodyJson (object) successfully handled");

    // 2. req.bodyText (raw JSON string)
    const res2 = await runHandler({ bodyText: JSON.stringify({ rsvpId: "rsvp-bodyText", action: "approve" }) }, mockDb);
    assert.equal(res2.code, 200);
    assert.equal(res2.data.rsvpId, "rsvp-bodyText");
    console.log("✓ req.bodyText (JSON string) successfully handled");

    // 3. req.body (JSON string)
    const res3 = await runHandler({ body: JSON.stringify({ rsvpId: "rsvp-body-str", action: "approve" }) }, mockDb);
    assert.equal(res3.code, 200);
    assert.equal(res3.data.rsvpId, "rsvp-body-str");
    console.log("✓ req.body (JSON string) successfully handled");

    // 4. req.body (object)
    const res4 = await runHandler({ body: { rsvpId: "rsvp-body-obj", action: "approve" } }, mockDb);
    assert.equal(res4.code, 200);
    assert.equal(res4.data.rsvpId, "rsvp-body-obj");
    console.log("✓ req.body (object) successfully handled");

    // 5. Malformed JSON string in bodyText
    const res5 = await runHandler({ bodyText: "{ invalid_json: " }, mockDb);
    assert.equal(res5.code, 400);
    assert.equal(res5.data.success, false);
    assert.match(res5.data.error, /Invalid JSON/i);
    console.log("✓ Malformed JSON in bodyText returns 400");

    // 6. Empty body
    const res6 = await runHandler({}, mockDb);
    assert.equal(res6.code, 400);
    assert.match(res6.data.error, /rsvpId/i);
    console.log("✓ Empty body returns 400 with missing rsvpId");
  }

  console.log("\n===============================================================");
  console.log("ALL ADVERSARIAL STRESS TESTS FOR process-rsvp-action PASSED!");
  console.log("===============================================================");
}

runAdversarialSuite().catch((err) => {
  console.error("Adversarial test failed:", err);
  process.exit(1);
});
