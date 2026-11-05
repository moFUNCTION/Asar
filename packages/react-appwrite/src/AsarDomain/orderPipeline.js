// =============================================================
// ASAR (Athar / أثر) — 7-Stage Concierge Order Tracker & State Machine
// =============================================================
export const ORDER_PIPELINE_STAGES = {
    pending_payment: {
        key: "pending_payment",
        stepNumber: 1,
        titleEn: "Payment Verification",
        titleAr: "التحقق من إيصال الدفع",
        descriptionEn: "Client has submitted booking and payment screenshot. Admin is verifying the receipt.",
        descriptionAr: "تم استلام طلب الحجز وإيصال التحويل. فريق أثر يراجع الإيصال لتأكيد الحجز.",
        requiresClientAction: false,
        badgeColor: "#D4AF37", // Egyptian Gold
        statusType: "initial",
    },
    payment_rejected: {
        key: "payment_rejected",
        stepNumber: 2,
        titleEn: "Action Required: Payment Receipt",
        titleAr: "مطلوب إجراء: إعادة رفع إيصال الدفع",
        descriptionEn: "The uploaded payment screenshot was unclear or invalid. Please upload a clear transfer receipt.",
        descriptionAr: "إيصال التحويل المرفوع غير واضح أو غير مكتمل. يرجى إعادة رفع إيصال بنكي أو لقطة شاشة واضحة.",
        requiresClientAction: true,
        badgeColor: "#9B2C2C", // Danger Red
        statusType: "warning",
    },
    awaiting_client_assets: {
        key: "awaiting_client_assets",
        stepNumber: 3,
        titleEn: "Personalize Your Memory Page",
        titleAr: "تخصيص صفحة الذكريات وإرسال الوسائط",
        descriptionEn: "Payment is approved! Please submit your cover photo, couple names, quote, and custom categories.",
        descriptionAr: "تم تأكيد الدفع بنجاح! يرجى ملء بيانات حفلكم وصورة الغلاف والعبارة التذكارية.",
        requiresClientAction: true,
        badgeColor: "#6B1D28", // Royal Maroon
        statusType: "action",
    },
    event_scheduled: {
        key: "event_scheduled",
        stepNumber: 4,
        titleEn: "Ready for Your Celebration",
        titleAr: "تأكيد موعد الحفل وتجهيز المحطة",
        descriptionEn: "Admin has confirmed the on-site Booth station. Pre-event table QR codes can now be downloaded.",
        descriptionAr: "تم اعتماد بيانات الحفل وجدولة محطة أثر الصوتية. يمكنكم الآن تحميل بطاقات طاولة الحفل ورمز الاستجابة.",
        requiresClientAction: false,
        badgeColor: "#1E6F50", // Forest Green
        statusType: "progress",
    },
    audio_mastering: {
        key: "audio_mastering",
        stepNumber: 5,
        titleEn: "Studio Audio Mastering",
        titleAr: "هندسة ومعالجة التسجيلات الصوتية",
        descriptionEn: "The celebration took place! ASAR sound engineers are filtering background noise and mastering guest voice recordings.",
        descriptionAr: "أقيم الحفل بنجاح! مهندسو الصوت في أثر يعالجون التسجيلات ويعزلون الضوضاء بأعلى دقة.",
        requiresClientAction: false,
        badgeColor: "#B7791F", // Deep Gold / Ochre
        statusType: "progress",
    },
    studio_curation: {
        key: "studio_curation",
        stepNumber: 6,
        titleEn: "Building Your Memory Website",
        titleAr: "بناء وتنسيق موقع الذكريات الخاص بكم",
        descriptionEn: "Admin is curating voice tracks, photos, and highlight videos in the Booth Memory Studio.",
        descriptionAr: "جاري تنسيق وترتيب الرسائل الصوتية وفئات الضيوف ومعرض الصور في لوحة الذكريات الخاصة بكم.",
        requiresClientAction: false,
        badgeColor: "#5B1621", // Deep Burgundy
        statusType: "progress",
    },
    published: {
        key: "published",
        stepNumber: 7,
        titleEn: "Your Memory Vault is Live! 🎉",
        titleAr: "موقع ذكرياتكم متاح الآن! 🎉",
        descriptionEn: "The private memory vault is live! Access your dedicated link, private PIN lock, and high-res landing QR code.",
        descriptionAr: "ألف مبروك! صفحة ذكرياتكم الخاصة أصبحت جاهزة ومتاحة للمشاركة مع أحبائكم وتحميل كافة الرسائل.",
        requiresClientAction: false,
        badgeColor: "#1E6F50", // Success Emerald
        statusType: "complete",
    },
};
export const ORDER_STAGE_SEQUENCE = [
    "pending_payment",
    "awaiting_client_assets",
    "event_scheduled",
    "audio_mastering",
    "studio_curation",
    "published",
];
export const VALID_ORDER_TRANSITIONS = {
    pending_payment: ["payment_rejected", "awaiting_client_assets"],
    payment_rejected: ["pending_payment"],
    awaiting_client_assets: ["event_scheduled"],
    event_scheduled: ["audio_mastering", "published"],
    audio_mastering: ["studio_curation", "published"],
    studio_curation: ["published"],
    published: ["studio_curation"], // Allow admin curation tweaks after publishing
};
export function isValidTransition(from, to) {
    if (!VALID_ORDER_TRANSITIONS[from])
        return false;
    if (from === to)
        return true;
    const allowed = VALID_ORDER_TRANSITIONS[from];
    return Array.isArray(allowed) && allowed.includes(to);
}
export function getNextValidStates(current) {
    return VALID_ORDER_TRANSITIONS[current] ?? [];
}
export function getOrderStatusColor(status) {
    const stage = ORDER_PIPELINE_STAGES[status];
    return stage?.badgeColor ?? "#7A6F6D";
}
export function getOrderStatusLabel(status, lang = "ar") {
    const stage = ORDER_PIPELINE_STAGES[status];
    if (!stage)
        return status;
    return lang === "ar" ? stage.titleAr : stage.titleEn;
}
export function getOrderStageProgress(status) {
    const stageInfo = ORDER_PIPELINE_STAGES[status] ?? ORDER_PIPELINE_STAGES.pending_payment;
    const totalSteps = 7;
    let progressPercent = 14;
    switch (stageInfo.key) {
        case "pending_payment":
            progressPercent = 14;
            break;
        case "payment_rejected":
            progressPercent = 14;
            break;
        case "awaiting_client_assets":
            progressPercent = 43;
            break;
        case "event_scheduled":
            progressPercent = 57;
            break;
        case "audio_mastering":
            progressPercent = 71;
            break;
        case "studio_curation":
            progressPercent = 86;
            break;
        case "published":
            progressPercent = 100;
            break;
        default:
            progressPercent = 14;
            break;
    }
    return {
        currentStepIndex: stageInfo.stepNumber,
        totalSteps,
        progressPercent,
        stageInfo,
        isCompleted: stageInfo.key === "published",
        requiresClientAction: stageInfo.requiresClientAction,
    };
}
