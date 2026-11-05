# Milestone 1 Handoff Report — Shared Storefront Engine & URL Alignment

## 1. Observation

Direct file observations and commands executed:

1. **`packages/react-appwrite/src/Storefront/urlBuilder.ts`**:
   - `BuildMemoryUrlsParams` was modified to accept optional `rendererPort?: number` (default 3004):
     ```ts
     export interface BuildMemoryUrlsParams {
       slug: string;
       type: "booth" | "invitation";
       port?: number;
       rendererPort?: number;
       isDev?: boolean;
       rootDomain?: string;
     }
     ```
   - `MemoryUrls` was modified to include `devRendererUrl: string`:
     ```ts
     export interface MemoryUrls {
       canonicalUrl: string;
       devLocalhostUrl: string;
       devRendererUrl: string;
       devQueryUrl: string;
       isSubdomain: boolean;
       primaryUrl: string;
     }
     ```
   - `buildMemoryUrls` generates `devRendererUrl`:
     - When slug present: `http://${cleanSlug}.localhost:${rendererPort}` (e.g. `http://mina-and-maryam.localhost:3004`).
     - When slug empty: `http://localhost:${rendererPort}` (e.g. `http://localhost:3004`).
   - Existing fields (`canonicalUrl`, `devLocalhostUrl`, `devQueryUrl`, `isSubdomain`, `primaryUrl`) remain 100% backward compatible.

2. **`packages/react-appwrite/src/Storefront/cacheHelper.ts`**:
   - Created safe localStorage cache normalization helper with:
     - `ASAR_CACHE_KEYS`: constants for `BOOTH_MEMORIES` (`"asar_booth_memories_cache"`), `INVITATIONS` (`"asar_invitations_cache"`), and `ACTIVE_INVITATION` (`"asar_active_invitation"`).
     - `getSafeLocalStorage(storageOverride?)`: safely resolves `localStorage` in browser, SSR/Node, and restricted iframe environments without throwing `SecurityError`.
     - `normalizeCacheArray<T>(data)`: safely parses raw JSON strings or JS data, normalizing both single-object schemas (e.g., from Booth Memory Studio) and array schemas (e.g., from Invitation Studio) into typed arrays `T[]`. Defensively handles corrupt JSON, null/undefined, primitive values, and envelope wrappers (`items`, `memories`, `invitations`, `documents`, `list`, `data`).
     - `getNormalizedCache<T>(key, storageOverride?)`: retrieves and normalizes cached records from localStorage.
     - `findInCache<T>(cacheOrKey, identifier, storageOverride?)`: searches by `slug`, `id`, or `$id` case-insensitively.
     - `setNormalizedCache<T>(key, itemOrItems, storageOverride?)`: writes array or upserts a single item without clobbering other cached records.
     - `getBoothMemoriesCache<T>()` and `getInvitationsCache<T>()`: convenience typed getters.

3. **`packages/react-appwrite/src/Storefront/index.ts` & `src/index.ts`**:
   - `packages/react-appwrite/src/Storefront/index.ts` exports `export * from "./cacheHelper";`.
   - `packages/react-appwrite/src/index.ts` re-exports `export * from "./Storefront";`, exposing all URL builder and cache normalizer utilities at the root package export.

4. **`packages/react-appwrite/test/storefront.test.ts`**:
   - Expanded test suite from 13 to 21 tests.
   - Tests assert `devRendererUrl` generation on port 3004 by default, custom `rendererPort: 3009`, empty slug fallback, and backward compatibility.
   - Tests assert `normalizeCacheArray`, `getNormalizedCache`, `findInCache`, `setNormalizedCache`, and convenience cache getters against edge cases (corrupt JSON, single object, array, envelope wrappers, upserts, case-insensitivity).

5. **Test and Typecheck Tool Output**:
   - Storefront test command:
     `node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts`
     Result:
     ```
     ✔ Reserved Subdomains: contains all required system subdomains (1.4553ms)
     ✔ validateSubdomainSlug: accepts RFC 1123 compliant slugs (0.3641ms)
     ✔ validateSubdomainSlug: rejects invalid and reserved slugs (0.4198ms)
     ✔ extractSubdomain: extracts RFC 6761 localhost subdomains (0.7115ms)
     ✔ extractSubdomain: extracts production apex subdomains (0.3085ms)
     ✔ extractSubdomain: returns null for bare apex, localhost, and IPs (0.2784ms)
     ✔ extractSubdomain: returns null for reserved subdomains (0.1994ms)
     ✔ extractSubdomain: handles query param overrides (0.2468ms)
     ✔ buildMemoryUrls: generates correct URLs for Booth service (0.281ms)
     ✔ buildMemoryUrls: generates correct URLs for Invitation service (0.253ms)
     ✔ buildMemoryUrls: handles empty or missing slug gracefully (0.2106ms)
     ✔ resolveSubdomain: adheres strictly to the 4-tier resolution hierarchy (0.4925ms)
     ✔ Domain Models: BoothMemory and AsarInvitation include subdomain and customDomain (0.1462ms)
     ✔ normalizeCacheArray: handles corrupt, empty, and primitive inputs safely (1.8101ms)
     ✔ normalizeCacheArray: normalizes single-object schemas (e.g. Booth Memory Studio save) (0.309ms)
     ✔ normalizeCacheArray: normalizes array schemas (e.g. Invitation list) (0.5264ms)
     ✔ normalizeCacheArray: unpacks envelope wrapper objects (0.1718ms)
     ✔ getNormalizedCache: safely reads and normalizes from storage (0.2776ms)
     ✔ findInCache: accurately finds records by slug, id, or $id (0.2503ms)
     ✔ setNormalizedCache: writes arrays and upserts single records safely (0.2693ms)
     ✔ getBoothMemoriesCache & getInvitationsCache: retrieve typed data from default keys (0.1805ms)
     ℹ tests 21
     ℹ suites 0
     ℹ pass 21
     ℹ fail 0
     ℹ duration_ms 186.7505
     ```
   - Domain test command:
     `node --experimental-strip-types --test packages/react-appwrite/test/domain.test.ts`
     Result: 7/7 passed, 0 failures.
   - TypeScript compiler typecheck:
     `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json`
     Result: Exit code 0, zero errors.

## 2. Logic Chain

1. In the ASAR monorepo, `apps/Renderer` runs on port 3004 as a dedicated storefront engine rendering dynamic subdomains (`http://${slug}.localhost:3004`). Admin studios need to generate URLs targeting port 3004 while maintaining existing app preview ports (3002 for Booth, 3003 for Invitation) and canonical production URLs (`https://${slug}.asar.me`).
2. By adding `rendererPort?: number` (default 3004) to `BuildMemoryUrlsParams` and `devRendererUrl: string` to `MemoryUrls`, callers obtain the dedicated renderer URL without breaking any existing callers consuming `devLocalhostUrl`, `canonicalUrl`, `devQueryUrl`, `isSubdomain`, or `primaryUrl` (Observation 1).
3. The Admin studio (`BoothMemoryStudio.tsx:254`) previously serialized a single memory object to `localStorage.setItem("asar_booth_memories_cache", JSON.stringify(updatedMemory))`, whereas downstream pages expected an array `BoothMemoryData[]`. To prevent runtime crashes and ensure seamless data sharing across apps and the upcoming `apps/Renderer`, `cacheHelper.ts` was implemented to defensively handle single objects, arrays, and envelopes, returning normalized arrays (Observation 2).
4. Re-exporting `cacheHelper` via `Storefront/index.ts` and `src/index.ts` ensures universal accessibility across all monorepo applications (`apps/Renderer`, `apps/Admin`, `apps/Booth`, `apps/Invitation`) (Observation 3).
5. Comprehensive unit tests verify both port 3004 default URL construction, port overrides, empty slug fallbacks, and every cache normalization path, passing 100% with clean TypeScript type checking (Observations 4 & 5).

## 3. Caveats

- In headless SSR/Node environments, `localStorage` is not globally available; `getSafeLocalStorage` safely returns `null` and normalization returns `[]` unless an explicit mock or storage provider is passed in `storageOverride`.
- When updating cache via `setNormalizedCache` with an item lacking `id`, `$id`, or `slug`, it appends the record without deduplication.

## 4. Conclusion

Milestone 1 is complete. `packages/react-appwrite` now provides:
1. Updated `buildMemoryUrls` with port 3004 `devRendererUrl` and `rendererPort` option, fully backward-compatible.
2. Safe, defensive `localStorage` cache normalization helper (`cacheHelper.ts`) for single-object and array schemas.
3. Universal barrel exports from `Storefront/index.ts` and `src/index.ts`.
4. 21/21 passing unit tests in `storefront.test.ts` and 0 errors in `tsc --noEmit`.

Downstream workers (Milestone 2: `apps/Renderer` scaffolding and routing) can now consume `buildMemoryUrls`, `useSubdomain`, and `getNormalizedCache` / `findInCache` with full confidence.

## 5. Verification Method

To independently verify these deliverables:

1. **Run Unit Tests**:
   ```powershell
   node --experimental-strip-types --test packages/react-appwrite/test/storefront.test.ts
   ```
   *Expected*: 21 passed, 0 failed.

2. **Run Domain Tests (Regression Check)**:
   ```powershell
   node --experimental-strip-types --test packages/react-appwrite/test/domain.test.ts
   ```
   *Expected*: 7 passed, 0 failed.

3. **Verify TypeScript Compilation**:
   ```powershell
   npx tsc --noEmit -p packages/react-appwrite/tsconfig.json
   ```
   *Expected*: Clean exit with code 0 and no output.

4. **Inspect Source Files**:
   - `packages/react-appwrite/src/Storefront/urlBuilder.ts`
   - `packages/react-appwrite/src/Storefront/cacheHelper.ts`
   - `packages/react-appwrite/src/Storefront/index.ts`
