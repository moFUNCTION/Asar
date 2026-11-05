// =============================================================
// ASAR (Athar / أثر) — Schedule & Itinerary Timeline Component
// =============================================================

import React from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import type { InvitationScheduleItem } from "./types";

export interface InvitationScheduleProps {
  items?: InvitationScheduleItem[];
  isNoir?: boolean;
}

export const InvitationSchedule: React.FC<InvitationScheduleProps> = ({
  items = [],
  isNoir = false,
}) => {
  if (items.length === 0) return null;

  return (
    <section
      style={{
        padding: "4rem 1.5rem",
        maxWidth: "860px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
            fontWeight: 700,
            fontSize: "0.85rem",
            letterSpacing: "0.15em",
            marginBottom: "0.5rem",
          }}
        >
          <FiCalendar />
          <span>PROGRAM & ITINERARY</span>
        </div>

        <h2
          className="font-arabic-display"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          برنامج الحفل والجدول الزمني
        </h2>

        <p
          style={{
            fontSize: "1rem",
            color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          محطات الأمسية الساحرة لحظة بلحظة لنخلد معاً أطيب الذكريات
        </p>
      </div>

      {/* Timeline Track */}
      <div style={{ position: "relative", padding: "1rem 0" }}>
        {/* Vertical Connecting Line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: "24px",
            width: "2px",
            background: isNoir
              ? "linear-gradient(to bottom, transparent, var(--athar-gold), transparent)"
              : "linear-gradient(to bottom, transparent, var(--athar-maroon), transparent)",
            opacity: 0.35,
          }}
        />

        {/* Schedule Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1.5rem",
                position: "relative",
              }}
            >
              {/* Timeline Bullet Node */}
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: isNoir
                    ? "rgba(212, 175, 55, 0.15)"
                    : "rgba(107, 29, 40, 0.1)",
                  border: isNoir
                    ? "2px solid #D4AF37"
                    : "2px solid var(--athar-maroon)",
                  color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  zIndex: 2,
                }}
              >
                <FiClock />
              </div>

              {/* Content Card */}
              <div
                className="glass-panel"
                style={{
                  flex: 1,
                  padding: "1.5rem 1.8rem",
                  borderRadius: "20px",
                  backgroundColor: isNoir
                    ? "rgba(35, 26, 30, 0.92)"
                    : "rgba(255, 255, 255, 0.95)",
                  border: isNoir
                    ? "1px solid rgba(212, 175, 55, 0.25)"
                    : "1px solid rgba(107, 29, 40, 0.08)",
                  boxShadow: "var(--athar-shadow-soft)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    }}
                  >
                    {item.title}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--athar-radius-full)",
                          backgroundColor: isNoir
                            ? "rgba(212, 175, 55, 0.2)"
                            : "rgba(107, 29, 40, 0.1)",
                          color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    <span
                      style={{
                        fontFamily: "monospace",
                        direction: "ltr",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                      }}
                    >
                      {item.timeOrYear}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: "0.95rem",
                    color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvitationSchedule;
