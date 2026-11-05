// =============================================================
// ASAR (Athar / أثر) — Dynamic Schema-Driven RSVP Form
// Enforcing locked required guestEmail + dynamic schema fields
// =============================================================

import React, { useState, useId } from "react";
import {
  FiSend,
  FiUser,
  FiMail,
  FiPhone,
  FiUsers,
  FiCheckCircle,
  FiAlertCircle,
  FiKey,
} from "react-icons/fi";
import type {
  DynamicFormFieldConfig,
  GeneratedVipPass,
  InvitationStorefrontData,
} from "./types";
import { DEFAULT_RSVP_FORM_SCHEMA } from "./presets";

export interface InvitationDynamicRsvpFormProps {
  invitation: InvitationStorefrontData;
  schema?: DynamicFormFieldConfig[];
  onSuccess?: (pass: GeneratedVipPass) => void;
  onPreviewPass?: () => void;
  isNoir?: boolean;
}

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

export function generateVipPassToken(prefix = "INV-PASS"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timeHex = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${randomPart}-${timeHex}`;
}

export const InvitationDynamicRsvpForm: React.FC<
  InvitationDynamicRsvpFormProps
> = ({
  invitation,
  schema,
  onSuccess,
  onPreviewPass,
  isNoir = false,
}) => {
  const formIdPrefix = useId();

  // Combine schema from props, invitation, or defaults
  const activeSchema: DynamicFormFieldConfig[] = React.useMemo(() => {
    if (schema && schema.length > 0) return schema;
    if (invitation.formSchemaJson) {
      if (typeof invitation.formSchemaJson === "string") {
        try {
          const parsed = JSON.parse(invitation.formSchemaJson);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {
          // Fallback
        }
      } else if (Array.isArray(invitation.formSchemaJson)) {
        return invitation.formSchemaJson;
      }
    }
    return DEFAULT_RSVP_FORM_SCHEMA;
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
  const [submittedPass, setSubmittedPass] = useState<GeneratedVipPass | null>(
    null
  );

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

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Enforce Mandatory guestName
    const nameVal =
      typeof formValues.guestName === "string"
        ? formValues.guestName.trim()
        : "";
    if (!nameVal) {
      errors.guestName = "يرجى إدخال الاسم الكريم بالكامل / Full Name is required";
    }

    // 2. Enforce Mandatory Locked guestEmail
    const emailVal =
      typeof formValues.guestEmail === "string"
        ? formValues.guestEmail.trim()
        : "";
    if (!emailVal) {
      errors.guestEmail =
        "البريد الإلكتروني إلزامي لاستلام بطاقة وتصريح الدخول الرسمي QR / Email is required";
    } else if (!isValidEmail(emailVal)) {
      errors.guestEmail =
        "يرجى إدخال بريد إلكتروني صالح (name@example.com) / Invalid email";
    }

    // 3. Dynamic schema fields validation
    activeSchema.forEach((field) => {
      if (field.name === "guestName" || field.name === "guestEmail") return;
      if (field.required) {
        const val = formValues[field.name];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[field.name] = `حقل "${field.label}" مطلوب للمتابعة`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Build dynamic responses map for non-standard fields
      const dynamicResponses: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(formValues)) {
        if (
          !["guestName", "guestEmail", "guestPhone", "companionsCount"].includes(
            key
          )
        ) {
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
          const parsed = parseInt(rawCompanions, 10);
          if (!isNaN(parsed) && parsed >= 0) companions = parsed;
        }
      } else if (typeof rawCompanions === "number") {
        companions = Math.max(0, rawCompanions);
      }

      const passToken = generateVipPassToken();
      const rsvpId = `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const vipPass: GeneratedVipPass = {
        $id: rsvpId,
        id: rsvpId,
        invitationId: invitation.$id || invitation.id || invitation.slug,
        clientId: invitation.clientId || "client-demo-1",
        guestName: String(formValues.guestName).trim(),
        guestEmail: String(formValues.guestEmail).trim().toLowerCase(),
        guestPhone: formValues.guestPhone
          ? String(formValues.guestPhone).trim()
          : undefined,
        companionsCount: companions,
        dynamicResponsesJson: JSON.stringify(dynamicResponses),
        status: "approved",
        passToken,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
          `http://localhost:3004/pass/${rsvpId}?token=${passToken}`
        )}`,
        emailSent: true,
        isCheckedInAtVenue: false,
        respondedAt: new Date().toISOString(),
      };

      // Save to localStorage cache so Client Mailbox sees it immediately
      try {
        const cacheKey = "asar_invitation_rsvps_cache";
        const existing = localStorage.getItem(cacheKey);
        const list: GeneratedVipPass[] = existing ? JSON.parse(existing) : [];
        list.unshift(vipPass);
        localStorage.setItem(cacheKey, JSON.stringify(list));
      } catch {
        // Ignore restricted storage
      }

      setSubmittedPass(vipPass);
      onSuccess?.(vipPass);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp-section"
      style={{
        padding: "4rem 1.5rem 5rem 1.5rem",
        maxWidth: "860px",
        margin: "0 auto",
      }}
    >
      <div
        className="glass-panel"
        style={{
          borderRadius: "32px",
          padding: "clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)",
          backgroundColor: isNoir
            ? "rgba(35, 26, 30, 0.94)"
            : "rgba(255, 255, 255, 0.96)",
          border: isNoir
            ? "1.5px solid rgba(212, 175, 55, 0.4)"
            : "1.5px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "var(--athar-shadow-elevated)",
          position: "relative",
        }}
      >
        {/* Header Ribbon */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
            borderBottom: isNoir
              ? "1px solid rgba(212, 175, 55, 0.2)"
              : "1px solid rgba(107, 29, 40, 0.1)",
            paddingBottom: "1.5rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                color: isNoir ? "#D4AF37" : "var(--athar-maroon)",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.15em",
                marginBottom: "0.4rem",
              }}
            >
              <FiCheckCircle />
              <span>DYNAMIC RSVP & VIP PASS</span>
            </div>

            <h2
              className="font-arabic-display"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                color: isNoir ? "#FFFFFF" : "var(--athar-maroon)",
                fontWeight: 700,
                marginBottom: "0.4rem",
              }}
            >
              تأكيد الحضور واستخراج بطاقة الدخول
            </h2>

            <p
              style={{
                fontSize: "0.95rem",
                color: isNoir ? "#C2C2CF" : "var(--athar-text-muted)",
              }}
            >
              سعة الحضور المعتمدة: {invitation.maxCapacity || 250} مدعو · سيتم
              إصدار تصريح رسمي فوري
            </p>
          </div>

          {onPreviewPass && (
            <button
              type="button"
              onClick={onPreviewPass}
              className="btn-athar-secondary"
              style={{
                fontSize: "0.88rem",
                backgroundColor: isNoir
                  ? "rgba(255, 255, 255, 0.08)"
                  : "#ffffff",
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              }}
            >
              <FiKey />
              <span>معاينة نموذج تصريح VIP Pass</span>
            </button>
          )}
        </div>

        {/* Success Confirmation Banner if already submitted */}
        {submittedPass && (
          <div
            style={{
              backgroundColor: isNoir
                ? "rgba(22, 101, 52, 0.2)"
                : "rgba(240, 253, 244, 0.9)",
              border: "1.5px solid #16A34A",
              borderRadius: "18px",
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#16A34A",
                fontWeight: 700,
                fontSize: "1.1rem",
                marginBottom: "0.4rem",
              }}
            >
              <FiCheckCircle />
              <span>تم تأكيد حضوركم الكريم بنجاح!</span>
            </div>
            <p
              style={{
                fontSize: "0.95rem",
                color: isNoir ? "#E2E8F0" : "#1F2937",
                marginBottom: "0.8rem",
              }}
            >
              رمز تصريح الدخول الخاص بكم:{" "}
              <strong style={{ fontFamily: "monospace" }}>
                {submittedPass.passToken}
              </strong>
            </p>
            <button
              onClick={() => onSuccess?.(submittedPass)}
              className="btn-athar-primary"
              style={{ fontSize: "0.9rem" }}
            >
              <FiKey />
              <span>عرض بطاقة وتصريح الـ QR للضيف</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Field 1: Full Name (Mandatory) */}
            <div>
              <label
                htmlFor={`${formIdPrefix}-name`}
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                  marginBottom: "0.5rem",
                }}
              >
                الاسم الكريم بالكامل · Full Name *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id={`${formIdPrefix}-name`}
                  type="text"
                  value={String(formValues.guestName || "")}
                  onChange={(e) =>
                    handleInputChange("guestName", e.target.value)
                  }
                  placeholder="مثال: د. كريم الألفي"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.6rem",
                    borderRadius: "14px",
                    border: formErrors.guestName
                      ? "2px solid #DC2626"
                      : isNoir
                        ? "1.5px solid rgba(212, 175, 55, 0.3)"
                        : "1.5px solid rgba(107, 29, 40, 0.16)",
                    backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
                <FiUser
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--athar-gold)",
                  }}
                />
              </div>
              {formErrors.guestName && (
                <div
                  style={{
                    color: "#DC2626",
                    fontSize: "0.82rem",
                    marginTop: "0.3rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FiAlertCircle />
                  <span>{formErrors.guestName}</span>
                </div>
              )}
            </div>

            {/* Field 2: Locked Email (Mandatory) */}
            <div>
              <label
                htmlFor={`${formIdPrefix}-email`}
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                  marginBottom: "0.5rem",
                }}
              >
                البريد الإلكتروني المعتمد · Email Address *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id={`${formIdPrefix}-email`}
                  type="email"
                  dir="ltr"
                  value={String(formValues.guestEmail || "")}
                  onChange={(e) =>
                    handleInputChange("guestEmail", e.target.value)
                  }
                  placeholder="your.name@example.com"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.6rem",
                    borderRadius: "14px",
                    border: formErrors.guestEmail
                      ? "2px solid #DC2626"
                      : isNoir
                        ? "1.5px solid rgba(212, 175, 55, 0.3)"
                        : "1.5px solid rgba(107, 29, 40, 0.16)",
                    backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
                <FiMail
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--athar-gold)",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: isNoir ? "#A09895" : "var(--athar-text-muted)",
                  marginTop: "0.35rem",
                }}
              >
                إلزامي: سيتم إرسال بطاقة الـ QR وتصريح البوابة الرسمية لهذا البريد.
              </p>
              {formErrors.guestEmail && (
                <div
                  style={{
                    color: "#DC2626",
                    fontSize: "0.82rem",
                    marginTop: "0.3rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FiAlertCircle />
                  <span>{formErrors.guestEmail}</span>
                </div>
              )}
            </div>

            {/* Field 3: WhatsApp Phone */}
            <div>
              <label
                htmlFor={`${formIdPrefix}-phone`}
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                  marginBottom: "0.5rem",
                }}
              >
                رقم الواتساب للتذكير · WhatsApp Number
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id={`${formIdPrefix}-phone`}
                  type="tel"
                  dir="ltr"
                  value={String(formValues.guestPhone || "")}
                  onChange={(e) =>
                    handleInputChange("guestPhone", e.target.value)
                  }
                  placeholder="+20 100 000 0000"
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.6rem",
                    borderRadius: "14px",
                    border: isNoir
                      ? "1.5px solid rgba(212, 175, 55, 0.3)"
                      : "1.5px solid rgba(107, 29, 40, 0.16)",
                    backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
                <FiPhone
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--athar-gold)",
                  }}
                />
              </div>
            </div>

            {/* Field 4: Companions Count */}
            <div>
              <label
                htmlFor={`${formIdPrefix}-companions`}
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                  marginBottom: "0.5rem",
                }}
              >
                عدد المرافقين الإضافيين بصحبتكم · Companions
              </label>
              <div style={{ position: "relative" }}>
                <select
                  id={`${formIdPrefix}-companions`}
                  value={String(formValues.companionsCount || "0")}
                  onChange={(e) =>
                    handleInputChange("companionsCount", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem 0.85rem 2.6rem",
                    borderRadius: "14px",
                    border: isNoir
                      ? "1.5px solid rgba(212, 175, 55, 0.3)"
                      : "1.5px solid rgba(107, 29, 40, 0.16)",
                    backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    fontSize: "0.95rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="0">بدون مرافقين (شخص واحد فقط)</option>
                  <option value="1">+1 مرافق (شخصان في البطاقة)</option>
                  <option value="2">+2 مرافقين (3 أشخاص في البطاقة)</option>
                  <option value="3">+3 مرافقين (4 أشخاص في البطاقة)</option>
                </select>
                <FiUsers
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--athar-gold)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Extra Schema Fields (Dietary notes, Blessing message, etc.) */}
          {activeSchema
            .filter(
              (f) =>
                ![
                  "guestName",
                  "guestEmail",
                  "guestPhone",
                  "companionsCount",
                ].includes(f.name)
            )
            .map((field) => (
              <div key={field.id} style={{ marginBottom: "1.4rem" }}>
                <label
                  htmlFor={`${formIdPrefix}-${field.name}`}
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                    marginBottom: "0.45rem",
                  }}
                >
                  {field.label} {field.required ? "*" : ""}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    id={`${formIdPrefix}-${field.name}`}
                    rows={3}
                    value={String(formValues[field.name] || "")}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={field.placeholder || "أدخل التفاصيل..."}
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "14px",
                      border: isNoir
                        ? "1.5px solid rgba(212, 175, 55, 0.3)"
                        : "1.5px solid rgba(107, 29, 40, 0.16)",
                      backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "vertical",
                      lineHeight: 1.6,
                    }}
                  />
                ) : field.type === "select" && field.options ? (
                  <select
                    id={`${formIdPrefix}-${field.name}`}
                    value={String(formValues[field.name] || "")}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "14px",
                      border: isNoir
                        ? "1.5px solid rgba(212, 175, 55, 0.3)"
                        : "1.5px solid rgba(107, 29, 40, 0.16)",
                      backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  >
                    <option value="">اختر من القائمة...</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`${formIdPrefix}-${field.name}`}
                    type={field.type === "number" ? "number" : "text"}
                    value={String(formValues[field.name] || "")}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={field.placeholder || ""}
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "14px",
                      border: isNoir
                        ? "1.5px solid rgba(212, 175, 55, 0.3)"
                        : "1.5px solid rgba(107, 29, 40, 0.16)",
                      backgroundColor: isNoir ? "#1F1A1C" : "#ffffff",
                      color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                )}

                {formErrors[field.name] && (
                  <div
                    style={{
                      color: "#DC2626",
                      fontSize: "0.82rem",
                      marginTop: "0.3rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <FiAlertCircle />
                    <span>{formErrors[field.name]}</span>
                  </div>
                )}
              </div>
            ))}

          {/* Submit Action */}
          <div style={{ marginTop: "2rem" }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-athar-primary"
              style={{
                width: "100%",
                padding: "1.1rem 2rem",
                fontSize: "1.08rem",
                letterSpacing: "0.02em",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <FiSend />
              <span>
                {isSubmitting
                  ? "جاري اعتماد الحضور واستخراج التصريح..."
                  : "تأكيد الحضور واستخراج بطاقة الدخول VIP Pass"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default InvitationDynamicRsvpForm;
