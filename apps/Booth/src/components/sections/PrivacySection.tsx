import React from "react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { FaLock, FaShieldAlt } from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

export const PrivacySection: React.FC = () => {
  return (
    <Box
      as="section"
      py={{ base: 12, md: 16 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-primary)"
      borderTop="1px solid rgba(107, 29, 40, 0.06)"
      dir="rtl"
    >
      <Box maxW="920px" mx="auto">
        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          <Box
            p={{ base: 6, md: 8 }}
            borderRadius="28px"
            bg="rgba(255, 255, 255, 0.94)"
            border="1px solid rgba(212, 175, 55, 0.35)"
            boxShadow="0 10px 30px -10px rgba(107, 29, 40, 0.08)"
            display="flex"
            flexDirection={{ base: "column", md: "row" }}
            alignItems="center"
            justifyContent="space-between"
            gap={6}
          >
            <HStack gap={5} align="center">
              <Box
                w="58px"
                h="58px"
                borderRadius="full"
                bg="rgba(107, 29, 40, 0.08)"
                color="var(--athar-maroon)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="1.6rem"
                flexShrink={0}
              >
                <FaLock />
              </Box>

              <Box>
                <SplitText
                  text="ذكرياتكم ملككم وحدكم"
                  delay={30}
                  splitType="words"
                  animation="fadeUp"
                  once={false}
                  className="font-arabic-display"
                  style={{
                    fontSize: "1.45rem",
                    fontWeight: 800,
                    color: "var(--athar-text-title)",
                    marginBottom: "4px",
                  }}
                />
                <Text fontSize="0.92rem" color="var(--athar-text-muted)" maxW="500px" lineHeight="1.6">
                  تسجيلاتكم الصوتية والصور والفيديوهات خاصة بكم تماماً، ولن تُنشر أو تُشارك أبداً دون إذن كتابي صريح من العروسين.
                </Text>
              </Box>
            </HStack>

          <HStack gap={4} fontSize="0.9rem" fontWeight="700" color="var(--athar-maroon)">
            <HStack gap={1.5}>
              <FaShieldAlt />
              <Text>خزانة سحابية مشفرة</Text>
            </HStack>
          </HStack>
        </Box>
        </FadeContent>
      </Box>
    </Box>
  );
};
