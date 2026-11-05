// =============================================================
// ASAR (Athar / أثر) — Venue Location & Dress Code Component
// =============================================================

import React, { useState } from "react";
import {
  FiMapPin,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import type { InvitationDressCodeConfig } from "./types";

export interface InvitationLocationDressCodeProps {
  venueName: string;
  venueAddress?: string;
  venueMapUrl?: string;
  dressCode?: InvitationDressCodeConfig;
  isNoir?: boolean;
}

export const InvitationLocationDressCode: React.FC<
  InvitationLocationDressCodeProps
> = ({
  venueName,
  venueAddress = "الإسكندرية، جمهورية مصر العربية",
  venueMapUrl,
  dressCode,
  isNoir = false,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const googleMapsUrl =
    venueMapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${venueName} ${venueAddress}`
    )}`;

  const handleCopyAddress = () => {
    const fullText = `${venueName} - ${venueAddress}`;
    navigator.clipboard?.writeText(fullText).then(() => {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    });
  };

  const defaultSwatches = dressCode?.swatches || [
    { name: "العنابي الملكي", hex: "#6B1D28" },
    { name: "الذهب الشامباني", hex: "#D4AF37" },
    { name: "الأسود الأوبسيديان", hex: "#1F1A1C" },
    { name: "الألباستر الدافئ", hex: "#FBF7F2" },
  ];

  return (
    <section
      style={{
        padding: "4rem 1.5rem",
        maxWidth: "960px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
            fontWeight: 700,
            fontSize: "0.85rem",
            letterSpacing: "0.15em",
            marginBottom: "0.5rem",
          }}
        >
          <FiMapPin />
          <span>VENUE LOCATION & DRESS CODE</span>
        </div>

        <h2
          className="font-arabic-display"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          موقع الحفل وقواعد اللباس
        </h2>

        <p
          style={{
            fontSize: "1rem",
            color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
          }}
        >
          كل ما تحتاج لمعرفته للوصول بكل راحة والاستعداد للأمسية الملكية
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2rem",
        }}
      >
        {/* Card 1: Venue Location Card */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.92)"
              : "rgba(255, 255, 255, 0.95)",
            border: isNoir
              ? "1.5px solid rgba(212, 175, 55, 0.35)"
              : "1.5px solid rgba(107, 29, 40, 0.12)",
            borderRadius: "24px",
            padding: "2.25rem 2rem",
            boxShadow: "var(--athar-shadow-soft)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.15)"
                  : "rgba(107, 29, 40, 0.08)",
                color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "1.2rem",
              }}
            >
              <FiMapPin />
            </div>

            <h3
              className="font-arabic-display"
              style={{
                fontSize: "1.6rem",
                color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
                marginBottom: "0.6rem",
                fontWeight: 700,
              }}
            >
              {venueName}
            </h3>

            <p
              style={{
                fontSize: "1rem",
                color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              {venueAddress}
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-athar-primary"
              style={{ flex: 1, minWidth: "180px", fontSize: "0.92rem" }}
            >
              <span>فتح في خرائط Google</span>
              <FiExternalLink />
            </a>

            <button
              onClick={handleCopyAddress}
              className="btn-athar-secondary"
              style={{
                backgroundColor: isNoir ? "rgba(255,255,255,0.08)" : "#ffffff",
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              }}
            >
              {copiedAddress ? <FiCheck color="#16A34A" /> : <FiCopy />}
              <span>{copiedAddress ? "تم النسخ!" : "نسخ العنوان"}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Dress Code Swatches Card */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.92)"
              : "rgba(255, 255, 255, 0.95)",
            border: isNoir
              ? "1.5px solid rgba(212, 175, 55, 0.35)"
              : "1.5px solid rgba(107, 29, 40, 0.12)",
            borderRadius: "24px",
            padding: "2.25rem 2rem",
            boxShadow: "var(--athar-shadow-soft)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.15)"
                  : "rgba(107, 29, 40, 0.08)",
                color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "1.2rem",
              }}
            >
              <FiCheckCircle />
            </div>

            <h3
              className="font-arabic-display"
              style={{
                fontSize: "1.6rem",
                color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
                marginBottom: "0.6rem",
                fontWeight: 700,
              }}
            >
              {dressCode?.title || "أزياء السهرة الرسمية الفاخرة"}
            </h3>

            <p
              style={{
                fontSize: "0.98rem",
                color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
                lineHeight: 1.7,
                marginBottom: "1.5rem",
              }}
            >
              {dressCode?.description ||
                "يسعدنا تألقكم بأزياء السهرة الرسمية التي تليق بهذه الليلة الاستثنائية. نفضل درجات الألوان الملكية المتناسقة أدناه."}
            </p>

            {/* Swatches Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                flexWrap: "wrap",
                marginBottom: "1.2rem",
              }}
            >
              {defaultSwatches.map((swatch, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    backgroundColor: isNoir
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(107, 29, 40, 0.05)",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "var(--athar-radius-full)",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                  }}
                >
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: swatch.hex,
                      border: "1px solid rgba(0,0,0,0.15)",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    }}
                  >
                    {swatch.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {dressCode?.notes && (
            <div
              style={{
                fontSize: "0.85rem",
                color: isNoir ? "#D4AF37" : "var(--athar-text-muted)",
                borderTop: "1px solid rgba(212, 175, 55, 0.2)",
                paddingTop: "0.8rem",
              }}
            >
              {dressCode.notes}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InvitationLocationDressCode;
