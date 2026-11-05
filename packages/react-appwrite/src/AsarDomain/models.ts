// =============================================================
// ASAR (Athar / أثر) — Shared Domain Models & Safe Parsers
// =============================================================

export type AsarServiceType = "booth" | "invitation";

export interface AsarPlanLimits {
  coverageHours?: number;
  maxVoiceRecords: number; // e.g. 80, 150, or -1 for unlimited
  maxGalleryPhotos: number; // e.g. 20, 100, or -1 for unlimited
  maxCustomCategories: number; // e.g. 4, 10
  hasVideoHighlight: boolean;
  hasGuestBookTab: boolean;
  allowBulkZipDownload: boolean;
  hostingDurationDays: number; // e.g. 365
  maxRsvpCapacity?: number; // For Invitation service (e.g. 150, 500)
  allowCustomSections?: boolean; // For Invitation service
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
  featuresJson: string; // JSON stringified string[]
  addonsJson: string; // JSON stringified AsarPlanAddon[]
  limitsJson: string; // JSON stringified AsarPlanLimits
  isActive: boolean;
  sortOrder: number;
}

export type OrderStatus =
  | "pending_payment"
  | "payment_rejected"
  | "awaiting_client_assets"
  | "event_scheduled"
  | "audio_mastering"
  | "studio_curation"
  | "published";

export interface ClientSubmittedAssets {
  eventHeaderTag?: string; // e.g. "THE WEDDING OF"
  coupleTitle?: string; // e.g. "Mina & Maryam"
  eventDateDisplay?: string; // e.g. "12 July 2026"
  eventLocationDisplay?: string; // e.g. "Alexandria, Egypt"
  highlightBadge?: string; // e.g. "Together Always"
  coupleQuote?: string; // e.g. "Every voice here is a piece of our forever ..."
  thankYouMessage?: string;
  heroImageFileId?: string;
  heroImagePreviewUrl?: string;
  customCategories?: string[]; // e.g. ["Family", "Friends", "Colleagues", "Special Guests"]
  requestedRsvpFields?: string[]; // For Invitation service
  occasionType?: string; // For Invitation service: "wedding" | "festival" | "gala" | "corporate"
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
  selectedAddonsJson?: string; // JSON stringified string[] or AsarPlanAddon[]
  totalAmount: number;
  orderStatus: OrderStatus;
  eventDate?: string;
  eventVenue?: string;
  clientSubmittedAssetsJson?: string; // JSON stringified ClientSubmittedAssets
  quotaOverridesJson?: string; // JSON stringified Partial<AsarPlanLimits>
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
  eventHeaderTag?: string; // "THE WEDDING OF"
  coupleTitle: string; // "Mina & Maryam"
  tagline?: string; // "Same People. Different Voices. A Lasting Athar."
  eventDateDisplay?: string; // "12 July 2026"
  eventLocationDisplay?: string; // "Alexandria, Egypt"
  highlightBadge?: string; // "Together Always"
  coupleQuote?: string; // "Every voice here is a piece of our forever..."
  heroImageFileId?: string;
  heroImageUrl?: string;
  videoHighlightFileId?: string;
  videoHighlightThumbnailId?: string;
  videoHighlightTitle?: string; // "30 Seconds of Your Day"
  thankYouTitle?: string;
  thankYouMessage?: string;
  categoriesJson?: string; // JSON stringified string[]
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
  speakerName: string; // "Nour Hassan"
  speakerRole: string; // "Best Friend"
  category: string; // "Friends"
  quoteSnippet?: string; // "Mabrook ya gameela..."
  avatarFileId?: string;
  avatarUrl?: string;
  durationFormatted: string; // "0:42"
  durationSeconds: number;
  waveformPeaksJson: string; // JSON stringified 48 normalized floats [0.15..1.0]
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

export type InvitationOccasionType =
  | "wedding"
  | "engagement"
  | "festival"
  | "gala"
  | "corporate"
  | "graduation";

export type DynamicFormFieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "select"
  | "textarea"
  | "radio"
  | "checkbox";

export interface DynamicFormField {
  id: string;
  name: string;
  labelEn: string;
  labelAr: string;
  type: DynamicFormFieldType;
  required: boolean;
  locked?: boolean; // guestEmail is locked
  placeholderEn?: string;
  placeholderAr?: string;
  options?: Array<{ labelEn: string; labelAr: string; value: string }>;
  defaultValue?: string | number | boolean;
  helperTextEn?: string;
  helperTextAr?: string;
}

export interface InvitationSectionBlock {
  id: string;
  type:
    | "hero"
    | "countdown"
    | "story"
    | "schedule"
    | "location_map"
    | "gallery"
    | "rsvp_form"
    | "custom_text";
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
  themeConfigJson?: string; // JSON stringified InvitationThemeConfig
  sectionsConfigJson?: string; // JSON stringified InvitationSectionBlock[]
  formSchemaJson?: string; // JSON stringified DynamicFormField[]
  qrCodeUrl?: string;
  isPublished: boolean;
}

export type RsvpStatus = "pending" | "approved" | "declined";

export interface InvitationRsvp {
  $id?: string;
  $createdAt?: string;
  $updatedAt?: string;
  invitationId: string;
  clientId: string; // Owner of the Client Mailbox
  guestName: string;
  guestEmail: string; // Strictly Required & Locked
  guestPhone?: string;
  companionsCount: number;
  dynamicResponsesJson?: string; // JSON map of all custom field values
  status: RsvpStatus;
  passToken?: string;
  qrCodeUrl?: string;
  emailSent?: boolean;
  isCheckedInAtVenue?: boolean;
  checkedInAt?: string;
  respondedAt?: string;
}

// =============================================================
// Safe JSON Parsing & Extraction Helpers
// =============================================================

export function safeJsonParse<T>(jsonValue: unknown, fallback: T): T {
  if (jsonValue === null || jsonValue === undefined) {
    return fallback;
  }
  if (typeof jsonValue === "object") {
    return jsonValue as T;
  }
  if (typeof jsonValue !== "string") {
    return fallback;
  }
  const trimmed = jsonValue.trim();
  if (!trimmed) {
    return fallback;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

export const DEFAULT_PLAN_LIMITS: AsarPlanLimits = {
  coverageHours: 3,
  maxVoiceRecords: 80,
  maxGalleryPhotos: 20,
  maxCustomCategories: 4,
  hasVideoHighlight: false,
  hasGuestBookTab: true,
  allowBulkZipDownload: true,
  hostingDurationDays: 365,
  maxRsvpCapacity: 150,
  allowCustomSections: false,
};

export function parsePlanFeatures(
  plan: Partial<AsarPlan> | null | undefined
): string[] {
  if (!plan?.featuresJson) return [];
  const parsed = safeJsonParse<unknown>(plan.featuresJson, []);
  return Array.isArray(parsed) ? (parsed.filter(Boolean) as string[]) : [];
}

export function parsePlanLimits(
  plan: Partial<AsarPlan> | null | undefined
): AsarPlanLimits {
  if (!plan?.limitsJson) return { ...DEFAULT_PLAN_LIMITS };
  const parsed = safeJsonParse<Partial<AsarPlanLimits>>(
    plan.limitsJson,
    DEFAULT_PLAN_LIMITS
  );
  return {
    ...DEFAULT_PLAN_LIMITS,
    ...parsed,
  };
}

export function parsePlanAddons(
  plan: Partial<AsarPlan> | null | undefined
): AsarPlanAddon[] {
  if (!plan?.addonsJson) return [];
  const parsed = safeJsonParse<unknown>(plan.addonsJson, []);
  return Array.isArray(parsed) ? (parsed as AsarPlanAddon[]) : [];
}

export function parseClientAssets(
  order: Partial<AsarOrder> | null | undefined
): ClientSubmittedAssets {
  if (!order?.clientSubmittedAssetsJson) return {};
  return safeJsonParse<ClientSubmittedAssets>(
    order.clientSubmittedAssetsJson,
    {}
  );
}

export function parseWaveformPeaks(
  waveformPeaksJson: string | null | undefined,
  defaultBarCount = 48
): number[] {
  if (!waveformPeaksJson) {
    return Array.from({ length: defaultBarCount }, () => 0.35);
  }
  const parsed = safeJsonParse<unknown>(waveformPeaksJson, []);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.map((val) => {
      const num = Number(val);
      if (Number.isNaN(num)) return 0.25;
      return Math.min(1.0, Math.max(0.15, Number(num.toFixed(2))));
    });
  }
  return Array.from({ length: defaultBarCount }, () => 0.35);
}

export function parseCategories(
  categoriesJson: string | null | undefined
): string[] {
  if (!categoriesJson) {
    return ["Family", "Friends", "Colleagues", "Special Guests"];
  }
  const parsed = safeJsonParse<unknown>(categoriesJson, []);
  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed.filter((c): c is string => typeof c === "string" && !!c.trim());
  }
  return ["Family", "Friends", "Colleagues", "Special Guests"];
}

export function parseFormSchema(
  schemaJson: string | null | undefined
): DynamicFormField[] {
  if (!schemaJson) return [];
  const parsed = safeJsonParse<unknown>(schemaJson, []);
  return Array.isArray(parsed) ? (parsed as DynamicFormField[]) : [];
}

export function parseThemeConfig(
  themeJson: string | null | undefined
): InvitationThemeConfig {
  if (!themeJson) return {};
  return safeJsonParse<InvitationThemeConfig>(themeJson, {});
}

export function parseSectionsConfig(
  sectionsJson: string | null | undefined
): InvitationSectionBlock[] {
  if (!sectionsJson) return [];
  const parsed = safeJsonParse<unknown>(sectionsJson, []);
  return Array.isArray(parsed) ? (parsed as InvitationSectionBlock[]) : [];
}

// =============================================================
// ASAR User Profile Model
// =============================================================

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

export function parseUserProfile(doc: any): AsarUserProfile | null {
  if (!doc || typeof doc !== "object") return null;
  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
    userId: doc.userId || doc.$id || "",
    name: doc.name || "",
    email: doc.email || "",
    phone: doc.phone || undefined,
    role: (doc.role === "admin" ? "admin" : "client") as AsarUserRole,
    avatarUrl: doc.avatarUrl || undefined,
    organization: doc.organization || undefined,
    locale: doc.locale || "ar",
    metadataJson: doc.metadataJson || undefined,
  };
}
