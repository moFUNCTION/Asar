import React from "react";
import { Box, Flex, SimpleGrid, Text, HStack } from "@chakra-ui/react";
import { FaCrown, FaExternalLinkAlt } from "react-icons/fa";

export const InvitationFooter: React.FC = () => {
  return (
    <Box
      as="footer"
      bg="linear-gradient(180deg, #1A1417 0%, #120F11 100%)"
      color="white"
      pt={{ base: 16, md: 20 }}
      pb={10}
      px={{ base: 4, sm: 6, lg: 8 }}
      borderTop="1px solid rgba(212, 175, 55, 0.25)"
      dir="rtl"
    >
      <Box maxW="1280px" mx="auto">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={{ base: 10, lg: 8 }} mb={16}>
          {/* Col 1: Brand Info & Quote */}
          <Box gridColumn={{ base: "span 1", lg: "span 2" }}>
            <Flex align="center" gap={3} mb={4}>
              <Flex
                w="46px"
                h="46px"
                borderRadius="full"
                bg="var(--athar-maroon, #6B1D28)"
                color="#D4AF37"
                align="center"
                justify="center"
                fontSize="1.4rem"
                fontWeight="900"
                fontFamily="var(--font-arabic-display, 'Amiri', serif)"
                border="1.5px solid rgba(212, 175, 55, 0.45)"
              >
                أ
              </Flex>
              <Box>
                <Text
                  fontFamily="var(--font-arabic-display, 'Amiri', serif)"
                  fontSize="1.5rem"
                  fontWeight="800"
                  color="#FFFFFF"
                >
                  أَثَـــر <Text as="span" color="#D4AF37">للدعوات الرقمية</Text>
                </Text>
                <Text fontSize="0.75rem" color="rgba(255, 255, 255, 0.6)">
                  Bespoke Interactive Event Websites & QR Passes
                </Text>
              </Box>
            </Flex>

            <Text
              fontSize="0.95rem"
              color="rgba(255, 255, 255, 0.75)"
              lineHeight="1.85"
              maxW="520px"
              mb={6}
            >
              نصمم مواقع تفاعلية استثنائية لمناسباتكم الرفيعة؛ تجمع بين أصالة الخط العربي والشعرية
              وفخامة الهوية الملكية، مدعومة بنموذج تسجيل ديناميكي وصندوق بريد حصري لكود الدخول الذكي.
            </Text>

            <Text
              fontFamily="var(--font-arabic-display, 'Amiri', serif)"
              fontSize="1.15rem"
              fontStyle="italic"
              color="#D4AF37"
            >
              "نخلّد أثر البدايات... لتبقى ذكراها حية عبر الأجيال."
            </Text>
          </Box>

          {/* Col 2: Navigation Links */}
          <Box>
            <Text fontWeight="800" fontSize="0.95rem" color="#D4AF37" mb={4} letterSpacing="0.04em">
              أقسام الصفحة
            </Text>
            <Flex direction="column" gap={2.5}>
              {[
                { label: "المناسبات والتصاميم", href: "#occasions" },
                { label: "مميزات المنظومة", href: "#features" },
                { label: "صندوق البريد وكود QR", href: "#mailbox-qr" },
                { label: "الباقات والأسعار", href: "#packages" },
                { label: "الإضافات الملكية", href: "#addons" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "0.88rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    display: "block",
                  }}
                >
                  ✦ {link.label}
                </a>
              ))}
            </Flex>
          </Box>

          {/* Col 3: Ecosystem Hubs */}
          <Box>
            <Text fontWeight="800" fontSize="0.95rem" color="#D4AF37" mb={4} letterSpacing="0.04em">
              منظومة أثر ASAR
            </Text>
            <Flex direction="column" gap={3}>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  padding: "12px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="0.85rem" fontWeight="700" color="white">
                      أثر بوث (ASAR Booth)
                    </Text>
                    <Text fontSize="0.72rem" color="rgba(255, 255, 255, 0.5)">
                      الهاتف التناظري وسجل الصوت الرقمي
                    </Text>
                  </Box>
                  <FaExternalLinkAlt size={11} color="#D4AF37" />
                </Flex>
              </a>

              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  padding: "12px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="0.85rem" fontWeight="700" color="white">
                      بوابة العميل الرئيسية (Main Hub)
                    </Text>
                    <Text fontSize="0.72rem" color="rgba(255, 255, 255, 0.5)">
                      متابعة الطلبات وصندوق البريد
                    </Text>
                  </Box>
                  <FaExternalLinkAlt size={11} color="#D4AF37" />
                </Flex>
              </a>

              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  padding: "12px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="0.85rem" fontWeight="700" color="white">
                      لوحة إدارة العمليات (Admin)
                    </Text>
                    <Text fontSize="0.72rem" color="rgba(255, 255, 255, 0.5)">
                      إدارة الباقات واعتماد الحجوزات
                    </Text>
                  </Box>
                  <FaExternalLinkAlt size={11} color="#D4AF37" />
                </Flex>
              </a>
            </Flex>
          </Box>
        </SimpleGrid>

        {/* Bottom Sub-footer */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align="center"
          pt={8}
          borderTop="1px solid rgba(255, 255, 255, 0.08)"
          gap={4}
          fontSize="0.8rem"
          color="rgba(255, 255, 255, 0.55)"
        >
          <Text>
            جميع الحقوق محفوظة © {new Date().getFullYear()} مشروع أثر (ASAR). صُنع بشغف لإحياء وتخليد أجمل اللحظات.
          </Text>
          <HStack gap={1}>
            <Text>صُمم بأعلى معايير الرقي المعماري</Text>
            <FaCrown color="#D4AF37" size={12} />
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default InvitationFooter;
