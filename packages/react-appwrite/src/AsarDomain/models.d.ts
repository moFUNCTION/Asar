export type AsarServiceType = "booth" | "invitation";
export interface AsarPlanLimits {
    coverageHours?: number;
    maxVoiceRecords: number;
    maxGalleryPhotos: number;
    maxCustomCategories: number;
    hasVideoHighlight: boolean;
    hasGuestBookTab: boolean;
    allowBulkZipDownload: boolean;
    hostingDurationDays: number;
    maxRsvpCapacity?: number;
    allowCustomSections?: boolean;
}
export interface AsarPlanAddon {
    id: string;
    name: string;
    price: number;
    description?: string;
    badge?: string;
}
export interface AsarPlan {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    serviceType: AsarServiceType;
    name: string;
    subtitle: string;
    badge: string;
    subBadge?: string;
    price: number;
    currency: string;
    themeVariant: "ivory-royal" | "noir-obsidian";
    imageUrl?: string;
    featuresJson: string;
    addonsJson: string;
    limitsJson: string;
    isActive: boolean;
    sortOrder: number;
}
export type OrderStatus = "pending_payment" | "payment_rejected" | "awaiting_client_assets" | "event_scheduled" | "audio_mastering" | "studio_curation" | "published";
export interface ClientSubmittedAssets {
    eventHeaderTag?: string;
    coupleTitle?: string;
    eventDateDisplay?: string;
    eventLocationDisplay?: string;
    highlightBadge?: string;
    coupleQuote?: string;
    thankYouMessage?: string;
    heroImageFileId?: string;
    heroImagePreviewUrl?: string;
    customCategories?: string[];
    requestedRsvpFields?: string[];
    occasionType?: string;
    maxVenueCapacity?: number;
}
export interface AsarOrder {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    clientId: string;
    clientName: string;
    partnerOrOrgName?: string;
    clientEmail: string;
    clientPhone: string;
    serviceType: AsarServiceType;
    planId: string;
    planName: string;
    selectedAddonsJson?: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    eventDate?: string;
    eventVenue?: string;
    clientSubmittedAssetsJson?: string;
    quotaOverridesJson?: string;
    adminNotes?: string;
}
export type PaymentMethod = "instapay" | "vodafone_cash" | "bank_transfer";
export type PaymentStatus = "pending" | "approved" | "rejected";
export interface AsarPayment {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    orderId: string;
    clientId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    screenshotFileId?: string;
    screenshotUrl?: string;
    status: PaymentStatus;
    rejectionReason?: string;
    reviewedByAdminId?: string;
    reviewedAt?: string;
}
export interface BoothMemory {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    orderId?: string;
    clientId?: string;
    slug: string;
    subdomain?: string;
    customDomain?: string;
    eventHeaderTag?: string;
    coupleTitle: string;
    tagline?: string;
    eventDateDisplay?: string;
    eventLocationDisplay?: string;
    highlightBadge?: string;
    coupleQuote?: string;
    heroImageFileId?: string;
    heroImageUrl?: string;
    videoHighlightFileId?: string;
    videoHighlightThumbnailId?: string;
    videoHighlightTitle?: string;
    thankYouTitle?: string;
    thankYouMessage?: string;
    categoriesJson?: string;
    isPrivateLocked: boolean;
    accessPinCode?: string;
    qrCodeUrl?: string;
    isPublished: boolean;
}
export interface BoothVoiceRecord {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    memoryId: string;
    audioFileId?: string;
    audioFileUrl?: string;
    speakerName: string;
    speakerRole: string;
    category: string;
    quoteSnippet?: string;
    avatarFileId?: string;
    avatarUrl?: string;
    durationFormatted: string;
    durationSeconds: number;
    waveformPeaksJson: string;
    likesCount: number;
    isFeatured: boolean;
    sortOrder: number;
}
export type BoothMediaType = "photo" | "guestbook_note";
export interface BoothMedia {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    memoryId: string;
    mediaType: BoothMediaType;
    fileId?: string;
    fileUrl?: string;
    authorName?: string;
    captionOrNote?: string;
    sortOrder: number;
}
export type InvitationOccasionType = "wedding" | "engagement" | "festival" | "gala" | "corporate" | "graduation";
export type DynamicFormFieldType = "text" | "email" | "phone" | "number" | "select" | "textarea" | "radio" | "checkbox";
export interface DynamicFormField {
    id: string;
    name: string;
    labelEn: string;
    labelAr: string;
    type: DynamicFormFieldType;
    required: boolean;
    locked?: boolean;
    placeholderEn?: string;
    placeholderAr?: string;
    options?: Array<{
        labelEn: string;
        labelAr: string;
        value: string;
    }>;
    defaultValue?: string | number | boolean;
    helperTextEn?: string;
    helperTextAr?: string;
}
export interface InvitationSectionBlock {
    id: string;
    type: "hero" | "countdown" | "story" | "schedule" | "location_map" | "gallery" | "rsvp_form" | "custom_text";
    titleEn: string;
    titleAr: string;
    enabled: boolean;
    order: number;
    configJson?: string;
}
export interface InvitationThemeConfig {
    primaryColor?: string;
    secondaryColor?: string;
    accentGoldColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    fontFamilyDisplay?: string;
    fontFamilyBody?: string;
    direction?: "rtl" | "ltr" | "auto";
    webGlEffect?: "waves" | "veil" | "ball" | "none";
    enableMusic?: boolean;
    musicAudioUrl?: string;
}
export interface AsarInvitation {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    orderId?: string;
    clientId?: string;
    slug: string;
    subdomain?: string;
    customDomain?: string;
    eventTitle: string;
    occasionType: InvitationOccasionType;
    eventDate: string;
    eventTime?: string;
    venueName: string;
    venueAddress?: string;
    venueMapUrl?: string;
    maxCapacity?: number;
    themeConfigJson?: string;
    sectionsConfigJson?: string;
    formSchemaJson?: string;
    qrCodeUrl?: string;
    isPublished: boolean;
}
export type RsvpStatus = "pending" | "approved" | "declined";
export interface InvitationRsvp {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    invitationId: string;
    clientId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    companionsCount: number;
    dynamicResponsesJson?: string;
    status: RsvpStatus;
    passToken?: string;
    qrCodeUrl?: string;
    emailSent?: boolean;
    isCheckedInAtVenue?: boolean;
    checkedInAt?: string;
    respondedAt?: string;
}
export declare function safeJsonParse<T>(jsonValue: unknown, fallback: T): T;
export declare const DEFAULT_PLAN_LIMITS: AsarPlanLimits;
export declare function parsePlanFeatures(plan: Partial<AsarPlan> | null | undefined): string[];
export declare function parsePlanLimits(plan: Partial<AsarPlan> | null | undefined): AsarPlanLimits;
export declare function parsePlanAddons(plan: Partial<AsarPlan> | null | undefined): AsarPlanAddon[];
export declare function parseClientAssets(order: Partial<AsarOrder> | null | undefined): ClientSubmittedAssets;
export declare function parseWaveformPeaks(waveformPeaksJson: string | null | undefined, defaultBarCount?: number): number[];
export declare function parseCategories(categoriesJson: string | null | undefined): string[];
export declare function parseFormSchema(schemaJson: string | null | undefined): DynamicFormField[];
export declare function parseThemeConfig(themeJson: string | null | undefined): InvitationThemeConfig;
export declare function parseSectionsConfig(sectionsJson: string | null | undefined): InvitationSectionBlock[];
export type AsarUserRole = "client" | "admin";
export interface AsarUserProfile {
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    role: AsarUserRole;
    avatarUrl?: string;
    organization?: string;
    locale?: string;
    metadataJson?: string;
}
export declare function parseUserProfile(doc: any): AsarUserProfile | null;
//# sourceMappingURL=models.d.ts.map