import React, { useState, useEffect } from "react";
import type { LiveCountdownSection as LiveCountdownSectionModel } from "@repo/react-appwrite";

export interface LiveCountdownSectionProps {
  section: LiveCountdownSectionModel;
  isNoir?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isCompleted: boolean;
}

export function calculateTimeRemaining(targetIso: string): TimeRemaining {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const difference = target - now;

  if (isNaN(target) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return { days, hours, minutes, seconds, isCompleted: false };
}

export const LiveCountdownSection: React.FC<LiveCountdownSectionProps> = ({
  section,
  isNoir = false,
}) => {
  const targetIso = section.targetDateIso || "2026-11-20T19:30:00Z";
  const [time, setTime] = useState<TimeRemaining>(() => calculateTimeRemaining(targetIso));

  useEffect(() => {
    const updateCountdown = () => {
      setTime(calculateTimeRemaining(targetIso));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  const units = [
    { value: time.days, labelEn: "Days", labelAr: "أيام" },
    { value: time.hours, labelEn: "Hours", labelAr: "ساعات" },
    { value: time.minutes, labelEn: "Minutes", labelAr: "دقائق" },
    { value: time.seconds, labelEn: "Seconds", labelAr: "ثوانٍ" },
  ];

  return (
    <section
      id={section.id || "live-countdown-section"}
      className="athar-live-countdown-section"
      style={{
        padding: "4rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
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
          ✦ Anticipation · العد التنازلي للحظة المنتظرة ✦
        </span>

        <h2
          style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)",
            fontWeight: 700,
            fontFamily: "var(--font-arabic-display, serif)",
            color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
            margin: "0 0 2rem 0",
          }}
        >
          {section.heading || section.title || "The Moment We Say I Do"}
        </h2>

        {time.isCompleted ? (
          <div
            style={{
              padding: "2rem",
              borderRadius: "20px",
              background: isNoir
                ? "linear-gradient(135deg, rgba(35, 26, 30, 0.9), rgba(22, 18, 20, 0.95))"
                : "linear-gradient(135deg, #FFFFFF, #FAF4ED)",
              border: "1.5px solid var(--athar-gold, #D4AF37)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--athar-gold, #D4AF37)",
            }}
          >
            {section.completedMessage || "حان الموعد السعيد! نحتفل معكم الآن بكل بهجة وفرح 🥂✨"}
          </div>
        ) : (
          /* Ticking Dials Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            {units.map((unit, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1.25rem 0.75rem",
                  borderRadius: "20px",
                  background: isNoir
                    ? "linear-gradient(145deg, rgba(35, 26, 30, 0.94), rgba(22, 18, 20, 0.97))"
                    : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
                  border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                    fontWeight: 800,
                    fontFamily: "var(--font-latin-display, serif)",
                    color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                    lineHeight: 1,
                    marginBottom: "0.4rem",
                  }}
                >
                  {String(unit.value).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  }}
                >
                  {unit.labelAr}
                </div>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--athar-gold, #D4AF37)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {unit.labelEn}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveCountdownSection;
