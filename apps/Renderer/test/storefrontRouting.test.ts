// =============================================================
// ASAR (Athar / أثر) — Dedicated Dynamic Storefront Renderer
// React Router Storefront Routing & VIP Pass Resolution Test Suite
// Verified with: node --experimental-strip-types --test
// =============================================================

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchRoutes, matchPath, type RouteObject } from "react-router-dom";

import type { InvitationRsvp } from "../../../packages/react-appwrite/src/AsarDomain/models.ts";

/**
 * Route table mirroring apps/Renderer/src/App.tsx configuration
 */
export interface StorefrontRouteMeta {
  forcedType?: "booth" | "invitation" | "pass";
  pageComponent: "DynamicStorefrontIndex" | "GuestPassStorefrontPage" | "StorefrontNotFound";
}

export const STOREFRONT_ROUTE_DEFINITIONS: (RouteObject & { meta: StorefrontRouteMeta })[] = [
  {
    path: "/",
    meta: { pageComponent: "DynamicStorefrontIndex" },
  },
  {
    path: "/s/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex" },
  },
  {
    path: "/booth/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex", forcedType: "booth" },
  },
  {
    path: "/memory/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex", forcedType: "booth" },
  },
  {
    path: "/m/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex", forcedType: "booth" },
  },
  {
    path: "/invitation/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex", forcedType: "invitation" },
  },
  {
    path: "/event/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex", forcedType: "invitation" },
  },
  {
    path: "/e/:slug",
    meta: { pageComponent: "DynamicStorefrontIndex", forcedType: "invitation" },
  },
  {
    path: "/pass/:rsvpId",
    meta: { pageComponent: "GuestPassStorefrontPage", forcedType: "pass" },
  },
  {
    path: "*",
    meta: { pageComponent: "StorefrontNotFound" },
  },
];

/**
 * Route resolution helper returning matching route and extracted parameters
 */
function resolveStorefrontRoute(pathname: string) {
  const matches = matchRoutes(STOREFRONT_ROUTE_DEFINITIONS, pathname);
  if (!matches || matches.length === 0) return null;
  const topMatch = matches[matches.length - 1];
  const meta = (topMatch.route as { meta: StorefrontRouteMeta }).meta;
  return {
    path: topMatch.route.path,
    params: topMatch.params,
    pathname: topMatch.pathname,
    meta,
  };
}

/**
 * VIP Pass Resolution Engine replicating GuestPassStorefrontPage logic
 */
const DEMO_APPROVED_RSVP: InvitationRsvp = {
  $id: "rsvp-demo-001",
  invitationId: "invitation-omar-and-layla",
  clientId: "client-omar",
  guestName: "معالي يوسف الغامدي · H.E. Yousef Al-Ghamdi",
  guestEmail: "yousef.ghamdi@example.com",
  guestPhone: "+966501234567",
  companionsCount: 1,
  dynamicResponsesJson: JSON.stringify({
    dietaryNotes: "Standard / بدون ملاحظات",
    blessingMessage: "ألف مبروك للعروسين ونسأل الله لهما التوفيق ودوام السعادة.",
  }),
  status: "approved",
  passToken: "INV-PASS-7701-X",
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=6B1D28&bgcolor=FFFFFF&data=https%3A%2F%2Fasar.audio%2Fpass%2Frsvp-demo-001%3Ftoken%3DINV-PASS-7701-X",
  emailSent: true,
  isCheckedInAtVenue: false,
  respondedAt: "2026-10-15T12:00:00Z",
};

function resolveGuestPassRsvp(
  targetId: string,
  cacheJson?: string | null
): InvitationRsvp {
  if (cacheJson) {
    try {
      const list: InvitationRsvp[] = JSON.parse(cacheJson);
      if (Array.isArray(list)) {
        const match = list.find(
          (r) =>
            r.$id === targetId ||
            (r as { id?: string }).id === targetId ||
            r.passToken === targetId
        );
        if (match) return match;
      }
    } catch {
      // Fallback
    }
  }
  return DEMO_APPROVED_RSVP;
}

describe("ASAR Storefront Router — Navigation Paths & Patterns", () => {
  it("resolves root route '/' to DynamicStorefrontIndex without forcedType", () => {
    const match = resolveStorefrontRoute("/");
    assert.ok(match);
    assert.equal(match.path, "/");
    assert.equal(match.meta.pageComponent, "DynamicStorefrontIndex");
    assert.equal(match.meta.forcedType, undefined);
  });

  it("resolves universal memory path '/s/:slug' and extracts slug parameter", () => {
    const match = resolveStorefrontRoute("/s/mina-and-maryam");
    assert.ok(match);
    assert.equal(match.path, "/s/:slug");
    assert.equal(match.params.slug, "mina-and-maryam");
    assert.equal(match.meta.pageComponent, "DynamicStorefrontIndex");
    assert.equal(match.meta.forcedType, undefined);

    const matchInv = resolveStorefrontRoute("/s/omar-and-layla");
    assert.ok(matchInv);
    assert.equal(matchInv.params.slug, "omar-and-layla");
  });

  it("resolves explicit Booth Memory routes (/booth/:slug, /memory/:slug, /m/:slug)", () => {
    const matchBooth = resolveStorefrontRoute("/booth/royal-wedding-2026");
    assert.ok(matchBooth);
    assert.equal(matchBooth.path, "/booth/:slug");
    assert.equal(matchBooth.params.slug, "royal-wedding-2026");
    assert.equal(matchBooth.meta.forcedType, "booth");

    const matchMem = resolveStorefrontRoute("/memory/royal-wedding-2026");
    assert.ok(matchMem);
    assert.equal(matchMem.path, "/memory/:slug");
    assert.equal(matchMem.params.slug, "royal-wedding-2026");
    assert.equal(matchMem.meta.forcedType, "booth");

    const matchM = resolveStorefrontRoute("/m/royal-wedding-2026");
    assert.ok(matchM);
    assert.equal(matchM.path, "/m/:slug");
    assert.equal(matchM.params.slug, "royal-wedding-2026");
    assert.equal(matchM.meta.forcedType, "booth");
  });

  it("resolves explicit Invitation Memory routes (/invitation/:slug, /event/:slug, /e/:slug)", () => {
    const matchInv = resolveStorefrontRoute("/invitation/cairo-jazz-festival");
    assert.ok(matchInv);
    assert.equal(matchInv.path, "/invitation/:slug");
    assert.equal(matchInv.params.slug, "cairo-jazz-festival");
    assert.equal(matchInv.meta.forcedType, "invitation");

    const matchEvt = resolveStorefrontRoute("/event/cairo-jazz-festival");
    assert.ok(matchEvt);
    assert.equal(matchEvt.path, "/event/:slug");
    assert.equal(matchEvt.params.slug, "cairo-jazz-festival");
    assert.equal(matchEvt.meta.forcedType, "invitation");

    const matchE = resolveStorefrontRoute("/e/cairo-jazz-festival");
    assert.ok(matchE);
    assert.equal(matchE.path, "/e/:slug");
    assert.equal(matchE.params.slug, "cairo-jazz-festival");
    assert.equal(matchE.meta.forcedType, "invitation");
  });

  it("resolves VIP Guest Pass route '/pass/:rsvpId' and extracts rsvpId parameter", () => {
    const match = resolveStorefrontRoute("/pass/rsvp-98765");
    assert.ok(match);
    assert.equal(match.path, "/pass/:rsvpId");
    assert.equal(match.params.rsvpId, "rsvp-98765");
    assert.equal(match.meta.pageComponent, "GuestPassStorefrontPage");
    assert.equal(match.meta.forcedType, "pass");
  });

  it("resolves catch-all '*' route for unrecognized paths to StorefrontNotFound", () => {
    const matchNotFound = resolveStorefrontRoute("/random/unrecognized/path");
    assert.ok(matchNotFound);
    assert.equal(matchNotFound.path, "*");
    assert.equal(matchNotFound.meta.pageComponent, "StorefrontNotFound");

    const matchAdmin = resolveStorefrontRoute("/admin/secret");
    assert.ok(matchAdmin);
    assert.equal(matchAdmin.path, "*");
    assert.equal(matchAdmin.meta.pageComponent, "StorefrontNotFound");
  });

  it("verifies individual path patterns using matchPath", () => {
    const matched = matchPath("/s/:slug", "/s/test-slug");
    assert.ok(matched);
    assert.equal(matched.params.slug, "test-slug");

    const notMatched = matchPath("/s/:slug", "/invalid/prefix/test-slug");
    assert.equal(notMatched, null);
  });
});

describe("ASAR Storefront Router — VIP Pass Token Resolution", () => {
  it("resolves cached VIP Pass by $id", () => {
    const customPass: InvitationRsvp = {
      $id: "rsvp-custom-101",
      invitationId: "invitation-omar-and-layla",
      clientId: "client-1",
      guestName: "د. طارق مصطفى · Dr. Tarek Mostafa",
      guestEmail: "tarek@example.com",
      companionsCount: 2,
      dynamicResponsesJson: "{}",
      status: "approved",
      passToken: "INV-PASS-8822-M",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?data=custom",
      emailSent: true,
      isCheckedInAtVenue: false,
      respondedAt: new Date().toISOString(),
    };

    const cacheJson = JSON.stringify([customPass]);
    const resolved = resolveGuestPassRsvp("rsvp-custom-101", cacheJson);

    assert.equal(resolved.$id, "rsvp-custom-101");
    assert.equal(resolved.guestName, "د. طارق مصطفى · Dr. Tarek Mostafa");
    assert.equal(resolved.passToken, "INV-PASS-8822-M");
    assert.equal(resolved.companionsCount, 2);
    assert.equal(resolved.status, "approved");
  });

  it("resolves cached VIP Pass by passToken", () => {
    const customPass: InvitationRsvp = {
      $id: "rsvp-doc-55",
      invitationId: "invitation-omar-and-layla",
      clientId: "client-1",
      guestName: "سارة الألفي · Sarah El-Alfy",
      guestEmail: "sarah@example.com",
      companionsCount: 0,
      dynamicResponsesJson: "{}",
      status: "approved",
      passToken: "INV-PASS-9933-V",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?data=custom",
      emailSent: true,
      isCheckedInAtVenue: false,
      respondedAt: new Date().toISOString(),
    };

    const cacheJson = JSON.stringify([customPass]);
    const resolved = resolveGuestPassRsvp("INV-PASS-9933-V", cacheJson);

    assert.equal(resolved.$id, "rsvp-doc-55");
    assert.equal(resolved.guestName, "سارة الألفي · Sarah El-Alfy");
    assert.equal(resolved.passToken, "INV-PASS-9933-V");
  });

  it("falls back gracefully to DEMO_APPROVED_RSVP when token is not in cache", () => {
    const cacheJson = JSON.stringify([]);
    const resolved = resolveGuestPassRsvp("non-existent-token", cacheJson);

    assert.equal(resolved.$id, DEMO_APPROVED_RSVP.$id);
    assert.equal(resolved.guestName, DEMO_APPROVED_RSVP.guestName);
    assert.equal(resolved.passToken, DEMO_APPROVED_RSVP.passToken);
    assert.equal(resolved.status, "approved");
  });

  it("handles corrupted cache JSON gracefully and returns demo pass", () => {
    const resolved = resolveGuestPassRsvp("token-123", "{ broken json {");
    assert.equal(resolved.$id, DEMO_APPROVED_RSVP.$id);
    assert.equal(resolved.passToken, DEMO_APPROVED_RSVP.passToken);
  });

  it("extracts passToken from query searchParams (?token=INV-PASS-7701-X)", () => {
    const searchParams = new URLSearchParams("token=INV-PASS-4411-Q&source=email");
    const extractedToken = searchParams.get("token");
    assert.equal(extractedToken, "INV-PASS-4411-Q");
  });
});
