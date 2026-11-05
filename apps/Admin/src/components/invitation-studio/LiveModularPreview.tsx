import React, { useState, useEffect } from "react";
import type {
  EventSection,
  CoverHeroSection,
  CoupleStorySection,
  EventScheduleSection,
  PhotoGallerySection,
  WishingWallSection,
  DigitalGiftRegistrySection,
  BackgroundAudioSection,
  VenueLocationSection,
  LiveCountdownSection,
  CustomHighlightSection,
  DynamicRsvpSection,
  DynamicFormField,
} from "@repo/react-appwrite";
import type { InvitationThemeConfig } from "./ThemeAndEffectsPanel";

export interface ExtendedThemeConfig extends Partial<InvitationThemeConfig> {
  accentGoldColor?: string;
  fontFamilyDisplay?: string;
  fontFamilyBody?: string;
}

export interface LiveModularPreviewProps {
  themeConfig?: InvitationThemeConfig;
  sections: EventSection[];
  onSelectSection?: (id: string) => void;
  eventSlug?: string;
}

export const LiveModularPreview: React.FC<LiveModularPreviewProps> = ({
  themeConfig,
  sections,
  onSelectSection,
}) => {
  const [viewportMode, setViewportMode] = useState<"mobile" | "desktop">("mobile");

  // Interactive Live Audio Simulation State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Interactive Lightbox State
  const [activeLightboxImg, setActiveLightboxImg] = useState<{ url: string; caption?: string } | null>(null);

  // Interactive Bank QR Modal State
  const [activeBankQr, setActiveBankQr] = useState<{ bankName: string; qrUrl?: string; accNo: string } | null>(null);

  // Interactive Wishing Wall Live State
  const [wishes, setWishes] = useState<
    Array<{ id: string; author: string; message: string; date: string; likes: number; hasLiked?: boolean }>
  >([
    {
      id: "w-1",
      author: "Tarek & Mona Mansour",
      message: "Alf Mabrook to the most wonderful couple! Wishing you a lifetime filled with boundless laughter, love, and divine grace. ❤️",
      date: "Just now",
      likes: 12,
    },
    {
      id: "w-2",
      author: "Nouran El-Shennawy",
      message: "Cannot wait to celebrate under the Alexandria stars! You two are pure magic together. Congratulations! ✨🎉",
      date: "2 hours ago",
      likes: 8,
    },
    {
      id: "w-3",
      author: "Karim & Yasmine",
      message: "May your union be blessed with peace and unending joy. Love you both so dearly! 💐",
      date: "Yesterday",
      likes: 15,
    },
  ]);
  const [newWishAuthor, setNewWishAuthor] = useState("");
  const [newWishMessage, setNewWishMessage] = useState("");

  // Interactive RSVP Form State
  const [rsvpValues, setRsvpValues] = useState<Record<string, string | number | boolean>>({});
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState<string | null>(null);

  // Live Countdown Calculation
  const countdownSec = sections.find((s) => s.type === "live_countdown") as LiveCountdownSection | undefined;
  const targetIso = countdownSec?.targetDateIso || "2026-11-20T19:30:00.000Z";
  const [countdown, setCountdown] = useState({ days: 16, hours: 8, mins: 44, secs: 12 });

  useEffect(() => {
    const calc = () => {
      const target = new Date(targetIso).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  // Sort enabled sections by order
  const sortedSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Colors & Theme Styling
  const extendedTheme = themeConfig as ExtendedThemeConfig | undefined;
  const primaryColor = themeConfig?.primaryColor || "#6B1D28";
  const goldColor =
    extendedTheme?.accentGoldColor ||
    themeConfig?.accentColor ||
    themeConfig?.secondaryColor ||
    "#D4AF37";
  const bgColor = themeConfig?.backgroundColor || "#FBF7F2";
  const fontDisplay =
    extendedTheme?.fontFamilyDisplay || themeConfig?.fontDisplay || "Amiri";
  const fontBody =
    extendedTheme?.fontFamilyBody || themeConfig?.fontBody || "Cairo";

  // Wishing Wall Post Handler
  const handlePostWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishAuthor.trim() || !newWishMessage.trim()) return;

    const newEntry = {
      id: `w-${Date.now()}`,
      author: newWishAuthor.trim(),
      message: newWishMessage.trim(),
      date: "Just now",
      likes: 1,
    };
    setWishes([newEntry, ...wishes]);
    setNewWishAuthor("");
    setNewWishMessage("");
  };

  const handleToggleLike = (id: string) => {
    setWishes((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const hasLiked = !w.hasLiked;
          return {
            ...w,
            hasLiked,
            likes: hasLiked ? w.likes + 1 : Math.max(0, w.likes - 1),
          };
        }
        return w;
      })
    );
  };

  // RSVP Form Submit Handler
  const handleRsvpSubmit = (e: React.FormEvent, schema: DynamicFormField[]) => {
    e.preventDefault();
    const missing: string[] = [];
    for (const f of schema) {
      if (f.required) {
        const v = rsvpValues[f.id] ?? rsvpValues[f.name];
        if (v === undefined || v === null || String(v).trim() === "") {
          missing.push(f.labelEn || f.name);
        }
      }
    }

    if (missing.length > 0) {
      setRsvpMessage(`⚠️ Please complete required fields: ${missing.slice(0, 2).join(", ")}`);
      return;
    }

    setRsvpSubmitted(true);
    setRsvpMessage(
      `✓ Attendance confirmed! A personalized VIP QR entry pass has been generated.`
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        position: "sticky",
        top: "1.25rem",
      }}
    >
      {/* Viewport Control Bar */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.85rem",
          background: "#FFFFFF",
          padding: "0.6rem 1rem",
          borderRadius: "12px",
          border: "1px solid rgba(107, 29, 40, 0.12)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6B1D28" }}>
            Live Modular Preview
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              background: "rgba(5, 150, 105, 0.1)",
              color: "#059669",
              padding: "0.15rem 0.45rem",
              borderRadius: "999px",
              fontWeight: 700,
            }}
          >
            ● Synchronized
          </span>
        </div>

        {/* Device Switcher */}
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            background: "rgba(0,0,0,0.04)",
            padding: "0.2rem",
            borderRadius: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => setViewportMode("mobile")}
            style={{
              background: viewportMode === "mobile" ? "#FFFFFF" : "transparent",
              color: viewportMode === "mobile" ? "#6B1D28" : "#666",
              border: "none",
              borderRadius: "6px",
              padding: "0.3rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: viewportMode === "mobile" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            📱 Mobile (375px)
          </button>
          <button
            type="button"
            onClick={() => setViewportMode("desktop")}
            style={{
              background: viewportMode === "desktop" ? "#FFFFFF" : "transparent",
              color: viewportMode === "desktop" ? "#6B1D28" : "#666",
              border: "none",
              borderRadius: "6px",
              padding: "0.3rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: viewportMode === "desktop" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            💻 Desktop
          </button>
        </div>
      </div>

      {/* Device Frame */}
      <div
        style={{
          width: viewportMode === "mobile" ? "375px" : "100%",
          maxWidth: viewportMode === "mobile" ? "375px" : "640px",
          height: "82vh",
          backgroundColor: bgColor,
          borderRadius: viewportMode === "mobile" ? "38px" : "16px",
          border: viewportMode === "mobile" ? "10px solid #1A1A1A" : "1px solid rgba(0,0,0,0.12)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.22)",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: `${fontBody}, sans-serif`,
          transition: "all 0.25s ease",
        }}
      >
        {/* Mobile Camera Notch */}
        {viewportMode === "mobile" && (
          <div
            style={{
              position: "sticky",
              top: 0,
              left: 0,
              right: 0,
              height: "24px",
              zIndex: 100,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "90px",
                height: "12px",
                backgroundColor: "#1A1A1A",
                borderRadius: "10px",
              }}
            />
          </div>
        )}

        {/* Live Modular Sections Renderer */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
          {sortedSections.map((section) => {
            return (
              <div
                key={section.id}
                onClick={() => onSelectSection && onSelectSection(section.id)}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  transition: "outline 0.15s ease",
                }}
                title={`Click to edit ${section.title}`}
              >
                {/* 1. Cover / Hero Section */}
                {section.type === "cover_hero" && (() => {
                  const s = section as CoverHeroSection;
                  return (
                    <div
                      style={{
                        position: "relative",
                        minHeight: "460px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: "3rem 1.5rem",
                        color: "#FFFFFF",
                        backgroundImage: s.coverImageUrl
                          ? `linear-gradient(to bottom, rgba(13,11,14,0.45), rgba(107,29,40,0.88)), url(${s.coverImageUrl})`
                          : `linear-gradient(135deg, ${primaryColor}, #1A1A1A)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Wax Seal Monogram */}
                      {s.waxSealMonogram && (
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: `radial-gradient(circle, ${goldColor}, #8A7228)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1A1A1A",
                            fontWeight: 900,
                            fontSize: "1.1rem",
                            letterSpacing: "1px",
                            boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
                            marginBottom: "1rem",
                            border: "2px solid rgba(255,255,255,0.4)",
                          }}
                        >
                          {s.waxSealMonogram}
                        </div>
                      )}

                      {s.overline && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            letterSpacing: "2.5px",
                            textTransform: "uppercase",
                            opacity: 0.9,
                            marginBottom: "0.5rem",
                            fontWeight: 700,
                            color: goldColor,
                          }}
                        >
                          {s.overline}
                        </span>
                      )}

                      <h1
                        style={{
                          fontFamily: `${fontDisplay}, serif`,
                          fontSize: "2.1rem",
                          fontWeight: 700,
                          margin: "0 0 0.5rem 0",
                          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}
                      >
                        {s.coupleTitle}
                      </h1>

                      {s.tagline && (
                        <p
                          style={{
                            fontSize: "0.85rem",
                            lineHeight: 1.5,
                            maxWidth: "320px",
                            margin: "0 0 1.25rem 0",
                            opacity: 0.92,
                            fontStyle: "italic",
                          }}
                        >
                          "{s.tagline}"
                        </p>
                      )}

                      {/* Date and Venue Pills */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", justifyContent: "center" }}>
                        {s.dateDisplay && (
                          <span
                            style={{
                              background: "rgba(255,255,255,0.18)",
                              backdropFilter: "blur(6px)",
                              padding: "0.35rem 0.85rem",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              border: "1px solid rgba(255,255,255,0.25)",
                            }}
                          >
                            📅 {s.dateDisplay}
                          </span>
                        )}
                        {s.venueDisplay && (
                          <span
                            style={{
                              background: "rgba(255,255,255,0.18)",
                              backdropFilter: "blur(6px)",
                              padding: "0.35rem 0.85rem",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              border: "1px solid rgba(255,255,255,0.25)",
                            }}
                          >
                            📍 {s.venueDisplay}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 2. Background Audio Soundtrack Floating Bar */}
                {section.type === "background_audio" && (() => {
                  const s = section as BackgroundAudioSection;
                  return (
                    <div
                      style={{
                        background: "#181419",
                        color: "#FFFFFF",
                        padding: "0.7rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {/* Spinning Vinyl Record Icon */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPlayingAudio(!isPlayingAudio);
                          }}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, #D4AF37 20%, #1A1A1A 21%, #2A2A2A 80%, #0D0B0E 95%)",
                            border: "2px solid #D4AF37",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            animation: isPlayingAudio ? "spin 3s linear infinite" : "none",
                          }}
                        >
                          <span style={{ fontSize: "0.7rem", color: "#FFF" }}>
                            {isPlayingAudio ? "⏸" : "▶"}
                          </span>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFFFFF" }}>
                            {s.songTitle || "Celebration Soundtrack"}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: goldColor }}>
                            {s.artistName || "Athar Music Ensemble"} • {isPlayingAudio ? "Now Playing" : "Tap vinyl to play"}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "0.68rem",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "999px",
                          background: isPlayingAudio ? "rgba(5,150,105,0.2)" : "rgba(255,255,255,0.1)",
                          color: isPlayingAudio ? "#10B981" : "#AAA",
                          fontWeight: 700,
                        }}
                      >
                        {isPlayingAudio ? "Soundtrack Live" : "Audio Ready"}
                      </span>
                    </div>
                  );
                })()}

                {/* 3. Live Countdown Section */}
                {section.type === "live_countdown" && (() => {
                  const s = section as LiveCountdownSection;
                  return (
                    <div
                      style={{
                        padding: "1.75rem 1.25rem",
                        textAlign: "center",
                        background: "linear-gradient(to bottom, #FFFFFF, #FAF7F2)",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.68rem",
                          letterSpacing: "2px",
                          textTransform: "uppercase",
                          color: goldColor,
                          fontWeight: 800,
                        }}
                      >
                        TIME UNTIL FOREVER
                      </span>
                      <h3
                        style={{
                          fontFamily: `${fontDisplay}, serif`,
                          fontSize: "1.25rem",
                          color: "#231F20",
                          margin: "0.25rem 0 1rem 0",
                        }}
                      >
                        {s.heading}
                      </h3>

                      {/* Countdown Ticker Boxes */}
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        {[
                          { label: "Days", val: countdown.days },
                          { label: "Hours", val: countdown.hours },
                          { label: "Mins", val: countdown.mins },
                          { label: "Secs", val: countdown.secs },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid rgba(107,29,40,0.12)",
                              borderRadius: "10px",
                              padding: "0.5rem 0.75rem",
                              minWidth: "48px",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                            }}
                          >
                            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: primaryColor }}>
                              {String(item.val).padStart(2, "0")}
                            </div>
                            <div style={{ fontSize: "0.62rem", color: "#888", textTransform: "uppercase", fontWeight: 700 }}>
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Couple Story & Milestones */}
                {section.type === "couple_story" && (() => {
                  const s = section as CoupleStorySection;
                  return (
                    <div style={{ padding: "2rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          CHAPTERS OF US
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.title}
                        </h3>
                        {s.subtitle && <p style={{ fontSize: "0.78rem", color: "#777", margin: 0 }}>{s.subtitle}</p>}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {s.milestones.map((m) => (
                          <div
                            key={m.id}
                            style={{
                              display: "flex",
                              gap: "0.85rem",
                              alignItems: "center",
                              background: "#FBF7F2",
                              padding: "0.75rem",
                              borderRadius: "10px",
                              border: "1px solid rgba(107,29,40,0.08)",
                            }}
                          >
                            {m.imageUrl && (
                              <img
                                src={m.imageUrl}
                                alt={m.title}
                                style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover" }}
                              />
                            )}
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: "0.68rem", color: primaryColor, fontWeight: 800 }}>
                                {m.yearOrDate}
                              </span>
                              <h4 style={{ fontSize: "0.88rem", fontWeight: 700, margin: "0.1rem 0", color: "#231F20" }}>
                                {m.title}
                              </h4>
                              <p style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.35, margin: 0 }}>
                                {m.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Event Schedule Section */}
                {section.type === "event_schedule" && (() => {
                  const s = section as EventScheduleSection;
                  return (
                    <div style={{ padding: "2rem 1.25rem", background: "#FAF7F2", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          CELEBRATION ITINERARY
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.title}
                        </h3>
                        {s.subtitle && <p style={{ fontSize: "0.78rem", color: "#777", margin: 0 }}>{s.subtitle}</p>}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {s.scheduleItems.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid rgba(0,0,0,0.07)",
                              borderRadius: "10px",
                              padding: "0.85rem",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: primaryColor }}>
                                ⏰ {item.time}
                              </span>
                              {item.dressCode && (
                                <span style={{ fontSize: "0.68rem", background: "rgba(0,0,0,0.05)", padding: "0.15rem 0.45rem", borderRadius: "4px", color: "#555" }}>
                                  👔 {item.dressCode}
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: "0.15rem 0", color: "#231F20" }}>
                              {item.eventName}
                            </h4>
                            {item.locationName && (
                              <div style={{ fontSize: "0.74rem", color: "#777" }}>
                                📍 {item.locationName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 6. Photo Gallery Section */}
                {section.type === "photo_gallery" && (() => {
                  const s = section as PhotoGallerySection;
                  return (
                    <div style={{ padding: "2rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          GALLERY
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.title}
                        </h3>
                        {s.subtitle && <p style={{ fontSize: "0.78rem", color: "#777", margin: 0 }}>{s.subtitle}</p>}
                      </div>

                      {/* Photo Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        {s.images.map((img) => (
                          <div
                            key={img.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLightboxImg(img);
                            }}
                            style={{
                              position: "relative",
                              height: "110px",
                              borderRadius: "8px",
                              overflow: "hidden",
                              cursor: "zoom-in",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.caption || "Gallery"}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            {img.caption && (
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
                                  color: "#FFF",
                                  fontSize: "0.65rem",
                                  padding: "0.3rem 0.4rem",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {img.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 7. Wishing Wall & Guestbook Live Stream */}
                {section.type === "wishing_wall" && (() => {
                  const s = section as WishingWallSection;
                  return (
                    <div style={{ padding: "2rem 1.25rem", background: "#FDFCFB", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          GUEST BLESSINGS
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.title}
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "#777", margin: 0 }}>{s.greetingPrompt}</p>
                      </div>

                      {/* Post Wish Interactive Simulation */}
                      <form
                        onSubmit={handlePostWish}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid rgba(107,29,40,0.12)",
                          borderRadius: "10px",
                          padding: "0.85rem",
                          marginBottom: "1.25rem",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                        }}
                      >
                        <input
                          type="text"
                          value={newWishAuthor}
                          onChange={(e) => setNewWishAuthor(e.target.value)}
                          placeholder="Your Name..."
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "0.45rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid rgba(0,0,0,0.15)",
                            fontSize: "0.78rem",
                            marginBottom: "0.4rem",
                          }}
                        />
                        <textarea
                          rows={2}
                          value={newWishMessage}
                          onChange={(e) => setNewWishMessage(e.target.value)}
                          placeholder={s.placeholder || "Leave your blessings..."}
                          maxLength={s.maxMessageLength || 300}
                          style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "0.45rem 0.6rem",
                            borderRadius: "6px",
                            border: "1px solid rgba(0,0,0,0.15)",
                            fontSize: "0.78rem",
                            fontFamily: "inherit",
                            resize: "none",
                            marginBottom: "0.4rem",
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: primaryColor,
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            padding: "0.4rem 0.85rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            width: "100%",
                          }}
                        >
                          Send Blessing 💌
                        </button>
                      </form>

                      {/* Stream of Wishes */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {wishes.map((w) => (
                          <div
                            key={w.id}
                            style={{
                              background: "#FFFFFF",
                              border: "1px solid rgba(0,0,0,0.06)",
                              borderRadius: "8px",
                              padding: "0.75rem",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#231F20" }}>
                                {w.author}
                              </span>
                              <span style={{ fontSize: "0.65rem", color: "#999" }}>{w.date}</span>
                            </div>
                            <p style={{ fontSize: "0.75rem", color: "#555", lineHeight: 1.4, margin: "0.2rem 0 0.4rem 0" }}>
                              {w.message}
                            </p>
                            {s.allowReactions && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLike(w.id);
                                }}
                                style={{
                                  background: w.hasLiked ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.04)",
                                  border: "none",
                                  borderRadius: "999px",
                                  padding: "0.15rem 0.5rem",
                                  fontSize: "0.7rem",
                                  cursor: "pointer",
                                  color: w.hasLiked ? "#EF4444" : "#666",
                                  fontWeight: 700,
                                }}
                              >
                                ❤️ {w.likes}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* 8. Digital Gift Registry / Bank QR */}
                {section.type === "digital_gift_registry" && (() => {
                  const s = section as DigitalGiftRegistrySection;
                  return (
                    <div style={{ padding: "2rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          BLESSING BOX & REGISTRY
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.title}
                        </h3>
                        <p style={{ fontSize: "0.76rem", color: "#777", margin: 0 }}>{s.greetingNote}</p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {s.accounts.map((acc) => (
                          <div
                            key={acc.id}
                            style={{
                              background: "#FAF7F2",
                              border: "1px solid rgba(212,175,55,0.25)",
                              borderRadius: "10px",
                              padding: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: goldColor }}>
                                {acc.bankName}
                              </span>
                              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#231F20", fontFamily: "monospace" }}>
                                {acc.accountNumber}
                              </div>
                              <div style={{ fontSize: "0.72rem", color: "#666" }}>
                                Holder: {acc.accountHolder}
                              </div>
                            </div>

                            {acc.qrImageUrl && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveBankQr({ bankName: acc.bankName, qrUrl: acc.qrImageUrl, accNo: acc.accountNumber });
                                }}
                                style={{
                                  background: primaryColor,
                                  color: "#FFF",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "0.4rem 0.65rem",
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                View QR 📱
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {s.cashGiftingEnabled && s.cashGiftingInstructions && (
                        <div style={{ marginTop: "0.85rem", padding: "0.6rem", background: "rgba(0,0,0,0.03)", borderRadius: "8px", fontSize: "0.72rem", color: "#666", textAlign: "center" }}>
                          🎁 {s.cashGiftingInstructions}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 9. Venue Location & Map Guide */}
                {section.type === "venue_location" && (() => {
                  const s = section as VenueLocationSection;
                  return (
                    <div style={{ padding: "2rem 1.25rem", background: "#FAF7F2", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          LOCATION & NAVIGATION
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.venueName}
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "#666", margin: 0 }}>📍 {s.address}</p>
                      </div>

                      {/* Map Embed or Placeholder */}
                      <div
                        style={{
                          height: "140px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#E5E5E5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#777",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: "0.85rem",
                          border: "1px solid rgba(0,0,0,0.1)",
                        }}
                      >
                        {s.mapEmbedUrl ? (
                          <iframe
                            title="Venue Map Preview"
                            src={s.mapEmbedUrl}
                            style={{ width: "100%", height: "100%", border: "none" }}
                          />
                        ) : (
                          <span>🗺️ Interactive Map Preview</span>
                        )}
                      </div>

                      {s.parkingNote && (
                        <div style={{ fontSize: "0.74rem", color: "#555", marginBottom: "0.85rem" }}>
                          🚗 <b>Valet & Parking:</b> {s.parkingNote}
                        </div>
                      )}

                      {/* Dress Code Swatches */}
                      {s.dressCodeSwatches && s.dressCodeSwatches.length > 0 && (
                        <div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#444", display: "block", marginBottom: "0.35rem" }}>
                            {s.dressCodeTitle || "Attire Palette & Color Guidance"}:
                          </span>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {s.dressCodeSwatches.map((sw, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.3rem",
                                  background: "#FFFFFF",
                                  padding: "0.2rem 0.5rem",
                                  borderRadius: "6px",
                                  border: "1px solid rgba(0,0,0,0.08)",
                                  fontSize: "0.7rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "14px",
                                    height: "14px",
                                    borderRadius: "3px",
                                    backgroundColor: sw.hex,
                                    border: "1px solid rgba(0,0,0,0.2)",
                                  }}
                                />
                                <span>{sw.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 10. Custom Editorial Highlight */}
                {section.type === "custom_highlight" && (() => {
                  const s = section as CustomHighlightSection;
                  return (
                    <div
                      style={{
                        padding: "2rem 1.5rem",
                        background:
                          s.backgroundStyle === "obsidian"
                            ? "#0D0B0E"
                            : s.backgroundStyle === "alabaster"
                            ? "#FBF7F2"
                            : primaryColor,
                        color:
                          s.backgroundStyle === "alabaster" ? "#231F20" : "#FFFFFF",
                        textAlign: "center",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      {s.badge && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            letterSpacing: "2px",
                            fontWeight: 800,
                            color: goldColor,
                            display: "block",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {s.badge}
                        </span>
                      )}
                      <blockquote
                        style={{
                          fontFamily: `${fontDisplay}, serif`,
                          fontSize: "1.1rem",
                          lineHeight: 1.6,
                          fontStyle: "italic",
                          margin: "0 0 0.85rem 0",
                        }}
                      >
                        "{s.quoteText}"
                      </blockquote>
                      {s.author && (
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: goldColor }}>
                          — {s.author}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 11. Dynamic RSVP Interactive Form */}
                {section.type === "dynamic_rsvp" && (() => {
                  const s = section as DynamicRsvpSection;
                  return (
                    <div style={{ padding: "2.25rem 1.25rem", background: "#FFFFFF" }}>
                      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.68rem", letterSpacing: "2px", color: goldColor, fontWeight: 800 }}>
                          RESERVATION
                        </span>
                        <h3 style={{ fontFamily: `${fontDisplay}, serif`, fontSize: "1.35rem", margin: "0.2rem 0", color: "#231F20" }}>
                          {s.title}
                        </h3>
                        {s.subtitle && <p style={{ fontSize: "0.78rem", color: "#777", margin: 0 }}>{s.subtitle}</p>}
                      </div>

                      {rsvpSubmitted ? (
                        <div
                          style={{
                            background: "rgba(5,150,105,0.08)",
                            border: "1px solid #059669",
                            borderRadius: "10px",
                            padding: "1.25rem",
                            textAlign: "center",
                            color: "#059669",
                          }}
                        >
                          <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>✓</div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{rsvpMessage}</div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRsvpSubmitted(false);
                            }}
                            style={{
                              marginTop: "0.85rem",
                              background: "none",
                              border: "none",
                              color: "#059669",
                              textDecoration: "underline",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                            }}
                          >
                            Submit another RSVP
                          </button>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => handleRsvpSubmit(e, s.formSchema)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                        >
                          {rsvpMessage && (
                            <div style={{ fontSize: "0.78rem", color: "#B91C1C", fontWeight: 700 }}>
                              {rsvpMessage}
                            </div>
                          )}

                          {s.formSchema.map((field) => (
                            <div key={field.id}>
                              <label
                                style={{
                                  display: "block",
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  color: "#333",
                                  marginBottom: "0.2rem",
                                }}
                              >
                                {field.labelEn} {field.required && <span style={{ color: "#B91C1C" }}>*</span>}
                              </label>

                              {field.type === "textarea" ? (
                                <textarea
                                  rows={2}
                                  placeholder={field.placeholderEn}
                                  value={String(rsvpValues[field.id] || "")}
                                  onChange={(e) => setRsvpValues({ ...rsvpValues, [field.id]: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "0.5rem 0.65rem",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    fontSize: "0.8rem",
                                    fontFamily: "inherit",
                                  }}
                                />
                              ) : field.type === "select" ? (
                                <select
                                  value={String(rsvpValues[field.id] || field.defaultValue || "0")}
                                  onChange={(e) => setRsvpValues({ ...rsvpValues, [field.id]: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "0.5rem 0.65rem",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    fontSize: "0.8rem",
                                    background: "#FFF",
                                  }}
                                >
                                  {(field.options || []).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.labelEn}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field.type}
                                  placeholder={field.placeholderEn}
                                  value={String(rsvpValues[field.id] || "")}
                                  onChange={(e) => setRsvpValues({ ...rsvpValues, [field.id]: e.target.value })}
                                  style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "0.5rem 0.65rem",
                                    borderRadius: "8px",
                                    border: "1px solid rgba(0,0,0,0.15)",
                                    fontSize: "0.8rem",
                                  }}
                                />
                              )}
                            </div>
                          ))}

                          <button
                            type="submit"
                            style={{
                              marginTop: "0.5rem",
                              background: `linear-gradient(135deg, ${primaryColor}, #8C2534)`,
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "8px",
                              padding: "0.65rem",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 4px 12px rgba(107,29,40,0.3)",
                            }}
                          >
                            Confirm Attendance & Receive VIP QR
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            backgroundColor: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setActiveLightboxImg(null)}
        >
          <img
            src={activeLightboxImg.url}
            alt={activeLightboxImg.caption || "Lightbox"}
            style={{
              maxWidth: "90%",
              maxHeight: "80vh",
              borderRadius: "12px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          />
          {activeLightboxImg.caption && (
            <p style={{ color: "#FFF", marginTop: "1rem", fontSize: "0.95rem" }}>
              {activeLightboxImg.caption}
            </p>
          )}
          <button
            type="button"
            onClick={() => setActiveLightboxImg(null)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "rgba(255,255,255,0.2)",
              color: "#FFF",
              border: "none",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Bank QR Modal */}
      {activeBankQr && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10001,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setActiveBankQr(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "1.75rem",
              textAlign: "center",
              maxWidth: "340px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#231F20" }}>
              {activeBankQr.bankName}
            </h4>
            <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
              {activeBankQr.accNo}
            </div>

            {activeBankQr.qrUrl && (
              <img
                src={activeBankQr.qrUrl}
                alt="Bank QR"
                style={{ width: "220px", height: "220px", borderRadius: "10px", margin: "0 auto 1rem auto" }}
              />
            )}

            <button
              type="button"
              onClick={() => setActiveBankQr(null)}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "none",
                background: primaryColor,
                color: "#FFFFFF",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
