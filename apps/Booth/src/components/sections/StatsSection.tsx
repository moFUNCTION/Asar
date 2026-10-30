import React from "react";
import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { CountUp, SplitText, FadeContent } from "@repo/ui-components";

export const StatsSection: React.FC = () => {
  const statCards = [
    {
      to: 100,
      suffix: "+",
      label: "أعراس وعائلات وثقت بنا",
      sublabel: "في أرقى قاعات ومناسبات الإسكندرية والساحل والقاهرة",
    },
    {
      to: 5400,
      suffix: "+",
      label: "رسالة صوتية حقيقية",
      sublabel: "دموع فرح، مباركات صادقة، وضحكات عفوية من القلب",
    },
    {
      to: 100,
      suffix: "%",
      label: "ذكريات تصنع غداً أجمل",
      sublabel: "خزانة سحابية خاصة ومشفرة تحفظ صوت أحبائكم للأبد",
    },
  ];

  return (
    <Box
      as="section"
      id="stats"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-secondary)"
      position="relative"
      borderTop="1px solid rgba(107, 29, 40, 0.06)"
      borderBottom="1px solid rgba(107, 29, 40, 0.06)"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="1180px" mx="auto">
        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          {/* Section Title & Description using SplitText with once={false} */}
          <Flex direction="column" align="center" textAlign="center" mb={{ base: 12, md: 16 }}>
            <Box mb={2}>
              <SplitText
                text="أصوات اليوم ... ذكريات بكرة"
                delay={40}
                splitType="words"
                animation="fadeUp"
                once={false}
                className="font-arabic-display"
                style={{
                  fontSize: "clamp(2rem, 3.6vw, 3rem)",
                  fontWeight: 800,
                  color: "var(--athar-text-title)",
                  justifyContent: "center",
                }}
              />
            </Box>
            <Box maxW="660px">
              <SplitText
                text="لحظات حقيقية ودموع فرح وكلمات من القلب وثقناها في أجمل الليالي عبر تجربة استثنائية."
                delay={25}
                splitType="words"
                animation="fadeUp"
                once={false}
                style={{
                  fontSize: "clamp(1rem, 1.5vw, 1.18rem)",
                  color: "var(--athar-text-muted)",
                  lineHeight: 1.7,
                  justifyContent: "center",
                }}
              />
            </Box>
          </Flex>

          {/* Flex of Counters using CountUp with once={false} */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 6, md: 8 }}>
            {statCards.map((stat, idx) => (
              <Box
                key={idx}
                p={{ base: 7, md: 9 }}
                bg="rgba(255, 255, 255, 0.95)"
                borderRadius="26px"
                border="1px solid rgba(212, 175, 55, 0.3)"
                boxShadow="0 12px 35px -10px rgba(107, 29, 40, 0.08)"
                textAlign="center"
                position="relative"
                overflow="hidden"
                transition="transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  right: "20%",
                  height: "3px",
                  background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
                }}
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "0 18px 45px -10px rgba(107, 29, 40, 0.16)",
                  borderColor: "var(--athar-maroon)",
                }}
              >
                <Text
                  fontFamily="var(--font-serif)"
                  fontSize={{ base: "3rem", md: "3.8rem" }}
                  fontWeight="800"
                  color="var(--athar-maroon)"
                  lineHeight="1.1"
                  mb={2}
                  display="inline-flex"
                  alignItems="baseline"
                  justifyContent="center"
                  dir="ltr"
                >
                  <CountUp
                    to={stat.to}
                    once={false}
                    duration={2.5}
                    separator=","
                  />
                  <span style={{ color: "#D4AF37", marginRight: "3px" }}>{stat.suffix}</span>
                </Text>
                <Box mb={2}>
                  <SplitText
                    text={stat.label}
                    delay={20}
                    splitType="words"
                    animation="fadeUp"
                    once={false}
                    className="font-arabic-display"
                    style={{
                      fontSize: "clamp(1.2rem, 1.4vw, 1.45rem)",
                      fontWeight: 700,
                      color: "var(--athar-text-title)",
                      justifyContent: "center",
                    }}
                  />
                </Box>
                <Text
                  fontSize={{ base: "0.88rem", md: "0.95rem" }}
                  color="var(--athar-text-muted)"
                  lineHeight="1.6"
                >
                  {stat.sublabel}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </FadeContent>
      </Box>
    </Box>
  );
};
