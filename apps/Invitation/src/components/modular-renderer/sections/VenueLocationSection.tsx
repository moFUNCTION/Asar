import React from "react";
import type { VenueLocationSection as VenueLocationSectionModel } from "@repo/react-appwrite";

export interface VenueLocationSectionProps {
  section: VenueLocationSectionModel;
  isNoir?: boolean;
}

export const VenueLocationSection: React.FC<VenueLocationSectionProps> = ({
  section,
  isNoir = false,
}) => {
  const venueName = section.venueName || "Four Seasons Alexandria at San Stefano";
  const address = section.address || "399 El Geish Road, San Stefano, Alexandria, Egypt";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venueName}, ${address}`
  )}`;

  const dressCodeTitle = section.dressCodeTitle || "Black Tie & Evening Glamour · أزياء السهرة الرسمية";
  const dressCodeSwatches = section.dressCodeSwatches && section.dressCodeSwatches.length > 0
    ? section.dressCodeSwatches
    : [
        { hex: "#6B1D28", label: "العنابي الملكي · Royal Maroon" },
        { hex: "#D4AF37", label: "الذهب الشامباني · Champagne Gold" },
        { hex: "#1F1A1C", label: "الأسود الأنيق · Noir Obsidian" },
        { hex: "#FBF7F2", label: "الألباستر الدافئ · Warm Alabaster" },
      ];

  return (
    <section
      id={section.id || "venue-location-section"}
      className="athar-venue-location-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#F4EFEA",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "var(--athar-gold, #D4AF37)",
              fontWeight: 700,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            ✦ Venue & Dress Code · موقع الحفل وأزياء السهرة ✦
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              fontFamily: "var(--font-arabic-display, serif)",
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
              margin: "0 0 0.5rem 0",
            }}
          >
            {section.title || "Venue & Location"}
          </h2>
          {section.titleAr && (
            <div
              style={{
                fontSize: "1.15rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontFamily: "var(--font-arabic-display, serif)",
              }}
            >
              {section.titleAr}
            </div>
          )}
        </div>

        {/* Venue Card & Map Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Venue Info Card */}
          <div
            style={{
              padding: "2.5rem 2rem",
              borderRadius: "24px",
              background: isNoir
                ? "linear-gradient(145deg, rgba(35, 26, 30, 0.94), rgba(22, 18, 20, 0.97))"
                : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
              border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "1.5rem",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.3rem 0.85rem",
                  borderRadius: "9999px",
                  backgroundColor: isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)",
                  color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                <span>📍</span>
                <span>The Destination</span>
              </div>

              <h3
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-arabic-display, serif)",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  margin: "0 0 0.5rem 0",
                }}
              >
                {venueName}
              </h3>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: isNoir ? "#D6C7B2" : "var(--athar-text-body, #4A4240)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {address}
              </p>
            </div>

            {/* Parking Instructions Note */}
            {section.parkingNote && (
              <div
                style={{
                  backgroundColor: isNoir ? "rgba(0,0,0,0.3)" : "rgba(251, 247, 242, 0.85)",
                  borderRadius: "14px",
                  padding: "1rem",
                  border: "1px dashed rgba(212, 175, 55, 0.3)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--athar-gold, #D4AF37)", marginBottom: "0.2rem" }}>
                  🚗 خدمة صف السيارات وإرشادات الوصول
                </div>
                <div style={{ fontSize: "0.85rem", color: isNoir ? "#E6DACB" : "var(--athar-text-body, #4A4240)" }}>
                  {section.parkingNote}
                </div>
              </div>
            )}

            {/* Directions Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.85rem 1.5rem",
                borderRadius: "9999px",
                background: isNoir
                  ? "linear-gradient(135deg, #D4AF37, #E5C158)"
                  : "linear-gradient(135deg, var(--athar-maroon, #6B1D28), #50131D)",
                color: isNoir ? "#161214" : "#FFFFFF",
                fontSize: "0.92rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(107, 29, 40, 0.2)",
              }}
            >
              <span>🧭</span>
              <span>فتح الاتجاهات عبر Google Maps</span>
            </a>
          </div>

          {/* Interactive Map Embed / Preview Card */}
          <div
            style={{
              borderRadius: "24px",
              overflow: "hidden",
              border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
              minHeight: "340px",
              position: "relative",
            }}
          >
            {section.mapEmbedUrl ? (
              <iframe
                title="Venue Map Embed"
                src={section.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "340px" }}
                allowFullScreen={false}
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "340px",
                  backgroundImage: `
                    radial-gradient(circle at center, rgba(107, 29, 40, 0.15) 0%, rgba(22, 18, 20, 0.75) 100%),
                    url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80)
                  `,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "var(--athar-gold, #D4AF37)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    boxShadow: "0 0 20px rgba(212, 175, 55, 0.6)",
                    marginBottom: "1rem",
                  }}
                >
                  📍
                </div>
                <div style={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                  {venueName}
                </div>
                <div style={{ color: "#D4AF37", fontSize: "0.85rem", maxWidth: "260px" }}>
                  انقر على زر الاتجاهات لفتح الخريطة التفاعلية والملاحة المباشرة.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dress Code Swatches Card */}
        <div
          style={{
            padding: "2rem 2.5rem",
            borderRadius: "24px",
            background: isNoir
              ? "linear-gradient(145deg, rgba(35, 26, 30, 0.88), rgba(22, 18, 20, 0.94))"
              : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
            border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "var(--athar-gold, #D4AF37)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.35rem" }}>
            Attire & Aesthetics
          </div>
          <h4
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              fontFamily: "var(--font-arabic-display, serif)",
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
              margin: "0 0 1.25rem 0",
            }}
          >
            {dressCodeTitle}
          </h4>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
            }}
          >
            {dressCodeSwatches.map((swatch, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: swatch.hex,
                    border: "2px solid rgba(212, 175, 55, 0.5)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  title={swatch.hex}
                />
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: isNoir ? "#D6C7B2" : "var(--athar-text-body, #4A4240)" }}>
                  {swatch.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueLocationSection;
