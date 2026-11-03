import { describe, it } from "node:test";
import assert from "node:assert/strict";

// =============================================================
// Canonical Filename Parser & Waveform Utilities Under Test
// =============================================================

export interface ParsedVoiceFilename {
  speakerName: string;
  speakerRole: string;
  category: string;
  clipId?: string;
}

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

  const cleanText = (str: string) => str.replace(/_/g, " ").replace(/\s+/g, " ").trim();

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

// =============================================================
// Unit Test Suite
// =============================================================

describe("parseVoiceFilename Unit Tests", () => {
  it("should parse Category_Speaker Name_Role with underscores", () => {
    const result = parseVoiceFilename("Friends_Nour Hassan_Best Friend.mp3");
    assert.equal(result.category, "Friends");
    assert.equal(result.speakerName, "Nour Hassan");
    assert.equal(result.speakerRole, "Best Friend");
  });

  it("should parse Category - Speaker Name - Role with hyphens and spaces", () => {
    const result = parseVoiceFilename("Family - Ahmed El Sayed - Brother.mp3");
    assert.equal(result.category, "Family");
    assert.equal(result.speakerName, "Ahmed El Sayed");
    assert.equal(result.speakerRole, "Brother");
  });

  it("should parse numbered prefix with Category at end (01_Ahmed_ElSayed_Family.mp3)", () => {
    const result = parseVoiceFilename("01_Ahmed_ElSayed_Family.mp3");
    assert.equal(result.clipId, "01");
    assert.equal(result.speakerName, "Ahmed ElSayed");
    assert.equal(result.category, "Family");
    assert.equal(result.speakerRole, "Family Member");
  });

  it("should parse Tarek_Mostafa_Friend.wav where Friend maps to category and role", () => {
    const result = parseVoiceFilename("Tarek_Mostafa_Friend.wav");
    assert.equal(result.speakerName, "Tarek Mostafa");
    assert.equal(result.category, "Friends");
    assert.equal(result.speakerRole, "Friend");
  });

  it("should handle single speaker name with folder category (Colleagues/Dr_Khaled.mp3)", () => {
    const result = parseVoiceFilename("Dr_Khaled.mp3", "Colleagues");
    assert.equal(result.category, "Colleagues");
    assert.equal(result.speakerName, "Dr Khaled");
    assert.equal(result.speakerRole, "Colleague");
  });

  it("should gracefully handle unnamed tracks like Track_01.mp3", () => {
    const result = parseVoiceFilename("Track_01.mp3");
    assert.equal(result.speakerName, "Voice Memory #1");
    assert.equal(result.speakerRole, "Loved One");
    assert.equal(result.category, "Friends");
  });

  it("should gracefully handle REC_0001.mp3 with folder category", () => {
    const result = parseVoiceFilename("REC_0001.mp3", "Family");
    assert.equal(result.speakerName, "Voice Memory #1");
    assert.equal(result.speakerRole, "Loved One");
    assert.equal(result.category, "Family");
  });

  it("should handle Arabic category and names: عائلة - أحمد السيد - أخ.mp3", () => {
    const result = parseVoiceFilename("عائلة - أحمد السيد - أخ.mp3");
    assert.equal(result.category, "Family");
    assert.equal(result.speakerName, "أحمد السيد");
    assert.equal(result.speakerRole, "أخ");
  });

  it("should handle empty or malformed filenames without throwing", () => {
    const result1 = parseVoiceFilename("");
    assert.ok(result1.speakerName);
    assert.ok(result1.category);

    const result2 = parseVoiceFilename(".mp3");
    assert.ok(result2.speakerName);
  });
});

describe("generateFallbackAudioMetadata Unit Tests", () => {
  it("should generate deterministic 48 normalized peaks", () => {
    const meta1 = generateFallbackAudioMetadata("wedding_voice_01.mp3", 500000, 48);
    const meta2 = generateFallbackAudioMetadata("wedding_voice_01.mp3", 500000, 48);

    assert.equal(meta1.waveformPeaks.length, 48);
    assert.deepEqual(meta1.waveformPeaks, meta2.waveformPeaks);
    assert.ok(meta1.durationSeconds > 0);
    assert.match(meta1.durationFormatted, /^\d+:\d{2}$/);

    // Verify all peaks are between 0.15 and 0.98
    for (const peak of meta1.waveformPeaks) {
      assert.ok(peak >= 0.15 && peak <= 0.98, `Peak ${peak} outside bounds [0.15, 0.98]`);
    }
  });

  it("should differentiate peaks for different filenames", () => {
    const metaA = generateFallbackAudioMetadata("trackA.mp3", 300000, 48);
    const metaB = generateFallbackAudioMetadata("trackB.mp3", 300000, 48);

    assert.notDeepEqual(metaA.waveformPeaks, metaB.waveformPeaks);
  });
});

describe("isKnownCategory & mapCategory Unit Tests", () => {
  it("should recognize known categories case-insensitively and in Arabic", () => {
    assert.equal(isKnownCategory("family"), true);
    assert.equal(isKnownCategory("Friends"), true);
    assert.equal(isKnownCategory("أصدقاء"), true);
    assert.equal(isKnownCategory("COLLEAGUES"), true);
    assert.equal(isKnownCategory("UnknownCustom"), false);

    assert.equal(mapCategory("أهل"), "Family");
    assert.equal(mapCategory("صحاب"), "Friends");
    assert.equal(mapCategory("work"), "Colleagues");
  });
});
