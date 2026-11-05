import React, { useState, useEffect, useCallback } from "react";
import type { PhotoGallerySection as PhotoGallerySectionModel, GalleryImage } from "@repo/react-appwrite";

export interface ResponsivePhotoGallerySectionProps {
  section: PhotoGallerySectionModel;
  isNoir?: boolean;
}

export const ResponsivePhotoGallerySection: React.FC<ResponsivePhotoGallerySectionProps> = ({
  section,
  isNoir = false,
}) => {
  const images: GalleryImage[] =
    section.images && section.images.length > 0
      ? section.images
      : [
          {
            id: "img-1",
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
            caption: "The Royal Entrance · الزفة الملكية",
            category: "Ceremony",
          },
          {
            id: "img-2",
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
            caption: "Cherished Rings & Eternal Vows · تبادل الخواتم",
            category: "Portraits",
          },
          {
            id: "img-3",
            url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1000&q=80",
            caption: "Golden Sunset on the Mediterranean · لحظات الغروب",
            category: "Moments",
          },
          {
            id: "img-4",
            url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
            caption: "Celebration & First Dance · الرقصة الأولى",
            category: "Ceremony",
          },
          {
            id: "img-5",
            url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80",
            caption: "Laughter with Friends · فرحة الأحباب",
            category: "Moments",
          },
          {
            id: "img-6",
            url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1000&q=80",
            caption: "Floral & Royal Decor · التفاصيل الملكية",
            category: "Portraits",
          },
        ];

  // Build category list
  const allCategories = ["All", ...(section.categories && section.categories.length > 0
    ? section.categories
    : Array.from(new Set(images.map((img) => img.category).filter(Boolean) as string[])))];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Filter images based on category
  const filteredImages = selectedCategory === "All"
    ? images
    : images.filter((img) => img.category === selectedCategory);

  // Keyboard navigation for Lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
        setZoomLevel(1);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0));
        setZoomLevel(1);
      }
    },
    [lightboxIndex, filteredImages.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoomLevel(1);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
      setZoomLevel(1);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
      setZoomLevel(1);
    }
  };

  return (
    <section
      id={section.id || "photo-gallery-section"}
      className="athar-responsive-photo-gallery-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
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
            ✦ {section.subtitle || "Moments & Memories · ألبوم الذكريات الخالدة"} ✦
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
            {section.title || "Photo Gallery"}
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

        {/* Category Filter Tabs */}
        {allCategories.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.6rem",
              marginBottom: "2.5rem",
            }}
          >
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "0.45rem 1.15rem",
                    borderRadius: "9999px",
                    border: isSelected
                      ? "1.5px solid var(--athar-gold, #D4AF37)"
                      : "1px solid rgba(212, 175, 55, 0.25)",
                    backgroundColor: isSelected
                      ? (isNoir ? "rgba(212, 175, 55, 0.2)" : "var(--athar-maroon, #6B1D28)")
                      : (isNoir ? "rgba(35, 26, 30, 0.6)" : "#FFFFFF"),
                    color: isSelected
                      ? (isNoir ? "#E5C158" : "#FFFFFF")
                      : (isNoir ? "#D6C7B2" : "var(--athar-text-title, #231F20)"),
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected ? "0 4px 14px rgba(107, 29, 40, 0.15)" : "none",
                  }}
                >
                  {cat === "All" ? "الكل · All" : cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Responsive Masonry / Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filteredImages.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => openLightbox(idx)}
              style={{
                position: "relative",
                borderRadius: "18px",
                overflow: "hidden",
                cursor: "pointer",
                height: "260px",
                border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
                backgroundColor: isNoir ? "#231A1E" : "#FFFFFF",
              }}
            >
              <img
                src={img.url}
                alt={img.caption || "Gallery photo"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.4s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />

              {/* Caption Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(22, 18, 20, 0.85) 0%, transparent 60%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "1rem",
                  color: "#FFFFFF",
                  pointerEvents: "none",
                }}
              >
                {img.category && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "var(--athar-gold, #D4AF37)",
                      fontWeight: 700,
                    }}
                  >
                    {img.category}
                  </span>
                )}
                {img.caption && (
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{img.caption}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Touch Lightbox Modal */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(10, 8, 9, 0.94)",
            backdropFilter: "blur(12px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          {/* Controls Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "20px",
              right: "24px",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              zIndex: 10,
            }}
          >
            {/* Zoom In */}
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
              title="Zoom In"
            >
              +
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
              title="Zoom Out"
            >
              -
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFFFFF",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Previous Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#FFFFFF",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              cursor: "pointer",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            title="Previous"
          >
            ‹
          </button>

          {/* Active Image Stage */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "85vw",
              maxHeight: "75vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: `scale(${zoomLevel})`,
              transition: "transform 0.2s ease",
            }}
          >
            <img
              src={filteredImages[lightboxIndex].url}
              alt={filteredImages[lightboxIndex].caption || "Enlarged photo"}
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: "16px",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
                border: "1.5px solid var(--athar-gold, #D4AF37)",
              }}
            />

            {filteredImages[lightboxIndex].caption && (
              <div
                style={{
                  marginTop: "1rem",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {filteredImages[lightboxIndex].caption}
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#FFFFFF",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              cursor: "pointer",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            title="Next"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
};

export default ResponsivePhotoGallerySection;
