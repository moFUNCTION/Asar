// =============================================================
// ASAR (Athar / أثر) — Booth Memory Domain Types & Gallery Models
// Aligned with @repo/react-appwrite Modular Section Schema
// =============================================================

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

/**
 * Shared photo item compatible with @repo/react-appwrite's GalleryImage and modular section schema
 */
export interface GalleryPhotoItem {
  id: string;
  url?: string;
  imageUrl?: string;
  caption?: string;
  category?: string;
  alt?: string;
  aspectRatio?: string;
}

/**
 * Booth photo representation with full compatibility with GalleryPhotoItem
 */
export interface MediaPhoto {
  id: string;
  url: string;
  imageUrl?: string;
  caption?: string;
  category?: string;
  aspectRatio?: string;
  alt?: string;
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

/**
 * Props for PhotoGalleryGrid component
 */
export interface PhotoGalleryGridProps {
  photos: MediaPhoto[];
  categories?: string[];
  title?: string;
  subtitle?: string;
  onPhotoClick?: (photo: MediaPhoto, index: number) => void;
}

// -------------------------------------------------------------
// Mapping and Extraction Utility Functions
// -------------------------------------------------------------

/**
 * Maps a shared GalleryPhotoItem (or GalleryImage) into Booth's MediaPhoto
 */
export function mapGalleryItemToMediaPhoto(item: GalleryPhotoItem): MediaPhoto {
  const resolvedUrl = item.url || item.imageUrl || "";
  const resolvedCaption = item.caption || item.alt || "";
  return {
    id: item.id || `photo-${Date.now()}`,
    url: resolvedUrl,
    imageUrl: item.imageUrl || resolvedUrl,
    caption: resolvedCaption,
    category: item.category || "All",
    aspectRatio: item.aspectRatio,
    alt: item.alt || resolvedCaption,
  };
}

/**
 * Maps a Booth MediaPhoto into a shared GalleryPhotoItem
 */
export function mapMediaPhotoToGalleryItem(photo: MediaPhoto): GalleryPhotoItem {
  return {
    id: photo.id,
    url: photo.url,
    imageUrl: photo.imageUrl || photo.url,
    caption: photo.caption || "",
    category: photo.category,
    aspectRatio: photo.aspectRatio,
    alt: photo.alt || photo.caption,
  };
}

/**
 * Batch maps an array of GalleryPhotoItem to MediaPhoto
 */
export function mapGalleryItemsToMediaPhotos(items: GalleryPhotoItem[]): MediaPhoto[] {
  return (items || []).map(mapGalleryItemToMediaPhoto);
}

/**
 * Batch maps an array of MediaPhoto to GalleryPhotoItem
 */
export function mapMediaPhotosToGalleryItems(photos: MediaPhoto[]): GalleryPhotoItem[] {
  return (photos || []).map(mapMediaPhotoToGalleryItem);
}

/**
 * Extracts a deduplicated list of categories from photos and optional explicit categories,
 * guaranteeing "All" is always the first category pill.
 */
export function extractCategories(
  photos: Array<{ category?: string }>,
  explicitCategories?: string[]
): string[] {
  const categorySet = new Set<string>();
  categorySet.add("All");

  if (explicitCategories && explicitCategories.length > 0) {
    for (const cat of explicitCategories) {
      const trimmed = cat ? cat.trim() : "";
      if (trimmed && trimmed.toLowerCase() !== "all") {
        categorySet.add(trimmed);
      }
    }
  }

  if (photos && photos.length > 0) {
    for (const photo of photos) {
      const trimmed = photo.category ? photo.category.trim() : "";
      if (trimmed && trimmed.toLowerCase() !== "all") {
        categorySet.add(trimmed);
      }
    }
  }

  return Array.from(categorySet);
}

/**
 * Filters a collection of photos by active category.
 * If "All" or empty/falsy category is supplied, returns all photos.
 */
export function filterPhotosByCategory<T extends { category?: string }>(
  photos: T[],
  activeCategory: string
): T[] {
  if (!activeCategory || activeCategory.toLowerCase() === "all") {
    return photos;
  }
  return photos.filter(
    (photo) => photo.category?.toLowerCase() === activeCategory.toLowerCase()
  );
}

/**
 * Computes next lightbox index with optional wrapping or clamping.
 */
export function getNextLightboxIndex(
  currentIndex: number,
  totalCount: number,
  options: { wrap?: boolean } = { wrap: true }
): number {
  if (totalCount <= 0) return 0;
  if (currentIndex < totalCount - 1) {
    return currentIndex + 1;
  }
  return options.wrap ? 0 : totalCount - 1;
}

/**
 * Computes previous lightbox index with optional wrapping or clamping.
 */
export function getPrevLightboxIndex(
  currentIndex: number,
  totalCount: number,
  options: { wrap?: boolean } = { wrap: true }
): number {
  if (totalCount <= 0) return 0;
  if (currentIndex > 0) {
    return currentIndex - 1;
  }
  return options.wrap ? totalCount - 1 : 0;
}
