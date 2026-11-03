export type OccasionType =
  | "wedding"
  | "engagement"
  | "festival"
  | "gala"
  | "corporate"
  | "graduation";

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackground?: string;
  fontFamily?: "Amiri" | "Playfair Display" | "Cairo" | string;
  direction?: "rtl" | "ltr";
  themeVariant?: "ivory-royal" | "noir-obsidian" | "festival-vibrant";
  enableShader?: boolean;
  shaderType?: "gradient-waves" | "mesh" | "noir";
}

export interface ScheduleItem {
  timeOrYear: string;
  title: string;
  description: string;
  badge?: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
  alt?: string;
}

export interface DressCodeColor {
  name: string;
  hex: string;
}

export interface DressCodeConfig {
  title: string;
  description: string;
  swatches?: DressCodeColor[];
  notes?: string;
}

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea";

export interface DynamicFormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  isLocked?: boolean;
  helperText?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
}

export interface SectionBlockConfig {
  id: string;
  type:
    | "hero"
    | "countdown"
    | "schedule"
    | "timeline"
    | "gallery"
    | "map"
    | "venue_and_dress"
    | "rsvp";
  enabled: boolean;
  title?: string;
  subtitle?: string;
  config?: Record<string, unknown>;
}

export interface InvitationDocument {
  $id?: string;
  id?: string;
  orderId?: string;
  clientId?: string;
  slug: string;
  eventTitle: string;
  occasionType: OccasionType;
  eventDate: string;
  eventTime?: string;
  venueName: string;
  venueAddress?: string;
  venueMapUrl?: string;
  maxCapacity?: number;
  heroImageUrl?: string;
  tagline?: string;
  coupleOrHostNames?: string;
  themeConfigJson?: string | ThemeConfig;
  sectionsConfigJson?: string | SectionBlockConfig[];
  formSchemaJson?: string | DynamicFormField[];
  scheduleJson?: string | ScheduleItem[];
  galleryJson?: string | GalleryItem[];
  dressCodeJson?: string | DressCodeConfig;
  qrCodeUrl?: string;
  isPublished?: boolean;
}

export type RsvpStatus = "pending" | "approved" | "declined";

export interface InvitationRsvpDocument {
  $id?: string;
  id?: string;
  invitationId: string;
  clientId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  companionsCount: number;
  dynamicResponsesJson: string;
  status: RsvpStatus;
  passToken?: string;
  qrCodeUrl?: string;
  emailSent?: boolean;
  isCheckedInAtVenue?: boolean;
  checkedInAt?: string;
  respondedAt?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
