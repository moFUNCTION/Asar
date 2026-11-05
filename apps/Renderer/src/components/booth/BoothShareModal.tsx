// =============================================================
// ASAR (Athar / أثر) — Booth Memory QR Share Sheet Modal
// =============================================================

import React, { useState } from "react";
import {
  FiX,
  FiShare2,
  FiCopy,
  FiCheck,
  FiDownload,
  FiExternalLink,
} from "react-icons/fi";
import { buildMemoryUrls } from "@repo/react-appwrite";

export interface BoothShareModalProps {
  slug: string;
  coupleTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const BoothShareModal: React.FC<BoothShareModalProps> = ({
  slug,
  coupleTitle,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const urls = buildMemoryUrls({
    slug,
    type: "booth",
    port: 3004,
    rendererPort: 3004,
    isDev: import.meta.env.DEV,
  });

  const canonicalUrl = urls.canonicalUrl;
  const devUrl = urls.devRendererUrl;
  const qrTarget = canonicalUrl;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
    qrTarget
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCard = () => {
    setDownloadSuccess(true);
    // Simulate image download
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `Athar_Keepsake_QR_${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(35, 31, 32, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 1150,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#FBF7F2",
          borderRadius: "28px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          border: "1.5px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 24px 64px -12px rgba(107, 29, 40, 0.28)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "none",
            border: "none",
            color: "var(--athar-text-muted)",
            fontSize: "1.3rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiX />
        </button>

        {/* Share Icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "rgba(212, 175, 55, 0.18)",
            color: "var(--athar-maroon)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            margin: "0 auto 1rem auto",
          }}
        >
          <FiShare2 />
        </div>

        <h2
          className="font-arabic-display"
          style={{
            fontSize: "1.75rem",
            color: "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.3rem",
          }}
        >
          مشاركة رابط وبطاقة ذكريات {coupleTitle}
        </h2>

        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--athar-text-muted)",
            marginBottom: "1.8rem",
          }}
        >
          امسح رمز الاستجابة السريعة (QR) أو انسخ الرابط الدائم لمشاركته مع
          الأحباء
        </p>

        {/* QR Code Container */}
        <div
          style={{
            width: "200px",
            height: "200px",
            margin: "0 auto 1.5rem auto",
            backgroundColor: "#ffffff",
            padding: "12px",
            borderRadius: "20px",
            border: "2px solid rgba(212, 175, 55, 0.4)",
            boxShadow: "0 8px 24px rgba(107, 29, 40, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={qrImageUrl}
            alt="Booth QR Code"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Canonical Link Display */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "0.75rem 1rem",
            borderRadius: "14px",
            border: "1px solid rgba(107, 29, 40, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.6rem",
            marginBottom: "1.5rem",
            direction: "ltr",
          }}
        >
          <span
            style={{
              fontSize: "0.88rem",
              fontFamily: "monospace",
              color: "var(--athar-maroon)",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {canonicalUrl}
          </span>

          <button
            onClick={handleCopyLink}
            aria-label="Copy canonical link"
            style={{
              background: "none",
              border: "none",
              color: copied ? "#16A34A" : "var(--athar-maroon)",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            {copied ? <FiCheck /> : <FiCopy />}
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={handleCopyLink}
            className="btn-athar-primary"
            style={{ width: "100%" }}
          >
            {copied ? <FiCheck /> : <FiCopy />}
            <span>{copied ? "تم نسخ الرابط الحصري بنجاح!" : "نسخ رابط المنصة الحصري"}</span>
          </button>

          <button
            onClick={handleDownloadCard}
            className="btn-athar-secondary"
            style={{ width: "100%" }}
          >
            {downloadSuccess ? <FiCheck color="#16A34A" /> : <FiDownload />}
            <span>{downloadSuccess ? "تم بدء تحميل البطاقة!" : "تحميل بطاقة الـ QR التذكارية"}</span>
          </button>

          {devUrl && (
            <a
              href={devUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.82rem",
                color: "var(--athar-gold)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem",
                marginTop: "0.4rem",
              }}
            >
              <span>معاينة عبر المنفذ المحلي ({devUrl})</span>
              <FiExternalLink />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoothShareModal;
