// =============================================================
// ASAR (Athar / أثر) — Modular Section Domain Engine
// Discriminated union schema, validators, and backward-compatible parsers
// =============================================================

import type { DynamicFormField } from "./models.ts";

/**
 * All 11 supported modular section type literals.
 */
export type EventSectionType =
  | "cover_hero"
  | "couple_story"
  | "event_schedule"
  | "photo_gallery"
  | "wishing_wall"
  | "digital_gift_registry"
  | "background_audio"
  | "venue_location"
  | "live_countdown"
  | "custom_highlight"
  | "dynamic_rsvp";

export const ALL_EVENT_SECTION_TYPES: readonly EventSectionType[] = [
  "cover_hero",
  "couple_story",
  "event_schedule",
  "photo_gallery",
  "wishing_wall",
  "digital_gift_registry",
  "background_audio",
  "venue_location",
  "live_countdown",
  "custom_highlight",
  "dynamic_rsvp",
] as const;

/**
 * Base metadata shared by all modular website sections.
 */
export interface SectionBase {
  id: string;
  type: EventSectionType;
  title: string;
  titleAr?: string;
  enabled: boolean;
  order: number;
  isLocked?: boolean;
}

// -------------------------------------------------------------
// 1. Cover / Hero Section Model
// -------------------------------------------------------------
export interface CoverHeroSection extends SectionBase {
  type: "cover_hero";
  coupleTitle: string;
  dateDisplay: string;
  venueDisplay: string;
  headline?: string;
  coverImageUrl?: string;
  countdownEnabled?: boolean;
  audioPromptBadge?: string;
  overline?: string;
  tagline?: string;
  waxSealMonogram?: string;
  envelopeEnabled?: boolean;
}

// -------------------------------------------------------------
// 2. Couple Story Section Model
// -------------------------------------------------------------
export interface CoupleStoryMilestone {
  id: string;
  yearOrDate: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface CoupleStorySection extends SectionBase {
  type: "couple_story";
  subtitle?: string;
  milestones: CoupleStoryMilestone[];
}

// -------------------------------------------------------------
// 3. Event Schedule Section Model
// -------------------------------------------------------------
export interface ScheduleItem {
  id: string;
  time: string;
  eventName: string;
  locationName?: string;
  address?: string;
  mapUrl?: string;
  dressCode?: string;
  calendarSummary?: string;
  calendarDescription?: string;
}

export interface EventScheduleSection extends SectionBase {
  type: "event_schedule";
  subtitle?: string;
  scheduleItems: ScheduleItem[];
}

// -------------------------------------------------------------
// 4. Photo Gallery Section Model
// -------------------------------------------------------------
export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  category?: string;
}

export type GalleryLayoutMode = "masonry" | "grid" | "carousel";

export interface PhotoGallerySection extends SectionBase {
  type: "photo_gallery";
  subtitle?: string;
  layoutMode: GalleryLayoutMode;
  images: GalleryImage[];
  categories: string[];
}

// -------------------------------------------------------------
// 5. Wishing Wall Section Model
// -------------------------------------------------------------
export interface WishingWallSection extends SectionBase {
  type: "wishing_wall";
  subtitle?: string;
  moderationRequired: boolean;
  greetingPrompt: string;
  placeholder: string;
  allowReactions: boolean;
  maxMessageLength: number;
}

// -------------------------------------------------------------
// 6. Digital Gift Registry / Bank QR Section Model
// -------------------------------------------------------------
export interface GiftAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchName?: string;
  qrImageUrl?: string;
  transferMemo?: string;
  currency?: string;
}

export interface DigitalGiftRegistrySection extends SectionBase {
  type: "digital_gift_registry";
  subtitle?: string;
  greetingNote: string;
  accounts: GiftAccount[];
  cashGiftingEnabled: boolean;
  cashGiftingInstructions?: string;
}

// -------------------------------------------------------------
// 7. Background Audio Soundtrack Section Model
// -------------------------------------------------------------
export interface BackgroundAudioSection extends SectionBase {
  type: "background_audio";
  songTitle: string;
  artistName: string;
  audioUrl: string;
  autoPlayNotice: string;
  loopEnabled: boolean;
  initialMuted: boolean;
}

// -------------------------------------------------------------
// 8. Venue Location & Navigation Section Model
// -------------------------------------------------------------
export interface DressCodeSwatch {
  hex: string;
  label: string;
}

export interface VenueLocationSection extends SectionBase {
  type: "venue_location";
  venueName: string;
  address: string;
  mapCoordinates?: {
    lat: number;
    lng: number;
  };
  mapEmbedUrl?: string;
  parkingNote?: string;
  dressCodeTitle?: string;
  dressCodeSwatches?: DressCodeSwatch[];
}

// -------------------------------------------------------------
// 9. Live Countdown Section Model
// -------------------------------------------------------------
export interface LiveCountdownSection extends SectionBase {
  type: "live_countdown";
  targetDateIso: string;
  heading: string;
  completedMessage: string;
}

// -------------------------------------------------------------
// 10. Custom Editorial Highlight Section Model
// -------------------------------------------------------------
export interface CustomHighlightSection extends SectionBase {
  type: "custom_highlight";
  badge?: string;
  quoteText: string;
  author?: string;
  backgroundStyle?: "alabaster" | "obsidian" | "burgundy" | "glass" | string;
  imageUrl?: string;
}

// -------------------------------------------------------------
// 11. Dynamic RSVP Section Model
// -------------------------------------------------------------
export interface DynamicRsvpSection extends SectionBase {
  type: "dynamic_rsvp";
  subtitle?: string;
  deadlineDate?: string;
  capacityLimit?: number;
  formSchema: DynamicFormField[];
  allowPlusOnes: boolean;
  maxCompanions: number;
  askDietary: boolean;
  askTransportation: boolean;
}

/**
 * Discriminated union of all 11 concrete modular event section types.
 */
export type EventSection =
  | CoverHeroSection
  | CoupleStorySection
  | EventScheduleSection
  | PhotoGallerySection
  | WishingWallSection
  | DigitalGiftRegistrySection
  | BackgroundAudioSection
  | VenueLocationSection
  | LiveCountdownSection
  | CustomHighlightSection
  | DynamicRsvpSection;

/**
 * Top-level container configuration persisted in Appwrite `invitations.sectionsConfigJson`.
 */
export interface ModularWebsiteConfig {
  version: "2.0";
  sections: EventSection[];
  themeConfig?: Record<string, unknown>;
  metadata?: {
    lastEditedAt: string;
    publishedAt?: string;
  };
}

// -------------------------------------------------------------
// Default RSVP Locked Form Schema Helpers
// -------------------------------------------------------------
export const DEFAULT_LOCKED_RSVP_EMAIL_FIELD: DynamicFormField = {
  id: "field-rsvp-email",
  name: "guestEmail",
  labelEn: "Email Address",
  labelAr: "البريد الإلكتروني",
  type: "email",
  required: true,
  locked: true,
  placeholderEn: "your.name@example.com",
  placeholderAr: "name@example.com",
  helperTextEn: "Required for receiving your VIP QR access pass.",
  helperTextAr: "مطلوب لاستلام بطاقة الدخول الذكية QR.",
};

export const DEFAULT_RSVP_NAME_FIELD: DynamicFormField = {
  id: "field-rsvp-name",
  name: "guestName",
  labelEn: "Full Name",
  labelAr: "الاسم بالكامل",
  type: "text",
  required: true,
  locked: true,
  placeholderEn: "e.g. Karim El-Masry",
  placeholderAr: "مثال: كريم المصري",
};

export const DEFAULT_RSVP_COMPANIONS_FIELD: DynamicFormField = {
  id: "field-rsvp-companions",
  name: "companionsCount",
  labelEn: "Companions Attending",
  labelAr: "عدد المرافقين",
  type: "select",
  required: false,
  defaultValue: "0",
  options: [
    { labelEn: "Just Me (0)", labelAr: "أنا فقط (0)", value: "0" },
    { labelEn: "+1 Guest (1)", labelAr: "+1 مرافق (1)", value: "1" },
    { labelEn: "+2 Guests (2)", labelAr: "+2 مرافقين (2)", value: "2" },
    { labelEn: "+3 Guests (3)", labelAr: "+3 مرافقين (3)", value: "3" },
  ],
};

export const DEFAULT_RSVP_NOTE_FIELD: DynamicFormField = {
  id: "field-rsvp-note",
  name: "greetingNote",
  labelEn: "Blessing or Dietary Notes",
  labelAr: "كلمة للعروسين أو ملاحظات غذائية",
  type: "textarea",
  required: false,
  placeholderEn: "Share any warm wishes or special dietary preferences...",
  placeholderAr: "اكتب رسالة تهنئة أو أي متطلبات غذائية خاصة...",
};

/**
 * Generates an authentic default ModularWebsiteConfig populated with 11 standard sections.
 */
export function createDefaultModularWebsiteConfig(
  options?: Partial<{
    coupleTitle: string;
    eventDate: string;
    venueName: string;
  }>
): ModularWebsiteConfig {
  const coupleTitle = options?.coupleTitle || "Mina & Maryam";
  const eventDate = options?.eventDate || "2026-11-20";
  const venueName = options?.venueName || "Four Seasons Hotel, Alexandria";

  const sections: EventSection[] = [
    {
      id: "sec-hero-1",
      type: "cover_hero",
      title: "Cover & Hero",
      titleAr: "واجهة الدعوة",
      enabled: true,
      order: 1,
      coupleTitle,
      dateDisplay: eventDate,
      venueDisplay: venueName,
      headline: "The Wedding Celebration",
      overline: "TOGETHER WITH OUR FAMILIES",
      tagline: "Two souls, one timeless journey of devotion and joy.",
      coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
      countdownEnabled: true,
      audioPromptBadge: "Tap vinyl to play soundtrack",
      envelopeEnabled: true,
      waxSealMonogram: "M&M",
    },
    {
      id: "sec-audio-2",
      type: "background_audio",
      title: "Atmospheric Soundtrack",
      titleAr: "الموسيقى التصويرية",
      enabled: true,
      order: 2,
      songTitle: "Clair de Lune (Acoustic Piano & Strings)",
      artistName: "Claude Debussy (Athar Ensemble)",
      audioUrl: "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-piano-538.mp3",
      autoPlayNotice: "Tap vinyl icon to start background music",
      loopEnabled: true,
      initialMuted: false,
    },
    {
      id: "sec-countdown-3",
      type: "live_countdown",
      title: "Celebration Countdown",
      titleAr: "العد التنازلي للحدث",
      enabled: true,
      order: 3,
      targetDateIso: `${eventDate}T18:00:00.000Z`,
      heading: "Counting Down to Forever",
      completedMessage: "Today is the Day! Celebrating Together Now",
    },
    {
      id: "sec-story-4",
      type: "couple_story",
      title: "Our Love Story",
      titleAr: "قصتنا",
      enabled: true,
      order: 4,
      subtitle: "The chapters that brought us together",
      milestones: [
        {
          id: "mile-1",
          yearOrDate: "October 2021",
          title: "The First Coffee",
          description: "A chance meeting at an art gallery cafe in Zamalek that turned into hours of shared laughter.",
          imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "mile-2",
          yearOrDate: "December 2023",
          title: "She Said Yes!",
          description: "Under the sunset overlooking the Mediterranean shore, forever became our destination.",
          imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "mile-3",
          yearOrDate: "November 2026",
          title: "Our Forever Begins",
          description: "Surrounded by our dearest family and friends as we unite our lives in celebration.",
          imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
        },
      ],
    },
    {
      id: "sec-schedule-5",
      type: "event_schedule",
      title: "Celebration Itinerary",
      titleAr: "برنامج الحفل",
      enabled: true,
      order: 5,
      subtitle: "Join us for every magical moment",
      scheduleItems: [
        {
          id: "sch-1",
          time: "05:00 PM",
          eventName: "Welcome Elixirs & Arrival",
          locationName: "Grand Foyer",
          address: venueName,
          mapUrl: "https://maps.google.com/?q=" + encodeURIComponent(venueName),
          dressCode: "Formal Cocktail",
          calendarSummary: "Welcome Elixirs - " + coupleTitle,
          calendarDescription: "Guest arrival, signature drinks, and ambient string quartet.",
        },
        {
          id: "sch-2",
          time: "06:30 PM",
          eventName: "Holy Matrimony & Vows",
          locationName: "Palatial Sea Court",
          address: venueName,
          mapUrl: "https://maps.google.com/?q=" + encodeURIComponent(venueName),
          dressCode: "Black Tie / Traditional Formal",
          calendarSummary: "Vows & Ceremony - " + coupleTitle,
          calendarDescription: "Vow exchange under the stars.",
        },
        {
          id: "sch-3",
          time: "08:00 PM",
          eventName: "Royal Banquet & Celebrations",
          locationName: "Alexandria Ballroom",
          address: venueName,
          mapUrl: "https://maps.google.com/?q=" + encodeURIComponent(venueName),
          dressCode: "Formal Evening",
          calendarSummary: "Banquet & Party - " + coupleTitle,
          calendarDescription: "Dinner, cake cutting, live music, and dancing.",
        },
      ],
    },
    {
      id: "sec-gallery-6",
      type: "photo_gallery",
      title: "Moments & Memories",
      titleAr: "معرض الصور",
      enabled: true,
      order: 6,
      subtitle: "Glimpses from our pre-wedding journeys",
      layoutMode: "masonry",
      categories: ["All", "Engagement", "Travel", "Pre-Wedding"],
      images: [
        {
          id: "img-1",
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
          caption: "Under the golden hour archway",
          category: "Engagement",
        },
        {
          id: "img-2",
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
          caption: "Walking the shoreline together",
          category: "Travel",
        },
        {
          id: "img-3",
          url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80",
          caption: "An intimate candid portrait",
          category: "Pre-Wedding",
        },
        {
          id: "img-4",
          url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
          caption: "Laughter in the Mediterranean breeze",
          category: "Engagement",
        },
      ],
    },
    {
      id: "sec-wishing-7",
      type: "wishing_wall",
      title: "Wishing Wall & Guestbook",
      titleAr: "دفتر التهاني والبركات",
      enabled: true,
      order: 7,
      subtitle: "Leave your blessings and warm congratulations for the newlyweds",
      moderationRequired: false,
      greetingPrompt: "Leave a heartfelt blessing for the couple...",
      placeholder: "Write your congratulatory message here...",
      allowReactions: true,
      maxMessageLength: 300,
    },
    {
      id: "sec-gift-8",
      type: "digital_gift_registry",
      title: "Blessing Box & Digital Registry",
      titleAr: "صندوق الهدايا والبركة",
      enabled: true,
      order: 8,
      subtitle: "Your presence is our present, but if you wish to honor us with a gift",
      greetingNote: "We are deeply grateful for your love and support as we embark on our new life together.",
      accounts: [
        {
          id: "acc-1",
          bankName: "InstaPay (Egypt)",
          accountNumber: "mina.maryam@instapay",
          accountHolder: coupleTitle,
          branchName: "Direct Instant Transfer",
          qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=instapay%3Amina.maryam%40instapay",
          transferMemo: "Wedding Gift - " + coupleTitle,
          currency: "EGP",
        },
        {
          id: "acc-2",
          bankName: "Commercial International Bank (CIB)",
          accountNumber: "100049281726",
          accountHolder: coupleTitle,
          branchName: "Alexandria Branch",
          qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=cib%3A100049281726",
          transferMemo: "Wedding Gift - " + coupleTitle,
          currency: "EGP",
        },
      ],
      cashGiftingEnabled: true,
      cashGiftingInstructions: "A decorated traditional blessing box will also be available at the entrance reception.",
    },
    {
      id: "sec-venue-9",
      type: "venue_location",
      title: "Venue & Location Guide",
      titleAr: "موقع الحفل والوصول",
      enabled: true,
      order: 9,
      venueName,
      address: "Corniche Road, San Stefano, Alexandria, Egypt",
      mapCoordinates: { lat: 31.2435, lng: 29.9678 },
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3412.3!2d29.96!3d31.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDE0JzM2LjYiTiAyOcKwNTgnMDQuMSJF!5e0!3m2!1sen!2seg!4v1600000000000",
      parkingNote: "Complimentary valet parking is available at the main ballroom porte-cochère.",
      dressCodeTitle: "Formal Evening / Black Tie Elegance",
      dressCodeSwatches: [
        { hex: "#1A1A1A", label: "Tuxedo Midnight" },
        { hex: "#6B1D28", label: "Royal Maroon" },
        { hex: "#D4AF37", label: "Warm Gold" },
        { hex: "#F5EFE6", label: "Alabaster Cream" },
      ],
    },
    {
      id: "sec-highlight-10",
      type: "custom_highlight",
      title: "A Cordial Note of Gratitude",
      titleAr: "كلمة شكر وتقدير",
      enabled: true,
      order: 10,
      badge: "✦ WITH HEARTFELT GRATITUDE",
      quoteText: "To our parents, families, and dearest companions: your love, guidance, and unwavering support are the foundation upon which we begin this sacred chapter. We cannot wait to celebrate with each of you.",
      author: coupleTitle,
      backgroundStyle: "burgundy",
    },
    {
      id: "sec-rsvp-11",
      type: "dynamic_rsvp",
      title: "Confirm Your Attendance (RSVP)",
      titleAr: "تأكيد الحضور",
      enabled: true,
      order: 11,
      isLocked: true,
      subtitle: "Kindly respond by 01 November 2026 to ensure your seating reservation",
      deadlineDate: `${eventDate}T00:00:00.000Z`,
      capacityLimit: 250,
      formSchema: [
        DEFAULT_RSVP_NAME_FIELD,
        DEFAULT_LOCKED_RSVP_EMAIL_FIELD,
        DEFAULT_RSVP_COMPANIONS_FIELD,
        DEFAULT_RSVP_NOTE_FIELD,
      ],
      allowPlusOnes: true,
      maxCompanions: 3,
      askDietary: true,
      askTransportation: true,
    },
  ];

  return {
    version: "2.0",
    sections,
    themeConfig: {
      presetId: "royal-wedding",
      primaryColor: "#6B1D28",
      accentGoldColor: "#D4AF37",
      backgroundColor: "#0D0B0E",
      fontFamilyDisplay: "Amiri",
      fontFamilyBody: "Cairo",
      direction: "rtl",
    },
    metadata: {
      lastEditedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
  };
}

/**
 * Migration helper mapping legacy section block types to modern EventSectionType literals.
 */
function mapLegacyType(legacyType: string): EventSectionType {
  const norm = String(legacyType || "").toLowerCase().trim();
  switch (norm) {
    case "hero":
    case "cover":
    case "cover_hero":
      return "cover_hero";
    case "story":
    case "story_timeline":
    case "couple_story":
    case "milestones":
      return "couple_story";
    case "schedule":
    case "event_schedule":
    case "timeline":
      return "event_schedule";
    case "gallery":
    case "photo_gallery":
    case "album":
      return "photo_gallery";
    case "wishing_wall":
    case "guestbook":
    case "wishes":
      return "wishing_wall";
    case "gift_registry":
    case "blessing_box":
    case "digital_gift_registry":
    case "bank_qr":
      return "digital_gift_registry";
    case "audio":
    case "background_audio":
    case "music_player":
    case "soundtrack":
      return "background_audio";
    case "venue_location":
    case "location_map":
    case "venue_map":
    case "venue":
      return "venue_location";
    case "countdown":
    case "countdown_timer":
    case "live_countdown":
      return "live_countdown";
    case "dynamic_rsvp":
    case "rsvp_form":
    case "rsvp":
      return "dynamic_rsvp";
    case "custom_highlight":
    case "custom_text":
    case "highlight":
    default:
      return "custom_highlight";
  }
}

/**
 * Sanitizes and normalizes a single section into a strictly typed modern EventSection.
 */
function normalizeSection(raw: any, index: number): EventSection {
  const rawObj = raw && typeof raw === "object" ? raw : {};
  const rawType = String(rawObj.type || "").trim();
  const modernType = mapLegacyType(rawType);
  const id = String(rawObj.id || `sec-${modernType}-${index + 1}`);
  const title = String(rawObj.title || rawObj.titleEn || rawObj.mainTitle || "Section");
  const titleAr = rawObj.titleAr ? String(rawObj.titleAr) : undefined;
  const enabled = rawObj.enabled !== undefined ? Boolean(rawObj.enabled) : (rawObj.isVisible !== undefined ? Boolean(rawObj.isVisible) : true);
  const order = typeof rawObj.order === "number" && !isNaN(rawObj.order) ? rawObj.order : index + 1;
  const isLocked = Boolean(rawObj.isLocked);

  // If already v2 format (matching modern model), extract fields directly
  switch (modernType) {
    case "cover_hero":
      return {
        id,
        type: "cover_hero",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        coupleTitle: String(rawObj.coupleTitle || rawObj.mainTitle || "Event Celebration"),
        dateDisplay: String(rawObj.dateDisplay || rawObj.datePill || ""),
        venueDisplay: String(rawObj.venueDisplay || rawObj.venuePill || ""),
        headline: rawObj.headline ? String(rawObj.headline) : undefined,
        coverImageUrl: rawObj.coverImageUrl ? String(rawObj.coverImageUrl) : undefined,
        countdownEnabled: rawObj.countdownEnabled !== undefined ? Boolean(rawObj.countdownEnabled) : true,
        audioPromptBadge: rawObj.audioPromptBadge ? String(rawObj.audioPromptBadge) : undefined,
        overline: rawObj.overline ? String(rawObj.overline) : undefined,
        tagline: rawObj.tagline ? String(rawObj.tagline) : undefined,
        waxSealMonogram: rawObj.waxSealMonogram ? String(rawObj.waxSealMonogram) : undefined,
        envelopeEnabled: rawObj.envelopeEnabled !== undefined ? Boolean(rawObj.envelopeEnabled) : true,
      };

    case "couple_story":
      return {
        id,
        type: "couple_story",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        subtitle: rawObj.subtitle ? String(rawObj.subtitle) : undefined,
        milestones: Array.isArray(rawObj.milestones)
          ? rawObj.milestones.map((m: any, mIdx: number) => ({
              id: String(m.id || `mile-${mIdx + 1}`),
              yearOrDate: String(m.yearOrDate || m.date || ""),
              title: String(m.title || "Milestone"),
              description: String(m.description || ""),
              imageUrl: m.imageUrl ? String(m.imageUrl) : undefined,
            }))
          : Array.isArray(rawObj.timelineItems)
          ? rawObj.timelineItems.map((m: any, mIdx: number) => ({
              id: String(m.id || `mile-${mIdx + 1}`),
              yearOrDate: String(m.yearOrDate || m.time || ""),
              title: String(m.title || "Milestone"),
              description: String(m.description || ""),
              imageUrl: m.imageUrl ? String(m.imageUrl) : undefined,
            }))
          : [],
      };

    case "event_schedule":
      return {
        id,
        type: "event_schedule",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        subtitle: rawObj.subtitle ? String(rawObj.subtitle) : undefined,
        scheduleItems: Array.isArray(rawObj.scheduleItems)
          ? rawObj.scheduleItems.map((s: any, sIdx: number) => ({
              id: String(s.id || `sch-${sIdx + 1}`),
              time: String(s.time || ""),
              eventName: String(s.eventName || s.title || "Event Item"),
              locationName: s.locationName ? String(s.locationName) : undefined,
              address: s.address ? String(s.address) : undefined,
              mapUrl: s.mapUrl ? String(s.mapUrl) : undefined,
              dressCode: s.dressCode ? String(s.dressCode) : undefined,
              calendarSummary: s.calendarSummary ? String(s.calendarSummary) : undefined,
              calendarDescription: s.calendarDescription ? String(s.calendarDescription) : undefined,
            }))
          : Array.isArray(rawObj.timelineItems)
          ? rawObj.timelineItems.map((s: any, sIdx: number) => ({
              id: String(s.id || `sch-${sIdx + 1}`),
              time: String(s.time || ""),
              eventName: String(s.title || "Event Item"),
              locationName: s.locationName ? String(s.locationName) : undefined,
              address: s.address ? String(s.address) : undefined,
              mapUrl: s.mapUrl ? String(s.mapUrl) : undefined,
              dressCode: s.dressCode ? String(s.dressCode) : undefined,
            }))
          : [],
      };

    case "photo_gallery":
      return {
        id,
        type: "photo_gallery",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        subtitle: rawObj.subtitle ? String(rawObj.subtitle) : undefined,
        layoutMode: ["masonry", "grid", "carousel"].includes(rawObj.layoutMode)
          ? rawObj.layoutMode
          : (["masonry", "grid", "carousel"].includes(rawObj.galleryMode)
          ? rawObj.galleryMode
          : "masonry"),
        categories: Array.isArray(rawObj.categories) ? rawObj.categories.map(String) : ["All"],
        images: Array.isArray(rawObj.images)
          ? rawObj.images.map((img: any, iIdx: number) => ({
              id: String(img.id || `img-${iIdx + 1}`),
              url: String(img.url || img.imageUrl || ""),
              caption: img.caption ? String(img.caption) : undefined,
              category: img.category ? String(img.category) : undefined,
            }))
          : Array.isArray(rawObj.galleryImages)
          ? rawObj.galleryImages.map((imgUrl: string, iIdx: number) => ({
              id: `img-${iIdx + 1}`,
              url: String(imgUrl),
              caption: undefined,
              category: "All",
            }))
          : [],
      };

    case "wishing_wall":
      return {
        id,
        type: "wishing_wall",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        subtitle: rawObj.subtitle ? String(rawObj.subtitle) : undefined,
        moderationRequired: Boolean(rawObj.moderationRequired),
        greetingPrompt: String(rawObj.greetingPrompt || "Leave your blessings for the couple..."),
        placeholder: String(rawObj.placeholder || "Write your congratulations..."),
        allowReactions: rawObj.allowReactions !== undefined ? Boolean(rawObj.allowReactions) : true,
        maxMessageLength: typeof rawObj.maxMessageLength === "number" && rawObj.maxMessageLength > 0 ? rawObj.maxMessageLength : 300,
      };

    case "digital_gift_registry":
      return {
        id,
        type: "digital_gift_registry",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        subtitle: rawObj.subtitle ? String(rawObj.subtitle) : undefined,
        greetingNote: String(rawObj.greetingNote || "Your presence is our greatest present."),
        accounts: Array.isArray(rawObj.accounts)
          ? rawObj.accounts.map((acc: any, aIdx: number) => ({
              id: String(acc.id || `acc-${aIdx + 1}`),
              bankName: String(acc.bankName || ""),
              accountNumber: String(acc.accountNumber || ""),
              accountHolder: String(acc.accountHolder || ""),
              branchName: acc.branchName ? String(acc.branchName) : undefined,
              qrImageUrl: acc.qrImageUrl ? String(acc.qrImageUrl) : undefined,
              transferMemo: acc.transferMemo ? String(acc.transferMemo) : undefined,
              currency: acc.currency ? String(acc.currency) : undefined,
            }))
          : [],
        cashGiftingEnabled: rawObj.cashGiftingEnabled !== undefined ? Boolean(rawObj.cashGiftingEnabled) : true,
        cashGiftingInstructions: rawObj.cashGiftingInstructions ? String(rawObj.cashGiftingInstructions) : undefined,
      };

    case "background_audio":
      return {
        id,
        type: "background_audio",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        songTitle: String(rawObj.songTitle || rawObj.trackTitle || "Celebration Melody"),
        artistName: String(rawObj.artistName || "Athar Music"),
        audioUrl: String(rawObj.audioUrl || ""),
        autoPlayNotice: String(rawObj.autoPlayNotice || "Tap vinyl to start music"),
        loopEnabled: rawObj.loopEnabled !== undefined ? Boolean(rawObj.loopEnabled) : (rawObj.loop !== undefined ? Boolean(rawObj.loop) : true),
        initialMuted: Boolean(rawObj.initialMuted),
      };

    case "venue_location":
      return {
        id,
        type: "venue_location",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        venueName: String(rawObj.venueName || "Celebration Venue"),
        address: String(rawObj.address || rawObj.venueAddress || ""),
        mapCoordinates: rawObj.mapCoordinates && typeof rawObj.mapCoordinates === "object" ? {
          lat: Number(rawObj.mapCoordinates.lat) || 0,
          lng: Number(rawObj.mapCoordinates.lng) || 0,
        } : undefined,
        mapEmbedUrl: rawObj.mapEmbedUrl ? String(rawObj.mapEmbedUrl) : undefined,
        parkingNote: rawObj.parkingNote ? String(rawObj.parkingNote) : undefined,
        dressCodeTitle: rawObj.dressCodeTitle ? String(rawObj.dressCodeTitle) : undefined,
        dressCodeSwatches: Array.isArray(rawObj.dressCodeSwatches)
          ? rawObj.dressCodeSwatches.map((s: any) => ({
              hex: String(s.hex || "#000000"),
              label: String(s.label || ""),
            }))
          : undefined,
      };

    case "live_countdown":
      return {
        id,
        type: "live_countdown",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        targetDateIso: String(rawObj.targetDateIso || rawObj.targetDate || new Date().toISOString()),
        heading: String(rawObj.heading || rawObj.countdownHeading || "Counting Down"),
        completedMessage: String(rawObj.completedMessage || "Celebration In Progress"),
      };

    case "dynamic_rsvp": {
      // Ensure formSchema has locked email
      let formSchema: DynamicFormField[] = Array.isArray(rawObj.formSchema)
        ? rawObj.formSchema
        : [DEFAULT_RSVP_NAME_FIELD, DEFAULT_LOCKED_RSVP_EMAIL_FIELD, DEFAULT_RSVP_COMPANIONS_FIELD];

      const hasLockedEmail = formSchema.some((f) => f.type === "email" && f.required && f.locked);
      if (!hasLockedEmail) {
        formSchema = [
          ...formSchema.filter((f) => f.type !== "email"),
          DEFAULT_LOCKED_RSVP_EMAIL_FIELD,
        ];
      }

      return {
        id,
        type: "dynamic_rsvp",
        title,
        titleAr,
        enabled,
        order,
        isLocked: true,
        subtitle: rawObj.subtitle ? String(rawObj.subtitle) : undefined,
        deadlineDate: rawObj.deadlineDate ? String(rawObj.deadlineDate) : undefined,
        capacityLimit: typeof rawObj.capacityLimit === "number" ? rawObj.capacityLimit : undefined,
        formSchema,
        allowPlusOnes: rawObj.allowPlusOnes !== undefined ? Boolean(rawObj.allowPlusOnes) : true,
        maxCompanions: typeof rawObj.maxCompanions === "number" ? rawObj.maxCompanions : 3,
        askDietary: rawObj.askDietary !== undefined ? Boolean(rawObj.askDietary) : true,
        askTransportation: rawObj.askTransportation !== undefined ? Boolean(rawObj.askTransportation) : false,
      };
    }

    case "custom_highlight":
    default:
      return {
        id,
        type: "custom_highlight",
        title,
        titleAr,
        enabled,
        order,
        isLocked,
        badge: rawObj.badge || rawObj.highlightBadge ? String(rawObj.badge || rawObj.highlightBadge) : undefined,
        quoteText: String(rawObj.quoteText || rawObj.bodyText || rawObj.highlightText || ""),
        author: rawObj.author ? String(rawObj.author) : undefined,
        backgroundStyle: rawObj.backgroundStyle ? String(rawObj.backgroundStyle) : "alabaster",
        imageUrl: rawObj.imageUrl || rawObj.highlightImageUrl ? String(rawObj.imageUrl || rawObj.highlightImageUrl) : undefined,
      };
  }
}

/**
 * Parses raw unknown data (e.g. from Appwrite `sectionsConfigJson` or localStorage) into a strictly-typed ModularWebsiteConfig.
 * Handles legacy v1 flat `InvitationSectionBlock[]`, modern v2 configs, stringified JSON, and corrupt inputs with zero crashes.
 */
export function parseModularWebsiteConfig(raw: unknown): ModularWebsiteConfig {
  if (!raw) {
    return createDefaultModularWebsiteConfig();
  }

  let data: unknown = raw;

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) {
      return createDefaultModularWebsiteConfig();
    }
    try {
      data = JSON.parse(trimmed);
    } catch {
      return createDefaultModularWebsiteConfig();
    }
  }

  if (!data || typeof data !== "object") {
    return createDefaultModularWebsiteConfig();
  }

  // Case 1: Wrapped in ModularWebsiteConfig (has version "2.0" and sections array)
  if ("version" in data && Array.isArray((data as any).sections)) {
    const candidate = data as ModularWebsiteConfig;
    const rawSections = candidate.sections;
    if (rawSections.length === 0) {
      return createDefaultModularWebsiteConfig();
    }
    const normalizedSections = rawSections.map((s, idx) => normalizeSection(s, idx));
    return {
      version: "2.0",
      sections: normalizedSections,
      themeConfig: candidate.themeConfig && typeof candidate.themeConfig === "object" ? candidate.themeConfig : undefined,
      metadata: candidate.metadata && typeof candidate.metadata === "object" ? candidate.metadata : {
        lastEditedAt: new Date().toISOString(),
      },
    };
  }

  // Case 2: Array of sections (either legacy v1 or modern array directly)
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return createDefaultModularWebsiteConfig();
    }
    const normalizedSections = data.map((item, idx) => normalizeSection(item, idx));
    return {
      version: "2.0",
      sections: normalizedSections,
      metadata: {
        lastEditedAt: new Date().toISOString(),
      },
    };
  }

  // Case 3: Object containing a `sections` key but without version
  if ("sections" in data && Array.isArray((data as any).sections)) {
    const rawSections = (data as any).sections;
    if (rawSections.length === 0) {
      return createDefaultModularWebsiteConfig();
    }
    const normalizedSections = rawSections.map((item: any, idx: number) => normalizeSection(item, idx));
    return {
      version: "2.0",
      sections: normalizedSections,
      themeConfig: (data as any).themeConfig,
      metadata: (data as any).metadata || {
        lastEditedAt: new Date().toISOString(),
      },
    };
  }

  return createDefaultModularWebsiteConfig();
}

/**
 * Validates a ModularWebsiteConfig object against architectural constraints.
 * Returns an object with `isValid: boolean` and a list of human-readable error messages.
 */
export function validateModularWebsiteConfig(config: unknown): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== "object") {
    return { isValid: false, errors: ["Modular website configuration must be a non-null object."] };
  }

  const obj = config as Record<string, unknown>;

  if (obj.version !== "2.0") {
    errors.push(`Invalid version: expected '2.0', received '${String(obj.version)}'.`);
  }

  if (!Array.isArray(obj.sections)) {
    errors.push("Sections must be an array.");
    return { isValid: false, errors };
  }

  if (obj.sections.length === 0) {
    errors.push("Modular website must contain at least one section.");
  }

  const seenIds = new Set<string>();

  obj.sections.forEach((sec, idx) => {
    if (!sec || typeof sec !== "object") {
      errors.push(`Section at index ${idx} is not an object.`);
      return;
    }

    const s = sec as Record<string, unknown>;

    // ID validation
    if (!s.id || typeof s.id !== "string" || !s.id.trim()) {
      errors.push(`Section at index ${idx} is missing a valid 'id'.`);
    } else {
      if (seenIds.has(s.id)) {
        errors.push(`Duplicate section id '${s.id}' found at index ${idx}.`);
      }
      seenIds.add(s.id);
    }

    // Type validation
    const sectionType = s.type as EventSectionType;
    if (!ALL_EVENT_SECTION_TYPES.includes(sectionType)) {
      errors.push(`Section '${String(s.id || idx)}' has unknown type '${String(s.type)}'.`);
      return;
    }

    // Common Base validations
    if (typeof s.title !== "string" || !s.title.trim()) {
      errors.push(`Section '${String(s.id || idx)}' must have a non-empty string 'title'.`);
    }
    if (typeof s.enabled !== "boolean") {
      errors.push(`Section '${String(s.id || idx)}' must have a boolean 'enabled' property.`);
    }
    if (typeof s.order !== "number" || isNaN(s.order)) {
      errors.push(`Section '${String(s.id || idx)}' must have a numeric 'order'.`);
    }

    // Concrete type specific checks
    switch (sectionType) {
      case "cover_hero":
        if (typeof s.coupleTitle !== "string" || !s.coupleTitle.trim()) {
          errors.push(`CoverHero section '${String(s.id)}' must have a non-empty 'coupleTitle'.`);
        }
        break;

      case "couple_story":
        if (!Array.isArray(s.milestones)) {
          errors.push(`CoupleStory section '${String(s.id)}' must have an array of 'milestones'.`);
        }
        break;

      case "event_schedule":
        if (!Array.isArray(s.scheduleItems)) {
          errors.push(`EventSchedule section '${String(s.id)}' must have an array of 'scheduleItems'.`);
        }
        break;

      case "photo_gallery":
        if (!Array.isArray(s.images)) {
          errors.push(`PhotoGallery section '${String(s.id)}' must have an array of 'images'.`);
        }
        if (!Array.isArray(s.categories)) {
          errors.push(`PhotoGallery section '${String(s.id)}' must have an array of 'categories'.`);
        }
        if (!["masonry", "grid", "carousel"].includes(String(s.layoutMode))) {
          errors.push(`PhotoGallery section '${String(s.id)}' has invalid layoutMode '${String(s.layoutMode)}'.`);
        }
        break;

      case "wishing_wall":
        if (typeof s.maxMessageLength !== "number" || s.maxMessageLength <= 0) {
          errors.push(`WishingWall section '${String(s.id)}' must have a positive 'maxMessageLength'.`);
        }
        break;

      case "digital_gift_registry":
        if (!Array.isArray(s.accounts)) {
          errors.push(`DigitalGiftRegistry section '${String(s.id)}' must have an array of 'accounts'.`);
        }
        break;

      case "background_audio":
        if (typeof s.songTitle !== "string" || !s.songTitle.trim()) {
          errors.push(`BackgroundAudio section '${String(s.id)}' must have a non-empty 'songTitle'.`);
        }
        break;

      case "venue_location":
        if (typeof s.venueName !== "string" || !s.venueName.trim()) {
          errors.push(`VenueLocation section '${String(s.id)}' must have a non-empty 'venueName'.`);
        }
        break;

      case "live_countdown":
        if (typeof s.targetDateIso !== "string" || !s.targetDateIso.trim()) {
          errors.push(`LiveCountdown section '${String(s.id)}' must have a non-empty 'targetDateIso'.`);
        }
        break;

      case "custom_highlight":
        if (typeof s.quoteText !== "string") {
          errors.push(`CustomHighlight section '${String(s.id)}' must have a string 'quoteText'.`);
        }
        break;

      case "dynamic_rsvp": {
        if (!Array.isArray(s.formSchema)) {
          errors.push(`DynamicRsvp section '${String(s.id)}' must have a 'formSchema' array.`);
        } else {
          const hasLockedEmail = (s.formSchema as DynamicFormField[]).some(
            (f) => f && f.type === "email" && f.required && f.locked
          );
          if (!hasLockedEmail) {
            errors.push(`DynamicRsvp section '${String(s.id)}' must contain a required, locked email field.`);
          }
        }
        break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
