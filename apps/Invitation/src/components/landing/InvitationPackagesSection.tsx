import React, { useState, useEffect } from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge } from "@chakra-ui/react";
import { FaCheck, FaCrown, FaStar, FaShieldAlt } from "react-icons/fa";

export interface InvitationPlan {
  id: string;
  serviceType: "invitation";
  name: string;
  subtitle: string;
  badge?: string;
  subBadge?: string;
  price: number;
  depositRequired: number;
  currency: string;
  themeVariant: "ivory-royal" | "noir-obsidian";
  features: string[];
  limits?: {
    maxCapacity: number;
    hostingDurationDays: number;
    maxGalleryPhotos: number;
  };
}

export const DEFAULT_INVITATION_PLANS: InvitationPlan[] = [
  {
    id: "plan-invitation-classic",
    serviceType: "invitation",
    name: "باقة دعوة أثر الكلاسيكية",
    subtitle: "المثالية لحفلات الزفاف والخطوبة والمناسبات العائلية الراقية",
    badge: "الأكثر طلباً ✦ زفاف ملكي",
    subBadge: "عرض الإطلاق",
    price: 2500,
    depositRequired: 1000,
    currency: "EGP",
    themeVariant: "ivory-royal",
    features: [
      "موقع ويب تفاعلي كامل مخصص ومصمم وفق هوية المناسبة",
      "عداد تنازلي تفاعلي وتنسيق فاخر بالخط العربي الشاعري",
      "خريطة القاعة التفاعلية مع إرشادات الوصول وDress Code",
      "نموذج تسجيل حضور ديناميكي (Dynamic RSVP) حتى 150 ضيفاً",
      "صندوق بريد خاص في حساب العميل لمتابعة الضيوف لحظياً",
      "إرسال بطاقات QR Code رقمية مشفرة للدخول عبر البريد الإلكتروني تلقائياً",
      "ألبوم صور رقمي للمناسبة حتى 30 صورة عالية الجودة",
      "استضافة سحابية سريعة ومحمية لمدة 6 أشهر كاملة",
    ],
    limits: {
      maxCapacity: 150,
      hostingDurationDays: 180,
      maxGalleryPhotos: 30,
    },
  },
  {
    id: "plan-invitation-royal-vip",
    serviceType: "invitation",
    name: "باقة أثر الملكية للمناسبات الكبرى VIP",
    subtitle: "للتجمعات الكبرى، المهرجانات، والمؤتمرات الرفيعة التي تتطلب كمالاً لا يقبل المساومة",
    badge: "الأكثر تميزاً للمناسبات الكبرى ✦ VIP",
    subBadge: "تجربة متكاملة",
    price: 4500,
    depositRequired: 2000,
    currency: "EGP",
    themeVariant: "noir-obsidian",
    features: [
      "موقع ويب متعدد الأقسام مع معرض صور ثلاثي الأبعاد 3D Gallery",
      "عدد ضيوف وحقول تسجيل مخصصة غير محدودة (Unlimited RSVPs)",
      "ماسح QR إلكتروني لبوابات القاعة لمنع تكرار الدخول وضبط الأمان",
      "هوية بصرية مخصصة بالكامل وألوان وثيمات فريدة لمناسبتكم",
      "إرسال إشعارات ورسائل تذكير تلقائية عبر البريد الإلكتروني للمدعوين",
      "استخراج تقارير إحصائية وتحميل بيانات الحضور بصيغة Excel / CSV",
      "دعم فني ومتابعة خاصة مخصصة مع منسق المناسبات على مدار الساعة",
      "استضافة سحابية وتوثيق دائم للذكرى لمدة عام كامل (1 Year Memory)",
    ],
    limits: {
      maxCapacity: -1, // Unlimited
      hostingDurationDays: 365,
      maxGalleryPhotos: -1,
    },
  },
];

export interface InvitationPackagesSectionProps {
  onSelectPackage: (pkg: InvitationPlan) => void;
}

export const InvitationPackagesSection: React.FC<InvitationPackagesSectionProps> = ({
  onSelectPackage,
}) => {
  const [plans, setPlans] = useState<InvitationPlan[]>(DEFAULT_INVITATION_PLANS);

  // Synchronize dynamic plans from Appwrite or local storage cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem("asar_synced_plans");
      if (cached) {
        const parsed = JSON.parse(cached) as Array<Record<string, unknown>>;
        const invPlans = parsed.filter(
          (p) => p.serviceType === "invitation" && p.isActive !== false
        ) as unknown as InvitationPlan[];
        if (invPlans.length > 0) {
          setPlans(invPlans);
        }
      }
    } catch {
      // Fallback cleanly to default plans
    }
  }, []);

  return (
    <Box
      as="section"
      id="packages"
      py={{ base: 20, md: 28 }}
      px={{ base: 4, sm: 6, lg: 8 }}
      bg="var(--athar-bg-primary, #FBF7F2)"
      position="relative"
      scrollMarginTop="90px"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
        {/* Section Header */}
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 14, md: 18 }}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.5)"
            bg="rgba(255, 255, 255, 0.9)"
            color="var(--athar-maroon, #6B1D28)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="0.82rem"
            fontWeight="700"
            letterSpacing="0.06em"
            mb={3}
          >
            ✦ باقات وعروض أثر للدعوات
          </Badge>

          <Text
            as="h2"
            fontFamily="var(--font-arabic-display, 'Amiri', serif)"
            fontSize="clamp(2rem, 3.8vw, 3.2rem)"
            fontWeight="800"
            color="var(--athar-text-title, #231F20)"
            lineHeight="1.25"
            mb={3}
          >
            شفافية مطلقة واستثمار في تخليد أرقى لحظاتكم
          </Text>

          <Text
            maxW="680px"
            fontSize={{ base: "0.98rem", md: "1.12rem" }}
            color="var(--athar-text-body, #4A4240)"
            lineHeight="1.8"
          >
            اختر الباقة المناسبة لحجم فعاليتكم؛ تشمل جميع الباقات موقعاً تفاعلياً مستقلاً،
            صندوق بريد لحظي، وإصدار بطاقات QR للدخول التلقائي.
          </Text>
        </Flex>

        {/* Packages Cards Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 10 }} alignItems="stretch">
          {plans.map((pkg) => {
            const isNoir = pkg.themeVariant === "noir-obsidian";

            return (
              <Box
                key={pkg.id}
                position="relative"
                bg={
                  isNoir
                    ? "linear-gradient(170deg, #231A1E 0%, #161214 100%)"
                    : "rgba(255, 255, 255, 0.98)"
                }
                color={isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)"}
                borderRadius="32px"
                p={{ base: 6, sm: 8, md: 10 }}
                border={
                  isNoir
                    ? "1.5px solid #D4AF37"
                    : "2px solid var(--athar-maroon, #6B1D28)"
                }
                boxShadow={
                  isNoir
                    ? "0 25px 65px -15px rgba(0, 0, 0, 0.6)"
                    : "0 20px 50px -15px rgba(107, 29, 40, 0.15)"
                }
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: isNoir
                    ? "0 35px 85px -15px rgba(212, 175, 55, 0.28)"
                    : "0 30px 70px -15px rgba(107, 29, 40, 0.24)",
                  borderColor: "#D4AF37",
                }}
              >
                <Box>
                  {/* Header Badges */}
                  <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={2}>
                    <HStack
                      bg={isNoir ? "rgba(212, 175, 55, 0.2)" : "var(--athar-maroon, #6B1D28)"}
                      color={isNoir ? "#E5C158" : "white"}
                      px={4}
                      py={1.5}
                      borderRadius="full"
                      fontSize="0.82rem"
                      fontWeight="700"
                      border={isNoir ? "1px solid rgba(212, 175, 55, 0.45)" : "none"}
                    >
                      {isNoir ? <FaCrown size={12} /> : <FaStar size={12} color="#D4AF37" />}
                      <Text>{pkg.badge}</Text>
                    </HStack>

                    {pkg.subBadge && (
                      <Badge
                        bg={isNoir ? "rgba(255, 255, 255, 0.1)" : "rgba(212, 175, 55, 0.18)"}
                        color={isNoir ? "rgba(255, 255, 255, 0.85)" : "#B7791F"}
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="0.75rem"
                        fontWeight="700"
                      >
                        {pkg.subBadge}
                      </Badge>
                    )}
                  </Flex>

                  {/* Plan Name & Subtitle */}
                  <Text
                    fontFamily="var(--font-arabic-display, 'Amiri', serif)"
                    fontSize={{ base: "1.75rem", sm: "2.1rem" }}
                    fontWeight="800"
                    lineHeight="1.2"
                    mb={2}
                    color={isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)"}
                  >
                    {pkg.name}
                  </Text>

                  <Text
                    fontSize="0.9rem"
                    color={isNoir ? "rgba(255, 255, 255, 0.7)" : "var(--athar-text-muted, #7A6F6D)"}
                    lineHeight="1.6"
                    mb={6}
                  >
                    {pkg.subtitle}
                  </Text>

                  {/* Pricing */}
                  <Box
                    p={5}
                    borderRadius="20px"
                    bg={isNoir ? "rgba(255, 255, 255, 0.04)" : "rgba(107, 29, 40, 0.03)"}
                    border={
                      isNoir
                        ? "1px solid rgba(255, 255, 255, 0.08)"
                        : "1px solid rgba(107, 29, 40, 0.08)"
                    }
                    mb={7}
                  >
                    <Flex align="baseline" gap={2} mb={1}>
                      <Text
                        fontSize={{ base: "2.4rem", sm: "2.9rem" }}
                        fontWeight="900"
                        color={isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)"}
                        fontFamily="var(--font-arabic-display, serif)"
                        lineHeight="1"
                      >
                        {pkg.price.toLocaleString("en-US")}
                      </Text>
                      <Text
                        fontSize="1.1rem"
                        fontWeight="700"
                        color={isNoir ? "rgba(255, 255, 255, 0.75)" : "var(--athar-text-body, #4A4240)"}
                      >
                        {pkg.currency === "EGP" ? "جنيه مصري" : pkg.currency}
                      </Text>
                    </Flex>

                    <HStack gap={2} fontSize="0.82rem">
                      <FaShieldAlt size={12} color={isNoir ? "#D4AF37" : "#6B1D28"} />
                      <Text color={isNoir ? "rgba(255, 255, 255, 0.6)" : "var(--athar-text-muted, #7A6F6D)"}>
                        العربون التأكيدي: {pkg.depositRequired.toLocaleString("en-US")} ج.م (والباقي عند التسليم)
                      </Text>
                    </HStack>
                  </Box>

                  {/* Features List */}
                  <Box mb={8}>
                    <Text
                      fontWeight="800"
                      fontSize="0.88rem"
                      color={isNoir ? "#D4AF37" : "var(--athar-maroon, #6B1D28)"}
                      letterSpacing="0.04em"
                      mb={4}
                    >
                      ✦ المميزات والخدمات المتضمنة:
                    </Text>

                    <Flex direction="column" gap={3}>
                      {pkg.features.map((feat, fIdx) => (
                        <Flex key={fIdx} align="flex-start" gap={3}>
                          <Flex
                            w="20px"
                            h="20px"
                            borderRadius="full"
                            bg={isNoir ? "rgba(212, 175, 55, 0.2)" : "rgba(107, 29, 40, 0.08)"}
                            color={isNoir ? "#D4AF37" : "var(--athar-maroon, #6B1D28)"}
                            align="center"
                            justify="center"
                            flexShrink={0}
                            mt={0.5}
                          >
                            <FaCheck size={10} />
                          </Flex>
                          <Text
                            fontSize={{ base: "0.88rem", sm: "0.94rem" }}
                            lineHeight="1.55"
                            color={isNoir ? "rgba(255, 255, 255, 0.88)" : "var(--athar-text-body, #4A4240)"}
                          >
                            {feat}
                          </Text>
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                </Box>

                {/* Bottom Action CTA */}
                <Button
                  onClick={() => onSelectPackage(pkg)}
                  w="100%"
                  py={6}
                  borderRadius="full"
                  bg={isNoir ? "#D4AF37" : "var(--athar-maroon, #6B1D28)"}
                  color={isNoir ? "#161214" : "white"}
                  fontWeight="800"
                  fontSize="1rem"
                  boxShadow={
                    isNoir
                      ? "0 8px 25px rgba(212, 175, 55, 0.35)"
                      : "0 8px 25px rgba(107, 29, 40, 0.3)"
                  }
                  gap={2.5}
                  _hover={{
                    bg: isNoir ? "#E5C158" : "var(--athar-maroon-dark, #5B1621)",
                    transform: "translateY(-2px)",
                    boxShadow: isNoir
                      ? "0 12px 30px rgba(212, 175, 55, 0.45)"
                      : "0 12px 30px rgba(107, 29, 40, 0.4)",
                  }}
                >
                  <FaCrown size={15} />
                  احجز هذه الباقة وابدأ التخصيص
                </Button>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default InvitationPackagesSection;
