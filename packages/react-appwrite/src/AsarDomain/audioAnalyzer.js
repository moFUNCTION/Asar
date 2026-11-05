// =============================================================
// ASAR (Athar / أثر) — Web Audio API Analyzer & Smart Filename Parser
// =============================================================
/**
 * Formats a duration in seconds to standard mm:ss display (e.g. 42 -> "0:42", 72 -> "1:12")
 */
export function formatDuration(seconds) {
    if (!seconds || Number.isNaN(seconds) || seconds < 0) {
        return "0:00";
    }
    const totalSeconds = Math.round(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
/**
 * Creates a deterministic 32-bit integer hash from a string or number
 */
function hashSeed(seed) {
    const str = String(seed);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
}
/**
 * Generates a deterministic, natural-looking speech waveform envelope
 * Values are normalized in the range [0.15 .. 1.0] and rounded to 2 decimal places.
 */
export function generateDeterministicWaveform(seed, barCount = 48) {
    let state = hashSeed(seed) || 123456789;
    // Simple, deterministic Mulberry32 PRNG
    const nextRandom = () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const peaks = [];
    for (let i = 0; i < barCount; i++) {
        // Construct a natural speech envelope:
        // Gentle intro fade, energetic body with vocal cadence variations, gentle outro
        const progress = i / (barCount - 1);
        const envelope = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
        // Multi-frequency harmonic variation simulating human speech modulation
        const cadence = 0.55 * Math.sin(progress * 12.0) +
            0.35 * Math.cos(progress * 24.0) +
            0.25 * nextRandom();
        const rawVal = envelope * (0.45 + Math.abs(cadence) * 0.55);
        const clamped = Math.max(0.15, Math.min(1.0, rawVal));
        peaks.push(Number(clamped.toFixed(2)));
    }
    return peaks;
}
/**
 * Extracts 48 normalized peaks from PCM Float32Array channel data
 */
export function generateWaveformFromPCM(pcmData, barCount = 48) {
    if (!pcmData || pcmData.length === 0) {
        return Array.from({ length: barCount }, () => 0.35);
    }
    const bucketSize = Math.max(1, Math.floor(pcmData.length / barCount));
    const rawPeaks = [];
    let maxPeak = 0.001;
    for (let b = 0; b < barCount; b++) {
        const start = b * bucketSize;
        const end = Math.min(pcmData.length, start + bucketSize);
        let peak = 0;
        for (let i = start; i < end; i++) {
            const absVal = Math.abs(pcmData[i] || 0);
            if (absVal > peak)
                peak = absVal;
        }
        rawPeaks.push(peak);
        if (peak > maxPeak)
            maxPeak = peak;
    }
    // Normalize to [0.15 .. 1.0]
    return rawPeaks.map((peak) => {
        const normalized = peak / maxPeak;
        const clamped = Math.max(0.15, Math.min(1.0, normalized));
        return Number(clamped.toFixed(2));
    });
}
/**
 * Helper generating waveform from ArrayBuffer or Float32Array
 */
export function generateWaveformFromBuffer(buffer, barCount = 48) {
    if (buffer instanceof Float32Array) {
        return generateWaveformFromPCM(buffer, barCount);
    }
    const floatArr = new Float32Array(buffer);
    return generateWaveformFromPCM(floatArr, barCount);
}
/**
 * Resilient audio metadata extractor using Web Audio API when available,
 * with deterministic offline/browser-compatibility fallback.
 */
export async function extractAudioMetadata(input, barCount = 48) {
    let arrayBuffer;
    let filename = "voice_recording";
    let byteSize = 64000; // ~4 seconds default
    if (typeof File !== "undefined" && input instanceof File) {
        filename = input.name;
        byteSize = input.size;
        arrayBuffer = await input.arrayBuffer();
    }
    else if (typeof Blob !== "undefined" && input instanceof Blob) {
        byteSize = input.size;
        arrayBuffer = await input.arrayBuffer();
    }
    else if (input instanceof ArrayBuffer) {
        arrayBuffer = input;
        byteSize = input.byteLength;
    }
    else {
        // Unexpected input fallback
        return {
            durationSeconds: 42,
            durationFormatted: "0:42",
            waveformPeaks: generateDeterministicWaveform(filename, barCount),
        };
    }
    // Try decoding via Web Audio API if running in browser
    const AudioCtx = typeof window !== "undefined"
        ? (window.AudioContext || window.webkitAudioContext)
        : null;
    if (AudioCtx) {
        try {
            const audioCtx = new AudioCtx();
            // Use slice to avoid neutering arrayBuffer
            const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
            const durationSeconds = Math.max(1, Math.round(decodedBuffer.duration));
            const durationFormatted = formatDuration(durationSeconds);
            const pcm = decodedBuffer.getChannelData(0);
            const waveformPeaks = generateWaveformFromPCM(pcm, barCount);
            // Cleanly close context if supported
            if (typeof audioCtx.close === "function") {
                await audioCtx.close().catch(() => { });
            }
            return {
                durationSeconds,
                durationFormatted,
                waveformPeaks,
            };
        }
        catch {
            // Decode failed (unsupported codec or browser restriction) -> proceed to graceful fallback
        }
    }
    // Graceful deterministic fallback for offline/Node.js/unsupported formats
    // Estimate ~16,000 bytes per second for standard compressed speech audio (128 kbps)
    const estimatedSeconds = Math.max(5, Math.min(600, Math.round(byteSize / 16000)));
    const durationSeconds = estimatedSeconds || 42;
    const durationFormatted = formatDuration(durationSeconds);
    const waveformPeaks = generateDeterministicWaveform(`${filename}_${byteSize}`, barCount);
    return {
        durationSeconds,
        durationFormatted,
        waveformPeaks,
    };
}
/**
 * Direct blob analyzer alias satisfying PROJECT.md contract
 */
export async function analyzeAudioBlob(blob, barCount = 48) {
    return extractAudioMetadata(blob, barCount);
}
/**
 * Smart filename parser supporting ASAR audio studio conventions:
 * 1. Pattern A: Category_Speaker Name_Role.mp3 (e.g. Friends_Nour Hassan_Best Friend.mp3)
 * 2. Pattern B: Category - Speaker Name - Role.mp3 (e.g. Family - Ahmed El Sayed - Brother.mp3)
 * 3. Pattern C: Speaker Name - Role.mp3 (uses folderName || "Family" as category)
 * 4. Fallback: Cleans raw IDs (e.g. REC_001.mp3 -> "Voice Memory #1" or "Rec 001")
 */
export function parseVoiceFilename(rawFilename, folderName) {
    if (!rawFilename || !rawFilename.trim()) {
        return {
            speakerName: "Special Guest",
            speakerRole: "Guest",
            category: folderName?.trim() || "Friends",
        };
    }
    // Extract base name without path
    const sanitizedPath = rawFilename.replace(/\\/g, "/");
    const fileNameOnly = sanitizedPath.split("/").pop() || rawFilename;
    // Strip audio extension (.mp3, .wav, .m4a, .ogg, .aac, .flac, .webm)
    const baseName = fileNameOnly.replace(/\.(mp3|wav|m4a|ogg|aac|flac|webm)$/i, "").trim();
    // Pattern B: Separated by " - " (3 parts: Category - Speaker Name - Role)
    if (baseName.includes(" - ")) {
        const parts = baseName.split(" - ").map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
            return {
                category: parts[0] || folderName || "Friends",
                speakerName: parts[1] || "Guest",
                speakerRole: parts[2] || "Guest",
            };
        }
        if (parts.length === 2) {
            // Speaker Name - Role
            return {
                category: folderName?.trim() || "Family",
                speakerName: parts[0] || "Guest",
                speakerRole: parts[1] || "Guest",
            };
        }
    }
    // Pattern A: Separated by "_" (3 parts: Category_Speaker Name_Role)
    if (baseName.includes("_")) {
        const parts = baseName.split("_").map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
            return {
                category: parts[0] || folderName || "Friends",
                speakerName: parts[1] || "Guest",
                speakerRole: parts[2] || "Guest",
            };
        }
        if (parts.length === 2) {
            // Check if first part looks like a recorder prefix (e.g. REC_001)
            if (/^rec$|^track$|^audio$|^voice$/i.test(parts[0])) {
                const num = parts[1].replace(/^0+/, "") || parts[1];
                return {
                    category: folderName?.trim() || "Friends",
                    speakerName: `Voice Memory #${num}`,
                    speakerRole: "Guest",
                };
            }
            // Speaker Name_Role
            return {
                category: folderName?.trim() || "Family",
                speakerName: parts[0] || "Guest",
                speakerRole: parts[1] || "Guest",
            };
        }
    }
    // Pattern D: Raw recorder IDs like REC_001 or REC001
    const recMatch = baseName.match(/^(?:REC|TRACK|AUDIO|VOICE)[_-]?(\d+)$/i);
    if (recMatch && recMatch[1]) {
        const num = recMatch[1].replace(/^0+/, "") || recMatch[1];
        return {
            speakerName: `Voice Memory #${num}`,
            speakerRole: "Guest",
            category: folderName?.trim() || "Friends",
        };
    }
    // Clean raw single name (e.g. "nour-hassan" or "nour_hassan" -> "Nour Hassan")
    const cleanedName = baseName
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    return {
        speakerName: cleanedName || "Special Guest",
        speakerRole: "Guest",
        category: folderName?.trim() || "Friends",
    };
}
