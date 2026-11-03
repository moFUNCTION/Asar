import React, { useState } from "react";
import { Box, Flex, HStack, Text, Button, Image } from "@chakra-ui/react";
import { FaBars, FaTimes, FaLock, FaVolumeUp, FaImages, FaVideo, FaBookOpen, FaHeart, FaHome } from "react-icons/fa";
import type { MemoryTabType } from "./types";

interface MemoryHeaderProps {
  coupleTitle: string;
  totalAudioCount: number;
  activeTab: MemoryTabType;
  onSelectTab: (tab: MemoryTabType) => void;
  onBackToLanding?: () => void;
  isPrivateLocked?: boolean;
  onToggleLock?: () => void;
}

export const MemoryHeader: React.FC<MemoryHeaderProps> = ({
  coupleTitle,
  totalAudioCount,
  activeTab,
  onSelectTab,
  onBackToLanding,
  isPrivateLocked = false,
  onToggleLock,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navItems: Array<{ id: MemoryTabType; label: string; icon: React.ReactNode }> = [
    { id: "audio", label: "Audio Messages", icon: <FaVolumeUp /> },
    { id: "photos", label: "Photos", icon: <FaImages /> },
    { id: "video", label: "Video Highlights", icon: <FaVideo /> },
    { id: "guestbook", label: "Guest Book", icon: <FaBookOpen /> },
    { id: "thankyou", label: "Thank You", icon: <FaHeart /> },
  ];

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="40"
        w="100%"
        bg="rgba(251, 247, 242, 0.94)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(107, 29, 40, 0.08)"
        px={{ base: 4, md: 8 }}
        py={3.5}
        transition="all 0.3s ease"
      >
        <Flex maxW="1280px" mx="auto" align="center" justify="space-between">
          {/* Left: Hamburger Menu Icon */}
          <HStack gap={3}>
            <Button
              variant="plain"
              p={2}
              minW="40px"
              h="40px"
              borderRadius="12px"
              bg="rgba(107, 29, 40, 0.04)"
              color="var(--athar-maroon, #6B1D28)"
              aria-label="Navigation Menu"
              onClick={() => setIsDrawerOpen(true)}
              _hover={{ bg: "rgba(107, 29, 40, 0.1)" }}
            >
              <FaBars size={18} />
            </Button>

            {onBackToLanding && (
              <Button
                variant="outline"
                size="xs"
                display={{ base: "none", md: "inline-flex" }}
                borderRadius="full"
                borderColor="rgba(107, 29, 40, 0.15)"
                color="var(--athar-maroon, #6B1D28)"
                onClick={onBackToLanding}
                px={3}
                py={1}
                _hover={{ bg: "white" }}
              >
                <FaHome style={{ marginRight: "6px" }} />
                Athar Home
              </Button>
            )}
          </HStack>

          {/* Center: Athar Calligraphy Logo */}
          <Flex direction="column" align="center" justify="center" userSelect="none" cursor="pointer" onClick={onBackToLanding}>
            <HStack gap={1.5} align="center">
              {logoError ? (
                <Text fontSize="1.3rem" fontWeight="bold" color="#6B1D28">أثر</Text>
              ) : (
                <Image
                  src="/assets/logo-main.png"
                  alt="Athar Logo"
                  h="26px"
                  w="auto"
                  onError={() => setLogoError(true)}
                />
              )}
            </HStack>
            <Text
              fontSize="0.65rem"
              letterSpacing="0.18em"
              fontWeight="700"
              color="var(--athar-text-muted, #7A6F6D)"
              textTransform="uppercase"
              mt={0.5}
            >
              ATHAR AUDIO MEMORIES
            </Text>
          </Flex>

          {/* Right: Padlock Icon + Private Memory Label */}
          <HStack gap={2.5} align="center">
            <Box
              w="32px"
              h="32px"
              borderRadius="8px"
              bg="var(--athar-maroon, #6B1D28)"
              color="#F1E5D1"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 2px 8px rgba(107, 29, 40, 0.2)"
              cursor={onToggleLock ? "pointer" : "default"}
              onClick={onToggleLock}
              title={isPrivateLocked ? "Memory is PIN protected" : "Public view"}
            >
              <FaLock size={13} />
            </Box>
            <Flex direction="column" align="flex-end" textAlign="right">
              <Text
                fontSize="0.7rem"
                fontWeight="500"
                color="var(--athar-text-muted, #7A6F6D)"
                lineHeight="1.1"
              >
                A Private Memory
              </Text>
              <Text
                fontSize="0.82rem"
                fontWeight="700"
                color="var(--athar-text-title, #231F20)"
                lineHeight="1.2"
              >
                For {coupleTitle}
              </Text>
            </Flex>
          </HStack>
        </Flex>
      </Box>

      {/* Slide-over Quick Navigation Drawer */}
      {isDrawerOpen && (
        <Box
          position="fixed"
          inset="0"
          zIndex="100"
          bg="rgba(15, 10, 12, 0.65)"
          backdropFilter="blur(8px)"
          display="flex"
          justifyContent="flex-start"
          onClick={() => setIsDrawerOpen(false)}
        >
          <Box
            w={{ base: "82%", sm: "340px" }}
            h="100%"
            bg="#FBF7F2"
            p={6}
            boxShadow="0 20px 40px rgba(0,0,0,0.3)"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <Box>
              {/* Drawer Header */}
              <Flex align="center" justify="space-between" pb={4} borderBottom="1px solid rgba(107, 29, 40, 0.1)">
                <Flex align="center" gap={2}>
                  <Image src="/assets/logo-main.png" alt="Athar" h="24px" />
                  <Text fontSize="0.95rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)">
                    {coupleTitle}
                  </Text>
                </Flex>
                <Button
                  variant="plain"
                  p={1}
                  size="sm"
                  color="#7A6F6D"
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Close Drawer"
                >
                  <FaTimes size={16} />
                </Button>
              </Flex>

              {/* Memory Summary Pill */}
              <Box my={5} p={3.5} bg="white" borderRadius="16px" border="1px solid rgba(107, 29, 40, 0.08)">
                <Text fontSize="0.78rem" color="#7A6F6D" textTransform="uppercase" letterSpacing="0.08em">
                  Vault Contents
                </Text>
                <HStack justify="space-between" mt={1}>
                  <Text fontSize="1.1rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
                    {totalAudioCount} Voices Recorded
                  </Text>
                  <HStack gap={1} color="#D4AF37" fontSize="0.8rem">
                    <FaLock size={11} />
                    <Text fontWeight="600">{isPrivateLocked ? "PIN Locked" : "Secured"}</Text>
                  </HStack>
                </HStack>
              </Box>

              {/* Navigation List */}
              <Text fontSize="0.75rem" fontWeight="700" color="#7A6F6D" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                Jump to Section
              </Text>
              <Flex direction="column" gap={1.5}>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="plain"
                      justifyContent="flex-start"
                      py={3}
                      px={4}
                      borderRadius="12px"
                      bg={isActive ? "var(--athar-maroon, #6B1D28)" : "transparent"}
                      color={isActive ? "white" : "var(--athar-text-body, #4A4240)"}
                      fontWeight={isActive ? "700" : "500"}
                      fontSize="0.92rem"
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsDrawerOpen(false);
                      }}
                      _hover={{
                        bg: isActive ? "var(--athar-maroon, #6B1D28)" : "rgba(107, 29, 40, 0.06)",
                      }}
                    >
                      <Box as="span" mr={3} color={isActive ? "white" : "#6B1D28"}>
                        {item.icon}
                      </Box>
                      {item.label}
                    </Button>
                  );
                })}
              </Flex>
            </Box>

            {/* Bottom Actions */}
            <Box pt={4} borderTop="1px solid rgba(107, 29, 40, 0.1)">
              {onToggleLock && (
                <Button
                  w="100%"
                  variant="outline"
                  size="sm"
                  borderRadius="full"
                  mb={2.5}
                  borderColor="rgba(212, 175, 55, 0.5)"
                  color="var(--athar-maroon, #6B1D28)"
                  onClick={() => {
                    onToggleLock();
                    setIsDrawerOpen(false);
                  }}
                >
                  <FaLock style={{ marginRight: "6px" }} />
                  {isPrivateLocked ? "Unlock Vault Preview" : "Enable PIN Lock Preview"}
                </Button>
              )}

              {onBackToLanding && (
                <Button
                  w="100%"
                  bg="var(--athar-maroon, #6B1D28)"
                  color="white"
                  size="sm"
                  borderRadius="full"
                  onClick={() => {
                    onBackToLanding();
                    setIsDrawerOpen(false);
                  }}
                >
                  <FaHome style={{ marginRight: "6px" }} />
                  Back to Athar Homepage
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};
