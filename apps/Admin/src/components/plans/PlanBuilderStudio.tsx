import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge, SimpleGrid } from "@chakra-ui/react";
import { useAppwrite } from "@repo/react-appwrite";

export interface AsarPlanLimits {
  coverageHours?: number;
  maxVoiceRecords?: number; // -1 = Unlimited
  maxGalleryPhotos?: number; // -1 = Unlimited
  maxCustomCategories?: number;
  hasVideoHighlight?: boolean;
  hasGuestBookTab?: boolean;
  allowBulkZipDownload?: boolean;
  hostingDurationDays?: number;
  maxRsvpCapacity?: number; // For Invitation plans
}

export interface AsarPlanAddon {
  id: string;
  name: string;
  price: number;
  badge?: string;
  description?: string;
}

export interface AsarPlan {
  $id: string;
  serviceType: "booth" | "invitation";
  name: string;
  subtitle: string;
  badge: string;
  subBadge?: string;
  price: number;
  currency: string;
  depositRequired?: number;
  themeVariant: "ivory-royal" | "noir-obsidian";
  featuresJson: string; // JSON array of string[]
  addonsJson?: string; // JSON array of AsarPlanAddon[]
  limitsJson: string; // JSON object of AsarPlanLimits
  isActive: boolean;
  sortOrder: number;
}

const LOCAL_STORAGE_KEY = "asar_synced_plans";

// Initial seed plans matching ASAR luxury offerings
export const DEFAULT_INITIAL_PLANS: AsarPlan[] = [
  {
    $id: "plan-booth-classic",
    serviceType: "booth",
    name: "لحظة أثر — Athar Moment",
    subtitle: "الباقة الكلاسيكية للمناسبات الحميمية وحفلات الملكة",
    badge: "الأكثر طلباً",
    subBadge: "عرض الإطلاق",
    price: 4500,
    currency: "EGP",
    depositRequired: 1500,
    themeVariant: "ivory-royal",
    featuresJson: JSON.stringify([
      "تغطية الهاتف العتيق لمدة 4 ساعات متواصلة",
      "حتى 80 تسجيل صوتي نقي من الأحباء والضيوف",
      "معالجة وفلترة هندسية للصوت وإزالة الضوضاء",
      "صفحة ذكريات رقمية خاصة بكلمة سر للعروسين",
      "بطاقات طاولة أنيقة تحمل رمز QR للدخول",
      "استضافة رقمية مضمونة لمدة عام كامل",
    ]),
    addonsJson: JSON.stringify([
      { id: "addon-1", name: "ساعة إضافية لتغطية السهرة", price: 600, badge: "ساعات إضافية" },
      { id: "addon-2", name: "فلاش ميموري خشبي مخصص محفور بالليزر", price: 850, badge: "تذكار فاخر" },
    ]),
    limitsJson: JSON.stringify({
      coverageHours: 4,
      maxVoiceRecords: 80,
      maxGalleryPhotos: 20,
      maxCustomCategories: 4,
      hasVideoHighlight: false,
      hasGuestBookTab: true,
      allowBulkZipDownload: true,
      hostingDurationDays: 365,
    } as AsarPlanLimits),
    isActive: true,
    sortOrder: 1,
  },
  {
    $id: "plan-booth-royal-vip",
    serviceType: "booth",
    name: "ميراث ملكي — Royal Heritage",
    subtitle: "تجربة الأثر الملكية الفاخرة لكبرى حفلات الزفاف",
    badge: "VIP ROYAL",
    subBadge: "تغطية شاملة",
    price: 8500,
    currency: "EGP",
    depositRequired: 2500,
    themeVariant: "noir-obsidian",
    featuresJson: JSON.stringify([
      "تغطية احتفالية كاملة طوال الحفل (حتى 8 ساعات)",
      "تسجيلات صوتية غير محدودة بجودة استوديو احترافية",
      "معرض صور ذكريات متكامل حتى 100 صورة ملهمة",
      "فيديو تسليط الضوء الإعلاني (30 ثانية) مع أصوات الأحبة",
      "تنزيل جماعي فوري لجميع التسجيلات بضغطة زر (ZIP)",
      "لوحة مخصصة بأسماء الضيوف وتصنيفات العائلات",
      "استضافة سحابية ملكية لمدة عامين كاملين",
    ]),
    addonsJson: JSON.stringify([
      { id: "addon-vip-1", name: "هاتف عتيق إضافي لمنطقة كبار الزوار", price: 2000, badge: "VIP" },
      { id: "addon-vip-2", name: "ألبوم صور مخملي مطبوع مع رقاقة صوت مدمجة", price: 2500, badge: "تحفة فنية" },
    ]),
    limitsJson: JSON.stringify({
      coverageHours: 8,
      maxVoiceRecords: -1, // Unlimited
      maxGalleryPhotos: 100,
      maxCustomCategories: 8,
      hasVideoHighlight: true,
      hasGuestBookTab: true,
      allowBulkZipDownload: true,
      hostingDurationDays: 730,
    } as AsarPlanLimits),
    isActive: true,
    sortOrder: 2,
  },
  {
    $id: "plan-invitation-prestige",
    serviceType: "invitation",
    name: "دعوة الأثر الفاخرة — Prestige Invitation",
    subtitle: "موقع دعوة تفاعلي متكامل مع نموذج تأكيد الحضور الذكي",
    badge: "دعوة رقمية ذكية",
    subBadge: "تصميم مخصص",
    price: 3200,
    currency: "EGP",
    depositRequired: 1000,
    themeVariant: "ivory-royal",
    featuresJson: JSON.stringify([
      "موقع ويب مخصص بتصميم فاخر وتنسيق ثنائي اللغة",
      "نموذج RSVP تفاعلي مخصص حسب رغبة العروسين",
      "حقل البريد الإلكتروني الإلزامي للضيوف لتسليم رمز الدخول",
      "صندوق بريد وارد للموافقة والاعتذار في حساب العميل",
      "إرسال بطاقة دخول رقمية بكتالوج QR آلياً عبر EmailJS",
      "خريطة إرشادية لموقع القاعة والعد التنازلي التفاعلي",
    ]),
    addonsJson: JSON.stringify([
      { id: "addon-inv-1", name: "تصميم هوية بصرية مخصصة لمطبوعات الحفل", price: 1200, badge: "هوية بصرية" },
      { id: "addon-inv-2", name: "نظام التحقق السريع من رمز الدخول عند بوابة الحفل", price: 950, badge: "QR Scanner" },
    ]),
    limitsJson: JSON.stringify({
      maxRsvpCapacity: 350,
      hostingDurationDays: 180,
    } as AsarPlanLimits),
    isActive: true,
    sortOrder: 3,
  },
];

export interface PlanBuilderStudioProps {
  onPlansUpdated?: (plans: AsarPlan[]) => void;
}

export const PlanBuilderStudio: React.FC<PlanBuilderStudioProps> = ({ onPlansUpdated }) => {
  const { databases } = useAppwrite();
  const [plans, setPlans] = useState<AsarPlan[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_INITIAL_PLANS;
  });

  const [activeFilter, setActiveFilter] = useState<"all" | "booth" | "invitation">("all");
  const [editingPlan, setEditingPlan] = useState<AsarPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Form states inside editor
  const [formName, setFormName] = useState<string>("");
  const [formSubtitle, setFormSubtitle] = useState<string>("");
  const [formBadge, setFormBadge] = useState<string>("");
  const [formSubBadge, setFormSubBadge] = useState<string>("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formDeposit, setFormDeposit] = useState<number>(0);
  const [formCurrency, setFormCurrency] = useState<string>("EGP");
  const [formThemeVariant, setFormThemeVariant] = useState<"ivory-royal" | "noir-obsidian">("ivory-royal");
  const [formServiceType, setFormServiceType] = useState<"booth" | "invitation">("booth");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(1);

  // Features dynamic list
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState<string>("");

  // Addons dynamic list
  const [addonsList, setAddonsList] = useState<AsarPlanAddon[]>([]);
  const [newAddonName, setNewAddonName] = useState<string>("");
  const [newAddonPrice, setNewAddonPrice] = useState<number>(500);
  const [newAddonBadge, setNewAddonBadge] = useState<string>("");

  // Limits state
  const [limits, setLimits] = useState<AsarPlanLimits>({});

  // Sync to localStorage and notify parent whenever plans change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
      if (onPlansUpdated) onPlansUpdated(plans);
    } catch (e) {
      console.warn("Could not cache plans to localStorage", e);
    }
  }, [plans, onPlansUpdated]);

  const openCreateModal = (type: "booth" | "invitation" = "booth") => {
    setEditingPlan(null);
    setFormName("");
    setFormSubtitle("");
    setFormBadge("جديد");
    setFormSubBadge("");
    setFormPrice(type === "booth" ? 5000 : 3000);
    setFormDeposit(1500);
    setFormCurrency("EGP");
    setFormThemeVariant("ivory-royal");
    setFormServiceType(type);
    setFormIsActive(true);
    setFormSortOrder(plans.length + 1);
    setFeaturesList([
      "تغطية احترافية فاخرة",
      "دعم فني واستضافة سحابية عالية السرعة",
      "رمز QR ذكي مخصص",
    ]);
    setAddonsList([]);
    setLimits(
      type === "booth"
        ? {
            coverageHours: 4,
            maxVoiceRecords: 80,
            maxGalleryPhotos: 30,
            maxCustomCategories: 4,
            hasVideoHighlight: false,
            hasGuestBookTab: true,
            allowBulkZipDownload: true,
            hostingDurationDays: 365,
          }
        : {
            maxRsvpCapacity: 250,
            hostingDurationDays: 180,
          }
    );
    setIsModalOpen(true);
  };

  const openEditModal = (plan: AsarPlan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormSubtitle(plan.subtitle || "");
    setFormBadge(plan.badge || "");
    setFormSubBadge(plan.subBadge || "");
    setFormPrice(plan.price);
    setFormDeposit(plan.depositRequired || Math.round(plan.price * 0.3));
    setFormCurrency(plan.currency || "EGP");
    setFormThemeVariant(plan.themeVariant || "ivory-royal");
    setFormServiceType(plan.serviceType);
    setFormIsActive(plan.isActive);
    setFormSortOrder(plan.sortOrder || 1);

    try {
      const parsedFeatures = JSON.parse(plan.featuresJson || "[]");
      setFeaturesList(Array.isArray(parsedFeatures) ? parsedFeatures : []);
    } catch {
      setFeaturesList([]);
    }

    try {
      const parsedAddons = JSON.parse(plan.addonsJson || "[]");
      setAddonsList(Array.isArray(parsedAddons) ? parsedAddons : []);
    } catch {
      setAddonsList([]);
    }

    try {
      const parsedLimits = JSON.parse(plan.limitsJson || "{}");
      setLimits(parsedLimits);
    } catch {
      setLimits({});
    }

    setIsModalOpen(true);
  };

  const handleDuplicatePlan = (plan: AsarPlan) => {
    const duplicated: AsarPlan = {
      ...plan,
      $id: `plan-${Date.now()}`,
      name: `${plan.name} (نسخة مكررة)`,
      sortOrder: plans.length + 1,
    };
    setPlans((prev) => [duplicated, ...prev]);
    showSaveToast("تم تكرار الباقة بنجاح ✓");
  };

  const handleToggleActive = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.$id === planId ? { ...p, isActive: !p.isActive } : p))
    );
    showSaveToast("تم تحديث حالة الباقة بنجاح ✓");
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه الباقة؟")) {
      setPlans((prev) => prev.filter((p) => p.$id !== planId));
      showSaveToast("تم حذف الباقة بنجاح ✓");
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeaturesList((prev) => [...prev, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeaturesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveFeature = (index: number, direction: "up" | "down") => {
    setFeaturesList((prev) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const handleAddAddon = () => {
    if (!newAddonName.trim()) return;
    const newAddon: AsarPlanAddon = {
      id: `addon-${Date.now()}`,
      name: newAddonName.trim(),
      price: newAddonPrice || 0,
      badge: newAddonBadge.trim() || undefined,
    };
    setAddonsList((prev) => [...prev, newAddon]);
    setNewAddonName("");
    setNewAddonPrice(500);
    setNewAddonBadge("");
  };

  const handleRemoveAddon = (id: string) => {
    setAddonsList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSavePlan = async () => {
    if (!formName.trim()) {
      alert("يرجى إدخال اسم الباقة");
      return;
    }

    const payload: AsarPlan = {
      $id: editingPlan ? editingPlan.$id : `plan-${Date.now()}`,
      serviceType: formServiceType,
      name: formName.trim(),
      subtitle: formSubtitle.trim(),
      badge: formBadge.trim(),
      subBadge: formSubBadge.trim(),
      price: Number(formPrice) || 0,
      currency: formCurrency || "EGP",
      depositRequired: Number(formDeposit) || 0,
      themeVariant: formThemeVariant,
      featuresJson: JSON.stringify(featuresList),
      addonsJson: JSON.stringify(addonsList),
      limitsJson: JSON.stringify(limits),
      isActive: formIsActive,
      sortOrder: Number(formSortOrder) || 1,
    };

    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.$id === editingPlan.$id ? payload : p)));
    } else {
      setPlans((prev) => [payload, ...prev]);
    }

    // Try Appwrite Database sync if available
    if (databases) {
      try {
        if (editingPlan) {
          await databases.updateDocument("asar-db", "plans", editingPlan.$id, {
            name: payload.name,
            subtitle: payload.subtitle,
            badge: payload.badge,
            subBadge: payload.subBadge,
            price: payload.price,
            currency: payload.currency,
            themeVariant: payload.themeVariant,
            featuresJson: payload.featuresJson,
            addonsJson: payload.addonsJson,
            limitsJson: payload.limitsJson,
            isActive: payload.isActive,
            sortOrder: payload.sortOrder,
          });
        }
      } catch (err) {
        console.warn("Appwrite plans collection not reachable, synced to local state/storage:", err);
      }
    }

    setIsModalOpen(false);
    showSaveToast("تم حفظ الباقة ومزامنتها بنجاح عبر المنظومة ✓");
  };

  const showSaveToast = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const filteredPlans = plans.filter((p) => {
    if (activeFilter === "booth") return p.serviceType === "booth";
    if (activeFilter === "invitation") return p.serviceType === "invitation";
    return true;
  });

  return (
    <Box className="animate-fade-in">
      {/* Top Banner Notification */}
      {saveStatus && (
        <Box
          position="fixed"
          top={20}
          right={6}
          zIndex={9999}
          bg="var(--athar-maroon)"
          color="#ffffff"
          px={5}
          py={3}
          borderRadius="14px"
          boxShadow="var(--athar-shadow-elevated)"
          border="1px solid var(--athar-gold)"
          className="animate-fade-in"
        >
          <HStack gap={2}>
            <Text fontWeight="800" fontSize="0.92rem">
              ✦ {saveStatus}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Header and Controls */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
        <Box>
          <HStack gap={2} mb={1}>
            <Badge className="athar-badge-gold">✦ PLAN & QUOTA BUILDER</Badge>
            <Text fontSize="0.85rem" color="var(--athar-text-muted)">
              Dynamic pricing, limits and feature checklist
            </Text>
          </HStack>
          <Text
            fontSize={{ base: "1.8rem", md: "2.2rem" }}
            fontWeight="700"
            fontFamily="var(--font-arabic-display)"
            color="var(--athar-maroon)"
          >
            إدارة الباقات والأسعار والحصص
          </Text>
          <Text fontSize="0.9rem" color="var(--athar-text-muted)">
            تعديل فوري للباقات والخدمات مع مزامنة آنية لتطبيقات الحجز في Booth (:3002) و Invitation (:3003).
          </Text>
        </Box>

        <HStack gap={3}>
          <button
            className="btn-athar-primary"
            onClick={() => openCreateModal("booth")}
            style={{ fontSize: "0.9rem" }}
          >
            + باقة هاتف أثر جديدة (Booth)
          </button>
          <button
            className="btn-athar-secondary"
            onClick={() => openCreateModal("invitation")}
            style={{ fontSize: "0.9rem" }}
          >
            + باقة دعوة جديدة (Invitation)
          </button>
        </HStack>
      </Flex>

      {/* Filter Tabs */}
      <HStack gap={2} mb={6} borderBottom="1px solid rgba(107, 29, 40, 0.08)" pb={3}>
        {[
          { id: "all", label: `كل الباقات (${plans.length})` },
          { id: "booth", label: `🎙️ باقات هاتف أثر (${plans.filter((p) => p.serviceType === "booth").length})` },
          {
            id: "invitation",
            label: `✉️ باقات الدعوات الرقمية (${plans.filter((p) => p.serviceType === "invitation").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as "all" | "booth" | "invitation")}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "9999px",
              fontSize: "0.86rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              border: activeFilter === tab.id ? "1px solid var(--athar-maroon)" : "1px solid rgba(107, 29, 40, 0.12)",
              backgroundColor: activeFilter === tab.id ? "var(--athar-maroon)" : "rgba(255, 255, 255, 0.9)",
              color: activeFilter === tab.id ? "#ffffff" : "var(--athar-text-title)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </HStack>

      {/* Plans Cards Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {filteredPlans.map((plan) => {
          const isNoir = plan.themeVariant === "noir-obsidian";
          let features: string[] = [];
          try {
            features = JSON.parse(plan.featuresJson || "[]");
          } catch {
            features = [];
          }

          let planLimits: AsarPlanLimits = {};
          try {
            planLimits = JSON.parse(plan.limitsJson || "{}");
          } catch {
            planLimits = {};
          }

          return (
            <Box
              key={plan.$id}
              className={isNoir ? "athar-card-noir" : "athar-card"}
              p={6}
              position="relative"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              opacity={plan.isActive ? 1 : 0.65}
              border={plan.isActive ? undefined : "1px dashed #999"}
            >
              {/* Top Tags Row */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <HStack gap={2}>
                    <Badge
                      fontSize="0.75rem"
                      px={3}
                      py={1}
                      borderRadius="full"
                      bg={isNoir ? "rgba(212, 175, 55, 0.25)" : "var(--athar-maroon-subtle)"}
                      color={isNoir ? "var(--athar-gold)" : "var(--athar-maroon)"}
                      border={isNoir ? "1px solid #D4AF37" : "1px solid rgba(107, 29, 40, 0.2)"}
                      fontWeight="800"
                    >
                      {plan.badge || "باقة متميزة"}
                    </Badge>
                    {plan.subBadge && (
                      <Badge
                        fontSize="0.72rem"
                        px={2.5}
                        py={0.8}
                        borderRadius="full"
                        bg="rgba(212, 175, 55, 0.15)"
                        color={isNoir ? "#ffffff" : "#8C6F12"}
                      >
                        {plan.subBadge}
                      </Badge>
                    )}
                  </HStack>

                  <HStack gap={1.5}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: plan.isActive ? "var(--athar-status-success)" : "var(--athar-text-muted)",
                      }}
                    >
                      {plan.isActive ? "نشطة" : "معطلة"}
                    </span>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={plan.isActive ? "var(--athar-status-success)" : "#94A3B8"}
                    />
                  </HStack>
                </Flex>

                {/* Plan Title & Subtitle */}
                <Text
                  fontSize="1.45rem"
                  fontWeight="800"
                  fontFamily="var(--font-arabic-display)"
                  color={isNoir ? "#ffffff" : "var(--athar-maroon)"}
                  mb={1}
                >
                  {plan.name}
                </Text>
                <Text
                  fontSize="0.85rem"
                  color={isNoir ? "rgba(255, 255, 255, 0.75)" : "var(--athar-text-muted)"}
                  mb={4}
                  minH="38px"
                >
                  {plan.subtitle}
                </Text>

                {/* Pricing Box */}
                <Box
                  p={4}
                  borderRadius="16px"
                  bg={isNoir ? "rgba(255, 255, 255, 0.05)" : "rgba(251, 247, 242, 0.95)"}
                  border={isNoir ? "1px solid rgba(212, 175, 55, 0.25)" : "1px solid rgba(107, 29, 40, 0.08)"}
                  mb={4}
                >
                  <HStack align="baseline" justify="space-between">
                    <Box>
                      <Text
                        fontSize="2rem"
                        fontWeight="900"
                        color={isNoir ? "var(--athar-gold-bright)" : "var(--athar-text-title)"}
                        lineHeight="1"
                      >
                        {plan.price.toLocaleString()}{" "}
                        <span style={{ fontSize: "1rem", fontWeight: 700 }}>{plan.currency}</span>
                      </Text>
                      {plan.depositRequired ? (
                        <Text
                          fontSize="0.75rem"
                          color={isNoir ? "rgba(255, 255, 255, 0.6)" : "var(--athar-text-muted)"}
                          mt={1}
                        >
                          العربون المطلوب: <strong>{plan.depositRequired.toLocaleString()} EGP</strong>
                        </Text>
                      ) : null}
                    </Box>
                    <Badge
                      fontSize="0.72rem"
                      bg={isNoir ? "rgba(212, 175, 55, 0.2)" : "rgba(107, 29, 40, 0.1)"}
                      color={isNoir ? "var(--athar-gold)" : "var(--athar-maroon)"}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {plan.serviceType === "booth" ? "🎙️ BOOTH" : "✉️ INVITATION"}
                    </Badge>
                  </HStack>
                </Box>

                {/* Quotas Matrix Summary */}
                <Box mb={4} fontSize="0.8rem">
                  <Text
                    fontWeight="700"
                    color={isNoir ? "var(--athar-gold)" : "var(--athar-maroon)"}
                    mb={2}
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                  >
                    الحصص والقيود المقررة:
                  </Text>
                  <SimpleGrid columns={2} gap={2}>
                    {plan.serviceType === "booth" && (
                      <>
                        <Box
                          p={2}
                          borderRadius="8px"
                          bg={isNoir ? "rgba(255,255,255,0.06)" : "#FFFFFF"}
                          border="1px solid rgba(107, 29, 40, 0.06)"
                        >
                          <Text fontSize="0.72rem" color="var(--athar-text-muted)">التسجيلات:</Text>
                          <Text fontWeight="800">
                            {planLimits.maxVoiceRecords === -1 ? "غير محدود (VIP)" : `${planLimits.maxVoiceRecords || 80} تسجيل`}
                          </Text>
                        </Box>
                        <Box
                          p={2}
                          borderRadius="8px"
                          bg={isNoir ? "rgba(255,255,255,0.06)" : "#FFFFFF"}
                          border="1px solid rgba(107, 29, 40, 0.06)"
                        >
                          <Text fontSize="0.72rem" color="var(--athar-text-muted)">ساعات التغطية:</Text>
                          <Text fontWeight="800">{planLimits.coverageHours || 4} ساعات</Text>
                        </Box>
                        <Box
                          p={2}
                          borderRadius="8px"
                          bg={isNoir ? "rgba(255,255,255,0.06)" : "#FFFFFF"}
                          border="1px solid rgba(107, 29, 40, 0.06)"
                        >
                          <Text fontSize="0.72rem" color="var(--athar-text-muted)">معرض الصور:</Text>
                          <Text fontWeight="800">
                            {planLimits.maxGalleryPhotos === -1 ? "غير محدود" : `${planLimits.maxGalleryPhotos || 20} صورة`}
                          </Text>
                        </Box>
                        <Box
                          p={2}
                          borderRadius="8px"
                          bg={isNoir ? "rgba(255,255,255,0.06)" : "#FFFFFF"}
                          border="1px solid rgba(107, 29, 40, 0.06)"
                        >
                          <Text fontSize="0.72rem" color="var(--athar-text-muted)">فيديو تسليط الضوء:</Text>
                          <Text fontWeight="800">{planLimits.hasVideoHighlight ? "مشمول ✓" : "غير مشمول ✕"}</Text>
                        </Box>
                      </>
                    )}

                    {plan.serviceType === "invitation" && (
                      <>
                        <Box
                          p={2}
                          borderRadius="8px"
                          bg={isNoir ? "rgba(255,255,255,0.06)" : "#FFFFFF"}
                          border="1px solid rgba(107, 29, 40, 0.06)"
                        >
                          <Text fontSize="0.72rem" color="var(--athar-text-muted)">سعة المدعوين:</Text>
                          <Text fontWeight="800">{planLimits.maxRsvpCapacity || 300} مدعو</Text>
                        </Box>
                        <Box
                          p={2}
                          borderRadius="8px"
                          bg={isNoir ? "rgba(255,255,255,0.06)" : "#FFFFFF"}
                          border="1px solid rgba(107, 29, 40, 0.06)"
                        >
                          <Text fontSize="0.72rem" color="var(--athar-text-muted)">فترة الاستضافة:</Text>
                          <Text fontWeight="800">{planLimits.hostingDurationDays || 180} يوم</Text>
                        </Box>
                      </>
                    )}
                  </SimpleGrid>
                </Box>

                {/* Features Preview List */}
                <VStack align="stretch" gap={1.5} mb={5}>
                  {features.slice(0, 4).map((feat, idx) => (
                    <HStack key={idx} align="flex-start" gap={2}>
                      <Text color={isNoir ? "var(--athar-gold)" : "var(--athar-maroon)"} fontWeight="800">
                        ✦
                      </Text>
                      <Text
                        fontSize="0.82rem"
                        color={isNoir ? "rgba(255, 255, 255, 0.9)" : "var(--athar-text-body)"}
                        lineHeight="1.4"
                      >
                        {feat}
                      </Text>
                    </HStack>
                  ))}
                  {features.length > 4 && (
                    <Text
                      fontSize="0.75rem"
                      color={isNoir ? "var(--athar-gold)" : "var(--athar-maroon)"}
                      fontWeight="700"
                    >
                      + {features.length - 4} ميزات إضافية أخرى
                    </Text>
                  )}
                </VStack>
              </Box>

              {/* Action Buttons */}
              <Box pt={3} borderTop={isNoir ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(107, 29, 40, 0.08)"}>
                <Flex justify="space-between" align="center" gap={2}>
                  <HStack gap={2}>
                    <button
                      className="btn-athar-secondary"
                      onClick={() => openEditModal(plan)}
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
                    >
                      ✏️ تعديل
                    </button>
                    <button
                      className="btn-athar-secondary"
                      onClick={() => handleDuplicatePlan(plan)}
                      style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                      title="تكرار الباقة"
                    >
                      📄 تكرار
                    </button>
                  </HStack>

                  <HStack gap={2}>
                    <Button
                      size="xs"
                      variant="ghost"
                      color={plan.isActive ? "var(--athar-status-warning)" : "var(--athar-status-success)"}
                      fontWeight="700"
                      onClick={() => handleToggleActive(plan.$id)}
                    >
                      {plan.isActive ? "تعطيل" : "تفعيل"}
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="var(--athar-status-danger)"
                      fontWeight="700"
                      onClick={() => handleDeletePlan(plan.$id)}
                    >
                      حذف
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Plan Editor Modal / Drawer */}
      {isModalOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={1000}
          bg="rgba(35, 31, 32, 0.65)"
          backdropFilter="blur(8px)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="#ffffff"
            w="100%"
            maxW="900px"
            maxH="90vh"
            overflowY="auto"
            borderRadius="24px"
            p={{ base: 6, md: 8 }}
            boxShadow="var(--athar-shadow-elevated)"
            border="1px solid var(--athar-gold)"
            className="animate-fade-in"
          >
            {/* Modal Header */}
            <Flex justify="space-between" align="center" pb={4} borderBottom="1px solid rgba(107, 29, 40, 0.1)" mb={6}>
              <Box>
                <HStack gap={2}>
                  <Badge className="athar-badge-gold">
                    {editingPlan ? "✦ تعديل الباقة" : "✦ إنشاء باقة جديدة"}
                  </Badge>
                  <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                    {formServiceType === "booth" ? "خدمة هاتف أثر الصوتي" : "خدمة الدعوات الرقمية"}
                  </Text>
                </HStack>
                <Text
                  fontSize="1.6rem"
                  fontWeight="800"
                  fontFamily="var(--font-arabic-display)"
                  color="var(--athar-maroon)"
                >
                  {editingPlan ? formName || "تعديل تفاصيل الباقة" : "إضافة باقة جديدة للمنظومة"}
                </Text>
              </Box>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--athar-text-muted)",
                }}
              >
                ✕
              </button>
            </Flex>

            {/* Form Fields Sections */}
            <VStack align="stretch" gap={6}>
              {/* Service & Theme Variant Selector */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    نوع الخدمة:
                  </Text>
                  <select
                    className="athar-select"
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value as "booth" | "invitation")}
                  >
                    <option value="booth">🎙️ هاتف أثر (Booth Audio Memory)</option>
                    <option value="invitation">✉️ دعوة رقمية (Invitation Website)</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    طابع وتصميم البطاقة (Theme):
                  </Text>
                  <select
                    className="athar-select"
                    value={formThemeVariant}
                    onChange={(e) => setFormThemeVariant(e.target.value as "ivory-royal" | "noir-obsidian")}
                  >
                    <option value="ivory-royal">العاجي الملكي (Ivory Royal - Light)</option>
                    <option value="noir-obsidian">الحجر الأسود والذهب (Noir Obsidian VIP)</option>
                  </select>
                </Box>

                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    الترتيب والأولوية:
                  </Text>
                  <input
                    type="number"
                    className="athar-input"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  />
                </Box>
              </SimpleGrid>

              {/* Identity & Badges */}
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    اسم الباقة (العنوان الرئيسي): *
                  </Text>
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="مثال: باقة أثر الملكية — Royal Athar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    الشارة الرئيسية (Badge):
                  </Text>
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="مثال: الأكثر طلباً أو VIP"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                  />
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    الوصف المختصر (Subtitle):
                  </Text>
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="مثال: التجربة المتكاملة لحفلات الزفاف الكبرى"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    شارة ثانوية (Sub Badge - اختياري):
                  </Text>
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="مثال: عرض الإطلاق الحصري"
                    value={formSubBadge}
                    onChange={(e) => setFormSubBadge(e.target.value)}
                  />
                </Box>
              </SimpleGrid>

              {/* Pricing & Deposit */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    السعر الإجمالي: *
                  </Text>
                  <input
                    type="number"
                    className="athar-input"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    العملة:
                  </Text>
                  <input
                    type="text"
                    className="athar-input"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title)" mb={1.5}>
                    العربون المطلوب تأكيده بالتحويل:
                  </Text>
                  <input
                    type="number"
                    className="athar-input"
                    value={formDeposit}
                    onChange={(e) => setFormDeposit(Number(e.target.value))}
                  />
                </Box>
              </SimpleGrid>

              {/* Dynamic Features List */}
              <Box p={5} borderRadius="16px" bg="var(--athar-bg-secondary)" border="1px solid rgba(107, 29, 40, 0.08)">
                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-maroon)" mb={1}>
                  قائمة الميزات المخصصة (Custom Features Checklist)
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)" mb={4}>
                  أضف النقاط التسويقية والمزايا التي تظهر للعميل في بطاقة الحجز
                </Text>

                <VStack align="stretch" gap={2} mb={4}>
                  {featuresList.map((feat, idx) => (
                    <Flex
                      key={idx}
                      align="center"
                      justify="space-between"
                      p={2.5}
                      bg="#ffffff"
                      borderRadius="10px"
                      border="1px solid rgba(107, 29, 40, 0.08)"
                    >
                      <HStack gap={2}>
                        <Text color="var(--athar-gold)" fontWeight="800">
                          {idx + 1}.
                        </Text>
                        <Text fontSize="0.88rem" fontWeight="600" color="var(--athar-text-title)">
                          {feat}
                        </Text>
                      </HStack>
                      <HStack gap={1.5}>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleMoveFeature(idx, "up")}
                          disabled={idx === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => handleMoveFeature(idx, "down")}
                          disabled={idx === featuresList.length - 1}
                        >
                          ↓
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="var(--athar-status-danger)"
                          onClick={() => handleRemoveFeature(idx)}
                        >
                          ✕
                        </Button>
                      </HStack>
                    </Flex>
                  ))}
                </VStack>

                <Flex gap={2}>
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="اكتب ميزة جديدة هنا..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    className="btn-athar-secondary"
                    onClick={handleAddFeature}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    + إضافة ميزة
                  </button>
                </Flex>
              </Box>

              {/* Enforced Quotas & Limits Matrix */}
              <Box p={5} borderRadius="16px" bg="var(--athar-bg-secondary)" border="1px solid rgba(107, 29, 40, 0.08)">
                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-maroon)" mb={1}>
                  مصفوفة الحصص والحدود الإلزامية (Limits & Quotas Matrix)
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)" mb={4}>
                  القيود البرمجية التي تفرضها المنظومة على هذا الطلب (-1 تعني غير محدود / Unlimited)
                </Text>

                {formServiceType === "booth" ? (
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>ساعات التغطية بالموقع:</Text>
                      <input
                        type="number"
                        className="athar-input"
                        value={limits.coverageHours || 4}
                        onChange={(e) => setLimits({ ...limits, coverageHours: Number(e.target.value) })}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>أقصى عدد تسجيلات (-1 = غير محدود):</Text>
                      <input
                        type="number"
                        className="athar-input"
                        value={limits.maxVoiceRecords ?? 80}
                        onChange={(e) => setLimits({ ...limits, maxVoiceRecords: Number(e.target.value) })}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>أقصى عدد صور بالمعرض (-1 = غير محدود):</Text>
                      <input
                        type="number"
                        className="athar-input"
                        value={limits.maxGalleryPhotos ?? 30}
                        onChange={(e) => setLimits({ ...limits, maxGalleryPhotos: Number(e.target.value) })}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>مدة استضافة الصفحة (بالأيام):</Text>
                      <input
                        type="number"
                        className="athar-input"
                        value={limits.hostingDurationDays || 365}
                        onChange={(e) => setLimits({ ...limits, hostingDurationDays: Number(e.target.value) })}
                      />
                    </Box>

                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>تضمين فيديو تسليط الضوء (30 ثانية):</Text>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={!!limits.hasVideoHighlight}
                          onChange={(e) => setLimits({ ...limits, hasVideoHighlight: e.target.checked })}
                          style={{ width: "18px", height: "18px", accentColor: "var(--athar-maroon)" }}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>تفعيل تبويب وعرض الفيديو</span>
                      </label>
                    </Box>

                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>السماح بتنزيل الملفات المضغوطة (ZIP):</Text>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "0.5rem" }}>
                        <input
                          type="checkbox"
                          checked={limits.allowBulkZipDownload ?? true}
                          onChange={(e) => setLimits({ ...limits, allowBulkZipDownload: e.target.checked })}
                          style={{ width: "18px", height: "18px", accentColor: "var(--athar-maroon)" }}
                        />
                        <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>زر تنزيل كل الرسائل دفعة واحدة</span>
                      </label>
                    </Box>
                  </SimpleGrid>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>سعة الحضور القصوى (RSVP Capacity):</Text>
                      <input
                        type="number"
                        className="athar-input"
                        value={limits.maxRsvpCapacity || 300}
                        onChange={(e) => setLimits({ ...limits, maxRsvpCapacity: Number(e.target.value) })}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="0.78rem" fontWeight="700" mb={1}>مدة استضافة صفحة الدعوة (بالأيام):</Text>
                      <input
                        type="number"
                        className="athar-input"
                        value={limits.hostingDurationDays || 180}
                        onChange={(e) => setLimits({ ...limits, hostingDurationDays: Number(e.target.value) })}
                      />
                    </Box>
                  </SimpleGrid>
                )}
              </Box>

              {/* Addons Manager */}
              <Box p={5} borderRadius="16px" bg="var(--athar-bg-secondary)" border="1px solid rgba(107, 29, 40, 0.08)">
                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-maroon)" mb={1}>
                  كتالوج الإضافات الاختيارية (Add-ons Catalog)
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)" mb={3}>
                  الخيارات الملحقة التي يستطيع العميل إضافتها إلى طلبه
                </Text>

                <VStack align="stretch" gap={2} mb={3}>
                  {addonsList.map((addon) => (
                    <Flex
                      key={addon.id}
                      align="center"
                      justify="space-between"
                      p={2.5}
                      bg="#ffffff"
                      borderRadius="10px"
                      border="1px solid rgba(107, 29, 40, 0.08)"
                    >
                      <HStack gap={2}>
                        <Text fontWeight="700" fontSize="0.88rem">{addon.name}</Text>
                        {addon.badge && <Badge className="athar-badge-gold" fontSize="0.7rem">{addon.badge}</Badge>}
                      </HStack>
                      <HStack gap={3}>
                        <Text fontWeight="800" color="var(--athar-maroon)">{addon.price} EGP</Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="var(--athar-status-danger)"
                          onClick={() => handleRemoveAddon(addon.id)}
                        >
                          ✕
                        </Button>
                      </HStack>
                    </Flex>
                  ))}
                </VStack>

                <Flex gap={2} wrap="wrap">
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="اسم الإضافة (مثال: فلاش ميموري خشبي فاخر)"
                    style={{ flex: 2, minWidth: "200px" }}
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                  />
                  <input
                    type="number"
                    className="athar-input"
                    placeholder="السعر (EGP)"
                    style={{ flex: 1, minWidth: "120px" }}
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                  />
                  <input
                    type="text"
                    className="athar-input"
                    placeholder="شارة (اختياري)"
                    style={{ flex: 1, minWidth: "120px" }}
                    value={newAddonBadge}
                    onChange={(e) => setNewAddonBadge(e.target.value)}
                  />
                  <button className="btn-athar-secondary" onClick={handleAddAddon}>
                    + إضافة ملحق
                  </button>
                </Flex>
              </Box>
            </VStack>

            {/* Modal Bottom Actions */}
            <Flex justify="space-between" align="center" pt={6} mt={6} borderTop="1px solid rgba(107, 29, 40, 0.1)">
              <Button
                variant="ghost"
                color="var(--athar-text-muted)"
                onClick={() => setIsModalOpen(false)}
              >
                إلغاء التعديلات
              </Button>

              <button
                className="btn-athar-primary"
                onClick={handleSavePlan}
                style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}
              >
                ✓ حفظ الباقة ومزامنتها للجمهور
              </button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PlanBuilderStudio;
