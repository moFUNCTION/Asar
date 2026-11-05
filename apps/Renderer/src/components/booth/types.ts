// =============================================================
// ASAR (Athar / أثر) — Booth Memory Storefront Types
// =============================================================

export interface VoiceRecordItem {
  id: string;
  speakerName: string;
  speakerRole: string;
  category: "Family" | "Friends" | "Colleagues" | "Special Guests" | string;
  quoteSnippet: string;
  durationFormatted: string;
  durationSeconds: number;
  waveformPeaks: number[];
  avatarUrl?: string;
  audioUrl?: string;
  likesCount: number;
  isLiked?: boolean;
  isFeatured?: boolean;
}

export interface PhotoKeepsake {
  id: string;
  url: string;
  caption: string;
  category?: "Around The Phone" | "Couple" | "Celebration" | string;
}

export interface GuestBlessingNote {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

export interface BoothMemoryFullData {
  id: string;
  $id?: string;
  slug: string;
  coupleTitle: string;
  eventHeaderTag: string;
  eventDateDisplay: string;
  eventLocationDisplay: string;
  highlightBadge: string;
  coupleQuote: string;
  quoteAuthor?: string;
  tagline?: string;
  taglineLine1?: string;
  taglineLine2?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  heroImageUrl?: string;
  videoHighlightThumbnailId?: string;
  videoHighlightTitle?: string;
  videoDuration?: string;
  videoHighlightUrl?: string;
  isPrivateLocked: boolean;
  accessPinCode?: string;
  qrCodeUrl?: string;
  totalAudioCount?: number;
  voiceRecords: VoiceRecordItem[];
  photos: PhotoKeepsake[];
  guestBookNotes: GuestBlessingNote[];
}

export type BoothTabId = "audio" | "photos" | "video" | "guestbook" | "thankyou";

export type BoothCategoryFilter = "all" | "family" | "friends" | "colleagues" | "special";
