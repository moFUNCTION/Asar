import type { DynamicFormField } from "./models.ts";
/**
 * All 11 supported modular section type literals.
 */
export type EventSectionType = "cover_hero" | "couple_story" | "event_schedule" | "photo_gallery" | "wishing_wall" | "digital_gift_registry" | "background_audio" | "venue_location" | "live_countdown" | "custom_highlight" | "dynamic_rsvp";
export declare const ALL_EVENT_SECTION_TYPES: readonly EventSectionType[];
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
export interface WishingWallSection extends SectionBase {
    type: "wishing_wall";
    subtitle?: string;
    moderationRequired: boolean;
    greetingPrompt: string;
    placeholder: string;
    allowReactions: boolean;
    maxMessageLength: number;
}
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
export interface BackgroundAudioSection extends SectionBase {
    type: "background_audio";
    songTitle: string;
    artistName: string;
    audioUrl: string;
    autoPlayNotice: string;
    loopEnabled: boolean;
    initialMuted: boolean;
}
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
export interface LiveCountdownSection extends SectionBase {
    type: "live_countdown";
    targetDateIso: string;
    heading: string;
    completedMessage: string;
}
export interface CustomHighlightSection extends SectionBase {
    type: "custom_highlight";
    badge?: string;
    quoteText: string;
    author?: string;
    backgroundStyle?: "alabaster" | "obsidian" | "burgundy" | "glass" | string;
    imageUrl?: string;
}
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
export type EventSection = CoverHeroSection | CoupleStorySection | EventScheduleSection | PhotoGallerySection | WishingWallSection | DigitalGiftRegistrySection | BackgroundAudioSection | VenueLocationSection | LiveCountdownSection | CustomHighlightSection | DynamicRsvpSection;
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
export declare const DEFAULT_LOCKED_RSVP_EMAIL_FIELD: DynamicFormField;
export declare const DEFAULT_RSVP_NAME_FIELD: DynamicFormField;
export declare const DEFAULT_RSVP_COMPANIONS_FIELD: DynamicFormField;
export declare const DEFAULT_RSVP_NOTE_FIELD: DynamicFormField;
/**
 * Generates an authentic default ModularWebsiteConfig populated with 11 standard sections.
 */
export declare function createDefaultModularWebsiteConfig(options?: Partial<{
    coupleTitle: string;
    eventDate: string;
    venueName: string;
}>): ModularWebsiteConfig;
/**
 * Parses raw unknown data (e.g. from Appwrite `sectionsConfigJson` or localStorage) into a strictly-typed ModularWebsiteConfig.
 * Handles legacy v1 flat `InvitationSectionBlock[]`, modern v2 configs, stringified JSON, and corrupt inputs with zero crashes.
 */
export declare function parseModularWebsiteConfig(raw: unknown): ModularWebsiteConfig;
/**
 * Validates a ModularWebsiteConfig object against architectural constraints.
 * Returns an object with `isValid: boolean` and a list of human-readable error messages.
 */
export declare function validateModularWebsiteConfig(config: unknown): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=sections.d.ts.map