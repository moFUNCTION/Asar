import React from "react";
import type { InvitationDocument } from "./types";

export interface EventHeroSectionProps {
  invitation: InvitationDocument;
  onRsvpClick?: () => void;
}

export const EventHeroSection: React.FC<EventHeroSectionProps> = ({
  invitation,
  onRsvpClick,
}) => {
  const isNoir =
    typeof invitation.themeConfigJson === "object"
      ? invitation.themeConfigJson?.themeVariant === "noir-obsidian"
      : false;

  const occasionBadgeText =
    invitation.occasionType === "wedding"
      ? "✦ حفل زفاف ملكي فاخر · ROYAL WEDDING"
      : invitation.occasionType === "festival"
        ? "✦ مهرجان فني وثقافي · CULTURAL FESTIVAL"
        : invitation.occasionType === "gala" || invitation.occasionType === "corporate"
          ? "✦ قمة قيادية وحفل سنوي VIP · ANNUAL GALA"
          : invitation.occasionType === "graduation"
            ? "✦ حفل تخرج وتكريم · GRADUATION HONORS"
            : "✦ دعوة خاصة وحصرية · PRIVATE INVITATION";

  const handleScrollToRsvp = () => {
    if (onRsvpClick) {
      onRsvpClick();
      return;
    }
    const rsvpElement = document.getElementById("rsvp-section");
    if (rsvpElement) {
      rsvpElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(invitation.eventTitle);
    const details = encodeURIComponent(
      `دعوة لحضور ${invitation.eventTitle} في ${invitation.venueName}`
    );
    const location = encodeURIComponent(
      `${invitation.venueName}${invitation.venueAddress ? `, ${invitation.venueAddress}` : ""}`
    );
    // Google Calendar template
    const dateClean = invitation.eventDate.replace(/-/g, "");
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateClean}T160000Z/${dateClean}T220000Z`;
    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="event-hero-section"
      style={{
        position: "relative",
        padding: "4rem 1.5rem 3rem",
        textAlign: "center",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      {/* Editorial Eyebrow Badge */}
      <div style={{ display: "inline-block", marginBottom: "1.5rem" }}>
        <span
          className="shimmer-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 1.25rem",
            borderRadius: "9999px",
            border: "1px solid var(--athar-gold-border)",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: isNoir ? "var(--athar-gold-bright)" : "var(--athar-maroon)",
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.85)"
              : "rgba(255, 255, 255, 0.94)",
            boxShadow: "var(--athar-shadow-soft)",
          }}
        >
          {occasionBadgeText}
        </span>
      </div>

      {/* Main Event Headline */}
      <h1
        className="font-arabic-display"
        style={{
          fontSize: "clamp(2.4rem, 6vw, 4.4rem)",
          fontWeight: 700,
          lineHeight: 1.2,
          color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
          marginBottom: "1rem",
          letterSpacing: "-0.01em",
        }}
      >
        {invitation.eventTitle}
      </h1>

      {/* Tagline / Subtitle */}
      {invitation.tagline && (
        <p
          style={{
            fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)",
            color: isNoir ? "#E5C158" : "var(--athar-text-body)",
            maxWidth: "680px",
            margin: "0 auto 1.5rem",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          {invitation.tagline}
        </p>
      )}

      {/* Acoustic Waveform Divider */}
      <div className="acoustic-divider">
        <div
          className="acoustic-line"
          style={{
            background: "linear-gradient(90deg, transparent, var(--athar-gold))",
          }}
        />
        <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
          <path
            d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
            stroke={isNoir ? "#D4AF37" : "#6B1D28"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className="acoustic-line"
          style={{
            background: "linear-gradient(90deg, var(--athar-gold), transparent)",
          }}
        />
      </div>

      {/* Couple / Host Cover Hero Image (if available) */}
      {invitation.heroImageUrl && (
        <div
          style={{
            margin: "2rem auto",
            maxWidth: "760px",
            borderRadius: "28px",
            overflow: "hidden",
            border: "1.5px solid var(--athar-gold-border)",
            boxShadow: "0 24px 50px -15px rgba(107, 29, 40, 0.18)",
            position: "relative",
          }}
        >
          <img
            src={invitation.heroImageUrl}
            alt={invitation.eventTitle}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "420px",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: isNoir
                ? "linear-gradient(to bottom, transparent 60%, rgba(22, 18, 20, 0.85) 100%)"
                : "linear-gradient(to bottom, transparent 65%, rgba(251, 247, 242, 0.9) 100%)",
              pointerEvents: "none",
            }}
          />
        </div>
      )}

      {/* Metadata Pills Row: Date · Time · Venue */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          margin: "2.25rem 0",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "16px",
            backgroundColor: isNoir
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(255, 255, 255, 0.92)",
            border: "1px solid var(--athar-card-border)",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
            boxShadow: "var(--athar-shadow-soft)",
          }}
        >
          <span style={{ color: "var(--athar-gold)" }}>📅</span>
          <span>{invitation.eventDate}</span>
        </div>

        {invitation.eventTime && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.65rem 1.25rem",
              borderRadius: "16px",
              backgroundColor: isNoir
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(255, 255, 255, 0.92)",
              border: "1px solid var(--athar-card-border)",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              boxShadow: "var(--athar-shadow-soft)",
            }}
          >
            <span style={{ color: "var(--athar-gold)" }}>⏳</span>
            <span>{invitation.eventTime}</span>
          </div>
        )}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.25rem",
            borderRadius: "16px",
            backgroundColor: isNoir
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(255, 255, 255, 0.92)",
            border: "1px solid var(--athar-card-border)",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
            boxShadow: "var(--athar-shadow-soft)",
          }}
        >
          <span style={{ color: "var(--athar-gold)" }}>📍</span>
          <span>{invitation.venueName}</span>
        </div>
      </div>

      {/* CTA Actions: Scroll to RSVP & Add to Calendar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={handleScrollToRsvp}
          className="btn-athar-primary"
          style={{
            fontSize: "1.05rem",
            padding: "0.9rem 2.2rem",
          }}
        >
          <span>تأكيد الحضور · RSVP</span>
          <span style={{ fontSize: "1.1rem" }}>✍️</span>
        </button>

        <button
          type="button"
          onClick={handleAddToCalendar}
          className="btn-athar-secondary"
          style={{
            fontSize: "0.95rem",
            padding: "0.85rem 1.6rem",
          }}
        >
          <span>إضافة إلى التقويم</span>
          <span>🗓️</span>
        </button>
      </div>
    </section>
  );
};

export const HeroBlock = EventHeroSection;
export default EventHeroSection;
