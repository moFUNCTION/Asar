import React from "react";
import { Box, Grid, Flex, Text, HStack, Badge, Image } from "@chakra-ui/react";
import { FaHeart, FaHands, FaDove, FaQuoteRight } from "react-icons/fa";
import { SplitText } from "@repo/ui-components";

export const MoreThanPhoneSection: React.FC = () => {
  const pillars = [
    {
      icon: FaHeart,
      title: "قصص إنسانية حية",
      desc: "ضحكات عفوية، ودموع فرح، ودعوات صادقة لا يمكن للأوراق كتابتها.",
    },
    {
      icon: FaHands,
      title: "ذكريات ذات معنى",
      desc: "حفظ نبرة صوت الأحباب في هذه المرحلة من العمر لتسمعوها بعد سنوات.",
    },
    {
      icon: FaDove,
      title: "هوية وروح مصرية",
      desc: "ضيافة دافئة وأجواء مصممة خصيصاً لتقاليد ومشاعر الفرح المصري الأصيل.",
    },
  ];

  return (
    <Box
      as="section"
      id="about"
      py={{ base: 24, md: 32 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-primary)"
      position="relative"
      scrollMarginTop="130px"
      dir="rtl"
    >
      <Box maxW="1240px" mx="auto">
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={{ base: 12, lg: 16 }}
          alignItems="start"
        >
            {/* Left Column (Right in RTL): Narrative Copy with SplitText */}
            <Flex direction="column" gap={6} textAlign="right" align="flex-start">
              <Box w="100%">
                <HStack mb={4} justify="flex-start">
                  <Badge
                    px={4}
                    py={1.5}
                    borderRadius="full"
                    bg="rgba(107, 29, 40, 0.08)"
                    color="var(--athar-maroon)"
                    border="1px solid rgba(107, 29, 40, 0.15)"
                    fontWeight="700"
                    fontSize="0.85rem"
                    letterSpacing="0.05em"
                  >
                    عَــن أَثَـــر
                  </Badge>
                </HStack>

                {/* Title with SplitText aligned right (once=false) */}
                <Box textAlign="right" w="100%">
                  <SplitText
                    text="أكثر من مجرد هاتف"
                    delay={40}
                    splitType="words"
                    animation="fadeUp"
                    once={false}
                    className="font-arabic-display"
                    style={{
                      fontSize: "clamp(2.3rem, 4.2vw, 3.5rem)",
                      fontWeight: 800,
                      color: "var(--athar-text-title)",
                      lineHeight: 1.25,
                      marginBottom: "1rem",
                      textAlign: "right",
                      display: "block",
                      width: "100%",
                    }}
                  />
                </Box>

                {/* Body narrative with SplitText aligned right (once=false) */}
                <Box textAlign="right" w="100%">
                  <SplitText
                    text="أثر ليست مجرد ركن أو هاتف عتيق، بل تجربة وجدانية تصنع جسراً بين الحاضر والمستقبل. نلتقط فيها نبرات أصوات من تحبون، ضحكاتهم العفوية، ودموع فرحهم التي لا تستطيع الكلمات المكتوبة في دفاتر الضيوف أن تصفها... لتتحول تلك الليلة إلى كنز مسموع يرافقكم طوال العمر."
                    delay={25}
                    splitType="words"
                    animation="fadeUp"
                    once={false}
                    style={{
                      fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)",
                      color: "var(--athar-text-body)",
                      lineHeight: 1.85,
                      textAlign: "right",
                      display: "block",
                      width: "100%",
                    }}
                  />
                </Box>
              </Box>

              {/* 3 Emotional Pillars from Screen 02 */}
              <Flex direction="column" gap={4} my={2} w="100%">
                {pillars.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <HStack
                      key={idx}
                      align="flex-start"
                      gap={4}
                      p={4}
                      bg="rgba(255, 255, 255, 0.85)"
                      borderRadius="18px"
                      border="1px solid rgba(107, 29, 40, 0.07)"
                      boxShadow="0 4px 15px rgba(0, 0, 0, 0.02)"
                      transition="all 0.3s ease"
                      _hover={{
                        bg: "white",
                        borderColor: "rgba(212, 175, 55, 0.4)",
                        transform: "translateX(-6px)",
                        boxShadow: "0 8px 25px -5px rgba(107, 29, 40, 0.1)",
                      }}
                    >
                      <Box
                        p={3}
                        borderRadius="12px"
                        bg="rgba(107, 29, 40, 0.08)"
                        color="var(--athar-maroon)"
                        fontSize="1.15rem"
                      >
                        <IconComponent />
                      </Box>
                      <Box textAlign="right">
                        <Text
                          fontFamily="var(--font-arabic-display)"
                          fontSize="1.18rem"
                          fontWeight="700"
                          color="var(--athar-text-title)"
                        >
                          {item.title}
                        </Text>
                        <Text fontSize="0.9rem" color="var(--athar-text-muted)" mt={0.5}>
                          {item.desc}
                        </Text>
                      </Box>
                    </HStack>
                  );
                })}
              </Flex>

              {/* Romantic Quote Card from Screen 02 with SplitText (once=false) */}
              <Box
                w="100%"
                p={6}
                bg="rgba(251, 247, 242, 0.95)"
                borderRadius="20px"
                border="1px dashed rgba(212, 175, 55, 0.55)"
                position="relative"
                textAlign="right"
              >
                <FaQuoteRight
                  style={{
                    color: "rgba(212, 175, 55, 0.45)",
                    fontSize: "1.8rem",
                    marginBottom: "0.5rem",
                  }}
                />
                <SplitText
                  text="«كل كلمة قيلت في ليلتكم، ستصبح غداً أغلى ما تملكون... صوتهم هو الأثر الذي لا يزول.»"
                  delay={30}
                  splitType="words"
                  animation="fadeUp"
                  once={false}
                  className="font-arabic-display"
                  style={{
                    fontSize: "clamp(1.3rem, 2vw, 1.6rem)",
                    color: "var(--athar-maroon-dark)",
                    lineHeight: 1.6,
                    fontWeight: 700,
                    textAlign: "right",
                  }}
                />
              </Box>
            </Flex>

            {/* Right Column (Left in RTL): Sticky Luxury Image Card */}
            <Box
              position={{ base: "relative", lg: "sticky" }}
              top={{ base: "auto", lg: "110px" }}
              w="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Box
                borderRadius="30px"
                overflow="hidden"
                boxShadow="0 25px 60px -15px rgba(107, 29, 40, 0.22)"
                border="1px solid rgba(212, 175, 55, 0.35)"
                h={{ base: "380px", sm: "460px", md: "540px" }}
                w="100%"
                position="relative"
                bg="var(--athar-bg-secondary)"
              >
                <Image
                  src="/assets/love-wedding.jpg"
                  alt="لحظات حب وذكريات صوتية حية في حفل الزفاف"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  display="block"
                />
              </Box>
            </Box>
          </Grid>
      </Box>
    </Box>
  );
};
