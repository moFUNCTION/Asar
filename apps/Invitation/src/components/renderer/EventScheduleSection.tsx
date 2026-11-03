import React from "react";
import type { ScheduleItem } from "./types";

export interface EventScheduleSectionProps {
  items?: ScheduleItem[];
  title?: string;
  subtitle?: string;
  isNoir?: boolean;
}

const DEFAULT_SCHEDULE: ScheduleItem[] = [
  {
    timeOrYear: "19:30",
    title: "استقبال الضيوف والمشروبات الترحيبية",
    description: "نبدأ الأمسية بلقاء الأحبة وعزف موسيقي هادئ مع مشروبات الكوكتيل الفاخرة.",
    badge: "Welcome",
  },
  {
    timeOrYear: "20:30",
    title: "المراسم الرسمية ومفاجأة الحفل",
    description: "دخول العروسين أو كلمة الافتتاح الرسمية وتوثيق اللحظات الأيقونية.",
    badge: "Key Moment",
  },
  {
    timeOrYear: "21:30",
    title: "مأدبة العشاء الملكية",
    description: "بوفيه عشاء فاخر مصمم خصيصاً للمناسبة من كبار طهاة الفندق.",
    badge: "Dinner",
  },
  {
    timeOrYear: "23:00",
    title: "الاحتفال والموسيقى والتقاط الصور التذكارية",
    description: "استمرار الأمسية بأجواء مفعمة بالبهجة والمفاجآت وتوزيع الهدايا التذكارية.",
    badge: "Celebration",
  },
];

export const EventScheduleSection: React.FC<EventScheduleSectionProps> = ({
  items = DEFAULT_SCHEDULE,
  title = "برنامج الحفل والجدول الزمني",
  subtitle = "محطات الأمسية الساحرة لحظة بلحظة لنخلد معاً أطيب الذكريات",
  isNoir = false,
}) => {
  const scheduleItems = items && items.length > 0 ? items : DEFAULT_SCHEDULE;

  return (
    <section
      className="event-schedule-section"
      style={{
        padding: "4rem 1.5rem",
        maxWidth: "860px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2
          className="font-arabic-display"
          style={{
            fontSize: "clamp(1.8rem, 3.8vw, 2.6rem)",
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
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Timeline track */}
      <div
        style={{
          position: "relative",
          padding: "1rem 0",
        }}
      >
        {/* Central connecting line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: "28px", // RTL alignment on right
            width: "2px",
            background: isNoir
              ? "linear-gradient(to bottom, transparent, var(--athar-gold), transparent)"
              : "linear-gradient(to bottom, transparent, var(--athar-maroon), transparent)",
            opacity: 0.35,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {scheduleItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1.5rem",
                position: "relative",
              }}
            >
              {/* Glowing Node Marker */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: isNoir ? "#231A1E" : "#FFFFFF",
                  border: "2px solid var(--athar-gold)",
                  boxShadow: "0 0 16px rgba(212, 175, 55, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: isNoir ? "var(--athar-gold-bright)" : "var(--athar-maroon)",
                    direction: "ltr",
                  }}
                >
                  {item.timeOrYear}
                </span>
              </div>

              {/* Item Card */}
              <div
                className="luxury-card"
                style={{
                  flex: 1,
                  backgroundColor: isNoir
                    ? "rgba(35, 26, 30, 0.9)"
                    : "rgba(255, 255, 255, 0.95)",
                  border: "1px solid var(--athar-card-border)",
                  borderRadius: "20px",
                  padding: "1.5rem 1.75rem",
                  boxShadow: "var(--athar-shadow-soft)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <h3
                    className="font-arabic-display"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    }}
                  >
                    {item.title}
                  </h3>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        backgroundColor: isNoir
                          ? "rgba(212, 175, 55, 0.15)"
                          : "var(--athar-gold-light)",
                        color: isNoir ? "var(--athar-gold-bright)" : "var(--athar-maroon)",
                        border: "1px solid var(--athar-gold-border)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "0.93rem",
                    color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
                    lineHeight: 1.6,
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

export const StoryTimelineBlock = EventScheduleSection;
export default EventScheduleSection;
