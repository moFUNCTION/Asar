import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useAsarAuth, useAuthActions, useAppwrite } from "@repo/react-appwrite";

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

export const COUNTRY_CODES = [
  { code: "+966", label: "🇸🇦 +966 (السعودية)" },
  { code: "+20", label: "🇪🇬 +20 (مصر)" },
  { code: "+971", label: "🇦🇪 +971 (الإمارات)" },
  { code: "+965", label: "🇰🇼 +965 (الكويت)" },
  { code: "+974", label: "🇶🇦 +974 (قطر)" },
];

export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = "+966"): string {
  const clean = rawPhone.replace(/[\s-]/g, "");
  if (clean.startsWith("+")) return clean;
  if (clean.startsWith("00")) return "+" + clean.slice(2);
  if (clean.startsWith("05")) return "+966" + clean.slice(1);
  if (clean.startsWith("01")) return "+20" + clean.slice(1);
  if (clean.startsWith("5") && defaultCountryCode === "+966") return "+966" + clean;
  if (clean.startsWith("1") && defaultCountryCode === "+20") return "+20" + clean;
  return defaultCountryCode + clean;
}

export function validateEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidOtpSecret(secret: string): boolean {
  return /^\d{6}$/.test(secret.trim());
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, register, isLoading: authLoading, error: asarAuthError, clearError } = useAsarAuth();
  const {
    loginWithPhone,
    verifyPhone,
    loginWithEmailOTP,
    verifyEmailOTP,
    loginWithAnonymous,
    isPending: actionsLoading,
    error: actionsError,
  } = useAuthActions();
  const { account } = useAppwrite();

  // Mode: "password" | "phone_otp" | "email_otp"
  const [authMode, setAuthMode] = useState<"password" | "phone_otp" | "email_otp">("password");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+966");

  // OTP State
  const [phoneOtpStep, setPhoneOtpStep] = useState<"input" | "verify">("input");
  const [emailOtpStep, setEmailOtpStep] = useState<"input" | "verify">("input");
  const [pendingUserId, setPendingUserId] = useState<string>("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

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

  const handle1ClickDemo = async (client: DemoClientProfile) => {
    setErrorMsg(null);
    try {
      localStorage.setItem("asar_active_client", JSON.stringify(client));
      if (loginWithAnonymous) {
        await loginWithAnonymous().catch(() => {});
      }
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

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();
    if (!phone.trim()) {
      setErrorMsg("يرجى إدخال رقم الهاتف.");
      return;
    }
    const fullPhone = normalizePhoneNumber(phone, countryCode);
    setIsSubmitting(true);
    try {
      const token = await loginWithPhone(fullPhone);
      setPendingUserId(token.userId);
      setPhoneOtpStep("verify");
      setCountdown(60);
      setOtpCode("");
    } catch (err: any) {
      setErrorMsg(err?.message || "تعذر إرسال رمز التحقق SMS، يرجى التحقق من الرقم والمحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();
    if (!isValidOtpSecret(otpCode)) {
      setErrorMsg("يرجى إدخال رمز تحقق صالح مكون من 6 أرقام.");
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyPhone(pendingUserId, otpCode.trim());
      let user: any = null;
      try {
        user = await account.get();
      } catch {
        // fallback
      }
      const fullPhone = normalizePhoneNumber(phone, countryCode);
      onSuccess?.({
        name: user?.name || fullPhone,
        email: user?.email || fullPhone,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "رمز التحقق غير صحيح أو انتهت صلاحيته.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (countdown > 0) return;
    setErrorMsg(null);
    clearError();
    setIsSubmitting(true);
    try {
      const fullPhone = normalizePhoneNumber(phone, countryCode);
      const token = await loginWithPhone(fullPhone, pendingUserId || undefined);
      if (token?.userId) setPendingUserId(token.userId);
      setCountdown(60);
      setOtpCode("");
    } catch (err: any) {
      setErrorMsg(err?.message || "تعذر إعادة إرسال الرمز، يرجى المحاولة بعد قليل.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();
    if (!validateEmailFormat(email)) {
      setErrorMsg("يرجى إدخال عنوان بريد إلكتروني صحيح.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = await loginWithEmailOTP(email.trim().toLowerCase());
      setPendingUserId(token.userId);
      setEmailOtpStep("verify");
      setCountdown(60);
      setOtpCode("");
    } catch (err: any) {
      setErrorMsg(err?.message || "تعذر إرسال رمز التحقق إلى البريد، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    clearError();
    if (!isValidOtpSecret(otpCode)) {
      setErrorMsg("يرجى إدخال رمز تحقق صالح مكون من 6 أرقام.");
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyEmailOTP(pendingUserId, otpCode.trim());
      let user: any = null;
      try {
        user = await account.get();
      } catch {
        // fallback
      }
      onSuccess?.({
        name: user?.name || email.split("@")[0],
        email: user?.email || email.trim().toLowerCase(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "رمز التحقق غير صحيح أو انتهت صلاحيته.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (countdown > 0) return;
    setErrorMsg(null);
    clearError();
    setIsSubmitting(true);
    try {
      const token = await loginWithEmailOTP(email.trim().toLowerCase(), pendingUserId || undefined);
      if (token?.userId) setPendingUserId(token.userId);
      setCountdown(60);
      setOtpCode("");
    } catch (err: any) {
      setErrorMsg(err?.message || "تعذر إعادة إرسال الرمز، يرجى المحاولة بعد قليل.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchMode = (mode: "password" | "phone_otp" | "email_otp") => {
    setAuthMode(mode);
    setErrorMsg(null);
    clearError();
    setOtpCode("");
    setCountdown(0);
    setPhoneOtpStep("input");
    setEmailOtpStep("input");
  };

  const displayedError = errorMsg || asarAuthError || actionsError?.message;

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

        {/* Auth Mode Tabs: Password / Phone OTP / Email OTP */}
        <Flex
          bg="rgba(107, 29, 40, 0.05)"
          p={1}
          borderRadius="14px"
          mb={4}
          gap={1}
        >
          <Button
            flex={1}
            borderRadius="10px"
            py={1.5}
            fontSize="0.82rem"
            fontWeight="700"
            bg={authMode === "password" ? "var(--athar-maroon)" : "transparent"}
            color={authMode === "password" ? "white" : "var(--athar-text-muted)"}
            border="none"
            cursor="pointer"
            onClick={() => handleSwitchMode("password")}
          >
            كلمة المرور
          </Button>
          <Button
            flex={1}
            borderRadius="10px"
            py={1.5}
            fontSize="0.82rem"
            fontWeight="700"
            bg={authMode === "phone_otp" ? "var(--athar-maroon)" : "transparent"}
            color={authMode === "phone_otp" ? "white" : "var(--athar-text-muted)"}
            border="none"
            cursor="pointer"
            onClick={() => handleSwitchMode("phone_otp")}
          >
            📱 رمز SMS
          </Button>
          <Button
            flex={1}
            borderRadius="10px"
            py={1.5}
            fontSize="0.82rem"
            fontWeight="700"
            bg={authMode === "email_otp" ? "var(--athar-maroon)" : "transparent"}
            color={authMode === "email_otp" ? "white" : "var(--athar-text-muted)"}
            border="none"
            cursor="pointer"
            onClick={() => handleSwitchMode("email_otp")}
          >
            ✉️ رمز OTP
          </Button>
        </Flex>

        {/* Password Sub-tabs: Login / Register */}
        {authMode === "password" && (
          <Flex
            bg="rgba(107, 29, 40, 0.04)"
            p={1}
            borderRadius="full"
            mb={4}
          >
            <Button
              flex={1}
              borderRadius="full"
              py={1.5}
              fontSize="0.82rem"
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
              fontSize="0.82rem"
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
        )}

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

        {/* 1. Password Mode Form */}
        {authMode === "password" && (
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
        )}

        {/* 2. Phone OTP Mode */}
        {authMode === "phone_otp" && (
          <>
            {phoneOtpStep === "input" ? (
              <form onSubmit={handleSendPhoneOtp}>
                <Box mb={4}>
                  <label className="athar-label">رقم الهاتف لتسجيل الدخول الفوري</label>
                  <Flex gap={2} dir="ltr" mt={1}>
                    <select
                      className="athar-input"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{ width: "160px", padding: "8px 10px", fontSize: "0.82rem" }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      className="athar-input"
                      placeholder="50 123 4567"
                      style={{ flex: 1 }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Flex>
                  <Text fontSize="0.75rem" color="var(--athar-text-muted)" mt={1.5}>
                    سيصلك رمز تحقق مكون من 6 أرقام عبر رسالة SMS
                  </Text>
                </Box>

                <Button
                  type="submit"
                  className="btn-athar-primary"
                  w="100%"
                  py={3}
                  disabled={isSubmitting || actionsLoading}
                >
                  {isSubmitting || actionsLoading ? "جاري إرسال الرمز..." : "إرسال رمز التحقق SMS ←"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp}>
                <Box mb={4} textAlign="center">
                  <Text fontSize="0.88rem" fontWeight="700" color="var(--athar-maroon)" mb={1}>
                    أدخل رمز التحقق (OTP)
                  </Text>
                  <Text fontSize="0.78rem" color="var(--athar-text-muted)" mb={3} dir="ltr">
                    {normalizePhoneNumber(phone, countryCode)}
                  </Text>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    className="athar-input"
                    placeholder="------"
                    style={{
                      textAlign: "center",
                      fontSize: "1.5rem",
                      letterSpacing: "0.4em",
                      fontWeight: "bold",
                      direction: "ltr",
                    }}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </Box>

                <Button
                  type="submit"
                  className="btn-athar-primary"
                  w="100%"
                  py={3}
                  disabled={isSubmitting || actionsLoading || otpCode.length !== 6}
                >
                  {isSubmitting || actionsLoading ? "جاري التحقق والدخول..." : "تأكيد الرمز والدخول ←"}
                </Button>

                <Flex justify="space-between" align="center" mt={4}>
                  <Button
                    type="button"
                    variant="ghost"
                    fontSize="0.78rem"
                    color="var(--athar-text-muted)"
                    _hover={{ color: "var(--athar-maroon)" }}
                    cursor="pointer"
                    bg="transparent"
                    border="none"
                    onClick={() => {
                      setPhoneOtpStep("input");
                      setOtpCode("");
                      setErrorMsg(null);
                    }}
                  >
                    ← تعديل رقم الهاتف
                  </Button>
                  {countdown > 0 ? (
                    <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                      إعادة الإرسال بعد ({countdown} ث)
                    </Text>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      fontSize="0.78rem"
                      fontWeight="700"
                      color="var(--athar-maroon)"
                      cursor="pointer"
                      bg="transparent"
                      border="none"
                      onClick={handleResendPhoneOtp}
                      disabled={isSubmitting}
                    >
                      إعادة إرسال الرمز الآن
                    </Button>
                  )}
                </Flex>
              </form>
            )}
          </>
        )}

        {/* 3. Email OTP Mode */}
        {authMode === "email_otp" && (
          <>
            {emailOtpStep === "input" ? (
              <form onSubmit={handleSendEmailOtp}>
                <Box mb={4}>
                  <label className="athar-label">البريد الإلكتروني لتسجيل الدخول السريع</label>
                  <input
                    type="email"
                    required
                    className="athar-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Text fontSize="0.75rem" color="var(--athar-text-muted)" mt={1.5}>
                    سيصلك رمز تحقق مكون من 6 أرقام عبر صندوق بريدك
                  </Text>
                </Box>

                <Button
                  type="submit"
                  className="btn-athar-primary"
                  w="100%"
                  py={3}
                  disabled={isSubmitting || actionsLoading}
                >
                  {isSubmitting || actionsLoading ? "جاري إرسال الرمز..." : "إرسال رمز الدخول OTP ←"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyEmailOtp}>
                <Box mb={4} textAlign="center">
                  <Text fontSize="0.88rem" fontWeight="700" color="var(--athar-maroon)" mb={1}>
                    أدخل رمز التحقق (OTP)
                  </Text>
                  <Text fontSize="0.78rem" color="var(--athar-text-muted)" mb={3} dir="ltr">
                    {email.trim().toLowerCase()}
                  </Text>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    className="athar-input"
                    placeholder="------"
                    style={{
                      textAlign: "center",
                      fontSize: "1.5rem",
                      letterSpacing: "0.4em",
                      fontWeight: "bold",
                      direction: "ltr",
                    }}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </Box>

                <Button
                  type="submit"
                  className="btn-athar-primary"
                  w="100%"
                  py={3}
                  disabled={isSubmitting || actionsLoading || otpCode.length !== 6}
                >
                  {isSubmitting || actionsLoading ? "جاري التحقق والدخول..." : "تأكيد الرمز والدخول ←"}
                </Button>

                <Flex justify="space-between" align="center" mt={4}>
                  <Button
                    type="button"
                    variant="ghost"
                    fontSize="0.78rem"
                    color="var(--athar-text-muted)"
                    _hover={{ color: "var(--athar-maroon)" }}
                    cursor="pointer"
                    bg="transparent"
                    border="none"
                    onClick={() => {
                      setEmailOtpStep("input");
                      setOtpCode("");
                      setErrorMsg(null);
                    }}
                  >
                    ← تعديل البريد الإلكتروني
                  </Button>
                  {countdown > 0 ? (
                    <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                      إعادة الإرسال بعد ({countdown} ث)
                    </Text>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      fontSize="0.78rem"
                      fontWeight="700"
                      color="var(--athar-maroon)"
                      cursor="pointer"
                      bg="transparent"
                      border="none"
                      onClick={handleResendEmailOtp}
                      disabled={isSubmitting}
                    >
                      إعادة إرسال الرمز الآن
                    </Button>
                  )}
                </Flex>
              </form>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AuthModal;
