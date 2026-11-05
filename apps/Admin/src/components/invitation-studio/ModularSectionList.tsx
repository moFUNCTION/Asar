import React, { useState } from "react";
import type { EventSection, EventSectionType } from "@repo/react-appwrite";

export interface ModularSectionListProps {
  sections: EventSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onMoveSection: (index: number, direction: "up" | "down") => void;
  onDuplicateSection: (section: EventSection) => void;
  onDeleteSection: (id: string) => void;
  onUpdateTitle?: (id: string, newTitle: string) => void;
  onOpenPalette: () => void;
}

const SECTION_TYPE_META: Record<
  EventSectionType,
  { icon: string; label: string; badgeColor: string }
> = {
  cover_hero: { icon: "🏛️", label: "Cover & Hero", badgeColor: "#6B1D28" },
  live_countdown: { icon: "⏳", label: "Countdown", badgeColor: "#92400E" },
  couple_story: { icon: "📖", label: "Our Story", badgeColor: "#1E40AF" },
  event_schedule: { icon: "📅", label: "Schedule", badgeColor: "#374151" },
  photo_gallery: { icon: "🖼️", label: "Gallery", badgeColor: "#047857" },
  wishing_wall: { icon: "💌", label: "Wishing Wall", badgeColor: "#B91C1C" },
  digital_gift_registry: { icon: "🎁", label: "Gift Registry", badgeColor: "#D97706" },
  background_audio: { icon: "🎵", label: "Audio Music", badgeColor: "#6D28D9" },
  venue_location: { icon: "📍", label: "Venue & Map", badgeColor: "#0E7490" },
  custom_highlight: { icon: "✦", label: "Highlight", badgeColor: "#4338CA" },
  dynamic_rsvp: { icon: "✉️", label: "Dynamic RSVP", badgeColor: "#059669" },
};

export const ModularSectionList: React.FC<ModularSectionListProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onToggleVisible,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onUpdateTitle,
  onOpenPalette,
}) => {
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEditTitle = (section: EventSection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTitleId(section.id);
    setEditingTitleValue(section.title);
  };

  const handleSaveTitle = (id: string) => {
    if (editingTitleValue.trim() && onUpdateTitle) {
      onUpdateTitle(id, editingTitleValue.trim());
    }
    setEditingTitleId(null);
  };

  const enabledCount = sections.filter((s) => s.enabled).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        background: "#FFFFFF",
        borderRadius: "14px",
        border: "1px solid rgba(107, 29, 40, 0.12)",
        padding: "1.25rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      {/* List Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "#231F20",
                margin: 0,
              }}
            >
              Page Sections Deck
            </h3>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "0.15rem 0.55rem",
                borderRadius: "999px",
                background: "rgba(107, 29, 40, 0.08)",
                color: "#6B1D28",
              }}
            >
              {enabledCount} active of {sections.length} total
            </span>
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "#7A6F6D",
              marginTop: "0.2rem",
              marginBottom: 0,
            }}
          >
            Reorder with steppers, toggle visibility, and click any section to inspect and edit.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPalette}
          style={{
            background: "linear-gradient(135deg, #6B1D28, #8C2534)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 0.95rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 2px 6px rgba(107, 29, 40, 0.25)",
            transition: "all 0.15s ease",
          }}
        >
          <span>＋</span>
          <span>Add Section</span>
        </button>
      </div>

      {/* Sections List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          marginTop: "0.25rem",
        }}
      >
        {sections.map((section, index) => {
          const meta =
            SECTION_TYPE_META[section.type] || {
              icon: "📦",
              label: section.type,
              badgeColor: "#666",
            };
          const isSelected = selectedSectionId === section.id;
          const isFirst = index === 0;
          const isLast = index === sections.length - 1;
          const isLocked = Boolean(section.isLocked);

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 0.9rem",
                borderRadius: "10px",
                border: `1.5px solid ${
                  isSelected ? "#6B1D28" : "rgba(0,0,0,0.08)"
                }`,
                background: isSelected
                  ? "rgba(107, 29, 40, 0.03)"
                  : section.enabled
                  ? "#FFFFFF"
                  : "#F9F9F9",
                opacity: section.enabled ? 1 : 0.6,
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected
                  ? "0 0 0 1px #6B1D28, 0 3px 10px rgba(107, 29, 40, 0.08)"
                  : "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              {/* Left Details */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {/* Drag Handle Icon & Order */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    color: "#999",
                    userSelect: "none",
                  }}
                  title="Section sequence"
                >
                  <span style={{ fontSize: "0.9rem", opacity: 0.6 }}>⠿</span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#888",
                      minWidth: "16px",
                      textAlign: "center",
                    }}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Section Icon */}
                <span
                  style={{
                    fontSize: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(0,0,0,0.04)",
                  }}
                >
                  {meta.icon}
                </span>

                {/* Title and Metadata */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  {editingTitleId === section.id ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitleValue}
                        onChange={(e) => setEditingTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTitle(section.id);
                          if (e.key === "Escape") setEditingTitleId(null);
                        }}
                        autoFocus
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #6B1D28",
                          outline: "none",
                          width: "80%",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTitle(section.id)}
                        style={{
                          background: "#6B1D28",
                          color: "#FFF",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.2rem 0.45rem",
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: section.enabled ? "#231F20" : "#888",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {section.title}
                      </span>
                      {onUpdateTitle && (
                        <button
                          type="button"
                          onClick={(e) => startEditTitle(section, e)}
                          title="Rename section"
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                            opacity: 0.5,
                            padding: 0,
                          }}
                        >
                          ✎
                        </button>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginTop: "0.15rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "4px",
                        background: "rgba(0,0,0,0.05)",
                        color: meta.badgeColor,
                        fontWeight: 700,
                      }}
                    >
                      {meta.label}
                    </span>

                    {isLocked && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          padding: "0.1rem 0.35rem",
                          borderRadius: "4px",
                          background: "rgba(107, 29, 40, 0.08)",
                          color: "#6B1D28",
                          fontWeight: 700,
                        }}
                      >
                        🔒 Locked
                      </span>
                    )}

                    {!section.enabled && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "#999",
                          fontStyle: "italic",
                        }}
                      >
                        (Hidden from live view)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Action Controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  marginLeft: "0.5rem",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Reorder Steppers */}
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => onMoveSection(index, "up")}
                  title="Move section up"
                  style={{
                    background: "rgba(0,0,0,0.04)",
                    border: "none",
                    borderRadius: "6px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isFirst ? "not-allowed" : "pointer",
                    opacity: isFirst ? 0.3 : 1,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#333",
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => onMoveSection(index, "down")}
                  title="Move section down"
                  style={{
                    background: "rgba(0,0,0,0.04)",
                    border: "none",
                    borderRadius: "6px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLast ? "not-allowed" : "pointer",
                    opacity: isLast ? 0.3 : 1,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#333",
                  }}
                >
                  ↓
                </button>

                {/* Eye Visibility Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleVisible(section.id)}
                  title={section.enabled ? "Hide section from live site" : "Show section on live site"}
                  style={{
                    background: section.enabled
                      ? "rgba(107, 29, 40, 0.08)"
                      : "rgba(0,0,0,0.05)",
                    border: "none",
                    borderRadius: "6px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    color: section.enabled ? "#6B1D28" : "#999",
                  }}
                >
                  {section.enabled ? "👁️" : "🚫"}
                </button>

                {/* Duplicate Action */}
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => onDuplicateSection(section)}
                  title={isLocked ? "Locked sections cannot be duplicated" : "Duplicate section"}
                  style={{
                    background: "rgba(0,0,0,0.04)",
                    border: "none",
                    borderRadius: "6px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    opacity: isLocked ? 0.3 : 1,
                    fontSize: "0.8rem",
                    color: "#444",
                  }}
                >
                  ⎘
                </button>

                {/* Inspect Trigger */}
                <button
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  title="Inspect & configure properties"
                  style={{
                    background: isSelected ? "#6B1D28" : "rgba(0,0,0,0.04)",
                    color: isSelected ? "#FFFFFF" : "#333",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0 0.5rem",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                    cursor: "pointer",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                  }}
                >
                  <span>⚙</span>
                  <span>Edit</span>
                </button>

                {/* Delete Action with guard */}
                {confirmDeleteId === section.id ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteSection(section.id);
                        setConfirmDeleteId(null);
                      }}
                      style={{
                        background: "#B91C1C",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "6px",
                        padding: "0 0.4rem",
                        height: "28px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Delete?
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      style={{
                        background: "rgba(0,0,0,0.08)",
                        border: "none",
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) setConfirmDeleteId(section.id);
                    }}
                    title={isLocked ? "Locked sections cannot be deleted" : "Delete section"}
                    style={{
                      background: "rgba(185, 28, 28, 0.06)",
                      border: "none",
                      borderRadius: "6px",
                      width: "28px",
                      height: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      opacity: isLocked ? 0.25 : 0.8,
                      fontSize: "0.8rem",
                      color: "#B91C1C",
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
