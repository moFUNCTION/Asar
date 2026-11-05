import React from "react";
import type { CoupleStorySection, CoupleStoryMilestone } from "@repo/react-appwrite";

export interface CoupleStoryInspectorProps {
  section: CoupleStorySection;
  onChange: (updated: CoupleStorySection) => void;
}

export const CoupleStoryInspector: React.FC<CoupleStoryInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<CoupleStorySection>) => {
    onChange({ ...section, ...partial });
  };

  const handleAddMilestone = () => {
    const newMilestone: CoupleStoryMilestone = {
      id: `mile-${Date.now()}`,
      yearOrDate: "Summer 2024",
      title: "New Chapter Title",
      description: "Write the memorable story of this romantic milestone here...",
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    };
    update({ milestones: [...section.milestones, newMilestone] });
  };

  const handleUpdateMilestone = (id: string, partial: Partial<CoupleStoryMilestone>) => {
    const updated = section.milestones.map((m) =>
      m.id === id ? { ...m, ...partial } : m
    );
    update({ milestones: updated });
  };

  const handleDeleteMilestone = (id: string) => {
    update({ milestones: section.milestones.filter((m) => m.id !== id) });
  };

  const handleMoveMilestone = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === section.milestones.length - 1) return;
    const next = [...section.milestones];
    const target = next[index];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    next[index] = next[swapIdx];
    next[swapIdx] = target;
    update({ milestones: next });
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
            📖 Love Story & Milestones Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Chronological chapters of how you met, proposal, and journey.
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddMilestone}
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
          + Add Milestone
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
          placeholder="e.g. The chapters that brought our worlds together"
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

      {/* Milestones List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {section.milestones.map((m, index) => {
          const isFirst = index === 0;
          const isLast = index === section.milestones.length - 1;

          return (
            <div
              key={m.id}
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
                    {m.title || "Untitled Milestone"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMoveMilestone(index, "up")}
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
                    onClick={() => handleMoveMilestone(index, "down")}
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
                    onClick={() => handleDeleteMilestone(m.id)}
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

              {/* Milestone fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.6rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                    Date / Year
                  </label>
                  <input
                    type="text"
                    value={m.yearOrDate}
                    onChange={(e) => handleUpdateMilestone(m.id, { yearOrDate: e.target.value })}
                    placeholder="e.g. October 2021"
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
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleUpdateMilestone(m.id, { title: e.target.value })}
                    placeholder="e.g. She Said Yes!"
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

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Description / Story Note
                </label>
                <textarea
                  rows={2}
                  value={m.description}
                  onChange={(e) => handleUpdateMilestone(m.id, { description: e.target.value })}
                  placeholder="Describe this special moment..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.82rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Photo URL
                </label>
                <input
                  type="text"
                  value={m.imageUrl || ""}
                  onChange={(e) => handleUpdateMilestone(m.id, { imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
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
