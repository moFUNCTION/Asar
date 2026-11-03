import React from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge } from "@chakra-ui/react";
import { FaExternalLinkAlt, FaRing, FaMusic, FaBriefcase, FaGraduationCap, FaCalendarCheck } from "react-icons/fa";

export interface InvitationThemesGalleryProps {
  onPreviewEvent?: (slug: string) => void;
  onOpenBooking?: () => void;
}

export interface OccasionItem {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  categoryBadge: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
  accentBorder: string;
  highlightColor: string;
  tags: string[];
}

export const OCCASIONS_DATA: OccasionItem[] = [
  {
    id: "wedding",
    slug: "omar-and-layla",
    title: "حفلات الزفاف والخطوبة الملكية",
    titleEn: "Royal Weddings & Engagements",
    categoryBadge: "الأكثر طلباً ✦ زفاف ملكي",
    description:
      "موقع أسطوري ينبض بالرقي والشاعرية، يشمل معرض صور ثلاثي الأبعاد، قصة حب العروسين، خريطة القاعة، ونموذج حضور تفاعلي يفرز الضيوف حسب العائلات.",
    icon: <FaRing size={22} />,
    bgGradient: "linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(251, 247, 242, 0.95) 100%)",
    accentBorder: "rgba(107, 29, 40, 0.2)",
    highlightColor: "var(--athar-maroon, #6B1D28)",
    tags: ["معرض صور تفاعلي", "خريطة القاعة", "قائمة الهدايا", "عداد تنازلي"],
  },
  {
    id: "festival",
    slug: "cairo-jazz-festival",
    title: "المهرجانات والفعاليات الثقافية والفنية",
    titleEn: "Music & Cultural Festivals",
    categoryBadge: "فعاليات كبرى ✦ مهرجانات",
    description:
      "منصة تفاعلية تنبض بالحيوية والطاقة، تدعم جداول الحفلات المتزامنة، ملفات الفنانين، بطاقات الدخول الرقمية، والتأكيد الفوري عبر البريد الإلكتروني.",
    icon: <FaMusic size={22} />,
    bgGradient: "linear-gradient(145deg, #1B1824 0%, #121017 100%)",
    accentBorder: "rgba(229, 193, 88, 0.35)",
    highlightColor: "#E5C158",
    tags: ["أجندة الحفلات", "بطاقات الفنانين", "فئات التذاكر", "QR ماسح سريع"],
  },
  {
    id: "gala",
    slug: "asar-leadership-gala",
    title: "حفلات العشاء والمؤتمرات والقمم VIP",
    titleEn: "VIP Galas & Corporate Summits",
    categoryBadge: "أعمال وقمم ✦ Noir Obsidian",
    description:
      "واجهة هادئة وفخمة مصممة لكبار الشخصيات ورجال الأعمال، مع نموذج تسجيل مغلق ورموز تحقق سرية ومسار اعتماد مسبق لكل مقعد.",
    icon: <FaBriefcase size={22} />,
    bgGradient: "linear-gradient(145deg, #231A1E 0%, #161214 100%)",
    accentBorder: "#D4AF37",
    highlightColor: "#D4AF37",
    tags: ["سري ومعتمد", "مقاعد محجوزة", "أجندة المتحدثين", "رمز VIP سري"],
  },
  {
    id: "graduation",
    slug: "class-of-2026-graduation",
    title: "حفلات التخرج والذكريات السنوية",
    titleEn: "Graduations & Milestone Anniversaries",
    categoryBadge: "إنجاز وتخليد ✦ ذكرى سنوية",
    description:
      "احتفال بإنجازات الأعوام وفرحة العمر؛ يتضمن سجل شرف للخريجين، ألبوم ذكريات تفاعلي، ودفتر أمنيات وتهاني رقمي مفتوح لمباركات الأحبة.",
    icon: <FaGraduationCap size={22} />,
    bgGradient: "linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(244, 239, 234, 0.95) 100%)",
    accentBorder: "rgba(30, 111, 80, 0.25)",
    highlightColor: "#1E6F50",
    tags: ["سجل شرف الدفعة", "دفتر تهاني إلكتروني", "فيديو الحفل", "دعوة الأهل"],
  },
];

export const InvitationThemesGallery: React.FC<InvitationThemesGalleryProps> = ({
  onPreviewEvent,
  onOpenBooking,
}) => {
  return (
    <Box
      as="section"
      id="occasions"
      py={{ base: 20, md: 28 }}
      px={{ base: 4, sm: 6, lg: 8 }}
      bg="var(--athar-bg-secondary, #F4EFEA)"
      position="relative"
      scrollMarginTop="90px"
      dir="rtl"
    >
      <Box maxW="1280px" mx="auto">
        {/* Section Header */}
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 14, md: 20 }}>
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
            ✦ تصاميم تناسب طبيعة كل احتفال
          </Badge>

          <Text
            as="h2"
            fontFamily="var(--font-arabic-display, 'Amiri', serif)"
            fontSize="clamp(2rem, 3.8vw, 3.2rem)"
            fontWeight="800"
            color="var(--athar-text-title, #231F20)"
            lineHeight="1.28"
            mb={3}
          >
            ليس مجرد قالب ثابت... بل موقع مبني لخصوصية مناسبتكم
          </Text>

          <Text
            maxW="720px"
            fontSize={{ base: "0.98rem", md: "1.12rem" }}
            color="var(--athar-text-body, #4A4240)"
            lineHeight="1.8"
          >
            نمنح كل مناسبة طابعاً معمارياً فريداً؛ يختلف موقع المهرجان الصاخب كلياً عن عرس أسطوري هادئ،
            أو قمة أعمال رفيعة تتطلب سرية تامة وسيطرة دقيقة على المقاعد.
          </Text>
        </Flex>

        {/* 4 Cards Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, lg: 10 }}>
          {OCCASIONS_DATA.map((item) => {
            const isDark = item.id === "festival" || item.id === "gala";
            return (
              <Box
                key={item.id}
                bg={item.bgGradient}
                color={isDark ? "#FFFFFF" : "var(--athar-text-title, #231F20)"}
                borderRadius="28px"
                p={{ base: 6, sm: 8, lg: 10 }}
                border={`1.5px solid ${item.accentBorder}`}
                boxShadow={
                  isDark
                    ? "0 25px 60px -15px rgba(0, 0, 0, 0.55)"
                    : "0 15px 40px -12px rgba(107, 29, 40, 0.08)"
                }
                position="relative"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                _hover={{
                  transform: "translateY(-6px)",
                  boxShadow: isDark
                    ? "0 35px 80px -15px rgba(212, 175, 55, 0.25)"
                    : "0 25px 55px -12px rgba(107, 29, 40, 0.16)",
                  borderColor: item.highlightColor,
                }}
              >
                <Box>
                  {/* Top Row: Icon + Badge */}
                  <Flex justify="space-between" align="center" mb={6}>
                    <Flex
                      w="54px"
                      h="54px"
                      borderRadius="18px"
                      bg={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(107, 29, 40, 0.06)"}
                      color={item.highlightColor}
                      align="center"
                      justify="center"
                      boxShadow={isDark ? "0 4px 16px rgba(0, 0, 0, 0.3)" : "none"}
                      border={isDark ? "1px solid rgba(212, 175, 55, 0.3)" : "none"}
                    >
                      {item.icon}
                    </Flex>

                    <Badge
                      variant="outline"
                      bg={isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.9)"}
                      color={item.highlightColor}
                      borderColor={item.accentBorder}
                      px={3.5}
                      py={1.2}
                      borderRadius="full"
                      fontSize="0.78rem"
                      fontWeight="700"
                    >
                      {item.categoryBadge}
                    </Badge>
                  </Flex>

                  {/* Titles */}
                  <Text
                    fontFamily="var(--font-arabic-display, 'Amiri', serif)"
                    fontSize={{ base: "1.45rem", sm: "1.7rem" }}
                    fontWeight="800"
                    lineHeight="1.3"
                    mb={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    fontSize="0.82rem"
                    color={isDark ? "rgba(255, 255, 255, 0.6)" : "var(--athar-text-muted, #7A6F6D)"}
                    mb={4}
                    fontWeight="600"
                  >
                    {item.titleEn}
                  </Text>

                  {/* Description */}
                  <Text
                    fontSize={{ base: "0.92rem", sm: "1rem" }}
                    color={isDark ? "rgba(255, 255, 255, 0.85)" : "var(--athar-text-body, #4A4240)"}
                    lineHeight="1.8"
                    mb={6}
                  >
                    {item.description}
                  </Text>

                  {/* Tags Pills */}
                  <Flex wrap="wrap" gap={2} mb={8}>
                    {item.tags.map((tag) => (
                      <Box
                        key={tag}
                        bg={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(107, 29, 40, 0.04)"}
                        color={isDark ? "rgba(255, 255, 255, 0.8)" : "var(--athar-text-body, #4A4240)"}
                        px={3}
                        py={1}
                        borderRadius="8px"
                        fontSize="0.78rem"
                        fontWeight="600"
                        border={isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(107, 29, 40, 0.06)"}
                      >
                        ✦ {tag}
                      </Box>
                    ))}
                  </Flex>
                </Box>

                {/* Action Buttons */}
                <HStack justify="space-between" pt={4} borderTop={isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(107, 29, 40, 0.08)"}>
                  <Button
                    onClick={() => onPreviewEvent?.(item.slug)}
                    variant="ghost"
                    color={item.highlightColor}
                    fontWeight="700"
                    fontSize="0.92rem"
                    p={0}
                    gap={2}
                    _hover={{
                      textDecoration: "underline",
                      transform: "translateX(-3px)",
                    }}
                  >
                    معاينة هذا التصميم ↗
                    <FaExternalLinkAlt size={12} />
                  </Button>

                  <Button
                    onClick={onOpenBooking}
                    size="sm"
                    borderRadius="full"
                    bg={isDark ? item.highlightColor : "var(--athar-maroon, #6B1D28)"}
                    color={isDark ? "#121014" : "white"}
                    fontWeight="700"
                    px={4}
                    fontSize="0.82rem"
                    _hover={{
                      transform: "scale(1.04)",
                      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <FaCalendarCheck size={11} style={{ marginLeft: "6px" }} />
                    طلب هذا النمط
                  </Button>
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export const OccasionsShowcaseSection = InvitationThemesGallery;
export default InvitationThemesGallery;
