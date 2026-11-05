// =============================================================
// ASAR (Athar / أثر) — Dynamic Storefront Index
// 4-Tier Subdomain & Path Resolution + Memory Type Classifier
// Hydration from Presets, LocalStorage Caches & Appwrite Collections
// =============================================================

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  useSubdomain,
  isReservedSubdomain,
  validateSubdomainSlug,
  findInCache,
  getBoothMemoriesCache,
  getInvitationsCache,
  ASAR_CACHE_KEYS,
  DEMO_BOOTH_MEMORY,
  useAppwrite,
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
  Query,
  type UseSubdomainOptions,
  type BoothMemory,
  type AsarInvitation,
} from "@repo/react-appwrite";
import { StorefrontShowcasePortal } from "./StorefrontShowcasePortal";
import { StorefrontNotFound } from "./StorefrontNotFound";
import { BoothMemoryRenderer } from "../components/booth/BoothMemoryRenderer";
import { InvitationMemoryRenderer } from "../components/invitation/InvitationMemoryRenderer";
import { INVITATION_PRESETS } from "../components/invitation/presets";
import { GuestPassStorefrontPage } from "./GuestPassStorefrontPage";

export interface DynamicStorefrontIndexProps {
  forcedType?: "booth" | "invitation" | "pass";
  defaultSlug?: string;
}

export type MemoryStorefrontType = "booth" | "invitation" | "pass" | "unknown";

export const DynamicStorefrontIndex: React.FC<DynamicStorefrontIndexProps> = ({
  forcedType,
  defaultSlug,
}) => {
  const { slug: routeSlug, rsvpId } = useParams<{
    slug?: string;
    rsvpId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const { databases, config } = useAppwrite();
  const dbId = config?.databaseId || ASAR_DATABASE_ID;

  // 1. Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 Subdomain Resolution
  const subdomainOptions: UseSubdomainOptions = useMemo(() => {
    return {
      routeParam: routeSlug || (forcedType === "pass" ? rsvpId : undefined),
      searchParams,
      fallbackSubdomain: defaultSlug,
      allowQueryOverride: true,
    };
  }, [routeSlug, rsvpId, forcedType, searchParams, defaultSlug]);

  const { subdomain, source } = useSubdomain(subdomainOptions);

  // Asynchronous Remote Hydration State from Appwrite
  const [remoteClassification, setRemoteClassification] =
    useState<MemoryStorefrontType | null>(null);
  const [remoteBoothData, setRemoteBoothData] = useState<BoothMemory | null>(
    null
  );
  const [remoteInvitationData, setRemoteInvitationData] =
    useState<AsarInvitation | null>(null);
  const [isResolvingRemote, setIsResolvingRemote] = useState<boolean>(true);

  // 2. Synchronous Memory Classification & Cache/Preset Lookup
  const synchronousType: MemoryStorefrontType = useMemo(() => {
    if (!subdomain) return "unknown";
    if (forcedType) return forcedType;

    const queryType = searchParams.get("type")?.toLowerCase().trim();
    if (
      queryType === "booth" ||
      queryType === "invitation" ||
      queryType === "pass"
    ) {
      return queryType;
    }

    // Step A: Known Presets
    if (
      subdomain === DEMO_BOOTH_MEMORY.slug ||
      subdomain === "mina-and-maryam"
    ) {
      return "booth";
    }
    if (INVITATION_PRESETS[subdomain]) {
      return "invitation";
    }

    // Step B: Defensive LocalStorage Cache Lookup
    const boothList = getBoothMemoriesCache<BoothMemory>();
    const foundBooth =
      findInCache<BoothMemory>(boothList, subdomain) ||
      findInCache<BoothMemory>(ASAR_CACHE_KEYS.BOOTH_MEMORIES, subdomain);
    if (foundBooth) {
      return "booth";
    }

    const inviteList = getInvitationsCache<AsarInvitation>();
    const foundInvite =
      findInCache<AsarInvitation>(inviteList, subdomain) ||
      findInCache<AsarInvitation>(ASAR_CACHE_KEYS.INVITATIONS, subdomain);
    if (foundInvite) {
      return "invitation";
    }

    // Step C: Slug prefix heuristics
    if (subdomain.startsWith("booth-") || subdomain.startsWith("audio-")) {
      return "booth";
    }
    if (
      subdomain.startsWith("inv-") ||
      subdomain.startsWith("invitation-") ||
      subdomain.startsWith("event-")
    ) {
      return "invitation";
    }

    return "unknown";
  }, [forcedType, searchParams, subdomain]);

  // 3. Asynchronous Appwrite Collections Query when classification is unknown
  useEffect(() => {
    let isMounted = true;
    if (!subdomain || synchronousType !== "unknown") {
      setIsResolvingRemote(false);
      return;
    }

    const queryRemoteCollections = async () => {
      setIsResolvingRemote(true);
      try {
        if (!databases || !dbId) {
          if (isMounted) setIsResolvingRemote(false);
          return;
        }

        // Try Booth Memories Collection
        const boothRes = await databases.listDocuments(
          dbId,
          ASAR_COLLECTIONS.BOOTH_MEMORIES,
          [Query.equal("slug", subdomain), Query.limit(1)]
        );

        if (boothRes.documents.length > 0 && isMounted) {
          setRemoteBoothData(boothRes.documents[0] as unknown as BoothMemory);
          setRemoteClassification("booth");
          return;
        }

        // Try Invitations Collection
        const inviteRes = await databases.listDocuments(
          dbId,
          ASAR_COLLECTIONS.INVITATIONS,
          [Query.equal("slug", subdomain), Query.limit(1)]
        );

        if (inviteRes.documents.length > 0 && isMounted) {
          setRemoteInvitationData(
            inviteRes.documents[0] as unknown as AsarInvitation
          );
          setRemoteClassification("invitation");
          return;
        }
      } catch {
        // Appwrite network or offline fallback
      } finally {
        if (isMounted) {
          setIsResolvingRemote(false);
        }
      }
    };

    queryRemoteCollections();
    return () => {
      isMounted = false;
    };
  }, [subdomain, synchronousType, databases, dbId]);

  // 4. Bare apex check: no subdomain, no route slug, no query parameter override
  if (!subdomain) {
    return <StorefrontShowcasePortal />;
  }

  // 5. Reserved subdomain check (e.g. admin, api, auth, booth, invitation, main, etc.)
  if (isReservedSubdomain(subdomain)) {
    return (
      <StorefrontNotFound
        requestedSlug={subdomain}
        reason="reserved"
        source={source}
      />
    );
  }

  // 6. RFC 1123 slug validity check
  const slugValidation = validateSubdomainSlug(subdomain);
  if (!slugValidation.isValid) {
    return (
      <StorefrontNotFound
        requestedSlug={subdomain}
        reason="invalid"
        source={source}
      />
    );
  }

  // 7. Luxury editorial resolving state: prevents flash of 404 while remote lookup is in flight
  if (synchronousType === "unknown" && isResolvingRemote) {
    return <StorefrontResolvingScreen slug={subdomain} />;
  }

  // 8. Resolve Final Effective Classified Type
  const effectiveType: MemoryStorefrontType =
    synchronousType !== "unknown"
      ? synchronousType
      : remoteClassification || "unknown";

  // 9. Render Classified Storefront or 404
  switch (effectiveType) {
    case "booth":
      return (
        <BoothMemoryRenderer
          slug={subdomain}
          source={source}
          initialMemory={remoteBoothData || undefined}
        />
      );

    case "invitation":
      return (
        <InvitationMemoryRenderer
          slug={subdomain}
          source={source}
          initialInvitation={remoteInvitationData || undefined}
        />
      );

    case "pass":
      return <GuestPassStorefrontPage rsvpId={subdomain} />;

    case "unknown":
    default:
      return (
        <StorefrontNotFound
          requestedSlug={subdomain}
          reason="not-found"
          source={source}
        />
      );
  }
};

/**
 * Luxury Warm Vintage Editorial Resolving Screen
 * Prevents premature 404 flash while querying remote Appwrite collections.
 */
export interface StorefrontResolvingScreenProps {
  slug: string;
}

export const StorefrontResolvingScreen: React.FC<StorefrontResolvingScreenProps> = ({
  slug,
}) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary, #FBF7F2)",
        color: "var(--athar-text-title, #231F20)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        backgroundImage: `
          radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.14) 0px, transparent 60%),
          radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.08) 0px, transparent 50%)
        `,
        direction: "rtl",
        fontFamily: "var(--font-body, 'Cairo', sans-serif)",
      }}
    >
      <style>{`
        @keyframes asarSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes asarPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "24px",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 20px 50px -10px rgba(107, 29, 40, 0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "3rem 2.2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.25rem",
        }}
      >
        {/* Luxury Gold Spinner & Monogram */}
        <div
          style={{
            position: "relative",
            width: "72px",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            style={{
              animation: "asarSpin 2s linear infinite",
            }}
          >
            <circle
              cx="36"
              cy="36"
              r="30"
              stroke="rgba(212, 175, 55, 0.2)"
              strokeWidth="3"
            />
            <path
              d="M36 6C19.4315 6 6 19.4315 6 36"
              stroke="#D4AF37"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: "absolute",
              fontSize: "1.25rem",
              fontWeight: 800,
              fontFamily: "var(--font-arabic-display, 'Amiri', serif)",
              color: "var(--athar-maroon, #6B1D28)",
              animation: "asarPulse 2s ease-in-out infinite",
            }}
          >
            أثر
          </div>
        </div>

        {/* Eyebrow Badge */}
        <span
          style={{
            display: "inline-block",
            fontSize: "0.8rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            color: "var(--athar-maroon, #6B1D28)",
            backgroundColor: "rgba(212, 175, 55, 0.12)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            borderRadius: "9999px",
            padding: "0.3rem 1rem",
          }}
        >
          ✦ تهيئة واجهة الذكريات ✦
        </span>

        {/* Poetic Heading */}
        <h2
          style={{
            fontFamily: "var(--font-arabic-display, 'Amiri', serif)",
            fontSize: "1.65rem",
            fontWeight: 700,
            color: "var(--athar-maroon, #6B1D28)",
            lineHeight: 1.35,
            margin: 0,
          }}
        >
          جاري تهيئة واجهة الذكريات الفاخرة...
        </h2>

        {/* Status description */}
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--athar-text-muted, #7A6F6D)",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: "380px",
          }}
        >
          جاري البحث في الأرشيف ومزامنة السجلات الخاصة بـ{" "}
          <strong style={{ color: "var(--athar-text-title, #231F20)" }}>{slug}</strong>
        </p>

        {/* Waveform ornament */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            opacity: 0.65,
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              height: "1px",
              width: "45px",
              background: "linear-gradient(90deg, transparent, #D4AF37)",
            }}
          />
          <svg width="28" height="14" viewBox="0 0 36 18" fill="none">
            <path
              d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
              stroke="#6B1D28"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              height: "1px",
              width: "45px",
              background: "linear-gradient(90deg, #D4AF37, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicStorefrontIndex;
