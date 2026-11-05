import React, { useState } from "react";
import {
  useAppwrite,
  buildMemoryUrls,
  validateSubdomainSlug,
  parseModularWebsiteConfig,
  validateModularWebsiteConfig,
  createDefaultModularWebsiteConfig,
  type ModularWebsiteConfig,
  type EventSection,
} from "@repo/react-appwrite";
import {
  ThemeAndEffectsPanel,
  THEME_PRESETS,
  type InvitationThemeConfig,
} from "./ThemeAndEffectsPanel";
import {
  SectionBlocksManager,
  projectModernSectionsToLegacyBlocks,
  type InvitationSectionBlock,
} from "./SectionBlocksManager";
import {
  DynamicFormSchemaBuilder,
  MANDATORY_SYSTEM_FIELDS,
  validateFormSchema,
  enforceMandatoryEmailConstraint,
  generateFieldsFromClientRequests,
  type DynamicFormField,
} from "./DynamicFormSchemaBuilder";
import { LiveInvitationPreview } from "./LiveInvitationPreview";
import { LiveModularPreview } from "./LiveModularPreview";

export interface InvitationStudioProps {
  orderId?: string | null;
  onBack?: () => void;
}

export interface AsarInvitationDocument {
  id: string;
  orderId: string;
  clientId: string;
  slug: string;
  eventTitle: string;
  occasionType:
    "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  maxCapacity: number;
  themeConfigJson: string;
  sectionsConfigJson: string;
  formSchemaJson: string;
  qrCodeUrl: string;
  isPublished: boolean;
}

interface DemoOrderData {
  orderId: string;
  clientName: string;
  partnerOrOrgName: string;
  clientEmail: string;
  occasionType:
    "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl: string;
  maxCapacity: number;
  clientRequestedNote: string;
  requestedFields: string[];
}

const DEMO_ORDERS: Record<string, DemoOrderData> = {
  "ORD-915": {
    orderId: "ORD-915",
    clientName: "Omar Al-Sayed",
    partnerOrOrgName: "Layla Mansoor",
    clientEmail: "omar.sayed@example.com",
    occasionType: "wedding",
    eventTitle: "The Wedding of Omar & Layla",
    eventDate: "2026-11-20",
    eventTime: "19:30",
    venueName: "Four Seasons Hotel Alexandria",
    venueAddress: "Corniche Road, San Stefano, Alexandria, Egypt",
    venueMapUrl:
      "https://maps.google.com/?q=Four+Seasons+Hotel+Alexandria+at+San+Stefano",
    maxCapacity: 150,
    clientRequestedNote:
      "Please include WhatsApp number, companions dropdown, dietary restrictions, and a blessing box.",
    requestedFields: [
      "WhatsApp Phone Number",
      "Number of Companions",
      "Dietary Preferences",
      "Leave a Blessing or Song Request",
    ],
  },
  "ORD-916": {
    orderId: "ORD-916",
    clientName: "Tarek Mansour",
    partnerOrOrgName: "Athar Heritage Foundation",
    clientEmail: "tarek@athar-heritage.org",
    occasionType: "gala",
    eventTitle: "Athar Annual VIP Gala & Cultural Summit 2026",
    eventDate: "2026-12-15",
    eventTime: "20:00",
    venueName: "Grand Nile Tower Ballroom",
    venueAddress: "Corniche El Nile, Garden City, Cairo, Egypt",
    venueMapUrl: "https://maps.google.com/?q=Grand+Nile+Tower+Cairo",
    maxCapacity: 250,
    clientRequestedNote:
      "Require WhatsApp number, organization name, and delegate attending side.",
    requestedFields: [
      "WhatsApp Phone Number",
      "Organization / Institution Name",
      "Attending Side",
    ],
  },
  "ORD-917": {
    orderId: "ORD-917",
    clientName: "Salma Fayed",
    partnerOrOrgName: "Alexandria Sound Collective",
    clientEmail: "salma@alexsound.art",
    occasionType: "festival",
    eventTitle: "Alexandria Coastal Indie Sound Festival 2026",
    eventDate: "2026-10-05",
    eventTime: "18:00",
    venueName: "Roman Amphitheatre Garden Stage",
    venueAddress: "Kom El Dekka, Alexandria, Egypt",
    venueMapUrl: "https://maps.google.com/?q=Roman+Amphitheatre+Alexandria",
    maxCapacity: 500,
    clientRequestedNote:
      "Capture WhatsApp, companion tickets, and dietary preferences.",
    requestedFields: [
      "WhatsApp Phone Number",
      "Number of Companions",
      "Dietary Preferences",
    ],
  },
};

export const InvitationStudio: React.FC<InvitationStudioProps> = ({
  orderId,
  onBack,
}) => {
  const { databases } = useAppwrite();

  // Active Order & Invitation Metadata State
  const initialOrderId = orderId || "ORD-915";
  const [selectedOrderId, setSelectedOrderId] =
    useState<string>(initialOrderId);
  const currentDemoOrder =
    DEMO_ORDERS[selectedOrderId] || DEMO_ORDERS["ORD-915"];

  const [activeTab, setActiveTab] = useState<"theme" | "sections" | "form">(
    "theme",
  );
  const [previewEngine, setPreviewEngine] = useState<"modular" | "classic">(
    "modular",
  );
  const [occasionType, setOccasionType] = useState<
    AsarInvitationDocument["occasionType"]
  >(currentDemoOrder.occasionType);
  const [slug, setSlug] = useState<string>("omar-and-layla");
  const [eventTitle, setEventTitle] = useState<string>(
    currentDemoOrder.eventTitle,
  );
  const [maxCapacity, setMaxCapacity] = useState<number>(
    currentDemoOrder.maxCapacity,
  );

  const invitationUrls = buildMemoryUrls({
    slug: slug || "omar-and-layla",
    type: "invitation",
    port: 3003,
    rendererPort: 3004,
  });
  const slugValidation = validateSubdomainSlug(slug);

  // Theme Config State
  const [themeConfig, setThemeConfig] = useState<InvitationThemeConfig>(() => {
    if (currentDemoOrder.occasionType === "gala")
      return THEME_PRESETS["midnight-gala"].config;
    if (currentDemoOrder.occasionType === "festival")
      return THEME_PRESETS["cultural-festival"].config;
    return THEME_PRESETS["royal-wedding"].config;
  });

  // Modular Website Config State (v2.0)
  const [modularConfig, setModularConfig] = useState<ModularWebsiteConfig>(
    () => {
      // Attempt load from localStorage cache
      const savedActive = localStorage.getItem("asar_active_invitation");
      if (savedActive) {
        try {
          const parsedDoc = JSON.parse(savedActive);
          if (parsedDoc?.sectionsConfigJson) {
            return parseModularWebsiteConfig(parsedDoc.sectionsConfigJson);
          }
        } catch (err: unknown) {
          console.warn("Failed to load active invitation cache", err);
        }
      }
      return createDefaultModularWebsiteConfig({
        coupleTitle: currentDemoOrder.eventTitle,
        eventDate: currentDemoOrder.eventDate,
        venueName: currentDemoOrder.venueName,
      });
    },
  );

  // Legacy Section Blocks State kept synchronized
  const [blocks, setBlocks] = useState<InvitationSectionBlock[]>(() =>
    projectModernSectionsToLegacyBlocks(modularConfig.sections),
  );

  // Dynamic Form Schema State (Always enforce mandatory guestEmail)
  const [formFields, setFormFields] = useState<DynamicFormField[]>(() => {
    const initialCustom = generateFieldsFromClientRequests(
      currentDemoOrder.requestedFields,
    );
    return enforceMandatoryEmailConstraint([
      ...MANDATORY_SYSTEM_FIELDS,
      ...initialCustom,
    ]);
  });

  // UI Modals and Toasts
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success",
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Modern sections update handler
  const handleModularSectionsChange = (newSections: EventSection[]) => {
    setModularConfig((prev) => ({
      ...prev,
      sections: newSections,
      metadata: { lastEditedAt: new Date().toISOString() },
    }));
    setBlocks(projectModernSectionsToLegacyBlocks(newSections));
  };

  // Switch demo order
  const handleOrderChange = (newOrdId: string) => {
    setSelectedOrderId(newOrdId);
    const orderData = DEMO_ORDERS[newOrdId];
    if (orderData) {
      setOccasionType(orderData.occasionType);
      setEventTitle(orderData.eventTitle);
      setMaxCapacity(orderData.maxCapacity);
      const newSlug = orderData.eventTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 30);
      setSlug(newSlug);

      // Preset theme
      if (orderData.occasionType === "gala") {
        setThemeConfig(THEME_PRESETS["midnight-gala"].config);
      } else if (orderData.occasionType === "festival") {
        setThemeConfig(THEME_PRESETS["cultural-festival"].config);
      } else {
        setThemeConfig(THEME_PRESETS["royal-wedding"].config);
      }

      // Update modularConfig sections
      setModularConfig((prev) => {
        const updated = prev.sections.map((sec) => {
          if (sec.type === "cover_hero") {
            return {
              ...sec,
              coupleTitle: orderData.eventTitle,
              dateDisplay: orderData.eventDate,
              venueDisplay: orderData.venueName,
            };
          }
          if (sec.type === "venue_location") {
            return {
              ...sec,
              venueName: orderData.venueName,
              address: orderData.venueAddress,
              mapEmbedUrl: orderData.venueMapUrl,
            };
          }
          if (sec.type === "live_countdown") {
            return {
              ...sec,
              targetDateIso: `${orderData.eventDate}T${orderData.eventTime || "19:00"}:00.000Z`,
            };
          }
          return sec;
        });
        return {
          ...prev,
          sections: updated,
          metadata: { lastEditedAt: new Date().toISOString() },
        };
      });

      // Update legacy blocks
      setBlocks((prev) =>
        prev.map((b) => {
          if (b.type === "hero") {
            return {
              ...b,
              mainTitle: orderData.eventTitle,
              datePill: orderData.eventDate,
              timePill: orderData.eventTime,
              venuePill: orderData.venueName,
            };
          }
          if (b.type === "venue_map") {
            return {
              ...b,
              venueName: orderData.venueName,
              venueAddress: orderData.venueAddress,
              mapUrl: orderData.venueMapUrl,
            };
          }
          return b;
        }),
      );

      // Update form
      const custom = generateFieldsFromClientRequests(
        orderData.requestedFields,
      );
      setFormFields(
        enforceMandatoryEmailConstraint([
          ...MANDATORY_SYSTEM_FIELDS,
          ...custom,
        ]),
      );
      showToast(
        `Loaded details for Order #${newOrdId} (${orderData.eventTitle})`,
        "info",
      );
    }
  };

  // One-click Pull/Apply Client Requested Fields & Assets
  const handleApplyClientRequests = () => {
    const orderData = DEMO_ORDERS[selectedOrderId] || currentDemoOrder;

    // 1. Update event details
    setEventTitle(orderData.eventTitle);
    setMaxCapacity(orderData.maxCapacity);
    setOccasionType(orderData.occasionType);

    // 2. Update modular sections
    setModularConfig((prev) => {
      const updated = prev.sections.map((sec) => {
        if (sec.type === "cover_hero") {
          return {
            ...sec,
            coupleTitle: orderData.eventTitle,
            dateDisplay: orderData.eventDate,
            venueDisplay: orderData.venueName,
          };
        }
        if (sec.type === "venue_location") {
          return {
            ...sec,
            venueName: orderData.venueName,
            address: orderData.venueAddress,
            mapEmbedUrl: orderData.venueMapUrl,
          };
        }
        return sec;
      });
      return {
        ...prev,
        sections: updated,
        metadata: { lastEditedAt: new Date().toISOString() },
      };
    });

    // 3. Update legacy blocks
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.type === "hero") {
          return {
            ...b,
            mainTitle: orderData.eventTitle,
            datePill: orderData.eventDate,
            timePill: orderData.eventTime,
            venuePill: orderData.venueName,
          };
        }
        if (b.type === "venue_map") {
          return {
            ...b,
            venueName: orderData.venueName,
            venueAddress: orderData.venueAddress,
            mapUrl: orderData.venueMapUrl,
          };
        }
        return b;
      }),
    );

    // 4. Generate dynamic form fields from client requested list
    const generated = generateFieldsFromClientRequests(
      orderData.requestedFields,
    );
    const merged = enforceMandatoryEmailConstraint([
      ...MANDATORY_SYSTEM_FIELDS,
      ...generated,
    ]);
    setFormFields(merged);

    showToast(
      `📥 تم تطبيق بيانات ومتطلبات العميل! تم تحديث بيانات المناسبة و${generated.length} حقول استمارة مع إلزام البريد الإلكتروني.`,
      "success",
    );
  };

  // Save and Publish
  const handleSaveAndPublish = async () => {
    // 0. Validate Subdomain Slug
    const slugCheck = validateSubdomainSlug(slug);
    if (!slugCheck.isValid) {
      showToast(
        `تعذر النشر: اسم النطاق الفرعي (Slug) غير صالح (${slugCheck.error})`,
        "error",
      );
      return;
    }

    // 1. Validate Form Schema
    const validation = validateFormSchema(formFields);
    if (!validation.isValid) {
      showToast(`تعذر النشر: ${validation.errors[0]}`, "error");
      setActiveTab("form");
      return;
    }

    // 2. Validate Modular Website Config (v2.0)
    const configCheck = validateModularWebsiteConfig(modularConfig);
    if (!configCheck.isValid) {
      showToast(`تعذر النشر: ${configCheck.errors[0]}`, "error");
      setActiveTab("sections");
      return;
    }

    setIsSaving(true);

    try {
      const invitationPayload: AsarInvitationDocument = {
        id: `INV-${selectedOrderId}`,
        orderId: selectedOrderId,
        clientId: "client-demo-user",
        slug,
        eventTitle,
        occasionType,
        eventDate: currentDemoOrder.eventDate,
        eventTime: currentDemoOrder.eventTime,
        venueName: currentDemoOrder.venueName,
        venueAddress: currentDemoOrder.venueAddress,
        venueMapUrl: currentDemoOrder.venueMapUrl,
        maxCapacity,
        themeConfigJson: JSON.stringify(themeConfig),
        sectionsConfigJson: JSON.stringify(modularConfig),
        formSchemaJson: JSON.stringify(formFields),
        qrCodeUrl: invitationUrls.canonicalUrl,
        isPublished: true,
      };

      // 1. Always persist to localStorage cache
      const existingRaw = localStorage.getItem("asar_invitations_cache");
      let list: AsarInvitationDocument[] = [];
      if (existingRaw) {
        try {
          list = JSON.parse(existingRaw);
        } catch {
          list = [];
        }
      }
      list = list.filter((item) => item.id !== invitationPayload.id);
      list.push(invitationPayload);
      localStorage.setItem("asar_invitations_cache", JSON.stringify(list));
      localStorage.setItem(
        "asar_active_invitation",
        JSON.stringify(invitationPayload),
      );

      // 2. Attempt Appwrite persist if databases client exists
      if (databases && typeof databases.createDocument === "function") {
        try {
          await databases.createDocument(
            "asar-db",
            "invitations",
            invitationPayload.id,
            invitationPayload,
          );
        } catch {
          try {
            await databases.updateDocument(
              "asar-db",
              "invitations",
              invitationPayload.id,
              invitationPayload,
            );
          } catch {
            // Non-fatal if Appwrite backend is unprovisioned in test mode
          }
        }
      }

      showToast(
        `🚀 تم نشر موقع الدعوة الرقمية بنجاح! الرابط الأساسي: ${invitationUrls.canonicalUrl} (منصة العرض: ${invitationUrls.devRendererUrl} | التطوير: ${invitationUrls.devQueryUrl})`,
        "success",
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "خطأ غير معروف";
      showToast(`خطأ أثناء حفظ الدعوة: ${errMsg}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const activeSectionsCount = modularConfig.sections.filter(
    (s) => s.enabled,
  ).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary, #FBF7F2)",
        color: "var(--athar-text-title, #231F20)",
        fontFamily: "var(--font-body, 'Cairo', sans-serif)",
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
            background:
              toastType === "success"
                ? "#1E6F50"
                : toastType === "error"
                  ? "#9B2C2C"
                  : "#6B1D28",
            color: "#FFFFFF",
            padding: "0.85rem 1.4rem",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            fontSize: "0.9rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>
            {toastType === "success" ? "✓" : toastType === "error" ? "⚠️" : "ℹ"}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Studio Toolbar */}
      <header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(107, 29, 40, 0.12)",
          padding: "0.85rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        {/* Left: Brand & Order Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "rgba(107, 29, 40, 0.06)",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                color: "#6B1D28",
                borderRadius: "8px",
                padding: "0.45rem 0.8rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              ← العودة لطابور الطلبات
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6B1D28, #D4AF37)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                fontSize: "1.2rem",
                boxShadow: "0 2px 6px rgba(107, 29, 40, 0.25)",
              }}
            >
              ✉️
            </div>
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#231F20",
                    fontFamily: "Amiri, Georgia, serif",
                  }}
                >
                  استوديو أثر لتصميم المواقع والدعوات
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "4px",
                    background: "rgba(107, 29, 40, 0.1)",
                    color: "#6B1D28",
                    fontWeight: 700,
                  }}
                >
                  محرر R2
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#7A6F6D" }}>
                الطلب النشط: <b>{currentDemoOrder.clientName}</b> (
                {currentDemoOrder.partnerOrOrgName}) • {occasionType}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick Switch Demo Order, Capacity & Slug */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <span
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A6F6D" }}
            >
              الطلب:
            </span>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.8rem",
                fontWeight: 700,
                background: "#FFF",
                color: "#6B1D28",
              }}
            >
              <option value="ORD-915">ORD-915 (عمر وليلى - حفل زفاف)</option>
              <option value="ORD-916">ORD-916 (حفل مؤسسة أثر السنوي)</option>
              <option value="ORD-917">
                ORD-917 (مهرجان الإسكندرية الموسيقي)
              </option>
            </select>
          </div>

          {/* Max Venue Capacity Input */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <span
              style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A6F6D" }}
            >
              السعة القصوى:
            </span>
            <input
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(e) =>
                setMaxCapacity(parseInt(e.target.value, 10) || 0)
              }
              style={{
                width: "70px",
                padding: "0.35rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.8rem",
                fontWeight: 700,
                textAlign: "center",
              }}
              title="يستخدم في حساب سعة صندوق تأكيد الحضور"
            />
            <span style={{ fontSize: "0.75rem", color: "#7A6F6D" }}>ضيف</span>
          </div>

          {/* Subdomain Slug Input */}
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            <span
              style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6B1D28" }}
            >
              الرابط:
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                )
              }
              placeholder="e.g. omar-and-layla"
              style={{
                width: "150px",
                padding: "0.35rem 0.5rem",
                borderRadius: "6px",
                border: !slugValidation.isValid
                  ? "1.5px solid #dc2626"
                  : "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.8rem",
                fontWeight: 700,
                background: "#FFF",
              }}
              title="RFC 1123 DNS Subdomain Slug"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <a
            href={invitationUrls.devRendererUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "rgba(212, 175, 55, 0.15)",
              color: "#856404",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              borderRadius: "8px",
              padding: "0.45rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "all 0.2s ease",
            }}
            title="معاينة مباشرة في منصة العرض المستقلة (Port 3004)"
          >
            🌐 منصة العرض (:3004) ↗
          </a>

          <button
            type="button"
            onClick={handleApplyClientRequests}
            style={{
              background: "rgba(212, 175, 55, 0.15)",
              color: "#856404",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              borderRadius: "8px",
              padding: "0.45rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="تعبئة بيانات المناسبة وإضافة حقول استمارة تأكيد الحضور المطلوبة من العميل"
          >
            📥 تطبيق متطلبات العميل
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            style={{
              background: "#FFFFFF",
              color: "#6B1D28",
              border: "1px solid rgba(107, 29, 40, 0.25)",
              borderRadius: "8px",
              padding: "0.45rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            📱 توليد رمز QR
          </button>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            style={{
              background: "linear-gradient(135deg, #6B1D28 0%, #5B1621 100%)",
              color: "#FFFFFF",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: "8px",
              padding: "0.45rem 1.15rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: isSaving ? "not-allowed" : "pointer",
              boxShadow: "0 2px 10px rgba(107, 29, 40, 0.25)",
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? "⏳ جاري الحفظ..." : "🚀 حفظ ونشر الموقع"}
          </button>
        </div>
      </header>

      {/* Subdomain Storefront Status Strip */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid rgba(107, 29, 40, 0.08)",
          padding: "0.5rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          fontSize: "0.78rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 700, color: "#6B1D28" }}>
            🌐 رابط المنصة الفرعي:
          </span>
          <a
            href={invitationUrls.canonicalUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              fontWeight: 700,
              color: "#6B1D28",
              textDecoration: "underline",
            }}
          >
            {invitationUrls.canonicalUrl}
          </a>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "0.1rem 0.4rem",
              borderRadius: "4px",
              background: "rgba(212, 175, 55, 0.2)",
              color: "#856404",
              border: "1px solid rgba(212, 175, 55, 0.4)",
            }}
          >
            الرابط الأساسي
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            color: "#7A6F6D",
            flexWrap: "wrap",
          }}
        >
          <span>معاينات التطوير:</span>
          <a
            href={invitationUrls.devRendererUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#6B1D28",
              textDecoration: "underline",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
            title="منصة العرض المستقلة (Port 3004)"
          >
            منصة العرض (3004) ↗
          </a>
          <span>•</span>
          <a
            href={invitationUrls.devQueryUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#7A6F6D",
              textDecoration: "underline",
              fontFamily: "monospace",
            }}
          >
            {invitationUrls.devQueryUrl}
          </a>
          <span>•</span>
          <a
            href={invitationUrls.devLocalhostUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#7A6F6D",
              textDecoration: "underline",
              fontFamily: "monospace",
            }}
          >
            {invitationUrls.devLocalhostUrl}
          </a>
        </div>
      </div>

      {!slugValidation.isValid && (
        <div
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: "8px",
            padding: "0.45rem 1rem",
            margin: "0.75rem 1.5rem 0 1.5rem",
            fontSize: "0.78rem",
            color: "#dc2626",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>⚠️</span>
          <span>
            {slugValidation.error ||
              "يجب أن يتوافق النطاق الفرعي مع معايير RFC 1123 DNS: حروف صغيرة، أرقام، وشرطات فقط، وبدون أسماء محجوزة مثل admin أو api."}
          </span>
        </div>
      )}

      {/* Main Split-Screen Workspace */}
      <main
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "1.5rem",
          maxWidth: "1600px",
          width: "100%",
          margin: "0 auto",
          padding: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        {/* Left Column (60%): 3 Builder Tabs */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Tab Navigation Strip */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              background: "rgba(255, 255, 255, 0.8)",
              padding: "0.35rem",
              borderRadius: "14px",
              border: "1px solid rgba(107, 29, 40, 0.1)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("theme")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activeTab === "theme" ? "#6B1D28" : "transparent",
                color: activeTab === "theme" ? "#FFFFFF" : "#7A6F6D",
                boxShadow:
                  activeTab === "theme"
                    ? "0 4px 12px rgba(107, 29, 40, 0.2)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              ١. الثيم والألوان والتأثيرات
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sections")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                background:
                  activeTab === "sections" ? "#6B1D28" : "transparent",
                color: activeTab === "sections" ? "#FFFFFF" : "#7A6F6D",
                boxShadow:
                  activeTab === "sections"
                    ? "0 4px 12px rgba(107, 29, 40, 0.2)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              ٢. أقسام الموقع التفاعلية ({activeSectionsCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("form")}
              style={{
                flex: 1,
                padding: "0.6rem 0.75rem",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                background: activeTab === "form" ? "#6B1D28" : "transparent",
                color: activeTab === "form" ? "#FFFFFF" : "#7A6F6D",
                boxShadow:
                  activeTab === "form"
                    ? "0 4px 12px rgba(107, 29, 40, 0.2)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              ٣. استمارة تأكيد الحضور (🔒 البريد إجباري)
            </button>
          </div>

          {/* Tab 1: Theme & Effects Panel */}
          {activeTab === "theme" && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "18px",
                padding: "1.5rem",
                border: "1px solid rgba(107, 29, 40, 0.08)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
              }}
            >
              <ThemeAndEffectsPanel
                themeConfig={themeConfig}
                onChange={setThemeConfig}
              />
            </div>
          )}

          {/* Tab 2: Section Blocks Manager */}
          {activeTab === "sections" && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "18px",
                padding: "1.5rem",
                border: "1px solid rgba(107, 29, 40, 0.08)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
              }}
            >
              <SectionBlocksManager
                sections={modularConfig.sections}
                onSectionsChange={handleModularSectionsChange}
                blocks={blocks}
                onChange={setBlocks}
                onNavigateToFormBuilder={() => setActiveTab("form")}
                defaultContext={{
                  coupleTitle: eventTitle,
                  eventDate: currentDemoOrder.eventDate,
                  venueName: currentDemoOrder.venueName,
                }}
              />
            </div>
          )}

          {/* Tab 3: Dynamic Form Schema Builder */}
          {activeTab === "form" && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: "18px",
                padding: "1.5rem",
                border: "1px solid rgba(107, 29, 40, 0.08)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
              }}
            >
              <DynamicFormSchemaBuilder
                fields={formFields}
                onChange={setFormFields}
                clientRequestedNote={currentDemoOrder.clientRequestedNote}
                onApplyClientRequests={handleApplyClientRequests}
              />
            </div>
          )}
        </div>

        {/* Right Column (40%): Live Interactive Mobile / Desktop Preview */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: "0.5rem",
              gap: "0.35rem",
            }}
          >
            <span
              style={{ fontSize: "0.72rem", color: "#777", fontWeight: 600 }}
            >
              محرك المعاينة:
            </span>
            <button
              type="button"
              onClick={() => setPreviewEngine("modular")}
              style={{
                background:
                  previewEngine === "modular" ? "#6B1D28" : "rgba(0,0,0,0.05)",
                color: previewEngine === "modular" ? "#FFF" : "#555",
                border: "none",
                borderRadius: "6px",
                padding: "0.2rem 0.5rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              النسخة الحديثة v2.0
            </button>
            <button
              type="button"
              onClick={() => setPreviewEngine("classic")}
              style={{
                background:
                  previewEngine === "classic" ? "#6B1D28" : "rgba(0,0,0,0.05)",
                color: previewEngine === "classic" ? "#FFF" : "#555",
                border: "none",
                borderRadius: "6px",
                padding: "0.2rem 0.5rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              النسخة الكلاسيكية
            </button>
          </div>

          {previewEngine === "modular" ? (
            <LiveModularPreview
              themeConfig={themeConfig}
              sections={modularConfig.sections}
              eventSlug={slug}
              onSelectSection={() => {
                setActiveTab("sections");
              }}
            />
          ) : (
            <LiveInvitationPreview
              themeConfig={themeConfig}
              blocks={blocks}
              formFields={formFields}
              eventSlug={slug}
            />
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {showQrModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem",
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "2rem",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              border: "1.5px solid #D4AF37",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "rgba(107, 29, 40, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6B1D28",
                fontSize: "1.5rem",
              }}
            >
              📱
            </div>

            <div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  color: "#231F20",
                  margin: 0,
                }}
              >
                رمز الاستجابة السريعة (QR) لصفحة الدعوة
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#7A6F6D",
                  marginTop: "0.25rem",
                }}
              >
                يمكن للضيوف مسح هذا الرمز لعرض بطاقة وموقع الدعوة الفاخر مباشرة.
              </p>
            </div>

            {/* QR Card Frame */}
            <div
              style={{
                background: "#FBF7F2",
                border: "2px solid #D4AF37",
                borderRadius: "16px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              {/* QR Image representation */}
              <div
                style={{
                  width: 180,
                  height: 180,
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                    invitationUrls.canonicalUrl,
                  )}&color=6B1D28&bgcolor=FBF7F2`}
                  alt="Invitation QR Code"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#6B1D28",
                }}
              >
                {eventTitle}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#6B1D28",
                  wordBreak: "break-all",
                }}
              >
                {invitationUrls.canonicalUrl}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#7A6F6D" }}>
                الوجهة الأساسية للموقع الفرعي
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  color: "#7A6F6D",
                }}
              >
                منصة العرض: {invitationUrls.devRendererUrl}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  color: "#7A6F6D",
                }}
              >
                بيئة التطوير: {invitationUrls.devQueryUrl}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(invitationUrls.canonicalUrl);
                  showToast("تم نسخ رابط الدعوة إلى الحافظة بنجاح!", "info");
                }}
                style={{
                  flex: 1,
                  background: "rgba(107, 29, 40, 0.08)",
                  color: "#6B1D28",
                  border: "1px solid rgba(107, 29, 40, 0.2)",
                  borderRadius: "10px",
                  padding: "0.6rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                نسخ الرابط 📋
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                style={{
                  flex: 1,
                  background: "#6B1D28",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.6rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                تم ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
