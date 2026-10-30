import React from "react";
import { Box, Flex, Grid, Text, HStack, Badge } from "@chakra-ui/react";
import { FaCalendarAlt, FaTruck, FaPhoneAlt, FaHeadphones, FaHeart } from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

export const HowItWorksSection: React.FC = () => {

  const steps = [
    {
      num: 1,
      icon: FaCalendarAlt,
      title: "احجز موعدك",
      desc: "شاركنا تاريخ الفرح، المكان، واختر الباقة الأنسب لكم في دقائق.",
    },
    {
      num: 2,
      icon: FaTruck,
      title: "التجهيز والتركيب",
      desc: "نصل مبكراً للقاعة ونتولى النقل والتركيب وتنسيق الديكور الكلاسيكي بالكامل.",
    },
    {
      num: 3,
      icon: FaPhoneAlt,
      title: "المعازيم يسجلون",
      desc: "يسمع ضيوفكم رسالتكم الترحيبية، ثم يتركون مشاعرهم ودعواتهم بعد النغمة.",
    },
    {
      num: 4,
      icon: FaHeadphones,
      title: "الهندسة والتنظيم",
      desc: "مهندسو الصوت يعزلون صدى القاعة وضوضاء الموسيقى ويعدون الملفات بجودة نقية.",
    },
    {
      num: 5,
      icon: FaHeart,
      title: "الاستلام والاحتفاظ",
      desc: "تستلمون رابط الخزانة السحابية الخاصة خلال ١٠-١٤ يوماً لتستمعوا إليها للأبد.",
    },
  ];

  return (
    <Box
      as="section"
      id="how-it-works"
      py={{ base: 24, md: 32 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-primary)"
      position="relative"
      scrollMarginTop="130px"
      dir="rtl"
    >
      <Box maxW="1240px" mx="auto">
        {/* Header */}
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
            خُطُـــوَات التَّجْرِبَـــة
          </Badge>
          <SplitText
            text="كيف يعمل أثر؟"
            delay={50}
            splitType="words"
            animation="fadeUp"
            once={false}
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              fontWeight: 800,
              color: "var(--athar-text-title)",
              marginBottom: "0.5rem",
            }}
          />
          <SplitText
            text="خطوات بسيطة ... لذكريات تدوم عمراً كاملاً."
            delay={30}
            splitType="words"
            animation="fadeUp"
            once={false}
            style={{
              fontSize: "1.08rem",
              color: "var(--athar-text-muted)",
              marginTop: "4px",
            }}
          />
        </Flex>

        {/* 2-Column Grid with Sticky DecayCard on the Left (in RTL) */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }}
          gap={{ base: 12, lg: 16 }}
          alignItems="start"
        >
          {/* Right Column in RTL: Numbered Timeline Steps */}
          <Flex direction="column" gap={5}>
            {steps.map((step) => {
              const IconComp = step.icon;
              return (
                <FadeContent
                  key={step.num}
                  blur={true}
                  duration={1800}
                  threshold={0.1}
                  once={false}
                >
                  <HStack
                    align="flex-start"
                    gap={5}
                    p={{ base: 5, sm: 6 }}
                    bg="rgba(255, 255, 255, 0.94)"
                    borderRadius="20px"
                    border="1px solid rgba(107, 29, 40, 0.08)"
                    boxShadow="0 4px 15px rgba(0, 0, 0, 0.02)"
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: "var(--athar-maroon)",
                      transform: "translateX(-6px)",
                      boxShadow: "0 10px 25px -10px rgba(107, 29, 40, 0.12)",
                    }}
                  >
                    {/* Step Number Circle */}
                    <Flex
                      w="52px"
                      h="52px"
                      borderRadius="full"
                      bg="linear-gradient(135deg, var(--athar-maroon), #4A0E17)"
                      border="2px solid #D4AF37"
                      color="#FFFFFF"
                      fontWeight="800"
                      fontFamily="var(--font-arabic-body)"
                      fontSize="1.2rem"
                      align="center"
                      justify="center"
                      flexShrink={0}
                      boxShadow="0 4px 14px rgba(107, 29, 40, 0.25)"
                    >
                      {step.num}
                    </Flex>

                    <Box flex="1" textAlign="right">
                      <HStack justify="space-between" align="center" mb={1.5}>
                        <SplitText
                          text={step.title}
                          delay={20}
                          splitType="words"
                          animation="fadeUp"
                          once={false}
                          className="font-arabic-display"
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: 700,
                            color: "var(--athar-text-title)",
                          }}
                        />
                        <Box color="var(--athar-maroon)" fontSize="1.1rem">
                          <IconComp />
                        </Box>
                      </HStack>
                      <Text fontSize="0.95rem" color="var(--athar-text-muted)" lineHeight="1.65">
                        {step.desc}
                      </Text>
                    </Box>
                  </HStack>
                </FadeContent>
              );
            })}
          </Flex>

          {/* Left Column in RTL: Interactive DecayCard Sticky until the scroll end of steps */}
          <Box
            position={{ base: "relative", lg: "sticky" }}
            top={{ base: "auto", lg: "110px" }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            w="100%"
          >
            <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
              <Box
                borderRadius="28px"
                overflow="hidden"
                boxShadow="0 25px 60px -15px rgba(107, 29, 40, 0.2)"
                border="1px solid rgba(212, 175, 55, 0.35)"
                position="relative"
                w={{ base: "100%", sm: "420px", lg: "460px" }}
                h={{ base: "380px", sm: "460px", lg: "500px" }}
                bg="var(--athar-bg-secondary)"
              >
                <Box
                  as="img"
                  src="/assets/booth-hero-photo.webp"
                  alt="ركن هاتف أثر الصوتي العتيق"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  display="block"
                />
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  p={6}
                  bg="linear-gradient(to top, rgba(91, 22, 33, 0.94) 0%, rgba(91, 22, 33, 0.5) 55%, transparent 100%)"
                  color="white"
                  textAlign="center"
                >
                  <Text
                    fontFamily="var(--font-arabic-display)"
                    fontSize={{ base: "1.25rem", md: "1.45rem" }}
                    fontWeight="800"
                    color="#D4AF37"
                  >
                    "دفتر الضيوف الورقي يتجعد ويتلف..."
                  </Text>
                  <Text
                    fontSize={{ base: "0.95rem", md: "1.05rem" }}
                    color="rgba(255, 255, 255, 0.95)"
                    mt={1.5}
                    lineHeight="1.6"
                  >
                    أما صوت أحبائكم فيبقى حياً ونابضاً للأبد
                  </Text>
                </Box>
              </Box>
            </FadeContent>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};
