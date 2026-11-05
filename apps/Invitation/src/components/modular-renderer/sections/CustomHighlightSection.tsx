import React from "react";
import type { CustomHighlightSection as CustomHighlightSectionModel } from "@repo/react-appwrite";

export interface CustomHighlightSectionProps {
  section: CustomHighlightSectionModel;
  isNoir?: boolean;
}

export const CustomHighlightSection: React.FC<CustomHighlightSectionProps> = ({
  section,
  isNoir = false,
}) => {
  const quoteText =
    section.quoteText ||
    "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً";
  const author = section.author || "سورة الروم · The Holy Quran";
  const badge = section.badge || "✦ A Blessing for the Union · دعاء ومودة ✦";

  // Visual background style variant
  const bgStyle = section.backgroundStyle || (isNoir ? "obsidian" : "burgundy");

  let containerBackground = "linear-gradient(135deg, #6B1D28, #400E17)";
  let textColor = "#FFFFFF";
  let quoteColor = "#F1E5D1";
  let borderGold = "rgba(212, 175, 55, 0.45)";

  if (bgStyle === "obsidian" || isNoir) {
    containerBackground = "linear-gradient(135deg, #1F1A1C, #120E10)";
    textColor = "#FFFFFF";
    quoteColor = "#E6DACB";
    borderGold = "rgba(212, 175, 55, 0.4)";
  } else if (bgStyle === "alabaster") {
    containerBackground = "linear-gradient(135deg, #FAF4ED, #FFFFFF)";
    textColor = "var(--athar-text-title, #231F20)";
    quoteColor = "#4A4240";
    borderGold = "rgba(212, 175, 55, 0.35)";
  } else if (bgStyle === "glass") {
    containerBackground = "rgba(255, 255, 255, 0.15)";
    textColor = isNoir ? "#FFFFFF" : "#231F20";
    quoteColor = isNoir ? "#E6DACB" : "#4A4240";
  }

  return (
    <section
      id={section.id || "custom-highlight-section"}
      className="athar-custom-highlight-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            padding: "3.5rem 2.5rem",
            borderRadius: "28px",
            background: containerBackground,
            border: `1.5px solid ${borderGold}`,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
            textAlign: "center",
            color: textColor,
            overflow: "hidden",
          }}
        >
          {/* Subtle Decorative Background Image if provided */}
          {section.imageUrl && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${section.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.12,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Golden Badge */}
          {badge && (
            <div
              style={{
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "2.5px",
                color: "var(--athar-gold, #D4AF37)",
                fontWeight: 700,
                marginBottom: "1.5rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              {badge}
            </div>
          )}

          {/* Quotation Mark Icon */}
          <div
            style={{
              fontSize: "2.5rem",
              lineHeight: 1,
              color: "var(--athar-gold, #D4AF37)",
              fontFamily: "serif",
              marginBottom: "1rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            ❝
          </div>

          {/* Quote Text */}
          <blockquote
            style={{
              fontSize: "clamp(1.2rem, 3vw, 1.65rem)",
              fontWeight: 600,
              fontFamily: "var(--font-arabic-display, serif)",
              lineHeight: 1.8,
              color: quoteColor,
              margin: "0 0 1.5rem 0",
              position: "relative",
              zIndex: 1,
            }}
          >
            {quoteText}
          </blockquote>

          {/* Author Attribution */}
          {author && (
            <div
              style={{
                fontSize: "0.95rem",
                color: "var(--athar-gold, #D4AF37)",
                fontWeight: 700,
                fontFamily: "var(--font-arabic-display, serif)",
                position: "relative",
                zIndex: 1,
              }}
            >
              — {author}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomHighlightSection;
