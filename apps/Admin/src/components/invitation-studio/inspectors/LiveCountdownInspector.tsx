import React from "react";
import type { LiveCountdownSection } from "@repo/react-appwrite";

export interface LiveCountdownInspectorProps {
  section: LiveCountdownSection;
  onChange: (updated: LiveCountdownSection) => void;
}

export const LiveCountdownInspector: React.FC<LiveCountdownInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<LiveCountdownSection>) => {
    onChange({ ...section, ...partial });
  };

  // Safe datetime local format helper
  const toLocalInputValue = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 16);
    } catch {
      return "";
    }
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
            ⏳ Live Celebration Countdown Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Real-time live ticker calculating days, hours, minutes, and seconds.
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        {/* Heading */}
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Countdown Banner Heading *
          </label>
          <input
            type="text"
            value={section.heading}
            onChange={(e) => update({ heading: e.target.value })}
            placeholder="e.g. Counting Down to Forever"
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

        {/* Target Date ISO */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Target Event Date & Time *
          </label>
          <input
            type="datetime-local"
            value={toLocalInputValue(section.targetDateIso)}
            onChange={(e) => {
              if (e.target.value) {
                const dateObj = new Date(e.target.value);
                update({ targetDateIso: dateObj.toISOString() });
              }
            }}
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

        {/* Completed Message */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Completed / Ongoing Message
          </label>
          <input
            type="text"
            value={section.completedMessage}
            onChange={(e) => update({ completedMessage: e.target.value })}
            placeholder="e.g. Today is the Day! Celebrating Together Now"
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
