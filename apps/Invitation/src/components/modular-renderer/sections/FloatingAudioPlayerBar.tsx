import React, { useState, useEffect, useRef } from "react";
import type { BackgroundAudioSection as BackgroundAudioSectionModel } from "@repo/react-appwrite";

export interface FloatingAudioPlayerBarProps {
  section: BackgroundAudioSectionModel;
  isNoir?: boolean;
}

export const FloatingAudioPlayerBar: React.FC<FloatingAudioPlayerBarProps> = ({
  section,
  isNoir = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(section.initialMuted ?? false);
  const [showAutoplayBanner, setShowAutoplayBanner] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const songTitle = section.songTitle || "A Thousand Years (Acoustic Royal)";
  const artistName = section.artistName || "The Piano Tribute Players";
  const audioUrl =
    section.audioUrl ||
    "https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg"; // reliable public ambient fallback

  // Handle Play / Pause
  const togglePlay = async () => {
    setHasInteracted(true);
    setShowAutoplayBanner(false);
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setAudioError(false);
      } catch (err) {
        console.warn("Audio playback prevented by browser:", err);
        setShowAutoplayBanner(true);
      }
    }
  };

  // Handle Mute Toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && !isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Browser Autoplay Attempt on Mount & One-time Click Gesture
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Try muted autoplay if configured
    if (!section.initialMuted) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay blocked by browser policy; show prompt banner
          setShowAutoplayBanner(true);
        });
    }

    // Attach one-time global user gesture listener to unmute/start
    const handleFirstGesture = () => {
      if (!hasInteracted && audioRef.current) {
        setHasInteracted(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setShowAutoplayBanner(false);
          })
          .catch(() => {});
      }
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };

    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [section.initialMuted, hasInteracted]);

  return (
    <>
      {/* Hidden Real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop={section.loopEnabled ?? true}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setAudioError(true)}
      />

      {/* Tap-To-Unmute Banner if autoplay was blocked */}
      {showAutoplayBanner && !isPlaying && (
        <div
          onClick={togglePlay}
          style={{
            position: "fixed",
            bottom: "82px",
            right: "20px",
            zIndex: 9998,
            backgroundColor: isNoir ? "#231A1E" : "#6B1D28",
            color: "#FFFFFF",
            padding: "0.5rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            border: "1px solid var(--athar-gold, #D4AF37)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            animation: "bounce 2s infinite",
          }}
        >
          <span>🎵</span>
          <span>{section.autoPlayNotice || "انقر للاستماع إلى الموسيقى · Tap for Music"}</span>
        </div>
      )}

      {/* Floating Bottom Ambient Audio Bar */}
      <div
        id={section.id || "floating-audio-bar"}
        className="athar-floating-audio-bar"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.6rem 1rem",
          borderRadius: "9999px",
          backgroundColor: isNoir
            ? "rgba(31, 26, 28, 0.94)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.5))",
          boxShadow: isNoir
            ? "0 12px 32px rgba(0, 0, 0, 0.6)"
            : "0 12px 32px rgba(107, 29, 40, 0.15)",
          maxWidth: "340px",
          transition: "all 0.3s ease",
        }}
      >
        {/* Spinning Vinyl Disc Animation */}
        <div
          onClick={togglePlay}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #2B282A 28%, #161214 60%, #D4AF37 98%)",
            border: "1.5px solid var(--athar-gold, #D4AF37)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            animation: isPlaying ? "spin 3s linear infinite" : "none",
            flexShrink: 0,
          }}
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#D4AF37",
            }}
          />
        </div>

        {/* Track Title & Artist Info */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {songTitle}
          </div>
          <div
            style={{
              fontSize: "0.7rem",
              color: isNoir ? "#D4AF37" : "var(--athar-maroon, #6B1D28)",
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {audioError ? "⚠️ Track preview" : artistName}
          </div>
        </div>

        {/* Dancing Waveform Bars (when playing) */}
        {isPlaying && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "2px",
              height: "16px",
              padding: "0 2px",
            }}
          >
            {[10, 16, 8, 14, 12].map((height, i) => (
              <span
                key={i}
                style={{
                  width: "2.5px",
                  height: `${height}px`,
                  backgroundColor: "var(--athar-gold, #D4AF37)",
                  borderRadius: "2px",
                  animation: `pulse ${0.6 + i * 0.15}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
        )}

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          style={{
            background: "none",
            border: "none",
            color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
            fontSize: "1rem",
            cursor: "pointer",
            padding: "0.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {/* Mute/Unmute Button */}
        <button
          type="button"
          onClick={toggleMute}
          style={{
            background: "none",
            border: "none",
            color: isNoir ? "#D6C7B2" : "var(--athar-text-muted, #7A6F6D)",
            fontSize: "0.95rem",
            cursor: "pointer",
            padding: "0.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>

      {/* Global Injected Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default FloatingAudioPlayerBar;
