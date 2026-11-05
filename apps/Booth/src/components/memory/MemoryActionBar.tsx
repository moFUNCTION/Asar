import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import { FaDownload, FaShareAlt, FaCheck, FaTimes } from "react-icons/fa";

interface MemoryActionBarProps {
  onOpenShareModal: () => void;
  totalAudioCount?: number;
}

export const MemoryActionBar: React.FC<MemoryActionBarProps> = ({
  onOpenShareModal,
  totalAudioCount = 86,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadAll = () => {
    setIsDownloading(true);
    // Simulate ZIP preparation
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1800);
  };

  return (
    <>
      <Box
        position="sticky"
        bottom="0"
        zIndex="35"
        w="100%"
        bg="rgba(251, 247, 242, 0.95)"
        backdropFilter="blur(16px)"
        borderTop="1px solid rgba(107, 29, 40, 0.1)"
        py={{ base: 2, sm: 3.5 }}
        px={{ base: 3, sm: 6 }}
        boxShadow="0 -10px 30px rgba(107, 29, 40, 0.05)"
      >
        <Box maxW="1100px" mx="auto">
          <Flex
            gap={{ base: 2, sm: 4 }}
            direction="row"
            align="center"
          >
            {/* Left Button: Download All Messages */}
            <Button
              as="button"
              flex="1"
              h="auto"
              py={{ base: 2, sm: 3.5 }}
              px={{ base: 2.5, sm: 5 }}
              borderRadius={{ base: "14px", sm: "18px" }}
              bg="#FFFFFF"
              border="1.5px solid rgba(107, 29, 40, 0.15)"
              boxShadow="0 4px 14px rgba(107, 29, 40, 0.05)"
              onClick={handleDownloadAll}
              disabled={isDownloading}
              cursor="pointer"
              transition="all 0.25s ease"
              _hover={{
                bg: "#FBF7F2",
                borderColor: "var(--athar-maroon, #6B1D28)",
                transform: "translateY(-2px)",
              }}
            >
              <HStack gap={{ base: 2, sm: 3.5 }} w="100%" justify={{ base: "center", sm: "flex-start" }}>
                <Flex
                  w={{ base: "30px", sm: "38px" }}
                  h={{ base: "30px", sm: "38px" }}
                  borderRadius="full"
                  bg="rgba(107, 29, 40, 0.06)"
                  color="var(--athar-maroon, #6B1D28)"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <FaDownload size={13} />
                </Flex>
                <Box textAlign="left">
                  <Text
                    fontSize={{ base: "0.82rem", sm: "0.95rem" }}
                    fontWeight="700"
                    color="var(--athar-maroon-dark, #5B1621)"
                    lineHeight="1.2"
                    whiteSpace="nowrap"
                  >
                    {isDownloading ? "Preparing..." : "Download All"}
                  </Text>
                  <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)" display={{ base: "none", md: "block" }}>
                    Keep your memories forever
                  </Text>
                </Box>
              </HStack>
            </Button>

            {/* Right Button: Share Love */}
            <Button
              as="button"
              flex="1"
              h="auto"
              py={{ base: 2, sm: 3.5 }}
              px={{ base: 2.5, sm: 5 }}
              borderRadius={{ base: "14px", sm: "18px" }}
              bg="var(--athar-maroon, #6B1D28)"
              color="white"
              border="1.5px solid var(--athar-maroon, #6B1D28)"
              boxShadow="0 6px 20px -4px rgba(107, 29, 40, 0.35)"
              onClick={onOpenShareModal}
              cursor="pointer"
              transition="all 0.25s ease"
              _hover={{
                bg: "var(--athar-maroon-dark, #5B1621)",
                transform: "translateY(-2px)",
              }}
            >
              <HStack gap={{ base: 2, sm: 3.5 }} w="100%" justify={{ base: "center", sm: "flex-start" }}>
                <Flex
                  w={{ base: "30px", sm: "38px" }}
                  h={{ base: "30px", sm: "38px" }}
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.15)"
                  color="#F1E5D1"
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <FaShareAlt size={13} />
                </Flex>
                <Box textAlign="left">
                  <Text fontSize={{ base: "0.82rem", sm: "0.95rem" }} fontWeight="700" color="white" lineHeight="1.2" whiteSpace="nowrap">
                    Share Love
                  </Text>
                  <Text fontSize="0.75rem" color="rgba(255, 255, 255, 0.8)" display={{ base: "none", md: "block" }}>
                    With Family & Friends
                  </Text>
                </Box>
              </HStack>
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Download Success Banner Modal */}
      {downloadSuccess && (
        <Box
          position="fixed"
          bottom="100px"
          left="50%"
          transform="translateX(-50%)"
          zIndex="110"
          bg="#231A1E"
          color="white"
          py={3}
          px={6}
          borderRadius="full"
          border="1px solid #D4AF37"
          boxShadow="0 10px 30px rgba(0,0,0,0.3)"
          display="flex"
          alignItems="center"
          gap={3}
        >
          <FaCheck color="#D4AF37" size={16} />
          <Text fontSize="0.88rem" fontWeight="600">
            All {totalAudioCount} voice messages packaged into ZIP archive!
          </Text>
          <Button
            variant="plain"
            size="xs"
            p={1}
            color="#A09895"
            onClick={() => setDownloadSuccess(false)}
            aria-label="Close message"
          >
            <FaTimes size={12} />
          </Button>
        </Box>
      )}
    </>
  );
};
