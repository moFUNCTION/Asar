import React from "react";
import type { CoverHeroSection } from "@repo/react-appwrite";

export interface CoverHeroInspectorProps {
  section: CoverHeroSection;
  onChange: (updated: CoverHeroSection) => void;
}

export const CoverHeroInspector: React.FC<CoverHeroInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<CoverHeroSection>) => {
    onChange({ ...section, ...partial });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
          paddingBottom: "0.6rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#231F20" }}>
            🏛️ Cover & Hero Showcase Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Primary visual splash screen, monogram, dates, and wax seal.
          </span>
        </div>
      </div>

      {/* Grid of basic fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        {/* Couple / Main Title */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Celebration Names / Couple Title *
          </label>
          <input
            type="text"
            value={section.coupleTitle}
            onChange={(e) => update({ coupleTitle: e.target.value })}
            placeholder="e.g. Omar & Layla"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        {/* Headline */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Headline
          </label>
          <input
            type="text"
            value={section.headline || ""}
            onChange={(e) => update({ headline: e.target.value })}
            placeholder="e.g. The Wedding Celebration"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        {/* Overline */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Overline / Invitation Header
          </label>
          <input
            type="text"
            value={section.overline || ""}
            onChange={(e) => update({ overline: e.target.value })}
            placeholder="e.g. CORDIALLY INVITE YOU TO CELEBRATE"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        {/* Event Date Display */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Event Date Display Pill
          </label>
          <input
            type="text"
            value={section.dateDisplay}
            onChange={(e) => update({ dateDisplay: e.target.value })}
            placeholder="e.g. 20 November 2026"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        {/* Venue Display */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Venue Display Pill
          </label>
          <input
            type="text"
            value={section.venueDisplay}
            onChange={(e) => update({ venueDisplay: e.target.value })}
            placeholder="e.g. Four Seasons Hotel, Alexandria"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        {/* Tagline / Subtitle */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Hero Tagline / Poetic Verse
          </label>
          <textarea
            rows={2}
            value={section.tagline || ""}
            onChange={(e) => update({ tagline: e.target.value })}
            placeholder="e.g. Two souls, one timeless journey of devotion and joy under the Mediterranean sky."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>

        {/* Cover Media URL */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Cover Portrait / Background Media URL
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={section.coverImageUrl || ""}
              onChange={(e) => update({ coverImageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              style={{
                flex: 1,
                padding: "0.55rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
              }}
            />
            {section.coverImageUrl && (
              <img
                src={section.coverImageUrl}
                alt="Cover Preview"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "6px",
                  objectFit: "cover",
                  border: "1px solid rgba(0,0,0,0.1)",
                }}
              />
            )}
          </div>
        </div>

        {/* Wax Seal Monogram */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Wax Seal Monogram (Initials)
          </label>
          <input
            type="text"
            maxLength={4}
            value={section.waxSealMonogram || ""}
            onChange={(e) => update({ waxSealMonogram: e.target.value.toUpperCase() })}
            placeholder="e.g. O&L"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          />
        </div>

        {/* Audio prompt badge text */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Audio Prompt Badge
          </label>
          <input
            type="text"
            value={section.audioPromptBadge || ""}
            onChange={(e) => update({ audioPromptBadge: e.target.value })}
            placeholder="e.g. Tap vinyl to play soundtrack"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>
      </div>

      {/* Toggles */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={section.envelopeEnabled !== false}
            onChange={(e) => update({ envelopeEnabled: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Show Envelope Opening Animation
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={section.countdownEnabled !== false}
            onChange={(e) => update({ countdownEnabled: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Show Embedded Mini Countdown Pill
        </label>
      </div>
    </div>
  );
};
