import React, { useState } from "react";
import type { DynamicRsvpSection, DynamicFormField, DynamicFormFieldType } from "@repo/react-appwrite";

export interface DynamicRsvpInspectorProps {
  section: DynamicRsvpSection;
  onChange: (updated: DynamicRsvpSection) => void;
}

export const DynamicRsvpInspector: React.FC<DynamicRsvpInspectorProps> = ({
  section,
  onChange,
}) => {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<DynamicFormFieldType>("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const update = (partial: Partial<DynamicRsvpSection>) => {
    onChange({ ...section, ...partial });
  };

  // Safe datetime local format helper
  const toDateInputValue = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  // Schema field operations
  const handleAddField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) return;

    const slug = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 24);

    const newField: DynamicFormField = {
      id: `field-${Date.now()}`,
      name: slug || `customField_${Date.now()}`,
      labelEn: trimmed,
      labelAr: trimmed,
      type: newFieldType,
      required: newFieldRequired,
      placeholderEn: `Enter ${trimmed}...`,
    };

    update({ formSchema: [...section.formSchema, newField] });
    setNewFieldName("");
    setNewFieldRequired(false);
  };

  const handleUpdateField = (id: string, partial: Partial<DynamicFormField>) => {
    const updated = section.formSchema.map((f) => {
      if (f.id === id) {
        // Guard locked email field
        if (f.locked && (partial.type || partial.required === false)) {
          return f; // keep locked constraints
        }
        return { ...f, ...partial };
      }
      return f;
    });
    update({ formSchema: updated });
  };

  const handleDeleteField = (id: string) => {
    const target = section.formSchema.find((f) => f.id === id);
    if (target?.locked || target?.type === "email") return; // locked guard
    update({ formSchema: section.formSchema.filter((f) => f.id !== id) });
  };

  const handleMoveField = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === section.formSchema.length - 1) return;
    const next = [...section.formSchema];
    const target = next[index];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    next[index] = next[swapIdx];
    next[swapIdx] = target;
    update({ formSchema: next });
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
            ✉️ Attendance Confirmation (Dynamic RSVP) Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Guest capacity limits, RSVP deadline, and customizable questionnaire schema.
          </span>
        </div>
        <span
          style={{
            background: "rgba(5, 150, 105, 0.1)",
            color: "#059669",
            fontWeight: 800,
            fontSize: "0.72rem",
            padding: "0.2rem 0.55rem",
            borderRadius: "6px",
          }}
        >
          Locked Email Required 🔒
        </span>
      </div>

      {/* Basic Settings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Section Title
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Confirm Your Attendance (RSVP)"
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

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            RSVP Cutoff Deadline Date
          </label>
          <input
            type="date"
            value={toDateInputValue(section.deadlineDate)}
            onChange={(e) => {
              if (e.target.value) {
                update({ deadlineDate: new Date(e.target.value).toISOString() });
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

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Maximum Guest Capacity Limit
          </label>
          <input
            type="number"
            min={10}
            max={5000}
            value={section.capacityLimit || 250}
            onChange={(e) => update({ capacityLimit: Number(e.target.value) || 250 })}
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

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Max Companions Allowed Per Invitation (+N)
          </label>
          <input
            type="number"
            min={0}
            max={10}
            value={section.maxCompanions}
            onChange={(e) => update({ maxCompanions: Number(e.target.value) || 0 })}
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

        <div style={{ gridColumn: "span 2" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Subtitle / Deadline Notice
          </label>
          <input
            type="text"
            value={section.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="e.g. Kindly respond by 01 November 2026 to ensure your seating reservation"
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

      {/* Logistics toggles */}
      <div
        style={{
          display: "flex",
          gap: "1.25rem",
          flexWrap: "wrap",
          padding: "0.6rem 0.75rem",
          background: "#FAFAFA",
          borderRadius: "8px",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={section.allowPlusOnes}
            onChange={(e) => update({ allowPlusOnes: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Allow Plus-Ones / Companions
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={section.askDietary}
            onChange={(e) => update({ askDietary: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Include Dietary Preferences Field
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={section.askTransportation}
            onChange={(e) => update({ askTransportation: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Include Shuttle / Transportation Field
        </label>
      </div>

      {/* Dynamic Form Schema Field Builder */}
      <div
        style={{
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "10px",
          padding: "0.9rem",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h5 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#231F20" }}>
              RSVP Form Schema Builder ({section.formSchema.length} fields)
            </h5>
            <span style={{ fontSize: "0.72rem", color: "#7A6F6D" }}>
              Email address is permanently locked & required to guarantee QR pass generation.
            </span>
          </div>
        </div>

        {/* Add Field Bar */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            alignItems: "center",
            background: "#F8F5F0",
            padding: "0.5rem 0.6rem",
            borderRadius: "8px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="Field Label (e.g. Dietary Notes)..."
            style={{
              flex: 1,
              minWidth: "160px",
              padding: "0.35rem 0.55rem",
              borderRadius: "6px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.78rem",
            }}
          />

          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as DynamicFormFieldType)}
            style={{
              padding: "0.35rem 0.55rem",
              borderRadius: "6px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.78rem",
              background: "#FFF",
            }}
          >
            <option value="text">Text Input</option>
            <option value="tel">Phone / WhatsApp</option>
            <option value="textarea">Multi-line Textarea</option>
            <option value="select">Dropdown Select</option>
            <option value="checkbox">Checkbox Toggle</option>
            <option value="number">Numeric Count</option>
          </select>

          <label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
              style={{ accentColor: "#6B1D28" }}
            />
            Required
          </label>

          <button
            type="button"
            onClick={handleAddField}
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
            + Add Field
          </button>
        </div>

        {/* Fields Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {section.formSchema.map((field, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === section.formSchema.length - 1;
            const isLocked = Boolean(field.locked);

            return (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.55rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: isLocked ? "rgba(5, 150, 105, 0.04)" : "#FAFAFA",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: "0.75rem", color: "#888", width: "16px" }}>
                    {idx + 1}.
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#231F20" }}>
                        {field.labelEn}
                      </span>
                      {field.required && (
                        <span style={{ color: "#B91C1C", fontWeight: 800, fontSize: "0.8rem" }}>
                          *
                        </span>
                      )}
                      {isLocked && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            background: "rgba(5, 150, 105, 0.12)",
                            color: "#059669",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "4px",
                            fontWeight: 700,
                          }}
                        >
                          🔒 Mandatory
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#888" }}>
                      type: {field.type} • name: {field.name}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleUpdateField(field.id, { required: !field.required })}
                      title={field.required ? "Make optional" : "Make required"}
                      style={{
                        background: field.required ? "rgba(185, 28, 28, 0.08)" : "rgba(0,0,0,0.04)",
                        color: field.required ? "#B91C1C" : "#555",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0 0.35rem",
                        height: "24px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {field.required ? "Req" : "Opt"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => handleMoveField(idx, "up")}
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
                    onClick={() => handleMoveField(idx, "down")}
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
                    disabled={isLocked}
                    onClick={() => handleDeleteField(field.id)}
                    style={{
                      background: isLocked ? "rgba(0,0,0,0.04)" : "rgba(185, 28, 28, 0.08)",
                      color: isLocked ? "#AAA" : "#B91C1C",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0 0.4rem",
                      height: "24px",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {isLocked ? "Locked" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
