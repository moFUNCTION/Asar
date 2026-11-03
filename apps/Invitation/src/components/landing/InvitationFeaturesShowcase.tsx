import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge } from "@chakra-ui/react";
import {
  FaSlidersH,
  FaInbox,
  FaCheckCircle,
  FaTimesCircle,
  FaQrcode,
  FaShieldAlt,
  FaLock,
  FaUserCheck,
} from "react-icons/fa";

export interface InvitationFeaturesShowcaseProps {
  onOpenBooking?: () => void;
  onPreviewPass?: (rsvpId: string) => void;
}

export const InvitationFeaturesShowcase: React.FC<InvitationFeaturesShowcaseProps> = ({
  onOpenBooking,
  onPreviewPass,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      icon: <FaSlidersH size={22} />,
      title: "تخصيص الحقول ونموذج RSVP",
      subtitle: "Custom Dynamic Form Fields",
      description:
        "أنت من يحدد طبيعة الأسئلة التي يجيب عليها ضيوفك (عدد المرافقين، رقم الواتساب، فئة الضيف، التفضيلات الغذائية) مع قفل بريد الضيف كحقل إلزامي لضمان وصول كود الدخول.",
      highlight: "حقل البريد الإلكتروني مقفل ومؤمّن لنقل كود الدخول 🔒",
      previewType: "form",
    },
    {
      num: "02",
      icon: <FaInbox size={22} />,
      title: "صندوق بريد خاص ولحظي في حسابك",
      subtitle: "Dedicated Realtime Client Mailbox",
      description:
        "بمجرد أن يملأ أي ضيف نموذج دعوتك، تصله إجاباته في أجزاء من الثانية إلى صندوق بريدك الخاص داخل لوحة تحكم أثر، مع تنبيهات لحظية ومؤشر دقيق للطاقة الاستيعابية.",
      highlight: "تحديث فوري عبر تقنية WebSockets بدون إعادة تحميل الصفحة",
      previewType: "mailbox",
    },
    {
      num: "03",
      icon: <FaUserCheck size={22} />,
      title: "قبول أو اعتذار بضغطة زر واحدة",
      subtitle: "One-Click Approve or Polite Decline",
      description:
        "أنت صاحب القرار الأول والأخير في قاعتك. يمكنك فحص بيانات كل ضيف، قبول من ترغب فيه ليصله كود الدخول، أو الاعتذار بلباقة عند اكتمال الطاقة الاستيعابية للقاعة.",
      highlight: "عداد تفاعلي مباشر يرصد عدد المقاعد المتبقية",
      previewType: "decision",
    },
    {
      num: "04",
      icon: <FaQrcode size={22} />,
      title: "تسليم تلقائي لكود QR عبر البريد",
      subtitle: "Automated EmailJS & Digital QR Pass",
      description:
        "النظام يرسل تلقائياً بطاقة دعوة رقمية فاخرة تحمل كود QR فريداً لكل ضيف مقبول للدخول السلس عبر بوابات القاعة، بينما يُرسل اعتذاراً مهذباً ومبرراً للمعتذر لهم.",
      highlight: "كود مشفر يمنع التكرار ويسجل وقت الحضور الفعلي",
      previewType: "qr",
    },
  ];

  return (
    <Box
      as="section"
      id="features"
      py={{ base: 20, md: 28 }}
      px={{ base: 4, sm: 6, lg: 8 }}
      bg="var(--athar-bg-primary, #FBF7F2)"
      position="relative"
      scrollMarginTop="90px"
      dir="rtl"
    >
      <Box maxW="1280px" mx="auto">
        {/* Section Header */}
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 14, md: 18 }}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            bg="rgba(255, 255, 255, 0.9)"
            color="var(--athar-maroon, #6B1D28)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="0.82rem"
            fontWeight="700"
            letterSpacing="0.06em"
            mb={3}
          >
            ✦ الرحلة الكاملة من الدعوة إلى بوابة القاعة
          </Badge>

          <Text
            as="h2"
            fontFamily="var(--font-arabic-display, 'Amiri', serif)"
            fontSize="clamp(2rem, 3.8vw, 3.2rem)"
            fontWeight="800"
            color="var(--athar-text-title, #231F20)"
            lineHeight="1.25"
            mb={3}
          >
            كيف تعمل منظومة أثر للدعوات التفاعلية؟
          </Text>

          <Text
            maxW="720px"
            fontSize={{ base: "0.98rem", md: "1.12rem" }}
            color="var(--athar-text-body, #4A4240)"
            lineHeight="1.8"
          >
            منظومة متكاملة تبدأ من تخصيص نموذج الحضور، مروراً بصندوق بريد لحظي في حسابك المضيف،
            وحتى إصدار بطاقات الدخول الذكية المشفرة للضيوف.
          </Text>
        </Flex>

        {/* 4 Interactive Step Buttons */}
        <Box mb={10}>
          <SimpleGrid columns={{ base: 2, lg: 4 }} gap={3}>
            {steps.map((st, idx) => {
              const isSelected = activeStep === idx;
              return (
                <Box
                  as="button"
                  key={st.num}
                  onClick={() => setActiveStep(idx)}
                  textAlign="right"
                  p={{ base: 3.5, md: 5 }}
                  borderRadius="20px"
                  bg={isSelected ? "var(--athar-maroon, #6B1D28)" : "rgba(255, 255, 255, 0.85)"}
                  color={isSelected ? "white" : "var(--athar-text-title, #231F20)"}
                  border={
                    isSelected
                      ? "1.5px solid #D4AF37"
                      : "1px solid rgba(107, 29, 40, 0.08)"
                  }
                  boxShadow={
                    isSelected
                      ? "0 14px 30px rgba(107, 29, 40, 0.22)"
                      : "0 4px 12px rgba(107, 29, 40, 0.03)"
                  }
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translateY(-2px)",
                    borderColor: isSelected ? "#D4AF37" : "rgba(212, 175, 55, 0.5)",
                  }}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text
                      fontSize="1.1rem"
                      fontWeight="900"
                      color={isSelected ? "#D4AF37" : "var(--athar-maroon, #6B1D28)"}
                      fontFamily="var(--font-arabic-display, serif)"
                    >
                      {st.num}
                    </Text>
                    <Box color={isSelected ? "#D4AF37" : "var(--athar-text-muted, #7A6F6D)"}>
                      {st.icon}
                    </Box>
                  </Flex>
                  <Text
                    fontSize={{ base: "0.85rem", md: "0.96rem" }}
                    fontWeight="700"
                    lineHeight="1.3"
                    style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {st.title}
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* Active Step Showcase: Split Grid */}
        <Box
          id="mailbox-qr"
          bg="rgba(255, 255, 255, 0.96)"
          borderRadius="32px"
          p={{ base: 6, sm: 8, lg: 12 }}
          border="1.5px solid rgba(107, 29, 40, 0.09)"
          boxShadow="0 25px 60px -15px rgba(107, 29, 40, 0.08)"
          scrollMarginTop="90px"
        >
          <SimpleGrid columns={{ base: 1, lg: 12 }} gap={{ base: 8, lg: 12 }} alignItems="center">
            {/* Right Column: Step Description (7 cols) */}
            <Box gridColumn={{ base: "span 1", lg: "span 7" }}>
              <Badge
                variant="outline"
                borderColor="rgba(212, 175, 55, 0.5)"
                bg="rgba(212, 175, 55, 0.12)"
                color="var(--athar-maroon, #6B1D28)"
                px={3.5}
                py={1}
                borderRadius="full"
                fontSize="0.82rem"
                fontWeight="800"
                mb={4}
              >
                الخطوة {steps[activeStep].num} من 04
              </Badge>

              <Text
                fontFamily="var(--font-arabic-display, 'Amiri', serif)"
                fontSize={{ base: "1.7rem", sm: "2.2rem" }}
                fontWeight="800"
                color="var(--athar-text-title, #231F20)"
                mb={2}
                lineHeight="1.25"
              >
                {steps[activeStep].title}
              </Text>

              <Text
                fontSize="0.85rem"
                fontWeight="600"
                color="var(--athar-text-muted, #7A6F6D)"
                mb={5}
                letterSpacing="0.04em"
              >
                {steps[activeStep].subtitle}
              </Text>

              <Text
                fontSize={{ base: "1rem", md: "1.08rem" }}
                color="var(--athar-text-body, #4A4240)"
                lineHeight="1.85"
                mb={6}
              >
                {steps[activeStep].description}
              </Text>

              <Box
                p={4}
                borderRadius="16px"
                bg="rgba(107, 29, 40, 0.04)"
                borderRight="4px solid var(--athar-maroon, #6B1D28)"
                mb={8}
              >
                <HStack gap={2}>
                  <FaShieldAlt color="#6B1D28" size={16} />
                  <Text fontSize="0.9rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)">
                    {steps[activeStep].highlight}
                  </Text>
                </HStack>
              </Box>

              <HStack gap={4} flexWrap="wrap">
                <Button
                  onClick={onOpenBooking}
                  bg="var(--athar-maroon, #6B1D28)"
                  color="white"
                  borderRadius="full"
                  px={6}
                  py={5}
                  fontWeight="700"
                  fontSize="0.92rem"
                  boxShadow="0 4px 16px rgba(107, 29, 40, 0.25)"
                  _hover={{
                    bg: "var(--athar-maroon-dark, #5B1621)",
                    transform: "translateY(-2px)",
                  }}
                >
                  اطلب موقع دعوتك الآن
                </Button>

                {onPreviewPass && (
                  <Button
                    onClick={() => onPreviewPass("demo-vip-rsvp-01")}
                    variant="outline"
                    borderRadius="full"
                    borderColor="rgba(212, 175, 55, 0.45)"
                    color="var(--athar-maroon, #6B1D28)"
                    px={5}
                    py={5}
                    fontWeight="700"
                    fontSize="0.92rem"
                    gap={2}
                    _hover={{
                      bg: "rgba(212, 175, 55, 0.08)",
                      borderColor: "var(--athar-maroon, #6B1D28)",
                    }}
                  >
                    <FaQrcode size={14} />
                    معاينة بطاقة QR Pass
                  </Button>
                )}
              </HStack>
            </Box>

            {/* Left Column: Live Interactive Simulation Card (5 cols) */}
            <Box gridColumn={{ base: "span 1", lg: "span 5" }}>
              {activeStep === 0 && (
                /* Step 1 Preview: Dynamic Form Schema Simulation */
                <Box
                  bg="white"
                  borderRadius="24px"
                  p={6}
                  border="1.5px solid rgba(107, 29, 40, 0.12)"
                  boxShadow="0 18px 40px -10px rgba(107, 29, 40, 0.09)"
                >
                  <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid rgba(107, 29, 40, 0.08)">
                    <Text fontWeight="800" fontSize="0.95rem" color="var(--athar-text-title, #231F20)">
                      نموذج تأكيد الحضور (RSVP)
                    </Text>
                    <Badge bg="rgba(107, 29, 40, 0.08)" color="var(--athar-maroon, #6B1D28)" borderRadius="full" px={2.5}>
                      ديناميكي
                    </Badge>
                  </Flex>

                  <Flex direction="column" gap={3}>
                    {/* Locked Name */}
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="0.8rem" fontWeight="700">الاسم بالكامل *</Text>
                        <Badge fontSize="0.65rem" color="gray.600">إلزامي</Badge>
                      </Flex>
                      <Box p={2.5} borderRadius="10px" bg="#FBF7F2" fontSize="0.85rem" color="gray.600" border="1px solid rgba(0,0,0,0.06)">
                        أحمد عبد الرحمن
                      </Box>
                    </Box>

                    {/* Locked Email */}
                    <Box>
                      <Flex justify="space-between" mb={1}>
                        <HStack gap={1}>
                          <Text fontSize="0.8rem" fontWeight="700">البريد الإلكتروني *</Text>
                          <FaLock size={10} color="#6B1D28" />
                        </HStack>
                        <Badge fontSize="0.65rem" color="red.700" bg="red.50">مقفل للنظام 🔒</Badge>
                      </Flex>
                      <Box p={2.5} borderRadius="10px" bg="#FBF7F2" fontSize="0.85rem" color="gray.600" border="1px solid rgba(107, 29, 40, 0.15)">
                        ahmed.rahman@example.com
                      </Box>
                    </Box>

                    {/* Dynamic Companions */}
                    <Box>
                      <Text fontSize="0.8rem" fontWeight="700" mb={1}>عدد المرافقين</Text>
                      <Box p={2.5} borderRadius="10px" bg="#FBF7F2" fontSize="0.85rem" color="gray.600" border="1px solid rgba(0,0,0,0.06)">
                        +1 مرافق (شخصان إجمالاً)
                      </Box>
                    </Box>

                    {/* Custom Note */}
                    <Box>
                      <Text fontSize="0.8rem" fontWeight="700" mb={1}>رسالة للعروسين / كلمة للذكرى</Text>
                      <Box p={2.5} borderRadius="10px" bg="#FBF7F2" fontSize="0.82rem" color="gray.600" fontStyle="italic" border="1px solid rgba(0,0,0,0.06)">
                        "ألف مبروك يا أجمل عروسين، نسأل الله لكم التوفيق والسعادة دايماً..."
                      </Box>
                    </Box>
                  </Flex>
                </Box>
              )}

              {activeStep === 1 && (
                /* Step 2 Preview: Client Account Mailbox Simulation */
                <Box
                  bg="#231A1E"
                  color="white"
                  borderRadius="24px"
                  p={6}
                  border="1.5px solid #D4AF37"
                  boxShadow="0 20px 50px -10px rgba(0, 0, 0, 0.5)"
                >
                  <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid rgba(255,255,255,0.1)">
                    <HStack gap={2}>
                      <FaInbox color="#D4AF37" size={16} />
                      <Text fontWeight="800" fontSize="0.95rem">صندوق بريد حفل الزفاف</Text>
                    </HStack>
                    <Badge bg="rgba(30, 111, 80, 0.25)" color="#4ADE80" borderRadius="full" px={2.5}>
                      متصل مباشر 🟢
                    </Badge>
                  </Flex>

                  {/* Capacity Bar */}
                  <Box mb={4} p={3} bg="rgba(255,255,255,0.05)" borderRadius="14px">
                    <Flex justify="space-between" fontSize="0.78rem" mb={1.5}>
                      <Text color="rgba(255,255,255,0.8)">إشغال القاعة (118 / 150 مقعد)</Text>
                      <Text color="#D4AF37" fontWeight="700">78%</Text>
                    </Flex>
                    <Box w="100%" h="7px" bg="rgba(255,255,255,0.1)" borderRadius="full" overflow="hidden">
                      <Box w="78%" h="100%" bg="linear-gradient(90deg, #1E6F50, #D4AF37)" />
                    </Box>
                  </Box>

                  {/* Mailbox Rows */}
                  <Flex direction="column" gap={2}>
                    <Box p={3} borderRadius="12px" bg="rgba(255,255,255,0.08)" border="1px solid rgba(212,175,55,0.25)">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="700" fontSize="0.88rem">كريم المصري</Text>
                        <Badge bg="rgba(212,175,55,0.2)" color="#D4AF37" fontSize="0.7rem">قيد المراجعة</Badge>
                      </Flex>
                      <Text fontSize="0.75rem" color="rgba(255,255,255,0.6)">karim.masry@example.com · +1 مرافق</Text>
                    </Box>

                    <Box p={3} borderRadius="12px" bg="rgba(255,255,255,0.04)">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="700" fontSize="0.88rem">سارة محمود</Text>
                        <Badge bg="rgba(30,111,80,0.2)" color="#4ADE80" fontSize="0.7rem">✓ تم القبول وQR</Badge>
                      </Flex>
                      <Text fontSize="0.75rem" color="rgba(255,255,255,0.6)">sara.m@example.com · مقعد واحد</Text>
                    </Box>
                  </Flex>
                </Box>
              )}

              {activeStep === 2 && (
                /* Step 3 Preview: Approve / Decline Decision Simulation */
                <Box
                  bg="white"
                  borderRadius="24px"
                  p={6}
                  border="1.5px solid rgba(107, 29, 40, 0.12)"
                  boxShadow="0 18px 40px -10px rgba(107, 29, 40, 0.09)"
                >
                  <Flex justify="space-between" align="center" mb={4} pb={3} borderBottom="1px solid rgba(107,29,40,0.08)">
                    <Text fontWeight="800" fontSize="0.95rem" color="var(--athar-text-title, #231F20)">
                      قرار المضيف لطلب الحضور
                    </Text>
                    <Badge bg="amber.50" color="amber.800" borderRadius="full">طلب جديد</Badge>
                  </Flex>

                  <Box p={3.5} borderRadius="14px" bg="#FBF7F2" mb={5}>
                    <Text fontWeight="800" fontSize="1rem" mb={1} color="var(--athar-text-title, #231F20)">
                      م. يوسف الغامدي
                    </Text>
                    <Text fontSize="0.82rem" color="var(--athar-text-muted, #7A6F6D)" mb={2}>
                      yousef.ghamdi@corporate.com · 2 مرافقين
                    </Text>
                    <Text fontSize="0.8rem" color="var(--athar-text-body, #4A4240)">
                      الفئة: ضيوف شرف VIP · الطاولة الملكية
                    </Text>
                  </Box>

                  <Flex gap={3}>
                    <Button
                      w="100%"
                      bg="#1E6F50"
                      color="white"
                      borderRadius="12px"
                      fontSize="0.85rem"
                      fontWeight="700"
                      gap={1.5}
                      _hover={{ bg: "#165840" }}
                    >
                      <FaCheckCircle size={13} />
                      قبول وإرسال QR
                    </Button>

                    <Button
                      w="100%"
                      bg="rgba(155, 44, 44, 0.1)"
                      color="#9B2C2C"
                      border="1px solid rgba(155, 44, 44, 0.3)"
                      borderRadius="12px"
                      fontSize="0.85rem"
                      fontWeight="700"
                      gap={1.5}
                      _hover={{ bg: "rgba(155, 44, 44, 0.18)" }}
                    >
                      <FaTimesCircle size={13} />
                      اعتذار السعة
                    </Button>
                  </Flex>
                </Box>
              )}

              {activeStep === 3 && (
                /* Step 4 Preview: QR Pass & EmailJS Delivery Simulation */
                <Box
                  bg="linear-gradient(145deg, #231A1E 0%, #161214 100%)"
                  color="white"
                  borderRadius="24px"
                  p={6}
                  border="2px solid #D4AF37"
                  boxShadow="0 25px 50px -12px rgba(212, 175, 55, 0.25)"
                  textAlign="center"
                  position="relative"
                  overflow="hidden"
                >
                  <Box position="absolute" top="-10px" right="-10px" w="70px" h="70px" bg="#D4AF37" opacity={0.1} borderRadius="full" filter="blur(14px)" />

                  <Badge bg="rgba(212,175,55,0.25)" color="#E5C158" borderRadius="full" px={3} py={1} mb={3} fontSize="0.75rem" fontWeight="800">
                    ✦ VIP GUEST PASS
                  </Badge>

                  <Text fontFamily="var(--font-arabic-display, serif)" fontSize="1.3rem" fontWeight="800" color="#D4AF37" mb={1}>
                    حفل زفاف عمر وليلى
                  </Text>
                  <Text fontSize="0.75rem" color="rgba(255,255,255,0.65)" mb={4}>
                    الجمعة، 20 نوفمبر 2026 · فندق فورسيزونز الإسكندرية
                  </Text>

                  {/* QR Box */}
                  <Flex justify="center" mb={4}>
                    <Box
                      p={3}
                      bg="white"
                      borderRadius="18px"
                      boxShadow="0 8px 24px rgba(0,0,0,0.3)"
                      display="inline-block"
                    >
                      <svg width="110" height="110" viewBox="0 0 100 100">
                        <rect width="100" height="100" fill="white" />
                        <rect x="10" y="10" width="24" height="24" fill="#6B1D28" />
                        <rect x="14" y="14" width="16" height="16" fill="white" />
                        <rect x="18" y="18" width="8" height="8" fill="#6B1D28" />

                        <rect x="66" y="10" width="24" height="24" fill="#6B1D28" />
                        <rect x="70" y="14" width="16" height="16" fill="white" />
                        <rect x="74" y="18" width="8" height="8" fill="#6B1D28" />

                        <rect x="10" y="66" width="24" height="24" fill="#6B1D28" />
                        <rect x="14" y="70" width="16" height="16" fill="white" />
                        <rect x="18" y="74" width="8" height="8" fill="#6B1D28" />

                        <rect x="42" y="14" width="6" height="6" fill="#6B1D28" />
                        <rect x="52" y="22" width="6" height="6" fill="#6B1D28" />
                        <rect x="42" y="42" width="16" height="16" fill="#D4AF37" />
                        <rect x="22" y="46" width="8" height="8" fill="#6B1D28" />
                        <rect x="70" y="46" width="10" height="8" fill="#6B1D28" />
                        <rect x="44" y="70" width="12" height="12" fill="#6B1D28" />
                        <rect x="68" y="72" width="14" height="8" fill="#6B1D28" />
                      </svg>
                    </Box>
                  </Flex>

                  <Text fontSize="0.82rem" fontWeight="700" color="white" mb={0.5}>
                    الضيف: م. يوسف الغامدي (+2)
                  </Text>
                  <Text fontSize="0.7rem" color="#D4AF37">
                    رمز التحقق: INV-PASS-8842-VIP
                  </Text>
                </Box>
              )}
            </Box>
          </SimpleGrid>
        </Box>
      </Box>
    </Box>
  );
};

export const FeaturesAndMailboxSection = InvitationFeaturesShowcase;
export default InvitationFeaturesShowcase;
