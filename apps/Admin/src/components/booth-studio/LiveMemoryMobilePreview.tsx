import React, { useState } from "react";
import type { BoothMemory } from "./HeroAndTextsEditor";
import type { BoothVoiceRecord } from "./BulkVoiceUploader";
import type { BoothMediaItem } from "./MediaAndTabsEditor";

export interface LiveMemoryMobilePreviewProps {
  memory: BoothMemory;
  voiceRecords: BoothVoiceRecord[];
  mediaItems: BoothMediaItem[];
  hasVideoHighlightPlan?: boolean;
}

export const LiveMemoryMobilePreview: React.FC<LiveMemoryMobilePreviewProps> = ({
  memory,
  voiceRecords,
  mediaItems,
  hasVideoHighlightPlan = true,
}) => {
  const [activeTab, setActiveTab] = useState<
    "audio" | "photos" | "video" | "guestbook" | "thankyou"
  >("audio");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const photos = mediaItems.filter((m) => m.mediaType === "photo");
  const guestBookNotes = mediaItems.filter((m) => m.mediaType === "guestbook_note");

  const filteredVoices = voiceRecords.filter((v) => {
    if (activeCategory === "All") return true;
    return v.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const categories = memory.categories && memory.categories.length > 0
    ? memory.categories
    : ["Family", "Friends", "Colleagues", "Special Guests"];

  return (
    <div
      style={{
        position: "sticky",
        top: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "var(--athar-text-muted)",
          marginBottom: "0.6rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <span>📱</span> Live Interactive iPhone Preview (Real-Time Synced)
      </div>

      {/* iPhone 15 Pro Bezel */}
      <div
        style={{
          width: "375px",
          height: "780px",
          background: "#201A1D",
          borderRadius: "52px",
          padding: "12px",
          boxShadow: "0 25px 60px -15px rgba(107, 29, 40, 0.35), 0 0 0 2px #443B40",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Screen Container */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#FBF7F2",
            borderRadius: "42px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Status Bar & Dynamic Island */}
          <div
            style={{
              height: "44px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 1.5rem",
              background: "transparent",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              fontSize: "0.74rem",
              fontWeight: 700,
              color: "#231F20",
            }}
          >
            <span>9:41</span>
            {/* Dynamic Island Pill */}
            <div
              style={{
                width: "90px",
                height: "24px",
                background: "#000000",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#111" }} />
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#222" }} />
            </div>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* Scrollable Mobile Viewport */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              paddingTop: "44px",
              paddingBottom: "24px",
              scrollbarWidth: "none",
            }}
          >
            {/* 1. Sticky Luxury Top Bar */}
            <div
              style={{
                padding: "0.6rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(251, 247, 242, 0.95)",
                backdropFilter: "blur(8px)",
                borderBottom: "1px solid rgba(107, 29, 40, 0.08)",
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  color: "var(--athar-maroon)",
                }}
              >
                ≡
              </button>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-arabic-display)",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    color: "var(--athar-maroon)",
                    letterSpacing: "0.04em",
                  }}
                >
                  أثر ATHAR AUDIO MEMORIES
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  color: memory.isPrivateLocked ? "var(--athar-gold)" : "var(--athar-text-muted)",
                }}
                title={memory.isPrivateLocked ? "Private Memory Vault" : "Public Link"}
              >
                <span>{memory.isPrivateLocked ? "🔒" : "🌐"}</span>
              </div>
            </div>

            {/* 2. Editorial Couple Hero Section */}
            <div style={{ position: "relative", textAlign: "center", padding: "1.2rem 1rem 0.8rem 1rem" }}>
              {/* Couple Hero Photo / Portrait */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  margin: "0 auto 1rem auto",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid var(--athar-gold)",
                  boxShadow: "0 8px 24px rgba(212, 175, 55, 0.25)",
                  background: "var(--athar-bg-secondary)",
                }}
              >
                {memory.heroImageUrl ? (
                  <img
                    src={memory.heroImageUrl}
                    alt={memory.coupleTitle}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.4rem",
                    }}
                  >
                    💍
                  </div>
                )}
              </div>

              {/* Overline */}
              <div
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  color: "var(--athar-maroon)",
                  textTransform: "uppercase",
                  marginBottom: "0.2rem",
                }}
              >
                {memory.eventHeaderTag || "THE WEDDING OF"}
              </div>

              {/* Couple Title */}
              <h1
                style={{
                  fontFamily: "var(--font-latin-display)",
                  fontSize: "1.65rem",
                  fontStyle: "italic",
                  fontWeight: 700,
                  color: "#5B1621",
                  margin: "0 0 0.3rem 0",
                  lineHeight: 1.2,
                }}
              >
                {memory.coupleTitle || "Mina & Maryam"}
              </h1>

              {/* Acoustic Divider Emblem */}
              <div style={{ color: "var(--athar-gold)", fontSize: "0.75rem", letterSpacing: "0.2em", margin: "0.2rem 0" }}>
                ─── ∿∿∿ ───
              </div>

              {/* Subtitle / Tagline */}
              <p style={{ fontSize: "0.78rem", color: "var(--athar-text-muted)", margin: "0 0 0.8rem 0" }}>
                {memory.tagline || "Same People. Different Voices. A Lasting Athar."}
              </p>

              {/* 3 Metadata Badges Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.4rem",
                  flexWrap: "wrap",
                  marginBottom: "0.9rem",
                }}
              >
                <span
                  style={{
                    background: "rgba(107, 29, 40, 0.06)",
                    border: "1px solid rgba(107, 29, 40, 0.12)",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--athar-text-title)",
                  }}
                >
                  📅 {memory.eventDateDisplay || "12 July 2026"}
                </span>
                <span
                  style={{
                    background: "rgba(107, 29, 40, 0.06)",
                    border: "1px solid rgba(107, 29, 40, 0.12)",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--athar-text-title)",
                  }}
                >
                  📍 {memory.eventLocationDisplay || "Alexandria, Egypt"}
                </span>
                <span
                  style={{
                    background: "rgba(212, 175, 55, 0.15)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "#8C6F12",
                  }}
                >
                  🤍 {memory.highlightBadge || "Together Always"}
                </span>
              </div>

              {/* Personal Quote Block */}
              {memory.coupleQuote && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    borderRadius: "14px",
                    padding: "0.75rem 1rem",
                    margin: "0 auto 0.8rem auto",
                    boxShadow: "0 2px 8px rgba(107, 29, 40, 0.04)",
                  }}
                >
                  <p
                    dir="auto"
                    style={{
                      fontSize: "0.76rem",
                      fontStyle: "italic",
                      color: "var(--athar-text-body)",
                      margin: "0 0 0.2rem 0",
                    }}
                  >
                    &quot;{memory.coupleQuote}&quot;
                  </p>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--athar-maroon)" }}>
                    – {memory.coupleTitle || "Mina & Maryam"}
                  </span>
                </div>
              )}
            </div>

            {/* 3. 5-Tab Horizontal Navigation Strip */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                padding: "0 0.75rem",
                overflowX: "auto",
                scrollbarWidth: "none",
                marginBottom: "1rem",
              }}
            >
              {[
                { id: "audio", label: "Audio Messages", icon: "🎙️" },
                { id: "photos", label: "Photos", icon: "📸" },
                ...(hasVideoHighlightPlan ? [{ id: "video", label: "Video", icon: "🎬" }] : []),
                { id: "guestbook", label: "Guest Book", icon: "📖" },
                { id: "thankyou", label: "Thank You", icon: "🤍" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.45rem 0.75rem",
                      borderRadius: "12px",
                      border: isActive ? "none" : "1px solid rgba(107, 29, 40, 0.12)",
                      background: isActive ? "var(--athar-maroon)" : "var(--athar-bg-secondary)",
                      color: isActive ? "#ffffff" : "var(--athar-text-title)",
                      fontWeight: 700,
                      fontSize: "0.74rem",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      boxShadow: isActive ? "0 4px 12px rgba(107, 29, 40, 0.25)" : "none",
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 4. Tab Content Views */}
            {activeTab === "audio" && (
              <div style={{ padding: "0 0.75rem" }}>
                {/* Category Filter Pills */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.35rem",
                    overflowX: "auto",
                    scrollbarWidth: "none",
                    marginBottom: "0.85rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveCategory("All")}
                    style={{
                      padding: "0.25rem 0.65rem",
                      borderRadius: "9999px",
                      border: "none",
                      background: activeCategory === "All" ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)",
                      color: activeCategory === "All" ? "#ffffff" : "var(--athar-maroon)",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    All ({voiceRecords.length})
                  </button>
                  {categories.map((cat) => {
                    const count = voiceRecords.filter((v) => v.category.toLowerCase() === cat.toLowerCase()).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        style={{
                          padding: "0.25rem 0.65rem",
                          borderRadius: "9999px",
                          border: "none",
                          background: activeCategory === cat ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)",
                          color: activeCategory === cat ? "#ffffff" : "var(--athar-maroon)",
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Voice Records List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  {filteredVoices.map((voice) => {
                    const isPlaying = playingId === voice.id;

                    return (
                      <div
                        key={voice.id}
                        style={{
                          background: "#ffffff",
                          border: voice.isFeatured ? "1px solid var(--athar-gold)" : "1px solid rgba(107, 29, 40, 0.08)",
                          borderRadius: "14px",
                          padding: "0.75rem",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {/* Monogram circle */}
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "var(--athar-maroon)",
                                color: "#ffffff",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {voice.speakerName.charAt(0)}
                            </div>

                            <div>
                              <div style={{ fontWeight: 800, fontSize: "0.84rem", color: "var(--athar-text-title)" }}>
                                {voice.speakerName}
                              </div>
                              <div style={{ fontSize: "0.68rem", color: "var(--athar-text-muted)" }}>
                                {voice.speakerRole}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            {voice.isFeatured && (
                              <span style={{ color: "#D4AF37", fontSize: "0.85rem" }}>★</span>
                            )}
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                padding: "0.15rem 0.45rem",
                                borderRadius: "9999px",
                                background: "rgba(107, 29, 40, 0.06)",
                                color: "var(--athar-maroon)",
                              }}
                            >
                              {voice.category}
                            </span>
                          </div>
                        </div>

                        {/* Quote Snippet */}
                        {voice.quoteSnippet && (
                          <p
                            dir="auto"
                            style={{
                              fontSize: "0.74rem",
                              color: "var(--athar-text-body)",
                              margin: "0.3rem 0 0.5rem 0",
                              lineHeight: 1.4,
                            }}
                          >
                            &quot;{voice.quoteSnippet}&quot;
                          </p>
                        )}

                        {/* Audio Player Strip & 48-Peak Waveform */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            background: "var(--athar-bg-secondary)",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "10px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setPlayingId(isPlaying ? null : voice.id)}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              background: isPlaying ? "var(--athar-maroon)" : "#ffffff",
                              color: isPlaying ? "#ffffff" : "var(--athar-maroon)",
                              border: "none",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.72rem",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            }}
                          >
                            {isPlaying ? "⏸" : "▶"}
                          </button>

                          {/* 48-Peak Waveform Bars */}
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "1px",
                              height: "20px",
                            }}
                          >
                            {voice.waveformPeaks.slice(0, 36).map((peak, idx) => (
                              <div
                                key={idx}
                                style={{
                                  flex: 1,
                                  height: `${Math.max(15, peak * 100)}%`,
                                  background: isPlaying
                                    ? "var(--athar-maroon)"
                                    : "var(--athar-gold)",
                                  borderRadius: "1px",
                                  transition: "height 0.15s ease",
                                }}
                              />
                            ))}
                          </div>

                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              color: "var(--athar-text-muted)",
                              fontFamily: "monospace",
                            }}
                          >
                            {voice.durationFormatted}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div style={{ padding: "0 0.75rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid rgba(107, 29, 40, 0.08)",
                      }}
                    >
                      <img
                        src={photo.fileUrl}
                        alt="Event Photo"
                        style={{ width: "100%", height: "100px", objectFit: "cover" }}
                      />
                      {photo.captionOrNote && (
                        <div style={{ padding: "0.3rem", fontSize: "0.68rem", color: "var(--athar-text-body)" }}>
                          {photo.captionOrNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "video" && (
              <div style={{ padding: "0 0.75rem" }}>
                <div
                  style={{
                    background: "#000000",
                    borderRadius: "14px",
                    height: "170px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    position: "relative",
                  }}
                >
                  <span style={{ fontSize: "2.4rem", color: "var(--athar-gold)" }}>▶</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, marginTop: "0.3rem" }}>
                    {memory.videoHighlightTitle || "30 Seconds of Your Day"}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "guestbook" && (
              <div style={{ padding: "0 0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {guestBookNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "10px",
                      padding: "0.6rem 0.75rem",
                      border: "1px solid rgba(107, 29, 40, 0.08)",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "0.78rem", color: "var(--athar-maroon)" }}>
                      {note.authorName}
                    </div>
                    <div dir="auto" style={{ fontSize: "0.74rem", color: "var(--athar-text-body)", marginTop: "0.15rem" }}>
                      &quot;{note.captionOrNote}&quot;
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "thankyou" && (
              <div style={{ padding: "0 0.75rem" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.2rem",
                    textAlign: "center",
                    border: "1px solid var(--athar-gold)",
                    boxShadow: "var(--athar-shadow-gold)",
                  }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>🤍</div>
                  <h3
                    style={{
                      fontFamily: "var(--font-latin-display)",
                      fontSize: "1.2rem",
                      color: "var(--athar-maroon)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Thank You
                  </h3>
                  <p dir="auto" style={{ fontSize: "0.78rem", color: "var(--athar-text-body)", lineHeight: 1.5 }}>
                    {memory.thankYouMessage ||
                      "Thank you from the bottom of our hearts for filling our wedding with love, laughter, and lasting memories."}
                  </p>
                  <div style={{ marginTop: "0.8rem", fontWeight: 700, fontSize: "0.82rem", color: "var(--athar-maroon)" }}>
                    – {memory.coupleTitle || "Mina & Maryam"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
