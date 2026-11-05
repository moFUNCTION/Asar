import React from "react";
import type { VenueLocationSection, DressCodeSwatch } from "@repo/react-appwrite";

export interface VenueLocationInspectorProps {
  section: VenueLocationSection;
  onChange: (updated: VenueLocationSection) => void;
}

export const VenueLocationInspector: React.FC<VenueLocationInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<VenueLocationSection>) => {
    onChange({ ...section, ...partial });
  };

  const swatches = section.dressCodeSwatches || [];

  const handleAddSwatch = () => {
    const newSwatch: DressCodeSwatch = {
      hex: "#D4AF37",
      label: "Champagne Gold",
    };
    update({ dressCodeSwatches: [...swatches, newSwatch] });
  };

  const handleUpdateSwatch = (index: number, partial: Partial<DressCodeSwatch>) => {
    const updated = swatches.map((s, i) => (i === index ? { ...s, ...partial } : s));
    update({ dressCodeSwatches: updated });
  };

  const handleDeleteSwatch = (index: number) => {
    update({ dressCodeSwatches: swatches.filter((_, i) => i !== index) });
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
            📍 Venue Location & Navigation Guide Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Venue name, map embeds, parking directions, and dress code swatches.
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        {/* Venue Name */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Venue / Hotel Name *
          </label>
          <input
            type="text"
            value={section.venueName}
            onChange={(e) => update({ venueName: e.target.value })}
            placeholder="e.g. Four Seasons Hotel Alexandria"
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

        {/* Address */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Street Address *
          </label>
          <input
            type="text"
            value={section.address}
            onChange={(e) => update({ address: e.target.value })}
            placeholder="e.g. Corniche Road, San Stefano, Alexandria, Egypt"
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

        {/* Google Maps Embed URL */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Google Maps Embed / Navigation URL
          </label>
          <input
            type="text"
            value={section.mapEmbedUrl || ""}
            onChange={(e) => update({ mapEmbedUrl: e.target.value })}
            placeholder="https://maps.google.com/embed?... or https://maps.app.goo.gl/..."
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

        {/* Parking and Valet Notes */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Parking & Valet Service Note
          </label>
          <input
            type="text"
            value={section.parkingNote || ""}
            onChange={(e) => update({ parkingNote: e.target.value })}
            placeholder="e.g. Complimentary valet parking is available at the main ballroom entrance."
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

        {/* Dress Code Title */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Dress Code Theme Title
          </label>
          <input
            type="text"
            value={section.dressCodeTitle || ""}
            onChange={(e) => update({ dressCodeTitle: e.target.value })}
            placeholder="e.g. Black Tie & Royal Burgundy Elegance"
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

      {/* Dress Code Color Swatches */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: "8px",
          padding: "0.85rem",
          background: "#FAFAFA",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.6rem",
          }}
        >
          <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
            Guest Attire Color Palette Swatches:
          </label>
          <button
            type="button"
            onClick={handleAddSwatch}
            style={{
              background: "#6B1D28",
              color: "#FFF",
              border: "none",
              borderRadius: "4px",
              padding: "0.25rem 0.6rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Add Swatch
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {swatches.map((swatch, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "#FFF",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <input
                type="color"
                value={swatch.hex}
                onChange={(e) => handleUpdateSwatch(idx, { hex: e.target.value })}
                style={{
                  width: "32px",
                  height: "32px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
              <input
                type="text"
                value={swatch.hex}
                onChange={(e) => handleUpdateSwatch(idx, { hex: e.target.value })}
                placeholder="#000000"
                style={{
                  width: "80px",
                  padding: "0.25rem 0.45rem",
                  borderRadius: "4px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                }}
              />
              <input
                type="text"
                value={swatch.label}
                onChange={(e) => handleUpdateSwatch(idx, { label: e.target.value })}
                placeholder="Swatch Label (e.g. Midnight Black)"
                style={{
                  flex: 1,
                  padding: "0.25rem 0.45rem",
                  borderRadius: "4px",
                  border: "1px solid rgba(0,0,0,0.15)",
                  fontSize: "0.78rem",
                }}
              />
              <button
                type="button"
                onClick={() => handleDeleteSwatch(idx)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#B91C1C",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
