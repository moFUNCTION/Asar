import React, { useState } from "react";
import { Box, SimpleGrid, Flex, Text, HStack, Button, Badge } from "@chakra-ui/react";
import {
  FaClock,
  FaBolt,
  FaSignature,
  FaPaintBrush,
  FaWhatsapp,
  FaCheck,
  FaPlus,
  FaCalendarCheck,
} from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

interface AddonItem {
  id: string;
  icon: React.ComponentType;
  title: string;
  price: string;
  numericPrice: number;
  desc: string;
  badge: string;
}

export const AddonsSection: React.FC = () => {
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  const addons: AddonItem[] = [
    {
      id: "addon-extra-hour-first",
      icon: FaClock,
      title: "ساعة إضافية أولى",
      price: "1,500 ج.م",
      numericPrice: 1500,
      desc: "تمديد تغطية هاتف أثر للاحتفال الممتد حتى وقت متأخر.",
      badge: "تمديد شائع",
    },
    {
      id: "addon-extra-hour-next",
      icon: FaClock,
      title: "كل ساعة إضافية تالية",
      price: "500 ج.م / ساعة",
      numericPrice: 500,
      desc: "مرونة كاملة لإضافة ساعات متتالية بعد الساعة الأولى بسعر مخفض.",
      badge: "مرن واقتصادي",
    },
    {
      id: "addon-express-delivery",
      icon: FaBolt,
      title: "تسليم فوري سريع",
      price: "500 ج.م",
      numericPrice: 500,
      desc: "استلام جميع التسجيلات الصوتية المعالجة خلال ٤٨ ساعة فقط من الفرح.",
      badge: "تسليم فوري",
    },
    {
      id: "addon-calligraphy-sign",
      icon: FaSignature,
      title: "لافتة ترحيبية بخط يدوي مخصص",
      price: "500 ج.م",
      numericPrice: 500,
      desc: "لافتة أكريليك أو خشبية راقية بأسماء العروسين وتاريخ المناسبة للذكرى.",
      badge: "تذكار خاص",
    },
    {
      id: "addon-bespoke-decor",
      icon: FaPaintBrush,
      title: "تنسيق ديكور وزهور مخصص",
      price: "حسب الطلب",
      numericPrice: 0,
      desc: "تنسيق خاص بالتعاون مع مصمم ديكور الفرح مع إضاءات نيون وزهور.",
      badge: "تصميم ملكي خاص",
    },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) => {
      const isSelected = prev.includes(id);
      const updated = isSelected ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("asar_preselected_addons", JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const selectedCount = selectedAddonIds.length;
  const addonsTotalSum = selectedAddonIds.reduce((sum, id) => {
    const matched = addons.find((a) => a.id === id);
    return sum + (matched ? matched.numericPrice : 0);
  }, 0);

  const handleScrollToBooking = () => {
    const packagesEl = document.getElementById("packages");
    if (packagesEl) {
      packagesEl.scrollIntoView({ behavior: "smooth" });
    }
  };

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
          {/* Section Header */}
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
              text="أضف لمسات مخصصة لتصنع شعوراً أكبر وأكثر تميزاً في يومكم. اضغط على أي إضافة لاختيارها وحساب السعر فورياً."
              delay={25}
              splitType="words"
              animation="fadeUp"
              once={false}
              style={{
                fontSize: "1.05rem",
                color: "var(--athar-text-muted)",
                marginTop: "4px",
                justifyContent: "center",
                maxWidth: "680px",
              }}
            />
          </Flex>

          {/* Interactive Add-ons Cards Grid */}
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6} mb={8}>
            {addons.map((addon) => {
              const IconComp = addon.icon;
              const isSelected = selectedAddonIds.includes(addon.id);

              return (
                <Box
                  key={addon.id}
                  onClick={() => toggleAddon(addon.id)}
                  cursor="pointer"
                  p={6}
                  bg={isSelected ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.94)"}
                  borderRadius="24px"
                  border="2px solid"
                  borderColor={
                    isSelected ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"
                  }
                  boxShadow={
                    isSelected
                      ? "0 16px 36px -10px rgba(107, 29, 40, 0.22), 0 0 0 1px var(--athar-maroon)"
                      : "0 8px 24px -10px rgba(107, 29, 40, 0.06)"
                  }
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                  position="relative"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 18px 40px -12px rgba(107, 29, 40, 0.18)",
                    borderColor: isSelected ? "var(--athar-maroon)" : "rgba(212, 175, 55, 0.6)",
                  }}
                >
                  {/* Selection Check Indicator Badge */}
                  <Box
                    position="absolute"
                    top="16px"
                    left="16px"
                    w="26px"
                    h="26px"
                    borderRadius="full"
                    border="2px solid"
                    borderColor={isSelected ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.2)"}
                    bg={isSelected ? "var(--athar-maroon)" : "transparent"}
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="0.75rem"
                    transition="all 0.2s ease"
                  >
                    {isSelected ? <FaCheck /> : <FaPlus color="rgba(107, 29, 40, 0.3)" size={10} />}
                  </Box>

                  <Box>
                    <Flex justify="space-between" align="center" mb={4} pr={1}>
                      <Box
                        p={3}
                        borderRadius="14px"
                        bg={isSelected ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
                        color={isSelected ? "white" : "var(--athar-maroon)"}
                        fontSize="1.15rem"
                        transition="all 0.2s ease"
                      >
                        <IconComp />
                      </Box>
                      <Badge
                        bg={isSelected ? "rgba(107, 29, 40, 0.12)" : "rgba(212, 175, 55, 0.18)"}
                        color="var(--athar-maroon)"
                        fontSize="0.78rem"
                        px={2.8}
                        py={1}
                        borderRadius="full"
                        fontWeight="700"
                        ml={8}
                      >
                        {isSelected ? "تم الاختيار ✓" : addon.badge}
                      </Badge>
                    </Flex>

                    <Text
                      fontFamily="var(--font-arabic-display)"
                      fontSize="1.25rem"
                      fontWeight="800"
                      color="var(--athar-text-title)"
                      mb={1.5}
                    >
                      {addon.title}
                    </Text>
                    <Text fontSize="0.9rem" color="var(--athar-text-muted)" lineHeight="1.6" mb={4}>
                      {addon.desc}
                    </Text>
                  </Box>

                  <HStack
                    justify="space-between"
                    align="baseline"
                    pt={3}
                    borderTop="1px solid rgba(107, 29, 40, 0.06)"
                  >
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

          {/* Live Interactive Price Update Summary Bar */}
          {selectedCount > 0 && (
            <Box
              mb={8}
              p={5}
              borderRadius="20px"
              bg="linear-gradient(135deg, #FAF4E6 0%, #FFFFFF 100%)"
              border="2px solid #D4AF37"
              boxShadow="0 14px 35px -10px rgba(212, 175, 55, 0.35)"
              display="flex"
              flexDirection={{ base: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              gap={4}
            >
              <HStack gap={3} flexWrap="wrap">
                <Box
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  bg="var(--athar-maroon)"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="0.95rem"
                >
                  <FaCalendarCheck />
                </Box>
                <Box>
                  <Text fontWeight="800" fontSize="1.05rem" color="var(--athar-text-title)">
                    تم تحديد {selectedCount} إضافات خاصة
                  </Text>
                  <Text fontSize="0.88rem" color="var(--athar-text-muted)">
                    سيتم تضمين هذه الإضافات تلقائياً في خطوة حجز الباقة
                  </Text>
                </Box>
              </HStack>

              <HStack gap={4} flexWrap="wrap" justify={{ base: "center", sm: "flex-end" }}>
                <Box textAlign="left">
                  <Text fontSize="0.78rem" color="var(--athar-text-muted)" fontWeight="700">
                    إجمالي الإضافات:
                  </Text>
                  <Text
                    fontFamily="var(--font-arabic-body)"
                    fontSize="1.4rem"
                    fontWeight="900"
                    color="var(--athar-maroon)"
                    dir="ltr"
                  >
                    +{addonsTotalSum.toLocaleString("en-US")} ج.م
                  </Text>
                </Box>

                <Button
                  onClick={handleScrollToBooking}
                  className="btn-athar-primary"
                  py={5}
                  px={6}
                  borderRadius="14px"
                  fontWeight="800"
                  fontSize="0.95rem"
                >
                  متابعة الحجز مع الإضافات
                </Button>

                <Button
                  onClick={() => setSelectedAddonIds([])}
                  variant="outline"
                  size="sm"
                  borderRadius="12px"
                  color="var(--athar-text-muted)"
                  borderColor="rgba(0,0,0,0.15)"
                >
                  إلغاء التحديد
                </Button>
              </HStack>
            </Box>
          )}

          {/* WhatsApp Concierge Banner */}
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

            <a
              href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A3%D8%AB%D8%B1%D8%8C%20%D8%AD%D8%A7%D8%A8%D8%A8%20%D8%A3%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%20%D8%B9%D9%86%20%D8%AA%D9%86%D8%B3%D9%8A%D9%82%20%D8%AE%D8%A7%D8%B5%20%D9%84%D9%84%D9%81%D8%B1%D8%AD."
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
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
            </a>
          </Box>
        </FadeContent>
      </Box>
    </Box>
  );
};

export default AddonsSection;
