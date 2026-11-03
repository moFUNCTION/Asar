import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { FaImages, FaPlay, FaBookOpen, FaHeart } from "react-icons/fa";
import type { MemoryTabType } from "./types";

interface MemoryTabsProps {
  activeTab: MemoryTabType;
  onSelectTab: (tab: MemoryTabType) => void;
}

export const MemoryTabs: React.FC<MemoryTabsProps> = ({ activeTab, onSelectTab }) => {
  const tabs: Array<{
    id: MemoryTabType;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "audio",
      label: "Audio Messages",
      icon: (
        <svg width="22" height="14" viewBox="0 0 24 14" fill="none">
          <path
            d="M1 7H4L7 1L10 13L13 3L16 11L19 5L21 7H23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "photos",
      label: "Photos",
      icon: <FaImages size={16} />,
    },
    {
      id: "video",
      label: "Video Highlights",
      icon: <FaPlay size={14} />,
    },
    {
      id: "guestbook",
      label: "Guest Book",
      icon: <FaBookOpen size={15} />,
    },
    {
      id: "thankyou",
      label: "Thank You",
      icon: <FaHeart size={15} />,
    },
  ];

  return (
    <Box w="100%" maxW="1100px" mx="auto" my={{ base: 5, md: 7 }} px={{ base: 3, sm: 6 }}>
      <Flex
        align="center"
        justify={{ base: "flex-start", md: "space-between" }}
        gap={{ base: 2.5, sm: 3 }}
        overflowX="auto"
        py={2}
        px={1}
        css={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Flex
              key={tab.id}
              as="button"
              direction="column"
              align="center"
              justify="center"
              flex={{ base: "0 0 140px", md: "1" }}
              py={{ base: 3.5, md: 4 }}
              px={2}
              borderRadius="18px"
              cursor="pointer"
              transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
              bg={isActive ? "var(--athar-maroon, #6B1D28)" : "#F4EFEA"}
              color={isActive ? "#FFFFFF" : "var(--athar-text-body, #4A4240)"}
              border="1px solid"
              borderColor={isActive ? "var(--athar-maroon, #6B1D28)" : "rgba(107, 29, 40, 0.08)"}
              boxShadow={
                isActive
                  ? "0 8px 24px -6px rgba(107, 29, 40, 0.35)"
                  : "0 2px 6px rgba(0, 0, 0, 0.02)"
              }
              transform={isActive ? "translateY(-2px)" : "none"}
              onClick={() => onSelectTab(tab.id)}
              _hover={{
                bg: isActive ? "var(--athar-maroon-dark, #5B1621)" : "#EDE6DC",
                transform: "translateY(-2px)",
              }}
            >
              <Box mb={1.5} color={isActive ? "#FFFFFF" : "var(--athar-text-body, #4A4240)"}>
                {tab.icon}
              </Box>
              <Text
                fontSize={{ base: "0.82rem", sm: "0.88rem" }}
                fontWeight={isActive ? "700" : "600"}
                whiteSpace="nowrap"
                letterSpacing="0.02em"
              >
                {tab.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
