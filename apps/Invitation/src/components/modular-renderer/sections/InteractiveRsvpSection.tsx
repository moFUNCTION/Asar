import React, { useState, useId } from "react";
import type { DynamicRsvpSection as DynamicRsvpSectionModel } from "@repo/react-appwrite";
import {
  useAppwrite,
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
  ID,
} from "@repo/react-appwrite";
import type { InvitationDocument, InvitationRsvpDocument } from "../../../components/renderer/types";

export interface InteractiveRsvpSectionProps {
  section: DynamicRsvpSectionModel;
  invitation: InvitationDocument;
  isNoir?: boolean;
  onSuccess?: (rsvp: InvitationRsvpDocument) => void;
  onPreviewPass?: (rsvpId: string) => void;
}

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
}

const seenPassTokens = new Set<string>();

export function generatePassToken(prefix = "INV-PASS"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "";
  do {
    let rand1 = "";
    let rand2 = "";
    for (let i = 0; i < 4; i++) {
      rand1 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    for (let i = 0; i < 4; i++) {
      rand2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token = `${prefix}-${rand1}-${rand2}`;
  } while (seenPassTokens.has(token));

  seenPassTokens.add(token);
  if (seenPassTokens.size > 50000) {
    seenPassTokens.clear();
  }
  return token;
}

export const DIETARY_OPTIONS = [
  { id: "none", labelEn: "No Restrictions", labelAr: "بدون قيود غذائية" },
  { id: "halal", labelEn: "Strictly Halal", labelAr: "حلال حصراً" },
  { id: "vegetarian", labelEn: "Vegetarian", labelAr: "نباتي (Vegetarian)" },
  { id: "vegan", labelEn: "Vegan", labelAr: "نباتي صرف (Vegan)" },
  { id: "gluten_free", labelEn: "Gluten-Free", labelAr: "خالٍ من الجلوتين" },
];

export const InteractiveRsvpSection: React.FC<InteractiveRsvpSectionProps> = ({
  section,
  invitation,
  isNoir = false,
  onSuccess,
  onPreviewPass,
}) => {
  const formPrefix = useId();
  const { databases, config } = useAppwrite();
  const dbId = config?.databaseId || ASAR_DATABASE_ID;

  // State
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [companionsCount, setCompanionsCount] = useState<number>(0);
  const [dietarySelection, setDietarySelection] = useState<string>("none");
  const [needsTransport, setNeedsTransport] = useState(false);
  const [blessingNote, setBlessingNote] = useState("");
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, unknown>>({});

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedRsvp, setConfirmedRsvp] = useState<InvitationRsvpDocument | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);

  const maxCompanions = section.maxCompanions ?? 3;

  // Validation
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!guestName.trim()) {
      errors.guestName = "يرجى إدخال الاسم الكريم / Full Name is required";
    }

    if (!guestEmail.trim()) {
      errors.guestEmail = "البريد الإلكتروني مطلوب لاستلام بطاقة QR / Email is required";
    } else if (!isValidEmail(guestEmail)) {
      errors.guestEmail = "يرجى إدخال بريد إلكتروني صالح / Please enter a valid email address";
    }

    // Dynamic schema validation
    if (section.formSchema && Array.isArray(section.formSchema)) {
      for (const field of section.formSchema) {
        if (field.name === "guestName" || field.name === "guestEmail") continue;
        if (field.required) {
          const val = dynamicAnswers[field.name];
          if (val === undefined || val === null || val === "") {
            errors[field.name] = `حقل "${field.labelEn || field.labelAr || field.name}" مطلوب`;
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const passToken = generatePassToken();
      const rsvpId = `rsvp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const rsvpDoc: InvitationRsvpDocument = {
        $id: rsvpId,
        id: rsvpId,
        invitationId: invitation.$id || invitation.id || invitation.slug,
        clientId: invitation.clientId || "client-asar-1",
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        guestPhone: guestPhone.trim() || undefined,
        companionsCount: attending === "yes" ? companionsCount : 0,
        dynamicResponsesJson: JSON.stringify({
          attending,
          dietarySelection: section.askDietary ? dietarySelection : undefined,
          needsTransport: section.askTransportation ? needsTransport : undefined,
          blessingNote: blessingNote.trim() || undefined,
          ...dynamicAnswers,
        }),
        status: attending === "yes" ? "approved" : "declined",
        passToken,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=280x280&color=6B1D28&bgcolor=FFFFFF&data=${encodeURIComponent(
          `https://asar.me/pass/${rsvpId}?token=${passToken}&guest=${encodeURIComponent(guestName.trim())}`
        )}`,
        emailSent: false,
        isCheckedInAtVenue: false,
        respondedAt: new Date().toISOString(),
      };

      // 1. Cache RSVP locally
      try {
        const cacheKey = "asar_invitation_rsvps_cache";
        const existing = localStorage.getItem(cacheKey);
        const list: InvitationRsvpDocument[] = existing ? JSON.parse(existing) : [];
        list.unshift(rsvpDoc);
        localStorage.setItem(cacheKey, JSON.stringify(list));
      } catch {
        // storage fallback
      }

      // 2. If blessing note was entered, forward to wishing wall cache
      if (blessingNote.trim()) {
        try {
          const wallKey = "asar_wishing_wall_cache";
          const existingNotes = localStorage.getItem(wallKey);
          const notes = existingNotes ? JSON.parse(existingNotes) : [];
          notes.unshift({
            id: `wish-${Date.now()}`,
            author: guestName.trim(),
            role: "Guest · ضيف حفل الزفاف",
            message: blessingNote.trim(),
            date: "Just now",
            likes: 1,
          });
          localStorage.setItem(wallKey, JSON.stringify(notes));
        } catch {
          // ignore
        }
      }

      // 3. Persist to Appwrite Cloud
      try {
        if (databases) {
          databases
            .createDocument(
              dbId,
              ASAR_COLLECTIONS.INVITATION_RSVPS,
              rsvpId,
              {
                invitationId: invitation.$id || invitation.id || invitation.slug,
                clientId: invitation.clientId || "client-asar-1",
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim().toLowerCase(),
                guestPhone: guestPhone.trim() || undefined,
                companionsCount: attending === "yes" ? companionsCount : 0,
                dynamicResponsesJson: JSON.stringify({
                  attending,
                  dietarySelection: section.askDietary ? dietarySelection : undefined,
                  needsTransport: section.askTransportation ? needsTransport : undefined,
                  blessingNote: blessingNote.trim() || undefined,
                  ...dynamicAnswers,
                }),
                status: attending === "yes" ? "approved" : "declined",
                passToken,
                qrCodeUrl: rsvpDoc.qrCodeUrl,
                emailSent: false,
                isCheckedInAtVenue: false,
                respondedAt: rsvpDoc.respondedAt,
              }
            )
            .catch(() => {});

          if (blessingNote.trim()) {
            databases
              .createDocument(
                dbId,
                ASAR_COLLECTIONS.WISHING_WALL_MESSAGES,
                ID.unique(),
                {
                  invitationId: invitation.$id || invitation.id || invitation.slug,
                  author: guestName.trim(),
                  role: "Guest · ضيف حفل الزفاف",
                  message: blessingNote.trim(),
                  likes: 1,
                  isApproved: true,
                }
              )
              .catch(() => {});
          }
        }
      } catch {
        // Fallback to local cache
      }

      setConfirmedRsvp(rsvpDoc);
      setShowPassModal(true);
      onSuccess?.(rsvpDoc);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="rsvp-section"
      className="athar-interactive-rsvp-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
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
            ✦ {section.subtitle || "Presence & Attendance · تأكيد الحضور والتسجيل"} ✦
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
            {section.title || "RSVP & VIP Pass"}
          </h2>
          {section.titleAr && (
            <div
              style={{
                fontSize: "1.15rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontFamily: "var(--font-arabic-display, serif)",
                marginBottom: "0.75rem",
              }}
            >
              {section.titleAr}
            </div>
          )}

          {section.deadlineDate && (
            <div
              style={{
                display: "inline-block",
                padding: "0.35rem 1rem",
                borderRadius: "9999px",
                backgroundColor: isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontSize: "0.82rem",
                fontWeight: 700,
                border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
              }}
            >
              ⏳ آخر موعد لتأكيد الحضور: {section.deadlineDate}
            </div>
          )}
        </div>

        {/* RSVP Form Card */}
        <div
          style={{
            padding: "2.5rem 2rem",
            borderRadius: "26px",
            background: isNoir
              ? "linear-gradient(145deg, rgba(35, 26, 30, 0.94), rgba(22, 18, 20, 0.97))"
              : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
            border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.08)",
          }}
        >
          <form onSubmit={handleSubmit} noValidate>
            {/* 1. Attendance Choice */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                حالة الحضور المشرف · Attendance Status *
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setAttending("yes")}
                  style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    border: attending === "yes"
                      ? "2px solid var(--athar-gold, #D4AF37)"
                      : "1px solid rgba(212, 175, 55, 0.25)",
                    background: attending === "yes"
                      ? (isNoir ? "rgba(212, 175, 55, 0.2)" : "rgba(107, 29, 40, 0.06)")
                      : "transparent",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>✓</span>
                  <span>سأحضر بكل سرور</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--athar-gold, #D4AF37)" }}>Attending with joy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAttending("no")}
                  style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    border: attending === "no"
                      ? "2px solid #8A6D1E"
                      : "1px solid rgba(212, 175, 55, 0.25)",
                    background: attending === "no"
                      ? (isNoir ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)")
                      : "transparent",
                    color: isNoir ? "#A8A8B7" : "var(--athar-text-muted, #7A6F6D)",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>✕</span>
                  <span>أعتذر بكل محبة</span>
                  <span style={{ fontSize: "0.72rem" }}>Regretfully decline</span>
                </button>
              </div>
            </div>

            {/* 2. Full Name (Locked Required) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor={`${formPrefix}-name`}
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                الاسم بالكامل · Full Name *
              </label>
              <input
                id={`${formPrefix}-name`}
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  if (formErrors.guestName) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.guestName;
                      return next;
                    });
                  }
                }}
                placeholder="مثال: د. كريم الألفي"
                style={{
                  width: "100%",
                  padding: "0.85rem 1.15rem",
                  borderRadius: "12px",
                  border: formErrors.guestName
                    ? "1.5px solid #9B2C2C"
                    : "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  backgroundColor: isNoir ? "rgba(20, 15, 17, 0.7)" : "#FFFFFF",
                  color: isNoir ? "#FFFFFF" : "#231F20",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {formErrors.guestName && (
                <div style={{ color: "#E53E3E", fontSize: "0.78rem", marginTop: "0.35rem" }}>
                  {formErrors.guestName}
                </div>
              )}
            </div>

            {/* 3. Locked Email Address (Required for VIP QR delivery) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor={`${formPrefix}-email`}
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                البريد الإلكتروني · Email Address * (لاستلام بطاقة الدخول الذكية QR)
              </label>
              <input
                id={`${formPrefix}-email`}
                type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  if (formErrors.guestEmail) {
                    setFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.guestEmail;
                      return next;
                    });
                  }
                }}
                placeholder="your.email@example.com"
                style={{
                  width: "100%",
                  padding: "0.85rem 1.15rem",
                  borderRadius: "12px",
                  border: formErrors.guestEmail
                    ? "1.5px solid #9B2C2C"
                    : "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  backgroundColor: isNoir ? "rgba(20, 15, 17, 0.7)" : "#FFFFFF",
                  color: isNoir ? "#FFFFFF" : "#231F20",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              {formErrors.guestEmail && (
                <div style={{ color: "#E53E3E", fontSize: "0.78rem", marginTop: "0.35rem" }}>
                  {formErrors.guestEmail}
                </div>
              )}
            </div>

            {/* 4. Phone Number (Optional) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                htmlFor={`${formPrefix}-phone`}
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                رقم الهاتف أو واتساب · WhatsApp / Phone (اختياري)
              </label>
              <input
                id={`${formPrefix}-phone`}
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="010xxxxxxxx"
                style={{
                  width: "100%",
                  padding: "0.85rem 1.15rem",
                  borderRadius: "12px",
                  border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  backgroundColor: isNoir ? "rgba(20, 15, 17, 0.7)" : "#FFFFFF",
                  color: isNoir ? "#FFFFFF" : "#231F20",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            {/* 5. Companions Selector (if attending and allowPlusOnes is true) */}
            {attending === "yes" && section.allowPlusOnes && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  }}
                >
                  عدد المرافقين الإضافيين · Additional Companions
                </label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {Array.from({ length: maxCompanions + 1 }).map((_, num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCompanionsCount(num)}
                      style={{
                        padding: "0.5rem 1.25rem",
                        borderRadius: "9999px",
                        border: companionsCount === num
                          ? "2px solid var(--athar-gold, #D4AF37)"
                          : "1px solid rgba(212, 175, 55, 0.3)",
                        backgroundColor: companionsCount === num
                          ? (isNoir ? "rgba(212, 175, 55, 0.2)" : "var(--athar-maroon, #6B1D28)")
                          : "transparent",
                        color: companionsCount === num
                          ? (isNoir ? "#E5C158" : "#FFFFFF")
                          : (isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)"),
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                      }}
                    >
                      {num === 0 ? "أنا فقط (0)" : `+${num} ${num === 1 ? "مرافق" : "مرافقين"}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Dietary Preferences */}
            {attending === "yes" && section.askDietary && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  }}
                >
                  المتطلبات الغذائية الخاصة · Dietary Preferences
                </label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {DIETARY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDietarySelection(opt.id)}
                      style={{
                        padding: "0.45rem 1rem",
                        borderRadius: "9999px",
                        border: dietarySelection === opt.id
                          ? "1.5px solid var(--athar-gold, #D4AF37)"
                          : "1px solid rgba(212, 175, 55, 0.25)",
                        backgroundColor: dietarySelection === opt.id
                          ? (isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)")
                          : "transparent",
                        color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {opt.labelAr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transportation Option */}
            {attending === "yes" && section.askTransportation && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={needsTransport}
                    onChange={(e) => setNeedsTransport(e.target.checked)}
                    style={{ width: "18px", height: "18px", accentColor: "var(--athar-gold, #D4AF37)" }}
                  />
                  <span>أحتاج لخدمة المواصلات أو صف السيارات (Shuttle / Valet Parking)</span>
                </label>
              </div>
            )}

            {/* Dynamic Custom Schema Fields */}
            {section.formSchema && section.formSchema.filter((f) => f.name !== "guestName" && f.name !== "guestEmail").map((field) => (
              <div key={field.id} style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor={`${formPrefix}-${field.id}`}
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    marginBottom: "0.4rem",
                    color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                  }}
                >
                  {field.labelAr || field.labelEn || field.name} {field.required ? "*" : ""}
                </label>
                <input
                  id={`${formPrefix}-${field.id}`}
                  type="text"
                  value={String(dynamicAnswers[field.name] ?? "")}
                  onChange={(e) => setDynamicAnswers((prev) => ({ ...prev, [field.name]: e.target.value }))}
                  placeholder={field.placeholderAr || field.placeholderEn}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1.15rem",
                    borderRadius: "12px",
                    border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                    backgroundColor: isNoir ? "rgba(20, 15, 17, 0.7)" : "#FFFFFF",
                    color: isNoir ? "#FFFFFF" : "#231F20",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>
            ))}

            {/* 7. Blessing Note */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                htmlFor={`${formPrefix}-note`}
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  marginBottom: "0.4rem",
                  color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                }}
              >
                رسالة مباركة أو كلمة للذكرى · Warm Blessing Note (اختياري)
              </label>
              <textarea
                id={`${formPrefix}-note`}
                value={blessingNote}
                onChange={(e) => setBlessingNote(e.target.value)}
                rows={3}
                placeholder="اكتب كلمة تهنئة للعروسين لتبقى في جدار الأمنيات..."
                style={{
                  width: "100%",
                  padding: "0.85rem 1.15rem",
                  borderRadius: "12px",
                  border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  backgroundColor: isNoir ? "rgba(20, 15, 17, 0.7)" : "#FFFFFF",
                  color: isNoir ? "#FFFFFF" : "#231F20",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "9999px",
                background: isNoir
                  ? "linear-gradient(135deg, #D4AF37, #E5C158)"
                  : "linear-gradient(135deg, var(--athar-maroon, #6B1D28), #50131D)",
                color: isNoir ? "#161214" : "#FFFFFF",
                fontSize: "1rem",
                fontWeight: 800,
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 8px 24px rgba(107, 29, 40, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              {isSubmitting
                ? "جاري تأكيد الحضور وإصدار البطاقة..."
                : attending === "yes"
                  ? "تأكيد الحضور واستلام بطاقة VIP QR Pass"
                  : "إرسال الاعتذار مع المحبة"}
            </button>
          </form>
        </div>
      </div>

      {/* Instant VIP QR Pass Modal */}
      {showPassModal && confirmedRsvp && (
        <div
          onClick={() => setShowPassModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isNoir ? "#231A1E" : "#FFFFFF",
              borderRadius: "28px",
              padding: "2.5rem 2rem",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              border: "2px solid var(--athar-gold, #D4AF37)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.3rem",
                cursor: "pointer",
                color: isNoir ? "#FFFFFF" : "#7A6F6D",
              }}
            >
              ✕
            </button>

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #D4AF37, #8A6D1E)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#161214",
                fontWeight: 900,
                fontSize: "1.2rem",
                margin: "0 auto 1rem auto",
              }}
            >
              ✓
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "2.5px",
                color: "var(--athar-gold, #D4AF37)",
                fontWeight: 700,
              }}
            >
              VIP ENTRY PASS · بطاقة الدخول الذكية
            </div>

            <h3
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                margin: "0.35rem 0",
              }}
            >
              {confirmedRsvp.guestName}
            </h3>

            <div
              style={{
                fontSize: "0.85rem",
                color: confirmedRsvp.status === "approved" ? "#1E6F50" : "#9B2C2C",
                fontWeight: 700,
                marginBottom: "1.25rem",
              }}
            >
              {confirmedRsvp.status === "approved"
                ? `✓ تم تأكيد الحضور المشرف (${confirmedRsvp.companionsCount > 0 ? `+${confirmedRsvp.companionsCount} مرافق` : "شخص واحد"})`
                : "تم تسجيل الاعتذار بكل مودة"}
            </div>

            {/* High-Resolution QR Code */}
            {confirmedRsvp.qrCodeUrl && confirmedRsvp.status === "approved" && (
              <div
                style={{
                  width: "220px",
                  height: "220px",
                  margin: "0 auto 1.25rem auto",
                  padding: "12px",
                  borderRadius: "18px",
                  border: "2px solid var(--athar-gold, #D4AF37)",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <img
                  src={confirmedRsvp.qrCodeUrl}
                  alt="VIP Pass QR"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            )}

            {/* Pass Token Badge */}
            <div
              style={{
                display: "inline-block",
                padding: "0.4rem 1rem",
                borderRadius: "9999px",
                backgroundColor: isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)",
                border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
                fontSize: "0.85rem",
                fontWeight: 800,
                fontFamily: "monospace",
                color: "var(--athar-gold, #D4AF37)",
                marginBottom: "1.5rem",
              }}
            >
              {confirmedRsvp.passToken}
            </div>

            <p style={{ fontSize: "0.8rem", color: isNoir ? "#D6C7B2" : "var(--athar-text-muted, #7A6F6D)", marginBottom: "1.5rem" }}>
              يرجى إبراز هذا الرمز عند بوابات الدخول للمسح الإلكتروني السريع.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowPassModal(false);
                onPreviewPass?.(confirmedRsvp.id || confirmedRsvp.$id || "");
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: isNoir ? "var(--athar-gold, #D4AF37)" : "var(--athar-maroon, #6B1D28)",
                color: isNoir ? "#161214" : "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.88rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              حفظ وإغلاق · Done
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default InteractiveRsvpSection;
