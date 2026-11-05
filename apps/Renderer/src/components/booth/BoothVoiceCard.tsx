// =============================================================
// ASAR (Athar / أثر) — Booth Voice Record Card Component
// 48-Bar Waveform Scrubber + Speaker Badges + Favorites + Options
// =============================================================

import React, { useState } from "react";
import {
  FiPlay,
  FiPause,
  FiHeart,
  FiMoreVertical,
  FiCopy,
  FiShare2,
  FiDownload,
  FiCheck,
} from "react-icons/fi";
import type { VoiceRecordItem } from "./types";

export interface BoothVoiceCardProps {
  record: VoiceRecordItem;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onSeek: (seconds: number) => void;
  onToggleLike: (id: string) => void;
}

export const BoothVoiceCard: React.FC<BoothVoiceCardProps> = ({
  record,
  isPlaying,
  currentTime,
  onPlayPause,
  onSeek,
  onToggleLike,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const duration = record.durationSeconds || 42;
  const progressPercent = isPlaying
    ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
    : 0;
  const peaks = record.waveformPeaks || [];
  const activeBarIndex = Math.floor((progressPercent / 100) * (peaks.length || 48));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const handleCopyQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(
      `"${record.quoteSnippet}" — ${record.speakerName} (${record.speakerRole})`
    );
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
    setShowMenu(false);
  };

  const handleShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?voice=${record.id}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    setShowMenu(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = record.audioUrl || "#";
    link.download = `${record.speakerName}_${record.speakerRole}_athar_memory.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  const initials = record.speakerName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="glass-panel"
      style={{
        position: "relative",
        borderRadius: "var(--athar-radius-md)",
        padding: "1.25rem 1.5rem",
        border: isPlaying
          ? "1.5px solid var(--athar-maroon)"
          : "1px solid rgba(107, 29, 40, 0.08)",
        boxShadow: isPlaying
          ? "0 12px 32px -8px rgba(107, 29, 40, 0.22)"
          : "var(--athar-shadow-soft)",
        transition: "all 0.25s ease",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Left Side: Avatar + Play Button + Speaker Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            flex: "1 1 280px",
            minWidth: "260px",
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {record.avatarUrl ? (
              <img
                src={record.avatarUrl}
                alt={record.speakerName}
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #D4AF37",
                }}
              />
            ) : (
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "50%",
                  backgroundColor: "var(--athar-maroon)",
                  color: "#F1E5D1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "2px solid #D4AF37",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "var(--athar-maroon)",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.05rem",
              boxShadow: "0 4px 14px rgba(107, 29, 40, 0.3)",
              flexShrink: 0,
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
          >
            {isPlaying ? (
              <FiPause />
            ) : (
              <FiPlay style={{ marginRight: "-2px" }} />
            )}
          </button>

          {/* Speaker Details */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--athar-text-title)",
                }}
              >
                {record.speakerName}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--athar-text-muted)",
                  fontWeight: 500,
                }}
              >
                {record.speakerRole}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "var(--athar-radius-full)",
                  backgroundColor: "rgba(212, 175, 55, 0.15)",
                  color: "var(--athar-maroon)",
                  fontWeight: 600,
                }}
              >
                {record.category}
              </span>
            </div>

            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--athar-text-body)",
                fontStyle: "italic",
                marginTop: "0.2rem",
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "420px",
              }}
              title={record.quoteSnippet}
            >
              "{record.quoteSnippet}"
            </p>
          </div>
        </div>

        {/* Right Side: 48-Peak Waveform Scrubber + Time + Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
            flex: "1 1 340px",
            justifyContent: "flex-end",
          }}
        >
          {/* Waveform Scrubber */}
          <div
            onClick={handleWaveformClick}
            title="انقر على التردد الصوتي للتقديم والتأخير"
            style={{
              flex: "1 1 180px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              padding: "0 4px",
              borderRadius: "6px",
              backgroundColor: "rgba(107, 29, 40, 0.02)",
            }}
          >
            {peaks.map((peak, idx) => {
              const isPassed = isPlaying && idx <= activeBarIndex;
              const barHeight = Math.max(4, Math.round(peak * 28));

              return (
                <div
                  key={idx}
                  style={{
                    width: "2.5px",
                    height: `${barHeight}px`,
                    borderRadius: "4px",
                    backgroundColor: isPassed
                      ? "var(--athar-maroon)"
                      : "rgba(107, 29, 40, 0.18)",
                    transition:
                      "background-color 0.12s ease, height 0.15s ease",
                  }}
                />
              );
            })}
          </div>

          {/* Time Formatted */}
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              fontFamily: "monospace",
              direction: "ltr",
              color: isPlaying
                ? "var(--athar-maroon)"
                : "var(--athar-text-muted)",
              minWidth: "36px",
              textAlign: "right",
            }}
          >
            {isPlaying ? formatTime(currentTime) : record.durationFormatted}
          </div>

          {/* Like Heart Button */}
          <button
            onClick={() => onToggleLike(record.id)}
            aria-label={record.isLiked ? "Unlike message" : "Like message"}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: record.isLiked ? "#C53030" : "var(--athar-text-muted)",
              fontSize: "1.1rem",
              padding: "0.3rem",
              borderRadius: "50%",
              transition: "transform 0.15s ease, color 0.15s ease",
            }}
          >
            <FiHeart
              style={{
                fill: record.isLiked ? "#C53030" : "none",
              }}
            />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--athar-text-muted)",
              }}
            >
              {record.likesCount}
            </span>
          </button>

          {/* Options Popover Menu */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="More options"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--athar-text-muted)",
                fontSize: "1.15rem",
                padding: "0.3rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiMoreVertical />
            </button>

            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  marginTop: "4px",
                  zIndex: 20,
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18)",
                  border: "1px solid rgba(107, 29, 40, 0.12)",
                  padding: "0.4rem",
                  minWidth: "180px",
                }}
              >
                <button
                  onClick={handleCopyQuote}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    background: "none",
                    fontSize: "0.85rem",
                    color: "var(--athar-text-body)",
                    cursor: "pointer",
                    borderRadius: "6px",
                    textAlign: "right",
                  }}
                >
                  {copiedQuote ? (
                    <FiCheck color="#16A34A" />
                  ) : (
                    <FiCopy color="var(--athar-maroon)" />
                  )}
                  <span>{copiedQuote ? "تم نسخ الاقتباس!" : "نسخ الاقتباس"}</span>
                </button>

                <button
                  onClick={handleShareLink}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    background: "none",
                    fontSize: "0.85rem",
                    color: "var(--athar-text-body)",
                    cursor: "pointer",
                    borderRadius: "6px",
                    textAlign: "right",
                  }}
                >
                  {copiedLink ? (
                    <FiCheck color="#16A34A" />
                  ) : (
                    <FiShare2 color="var(--athar-maroon)" />
                  )}
                  <span>{copiedLink ? "تم نسخ الرابط!" : "مشاركة التسجيل"}</span>
                </button>

                <button
                  onClick={handleDownload}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    background: "none",
                    fontSize: "0.85rem",
                    color: "var(--athar-text-body)",
                    cursor: "pointer",
                    borderRadius: "6px",
                    textAlign: "right",
                  }}
                >
                  <FiDownload color="var(--athar-maroon)" />
                  <span>تحميل الرسالة الصوتية</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoothVoiceCard;
