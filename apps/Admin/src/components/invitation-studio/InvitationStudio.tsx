import React, { useState } from "react";
import { useAppwrite } from "@repo/react-appwrite";
import {
  ThemeAndEffectsPanel,
  THEME_PRESETS,
  type InvitationThemeConfig,
} from "./ThemeAndEffectsPanel";
import {
  SectionBlocksManager,
  DEFAULT_SECTION_BLOCKS,
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
  occasionType: "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
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
  occasionType: "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
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
    venueMapUrl: "https://maps.google.com/?q=Four+Seasons+Hotel+Alexandria+at+San+Stefano",
    maxCapacity: 150,
    clientRequestedNote: "Please include WhatsApp number, companions dropdown, dietary restrictions, and a blessing box.",
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
    clientRequestedNote: "Require WhatsApp number, organization name, and delegate attending side.",
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
    clientRequestedNote: "Capture WhatsApp, companion tickets, and dietary preferences.",
    requestedFields: [
      "WhatsApp Phone Number",
      "Number of Companions",
      "Dietary Preferences",
    ],
  },
};

export const InvitationStudio: React.FC<InvitationStudioProps> = ({ orderId, onBack }) => {
  const { databases } = useAppwrite();

  // Active Order & Invitation Metadata State
  const initialOrderId = orderId || "ORD-915";
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrderId);
  const currentDemoOrder = DEMO_ORDERS[selectedOrderId] || DEMO_ORDERS["ORD-915"];

  const [activeTab, setActiveTab] = useState<"theme" | "sections" | "form">("theme");
  const [occasionType, setOccasionType] = useState<AsarInvitationDocument["occasionType"]>(
    currentDemoOrder.occasionType
  );
  const [slug, setSlug] = useState<string>("omar-and-layla");
  const [eventTitle, setEventTitle] = useState<string>(currentDemoOrder.eventTitle);
  const [maxCapacity, setMaxCapacity] = useState<number>(currentDemoOrder.maxCapacity);

  // Theme Config State
  const [themeConfig, setThemeConfig] = useState<InvitationThemeConfig>(() => {
    if (currentDemoOrder.occasionType === "gala") return THEME_PRESETS["midnight-gala"].config;
    if (currentDemoOrder.occasionType === "festival") return THEME_PRESETS["cultural-festival"].config;
    return THEME_PRESETS["royal-wedding"].config;
  });

  // Section Blocks State
  const [blocks, setBlocks] = useState<InvitationSectionBlock[]>(DEFAULT_SECTION_BLOCKS);

  // Dynamic Form Schema State (Always enforce mandatory guestEmail)
  const [formFields, setFormFields] = useState<DynamicFormField[]>(() => {
    const initialCustom = generateFieldsFromClientRequests(currentDemoOrder.requestedFields);
    return enforceMandatoryEmailConstraint([...MANDATORY_SYSTEM_FIELDS, ...initialCustom]);
  });

  // UI Modals and Toasts
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | "info">("success");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
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

      // Update blocks
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
        })
      );

      // Update form
      const custom = generateFieldsFromClientRequests(orderData.requestedFields);
      setFormFields(enforceMandatoryEmailConstraint([...MANDATORY_SYSTEM_FIELDS, ...custom]));
      showToast(`Loaded details for Order #${newOrdId} (${orderData.eventTitle})`, "info");
    }
  };

  // One-click Pull/Apply Client Requested Fields & Assets
  const handleApplyClientRequests = () => {
    const orderData = DEMO_ORDERS[selectedOrderId] || currentDemoOrder;

    // 1. Update event details
    setEventTitle(orderData.eventTitle);
    setMaxCapacity(orderData.maxCapacity);
    setOccasionType(orderData.occasionType);

    // 2. Update Hero and Venue blocks
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
      })
    );

    // 3. Generate dynamic form fields from client requested list
    const generated = generateFieldsFromClientRequests(orderData.requestedFields);
    const merged = enforceMandatoryEmailConstraint([...MANDATORY_SYSTEM_FIELDS, ...generated]);
    setFormFields(merged);

    showToast(
      `📥 Applied client assets! Populated event info and ${generated.length} requested RSVP fields with locked email.`,
      "success"
    );
  };

  // Save and Publish
  const handleSaveAndPublish = async () => {
    // 1. Validate Form Schema
    const validation = validateFormSchema(formFields);
    if (!validation.isValid) {
      showToast(`Cannot publish: ${validation.errors[0]}`, "error");
      setActiveTab("form");
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
        sectionsConfigJson: JSON.stringify(blocks),
        formSchemaJson: JSON.stringify(formFields),
        qrCodeUrl: `http://localhost:3003?event=${slug}`,
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
      localStorage.setItem("asar_active_invitation", JSON.stringify(invitationPayload));

      // 2. Attempt Appwrite persist if databases client exists
      if (databases && typeof databases.createDocument === "function") {
        try {
          await databases.createDocument("asar-db", "invitations", invitationPayload.id, invitationPayload);
        } catch {
          // If document already exists, try update
          try {
            await databases.updateDocument("asar-db", "invitations", invitationPayload.id, invitationPayload);
          } catch {
            // Non-fatal if Appwrite backend is unprovisioned in test mode
          }
        }
      }

      showToast(`🚀 Custom Invitation Published! URL: http://localhost:3003?event=${slug}`, "success");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      showToast(`Error saving invitation: ${errMsg}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const invitationUrl = `http://localhost:3003?event=${slug}`;

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
          <span>{toastType === "success" ? "✓" : toastType === "error" ? "⚠️" : "ℹ"}</span>
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
              ← Back to Orders
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
                fontWeight: 800,
                fontSize: "0.9rem",
              }}
            >
              IS
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#231F20", margin: 0 }}>
                  Invitation Studio
                </h2>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    background: "rgba(212, 175, 55, 0.2)",
                    color: "#856404",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                  }}
                >
                  {occasionType}
                </span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
                Order #{selectedOrderId} • {eventTitle}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Controls (Order switch, Occasion, Max Capacity) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Order Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A6F6D" }}>Order:</span>
            <select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "#FFF",
              }}
            >
              {Object.keys(DEMO_ORDERS).map((ordId) => (
                <option key={ordId} value={ordId}>
                  #{ordId} - {DEMO_ORDERS[ordId].eventTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A6F6D" }}>Occasion:</span>
            <select
              value={occasionType}
              onChange={(e) =>
                setOccasionType(e.target.value as AsarInvitationDocument["occasionType"])
              }
              style={{
                padding: "0.35rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "#FFF",
              }}
            >
              <option value="wedding">Wedding (زفاف)</option>
              <option value="engagement">Engagement (خطوبة)</option>
              <option value="gala">VIP Gala (حفل خيري/رسمي)</option>
              <option value="festival">Music & Art Festival (مهرجان)</option>
              <option value="corporate">Corporate Summit (مؤتمر أعمال)</option>
              <option value="graduation">Graduation (تخرج)</option>
            </select>
          </div>

          {/* Max Venue Capacity Input */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#7A6F6D" }}>Max Capacity:</span>
            <input
              type="number"
              min={1}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 0)}
              style={{
                width: "70px",
                padding: "0.35rem 0.5rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.8rem",
                fontWeight: 700,
                textAlign: "center",
              }}
              title="Used by the Client RSVP Mailbox capacity meter"
            />
            <span style={{ fontSize: "0.75rem", color: "#7A6F6D" }}>guests</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
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
            title="Populates event info and adds custom RSVP fields requested by the client"
          >
            📥 Apply Client Requests
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
            📱 Generate QR
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
            {isSaving ? "Saving..." : "🚀 Save & Publish"}
          </button>
        </div>
      </header>

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
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
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
                boxShadow: activeTab === "theme" ? "0 4px 12px rgba(107, 29, 40, 0.2)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              1. Theme, Palette & Shaders
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
                background: activeTab === "sections" ? "#6B1D28" : "transparent",
                color: activeTab === "sections" ? "#FFFFFF" : "#7A6F6D",
                boxShadow: activeTab === "sections" ? "0 4px 12px rgba(107, 29, 40, 0.2)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              2. Composable Page Sections ({blocks.filter((b) => b.isVisible).length})
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
                boxShadow: activeTab === "form" ? "0 4px 12px rgba(107, 29, 40, 0.2)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              3. Dynamic RSVP Form (🔒 Email Locked)
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
              <ThemeAndEffectsPanel themeConfig={themeConfig} onChange={setThemeConfig} />
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
                blocks={blocks}
                onChange={setBlocks}
                onNavigateToFormBuilder={() => setActiveTab("form")}
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
          <LiveInvitationPreview
            themeConfig={themeConfig}
            blocks={blocks}
            formFields={formFields}
            eventSlug={slug}
          />
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
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#231F20", margin: 0 }}>
                Invitation Landing QR Code
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#7A6F6D", marginTop: "0.25rem" }}>
                Guests can scan this code to view the live bespoke event invitation.
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    invitationUrl
                  )}&color=6B1D28`}
                  alt="Invitation QR Code"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6B1D28" }}>
                {eventTitle}
              </div>
              <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#7A6F6D" }}>
                {invitationUrl}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(invitationUrl);
                  showToast("Copied invitation link to clipboard!", "info");
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
                Copy Link 📋
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
                Done ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
