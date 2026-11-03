import React from "react";
import { Box, Flex, HStack, Text, Badge } from "@chakra-ui/react";

export type AdminTab = "overview" | "plans" | "orders" | "booth-studio" | "invitation-studio";

export interface AdminShellProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingPaymentsCount?: number;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  activeTab,
  onSelectTab,
  pendingPaymentsCount = 0,
  children,
}) => {
  const tabs: { id: AdminTab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "✦" },
    { id: "plans", label: "Plans & Limits", icon: "⚙️" },
    {
      id: "orders",
      label: "Orders & Payments",
      icon: "💳",
      count: pendingPaymentsCount,
    },
    { id: "booth-studio", label: "Booth Memory Studio", icon: "🎙️" },
    { id: "invitation-studio", label: "Invitation Builder", icon: "✉️" },
  ];

  return (
    <Box minH="100vh" bg="var(--athar-bg-primary)" color="var(--athar-text-title)">
      {/* Top Luxury Studio Header */}
      <Box
        as="header"
        bg="rgba(255, 255, 255, 0.92)"
        borderBottom="1px solid rgba(107, 29, 40, 0.08)"
        boxShadow="0 4px 20px -6px rgba(107, 29, 40, 0.06)"
        backdropFilter="blur(14px)"
        position="sticky"
        top={0}
        zIndex={100}
        px={{ base: 4, md: 8 }}
        py={3.5}
      >
        <Flex
          maxW="1400px"
          mx="auto"
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={4}
        >
          {/* Brand Identity */}
          <HStack gap={3.5} cursor="pointer" onClick={() => onSelectTab("overview")}>
            <Box
              w="42px"
              h="42px"
              borderRadius="12px"
              bg="var(--athar-maroon)"
              color="#ffffff"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="900"
              fontSize="1.1rem"
              fontFamily="var(--font-arabic-display)"
              boxShadow="0 4px 12px rgba(107, 29, 40, 0.28)"
              border="1px solid rgba(212, 175, 55, 0.4)"
            >
              أثر
            </Box>
            <Box>
              <HStack gap={2}>
                <Text
                  fontSize="1.15rem"
                  fontWeight="800"
                  letterSpacing="0.04em"
                  color="var(--athar-maroon)"
                  fontFamily="var(--font-arabic-display)"
                  lineHeight="1.2"
                >
                  ASAR
                </Text>
                <Badge
                  variant="outline"
                  borderColor="rgba(212, 175, 55, 0.5)"
                  color="#8C6F12"
                  bg="rgba(212, 175, 55, 0.12)"
                  px={2}
                  py={0.5}
                  fontSize="0.7rem"
                  fontWeight="800"
                  borderRadius="full"
                >
                  ADMIN CONSOLE
                </Badge>
              </HStack>
              <Text fontSize="0.75rem" color="var(--athar-text-muted)" fontWeight="500">
                Operations, Plan Quotas & Event Memory Pipeline
              </Text>
            </Box>
          </HStack>

          {/* Quick Ecosystem Links */}
          <HStack gap={2} display={{ base: "none", lg: "flex" }}>
            <Text fontSize="0.78rem" color="var(--athar-text-muted)" fontWeight="600" mr={1}>
              Ecosystem:
            </Text>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "var(--athar-text-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              Main Hub (:3000) ↗
            </a>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "var(--athar-text-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              🎙️ Booth App (:3002) ↗
            </a>
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                color: "var(--athar-text-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              ✉️ Invitation App (:3003) ↗
            </a>
          </HStack>

          {/* Admin Avatar Badge */}
          <HStack gap={2.5}>
            <Box
              w="9px"
              h="9px"
              borderRadius="full"
              bg="var(--athar-status-success)"
              boxShadow="0 0 0 3px rgba(30, 111, 80, 0.18)"
            />
            <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-maroon)">
              Concierge Operations
            </Text>
          </HStack>
        </Flex>

        {/* Tab Navigation Pill Strip */}
        <Box maxW="1400px" mx="auto" mt={3.5} pt={2} borderTop="1px solid rgba(107, 29, 40, 0.05)">
          <Flex gap={2} overflowX="auto" pb={1} css={{ "&::-webkit-scrollbar": { display: "none" } }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.55rem 1.15rem",
                    borderRadius: "9999px",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    border: isActive
                      ? "1px solid var(--athar-maroon)"
                      : "1px solid rgba(107, 29, 40, 0.1)",
                    backgroundColor: isActive ? "var(--athar-maroon)" : "rgba(255, 255, 255, 0.85)",
                    color: isActive ? "#ffffff" : "var(--athar-text-title)",
                    boxShadow: isActive ? "0 4px 14px rgba(107, 29, 40, 0.22)" : "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      style={{
                        marginLeft: "0.25rem",
                        padding: "0.15rem 0.55rem",
                        borderRadius: "9999px",
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        backgroundColor: isActive ? "#ffffff" : "var(--athar-maroon)",
                        color: isActive ? "var(--athar-maroon)" : "#ffffff",
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </Flex>
        </Box>
      </Box>

      {/* Main Studio Viewport */}
      <Box as="main" maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={6}>
        {children}
      </Box>

      {/* Luxury Footer */}
      <Box
        as="footer"
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={6}
        mt={10}
        borderTop="1px solid rgba(107, 29, 40, 0.08)"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Text fontSize="0.8rem" color="var(--athar-text-muted)">
            أثر — Athar Digital Memory & Event Hospitality Console · Port 3001
          </Text>
          <HStack gap={4}>
            <Text fontSize="0.78rem" color="var(--athar-text-muted)">
              Connected to Appwrite: <strong style={{ color: "var(--athar-maroon)" }}>asar-db</strong>
            </Text>
            <Text fontSize="0.78rem" color="var(--athar-gold-bright)" fontWeight="700">
              ✦ Warm Vintage Editorial Luxury
            </Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default AdminShell;
