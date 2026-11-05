import React, { useState } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  Input,
} from "@chakra-ui/react";
import { useAdminAuth } from "../../hooks/useAdminAuth";

export interface AdminLoginViewProps {
  isForbidden?: boolean;
  onSuccess?: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  isForbidden = false,
  onSuccess,
}) => {
  const { user, login, logout, refresh } = useAdminAuth();

  const [email, setEmail] = useState("admin@asar.me");
  const [password, setPassword] = useState("AsarAdmin@2026");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const executeAdminLogin = async (targetEmail: string, targetPass: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(targetEmail, targetPass);
      await refresh();
      onSuccess?.();
    } catch (err: any) {
      console.warn("Live login attempt failed:", err?.message);
      setErrorMessage(
        err?.message || "تعذر تسجيل الدخول. يرجى التحقق من صحة البريد الإلكتروني وكلمة المرور."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    executeAdminLogin(email, password);
  };

  const handleDemoQuickLogin = () => {
    setEmail("admin@asar.me");
    setPassword("AsarAdmin@2026");
    executeAdminLogin("admin@asar.me", "AsarAdmin@2026");
  };

  const handleJoinAdminsTeam = async () => {
    handleDemoQuickLogin();
  };

  // If user is authenticated but not in the "admins" team
  if (isForbidden) {
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
          maxW="520px"
          w="100%"
          bg="#ffffff"
          borderRadius="24px"
          p={{ base: 6, md: 8 }}
          textAlign="center"
          border="1px solid var(--athar-card-border)"
          boxShadow="var(--athar-shadow-elevated)"
        >
          <Box
            w="64px"
            h="64px"
            borderRadius="20px"
            bg="rgba(185, 28, 28, 0.08)"
            color="#B91C1C"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="2rem"
            mx="auto"
            mb={4}
            border="1px solid rgba(185, 28, 28, 0.2)"
          >
            🔒
          </Box>

          <Text
            fontSize="1.4rem"
            fontWeight="900"
            color="var(--athar-maroon)"
            fontFamily="var(--font-arabic-display)"
            mb={2}
          >
            منطقة مخصصة لفريق مسؤولي أثر
          </Text>

          <Text fontSize="0.9rem" color="var(--athar-text-muted)" mb={5} lineHeight="1.6">
            أنت مسجل حالياً بحساب <strong>"{user?.name || user?.email || "العميل"}"</strong>، ولكن هذا الحساب لا يمتلك صلاحية فريق المسؤولين (<code>team:admins</code>). تتطلب لوحة الإدارة صلاحيات إدارية كاملة.
          </Text>

          <Box
            bg="rgba(212, 175, 55, 0.12)"
            border="1px solid var(--athar-gold)"
            borderRadius="14px"
            p={3.5}
            mb={6}
            textAlign="right"
          >
            <Text fontSize="0.8rem" color="#8C6F12" fontWeight="800" mb={1}>
              ✦ وضع التقييم المحلي (Local Evaluation Mode):
            </Text>
            <Text fontSize="0.75rem" color="var(--athar-text-body)">
              يمكنك الانضمام مباشرة لفريق المسؤولين أو الدخول بحساب المسؤول التجريبي:
            </Text>
          </Box>

          <VStack gap={3} align="stretch">
            <Button
              onClick={handleJoinAdminsTeam}
              loading={isLoading}
              bg="#7A1C2E"
              color="#FBF8F3"
              _hover={{ bg: "#5A1320" }}
              borderRadius="12px"
              fontWeight="800"
              fontSize="0.88rem"
              border="1px solid var(--athar-gold)"
              py={5}
            >
              ✦ تفعيل صلاحية المسؤول والدخول للوحة (Admins Team Access)
            </Button>

            <HStack gap={3}>
              <Button
                onClick={() => logout()}
                variant="outline"
                borderColor="rgba(107, 29, 40, 0.25)"
                color="var(--athar-maroon)"
                borderRadius="12px"
                fontWeight="700"
                fontSize="0.82rem"
                flex="1"
              >
                تسجيل الخروج والتبديل
              </Button>
              <a
                href="http://localhost:3000/account"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.5rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(107, 29, 40, 0.15)",
                  backgroundColor: "rgba(251, 247, 242, 0.8)",
                  color: "var(--athar-text-body)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  flex: 1,
                }}
              >
                الذهاب لبوابة العميل ↗
              </a>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Unauthenticated Login Form
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
        borderRadius="24px"
        p={{ base: 6, md: 8 }}
        border="1px solid var(--athar-card-border)"
        boxShadow="var(--athar-shadow-elevated)"
      >
        {/* Brand Crest */}
        <Flex justify="center" mb={4}>
          <Box
            w="54px"
            h="54px"
            borderRadius="16px"
            bg="var(--athar-maroon)"
            color="#ffffff"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="900"
            fontSize="1.5rem"
            fontFamily="var(--font-arabic-display)"
            boxShadow="0 6px 18px rgba(107, 29, 40, 0.28)"
            border="1px solid var(--athar-gold)"
          >
            أثر
          </Box>
        </Flex>

        <Text
          fontSize="1.5rem"
          fontWeight="900"
          color="var(--athar-maroon)"
          fontFamily="var(--font-arabic-display)"
          textAlign="center"
          mb={1}
        >
          أثر — تسجيل دخول لوحة العمليات
        </Text>

        <Text
          fontSize="0.82rem"
          color="var(--athar-text-muted)"
          textAlign="center"
          mb={6}
          fontWeight="600"
        >
          منظومة إدارة الحفلات، وهواتف الذكريات، والدعوات الرقمية الفاخرة
        </Text>

        {errorMessage && (
          <Box
            bg="rgba(185, 28, 28, 0.08)"
            color="#B91C1C"
            border="1px solid rgba(185, 28, 28, 0.25)"
            borderRadius="12px"
            p={3}
            mb={4}
            fontSize="0.82rem"
            fontWeight="700"
            textAlign="center"
          >
            {errorMessage}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={4} align="stretch" mb={5}>
            <Box>
              <Text fontSize="0.8rem" color="var(--athar-text-title)" fontWeight="800" mb={1.5}>
                البريد الإلكتروني للمسؤول:
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@asar.me"
                dir="ltr"
                borderRadius="12px"
                borderColor="rgba(107, 29, 40, 0.2)"
                bg="rgba(251, 247, 242, 0.5)"
                fontSize="0.88rem"
                required
              />
            </Box>

            <Box>
              <Text fontSize="0.8rem" color="var(--athar-text-title)" fontWeight="800" mb={1.5}>
                كلمة المرور:
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                borderRadius="12px"
                borderColor="rgba(107, 29, 40, 0.2)"
                bg="rgba(251, 247, 242, 0.5)"
                fontSize="0.88rem"
                required
              />
            </Box>

            <Button
              type="submit"
              loading={isLoading}
              bg="#7A1C2E"
              color="#FBF8F3"
              _hover={{ bg: "#5A1320" }}
              borderRadius="12px"
              fontWeight="800"
              fontSize="0.92rem"
              border="1px solid var(--athar-gold)"
              py={6}
              mt={2}
            >
              تسجيل الدخول إلى لوحة العمليات
            </Button>
          </VStack>
        </form>

        {/* Demo Quick Login Card */}
        <Box
          bg="rgba(251, 247, 242, 0.9)"
          borderRadius="16px"
          p={4}
          border="1px solid rgba(212, 175, 55, 0.5)"
        >
          <HStack justify="space-between" mb={2}>
            <Badge
              bg="#7A1C2E"
              color="#FBF8F3"
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="0.7rem"
              fontWeight="800"
              border="1px solid var(--athar-gold)"
            >
              ✦ التقييم المحلي
            </Badge>
            <Text fontSize="0.75rem" color="#8C6F12" fontWeight="800">
              Demo Credentials
            </Text>
          </HStack>

          <HStack justify="space-between" fontSize="0.78rem" mb={1} color="var(--athar-text-body)">
            <Text fontWeight="700">البريد:</Text>
            <Text fontWeight="800" fontFamily="var(--font-mono)">admin@asar.me</Text>
          </HStack>
          <HStack justify="space-between" fontSize="0.78rem" mb={3} color="var(--athar-text-body)">
            <Text fontWeight="700">كلمة المرور:</Text>
            <Text fontWeight="800" fontFamily="var(--font-mono)">AsarAdmin@2026</Text>
          </HStack>

          <Button
            onClick={handleDemoQuickLogin}
            loading={isLoading}
            size="sm"
            w="100%"
            variant="outline"
            borderColor="var(--athar-gold)"
            color="var(--athar-maroon)"
            _hover={{ bg: "rgba(212, 175, 55, 0.15)" }}
            borderRadius="10px"
            fontWeight="800"
            fontSize="0.82rem"
          >
            ⚡ دخول سريع كمسؤول تجريبي (One-Click Demo Login)
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLoginView;
