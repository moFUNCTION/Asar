// =============================================================
// ASAR (Athar / أثر) — Booth Photo Memories Alignment Test Suite
// Verified with: npx tsx apps/Booth/test/photoMemoriesAlignment.test.ts
// =============================================================

import test from "node:test";
import assert from "node:assert/strict";

import {
  type MediaPhoto,
  type GalleryPhotoItem,
  extractCategories,
  filterPhotosByCategory,
  getNextLightboxIndex,
  getPrevLightboxIndex,
  mapGalleryItemToMediaPhoto,
  mapMediaPhotoToGalleryItem,
  mapGalleryItemsToMediaPhotos,
  mapMediaPhotosToGalleryItems,
} from "../src/components/memory/types";

import { DEMO_BOOTH_MEMORY } from "../src/components/memory/mockData";

// -------------------------------------------------------------
// 1. Dynamic Category Extraction Tests
// -------------------------------------------------------------
test("extractCategories: always prepends 'All' as the first element", () => {
  const photos: MediaPhoto[] = [
    { id: "1", url: "https://example.com/1.jpg", caption: "Photo 1", category: "Couple" },
    { id: "2", url: "https://example.com/2.jpg", caption: "Photo 2", category: "Celebration" },
  ];
  const categories = extractCategories(photos);

  assert.equal(categories[0], "All");
  assert.deepEqual(categories, ["All", "Couple", "Celebration"]);
});

test("extractCategories: deduplicates categories and handles empty photo list", () => {
  const emptyList: MediaPhoto[] = [];
  assert.deepEqual(extractCategories(emptyList), ["All"]);

  const duplicatePhotos: MediaPhoto[] = [
    { id: "1", url: "1.jpg", caption: "1", category: "Around The Phone" },
    { id: "2", url: "2.jpg", caption: "2", category: "Around The Phone" },
    { id: "3", url: "3.jpg", caption: "3", category: "Couple" },
    { id: "4", url: "4.jpg", caption: "4", category: "Couple" },
  ];
  assert.deepEqual(extractCategories(duplicatePhotos), ["All", "Around The Phone", "Couple"]);
});

test("extractCategories: handles photos with undefined or empty category cleanly", () => {
  const mixedPhotos: Array<{ category?: string }> = [
    { category: undefined },
    { category: "" },
    { category: "   " },
    { category: "Portraits" },
    { category: "Portraits " },
  ];
  const categories = extractCategories(mixedPhotos);
  assert.deepEqual(categories, ["All", "Portraits"]);
});

test("extractCategories: merges explicitCategories prop with photo categories without duplicate 'All'", () => {
  const photos: MediaPhoto[] = [
    { id: "1", url: "1.jpg", caption: "1", category: "Around The Phone" },
    { id: "2", url: "2.jpg", caption: "2", category: "Portraits" },
  ];
  const explicitCategories = ["All", "Couple", "Celebration"];

  const merged = extractCategories(photos, explicitCategories);
  assert.equal(merged[0], "All");
  assert.deepEqual(merged, ["All", "Couple", "Celebration", "Around The Phone", "Portraits"]);
});

// -------------------------------------------------------------
// 2. Category Filtering Logic Tests
// -------------------------------------------------------------
test("filterPhotosByCategory: returns all photos when active category is 'All' or empty", () => {
  const photos: MediaPhoto[] = [
    { id: "1", url: "1.jpg", caption: "1", category: "Couple" },
    { id: "2", url: "2.jpg", caption: "2", category: "Celebration" },
    { id: "3", url: "3.jpg", caption: "3", category: "Portraits" },
  ];

  assert.equal(filterPhotosByCategory(photos, "All").length, 3);
  assert.equal(filterPhotosByCategory(photos, "all").length, 3);
  assert.equal(filterPhotosByCategory(photos, "").length, 3);
});

test("filterPhotosByCategory: filters correctly by category with case insensitivity", () => {
  const photos: MediaPhoto[] = [
    { id: "1", url: "1.jpg", caption: "1", category: "Around The Phone" },
    { id: "2", url: "2.jpg", caption: "2", category: "Couple" },
    { id: "3", url: "3.jpg", caption: "3", category: "Around The Phone" },
    { id: "4", url: "4.jpg", caption: "4", category: "Celebration" },
  ];

  const aroundPhone = filterPhotosByCategory(photos, "Around The Phone");
  assert.equal(aroundPhone.length, 2);
  assert.deepEqual(aroundPhone.map((p) => p.id), ["1", "3"]);

  const coupleCaseInsensitive = filterPhotosByCategory(photos, "couple");
  assert.equal(coupleCaseInsensitive.length, 1);
  assert.equal(coupleCaseInsensitive[0].id, "2");

  const nonExistent = filterPhotosByCategory(photos, "NonExistentCategory");
  assert.equal(nonExistent.length, 0);
});

// -------------------------------------------------------------
// 3. Lightbox Index Navigation Tests
// -------------------------------------------------------------
test("getNextLightboxIndex: steps forward and wraps to 0 by default", () => {
  const total = 5;

  assert.equal(getNextLightboxIndex(0, total), 1);
  assert.equal(getNextLightboxIndex(1, total), 2);
  assert.equal(getNextLightboxIndex(3, total), 4);
  // Last item wraps to 0
  assert.equal(getNextLightboxIndex(4, total), 0);
});

test("getNextLightboxIndex: clamps at last index when wrap=false", () => {
  const total = 5;

  assert.equal(getNextLightboxIndex(0, total, { wrap: false }), 1);
  assert.equal(getNextLightboxIndex(4, total, { wrap: false }), 4);
});

test("getPrevLightboxIndex: steps backward and wraps to last index by default", () => {
  const total = 5;

  assert.equal(getPrevLightboxIndex(4, total), 3);
  assert.equal(getPrevLightboxIndex(2, total), 1);
  assert.equal(getPrevLightboxIndex(1, total), 0);
  // First item wraps to 4
  assert.equal(getPrevLightboxIndex(0, total), 4);
});

test("getPrevLightboxIndex: clamps at 0 when wrap=false", () => {
  const total = 5;

  assert.equal(getPrevLightboxIndex(2, total, { wrap: false }), 1);
  assert.equal(getPrevLightboxIndex(0, total, { wrap: false }), 0);
});

test("lightbox navigation: handles edge cases of 1 photo and 0 photos", () => {
  assert.equal(getNextLightboxIndex(0, 1, { wrap: true }), 0);
  assert.equal(getNextLightboxIndex(0, 1, { wrap: false }), 0);
  assert.equal(getPrevLightboxIndex(0, 1, { wrap: true }), 0);
  assert.equal(getPrevLightboxIndex(0, 1, { wrap: false }), 0);

  assert.equal(getNextLightboxIndex(0, 0), 0);
  assert.equal(getPrevLightboxIndex(0, 0), 0);
});

// -------------------------------------------------------------
// 4. Data Mapping between GalleryPhotoItem and MediaPhoto
// -------------------------------------------------------------
test("mapGalleryItemToMediaPhoto: converts GalleryPhotoItem into MediaPhoto with fallbacks", () => {
  const galleryItem: GalleryPhotoItem = {
    id: "gallery-1",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552",
    caption: "Bride and groom under floral arch",
    category: "Couple",
    aspectRatio: "16/9",
    alt: "Floral arch wedding ceremony",
  };

  const mediaPhoto = mapGalleryItemToMediaPhoto(galleryItem);
  assert.equal(mediaPhoto.id, "gallery-1");
  assert.equal(mediaPhoto.url, "https://images.unsplash.com/photo-1519741497674-611481863552");
  assert.equal(mediaPhoto.imageUrl, "https://images.unsplash.com/photo-1519741497674-611481863552");
  assert.equal(mediaPhoto.caption, "Bride and groom under floral arch");
  assert.equal(mediaPhoto.category, "Couple");
  assert.equal(mediaPhoto.aspectRatio, "16/9");
  assert.equal(mediaPhoto.alt, "Floral arch wedding ceremony");
});

test("mapGalleryItemToMediaPhoto: falls back to alt when caption is missing", () => {
  const itemWithoutCaption: GalleryPhotoItem = {
    id: "g-2",
    url: "https://example.com/2.jpg",
    alt: "Vintage phone receiver",
    category: "Around The Phone",
  };

  const mapped = mapGalleryItemToMediaPhoto(itemWithoutCaption);
  assert.equal(mapped.caption, "Vintage phone receiver");
  assert.equal(mapped.url, "https://example.com/2.jpg");
  assert.equal(mapped.imageUrl, "https://example.com/2.jpg");
  assert.equal(mapped.category, "Around The Phone");
});

test("mapMediaPhotoToGalleryItem: converts MediaPhoto into GalleryPhotoItem", () => {
  const mediaPhoto: MediaPhoto = {
    id: "p-100",
    url: "/assets/booth-vintage.jpg",
    imageUrl: "/assets/booth-vintage.jpg",
    caption: "Guest leaving a voice message",
    category: "Around The Phone",
    aspectRatio: "4/3",
    alt: "Guest at phone booth",
  };

  const galleryItem = mapMediaPhotoToGalleryItem(mediaPhoto);
  assert.equal(galleryItem.id, "p-100");
  assert.equal(galleryItem.url, "/assets/booth-vintage.jpg");
  assert.equal(galleryItem.imageUrl, "/assets/booth-vintage.jpg");
  assert.equal(galleryItem.caption, "Guest leaving a voice message");
  assert.equal(galleryItem.category, "Around The Phone");
  assert.equal(galleryItem.aspectRatio, "4/3");
  assert.equal(galleryItem.alt, "Guest at phone booth");
});

test("batch mapping: converts collections in both directions correctly", () => {
  const galleryItems: GalleryPhotoItem[] = [
    { id: "g-1", url: "https://example.com/g1.jpg", caption: "G1", category: "Portraits" },
    { id: "g-2", imageUrl: "https://example.com/g2.jpg", caption: "G2", category: "Celebration" },
  ];

  const mediaPhotos = mapGalleryItemsToMediaPhotos(galleryItems);
  assert.equal(mediaPhotos.length, 2);
  assert.equal(mediaPhotos[0].url, "https://example.com/g1.jpg");
  assert.equal(mediaPhotos[1].url, "https://example.com/g2.jpg");

  const roundtripped = mapMediaPhotosToGalleryItems(mediaPhotos);
  assert.equal(roundtripped.length, 2);
  assert.equal(roundtripped[0].id, "g-1");
  assert.equal(roundtripped[1].id, "g-2");
});

// -------------------------------------------------------------
// 5. Mock Data Alignment Verification
// -------------------------------------------------------------
test("mockData: DEMO_BOOTH_MEMORY photos include valid common event categories", () => {
  const photos = DEMO_BOOTH_MEMORY.photos;
  assert.ok(Array.isArray(photos));
  assert.ok(photos.length >= 6, "Expected at least 6 mock photos");

  const categories = extractCategories(photos);
  assert.ok(categories.includes("All"), "Must include 'All'");
  assert.ok(categories.includes("Around The Phone"), "Must include 'Around The Phone'");
  assert.ok(categories.includes("Couple"), "Must include 'Couple'");
  assert.ok(categories.includes("Celebration"), "Must include 'Celebration'");
  assert.ok(categories.includes("Portraits"), "Must include 'Portraits'");

  // Verify all photos have valid URLs and captions
  for (const photo of photos) {
    assert.ok(photo.id && photo.id.length > 0, `Photo ${photo.id} missing id`);
    assert.ok(photo.url && photo.url.length > 0, `Photo ${photo.id} missing url`);
    assert.ok(photo.caption && photo.caption.length > 0, `Photo ${photo.id} missing caption`);
    assert.ok(photo.category && photo.category.length > 0, `Photo ${photo.id} missing category`);
  }
});
