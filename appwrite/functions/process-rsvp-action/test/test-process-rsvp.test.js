import assert from "node:assert/strict";
import handler from "../src/main.js";

async function runTest(reqBody, mockDb) {
  let result = {};
  const res = {
    json: (data, code = 200) => {
      result = { code, data };
      return result;
    },
  };
  await handler({
    req: { body: reqBody, _mockDatabases: mockDb },
    res,
    log: () => {},
    error: () => {},
  });
  return result;
}

async function testSuite() {
  console.log("Starting process-rsvp-action unit test suite...");

  // 1. Missing rsvpId
  {
    const r = await runTest(JSON.stringify({ action: "approve" }));
    assert.equal(r.code, 400);
    assert.equal(r.data.success, false);
    assert.match(r.data.error, /rsvpId/i);
    console.log("✓ Test 1: Rejects missing rsvpId with 400");
  }

  // 2. Invalid action
  {
    const r = await runTest(JSON.stringify({ rsvpId: "rsvp-123", action: "tentative" }));
    assert.equal(r.code, 400);
    assert.equal(r.data.success, false);
    assert.match(r.data.error, /Invalid action/i);
    console.log("✓ Test 2: Rejects invalid action with 400");
  }

  // 3. Document 404
  {
    const mockDb = {
      getDocument: async () => {
        throw new Error("Document not found");
      },
    };
    const r = await runTest(JSON.stringify({ rsvpId: "rsvp-nonexistent", action: "approve" }), mockDb);
    assert.equal(r.code, 404);
    assert.equal(r.data.success, false);
    console.log("✓ Test 3: Returns 404 when RSVP document does not exist");
  }

  // 4. Capacity exceeded 409
  {
    const mockDb = {
      getDocument: async (db, col, id) => {
        if (col === "invitation_rsvps") {
          return { $id: "rsvp-current", invitationId: "inv-royal-gala", companionsCount: 2 }; // party size 3
        }
        if (col === "invitations") {
          return { $id: "inv-royal-gala", maxCapacity: 10 };
        }
      },
      listDocuments: async () => ({
        documents: [
          { $id: "doc-1", companionsCount: 7, status: "approved" }, // party size 8
        ],
      }),
    };
    const r = await runTest(JSON.stringify({ rsvpId: "rsvp-current", action: "approve" }), mockDb);
    assert.equal(r.code, 409);
    assert.equal(r.data.success, false);
    assert.equal(r.data.currentCapacity, 8);
    assert.equal(r.data.maxCapacity, 10);
    assert.equal(r.data.requested, 3);
    assert.match(r.data.error, /capacity/i);
    console.log("✓ Test 4: Enforces atomic capacity check and returns 409 when exceeded");
  }

  // 5. Successful Approve
  {
    let updatePayload = null;
    const mockDb = {
      getDocument: async (db, col, id) => {
        if (col === "invitation_rsvps") {
          return {
            $id: "rsvp-101",
            invitationId: "inv-royal-gala",
            guestName: "Lady Sarah Spencer",
            guestEmail: "sarah@spencer.co.uk",
            companionsCount: 1,
            status: "pending",
          };
        }
        if (col === "invitations") {
          return { $id: "inv-royal-gala", maxCapacity: 50 };
        }
      },
      listDocuments: async () => ({
        documents: [{ $id: "doc-other", companionsCount: 1, status: "approved" }],
      }),
      updateDocument: async (db, col, id, data) => {
        updatePayload = data;
        return {
          $id: id,
          guestName: "Lady Sarah Spencer",
          guestEmail: "sarah@spencer.co.uk",
          ...data,
        };
      },
    };

    const r = await runTest(JSON.stringify({ rsvpId: "rsvp-101", action: "approve" }), mockDb);
    assert.equal(r.code, 200);
    assert.equal(r.data.success, true);
    assert.equal(r.data.action, "approve");
    assert.equal(r.data.status, "approved");
    assert.equal(r.data.rsvpId, "rsvp-101");
    assert.match(r.data.passToken, /^VIP-[0-9A-Z]{4}-[0-9A-Z]{4}$/);
    assert.match(r.data.qrCodeUrl, /token=VIP-[0-9A-Z]{4}-[0-9A-Z]{4}/);
    assert.equal(updatePayload.status, "approved");
    assert.equal(updatePayload.passToken, r.data.passToken);
    assert.equal(updatePayload.qrCodeUrl, r.data.qrCodeUrl);
    assert.ok(updatePayload.respondedAt);
    console.log("✓ Test 5: Approves RSVP, generates VIP pass token and QR URL with 200");
  }

  // 6. Successful Decline
  {
    let updatePayload = null;
    const mockDb = {
      getDocument: async (db, col, id) => {
        return {
          $id: "rsvp-102",
          invitationId: "inv-royal-gala",
          guestName: "Lord Arthur Pendelton",
          guestEmail: "arthur@estate.org",
          companionsCount: 0,
          status: "pending",
        };
      },
      updateDocument: async (db, col, id, data) => {
        updatePayload = data;
        return {
          $id: id,
          guestName: "Lord Arthur Pendelton",
          guestEmail: "arthur@estate.org",
          ...data,
        };
      },
    };

    const r = await runTest(
      JSON.stringify({
        rsvpId: "rsvp-102",
        action: "decline",
        rejectionReason: "Venue full capacity reached",
      }),
      mockDb
    );
    assert.equal(r.code, 200);
    assert.equal(r.data.success, true);
    assert.equal(r.data.action, "decline");
    assert.equal(r.data.status, "declined");
    assert.equal(r.data.rsvpId, "rsvp-102");
    assert.equal(r.data.rejectionReason, "Venue full capacity reached");
    assert.equal(updatePayload.status, "declined");
    assert.ok(updatePayload.respondedAt);
    assert.ok(updatePayload.dynamicResponsesJson.includes("Venue full capacity reached"));
    console.log("✓ Test 6: Declines RSVP and persists rejectionReason with 200");
  }

  console.log("All process-rsvp-action unit tests passed successfully!");
}

testSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
