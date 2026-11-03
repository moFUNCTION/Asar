export interface CategoryOption {
  id: string;
  label: string;
  count: number;
}

export interface VoiceRecord {
  id: string;
  speakerName: string;
  speakerRole: string;
  category: string;
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

export interface MediaPhoto {
  id: string;
  url: string;
  caption: string;
  category?: string;
  aspectRatio?: string;
}

export interface GuestBookNote {
  id: string;
  authorName: string;
  authorRole: string;
  message: string;
  date: string;
  likes: number;
  isLiked?: boolean;
}

export interface BoothMemoryData {
  id: string;
  slug: string;
  coupleTitle: string;
  eventHeaderTag: string;
  eventDateDisplay: string;
  eventLocationDisplay: string;
  highlightBadge: string;
  coupleQuote: string;
  quoteAuthor: string;
  taglineLine1: string;
  taglineLine2: string;
  thankYouMessage: string;
  heroImageUrl: string;
  videoThumbnailUrl: string;
  videoDuration: string;
  videoTitle: string;
  videoSubtitle: string;
  isPrivateLocked: boolean;
  accessPinCode: string;
  totalAudioCount: number;
  categories: CategoryOption[];
  voiceRecords: VoiceRecord[];
  photos: MediaPhoto[];
  guestBookNotes: GuestBookNote[];
}

export type MemoryTabType = "audio" | "photos" | "video" | "guestbook" | "thankyou";
