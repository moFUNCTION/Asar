// =============================================================
// ASAR (Athar / أثر) — 30-Second Video Highlight Modal
// =============================================================

import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiFilm,
} from "react-icons/fi";

export interface BoothVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  thumbnailUrl?: string;
  coupleTitle?: string;
}

export const BoothVideoModal: React.FC<BoothVideoModalProps> = ({
  isOpen,
  onClose,
  title = "30 Seconds of Your Day",
  thumbnailUrl = "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
  coupleTitle = "Mina & Maryam",
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressSeconds, setProgressSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProgressSeconds(0);
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setIsPlaying(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgressSeconds((prev) => {
        if (prev >= 30) {
          setIsPlaying(false);
          return 30;
        }
        return Number((prev + 0.25).toFixed(2));
      });
    }, 250);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const handleTogglePlay = () => {
    if (progressSeconds >= 30) {
      setProgressSeconds(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const progressPercent = Math.min(100, (progressSeconds / 30) * 100);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(18, 14, 16, 0.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 1200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "800px",
          backgroundColor: "#161214",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1.5px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 25px 70px rgba(0,0,0,0.6)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
            color: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FiFilm color="#D4AF37" />
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              {title} · {coupleTitle}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                backgroundColor: "rgba(212, 175, 55, 0.2)",
                color: "#D4AF37",
                padding: "0.15rem 0.5rem",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            >
              0:30 HIGHLIGHT
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close video"
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontSize: "1.4rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            backgroundColor: "#000000",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background Poster Image */}
          <img
            src={thumbnailUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: isPlaying ? "brightness(0.92)" : "brightness(0.6)",
              transition: "filter 0.3s ease",
            }}
          />

          {/* Center Play/Pause Overlay Icon */}
          <button
            onClick={handleTogglePlay}
            style={{
              position: "absolute",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "rgba(107, 29, 40, 0.88)",
              color: "#ffffff",
              border: "2px solid #D4AF37",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.8rem",
              cursor: "pointer",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              opacity: isPlaying ? 0.35 : 0.95,
              transition: "all 0.25s ease",
            }}
            title={isPlaying ? "إيقاف مؤقت" : "تشغيل الفيديو"}
          >
            {isPlaying ? (
              <FiPause />
            ) : (
              <FiPlay style={{ marginRight: "-3px" }} />
            )}
          </button>

          {/* Subtitle Overlay Banner */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.65)",
              color: "#F1E5D1",
              padding: "0.4rem 0.9rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              backdropFilter: "blur(4px)",
            }}
          >
            سينما أثر التوثيقية · أروع 30 ثانية من ليلة العمر
          </div>
        </div>

        {/* Video Scrubber & Controls */}
        <div style={{ padding: "1rem 1.5rem", backgroundColor: "#1D171A" }}>
          {/* Progress Bar */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(
                0,
                Math.min(1, (e.clientX - rect.left) / rect.width)
              );
              setProgressSeconds(Number((ratio * 30).toFixed(1)));
            }}
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              cursor: "pointer",
              position: "relative",
              marginBottom: "0.85rem",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: "var(--athar-gold)",
                borderRadius: "4px",
                transition: "width 0.15s linear",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#ffffff",
              fontSize: "0.9rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button
                onClick={handleTogglePlay}
                style={{
                  background: "none",
                  border: "none",
                  color: "#D4AF37",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isPlaying ? <FiPause /> : <FiPlay />}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {isMuted ? <FiVolumeX /> : <FiVolume2 />}
              </button>

              <span
                style={{
                  fontFamily: "monospace",
                  direction: "ltr",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.85rem",
                }}
              >
                0:{Math.floor(progressSeconds).toString().padStart(2, "0")} / 0:30
              </span>
            </div>

            <span style={{ fontSize: "0.82rem", color: "#D4AF37" }}>
              دقة سينمائية 4K Ultra HD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothVideoModal;
