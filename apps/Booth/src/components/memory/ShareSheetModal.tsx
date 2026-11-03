import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { FaTimes, FaQrcode, FaCopy, FaCheck, FaWhatsapp, FaDownload } from "react-icons/fa";

interface ShareSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupleTitle: string;
  slug: string;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({
  isOpen,
  onClose,
  coupleTitle,
  slug,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = `${window.location.origin}${window.location.pathname}?memory=${slug}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = `استمعوا إلى ذكريات ورسائل فرح ${coupleTitle} عبر منصة أثر:\n${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownloadQr = () => {
    const link = document.createElement("a");
    link.href = qrApiUrl;
    link.download = `Athar_Memory_QR_${slug}.png`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="120"
      bg="rgba(15, 10, 12, 0.75)"
      backdropFilter="blur(14px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={onClose}
    >
      <Box
        maxW="480px"
        w="100%"
        bg="#FBF7F2"
        borderRadius="28px"
        p={{ base: 6, sm: 8 }}
        boxShadow="0 25px 60px rgba(0,0,0,0.3)"
        border="1px solid rgba(107, 29, 40, 0.12)"
        textAlign="center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5}>
          <HStack gap={2}>
            <FaQrcode color="#6B1D28" size={18} />
            <Text fontSize="1.15rem" fontWeight="700" color="var(--athar-text-title, #231F20)">
              Share Memory Vault
            </Text>
          </HStack>
          <Button
            variant="plain"
            size="sm"
            p={1}
            color="#7A6F6D"
            onClick={onClose}
            aria-label="Close Share Modal"
          >
            <FaTimes size={16} />
          </Button>
        </Flex>

        {/* QR Code Container */}
        <Box
          mx="auto"
          w="220px"
          h="220px"
          p={3}
          bg="white"
          borderRadius="24px"
          border="2px solid rgba(212, 175, 55, 0.4)"
          boxShadow="0 8px 24px rgba(107, 29, 40, 0.08)"
          mb={4}
        >
          <Image
            src={qrApiUrl}
            alt="QR Code to Memory Page"
            w="100%"
            h="100%"
            borderRadius="14px"
          />
        </Box>

        <Text fontSize="1rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)">
          {coupleTitle}
        </Text>
        <Text fontSize="0.82rem" color="var(--athar-text-muted, #7A6F6D)" mb={5}>
          Scan with any mobile camera to listen and explore all audio memories.
        </Text>

        {/* Action Buttons */}
        <Flex direction="column" gap={2.5}>
          <Button
            onClick={handleCopy}
            w="100%"
            py={3.5}
            borderRadius="full"
            bg="white"
            border="1.5px solid rgba(107, 29, 40, 0.15)"
            color="var(--athar-text-title, #231F20)"
            fontWeight="600"
            fontSize="0.9rem"
            _hover={{ bg: "#F4EFEA", borderColor: "var(--athar-maroon, #6B1D28)" }}
          >
            {copied ? (
              <FaCheck style={{ marginRight: "8px", color: "#2E7D32" }} />
            ) : (
              <FaCopy style={{ marginRight: "8px", color: "#6B1D28" }} />
            )}
            {copied ? "Memory Link Copied!" : "Copy Memory Link"}
          </Button>

          <Button
            onClick={handleWhatsApp}
            w="100%"
            py={3.5}
            borderRadius="full"
            bg="#25D366"
            color="white"
            fontWeight="700"
            fontSize="0.9rem"
            _hover={{ bg: "#1EBE5D", transform: "translateY(-1px)" }}
            boxShadow="0 4px 12px rgba(37, 211, 102, 0.25)"
          >
            <FaWhatsapp style={{ marginRight: "8px" }} size={16} />
            Share on WhatsApp
          </Button>

          <Button
            onClick={handleDownloadQr}
            variant="plain"
            size="sm"
            color="var(--athar-maroon, #6B1D28)"
            fontWeight="600"
            fontSize="0.85rem"
            mt={1}
            _hover={{ textDecoration: "underline" }}
          >
            <FaDownload style={{ marginRight: "6px" }} />
            Download QR Code (PNG)
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
