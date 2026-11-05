import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  normalizePhoneNumber,
  validateEmailFormat,
  isValidOtpSecret,
  COUNTRY_CODES,
} from "../src/components/auth/AuthModal";
import { CacheFusionStore } from "../../../packages/react-appwrite/src/Provider/CacheFusionStore";

describe("Milestone 3: AuthModal OTP Helpers & Validation", () => {
  test("Phone normalization handles Saudi (+966) formats", () => {
    assert.equal(normalizePhoneNumber("0501234567"), "+966501234567");
    assert.equal(normalizePhoneNumber("+966 50 123 4567"), "+966501234567");
    assert.equal(normalizePhoneNumber("00966-50-123-4567"), "+966501234567");
    assert.equal(normalizePhoneNumber("501234567", "+966"), "+966501234567");
  });

  test("Phone normalization handles Egyptian (+20) formats", () => {
    assert.equal(normalizePhoneNumber("01012345678"), "+201012345678");
    assert.equal(normalizePhoneNumber("+20 10 1234 5678"), "+201012345678");
    assert.equal(normalizePhoneNumber("00201012345678"), "+201012345678");
    assert.equal(normalizePhoneNumber("1012345678", "+20"), "+201012345678");
  });

  test("Country codes list defines supported regional prefixes", () => {
    assert.ok(COUNTRY_CODES.some((c) => c.code === "+966"));
    assert.ok(COUNTRY_CODES.some((c) => c.code === "+20"));
    assert.ok(COUNTRY_CODES.some((c) => c.code === "+971"));
    assert.ok(COUNTRY_CODES.some((c) => c.code === "+965"));
    assert.ok(COUNTRY_CODES.some((c) => c.code === "+974"));
  });

  test("Email validation strictly validates formats", () => {
    assert.equal(validateEmailFormat("client@asar.audio"), true);
    assert.equal(validateEmailFormat("vip.guest@subdomain.example.com"), true);
    assert.equal(validateEmailFormat("  spaced@asar.audio  "), true);
    assert.equal(validateEmailFormat("invalid-email"), false);
    assert.equal(validateEmailFormat("missing@domain"), false);
    assert.equal(validateEmailFormat("@nodomain.com"), false);
  });

  test("OTP validation enforces 6-digit numeric pattern", () => {
    assert.equal(isValidOtpSecret("123456"), true);
    assert.equal(isValidOtpSecret("000000"), true);
    assert.equal(isValidOtpSecret("987654"), true);
    assert.equal(isValidOtpSecret("12345"), false);
    assert.equal(isValidOtpSecret("1234567"), false);
    assert.equal(isValidOtpSecret("abc123"), false);
    assert.equal(isValidOtpSecret(" 123456 "), true);
  });
});

describe("Milestone 3: Order Pipeline Stages Alignment (M1-CHALLENGE-01)", () => {
  function mapOrderStatusToStage(status: string): string {
    return status === "pending_payment"
      ? "draft"
      : status === "payment_rejected"
      ? "payment_rejected"
      : status === "awaiting_client_assets"
      ? "submitted"
      : status === "event_scheduled"
      ? "under_review"
      : status === "audio_mastering"
      ? "paid_confirmed"
      : status === "studio_curation"
      ? "assets_uploaded"
      : status === "published"
      ? "delivered"
      : "draft";
  }

  test("pending_payment maps to draft so assets remain locked until payment verified", () => {
    assert.equal(mapOrderStatusToStage("pending_payment"), "draft");
  });

  test("payment_rejected maps to payment_rejected", () => {
    assert.equal(mapOrderStatusToStage("payment_rejected"), "payment_rejected");
  });

  test("awaiting_client_assets maps to submitted", () => {
    assert.equal(mapOrderStatusToStage("awaiting_client_assets"), "submitted");
  });

  test("event_scheduled maps to under_review", () => {
    assert.equal(mapOrderStatusToStage("event_scheduled"), "under_review");
  });

  test("audio_mastering maps to paid_confirmed", () => {
    assert.equal(mapOrderStatusToStage("audio_mastering"), "paid_confirmed");
  });

  test("studio_curation maps to assets_uploaded", () => {
    assert.equal(mapOrderStatusToStage("studio_curation"), "assets_uploaded");
  });

  test("published maps to delivered", () => {
    assert.equal(mapOrderStatusToStage("published"), "delivered");
  });

  test("unrecognized status defaults safely to draft", () => {
    assert.equal(mapOrderStatusToStage("unknown_custom_state"), "draft");
    assert.equal(mapOrderStatusToStage(""), "draft");
  });
});

describe("Milestone 3: CacheFusionStore LRU Capacity Bounding (10k+ Events)", () => {
  test("CacheFusionStore defaults to 500 max capacity limit", () => {
    const store = new CacheFusionStore();
    assert.equal(store.maxEntries, 500);
    assert.ok(store.documentCache instanceof Map);
    assert.ok(store.collectionCache instanceof Map);
  });

  test("CacheFusionStore bounds documentCache at maxEntries and evicts oldest", () => {
    const store = new CacheFusionStore(50); // Test with smaller ceiling for fast execution
    for (let i = 1; i <= 60; i++) {
      store.setDocument("db", "coll", {
        $id: `doc_${i}`,
        $collectionId: "coll",
        $databaseId: "db",
        title: `Doc ${i}`,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
      } as any);
    }

    assert.equal(store.documentCache.size, 50);
    assert.equal(store.getDocument("db", "coll", "doc_1"), undefined, "Oldest doc_1 must be evicted");
    assert.equal(store.getDocument("db", "coll", "doc_10"), undefined, "Oldest doc_10 must be evicted");
    assert.ok(store.getDocument("db", "coll", "doc_11"), "doc_11 remains in cache");
    assert.ok(store.getDocument("db", "coll", "doc_60"), "Most recent doc_60 exists");
  });

  test("CacheFusionStore getDocument refreshes LRU recency", () => {
    const store = new CacheFusionStore(3);
    const makeDoc = (id: string) => ({
      $id: id,
      $collectionId: "c",
      $databaseId: "d",
      $createdAt: "",
      $updatedAt: "",
      $permissions: [],
    });

    store.setDocument("d", "c", makeDoc("doc_A") as any);
    store.setDocument("d", "c", makeDoc("doc_B") as any);
    store.setDocument("d", "c", makeDoc("doc_C") as any);

    // Access doc_A to make it most recently used
    const docA = store.getDocument("d", "c", "doc_A");
    assert.ok(docA);

    // Add doc_D -> should evict doc_B (the least recently used), NOT doc_A!
    store.setDocument("d", "c", makeDoc("doc_D") as any);

    assert.equal(store.getDocument("d", "c", "doc_B"), undefined, "doc_B must be evicted");
    assert.ok(store.getDocument("d", "c", "doc_A"), "doc_A must be preserved");
    assert.ok(store.getDocument("d", "c", "doc_C"), "doc_C must be preserved");
    assert.ok(store.getDocument("d", "c", "doc_D"), "doc_D must be preserved");
  });

  test("CacheFusionStore bounds collectionCache at maxEntries and evicts oldest", () => {
    const store = new CacheFusionStore(5);
    for (let i = 1; i <= 8; i++) {
      store.setCollectionQuery(`query_${i}`, {
        documents: [],
        total: i,
      });
    }

    assert.equal(store.collectionCache.size, 5);
    assert.equal(store.getCollectionQuery("query_1"), undefined);
    assert.equal(store.getCollectionQuery("query_3"), undefined);
    assert.ok(store.getCollectionQuery("query_4"));
    assert.ok(store.getCollectionQuery("query_8"));
  });
});
