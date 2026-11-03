import React, { useState } from "react";
import type { GalleryItem } from "./types";

export interface EventMediaGalleryProps {
  gallery?: GalleryItem[];
  title?: string;
  subtitle?: string;
  isNoir?: boolean;
}

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "g1",
    imageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
    caption: "لحظات لا تُنسى وثقت أسمى معاني الفرح والجمال",
    alt: "Wedding moments",
  },
  {
    id: "g2",
    imageUrl:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
    caption: "تفاصيل استثنائية من حفل الخطوبة والأمسية الرومانسية",
    alt: "Floral arrangement",
  },
  {
    id: "g3",
    imageUrl:
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80",
    caption: "الأناقة الكلاسيكية في قاعة الاحتفال الكبرى",
    alt: "Luxury banquet",
  },
  {
    id: "g4",
    imageUrl:
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80",
    caption: "ابتسامات الأحبة ولقاء الأصدقاء في لحظة للتاريخ",
    alt: "Celebration joy",
  },
];

export const EventMediaGallery: React.FC<EventMediaGalleryProps> = ({
  gallery = DEFAULT_GALLERY,
  title = "معرض الصور والذكريات",
  subtitle = "لمحات من أجمل اللحظات التي نسعد بمشاركتها معكم",
  isNoir = false,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const items = gallery && gallery.length > 0 ? gallery : DEFAULT_GALLERY;

  return (
    <section
      className="event-media-gallery-section"
      style={{
        padding: "4rem 1.5rem",
        maxWidth: "1020px",
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
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: "0.98rem",
              color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => setSelectedPhoto(item)}
            className="luxury-card"
            style={{
              cursor: "pointer",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1.5px solid var(--athar-gold-border)",
              boxShadow: "var(--athar-shadow-soft)",
              position: "relative",
              backgroundColor: isNoir ? "#231A1E" : "#FFFFFF",
              aspectRatio: "4/3",
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.alt || item.caption || `Gallery ${idx + 1}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.4s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1.0)";
              }}
            />

            {item.caption && (
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "1.5rem 1rem 0.75rem",
                  background:
                    "linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                {item.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.88)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "840px",
              width: "100%",
              backgroundColor: isNoir ? "#1F1A1C" : "#FFFFFF",
              borderRadius: "24px",
              border: "2px solid var(--athar-gold)",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              aria-label="إغلاق المعاينة"
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "#FFFFFF",
                border: "1px solid var(--athar-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>

            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.caption || "Preview"}
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                display: "block",
                backgroundColor: "#000",
              }}
            />

            {selectedPhoto.caption && (
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                  textAlign: "center",
                  borderTop: "1px solid var(--athar-card-border)",
                }}
              >
                {selectedPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export const GalleryBlock = EventMediaGallery;
export default EventMediaGallery;
