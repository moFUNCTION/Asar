# Handoff Report — Adversarial Subdomain Resolution & Cache Stress Verification

**Agent**: `challenger_m6_1` (Role: Subdomain Stress Challenger)  
**Date**: 2026-11-03T23:16:00Z  
**Verdict**: **`APPROVE`**

---

## 1. Observation

### Test Execution & Output
- **Target Harness**: `d:\asar\.agents\teamwork\challenger_m6_1\stress.test.ts`
- **Execution Command**:
  ```powershell
  node --experimental-strip-types --test .agents/teamwork/challenger_m6_1/stress.test.ts
  ```
- **Harness Output Verbatim**:
  ```text
  ▶ Adversarial Stress — Extreme Hostnames & Ports
    ✔ handles standard and custom ports on RFC 6761 localhost (1.6415ms)
    ✔ handles production apex domains with ports attached (0.6102ms)
    ✔ handles protocols (http://, https://, mixed case) and path appendages (0.459ms)
    ✔ handles surrounding whitespace and irregular whitespace safely (0.4237ms)
    ✔ returns null for bare apex domains across ports and protocols (0.3932ms)
    ✔ handles white-labeled custom rootDomains correctly (0.3238ms)
    ✔ returns null for malformed or non-string hostnames safely (0.5566ms)
  ✔ Adversarial Stress — Extreme Hostnames & Ports (7.0234ms)
  ▶ Adversarial Stress — Multi-Level Subdomains
    ✔ extracts the primary tenant label in multi-level localhost subdomains (0.3098ms)
    ✔ extracts the primary tenant label in multi-level production apex domains (0.2343ms)
    ✔ rejects multi-level subdomain when the tenant label is a reserved system name (0.3415ms)
    ✔ accepts tenant label when inner label happens to be a reserved word (0.2567ms)
    ✔ returns null when tenant label contains invalid characters in multi-level domain (0.1282ms)
  ✔ Adversarial Stress — Multi-Level Subdomains (1.6959ms)
  ▶ Adversarial Stress — IP Address Immunity
    ✔ never extracts subdomains from IPv4 loopback (127.0.0.1) (0.2531ms)
    ✔ never extracts subdomains from wildcard IPv4 (0.0.0.0) (0.1715ms)
    ✔ never extracts subdomains from private / LAN IPv4 addresses (0.3306ms)
    ✔ never extracts subdomains from public IPv4 addresses (3.2313ms)
    ✔ never extracts subdomains from IPv6 loopback (::1 and [::1]) (0.4759ms)
    ✔ never extracts subdomains from global or link-local IPv6 addresses (0.5638ms)
    ✔ resolveSubdomain triggers bare apex portal state for all IP formats (0.9101ms)
  ✔ Adversarial Stress — IP Address Immunity (6.4173ms)
  ▶ Adversarial Stress — All 16 Reserved Subdomains
    ✔ verifies RESERVED_SUBDOMAINS contains exactly or at least all 16 canonical names (0.4745ms)
    ✔ isReservedSubdomain returns true for all 16 reserved names across casing and whitespace (0.2063ms)
    ✔ validateSubdomainSlug rejects all 16 reserved names with explicit 'reserved' error (0.2067ms)
    ✔ extractSubdomain returns null for all 16 reserved names on RFC 6761 localhost:3004 (0.1505ms)
    ✔ extractSubdomain returns null for all 16 reserved names on production asar.me (0.1378ms)
    ✔ extractSubdomain rejects all 16 reserved names passed via query override (0.3207ms)
    ✔ resolveSubdomain rejects all 16 reserved names from hostname (0.3706ms)
    ✔ resolveSubdomain rejects all 16 reserved names from routeParam (0.3154ms)
  ✔ Adversarial Stress — All 16 Reserved Subdomains (2.694ms)
  ▶ Adversarial Stress — RFC 1123 Boundary Fuzzing
    ✔ accepts valid 1-character slugs (minimum RFC 1123 length) (0.5163ms)
    ✔ accepts valid 2-character slugs (0.1366ms)
    ✔ boundary test: accepts exact 63-character slug (RFC 1123 maximum limit) (0.1225ms)
    ✔ boundary test: rejects 64-character slug (RFC 1123 overflow by 1 char) (0.1067ms)
    ✔ boundary test: rejects extreme length slugs (100 and 500 chars) (0.1471ms)
    ✔ rejects leading hyphens across all permutations (0.3624ms)
    ✔ rejects trailing hyphens across all permutations (0.256ms)
    ✔ rejects solitary and only-hyphen strings (0.2004ms)
    ✔ accepts valid internal consecutive hyphens (RFC 1123 compliance) (0.1661ms)
    ✔ rejects uppercase and mixed-case strings strictly in validateSubdomainSlug (0.2318ms)
    ✔ rejects special characters, spaces, and punctuation fuzzing (0.7004ms)
    ✔ rejects emojis and surrogate pairs safely without crashing (0.5129ms)
    ✔ rejects UTF-8 Arabic and non-Latin unicode strings safely without crashing (0.2412ms)
    ✔ handles null, undefined, non-strings, and empty strings safely (0.2195ms)
  ✔ Adversarial Stress — RFC 1123 Boundary Fuzzing (4.7357ms)
  ▶ Adversarial Stress — Query Override & Precedence
    ✔ Tier 1: ?subdomain= query parameter overrides routeParam, hostname, and fallback (0.4987ms)
    ✔ Tier 1: ?memory= and ?event= query parameters work identically to ?subdomain= (0.2403ms)
    ✔ Tier 1: query override normalizes uppercase and whitespace (0.2058ms)
    ✔ Precedence Bypass: when allowQueryOverride: false, query override is strictly ignored (0.1924ms)
    ✔ Precedence Bypass: when allowQueryOverride: false and no routeParam, hostname wins (0.2012ms)
    ✔ Resilience: invalid query param falls through safely to routeParam or hostname (0.2228ms)
    ✔ Tier 2: routeParam normalizes uppercase and whitespace (0.1472ms)
    ✔ Tier 4: fallbackSubdomain is only reached when all higher tiers fail (0.1993ms)
  ✔ Adversarial Stress — Query Override & Precedence (2.4178ms)
  ▶ Adversarial Stress — LocalStorage Cache Schema Corruptions
    ✔ handles completely invalid JSON strings without throwing and returns [] (1.9631ms)
    ✔ handles primitive JSON values without throwing and returns [] (0.4343ms)
    ✔ handles null and undefined input safely and returns [] (0.2754ms)
    ✔ handles single-record objects by wrapping them into an array [record] (0.8453ms)
    ✔ handles wrapped objects with standard envelope keys (items, memories, invitations, documents, list, data) (0.4516ms)
    ✔ handles empty object ({}) by returning [] (0.1721ms)
    ✔ filters out nulls, undefined, and non-object elements inside arrays (0.2169ms)
    ✔ findInCache finds records by slug, id, and Appwrite $id with case-insensitivity (0.3677ms)
    ✔ findInCache safely skips records without id or slug without false matches (0.2035ms)
    ✔ getNormalizedCache reads from storage and returns normalized array (0.3963ms)
    ✔ getNormalizedCache handles corrupt JSON in storage gracefully (0.1919ms)
    ✔ setNormalizedCache upserts items cleanly and overwrites matching identifiers (0.4347ms)
    ✔ handles ThrowingStorage (e.g. sandboxed iframes or QuotaExceededError) safely (1.6616ms)
  ✔ Adversarial Stress — LocalStorage Cache Schema Corruptions (8.6133ms)
  ▶ Adversarial Stress — URL Builder Edge Scenarios
    ✔ builds correct production and dev URLs for standard booth slug (0.3561ms)
    ✔ builds correct production and dev URLs for standard invitation slug (0.1158ms)
    ✔ handles empty or blank slug by generating bare apex / localhost URLs (0.0971ms)
    ✔ handles custom rootDomain with leading dot stripping (0.0888ms)
    ✔ handles boundary 63-character slug in URL builder cleanly (0.1122ms)
  ✔ Adversarial Stress — URL Builder Edge Scenarios (0.9598ms)
  ℹ tests 67
  ℹ suites 8
  ℹ pass 67
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 371.798
  ```

### Combined Monorepo Automated Tests
- Command:
  ```powershell
  node --experimental-strip-types --test apps/Renderer/test/subdomainResolution.test.ts apps/Renderer/test/memoryClassifier.test.ts apps/Renderer/test/storefrontRouting.test.ts .agents/teamwork/challenger_m6_1/stress.test.ts
  ```
- Result: **130 tests across 21 suites passing**, 0 failed, duration: 946ms.

### TypeScript Compilation Status
- `npx tsc --noEmit -p apps/Renderer/tsconfig.json` -> Exit code 0 (clean).
- `npx tsc --noEmit -p packages/react-appwrite/tsconfig.json` -> Exit code 0 (clean).

---

## 2. Logic Chain

1. **Extreme Hostnames & Ports**:
   - `subdomain.ts:165-169` splits by `:`, `/`, `?`, `#` and normalizes protocols with `/^[a-z]+:\/\//i`.
   - Hostnames with ports (e.g. `mina-and-maryam.localhost:3004`, `omar-and-layla.localhost:80`, `custom-showcase.asar.me:3000`) cleanly strip ports and isolate the candidate label.
   - Hostnames with attached URLs or paths (e.g. `http://mina-and-maryam.localhost:3004/s/mina-and-maryam`) resolve accurately to `mina-and-maryam`.
   - Malformed, non-string, or empty inputs return `null` without throwing.

2. **Multi-Level Subdomains**:
   - In `subdomain.ts:185` and `useSubdomain.ts:62`, `sub.split(".")[0]` extracts the leftmost tenant label in multi-level domains (e.g. `a.b.c.localhost` -> `a`, `foo-bar.baz.localhost:3004` -> `foo-bar`).
   - If the leftmost label is reserved (e.g. `admin.tenant1.localhost`), it is rejected and returns `null`.
   - If an inner label is reserved but the leftmost label is valid (e.g. `mina-and-maryam.admin.localhost`), the valid leftmost tenant label `mina-and-maryam` is extracted.

3. **IP Address Immunity**:
   - `subdomain.ts:175-180` and `useSubdomain.ts:52-56` explicitly guard against `localhost`, `127.0.0.1`, `0.0.0.0`, and all IPv4 octets via `/^(\d{1,3}\.){3}\d{1,3}$/`.
   - IPv6 addresses (`::1`, `[::1]:3004`, `fe80::1`, `[2001:db8::1]:3004`) split on colons to empty or non-root prefixes that do not end in `.localhost` or root domains, reliably returning `null`.
   - `resolveSubdomain` consistently outputs `{ subdomain: null, isSubdomain: false, source: null }` for all IP formats, safely triggering the Storefront Showcase Portal or 404 rather than misrouting.

4. **All 16 Reserved System Subdomains**:
   - All 16 reserved system names (`admin`, `api`, `booth`, `main`, `invitation`, `app`, `cdn`, `mail`, `auth`, `dev`, `staging`, `test`, `www`, `storefront`, `status`, `account`) are present in `RESERVED_SUBDOMAINS` and `RESERVED_SUBDOMAIN_LIST`.
   - Each was empirically stressed across 8 distinct verification vectors:
     - `RESERVED_SUBDOMAINS.has(name)` -> `true`
     - `isReservedSubdomain` (with mixed-casing and whitespace) -> `true`
     - `validateSubdomainSlug` -> `{ isValid: false, error: ...reserved... }`
     - `extractSubdomain("${name}.localhost:3004")` -> `null`
     - `extractSubdomain("${name}.asar.me")` -> `null`
     - `extractSubdomain` query override `?subdomain=${name}` -> `null`
     - `resolveSubdomain({ hostname: "${name}.localhost:3004" })` -> `isSubdomain: false`
     - `resolveSubdomain({ routeParam: name })` -> `isSubdomain: false`

5. **RFC 1123 Boundary Fuzzing**:
   - `validateSubdomainSlug` enforces 1 to 63 character limits (`/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/`).
   - 1-character slugs (`a`, `z`, `0`, `9`) pass.
   - Exact 63-character slug passes; 64-character slug strictly fails with RFC 1123 length error.
   - Leading (`-slug`), trailing (`slug-`), solitary (`-`), and only-hyphen (`---`) strings fail.
   - Consecutive internal hyphens (`foo--bar`, `a---b`) are legally accepted per RFC 1123 / DNS standards.
   - Upper/mixed casing, 24 illegal punctuation symbols, emojis (`💍`, `👰`), and Arabic Unicode characters (`أثر`, `مينا-ومريم`) are safely rejected without crashing.

6. **Query Override Precedence & Precedence Bypass**:
   - Tier 1 query parameter (`?subdomain=`, `?memory=`, `?event=`) overrides lower tiers.
   - When `allowQueryOverride: false` is supplied, query parameters are strictly ignored, and Tier 2 (routeParam) or Tier 3 (hostname) takes precedence.
   - When an invalid or reserved slug is passed in query parameters (e.g. `?subdomain=admin`), Tier 1 safely degrades and falls through to Tier 2 or Tier 3 without throwing.

7. **LocalStorage Cache Normalization & Corruptions**:
   - `cacheHelper.ts:normalizeCacheArray` safely parses invalid JSON strings, unclosed braces, XML tags, and primitives (`123`, `"string"`, `true`, `null`), returning `[]`.
   - Single-object schemas `{ id: "...", slug: "..." }` are normalized into single-element arrays `[obj]`.
   - Nested envelope schemas (`items`, `memories`, `invitations`, `documents`, `list`, `data`) unpack into clean record arrays.
   - Dirty arrays containing `null`, `undefined`, numbers, and booleans are cleanly filtered to retain only valid object records.
   - Corrupt caches or missing IDs in `findInCache` avoid false positives and return `null`.
   - `ThrowingStorage` (simulating sandboxed iframes or `QuotaExceededError`) returns `[]` from `getNormalizedCache` and `false` from `setNormalizedCache` without throwing unhandled exceptions.

8. **URL Builder Boundary Alignment**:
   - `buildMemoryUrls` formats both canonical production (`https://${slug}.asar.me`) and dev localhost URLs (`http://${slug}.localhost:3004` on renderer, `3002` on booth, `3003` on invitation).
   - Empty/blank slugs fall back to apex root domain and bare localhost roots.
   - Boundary 63-character slugs format correctly without truncation or syntax corruption.

---

## 3. Caveats

- **Internationalized Domain Names (IDN)**: Slugs containing non-ASCII Arabic characters (e.g. `أثر`) are rejected under strict RFC 1123 ASCII rules. In future production enhancements with native Arabic domain support, Punycode encoding (`xn--...`) will be needed.
- **Nested Query Precedence**: When both `?subdomain=` and `?memory=` are supplied in the query string, `?subdomain=` takes priority. If `?subdomain=` contains an invalid slug while `?memory=` is valid, the current implementation considers Tier 1 exhausted and falls to Tier 2 rather than evaluating secondary query parameters. This is consistent with designed short-circuit evaluation.

---

## 4. Conclusion

**Verdict: `APPROVE`**

The Storefront Subdomain Engine (`subdomain.ts`, `useSubdomain.ts`, `cacheHelper.ts`, `urlBuilder.ts`) and the dedicated Renderer app routing architecture exhibit total resilience across all 8 stress test dimensions. Zero bugs, crashes, or unhandled exceptions were observed during empirical adversarial execution.

---

## 5. Verification Method

To independently reproduce and verify this assessment:

1. **Run the Adversarial Stress Test Harness**:
   ```powershell
   node --experimental-strip-types --test .agents/teamwork/challenger_m6_1/stress.test.ts
   ```
   *Expected: 67 tests passing, 0 failing across 8 suites in ~370ms.*

2. **Run the Full Renderer Suite with Stress Harness**:
   ```powershell
   node --experimental-strip-types --test apps/Renderer/test/subdomainResolution.test.ts apps/Renderer/test/memoryClassifier.test.ts apps/Renderer/test/storefrontRouting.test.ts .agents/teamwork/challenger_m6_1/stress.test.ts
   ```
   *Expected: 130 tests passing, 0 failing across 21 suites.*

3. **Verify Clean Monorepo TypeScript Compilation**:
   ```powershell
   npx tsc --noEmit -p apps/Renderer/tsconfig.json
   npx tsc --noEmit -p packages/react-appwrite/tsconfig.json
   ```
   *Expected: Clean exit code 0, 0 errors.*
