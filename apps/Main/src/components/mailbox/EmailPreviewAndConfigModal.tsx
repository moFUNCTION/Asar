import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import type { InvitationRsvp } from "@repo/react-appwrite";
import { sendRsvpDecisionEmail, buildQrCodeImageUrl } from "@repo/react-appwrite";

export interface EmailJsConfig {
  serviceId: string;
  publicKey: string;
  templateApprovedId: string;
  templateDeclinedId: string;
}

export interface EmailPreviewAndConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRsvp?: InvitationRsvp | null;
  eventTitle?: string;
  onSaveConfig?: (config: EmailJsConfig) => void;
}

const STORAGE_KEY_CONFIG = "asar_emailjs_config";

export const EmailPreviewAndConfigModal: React.FC<EmailPreviewAndConfigModalProps> = ({
  isOpen,
  onClose,
  selectedRsvp,
  eventTitle = "حفل زفاف عمر وليلى — The Wedding of Omar & Layla",
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<"preview_approved" | "preview_declined" | "settings">("preview_approved");
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  // EmailJS configuration state
  const [config, setConfig] = useState<EmailJsConfig>({
    serviceId: "",
    publicKey: "",
    templateApprovedId: "template_rsvp_approved",
    templateDeclinedId: "template_rsvp_declined",
  });

  // Load config from localStorage or environment on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig((prev) => ({ ...prev, ...parsed }));
      } else {
        // Fallback to environment variables
        const meta = import.meta as unknown as { env?: Record<string, string> };
        const env = meta?.env || {};
        setConfig({
          serviceId: env.VITE_EMAILJS_SERVICE_ID || "",
          publicKey: env.VITE_EMAILJS_PUBLIC_KEY || "",
          templateApprovedId: env.VITE_EMAILJS_TEMPLATE_RSVP_APPROVED || "template_rsvp_approved",
          templateDeclinedId: env.VITE_EMAILJS_TEMPLATE_RSVP_DECLINED || "template_rsvp_declined",
        });
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  // If a selected RSVP is provided and is declined, default to the declined preview tab
  useEffect(() => {
    if (selectedRsvp?.status === "declined") {
      setActiveTab("preview_declined");
    } else {
      setActiveTab("preview_approved");
    }
    if (selectedRsvp?.guestEmail) {
      setTestEmailAddress(selectedRsvp.guestEmail);
    }
  }, [selectedRsvp]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      onSaveConfig?.(config);
      setTestFeedback({ message: "تم حفظ إعدادات EmailJS بنجاح في المتصفح ✓", isError: false });
    } catch {
      setTestFeedback({ message: "تعذر حفظ الإعدادات في التخزين المحلي", isError: true });
    }
  };

  const handleSendTest = async () => {
    const targetEmail = testEmailAddress.trim() || selectedRsvp?.guestEmail || "guest@example.com";
    setIsTesting(true);
    setTestFeedback(null);

    try {
      const isApproved = activeTab === "preview_approved";
      const result = await sendRsvpDecisionEmail({
        decision: isApproved ? "approved" : "declined",
        toEmail: targetEmail,
        toName: selectedRsvp?.guestName || "ضيفنا الكريم",
        eventTitle,
        eventDate: "الجمعة 14 أغسطس 2026",
        venueName: "فندق الفورسيزونز الإسكندرية",
        serviceId: config.serviceId,
        publicKey: config.publicKey,
        templateApprovedId: config.templateApprovedId,
        templateDeclinedId: config.templateDeclinedId,
        passToken: selectedRsvp?.passToken || "INV-PASS-DEMO-2026",
        rsvpId: selectedRsvp?.$id || "rsvp-demo-test",
      });

      if (result.success) {
        setTestFeedback({
          message: result.simulated
            ? `(وضع المحاكاة التجريبي): تم توليد ومعاينة البريد بنجاح لـ ${targetEmail}`
            : `تم إرسال بريد الاختبار الفعلي بنجاح إلى ${targetEmail}!`,
          isError: false,
        });
      } else {
        setTestFeedback({
          message: `فشل الإرسال: ${result.error || result.message}`,
          isError: true,
        });
      }
    } catch (err: unknown) {
      setTestFeedback({
        message: `خطأ أثناء الإرسال: ${err instanceof Error ? err.message : String(err)}`,
        isError: true,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const guestName = selectedRsvp?.guestName || "المهندس كريم والي";
  const guestEmail = selectedRsvp?.guestEmail || "karim.waly@example.com";
  const passToken = selectedRsvp?.passToken || "INV-PASS-8942-X";
  const samplePassUrl = `http://localhost:3003?pass=${selectedRsvp?.$id || "demo"}&token=${passToken}`;
  const qrCodeUrl = buildQrCodeImageUrl(samplePassUrl, 400);

  return (
    <Box
      position="fixed"
      inset="0"
      bg="rgba(35, 31, 32, 0.7)"
      backdropFilter="blur(8px)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 3, md: 6 }}
      dir="rtl"
    >
      <Box
        bg="#FBF7F2"
        w="100%"
        maxW="820px"
        maxH="90vh"
        overflowY="auto"
        borderRadius="28px"
        border="1px solid rgba(212, 175, 55, 0.4)"
        boxShadow="0 25px 50px -12px rgba(107, 29, 40, 0.3)"
        p={{ base: 5, md: 8 }}
      >
        {/* Modal Header */}
        <Flex justify="space-between" align="center" pb={4} mb={6} borderBottom="1px solid rgba(107, 29, 40, 0.1)">
          <VStack align="flex-start" gap={1}>
            <HStack gap={2}>
              <Text fontSize="1.35rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
                معاينة قوالب وإعدادات EmailJS
              </Text>
              <Badge
                variant="outline"
                borderColor="rgba(212, 175, 55, 0.5)"
                bg="rgba(212, 175, 55, 0.15)"
                color="var(--athar-maroon, #6B1D28)"
                px={3}
                py={0.5}
                borderRadius="full"
                fontSize="0.75rem"
                fontWeight="700"
              >
                رسائل البريد التلقائية
              </Badge>
            </HStack>
            <Text fontSize="0.85rem" color="var(--athar-text-muted, #7A6F6D)">
              تخصيص ومعاينة الرسائل المرسلة للضيوف عند اتخاذ قرار القبول أو اعتذار السعة
            </Text>
          </VStack>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            borderRadius="full"
            w="36px"
            h="36px"
            p={0}
            fontSize="1.1rem"
            color="var(--athar-text-muted, #7A6F6D)"
            _hover={{ bg: "rgba(107, 29, 40, 0.1)", color: "var(--athar-maroon, #6B1D28)" }}
          >
            ✕
          </Button>
        </Flex>

        {/* Tab Switcher */}
        <Flex gap={2} mb={6} bg="rgba(244, 239, 234, 0.8)" p={1.5} borderRadius="16px">
          <Button
            flex="1"
            size="sm"
            borderRadius="12px"
            bg={activeTab === "preview_approved" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "preview_approved" ? "white" : "var(--athar-text-title, #231F20)"}
            fontWeight="700"
            fontSize="0.85rem"
            py={2}
            onClick={() => setActiveTab("preview_approved")}
            _hover={activeTab === "preview_approved" ? undefined : { bg: "rgba(255, 255, 255, 0.6)" }}
          >
            ✓ رسالة القبول وتصريح QR
          </Button>

          <Button
            flex="1"
            size="sm"
            borderRadius="12px"
            bg={activeTab === "preview_declined" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "preview_declined" ? "white" : "var(--athar-text-title, #231F20)"}
            fontWeight="700"
            fontSize="0.85rem"
            py={2}
            onClick={() => setActiveTab("preview_declined")}
            _hover={activeTab === "preview_declined" ? undefined : { bg: "rgba(255, 255, 255, 0.6)" }}
          >
            ✕ رسالة اعتذار السعة الدبلوماسية
          </Button>

          <Button
            flex="1"
            size="sm"
            borderRadius="12px"
            bg={activeTab === "settings" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "settings" ? "white" : "var(--athar-text-title, #231F20)"}
            fontWeight="700"
            fontSize="0.85rem"
            py={2}
            onClick={() => setActiveTab("settings")}
            _hover={activeTab === "settings" ? undefined : { bg: "rgba(255, 255, 255, 0.6)" }}
          >
            ⚙️ إعدادات المفاتيح (API Keys)
          </Button>
        </Flex>

        {/* Tab 1: Approved Email Mockup */}
        {activeTab === "preview_approved" && (
          <Box
            bg="white"
            borderRadius="20px"
            p={{ base: 4, md: 6 }}
            border="1px solid rgba(212, 175, 55, 0.3)"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.04)"
            mb={6}
          >
            {/* Fake Email Envelope Header */}
            <Box pb={3} mb={4} borderBottom="1px solid #ECECEC" fontSize="0.82rem" color="#666">
              <Text>
                <strong>إلى:</strong> {guestName} &lt;{guestEmail}&gt;
              </Text>
              <Text>
                <strong>الموضوع:</strong> تأكيد حضوركم ودعوتكم الرسمية — {eventTitle}
              </Text>
            </Box>

            {/* Email Body Template */}
            <VStack align="center" gap={4} py={2} textAlign="center">
              <Box w="48px" h="48px" borderRadius="full" bg="#FBF7F2" p={2} border="1px solid #D4AF37">
                <Text fontSize="1.4rem" lineHeight="1">
                  🕊️
                </Text>
              </Box>

              <VStack gap={1}>
                <Text fontSize="1.3rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
                  يسعدنا ويشرفنا تأكيد حضوركم الكريم
                </Text>
                <Text fontSize="0.95rem" color="#4A4240">
                  {eventTitle}
                </Text>
              </VStack>

              <Text fontSize="0.88rem" color="#555" maxW="520px" lineHeight="1.6">
                عزيزنا <strong>{guestName}</strong>، نشكركم جزيل الشكر على تلبية دعوتنا. يسعدنا تأكيد مقاعدكم الكريمة لحضور المناسبة. مرفق أدناه بطاقة الدخول ورمز الاستجابة السريعة (QR Code) الخاص بكم وبمرافقيكم لتقديمه عند بوابة الاستقبال:
              </Text>

              {/* Centered QR Pass Card */}
              <Box
                bg="#FBF7F2"
                p={5}
                borderRadius="20px"
                border="1.5px solid #D4AF37"
                boxShadow="0 10px 25px rgba(212, 175, 55, 0.2)"
                maxW="300px"
              >
                <img
                  src={qrCodeUrl}
                  alt="Guest QR Code Pass"
                  style={{ width: "180px", height: "180px", margin: "0 auto", borderRadius: "10px" }}
                />
                <Text mt={3} fontSize="0.85rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)" fontFamily="monospace">
                  {passToken}
                </Text>
                <Text fontSize="0.75rem" color="#7A6F6D">
                  يرجى إبراز هذا الرمز عند الوصول
                </Text>
              </Box>

              <Text fontSize="0.75rem" color="#888">
                يمكنكم أيضاً فتح تصريح الدخول التفاعلي عبر الرابط:{" "}
                <Text as="span" dir="ltr" color="var(--athar-maroon, #6B1D28)">
                  {samplePassUrl}
                </Text>
              </Text>
            </VStack>
          </Box>
        )}

        {/* Tab 2: Declined Email Mockup */}
        {activeTab === "preview_declined" && (
          <Box
            bg="white"
            borderRadius="20px"
            p={{ base: 4, md: 6 }}
            border="1px solid rgba(155, 44, 44, 0.25)"
            boxShadow="0 4px 20px rgba(0, 0, 0, 0.04)"
            mb={6}
          >
            {/* Fake Email Envelope Header */}
            <Box pb={3} mb={4} borderBottom="1px solid #ECECEC" fontSize="0.82rem" color="#666">
              <Text>
                <strong>إلى:</strong> {guestName} &lt;{guestEmail}&gt;
              </Text>
              <Text>
                <strong>الموضوع:</strong> بخصوص دعوتكم لحضور — {eventTitle}
              </Text>
            </Box>

            {/* Email Body Template */}
            <VStack align="flex-start" gap={4} py={2}>
              <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
                الأخ العزيز / الأخت الفاضلة: {guestName}
              </Text>

              <Text fontSize="0.92rem" color="#4A4240" lineHeight="1.8">
                نشكر لكم من أعماق قلوبنا مشاعركم النبيلة وتهنئتكم الغالية، ورغبتكم الصادقة في مشاركتنا بهجة مناسبتنا: <strong>"{eventTitle}"</strong>.
              </Text>

              <Box p={4} bg="rgba(244, 239, 234, 0.7)" borderRadius="14px" borderRight="4px solid var(--athar-maroon, #6B1D28)">
                <Text fontSize="0.9rem" color="var(--athar-maroon, #6B1D28)" fontWeight="600" lineHeight="1.8">
                  "نظراً لمحدودية الطاقة الاستيعابية للقاعة والالتزام الصارم بالعدد المسموح به من إدارة المكان، يَصعُب علينا للأسف تأكيد مقاعد إضافية في الوقت الحالي. نقدّر محبتكم الصادقة وتفهمكم الراقي، وخالص أمنياتنا بدوام الأفراح والمسرات في دياركم العامرة."
                </Text>
              </Box>

              <Text fontSize="0.88rem" color="#555" lineHeight="1.6">
                دمتم ودامت محبتكم وسندكم، ومع أصدق التمنيات والمودة.
              </Text>
            </VStack>
          </Box>
        )}

        {/* Tab 3: Configuration Settings */}
        {activeTab === "settings" && (
          <Box
            bg="white"
            borderRadius="20px"
            p={{ base: 4, md: 6 }}
            border="1px solid rgba(212, 175, 55, 0.3)"
            mb={6}
          >
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="0.82rem" fontWeight="700" color="#4A4240" mb={1.5}>
                  EmailJS Service ID
                </Text>
                <input
                  type="text"
                  placeholder="service_xxxxxxxx (أو من VITE_EMAILJS_SERVICE_ID)"
                  value={config.serviceId}
                  onChange={(e) => setConfig({ ...config, serviceId: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(107, 29, 40, 0.2)",
                    outline: "none",
                    fontFamily: "monospace",
                    direction: "ltr",
                  }}
                />
              </Box>

              <Box>
                <Text fontSize="0.82rem" fontWeight="700" color="#4A4240" mb={1.5}>
                  EmailJS Public Key (User ID)
                </Text>
                <input
                  type="text"
                  placeholder="user_xxxxxxxx (أو من VITE_EMAILJS_PUBLIC_KEY)"
                  value={config.publicKey}
                  onChange={(e) => setConfig({ ...config, publicKey: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(107, 29, 40, 0.2)",
                    outline: "none",
                    fontFamily: "monospace",
                    direction: "ltr",
                  }}
                />
              </Box>

              <Flex direction={{ base: "column", sm: "row" }} gap={3}>
                <Box flex="1">
                  <Text fontSize="0.82rem" fontWeight="700" color="#4A4240" mb={1.5}>
                    Approved Template ID
                  </Text>
                  <input
                    type="text"
                    value={config.templateApprovedId}
                    onChange={(e) => setConfig({ ...config, templateApprovedId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontFamily: "monospace",
                      direction: "ltr",
                    }}
                  />
                </Box>

                <Box flex="1">
                  <Text fontSize="0.82rem" fontWeight="700" color="#4A4240" mb={1.5}>
                    Declined Template ID
                  </Text>
                  <input
                    type="text"
                    value={config.templateDeclinedId}
                    onChange={(e) => setConfig({ ...config, templateDeclinedId: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontFamily: "monospace",
                      direction: "ltr",
                    }}
                  />
                </Box>
              </Flex>

              <Button
                alignSelf="flex-start"
                bg="var(--athar-maroon, #6B1D28)"
                color="white"
                px={6}
                py={4}
                borderRadius="full"
                fontWeight="700"
                fontSize="0.88rem"
                onClick={handleSaveConfig}
                _hover={{ bg: "#5B1621" }}
              >
                💾 حفظ الإعدادات في التخزين المحلي
              </Button>
            </VStack>
          </Box>
        )}

        {/* Live Test Dispatcher Row */}
        <Box
          p={4}
          bg="rgba(244, 239, 234, 0.8)"
          borderRadius="16px"
          border="1px solid rgba(212, 175, 55, 0.3)"
          mb={4}
        >
          <Text fontSize="0.85rem" fontWeight="700" color="var(--athar-text-title, #231F20)" mb={2}>
            اختبار الإرسال الحي (Live Test Dispatch)
          </Text>

          <Flex direction={{ base: "column", sm: "row" }} gap={3} align="center">
            <input
              type="email"
              placeholder="أدخل بريدك لاختبار الإرسال (name@example.com)"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              style={{
                flex: "1",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(107, 29, 40, 0.2)",
                backgroundColor: "white",
                outline: "none",
                direction: "ltr",
              }}
            />

            <Button
              bg="var(--athar-maroon, #6B1D28)"
              color="white"
              px={6}
              py={4}
              borderRadius="full"
              fontWeight="700"
              fontSize="0.85rem"
              onClick={handleSendTest}
              disabled={isTesting}
              _hover={{ bg: "#5B1621" }}
            >
              {isTesting ? "جارِ الإرسال..." : "🚀 إرسال بريد تجريبي"}
            </Button>
          </Flex>

          {testFeedback && (
            <Box
              mt={3}
              p={2.5}
              borderRadius="10px"
              bg={testFeedback.isError ? "rgba(155, 44, 44, 0.1)" : "rgba(30, 111, 80, 0.1)"}
              border={`1px solid ${testFeedback.isError ? "rgba(155, 44, 44, 0.3)" : "rgba(30, 111, 80, 0.3)"}`}
            >
              <Text
                fontSize="0.82rem"
                fontWeight="700"
                color={testFeedback.isError ? "#9B2C2C" : "#1E6F50"}
              >
                {testFeedback.message}
              </Text>
            </Box>
          )}
        </Box>

        {/* Modal Bottom Actions */}
        <Flex justify="flex-end" gap={3}>
          <Button
            variant="outline"
            borderColor="rgba(107, 29, 40, 0.3)"
            bg="white"
            color="var(--athar-text-title, #231F20)"
            px={6}
            py={4}
            borderRadius="full"
            fontWeight="700"
            onClick={onClose}
          >
            إغلاق
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
