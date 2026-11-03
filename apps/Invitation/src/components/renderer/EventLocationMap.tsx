import React, { useState } from "react";
import type { DressCodeConfig } from "./types";

export interface EventLocationMapProps {
  venueName: string;
  venueAddress?: string;
  venueMapUrl?: string;
  dressCode?: DressCodeConfig;
  notes?: string;
  isNoir?: boolean;
}

const DEFAULT_DRESS_CODE: DressCodeConfig = {
  title: "أزياء السهرة الرسمية الفاخرة · Black Tie & Evening Glamour",
  description:
    "يسعدنا تألقكم بأزياء السهرة الرسمية التي تليق بهذه الليلة الاستثنائية. نفضل درجات الألوان الملكية المتناسقة أدناه.",
  swatches: [
    { name: "العنابي الملكي", hex: "#6B1D28" },
    { name: "الذهب الشامباني", hex: "#D4AF37" },
    { name: "الأسود الأوبسيديان", hex: "#1F1A1C" },
    { name: "الزمردي الراقي", hex: "#1E6F50" },
    { name: "الألباستر الدافئ", hex: "#FBF7F2" },
  ],
  notes: "خدمة صف السيارات (Valet Parking) متوفرة مجاناً لجميع السادة الضيوف عند المدخل الرئيسي.",
};

export const EventLocationMap: React.FC<EventLocationMapProps> = ({
  venueName,
  venueAddress = "الإسكندرية، جمهورية مصر العربية",
  venueMapUrl,
  dressCode = DEFAULT_DRESS_CODE,
  notes,
  isNoir = false,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const googleMapsUrl =
    venueMapUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName} ${venueAddress}`)}`;

  const handleCopyAddress = () => {
    const fullText = `${venueName} - ${venueAddress}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText).then(() => {
        setCopiedAddress(true);
        setTimeout(() => setCopiedAddress(false), 2500);
      });
    }
  };

  return (
    <section
      className="event-location-map-section"
      style={{
        padding: "4rem 1.5rem",
        maxWidth: "920px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2
          className="font-arabic-display"
          style={{
            fontSize: "clamp(1.8rem, 3.8vw, 2.6rem)",
            color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          موقع الحفل وقواعد اللباس
        </h2>
        <p
          style={{
            fontSize: "0.98rem",
            color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
          }}
        >
          كل ما تحتاج لمعرفته للوصول بكل راحة والاستعداد للأمسية
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.75rem",
        }}
      >
        {/* Venue Location Card */}
        <div
          className="luxury-card"
          style={{
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.9)"
              : "rgba(255, 255, 255, 0.95)",
            border: "1.5px solid var(--athar-gold-border)",
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
                borderRadius: "14px",
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.15)"
                  : "var(--athar-bg-primary)",
                border: "1px solid var(--athar-gold-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1.25rem",
              }}
            >
              📍
            </div>

            <h3
              className="font-arabic-display"
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                marginBottom: "0.75rem",
              }}
            >
              {venueName}
            </h3>

            <p
              style={{
                fontSize: "0.95rem",
                color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}
            >
              {venueAddress}
            </p>

            {notes && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: isNoir ? "#A8A8B7" : "var(--athar-text-muted)",
                  marginBottom: "1.5rem",
                  backgroundColor: isNoir
                    ? "rgba(255, 255, 255, 0.05)"
                    : "var(--athar-bg-secondary)",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                }}
              >
                ℹ️ {notes}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-athar-primary"
              style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
            >
              <span>فتح في Google Maps</span>
              <span>🗺️</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="btn-athar-secondary"
              style={{ padding: "0.75rem 1.25rem" }}
            >
              <span>{copiedAddress ? "✓ تم النسخ" : "نسخ العنوان"}</span>
            </button>
          </div>
        </div>

        {/* Dress Code & Style Guide Card */}
        <div
          className="luxury-card"
          style={{
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.9)"
              : "rgba(255, 255, 255, 0.95)",
            border: "1.5px solid var(--athar-gold-border)",
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
                borderRadius: "14px",
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.15)"
                  : "var(--athar-bg-primary)",
                border: "1px solid var(--athar-gold-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "1.25rem",
              }}
            >
              ✨
            </div>

            <h3
              className="font-arabic-display"
              style={{
                fontSize: "1.45rem",
                fontWeight: 700,
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                marginBottom: "0.75rem",
              }}
            >
              {dressCode.title}
            </h3>

            <p
              style={{
                fontSize: "0.93rem",
                color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
                lineHeight: 1.6,
                marginBottom: "1.75rem",
              }}
            >
              {dressCode.description}
            </p>

            {/* Color Swatches */}
            {dressCode.swatches && dressCode.swatches.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: isNoir ? "var(--athar-gold-bright)" : "var(--athar-maroon)",
                    marginBottom: "0.75rem",
                  }}
                >
                  لوحة الألوان المفضلة (Color Palette)
                </div>

                <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
                  {dressCode.swatches.map((swatch, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                      title={`${swatch.name} (${swatch.hex})`}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          backgroundColor: swatch.hex,
                          border: "2px solid rgba(255, 255, 255, 0.8)",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
                          fontWeight: 600,
                        }}
                      >
                        {swatch.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {dressCode.notes && (
            <div
              style={{
                fontSize: "0.82rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon)",
                backgroundColor: isNoir
                  ? "rgba(212, 175, 55, 0.1)"
                  : "var(--athar-gold-light)",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid var(--athar-gold-border)",
              }}
            >
              🛎️ {dressCode.notes}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const VenueMapAndDressCodeBlock = EventLocationMap;
export default EventLocationMap;
