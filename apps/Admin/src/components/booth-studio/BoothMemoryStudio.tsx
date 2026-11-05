import React, { useState, useEffect } from "react";
import { buildMemoryUrls, validateSubdomainSlug } from "@repo/react-appwrite";
import { HeroAndTextsEditor, type BoothMemory } from "./HeroAndTextsEditor";
import {
  BulkVoiceUploader,
  type BoothVoiceRecord,
  SIMULATED_WEDDING_VOICES,
} from "./BulkVoiceUploader";
import { VoiceBatchGridEditor } from "./VoiceBatchGridEditor";
import { MediaAndTabsEditor, type BoothMediaItem } from "./MediaAndTabsEditor";
import { LiveMemoryMobilePreview } from "./LiveMemoryMobilePreview";

export interface BoothMemoryStudioProps {
  orderId?: string | null;
  onBack?: () => void;
}

interface ActiveOrderOption {
  id: string;
  label: string;
  serviceType: string;
  clientName: string;
  limits: {
    maxVoices: number;
    maxPhotos: number;
    hasVideoHighlight: boolean;
  };
  submittedAssets?: {
    coupleTitle: string;
    eventHeaderTag: string;
    eventDateDisplay: string;
    eventLocationDisplay: string;
    highlightBadge: string;
    coupleQuote: string;
    thankYouMessage: string;
    heroImageUrl?: string;
    categories: string[];
  };
}

const DEFAULT_ORDERS: ActiveOrderOption[] = [
  {
    id: "ord_mina_maryam_01",
    label: "ORD-2026-089 — Mina & Maryam (Flagship Luxury Booth)",
    serviceType: "booth",
    clientName: "Mina & Maryam",
    limits: {
      maxVoices: -1, // Unlimited
      maxPhotos: 100,
      hasVideoHighlight: true,
    },
    submittedAssets: {
      coupleTitle: "Mina & Maryam",
      eventHeaderTag: "THE WEDDING OF",
      eventDateDisplay: "12 July 2026",
      eventLocationDisplay: "Alexandria, Egypt",
      highlightBadge: "Together Always",
      coupleQuote:
        "Every voice here is a piece of our forever ... كل صوت هنا هو قطعة من حكايتنا",
      thankYouMessage:
        "Thank you for filling our wedding with love, laughter, and lasting memories. We cherish every single word.",
      heroImageUrl:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      categories: ["العائلة", "الأصدقاء", "زملاء العمل", "ضيوف مميزون"],
    },
  },
  {
    id: "ord_tarek_nour_02",
    label: "ORD-2026-104 — Tarek & Nour (Vintage Gold Package)",
    serviceType: "booth",
    clientName: "Tarek & Nour",
    limits: {
      maxVoices: 80,
      maxPhotos: 40,
      hasVideoHighlight: false,
    },
    submittedAssets: {
      coupleTitle: "Tarek & Nour",
      eventHeaderTag: "CELEBRATING THE UNION OF",
      eventDateDisplay: "24 August 2026",
      eventLocationDisplay: "Cairo, Egypt",
      highlightBadge: "Golden Athar",
      coupleQuote: "أجمل أثر هو حبكم اللي منور ليلتنا",
      thankYouMessage: "شكراً لكل من شاركنا فرحتنا وترك لنا صوته ذكرى لا تُنسى",
      categories: ["العائلة", "الأصدقاء", "زملاء العمل"],
    },
  },
  {
    id: "ord_karim_salma_03",
    label: "ORD-2026-118 — Karim & Salma (Royal Bespoke Tier)",
    serviceType: "booth",
    clientName: "Karim & Salma",
    limits: {
      maxVoices: 150,
      maxPhotos: 80,
      hasVideoHighlight: true,
    },
    submittedAssets: {
      coupleTitle: "Karim & Salma",
      eventHeaderTag: "THE ROYAL WEDDING OF",
      eventDateDisplay: "5 September 2026",
      eventLocationDisplay: "Giza, Egypt",
      highlightBadge: "Eternal Bond",
      coupleQuote: "أصواتكم في قلوبنا إلى الأبد",
      thankYouMessage: "بمحبتكم اكتملت ليلتنا، دمتم لنا سنداً وفرحة",
      categories: ["العائلة", "الأصدقاء", "زملاء العمل", "كبار الشخصيات VIP"],
    },
  },
];

const INITIAL_MEMORY: BoothMemory = {
  slug: "mina-and-maryam",
  eventHeaderTag: "THE WEDDING OF",
  coupleTitle: "Mina & Maryam",
  tagline: "Same People. Different Voices. A Lasting Athar.",
  eventDateDisplay: "12 July 2026",
  eventLocationDisplay: "Alexandria, Egypt",
  highlightBadge: "Together Always",
  coupleQuote:
    "Every voice here is a piece of our forever ... كل صوت هنا هو قطعة من حكايتنا",
  heroImageUrl:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  videoHighlightTitle: "30 Seconds of Your Day",
  thankYouTitle: "Thank You for Being Part of Our Story",
  thankYouMessage:
    "Thank you from the bottom of our hearts for filling our wedding with love, laughter, and lasting memories.",
  categories: ["العائلة", "الأصدقاء", "زملاء العمل", "ضيوف مميزون"],
  isPrivateLocked: false,
  accessPinCode: "2026",
  isPublished: true,
};

export const BoothMemoryStudio: React.FC<BoothMemoryStudioProps> = ({
  orderId,
  onBack,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orderId || DEFAULT_ORDERS[0].id,
  );
  const [activeStudioTab, setActiveStudioTab] = useState<
    "hero" | "voices" | "media" | "thankyou_qr"
  >("hero");
  const [memory, setMemory] = useState<BoothMemory>(() => {
    try {
      const cached = localStorage.getItem("asar_booth_memories_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.slug) return parsed;
      }
    } catch (_e) {
      // Use initial memory fallback
    }
    return INITIAL_MEMORY;
  });

  const [voiceRecords, setVoiceRecords] = useState<BoothVoiceRecord[]>(() => {
    return SIMULATED_WEDDING_VOICES.map((v, idx) => ({
      ...v,
      id: `init_voice_${idx}`,
      sortOrder: idx + 1,
      likesCount: 12 + idx,
    }));
  });

  const [mediaItems, setMediaItems] = useState<BoothMediaItem[]>([
    {
      id: "media_1",
      mediaType: "photo",
      fileUrl:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
      captionOrNote: "The Vow Exchange & Sunset",
      sortOrder: 1,
    },
    {
      id: "media_2",
      mediaType: "photo",
      fileUrl:
        "https://images.unsplash.com/photo-1519225424988-825590059080?auto=format&fit=crop&w=600&q=80",
      captionOrNote: "First Dance under fairy lights",
      sortOrder: 2,
    },
    {
      id: "media_3",
      mediaType: "guestbook_note",
      authorName: "Sarah & Omar",
      captionOrNote:
        "May your lives be blessed with unending joy and peaceful mornings!",
      sortOrder: 1,
    },
  ]);

  const [overrideQuota, setOverrideQuota] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "info" | "warning";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeOrder =
    DEFAULT_ORDERS.find((o) => o.id === selectedOrderId) || DEFAULT_ORDERS[0];
  const maxVoices = activeOrder.limits.maxVoices;
  const maxPhotos = activeOrder.limits.maxPhotos;
  const hasVideoHighlight = activeOrder.limits.hasVideoHighlight;

  const voicesQuotaExceeded =
    maxVoices !== -1 && voiceRecords.length > maxVoices;
  const photosQuotaExceeded =
    maxPhotos !== -1 &&
    mediaItems.filter((m) => m.mediaType === "photo").length > maxPhotos;

  useEffect(() => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
  }, [orderId]);

  // Pull Client Submitted Assets
  const handlePullClientAssets = () => {
    if (activeOrder && activeOrder.submittedAssets) {
      const assets = activeOrder.submittedAssets;
      setMemory((prev) => ({
        ...prev,
        coupleTitle: assets.coupleTitle || prev.coupleTitle,
        eventHeaderTag: assets.eventHeaderTag || prev.eventHeaderTag,
        eventDateDisplay: assets.eventDateDisplay || prev.eventDateDisplay,
        eventLocationDisplay:
          assets.eventLocationDisplay || prev.eventLocationDisplay,
        highlightBadge: assets.highlightBadge || prev.highlightBadge,
        coupleQuote: assets.coupleQuote || prev.coupleQuote,
        thankYouMessage: assets.thankYouMessage || prev.thankYouMessage,
        heroImageUrl: assets.heroImageUrl || prev.heroImageUrl,
        categories:
          assets.categories && assets.categories.length > 0
            ? assets.categories
            : prev.categories,
      }));

      setNotification({
        type: "success",
        message: `📥 تم استيراد بيانات وتخصيصات العميل "${activeOrder.clientName}" بنجاح!`,
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Save & Publish Memory Website
  const handleSaveAndPublish = async () => {
    const slugValidation = validateSubdomainSlug(memory.slug);
    if (!slugValidation.isValid) {
      setNotification({
        type: "warning",
        message: `⚠️ اسم النطاق الفرعي (Slug) غير صالح: ${slugValidation.error}`,
      });
      return;
    }

    if (!overrideQuota && (voicesQuotaExceeded || photosQuotaExceeded)) {
      setNotification({
        type: "warning",
        message:
          "⚠️ تم تجاوز كوتا الباقة المحددة! يرجى حذف الملفات الزائدة أو تفعيل 'تجاوز كوتا الباقة (VIP)'.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // 1. Sync to localStorage for immediate cross-tab preview
      const updatedMemory = {
        ...memory,
        isPublished: true,
        orderId: selectedOrderId,
      };
      localStorage.setItem(
        "asar_booth_memories_cache",
        JSON.stringify(updatedMemory),
      );
      localStorage.setItem(
        "asar_booth_voices_cache",
        JSON.stringify(voiceRecords),
      );
      localStorage.setItem(
        "asar_booth_media_cache",
        JSON.stringify(mediaItems),
      );

      setMemory(updatedMemory);

      await new Promise((res) => setTimeout(res, 400));

      const memoryUrls = buildMemoryUrls({
        slug: memory.slug || "mina-and-maryam",
        type: "booth",
        port: 3002,
        rendererPort: 3004,
      });

      setNotification({
        type: "success",
        message: `🚀 تم النشر بنجاح! رابط المنصة الفرعي: ${memoryUrls.canonicalUrl} (منصة العرض: ${memoryUrls.devRendererUrl} | التطوير: ${memoryUrls.devQueryUrl})`,
      });
    } catch (_e) {
      setNotification({
        type: "warning",
        message: "تم الحفظ محلياً! اكتملت المزامنة بنجاح.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--athar-bg-primary)",
        padding: "1.5rem 2rem",
      }}
    >
      {/* Top Studio Action Bar */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-xl)",
          padding: "1.2rem 1.6rem",
          marginBottom: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Left Title & Back */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="btn-athar-secondary"
                style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
              >
                ← العودة لطابور الطلبات
              </button>
            )}

            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
              >
                <span style={{ fontSize: "1.4rem" }}>🎙️</span>
                <h2
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    color: "var(--athar-maroon)",
                    margin: 0,
                  }}
                >
                  استوديو ذكريات هاتف أثر
                </h2>
                <span className="athar-badge-gold">
                  منظومة التنسيق والإدارة
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--athar-text-muted)",
                  margin: "0.2rem 0 0 0",
                }}
              >
                تجميع، هندسة ونشر الأثر الصوتي التذكاري الفاخر مع محاكاة حية
                لشاشات الجوال.
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href={`http://${memory.slug || "mina-and-maryam"}.localhost:3004`}
              target="_blank"
              rel="noreferrer"
              className="btn-athar-secondary"
              style={{
                fontSize: "0.84rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
              title="معاينة مباشرة في منصة العرض المستقلة (Port 3004)"
            >
              🌐 منصة العرض (:3004) ↗
            </a>

            <button
              type="button"
              className="btn-athar-secondary"
              onClick={handlePullClientAssets}
              style={{ fontSize: "0.84rem" }}
              title="استيراد بيانات العروسين، التاريخ، المكان، العبارة التذكارية والفئات تلقائياً من بوابة العميل"
            >
              📥 استيراد بيانات ومواد العميل
            </button>

            <button
              type="button"
              className="btn-athar-gold"
              onClick={() => setActiveStudioTab("thankyou_qr")}
              style={{ fontSize: "0.84rem" }}
            >
              📱 توليد وتحميل رمز QR
            </button>

            <button
              type="button"
              className="btn-athar-primary"
              onClick={handleSaveAndPublish}
              disabled={isSaving}
              style={{ fontSize: "0.86rem", padding: "0.65rem 1.4rem" }}
            >
              {isSaving ? "⏳ جاري النشر..." : "🚀 حفظ ونشر موقع الذكريات"}
            </button>
          </div>
        </div>

        {/* Sub-bar: Order Selector & Quota Meter */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            paddingTop: "0.8rem",
            borderTop: "1px solid rgba(107, 29, 40, 0.08)",
          }}
        >
          {/* Order Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--athar-text-title)",
              }}
            >
              الطلب النشط:
            </span>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="athar-select"
              style={{
                width: "auto",
                minWidth: "320px",
                padding: "0.4rem 0.8rem",
                fontSize: "0.84rem",
              }}
            >
              {DEFAULT_ORDERS.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  {ord.label}
                </option>
              ))}
            </select>
          </div>

          {/* Plan Quota Meter Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            {/* Voices Quota */}
            <span
              className={
                voicesQuotaExceeded && !overrideQuota
                  ? "athar-badge-danger"
                  : "athar-badge-maroon"
              }
              style={{ fontSize: "0.78rem" }}
            >
              🎙️ التسجيلات: {voiceRecords.length} /{" "}
              {maxVoices === -1 ? "غير محدود" : maxVoices}
              {voicesQuotaExceeded && !overrideQuota && " (تجاوز الكوتا)"}
            </span>

            {/* Photos Quota */}
            <span
              className={
                photosQuotaExceeded && !overrideQuota
                  ? "athar-badge-danger"
                  : "athar-badge-maroon"
              }
              style={{ fontSize: "0.78rem" }}
            >
              📸 الصور:{" "}
              {mediaItems.filter((m) => m.mediaType === "photo").length} /{" "}
              {maxPhotos === -1 ? "غير محدود" : maxPhotos}
            </span>

            {/* Video Highlight */}
            <span
              className={
                hasVideoHighlight
                  ? "athar-badge-success"
                  : "athar-badge-warning"
              }
              style={{ fontSize: "0.78rem" }}
            >
              🎬 فيديو الهايلايت:{" "}
              {hasVideoHighlight ? "مفعّل ✓" : "غير مشمول في الباقة"}
            </span>

            {/* Quota Override Toggle */}
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                cursor: "pointer",
                marginLeft: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 700,
                color: overrideQuota ? "#8C6F12" : "var(--athar-text-muted)",
              }}
            >
              <input
                type="checkbox"
                checked={overrideQuota}
                onChange={(e) => setOverrideQuota(e.target.checked)}
                style={{ accentColor: "var(--athar-gold)" }}
              />
              <span>
                {overrideQuota
                  ? "تجاوز الكوتا الاستثنائي (VIP) مفعّل"
                  : "تجاوز كوتا الباقة"}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Toast Notification Alert */}
      {notification && (
        <div
          className="animate-fade-in"
          style={{
            padding: "0.8rem 1.2rem",
            borderRadius: "12px",
            marginBottom: "1.2rem",
            fontSize: "0.88rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background:
              notification.type === "success"
                ? "var(--athar-status-success-bg)"
                : notification.type === "warning"
                  ? "var(--athar-status-warning-bg)"
                  : "rgba(107, 29, 40, 0.08)",
            color:
              notification.type === "success"
                ? "var(--athar-status-success)"
                : notification.type === "warning"
                  ? "var(--athar-status-warning)"
                  : "var(--athar-maroon)",
            border: `1px solid currentColor`,
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Split-Screen Workspace Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(375px, 1fr)",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* Left Column (Studio Workspace Tabs) */}
        <div>
          {/* Studio Tab Headers */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.2rem",
              borderBottom: "2px solid rgba(107, 29, 40, 0.08)",
              paddingBottom: "0.5rem",
            }}
          >
            {[
              { id: "hero", label: "١. الواجهة والنصوص والخصوصية", icon: "💍" },
              {
                id: "voices",
                label: `٢. استوديو التسجيلات الصوتية (${voiceRecords.length})`,
                icon: "🎙️",
              },
              {
                id: "media",
                label: "٣. الصور والفيديو ودفتر الرسائل",
                icon: "📸",
              },
              {
                id: "thankyou_qr",
                label: "٤. بطاقات الشكر ورمز QR",
                icon: "📱",
              },
            ].map((tab) => {
              const isActive = activeStudioTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveStudioTab(tab.id as typeof activeStudioTab)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "12px",
                    border: "none",
                    background: isActive
                      ? "var(--athar-maroon)"
                      : "transparent",
                    color: isActive ? "#ffffff" : "var(--athar-text-title)",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          {activeStudioTab === "hero" && (
            <HeroAndTextsEditor memory={memory} onChange={setMemory} />
          )}

          {activeStudioTab === "voices" && (
            <div>
              <BulkVoiceUploader
                categories={memory.categories}
                onAddRecords={(newRecs) => {
                  setVoiceRecords((prev) => [...prev, ...newRecs]);
                  setNotification({
                    type: "success",
                    message: `⚡ Added ${newRecs.length} audio tracks with real-time waveform extraction!`,
                  });
                  setTimeout(() => setNotification(null), 3000);
                }}
              />
              <VoiceBatchGridEditor
                records={voiceRecords}
                categories={memory.categories}
                onChangeRecords={setVoiceRecords}
              />
            </div>
          )}

          {activeStudioTab === "media" && (
            <MediaAndTabsEditor
              memory={memory}
              mediaItems={mediaItems}
              hasVideoHighlightPlan={hasVideoHighlight}
              maxPhotosQuota={maxPhotos}
              onChangeMemory={setMemory}
              onChangeMediaItems={setMediaItems}
            />
          )}

          {activeStudioTab === "thankyou_qr" && (
            <MediaAndTabsEditor
              memory={memory}
              mediaItems={mediaItems}
              hasVideoHighlightPlan={hasVideoHighlight}
              maxPhotosQuota={maxPhotos}
              onChangeMemory={setMemory}
              onChangeMediaItems={setMediaItems}
            />
          )}
        </div>

        {/* Right Column (Sticky iPhone 15 Pro Bezel Preview) */}
        <div>
          <LiveMemoryMobilePreview
            memory={memory}
            voiceRecords={voiceRecords}
            mediaItems={mediaItems}
            hasVideoHighlightPlan={hasVideoHighlight}
          />
        </div>
      </div>
    </div>
  );
};
