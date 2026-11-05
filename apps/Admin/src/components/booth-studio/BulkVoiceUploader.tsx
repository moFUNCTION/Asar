import React, { useState, useRef, useCallback, useEffect } from "react";

/**
 * Safely revokes a single object URL created during audio ingestion.
 */
export function revokeVoiceObjectUrl(url?: string): void {
  if (!url || !url.startsWith("blob:")) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
}

/**
 * Safely revokes all object URLs in a collection of voice records.
 */
export function revokeAllVoiceObjectUrls(records: Array<{ audioUrl?: string }>): void {
  for (const record of records) {
    if (record.audioUrl) {
      revokeVoiceObjectUrl(record.audioUrl);
    }
  }
}

// =============================================================
// Interfaces & Types
// =============================================================

export interface BoothVoiceRecord {
  id: string;
  memoryId?: string;
  audioFileId?: string;
  audioUrl?: string;
  file?: File;
  speakerName: string;
  speakerRole: string;
  category: string;
  quoteSnippet: string;
  avatarFileId?: string;
  avatarUrl?: string;
  durationFormatted: string;
  durationSeconds: number;
  waveformPeaks: number[];
  likesCount?: number;
  isFeatured?: boolean;
  sortOrder: number;
}

export interface ParsedVoiceFilename {
  speakerName: string;
  speakerRole: string;
  category: string;
  clipId?: string;
}

export interface BulkVoiceUploaderProps {
  categories: string[];
  activeCategory?: string;
  onAddRecords: (records: BoothVoiceRecord[]) => void;
  onDeleteRecord?: (id: string, audioUrl?: string) => void;
  onClearRecords?: () => void;
}

// =============================================================
// Category Normalization Helper
// =============================================================

const KNOWN_CATEGORIES: Record<string, string> = {
  family: "Family",
  families: "Family",
  أهل: "Family",
  عائلة: "Family",
  العائلة: "Family",
  الأهل: "Family",
  friends: "Friends",
  friend: "Friends",
  أصدقاء: "Friends",
  الاصدقاء: "Friends",
  صحاب: "Friends",
  colleagues: "Colleagues",
  colleague: "Colleagues",
  work: "Colleagues",
  زملاء: "Colleagues",
  الزملاء: "Colleagues",
  "special guests": "Special Guests",
  "special guest": "Special Guests",
  vip: "Special Guests",
  special: "Special Guests",
  "ضيوف خاصين": "Special Guests",
};

export function isKnownCategory(val: string): boolean {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  return Boolean(KNOWN_CATEGORIES[clean]);
}

export function mapCategory(val?: string, fallback = "Friends"): string {
  if (!val) return fallback;
  const clean = val.trim().toLowerCase();
  return KNOWN_CATEGORIES[clean] || val.trim();
}

const KNOWN_ROLES: Record<string, string> = {
  brother: "Brother",
  sister: "Sister",
  mother: "Mother",
  father: "Father",
  aunt: "Aunt",
  uncle: "Uncle",
  cousin: "Cousin",
  grandmother: "Grandmother",
  grandfather: "Grandfather",
  grandma: "Grandmother",
  grandpa: "Grandfather",
  "best friend": "Best Friend",
  friend: "Friend",
  colleague: "Colleague",
  mentor: "Mentor",
  manager: "Manager",
  "loved one": "Loved One",
  guest: "Guest",
  vip: "VIP Guest",
  "maid of honor": "Maid of Honor",
  groomsman: "Groomsman",
  "family member": "Family Member",
  أخ: "أخ",
  أخت: "أخت",
  أم: "أم",
  أب: "أب",
  خال: "خال",
  خالة: "خالة",
  عم: "عم",
  عمة: "عمة",
  صديق: "صديق",
  صديقة: "صديقة",
  "صديقة العروسة": "صديقة العروسة",
  "صديق العريس": "صديق العريس",
  زميل: "زميل",
  زميلة: "زميلة",
  جدة: "جدة",
  جد: "جد",
};

export function isKnownRole(val: string): boolean {
  if (!val) return false;
  return Boolean(KNOWN_ROLES[val.trim().toLowerCase()]);
}

export function cleanRole(str: string): string {
  const clean = str.replace(/_/g, " ").trim();
  return KNOWN_ROLES[clean.toLowerCase()] || clean;
}

export function roleFromCategory(cat: string): string {
  const norm = mapCategory(cat);
  if (norm === "Family") return "Family Member";
  if (norm === "Friends") return "Friend";
  if (norm === "Colleagues") return "Colleague";
  if (norm === "Special Guests") return "VIP Guest";
  return "Loved One";
}


// =============================================================
// Smart Filename Parser
// =============================================================

export function parseVoiceFilename(filename: string, folderName?: string): ParsedVoiceFilename {
  if (!filename || typeof filename !== "string") {
    return {
      speakerName: "Voice Memory #1",
      speakerRole: "Loved One",
      category: mapCategory(folderName, "Friends"),
    };
  }

  // 1. Strip audio extensions
  let clean = filename.replace(/\.(mp3|wav|m4a|ogg|aac|flac|wma)$/i, "").trim();
  if (!clean) {
    return {
      speakerName: "Voice Memory #1",
      speakerRole: "Loved One",
      category: mapCategory(folderName, "Friends"),
    };
  }

  // 2. Extract leading clip ID or track index (e.g. "01_...", "12 - ...", "01. ...")
  let clipId: string | undefined;
  const leadingIdMatch = clean.match(/^(\d{1,4})\s*[-_.]\s*(.+)$/);
  if (leadingIdMatch) {
    clipId = leadingIdMatch[1];
    clean = leadingIdMatch[2].trim();
  }

  // 3. Check for generic unnamed recording patterns: "Track_01", "REC_0001", "Audio 1", "Clip-03"
  const unnamedMatch = clean.match(/^(?:track|rec|recording|audio|clip|voice|memory)?\s*[_#-]?\s*(\d+)$/i);
  if (unnamedMatch) {
    const trackNum = unnamedMatch[1] || clipId || "1";
    return {
      clipId: clipId || trackNum,
      speakerName: `Voice Memory #${parseInt(trackNum, 10)}`,
      speakerRole: "Loved One",
      category: mapCategory(folderName, "Friends"),
    };
  }

  // 4. Split by delimiter: priority to " - ", then "_", then "-"
  let parts: string[] = [];
  if (clean.includes(" - ")) {
    parts = clean.split(/\s+-\s+/);
  } else if (clean.includes("_")) {
    parts = clean.split("_");
  } else if (clean.includes("-")) {
    parts = clean.split("-");
  } else {
    parts = [clean];
  }

  parts = parts.map((p) => p.trim()).filter(Boolean);

  const cleanText = (str?: string) => (str || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();

  if (parts.length === 0) {
    return {
      clipId,
      speakerName: `Voice Memory #${clipId || "1"}`,
      speakerRole: folderName === "Colleagues" ? "Colleague" : "Loved One",
      category: mapCategory(folderName, "Friends"),
    };
  }

  // 5. Parse parts according to recognized patterns
  if (parts.length >= 3) {
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];

    if (isKnownCategory(firstPart)) {
      // Pattern: Category _ Speaker Name _ Speaker Role
      return {
        clipId,
        category: mapCategory(firstPart),
        speakerName: cleanText(parts[1]),
        speakerRole: cleanText(parts.slice(2).join(" ")),
      };
    } else if (isKnownCategory(lastPart)) {
      // Pattern: Speaker Name _ Speaker Name _ Category (e.g. Ahmed _ ElSayed _ Family)
      return {
        clipId,
        category: mapCategory(lastPart),
        speakerName: cleanText(parts.slice(0, parts.length - 1).join(" ")),
        speakerRole: roleFromCategory(lastPart),
      };
    } else {
      // Default 3-part: Name _ Role _ Category or Folder Category
      return {
        clipId,
        speakerName: cleanText(parts[0] + " " + parts[1]),
        speakerRole: cleanText(parts[2]),
        category: mapCategory(folderName, "Friends"),
      };
    }
  } else if (parts.length === 2) {
    const p0IsCat = isKnownCategory(parts[0]);
    const p1IsCat = isKnownCategory(parts[1]);

    if (p0IsCat) {
      // Category - Speaker Name
      return {
        clipId,
        category: mapCategory(parts[0]),
        speakerName: cleanText(parts[1]),
        speakerRole: "Loved One",
      };
    } else if (p1IsCat) {
      // Speaker Name - Category
      return {
        clipId,
        category: mapCategory(parts[1]),
        speakerName: cleanText(parts[0]),
        speakerRole: roleFromCategory(parts[1]),
      };
    } else if (isKnownRole(parts[1])) {
      // Speaker Name - Role
      return {
        clipId,
        category: mapCategory(folderName, "Family"),
        speakerName: cleanText(parts[0]),
        speakerRole: cleanRole(parts[1]),
      };
    } else if (isKnownRole(parts[0])) {
      // Role - Speaker Name
      return {
        clipId,
        category: mapCategory(folderName, "Family"),
        speakerName: cleanText(parts[1]),
        speakerRole: cleanRole(parts[0]),
      };
    } else {
      // Both parts make up the full name (e.g. "Dr Khaled" or "First Last")
      return {
        clipId,
        category: mapCategory(folderName, "Friends"),
        speakerName: cleanText(parts[0] + " " + parts[1]),
        speakerRole: folderName === "Colleagues" ? "Colleague" : "Loved One",
      };
    }
  } else {
    // Single part: Name only
    const name = cleanText(parts[0]);
    return {
      clipId,
      speakerName: name || `Voice Memory #${clipId || "1"}`,
      speakerRole: folderName === "Colleagues" ? "Colleague" : "Loved One",
      category: mapCategory(folderName, "Friends"),
    };
  }
}

// =============================================================
// Web Audio API Analyzer & Waveform Generator
// =============================================================

export function generateFallbackAudioMetadata(
  fileName: string,
  fileSize: number = 1024 * 500,
  barCount: number = 48
): {
  durationSeconds: number;
  durationFormatted: string;
  waveformPeaks: number[];
} {
  let duration = Math.max(18, Math.min(180, Math.round(fileSize / 16000)));
  if (fileSize < 1000) {
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      hash = (hash << 5) - hash + fileName.charCodeAt(i);
      hash |= 0;
    }
    duration = 30 + Math.abs(hash % 65);
  }

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

  let seed = 0;
  for (let i = 0; i < fileName.length; i++) {
    seed = (seed * 31 + fileName.charCodeAt(i)) & 0xffffffff;
  }

  const peaks: number[] = [];
  for (let i = 0; i < barCount; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const envelope = Math.sin((Math.PI * (i + 1)) / (barCount + 1));
    const rawVal = 0.2 + 0.75 * (rnd * 0.6 + envelope * 0.4);
    const clamped = Math.min(0.98, Math.max(0.15, Number(rawVal.toFixed(2))));
    peaks.push(clamped);
  }

  return {
    durationSeconds: duration,
    durationFormatted: formatted,
    waveformPeaks: peaks,
  };
}

export async function extractAudioMetadata(
  file: File,
  barCount = 48
): Promise<{
  durationSeconds: number;
  durationFormatted: string;
  waveformPeaks: number[];
}> {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const duration = Math.max(1, Math.round(audioBuffer.duration));
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

      const rawData = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(rawData.length / barCount);
      const peaks: number[] = [];
      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        const start = i * blockSize;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(rawData[start + j] || 0);
        }
        const val = blockSize > 0 ? sum / blockSize : 0;
        const normalized = Math.min(0.98, Math.max(0.15, Number((val * 3.8 + 0.15).toFixed(2))));
        peaks.push(normalized);
      }
      if (audioCtx.state !== "closed") {
        await audioCtx.close();
      }
      return {
        durationSeconds: duration,
        durationFormatted: formatted,
        waveformPeaks: peaks,
      };
    }
  } catch (_e) {
    // Fall back smoothly if audio decode fails or offline mock
  }

  return generateFallbackAudioMetadata(file.name, file.size, barCount);
}

// =============================================================
// 15 Sample Simulated Wedding Voices (Instant 1-Click Drop)
// =============================================================

export const SIMULATED_WEDDING_VOICES: Omit<BoothVoiceRecord, "id" | "sortOrder">[] = [
  {
    speakerName: "Nour Hassan",
    speakerRole: "Best Friend",
    category: "Friends",
    quoteSnippet: "Mabrook ya gameela, ربنا يسعدكم دايماً يا رب ويجعل كل أيامكم حب وفرحة كبيرة زي اليوم ده",
    durationFormatted: "0:42",
    durationSeconds: 42,
    waveformPeaks: [
      0.18, 0.32, 0.54, 0.76, 0.88, 0.92, 0.85, 0.64, 0.42, 0.35, 0.65, 0.82, 0.95, 0.88, 0.72, 0.45,
      0.38, 0.55, 0.74, 0.91, 0.85, 0.67, 0.48, 0.35, 0.52, 0.78, 0.89, 0.94, 0.82, 0.65, 0.44, 0.36,
      0.58, 0.76, 0.86, 0.9, 0.75, 0.52, 0.38, 0.48, 0.68, 0.82, 0.75, 0.58, 0.42, 0.35, 0.25, 0.18,
    ],
    isFeatured: true,
  },
  {
    speakerName: "Ahmed El Sayed",
    speakerRole: "Brother",
    category: "Family",
    quoteSnippet: "ألف مبروك يا غاليين، فخور بيك يا مينا وفرحان ليك من قلبي، ربنا يحفظكم لبعض دايماً",
    durationFormatted: "1:15",
    durationSeconds: 75,
    waveformPeaks: [
      0.22, 0.45, 0.68, 0.82, 0.91, 0.78, 0.55, 0.42, 0.62, 0.85, 0.94, 0.88, 0.65, 0.48, 0.35, 0.58,
      0.79, 0.92, 0.86, 0.71, 0.52, 0.44, 0.66, 0.87, 0.95, 0.89, 0.73, 0.54, 0.38, 0.61, 0.82, 0.93,
      0.87, 0.69, 0.51, 0.42, 0.64, 0.85, 0.91, 0.82, 0.63, 0.47, 0.39, 0.55, 0.72, 0.61, 0.38, 0.22,
    ],
    isFeatured: true,
  },
  {
    speakerName: "Mona Khaled",
    speakerRole: "Aunt",
    category: "Family",
    quoteSnippet: "يا أحلى عروسين، ربنا يتمم لكم على ألف خير ويرزقكم السعادة والهنا وراحة البال في بيتكم الجديد",
    durationFormatted: "0:58",
    durationSeconds: 58,
    waveformPeaks: [
      0.19, 0.35, 0.58, 0.74, 0.86, 0.79, 0.61, 0.45, 0.38, 0.59, 0.78, 0.91, 0.84, 0.68, 0.51, 0.39,
      0.62, 0.81, 0.89, 0.82, 0.65, 0.48, 0.36, 0.54, 0.75, 0.88, 0.83, 0.69, 0.52, 0.41, 0.63, 0.82,
      0.9, 0.84, 0.67, 0.49, 0.38, 0.57, 0.76, 0.85, 0.78, 0.61, 0.45, 0.36, 0.48, 0.58, 0.41, 0.25,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Tarek Mostafa",
    speakerRole: "Childhood Friend",
    category: "Friends",
    quoteSnippet: "من وإحنا صغيرين وإنت دايماً صاحب جدع وصاحب صاحبك، ربنا يسعدكم سوا يا مينا يا عريس",
    durationFormatted: "0:36",
    durationSeconds: 36,
    waveformPeaks: [
      0.24, 0.48, 0.72, 0.89, 0.95, 0.86, 0.68, 0.49, 0.38, 0.62, 0.84, 0.92, 0.85, 0.69, 0.52, 0.41,
      0.65, 0.86, 0.94, 0.87, 0.71, 0.53, 0.39, 0.58, 0.79, 0.91, 0.85, 0.68, 0.5, 0.37, 0.59, 0.81,
      0.9, 0.83, 0.66, 0.48, 0.36, 0.54, 0.75, 0.86, 0.79, 0.62, 0.46, 0.35, 0.47, 0.59, 0.42, 0.28,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Grandma Layla",
    speakerRole: "Grandmother",
    category: "Special Guests",
    quoteSnippet: "ربنا يحفظكم لبعض ويبارك في بيتكم الجديد، بحبكم من كل قلبي ودموع فرحتي بيكم متتوصفش",
    durationFormatted: "1:24",
    durationSeconds: 84,
    waveformPeaks: [
      0.18, 0.29, 0.48, 0.68, 0.82, 0.89, 0.81, 0.65, 0.48, 0.38, 0.58, 0.76, 0.88, 0.82, 0.66, 0.5,
      0.39, 0.59, 0.78, 0.89, 0.83, 0.67, 0.49, 0.37, 0.56, 0.77, 0.87, 0.81, 0.64, 0.48, 0.38, 0.57,
      0.77, 0.86, 0.8, 0.63, 0.46, 0.36, 0.54, 0.73, 0.82, 0.75, 0.59, 0.44, 0.36, 0.45, 0.35, 0.21,
    ],
    isFeatured: true,
  },
  {
    speakerName: "Eng. Sherif Ramzy",
    speakerRole: "Colleague",
    category: "Colleagues",
    quoteSnippet: "ألف مبروك يا بشمهندس، منورين وربنا يوفقكم في حياتكم الجديدة مع أطيب تمنيات فريق العمل كله",
    durationFormatted: "0:49",
    durationSeconds: 49,
    waveformPeaks: [
      0.21, 0.38, 0.61, 0.79, 0.9, 0.84, 0.67, 0.49, 0.39, 0.6, 0.81, 0.92, 0.86, 0.7, 0.53, 0.42,
      0.64, 0.84, 0.93, 0.87, 0.71, 0.54, 0.4, 0.59, 0.8, 0.91, 0.85, 0.68, 0.51, 0.38, 0.6, 0.82,
      0.91, 0.84, 0.68, 0.5, 0.38, 0.56, 0.77, 0.87, 0.8, 0.63, 0.47, 0.36, 0.49, 0.6, 0.43, 0.26,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Salma & Youssef",
    speakerRole: "Cousins",
    category: "Family",
    quoteSnippet: "أحلى فرح وأحلى ليلة، ربنا يديم الفرحة بينكم دايماً ونشوفكم أسعد اتنين في العالم كله",
    durationFormatted: "1:04",
    durationSeconds: 64,
    waveformPeaks: [
      0.2, 0.41, 0.65, 0.83, 0.93, 0.85, 0.68, 0.5, 0.4, 0.62, 0.83, 0.93, 0.87, 0.7, 0.53, 0.41,
      0.63, 0.83, 0.92, 0.86, 0.7, 0.53, 0.39, 0.58, 0.79, 0.9, 0.84, 0.67, 0.5, 0.38, 0.59, 0.8,
      0.89, 0.83, 0.66, 0.49, 0.37, 0.55, 0.75, 0.85, 0.78, 0.62, 0.46, 0.35, 0.48, 0.58, 0.41, 0.25,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Dr. Hazem Mostafa",
    speakerRole: "Mentor",
    category: "Special Guests",
    quoteSnippet: "مبارك الزواج السعيد، بارك الله لكما وبارك عليكما وجمع بينكما في خير وتوفيق وسعادة دائمة",
    durationFormatted: "0:52",
    durationSeconds: 52,
    waveformPeaks: [
      0.18, 0.34, 0.55, 0.75, 0.88, 0.83, 0.66, 0.48, 0.38, 0.58, 0.79, 0.91, 0.85, 0.69, 0.52, 0.4,
      0.61, 0.82, 0.91, 0.85, 0.69, 0.52, 0.38, 0.56, 0.77, 0.89, 0.83, 0.67, 0.5, 0.38, 0.59, 0.8,
      0.89, 0.83, 0.67, 0.49, 0.37, 0.55, 0.75, 0.85, 0.79, 0.63, 0.47, 0.36, 0.48, 0.58, 0.42, 0.24,
    ],
    isFeatured: true,
  },
  {
    speakerName: "Dina Adel",
    speakerRole: "Maid of Honor",
    category: "Friends",
    quoteSnippet: "مريم يا روحي، دموع الفرحة مش مفارقة عيني، أسعد إنسانة بيكي ومع مينا هتكوني أسعد واحدة في الدنيا",
    durationFormatted: "1:10",
    durationSeconds: 70,
    waveformPeaks: [
      0.23, 0.45, 0.7, 0.88, 0.95, 0.87, 0.7, 0.52, 0.41, 0.64, 0.86, 0.94, 0.88, 0.72, 0.55, 0.43,
      0.66, 0.87, 0.95, 0.89, 0.73, 0.56, 0.42, 0.61, 0.82, 0.92, 0.86, 0.7, 0.53, 0.4, 0.62, 0.83,
      0.92, 0.85, 0.69, 0.51, 0.39, 0.57, 0.78, 0.88, 0.81, 0.65, 0.49, 0.38, 0.51, 0.62, 0.45, 0.27,
    ],
    isFeatured: true,
  },
  {
    speakerName: "Karim Fahmy",
    speakerRole: "Groomsman",
    category: "Friends",
    quoteSnippet: "مينا يا عريسنا الغالي، ليلة تاريخية مش هتتنسي أبداً، ربنا يحلي أيامكم ويعوض تعبكم فرحة وسرور",
    durationFormatted: "0:44",
    durationSeconds: 44,
    waveformPeaks: [
      0.22, 0.42, 0.66, 0.84, 0.92, 0.86, 0.69, 0.51, 0.4, 0.62, 0.84, 0.93, 0.87, 0.71, 0.54, 0.42,
      0.65, 0.85, 0.94, 0.88, 0.72, 0.55, 0.41, 0.6, 0.81, 0.92, 0.86, 0.69, 0.52, 0.39, 0.61, 0.82,
      0.91, 0.84, 0.68, 0.5, 0.38, 0.56, 0.77, 0.87, 0.8, 0.64, 0.48, 0.37, 0.5, 0.61, 0.44, 0.26,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Hajj Mahmoud",
    speakerRole: "Uncle",
    category: "Family",
    quoteSnippet: "بالرفاء والبنين يا حبايب قلبي، بيت عامر دايماً بالخير والبركة وصالح الأعمال والذرية الصالحة",
    durationFormatted: "1:30",
    durationSeconds: 90,
    waveformPeaks: [
      0.17, 0.31, 0.52, 0.71, 0.84, 0.8, 0.63, 0.45, 0.35, 0.55, 0.75, 0.87, 0.81, 0.65, 0.49, 0.38,
      0.58, 0.78, 0.88, 0.82, 0.66, 0.49, 0.36, 0.54, 0.75, 0.86, 0.8, 0.64, 0.47, 0.36, 0.56, 0.77,
      0.86, 0.8, 0.64, 0.47, 0.35, 0.53, 0.73, 0.83, 0.76, 0.6, 0.44, 0.34, 0.45, 0.55, 0.38, 0.22,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Rania Samir",
    speakerRole: "Colleague",
    category: "Colleagues",
    quoteSnippet: "Congratulations Mina & Maryam! You both look absolutely radiant tonight. Wishing you infinite joy!",
    durationFormatted: "0:38",
    durationSeconds: 38,
    waveformPeaks: [
      0.21, 0.39, 0.62, 0.8, 0.91, 0.85, 0.68, 0.5, 0.4, 0.61, 0.82, 0.92, 0.86, 0.7, 0.53, 0.41,
      0.64, 0.84, 0.93, 0.87, 0.71, 0.54, 0.4, 0.59, 0.8, 0.91, 0.85, 0.68, 0.51, 0.38, 0.6, 0.81,
      0.9, 0.83, 0.67, 0.49, 0.37, 0.55, 0.76, 0.86, 0.79, 0.63, 0.47, 0.36, 0.49, 0.6, 0.43, 0.25,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Ziad & Maya",
    speakerRole: "College Friends",
    category: "Friends",
    quoteSnippet: "عقبال ما نشوف ولادكم يا رب، من أحسن الناس اللي عرفناهم في حياتنا وفرحتنا بيكم فوق الوصف",
    durationFormatted: "0:55",
    durationSeconds: 55,
    waveformPeaks: [
      0.22, 0.43, 0.67, 0.85, 0.93, 0.86, 0.69, 0.51, 0.41, 0.63, 0.85, 0.93, 0.87, 0.71, 0.54, 0.42,
      0.65, 0.86, 0.94, 0.88, 0.72, 0.55, 0.41, 0.6, 0.81, 0.92, 0.86, 0.69, 0.52, 0.39, 0.61, 0.82,
      0.91, 0.84, 0.68, 0.5, 0.38, 0.56, 0.77, 0.87, 0.8, 0.64, 0.48, 0.37, 0.5, 0.61, 0.44, 0.26,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Uncle George",
    speakerRole: "Family Friend",
    category: "Special Guests",
    quoteSnippet: "ألف مبروك يا حبايبي، ألف ليلة وليلة وفرحتكم فرحتنا كلنا، ربنا يجعل أيامكم كلها أفراح وبركة",
    durationFormatted: "1:08",
    durationSeconds: 68,
    waveformPeaks: [
      0.19, 0.36, 0.59, 0.77, 0.89, 0.83, 0.66, 0.48, 0.38, 0.59, 0.8, 0.91, 0.85, 0.69, 0.52, 0.4,
      0.62, 0.82, 0.91, 0.85, 0.69, 0.52, 0.38, 0.57, 0.78, 0.89, 0.83, 0.67, 0.5, 0.38, 0.59, 0.8,
      0.89, 0.83, 0.67, 0.49, 0.37, 0.55, 0.75, 0.85, 0.79, 0.63, 0.47, 0.36, 0.48, 0.59, 0.42, 0.24,
    ],
    isFeatured: false,
  },
  {
    speakerName: "Farida Mansour",
    speakerRole: "Bride's Sister",
    category: "Family",
    quoteSnippet: "أختي ونور عيني، ربنا يفرح قلبك زي ما فرحتينا كلنا النهاردة، مينا أخونا وسندنا كلنا",
    durationFormatted: "1:18",
    durationSeconds: 78,
    waveformPeaks: [
      0.24, 0.46, 0.71, 0.89, 0.96, 0.88, 0.71, 0.53, 0.42, 0.65, 0.87, 0.95, 0.89, 0.73, 0.56, 0.44,
      0.67, 0.88, 0.96, 0.9, 0.74, 0.57, 0.43, 0.62, 0.83, 0.93, 0.87, 0.71, 0.54, 0.41, 0.63, 0.84,
      0.93, 0.86, 0.7, 0.52, 0.4, 0.58, 0.79, 0.89, 0.82, 0.66, 0.5, 0.39, 0.52, 0.63, 0.46, 0.28,
    ],
    isFeatured: true,
  },
];

// =============================================================
// BulkVoiceUploader Component
// =============================================================

export const BulkVoiceUploader: React.FC<BulkVoiceUploaderProps> = ({
  categories,
  activeCategory,
  onAddRecords,
  onDeleteRecord,
  onClearRecords,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup all tracked object URLs upon unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      activeObjectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      activeObjectUrlsRef.current.clear();
    };
  }, []);

  // Handler for explicit voice deletion or object URL revocation
  const handleDeleteVoice = useCallback((url?: string, recordId?: string) => {
    if (url && activeObjectUrlsRef.current.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
      activeObjectUrlsRef.current.delete(url);
    } else if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
    if (recordId && onDeleteRecord) {
      onDeleteRecord(recordId, url);
    }
  }, [onDeleteRecord]);

  void handleDeleteVoice;
  void onClearRecords;

  const processFiles = useCallback(
    async (files: File[]) => {
      const audioFiles = files.filter((f) =>
        /\.(mp3|wav|m4a|ogg|aac|flac|wma)$/i.test(f.name) || f.type.startsWith("audio/")
      );

      if (audioFiles.length === 0) return;

      setIsAnalyzing(true);
      setAnalysisProgress({ current: 0, total: audioFiles.length });

      const newRecords: BoothVoiceRecord[] = [];

      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        // Parse filename
        const parsed = parseVoiceFilename(file.name, activeCategory || categories[0]);
        // Extract metadata & 48 peaks
        const meta = await extractAudioMetadata(file, 48);

        const objectUrl = URL.createObjectURL(file);
        activeObjectUrlsRef.current.add(objectUrl);

        newRecords.push({
          id: `voice_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          speakerName: parsed.speakerName,
          speakerRole: parsed.speakerRole,
          category: parsed.category || activeCategory || "Friends",
          quoteSnippet: "",
          audioUrl: objectUrl,
          file,
          durationFormatted: meta.durationFormatted,
          durationSeconds: meta.durationSeconds,
          waveformPeaks: meta.waveformPeaks,
          likesCount: 0,
          isFeatured: false,
          sortOrder: i + 1,
        });

        setAnalysisProgress({ current: i + 1, total: audioFiles.length });
      }

      onAddRecords(newRecords);
      setIsAnalyzing(false);
    },
    [activeCategory, categories, onAddRecords]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    const files: File[] = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    } else if (e.dataTransfer.files) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        files.push(e.dataTransfer.files[i]);
      }
    }

    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleSimulateBulkDrop = () => {
    const timestamp = Date.now();
    const simulatedRecords: BoothVoiceRecord[] = SIMULATED_WEDDING_VOICES.map((v, idx) => ({
      ...v,
      id: `sim_${timestamp}_${idx}`,
      sortOrder: idx + 1,
      likesCount: Math.floor(Math.random() * 24) + 3,
    }));

    onAddRecords(simulatedRecords);
  };

  return (
    <div
      style={{
        background: "var(--athar-card-bg)",
        border: "1px solid var(--athar-card-border)",
        borderRadius: "var(--athar-radius-lg)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "var(--athar-text-title)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>🎙️</span> Zero-Effort Bulk Audio Dropzone
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)" }}>
            Drop 50–150+ audio tracks (.mp3, .wav, .m4a). Filenames will be parsed into Speaker, Role, & Category automatically with 48-peak waveforms extracted in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateBulkDrop}
          className="btn-athar-gold"
          style={{ fontSize: "0.84rem", padding: "0.5rem 1.1rem" }}
          title="Simulate 15 realistic guest voice tracks with real waveforms and quotes"
        >
          ⚡ Simulate Bulk Drop (15 Sample Wedding Voices)
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging
            ? "2px dashed var(--athar-maroon)"
            : "2px dashed rgba(107, 29, 40, 0.22)",
          background: isDragging ? "var(--athar-maroon-subtle)" : "rgba(251, 247, 242, 0.6)",
          borderRadius: "var(--athar-radius-md)",
          padding: "2.2rem 1.5rem",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const fileArr = Array.from(e.target.files);
              processFiles(fileArr);
            }
          }}
        />

        <div style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>
          {isAnalyzing ? "⚙️" : isDragging ? "📥" : "📂"}
        </div>

        {isAnalyzing ? (
          <div>
            <div style={{ fontWeight: 700, color: "var(--athar-maroon)", marginBottom: "0.4rem" }}>
              Analyzing Audio Waveforms & Decoding Metadata... ({analysisProgress.current} /{" "}
              {analysisProgress.total})
            </div>
            <div
              style={{
                width: "240px",
                height: "6px",
                background: "rgba(107, 29, 40, 0.12)",
                borderRadius: "9999px",
                margin: "0 auto",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(analysisProgress.current / Math.max(1, analysisProgress.total)) * 100}%`,
                  background: "var(--athar-maroon)",
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--athar-text-title)",
                fontSize: "1rem",
                marginBottom: "0.25rem",
              }}
            >
              Drag & Drop Audio Files Here or <span style={{ color: "var(--athar-maroon)", textDecoration: "underline" }}>Browse</span>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>
              Supported: <code>Friends_Nour Hassan_Best Friend.mp3</code>, <code>Family - Ahmed El Sayed - Brother.wav</code>, or raw numbers
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
