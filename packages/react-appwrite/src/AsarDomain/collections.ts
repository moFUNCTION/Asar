// =============================================================
// ASAR (Athar / أثر) — Canonical Appwrite IDs & Storage Buckets
// =============================================================

export const ASAR_DATABASE_ID = "asar-db";

export const ASAR_COLLECTIONS = {
  PLANS: "plans",
  ORDERS: "orders",
  PAYMENTS: "payments",
  BOOTH_MEMORIES: "booth_memories",
  BOOTH_VOICE_RECORDS: "booth_voice_records",
  BOOTH_MEDIA: "booth_media",
  INVITATIONS: "invitations",
  INVITATION_RSVPS: "invitation_rsvps",
} as const;

export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "payment_receipts",
  CLIENT_RAW_ASSETS: "client_raw_assets",
  BOOTH_MASTERED_AUDIO: "booth_mastered_audio",
  BOOTH_GALLERY_MEDIA: "booth_gallery_media",
  INVITATION_ASSETS: "invitation_assets",
} as const;

export type AsarCollectionKey = keyof typeof ASAR_COLLECTIONS;
export type AsarCollectionId = (typeof ASAR_COLLECTIONS)[AsarCollectionKey];

export type AsarBucketKey = keyof typeof ASAR_BUCKETS;
export type AsarBucketId = (typeof ASAR_BUCKETS)[AsarBucketKey];
