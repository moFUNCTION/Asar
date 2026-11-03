import React, { useState } from "react";
import { Box, Grid, Flex, Text, HStack, Badge, Image } from "@chakra-ui/react";
import { FaChevronDown, FaMicrophoneAlt, FaUserTie, FaSlidersH, FaCrown, FaCloudDownloadAlt } from "react-icons/fa";
import { BlurText, SplitText } from "@repo/ui-components";

// Statically defined local assets to prevent recreation and memory churn
const GALLERY_ITEMS = [
  {
    image: "/assets/wedding2.jpg",
    text: "اسمع ابتسامتهم",
    description: "نبرة صوت الأحباب موثقة بنقاء صوتي استثنائي",
  },
  {
    image: "/assets/love-wedding.jpg",
    text: "أصوات تدوم للأبد",
    description: "ذكريات تسمعونها معاً بعد عشرات السنين",
  },
  {
    image: "/assets/booth-hero-photo.webp",
    text: "ضحكات من القلب",
    description: "عفوية وصدق ضيوفكم وأصحابكم المقربين",
  },
  {
    image: "/assets/landing-booth.jpeg",
    text: "دعوات وبركات الأهل",
    description: "صوت الجدة والوالدين محفوظ ككنز عائلي",
  },
  {
    image: "/assets/screens-booth.jpeg",
    text: "مشاعر حية بلا تكلف",
    description: "٣٠ ثانية من الإحساس تدوم عمراً كاملاً",
  },
];

export const WhyChooseUsSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % GALLERY_ITEMS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const accordionItems = [
    {
      icon: FaMicrophoneAlt,
      title: "مشاعر عفوية صادقة بدون تكلف",
      summary: "عكس التوقيعات التقليدية التي تُنسى في الأدراج.",
      content:
        "في دفاتر الضيوف الورقية، يكتفي الناس بكتابة جمل مكررة مثل 'ألف مبروك وبالرفاء والبنين'. ولكن عند رفع سماعة الهاتف العتيق وسماع صوت العروسين في الرسالة الترحيبية، ينطلق الضيوف في سرد ذكريات طفولة، وضحكات لا تنتهي، ومشاعر صادقة تخرج من القلب بلا تردد.",
    },
    {
      icon: FaUserTie,
      title: "مضيف وممثل خاص من أثر طوال الحفل",
      summary: "فريقنا متواجد بجانب الهاتف لمساعدة ضيوفكم.",
      content:
        "لن تقلقوا بشأن كيفية استخدام الضيوف للهاتف. يتواجد ممثل أنيق ومحترف من فريق 'أثر' بجانب الركن طوال ساعات الحفل، يستقبل المعازيم بابتسامة، ويشرح الفكرة للأقارب وكبار السن، ويضمن أن كل تسجيل يتم بأعلى جودة وسلاسة.",
    },
    {
      icon: FaSlidersH,
      title: "هندسة صوتية احترافية وفلترة للضوضاء",
      summary: "عزل الضوضاء وصدى الموسيقى مع الحفاظ على دفء ورنة الهاتف.",
      content:
        "في استوديو أثر، يخضع كل تسجيل صوتي لعملية تنقية صوتية متقدمة بأيدي مهندسي صوت محترفين. نزيل صدى القاعة وضوضاء الموسيقى الخلفية مع الحفاظ الكامل على الرنة الكلاسيكية الدافئة التي تمنح الهاتف العتيق سحره الخاص.",
    },
    {
      icon: FaCrown,
      title: "ركن كلاسيكي وديكور يزين قاعة الفرح",
      summary: "قطعة فنية متكاملة تنسجم مع أرقى تصاميم الأفراح.",
      content:
        "ركن أثر ليس مجرد هاتف، بل محطة جمالية متكاملة تتضمن هواتف كلاسيكية عاجية، مفارش دانتيل عتيقة، شمعدانات مضيئة، ولافتات ترحيبية أنيقة تحمل أسماء العروسين ومصممة لتليق بديكور حفل الزفاف الفاخر.",
    },
    {
      icon: FaCloudDownloadAlt,
      title: "خزانة سحابية مشفرة وتحميل بجودة استوديو",
      summary: "استمعوا لذكرياتكم في أي وقت ومن أي جهاز حول العالم.",
      content:
        "تحفظ جميع المقاطع الصوتية في خزانة سحابية مشفرة وآمنة تماماً خاصة بكم لمدة عام كامل. يمكنكم الاستماع للتسجيلات في شهر العسل، ومشاركتها مع العائلة والأصدقاء عبر واتساب، وتحميل الألبوم الصوتي كاملاً بأعلى نقاء.",
    },
  ];

  return (
    <Box
      as="section"
      id="why-us"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-secondary)"
      position="relative"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="1280px" mx="auto">
        {/* Section Header */}
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 12, md: 16 }}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            bg="rgba(255, 255, 255, 0.85)"
            color="var(--athar-maroon)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="0.82rem"
            fontWeight="700"
            letterSpacing="0.08em"
            mb={2}
          >
            تَمَيُّـــز تَجْرِبَـــة أَثَـــر
          </Badge>
          <SplitText
            text="ليه تختار أثر في فرحك؟"
            delay={50}
            splitType="words"
            animation="fadeUp"
            once={false}
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              fontWeight: 800,
              color: "var(--athar-text-title)",
              lineHeight: 1.25,
              marginBottom: "0.5rem",
            }}
          />
          <SplitText
            text="تجربة سمعية وبصرية صُممت لتخليد أصدق المشاعر وتمنح ليلتكم لمسة فخامة لا تُنسى."
            delay={25}
            splitType="words"
            animation="fadeUp"
            once={false}
            style={{
              fontSize: "clamp(0.98rem, 1.4vw, 1.12rem)",
              color: "var(--athar-text-muted)",
              maxWidth: "640px",
              marginTop: "4px",
              justifyContent: "center",
            }}
          />
        </Flex>

        {/* 2-Column Grid: Sticky Showcase & Accordion */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1.05fr 1.15fr" }}
          gap={{ base: 10, lg: 16 }}
          alignItems="start"
        >
          {/* Interactive Luxury Photo Showcase Column - Sticky on Desktop lg */}
          <Box
            position={{ base: "relative", lg: "sticky" }}
            top={{ base: "auto", lg: "110px" }}
            alignSelf="start"
            h={{ base: "380px", sm: "460px", lg: "520px" }}
            w="100%"
            borderRadius="30px"
            overflow="hidden"
            bg="rgba(255, 255, 255, 0.98)"
            boxShadow="0 25px 60px -15px rgba(107, 29, 40, 0.18)"
            border="1px solid rgba(212, 175, 55, 0.35)"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Active Photograph */}
            <Box position="relative" w="100%" h="100%" overflow="hidden">
              {GALLERY_ITEMS.map((item, idx) => (
                <Box
                  key={idx}
                  position="absolute"
                  inset="0"
                  opacity={activePhoto === idx ? 1 : 0}
                  transform={activePhoto === idx ? "scale(1.02)" : "scale(1)"}
                  transition="opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
                  pointerEvents={activePhoto === idx ? "auto" : "none"}
                >
                  <Image
                    src={item.image}
                    alt={item.text}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    filter="brightness(0.95) contrast(1.03)"
                  />
                  {/* Subtle Dark Bottom Scrim for Caption Readability */}
                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(to top, rgba(35, 31, 32, 0.85) 0%, rgba(35, 31, 32, 0.25) 45%, transparent 70%)"
                  />
                </Box>
              ))}

              {/* Top Status Badge */}
              <Flex
                position="absolute"
                top="16px"
                right="16px"
                left="16px"
                justify="space-between"
                align="center"
                zIndex="10"
              >
                <Badge
                  bg="rgba(255, 255, 255, 0.95)"
                  color="var(--athar-maroon)"
                  px={3.5}
                  py={1.5}
                  borderRadius="full"
                  fontSize="0.8rem"
                  fontWeight="800"
                  boxShadow="0 4px 15px rgba(0, 0, 0, 0.1)"
                  border="1px solid rgba(212, 175, 55, 0.4)"
                >
                  ✦ ركن هاتف أثر في الفرح
                </Badge>

                {/* Progress Indicators */}
                <HStack gap={1.5} bg="rgba(0, 0, 0, 0.4)" px={3} py={1.5} borderRadius="full" backdropFilter="blur(8px)">
                  {GALLERY_ITEMS.map((_, i) => (
                    <Box
                      key={i}
                      as="button"
                      onClick={() => setActivePhoto(i)}
                      w={activePhoto === i ? "20px" : "6px"}
                      h="6px"
                      borderRadius="full"
                      bg={activePhoto === i ? "#D4AF37" : "rgba(255, 255, 255, 0.5)"}
                      transition="all 0.3s ease"
                      border="none"
                      cursor="pointer"
                      aria-label={`الصورة ${i + 1}`}
                    />
                  ))}
                </HStack>
              </Flex>

              {/* Bottom Caption Card */}
              <Box
                position="absolute"
                bottom="16px"
                right="16px"
                left="16px"
                p={{ base: 4, sm: 5 }}
                borderRadius="20px"
                bg="rgba(255, 255, 255, 0.94)"
                backdropFilter="blur(16px)"
                border="1px solid rgba(212, 175, 55, 0.35)"
                boxShadow="0 10px 30px rgba(0, 0, 0, 0.15)"
                zIndex="10"
              >
                <Flex justify="space-between" align="center" mb={1}>
                  <Text
                    fontFamily="var(--font-arabic-display)"
                    fontSize={{ base: "1.2rem", sm: "1.35rem" }}
                    fontWeight="800"
                    color="var(--athar-text-title)"
                  >
                    {GALLERY_ITEMS[activePhoto].text}
                  </Text>
                  <Text fontSize="0.8rem" fontWeight="700" color="var(--athar-maroon)">
                    {activePhoto + 1} / {GALLERY_ITEMS.length}
                  </Text>
                </Flex>
                <Text fontSize="0.88rem" color="var(--athar-text-muted)" lineHeight="1.5">
                  {GALLERY_ITEMS[activePhoto].description}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Accordion Column */}
          <Flex direction="column" gap={4}>
            {accordionItems.map((item, index) => {
              const isOpen = openIndex === index;
              const IconComp = item.icon;
              return (
                <Box
                  key={index}
                  bg="rgba(255, 255, 255, 0.94)"
                  borderRadius="20px"
                  border="1px solid"
                  borderColor={isOpen ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
                  p={{ base: 5, md: 6 }}
                  boxShadow={
                    isOpen
                      ? "0 14px 30px -10px rgba(107, 29, 40, 0.15)"
                      : "0 4px 15px rgba(0, 0, 0, 0.02)"
                  }
                  transition="all 0.3s ease"
                >
                  <HStack
                    as="button"
                    w="100%"
                    justify="space-between"
                    align="center"
                    textAlign="right"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    cursor="pointer"
                    bg="transparent"
                    border="none"
                    outline="none"
                    gap={4}
                  >
                    <HStack gap={4} align="center">
                      <Box
                        p={3}
                        borderRadius="14px"
                        bg={isOpen ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.06)"}
                        color={isOpen ? "#FFFFFF" : "var(--athar-maroon)"}
                        fontSize="1.15rem"
                        transition="all 0.3s ease"
                      >
                        <IconComp />
                      </Box>
                      <Box>
                        <Text
                          fontFamily="var(--font-arabic-display)"
                          fontSize={{ base: "1.15rem", md: "1.28rem" }}
                          fontWeight="700"
                          color="var(--athar-text-title)"
                        >
                          {item.title}
                        </Text>
                        <Text
                          fontSize="0.88rem"
                          color="var(--athar-text-muted)"
                          display={{ base: "none", sm: "block" }}
                          mt={0.5}
                        >
                          {item.summary}
                        </Text>
                      </Box>
                    </HStack>

                    <Box
                      color="var(--athar-maroon)"
                      fontSize="1rem"
                      transform={isOpen ? "rotate(180deg)" : "rotate(0)"}
                      transition="transform 0.3s ease"
                    >
                      <FaChevronDown />
                    </Box>
                  </HStack>

                  {/* Accordion Expandable Content */}
                  {isOpen && (
                    <Box
                      pt={4}
                      mt={3}
                      borderTop="1px solid rgba(107, 29, 40, 0.08)"
                      fontSize={{ base: "0.95rem", md: "1rem" }}
                      color="var(--athar-text-body)"
                      lineHeight="1.8"
                    >
                      {item.content}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Flex>
        </Grid>

        {/* POETIC GHAZAL INTERLUDE UNDER SECTION 4 (BlurText) */}
        <Box
          mt={{ base: 16, md: 24 }}
          pt={{ base: 10, md: 14 }}
          borderTop="1px solid rgba(212, 175, 55, 0.35)"
          textAlign="center"
          position="relative"
        >
          {/* Classical Arabic Verse via BlurText */}
          <Box dir="rtl" mb={4}>
            <BlurText
              text="صوتُكِ رَوْضٌ إذا ما نَسيمُهُ هَبَّ ، انْجَلَتْ عَن فُؤادي كُلُّ أشْجانِهِ"
              delay={80}
              direction="bottom"
              className="font-poetic"
              paragraphStyles={{
                fontSize: "clamp(1.7rem, 3.6vw, 2.7rem)",
                fontWeight: 700,
                color: "var(--athar-maroon-dark)",
                lineHeight: 1.7,
                justifyContent: "center",
              }}
            />
          </Box>

          <Box maxW="700px" mx="auto">
            <Text
              fontFamily="var(--font-arabic-display)"
              fontSize={{ base: "1.05rem", md: "1.25rem" }}
              fontStyle="italic"
              color="var(--athar-text-muted)"
              lineHeight="1.7"
            >
              "صوت من نحب ... بستان يمحو كل هم ويبعث في الروح سكينة لا تنتهي."
            </Text>
          </Box>

          {/* Decorative Gold Flourish */}
          <Flex justify="center" align="center" gap={3} mt={4}>
            <Box w="50px" h="1px" bg="#D4AF37" />
            <Text color="#D4AF37" fontSize="1.2rem">❦</Text>
            <Box w="50px" h="1px" bg="#D4AF37" />
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
