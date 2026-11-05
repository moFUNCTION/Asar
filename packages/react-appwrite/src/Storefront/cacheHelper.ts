// =============================================================
// ASAR (Athar / أثر) — Storefront LocalStorage Cache Normalizer
// Defensively handles single-object vs array schemas in localStorage caches
// =============================================================

export const ASAR_CACHE_KEYS = {
  BOOTH_MEMORIES: "asar_booth_memories_cache",
  INVITATIONS: "asar_invitations_cache",
  ACTIVE_INVITATION: "asar_active_invitation",
} as const;

export type AsarCacheKey =
  | (typeof ASAR_CACHE_KEYS)[keyof typeof ASAR_CACHE_KEYS]
  | (string & {});

/**
 * Safely resolves localStorage instance across environments (browser, SSR/Node, restricted iframes).
 */
export function getSafeLocalStorage(storageOverride?: Storage | null): Storage | null {
  if (storageOverride) {
    return storageOverride;
  }
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch {
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
export function normalizeCacheArray<T = any>(data: unknown): T[] {
  if (data == null) {
    return [];
  }

  let parsed: unknown = data;

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) {
      return [];
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      // Corrupt JSON string
      return [];
    }
  }

  if (parsed == null) {
    return [];
  }

  // Case 1: Already an array
  if (Array.isArray(parsed)) {
    return parsed.filter(
      (item): item is T => item != null && typeof item === "object"
    );
  }

  // Case 2: Object representation
  if (typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;

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
        return (obj[key] as unknown[]).filter(
          (item): item is T => item != null && typeof item === "object"
        ) as T[];
      }
    }

    // Check if the object is empty ({})
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return [];
    }

    // Single record object -> wrap into array [obj]
    return [obj as unknown as T];
  }

  // Case 3: Primitive values (numbers, booleans, symbols)
  return [];
}

/**
 * Defensively retrieves and normalizes cached records from localStorage.
 * Always returns a clean array, never throwing errors.
 */
export function getNormalizedCache<T = any>(
  key: AsarCacheKey,
  storageOverride?: Storage | null
): T[] {
  const storage = getSafeLocalStorage(storageOverride);
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return [];
    }
    return normalizeCacheArray<T>(raw);
  } catch {
    return [];
  }
}

/**
 * Finds a record in a normalized cache (or provided array) matching a given slug or id.
 */
export function findInCache<T extends { slug?: string; id?: string; $id?: string }>(
  cacheOrKey: AsarCacheKey | T[],
  identifier: string,
  storageOverride?: Storage | null
): T | null {
  if (!identifier) {
    return null;
  }

  const cleanId = identifier.trim().toLowerCase();
  const list: T[] = Array.isArray(cacheOrKey)
    ? cacheOrKey
    : getNormalizedCache<T>(cacheOrKey, storageOverride);

  const found = list.find((item) => {
    if (!item || typeof item !== "object") return false;
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
export function setNormalizedCache<T extends { slug?: string; id?: string; $id?: string }>(
  key: AsarCacheKey,
  itemOrItems: T | T[],
  storageOverride?: Storage | null
): boolean {
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
    const existing = getNormalizedCache<T>(key, storage);
    const item = itemOrItems;
    const itemId = item.id || item.$id || item.slug;

    let updated: T[];
    if (itemId) {
      const filtered = existing.filter(
        (e) => (e.id || e.$id || e.slug) !== itemId
      );
      updated = [...filtered, item];
    } else {
      updated = [...existing, item];
    }

    storage.setItem(key, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Convenience helper to get normalized booth memories cache.
 */
export function getBoothMemoriesCache<T = any>(storageOverride?: Storage | null): T[] {
  return getNormalizedCache<T>(ASAR_CACHE_KEYS.BOOTH_MEMORIES, storageOverride);
}

/**
 * Convenience helper to get normalized invitations cache.
 */
export function getInvitationsCache<T = any>(storageOverride?: Storage | null): T[] {
  return getNormalizedCache<T>(ASAR_CACHE_KEYS.INVITATIONS, storageOverride);
}
