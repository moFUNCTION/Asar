// =============================================================
// ASAR (Athar / أثر) — Full Interactive Invitation Storefront Renderer
// =============================================================

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiHome,
  FiLayers,
  FiShare2,
  FiCheck,
  FiArrowDown,
  FiKey,
} from "react-icons/fi";
import {
  findInCache,
  ASAR_CACHE_KEYS,
  useAppwrite,
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
  Query,
  type AsarInvitation,
} from "@repo/react-appwrite";

import type {
  InvitationStorefrontData,
  GeneratedVipPass,
  InvitationThemeConfig,
} from "./types";
import {
  INVITATION_PRESETS,
  DEFAULT_CANONICAL_INVITATION,
  DEFAULT_RSVP_FORM_SCHEMA,
} from "./presets";
import { InvitationCountdown } from "./InvitationCountdown";
import { InvitationSchedule } from "./InvitationSchedule";
import { InvitationLocationDressCode } from "./InvitationLocationDressCode";
import { InvitationDynamicRsvpForm } from "./InvitationDynamicRsvpForm";
import { InvitationVipPassModal } from "./InvitationVipPassModal";

export interface InvitationMemoryRendererProps {
  slug: string;
  source?: string | null;
  initialInvitation?: Partial<AsarInvitation>;
}

export const InvitationMemoryRenderer: React.FC<
  InvitationMemoryRendererProps
> = ({ slug, source, initialInvitation }) => {
  const { databases, config } = useAppwrite();
  const dbId = config?.databaseId || ASAR_DATABASE_ID;

  // 1. Resolve Invitation Data with multi-tiered fallback
  const baseInvitation = useMemo<InvitationStorefrontData>(() => {
    // Priority 1: Check localStorage cache
    const cached = findInCache<AsarInvitation>(
      ASAR_CACHE_KEYS.INVITATIONS,
      slug
    );
    if (cached) {
      return {
        ...DEFAULT_CANONICAL_INVITATION,
        ...cached,
        id: cached.$id || cached.slug || slug,
        slug: cached.slug || slug,
        eventTitle: cached.eventTitle || "حفل زفاف ملكي فاخر",
      };
    }

    // Priority 2: Injected initialInvitation prop
    if (initialInvitation) {
      return {
        ...DEFAULT_CANONICAL_INVITATION,
        ...initialInvitation,
        id: initialInvitation.$id || initialInvitation.slug || slug,
        slug: initialInvitation.slug || slug,
        eventTitle: initialInvitation.eventTitle || "حفل زفاف ملكي فاخر",
      };
    }

    // Priority 3: Check Canonical Known Presets
    if (INVITATION_PRESETS[slug]) {
      return INVITATION_PRESETS[slug];
    }

    // Priority 4: Dynamic Title formatting from slug
    const formattedTitle = slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" & ");

    return {
      ...DEFAULT_CANONICAL_INVITATION,
      id: slug,
      slug,
      eventTitle: `حفل ${formattedTitle} · Celebration`,
    };
  }, [slug, initialInvitation]);

  const [invitation, setInvitation] =
    useState<InvitationStorefrontData>(baseInvitation);

  // Hydrate from Appwrite Database
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        if (databases && dbId) {
          const res = await databases.listDocuments(
            dbId,
            ASAR_COLLECTIONS.INVITATIONS,
            [Query.equal("slug", slug), Query.limit(1)]
          );
          if (res.documents.length > 0 && isMounted) {
            const doc = res.documents[0] as unknown as AsarInvitation;
            setInvitation((prev) => ({
              ...prev,
              ...doc,
              id: doc.$id || doc.slug,
              slug: doc.slug,
            }));
          }
        }
      } catch {
        // Appwrite query fallback
      }
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, [slug, databases, dbId]);

  // Parse Theme Config
  const themeConfig = useMemo<InvitationThemeConfig>(() => {
    if (!invitation.themeConfigJson) {
      return {
        primaryColor: "#6B1D28",
        secondaryColor: "#D4AF37",
        backgroundColor: "#FBF7F2",
        cardBackground: "rgba(255, 255, 255, 0.94)",
        themeVariant: "ivory-royal",
        fontFamily: "Amiri",
        direction: "rtl",
      };
    }
    if (typeof invitation.themeConfigJson === "string") {
      try {
        return JSON.parse(invitation.themeConfigJson);
      } catch {
        return { themeVariant: "ivory-royal" };
      }
    }
    return invitation.themeConfigJson;
  }, [invitation.themeConfigJson]);

  const isNoir = themeConfig?.themeVariant === "noir-obsidian";

  // Parse Schedule Items
  const scheduleItems = useMemo(() => {
    if (Array.isArray(invitation.scheduleJson)) {
      return invitation.scheduleJson;
    }
    if (typeof invitation.scheduleJson === "string") {
      try {
        return JSON.parse(invitation.scheduleJson);
      } catch {
        return DEFAULT_CANONICAL_INVITATION.scheduleJson;
      }
    }
    return DEFAULT_CANONICAL_INVITATION.scheduleJson;
  }, [invitation.scheduleJson]);

  // Parse Dress Code
  const dressCode = useMemo(() => {
    if (
      invitation.dressCodeJson &&
      typeof invitation.dressCodeJson === "object"
    ) {
      return invitation.dressCodeJson;
    }
    if (typeof invitation.dressCodeJson === "string") {
      try {
        return JSON.parse(invitation.dressCodeJson);
      } catch {
        return DEFAULT_CANONICAL_INVITATION.dressCodeJson;
      }
    }
    return DEFAULT_CANONICAL_INVITATION.dressCodeJson;
  }, [invitation.dressCodeJson]);

  // VIP Pass Modal State
  const [activePass, setActivePass] = useState<GeneratedVipPass | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Occasion Badge Text
  const occasionBadgeText = useMemo(() => {
    switch (invitation.occasionType) {
      case "wedding":
        return "✦ دعوة زفاف ملكي فاخر · ROYAL WEDDING INVITATION";
      case "festival":
        return "✦ تذكرة وبطاقة دخول المهرجان · CULTURAL FESTIVAL";
      case "gala":
      case "corporate":
        return "✦ بطاقة دعوة VIP خاصة · ANNUAL LEADERSHIP GALA";
      case "engagement":
        return "✦ حفل خطوبة ملكي · ROYAL ENGAGEMENT";
      default:
        return "✦ دعوة رسمية خاصة · OFFICIAL INVITATION";
    }
  }, [invitation.occasionType]);

  const handleScrollToRsvp = () => {
    const el = document.getElementById("rsvp-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCopyShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  const handleOpenDemoPass = () => {
    const demoPass: GeneratedVipPass = {
      $id: `rsvp-pass-${slug}`,
      id: `rsvp-pass-${slug}`,
      invitationId: invitation.id || slug,
      guestName: "معالي الضيف الكريم · Distinguished Guest",
      guestEmail: "vip.guest@asar.me",
      companionsCount: 1,
      dynamicResponsesJson: JSON.stringify({ note: "VIP Guest pass preview" }),
      status: "approved",
      passToken: `INV-PASS-${slug.slice(0, 4).toUpperCase()}-7701`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
        `http://localhost:3004/pass/rsvp-pass-${slug}`
      )}`,
      emailSent: true,
      respondedAt: new Date().toISOString(),
    };
    setActivePass(demoPass);
    setIsPassModalOpen(true);
  };

  const handleRsvpSuccess = (pass: GeneratedVipPass) => {
    setActivePass(pass);
    setIsPassModalOpen(true);
  };

  // Dynamic CSS variables
  const containerStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: isNoir
      ? "#161214"
      : themeConfig?.backgroundColor || "var(--athar-bg-primary)",
    color: isNoir ? "#FFFFFF" : "var(--athar-text-body)",
    position: "relative",
    overflowX: "hidden",
    fontFamily:
      themeConfig?.fontFamily === "Playfair Display"
        ? "'Playfair Display', serif"
        : themeConfig?.fontFamily === "Cairo"
          ? "'Cairo', sans-serif"
          : "'Amiri', serif",
  };

  return (
    <div style={containerStyle} dir={themeConfig?.direction || "rtl"}>
      {/* Ambient Radial Luxury Glow Backgrounds */}
      {isNoir ? (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `
              radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.14) 0px, transparent 65%),
              radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.25) 0px, transparent 50%),
              radial-gradient(at 90% 90%, rgba(229, 193, 88, 0.09) 0px, transparent 40%)
            `,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `
              radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.16) 0px, transparent 60%),
              radial-gradient(at 0% 100%, rgba(107, 29, 40, 0.06) 0px, transparent 50%),
              radial-gradient(at 100% 60%, rgba(212, 175, 55, 0.08) 0px, transparent 45%)
            `,
          }}
        />
      )}

      {/* Main Content Layer */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* 1. Top Floating Storefront Status Indicator */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            backgroundColor: isNoir
              ? "rgba(22, 18, 20, 0.95)"
              : "rgba(107, 29, 40, 0.95)",
            color: "#ffffff",
            padding: "0.55rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.85rem",
            backdropFilter: "blur(8px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            borderBottom: isNoir ? "1px solid rgba(212, 175, 55, 0.3)" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 700,
              }}
            >
              <FiLayers />
              ASAR Storefront Runtime (Port 3004)
            </span>

            <span
              style={{
                backgroundColor: "rgba(255,255,255,0.18)",
                padding: "0.2rem 0.65rem",
                borderRadius: "4px",
                fontFamily: "monospace",
                direction: "ltr",
              }}
            >
              invitation: {slug} · tier: {source || "hostname"}
            </span>

            <span
              style={{
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.25)"
                  : "rgba(255, 255, 255, 0.15)",
                color: isNoir ? "#D4AF37" : "#FFFFFF",
                fontWeight: 600,
                fontSize: "0.78rem",
              }}
            >
              ثيم: {isNoir ? "Noir Obsidian" : "Ivory Royal"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={handleCopyShare}
              style={{
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.2)"
                  : "rgba(255, 255, 255, 0.15)",
                color: isNoir ? "#D4AF37" : "#ffffff",
                border: isNoir
                  ? "1px solid rgba(212, 175, 55, 0.4)"
                  : "none",
                borderRadius: "var(--athar-radius-full)",
                padding: "0.3rem 0.85rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {copiedShareLink ? <FiCheck /> : <FiShare2 />}
              <span>{copiedShareLink ? "تم النسخ!" : "مشاركة"}</span>
            </button>

            <Link
              to="/"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 600,
              }}
            >
              <FiHome />
              <span>بوابة الواجهات</span>
            </Link>
          </div>
        </header>

        {/* 2. Event Hero Section */}
        <section
          style={{
            padding: "4.5rem 1.5rem 3.5rem 1.5rem",
            textAlign: "center",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {/* Eyebrow Badge */}
          <div style={{ display: "inline-block", marginBottom: "1.2rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1.25rem",
                borderRadius: "var(--athar-radius-full)",
                border: isNoir
                  ? "1.5px solid rgba(212, 175, 55, 0.4)"
                  : "1.5px solid rgba(107, 29, 40, 0.15)",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                backgroundColor: isNoir
                  ? "rgba(35, 26, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.94)",
                boxShadow: "var(--athar-shadow-soft)",
              }}
            >
              {occasionBadgeText}
            </span>
          </div>

          {/* Event Title */}
          <h1
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.4rem, 6.2vw, 4.6rem)",
              fontWeight: 700,
              lineHeight: 1.2,
              color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
              marginBottom: "1.2rem",
            }}
          >
            {invitation.eventTitle}
          </h1>

          {/* Tagline */}
          <p
            className="font-poetic"
            style={{
              fontSize: "clamp(1.15rem, 2.5vw, 1.35rem)",
              color: isNoir ? "#E2E8F0" : "var(--athar-text-title)",
              marginBottom: "2rem",
              maxWidth: "760px",
              margin: "0 auto 2rem auto",
              lineHeight: 1.7,
            }}
          >
            {invitation.tagline ||
              "يسرنا ويسعدنا دعوتكم لمشاركتنا فرحة العمر وحضور مراسم هذه الليلة الاستثنائية."}
          </p>

          {/* Ribbon with Date, Time, Venue */}
          <div
            className="glass-panel"
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              justifyContent: "center",
              padding: "1rem 2.2rem",
              borderRadius: "var(--athar-radius-full)",
              backgroundColor: isNoir
                ? "rgba(35, 26, 30, 0.9)"
                : "rgba(255, 255, 255, 0.9)",
              border: isNoir
                ? "1.5px solid rgba(212, 175, 55, 0.35)"
                : "1.5px solid rgba(212, 175, 55, 0.4)",
              boxShadow: "var(--athar-shadow-soft)",
              marginBottom: "2.5rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiCalendar color="#D4AF37" />
              <span style={{ fontWeight: 600 }}>
                {invitation.eventDate || "2026-11-20"}
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiClock color="#D4AF37" />
              <span style={{ fontWeight: 600 }}>
                {invitation.eventTime || "07:30 PM"}
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiMapPin color="#D4AF37" />
              <span style={{ fontWeight: 600 }}>
                {invitation.venueName || "فندق فورسيزونز الإسكندرية"}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button onClick={handleScrollToRsvp} className="btn-athar-primary">
              <FiArrowDown />
              <span>تأكيد الحضور واستخراج بطاقة الـ QR (RSVP Now)</span>
            </button>

            <button
              onClick={handleOpenDemoPass}
              className="btn-athar-secondary"
              style={{
                backgroundColor: isNoir
                  ? "rgba(255, 255, 255, 0.08)"
                  : "#ffffff",
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              }}
            >
              <FiKey color="#D4AF37" />
              <span>معاينة نموذج تصريح الضيف VIP Pass</span>
            </button>
          </div>
        </section>

        {/* 3. Real-Time Live Countdown Ticker */}
        <InvitationCountdown
          eventDate={invitation.eventDate}
          eventTime={invitation.eventTime}
          isNoir={isNoir}
        />

        {/* 4. Schedule & Itinerary Timeline */}
        <InvitationSchedule items={scheduleItems} isNoir={isNoir} />

        {/* 5. Venue Location & Dress Code */}
        <InvitationLocationDressCode
          venueName={invitation.venueName}
          venueAddress={invitation.venueAddress}
          venueMapUrl={invitation.venueMapUrl}
          dressCode={dressCode}
          isNoir={isNoir}
        />

        {/* 6. Dynamic Schema-Driven RSVP Form (Enforcing Locked Required guestEmail) */}
        <InvitationDynamicRsvpForm
          invitation={invitation}
          schema={DEFAULT_RSVP_FORM_SCHEMA}
          onSuccess={handleRsvpSuccess}
          onPreviewPass={handleOpenDemoPass}
          isNoir={isNoir}
        />

        {/* 7. VIP QR Guest Pass Modal */}
        <InvitationVipPassModal
          pass={activePass}
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          eventTitle={invitation.eventTitle}
          eventDate={invitation.eventDate}
          venueName={invitation.venueName}
        />
      </div>
    </div>
  );
};

export default InvitationMemoryRenderer;
