import React from "react";
import type { EventScheduleSection, ScheduleItem } from "@repo/react-appwrite";

export interface EventScheduleInspectorProps {
  section: EventScheduleSection;
  onChange: (updated: EventScheduleSection) => void;
}

export const EventScheduleInspector: React.FC<EventScheduleInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<EventScheduleSection>) => {
    onChange({ ...section, ...partial });
  };

  const handleAddItem = () => {
    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      time: "08:00 PM",
      eventName: "New Schedule Event",
      locationName: "Main Hall",
      address: "Venue Address",
      dressCode: "Formal Evening",
      calendarSummary: "Celebration Event",
    };
    update({ scheduleItems: [...section.scheduleItems, newItem] });
  };

  const handleUpdateItem = (id: string, partial: Partial<ScheduleItem>) => {
    const updated = section.scheduleItems.map((item) =>
      item.id === id ? { ...item, ...partial } : item
    );
    update({ scheduleItems: updated });
  };

  const handleDeleteItem = (id: string) => {
    update({ scheduleItems: section.scheduleItems.filter((item) => item.id !== id) });
  };

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === section.scheduleItems.length - 1) return;
    const next = [...section.scheduleItems];
    const target = next[index];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    next[index] = next[swapIdx];
    next[swapIdx] = target;
    update({ scheduleItems: next });
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
            📅 Celebration Itinerary & Schedule Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Multi-event timeline (cocktails, ceremony, banquet, afterparty).
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          style={{
            background: "#6B1D28",
            color: "#FFF",
            border: "none",
            borderRadius: "6px",
            padding: "0.35rem 0.75rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Event Item
        </button>
      </div>

      {/* Subtitle */}
      <div>
        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
          Section Subtitle
        </label>
        <input
          type="text"
          value={section.subtitle || ""}
          onChange={(e) => update({ subtitle: e.target.value })}
          placeholder="e.g. Join us for every magical moment of our celebration"
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

      {/* Schedule Items List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {section.scheduleItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === section.scheduleItems.length - 1;

          return (
            <div
              key={item.id}
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "10px",
                padding: "0.85rem",
                background: "#FAFAFA",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span
                    style={{
                      background: "rgba(107, 29, 40, 0.1)",
                      color: "#6B1D28",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "6px",
                    }}
                  >
                    #{index + 1}
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#231F20" }}>
                    {item.time || "--:--"} • {item.eventName || "Untitled Event"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMoveItem(index, "up")}
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "none",
                      borderRadius: "4px",
                      width: "24px",
                      height: "24px",
                      cursor: isFirst ? "not-allowed" : "pointer",
                      opacity: isFirst ? 0.3 : 1,
                      fontSize: "0.7rem",
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => handleMoveItem(index, "down")}
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "none",
                      borderRadius: "4px",
                      width: "24px",
                      height: "24px",
                      cursor: isLast ? "not-allowed" : "pointer",
                      opacity: isLast ? 0.3 : 1,
                      fontSize: "0.7rem",
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    style={{
                      background: "rgba(185, 28, 28, 0.1)",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0 0.4rem",
                      height: "24px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      color: "#B91C1C",
                      fontWeight: 700,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Time and Event Name */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.6rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                    Time
                  </label>
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => handleUpdateItem(item.id, { time: e.target.value })}
                    placeholder="e.g. 07:00 PM"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: "0.82rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                    Event Title / Session
                  </label>
                  <input
                    type="text"
                    value={item.eventName}
                    onChange={(e) => handleUpdateItem(item.id, { eventName: e.target.value })}
                    placeholder="e.g. Ceremony & Exchange of Vows"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: "0.82rem",
                    }}
                  />
                </div>
              </div>

              {/* Location and Dress Code */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                    Room / Location Name
                  </label>
                  <input
                    type="text"
                    value={item.locationName || ""}
                    onChange={(e) => handleUpdateItem(item.id, { locationName: e.target.value })}
                    placeholder="e.g. Grand Foyer / Sea Terrace"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: "0.82rem",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                    Dress Code Note
                  </label>
                  <input
                    type="text"
                    value={item.dressCode || ""}
                    onChange={(e) => handleUpdateItem(item.id, { dressCode: e.target.value })}
                    placeholder="e.g. Formal Black Tie"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: "0.82rem",
                    }}
                  />
                </div>
              </div>

              {/* Map Link */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Google Maps URL
                </label>
                <input
                  type="text"
                  value={item.mapUrl || ""}
                  onChange={(e) => handleUpdateItem(item.id, { mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
