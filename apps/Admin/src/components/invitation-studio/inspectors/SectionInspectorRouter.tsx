import React from "react";
import type {
  EventSection,
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

import { CoverHeroInspector } from "./CoverHeroInspector";
import { CoupleStoryInspector } from "./CoupleStoryInspector";
import { EventScheduleInspector } from "./EventScheduleInspector";
import { PhotoGalleryInspector } from "./PhotoGalleryInspector";
import { WishingWallInspector } from "./WishingWallInspector";
import { DigitalGiftRegistryInspector } from "./DigitalGiftRegistryInspector";
import { BackgroundAudioInspector } from "./BackgroundAudioInspector";
import { VenueLocationInspector } from "./VenueLocationInspector";
import { LiveCountdownInspector } from "./LiveCountdownInspector";
import { CustomHighlightInspector } from "./CustomHighlightInspector";
import { DynamicRsvpInspector } from "./DynamicRsvpInspector";

export interface SectionInspectorRouterProps {
  section: EventSection;
  onChange: (updated: EventSection) => void;
}

export const SectionInspectorRouter: React.FC<SectionInspectorRouterProps> = ({
  section,
  onChange,
}) => {
  switch (section.type) {
    case "cover_hero":
      return (
        <CoverHeroInspector
          section={section as CoverHeroSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "couple_story":
      return (
        <CoupleStoryInspector
          section={section as CoupleStorySection}
          onChange={(s) => onChange(s)}
        />
      );

    case "event_schedule":
      return (
        <EventScheduleInspector
          section={section as EventScheduleSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "photo_gallery":
      return (
        <PhotoGalleryInspector
          section={section as PhotoGallerySection}
          onChange={(s) => onChange(s)}
        />
      );

    case "wishing_wall":
      return (
        <WishingWallInspector
          section={section as WishingWallSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "digital_gift_registry":
      return (
        <DigitalGiftRegistryInspector
          section={section as DigitalGiftRegistrySection}
          onChange={(s) => onChange(s)}
        />
      );

    case "background_audio":
      return (
        <BackgroundAudioInspector
          section={section as BackgroundAudioSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "venue_location":
      return (
        <VenueLocationInspector
          section={section as VenueLocationSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "live_countdown":
      return (
        <LiveCountdownInspector
          section={section as LiveCountdownSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "custom_highlight":
      return (
        <CustomHighlightInspector
          section={section as CustomHighlightSection}
          onChange={(s) => onChange(s)}
        />
      );

    case "dynamic_rsvp":
      return (
        <DynamicRsvpInspector
          section={section as DynamicRsvpSection}
          onChange={(s) => onChange(s)}
        />
      );

    default:
      return (
        <div style={{ padding: "1rem", color: "#666" }}>
          Unknown section type: {(section as EventSection).type}
        </div>
      );
  }
};
