import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import { FaCrown, FaExternalLinkAlt, FaBars, FaTimes } from "react-icons/fa";

export interface InvitationHeaderProps {
  onOpenBooking: () => void;
  onPreviewEvent?: (slug: string) => void;
}

export const InvitationHeader: React.FC<InvitationHeaderProps> = ({
  onOpenBooking,
  onPreviewEvent,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "المناسبات والتصاميم", href: "#occasions" },
    { label: "مميزات النظام", href: "#features" },
    { label: "صندوق الردود وكود QR", href: "#mailbox-qr" },
    { label: "الباقات والأسعار", href: "#packages" },
    { label: "الإضافات الملكية", href: "#addons" },
  ];

  const handleLiveDemo = () => {
    if (onPreviewEvent) {
      onPreviewEvent("omar-and-layla");
    } else {
      const el = document.getElementById("occasions");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="50"
      bg="rgba(251, 247, 242, 0.88)"
      backdropFilter="blur(16px)"
      borderBottom="1px solid rgba(107, 29, 40, 0.08)"
      boxShadow="0 4px 20px -8px rgba(107, 29, 40, 0.06)"
      dir="rtl"
      transition="all 0.3s ease"
    >
      <Box maxW="1320px" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
        <Flex h={{ base: "72px", md: "84px" }} align="center" justify="space-between">
          {/* Brand Logo & Monogram */}
          <a
            href="#"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
            }}
          >
            <Flex
              w={{ base: "42px", md: "48px" }}
              h={{ base: "42px", md: "48px" }}
              borderRadius="full"
              bg="var(--athar-maroon, #6B1D28)"
              color="#D4AF37"
              align="center"
              justify="center"
              fontSize={{ base: "1.25rem", md: "1.45rem" }}
              fontWeight="900"
              fontFamily="var(--font-arabic-display, 'Amiri', serif)"
              boxShadow="0 6px 18px rgba(107, 29, 40, 0.25)"
              border="1.5px solid rgba(212, 175, 55, 0.45)"
            >
              أ
            </Flex>
            <Box>
              <Text
                fontFamily="var(--font-arabic-display, 'Amiri', serif)"
                fontSize={{ base: "1.25rem", md: "1.45rem" }}
                fontWeight="800"
                color="var(--athar-text-title, #231F20)"
                lineHeight="1.1"
              >
                أَثَـــر <Text as="span" color="#6B1D28" fontSize="0.95em">للدعوات</Text>
              </Text>
              <Text
                fontSize={{ base: "0.68rem", md: "0.74rem" }}
                fontWeight="600"
                color="var(--athar-text-muted, #7A6F6D)"
                letterSpacing="0.05em"
              >
                مواقع دعوات تفاعلية وبطاقات QR فاخرة
              </Text>
            </Box>
          </a>

          {/* Desktop Navigation Links */}
          <HStack gap={6} display={{ base: "none", xl: "flex" }}>
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: "var(--athar-text-body, #4A4240)",
                  textDecoration: "none",
                  padding: "8px 4px",
                  transition: "all 0.2s ease",
                }}
              >
                {item.label}
              </a>
            ))}
          </HStack>

          {/* Action Buttons */}
          <HStack gap={{ base: 2, sm: 3 }}>
            {/* Live Demo Button */}
            <Button
              onClick={handleLiveDemo}
              variant="outline"
              size={{ base: "sm", md: "md" }}
              borderRadius="full"
              border="1px solid rgba(212, 175, 55, 0.45)"
              bg="rgba(255, 255, 255, 0.9)"
              color="var(--athar-maroon, #6B1D28)"
              fontSize={{ base: "0.82rem", md: "0.9rem" }}
              fontWeight="700"
              px={{ base: 3, sm: 5 }}
              gap={2}
              transition="all 0.2s ease"
              _hover={{
                bg: "white",
                borderColor: "var(--athar-maroon, #6B1D28)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(107, 29, 40, 0.08)",
              }}
            >
              <Text as="span" display={{ base: "none", sm: "inline" }}>
                معاينة دعوة حية
              </Text>
              <Text as="span" display={{ base: "inline", sm: "none" }}>
                معاينة
              </Text>
              <FaExternalLinkAlt size={11} style={{ opacity: 0.8 }} />
            </Button>

            {/* Primary Order CTA */}
            <Button
              onClick={onOpenBooking}
              size={{ base: "sm", md: "md" }}
              borderRadius="full"
              bg="var(--athar-maroon, #6B1D28)"
              color="white"
              fontSize={{ base: "0.82rem", md: "0.92rem" }}
              fontWeight="700"
              px={{ base: 3.5, sm: 6 }}
              boxShadow="0 4px 16px rgba(107, 29, 40, 0.28)"
              gap={2}
              transition="all 0.2s ease"
              _hover={{
                bg: "var(--athar-maroon-dark, #5B1621)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(107, 29, 40, 0.36)",
              }}
            >
              <FaCrown size={12} color="#D4AF37" />
              <Text as="span" display={{ base: "none", sm: "inline" }}>
                اطلب موقع دعوتك الآن
              </Text>
              <Text as="span" display={{ base: "inline", sm: "none" }}>
                اطلب الآن
              </Text>
            </Button>

            {/* Mobile Hamburger Button */}
            <Button
              display={{ base: "flex", xl: "none" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="outline"
              size="sm"
              borderRadius="full"
              border="1px solid rgba(107, 29, 40, 0.15)"
              bg="rgba(255, 255, 255, 0.8)"
              color="var(--athar-text-title, #231F20)"
              px={3}
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <Box
          display={{ base: "block", xl: "none" }}
          bg="rgba(251, 247, 242, 0.98)"
          borderTop="1px solid rgba(107, 29, 40, 0.08)"
          px={6}
          py={5}
          boxShadow="0 15px 30px rgba(107, 29, 40, 0.08)"
        >
          <Flex direction="column" gap={3}>
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "var(--athar-text-body, #4A4240)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </a>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default InvitationHeader;
