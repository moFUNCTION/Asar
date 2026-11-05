export declare const ASAR_DATABASE_ID = "asar-db";
export declare const ASAR_COLLECTIONS: {
    readonly USERS: "users";
    readonly PLANS: "plans";
    readonly ORDERS: "orders";
    readonly PAYMENTS: "payments";
    readonly BOOTH_MEMORIES: "booth_memories";
    readonly BOOTH_VOICE_RECORDS: "booth_voice_records";
    readonly BOOTH_MEDIA: "booth_media";
    readonly INVITATIONS: "invitations";
    readonly INVITATION_RSVPS: "invitation_rsvps";
    readonly WISHING_WALL_MESSAGES: "wishing_wall_messages";
};
export declare const ASAR_DEFAULT_BUCKET = "asar_storage";
export declare const ASAR_BUCKETS: {
    readonly PAYMENT_RECEIPTS: "payment_receipts";
    readonly CLIENT_RAW_ASSETS: "client_raw_assets";
    readonly BOOTH_MASTERED_AUDIO: "booth_mastered_audio";
    readonly BOOTH_GALLERY_MEDIA: "booth_gallery_media";
    readonly INVITATION_ASSETS: "invitation_assets";
    readonly DEFAULT: "asar_storage";
};
export declare const ASAR_FUNCTIONS: {
    readonly PROCESS_RSVP_ACTION: "process-rsvp-action";
    readonly GENERATE_VIP_PASS: "generate-vip-pass";
};
export declare const ASAR_TEAMS: {
    readonly ADMINS: "admins";
};
export type AsarCollectionKey = keyof typeof ASAR_COLLECTIONS;
export type AsarCollectionId = (typeof ASAR_COLLECTIONS)[AsarCollectionKey];
export type AsarBucketKey = keyof typeof ASAR_BUCKETS;
export type AsarBucketId = (typeof ASAR_BUCKETS)[AsarBucketKey];
export type AsarFunctionKey = keyof typeof ASAR_FUNCTIONS;
export type AsarFunctionId = (typeof ASAR_FUNCTIONS)[AsarFunctionKey];
export declare function resolveBucketId(bucketId?: string): string;
//# sourceMappingURL=collections.d.ts.map