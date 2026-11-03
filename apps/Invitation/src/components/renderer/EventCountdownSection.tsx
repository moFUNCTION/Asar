import React, { useState, useEffect, useMemo } from "react";

export interface EventCountdownSectionProps {
  eventDate: string;
  eventTime?: string;
  title?: string;
  subtitle?: string;
  isNoir?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
}

export const EventCountdownSection: React.FC<EventCountdownSectionProps> = ({
  eventDate,
  eventTime = "19:00",
  title = "العد التنازلي للمناسبة الفاخرة",
  subtitle = "ننتظر بشوق لحظات الفرح التي تجمعنا بكم",
  isNoir = false,
}) => {
  const targetTimestamp = useMemo(() => {
    try {
      // Normalize date string (e.g. 2026-11-20 and 19:30)
      const combined = `${eventDate}T${eventTime.includes(":") ? eventTime.slice(0, 5) : "19:00"}:00`;
      const parsed = Date.parse(combined);
      if (!isNaN(parsed)) return parsed;

      // Fallback: parse just date
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

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(calculateTimeRemaining);

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
      className="event-countdown-section"
      style={{
        padding: "3.5rem 1.5rem",
        maxWidth: "880px",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h2
          className="font-arabic-display"
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: "0.98rem",
              color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {timeRemaining.isPassed ? (
        <div
          style={{
            padding: "2rem",
            borderRadius: "24px",
            backgroundColor: isNoir
              ? "rgba(30, 111, 80, 0.2)"
              : "var(--athar-status-success-bg)",
            border: "1.5px solid var(--athar-status-success)",
            color: isNoir ? "#5EEAD4" : "var(--athar-status-success)",
            fontSize: "1.2rem",
            fontWeight: 700,
          }}
        >
          🎉 المناسبة تقام الآن! أهلاً وسهلاً بكم في هذا اليوم الاستثنائي.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="luxury-card"
              style={{
                backgroundColor: isNoir
                  ? "rgba(35, 26, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.95)",
                border: "1.5px solid var(--athar-gold-border)",
                borderRadius: "20px",
                padding: "1.75rem 1rem",
                boxShadow: "var(--athar-shadow-soft)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top hairline gold accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: "2px",
                  background:
                    "linear-gradient(90deg, transparent, var(--athar-gold), transparent)",
                }}
              />

              <div
                className="font-arabic-display"
                style={{
                  fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
                  fontWeight: 700,
                  color: isNoir ? "var(--athar-gold-bright)" : "var(--athar-maroon)",
                  lineHeight: 1.1,
                  marginBottom: "0.4rem",
                }}
              >
                {String(card.value).padStart(2, "0")}
              </div>

              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                  letterSpacing: "0.02em",
                }}
              >
                {card.labelAr}
              </div>

              <div
                style={{
                  fontSize: "0.72rem",
                  textTransform: "uppercase",
                  color: isNoir ? "#A8A8B7" : "var(--athar-text-muted)",
                  letterSpacing: "0.08em",
                  marginTop: "0.15rem",
                }}
              >
                {card.labelEn}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export const CountdownBlock = EventCountdownSection;
export default EventCountdownSection;
