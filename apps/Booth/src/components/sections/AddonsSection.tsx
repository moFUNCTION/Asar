import React from "react";
import { Box, SimpleGrid, Flex, Text, HStack, Button, Badge } from "@chakra-ui/react";
import { FaClock, FaBolt, FaSignature, FaPaintBrush, FaWhatsapp } from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

export const AddonsSection: React.FC = () => {
  const addons = [
    {
      icon: FaClock,
      title: "ساعة إضافية أولى",
      price: "1,500 ج.م",
      desc: "تمديد تغطية هاتف أثر للاحتفال الممتد حتى وقت متأخر.",
      badge: "تمديد شائع",
    },
    {
      icon: FaClock,
      title: "كل ساعة إضافية تالية",
      price: "500 ج.م / ساعة",
      desc: "مرونة كاملة لإضافة ساعات متتالية بعد الساعة الأولى بسعر مخفض.",
      badge: "مرن واقتصادي",
    },
    {
      icon: FaBolt,
      title: "تسليم فوري سريع",
      price: "500 ج.م",
      desc: "استلام جميع التسجيلات الصوتية المعالجة خلال ٤٨ ساعة فقط من الفرح.",
      badge: "تسليم فوري",
    },
    {
      icon: FaSignature,
      title: "لافتة ترحيبية بخط يدوي مخصص",
      price: "500 ج.م",
      desc: "لافتة أكريليك أو خشبية راقية بأسماء العروسين وتاريخ المناسبة للذكرى.",
      badge: "تذكار خاص",
    },
    {
      icon: FaPaintBrush,
      title: "تنسيق ديكور وزهور مخصص",
      price: "حسب الطلب",
      desc: "تنسيق خاص بالتعاون مع مصمم ديكور الفرح مع إضاءات نيون وزهور.",
      badge: "تصميم ملكي خاص",
    },
  ];

  return (
    <Box
      as="section"
      id="addons"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-secondary)"
      position="relative"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          <Flex direction="column" align="center" textAlign="center" mb={{ base: 10, md: 14 }}>
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
              تَفَاصِيـــل إِضَافِيَّـــة
            </Badge>
            <SplitText
              text="اصنع لمستك الخاصة"
              delay={50}
              splitType="words"
              animation="fadeUp"
              once={false}
              className="font-arabic-display"
              style={{
                fontSize: "clamp(2.1rem, 3.8vw, 3.2rem)",
                fontWeight: 800,
                color: "var(--athar-text-title)",
                marginBottom: "0.5rem",
              }}
            />
            <SplitText
              text="أضف لمسات مخصصة لتصنع شعوراً أكبر وأكثر تميزاً في يومكم."
              delay={25}
              splitType="words"
              animation="fadeUp"
              once={false}
              style={{
                fontSize: "1.05rem",
                color: "var(--athar-text-muted)",
                marginTop: "4px",
                justifyContent: "center",
              }}
            />
          </Flex>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6} mb={10}>
          {addons.map((addon, index) => {
            const IconComp = addon.icon;
            return (
              <Box
                key={index}
                p={6}
                bg="rgba(255, 255, 255, 0.94)"
                borderRadius="24px"
                border="1px solid rgba(107, 29, 40, 0.08)"
                boxShadow="0 8px 24px -10px rgba(107, 29, 40, 0.06)"
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "0 16px 36px -12px rgba(107, 29, 40, 0.14)",
                  borderColor: "rgba(212, 175, 55, 0.4)",
                }}
              >
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Box
                      p={3}
                      borderRadius="14px"
                      bg="rgba(107, 29, 40, 0.08)"
                      color="var(--athar-maroon)"
                      fontSize="1.15rem"
                    >
                      <IconComp />
                    </Box>
                    <Badge
                      bg="rgba(212, 175, 55, 0.18)"
                      color="var(--athar-maroon)"
                      fontSize="0.78rem"
                      px={2.8}
                      py={1}
                      borderRadius="full"
                      fontWeight="700"
                    >
                      {addon.badge}
                    </Badge>
                  </Flex>

                  <Text
                    fontFamily="var(--font-arabic-display)"
                    fontSize="1.25rem"
                    fontWeight="700"
                    color="var(--athar-text-title)"
                    mb={1.5}
                  >
                    {addon.title}
                  </Text>
                  <Text fontSize="0.9rem" color="var(--athar-text-muted)" lineHeight="1.6" mb={4}>
                    {addon.desc}
                  </Text>
                </Box>

                <HStack justify="space-between" align="baseline" pt={3} borderTop="1px solid rgba(107, 29, 40, 0.06)">
                  <Text fontSize="0.85rem" color="var(--athar-text-muted)" fontWeight="600">
                    السعر
                  </Text>
                  <Text
                    fontFamily="var(--font-arabic-body)"
                    fontSize="1.3rem"
                    fontWeight="800"
                    color="var(--athar-maroon)"
                    dir="ltr"
                  >
                    {addon.price}
                  </Text>
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* WhatsApp Concierge Banner from Screen 04 */}
        <Box
          p={{ base: 6, md: 8 }}
          bg="rgba(255, 255, 255, 0.96)"
          borderRadius="28px"
          border="1px dashed rgba(212, 175, 55, 0.6)"
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={6}
          boxShadow="0 12px 30px -10px rgba(107, 29, 40, 0.08)"
        >
          <Box textAlign={{ base: "center", md: "right" }}>
            <Text
              fontFamily="var(--font-arabic-display)"
              fontSize={{ base: "1.4rem", md: "1.65rem" }}
              fontWeight="800"
              color="var(--athar-text-title)"
              mb={1}
            >
              محتاج حاجة خاصة؟
            </Text>
            <Text fontSize="1rem" color="var(--athar-text-muted)">
              يسعدنا جداً تصميم ركن مخصص يتماشى مع ألوان وثيم ديكور فرحكم.
            </Text>
          </Box>

          <Button
            as="a"
            href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A3%D8%AB%D8%B1%D8%8C%20%D8%AD%D8%A7%D8%A8%D8%A8%20%D8%A3%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%20%D8%B9%D9%86%20%D8%AA%D9%86%D8%B3%D9%8A%D9%82%20%D8%AE%D8%A7%D8%B5%20%D9%84%D9%84%D9%81%D8%B1%D8%AD."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-athar-primary"
            py={6}
            px={8}
            fontSize="1.02rem"
            fontWeight="800"
            flexShrink={0}
          >
            <FaWhatsapp style={{ fontSize: "1.25rem", marginLeft: "8px" }} />
            تحدث معنا عبر واتساب
          </Button>
        </Box>
      </FadeContent>
    </Box>
  </Box>
);
};
