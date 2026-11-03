import React from "react";
import { Box, Flex, HStack, Text, Image } from "@chakra-ui/react";
import { FaCalendarAlt, FaMapMarkerAlt, FaHeart } from "react-icons/fa";

interface MemoryHeroProps {
  coupleTitle: string;
  eventHeaderTag?: string;
  eventDateDisplay: string;
  eventLocationDisplay: string;
  highlightBadge: string;
  coupleQuote: string;
  quoteAuthor?: string;
  taglineLine1?: string;
  taglineLine2?: string;
  heroImageUrl?: string;
}

export const MemoryHero: React.FC<MemoryHeroProps> = ({
  coupleTitle,
  eventHeaderTag = "THE WEDDING OF",
  eventDateDisplay,
  eventLocationDisplay,
  highlightBadge,
  coupleQuote,
  quoteAuthor,
  taglineLine1 = "Same People. Different Voices.",
  taglineLine2 = "A Lasting Athar.",
  heroImageUrl = "/assets/love-wedding.jpg",
}) => {
  return (
    <Box
      w="100%"
      maxW="1100px"
      mx="auto"
      mt={{ base: 4, md: 6 }}
      px={{ base: 3, sm: 6 }}
    >
      <Box
        position="relative"
        borderRadius={{ base: "24px", md: "32px" }}
        overflow="hidden"
        boxShadow="0 18px 48px -12px rgba(107, 29, 40, 0.12)"
        border="1px solid rgba(107, 29, 40, 0.08)"
        bg="#FBF7F2"
      >
        {/* Hero Background Image with Gradient Overlay */}
        <Box
          position="relative"
          minH={{ base: "480px", sm: "520px", md: "560px" }}
          w="100%"
          bg="linear-gradient(135deg, #F4EFEA 0%, #EDE6DC 100%)"
        >
          <Image
            src={heroImageUrl}
            alt={coupleTitle}
            position="absolute"
            inset="0"
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="center 30%"
          />

          {/* Luxury Multi-Stop Editorial Alabaster Gradient Fade */}
          <Box
            position="absolute"
            inset="0"
            bg="linear-gradient(180deg, rgba(251, 247, 242, 0.92) 0%, rgba(251, 247, 242, 0.55) 28%, rgba(251, 247, 242, 0.25) 50%, rgba(251, 247, 242, 0.88) 82%, rgba(251, 247, 242, 0.98) 100%)"
          />

          {/* Subtle Decorative Gold Botanical Line Art (Bottom Right) */}
          <Box
            position="absolute"
            bottom="12px"
            right="16px"
            opacity={0.35}
            pointerEvents="none"
            display={{ base: "none", sm: "block" }}
          >
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
              <path
                d="M10 90C30 80 50 60 70 30M70 30C60 40 45 42 40 40M70 30C75 45 70 60 65 65M50 60C40 55 35 45 38 35M50 60C55 70 52 80 48 85"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </Box>

          {/* Hero Content Overlay */}
          <Flex
            position="relative"
            zIndex="2"
            direction="column"
            align="center"
            justify="space-between"
            h="100%"
            minH={{ base: "480px", sm: "520px", md: "560px" }}
            py={{ base: 8, md: 10 }}
            px={{ base: 4, md: 8 }}
            textAlign="center"
          >
            {/* Top: Overline & Main Couple Title */}
            <Box maxW="700px">
              <Text
                fontSize={{ base: "0.72rem", sm: "0.82rem" }}
                fontWeight="700"
                letterSpacing="0.28em"
                color="var(--athar-maroon-dark, #5B1621)"
                textTransform="uppercase"
                mb={1}
              >
                {eventHeaderTag}
              </Text>

              <Text
                as="h1"
                fontFamily="'Playfair Display', 'Amiri', serif"
                fontStyle="italic"
                fontWeight="700"
                fontSize="clamp(2.4rem, 6vw, 3.8rem)"
                color="var(--athar-maroon-dark, #5B1621)"
                lineHeight="1.1"
                mb={2}
              >
                {coupleTitle}
              </Text>

              {/* Acoustic Waveform Divider */}
              <Flex align="center" justify="center" gap={3} my={2.5}>
                <Box h="1px" w={{ base: "40px", sm: "60px" }} bg="linear-gradient(90deg, transparent, #D4AF37)" />
                <svg width="34" height="16" viewBox="0 0 36 18" fill="none">
                  <path
                    d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
                    stroke="#6B1D28"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <Box h="1px" w={{ base: "40px", sm: "60px" }} bg="linear-gradient(90deg, #D4AF37, transparent)" />
              </Flex>

              {/* Taglines */}
              <Text
                fontSize={{ base: "0.85rem", sm: "0.95rem" }}
                fontWeight="600"
                color="var(--athar-text-body, #4A4240)"
                letterSpacing="0.04em"
              >
                {taglineLine1}
              </Text>
              <Text
                fontSize={{ base: "0.8rem", sm: "0.9rem" }}
                fontWeight="500"
                color="var(--athar-text-muted, #7A6F6D)"
                fontStyle="italic"
              >
                {taglineLine2}
              </Text>
            </Box>

            {/* Middle: 3 Metadata Pills */}
            <HStack
              gap={{ base: 2, sm: 4 }}
              flexWrap="wrap"
              justify="center"
              my={4}
            >
              {/* Date */}
              <HStack
                gap={1.5}
                bg="rgba(255, 255, 255, 0.88)"
                backdropFilter="blur(6px)"
                px={3.5}
                py={1.5}
                borderRadius="full"
                border="1px solid rgba(107, 29, 40, 0.1)"
                boxShadow="0 2px 8px rgba(107, 29, 40, 0.04)"
              >
                <FaCalendarAlt size={12} color="#6B1D28" />
                <Text fontSize="0.82rem" fontWeight="600" color="var(--athar-text-body, #4A4240)">
                  {eventDateDisplay}
                </Text>
              </HStack>

              {/* Location */}
              <HStack
                gap={1.5}
                bg="rgba(255, 255, 255, 0.88)"
                backdropFilter="blur(6px)"
                px={3.5}
                py={1.5}
                borderRadius="full"
                border="1px solid rgba(107, 29, 40, 0.1)"
                boxShadow="0 2px 8px rgba(107, 29, 40, 0.04)"
              >
                <FaMapMarkerAlt size={12} color="#6B1D28" />
                <Text fontSize="0.82rem" fontWeight="600" color="var(--athar-text-body, #4A4240)">
                  {eventLocationDisplay}
                </Text>
              </HStack>

              {/* Highlight Badge */}
              <HStack
                gap={1.5}
                bg="rgba(255, 255, 255, 0.88)"
                backdropFilter="blur(6px)"
                px={3.5}
                py={1.5}
                borderRadius="full"
                border="1px solid rgba(212, 175, 55, 0.4)"
                boxShadow="0 2px 8px rgba(212, 175, 55, 0.08)"
              >
                <FaHeart size={11} color="#D4AF37" />
                <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)">
                  {highlightBadge}
                </Text>
              </HStack>
            </HStack>

            {/* Bottom: Romantic Couple Quote */}
            <Box maxW="580px" mx="auto" px={2}>
              <Text
                fontFamily="'Playfair Display', 'Amiri', serif"
                fontStyle="italic"
                fontSize={{ base: "1.02rem", sm: "1.18rem" }}
                color="var(--athar-text-title, #231F20)"
                lineHeight="1.5"
                mb={1}
                dir="auto"
              >
                “{coupleQuote}”
              </Text>
              <Text
                fontSize="0.82rem"
                fontWeight="600"
                color="var(--athar-maroon, #6B1D28)"
                letterSpacing="0.05em"
              >
                – {quoteAuthor || coupleTitle}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
