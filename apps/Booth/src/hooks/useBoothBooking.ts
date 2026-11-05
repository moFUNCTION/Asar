import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppwrite, useCollection, ID, Query } from "@repo/react-appwrite";

// ============================================================================
// Canonical Identifiers & Schema Constants
// ============================================================================

export const ASAR_DATABASE_ID = "asar-db";

export const ASAR_COLLECTIONS = {
  PLANS: "plans",
  ORDERS: "orders",
  PAYMENTS: "payments",
  BOOTH_MEMORIES: "booth_memories",
  BOOTH_VOICE_RECORDS: "booth_voice_records",
  BOOTH_MEDIA: "booth_media",
  INVITATIONS: "invitations",
  INVITATION_RSVPS: "invitation_rsvps",
} as const;

export const ASAR_BUCKETS = {
  PAYMENT_RECEIPTS: "asar_storage",
  CLIENT_RAW_ASSETS: "asar_storage",
  BOOTH_MASTERED_AUDIO: "asar_storage",
  BOOTH_GALLERY_MEDIA: "asar_storage",
  INVITATION_ASSETS: "asar_storage",
  DEFAULT: "asar_storage",
} as const;

// ============================================================================
// TypeScript Domain Interfaces
// ============================================================================

export interface AsarPlanLimits {
  coverageHours?: number;
  maxVoiceRecords: number; // e.g. 80, 150, or -1 for unlimited
  maxGalleryPhotos: number; // e.g. 20, 100, or -1 for unlimited
  maxCustomCategories: number; // e.g. 4, 10
  hasVideoHighlight: boolean;
  hasGuestBookTab: boolean;
  allowBulkZipDownload: boolean;
  hostingDurationDays: number; // e.g. 365
  maxRsvpCapacity?: number;
  allowCustomSections?: boolean;
}

export interface AsarPlanAddon {
  id: string;
  name: string;
  price: number;
  description?: string;
  badge?: string;
}

export interface AsarPlan {
  $id?: string;
  serviceType: "booth" | "invitation";
  name: string;
  subtitle: string;
  badge: string;
  subBadge?: string;
  price: number;
  currency: string;
  themeVariant: "ivory-royal" | "noir-obsidian";
  imageUrl?: string;
  featuresJson: string; // JSON stringified string[]
  addonsJson?: string; // JSON stringified AsarPlanAddon[]
  limitsJson: string; // JSON stringified AsarPlanLimits
  isActive: boolean;
  sortOrder: number;
}

export interface BookingOrderPayload {
  clientName: string;
  partnerOrOrgName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventVenue: string;
  planId?: string;
  planName: string;
  selectedAddons?: string[];
  totalAmount: number;
  depositAmount?: number;
  paymentMethod: "instapay" | "vodafone_cash" | "bank_transfer";
  paymentScreenshotFile?: File | null;
  adminNotes?: string;
}

export interface BookingOrderResult {
  orderId: string;
  status: string;
  paymentId?: string;
}

// ============================================================================
// Safe JSON Parsing Helpers
// ============================================================================

export function parsePlanFeatures(plan: AsarPlan): string[] {
  if (Array.isArray(plan.featuresJson)) {
    return plan.featuresJson;
  }
  if (!plan.featuresJson) return [];
  try {
    const parsed = JSON.parse(plan.featuresJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parsePlanLimits(plan: AsarPlan): AsarPlanLimits {
  const defaultLimits: AsarPlanLimits = {
    coverageHours: 3,
    maxVoiceRecords: 80,
    maxGalleryPhotos: 20,
    maxCustomCategories: 4,
    hasVideoHighlight: false,
    hasGuestBookTab: true,
    allowBulkZipDownload: false,
    hostingDurationDays: 365,
  };
  if (!plan.limitsJson) return defaultLimits;
  try {
    const parsed =
      typeof plan.limitsJson === "string"
        ? JSON.parse(plan.limitsJson)
        : plan.limitsJson;
    return { ...defaultLimits, ...parsed };
  } catch {
    return defaultLimits;
  }
}

export function parsePlanAddons(plan: AsarPlan): AsarPlanAddon[] {
  if (Array.isArray(plan.addonsJson)) {
    return plan.addonsJson;
  }
  if (!plan.addonsJson) return [];
  try {
    const parsed = JSON.parse(plan.addonsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ============================================================================
// Luxury Default Seed Data (Graceful Offline & Demo Fallbacks)
// ============================================================================

export const DEFAULT_BOOTH_ADDONS: AsarPlanAddon[] = [
  {
    id: "addon-extra-hour-first",
    name: "ساعة إضافية أولى",
    price: 1500,
    description: "تمديد تغطية هاتف أثر للاحتفال الممتد حتى وقت متأخر.",
    badge: "تمديد شائع",
  },
  {
    id: "addon-extra-hour-next",
    name: "كل ساعة إضافية تالية",
    price: 500,
    description: "مرونة كاملة لإضافة ساعات متتالية بعد الساعة الأولى بسعر مخفض.",
    badge: "مرن واقتصادي",
  },
  {
    id: "addon-express-delivery",
    name: "تسليم فوري سريع",
    price: 500,
    description: "استلام جميع التسجيلات الصوتية المعالجة خلال ٤٨ ساعة فقط من الفرح.",
    badge: "تسليم فوري",
  },
  {
    id: "addon-calligraphy-sign",
    name: "لافتة ترحيبية بخط يدوي مخصص",
    price: 500,
    description: "لافتة أكريليك أو خشبية راقية بأسماء العروسين وتاريخ المناسبة للذكرى.",
    badge: "تذكار خاص",
  },
  {
    id: "addon-bespoke-decor",
    name: "تنسيق ديكور وزهور مخصص",
    price: 0,
    description: "تنسيق خاص بالتعاون مع مصمم ديكور الفرح مع إضاءات نيون وزهور.",
    badge: "تصميم ملكي خاص",
  },
];

export const DEFAULT_BOOTH_PLANS: AsarPlan[] = [
  {
    $id: "plan-booth-moment",
    serviceType: "booth",
    name: "لحظة أثر",
    subtitle: "الباقة الكلاسيكية",
    badge: "الباقة الأكثر طلباً للأفراح",
    subBadge: "عرض الإطلاق",
    price: 5500,
    currency: "EGP",
    themeVariant: "ivory-royal",
    imageUrl: "/assets/booth-hero-photo.webp",
    featuresJson: JSON.stringify([
      "٣ ساعات تغطية حية طوال الحفل (عرض الإطلاق)",
      "هاتف صوتي عتيق وتجهيز ركن كلاسيكي فاخر",
      "ممثل ومضيف خاص من أثر متواجد لمساعدة الضيوف",
      "التوصيل والتركيب مشمول مجاناً (الإسكندرية / الساحل / العجمي)",
      "تعديل وهندسة صوتية احترافية وفلترة لصدى القاعة",
      "دعوة رقمية صوتية مهداة للعروسين قبل الفرح",
      "صفحة ذكريات خاصة ومشفرة للاستماع والمشاركة لمدة عام",
    ]),
    addonsJson: JSON.stringify(DEFAULT_BOOTH_ADDONS),
    limitsJson: JSON.stringify({
      coverageHours: 3,
      maxVoiceRecords: 80,
      maxGalleryPhotos: 20,
      maxCustomCategories: 4,
      hasVideoHighlight: false,
      hasGuestBookTab: true,
      allowBulkZipDownload: false,
      hostingDurationDays: 365,
    }),
    isActive: true,
    sortOrder: 1,
  },
  {
    $id: "plan-booth-story",
    serviceType: "booth",
    name: "حكاية أثر",
    subtitle: "الباقة الشاملة VIP",
    badge: "التجربة الملكية الشاملة",
    subBadge: "السهرة كاملة • VIP",
    price: 7000,
    currency: "EGP",
    themeVariant: "noir-obsidian",
    imageUrl: "/assets/love-wedding.jpg",
    featuresJson: JSON.stringify([
      "٦ ساعات تغطية كاملة وشاملة طوال السهرة",
      "تجهيز وديكور VIP فاخر مع تنسيق زهور طبيعية وشموع أنيقة",
      "كروت QR كود مخصصة ومطبوعة لجميع طاولات المعازيم",
      "فيديو سينمائي هايلايت ٣٠ ثانية يدمج لقطات الفرح مع الأصوات",
      "تعديل وهندسة صوتية احترافية وفلترة للضوضاء بأعلى نقاء",
      "دعوة رقمية صوتية مخصصة مهداة للعروسين",
      "خزانة سحابية خاصة مع إمكانية تحميل الملفات بجودة Lossless",
    ]),
    addonsJson: JSON.stringify(DEFAULT_BOOTH_ADDONS),
    limitsJson: JSON.stringify({
      coverageHours: 6,
      maxVoiceRecords: 150,
      maxGalleryPhotos: 100,
      maxCustomCategories: 10,
      hasVideoHighlight: true,
      hasGuestBookTab: true,
      allowBulkZipDownload: true,
      hostingDurationDays: 365,
    }),
    isActive: true,
    sortOrder: 2,
  },
];

// Helper: Convert File to Base64 Data URL for Offline Storage
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// Main Custom Hook: useBoothBooking
// ============================================================================

export function useBoothBooking() {
  const { databases, storage, config } = useAppwrite();

  // Dynamic Plans Query from Appwrite
  const {
    data: remotePlans,
    loading: remoteLoading,
    error: remoteError,
    refetch: refetchRemote,
  } = useCollection<AsarPlan>(ASAR_COLLECTIONS.PLANS, {
    queries: [
      Query.equal("serviceType", "booth"),
      Query.equal("isActive", true),
      Query.orderAsc("sortOrder"),
    ],
  });

  // Local synchronized plans (saved by Admin in localStorage for seamless cross-app testing)
  const [localAdminPlans, setLocalAdminPlans] = useState<AsarPlan[]>(() => {
    try {
      const stored = localStorage.getItem("asar_synced_plans");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p: AsarPlan) => p.serviceType === "booth" && p.isActive !== false
          );
        }
      }
    } catch {
      // ignore JSON errors
    }
    return [];
  });

  // Sync listener for localStorage cross-tab or cross-component changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "asar_synced_plans" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setLocalAdminPlans(
              parsed.filter(
                (p: AsarPlan) => p.serviceType === "booth" && p.isActive !== false
              )
            );
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Compute unified plans list with graceful fallback logic
  const plans = useMemo<AsarPlan[]>(() => {
    // 1. If Appwrite returned active plans, use them as base
    const baseList: AsarPlan[] =
      remotePlans && remotePlans.length > 0 ? remotePlans : DEFAULT_BOOTH_PLANS;

    // 2. Merge any admin plans created locally
    if (localAdminPlans.length > 0) {
      const mergedMap = new Map<string, AsarPlan>();
      baseList.forEach((p) => mergedMap.set(p.$id || p.name, p));
      localAdminPlans.forEach((p) => mergedMap.set(p.$id || p.name, p));
      return Array.from(mergedMap.values()).sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)
      );
    }

    return baseList;
  }, [remotePlans, localAdminPlans]);

  // Unified available add-ons
  const addons = useMemo<AsarPlanAddon[]>(() => {
    return DEFAULT_BOOTH_ADDONS;
  }, []);

  // Selected Plan state
  const [selectedPlan, setSelectedPlanState] = useState<AsarPlan | null>(() => {
    return DEFAULT_BOOTH_PLANS[0] || null;
  });

  // Sync selectedPlan once plans are loaded if none selected
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      setSelectedPlanState(plans[0]);
    }
  }, [plans, selectedPlan]);

  // Selected Add-ons state
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Function to set plan by object or string name
  const setSelectedPlan = useCallback(
    (planOrName: AsarPlan | string) => {
      if (typeof planOrName === "string") {
        const found = plans.find(
          (p) => p.name === planOrName || p.$id === planOrName
        );
        if (found) setSelectedPlanState(found);
      } else {
        setSelectedPlanState(planOrName);
      }
    },
    [plans]
  );

  // Toggle add-on selection
  const toggleAddon = useCallback((addonIdOrName: string) => {
    setSelectedAddonIds((prev) => {
      const exists = prev.includes(addonIdOrName);
      if (exists) {
        return prev.filter((id) => id !== addonIdOrName);
      } else {
        return [...prev, addonIdOrName];
      }
    });
  }, []);

  // Calculate live total price & required deposit
  const calculateTotal = useCallback(
    (overridePrice?: number, overrideAddonIds?: string[]) => {
      const basePrice =
        overridePrice !== undefined
          ? overridePrice
          : selectedPlan
          ? selectedPlan.price
          : 5500;

      const activeAddonIds = overrideAddonIds || selectedAddonIds;
      const addonsSum = activeAddonIds.reduce((sum, addonId) => {
        const matched = addons.find(
          (a) => a.id === addonId || a.name === addonId
        );
        return sum + (matched ? matched.price : 0);
      }, 0);

      const total = basePrice + addonsSum;
      // Fixed deposit of 1,500 EGP or total if less
      const deposit = Math.min(1500, total);

      return { total, deposit };
    },
    [selectedPlan, selectedAddonIds, addons]
  );

  // Submit complete booking order and manual payment screenshot
  const submitBookingOrder = useCallback(
    async (payload: BookingOrderPayload): Promise<BookingOrderResult> => {
      let screenshotFileId = "";
      let screenshotPreviewUrl = "";

      // 1. Upload payment receipt screenshot if provided
      if (payload.paymentScreenshotFile) {
        try {
          const fileRes = await storage.createFile(
            ASAR_BUCKETS.PAYMENT_RECEIPTS,
            ID.unique(),
            payload.paymentScreenshotFile
          );
          screenshotFileId = fileRes.$id;
        } catch (uploadErr) {
          console.warn(
            "Payment screenshot storage upload failed, falling back to base64 preview:",
            uploadErr
          );
          screenshotPreviewUrl = await fileToDataUrl(
            payload.paymentScreenshotFile
          );
        }
      }

      const generatedNum = Math.floor(1000 + Math.random() * 9000);
      const generatedOrderId = `ORD-${generatedNum}`;
      const generatedPaymentId = `PAY-${generatedNum}`;

      // 2. Prepare order record
      const orderDocId = ID.unique();
      const orderPayload = {
        clientId: payload.clientEmail,
        clientName: payload.clientName,
        partnerOrOrgName: payload.partnerOrOrgName,
        clientEmail: payload.clientEmail,
        clientPhone: payload.clientPhone,
        serviceType: "booth",
        planId: payload.planId || selectedPlan?.$id || "plan-booth-moment",
        planName: payload.planName || selectedPlan?.name || "لحظة أثر",
        selectedAddonsJson: JSON.stringify(payload.selectedAddons || selectedAddonIds),
        totalAmount: Number(payload.totalAmount),
        orderStatus: "pending_payment",
        eventDate: payload.eventDate,
        eventVenue: payload.eventVenue,
        clientSubmittedAssetsJson: "{}",
        quotaOverridesJson: "{}",
        adminNotes: payload.adminNotes || "",
      };

      let finalOrderId = generatedOrderId;
      try {
        const orderRes = await databases.createDocument(
          config.databaseId || ASAR_DATABASE_ID,
          ASAR_COLLECTIONS.ORDERS,
          orderDocId,
          orderPayload
        );
        finalOrderId = orderRes.$id;
      } catch (dbErr) {
        console.warn(
          "Appwrite order document creation fallback to local cache:",
          dbErr
        );
      }

      // 3. Prepare payment record
      const paymentDocId = ID.unique();
      const paymentPayload = {
        orderId: finalOrderId,
        clientId: payload.clientEmail,
        amount: Number(payload.depositAmount || payload.totalAmount),
        paymentMethod: payload.paymentMethod,
        screenshotFileId: screenshotFileId,
        status: "pending",
        rejectionReason: "",
        reviewedByAdminId: "",
        reviewedAt: "",
      };

      let finalPaymentId = generatedPaymentId;
      try {
        const payRes = await databases.createDocument(
          config.databaseId || ASAR_DATABASE_ID,
          ASAR_COLLECTIONS.PAYMENTS,
          paymentDocId,
          paymentPayload
        );
        finalPaymentId = payRes.$id;
      } catch (payErr) {
        console.warn(
          "Appwrite payment document creation fallback to local cache:",
          payErr
        );
      }

      // 4. Always synchronize complete order record to localStorage
      try {
        const cachedOrder = {
          $id: finalOrderId,
          orderId: finalOrderId,
          ...orderPayload,
          paymentId: finalPaymentId,
          paymentMethod: payload.paymentMethod,
          paidAmount: payload.depositAmount || payload.totalAmount,
          screenshotFileId: screenshotFileId,
          screenshotPreviewUrl: screenshotPreviewUrl,
          createdAt: new Date().toISOString(),
        };

        const existingCache = JSON.parse(
          localStorage.getItem("asar_orders_cache") || "[]"
        );
        const filtered = Array.isArray(existingCache)
          ? existingCache.filter((item: { $id?: string }) => item?.$id !== finalOrderId)
          : [];
        filtered.unshift(cachedOrder);
        localStorage.setItem("asar_orders_cache", JSON.stringify(filtered));

        // Save last order specifically for deep linking
        localStorage.setItem(
          "asar_last_booth_order",
          JSON.stringify(cachedOrder)
        );
      } catch (cacheErr) {
        console.warn("Could not persist order to localStorage cache:", cacheErr);
      }

      return {
        orderId: finalOrderId,
        status: "pending_payment",
        paymentId: finalPaymentId,
      };
    },
    [databases, storage, config, selectedPlan, selectedAddonIds]
  );

  return {
    plans,
    addons,
    loading: remoteLoading,
    error: remoteError,
    selectedPlan,
    setSelectedPlan,
    selectedAddonIds,
    setSelectedAddonIds,
    toggleAddon,
    calculateTotal,
    submitBookingOrder,
    refetchPlans: refetchRemote,
  };
}

export default useBoothBooking;
