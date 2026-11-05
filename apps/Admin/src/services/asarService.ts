// =============================================================
// ASAR Admin — Appwrite Configuration, Collections & Schema
// Modelled after Lyder-Eco Service Architecture
// =============================================================

export const ASAR_DATABASE_ID = "asar-db";

export const ASAR_COLLECTIONS = {
  USERS: "users",
  PLANS: "plans",
  ORDERS: "orders",
  PAYMENTS: "payments",
  BOOTH_MEMORIES: "booth_memories",
  BOOTH_VOICE_RECORDS: "booth_voice_records",
  BOOTH_MEDIA: "booth_media",
  INVITATIONS: "invitations",
  INVITATION_RSVPS: "invitation_rsvps",
  WISHING_WALL_MESSAGES: "wishing_wall_messages",
} as const;

export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "asar_storage",
  CLIENT_RAW_ASSETS: "asar_storage",
  BOOTH_MASTERED_AUDIO: "asar_storage",
  BOOTH_GALLERY_MEDIA: "asar_storage",
  INVITATION_ASSETS: "asar_storage",
  DEFAULT: "asar_storage",
} as const;

export const ASAR_FUNCTIONS = {
  PROCESS_RSVP_ACTION: "process-rsvp-action",
  GENERATE_VIP_PASS: "generate-vip-pass",
  SEND_RSVP_NOTIFICATION: "send-rsvp-notification",
  SYNC_USER_ROLE: "sync-user-role",
} as const;

export const ASAR_TEAMS = {
  ADMINS: "admins",
} as const;

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

export type OrderStatus =
  | "pending_payment"
  | "payment_rejected"
  | "awaiting_client_assets"
  | "event_scheduled"
  | "audio_mastering"
  | "studio_curation"
  | "published";

export interface AsarOrder {
  $id: string;
  clientId: string;
  clientName: string;
  partnerOrOrgName?: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: AsarServiceType;
  planId: string;
  planName: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus?: "unpaid" | "submitted" | "verified" | "rejected";
  paymentReceiptFileId?: string;
  paymentMethod?: "instapay" | "vodafone_cash" | "bank_transfer" | "credit_card";
  paymentNotes?: string;
  eventDate?: string;
  eventVenue?: string;
  subdomainOrSlug?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AsarPayment {
  $id: string;
  orderId: string;
  clientId: string;
  amount: number;
  paymentMethod: "instapay" | "vodafone_cash" | "bank_transfer" | "credit_card";
  receiptFileId?: string;
  screenshotUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface InvitationRsvp {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  invitationId: string;
  invitationSlug?: string;
  clientId?: string;
  guestName: string;
  email: string;
  guestEmail: string;
  phone?: string;
  guestPhone?: string;
  status: "pending" | "approved" | "declined";
  companionsCount: number;
  dietaryPreferences?: string;
  wishingMessage?: string;
  rejectionReason?: string;
  vipPassToken?: string;
  passToken?: string;
  qrCodeUrl?: string;
  emailSent?: boolean;
  dynamicResponsesJson?: string;
  submittedAt?: string;
  respondedAt?: string;
  reviewedAt?: string;
}

