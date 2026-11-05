// =============================================================
// ASAR (Athar / أثر) — Shared Domain Models & Safe Parsers
// =============================================================
// =============================================================
// Safe JSON Parsing & Extraction Helpers
// =============================================================
export function safeJsonParse(jsonValue, fallback) {
    if (jsonValue === null || jsonValue === undefined) {
        return fallback;
    }
    if (typeof jsonValue === "object") {
        return jsonValue;
    }
    if (typeof jsonValue !== "string") {
        return fallback;
    }
    const trimmed = jsonValue.trim();
    if (!trimmed) {
        return fallback;
    }
    try {
        return JSON.parse(trimmed);
    }
    catch {
        return fallback;
    }
}
export const DEFAULT_PLAN_LIMITS = {
    coverageHours: 3,
    maxVoiceRecords: 80,
    maxGalleryPhotos: 20,
    maxCustomCategories: 4,
    hasVideoHighlight: false,
    hasGuestBookTab: true,
    allowBulkZipDownload: true,
    hostingDurationDays: 365,
    maxRsvpCapacity: 150,
    allowCustomSections: false,
};
export function parsePlanFeatures(plan) {
    if (!plan?.featuresJson)
        return [];
    const parsed = safeJsonParse(plan.featuresJson, []);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
}
export function parsePlanLimits(plan) {
    if (!plan?.limitsJson)
        return { ...DEFAULT_PLAN_LIMITS };
    const parsed = safeJsonParse(plan.limitsJson, DEFAULT_PLAN_LIMITS);
    return {
        ...DEFAULT_PLAN_LIMITS,
        ...parsed,
    };
}
export function parsePlanAddons(plan) {
    if (!plan?.addonsJson)
        return [];
    const parsed = safeJsonParse(plan.addonsJson, []);
    return Array.isArray(parsed) ? parsed : [];
}
export function parseClientAssets(order) {
    if (!order?.clientSubmittedAssetsJson)
        return {};
    return safeJsonParse(order.clientSubmittedAssetsJson, {});
}
export function parseWaveformPeaks(waveformPeaksJson, defaultBarCount = 48) {
    if (!waveformPeaksJson) {
        return Array.from({ length: defaultBarCount }, () => 0.35);
    }
    const parsed = safeJsonParse(waveformPeaksJson, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((val) => {
            const num = Number(val);
            if (Number.isNaN(num))
                return 0.25;
            return Math.min(1.0, Math.max(0.15, Number(num.toFixed(2))));
        });
    }
    return Array.from({ length: defaultBarCount }, () => 0.35);
}
export function parseCategories(categoriesJson) {
    if (!categoriesJson) {
        return ["Family", "Friends", "Colleagues", "Special Guests"];
    }
    const parsed = safeJsonParse(categoriesJson, []);
    if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((c) => typeof c === "string" && !!c.trim());
    }
    return ["Family", "Friends", "Colleagues", "Special Guests"];
}
export function parseFormSchema(schemaJson) {
    if (!schemaJson)
        return [];
    const parsed = safeJsonParse(schemaJson, []);
    return Array.isArray(parsed) ? parsed : [];
}
export function parseThemeConfig(themeJson) {
    if (!themeJson)
        return {};
    return safeJsonParse(themeJson, {});
}
export function parseSectionsConfig(sectionsJson) {
    if (!sectionsJson)
        return [];
    const parsed = safeJsonParse(sectionsJson, []);
    return Array.isArray(parsed) ? parsed : [];
}
export function parseUserProfile(doc) {
    if (!doc || typeof doc !== "object")
        return null;
    return {
        $id: doc.$id,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
        userId: doc.userId || doc.$id || "",
        name: doc.name || "",
        email: doc.email || "",
        phone: doc.phone || undefined,
        role: (doc.role === "admin" ? "admin" : "client"),
        avatarUrl: doc.avatarUrl || undefined,
        organization: doc.organization || undefined,
        locale: doc.locale || "ar",
        metadataJson: doc.metadataJson || undefined,
    };
}
