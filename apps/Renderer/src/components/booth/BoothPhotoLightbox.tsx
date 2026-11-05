// =============================================================
// ASAR (Athar / أثر) — Keepsake Photo Gallery Lightbox Modal
// =============================================================

import React, { useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { PhotoKeepsake } from "./types";

export interface BoothPhotoLightboxProps {
  photos: PhotoKeepsake[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const BoothPhotoLightbox: React.FC<BoothPhotoLightboxProps> = ({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (currentIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate((currentIndex + 1) % photos.length);
      }
      if (e.key === "ArrowRight") {
        onNavigate((currentIndex - 1 + photos.length) % photos.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  if (currentIndex === null || !photos[currentIndex]) return null;

  const currentPhoto = photos[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex + 1) % photos.length);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(18, 14, 16, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 1100,
      }}
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1000px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#ffffff",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "var(--athar-radius-full)",
              backgroundColor: "rgba(212, 175, 55, 0.25)",
              color: "#D4AF37",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            {currentPhoto.category || "ذكريات أثر"}
          </span>
          <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>
            صورة {currentIndex + 1} من {photos.length}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Lightbox"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
        >
          <FiX />
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "960px",
          maxHeight: "75vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          aria-label="Previous photo"
          style={{
            position: "absolute",
            right: "-24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(107, 29, 40, 0.85)",
            color: "#ffffff",
            border: "1px solid rgba(212, 175, 55, 0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        >
          <FiChevronRight />
        </button>

        {/* Image */}
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption}
          style={{
            maxWidth: "100%",
            maxHeight: "72vh",
            objectFit: "contain",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            border: "1.5px solid rgba(212, 175, 55, 0.3)",
          }}
        />

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next photo"
          style={{
            position: "absolute",
            left: "-24px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(107, 29, 40, 0.85)",
            color: "#ffffff",
            border: "1px solid rgba(212, 175, 55, 0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        >
          <FiChevronLeft />
        </button>
      </div>

      {/* Caption footer */}
      {currentPhoto.caption && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "800px",
            textAlign: "center",
            marginTop: "1.2rem",
            color: "#F1E5D1",
            fontSize: "1.05rem",
            lineHeight: 1.6,
          }}
        >
          {currentPhoto.caption}
        </div>
      )}
    </div>
  );
};

export default BoothPhotoLightbox;
