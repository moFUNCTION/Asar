import React, { useState } from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useAsarAuth } from "@repo/react-appwrite";

export interface DemoClientProfile {
  id: string;
  name: string;
  email: string;
  serviceType: "booth" | "invitation";
  orderId: string;
  planName: string;
}

export const DEMO_CLIENTS: DemoClientProfile[] = [
  {
    id: "demo-client-mina-maryam",
    name: "مينا ومريم (Mina & Maryam)",
    email: "mina.maryam@asar.audio",
    serviceType: "booth",
    orderId: "ORD-902",
    planName: "حكاية أثر VIP (Athar Story VIP)",
  },
  {
    id: "demo-client-omar-layla",
    name: "عمر وليلى (Omar & Layla)",
    email: "omar.layla@asar.audio",
    serviceType: "invitation",
    orderId: "ORD-915",
    planName: "دعوة أثر الملكية (Athar Bespoke Gala)",
  },
];

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { name: string; email: string; orderId?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, register, isLoading: authLoading, error: asarAuthError, clearError } = useAsarAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      onSuccess?.({
        name: result.profile?.name || result.user.name || email.split("@")[0],
        email: result.user.email || email,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "فشل تسجيل الدخول، يرجى التأكد من البريد وكلمة المرور.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();
    setIsSubmitting(true);

    try {
      const result = await register({
        name,
        email,
        password,
        phone: phone || undefined,
      });
      onSuccess?.({
        name: result.profile?.name || name,
        email: result.user.email || email,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "تعذر إنشاء الحساب، يرجى المحاولة ببيانات أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle1ClickDemo = (client: DemoClientProfile) => {
    setErrorMsg(null);
    try {
      localStorage.setItem("asar_active_client", JSON.stringify(client));
    } catch {
      // ignore
    }
    onSuccess?.({
      name: client.name,
      email: client.email,
      orderId: client.orderId,
    });
    onClose();
  };

  const displayedError = errorMsg || asarAuthError;

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={100}
      bg="rgba(35, 26, 30, 0.65)"
      backdropFilter="blur(8px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      dir="rtl"
    >
      <Box
        bg="var(--athar-bg-primary)"
        border="1px solid var(--athar-gold-border)"
        borderRadius="24px"
        boxShadow="0 25px 60px -15px rgba(107, 29, 40, 0.35)"
        maxW="480px"
        w="100%"
        p={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
      >
        {/* Top Gold Ornament Bar */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="4px"
          bg="linear-gradient(90deg, var(--athar-gold), var(--athar-maroon), var(--athar-gold))"
        />

        {/* Close Button */}
        <Button
          onClick={onClose}
          position="absolute"
          top={4}
          left={4}
          variant="ghost"
          fontSize="1.1rem"
          color="var(--athar-text-muted)"
          _hover={{ color: "var(--athar-maroon)" }}
          cursor="pointer"
          border="none"
          bg="transparent"
          p={1}
        >
          ✕
        </Button>

        {/* Modal Header */}
        <Box textAlign="center" mb={6}>
          <Box
            w="48px"
            h="48px"
            mx="auto"
            mb={3}
            borderRadius="14px"
            bg="var(--athar-maroon)"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="1.4rem"
            fontWeight="900"
            className="font-arabic-display"
            border="1px solid var(--athar-gold-border)"
          >
            أثر
          </Box>
          <Text
            fontSize="1.45rem"
            fontWeight="800"
            color="var(--athar-maroon)"
            className="font-arabic-display"
          >
            بوابة العميل • أثر
          </Text>
          <Text fontSize="0.85rem" color="var(--athar-text-muted)">
            سجّل دخولك لمتابعة مراحل طلبك وتسليم مواد المناسبة وحسابك المعتمد
          </Text>
        </Box>

        {/* 1-Click Demo Client Section */}
        <Box
          bg="rgba(255, 255, 255, 0.9)"
          p={4}
          borderRadius="16px"
          border="1px solid var(--athar-gold-border)"
          mb={5}
        >
          <Flex align="center" gap={2} mb={2}>
            <Text fontSize="0.82rem" fontWeight="800" color="var(--athar-maroon)">
              ✦ الدخول السريع للمراجعين (1-Click Demo Clients):
            </Text>
          </Flex>
          <Text fontSize="0.75rem" color="var(--athar-text-muted)" mb={3}>
            اختر أحد العملاء التجريبيين لاستعراض كافة تفاصيل الحساب وصندوق المواد فوراً:
          </Text>

          <Flex direction="column" gap={2}>
            {DEMO_CLIENTS.map((client) => (
              <Button
                key={client.id}
                onClick={() => handle1ClickDemo(client)}
                className="btn-athar-secondary"
                w="100%"
                justifyContent="space-between"
                px={3.5}
                py={2.5}
                fontSize="0.82rem"
                textAlign="right"
              >
                <Box textAlign="right">
                  <Text fontWeight="800" color="var(--athar-text-title)">
                    {client.name}
                  </Text>
                  <Text fontSize="0.72rem" color="var(--athar-text-muted)">
                    طلب #{client.orderId} • {client.planName}
                  </Text>
                </Box>
                <Text fontSize="0.82rem" color="var(--athar-maroon)" fontWeight="800">
                  دخول ←
                </Text>
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Divider */}
        <Flex align="center" justify="center" gap={3} my={4}>
          <Box h="1px" flex={1} bg="rgba(107, 29, 40, 0.12)" />
          <Text fontSize="0.75rem" color="var(--athar-text-muted)">
            أو عبر البريد الإلكتروني المباشر
          </Text>
          <Box h="1px" flex={1} bg="rgba(107, 29, 40, 0.12)" />
        </Flex>

        {/* Tabs: Login / Register */}
        <Flex
          bg="rgba(107, 29, 40, 0.05)"
          p={1}
          borderRadius="full"
          mb={4}
        >
          <Button
            flex={1}
            borderRadius="full"
            py={1.5}
            fontSize="0.85rem"
            fontWeight="700"
            bg={tab === "login" ? "var(--athar-maroon)" : "transparent"}
            color={tab === "login" ? "white" : "var(--athar-text-muted)"}
            border="none"
            cursor="pointer"
            onClick={() => {
              setTab("login");
              setErrorMsg(null);
              clearError();
            }}
          >
            تسجيل الدخول
          </Button>
          <Button
            flex={1}
            borderRadius="full"
            py={1.5}
            fontSize="0.85rem"
            fontWeight="700"
            bg={tab === "register" ? "var(--athar-maroon)" : "transparent"}
            color={tab === "register" ? "white" : "var(--athar-text-muted)"}
            border="none"
            cursor="pointer"
            onClick={() => {
              setTab("register");
              setErrorMsg(null);
              clearError();
            }}
          >
            حساب جديد
          </Button>
        </Flex>

        {/* Error Alert */}
        {displayedError && (
          <Box
            bg="var(--athar-status-danger-bg)"
            color="var(--athar-status-danger)"
            p={3}
            borderRadius="12px"
            fontSize="0.82rem"
            mb={4}
          >
            {displayedError}
          </Box>
        )}

        {/* Form */}
        <form onSubmit={tab === "login" ? handleLogin : handleRegister}>
          {tab === "register" && (
            <>
              <Box mb={3}>
                <label className="athar-label">الاسم الكامل (أو أسماء العروسين)</label>
                <input
                  type="text"
                  required
                  className="athar-input"
                  placeholder="مثال: مينا ومريم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Box>
              <Box mb={3}>
                <label className="athar-label">رقم الهاتف / واتساب (اختياري للتنسيق)</label>
                <input
                  type="tel"
                  className="athar-input"
                  placeholder="+20 100 000 0000"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Box>
            </>
          )}

          <Box mb={3}>
            <label className="athar-label">البريد الإلكتروني</label>
            <input
              type="email"
              required
              className="athar-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>

          <Box mb={5}>
            <label className="athar-label">كلمة المرور</label>
            <input
              type="password"
              required
              minLength={8}
              className="athar-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>

          <Button
            type="submit"
            className="btn-athar-primary"
            w="100%"
            py={3}
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting || authLoading
              ? "جاري المعالجة والمزامنة..."
              : tab === "login"
              ? "دخول إلى حسابي ←"
              : "إنشاء الحساب ومتابعة الطلب ←"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default AuthModal;
