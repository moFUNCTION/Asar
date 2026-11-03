import React, { useState, useEffect } from "react";
import type { InvitationThemeConfig } from "./ThemeAndEffectsPanel";
import type { InvitationSectionBlock } from "./SectionBlocksManager";
import type { DynamicFormField } from "./DynamicFormSchemaBuilder";

export interface LiveInvitationPreviewProps {
  themeConfig: InvitationThemeConfig;
  blocks: InvitationSectionBlock[];
  formFields: DynamicFormField[];
  eventSlug?: string;
}

export const LiveInvitationPreview: React.FC<LiveInvitationPreviewProps> = ({
  themeConfig,
  blocks,
  formFields,
}) => {
  const [viewportMode, setViewportMode] = useState<"mobile" | "desktop">("mobile");
  const [formResponses, setFormResponses] = useState<
    Record<string, string | string[] | number | boolean>
  >({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 14,
    hours: 8,
    minutes: 42,
    seconds: 18,
  });

  const countdownBlock = blocks.find((b) => b.type === "countdown");
  const targetDateStr = countdownBlock?.targetDate || "2026-11-20T19:30:00";

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  const handleInputChange = (
    fieldId: string,
    val: string | string[] | number | boolean
  ) => {
    setFormResponses((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleCheckboxChange = (fieldId: string, option: string) => {
    setFormResponses((prev) => {
      const currentList: string[] = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      const updated = currentList.includes(option)
        ? currentList.filter((x) => x !== option)
        : [...currentList, option];
      return { ...prev, [fieldId]: updated };
    });
  };

  const handleSubmitRSVP = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields
    const missing: string[] = [];
    for (const f of formFields) {
      if (f.required) {
        const val = formResponses[f.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          missing.push(f.label);
        }
      }
    }

    if (missing.length > 0) {
      setSubmissionFeedback(`Please fill required fields: ${missing.slice(0, 2).join(", ")}`);
      return;
    }

    setSubmitted(true);
    setSubmissionFeedback(
      `RSVP Confirmed for ${formResponses["guestName"] || "Guest"}! QR entry pass will be dispatched to ${
        formResponses["guestEmail"] || "provided email"
      }.`
    );
  };

  const scrollToRSVP = () => {
    const el = document.getElementById("preview-rsvp-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        position: "sticky",
        top: "1.5rem",
      }}
    >
      {/* Top Viewport Switcher Toolbar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          padding: "0.5rem 0.85rem",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6B1D28" }}>
            Live Guest View
          </span>
          <span style={{ fontSize: "0.72rem", color: "#7A6F6D" }}>
            • Updates in real time
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.25rem", background: "rgba(0,0,0,0.05)", padding: "0.2rem", borderRadius: "8px" }}>
          <button
            type="button"
            onClick={() => setViewportMode("mobile")}
            style={{
              background: viewportMode === "mobile" ? "#FFFFFF" : "transparent",
              color: viewportMode === "mobile" ? "#6B1D28" : "#7A6F6D",
              border: "none",
              borderRadius: "6px",
              padding: "0.25rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: viewportMode === "mobile" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}
          >
            📱 Mobile (390px)
          </button>
          <button
            type="button"
            onClick={() => setViewportMode("desktop")}
            style={{
              background: viewportMode === "desktop" ? "#FFFFFF" : "transparent",
              color: viewportMode === "desktop" ? "#6B1D28" : "#7A6F6D",
              border: "none",
              borderRadius: "6px",
              padding: "0.25rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: viewportMode === "desktop" ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}
          >
            💻 Full Width
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        style={{
          width: viewportMode === "mobile" ? "390px" : "100%",
          maxWidth: "100%",
          height: "780px",
          maxHeight: "calc(100vh - 120px)",
          borderRadius: viewportMode === "mobile" ? "42px" : "16px",
          border: viewportMode === "mobile" ? "10px solid #1A1A1A" : "1px solid rgba(0,0,0,0.15)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
          overflow: "hidden",
          position: "relative",
          backgroundColor: themeConfig.backgroundColor,
          color: themeConfig.textColor,
          fontFamily: themeConfig.fontBody,
          direction: themeConfig.direction === "rtl" ? "rtl" : "ltr",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Dynamic Island / Mobile Notch */}
        {viewportMode === "mobile" && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "110px",
              height: "24px",
              backgroundColor: "#000000",
              borderRadius: "20px",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#111", marginRight: 14 }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#0d3b66" }} />
          </div>
        )}

        {/* Ambient Particle Overlay */}
        {themeConfig.enableParticles && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 1,
              backgroundImage: `radial-gradient(${themeConfig.secondaryColor} 1px, transparent 1px), radial-gradient(${themeConfig.primaryColor} 1px, transparent 1px)`,
              backgroundSize: "40px 40px, 70px 70px",
              backgroundPosition: "0 0, 20px 20px",
              opacity: 0.15,
            }}
          />
        )}

        {/* Scrollable Website Canvas */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            position: "relative",
            zIndex: 2,
            paddingTop: viewportMode === "mobile" ? "36px" : "0",
          }}
        >
          {blocks
            .filter((block) => block.isVisible)
            .map((block) => {
              // 1. HERO BLOCK
              if (block.type === "hero") {
                return (
                  <div
                    key={block.id}
                    style={{
                      position: "relative",
                      padding: "2rem 1.25rem 2.5rem",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.85rem",
                      borderBottom: `1px solid ${themeConfig.secondaryColor}30`,
                    }}
                  >
                    {/* Shader Wave Graphic Simulation */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "120px",
                        background: `linear-gradient(180deg, ${themeConfig.primaryColor}15 0%, transparent 100%)`,
                        pointerEvents: "none",
                      }}
                    />

                    {/* Overline */}
                    {block.overline && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: themeConfig.secondaryColor,
                        }}
                      >
                        {block.overline}
                      </div>
                    )}

                    {/* Main Title */}
                    <h1
                      style={{
                        fontFamily: themeConfig.fontDisplay,
                        fontSize: viewportMode === "mobile" ? "1.85rem" : "2.4rem",
                        fontWeight: 700,
                        color: themeConfig.primaryColor,
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {block.mainTitle || "Celebration Title"}
                    </h1>

                    {/* Acoustic Divider Emblem */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.8 }}>
                      <div style={{ width: "40px", height: "1px", background: themeConfig.secondaryColor }} />
                      <svg width="24" height="12" viewBox="0 0 36 18" fill="none">
                        <path
                          d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
                          stroke={themeConfig.primaryColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div style={{ width: "40px", height: "1px", background: themeConfig.secondaryColor }} />
                    </div>

                    {/* Subtitle */}
                    {block.subtitle && (
                      <p
                        style={{
                          fontSize: "0.88rem",
                          lineHeight: 1.5,
                          maxWidth: "380px",
                          margin: 0,
                          opacity: 0.85,
                          fontStyle: "italic",
                        }}
                      >
                        {block.subtitle}
                      </p>
                    )}

                    {/* Cover Photo */}
                    {block.coverImageUrl && (
                      <div
                        style={{
                          width: "100%",
                          maxHeight: "220px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                          marginTop: "0.5rem",
                          border: `1px solid ${themeConfig.secondaryColor}40`,
                        }}
                      >
                        <img
                          src={block.coverImageUrl}
                          alt="Event Cover"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}

                    {/* Metadata Badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem", marginTop: "0.5rem" }}>
                      {block.datePill && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "999px",
                            background: `${themeConfig.secondaryColor}25`,
                            color: themeConfig.primaryColor,
                            fontWeight: 700,
                            border: `1px solid ${themeConfig.secondaryColor}50`,
                          }}
                        >
                          📅 {block.datePill}
                        </span>
                      )}
                      {block.timePill && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "999px",
                            background: `${themeConfig.secondaryColor}25`,
                            color: themeConfig.primaryColor,
                            fontWeight: 700,
                            border: `1px solid ${themeConfig.secondaryColor}50`,
                          }}
                        >
                          ⏱️ {block.timePill}
                        </span>
                      )}
                      {block.venuePill && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "999px",
                            background: `${themeConfig.secondaryColor}25`,
                            color: themeConfig.primaryColor,
                            fontWeight: 700,
                            border: `1px solid ${themeConfig.secondaryColor}50`,
                          }}
                        >
                          📍 {block.venuePill}
                        </span>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={scrollToRSVP}
                      style={{
                        marginTop: "0.5rem",
                        background: themeConfig.primaryColor,
                        color: "#FFFFFF",
                        border: `1px solid ${themeConfig.secondaryColor}60`,
                        borderRadius: "999px",
                        padding: "0.6rem 1.6rem",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: `0 4px 16px ${themeConfig.primaryColor}40`,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {block.ctaText || "Confirm Attendance"}
                    </button>
                  </div>
                );
              }

              // 2. COUNTDOWN BLOCK
              if (block.type === "countdown") {
                return (
                  <div
                    key={block.id}
                    style={{
                      padding: "1.75rem 1.25rem",
                      textAlign: "center",
                      borderBottom: `1px solid ${themeConfig.secondaryColor}25`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: themeConfig.fontDisplay,
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: themeConfig.primaryColor,
                        marginBottom: "1rem",
                      }}
                    >
                      {block.countdownHeading || "Doors Open In"}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                      {[
                        { label: "DAYS", val: timeLeft.days },
                        { label: "HOURS", val: timeLeft.hours },
                        { label: "MINS", val: timeLeft.minutes },
                        { label: "SECS", val: timeLeft.seconds },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "rgba(255, 255, 255, 0.7)",
                            backdropFilter: "blur(6px)",
                            border: `1px solid ${themeConfig.secondaryColor}40`,
                            borderRadius: "12px",
                            padding: "0.6rem 0.25rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.25rem",
                              fontWeight: 800,
                              fontFamily: "monospace",
                              color: themeConfig.primaryColor,
                            }}
                          >
                            {String(item.val).padStart(2, "0")}
                          </span>
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7A6F6D", marginTop: 2 }}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 3. STORY TIMELINE BLOCK
              if (block.type === "story_timeline") {
                return (
                  <div
                    key={block.id}
                    style={{
                      padding: "1.75rem 1.25rem",
                      borderBottom: `1px solid ${themeConfig.secondaryColor}25`,
                    }}
                  >
                    <h3
                      style={{
                        textAlign: "center",
                        fontFamily: themeConfig.fontDisplay,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: themeConfig.primaryColor,
                        marginBottom: "1.25rem",
                      }}
                    >
                      {block.title}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", position: "relative" }}>
                      {(block.timelineItems || []).map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            background: "rgba(255, 255, 255, 0.6)",
                            padding: "0.75rem",
                            borderRadius: "12px",
                            border: `1px solid ${themeConfig.secondaryColor}30`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              color: themeConfig.secondaryColor,
                              whiteSpace: "nowrap",
                              minWidth: "70px",
                              fontFamily: "monospace",
                            }}
                          >
                            {item.time}
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: themeConfig.textColor }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.2rem", lineHeight: 1.4 }}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 4. GALLERY BLOCK
              if (block.type === "gallery") {
                return (
                  <div
                    key={block.id}
                    style={{
                      padding: "1.75rem 1.25rem",
                      textAlign: "center",
                      borderBottom: `1px solid ${themeConfig.secondaryColor}25`,
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: themeConfig.fontDisplay,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: themeConfig.primaryColor,
                        marginBottom: "1rem",
                      }}
                    >
                      {block.title}
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.5rem",
                      }}
                    >
                      {(block.galleryImages || []).slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          style={{
                            height: "110px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: `1px solid ${themeConfig.secondaryColor}40`,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                          }}
                        >
                          <img src={img} alt={`Gallery ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#7A6F6D", marginTop: "0.5rem" }}>
                      Mode: {block.galleryMode || "circular-3d"}
                    </div>
                  </div>
                );
              }

              // 5. VENUE & MAP BLOCK
              if (block.type === "venue_map") {
                return (
                  <div
                    key={block.id}
                    style={{
                      padding: "1.75rem 1.25rem",
                      borderBottom: `1px solid ${themeConfig.secondaryColor}25`,
                    }}
                  >
                    <h3
                      style={{
                        textAlign: "center",
                        fontFamily: themeConfig.fontDisplay,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: themeConfig.primaryColor,
                        marginBottom: "0.75rem",
                      }}
                    >
                      {block.venueName || "Venue Location"}
                    </h3>

                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        padding: "0.85rem",
                        borderRadius: "12px",
                        border: `1px solid ${themeConfig.secondaryColor}30`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ fontSize: "0.82rem", color: themeConfig.textColor, lineHeight: 1.4 }}>
                        📍 {block.venueAddress || "Alexandria, Egypt"}
                      </div>
                      {block.parkingNote && (
                        <div style={{ fontSize: "0.75rem", color: "#7A6F6D" }}>
                          🚗 {block.parkingNote}
                        </div>
                      )}
                      {block.mapUrl && (
                        <a
                          href={block.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: "0.78rem",
                            color: themeConfig.primaryColor,
                            fontWeight: 700,
                            textDecoration: "underline",
                            alignSelf: "flex-start",
                          }}
                        >
                          Open in Google Maps ↗
                        </a>
                      )}

                      {/* Dress Code Swatches */}
                      {block.dressCodeSwatches && block.dressCodeSwatches.length > 0 && (
                        <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: themeConfig.primaryColor, marginBottom: "0.35rem" }}>
                            👗 Dress Code Palette:
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {block.dressCodeSwatches.map((swatch, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  background: "#FFF",
                                  padding: "0.2rem 0.5rem",
                                  borderRadius: "999px",
                                  border: "1px solid rgba(0,0,0,0.1)",
                                }}
                              >
                                <span style={{ width: 12, height: 12, borderRadius: "50%", background: swatch.hex }} />
                                <span style={{ fontSize: "0.7rem", color: "#333" }}>{swatch.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // 6. CUSTOM HIGHLIGHT BLOCK
              if (block.type === "custom_highlight") {
                return (
                  <div
                    key={block.id}
                    style={{
                      padding: "1.75rem 1.25rem",
                      textAlign: "center",
                      borderBottom: `1px solid ${themeConfig.secondaryColor}25`,
                    }}
                  >
                    {block.highlightBadge && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          background: `${themeConfig.secondaryColor}30`,
                          color: themeConfig.primaryColor,
                          border: `1px solid ${themeConfig.secondaryColor}50`,
                        }}
                      >
                        {block.highlightBadge}
                      </span>
                    )}

                    <h3
                      style={{
                        fontFamily: themeConfig.fontDisplay,
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: themeConfig.primaryColor,
                        marginTop: "0.5rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {block.mainTitle}
                    </h3>

                    <p style={{ fontSize: "0.85rem", lineHeight: 1.5, opacity: 0.85, margin: 0, fontStyle: "italic" }}>
                      &ldquo;{block.highlightText}&rdquo;
                    </p>
                  </div>
                );
              }

              // 7. DYNAMIC RSVP FORM BLOCK
              if (block.type === "rsvp_form") {
                return (
                  <div
                    id="preview-rsvp-form"
                    key={block.id}
                    style={{
                      padding: "2rem 1.25rem 3rem",
                      background: `linear-gradient(180deg, transparent 0%, ${themeConfig.primaryColor}10 100%)`,
                    }}
                  >
                    <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: themeConfig.secondaryColor,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        ✦ RSVP REGISTRATION
                      </span>
                      <h2
                        style={{
                          fontFamily: themeConfig.fontDisplay,
                          fontSize: "1.35rem",
                          fontWeight: 700,
                          color: themeConfig.primaryColor,
                          margin: "0.25rem 0",
                        }}
                      >
                        Join Our Celebration
                      </h2>
                      <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
                        Please complete your RSVP to receive your personalized QR Guest Entry Pass.
                      </p>
                    </div>

                    {submissionFeedback && (
                      <div
                        style={{
                          padding: "0.75rem",
                          borderRadius: "10px",
                          marginBottom: "1rem",
                          fontSize: "0.82rem",
                          background: submitted ? "rgba(30, 111, 80, 0.12)" : "rgba(155, 44, 44, 0.12)",
                          color: submitted ? "#1E6F50" : "#9B2C2C",
                          border: `1px solid ${submitted ? "#1E6F50" : "#9B2C2C"}`,
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        {submissionFeedback}
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmitRSVP}
                      style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
                    >
                      {formFields.map((field) => {
                        const isEmail = field.id === "guestEmail";

                        return (
                          <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label
                              style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: themeConfig.textColor,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <span>{field.label}</span>
                              {field.required && (
                                <span style={{ color: "#9B2C2C", fontWeight: 800 }}>*</span>
                              )}
                              {isEmail && (
                                <span
                                  style={{
                                    fontSize: "0.65rem",
                                    background: "#D4AF37",
                                    color: "#000",
                                    borderRadius: "4px",
                                    padding: "0 0.35rem",
                                    fontWeight: 700,
                                  }}
                                  title="Locked: QR Code will be sent to this email via EmailJS"
                                >
                                  🔒 Required for QR Pass
                                </span>
                              )}
                            </label>

                            {/* Inputs by Type */}
                            {field.type === "textarea" ? (
                              <textarea
                                rows={3}
                                placeholder={field.placeholder}
                                value={typeof formResponses[field.id] === "boolean" ? "" : (formResponses[field.id] as string | number || "")}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(0,0,0,0.15)",
                                  fontSize: "0.85rem",
                                  background: "#FFFFFF",
                                  outline: "none",
                                }}
                              />
                            ) : field.type === "select" ? (
                              <select
                                value={typeof formResponses[field.id] === "boolean" ? "" : (formResponses[field.id] as string | number || "")}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(0,0,0,0.15)",
                                  fontSize: "0.85rem",
                                  background: "#FFFFFF",
                                  outline: "none",
                                }}
                              >
                                <option value="">Select option...</option>
                                {(field.options || []).map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === "radio" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                {(field.options || []).map((opt, i) => (
                                  <label
                                    key={i}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.4rem",
                                      fontSize: "0.8rem",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={field.id}
                                      value={opt}
                                      checked={formResponses[field.id] === opt}
                                      onChange={() => handleInputChange(field.id, opt)}
                                    />
                                    {opt}
                                  </label>
                                ))}
                              </div>
                            ) : field.type === "checkbox" ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                {(field.options || []).map((opt, i) => {
                                  const currentVal = formResponses[field.id];
                                  const isChecked = Array.isArray(currentVal) && currentVal.includes(opt);
                                  return (
                                    <label
                                      key={i}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                        fontSize: "0.8rem",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        value={opt}
                                        checked={isChecked}
                                        onChange={() => handleCheckboxChange(field.id, opt)}
                                      />
                                      {opt}
                                    </label>
                                  );
                                })}
                              </div>
                            ) : (
                              <input
                                type={field.type === "tel" ? "tel" : field.type === "number" ? "number" : field.type === "email" ? "email" : "text"}
                                placeholder={field.placeholder}
                                value={typeof formResponses[field.id] === "boolean" ? "" : (formResponses[field.id] as string | number || "")}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(0,0,0,0.15)",
                                  fontSize: "0.85rem",
                                  background: "#FFFFFF",
                                  outline: "none",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="submit"
                        style={{
                          marginTop: "0.5rem",
                          background: themeConfig.primaryColor,
                          color: "#FFFFFF",
                          border: `1px solid ${themeConfig.secondaryColor}60`,
                          borderRadius: "10px",
                          padding: "0.75rem",
                          fontSize: "0.92rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: `0 4px 14px ${themeConfig.primaryColor}35`,
                        }}
                      >
                        Submit RSVP Request →
                      </button>
                    </form>
                  </div>
                );
              }

              return null;
            })}
        </div>
      </div>
    </div>
  );
};
