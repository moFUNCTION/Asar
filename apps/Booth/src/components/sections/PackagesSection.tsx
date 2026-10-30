import React from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge } from "@chakra-ui/react";
import { FaCheck, FaArrowLeft, FaStar, FaCrown, FaClock, FaShieldAlt } from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

interface PackagesSectionProps {
  onSelectPackage: (pkgName: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({ onSelectPackage }) => {
  return (
    <Box
      as="section"
      id="packages"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-primary)"
      position="relative"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
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
            باقات وعروض أثر
          </Badge>
          <SplitText
            text="صُممت بعناية لتناسب يومكم الاستثنائي"
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
            text="كل باقة تقدم تجربة ضيافة ملكية متكاملة لتوثيق صوت أحبائكم بأعلى معايير النقاء."
            delay={25}
            splitType="words"
            animation="fadeUp"
            once={false}
            style={{
              fontSize: "clamp(0.98rem, 1.4vw, 1.12rem)",
              color: "var(--athar-text-muted)",
              maxWidth: "600px",
              marginTop: "4px",
              justifyContent: "center",
            }}
          />
        </Flex>

        {/* Packages Grid */}
        <FadeContent blur={true} duration={1600} threshold={0.1} once={false}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 10 }} alignItems="stretch">
            
            {/* PACKAGE 1: لحظة أثر (ATHAR MOMENT) - Classic Royal Luxury */}
            <Box
              position="relative"
              bg="rgba(255, 255, 255, 0.98)"
              borderRadius="32px"
              p={{ base: 6, sm: 8, md: 10 }}
              border="2px solid var(--athar-maroon)"
              boxShadow="0 20px 50px -15px rgba(107, 29, 40, 0.16)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{
                transform: "translateY(-6px)",
                boxShadow: "0 30px 70px -15px rgba(107, 29, 40, 0.24)",
                borderColor: "#D4AF37",
              }}
            >
              <Box>
                {/* Header Badges */}
                <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={2}>
                  <HStack
                    bg="var(--athar-maroon)"
                    color="white"
                    px={4}
                    py={1.5}
                    borderRadius="full"
                    fontSize="0.84rem"
                    fontWeight="800"
                    boxShadow="0 4px 14px rgba(107, 29, 40, 0.28)"
                    gap={2}
                  >
                    <FaStar style={{ color: "#D4AF37", fontSize: "0.85rem" }} />
                    <Text>الباقة الأكثر طلباً للأفراح</Text>
                  </HStack>

                  <Badge
                    bg="rgba(212, 175, 55, 0.18)"
                    color="var(--athar-maroon-dark)"
                    border="1px solid rgba(212, 175, 55, 0.4)"
                    px={3.5}
                    py={1}
                    borderRadius="full"
                    fontWeight="700"
                    fontSize="0.8rem"
                  >
                    عرض الإطلاق
                  </Badge>
                </Flex>

                {/* Integrated Editorial Photo Banner */}
                <Box
                  position="relative"
                  h="200px"
                  borderRadius="22px"
                  overflow="hidden"
                  mb={6}
                  boxShadow="inset 0 0 30px rgba(0,0,0,0.12)"
                >
                  <Box
                    as="img"
                    src="/assets/booth-hero-photo.webp"
                    alt="باقة لحظة أثر"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.6s ease"
                    _hover={{ transform: "scale(1.04)" }}
                  />
                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(to top, rgba(35, 31, 32, 0.8) 0%, rgba(35, 31, 32, 0.15) 50%, transparent 100%)"
                  />
                  {/* Duration Tag */}
                  <HStack
                    position="absolute"
                    bottom="14px"
                    right="14px"
                    bg="rgba(255, 255, 255, 0.94)"
                    color="var(--athar-maroon)"
                    px={3.5}
                    py={1.5}
                    borderRadius="full"
                    fontSize="0.82rem"
                    fontWeight="800"
                    backdropFilter="blur(8px)"
                    gap={1.5}
                  >
                    <FaClock fontSize="0.78rem" />
                    <Text>٣ ساعات تغطية حية</Text>
                  </HStack>
                </Box>

                {/* Package Titles */}
                <Flex justify="space-between" align="baseline" mb={2} flexWrap="wrap" gap={1}>
                  <Text
                    fontFamily="var(--font-arabic-display)"
                    fontSize={{ base: "1.9rem", md: "2.3rem" }}
                    fontWeight="800"
                    color="var(--athar-text-title)"
                  >
                    لحظة أثر
                  </Text>
                  <Badge
                    bg="rgba(107, 29, 40, 0.08)"
                    color="var(--athar-maroon)"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontFamily="var(--font-arabic-display)"
                    fontSize="0.95rem"
                    fontWeight="700"
                  >
                    الباقة الكلاسيكية
                  </Badge>
                </Flex>

                {/* Price Display */}
                <Box mb={6} pb={5} borderBottom="1px solid rgba(107, 29, 40, 0.1)">
                  <HStack align="baseline" gap={3} dir="rtl" mb={1}>
                    <Text
                      fontFamily="var(--font-arabic-body)"
                      fontSize={{ base: "3rem", md: "3.6rem" }}
                      fontWeight="900"
                      color="var(--athar-maroon)"
                      dir="ltr"
                      lineHeight="1"
                    >
                      5,500
                    </Text>
                    <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-text-muted)">
                      جنيه مصري
                    </Text>
                  </HStack>
                  <Text fontSize="0.88rem" color="var(--athar-text-muted)" fontWeight="600">
                    شاملة الهاتف العتيق، التوصيل والتركيب، المضيف، وتعديل المقاطع الصوتية
                  </Text>
                </Box>

                {/* Feature Checklist */}
                <Flex direction="column" gap={3.5} mb={8}>
                  {[
                    "٣ ساعات تغطية حية طوال الحفل (عرض الإطلاق)",
                    "هاتف صوتي عتيق وتجهيز ركن كلاسيكي فاخر",
                    "ممثل ومضيف خاص من أثر متواجد لمساعدة الضيوف",
                    "التوصيل والتركيب مشمول مجاناً (الإسكندرية / الساحل / العجمي)",
                    "تعديل وهندسة صوتية احترافية وفلترة لصدى القاعة",
                    "دعوة رقمية صوتية مهداة للعروسين قبل الفرح",
                    "صفحة ذكريات خاصة ومشفرة للاستماع والمشاركة لمدة عام",
                  ].map((feat, i) => (
                    <HStack key={i} align="flex-start" gap={3}>
                      <Flex
                        w="22px"
                        h="22px"
                        borderRadius="full"
                        bg="rgba(107, 29, 40, 0.1)"
                        color="var(--athar-maroon)"
                        align="center"
                        justify="center"
                        fontSize="0.75rem"
                        flexShrink={0}
                        mt="3px"
                      >
                        <FaCheck />
                      </Flex>
                      <Text fontSize="0.95rem" color="var(--athar-text-body)" lineHeight="1.6" fontWeight="500">
                        {feat}
                      </Text>
                    </HStack>
                  ))}
                </Flex>
              </Box>

              {/* Action Button */}
              <Button
                onClick={() => onSelectPackage("لحظة أثر")}
                className="btn-athar-primary"
                w="100%"
                py={6}
                borderRadius="16px"
                fontSize="1.08rem"
                fontWeight="800"
                boxShadow="0 10px 25px -5px rgba(107, 29, 40, 0.35)"
              >
                اختر باقة لحظة أثر <FaArrowLeft style={{ marginRight: "10px" }} />
              </Button>
            </Box>

            {/* PACKAGE 2: حكاية أثر (ATHAR STORY) - Noir Obsidian VIP Luxury */}
            <Box
              position="relative"
              bg="linear-gradient(170deg, #231A1E 0%, #161214 100%)"
              color="#FFFFFF"
              borderRadius="32px"
              p={{ base: 6, sm: 8, md: 10 }}
              border="2px solid #D4AF37"
              boxShadow="0 25px 65px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(212, 175, 55, 0.15)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{
                transform: "translateY(-6px)",
                boxShadow: "0 35px 80px -15px rgba(0, 0, 0, 0.65), 0 0 50px rgba(212, 175, 55, 0.28)",
              }}
            >
              <Box>
                {/* Header Badges */}
                <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={2}>
                  <HStack
                    bg="linear-gradient(135deg, #D4AF37 0%, #AA8222 100%)"
                    color="#171113"
                    px={4}
                    py={1.5}
                    borderRadius="full"
                    fontSize="0.84rem"
                    fontWeight="800"
                    boxShadow="0 4px 16px rgba(212, 175, 55, 0.35)"
                    gap={2}
                  >
                    <FaCrown style={{ color: "#171113", fontSize: "0.85rem" }} />
                    <Text>التجربة الملكية الشاملة</Text>
                  </HStack>

                  <Badge
                    bg="rgba(255, 255, 255, 0.12)"
                    color="#E5C158"
                    border="1px solid rgba(212, 175, 55, 0.4)"
                    px={3.5}
                    py={1}
                    borderRadius="full"
                    fontWeight="700"
                    fontSize="0.8rem"
                  >
                    السهرة كاملة • VIP
                  </Badge>
                </Flex>

                {/* Integrated Editorial Photo Banner */}
                <Box
                  position="relative"
                  h="200px"
                  borderRadius="22px"
                  overflow="hidden"
                  mb={6}
                  border="1px solid rgba(212, 175, 55, 0.3)"
                  boxShadow="inset 0 0 30px rgba(0,0,0,0.5)"
                >
                  <Box
                    as="img"
                    src="/assets/love-wedding.jpg"
                    alt="باقة حكاية أثر الملكية"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    transition="transform 0.6s ease"
                    _hover={{ transform: "scale(1.04)" }}
                  />
                  <Box
                    position="absolute"
                    inset="0"
                    bg="linear-gradient(to top, rgba(22, 18, 20, 0.88) 0%, rgba(22, 18, 20, 0.2) 50%, transparent 100%)"
                  />
                  {/* Duration Tag */}
                  <HStack
                    position="absolute"
                    bottom="14px"
                    right="14px"
                    bg="rgba(22, 18, 20, 0.9)"
                    color="#D4AF37"
                    border="1px solid rgba(212, 175, 55, 0.45)"
                    px={3.5}
                    py={1.5}
                    borderRadius="full"
                    fontSize="0.82rem"
                    fontWeight="800"
                    backdropFilter="blur(8px)"
                    gap={1.5}
                  >
                    <FaClock fontSize="0.78rem" />
                    <Text>٦ ساعات كاملة (طوال السهرة)</Text>
                  </HStack>
                </Box>

                {/* Package Titles */}
                <Flex justify="space-between" align="baseline" mb={2} flexWrap="wrap" gap={1}>
                  <Text
                    fontFamily="var(--font-arabic-display)"
                    fontSize={{ base: "1.9rem", md: "2.3rem" }}
                    fontWeight="800"
                    color="#FFFFFF"
                  >
                    حكاية أثر
                  </Text>
                  <Badge
                    bg="rgba(212, 175, 55, 0.15)"
                    color="#D4AF37"
                    border="1px solid rgba(212, 175, 55, 0.3)"
                    px={3}
                    py={1}
                    borderRadius="md"
                    fontFamily="var(--font-arabic-display)"
                    fontSize="0.95rem"
                    fontWeight="700"
                  >
                    الباقة الشاملة VIP
                  </Badge>
                </Flex>

                {/* Price Display */}
                <Box mb={6} pb={5} borderBottom="1px solid rgba(212, 175, 55, 0.2)">
                  <HStack align="baseline" gap={3} dir="rtl" mb={1}>
                    <Text
                      fontFamily="var(--font-arabic-body)"
                      fontSize={{ base: "3rem", md: "3.6rem" }}
                      fontWeight="900"
                      color="#E5C158"
                      dir="ltr"
                      lineHeight="1"
                    >
                      7,000
                    </Text>
                    <Text fontSize="1.15rem" fontWeight="800" color="rgba(255, 255, 255, 0.7)">
                      جنيه مصري
                    </Text>
                  </HStack>
                  <Text fontSize="0.88rem" color="rgba(255, 255, 255, 0.7)" fontWeight="600">
                    شاملة السهرة كاملة + تجهيز زهور طبيعية + فيديو سينمائي هايلايت مهداة
                  </Text>
                </Box>

                {/* Feature Checklist */}
                <Flex direction="column" gap={3.5} mb={8}>
                  {[
                    "٦ ساعات تغطية كاملة وشاملة طوال السهرة",
                    "تجهيز وديكور VIP فاخر مع تنسيق زهور طبيعية وشموع أنيقة",
                    "كروت QR كود مخصصة ومطبوعة لجميع طاولات المعازيم",
                    "فيديو سينمائي هايلايت ٣٠ ثانية يدمج لقطات الفرح مع الأصوات",
                    "تعديل وهندسة صوتية احترافية وفلترة للضوضاء بأعلى نقاء",
                    "دعوة رقمية صوتية مخصصة مهداة للعروسين",
                    "خزانة سحابية خاصة مع إمكانية تحميل الملفات بجودة Lossless",
                  ].map((feat, i) => (
                    <HStack key={i} align="flex-start" gap={3}>
                      <Flex
                        w="22px"
                        h="22px"
                        borderRadius="full"
                        bg="rgba(212, 175, 55, 0.2)"
                        color="#D4AF37"
                        align="center"
                        justify="center"
                        fontSize="0.75rem"
                        flexShrink={0}
                        mt="3px"
                      >
                        <FaCheck />
                      </Flex>
                      <Text fontSize="0.95rem" color="rgba(255, 255, 255, 0.92)" lineHeight="1.6" fontWeight="500">
                        {feat}
                      </Text>
                    </HStack>
                  ))}
                </Flex>
              </Box>

              {/* Action Button */}
              <Button
                onClick={() => onSelectPackage("حكاية أثر")}
                w="100%"
                py={6}
                borderRadius="16px"
                fontSize="1.08rem"
                fontWeight="800"
                bg="linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #B8860B 100%)"
                color="#171113"
                boxShadow="0 10px 30px -5px rgba(212, 175, 55, 0.4)"
                transition="all 0.3s ease"
                _hover={{
                  bg: "linear-gradient(135deg, #F0D075 0%, #E5C158 50%, #C5A059 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 14px 35px -5px rgba(212, 175, 55, 0.55)",
                }}
              >
                اختر باقة حكاية أثر الملكية <FaArrowLeft style={{ marginRight: "10px" }} />
              </Button>
            </Box>
          </SimpleGrid>
        </FadeContent>

        {/* Reassurance Footer Bar */}
        <Flex
          justify="center"
          align="center"
          gap={3}
          mt={12}
          p={4}
          borderRadius="20px"
          bg="rgba(255, 255, 255, 0.7)"
          border="1px dashed rgba(212, 175, 55, 0.45)"
          maxW="800px"
          mx="auto"
          textAlign="center"
          flexWrap="wrap"
        >
          <Box color="var(--athar-maroon)">
            <FaShieldAlt fontSize="1.1rem" />
          </Box>
          <Text fontSize="0.92rem" color="var(--athar-text-body)" fontWeight="700">
            تأكيد الحجز يتطلب عربوناً بسيطاً لضمان تاريخ ليلتكم • إمكانية تقسيط الدفع على دفعتين • متاح المعاينة في الإسكندرية والقاهرة
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
