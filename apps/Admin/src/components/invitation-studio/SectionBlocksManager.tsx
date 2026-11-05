import React, { useState } from "react";
import type {
  EventSection,
  CoverHeroSection,
  VenueLocationSection,
  LiveCountdownSection,
  EventScheduleSection,
  PhotoGallerySection,
  CustomHighlightSection,
} from "@repo/react-appwrite";
import { parseModularWebsiteConfig } from "@repo/react-appwrite";

import { SectionPaletteModal } from "./SectionPaletteModal";
import { ModularSectionList } from "./ModularSectionList";
import { SectionInspectorRouter } from "./inspectors";

// =============================================================
// Backward Compatibility Types & Defaults
// =============================================================
export type SectionBlockType =
  | "hero"
  | "countdown"
  | "story_timeline"
  | "gallery"
  | "venue_map"
  | "custom_highlight"
  | "rsvp_form";

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface DressCodeColor {
  hex: string;
  label: string;
}

export interface InvitationSectionBlock {
  id: string;
  type: SectionBlockType;
  title: string;
  isVisible: boolean;
  isLocked?: boolean;
  overline?: string;
  mainTitle?: string;
  subtitle?: string;
  coverImageUrl?: string;
  datePill?: string;
  timePill?: string;
  venuePill?: string;
  ctaText?: string;
  targetDate?: string;
  countdownHeading?: string;
  timelineItems?: TimelineItem[];
  galleryImages?: string[];
  galleryMode?: "circular-3d" | "polaroid-decay" | "bento-masonry";
  venueName?: string;
  venueAddress?: string;
  mapUrl?: string;
  parkingNote?: string;
  dressCodeSwatches?: DressCodeColor[];
  highlightBadge?: string;
  highlightText?: string;
  highlightImageUrl?: string;
}

export const DEFAULT_SECTION_BLOCKS: InvitationSectionBlock[] = [
  {
    id: "block-hero",
    type: "hero",
    title: "Hero Showcase Block",
    isVisible: true,
    overline: "CORDIALLY INVITES YOU TO CELEBRATE",
    mainTitle: "Omar & Layla",
    subtitle: "Two souls, one timeless journey. Join us under the Mediterranean stars.",
    coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    datePill: "20 November 2026",
    timePill: "07:30 PM",
    venuePill: "Four Seasons Hotel, Alexandria",
    ctaText: "Confirm Your Attendance",
  },
  {
    id: "block-countdown",
    type: "countdown",
    title: "Live Countdown Timer",
    isVisible: true,
    countdownHeading: "Counting Down to Our Forever",
    targetDate: "2026-11-20T19:30:00",
  },
  {
    id: "block-story",
    type: "story_timeline",
    title: "Story & Program Schedule",
    isVisible: true,
    timelineItems: [
      { id: "tl-1", time: "07:00 PM", title: "Welcome Drinks & Red Carpet", description: "Arrival of guests, welcome elixirs and live string quartet in the courtyard." },
      { id: "tl-2", time: "08:15 PM", title: "Ceremony & Exchange of Vows", description: "Sunset ceremony facing the Mediterranean sea." },
      { id: "tl-3", time: "09:30 PM", title: "Royal Dinner & Celebrations", description: "Curated fine dining, toasts, and evening entertainment." },
      { id: "tl-4", time: "11:30 PM", title: "Cake Cutting & Midnight Athar", description: "Audio booth messages and dessert lounge." },
    ],
  },
  {
    id: "block-gallery",
    type: "gallery",
    title: "Photo & Memory Gallery",
    isVisible: true,
    galleryMode: "circular-3d",
    galleryImages: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "block-venue",
    type: "venue_map",
    title: "Venue Location & Dress Code",
    isVisible: true,
    venueName: "Four Seasons Hotel Alexandria",
    venueAddress: "Corniche Road, San Stefano, Alexandria, Egypt",
    mapUrl: "https://maps.google.com/?q=Four+Seasons+Hotel+Alexandria+at+San+Stefano",
    parkingNote: "Complimentary valet parking available at the main ballroom entrance.",
    dressCodeSwatches: [
      { hex: "#141115", label: "Black Tie / Formal" },
      { hex: "#6B1D28", label: "Deep Burgundy" },
      { hex: "#D4AF37", label: "Champagne Gold" },
      { hex: "#FBF7F2", label: "Ivory / Warm White" },
    ],
  },
  {
    id: "block-highlight",
    type: "custom_highlight",
    title: "Editorial Highlight & Verse",
    isVisible: true,
    highlightBadge: "✦ A WORD OF GRATITUDE",
    mainTitle: "Our Heartfelt Gratitude",
    highlightText: "To our beloved family and dear friends: your love, prayers, and presence make our milestone complete. We cannot wait to share an unforgettable evening with you.",
    highlightImageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "block-rsvp",
    type: "rsvp_form",
    title: "Dynamic RSVP Form Block",
    isVisible: true,
    isLocked: true,
  },
];

// Helper converting modern EventSection[] to legacy InvitationSectionBlock[]
export function projectModernSectionsToLegacyBlocks(sections: EventSection[]): InvitationSectionBlock[] {
  return sections.map((s) => {
    const base: InvitationSectionBlock = {
      id: s.id,
      type: "custom_highlight",
      title: s.title,
      isVisible: s.enabled,
      isLocked: s.isLocked,
    };

    switch (s.type) {
      case "cover_hero": {
        const ch = s as CoverHeroSection;
        return {
          ...base,
          type: "hero",
          overline: ch.overline,
          mainTitle: ch.coupleTitle,
          subtitle: ch.tagline || ch.headline,
          coverImageUrl: ch.coverImageUrl,
          datePill: ch.dateDisplay,
          venuePill: ch.venueDisplay,
        };
      }
      case "live_countdown": {
        const lc = s as LiveCountdownSection;
        return {
          ...base,
          type: "countdown",
          targetDate: lc.targetDateIso,
          countdownHeading: lc.heading,
        };
      }
      case "event_schedule": {
        const es = s as EventScheduleSection;
        return {
          ...base,
          type: "story_timeline",
          timelineItems: (es.scheduleItems || []).map((si) => ({
            id: si.id,
            time: si.time,
            title: si.eventName,
            description: si.dressCode || si.locationName || "",
          })),
        };
      }
      case "photo_gallery": {
        const pg = s as PhotoGallerySection;
        return {
          ...base,
          type: "gallery",
          galleryMode: pg.layoutMode === "grid" ? "bento-masonry" : "circular-3d",
          galleryImages: (pg.images || []).map((img) => img.url),
        };
      }
      case "venue_location": {
        const vl = s as VenueLocationSection;
        return {
          ...base,
          type: "venue_map",
          venueName: vl.venueName,
          venueAddress: vl.address,
          mapUrl: vl.mapEmbedUrl,
          parkingNote: vl.parkingNote,
          dressCodeSwatches: vl.dressCodeSwatches,
        };
      }
      case "dynamic_rsvp": {
        return {
          ...base,
          type: "rsvp_form",
          isLocked: true,
        };
      }
      default: {
        const ch = s as CustomHighlightSection;
        return {
          ...base,
          type: "custom_highlight",
          highlightBadge: ch.badge,
          highlightText: ch.quoteText || "",
          highlightImageUrl: ch.imageUrl,
        };
      }
    }
  });
}

// =============================================================
// SectionBlocksManager Component Props
// =============================================================
export interface SectionBlocksManagerProps {
  // Modern modular props
  sections?: EventSection[];
  onSectionsChange?: (sections: EventSection[]) => void;

  // Backward compatibility legacy props
  blocks?: InvitationSectionBlock[];
  onChange?: (blocks: InvitationSectionBlock[]) => void;

  onNavigateToFormBuilder?: () => void;
  defaultContext?: {
    coupleTitle?: string;
    eventDate?: string;
    venueName?: string;
  };
}

export const SectionBlocksManager: React.FC<SectionBlocksManagerProps> = ({
  sections: controlledSections,
  onSectionsChange,
  blocks: legacyBlocks,
  onChange: onLegacyChange,
  onNavigateToFormBuilder,
  defaultContext,
}) => {
  // Resolve active sections list: prefer controlledSections, otherwise parse legacyBlocks
  const currentSections: EventSection[] = React.useMemo(() => {
    if (controlledSections && controlledSections.length > 0) {
      return controlledSections;
    }
    if (legacyBlocks && legacyBlocks.length > 0) {
      return parseModularWebsiteConfig(legacyBlocks).sections;
    }
    return parseModularWebsiteConfig(null).sections;
  }, [controlledSections, legacyBlocks]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    () => currentSections[0]?.id || null
  );
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Synchronize updates to both modern handler and legacy handler
  const handleUpdateSections = (newSections: EventSection[]) => {
    if (onSectionsChange) {
      onSectionsChange(newSections);
    }
    if (onLegacyChange) {
      onLegacyChange(projectModernSectionsToLegacyBlocks(newSections));
    }
  };

  // Reordering
  const handleMoveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === currentSections.length - 1) return;

    const targetSec = currentSections[index];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const destSec = currentSections[newIndex];

    // Guard dynamic_rsvp from moving above content or other items moving below it if locked
    if (targetSec.type === "dynamic_rsvp" && direction === "up") {
      // Allow moving up only if desired, or keep near bottom
    }

    const next = [...currentSections];
    next[index] = { ...destSec, order: index + 1 };
    next[newIndex] = { ...targetSec, order: newIndex + 1 };
    // Re-index all orders
    const normalized = next.map((s, i) => ({ ...s, order: i + 1 }));
    handleUpdateSections(normalized);
  };

  // Visibility toggle
  const handleToggleVisible = (id: string) => {
    const updated = currentSections.map((s) => {
      if (s.id === id) {
        if (s.type === "dynamic_rsvp") return s; // locked visible
        return { ...s, enabled: !s.enabled };
      }
      return s;
    });
    handleUpdateSections(updated);
  };

  // Duplicate
  const handleDuplicate = (section: EventSection) => {
    if (section.type === "dynamic_rsvp" || section.type === "cover_hero") return;
    const clone: EventSection = {
      ...section,
      id: `sec-${section.type}-${Date.now().toString().slice(-4)}`,
      title: `${section.title} (Copy)`,
      order: section.order + 1,
    } as EventSection;

    const index = currentSections.findIndex((s) => s.id === section.id);
    const next = [...currentSections];
    next.splice(index + 1, 0, clone);
    const normalized = next.map((s, i) => ({ ...s, order: i + 1 }));
    handleUpdateSections(normalized);
    setSelectedSectionId(clone.id);
  };

  // Delete
  const handleDelete = (id: string) => {
    const target = currentSections.find((s) => s.id === id);
    if (target?.isLocked || target?.type === "dynamic_rsvp" || target?.type === "cover_hero") return;
    const filtered = currentSections.filter((s) => s.id !== id);
    const normalized = filtered.map((s, i) => ({ ...s, order: i + 1 }));
    handleUpdateSections(normalized);
    if (selectedSectionId === id) {
      setSelectedSectionId(normalized[0]?.id || null);
    }
  };

  // Rename Title
  const handleUpdateTitle = (id: string, newTitle: string) => {
    const updated = currentSections.map((s) => (s.id === id ? { ...s, title: newTitle } : s));
    handleUpdateSections(updated);
  };

  // Add from Palette
  const handleSelectFromPalette = (newSection: EventSection) => {
    // Insert before dynamic_rsvp if it exists
    const rsvpIdx = currentSections.findIndex((s) => s.type === "dynamic_rsvp");
    const next = [...currentSections];
    if (rsvpIdx !== -1) {
      next.splice(rsvpIdx, 0, newSection);
    } else {
      next.push(newSection);
    }
    const normalized = next.map((s, i) => ({ ...s, order: i + 1 }));
    handleUpdateSections(normalized);
    setSelectedSectionId(newSection.id);
  };

  // Quick highlight generator
  const handleAddQuickHighlight = () => {
    const uid = `sec-custom_highlight-${Date.now().toString().slice(-4)}`;
    const newSec: EventSection = {
      id: uid,
      type: "custom_highlight",
      title: "Special VIP Note & Highlight",
      titleAr: "كلمة شكر وتقدير خاصة",
      enabled: true,
      order: currentSections.length,
      badge: "✦ SPECIAL FEATURE",
      quoteText: "Write a featured editorial note, musical guest lineup, or special instructions for your guests here.",
      backgroundStyle: "burgundy",
    };
    handleSelectFromPalette(newSec);
  };

  // Currently inspected section
  const activeSection =
    currentSections.find((s) => s.id === selectedSectionId) || currentSections[0];

  const handleUpdateActiveSection = (updated: EventSection) => {
    const updatedList = currentSections.map((s) => (s.id === updated.id ? updated : s));
    handleUpdateSections(updatedList);
  };

  const existingTypes = currentSections.map((s) => s.type);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Banner Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#231F20",
                fontFamily: "Amiri, Georgia, serif",
                margin: 0,
              }}
            >
              Admin Modular Website Creation Editor
            </h3>
            <span
              style={{
                fontSize: "0.72rem",
                padding: "0.2rem 0.55rem",
                borderRadius: "999px",
                background: "rgba(107, 29, 40, 0.08)",
                color: "#6B1D28",
                fontWeight: 700,
              }}
            >
              v2.0 Modular Schema
            </span>
          </div>
          <p
            style={{
              fontSize: "0.82rem",
              color: "#7A6F6D",
              marginTop: "0.25rem",
              marginBottom: 0,
            }}
          >
            Drop in, reorder, toggle, and customize all 11 event sections with real-time live preview synchronization.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleAddQuickHighlight}
            style={{
              background: "rgba(107, 29, 40, 0.06)",
              color: "#6B1D28",
              border: "1px solid rgba(107, 29, 40, 0.2)",
              borderRadius: "8px",
              padding: "0.5rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + Quick Highlight
          </button>

          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            style={{
              background: "linear-gradient(135deg, #6B1D28, #8C2534)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1.15rem",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(107, 29, 40, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span>＋</span>
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* Reorderable Section Deck */}
      <ModularSectionList
        sections={currentSections}
        selectedSectionId={selectedSectionId}
        onSelectSection={setSelectedSectionId}
        onToggleVisible={handleToggleVisible}
        onMoveSection={handleMoveSection}
        onDuplicateSection={handleDuplicate}
        onDeleteSection={handleDelete}
        onUpdateTitle={handleUpdateTitle}
        onOpenPalette={() => setIsPaletteOpen(true)}
      />

      {/* Active Section Config Inspector Panel */}
      {activeSection && (
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid rgba(107, 29, 40, 0.15)",
            padding: "1.25rem 1.5rem",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 700 }}>
                Active Inspector:
              </span>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#6B1D28" }}>
                {activeSection.title}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "6px",
                  background: "rgba(0,0,0,0.05)",
                  color: "#555",
                  fontFamily: "monospace",
                }}
              >
                type: {activeSection.type}
              </span>
            </div>

            {activeSection.type === "dynamic_rsvp" && onNavigateToFormBuilder && (
              <button
                type="button"
                onClick={onNavigateToFormBuilder}
                style={{
                  background: "rgba(5, 150, 105, 0.08)",
                  color: "#059669",
                  border: "1px solid rgba(5, 150, 105, 0.2)",
                  borderRadius: "6px",
                  padding: "0.3rem 0.65rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Advanced Schema Tab →
              </button>
            )}
          </div>

          <SectionInspectorRouter
            section={activeSection}
            onChange={handleUpdateActiveSection}
          />
        </div>
      )}

      {/* Section Palette Modal */}
      <SectionPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectSection={handleSelectFromPalette}
        existingTypes={existingTypes}
        defaultContext={defaultContext}
      />
    </div>
  );
};
