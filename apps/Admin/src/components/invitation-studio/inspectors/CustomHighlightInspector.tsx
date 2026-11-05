import React from "react";
import type { CustomHighlightSection } from "@repo/react-appwrite";

export interface CustomHighlightInspectorProps {
  section: CustomHighlightSection;
  onChange: (updated: CustomHighlightSection) => void;
}

export const CustomHighlightInspector: React.FC<CustomHighlightInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<CustomHighlightSection>) => {
    onChange({ ...section, ...partial });
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
            ✦ Custom Editorial Highlight Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Luxury quote banner, personal thank you note to parents/guests, or special feature.
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        {/* Badge */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Overline Badge
          </label>
          <input
            type="text"
            value={section.badge || ""}
            onChange={(e) => update({ badge: e.target.value })}
            placeholder="e.g. ✦ WITH HEARTFELT GRATITUDE"
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

        {/* Author / Signature */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Author / Signature
          </label>
          <input
            type="text"
            value={section.author || ""}
            onChange={(e) => update({ author: e.target.value })}
            placeholder="e.g. Omar & Layla"
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

        {/* Quote / Body Text */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Editorial Quote / Verse Text *
          </label>
          <textarea
            rows={3}
            value={section.quoteText}
            onChange={(e) => update({ quoteText: e.target.value })}
            placeholder="Write your heartfelt note, quote, or blessing here..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>

        {/* Background Style */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Background Style Aesthetic
          </label>
          <select
            value={section.backgroundStyle || "burgundy"}
            onChange={(e) => update({ backgroundStyle: e.target.value })}
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
            <option value="burgundy">Royal Burgundy (#6B1D28)</option>
            <option value="alabaster">Alabaster Cream (#FBF7F2)</option>
            <option value="obsidian">Obsidian Midnight (#0D0B0E)</option>
            <option value="glass">Translucent Frosted Glass</option>
          </select>
        </div>

        {/* Optional Image URL */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Accent Image URL (Optional)
          </label>
          <input
            type="text"
            value={section.imageUrl || ""}
            onChange={(e) => update({ imageUrl: e.target.value })}
            placeholder="https://images.unsplash.com/photo-..."
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
      </div>
    </div>
  );
};
