import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DEMO_INVITATION,
  type AsarInvitation,
  type InvitationRsvp,
} from "@repo/react-appwrite";
import {
  FiCheckCircle,
  FiHome,
  FiArrowRight,
} from "react-icons/fi";

// =============================================================
// ASAR (Athar / أثر) — Guest Pass Storefront Page
// Route: /pass/:rsvpId
// =============================================================

export interface GuestPassStorefrontPageProps {
  rsvpId?: string;
}

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
  respondedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
};

export const GuestPassStorefrontPage: React.FC<GuestPassStorefrontPageProps> = ({
  rsvpId: propRsvpId,
}) => {
  const { rsvpId: routeRsvpId } = useParams<{ rsvpId?: string }>();
  const targetId = propRsvpId || routeRsvpId || "rsvp-demo-001";

  const rsvp: InvitationRsvp = useMemo(() => {
    try {
      const raw = localStorage.getItem("asar_invitation_rsvps_cache");
      if (raw) {
        const list: InvitationRsvp[] = JSON.parse(raw);
        const match = list.find(
          (r) =>
            r.$id === targetId ||
            (r as { id?: string }).id === targetId ||
            r.passToken === targetId
        );
        if (match) return match;
      }
    } catch {
      // Ignore
    }
    return DEMO_APPROVED_RSVP;
  }, [targetId]);

  const invitation: AsarInvitation = DEMO_INVITATION;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary)",
        color: "var(--athar-text-body)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        position: "relative",
        backgroundImage: `
          radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.15) 0px, transparent 65%),
          radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.08) 0px, transparent 55%)
        `,
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: "540px",
          width: "100%",
          padding: "3rem 2rem",
          borderRadius: "var(--athar-radius-lg)",
          textAlign: "center",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "var(--athar-shadow-elevated)",
        }}
      >
        {/* Approved Status Ribbon */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 1.2rem",
            borderRadius: "var(--athar-radius-full)",
            backgroundColor: "rgba(107, 29, 40, 0.08)",
            color: "var(--athar-maroon)",
            fontWeight: 700,
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
          }}
        >
          <FiCheckCircle color="#6B1D28" />
          <span>بطاقة تصريح دخول معتمدة · VIP GUEST PASS</span>
        </div>

        {/* Event Title */}
        <h1
          className="font-arabic-display"
          style={{
            fontSize: "1.9rem",
            color: "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.4rem",
          }}
        >
          {invitation.eventTitle}
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--athar-gold)",
            fontWeight: 600,
            marginBottom: "1.8rem",
          }}
        >
          {invitation.eventDate} · {invitation.venueName}
        </p>

        {/* QR Code Container */}
        <div
          style={{
            width: "220px",
            height: "220px",
            margin: "0 auto 1.8rem auto",
            backgroundColor: "#ffffff",
            padding: "12px",
            borderRadius: "var(--athar-radius-md)",
            border: "2px solid rgba(212, 175, 55, 0.4)",
            boxShadow: "0 8px 24px rgba(107, 29, 40, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rsvp.qrCodeUrl ? (
            <img
              src={rsvp.qrCodeUrl}
              alt="VIP QR Pass"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div style={{ color: "var(--athar-text-muted)", fontSize: "0.9rem" }}>
              QR Code
            </div>
          )}
        </div>

        {/* Pass Token & Guest Details */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "1.2rem",
            borderRadius: "var(--athar-radius-md)",
            marginBottom: "2rem",
            textAlign: "right",
            border: "1px solid rgba(107, 29, 40, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>اسم الضيف:</span>
            <span style={{ fontWeight: 700, color: "var(--athar-text-title)" }}>{rsvp.guestName}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>رمز التصريح (Token):</span>
            <span style={{ fontFamily: "monospace", direction: "ltr", color: "var(--athar-maroon)", fontWeight: 700 }}>
              {rsvp.passToken || targetId}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>عدد المرافقين:</span>
            <span style={{ fontWeight: 700, color: "var(--athar-text-title)" }}>
              {rsvp.companionsCount ? `${rsvp.companionsCount} مرافق` : "ضيف مفرد"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/" className="btn-athar-primary">
            <FiHome />
            <span>بوابة الواجهات</span>
          </Link>

          <Link to="/s/omar-and-layla" className="btn-athar-secondary">
            <span>صفحة الدعوة الكاملة</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestPassStorefrontPage;
