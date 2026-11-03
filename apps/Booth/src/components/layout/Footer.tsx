import React from "react";
import { Box, Flex, Text, HStack, Image } from "@chakra-ui/react";
import { FaInstagram, FaTiktok, FaFacebook } from "react-icons/fa";
import { BlurText } from "@repo/ui-components";

export const Footer: React.FC = () => {
  return (
    <Box
      as="footer"
      bg="#1F1A1C"
      color="white"
      pt={{ base: 14, md: 20 }}
      pb={10}
      px={{ base: 5, md: 10, lg: 16 }}
      position="relative"
      overflow="hidden"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          gap={6}
          pb={12}
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
        >
          {/* Logo Mark */}
          <HStack gap={3} justify="center">
            <Image
              src="/assets/logo-main.png"
              alt="شعار أثر"
              h="58px"
              filter="brightness(0) invert(1)"
            />
          </HStack>

          <BlurText
            text="أَثَـــر لِذِكْرَيَـــات هَاتِـــف الضُّيُـــوف"
            delay={100}
            animateBy="words"
            direction="bottom"
            className="font-arabic-display"
            paragraphStyles={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          />

          <BlurText
            text="نفس الأشخاص. أصوات مختلفة. أثر يدوم."
            delay={80}
            animateBy="words"
            direction="top"
            className="font-arabic-display"
            paragraphStyles={{
              fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
              color: "#D4AF37",
              fontWeight: 700,
              textAlign: "center",
            }}
          />

          {/* Nav Quick Links */}
          <HStack
            gap={{ base: 3, md: 7 }}
            flexWrap="wrap"
            justify="center"
            fontSize="0.95rem"
            color="rgba(255, 255, 255, 0.8)"
            pt={2}
          >
            {[
              { label: "الرئيسية", href: "#hero" },
              { label: "عن أثر", href: "#about" },
              { label: "ليه أثر؟", href: "#why-us" },
              { label: "باقاتنا", href: "#packages" },
              { label: "كيف يعمل؟", href: "#how-it-works" },
              { label: "أصوات حقيقية", href: "#voices" },
              { label: "المعرض", href: "#gallery" },
              { label: "تواصل معنا", href: "#contact" },
            ].map((link) => (
              <Box
                asChild
                key={link.label}
                textDecoration="none"
                color="inherit"
                transition="color 0.2s ease"
                fontWeight="600"
                _hover={{ color: "#D4AF37" }}
              >
                <a href={link.href}>{link.label}</a>
              </Box>
            ))}
          </HStack>

          {/* Social Links */}
          <HStack gap={4} pt={2}>
            <Box asChild color="white" _hover={{ color: "#D4AF37" }}>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram size={19} />
              </a>
            </Box>
            <Box asChild color="white" _hover={{ color: "#D4AF37" }}>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok size={19} />
              </a>
            </Box>
            <Box asChild color="white" _hover={{ color: "#D4AF37" }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook size={19} />
              </a>
            </Box>
          </HStack>
        </Flex>

        {/* Bottom Metadata Strip */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          pt={8}
          gap={4}
          fontSize="0.88rem"
          color="rgba(255, 255, 255, 0.55)"
          textAlign={{ base: "center", md: "right" }}
        >
          <Text>
            الإسكندرية، الساحل الشمالي، القاهرة | 0100 000 0000 | hello@athar.audio
          </Text>

          <BlurText
            text="أَصْوَات تَصْنَع غَداً أَجْمَل. © ٢٠٢٦ أثر. جميع الحقوق محفوظة."
            delay={80}
            animateBy="words"
            className="font-arabic-display"
            paragraphStyles={{
              color: "rgba(255, 255, 255, 0.7)",
              fontWeight: 700,
              fontSize: "0.88rem",
            }}
          />
        </Flex>
      </Box>
    </Box>
  );
};
