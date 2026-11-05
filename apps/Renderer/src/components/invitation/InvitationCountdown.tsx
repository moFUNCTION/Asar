// =============================================================
// ASAR (Athar / أثر) — Real-Time Live Countdown Ticker
// =============================================================

import React, { useState, useEffect, useMemo } from "react";
import { FiClock } from "react-icons/fi";

export interface InvitationCountdownProps {
  eventDate: string;
  eventTime?: string;
  isNoir?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
}

export const InvitationCountdown: React.FC<InvitationCountdownProps> = ({
  eventDate,
  eventTime = "19:30",
  isNoir = false,
}) => {
  const targetTimestamp = useMemo(() => {
    try {
      const timePart = eventTime.includes(":") ? eventTime.slice(0, 5) : "19:00";
      const combined = `${eventDate}T${timePart}:00`;
      const parsed = Date.parse(combined);
      if (!isNaN(parsed)) return parsed;

      const dateOnly = Date.parse(eventDate);
      if (!isNaN(dateOnly)) return dateOnly;
    } catch {
      // Ignore
    }
    // Default 14 days in future if unparseable
    return Date.now() + 14 * 24 * 60 * 60 * 1000;
  }, [eventDate, eventTime]);

  const calculateTimeRemaining = (): TimeRemaining => {
    const diff = targetTimestamp - Date.now();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, isPassed: false };
  };

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTimestamp]);

  const cards = [
    { labelAr: "أيام", labelEn: "Days", value: timeRemaining.days },
    { labelAr: "ساعات", labelEn: "Hours", value: timeRemaining.hours },
    { labelAr: "دقائق", labelEn: "Minutes", value: timeRemaining.minutes },
    { labelAr: "ثواني", labelEn: "Seconds", value: timeRemaining.seconds },
  ];

  return (
    <section
      style={{
        padding: "3.5rem 1.5rem",
        maxWidth: "860px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
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
          <FiClock />
          <span>COUNTDOWN TO THE CELEBRATION</span>
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
          العد التنازلي للمناسبة الفاخرة
        </h2>

        <p
          style={{
            fontSize: "1rem",
            color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
          }}
        >
          ننتظر بشوق ولهفة لحظات البهجة التي تجمعنا بكم
        </p>
      </div>

      {/* 4 Digit Ticker Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "clamp(0.6rem, 2vw, 1.5rem)",
          maxWidth: "680px",
          margin: "0 auto",
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: "clamp(1rem, 2.5vw, 1.8rem) clamp(0.5rem, 1.5vw, 1rem)",
              borderRadius: "20px",
              textAlign: "center",
              backgroundColor: isNoir
                ? "rgba(35, 26, 30, 0.92)"
                : "rgba(255, 255, 255, 0.95)",
              border: isNoir
                ? "1.5px solid rgba(212, 175, 55, 0.35)"
                : "1.5px solid rgba(107, 29, 40, 0.12)",
              boxShadow: "var(--athar-shadow-soft)",
              transition: "transform 0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
                fontWeight: 700,
                color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                fontFamily: "monospace",
                lineHeight: 1.1,
                marginBottom: "0.3rem",
              }}
            >
              {card.value.toString().padStart(2, "0")}
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              }}
            >
              {card.labelAr}
            </div>

            <div
              style={{
                fontSize: "0.7rem",
                color: isNoir ? "rgba(255,255,255,0.6)" : "var(--athar-text-muted)",
                letterSpacing: "0.08em",
              }}
            >
              {card.labelEn}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InvitationCountdown;
