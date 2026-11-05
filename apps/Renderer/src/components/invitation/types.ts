// =============================================================
// ASAR (Athar / أثر) — Invitation Memory Storefront Types
// =============================================================

export type InvitationOccasionType =
  | "wedding"
  | "engagement"
  | "festival"
  | "gala"
  | "corporate"
  | "graduation";

export interface InvitationThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackground?: string;
  fontFamily?: "Amiri" | "Playfair Display" | "Cairo" | string;
  direction?: "rtl" | "ltr";
  themeVariant?: "ivory-royal" | "noir-obsidian" | "festival-vibrant";
  enableShader?: boolean;
}

export interface InvitationScheduleItem {
  timeOrYear: string;
  title: string;
  description: string;
  badge?: string;
}

export interface DressCodeColorSwatch {
  name: string;
  hex: string;
}

export interface InvitationDressCodeConfig {
  title: string;
  description: string;
  swatches?: DressCodeColorSwatch[];
  notes?: string;
}

export type DynamicFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea";

export interface DynamicFormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: DynamicFieldType;
  placeholder?: string;
  required?: boolean;
  isLocked?: boolean;
  helperText?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
}

export interface InvitationStorefrontData {
  $id?: string;
  id?: string;
  orderId?: string;
  clientId?: string;
  slug: string;
  eventTitle: string;
  occasionType: InvitationOccasionType;
  eventDate: string;
  eventTime?: string;
  venueName: string;
  venueAddress?: string;
  venueMapUrl?: string;
  maxCapacity?: number;
  heroImageUrl?: string;
  tagline?: string;
  themeConfigJson?: string | InvitationThemeConfig;
  scheduleJson?: string | InvitationScheduleItem[];
  dressCodeJson?: string | InvitationDressCodeConfig;
  formSchemaJson?: string | DynamicFormFieldConfig[];
  qrCodeUrl?: string;
  isPublished?: boolean;
}

export type RsvpPassStatus = "pending" | "approved" | "declined";

export interface GeneratedVipPass {
  $id: string;
  id: string;
  invitationId: string;
  clientId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  companionsCount: number;
  dynamicResponsesJson: string;
  status: RsvpPassStatus;
  passToken: string;
  qrCodeUrl: string;
  emailSent?: boolean;
  isCheckedInAtVenue?: boolean;
  respondedAt: string;
}
