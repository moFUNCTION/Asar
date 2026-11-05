import React from "react";
import type { WishingWallSection } from "@repo/react-appwrite";

export interface WishingWallInspectorProps {
  section: WishingWallSection;
  onChange: (updated: WishingWallSection) => void;
}

export const WishingWallInspector: React.FC<WishingWallInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<WishingWallSection>) => {
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
            💌 Wishing Wall & Guestbook Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Interactive guest blessings stream, congratulations, and reaction counters.
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        {/* Title */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Section Title
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Wishing Wall & Guestbook"
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

        {/* Subtitle */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Subtitle / Instruction
          </label>
          <input
            type="text"
            value={section.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="e.g. Leave your warm blessings for the newlyweds"
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

        {/* Greeting Prompt */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Callout Prompt Text
          </label>
          <input
            type="text"
            value={section.greetingPrompt}
            onChange={(e) => update({ greetingPrompt: e.target.value })}
            placeholder="e.g. Leave your warm blessings and memories for the newlyweds..."
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

        {/* Placeholder */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Input Box Placeholder
          </label>
          <input
            type="text"
            value={section.placeholder}
            onChange={(e) => update({ placeholder: e.target.value })}
            placeholder="Write your congratulatory message here..."
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

        {/* Max Message Length */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Max Message Character Length
          </label>
          <input
            type="number"
            min={50}
            max={1000}
            value={section.maxMessageLength}
            onChange={(e) => update({ maxMessageLength: Number(e.target.value) || 300 })}
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

      {/* Moderation and Reactions toggles */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={section.allowReactions}
            onChange={(e) => update({ allowReactions: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Enable Heart & Emoji Reactions on Wishes
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={section.moderationRequired}
            onChange={(e) => update({ moderationRequired: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Require Admin Moderation Before Public Display
        </label>
      </div>
    </div>
  );
};
