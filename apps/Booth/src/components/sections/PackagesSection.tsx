import React from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge } from "@chakra-ui/react";
import {
  FaCheck,
  FaArrowLeft,
  FaStar,
  FaCrown,
  FaClock,
  FaShieldAlt,
  FaMicrophone,
  FaCamera,
  FaFilm,
  FaCloud,
  FaHeadphones,
} from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";
import {
  useBoothBooking,
  parsePlanFeatures,
  parsePlanLimits,
} from "../../hooks/useBoothBooking";
import type { AsarPlan } from "../../hooks/useBoothBooking";

interface PackagesSectionProps {
  onSelectPackage: (pkgName: string) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({ onSelectPackage }) => {
  const { plans } = useBoothBooking();

  const handlePreviewSampleMemory = () => {
    // Navigate smoothly to the sample memory page query parameter
    const url = new URL(window.location.href);
    url.searchParams.set("memory", "mina-and-maryam");
    window.location.href = url.toString();
  };

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

        {/* Dynamic Packages Grid */}
        <FadeContent blur={true} duration={1600} threshold={0.1} once={false}>
          <SimpleGrid
            columns={{ base: 1, lg: plans.length > 2 ? 3 : 2 }}
            gap={{ base: 8, lg: 10 }}
            alignItems="stretch"
          >
            {plans.map((plan: AsarPlan, index: number) => {
              const isNoir = plan.themeVariant === "noir-obsidian";
              const limits = parsePlanLimits(plan);
              const features = parsePlanFeatures(plan);
              const defaultImage = isNoir
                ? "/assets/love-wedding.jpg"
                : "/assets/booth-hero-photo.webp";
              const imageSrc = plan.imageUrl || defaultImage;

              return (
                <Box
                  key={plan.$id || plan.name || index}
                  position="relative"
                  bg={
                    isNoir
                      ? "linear-gradient(170deg, #231A1E 0%, #161214 100%)"
                      : "rgba(255, 255, 255, 0.98)"
                  }
                  color={isNoir ? "#FFFFFF" : "var(--athar-text-body)"}
                  borderRadius="32px"
                  p={{ base: 6, sm: 8, md: 9 }}
                  border={isNoir ? "2px solid #D4AF37" : "2px solid var(--athar-maroon)"}
                  boxShadow={
                    isNoir
                      ? "0 25px 65px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(212, 175, 55, 0.15)"
                      : "0 20px 50px -15px rgba(107, 29, 40, 0.16)"
                  }
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{
                    transform: "translateY(-6px)",
                    boxShadow: isNoir
                      ? "0 35px 80px -15px rgba(0, 0, 0, 0.65), 0 0 50px rgba(212, 175, 55, 0.28)"
                      : "0 30px 70px -15px rgba(107, 29, 40, 0.24)",
                    borderColor: "#D4AF37",
                  }}
                >
                  <Box>
                    {/* Header Badges */}
                    <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={2}>
                      <HStack
                        bg={
                          isNoir
                            ? "linear-gradient(135deg, #D4AF37 0%, #AA8222 100%)"
                            : "var(--athar-maroon)"
                        }
                        color={isNoir ? "#171113" : "white"}
                        px={4}
                        py={1.5}
                        borderRadius="full"
                        fontSize="0.84rem"
                        fontWeight="800"
                        boxShadow={
                          isNoir
                            ? "0 4px 16px rgba(212, 175, 55, 0.35)"
                            : "0 4px 14px rgba(107, 29, 40, 0.28)"
                        }
                        gap={2}
                      >
                        {isNoir ? (
                          <FaCrown style={{ color: "#171113", fontSize: "0.85rem" }} />
                        ) : (
                          <FaStar style={{ color: "#D4AF37", fontSize: "0.85rem" }} />
                        )}
                        <Text>{plan.badge || (isNoir ? "التجربة الملكية الشاملة" : "الباقة الأكثر طلباً")}</Text>
                      </HStack>

                      {plan.subBadge && (
                        <Badge
                          bg={isNoir ? "rgba(255, 255, 255, 0.12)" : "rgba(212, 175, 55, 0.18)"}
                          color={isNoir ? "#E5C158" : "var(--athar-maroon-dark)"}
                          border="1px solid rgba(212, 175, 55, 0.4)"
                          px={3.5}
                          py={1}
                          borderRadius="full"
                          fontWeight="700"
                          fontSize="0.8rem"
                        >
                          {plan.subBadge}
                        </Badge>
                      )}
                    </Flex>

                    {/* Editorial Photo Banner */}
                    <Box
                      position="relative"
                      h="190px"
                      borderRadius="22px"
                      overflow="hidden"
                      mb={5}
                      border={isNoir ? "1px solid rgba(212, 175, 55, 0.3)" : undefined}
                      boxShadow={
                        isNoir
                          ? "inset 0 0 30px rgba(0,0,0,0.5)"
                          : "inset 0 0 30px rgba(0,0,0,0.12)"
                      }
                    >
                      <img
                        src={imageSrc}
                        alt={plan.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.6s ease",
                        }}
                      />
                      <Box
                        position="absolute"
                        inset="0"
                        bg={
                          isNoir
                            ? "linear-gradient(to top, rgba(22, 18, 20, 0.88) 0%, rgba(22, 18, 20, 0.2) 50%, transparent 100%)"
                            : "linear-gradient(to top, rgba(35, 31, 32, 0.8) 0%, rgba(35, 31, 32, 0.15) 50%, transparent 100%)"
                        }
                      />
                      {/* Duration Tag */}
                      <HStack
                        position="absolute"
                        bottom="14px"
                        right="14px"
                        bg={isNoir ? "rgba(22, 18, 20, 0.9)" : "rgba(255, 255, 255, 0.94)"}
                        color={isNoir ? "#D4AF37" : "var(--athar-maroon)"}
                        border={isNoir ? "1px solid rgba(212, 175, 55, 0.45)" : undefined}
                        px={3.5}
                        py={1.5}
                        borderRadius="full"
                        fontSize="0.82rem"
                        fontWeight="800"
                        backdropFilter="blur(8px)"
                        gap={1.5}
                      >
                        <FaClock fontSize="0.78rem" />
                        <Text>
                          {limits.coverageHours
                            ? `${limits.coverageHours} ساعات تغطية حية`
                            : "تغطية ممتدة"}
                        </Text>
                      </HStack>
                    </Box>

                    {/* Package Titles */}
                    <Flex justify="space-between" align="baseline" mb={2} flexWrap="wrap" gap={1}>
                      <Text
                        fontFamily="var(--font-arabic-display)"
                        fontSize={{ base: "1.9rem", md: "2.2rem" }}
                        fontWeight="800"
                        color={isNoir ? "#FFFFFF" : "var(--athar-text-title)"}
                      >
                        {plan.name}
                      </Text>
                      <Badge
                        bg={isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)"}
                        color={isNoir ? "#D4AF37" : "var(--athar-maroon)"}
                        border={isNoir ? "1px solid rgba(212, 175, 55, 0.3)" : undefined}
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontFamily="var(--font-arabic-display)"
                        fontSize="0.95rem"
                        fontWeight="700"
                      >
                        {plan.subtitle || (isNoir ? "VIP" : "كلاسيكية")}
                      </Badge>
                    </Flex>

                    {/* Price Display */}
                    <Box
                      mb={5}
                      pb={4}
                      borderBottom={
                        isNoir
                          ? "1px solid rgba(212, 175, 55, 0.2)"
                          : "1px solid rgba(107, 29, 40, 0.1)"
                      }
                    >
                      <HStack align="baseline" gap={3} dir="rtl" mb={1}>
                        <Text
                          fontFamily="var(--font-arabic-body)"
                          fontSize={{ base: "2.8rem", md: "3.4rem" }}
                          fontWeight="900"
                          color={isNoir ? "#E5C158" : "var(--athar-maroon)"}
                          dir="ltr"
                          lineHeight="1"
                        >
                          {plan.price.toLocaleString("en-US")}
                        </Text>
                        <Text
                          fontSize="1.15rem"
                          fontWeight="800"
                          color={isNoir ? "rgba(255, 255, 255, 0.7)" : "var(--athar-text-muted)"}
                        >
                          {plan.currency || "جنيه مصري"}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="0.86rem"
                        color={isNoir ? "rgba(255, 255, 255, 0.7)" : "var(--athar-text-muted)"}
                        fontWeight="600"
                      >
                        {isNoir
                          ? "شاملة السهرة كاملة + تنسيق زهور + فيديو سينمائي هايلايت مهداة"
                          : "شاملة الهاتف العتيق، التوصيل والتركيب، المضيف، وهندسة المقاطع الصوتية"}
                      </Text>
                    </Box>

                    {/* Plan Quotas Strip */}
                    <Box
                      mb={6}
                      p={3}
                      borderRadius="16px"
                      bg={isNoir ? "rgba(255, 255, 255, 0.05)" : "rgba(107, 29, 40, 0.03)"}
                      border={
                        isNoir
                          ? "1px solid rgba(212, 175, 55, 0.2)"
                          : "1px solid rgba(107, 29, 40, 0.08)"
                      }
                    >
                      <Text
                        fontSize="0.75rem"
                        fontWeight="800"
                        letterSpacing="0.05em"
                        color={isNoir ? "#D4AF37" : "var(--athar-maroon)"}
                        mb={2}
                      >
                        حدود ومميزات الباقة الرقمية:
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        <HStack
                          bg={isNoir ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)"}
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          fontSize="0.76rem"
                          fontWeight="700"
                          color={isNoir ? "#F0D075" : "var(--athar-text-title)"}
                          border="1px solid rgba(212, 175, 55, 0.25)"
                        >
                          <FaMicrophone size={11} color="#D4AF37" />
                          <Text>
                            {limits.maxVoiceRecords === -1
                              ? "تسجيلات غير محدودة"
                              : `${limits.maxVoiceRecords} رسالة صوتية`}
                          </Text>
                        </HStack>

                        <HStack
                          bg={isNoir ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)"}
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          fontSize="0.76rem"
                          fontWeight="700"
                          color={isNoir ? "#F0D075" : "var(--athar-text-title)"}
                          border="1px solid rgba(212, 175, 55, 0.25)"
                        >
                          <FaCamera size={11} color="#D4AF37" />
                          <Text>
                            {limits.maxGalleryPhotos === -1
                              ? "صور غير محدودة"
                              : `${limits.maxGalleryPhotos} صورة`}
                          </Text>
                        </HStack>

                        {limits.hasVideoHighlight && (
                          <HStack
                            bg={isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)"}
                            px={2.5}
                            py={1}
                            borderRadius="full"
                            fontSize="0.76rem"
                            fontWeight="800"
                            color={isNoir ? "#E5C158" : "var(--athar-maroon)"}
                            border="1px solid rgba(212, 175, 55, 0.4)"
                          >
                            <FaFilm size={11} />
                            <Text>فيديو هايلايت ٣٠ ث</Text>
                          </HStack>
                        )}

                        <HStack
                          bg={isNoir ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)"}
                          px={2.5}
                          py={1}
                          borderRadius="full"
                          fontSize="0.76rem"
                          fontWeight="700"
                          color={isNoir ? "#F0D075" : "var(--athar-text-title)"}
                          border="1px solid rgba(212, 175, 55, 0.25)"
                        >
                          <FaCloud size={11} color="#D4AF37" />
                          <Text>
                            {Math.round((limits.hostingDurationDays || 365) / 365)} سنة خزانة سحابية
                          </Text>
                        </HStack>
                      </Flex>
                    </Box>

                    {/* Feature Checklist */}
                    <Flex direction="column" gap={3} mb={8}>
                      {features.map((feat: string, i: number) => (
                        <HStack key={i} align="flex-start" gap={3}>
                          <Flex
                            w="22px"
                            h="22px"
                            borderRadius="full"
                            bg={
                              isNoir
                                ? "rgba(212, 175, 55, 0.2)"
                                : "rgba(107, 29, 40, 0.1)"
                            }
                            color={isNoir ? "#D4AF37" : "var(--athar-maroon)"}
                            align="center"
                            justify="center"
                            fontSize="0.75rem"
                            flexShrink={0}
                            mt="3px"
                          >
                            <FaCheck />
                          </Flex>
                          <Text
                            fontSize="0.94rem"
                            color={
                              isNoir ? "rgba(255, 255, 255, 0.92)" : "var(--athar-text-body)"
                            }
                            lineHeight="1.6"
                            fontWeight="500"
                          >
                            {feat}
                          </Text>
                        </HStack>
                      ))}
                    </Flex>
                  </Box>

                  {/* Action Button */}
                  <Button
                    onClick={() => onSelectPackage(plan.name)}
                    w="100%"
                    py={6}
                    borderRadius="16px"
                    fontSize="1.06rem"
                    fontWeight="800"
                    bg={
                      isNoir
                        ? "linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #B8860B 100%)"
                        : "var(--athar-maroon)"
                    }
                    color={isNoir ? "#171113" : "white"}
                    boxShadow={
                      isNoir
                        ? "0 10px 30px -5px rgba(212, 175, 55, 0.4)"
                        : "0 10px 25px -5px rgba(107, 29, 40, 0.35)"
                    }
                    transition="all 0.3s ease"
                    _hover={{
                      bg: isNoir
                        ? "linear-gradient(135deg, #F0D075 0%, #E5C158 50%, #C5A059 100%)"
                        : "var(--athar-maroon-dark)",
                      transform: "translateY(-2px)",
                      boxShadow: isNoir
                        ? "0 14px 35px -5px rgba(212, 175, 55, 0.55)"
                        : "0 14px 30px -5px rgba(107, 29, 40, 0.45)",
                    }}
                  >
                    اختر باقة {plan.name} {isNoir && "الملكية"}{" "}
                    <FaArrowLeft style={{ marginRight: "10px" }} />
                  </Button>
                </Box>
              );
            })}
          </SimpleGrid>
        </FadeContent>

        {/* Preview Sample Memory Page CTA Button */}
        <Flex justify="center" mt={10}>
          <Button
            onClick={handlePreviewSampleMemory}
            bg="rgba(255, 255, 255, 0.95)"
            color="var(--athar-maroon)"
            border="2px solid #D4AF37"
            borderRadius="full"
            px={{ base: 6, md: 8 }}
            py={6}
            fontSize={{ base: "0.95rem", md: "1.05rem" }}
            fontWeight="800"
            boxShadow="0 10px 30px -5px rgba(212, 175, 55, 0.3)"
            transition="all 0.3s ease"
            _hover={{
              bg: "linear-gradient(135deg, #FAF4E6 0%, #FFFDF9 100%)",
              transform: "translateY(-3px)",
              boxShadow: "0 15px 40px -5px rgba(212, 175, 55, 0.45)",
              borderColor: "var(--athar-maroon)",
            }}
          >
            <FaHeadphones style={{ fontSize: "1.2rem", marginLeft: "10px", color: "#D4AF37" }} />
            معاينة صفحة ذكريات تجريبية (مينا ومريم) — Preview Sample Memory Page →
          </Button>
        </Flex>

        {/* Reassurance Footer Bar */}
        <Flex
          justify="center"
          align="center"
          gap={3}
          mt={10}
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

export default PackagesSection;
