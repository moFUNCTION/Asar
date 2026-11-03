import React, { useState, useRef } from "react";

export interface BoothMemory {
  id?: string;
  orderId?: string;
  clientId?: string;
  slug: string;
  eventHeaderTag: string;
  coupleTitle: string;
  tagline: string;
  eventDateDisplay: string;
  eventLocationDisplay: string;
  highlightBadge: string;
  coupleQuote: string;
  heroImageFileId?: string;
  heroImageUrl?: string;
  heroImageFile?: File;
  videoHighlightFileId?: string;
  videoHighlightUrl?: string;
  videoHighlightThumbnailId?: string;
  videoHighlightTitle?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  categories: string[];
  isPrivateLocked: boolean;
  accessPinCode?: string;
  qrCodeUrl?: string;
  isPublished: boolean;
}

export interface HeroAndTextsEditorProps {
  memory: BoothMemory;
  onChange: (updated: BoothMemory) => void;
}

export const HeroAndTextsEditor: React.FC<HeroAndTextsEditorProps> = ({ memory, onChange }) => {
  const [newCatInput, setNewCatInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof BoothMemory>(field: K, value: BoothMemory[K]) => {
    onChange({
      ...memory,
      [field]: value,
    });
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      onChange({
        ...memory,
        heroImageUrl: previewUrl,
        heroImageFile: file,
      });
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (memory.categories.includes(trimmed)) {
      setNewCatInput("");
      return;
    }
    updateField("categories", [...memory.categories, trimmed]);
    setNewCatInput("");
  };

  const handleRemoveCategory = (cat: string) => {
    updateField(
      "categories",
      memory.categories.filter((c) => c !== cat)
    );
  };

  const handleResetDefaultCategories = () => {
    updateField("categories", ["Family", "Friends", "Colleagues", "Special Guests"]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Card 1: Core URL & Couple Title */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)" }}>
              💍 Event Identity & Website Slug
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)" }}>
              The canonical slug and title defining the client&apos;s Memory Website header and URL.
            </p>
          </div>
          <span className="athar-badge-gold">
            🌐 /memory/{memory.slug || "slug"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              Website URL Slug
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.slug}
              onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="e.g. mina-and-maryam"
            />
            <span style={{ fontSize: "0.75rem", color: "var(--athar-text-muted)", marginTop: "0.25rem", display: "block" }}>
              Live link: <code>http://localhost:3002?memory={memory.slug}</code>
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              Couple / Host Title
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.coupleTitle}
              onChange={(e) => updateField("coupleTitle", e.target.value)}
              placeholder="e.g. Mina & Maryam"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              Event Overline Tag
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.eventHeaderTag}
              onChange={(e) => updateField("eventHeaderTag", e.target.value)}
              placeholder="e.g. THE WEDDING OF"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              Editorial Tagline
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              placeholder="e.g. Same People. Different Voices. A Lasting Athar."
            />
          </div>
        </div>
      </div>

      {/* Card 2: Date, Venue, Badge & Quote */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)", marginBottom: "0.3rem" }}>
          📍 Celebration Details & Romantic Quote
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)", marginBottom: "1.2rem" }}>
          Metadata pills displayed directly beneath the couple header and the dedicated keepsake quote block.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              📅 Event Date Display
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.eventDateDisplay}
              onChange={(e) => updateField("eventDateDisplay", e.target.value)}
              placeholder="e.g. 12 July 2026"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              📍 Event Location Display
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.eventLocationDisplay}
              onChange={(e) => updateField("eventLocationDisplay", e.target.value)}
              placeholder="e.g. Alexandria, Egypt"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              🤍 Highlight Badge
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.highlightBadge}
              onChange={(e) => updateField("highlightBadge", e.target.value)}
              placeholder="e.g. Together Always"
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
            Personal Couple Quote / Memory Dedication
          </label>
          <textarea
            className="athar-textarea"
            dir="auto"
            rows={3}
            value={memory.coupleQuote}
            onChange={(e) => updateField("coupleQuote", e.target.value)}
            placeholder="e.g. Every voice here is a piece of our forever ... كل صوت هنا هو قطعة من حكايتنا"
          />
        </div>
      </div>

      {/* Card 3: Hero Photo Upload */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)", marginBottom: "0.3rem" }}>
          🖼️ Hero Cover Photograph
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)", marginBottom: "1.2rem" }}>
          Primary high-resolution portrait anchored at the top of the Memory Website with a soft warm alabaster bottom fade.
        </p>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {memory.heroImageUrl ? (
            <div
              style={{
                width: "160px",
                height: "120px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid var(--athar-gold)",
                boxShadow: "var(--athar-shadow-gold)",
                position: "relative",
              }}
            >
              <img
                src={memory.heroImageUrl}
                alt="Couple Hero Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "160px",
                height: "120px",
                borderRadius: "12px",
                background: "var(--athar-bg-secondary)",
                border: "2px dashed rgba(107, 29, 40, 0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--athar-text-muted)",
                fontSize: "0.8rem",
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>📸</span>
              <span>No Photo</span>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleHeroImageChange}
            />
            <button
              type="button"
              className="btn-athar-primary"
              style={{ fontSize: "0.88rem", padding: "0.5rem 1.2rem" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {memory.heroImageUrl ? "🔄 Change Hero Photo" : "📤 Upload Hero Portrait"}
            </button>
            {memory.heroImageUrl && (
              <button
                type="button"
                className="btn-athar-secondary"
                style={{ fontSize: "0.82rem", padding: "0.4rem 1rem", color: "var(--athar-status-danger)" }}
                onClick={() => {
                  onChange({
                    ...memory,
                    heroImageUrl: undefined,
                    heroImageFile: undefined,
                    heroImageFileId: undefined,
                  });
                }}
              >
                🗑️ Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card 4: Category Pills Manager */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)" }}>
            🏷️ Audio Filter Categories
          </h3>
          <button
            type="button"
            onClick={handleResetDefaultCategories}
            style={{
              background: "none",
              border: "none",
              color: "var(--athar-maroon)",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Reset to Standard Defaults
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)", marginBottom: "1rem" }}>
          Guests on the memory page can filter audio recordings by these categories.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {memory.categories.map((cat) => (
            <span
              key={cat}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.9rem",
                background: "rgba(107, 29, 40, 0.08)",
                color: "var(--athar-maroon)",
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "0.85rem",
                border: "1px solid rgba(107, 29, 40, 0.18)",
              }}
            >
              <span>{cat}</span>
              <button
                type="button"
                onClick={() => handleRemoveCategory(cat)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--athar-maroon)",
                  fontWeight: 900,
                  fontSize: "0.9rem",
                  lineHeight: 1,
                  padding: 0,
                }}
                title={`Remove ${cat}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", maxWidth: "400px" }}>
          <input
            type="text"
            className="athar-input"
            value={newCatInput}
            onChange={(e) => setNewCatInput(e.target.value)}
            placeholder="e.g. VIP Table or Bride's Squad"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCategory();
              }
            }}
          />
          <button
            type="button"
            className="btn-athar-secondary"
            onClick={handleAddCategory}
            style={{ whiteSpace: "nowrap" }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Card 5: Security & Private PIN Lock */}
      <div
        style={{
          background: memory.isPrivateLocked
            ? "linear-gradient(135deg, rgba(107, 29, 40, 0.04) 0%, rgba(212, 175, 55, 0.08) 100%)"
            : "var(--athar-card-bg)",
          border: memory.isPrivateLocked
            ? "1.5px solid var(--athar-gold)"
            : "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.3rem" }}>{memory.isPrivateLocked ? "🔒" : "🌐"}</span>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)" }}>
                Private Memory PIN Lock
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)" }}>
                Require visitors to enter a 4-digit PIN before listening or viewing this vault.
              </p>
            </div>
          </div>

          <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={memory.isPrivateLocked}
              onChange={(e) => updateField("isPrivateLocked", e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--athar-maroon)" }}
            />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--athar-maroon)" }}>
              {memory.isPrivateLocked ? "Protected (ON)" : "Public (OFF)"}
            </span>
          </label>
        </div>

        {memory.isPrivateLocked && (
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px dashed rgba(212, 175, 55, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
                4-Digit Access PIN Code
              </label>
              <input
                type="text"
                maxLength={4}
                className="athar-input"
                style={{ width: "140px", fontSize: "1.2rem", letterSpacing: "0.25em", textAlign: "center", fontWeight: 800 }}
                value={memory.accessPinCode || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  updateField("accessPinCode", val);
                }}
                placeholder="2026"
              />
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--athar-text-muted)", maxWidth: "340px" }}>
              Share this PIN with the couple and guests. The live mobile preview will display the security padlock emblem.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
