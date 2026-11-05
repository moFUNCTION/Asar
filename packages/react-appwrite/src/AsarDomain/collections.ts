// =============================================================
// ASAR (Athar / أثر) — Canonical Appwrite IDs, Buckets & Functions
// =============================================================

export const ASAR_DATABASE_ID = "asar-db";

export const ASAR_COLLECTIONS = {
  USERS: "users",
  PLANS: "plans",
  ORDERS: "orders",
  PAYMENTS: "payments",
  BOOTH_MEMORIES: "booth_memories",
  BOOTH_VOICE_RECORDS: "booth_voice_records",
  BOOTH_MEDIA: "booth_media",
  INVITATIONS: "invitations",
  INVITATION_RSVPS: "invitation_rsvps",
  WISHING_WALL_MESSAGES: "wishing_wall_messages",
} as const;

export const ASAR_DEFAULT_BUCKET = "asar_storage";

export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "payment_receipts",
  CLIENT_RAW_ASSETS: "client_raw_assets",
  BOOTH_MASTERED_AUDIO: "booth_mastered_audio",
  BOOTH_GALLERY_MEDIA: "booth_gallery_media",
  INVITATION_ASSETS: "invitation_assets",
  DEFAULT: "asar_storage",
} as const;

export const ASAR_FUNCTIONS = {
  PROCESS_RSVP_ACTION: "process-rsvp-action",
  GENERATE_VIP_PASS: "generate-vip-pass",
} as const;

export const ASAR_TEAMS = {
  ADMINS: "admins",
} as const;

export type AsarCollectionKey = keyof typeof ASAR_COLLECTIONS;
export type AsarCollectionId = (typeof ASAR_COLLECTIONS)[AsarCollectionKey];

export type AsarBucketKey = keyof typeof ASAR_BUCKETS;
export type AsarBucketId = (typeof ASAR_BUCKETS)[AsarBucketKey];

export type AsarFunctionKey = keyof typeof ASAR_FUNCTIONS;
export type AsarFunctionId = (typeof ASAR_FUNCTIONS)[AsarFunctionKey];

export function resolveBucketId(bucketId?: string): string {
  return bucketId || ASAR_DEFAULT_BUCKET;
}
