export declare const ASAR_CACHE_KEYS: {
    readonly BOOTH_MEMORIES: "asar_booth_memories_cache";
    readonly INVITATIONS: "asar_invitations_cache";
    readonly ACTIVE_INVITATION: "asar_active_invitation";
};
export type AsarCacheKey = (typeof ASAR_CACHE_KEYS)[keyof typeof ASAR_CACHE_KEYS] | (string & {});
/**
 * Safely resolves localStorage instance across environments (browser, SSR/Node, restricted iframes).
 */
export declare function getSafeLocalStorage(storageOverride?: Storage | null): Storage | null;
/**
 * Normalizes unknown input (raw JSON string, single object, array, or wrapped payload)
 * into a typed array of records T[].
 *
 * Handles:
 * - Empty / null / undefined -> []
 * - Invalid JSON strings -> []
 * - Standard arrays: [record1, record2] -> [record1, record2]
 * - Single record objects: { slug: '...', ... } -> [{ slug: '...', ... }]
 * - Wrapped objects: { items: [...] }, { memories: [...] }, { documents: [...] }, etc.
 * - Primitive values (numbers, booleans, plain strings) -> []
 */
export declare function normalizeCacheArray<T = any>(data: unknown): T[];
/**
 * Defensively retrieves and normalizes cached records from localStorage.
 * Always returns a clean array, never throwing errors.
 */
export declare function getNormalizedCache<T = any>(key: AsarCacheKey, storageOverride?: Storage | null): T[];
/**
 * Finds a record in a normalized cache (or provided array) matching a given slug or id.
 */
export declare function findInCache<T extends {
    slug?: string;
    id?: string;
    $id?: string;
}>(cacheOrKey: AsarCacheKey | T[], identifier: string, storageOverride?: Storage | null): T | null;
/**
 * Upserts a record or writes an array into the specified cache key in localStorage as a normalized JSON array.
 */
export declare function setNormalizedCache<T extends {
    slug?: string;
    id?: string;
    $id?: string;
}>(key: AsarCacheKey, itemOrItems: T | T[], storageOverride?: Storage | null): boolean;
/**
 * Convenience helper to get normalized booth memories cache.
 */
export declare function getBoothMemoriesCache<T = any>(storageOverride?: Storage | null): T[];
/**
 * Convenience helper to get normalized invitations cache.
 */
export declare function getInvitationsCache<T = any>(storageOverride?: Storage | null): T[];
//# sourceMappingURL=cacheHelper.d.ts.map