import React, { useMemo } from "react";
import type {
  InvitationDocument,
  ThemeConfig,
  ScheduleItem,
  GalleryItem,
  DressCodeConfig,
  DynamicFormField,
} from "../components/renderer/types";
import {
  ThemeWrapper,
  EventHeroSection,
  EventCountdownSection,
  EventScheduleSection,
  EventLocationMap,
  EventMediaGallery,
  DynamicRsvpForm,
} from "../components/renderer";

export interface CustomEventPageProps {
  slug?: string;
  onBack?: () => void;
  onOpenPass?: (rsvpId: string) => void;
}

export const INVITATION_PRESETS: Record<string, InvitationDocument> = {
  "omar-and-layla": {
    id: "inv-preset-1",
    $id: "inv-preset-1",
    slug: "omar-and-layla",
    eventTitle: "حفل زفاف عمر وليلى · The Wedding of Omar & Layla",
    occasionType: "wedding",
    eventDate: "2026-11-20",
    eventTime: "19:30 AST",
    venueName: "فندق فورسيزونز سان ستيفانو - الإسكندرية",
    venueAddress: "طريق الجيش، سان ستيفانو، الإسكندرية، مصر",
    tagline: "يتشرفان بدعوة سيادتكم لمشاركتهما فرحة العمر في ليلة لا تُنسى على ضفاف البحر الأبيض المتوسط.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    themeConfigJson: {
      primaryColor: "#6B1D28",
      secondaryColor: "#D4AF37",
      themeVariant: "ivory-royal",
      fontFamily: "Amiri",
      direction: "rtl",
    },
    dressCodeJson: {
      title: "أزياء السهرة الرسمية الفاخرة · Black Tie & Evening Glamour",
      description: "يسعدنا تألقكم بأزياء السهرة الرسمية التي تليق بهذه الليلة الاستثنائية.",
      swatches: [
        { name: "العنابي الملكي", hex: "#6B1D28" },
        { name: "الذهب الشامباني", hex: "#D4AF37" },
        { name: "الأسود الأنيق", hex: "#1F1A1C" },
        { name: "الألباستر الدافئ", hex: "#FBF7F2" },
      ],
      notes: "خدمة صف السيارات (Valet Parking) متوفرة مجاناً لجميع السادة الضيوف عند المدخل الرئيسي.",
    },
  },

  "cairo-jazz-festival": {
    id: "inv-preset-2",
    $id: "inv-preset-2",
    slug: "cairo-jazz-festival",
    eventTitle: "مهرجان القاهرة الدولي للجاز · Cairo Jazz Festival 2026",
    occasionType: "festival",
    eventDate: "2026-12-05",
    eventTime: "18:00 CLT",
    venueName: "The Greek Campus - وسط البلد، القاهرة",
    venueAddress: "28 شارع الفلكي، باب اللوق، وسط البلد، القاهرة",
    tagline: "ملتقى كبار الموسيقيين والفنانين المستقلين في أسبوع من الإبداع والشغف في قلب القاهرة التاريخية.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    themeConfigJson: {
      primaryColor: "#B7791F",
      secondaryColor: "#D4AF37",
      themeVariant: "ivory-royal",
      fontFamily: "Cairo",
      direction: "rtl",
    },
    scheduleJson: [
      {
        timeOrYear: "18:00",
        title: "حفل الافتتاح ومعرض الفنون التشكيلية",
        description: "استقبال الحضور وجولة بين المعارض الفنية المستقلة وعروض العزف الحي.",
        badge: "Opening",
      },
      {
        timeOrYear: "19:30",
        title: "الفرقة الرئيسية: إيقاعات الجاز الشرقي",
        description: "عرض موسيقي ساحر يدمج المقامات الشرقية الأصيلة مع إيقاعات الجاز العالمي.",
        badge: "Main Stage",
      },
      {
        timeOrYear: "21:30",
        title: "جلسة العزف الارتجالي الحرة (Jam Session)",
        description: "جلسة تفاعلية مفتوحة يشارك فيها نخبة من عازفي الساكسفون والبيانو والدرامز.",
        badge: "Jam Session",
      },
    ],
    dressCodeJson: {
      title: "أزياء عصرية أنيقة · Creative Smart Casual",
      description: "نرحب بإطلالاتكم الإبداعية المريحة التي تعبر عن الروح الفنية للمهرجان.",
      swatches: [
        { name: "الذهب الدافئ", hex: "#B7791F" },
        { name: "الأزرق الليلي", hex: "#1E3A8A" },
        { name: "الكريمي الهادئ", hex: "#F4EFEA" },
      ],
      notes: "يُرجى إبراز بطاقة الدخول الرقمية (QR Code) عند بوابات التذاكر الإلكترونية.",
    },
  },

  "asar-leadership-gala": {
    id: "inv-preset-3",
    $id: "inv-preset-3",
    slug: "asar-leadership-gala",
    eventTitle: "قمة أثر السنوية للقيادة والابتكار · Asar Leadership Gala",
    occasionType: "gala",
    eventDate: "2026-11-12",
    eventTime: "19:30 AST",
    venueName: "The Grand Pavilion, St. Regis Almasa Hotel",
    venueAddress: "Al Masa Capital, New Administrative Capital, Cairo",
    tagline: "أمسية استثنائية تحتفي برواد الأعمال والمبتكرين وصناع القرار في الوطن العربي في أجواء راقية.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    themeConfigJson: {
      primaryColor: "#D4AF37",
      secondaryColor: "#E5C158",
      backgroundColor: "#161214",
      cardBackground: "rgba(31, 26, 28, 0.95)",
      themeVariant: "noir-obsidian",
      fontFamily: "Playfair Display",
      direction: "rtl",
    },
    dressCodeJson: {
      title: "أزياء السهرة الرسمية السوداء VIP · Black Tie VIP",
      description: "الأمسية تتطلب بدلات رسمية كاملة (Black Tie Tuxedo) وفساتين سهرة راقية.",
      swatches: [
        { name: "الأسود الأوبسيديان", hex: "#161214" },
        { name: "الذهب الملكي", hex: "#D4AF37" },
        { name: "الرمادي الفحمي", hex: "#2B282A" },
      ],
      notes: "الدخول حصري لحاملي بطاقات VIP المعتمدة مسبقاً مع مقاعد مخصصة بالاسم.",
    },
  },
};

export const CustomEventPage: React.FC<CustomEventPageProps> = ({
  slug = "omar-and-layla",
  onBack,
  onOpenPass,
}) => {
  // 1. Resolve invitation from preset, localStorage, or fallback
  const invitation: InvitationDocument | null = useMemo(() => {
    // Check built-in rich presets
    if (INVITATION_PRESETS[slug]) {
      return INVITATION_PRESETS[slug];
    }

    // Check localStorage cache if modified in studio
    try {
      const cache = localStorage.getItem("asar_invitations_cache");
      if (cache) {
        const list: InvitationDocument[] = JSON.parse(cache);
        const match = list.find((item) => item.slug === slug || item.$id === slug);
        if (match) return match;
      }
    } catch {
      // Ignore
    }

    return null;
  }, [slug]);

  // Parse theme config
  const themeConfig: ThemeConfig = useMemo(() => {
    if (!invitation) return {};
    if (typeof invitation.themeConfigJson === "string") {
      try {
        return JSON.parse(invitation.themeConfigJson);
      } catch {
        return {};
      }
    }
    return invitation.themeConfigJson || {};
  }, [invitation]);

  const isNoir = themeConfig.themeVariant === "noir-obsidian";

  // Parse custom sections data
  const scheduleItems: ScheduleItem[] | undefined = useMemo(() => {
    if (!invitation?.scheduleJson) return undefined;
    if (typeof invitation.scheduleJson === "string") {
      try {
        return JSON.parse(invitation.scheduleJson);
      } catch {
        return undefined;
      }
    }
    return invitation.scheduleJson;
  }, [invitation?.scheduleJson]);

  const galleryItems: GalleryItem[] | undefined = useMemo(() => {
    if (!invitation?.galleryJson) return undefined;
    if (typeof invitation.galleryJson === "string") {
      try {
        return JSON.parse(invitation.galleryJson);
      } catch {
        return undefined;
      }
    }
    return invitation.galleryJson;
  }, [invitation?.galleryJson]);

  const dressCodeConfig: DressCodeConfig | undefined = useMemo(() => {
    if (!invitation?.dressCodeJson) return undefined;
    if (typeof invitation.dressCodeJson === "string") {
      try {
        return JSON.parse(invitation.dressCodeJson);
      } catch {
        return undefined;
      }
    }
    return invitation.dressCodeJson;
  }, [invitation?.dressCodeJson]);

  const formSchema: DynamicFormField[] | undefined = useMemo(() => {
    if (!invitation?.formSchemaJson) return undefined;
    if (typeof invitation.formSchemaJson === "string") {
      try {
        return JSON.parse(invitation.formSchemaJson);
      } catch {
        return undefined;
      }
    }
    return invitation.formSchemaJson;
  }, [invitation?.formSchemaJson]);

  // If slug not found, show elegant luxury 404
  if (!invitation) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--athar-bg-primary)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          className="luxury-card"
          style={{
            maxWidth: "540px",
            padding: "3.5rem 2.5rem",
            border: "1.5px solid var(--athar-gold-border)",
            borderRadius: "28px",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏛️</div>
          <h2
            className="font-arabic-display"
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--athar-maroon)",
              marginBottom: "1rem",
            }}
          >
            هذه الدعوة غير متوفرة أو تم نقلها
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--athar-text-muted)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            لم نتمكن من العثور على موقع الدعوة المطلوب بالرابط: (<code>{slug}</code>). يرجى التأكد من
            صحة الرابط أو العودة لصفحة الخدمات الرئيسية.
          </p>
          {onBack && (
            <button type="button" onClick={onBack} className="btn-athar-primary">
              ← العودة إلى منصة الدعوات
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ThemeWrapper themeConfig={themeConfig} dir={themeConfig.direction || "rtl"}>
      {/* Top Floating Luxury Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: isNoir
            ? "rgba(22, 18, 20, 0.85)"
            : "rgba(251, 247, 242, 0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--athar-gold-border)",
          padding: "0.85rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1.5px solid var(--athar-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--athar-gold-bright)",
              fontWeight: 800,
              fontSize: "1rem",
              fontFamily: "var(--font-arabic-display)",
              backgroundColor: isNoir ? "#231A1E" : "#6B1D28",
            }}
          >
            أ
          </div>
          <div>
            <div
              style={{
                fontSize: "0.92rem",
                fontWeight: 700,
                color: isNoir ? "#FFFFFF" : "var(--athar-text-title)",
              }}
            >
              أثر للدعوات الفاخرة · Athar Privé
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--athar-gold)" }}>
              {invitation.occasionType.toUpperCase()} INVITATION
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn-athar-secondary"
              style={{ padding: "0.45rem 1rem", fontSize: "0.82rem" }}
            >
              ← المنصة
            </button>
          )}

          <a
            href="#rsvp-section"
            className="btn-athar-primary"
            style={{ padding: "0.45rem 1.15rem", fontSize: "0.82rem" }}
          >
            تأكيد الحضور
          </a>
        </div>
      </header>

      {/* Main Page Blocks Stack */}
      <main>
        {/* 1. Hero Block */}
        <EventHeroSection
          invitation={invitation}
          onRsvpClick={() => {
            document.getElementById("rsvp-section")?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* 2. Live Countdown Block */}
        <EventCountdownSection
          eventDate={invitation.eventDate}
          eventTime={invitation.eventTime}
          isNoir={isNoir}
        />

        {/* 3. Story & Schedule Block */}
        <EventScheduleSection items={scheduleItems} isNoir={isNoir} />

        {/* 4. Media & Memories Gallery Block */}
        <EventMediaGallery gallery={galleryItems} isNoir={isNoir} />

        {/* 5. Venue Map & Dress Code Block */}
        <EventLocationMap
          venueName={invitation.venueName}
          venueAddress={invitation.venueAddress}
          venueMapUrl={invitation.venueMapUrl}
          dressCode={dressCodeConfig}
          isNoir={isNoir}
        />

        {/* 6. Dynamic RSVP Form Block */}
        <DynamicRsvpForm
          invitation={invitation}
          schema={formSchema}
          isNoir={isNoir}
          onPreviewPass={onOpenPass}
        />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--athar-gold-border)",
          padding: "3rem 1.5rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: isNoir ? "#A8A8B7" : "var(--athar-text-muted)",
          backgroundColor: isNoir ? "#161214" : "var(--athar-bg-secondary)",
        }}
      >
        <div style={{ marginBottom: "0.5rem", fontWeight: 700, color: "var(--athar-gold)" }}>
          ✦ أثر لتخليد الذكريات وتنظيم الدعوات الفاخرة · ATHAR LUXURY EXPERIENCES ✦
        </div>
        <p>جميع الحقوق محفوظة © {new Date().getFullYear()} · صُممت هذه الدعوة لتليق بمقام ضيوفكم الكرام</p>
      </footer>
    </ThemeWrapper>
  );
};

export default CustomEventPage;
