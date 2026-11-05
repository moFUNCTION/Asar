export interface AudioMetadataResult {
    durationSeconds: number;
    durationFormatted: string;
    waveformPeaks: number[];
}
export interface ParsedVoiceFilename {
    speakerName: string;
    speakerRole: string;
    category: string;
}
/**
 * Formats a duration in seconds to standard mm:ss display (e.g. 42 -> "0:42", 72 -> "1:12")
 */
export declare function formatDuration(seconds: number): string;
/**
 * Generates a deterministic, natural-looking speech waveform envelope
 * Values are normalized in the range [0.15 .. 1.0] and rounded to 2 decimal places.
 */
export declare function generateDeterministicWaveform(seed: string | number, barCount?: number): number[];
/**
 * Extracts 48 normalized peaks from PCM Float32Array channel data
 */
export declare function generateWaveformFromPCM(pcmData: Float32Array, barCount?: number): number[];
/**
 * Helper generating waveform from ArrayBuffer or Float32Array
 */
export declare function generateWaveformFromBuffer(buffer: ArrayBuffer | Float32Array, barCount?: number): number[];
/**
 * Resilient audio metadata extractor using Web Audio API when available,
 * with deterministic offline/browser-compatibility fallback.
 */
export declare function extractAudioMetadata(input: File | Blob | ArrayBuffer, barCount?: number): Promise<AudioMetadataResult>;
/**
 * Direct blob analyzer alias satisfying PROJECT.md contract
 */
export declare function analyzeAudioBlob(blob: Blob, barCount?: number): Promise<AudioMetadataResult>;
/**
 * Smart filename parser supporting ASAR audio studio conventions:
 * 1. Pattern A: Category_Speaker Name_Role.mp3 (e.g. Friends_Nour Hassan_Best Friend.mp3)
 * 2. Pattern B: Category - Speaker Name - Role.mp3 (e.g. Family - Ahmed El Sayed - Brother.mp3)
 * 3. Pattern C: Speaker Name - Role.mp3 (uses folderName || "Family" as category)
 * 4. Fallback: Cleans raw IDs (e.g. REC_001.mp3 -> "Voice Memory #1" or "Rec 001")
 */
export declare function parseVoiceFilename(rawFilename: string, folderName?: string): ParsedVoiceFilename;
//# sourceMappingURL=audioAnalyzer.d.ts.map