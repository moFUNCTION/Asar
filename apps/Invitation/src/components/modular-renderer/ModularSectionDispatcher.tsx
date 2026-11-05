import React, { useMemo } from "react";
import {
  parseModularWebsiteConfig,
  type ModularWebsiteConfig,
  type EventSection,
  type CoverHeroSection as CoverHeroSectionModel,
  type CoupleStorySection as CoupleStorySectionModel,
  type EventScheduleSection as EventScheduleSectionModel,
  type PhotoGallerySection as PhotoGallerySectionModel,
  type WishingWallSection as WishingWallSectionModel,
  type DigitalGiftRegistrySection as DigitalGiftRegistrySectionModel,
  type BackgroundAudioSection as BackgroundAudioSectionModel,
  type VenueLocationSection as VenueLocationSectionModel,
  type LiveCountdownSection as LiveCountdownSectionModel,
  type CustomHighlightSection as CustomHighlightSectionModel,
  type DynamicRsvpSection as DynamicRsvpSectionModel,
} from "@repo/react-appwrite";

import type { InvitationDocument } from "../../components/renderer/types";
import {
  CoverHeroSection,
  CoupleStorySection,
  MultiEventScheduleSection,
  FloatingAudioPlayerBar,
  DigitalGiftRegistrySection,
  InteractiveRsvpSection,
  InteractiveWishingWallSection,
  ResponsivePhotoGallerySection,
  VenueLocationSection,
  LiveCountdownSection,
  CustomHighlightSection,
} from "./sections";

export interface ModularSectionDispatcherProps {
  config?: ModularWebsiteConfig | string | null;
  rawSectionsConfigJson?: unknown;
  invitation: InvitationDocument;
  isNoir?: boolean;
  onOpenPass?: (rsvpId: string) => void;
  onRsvpClick?: () => void;
  showNavigationPills?: boolean;
}

/**
 * Returns a human-friendly anchor label for navigation pills.
 */
function getSectionAnchorLabel(section: EventSection): { en: string; ar: string } {
  switch (section.type) {
    case "cover_hero":
      return { en: "Home", ar: "البداية" };
    case "live_countdown":
      return { en: "Countdown", ar: "العد التنازلي" };
    case "couple_story":
      return { en: "Story", ar: "قصتنا" };
    case "event_schedule":
      return { en: "Schedule", ar: "البرنامج" };
    case "photo_gallery":
      return { en: "Gallery", ar: "الصور" };
    case "wishing_wall":
      return { en: "Wishes", ar: "التهاني" };
    case "digital_gift_registry":
      return { en: "Gift Box", ar: "صندوق الهدايا" };
    case "venue_location":
      return { en: "Venue", ar: "المكان" };
    case "custom_highlight":
      return { en: "Blessing", ar: "دعاء" };
    case "dynamic_rsvp":
      return { en: "RSVP", ar: "تأكيد الحضور" };
    default:
      return { en: section.title, ar: section.titleAr || section.title };
  }
}

/**
 * Maps section type to standard anchor hash.
 */
function getSectionAnchorId(section: EventSection): string {
  switch (section.type) {
    case "dynamic_rsvp":
      return "rsvp-section";
    case "event_schedule":
      return "schedule-section";
    case "wishing_wall":
      return "wishing-wall-section";
    case "photo_gallery":
      return "gallery-section";
    case "digital_gift_registry":
      return "gift-registry-section";
    case "venue_location":
      return "venue-section";
    case "couple_story":
      return "story-section";
    case "live_countdown":
      return "countdown-section";
    case "custom_highlight":
      return "highlight-section";
    case "cover_hero":
      return "cover-section";
    default:
      return section.id;
  }
}

export const ModularSectionDispatcher: React.FC<ModularSectionDispatcherProps> = ({
  config,
  rawSectionsConfigJson,
  invitation,
  isNoir = false,
  onOpenPass,
  onRsvpClick,
  showNavigationPills = true,
}) => {
  // 1. Safely parse modular website configuration
  const parsedConfig: ModularWebsiteConfig = useMemo(() => {
    const raw = config ?? rawSectionsConfigJson ?? invitation.sectionsConfigJson;
    return parseModularWebsiteConfig(raw);
  }, [config, rawSectionsConfigJson, invitation.sectionsConfigJson]);

  // 2. Filter enabled sections and sort ascending by order
  const { flowSections, backgroundAudioSection } = useMemo(() => {
    const all = parsedConfig.sections || [];
    const enabled = all
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);

    // Extract persistent background audio if configured and enabled
    const audioSec = enabled.find(
      (s) => s.type === "background_audio"
    ) as BackgroundAudioSectionModel | undefined;

    // Filter out background_audio from standard vertical block stack so it docks as floating bar
    const flow = enabled.filter((s) => s.type !== "background_audio");

    return {
      flowSections: flow,
      backgroundAudioSection: audioSec,
    };
  }, [parsedConfig.sections]);

  // Handle smooth scroll to section anchor
  const handleScrollToAnchor = (anchorId: string) => {
    const el = document.getElementById(anchorId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="athar-modular-section-dispatcher" style={{ position: "relative" }}>
      {/* Top Floating Anchor Navigation Bar */}
      {showNavigationPills && flowSections.length > 2 && (
        <nav
          aria-label="Modular website section quick navigation"
          style={{
            position: "sticky",
            top: "54px",
            zIndex: 45,
            padding: "0.5rem 1rem",
            display: "flex",
            justifyContent: "center",
            background: isNoir ? "rgba(22, 18, 20, 0.78)" : "rgba(251, 247, 242, 0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.25))",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              maxWidth: "960px",
            }}
          >
            {flowSections.map((sec) => {
              const label = getSectionAnchorLabel(sec);
              const anchorId = getSectionAnchorId(sec);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleScrollToAnchor(anchorId)}
                  style={{
                    padding: "0.3rem 0.85rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(212, 175, 55, 0.25)",
                    backgroundColor: isNoir ? "rgba(35, 26, 30, 0.7)" : "#FFFFFF",
                    color: isNoir ? "#D6C7B2" : "var(--athar-text-title, #231F20)",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--athar-gold, #D4AF37)";
                    e.currentTarget.style.color = "var(--athar-gold, #D4AF37)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.25)";
                    e.currentTarget.style.color = isNoir ? "#D6C7B2" : "var(--athar-text-title, #231F20)";
                  }}
                >
                  {label.ar} · {label.en}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Sections Flow Dispatcher */}
      <main style={{ minHeight: "100vh" }}>
        {flowSections.map((section) => {
          const anchorId = getSectionAnchorId(section);

          return (
            <div
              key={section.id}
              id={anchorId}
              data-section-id={section.id}
              data-section-type={section.type}
              data-section-order={section.order}
              style={{ position: "relative" }}
            >
              {/* Type-Safe Discriminated Union Mapping */}
              {(() => {
                switch (section.type) {
                  case "cover_hero":
                    return (
                      <CoverHeroSection
                        section={section as CoverHeroSectionModel}
                        invitation={invitation}
                        isNoir={isNoir}
                        onRsvpClick={onRsvpClick}
                      />
                    );

                  case "couple_story":
                    return (
                      <CoupleStorySection
                        section={section as CoupleStorySectionModel}
                        isNoir={isNoir}
                      />
                    );

                  case "event_schedule":
                    return (
                      <MultiEventScheduleSection
                        section={section as EventScheduleSectionModel}
                        isNoir={isNoir}
                        eventDate={invitation.eventDate}
                      />
                    );

                  case "photo_gallery":
                    return (
                      <ResponsivePhotoGallerySection
                        section={section as PhotoGallerySectionModel}
                        isNoir={isNoir}
                      />
                    );

                  case "wishing_wall":
                    return (
                      <InteractiveWishingWallSection
                        section={section as WishingWallSectionModel}
                        invitationId={invitation.$id || invitation.id}
                        isNoir={isNoir}
                      />
                    );

                  case "digital_gift_registry":
                    return (
                      <DigitalGiftRegistrySection
                        section={section as DigitalGiftRegistrySectionModel}
                        isNoir={isNoir}
                      />
                    );

                  case "venue_location":
                    return (
                      <VenueLocationSection
                        section={section as VenueLocationSectionModel}
                        isNoir={isNoir}
                      />
                    );

                  case "live_countdown":
                    return (
                      <LiveCountdownSection
                        section={section as LiveCountdownSectionModel}
                        isNoir={isNoir}
                      />
                    );

                  case "custom_highlight":
                    return (
                      <CustomHighlightSection
                        section={section as CustomHighlightSectionModel}
                        isNoir={isNoir}
                      />
                    );

                  case "dynamic_rsvp":
                    return (
                      <InteractiveRsvpSection
                        section={section as DynamicRsvpSectionModel}
                        invitation={invitation}
                        isNoir={isNoir}
                        onPreviewPass={onOpenPass}
                      />
                    );

                  default:
                    // Exhaustive check fallback for unrecognized custom types
                    return null;
                }
              })()}
            </div>
          );
        })}
      </main>

      {/* Persistent Floating Background Audio Player */}
      {backgroundAudioSection && (
        <FloatingAudioPlayerBar
          section={backgroundAudioSection}
          isNoir={isNoir}
        />
      )}
    </div>
  );
};

export default ModularSectionDispatcher;
