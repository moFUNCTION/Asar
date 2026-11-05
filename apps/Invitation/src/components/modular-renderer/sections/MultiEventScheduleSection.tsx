import React, { useState } from "react";
import type { EventScheduleSection as EventScheduleSectionModel, ScheduleItem } from "@repo/react-appwrite";

export interface MultiEventScheduleSectionProps {
  section: EventScheduleSectionModel;
  isNoir?: boolean;
  eventDate?: string;
}

/**
 * Builds an RFC 5545 compliant .ics calendar file content string for download.
 */
export function buildIcsContent(
  eventName: string,
  items: ScheduleItem[],
  eventDate = "20261120"
): string {
  const cleanDate = eventDate.replace(/[^0-9]/g, "").padEnd(8, "0").slice(0, 8);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Athar Luxury Experiences//Modular Event Itinerary//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  if (items.length === 0) {
    ics.push(
      "BEGIN:VEVENT",
      `UID:asar-event-${Date.now()}@asar.me`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${cleanDate}T180000Z`,
      `DTEND:${cleanDate}T230000Z`,
      `SUMMARY:${eventName}`,
      "DESCRIPTION:Royal Celebration with Athar Luxury Experiences",
      "END:VEVENT"
    );
  } else {
    items.forEach((item, idx) => {
      const timeClean = item.time.replace(/[^0-9]/g, "").padEnd(4, "0").slice(0, 4);
      const startH = timeClean.slice(0, 2) || "18";
      const startM = timeClean.slice(2, 4) || "00";
      const endH = String((parseInt(startH, 10) + 2) % 24).padStart(2, "0");

      const uid = `asar-${item.id || idx}-${cleanDate}@asar.me`;
      const summary = item.calendarSummary || item.eventName;
      const desc = item.calendarDescription || (item.dressCode ? `Dress Code: ${item.dressCode}` : item.eventName);
      const loc = item.address || item.locationName || "";

      ics.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${cleanDate}T${startH}${startM}00Z`,
        `DTEND:${cleanDate}T${endH}${startM}00Z`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${desc.replace(/\n/g, "\\n")}`,
        loc ? `LOCATION:${loc}` : "",
        "END:VEVENT"
      );
    });
  }

  ics.push("END:VCALENDAR");
  return ics.filter(Boolean).join("\r\n");
}

export const MultiEventScheduleSection: React.FC<MultiEventScheduleSectionProps> = ({
  section,
  isNoir = false,
  eventDate = "2026-11-20",
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const scheduleItems =
    section.scheduleItems && section.scheduleItems.length > 0
      ? section.scheduleItems
      : [
          {
            id: "sched-1",
            time: "18:00",
            eventName: "Guest Welcome & Cocktail Reception · استقبال الضيوف والكوكتيل",
            locationName: "Grand Foyer Lounge",
            address: "Four Seasons San Stefano, Alexandria",
            dressCode: "Black Tie & Evening Glamour · أزياء السهرة الرسمية",
            calendarSummary: "Omar & Layla: Welcome Reception",
          },
          {
            id: "sched-2",
            time: "19:30",
            eventName: "Ceremony & Katb Ketab · مراسم عقد القران والزفاف",
            locationName: "Royal Ballroom",
            address: "Four Seasons San Stefano, Alexandria",
            dressCode: "Black Tie Formal",
            calendarSummary: "Omar & Layla: Royal Ceremony",
          },
          {
            id: "sched-3",
            time: "21:30",
            eventName: "Banquet & Celebrations · العشاء الملكي والاحتفال",
            locationName: "Pavilion Terrace",
            address: "Four Seasons San Stefano, Alexandria",
            dressCode: "Evening Attire",
            calendarSummary: "Omar & Layla: Celebration & Dinner",
          },
        ];

  const handleDownloadIcs = () => {
    try {
      const ics = buildIcsContent(section.title || "Wedding Itinerary", scheduleItems, eventDate);
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${(section.title || "event-schedule").toLowerCase().replace(/\s+/g, "-")}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to generate .ics calendar download", err);
    }
  };

  return (
    <section
      id={section.id || "multi-event-schedule-section"}
      className="athar-multi-event-schedule-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#F4EFEA",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
            ✦ {section.subtitle || "Ceremony & Celebration Itinerary · البرنامج الزمني"} ✦
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              fontFamily: "var(--font-arabic-display, serif)",
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
              margin: "0 0 0.5rem 0",
            }}
          >
            {section.title || "Event Schedule"}
          </h2>
          {section.titleAr && (
            <div
              style={{
                fontSize: "1.15rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontFamily: "var(--font-arabic-display, serif)",
                marginBottom: "1rem",
              }}
            >
              {section.titleAr}
            </div>
          )}

          {/* Download .ICS Button */}
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handleDownloadIcs}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.35rem",
                borderRadius: "9999px",
                backgroundColor: isNoir ? "rgba(35, 26, 30, 0.9)" : "#FFFFFF",
                border: "1.5px solid var(--athar-gold, #D4AF37)",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
              }}
            >
              <span>📅</span>
              <span>
                {downloadSuccess
                  ? "✓ تم تحميل الجدول في التقويم · Saved to Calendar!"
                  : "تحميل البرنامج إلى التقويم (.ics) · Save Schedule to Calendar"}
              </span>
            </button>
          </div>
        </div>

        {/* Timeline Itinerary Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {scheduleItems.map((item, idx) => {
            const mapQuery = item.address || item.locationName;
            const googleMapsUrl = item.mapUrl || (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : undefined);

            return (
              <div
                key={item.id || idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  padding: "1.75rem 2rem",
                  borderRadius: "22px",
                  background: isNoir
                    ? "linear-gradient(135deg, rgba(35, 26, 30, 0.88), rgba(22, 18, 20, 0.94))"
                    : "linear-gradient(135deg, #FFFFFF, #FAF4ED)",
                  border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.04)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  {/* Time Badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.35rem 0.95rem",
                      borderRadius: "9999px",
                      backgroundColor: isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)",
                      border: "1.5px solid var(--athar-gold, #D4AF37)",
                      color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                  >
                    <span>🕒</span>
                    <span>{item.time}</span>
                  </div>

                  {/* Attire / Dress Code Badge */}
                  {item.dressCode && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: isNoir ? "#D6C7B2" : "var(--athar-text-muted, #7A6F6D)",
                        backgroundColor: isNoir ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontWeight: 600,
                      }}
                    >
                      👔 {item.dressCode}
                    </div>
                  )}
                </div>

                {/* Event Name */}
                <h3
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-arabic-display, serif)",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                    margin: 0,
                  }}
                >
                  {item.eventName}
                </h3>

                {/* Location & Directions */}
                {(item.locationName || item.address) && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px dashed rgba(212, 175, 55, 0.25)",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: isNoir ? "#A8A8B7" : "var(--athar-text-muted, #7A6F6D)" }}>
                      <span style={{ fontWeight: 700, color: isNoir ? "#E5C158" : "var(--athar-text-title, #231F20)" }}>
                        📍 {item.locationName}
                      </span>
                      {item.address && <span> — {item.address}</span>}
                    </div>

                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "var(--athar-gold, #D4AF37)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span>اتجاهات الخريطة · Directions</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MultiEventScheduleSection;
