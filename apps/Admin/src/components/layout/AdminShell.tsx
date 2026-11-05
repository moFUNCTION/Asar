import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export type AdminTab =
  | "overview"
  | "plans"
  | "orders"
  | "booth-studio"
  | "invitation-studio"
  | "mailbox"
  | "users";

export interface AdminShellProps {
  activeTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  pendingPaymentsCount?: number;
  pendingRsvpsCount?: number;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  activeTab,
  onSelectTab,
  pendingPaymentsCount = 0,
  pendingRsvpsCount = 0,
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isVerifiedAdmin,
    logout,
    isLoading: authLoading,
  } = useAdminAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActiveTabFromLocation = (): AdminTab => {
    const path = location.pathname;
    if (path.startsWith("/plans")) return "plans";
    if (path.startsWith("/orders")) return "orders";
    if (path.startsWith("/booth-studio")) return "booth-studio";
    if (path.startsWith("/invitation-studio")) return "invitation-studio";
    if (path.startsWith("/mailbox")) return "mailbox";
    if (path.startsWith("/users")) return "users";
    return "overview";
  };

  const currentTab = activeTab || getActiveTabFromLocation();

  const handleTabClick = (tabId: AdminTab) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    navigate(`/${tabId}`);
    setMobileMenuOpen(false);
  };

  const tabs: { id: AdminTab; label: string; icon: string; count?: number }[] =
    [
      { id: "overview", label: "لوحة العمليات والملخص", icon: "✦" },
      { id: "plans", label: "بناء وتعديل الباقات", icon: "⚙️" },
      {
        id: "orders",
        label: "الطلبات والمدفوعات",
        icon: "💳",
        count: pendingPaymentsCount,
      },
      { id: "booth-studio", label: "استوديو هاتف أثر", icon: "🎙️" },
      { id: "invitation-studio", label: "استوديو الدعوات الرقمية", icon: "✉️" },
      {
        id: "mailbox",
        label: "صندوق تأكيدات الحضور",
        icon: "📬",
        count: pendingRsvpsCount,
      },
      { id: "users", label: "المستخدمين والأدوار", icon: "👥" },
    ];

  // If unauthenticated or non-admin in production, show the Luxury Admin Authorization Card
  if (!authLoading && user && !isVerifiedAdmin) {
    return (
      <Box
        minH="100vh"
        bg="var(--athar-bg-primary)"
        dir="rtl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Box
          maxW="480px"
          w="100%"
          bg="#ffffff"
          borderRadius="20px"
          p={8}
          textAlign="center"
          border="1px solid var(--athar-card-border)"
          boxShadow="var(--athar-shadow-elevated)"
        >
          <Text fontSize="3rem" mb={3}>
            🔒
          </Text>
          <Text
            fontSize="1.4rem"
            fontWeight="900"
            color="var(--athar-maroon)"
            fontFamily="var(--font-arabic-display)"
            mb={2}
          >
            منطقة مخصصة للمسؤولين
          </Text>
          <Text fontSize="0.9rem" color="var(--athar-text-muted)" mb={6}>
            أنت مسجل حالياً كـ <strong>"{user.name || user.email}"</strong>{" "}
            برتبة عميل. تتطلب لوحة الإدارة صلاحيات فريق المسؤولين (Admins).
          </Text>
          <Flex gap={3} justify="center">
            <Button
              onClick={() => logout()}
              className="btn-athar-secondary"
              fontSize="0.85rem"
            >
              تسجيل الخروج والتبديل
            </Button>
            <a
              href="http://localhost:3000/account"
              className="btn-athar-primary"
              style={{ fontSize: "0.85rem", textDecoration: "none" }}
            >
              الذهاب إلى بوابة العميل ↗
            </a>
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="var(--athar-bg-primary)"
      color="var(--athar-text-title)"
      dir="rtl"
    >
      {/* Mobile Sticky Header (< md breakpoint) */}
      <Box
        display={{ base: "block", md: "none" }}
        as="header"
        bg="rgba(255, 255, 255, 0.95)"
        borderBottom="1px solid rgba(107, 29, 40, 0.08)"
        boxShadow="0 2px 10px rgba(107, 29, 40, 0.04)"
        backdropFilter="blur(14px)"
        position="sticky"
        top={0}
        zIndex={110}
        px={4}
        py={3}
      >
        <Flex justify="space-between" align="center">
          <HStack
            gap={2.5}
            cursor="pointer"
            onClick={() => handleTabClick("overview")}
          >
            <Box
              w="38px"
              h="38px"
              borderRadius="10px"
              bg="var(--athar-maroon)"
              color="#ffffff"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="900"
              fontSize="1.05rem"
              fontFamily="var(--font-arabic-display)"
              boxShadow="0 4px 10px rgba(107, 29, 40, 0.25)"
              border="1px solid rgba(212, 175, 55, 0.4)"
            >
              أثر
            </Box>
            <Box>
              <Text
                fontSize="1.05rem"
                fontWeight="900"
                color="var(--athar-maroon)"
                fontFamily="var(--font-arabic-display)"
                lineHeight="1.2"
              >
                أثر — لوحة الإدارة
              </Text>
              <Text
                fontSize="0.7rem"
                color="var(--athar-text-muted)"
                fontWeight="600"
              >
                منظومة العمليات الفاخرة
              </Text>
            </Box>
          </HStack>

          <HStack gap={2}>
            {pendingPaymentsCount > 0 && (
              <Badge
                bg="#7A1C2E"
                color="#FBF8F3"
                borderRadius="full"
                px={2.5}
                py={0.5}
                fontSize="0.75rem"
                fontWeight="800"
                border="1px solid var(--athar-gold)"
              >
                {pendingPaymentsCount} إيصالات
              </Badge>
            )}
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="sm"
              variant="outline"
              borderColor="rgba(107, 29, 40, 0.25)"
              color="var(--athar-maroon)"
              fontSize="0.82rem"
              fontWeight="800"
              borderRadius="full"
            >
              {mobileMenuOpen ? "✕ إغلاق" : "☰ القائمة"}
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Root Layout Container: Right Sidebar + Left Main Canvas */}
      <Flex direction={{ base: "column", md: "row" }} minH="100vh">
        {/* Right-Hand Vertical Tabs Sidebar */}
        <Box
          as="aside"
          w={{ base: "100%", md: "280px" }}
          minH={{ md: "100vh" }}
          borderLeft="1px solid rgba(107, 29, 40, 0.12)"
          bg="rgba(255, 255, 255, 0.96)"
          backdropFilter="blur(16px)"
          boxShadow="0 4px 24px -6px rgba(107, 29, 40, 0.08)"
          position={{ base: "relative", md: "sticky" }}
          top={0}
          zIndex={100}
          display={{ base: mobileMenuOpen ? "flex" : "none", md: "flex" }}
          flexDirection="column"
          justifyContent="space-between"
          p={{ base: 4, md: 5 }}
        >
          {/* Top Brand Crest & User Info */}
          <Box>
            {/* Desktop Brand Crest */}
            <Box
              display={{ base: "none", md: "block" }}
              pb={4}
              mb={4}
              borderBottom="1px solid rgba(107, 29, 40, 0.08)"
            >
              <HStack
                gap={3}
                cursor="pointer"
                onClick={() => handleTabClick("overview")}
              >
                <Box
                  w="46px"
                  h="46px"
                  borderRadius="14px"
                  bg="var(--athar-maroon)"
                  color="#ffffff"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="900"
                  fontSize="1.25rem"
                  fontFamily="var(--font-arabic-display)"
                  boxShadow="0 4px 14px rgba(107, 29, 40, 0.28)"
                  border="1px solid rgba(212, 175, 55, 0.45)"
                >
                  أثر
                </Box>
                <Box>
                  <HStack gap={1.5}>
                    <Text
                      fontSize="1.15rem"
                      fontWeight="900"
                      color="var(--athar-maroon)"
                      fontFamily="var(--font-arabic-display)"
                      lineHeight="1.2"
                    >
                      أثر — الإدارة
                    </Text>
                    <Badge
                      variant="outline"
                      borderColor="rgba(212, 175, 55, 0.6)"
                      color="#8C6F12"
                      bg="rgba(212, 175, 55, 0.12)"
                      px={2}
                      py={0.2}
                      fontSize="0.68rem"
                      fontWeight="800"
                      borderRadius="full"
                    >
                      ADMIN
                    </Badge>
                  </HStack>
                  <Text
                    fontSize="0.72rem"
                    color="var(--athar-text-muted)"
                    fontWeight="600"
                  >
                    منظومة العمليات وإدارة الحفلات
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Admin User Profile Badge */}
            <Box
              bg="rgba(251, 247, 242, 0.9)"
              borderRadius="14px"
              p={3}
              mb={5}
              border="1px solid rgba(107, 29, 40, 0.08)"
            >
              {user ? (
                <Flex align="center" justify="space-between">
                  <HStack gap={2.5}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      bg="var(--athar-maroon)"
                      color="#ffffff"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="800"
                      fontSize="0.85rem"
                      fontFamily="var(--font-arabic-display)"
                      border="1px solid var(--athar-gold)"
                    >
                      {(user?.name || "م")[0]}
                    </Box>
                    <Box>
                      <Text
                        fontSize="0.82rem"
                        fontWeight="800"
                        color="var(--athar-maroon)"
                        lineHeight="1.2"
                        maxW="130px"
                        truncate
                      >
                        {user?.name || "مدير النظام"}
                      </Text>
                      <Text fontSize="0.68rem" color="#8C6F12" fontWeight="700">
                        ✦ مسؤول معتمد
                      </Text>
                    </Box>
                  </HStack>
                  <Button
                    onClick={() => logout()}
                    variant="ghost"
                    size="xs"
                    color="var(--athar-text-muted)"
                    _hover={{
                      color: "var(--athar-maroon)",
                      bg: "rgba(107, 29, 40, 0.08)",
                    }}
                    fontSize="0.72rem"
                    fontWeight="700"
                    px={2}
                    title="تسجيل الخروج"
                  >
                    خروج
                  </Button>
                </Flex>
              ) : (
                <HStack justify="space-between">
                  <Badge
                    bg="rgba(107, 29, 40, 0.08)"
                    color="var(--athar-maroon)"
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    fontSize="0.72rem"
                    fontWeight="800"
                  >
                    ✦ وضع الإدارة المباشر
                  </Badge>
                  <Text
                    fontSize="0.7rem"
                    color="var(--athar-text-muted)"
                    fontWeight="600"
                  >
                    نشط
                  </Text>
                </HStack>
              )}
            </Box>

            {/* Vertical Navigation Tab Buttons */}
            <VStack gap={2} align="stretch">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.65rem",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      backgroundColor: isActive ? "#7A1C2E" : "transparent",
                      color: isActive ? "#FBF8F3" : "var(--athar-text-body)",
                      border: isActive
                        ? "1px solid var(--athar-gold)"
                        : "1px solid transparent",
                      borderRight: isActive
                        ? "3.5px solid var(--athar-gold)"
                        : "3.5px solid transparent",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: "0.88rem",
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                      transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                      boxShadow: isActive
                        ? "0 4px 14px rgba(107, 29, 40, 0.25)"
                        : "none",
                      textAlign: "right",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontSize: "1.05rem", flexShrink: 0 }}>
                        {tab.icon}
                      </span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tab.label}
                      </span>
                    </span>

                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        style={{
                          backgroundColor: isActive
                            ? "var(--athar-gold)"
                            : "#7A1C2E",
                          color: isActive ? "#231F20" : "#FBF8F3",
                          borderRadius: "9999px",
                          padding: "0.15rem 0.55rem",
                          fontSize: "0.72rem",
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </VStack>
          </Box>

          {/* Bottom Ecosystem External Links */}
          <Box pt={4} mt={6} borderTop="1px solid rgba(107, 29, 40, 0.08)">
            <Text
              fontSize="0.72rem"
              color="var(--athar-text-muted)"
              fontWeight="800"
              mb={2.5}
            >
              منظومة أثر:
            </Text>
            <VStack gap={1.5} align="stretch">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(107, 29, 40, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: "var(--athar-text-body)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
              >
                <span>البوابة الرئيسية (:3000)</span>
                <span>↗</span>
              </a>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(107, 29, 40, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: "var(--athar-text-body)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
              >
                <span>🎙️ هاتف أثر (:3002)</span>
                <span>↗</span>
              </a>
              <a
                href="http://localhost:3003"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(107, 29, 40, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  color: "var(--athar-text-body)",
                  fontSize: "0.74rem",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                }}
              >
                <span>✉️ الدعوات الفاخرة (:3003)</span>
                <span>↗</span>
              </a>
              <a
                href="http://localhost:3004"
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.38rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                  backgroundColor: "rgba(212, 175, 55, 0.12)",
                  color: "var(--athar-maroon)",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  transition: "all 0.2s ease",
                }}
              >
                <span>🌐 منصة العرض الحية (:3004)</span>
                <span>↗</span>
              </a>
            </VStack>
          </Box>
        </Box>

        {/* Main Content Canvas on the Left */}
        <Box
          as="main"
          flex="1"
          p={{ base: 4, md: 8 }}
          minW={0}
          overflowX="hidden"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default AdminShell;
