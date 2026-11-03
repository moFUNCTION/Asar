// Global ambient declaration for process environment in Vite browser workspace
declare global {
  // eslint-disable-next-line no-var
  var process: { env?: Record<string, string | undefined> } | undefined;
}

export * from "./InvitationHeader";
export * from "./InvitationLandingHero";
export * from "./InvitationHero";
export * from "./InvitationFeaturesShowcase";
export * from "./FeaturesAndMailboxSection";
export * from "./InvitationThemesGallery";
export * from "./OccasionsShowcaseSection";
export * from "./InvitationPackagesSection";
export * from "./InvitationAddonsSection";
export * from "./InvitationBookingModal";
export * from "./InvitationFooter";
