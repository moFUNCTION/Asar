import React, { useState } from "react";
import type { PhotoGallerySection, GalleryImage, GalleryLayoutMode } from "@repo/react-appwrite";

export interface PhotoGalleryInspectorProps {
  section: PhotoGallerySection;
  onChange: (updated: PhotoGallerySection) => void;
}

export const PhotoGalleryInspector: React.FC<PhotoGalleryInspectorProps> = ({
  section,
  onChange,
}) => {
  const [newCategoryName, setNewCategoryName] = useState("");

  const update = (partial: Partial<PhotoGallerySection>) => {
    onChange({ ...section, ...partial });
  };

  const handleAddImage = () => {
    const newImg: GalleryImage = {
      id: `img-${Date.now()}`,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
      caption: "Special Celebration Moment",
      category: section.categories[0] || "All",
    };
    update({ images: [...section.images, newImg] });
  };

  const handleUpdateImage = (id: string, partial: Partial<GalleryImage>) => {
    const updated = section.images.map((img) =>
      img.id === id ? { ...img, ...partial } : img
    );
    update({ images: updated });
  };

  const handleDeleteImage = (id: string) => {
    update({ images: section.images.filter((img) => img.id !== id) });
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || section.categories.includes(trimmed)) return;
    update({ categories: [...section.categories, trimmed] });
    setNewCategoryName("");
  };

  const handleDeleteCategory = (catName: string) => {
    if (section.categories.length <= 1) return;
    update({
      categories: section.categories.filter((c) => c !== catName),
      images: section.images.map((img) =>
        img.category === catName ? { ...img, category: "All" } : img
      ),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
          paddingBottom: "0.6rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#231F20" }}>
            🖼️ Photo & Memory Gallery Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Responsive multi-mode gallery with categories and lightbox view.
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddImage}
          style={{
            background: "#6B1D28",
            color: "#FFF",
            border: "none",
            borderRadius: "6px",
            padding: "0.35rem 0.75rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Photo
        </button>
      </div>

      {/* Subtitle & Layout Mode */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Section Subtitle
          </label>
          <input
            type="text"
            value={section.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="e.g. Moments & memories from our journey"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Gallery Display Mode
          </label>
          <select
            value={section.layoutMode}
            onChange={(e) => update({ layoutMode: e.target.value as GalleryLayoutMode })}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
              background: "#FFFFFF",
            }}
          >
            <option value="masonry">Bento Masonry Wall (Default)</option>
            <option value="grid">Structured 2x2 Grid</option>
            <option value="carousel">Interactive 3D Carousel / Slider</option>
          </select>
        </div>
      </div>

      {/* Categories Filter Manager */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "8px",
          padding: "0.75rem",
          background: "#FAFAFA",
        }}
      >
        <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, marginBottom: "0.4rem" }}>
          Filter Categories:
        </label>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
          {section.categories.map((cat) => (
            <span
              key={cat}
              style={{
                background: "rgba(107, 29, 40, 0.08)",
                color: "#6B1D28",
                borderRadius: "6px",
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {cat}
              {cat !== "All" && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    color: "#999",
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </span>
          ))}

          <div style={{ display: "flex", gap: "0.25rem", marginLeft: "0.5rem" }}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
              }}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.75rem",
                width: "120px",
              }}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              style={{
                background: "#6B1D28",
                color: "#FFF",
                border: "none",
                borderRadius: "4px",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Photos List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {section.images.map((img, index) => (
          <div
            key={img.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "8px",
              padding: "0.6rem",
              background: "#FFFFFF",
            }}
          >
            {/* Thumbnail */}
            <img
              src={img.url}
              alt={img.caption || `Photo ${index + 1}`}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "6px",
                objectFit: "cover",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            />

            {/* Inputs */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "0.5rem" }}>
              <input
                type="text"
                value={img.url}
                onChange={(e) => handleUpdateImage(img.id, { url: e.target.value })}
                placeholder="Image URL"
                style={{
                  padding: "0.35rem 0.5rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: "0.78rem",
                }}
              />

              <input
                type="text"
                value={img.caption || ""}
                onChange={(e) => handleUpdateImage(img.id, { caption: e.target.value })}
                placeholder="Caption text"
                style={{
                  padding: "0.35rem 0.5rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: "0.78rem",
                }}
              />

              <select
                value={img.category || "All"}
                onChange={(e) => handleUpdateImage(img.id, { category: e.target.value })}
                style={{
                  padding: "0.35rem 0.5rem",
                  borderRadius: "6px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: "0.78rem",
                  background: "#FFFFFF",
                }}
              >
                {section.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleDeleteImage(img.id)}
              style={{
                background: "rgba(185, 28, 28, 0.08)",
                border: "none",
                borderRadius: "6px",
                width: "28px",
                height: "28px",
                cursor: "pointer",
                color: "#B91C1C",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
