// =============================================================
// ASAR (Athar / أثر) — Storefront LocalStorage Cache Normalizer
// Defensively handles single-object vs array schemas in localStorage caches
// =============================================================
export const ASAR_CACHE_KEYS = {
    BOOTH_MEMORIES: "asar_booth_memories_cache",
    INVITATIONS: "asar_invitations_cache",
    ACTIVE_INVITATION: "asar_active_invitation",
};
/**
 * Safely resolves localStorage instance across environments (browser, SSR/Node, restricted iframes).
 */
export function getSafeLocalStorage(storageOverride) {
    if (storageOverride) {
        return storageOverride;
    }
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            return window.localStorage;
        }
    }
    catch {
        // Restricted environment (e.g. sandboxed iframe or disabled cookies)
    }
    return null;
}
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
export function normalizeCacheArray(data) {
    if (data == null) {
        return [];
    }
    let parsed = data;
    if (typeof data === "string") {
        const trimmed = data.trim();
        if (!trimmed) {
            return [];
        }
        try {
            parsed = JSON.parse(trimmed);
        }
        catch {
            // Corrupt JSON string
            return [];
        }
    }
    if (parsed == null) {
        return [];
    }
    // Case 1: Already an array
    if (Array.isArray(parsed)) {
        return parsed.filter((item) => item != null && typeof item === "object");
    }
    // Case 2: Object representation
    if (typeof parsed === "object") {
        const obj = parsed;
        // Check for common envelope / wrapper properties
        const wrapperKeys = [
            "items",
            "memories",
            "invitations",
            "documents",
            "list",
            "data",
        ];
        for (const key of wrapperKeys) {
            if (Array.isArray(obj[key])) {
                return obj[key].filter((item) => item != null && typeof item === "object");
            }
        }
        // Check if the object is empty ({})
        const keys = Object.keys(obj);
        if (keys.length === 0) {
            return [];
        }
        // Single record object -> wrap into array [obj]
        return [obj];
    }
    // Case 3: Primitive values (numbers, booleans, symbols)
    return [];
}
/**
 * Defensively retrieves and normalizes cached records from localStorage.
 * Always returns a clean array, never throwing errors.
 */
export function getNormalizedCache(key, storageOverride) {
    const storage = getSafeLocalStorage(storageOverride);
    if (!storage) {
        return [];
    }
    try {
        const raw = storage.getItem(key);
        if (!raw) {
            return [];
        }
        return normalizeCacheArray(raw);
    }
    catch {
        return [];
    }
}
/**
 * Finds a record in a normalized cache (or provided array) matching a given slug or id.
 */
export function findInCache(cacheOrKey, identifier, storageOverride) {
    if (!identifier) {
        return null;
    }
    const cleanId = identifier.trim().toLowerCase();
    const list = Array.isArray(cacheOrKey)
        ? cacheOrKey
        : getNormalizedCache(cacheOrKey, storageOverride);
    const found = list.find((item) => {
        if (!item || typeof item !== "object")
            return false;
        const s = item.slug ? String(item.slug).trim().toLowerCase() : "";
        const id = item.id ? String(item.id).trim().toLowerCase() : "";
        const appwriteId = item.$id ? String(item.$id).trim().toLowerCase() : "";
        return s === cleanId || id === cleanId || appwriteId === cleanId;
    });
    return found || null;
}
/**
 * Upserts a record or writes an array into the specified cache key in localStorage as a normalized JSON array.
 */
export function setNormalizedCache(key, itemOrItems, storageOverride) {
    const storage = getSafeLocalStorage(storageOverride);
    if (!storage) {
        return false;
    }
    try {
        if (Array.isArray(itemOrItems)) {
            storage.setItem(key, JSON.stringify(itemOrItems));
            return true;
        }
        // Upsert single item into existing cache
        const existing = getNormalizedCache(key, storage);
        const item = itemOrItems;
        const itemId = item.id || item.$id || item.slug;
        let updated;
        if (itemId) {
            const filtered = existing.filter((e) => (e.id || e.$id || e.slug) !== itemId);
            updated = [...filtered, item];
        }
        else {
            updated = [...existing, item];
        }
        storage.setItem(key, JSON.stringify(updated));
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Convenience helper to get normalized booth memories cache.
 */
export function getBoothMemoriesCache(storageOverride) {
    return getNormalizedCache(ASAR_CACHE_KEYS.BOOTH_MEMORIES, storageOverride);
}
/**
 * Convenience helper to get normalized invitations cache.
 */
export function getInvitationsCache(storageOverride) {
    return getNormalizedCache(ASAR_CACHE_KEYS.INVITATIONS, storageOverride);
}
