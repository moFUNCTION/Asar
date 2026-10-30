import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { FaWhatsapp } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { CardNav } from "@repo/ui-components";

interface HeaderProps {
  onOpenBooking: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleCardNavCta = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest(".card-nav-cta-button")) {
        e.preventDefault();
        onOpenBooking();
      }
    };

    document.addEventListener("click", handleCardNavCta);
    return () => document.removeEventListener("click", handleCardNavCta);
  }, [onOpenBooking]);

  const navItems = [
    { label: "عن أثر", href: "#about" },
    { label: "ليه تختارنا؟", href: "#why-us" },
    { label: "باقاتنا", href: "#packages" },
    { label: "كيف يعمل؟", href: "#how-it-works" },
    { label: "أصوات حقيقية", href: "#voices" },
    { label: "المعرض", href: "#gallery" },
    { label: "الأسئلة الشائعة", href: "#faq" },
  ];

  // CardNav structured items in Arabic
  const cardNavItems = [
    {
      label: "استكشف أثر",
      bgColor: "rgba(251, 247, 242, 0.96)",
      textColor: "#231F20",
      links: [
        {
          label: "أكثر من مجرد هاتف",
          href: "#about",
          ariaLabel: "عن هاتف أثر",
        },
        { label: "ليه تختار أثر؟", href: "#why-us", ariaLabel: "مميزات أثر" },
        {
          label: "كيف يعمل الهاتف؟",
          href: "#how-it-works",
          ariaLabel: "خطوات التجربة",
        },
      ],
    },
    {
      label: "الباقات والعروض",
      bgColor: "#5B1621",
      textColor: "#FFFFFF",
      links: [
        {
          label: "لحظة أثر (5,500 ج.م)",
          href: "#packages",
          ariaLabel: "باقة لحظة أثر",
        },
        {
          label: "حكاية أثر (7,000 ج.م)",
          href: "#packages",
          ariaLabel: "باقة حكاية أثر",
        },
        {
          label: "إضافات وديكور مخصص",
          href: "#addons",
          ariaLabel: "إضافات خاصة",
        },
      ],
    },
    {
      label: "الذكريات والتواصل",
      bgColor: "#5b162223",
      textColor: "#231F20",
      links: [
        {
          label: "تسجيلات صوتية حية",
          href: "#voices",
          ariaLabel: "أصوات حقيقية",
        },
        {
          label: "معرض لحظات الفرح",
          href: "#gallery",
          ariaLabel: "صور المناسبات",
        },
        {
          label: "الأسئلة الشائعة والتواصل",
          href: "#faq",
          ariaLabel: "الأسئلة الشائعة",
        },
      ],
    },
  ];

  return (
    <>
      {/* 1. STATIC TOP HEADER (RTL) */}
      <Box
        as="header"
        position="absolute"
        top="0"
        left="0"
        w="100%"
        zIndex="40"
        py={{ base: 3.5, md: 5 }}
        px={{ base: 5, md: 10, lg: 16 }}
        bg="transparent"
        transition="opacity 0.4s ease, transform 0.4s ease"
        opacity={isScrolled ? 0 : 1}
        transform={isScrolled ? "translateY(-20px)" : "translateY(0)"}
        pointerEvents={isScrolled ? "none" : "auto"}
      >
        <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
          {/* Brand Logo (Right in RTL) */}
          <HStack
            as="a"
            href="#"
            gap={3}
            textDecoration="none"
            cursor="pointer"
          >
            <Image
              src="/assets/logo-main.png"
              alt="أثر - ATHAR"
              h={{ base: "42px", md: "52px" }}
              objectFit="contain"
            />
            <Box display={{ base: "none", sm: "block" }}>
              <Text
                fontFamily="var(--font-arabic-display)"
                fontSize={{ base: "1.3rem", md: "1.5rem" }}
                fontWeight="700"
                color="var(--athar-text-title)"
                lineHeight="1.1"
              >
                أَثَـــر
              </Text>
              <Text
                fontSize="0.72rem"
                letterSpacing="0.08em"
                color="var(--athar-maroon)"
                fontWeight="700"
              >
                ذكريات صوتية حية
              </Text>
            </Box>
          </HStack>

          {/* Navigation Links (Middle - Desktop) */}
          <HStack
            as="nav"
            gap={{ md: 5, lg: 7 }}
            display={{ base: "none", md: "flex" }}
          >
            {navItems.map((item) => (
              <Box
                as="a"
                key={item.label}
                href={item.href}
                fontSize="0.95rem"
                fontWeight="600"
                color="var(--athar-text-title)"
                textDecoration="none"
                position="relative"
                py={1}
                transition="color 0.2s ease"
                _hover={{
                  color: "var(--athar-maroon)",
                }}
              >
                {item.label}
              </Box>
            ))}
          </HStack>

          {/* Action Group (Left in RTL) */}
          <HStack gap={{ base: 2, md: 3 }}>
            {/* WhatsApp Direct */}
            <Button
              as="a"
              href="https://wa.me/201000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D9%81%D8%B1%D9%8A%D9%82%20%D8%A3%D8%AB%D8%B1%D8%8C%20%D8%AD%D8%A7%D8%A8%D8%A8%20%D8%A3%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%20%D8%B9%D9%86%20%D8%AD%D8%AC%D8%B2%20%D9%87%D8%A7%D8%AA%D9%81%20%D8%A7%D9%84%D8%B0%D9%83%D8%B1%D9%8A%D8%A7%D8%AA%20%D8%A7%D9%84%D8%B5%D9%88%D8%AA%D9%8A."
              target="_blank"
              rel="noopener noreferrer"
              display={{ base: "none", sm: "inline-flex" }}
              size="sm"
              variant="outline"
              borderColor="rgba(212, 175, 55, 0.45)"
              color="var(--athar-text-title)"
              bg="rgba(255, 255, 255, 0.8)"
              borderRadius="full"
              px={4}
              fontSize="0.88rem"
              fontWeight="700"
              _hover={{
                bg: "white",
                borderColor: "#D4AF37",
                transform: "translateY(-1px)",
              }}
            >
              <FaWhatsapp style={{ color: "#25D366", marginLeft: "6px" }} />
              واتساب
            </Button>

            {/* Book Date Button */}
            <Button
              onClick={onOpenBooking}
              size={{ base: "sm", md: "md" }}
              className="btn-athar-primary"
              borderRadius="full"
              px={{ base: 5, md: 7 }}
              fontSize="0.95rem"
              fontWeight="700"
            >
              احجز موعدك
            </Button>

            {/* Mobile Hamburger Trigger */}
            <Box
              display={{ base: "block", md: "none" }}
              as="button"
              p={2}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              color="var(--athar-text-title)"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <HiX size={26} /> : <HiMenuAlt3 size={26} />}
            </Box>
          </HStack>
        </Flex>
      </Box>

      {/* 2. FLOATING CARD NAV (Visible when scrolled) */}
      <Box
        position="fixed"
        top="0"
        left="0"
        w="100%"
        zIndex="50"
        transition="opacity 0.35s ease, transform 0.35s ease"
        opacity={isScrolled ? 1 : 0}
        transform={isScrolled ? "translateY(0)" : "translateY(-15px)"}
        pointerEvents={isScrolled ? "auto" : "none"}
      >
        <CardNav
          logo="/assets/logo-main.png"
          logoAlt="شعار أثر"
          items={cardNavItems}
          baseColor="rgba(255, 255, 255, 0.94)"
          buttonBgColor="var(--athar-maroon)"
          buttonTextColor="#ffffff"
          menuColor="#231F20"
        />
      </Box>

      {/* 3. MOBILE MENU DRAWER (Screen 13 in screens-booth.jpeg) */}
      {isMobileMenuOpen && (
        <Box
          position="fixed"
          inset="0"
          zIndex="60"
          bg="rgba(91, 22, 33, 0.98)"
          color="white"
          p={6}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          backdropFilter="blur(25px)"
          dir="rtl"
        >
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Image
                src="/assets/logo-main.png"
                alt="أثر"
                h="40px"
                filter="brightness(0) invert(1)"
              />
              <Text
                fontFamily="var(--font-arabic-display)"
                fontSize="1.4rem"
                fontWeight="700"
              >
                أَثَـــر
              </Text>
            </HStack>
            <Box
              as="button"
              onClick={() => setIsMobileMenuOpen(false)}
              color="white"
              p={2}
              bg="rgba(255, 255, 255, 0.1)"
              borderRadius="full"
            >
              <HiX size={24} />
            </Box>
          </Flex>

          <Flex
            direction="column"
            gap={5}
            my="auto"
            align="center"
            textAlign="center"
          >
            {navItems.map((item) => (
              <Box
                as="a"
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                fontSize="1.4rem"
                fontFamily="var(--font-arabic-display)"
                fontWeight="700"
                color="#FFFFFF"
                textDecoration="none"
                _hover={{ color: "var(--athar-gold)" }}
              >
                {item.label}
              </Box>
            ))}
          </Flex>

          <Flex direction="column" gap={3}>
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBooking();
              }}
              w="100%"
              bg="white"
              color="var(--athar-maroon)"
              borderRadius="full"
              py={6}
              fontWeight="800"
              fontSize="1.05rem"
            >
              احجز موعدك الآن
            </Button>
            <Flex
              justify="center"
              gap={4}
              fontSize="0.95rem"
              opacity={0.8}
              pt={2}
            >
              <Text fontWeight="700" color="var(--athar-gold)">
                عربي
              </Text>
              <Text>|</Text>
              <Text fontWeight="600">EN</Text>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};
