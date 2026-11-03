import React from "react";
import { Box, Flex, HStack, Text, Button, Badge, SimpleGrid } from "@chakra-ui/react";
import { FaCrown, FaExternalLinkAlt, FaQrcode, FaEnvelopeOpenText, FaRegCheckCircle, FaLaptopCode } from "react-icons/fa";

export interface InvitationLandingHeroProps {
  onOpenBooking: () => void;
  onPreviewEvent?: (slug: string) => void;
}

export const InvitationLandingHero: React.FC<InvitationLandingHeroProps> = ({
  onOpenBooking,
  onPreviewEvent,
}) => {
  return (
    <Box
      as="section"
      position="relative"
      minH={{ base: "85vh", lg: "92vh" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      bg="var(--athar-bg-primary, #FBF7F2)"
      dir="rtl"
      pt={{ base: 12, md: 16 }}
      pb={{ base: 16, md: 24 }}
    >
      {/* Background Interactive Waves Shader Pattern */}
      <Box
        position="absolute"
        inset="0"
        zIndex="0"
        opacity={0.35}
        pointerEvents="none"
        overflow="hidden"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 600"
          fill="none"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
        >
          <path
            d="M0,160 C320,300 420,40 720,180 C1020,320 1120,80 1440,200 L1440,600 L0,600 Z"
            fill="url(#wave-grad-1)"
            opacity="0.45"
          />
          <path
            d="M0,280 C280,120 540,320 820,190 C1100,60 1280,240 1440,160 L1440,600 L0,600 Z"
            fill="url(#wave-grad-2)"
            opacity="0.35"
          />
          <defs>
            <linearGradient id="wave-grad-1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8A2E3B" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#FBF7F2" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6B1D28" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#E5C158" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#F4EFEA" stopOpacity="0.02" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      {/* Decorative Glow Elements */}
      <Box
        position="absolute"
        top="10%"
        left="50%"
        transform="translateX(-50%)"
        w="700px"
        h="350px"
        bg="radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15), rgba(107, 29, 40, 0.05), transparent 70%)"
        filter="blur(50px)"
        pointerEvents="none"
        zIndex="0"
      />

      <Box maxW="1180px" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} position="relative" zIndex="1" textAlign="center">
        {/* Eyebrow Badge */}
        <Flex justify="center" mb={6}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.55)"
            bg="rgba(255, 255, 255, 0.92)"
            color="var(--athar-maroon, #6B1D28)"
            px={5}
            py={1.8}
            borderRadius="full"
            fontSize={{ base: "0.82rem", md: "0.88rem" }}
            fontWeight="700"
            letterSpacing="0.06em"
            boxShadow="0 4px 16px rgba(107, 29, 40, 0.06)"
          >
            ✦ أَثَـــر للدعوات الرقمية ومواقع المناسبات المخصصة
          </Badge>
        </Flex>

        {/* Display Headline */}
        <Box mb={5} maxW="980px" mx="auto">
          <Text
            as="h1"
            fontFamily="var(--font-arabic-display, 'Amiri', serif)"
            fontSize="clamp(2.3rem, 5.2vw, 4.2rem)"
            fontWeight="800"
            color="var(--athar-text-title, #231F20)"
            lineHeight="1.25"
          >
            دعوتك ليست مجرد بطاقة...{" "}
            <Text
              as="span"
              display="block"
              color="var(--athar-maroon, #6B1D28)"
              fontWeight="900"
              mt={1}
            >
              بل موقع تفاعلي يخلّد مناسبتك.
            </Text>
          </Text>
        </Box>

        {/* Acoustic Waveform Divider */}
        <Flex align="center" justify="center" gap={3} my={5} opacity={0.85}>
          <Box h="1px" w={{ base: "40px", md: "80px" }} bg="linear-gradient(90deg, transparent, #D4AF37)" />
          <svg width="40" height="18" viewBox="0 0 36 18" fill="none">
            <path
              d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
              stroke="#6B1D28"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Box h="1px" w={{ base: "40px", md: "80px" }} bg="linear-gradient(90deg, #D4AF37, transparent)" />
        </Flex>

        {/* Subtitle Description */}
        <Text
          maxW="780px"
          mx="auto"
          fontSize={{ base: "1.05rem", md: "1.22rem" }}
          color="var(--athar-text-body, #4A4240)"
          lineHeight="1.8"
          mb={8}
          fontWeight="500"
        >
          نصمم لك موقعاً رقمياً فاخراً متكاملاً لحفل زفافك، خطوبتك، مهرجانك، أو مؤتمرك الرفيع.
          يتضمن نموذج تسجيل حضور ديناميكي مخصص، وصندوق بريد حصري بحسابك لمتابعة ضيوفك لحظة بلحظة،
          مع إصدار بطاقات دخول ذكية بكود QR عبر البريد الإلكتروني تلقائياً.
        </Text>

        {/* Call to Actions */}
        <HStack
          justify="center"
          gap={{ base: 3, sm: 5 }}
          flexWrap="wrap"
          mb={{ base: 12, md: 14 }}
        >
          <Button
            onClick={onOpenBooking}
            bg="var(--athar-maroon, #6B1D28)"
            color="white"
            px={{ base: 7, md: 9 }}
            py={{ base: 6, md: 7 }}
            borderRadius="full"
            fontWeight="700"
            fontSize={{ base: "1rem", md: "1.08rem" }}
            boxShadow="0 8px 24px rgba(107, 29, 40, 0.3)"
            gap={3}
            transition="all 0.3s ease"
            _hover={{
              bg: "var(--athar-maroon-dark, #5B1621)",
              transform: "translateY(-3px)",
              boxShadow: "0 14px 34px rgba(107, 29, 40, 0.4)",
            }}
          >
            <FaCrown color="#D4AF37" size={17} />
            صمم موقع دعوتك الآن
          </Button>

          <Button
            onClick={() => onPreviewEvent ? onPreviewEvent("omar-and-layla") : undefined}
            bg="rgba(255, 255, 255, 0.95)"
            color="var(--athar-text-title, #231F20)"
            border="1.5px solid rgba(212, 175, 55, 0.45)"
            px={{ base: 6, md: 8 }}
            py={{ base: 6, md: 7 }}
            borderRadius="full"
            fontWeight="700"
            fontSize={{ base: "0.95rem", md: "1.02rem" }}
            gap={2.5}
            boxShadow="0 4px 16px rgba(0, 0, 0, 0.05)"
            transition="all 0.3s ease"
            _hover={{
              bg: "white",
              borderColor: "var(--athar-maroon, #6B1D28)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 22px rgba(107, 29, 40, 0.12)",
            }}
          >
            معاينة حية لتصميم زفاف ملكي
            <FaExternalLinkAlt size={13} color="#6B1D28" />
          </Button>
        </HStack>

        {/* Core Feature Highlights Cards */}
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 4 }}
          gap={4}
          maxW="1100px"
          mx="auto"
        >
          <Box
            bg="rgba(255, 255, 255, 0.85)"
            border="1px solid rgba(107, 29, 40, 0.08)"
            borderRadius="20px"
            p={4}
            display="flex"
            alignItems="center"
            gap={3}
            textAlign="right"
            boxShadow="0 6px 18px rgba(107, 29, 40, 0.04)"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              borderColor: "rgba(212, 175, 55, 0.45)",
              boxShadow: "0 10px 24px rgba(107, 29, 40, 0.08)",
            }}
          >
            <Flex
              w="42px"
              h="42px"
              borderRadius="14px"
              bg="rgba(107, 29, 40, 0.08)"
              color="var(--athar-maroon, #6B1D28)"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <FaLaptopCode size={18} />
            </Flex>
            <Box>
              <Text fontWeight="700" fontSize="0.92rem" color="var(--athar-text-title, #231F20)">
                موقع ويب مخصص
              </Text>
              <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                تصميم متكامل لكل مناسبة
              </Text>
            </Box>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.85)"
            border="1px solid rgba(107, 29, 40, 0.08)"
            borderRadius="20px"
            p={4}
            display="flex"
            alignItems="center"
            gap={3}
            textAlign="right"
            boxShadow="0 6px 18px rgba(107, 29, 40, 0.04)"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              borderColor: "rgba(212, 175, 55, 0.45)",
              boxShadow: "0 10px 24px rgba(107, 29, 40, 0.08)",
            }}
          >
            <Flex
              w="42px"
              h="42px"
              borderRadius="14px"
              bg="rgba(212, 175, 55, 0.16)"
              color="#B7791F"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <FaRegCheckCircle size={18} />
            </Flex>
            <Box>
              <Text fontWeight="700" fontSize="0.92rem" color="var(--athar-text-title, #231F20)">
                نموذج RSVP تفاعلي
              </Text>
              <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                حقول مخصصة حسب رغبتكم
              </Text>
            </Box>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.85)"
            border="1px solid rgba(107, 29, 40, 0.08)"
            borderRadius="20px"
            p={4}
            display="flex"
            alignItems="center"
            gap={3}
            textAlign="right"
            boxShadow="0 6px 18px rgba(107, 29, 40, 0.04)"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              borderColor: "rgba(212, 175, 55, 0.45)",
              boxShadow: "0 10px 24px rgba(107, 29, 40, 0.08)",
            }}
          >
            <Flex
              w="42px"
              h="42px"
              borderRadius="14px"
              bg="rgba(107, 29, 40, 0.08)"
              color="var(--athar-maroon, #6B1D28)"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <FaEnvelopeOpenText size={18} />
            </Flex>
            <Box>
              <Text fontWeight="700" fontSize="0.92rem" color="var(--athar-text-title, #231F20)">
                صندوق بريد لحظي
              </Text>
              <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                تحكم كامل في الطاقة الاستيعابية
              </Text>
            </Box>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.85)"
            border="1px solid rgba(107, 29, 40, 0.08)"
            borderRadius="20px"
            p={4}
            display="flex"
            alignItems="center"
            gap={3}
            textAlign="right"
            boxShadow="0 6px 18px rgba(107, 29, 40, 0.04)"
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              borderColor: "rgba(212, 175, 55, 0.45)",
              boxShadow: "0 10px 24px rgba(107, 29, 40, 0.08)",
            }}
          >
            <Flex
              w="42px"
              h="42px"
              borderRadius="14px"
              bg="rgba(30, 111, 80, 0.12)"
              color="#1E6F50"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <FaQrcode size={18} />
            </Flex>
            <Box>
              <Text fontWeight="700" fontSize="0.92rem" color="var(--athar-text-title, #231F20)">
                بطاقة QR للدخول
              </Text>
              <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                تسليم تلقائي للمقبولين
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export const InvitationHero = InvitationLandingHero;
export default InvitationLandingHero;
