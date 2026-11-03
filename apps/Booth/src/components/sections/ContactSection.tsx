import React from "react";
import { Box, Flex, Grid, Text, HStack, Button, Badge, Image } from "@chakra-ui/react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaFacebook,
} from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

export const ContactSection: React.FC = () => {
  return (
    <Box
      as="section"
      id="contact"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-secondary)"
      position="relative"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
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
            تَوَاصَـــل مَعَنَـــا
          </Badge>
          <SplitText
            text="يسعدنا سماع صوتكم"
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
            text="نحن جاهزون لمشاركتكم التخطيط وصناعة أجمل الذكريات الصوتية لليلتكم."
            delay={25}
            splitType="words"
            animation="fadeUp"
            once={false}
            style={{
              fontSize: "1.08rem",
              color: "var(--athar-text-muted)",
              marginTop: "4px",
              justifyContent: "center",
            }}
          />
        </Flex>

        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 10, lg: 16 }}
            alignItems="center"
          >
          {/* Right Column in RTL: Contact Methods & Socials */}
          <Flex direction="column" gap={6}>
            {[
              {
                icon: FaPhoneAlt,
                label: "الخط الساخن والاتصال المباشر",
                value: "0100 000 0000",
                href: "tel:01000000000",
              },
              {
                icon: FaEnvelope,
                label: "البريد الإلكتروني للاستفسارات",
                value: "hello@athar.audio",
                href: "mailto:hello@athar.audio",
              },
              {
                icon: FaMapMarkerAlt,
                label: "مناطق التغطية والعمل",
                value: "الإسكندرية، الساحل الشمالي، العجمي، القاهرة",
                href: "#",
              },
            ].map((c, i) => {
              const IconComp = c.icon;
              return (
                <a key={i} href={c.href} style={{ textDecoration: "none" }}>
                  <HStack
                    p={5}
                    bg="white"
                    borderRadius="20px"
                    border="1px solid rgba(107, 29, 40, 0.08)"
                    boxShadow="0 4px 15px rgba(0, 0, 0, 0.02)"
                    gap={4}
                    transition="all 0.3s ease"
                    _hover={{
                      borderColor: "var(--athar-maroon)",
                      transform: "translateX(-6px)",
                      boxShadow: "0 10px 25px -10px rgba(107, 29, 40, 0.12)",
                    }}
                  >
                    <Box
                      p={3.5}
                      borderRadius="14px"
                      bg="rgba(107, 29, 40, 0.08)"
                      color="var(--athar-maroon)"
                      fontSize="1.2rem"
                    >
                      <IconComp />
                    </Box>
                    <Box>
                      <Text fontSize="0.82rem" color="var(--athar-text-muted)" fontWeight="600">
                        {c.label}
                      </Text>
                      <Text
                        fontFamily="var(--font-arabic-display)"
                        fontSize="1.22rem"
                        fontWeight="800"
                        color="var(--athar-text-title)"
                      >
                        {c.value}
                      </Text>
                    </Box>
                  </HStack>
                </a>
              );
            })}

            {/* Social Channels */}
            <Box pt={2}>
              <Text fontSize="0.92rem" fontWeight="800" color="var(--athar-text-title)" mb={3}>
                تابعوا قصصنا وريلز المناسبات:
              </Text>
              <HStack gap={3}>
                {[
                  { icon: FaInstagram, name: "Instagram", href: "https://instagram.com" },
                  { icon: FaTiktok, name: "TikTok", href: "https://tiktok.com" },
                  { icon: FaFacebook, name: "Facebook", href: "https://facebook.com" },
                ].map((s, idx) => {
                  const IconComp = s.icon;
                  return (
                    <Box
                      asChild
                      key={idx}
                      p={3}
                      borderRadius="full"
                      bg="white"
                      border="1px solid rgba(107, 29, 40, 0.12)"
                      color="var(--athar-maroon)"
                      fontSize="1.25rem"
                      transition="all 0.3s ease"
                      _hover={{
                        bg: "var(--athar-maroon)",
                        color: "white",
                        transform: "translateY(-3px)",
                      }}
                    >
                      <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                        <IconComp />
                      </a>
                    </Box>
                  );
                })}
              </HStack>
            </Box>

            <a
              href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A3%D8%AB%D8%B1%D8%8C%20%D8%AD%D8%A7%D8%A8%D8%A8%20%D8%A3%D8%AA%D9%88%D8%A7%D8%B5%D9%84%20%D9%85%D8%B9%D9%83%D9%85."
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <Button
                className="btn-athar-primary"
                py={6}
                px={8}
                fontSize="1.05rem"
                fontWeight="800"
              >
                <FaWhatsapp style={{ fontSize: "1.3rem", marginLeft: "8px" }} />
                محادثة مباشرة عبر واتساب
              </Button>
            </a>
          </Flex>

          {/* Left Column in RTL: Visual Regional Map Card from Screen 12 */}
          <Box
            p={{ base: 6, md: 8 }}
            borderRadius="30px"
            bg="white"
            border="1px solid rgba(212, 175, 55, 0.4)"
            boxShadow="0 20px 50px -15px rgba(107, 29, 40, 0.15)"
            position="relative"
            overflow="hidden"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text
                fontFamily="var(--font-arabic-display)"
                fontSize="1.35rem"
                fontWeight="800"
                color="var(--athar-text-title)"
              >
                مناطق التغطية المباشرة
              </Text>
              <Badge bg="rgba(16, 185, 129, 0.15)" color="#10b981" px={3} py={1} borderRadius="full" fontWeight="700">
                فريق متأهب
              </Badge>
            </Flex>

            {/* Stylized Map Representation */}
            <Box
              h="260px"
              borderRadius="20px"
              bg="#F4EFEA"
              position="relative"
              overflow="hidden"
              border="1px solid rgba(107, 29, 40, 0.08)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                alt="خريطة مناطق التغطية"
                w="100%"
                h="100%"
                objectFit="cover"
                filter="sepia(0.35) contrast(1.05) brightness(0.95)"
                opacity="0.85"
              />
              <Box
                position="absolute"
                p={4}
                bg="rgba(255, 255, 255, 0.95)"
                backdropFilter="blur(10px)"
                borderRadius="18px"
                boxShadow="0 10px 25px rgba(0,0,0,0.15)"
                border="1px solid var(--athar-maroon)"
                textAlign="center"
              >
                <FaMapMarkerAlt style={{ color: "#6B1D28", fontSize: "1.5rem", margin: "0 auto 6px" }} />
                <Text fontWeight="800" fontSize="1.05rem" color="var(--athar-text-title)">
                  الإسكندرية · الساحل الشمالي · القاهرة
                </Text>
                <Text fontSize="0.82rem" color="var(--athar-text-muted)" mt={1}>
                  فريق ومضيف مخصص ينتقل لموقع القاعة مع كامل التجهيزات
                </Text>
              </Box>
            </Box>

            <Text fontSize="0.88rem" color="var(--athar-text-muted)" textAlign="center" mt={4}>
              التوصيل والتركيب مشمول مجاناً ضمن نطاق المنطقة أ (الإسكندرية والعجمي والساحل).
            </Text>
          </Box>
        </Grid>
      </FadeContent>
    </Box>
  </Box>
);
};
