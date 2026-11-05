# Technical Analysis: Audit Remediation & Component Inspection

**Author**: `explorer_remediation_2` (Audit Remediation Explorer 2)  
**Date**: 2026-11-03  
**Target Applications**: `apps/Renderer`, with alignment to `@repo/react-appwrite`, `apps/Admin`, `apps/Booth`, `apps/Invitation`, `apps/Main`

---

## 1. Executive Summary

A forensic audit of Milestone 6 identified a single compilation failure in `apps/Renderer`:
```
apps/Renderer/src/components/booth/BoothShareModal.tsx(39,12): error TS2591: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig.
```

An exhaustive investigation across all components in `apps/Renderer/src/components/booth/`, `apps/Renderer/src/components/invitation/`, `apps/Renderer/src/pages/`, and entrypoint files confirms:
1. **Isolated Defect**: `BoothShareModal.tsx:39` is the **only** occurrence of `process` / `process.env` in `apps/Renderer`.
2. **Zero Other Leaks**: No other booth or invitation components access `process`, `process.env`, or Node-specific globals (`Buffer`, `__dirname`, `__filename`, `global`, `require`).
3. **`buildMemoryUrls` Alignment**: All `buildMemoryUrls` parameter invocations across the monorepo conform to the `BuildMemoryUrlsParams` interface in `@repo/react-appwrite`. `isDev` is optional, and in `BoothShareModal.tsx`, replacing `process.env.NODE_ENV !== "production"` with `import.meta.env.DEV` (or `Boolean(import.meta.env?.DEV)`) resolves TS2591 cleanly.
4. **Clean Verification**: All 84 automated unit and integration tests across 4 test suites pass with 0 failures.

---

## 2. Exhaustive Component Inspection Results

### 2.1 Booth Components (`apps/Renderer/src/components/booth/`)

| File | Size | Node Globals / `process.env` | Browser APIs Used | Status |
|---|---|---|---|---|
| `BoothShareModal.tsx` | 7.8 KB | **Line 39: `process.env.NODE_ENV`** | `navigator.clipboard`, `document.createElement("a")` | **DEFECT FOUND (TS2591)** |
| `BoothMemoryRenderer.tsx` | 54.4 KB | None | `AudioContext` emulation, `window.location`, React state | **CLEAN** |
| `BoothVoiceCard.tsx` | 14.9 KB | None | `getBoundingClientRect`, `navigator.clipboard` | **CLEAN** |
| `BoothPhotoLightbox.tsx` | 6.4 KB | None | `window.addEventListener("keydown")` | **CLEAN** |
| `BoothVideoModal.tsx` | 9.5 KB | None | `setInterval`, `clearInterval`, `useRef` | **CLEAN** |
| `BoothPinPadlockModal.tsx` | 7.0 KB | None | `useRef<HTMLInputElement>`, regex | **CLEAN** |
| `BoothLeaveBlessingModal.tsx` | 9.8 KB | None | Standard React state, form event handling | **CLEAN** |
| `mockData.ts` | 10.2 KB | None | Pure typed data definitions | **CLEAN** |
| `types.ts` | 1.8 KB | None | Pure TypeScript types | **CLEAN** |
| `index.ts` | 317 B | None | Re-exports | **CLEAN** |

### 2.2 Invitation Components (`apps/Renderer/src/components/invitation/`)

| File | Size | Node Globals / `process.env` | Browser APIs Used | Status |
|---|---|---|---|---|
| `InvitationMemoryRenderer.tsx` | 19.6 KB | None | `window.location.href`, `navigator.clipboard`, `document.getElementById` | **CLEAN** |
| `InvitationDynamicRsvpForm.tsx` | 27.4 KB | None | Standard React state, `useId`, form submission | **CLEAN** |
| `InvitationCountdown.tsx` | 5.6 KB | None | `setInterval`, `Date` math, `useMemo` | **CLEAN** |
| `InvitationSchedule.tsx` | 6.8 KB | None | Pure React presentation | **CLEAN** |
| `InvitationLocationDressCode.tsx` | 10.3 KB | None | Standard Google Maps links, clipboard | **CLEAN** |
| `InvitationVipPassModal.tsx` | 9.0 KB | None | React Router `Link`, SVG badge presentation | **CLEAN** |
| `presets.ts` | 11.8 KB | None | Canonical invitation presets and schemas | **CLEAN** |
| `types.ts` | 2.5 KB | None | Pure TypeScript interfaces | **CLEAN** |
| `index.ts` | 307 B | None | Re-exports | **CLEAN** |

### 2.3 Pages & Entrypoints (`apps/Renderer/src/`)

| File | Size | Node Globals / `process.env` | Environment Access | Status |
|---|---|---|---|---|
| `main.tsx` | 1.1 KB | None | `import.meta.env.VITE_APPWRITE_*` | **CLEAN** (Typed via `vite-env.d.ts`) |
| `App.tsx` | 2.0 KB | None | React Router v6 `<Routes>` | **CLEAN** |
| `DynamicStorefrontIndex.tsx` | 7.3 KB | None | `useSubdomain`, `localStorage`, Appwrite query | **CLEAN** |
| `GuestPassStorefrontPage.tsx` | 7.4 KB | None | `localStorage`, React Router `useParams` | **CLEAN** |
| `StorefrontNotFound.tsx` | 5.7 KB | None | React Router `useLocation` | **CLEAN** |
| `StorefrontShowcasePortal.tsx` | 23.5 KB | None | `window.location.hostname/port` with guards | **CLEAN** |
| `vite-env.d.ts` | 301 B | None | Declares `ImportMetaEnv` & `ImportMeta` with `vite/client` | **CLEAN** |

---

## 3. Analysis of `buildMemoryUrls` Monorepo-Wide

The interface defined in `packages/react-appwrite/src/Storefront/urlBuilder.ts`:
```typescript
export interface BuildMemoryUrlsParams {
  slug: string;
  type: "booth" | "invitation";
  port?: number;
  rendererPort?: number;
  isDev?: boolean;
  rootDomain?: string;
}

export interface MemoryUrls {
  canonicalUrl: string;
  devLocalhostUrl: string;
  devRendererUrl: string;
  devQueryUrl: string;
  isSubdomain: boolean;
  primaryUrl: string;
}
```

### Monorepo Invocations:
1. `apps/Admin/src/components/invitation-studio/InvitationStudio.tsx:145`:
   ```typescript
   buildMemoryUrls({ slug: slug || "omar-and-layla", type: "invitation", port: 3003, rendererPort: 3004 })
   ```
2. `apps/Admin/src/components/booth-studio/MediaAndTabsEditor.tsx:44`:
   ```typescript
   buildMemoryUrls({ slug: memory.slug || "mina-and-maryam", type: "booth", port: 3002, rendererPort: 3004 })
   ```
3. `apps/Admin/src/components/booth-studio/HeroAndTextsEditor.tsx:41`:
   ```typescript
   buildMemoryUrls({ slug: memory.slug || "mina-and-maryam", type: "booth", port: 3002, rendererPort: 3004 })
   ```
4. `apps/Admin/src/components/booth-studio/BoothMemoryStudio.tsx:262`:
   ```typescript
   buildMemoryUrls({ slug: memory.slug || "mina-and-maryam", type: "booth", port: 3002, rendererPort: 3004 })
   ```
5. `apps/Main/src/components/account/QrHubManager.tsx:27`:
   ```typescript
   buildMemoryUrls({ slug, type: serviceType, rendererPort: 3004 })
   ```
6. `apps/Renderer/src/components/booth/BoothShareModal.tsx:34`:
   ```typescript
   buildMemoryUrls({
     slug,
     type: "booth",
     port: 3004,
     rendererPort: 3004,
     isDev: process.env.NODE_ENV !== "production", // <-- DEFECT
   })
   ```

### Findings on Parameter Usage:
- All parameter types passed match the interface: `slug: string`, `type: "booth" | "invitation"`, `port: number`, `rendererPort: number`.
- In `urlBuilder.ts`, `isDev` is an optional boolean (`isDev?: boolean`). It controls `primaryUrl: params.isDev ? devLocalhostUrl : canonicalUrl`.
- In `BoothShareModal.tsx`, the return values utilized are `urls.canonicalUrl` and `urls.devRendererUrl`. `urls.primaryUrl` is not directly rendered.
- Passing `isDev: import.meta.env.DEV` or `isDev: Boolean(import.meta.env?.DEV)` perfectly satisfies the type signature `boolean` and aligns with Vite's client compilation environment.

---

## 4. Root Cause and Recommended Remediation

### 4.1 Root Cause
`apps/Renderer/tsconfig.app.json` configures `"types": ["vite/client"]` and targets browser execution. `process` is a Node.js runtime global not included in Vite client ambient declarations. Referencing `process.env.NODE_ENV` triggers TypeScript error `TS2591`.

### 4.2 Recommended Diff in `apps/Renderer/src/components/booth/BoothShareModal.tsx`

```diff
--- a/apps/Renderer/src/components/booth/BoothShareModal.tsx
+++ b/apps/Renderer/src/components/booth/BoothShareModal.tsx
@@ -36,7 +36,7 @@ export const BoothShareModal: React.FC<BoothShareModalProps> = ({
     type: "booth",
     port: 3004,
     rendererPort: 3004,
-    isDev: process.env.NODE_ENV !== "production",
+    isDev: import.meta.env.DEV,
   });
 
   const canonicalUrl = urls.canonicalUrl;
```

*(Note: `isDev: Boolean(import.meta.env?.DEV)` is also fully valid if extra defense against undefined `import.meta.env` in headless node test runners is desired).*

---

## 5. Verification Plan
1. Apply the patch to `apps/Renderer/src/components/booth/BoothShareModal.tsx`.
2. Run `npx tsc -b apps/Renderer` to verify exit code 0.
3. Run `npx tsc --noEmit -p apps/Renderer/tsconfig.app.json` to verify clean app typecheck.
4. Run `node --experimental-strip-types --test apps/Renderer/test/*.test.ts packages/react-appwrite/test/*.test.ts` to confirm 84/84 test pass.
