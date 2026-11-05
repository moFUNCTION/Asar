import React, { useState } from "react";
import type {
  EventSection,
  EventSectionType,
  CoverHeroSection,
  CoupleStorySection,
  EventScheduleSection,
  PhotoGallerySection,
  WishingWallSection,
  DigitalGiftRegistrySection,
  BackgroundAudioSection,
  VenueLocationSection,
  LiveCountdownSection,
  CustomHighlightSection,
  DynamicRsvpSection,
} from "@repo/react-appwrite";
import {
  DEFAULT_RSVP_NAME_FIELD,
  DEFAULT_LOCKED_RSVP_EMAIL_FIELD,
  DEFAULT_RSVP_COMPANIONS_FIELD,
  DEFAULT_RSVP_NOTE_FIELD,
} from "@repo/react-appwrite";

export interface SectionCatalogItem {
  type: EventSectionType;
  title: string;
  titleAr: string;
  category: "hero_story" | "timeline_engagement" | "media_registry" | "venue_rsvp";
  icon: string;
  badge: string;
  description: string;
  isUnique?: boolean;
}

export const SECTION_CATALOG: SectionCatalogItem[] = [
  // 1. Hero & Story
  {
    type: "cover_hero",
    title: "Cover & Hero Showcase",
    titleAr: "واجهة الدعوة والغلاف",
    category: "hero_story",
    icon: "🏛️",
    badge: "Essential",
    description: "High-impact editorial cover with couple monogram, wax seal animation, event date, venue, and save-the-date pill.",
    isUnique: true,
  },
  {
    type: "live_countdown",
    title: "Celebration Countdown",
    titleAr: "العد التنازلي المباشر",
    category: "hero_story",
    icon: "⏳",
    badge: "Engagement",
    description: "Live real-time ticking countdown ticker to build anticipation for the big day.",
  },
  {
    type: "couple_story",
    title: "Our Love Story",
    titleAr: "قصتنا ومحطات الذكريات",
    category: "hero_story",
    icon: "📖",
    badge: "Storytelling",
    description: "Chronological milestone cards detailing how you met, the proposal, and journeys with photos.",
  },

  // 2. Timeline & Engagement
  {
    type: "event_schedule",
    title: "Celebration Itinerary & Schedule",
    titleAr: "برنامج ومواعيد الحفل",
    category: "timeline_engagement",
    icon: "📅",
    badge: "Itinerary",
    description: "Multi-session schedule timeline (welcome drinks, ceremony vows, dinner reception) with dress codes & calendar links.",
  },
  {
    type: "wishing_wall",
    title: "Wishing Wall & Guestbook",
    titleAr: "دفتر التهاني والبركات",
    category: "timeline_engagement",
    icon: "💌",
    badge: "Interactive",
    description: "Real-time guest blessing stream where guests post warm congratulations, personal wishes, and reactions.",
  },
  {
    type: "custom_highlight",
    title: "Editorial Highlight & Gratitude",
    titleAr: "كلمة شكر وتقدير",
    category: "timeline_engagement",
    icon: "✦",
    badge: "Editorial",
    description: "Luxury editorial quote, personal note of gratitude to parents & guests, or special announcement banner.",
  },

  // 3. Media & Registry
  {
    type: "photo_gallery",
    title: "Photo & Memory Gallery",
    titleAr: "معرض الصور والذكريات",
    category: "media_registry",
    icon: "🖼️",
    badge: "Media",
    description: "Full-width responsive photo albums with masonry, grid, or 3D carousel layouts and fullscreen lightbox preview.",
  },
  {
    type: "digital_gift_registry",
    title: "Blessing Box & Digital Registry",
    titleAr: "صندوق الهدايا والبركة (QR)",
    category: "media_registry",
    icon: "🎁",
    badge: "Banking QR",
    description: "Direct instant banking integration (InstaPay Egypt, Bank Accounts, IBAN) with scannable payment QR codes.",
  },
  {
    type: "background_audio",
    title: "Atmospheric Audio Soundtrack",
    titleAr: "الموسيقى التصويرية والخلفية",
    category: "media_registry",
    icon: "🎵",
    badge: "Soundtrack",
    description: "Floating vinyl disc music player allowing guests to enjoy curated celebratory background music.",
    isUnique: true,
  },

  // 4. Venue & RSVP
  {
    type: "venue_location",
    title: "Venue Location & Navigation Guide",
    titleAr: "موقع الحفل ودليل الوصول",
    category: "venue_rsvp",
    icon: "📍",
    badge: "Logistics",
    description: "Interactive map embed, GPS coordinates, valet parking directions, and dress code color swatches.",
  },
  {
    type: "dynamic_rsvp",
    title: "Attendance Confirmation (RSVP)",
    titleAr: "تأكيد الحضور (RSVP)",
    category: "venue_rsvp",
    icon: "✉️",
    badge: "Mandatory Email 🔒",
    description: "Dynamic multi-guest attendance confirmation form with capacity limits and locked mandatory email for QR passes.",
    isUnique: true,
  },
];

export interface SectionPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSection: (newSection: EventSection) => void;
  existingTypes: EventSectionType[];
  defaultContext?: {
    coupleTitle?: string;
    eventDate?: string;
    venueName?: string;
  };
}

export function createDefaultSectionForType(
  type: EventSectionType,
  nextOrder: number,
  context?: { coupleTitle?: string; eventDate?: string; venueName?: string }
): EventSection {
  const couple = context?.coupleTitle || "Omar & Layla";
  const date = context?.eventDate || "2026-11-20";
  const venue = context?.venueName || "Four Seasons Hotel, Alexandria";
  const uid = `sec-${type}-${Date.now().toString().slice(-4)}`;

  switch (type) {
    case "cover_hero": {
      const sec: CoverHeroSection = {
        id: uid,
        type: "cover_hero",
        title: "Cover & Hero Showcase",
        titleAr: "واجهة الدعوة والغلاف",
        enabled: true,
        order: nextOrder,
        coupleTitle: couple,
        dateDisplay: date,
        venueDisplay: venue,
        headline: "The Wedding Celebration",
        overline: "CORDIALLY INVITE YOU TO CELEBRATE",
        tagline: "Two souls, one timeless journey of devotion and joy.",
        coverImageUrl:
          "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
        countdownEnabled: true,
        envelopeEnabled: true,
        waxSealMonogram: "O&L",
        audioPromptBadge: "Tap vinyl to play soundtrack",
      };
      return sec;
    }

    case "couple_story": {
      const sec: CoupleStorySection = {
        id: uid,
        type: "couple_story",
        title: "Our Love Story",
        titleAr: "قصتنا",
        enabled: true,
        order: nextOrder,
        subtitle: "The chapters and milestones that brought our worlds together",
        milestones: [
          {
            id: `mile-${Date.now()}-1`,
            yearOrDate: "Summer 2022",
            title: "A Serendipitous Encounter",
            description: "A chance meeting at an art gallery cafe in Zamalek that sparked hours of shared laughter.",
            imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: `mile-${Date.now()}-2`,
            yearOrDate: "Autumn 2024",
            title: "The Sunset Proposal",
            description: "Under the golden glow of the Mediterranean horizon, forever became our chosen path.",
            imageUrl: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
          },
          {
            id: `mile-${Date.now()}-3`,
            yearOrDate: "November 2026",
            title: "Our New Chapter",
            description: "Gathering with all who hold a piece of our hearts to celebrate eternal devotion.",
            imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
          },
        ],
      };
      return sec;
    }

    case "event_schedule": {
      const sec: EventScheduleSection = {
        id: uid,
        type: "event_schedule",
        title: "Celebration Itinerary & Schedule",
        titleAr: "برنامج الحفل",
        enabled: true,
        order: nextOrder,
        subtitle: "Join us for every magical moment of our special day",
        scheduleItems: [
          {
            id: `sch-${Date.now()}-1`,
            time: "06:30 PM",
            eventName: "Welcome Elixirs & Arrival",
            locationName: "Grand Foyer",
            address: venue,
            mapUrl: `https://maps.google.com/?q=${encodeURIComponent(venue)}`,
            dressCode: "Formal Cocktail / Black Tie",
            calendarSummary: `Welcome Elixirs - ${couple}`,
            calendarDescription: "Guest arrival, signature drinks, and ambient string quartet.",
          },
          {
            id: `sch-${Date.now()}-2`,
            time: "07:45 PM",
            eventName: "Matrimony Vows & Ceremony",
            locationName: "Palatial Sea Terrace",
            address: venue,
            mapUrl: `https://maps.google.com/?q=${encodeURIComponent(venue)}`,
            dressCode: "Black Tie / Elegant Formal",
            calendarSummary: `Ceremony & Vows - ${couple}`,
            calendarDescription: "Exchange of vows overlooking the sea.",
          },
          {
            id: `sch-${Date.now()}-3`,
            time: "09:00 PM",
            eventName: "Royal Banquet & Celebrations",
            locationName: "Alexandria Grand Ballroom",
            address: venue,
            mapUrl: `https://maps.google.com/?q=${encodeURIComponent(venue)}`,
            dressCode: "Formal Evening",
            calendarSummary: `Royal Banquet - ${couple}`,
            calendarDescription: "Dinner, cake cutting, live band, and dancing.",
          },
        ],
      };
      return sec;
    }

    case "photo_gallery": {
      const sec: PhotoGallerySection = {
        id: uid,
        type: "photo_gallery",
        title: "Moments & Memories",
        titleAr: "معرض الصور",
        enabled: true,
        order: nextOrder,
        subtitle: "Glimpses into our journey and pre-wedding celebrations",
        layoutMode: "masonry",
        categories: ["All", "Engagement", "Travel", "Portraits"],
        images: [
          {
            id: `img-${Date.now()}-1`,
            url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80",
            caption: "Golden hour sunset portrait",
            category: "Engagement",
          },
          {
            id: `img-${Date.now()}-2`,
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80",
            caption: "Strolling the Mediterranean corniche",
            category: "Travel",
          },
          {
            id: `img-${Date.now()}-3`,
            url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1000&q=80",
            caption: "Intimate candid laughter",
            category: "Portraits",
          },
          {
            id: `img-${Date.now()}-4`,
            url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80",
            caption: "Pre-wedding celebration joy",
            category: "Engagement",
          },
        ],
      };
      return sec;
    }

    case "wishing_wall": {
      const sec: WishingWallSection = {
        id: uid,
        type: "wishing_wall",
        title: "Wishing Wall & Guestbook",
        titleAr: "دفتر التهاني والبركات",
        enabled: true,
        order: nextOrder,
        subtitle: "Leave your warm congratulations and heartfelt blessings for the newlyweds",
        moderationRequired: false,
        greetingPrompt: "Leave a warm blessing for the happy couple...",
        placeholder: "Write your congratulatory message here...",
        allowReactions: true,
        maxMessageLength: 300,
      };
      return sec;
    }

    case "digital_gift_registry": {
      const sec: DigitalGiftRegistrySection = {
        id: uid,
        type: "digital_gift_registry",
        title: "Blessing Box & Digital Registry",
        titleAr: "صندوق الهدايا والبركة",
        enabled: true,
        order: nextOrder,
        subtitle: "Your presence is our greatest present, but if you wish to honor us with a gift",
        greetingNote: "We are deeply touched by your love and gracious support as we embark on our shared voyage.",
        accounts: [
          {
            id: `acc-${Date.now()}-1`,
            bankName: "InstaPay (Egypt)",
            accountNumber: "omar.layla@instapay",
            accountHolder: couple,
            branchName: "Direct Instant Transfer",
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=instapay%3Aomar.layla%40instapay`,
            transferMemo: `Wedding Blessing - ${couple}`,
            currency: "EGP",
          },
          {
            id: `acc-${Date.now()}-2`,
            bankName: "Commercial International Bank (CIB)",
            accountNumber: "100049281726",
            accountHolder: couple,
            branchName: "Alexandria Branch",
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=cib%3A100049281726`,
            transferMemo: `Wedding Blessing - ${couple}`,
            currency: "EGP",
          },
        ],
        cashGiftingEnabled: true,
        cashGiftingInstructions: "A decorated traditional blessing chest will be situated at the ballroom entry reception.",
      };
      return sec;
    }

    case "background_audio": {
      const sec: BackgroundAudioSection = {
        id: uid,
        type: "background_audio",
        title: "Atmospheric Audio Soundtrack",
        titleAr: "الموسيقى التصويرية والخلفية",
        enabled: true,
        order: nextOrder,
        songTitle: "Clair de Lune (Acoustic Piano & Strings)",
        artistName: "Athar Classical Ensemble",
        audioUrl: "https://assets.mixkit.co/music/preview/mixkit-romantic-wedding-piano-538.mp3",
        autoPlayNotice: "Tap vinyl disc icon to enjoy curated celebration music",
        loopEnabled: true,
        initialMuted: false,
      };
      return sec;
    }

    case "venue_location": {
      const sec: VenueLocationSection = {
        id: uid,
        type: "venue_location",
        title: "Venue Location & Navigation Guide",
        titleAr: "موقع الحفل والوصول",
        enabled: true,
        order: nextOrder,
        venueName: venue,
        address: "Corniche Road, San Stefano, Alexandria, Egypt",
        mapCoordinates: { lat: 31.2435, lng: 29.9678 },
        mapEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3412.3!2d29.96!3d31.24!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDE0JzM2LjYiTiAyOcKwNTgnMDQuMSJF!5e0!3m2!1sen!2seg!4v1600000000000",
        parkingNote: "Complimentary valet parking is available at the main ballroom porte-cochère.",
        dressCodeTitle: "Black Tie & Elegant Evening Attire",
        dressCodeSwatches: [
          { hex: "#1A1A1A", label: "Tuxedo Midnight" },
          { hex: "#6B1D28", label: "Royal Maroon" },
          { hex: "#D4AF37", label: "Champagne Gold" },
          { hex: "#F5EFE6", label: "Alabaster Silk" },
        ],
      };
      return sec;
    }

    case "live_countdown": {
      const sec: LiveCountdownSection = {
        id: uid,
        type: "live_countdown",
        title: "Celebration Countdown",
        titleAr: "العد التنازلي للحدث",
        enabled: true,
        order: nextOrder,
        targetDateIso: `${date}T19:30:00.000Z`,
        heading: "Counting Down to Forever",
        completedMessage: "Today is the Day! Celebrating Together Now",
      };
      return sec;
    }

    case "custom_highlight": {
      const sec: CustomHighlightSection = {
        id: uid,
        type: "custom_highlight",
        title: "A Cordial Note of Gratitude",
        titleAr: "كلمة شكر وتقدير",
        enabled: true,
        order: nextOrder,
        badge: "✦ WITH HEARTFELT GRATITUDE",
        quoteText:
          "To our parents, families, and dearest companions: your love, guidance, and unwavering presence are the foundation upon which we begin this sacred chapter.",
        author: couple,
        backgroundStyle: "burgundy",
      };
      return sec;
    }

    case "dynamic_rsvp": {
      const sec: DynamicRsvpSection = {
        id: uid,
        type: "dynamic_rsvp",
        title: "Confirm Your Attendance (RSVP)",
        titleAr: "تأكيد الحضور",
        enabled: true,
        order: nextOrder,
        isLocked: true,
        subtitle: `Kindly confirm your attendance by ${date} to ensure your seat reservation.`,
        deadlineDate: `${date}T00:00:00.000Z`,
        capacityLimit: 200,
        formSchema: [
          DEFAULT_RSVP_NAME_FIELD,
          DEFAULT_LOCKED_RSVP_EMAIL_FIELD,
          DEFAULT_RSVP_COMPANIONS_FIELD,
          DEFAULT_RSVP_NOTE_FIELD,
        ],
        allowPlusOnes: true,
        maxCompanions: 3,
        askDietary: true,
        askTransportation: false,
      };
      return sec;
    }
  }
}

export const SectionPaletteModal: React.FC<SectionPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectSection,
  existingTypes,
  defaultContext,
}) => {
  type PaletteCategory = "all" | "hero_story" | "timeline_engagement" | "media_registry" | "venue_rsvp";
  const [selectedCategory, setSelectedCategory] = useState<PaletteCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const categories: Array<{ id: PaletteCategory; label: string; icon: string }> = [
    { id: "all", label: "All Sections (11)", icon: "✨" },
    { id: "hero_story", label: "Hero & Story", icon: "🏛️" },
    { id: "timeline_engagement", label: "Timeline & Wishes", icon: "📅" },
    { id: "media_registry", label: "Media & Registry", icon: "🎁" },
    { id: "venue_rsvp", label: "Venue & RSVP", icon: "📍" },
  ];

  const filteredItems = SECTION_CATALOG.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleAr.includes(searchQuery) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleChoose = (item: SectionCatalogItem) => {
    const nextOrder = existingTypes.length + 1;
    const newSection = createDefaultSectionForType(
      item.type,
      nextOrder,
      defaultContext
    );
    onSelectSection(newSection);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        backgroundColor: "rgba(13, 11, 14, 0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "90vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid rgba(107, 29, 40, 0.16)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, #FAF7F2, #FFFFFF)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🧱</span>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#231F20",
                  fontFamily: "Amiri, Georgia, serif",
                  margin: 0,
                }}
              >
                Modular Section Palette
              </h2>
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "999px",
                  background: "rgba(107, 29, 40, 0.08)",
                  color: "#6B1D28",
                  fontWeight: 700,
                }}
              >
                11 Standard Types
              </span>
            </div>
            <p
              style={{
                fontSize: "0.82rem",
                color: "#7A6F6D",
                marginTop: "0.2rem",
                marginBottom: 0,
              }}
            >
              Choose a modular section to add to your luxury event website.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(0,0,0,0.05)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              fontSize: "1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#555",
            }}
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            padding: "0.85rem 1.75rem",
            background: "#FDFCFB",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.9rem",
                opacity: 0.5,
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search sections by name, feature, or Arabic title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.55rem 0.85rem 0.55rem 2.2rem",
                borderRadius: "10px",
                border: "1px solid rgba(107, 29, 40, 0.2)",
                fontSize: "0.85rem",
                outline: "none",
                background: "#FFFFFF",
              }}
            />
          </div>

          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  border: "none",
                  padding: "0.35rem 0.8rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background:
                    selectedCategory === cat.id ? "#6B1D28" : "rgba(0,0,0,0.04)",
                  color: selectedCategory === cat.id ? "#FFFFFF" : "#555",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Cards Grid */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1rem",
            flex: 1,
          }}
        >
          {filteredItems.map((item) => {
            const alreadyExists = existingTypes.includes(item.type);
            const isUniqueBlocked = item.isUnique && alreadyExists;

            return (
              <div
                key={item.type}
                onClick={() => {
                  if (!isUniqueBlocked) handleChoose(item);
                }}
                style={{
                  border: `1px solid ${
                    isUniqueBlocked
                      ? "rgba(0,0,0,0.08)"
                      : "rgba(107, 29, 40, 0.15)"
                  }`,
                  borderRadius: "12px",
                  padding: "1.1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: isUniqueBlocked
                    ? "#F9F9F9"
                    : "linear-gradient(to bottom, #FFFFFF, #FAF7F2)",
                  opacity: isUniqueBlocked ? 0.6 : 1,
                  cursor: isUniqueBlocked ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: isUniqueBlocked
                    ? "none"
                    : "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.75rem" }}>{item.icon}</span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "6px",
                        background:
                          item.badge.includes("Mandatory") ||
                          item.badge === "Essential"
                            ? "rgba(107, 29, 40, 0.1)"
                            : "rgba(212, 175, 55, 0.18)",
                        color:
                          item.badge.includes("Mandatory") ||
                          item.badge === "Essential"
                            ? "#6B1D28"
                            : "#8B6F1E",
                        fontWeight: 700,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#231F20",
                      margin: "0 0 0.15rem 0",
                    }}
                  >
                    {item.title}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#8B6F1E",
                      fontFamily: "Amiri, Georgia, serif",
                      marginBottom: "0.45rem",
                    }}
                  >
                    {item.titleAr}
                  </div>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#6B6563",
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.6rem",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: alreadyExists ? "#2B6CB0" : "#7A6F6D",
                      fontWeight: 600,
                    }}
                  >
                    {alreadyExists
                      ? item.isUnique
                        ? "✓ Added (Unique)"
                        : "✓ In Website"
                      : "Not added yet"}
                  </span>

                  <button
                    type="button"
                    disabled={isUniqueBlocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isUniqueBlocked) handleChoose(item);
                    }}
                    style={{
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.3rem 0.7rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: isUniqueBlocked ? "not-allowed" : "pointer",
                      background: isUniqueBlocked ? "#CCCCCC" : "#6B1D28",
                      color: "#FFFFFF",
                    }}
                  >
                    {isUniqueBlocked ? "Already Added" : "+ Add Section"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.9rem 1.75rem",
            background: "#F8F5F0",
            borderTop: "1px solid rgba(107, 29, 40, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Sections can be freely reordered, hidden, duplicated, and customized anytime.
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              background: "#FFFFFF",
              color: "#333",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close Palette
          </button>
        </div>
      </div>
    </div>
  );
};
