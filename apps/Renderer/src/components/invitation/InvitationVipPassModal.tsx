// =============================================================
// ASAR (Athar / أثر) — VIP QR Guest Pass Modal
// =============================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiX,
  FiCheckCircle,
  FiDownload,
  FiExternalLink,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import type { GeneratedVipPass } from "./types";

export interface InvitationVipPassModalProps {
  pass: GeneratedVipPass | null;
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
  eventDate?: string;
  venueName?: string;
}

export const InvitationVipPassModal: React.FC<InvitationVipPassModalProps> = ({
  pass,
  isOpen,
  onClose,
  eventTitle = "حفل الزفاف الملكي",
  eventDate = "2026-11-20",
  venueName = "قاعة فورسيزونز",
}) => {
  const [copiedToken, setCopiedToken] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  if (!isOpen || !pass) return null;

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(pass.passToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleDownloadPass = () => {
    setDownloadDone(true);
    const link = document.createElement("a");
    link.href = pass.qrCodeUrl;
    link.download = `Athar_VIP_Pass_${pass.passToken}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadDone(false), 3000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(35, 31, 32, 0.78)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 1200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#FBF7F2",
          borderRadius: "28px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          border: "2px solid rgba(212, 175, 55, 0.45)",
          boxShadow: "0 25px 65px -10px rgba(107, 29, 40, 0.35)",
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

        {/* Status Ribbon */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 1.2rem",
            borderRadius: "var(--athar-radius-full)",
            backgroundColor: "rgba(107, 29, 40, 0.08)",
            color: "var(--athar-maroon)",
            fontWeight: 700,
            fontSize: "0.85rem",
            marginBottom: "1.2rem",
          }}
        >
          <FiCheckCircle color="#6B1D28" />
          <span>تم اعتماد الحضور · VIP GUEST PASS</span>
        </div>

        {/* Event Title */}
        <h2
          className="font-arabic-display"
          style={{
            fontSize: "1.8rem",
            color: "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.4rem",
          }}
        >
          {eventTitle}
        </h2>

        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--athar-gold)",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          {eventDate} · {venueName}
        </p>

        {/* QR Code Container */}
        <div
          style={{
            width: "210px",
            height: "210px",
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
            src={pass.qrCodeUrl}
            alt="VIP Guest QR Pass"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Guest Pass Details Box */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "1.2rem 1.4rem",
            borderRadius: "16px",
            marginBottom: "1.8rem",
            textAlign: "right",
            border: "1px solid rgba(107, 29, 40, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>
              اسم الضيف الكريم:
            </span>
            <span
              style={{
                fontWeight: 700,
                color: "var(--athar-text-title)",
                fontSize: "0.95rem",
              }}
            >
              {pass.guestName}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>
              البريد المعتمد:
            </span>
            <span
              style={{
                direction: "ltr",
                fontFamily: "monospace",
                color: "var(--athar-maroon)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {pass.guestEmail}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>
              رمز التصريح (Token):
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  fontFamily: "monospace",
                  direction: "ltr",
                  color: "var(--athar-maroon)",
                  fontWeight: 700,
                  fontSize: "0.92rem",
                }}
              >
                {pass.passToken}
              </span>
              <button
                onClick={handleCopyToken}
                style={{
                  background: "none",
                  border: "none",
                  color: copiedToken ? "#16A34A" : "var(--athar-maroon)",
                  cursor: "pointer",
                  padding: "2px",
                }}
              >
                {copiedToken ? <FiCheck /> : <FiCopy />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--athar-text-muted)", fontSize: "0.85rem" }}>
              عدد المرافقين:
            </span>
            <span style={{ fontWeight: 700, color: "var(--athar-text-title)" }}>
              {pass.companionsCount > 0
                ? `${pass.companionsCount} مرافق إضافي`
                : "ضيف مفرد (بدون مرافقين)"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            to={`/pass/${pass.$id || pass.id}`}
            className="btn-athar-primary"
            style={{ width: "100%" }}
          >
            <span>فتح صفحة بطاقة الدخول المستقلة</span>
            <FiExternalLink />
          </Link>

          <button
            onClick={handleDownloadPass}
            className="btn-athar-secondary"
            style={{ width: "100%" }}
          >
            {downloadDone ? <FiCheck color="#16A34A" /> : <FiDownload />}
            <span>{downloadDone ? "تم بدء تحميل البطاقة!" : "تحميل وتثبيت بطاقة QR"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationVipPassModal;
