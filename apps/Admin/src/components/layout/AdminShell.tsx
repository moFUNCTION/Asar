import React, { useState } from "react";
import { Box, Flex, HStack, Text, Badge, Button } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAsarAuth } from "@repo/react-appwrite";

export type AdminTab = "overview" | "plans" | "orders" | "booth-studio" | "invitation-studio" | "users";

export interface AdminShellProps {
  activeTab?: AdminTab;
  onSelectTab?: (tab: AdminTab) => void;
  pendingPaymentsCount?: number;
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  activeTab,
  onSelectTab,
  pendingPaymentsCount = 0,
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, logout, isLoading: authLoading } = useAsarAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getActiveTabFromLocation = (): AdminTab => {
    const path = location.pathname;
    if (path.startsWith("/plans")) return "plans";
    if (path.startsWith("/orders")) return "orders";
    if (path.startsWith("/booth-studio")) return "booth-studio";
    if (path.startsWith("/invitation-studio")) return "invitation-studio";
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

  const tabs: { id: AdminTab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "لوحة العمليات والملخص", icon: "✦" },
    {
      id: "orders",
      label: "الطلبات والمدفوعات",
      icon: "💳",
      count: pendingPaymentsCount,
    },
    { id: "invitation-studio", label: "استوديو تصميم الدعوات والمواقع", icon: "✉️" },
    { id: "booth-studio", label: "استوديو ذكريات هاتف أثر", icon: "🎙️" },
    { id: "plans", label: "الباقات والأسعار والكوتا", icon: "⚙️" },
    { id: "users", label: "دليل المستخدمين والحسابات", icon: "👥" },
  ];

  // If unauthenticated or guest in production, show the Luxury Admin Authorization Card
  if (!authLoading && user && !isAdmin) {
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
          <Text fontSize="3rem" mb={3}>🔒</Text>
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
            أنت مسجل حالياً كـ <strong>"{user.name || user.email}"</strong> برتبة عميل. تتطلب لوحة الإدارة صلاحيات فريق المسؤولين (Admins).
          </Text>
          <Flex gap={3} justify="center">
            <Button onClick={() => logout()} className="btn-athar-secondary" fontSize="0.85rem">
              تسجيل الخروج والتبديل
            </Button>
            <a href="http://localhost:3000/account" className="btn-athar-primary" style={{ fontSize: "0.85rem", textDecoration: "none" }}>
              الذهاب إلى بوابة العميل ↗
            </a>
          </Flex>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="var(--athar-bg-primary)" color="var(--athar-text-title)" dir="rtl">
      {/* Top Luxury Studio Header */}
      <Box
        as="header"
        bg="rgba(255, 255, 255, 0.95)"
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
          maxW="1440px"
          mx="auto"
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={4}
        >
          {/* Brand Identity */}
          <HStack
            gap={3.5}
            cursor="pointer"
            onClick={() => {
              if (onSelectTab) onSelectTab("overview");
              navigate("/overview");
            }}
          >
            <Box
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="var(--athar-maroon)"
              color="#ffffff"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="900"
              fontSize="1.15rem"
              fontFamily="var(--font-arabic-display)"
              boxShadow="0 4px 12px rgba(107, 29, 40, 0.28)"
              border="1px solid rgba(212, 175, 55, 0.4)"
            >
              أثر
            </Box>
            <Box>
              <HStack gap={2}>
                <Text
                  fontSize="1.2rem"
                  fontWeight="900"
                  color="var(--athar-maroon)"
                  fontFamily="var(--font-arabic-display)"
                  lineHeight="1.2"
                >
                  أثر — لوحة الإدارة
                </Text>
                <Badge
                  variant="outline"
                  borderColor="rgba(212, 175, 55, 0.6)"
                  color="#8C6F12"
                  bg="rgba(212, 175, 55, 0.12)"
                  px={2.5}
                  py={0.5}
                  fontSize="0.72rem"
                  fontWeight="800"
                  borderRadius="full"
                >
                  ADMIN CONSOLE
                </Badge>
              </HStack>
              <Text fontSize="0.75rem" color="var(--athar-text-muted)" fontWeight="600">
                إدارة العمليات، تدقيق المدفوعات، وصناعة ذكريات الحفلات الفاخرة
              </Text>
            </Box>
          </HStack>

          {/* Ecosystem Navigation Links */}
          <HStack gap={2} display={{ base: "none", xl: "flex" }}>
            <Text fontSize="0.78rem" color="var(--athar-text-muted)" fontWeight="700" ml={1}>
              المنظومة:
            </Text>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.28rem 0.8rem",
                borderRadius: "9999px",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                color: "var(--athar-text-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                transition: "all 0.2s ease",
              }}
            >
              البوابة الرئيسية (:3000) ↗
            </a>
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.28rem 0.8rem",
                borderRadius: "9999px",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                color: "var(--athar-text-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                transition: "all 0.2s ease",
              }}
            >
              🎙️ هاتف أثر (:3002) ↗
            </a>
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.28rem 0.8rem",
                borderRadius: "9999px",
                border: "1px solid rgba(107, 29, 40, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                color: "var(--athar-text-body)",
                fontSize: "0.75rem",
                fontWeight: 700,
                transition: "all 0.2s ease",
              }}
            >
              ✉️ الدعوات الفاخرة (:3003) ↗
            </a>
            <a
              href="http://localhost:3004"
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                padding: "0.28rem 0.8rem",
                borderRadius: "9999px",
                border: "1px solid rgba(212, 175, 55, 0.4)",
                backgroundColor: "rgba(212, 175, 55, 0.12)",
                color: "var(--athar-maroon)",
                fontSize: "0.75rem",
                fontWeight: 800,
                transition: "all 0.2s ease",
              }}
            >
              🌐 منصة العرض الحية (:3004) ↗
            </a>
          </HStack>

          {/* Admin User Profile & Actions */}
          <HStack gap={3}>
            {user ? (
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
                  {(profile?.name || user.name || "م")[0]}
                </Box>
                <Box display={{ base: "none", sm: "block" }}>
                  <Text fontSize="0.82rem" fontWeight="800" color="var(--athar-maroon)" lineHeight="1.2">
                    {profile?.name || user.name || "مدير النظام"}
                  </Text>
                  <Text fontSize="0.7rem" color="#8C6F12" fontWeight="700">
                    ✦ مسؤول معتمد
                  </Text>
                </Box>
                <Button
                  onClick={() => logout()}
                  variant="ghost"
                  size="xs"
                  color="var(--athar-text-muted)"
                  _hover={{ color: "var(--athar-maroon)", bg: "rgba(107, 29, 40, 0.05)" }}
                  title="تسجيل الخروج"
                >
                  خروج
                </Button>
              </HStack>
            ) : (
              <Badge
                bg="rgba(107, 29, 40, 0.08)"
                color="var(--athar-maroon)"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="0.75rem"
                fontWeight="800"
              >
                ✦ وضع الإدارة المباشر
              </Badge>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              display={{ base: "flex", md: "none" }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              size="sm"
              variant="outline"
              borderColor="rgba(107, 29, 40, 0.2)"
              fontSize="0.8rem"
            >
              {mobileMenuOpen ? "✕ إغلاق" : "☰ القائمة"}
            </Button>
          </HStack>
        </Flex>

        {/* Tab Navigation Pill Strip */}
        <Box maxW="1440px" mx="auto" mt={3.5} pt={2} borderTop="1px solid rgba(107, 29, 40, 0.05)">
          <Flex
            gap={2}
            overflowX="auto"
            pb={1}
            display={{ base: mobileMenuOpen ? "flex" : "none", md: "flex" }}
            direction={{ base: "column", md: "row" }}
            css={{ "&::-webkit-scrollbar": { display: "none" } }}
          >
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.55rem",
                    padding: "0.55rem 1.15rem",
                    borderRadius: "9999px",
                    border: isActive
                      ? "1px solid var(--athar-gold)"
                      : "1px solid rgba(107, 29, 40, 0.08)",
                    backgroundColor: isActive
                      ? "var(--athar-maroon)"
                      : "rgba(255, 255, 255, 0.7)",
                    color: isActive ? "#ffffff" : "var(--athar-text-body)",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: "0.86rem",
                    fontFamily: "var(--font-sans)",
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: isActive ? "0 4px 14px rgba(107, 29, 40, 0.25)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      style={{
                        backgroundColor: isActive ? "var(--athar-gold)" : "var(--athar-maroon)",
                        color: isActive ? "var(--athar-text-title)" : "#ffffff",
                        borderRadius: "9999px",
                        padding: "0.1rem 0.5rem",
                        fontSize: "0.72rem",
                        fontWeight: 900,
                        marginLeft: "0.4rem",
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

      {/* Main Workspace Canvas */}
      <Box as="main" maxW="1440px" mx="auto" px={{ base: 4, md: 8 }} py={8}>
        {children}
      </Box>
    </Box>
  );
};
