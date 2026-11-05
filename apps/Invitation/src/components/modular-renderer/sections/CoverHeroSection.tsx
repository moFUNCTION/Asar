import React, { useState } from "react";
import type { CoverHeroSection as CoverHeroSectionModel } from "@repo/react-appwrite";
import type { InvitationDocument } from "../../../components/renderer/types";

export interface CoverHeroSectionProps {
  section: CoverHeroSectionModel;
  invitation?: InvitationDocument;
  isNoir?: boolean;
  onRsvpClick?: () => void;
}

export const CoverHeroSection: React.FC<CoverHeroSectionProps> = ({
  section,
  invitation,
  isNoir = false,
  onRsvpClick,
}) => {
  // Wax seal envelope interactive state: allows opening the envelope
  const envelopeEnabled = section.envelopeEnabled ?? true;
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(!envelopeEnabled);
  const [isHovered, setIsHovered] = useState(false);

  const coupleTitle = section.coupleTitle || invitation?.coupleOrHostNames || invitation?.eventTitle || "Omar & Layla";
  const dateDisplay = section.dateDisplay || invitation?.eventDate || "November 20, 2026";
  const venueDisplay = section.venueDisplay || invitation?.venueName || "Four Seasons Alexandria";
  const coverImageUrl =
    section.coverImageUrl ||
    invitation?.heroImageUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85";

  // Initials for wax seal monogram
  const monogram =
    section.waxSealMonogram ||
    coupleTitle
      .split("&")
      .map((part) => part.trim().charAt(0))
      .filter(Boolean)
      .join(" & ") ||
    "أثر";

  const handleOpenEnvelope = () => {
    setIsEnvelopeOpen(true);
  };

  const handleScrollToRsvp = () => {
    if (onRsvpClick) {
      onRsvpClick();
    } else {
      const el = document.getElementById("rsvp-section") || document.getElementById("dynamic_rsvp");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id={section.id || "cover-hero-section"}
      className="athar-cover-hero-section"
      style={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "4rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
      }}
    >
      {/* Background Cover Image with Luxury Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at center, transparent 30%, ${isNoir ? "rgba(18,14,16,0.95)" : "rgba(251,247,242,0.92)"} 90%),
            linear-gradient(to bottom, ${isNoir ? "rgba(18,14,16,0.7)" : "rgba(107,29,40,0.4)"} 0%, ${isNoir ? "rgba(18,14,16,0.9)" : "rgba(251,247,242,0.9)"} 100%),
            url(${coverImageUrl})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.92) contrast(1.05)",
          transform: isEnvelopeOpen ? "scale(1.03)" : "scale(1)",
          transition: "transform 1.8s cubic-bezier(0.16, 1, 0.3, 1)",
          zIndex: 0,
        }}
      />

      {/* Decorative Golden Ambient Overlay Lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "1.5rem",
          border: "1px solid rgba(212, 175, 55, 0.25)",
          borderRadius: "24px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Main Interactive Stage */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "760px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Audio Prompt Notice Badge */}
        {section.audioPromptBadge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 1rem",
              borderRadius: "9999px",
              backgroundColor: isNoir ? "rgba(35, 26, 30, 0.85)" : "rgba(255, 255, 255, 0.88)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
              fontSize: "0.78rem",
              color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
              fontWeight: 600,
              marginBottom: "1.5rem",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              animation: "pulse 2s infinite ease-in-out",
            }}
          >
            <span>🎵</span>
            <span>{section.audioPromptBadge}</span>
          </div>
        )}

        {/* 3D Wax Seal Envelope Stage */}
        {envelopeEnabled && !isEnvelopeOpen ? (
          <div
            onClick={handleOpenEnvelope}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              cursor: "pointer",
              padding: "2.5rem 2rem",
              borderRadius: "20px",
              background: isNoir
                ? "linear-gradient(135deg, rgba(35, 26, 30, 0.95), rgba(22, 18, 20, 0.98))"
                : "linear-gradient(135deg, #FFFFFF, #FAF4ED)",
              border: "1.5px solid var(--athar-gold, #D4AF37)",
              boxShadow: isHovered
                ? "0 24px 60px rgba(212, 175, 55, 0.35)"
                : "0 16px 40px rgba(0, 0, 0, 0.15)",
              transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              maxWidth: "420px",
              width: "100%",
            }}
          >
            {/* Wax Seal Monogram */}
            <div
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #E5C158, #D4AF37 55%, #8A6D1E 95%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(107, 29, 40, 0.4), inset 0 2px 4px rgba(255,255,255,0.6)",
                border: "2px solid rgba(255, 255, 255, 0.45)",
                color: "#231A1E",
                fontSize: "1.35rem",
                fontWeight: 900,
                fontFamily: "var(--font-arabic-display, serif)",
                letterSpacing: "1px",
              }}
            >
              {monogram}
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "3px",
                  color: "var(--athar-gold, #D4AF37)",
                  fontWeight: 700,
                  marginBottom: "0.35rem",
                }}
              >
                {section.overline || "Special Royal Invitation"}
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-arabic-display, serif)",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  margin: "0 0 0.5rem 0",
                }}
              >
                {coupleTitle}
              </h2>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: isNoir ? "#D4AF37" : "var(--athar-maroon, #6B1D28)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                }}
              >
                <span>✉️</span>
                <span>انقر لفض الختم الملكي وفتح الدعوة · Tap to Open</span>
              </div>
            </div>
          </div>
        ) : (
          /* Opened Luxury Invitation Card */
          <div
            style={{
              padding: "3rem 2rem",
              borderRadius: "28px",
              background: isNoir
                ? "linear-gradient(145deg, rgba(31, 26, 28, 0.94), rgba(22, 18, 20, 0.97))"
                : "linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(251, 247, 242, 0.94))",
              backdropFilter: "blur(20px)",
              border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.16)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              width: "100%",
            }}
          >
            {/* Wax Seal Monogram Badge */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #E5C158, #D4AF37 60%, #8A6D1E 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                border: "2px solid rgba(255, 255, 255, 0.5)",
                color: "#231A1E",
                fontSize: "1.05rem",
                fontWeight: 900,
                fontFamily: "var(--font-arabic-display, serif)",
                marginBottom: "1.25rem",
              }}
            >
              {monogram}
            </div>

            {/* Overline */}
            {section.overline && (
              <span
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "var(--athar-gold, #D4AF37)",
                  fontWeight: 700,
                  marginBottom: "0.6rem",
                }}
              >
                {section.overline}
              </span>
            )}

            {/* Headline */}
            {section.headline && (
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                  marginBottom: "0.5rem",
                  fontFamily: "var(--font-arabic-display, serif)",
                }}
              >
                {section.headline}
              </h3>
            )}

            {/* Couple Title */}
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.2rem)",
                fontWeight: 700,
                fontFamily: "var(--font-arabic-display, serif)",
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                lineHeight: 1.25,
                margin: "0 0 1rem 0",
                textShadow: isNoir ? "0 2px 14px rgba(0,0,0,0.5)" : "none",
              }}
            >
              {coupleTitle}
            </h1>

            {/* Tagline / Poetic Verse */}
            {section.tagline && (
              <p
                style={{
                  fontSize: "1rem",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  maxWidth: "520px",
                  color: isNoir ? "#D6C7B2" : "var(--athar-text-body, #4A4240)",
                  marginBottom: "1.75rem",
                }}
              >
                "{section.tagline}"
              </p>
            )}

            {/* Metadata Pills: Date & Venue */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1.15rem",
                  borderRadius: "9999px",
                  backgroundColor: isNoir ? "rgba(45, 34, 38, 0.8)" : "rgba(107, 29, 40, 0.05)",
                  border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                <span style={{ color: "var(--athar-gold, #D4AF37)" }}>📅</span>
                <span>{dateDisplay}</span>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1.15rem",
                  borderRadius: "9999px",
                  backgroundColor: isNoir ? "rgba(45, 34, 38, 0.8)" : "rgba(107, 29, 40, 0.05)",
                  border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                <span style={{ color: "var(--athar-gold, #D4AF37)" }}>📍</span>
                <span>{venueDisplay}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={handleScrollToRsvp}
                style={{
                  padding: "0.85rem 2rem",
                  borderRadius: "9999px",
                  background: isNoir
                    ? "linear-gradient(135deg, #D4AF37, #E5C158)"
                    : "linear-gradient(135deg, var(--athar-maroon, #6B1D28), #50131D)",
                  color: isNoir ? "#161214" : "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(107, 29, 40, 0.25)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                تأكيد الحضور · RSVP Now
              </button>

              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                  coupleTitle
                )}&dates=${encodeURIComponent(
                  dateDisplay.replace(/[^0-9]/g, "").padEnd(8, "0") + "T180000Z/" +
                  dateDisplay.replace(/[^0-9]/g, "").padEnd(8, "0") + "T230000Z"
                )}&location=${encodeURIComponent(venueDisplay)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.85rem 1.6rem",
                  borderRadius: "9999px",
                  backgroundColor: "transparent",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  border: "1.5px solid var(--athar-gold, #D4AF37)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                <span>🗓️</span>
                <span>إضافة للتقويم · Add to Calendar</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoverHeroSection;
