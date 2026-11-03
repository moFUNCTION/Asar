import React, { useState, useId } from "react";
import type { DynamicFormField, InvitationDocument, InvitationRsvpDocument } from "./types";

export interface DynamicRsvpFormProps {
  invitation: InvitationDocument;
  schema?: DynamicFormField[];
  onSuccess?: (rsvp: InvitationRsvpDocument) => void;
  onPreviewPass?: (rsvpId: string) => void;
  isNoir?: boolean;
}

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

export function generatePassToken(prefix = "INV-PASS"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timeHex = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${randomPart}-${timeHex}`;
}

export function validateRsvpForm(
  values: Record<string, unknown>,
  schema?: DynamicFormField[]
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // 1. Mandatory guestName check
  const guestName = typeof values.guestName === "string" ? values.guestName.trim() : "";
  if (!guestName) {
    errors.guestName = "يرجى إدخال الاسم بالكامل / Full Name is required";
  }

  // 2. Mandatory guestEmail check (locked required)
  const guestEmail = typeof values.guestEmail === "string" ? values.guestEmail.trim() : "";
  if (!guestEmail) {
    errors.guestEmail = "البريد الإلكتروني مطلوب لاستلام كود الدخول QR / Email is required";
  } else if (!isValidEmail(guestEmail)) {
    errors.guestEmail = "يرجى إدخال بريد إلكتروني صالح / Please enter a valid email address";
  }

  // 3. Companions count bounds
  if (values.companionsCount !== undefined && values.companionsCount !== null && values.companionsCount !== "") {
    const num = Number(values.companionsCount);
    if (isNaN(num) || num < 0) {
      errors.companionsCount = "عدد المرافقين لا يمكن أن يكون سالباً / Companions must be 0 or more";
    }
  }

  // 4. Validate dynamic fields from schema
  if (schema && Array.isArray(schema)) {
    for (const field of schema) {
      if (field.name === "guestName" || field.name === "guestEmail") {
        continue;
      }
      if (field.required) {
        const val = values[field.name];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[field.name] = `حقل "${field.label}" مطلوب / This field is required`;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export const DEFAULT_DYNAMIC_SCHEMA: DynamicFormField[] = [
  {
    id: "f-name",
    name: "guestName",
    label: "الاسم بالكامل · Full Name",
    type: "text",
    placeholder: "مثال: د. كريم الألفي",
    required: true,
    isLocked: true,
  },
  {
    id: "f-email",
    name: "guestEmail",
    label: "البريد الإلكتروني · Email Address (مطلوب لإرسال بطاقة QR)",
    type: "email",
    placeholder: "your.name@example.com",
    required: true,
    isLocked: true,
    helperText:
      "سيتم إرسال بطاقة الدعوة الخاصة بك (QR Code) أو حالة تأكيد الحضور إلى هذا البريد الإلكتروني.",
  },
  {
    id: "f-phone",
    name: "guestPhone",
    label: "رقم الهاتف / واتساب · WhatsApp Number",
    type: "tel",
    placeholder: "010xxxxxxxx",
    required: false,
  },
  {
    id: "f-companions",
    name: "companionsCount",
    label: "عدد المرافقين الإضافيين · Additional Companions",
    type: "select",
    required: false,
    options: ["بدون مرافقين (شخص واحد فقط)", "+1 مرافق (شخصان)", "+2 مرافقين (3 أشخاص)"],
    defaultValue: "0",
  },
  {
    id: "f-dietary",
    name: "dietaryNotes",
    label: "الملاحظات الغذائية أو الصحية · Dietary Preferences",
    type: "text",
    placeholder: "نباتي / حساسية معينة / بدون ملاحظات",
    required: false,
  },
  {
    id: "f-message",
    name: "blessingMessage",
    label: "رسالة تهنئة أو كلمة للذكرى · Memory & Wishes",
    type: "textarea",
    placeholder: "اكتب رسالة دافئة لصاحب الدعوة لتبقى في سجل الذكريات...",
    required: false,
  },
];

export const DynamicRsvpForm: React.FC<DynamicRsvpFormProps> = ({
  invitation,
  schema,
  onSuccess,
  onPreviewPass,
  isNoir = false,
}) => {
  const formIdPrefix = useId();

  // Combine schema from props, invitation, or defaults
  const activeSchema: DynamicFormField[] = React.useMemo(() => {
    if (schema && schema.length > 0) return schema;
    if (invitation.formSchemaJson) {
      if (typeof invitation.formSchemaJson === "string") {
        try {
          const parsed = JSON.parse(invitation.formSchemaJson);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // fallback
        }
      } else if (Array.isArray(invitation.formSchemaJson)) {
        return invitation.formSchemaJson;
      }
    }
    return DEFAULT_DYNAMIC_SCHEMA;
  }, [schema, invitation.formSchemaJson]);

  // Form State
  const [formValues, setFormValues] = useState<Record<string, unknown>>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    companionsCount: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRsvp, setSubmittedRsvp] = useState<InvitationRsvpDocument | null>(null);

  const handleInputChange = (name: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRsvpForm(formValues, activeSchema);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build dynamic responses map for non-standard fields
      const dynamicResponses: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(formValues)) {
        if (!["guestName", "guestEmail", "guestPhone", "companionsCount"].includes(key)) {
          dynamicResponses[key] = val;
        }
      }

      // Parse companions count
      let companions = 0;
      const rawCompanions = formValues.companionsCount;
      if (typeof rawCompanions === "string") {
        if (rawCompanions.includes("+1")) companions = 1;
        else if (rawCompanions.includes("+2")) companions = 2;
        else {
          const parsedNum = parseInt(rawCompanions, 10);
          if (!isNaN(parsedNum) && parsedNum >= 0) companions = parsedNum;
        }
      } else if (typeof rawCompanions === "number") {
        companions = Math.max(0, rawCompanions);
      }

      const passToken = generatePassToken();
      const rsvpId = `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const rsvpDoc: InvitationRsvpDocument = {
        $id: rsvpId,
        id: rsvpId,
        invitationId: invitation.$id || invitation.id || invitation.slug,
        clientId: invitation.clientId || "client-demo-1",
        guestName: String(formValues.guestName).trim(),
        guestEmail: String(formValues.guestEmail).trim().toLowerCase(),
        guestPhone: formValues.guestPhone ? String(formValues.guestPhone).trim() : undefined,
        companionsCount: companions,
        dynamicResponsesJson: JSON.stringify(dynamicResponses),
        status: "pending",
        passToken,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
          `http://localhost:3003?pass=${rsvpId}&token=${passToken}`
        )}`,
        emailSent: false,
        isCheckedInAtVenue: false,
        respondedAt: new Date().toISOString(),
      };

      // 1. Save to localStorage cache so Client Mailbox in apps/Main sees it immediately
      try {
        const cacheKey = "asar_invitation_rsvps_cache";
        const existing = localStorage.getItem(cacheKey);
        const list: InvitationRsvpDocument[] = existing ? JSON.parse(existing) : [];
        list.unshift(rsvpDoc);
        localStorage.setItem(cacheKey, JSON.stringify(list));
      } catch {
        // Ignore localStorage error if restricted
      }

      setSubmittedRsvp(rsvpDoc);
      onSuccess?.(rsvpDoc);
    } catch (err) {
      console.error("RSVP submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp-section"
      className="dynamic-rsvp-section"
      style={{
        padding: "4rem 1.5rem",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "0.82rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: isNoir ? "var(--athar-gold-bright)" : "var(--athar-maroon)",
            marginBottom: "0.5rem",
          }}
        >
          ✦ تأكيد الحضور الإلكتروني · DYNAMIC RSVP
        </span>
        <h2
          className="font-arabic-display"
          style={{
            fontSize: "clamp(1.8rem, 3.8vw, 2.6rem)",
            color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          تأكيد حضوركم يُسعدنا ويشرفنا
        </h2>
        <p
          style={{
            fontSize: "0.96rem",
            color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
          }}
        >
          يرجى استيفاء البيانات أدناه لتسجيل طلب الحضور وتسليم بطاقة الدخول الرقمية (QR Code)
        </p>
      </div>

      {submittedRsvp ? (
        /* Confirmation Card */
        <div
          className="luxury-card"
          style={{
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.95)"
              : "rgba(255, 255, 255, 0.96)",
            border: "2px solid var(--athar-gold)",
            borderRadius: "28px",
            padding: "3rem 2.25rem",
            textAlign: "center",
            boxShadow: "var(--athar-shadow-elevated)",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "var(--athar-status-success-bg)",
              border: "2px solid var(--athar-status-success)",
              color: "var(--athar-status-success)",
              fontSize: "2.4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            ✓
          </div>

          <h3
            className="font-arabic-display"
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              marginBottom: "0.75rem",
            }}
          >
            تم إرسال بياناتك بنجاح إلى صاحب الدعوة!
          </h3>

          <p
            style={{
              fontSize: "1rem",
              color: isNoir ? "#C2C2CF" : "var(--athar-text-body)",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: "0 auto 1.75rem",
            }}
          >
            شكراً لك عزيزنا <strong>{submittedRsvp.guestName}</strong>. تم تحويل طلبك مباشرة إلى
            صندوق الوارد الخاص بصاحب المناسبة. بمجرد اعتماد الحضور، ستصلك رسالة آلية عبر البريد
            الإلكتروني (<strong>{submittedRsvp.guestEmail}</strong>) تتضمن بطاقة الدخول الرقمية
            الخاصة بك (QR Pass).
          </p>

          <div
            style={{
              backgroundColor: isNoir
                ? "rgba(255, 255, 255, 0.05)"
                : "var(--athar-bg-secondary)",
              padding: "1rem 1.25rem",
              borderRadius: "16px",
              border: "1px dashed var(--athar-gold-border)",
              display: "inline-block",
              marginBottom: "2rem",
              fontSize: "0.9rem",
              color: isNoir ? "#E5C158" : "var(--athar-maroon)",
            }}
          >
            رمز التذكرة المرجعي: <strong>{submittedRsvp.passToken}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => onPreviewPass?.(submittedRsvp.$id || submittedRsvp.id || "demo")}
              className="btn-athar-primary"
            >
              <span>معاينة بطاقة الدخول والـ QR</span>
              <span>🎫</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmittedRsvp(null);
                setFormValues({ guestName: "", guestEmail: "", guestPhone: "", companionsCount: 0 });
              }}
              className="btn-athar-secondary"
            >
              <span>تسجيل رد آخر</span>
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <form
          onSubmit={handleSubmit}
          className="luxury-card"
          noValidate
          style={{
            backgroundColor: isNoir
              ? "rgba(35, 26, 30, 0.9)"
              : "rgba(255, 255, 255, 0.95)",
            border: "1.5px solid var(--athar-gold-border)",
            borderRadius: "28px",
            padding: "2.75rem 2.25rem",
            boxShadow: "var(--athar-shadow-elevated)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {activeSchema.map((field) => {
              const fieldId = `${formIdPrefix}-${field.name}`;
              const error = formErrors[field.name];
              const value = formValues[field.name];

              return (
                <div key={field.id || field.name} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label
                    htmlFor={fieldId}
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 700,
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <span>{field.label}</span>
                    {field.required && (
                      <span style={{ color: "var(--athar-status-danger)", fontWeight: 800 }}>*</span>
                    )}
                    {field.isLocked && (
                      <span
                        title="حقل نظام إلزامي ومقفل"
                        style={{
                          fontSize: "0.75rem",
                          backgroundColor: "rgba(107, 29, 40, 0.08)",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "4px",
                          color: "var(--athar-maroon)",
                        }}
                      >
                        إلزامي 🔒
                      </span>
                    )}
                  </label>

                  {/* Render based on field type */}
                  {field.type === "textarea" ? (
                    <textarea
                      id={fieldId}
                      name={field.name}
                      rows={3}
                      value={typeof value === "string" ? value : ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="athar-input"
                      style={{
                        resize: "vertical",
                        borderColor: error ? "var(--athar-status-danger)" : undefined,
                      }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={fieldId}
                      name={field.name}
                      value={typeof value === "string" || typeof value === "number" ? value : ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="athar-input"
                      style={{
                        borderColor: error ? "var(--athar-status-danger)" : undefined,
                      }}
                    >
                      {field.options?.map((opt, optIdx) => (
                        <option key={optIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={fieldId}
                      name={field.name}
                      type={field.type}
                      value={typeof value === "string" || typeof value === "number" ? value : ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="athar-input"
                      style={{
                        borderColor: error ? "var(--athar-status-danger)" : undefined,
                      }}
                    />
                  )}

                  {/* Helper Text */}
                  {field.helperText && (
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: isNoir ? "#E5C158" : "var(--athar-maroon)",
                        marginTop: "0.2rem",
                        lineHeight: 1.4,
                      }}
                    >
                      💡 {field.helperText}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--athar-status-danger)",
                        fontWeight: 600,
                        marginTop: "0.2rem",
                      }}
                    >
                      ⚠ {error}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Submit Button */}
            <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-athar-primary"
                style={{
                  width: "100%",
                  padding: "1rem",
                  fontSize: "1.05rem",
                  opacity: isSubmitting ? 0.75 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? (
                  <span>جاري إرسال رد الحضور...</span>
                ) : (
                  <>
                    <span>إرسال تأكيد الحضور إلى المنظم</span>
                    <span>✉️</span>
                  </>
                )}
              </button>

              <div
                style={{
                  fontSize: "0.78rem",
                  color: isNoir ? "#A8A8B7" : "var(--athar-text-muted)",
                  marginTop: "0.75rem",
                }}
              >
                🔒 بياناتك محمية ومشفرة وتصل مباشرة إلى صاحب الدعوة.
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export const DynamicRsvpFormBlock = DynamicRsvpForm;
export default DynamicRsvpForm;
