import React, { useMemo } from "react";
import type { InvitationRsvpDocument, InvitationDocument } from "../components/renderer/types";
import { GuestAccessPass } from "../components/pass";
import { INVITATION_PRESETS } from "./CustomEventPage";

export interface GuestPassPageProps {
  passId?: string;
  rsvpId?: string;
  onBack?: () => void;
}

export const DEMO_APPROVED_PASS: InvitationRsvpDocument = {
  $id: "rsvp-approved-1",
  id: "rsvp-approved-1",
  invitationId: "omar-and-layla",
  clientId: "client-omar-1",
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
    "https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=6B1D28&bgcolor=FFFFFF&data=http%3A%2F%2Flocalhost%3A3003%3Fpass%3Drsvp-approved-1%26token%3DINV-PASS-7701-X",
  emailSent: true,
  isCheckedInAtVenue: false,
  respondedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
};

export const GuestPassPage: React.FC<GuestPassPageProps> = ({
  passId,
  rsvpId,
  onBack,
}) => {
  const targetId = passId || rsvpId || "rsvp-approved-1";

  // Find RSVP from cache or fallback
  const rsvp: InvitationRsvpDocument = useMemo(() => {
    try {
      const cache = localStorage.getItem("asar_invitation_rsvps_cache");
      if (cache) {
        const list: InvitationRsvpDocument[] = JSON.parse(cache);
        const match = list.find(
          (r) =>
            r.$id === targetId ||
            r.id === targetId ||
            r.passToken === targetId
        );
        if (match) return match;
      }
    } catch {
      // Ignore
    }

    return DEMO_APPROVED_PASS;
  }, [targetId]);

  // Find associated invitation
  const invitation: InvitationDocument = useMemo(() => {
    const invId = rsvp.invitationId || "omar-and-layla";
    if (INVITATION_PRESETS[invId]) {
      return INVITATION_PRESETS[invId];
    }
    return INVITATION_PRESETS["omar-and-layla"];
  }, [rsvp.invitationId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary)",
        backgroundImage: `
          radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.1) 0px, transparent 65%),
          radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.05) 0px, transparent 50%)
        `,
      }}
    >
      <GuestAccessPass rsvp={rsvp} invitation={invitation} onBack={onBack} />
    </div>
  );
};

export default GuestPassPage;
