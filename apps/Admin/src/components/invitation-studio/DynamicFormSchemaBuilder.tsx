import React, { useState } from "react";

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea";

export interface DynamicFormField {
  id: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  isSystemLocked?: boolean;
  description?: string;
}

export interface FormSchemaValidationResult {
  isValid: boolean;
  errors: string[];
}

export const MANDATORY_SYSTEM_FIELDS: DynamicFormField[] = [
  {
    id: "guestName",
    label: "Full Name / الاسم بالكامل",
    placeholder: "e.g. Karim El-Masry",
    type: "text",
    required: true,
    isSystemLocked: true,
    description: "Required for guest list and invitation pass generation.",
  },
  {
    id: "guestEmail",
    label: "Email Address / البريد الإلكتروني",
    placeholder: "guest@example.com",
    type: "email",
    required: true,
    isSystemLocked: true,
    description: "🔒 System Required for EmailJS QR Delivery and venue capacity notices.",
  },
];

/**
 * Validates the dynamic form schema to ensure integrity and strict constraint enforcement.
 * Enforces that guestEmail and guestName are present, typed correctly, and marked required.
 */
export function validateFormSchema(fields: DynamicFormField[]): FormSchemaValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(fields) || fields.length === 0) {
    return {
      isValid: false,
      errors: ["Form schema cannot be empty. Mandatory system fields are required."],
    };
  }

  // 1. Mandatory guestEmail enforcement
  const emailField = fields.find((f) => f.id === "guestEmail");
  if (!emailField) {
    errors.push("Mandatory system field 'guestEmail' is missing from schema.");
  } else {
    if (!emailField.required) {
      errors.push("Mandatory system field 'guestEmail' must be marked as required.");
    }
    if (emailField.type !== "email") {
      errors.push("Field 'guestEmail' must have type 'email'.");
    }
  }

  // 2. Mandatory guestName enforcement
  const nameField = fields.find((f) => f.id === "guestName");
  if (!nameField) {
    errors.push("Mandatory system field 'guestName' is missing from schema.");
  } else {
    if (!nameField.required) {
      errors.push("Mandatory system field 'guestName' must be marked as required.");
    }
  }

  // 3. Unique IDs and option validation
  const idCounts = new Map<string, number>();
  for (const field of fields) {
    idCounts.set(field.id, (idCounts.get(field.id) || 0) + 1);

    if (!field.label || field.label.trim() === "") {
      errors.push(`Field '${field.id}' must have a non-empty label.`);
    }

    if (["select", "radio", "checkbox"].includes(field.type)) {
      if (!field.options || field.options.length === 0 || field.options.every((opt) => !opt.trim())) {
        errors.push(`Field '${field.label || field.id}' (${field.type}) must have at least one option.`);
      }
    }
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) {
      errors.push(`Duplicate field ID found: '${id}'. Field IDs must be unique.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Enforces that mandatory system fields (guestEmail & guestName) cannot be bypassed.
 * Re-injects or locks them if tampered with.
 */
export function enforceMandatoryEmailConstraint(fields: DynamicFormField[]): DynamicFormField[] {
  const updated = [...fields];

  const emailIndex = updated.findIndex((f) => f.id === "guestEmail");
  if (emailIndex === -1) {
    updated.unshift({ ...MANDATORY_SYSTEM_FIELDS[1] });
  } else {
    updated[emailIndex] = {
      ...updated[emailIndex],
      type: "email",
      required: true,
      isSystemLocked: true,
    };
  }

  const nameIndex = updated.findIndex((f) => f.id === "guestName");
  if (nameIndex === -1) {
    updated.unshift({ ...MANDATORY_SYSTEM_FIELDS[0] });
  } else {
    updated[nameIndex] = {
      ...updated[nameIndex],
      required: true,
      isSystemLocked: true,
    };
  }

  return updated;
}

/**
 * Generates custom dynamic fields from client order request strings.
 */
export function generateFieldsFromClientRequests(requestedList: string[]): DynamicFormField[] {
  const fields: DynamicFormField[] = [];

  for (const req of requestedList) {
    const lower = req.toLowerCase();
    if (lower.includes("phone") || lower.includes("whatsapp") || lower.includes("هاتف")) {
      fields.push({
        id: "guestPhone",
        label: "WhatsApp Phone Number / رقم الواتساب",
        placeholder: "010xxxxxxxx",
        type: "tel",
        required: true,
      });
    } else if (lower.includes("companion") || lower.includes("seat") || lower.includes("مرافقين") || lower.includes("عدد")) {
      fields.push({
        id: "companionsCount",
        label: "Number of Companions / عدد المرافقين",
        placeholder: "Select attendance count",
        type: "select",
        required: true,
        options: ["Just Me (1 Seat)", "+1 Companion (2 Seats)", "+2 Companions (3 Seats)", "+3 Companions (4 Seats)"],
      });
    } else if (lower.includes("side") || lower.includes("side of family") || lower.includes("طرف")) {
      fields.push({
        id: "attendingSide",
        label: "Attending Side / طرف الحضور",
        type: "radio",
        required: true,
        options: ["Bride's Guests / أهل العروس", "Groom's Guests / أهل العريس", "Special Delegate / ضيف شرف"],
      });
    } else if (lower.includes("diet") || lower.includes("meal") || lower.includes("طعام")) {
      fields.push({
        id: "dietaryPreferences",
        label: "Dietary Preferences / التفضيلات الغذائية",
        type: "checkbox",
        required: false,
        options: ["Standard Gourmet", "Vegetarian", "Gluten-Free", "Nut Allergy Warning"],
      });
    } else if (lower.includes("blessing") || lower.includes("note") || lower.includes("song") || lower.includes("تهنئة")) {
      fields.push({
        id: "guestBlessing",
        label: "Leave a Blessing or Song Request / كلمة للعروسين",
        placeholder: "Write your warm wishes here...",
        type: "textarea",
        required: false,
      });
    } else {
      const sanitizedId = "custom_" + req.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase().slice(0, 16);
      fields.push({
        id: sanitizedId,
        label: req,
        placeholder: `Enter ${req}...`,
        type: "text",
        required: false,
      });
    }
  }

  return fields;
}

export interface DynamicFormSchemaBuilderProps {
  fields: DynamicFormField[];
  onChange: (fields: DynamicFormField[]) => void;
  clientRequestedNote?: string;
  onApplyClientRequests?: () => void;
}

export const DynamicFormSchemaBuilder: React.FC<DynamicFormSchemaBuilderProps> = ({
  fields,
  onChange,
  clientRequestedNote,
  onApplyClientRequests,
}) => {
  const [newFieldType, setNewFieldType] = useState<FormFieldType>("text");
  const [newFieldLabel, setNewFieldLabel] = useState<string>("");
  const [newFieldRequired, setNewFieldRequired] = useState<boolean>(false);
  const [newFieldOptions, setNewFieldOptions] = useState<string>("");

  const validation = validateFormSchema(fields);

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;

    const baseId = newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
    const uniqueId = `${baseId}_${Date.now().toString().slice(-4)}`;

    const options = ["select", "radio", "checkbox"].includes(newFieldType)
      ? newFieldOptions.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

    const newField: DynamicFormField = {
      id: uniqueId,
      label: newFieldLabel.trim(),
      placeholder: `Enter ${newFieldLabel.trim()}...`,
      type: newFieldType,
      required: newFieldRequired,
      options: options && options.length > 0 ? options : (["select", "radio", "checkbox"].includes(newFieldType) ? ["Option 1", "Option 2"] : undefined),
    };

    const updated = enforceMandatoryEmailConstraint([...fields, newField]);
    onChange(updated);

    // Reset inputs
    setNewFieldLabel("");
    setNewFieldOptions("");
    setNewFieldRequired(false);
  };

  const handleRemoveField = (fieldId: string) => {
    // Prohibit removal of system locked fields
    const target = fields.find((f) => f.id === fieldId);
    if (target?.isSystemLocked || target?.id === "guestEmail" || target?.id === "guestName") {
      return;
    }
    const filtered = fields.filter((f) => f.id !== fieldId);
    onChange(enforceMandatoryEmailConstraint(filtered));
  };

  const handleToggleRequired = (fieldId: string) => {
    // Prohibit changing required flag on locked fields
    const target = fields.find((f) => f.id === fieldId);
    if (target?.isSystemLocked || target?.id === "guestEmail" || target?.id === "guestName") {
      return;
    }
    const updated = fields.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f));
    onChange(enforceMandatoryEmailConstraint(updated));
  };

  const handleUpdateFieldLabel = (fieldId: string, label: string) => {
    const updated = fields.map((f) => (f.id === fieldId ? { ...f, label } : f));
    onChange(updated);
  };

  const handleUpdateFieldOptions = (fieldId: string, optionsCsv: string) => {
    const options = optionsCsv.split(",").map((o) => o.trim()).filter(Boolean);
    const updated = fields.map((f) => (f.id === fieldId ? { ...f, options } : f));
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const targetA = fields[index];
    const targetB = fields[newIndex];

    // Don't move locked fields above/below their anchor if they are system locked
    const next = [...fields];
    next[index] = targetB;
    next[newIndex] = targetA;
    onChange(enforceMandatoryEmailConstraint(next));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header Info */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--athar-text-title, #231F20)" }}>
            Dynamic RSVP Form Schema Builder
          </h3>
          <span
            style={{
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 700,
              background: "rgba(212, 175, 55, 0.15)",
              color: "#9A7B1C",
              border: "1px solid rgba(212, 175, 55, 0.4)",
            }}
          >
            🔒 Mandatory Email Delivery Active
          </span>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted, #7A6F6D)" }}>
          Configure the exact fields guests fill out when RSVPing. The guest email is permanently locked and required
          so the automated EmailJS engine can dispatch their QR Entry Pass.
        </p>
      </div>

      {/* Client's Requested Fields Note Banner */}
      {clientRequestedNote && (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(107, 29, 40, 0.05) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.35)",
            borderRadius: "14px",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#6B1D28", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📥 Client Requested Form Fields
            </div>
            <div style={{ fontSize: "0.88rem", color: "#231F20", marginTop: "0.25rem", fontStyle: "italic" }}>
              &ldquo;{clientRequestedNote}&rdquo;
            </div>
          </div>
          {onApplyClientRequests && (
            <button
              type="button"
              onClick={onApplyClientRequests}
              style={{
                background: "#6B1D28",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "0.45rem 0.9rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(107, 29, 40, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              ⚡ Auto-Generate From Request
            </button>
          )}
        </div>
      )}

      {/* Validation Warnings */}
      {!validation.isValid && (
        <div
          style={{
            background: "rgba(155, 44, 44, 0.08)",
            border: "1px solid rgba(155, 44, 44, 0.3)",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            color: "#9B2C2C",
            fontSize: "0.82rem",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>⚠️ Form Schema Validation Notice:</div>
          <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
            {validation.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Fields List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {fields.map((field, index) => {
          const isEmailLocked = field.id === "guestEmail";
          const isNameLocked = field.id === "guestName";
          const isLocked = isEmailLocked || isNameLocked || field.isSystemLocked;

          return (
            <div
              key={field.id}
              style={{
                background: isLocked ? "rgba(251, 247, 242, 0.9)" : "#FFFFFF",
                border: isLocked ? "1.5px solid rgba(212, 175, 55, 0.5)" : "1px solid rgba(107, 29, 40, 0.12)",
                borderRadius: "12px",
                padding: "0.9rem 1.1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: isLocked ? "#9A7B1C" : "#7A6F6D",
                      fontFamily: "monospace",
                    }}
                  >
                    #{index + 1}
                  </span>

                  <span
                    style={{
                      padding: "0.15rem 0.5rem",
                      borderRadius: "6px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: isLocked ? "rgba(212, 175, 55, 0.18)" : "rgba(107, 29, 40, 0.08)",
                      color: isLocked ? "#7A5F12" : "#6B1D28",
                    }}
                  >
                    {field.type}
                  </span>

                  {isLocked && (
                    <span
                      style={{
                        padding: "0.15rem 0.55rem",
                        borderRadius: "999px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: "#6B1D28",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                      title="This field is permanently required by the ASAR platform"
                    >
                      🔒 System Locked & Required
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {/* Move Up / Down */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    style={{
                      background: "none",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "6px",
                      padding: "0.2rem 0.45rem",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      opacity: index === 0 ? 0.3 : 1,
                      fontSize: "0.75rem",
                    }}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === fields.length - 1}
                    style={{
                      background: "none",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "6px",
                      padding: "0.2rem 0.45rem",
                      cursor: index === fields.length - 1 ? "not-allowed" : "pointer",
                      opacity: index === fields.length - 1 ? 0.3 : 1,
                      fontSize: "0.75rem",
                    }}
                    title="Move Down"
                  >
                    ▼
                  </button>

                  {/* Required Toggle */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: isLocked ? "#9A7B1C" : "#231F20",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      marginLeft: "0.5rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={field.required}
                      disabled={isLocked}
                      onChange={() => handleToggleRequired(field.id)}
                      style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                    />
                    Required
                  </label>

                  {/* Delete Button */}
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(field.id)}
                      style={{
                        background: "rgba(155, 44, 44, 0.08)",
                        border: "1px solid rgba(155, 44, 44, 0.2)",
                        color: "#9B2C2C",
                        borderRadius: "6px",
                        padding: "0.2rem 0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        marginLeft: "0.4rem",
                      }}
                      title="Delete Field"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>

              {/* Editable Label & Placeholder */}
              <div style={{ display: "grid", gridTemplateColumns: isLocked ? "1fr" : "1.5fr 1fr", gap: "0.6rem" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "#7A6F6D", fontWeight: 600 }}>Field Label</label>
                  <input
                    type="text"
                    value={field.label}
                    readOnly={isLocked}
                    onChange={(e) => handleUpdateFieldLabel(field.id, e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.85rem",
                      backgroundColor: isLocked ? "#FBF7F2" : "#FFFFFF",
                      color: "#231F20",
                      outline: "none",
                    }}
                  />
                </div>

                {!isLocked && (
                  <div>
                    <label style={{ fontSize: "0.72rem", color: "#7A6F6D", fontWeight: 600 }}>Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updated = fields.map((f) => (f.id === field.id ? { ...f, placeholder: val } : f));
                        onChange(updated);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.4rem 0.6rem",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.12)",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Options config for select, radio, checkbox */}
              {["select", "radio", "checkbox"].includes(field.type) && (
                <div style={{ marginTop: "0.2rem" }}>
                  <label style={{ fontSize: "0.72rem", color: "#7A6F6D", fontWeight: 600 }}>
                    Options (comma-separated list)
                  </label>
                  <input
                    type="text"
                    value={(field.options || []).join(", ")}
                    onChange={(e) => handleUpdateFieldOptions(field.id, e.target.value)}
                    placeholder="e.g. Option A, Option B, Option C"
                    style={{
                      width: "100%",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                  {(!field.options || field.options.length === 0) && (
                    <span style={{ fontSize: "0.72rem", color: "#9B2C2C", fontWeight: 600 }}>
                      ⚠️ At least one option is required.
                    </span>
                  )}
                </div>
              )}

              {/* Locked Field Explanation */}
              {isEmailLocked && (
                <div style={{ fontSize: "0.75rem", color: "#9A7B1C", fontWeight: 500, fontStyle: "italic" }}>
                  ✦ Notice: The guest email is permanently bound to the RSVP QR Pass EmailJS dispatch workflow.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Custom Field Form */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          border: "1.5px dashed rgba(107, 29, 40, 0.25)",
          borderRadius: "14px",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
        }}
      >
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#6B1D28" }}>
          + Add Custom RSVP Field
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Field Type</label>
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value as FormFieldType)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                background: "#FFFFFF",
                outline: "none",
              }}
            >
              <option value="text">Short Text (e.g. Table Name, Org)</option>
              <option value="tel">Phone / WhatsApp Number</option>
              <option value="number">Numeric (e.g. Total Guests)</option>
              <option value="select">Dropdown Menu (e.g. Companions)</option>
              <option value="radio">Radio Buttons (Single Choice)</option>
              <option value="checkbox">Checkboxes (Multi-Choice)</option>
              <option value="textarea">Long Textarea (Blessing, Wishes)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Field Label</label>
            <input
              type="text"
              placeholder="e.g. Dietary Restrictions or WhatsApp Number"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {["select", "radio", "checkbox"].includes(newFieldType) && (
          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>
              Choices / Options (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Just Me, +1 Companion, +2 Companions"
              value={newFieldOptions}
              onChange={(e) => setNewFieldOptions(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.25rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", fontWeight: 600, color: "#231F20", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
            />
            Mark as Mandatory for Guests
          </label>

          <button
            type="button"
            onClick={handleAddField}
            disabled={!newFieldLabel.trim()}
            style={{
              background: newFieldLabel.trim() ? "#6B1D28" : "rgba(107, 29, 40, 0.4)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1.1rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: newFieldLabel.trim() ? "pointer" : "not-allowed",
              boxShadow: newFieldLabel.trim() ? "0 2px 8px rgba(107, 29, 40, 0.25)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            + Append Field
          </button>
        </div>
      </div>
    </div>
  );
};
