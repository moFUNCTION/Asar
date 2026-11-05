import React, { useState, useRef } from "react";
import type { BackgroundAudioSection } from "@repo/react-appwrite";

export interface BackgroundAudioInspectorProps {
  section: BackgroundAudioSection;
  onChange: (updated: BackgroundAudioSection) => void;
}

export const BackgroundAudioInspector: React.FC<BackgroundAudioInspectorProps> = ({
  section,
  onChange,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const update = (partial: Partial<BackgroundAudioSection>) => {
    onChange({ ...section, ...partial });
  };

  const togglePreviewPlay = () => {
    if (!audioRef.current) return;
    if (isPlayingPreview) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((e) => {
        console.warn("Audio playback failed", e);
        setIsPlayingPreview(false);
      });
    }
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
            🎵 Atmospheric Audio Soundtrack Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Floating vinyl music disc player with celebration melody & acoustic tunes.
          </span>
        </div>
      </div>

      {/* Song Title & Artist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Track / Song Title *
          </label>
          <input
            type="text"
            value={section.songTitle}
            onChange={(e) => update({ songTitle: e.target.value })}
            placeholder="e.g. Clair de Lune (Acoustic Piano)"
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

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Artist / Composer Name
          </label>
          <input
            type="text"
            value={section.artistName}
            onChange={(e) => update({ artistName: e.target.value })}
            placeholder="e.g. Claude Debussy (Athar Ensemble)"
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

      {/* Audio Stream URL with Test Player */}
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Audio Stream / MP3 URL *
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="text"
            value={section.audioUrl}
            onChange={(e) => update({ audioUrl: e.target.value })}
            placeholder="https://assets.mixkit.co/music/preview/..."
            style={{
              flex: 1,
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />

          <button
            type="button"
            onClick={togglePreviewPlay}
            disabled={!section.audioUrl}
            style={{
              background: isPlayingPreview ? "#B91C1C" : "#6B1D28",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "0.55rem 0.95rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: section.audioUrl ? "pointer" : "not-allowed",
              opacity: section.audioUrl ? 1 : 0.5,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              whiteSpace: "nowrap",
            }}
          >
            <span>{isPlayingPreview ? "⏸ Pause" : "▶ Listen"}</span>
          </button>
        </div>

        {/* Hidden Audio element for preview */}
        {section.audioUrl && (
          <audio
            ref={audioRef}
            src={section.audioUrl}
            onEnded={() => setIsPlayingPreview(false)}
            onError={() => setIsPlayingPreview(false)}
          />
        )}
      </div>

      {/* AutoPlay Notice */}
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Autoplay Tap Notice / Prompt
        </label>
        <input
          type="text"
          value={section.autoPlayNotice}
          onChange={(e) => update({ autoPlayNotice: e.target.value })}
          placeholder="e.g. Tap vinyl disc icon to start background music"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid rgba(0,0,0,0.15)",
            fontSize: "0.85rem",
          }}
        />
        <span style={{ fontSize: "0.72rem", color: "#888", marginTop: "0.2rem", display: "block" }}>
          Modern browsers require initial user interaction before unmuting audio autoplay.
        </span>
      </div>

      {/* Loop & Initial Muted Toggles */}
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
            checked={section.loopEnabled}
            onChange={(e) => update({ loopEnabled: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Loop Music Indefinitely
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
            checked={section.initialMuted}
            onChange={(e) => update({ initialMuted: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Start in Muted State (Guest Unmutes)
        </label>
      </div>
    </div>
  );
};
