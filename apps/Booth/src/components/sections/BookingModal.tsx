import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Button,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaCalendarCheck,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaArrowRight,
  FaCopy,
  FaUpload,
  FaClock,
  FaMicrophone,
  FaExternalLinkAlt,
  FaHeadphones,
} from "react-icons/fa";
import {
  useBoothBooking,
  parsePlanLimits,
} from "../../hooks/useBoothBooking";
import type { AsarPlan } from "../../hooks/useBoothBooking";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  initialPackage = "لحظة أثر",
}) => {
  const {
    plans,
    addons,
    submitBookingOrder,
  } = useBoothBooking();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    yourName: "",
    partnerName: "",
    clientEmail: "",
    phone: "",
    eventDate: "",
    venue: "الإسكندرية",
    notes: "",
    selectedPackage: initialPackage,
    addons: [] as string[],
    paymentMethod: "instapay" as "instapay" | "vodafone_cash" | "bank_transfer",
    paymentOption: "deposit" as "deposit" | "full",
  });

  // Pre-load preselected addons from localStorage if saved by AddonsSection
  useEffect(() => {
    try {
      const stored = localStorage.getItem("asar_preselected_addons");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFormData((prev) => ({
            ...prev,
            addons: Array.from(new Set([...prev.addons, ...parsed])),
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Update selectedPackage when initialPackage changes
  useEffect(() => {
    if (initialPackage) {
      setFormData((prev) => ({ ...prev, selectedPackage: initialPackage }));
    }
  }, [initialPackage]);

  // Payment Receipt Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Selected Plan Object
  const currentPlan =
    plans.find((p) => p.name === formData.selectedPackage) ||
    plans[0] || {
      name: "لحظة أثر",
      price: 5500,
      limitsJson: "{}",
    };

  // Live Price Calculation
  const planPrice = currentPlan ? currentPlan.price : 5500;
  const addonsSum = formData.addons.reduce((sum, addonIdOrName) => {
    const matched = addons.find(
      (a) => a.id === addonIdOrName || a.name === addonIdOrName
    );
    return sum + (matched ? matched.price : 0);
  }, 0);
  const totalPrice = planPrice + addonsSum;
  const depositAmount = Math.min(1500, totalPrice);
  const paymentAmountToPay =
    formData.paymentOption === "full" ? totalPrice : depositAmount;

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (!formData.yourName.trim()) {
      setErrorMessage("يرجى كتابة الاسم بالكامل.");
      return false;
    }
    if (!formData.partnerName.trim()) {
      setErrorMessage("يرجى كتابة اسم شريك / شريكة الحياة.");
      return false;
    }
    if (
      !formData.clientEmail.trim() ||
      !formData.clientEmail.includes("@") ||
      !formData.clientEmail.includes(".")
    ) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحيح لمتابعة حالة الحجز.");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setErrorMessage("يرجى إدخال رقم هاتف واتساب صحيح للتواصل.");
      return false;
    }
    if (!formData.eventDate) {
      setErrorMessage("يرجى تحديد تاريخ المناسبة.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    if (!receiptFile && !receiptPreview) {
      setErrorMessage("يرجى إرفاق إيصال التحويل (لقطة الشاشة) لإتمام تأكيد الحجز.");
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorMessage(null);
    if (step > 1) setStep(step - 1);
  };

  const toggleAddon = (identifier: string) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.includes(identifier)
        ? prev.addons.filter((a) => a !== identifier)
        : [...prev.addons, identifier],
    }));
  };

  // Handle Receipt File Selection
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("يرجى رفع ملف صورة صالح (.jpg, .png, .webp).");
      return;
    }
    setReceiptFile(file);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 2200);
  };

  // Final Form Submit (Step 3 -> Step 4)
  const handleSubmitBooking = async () => {
    if (!validateStep3()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitBookingOrder({
        clientName: formData.yourName,
        partnerOrOrgName: formData.partnerName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.phone,
        eventDate: formData.eventDate,
        eventVenue: formData.venue,
        planId: currentPlan?.$id,
        planName: formData.selectedPackage,
        selectedAddons: formData.addons,
        totalAmount: totalPrice,
        depositAmount: paymentAmountToPay,
        paymentMethod: formData.paymentMethod,
        paymentScreenshotFile: receiptFile,
        adminNotes: formData.notes,
      });

      setSubmittedOrderId(result.orderId);
      setStep(4);
    } catch (err: unknown) {
      console.error("Booking submission error:", err);
      setErrorMessage(
        "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setReceiptFile(null);
    setReceiptPreview(null);
    setSubmittedOrderId(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex="100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(15, 10, 12, 0.82)"
      backdropFilter="blur(16px)"
      p={4}
      overflowY="auto"
      dir="rtl"
    >
      <Box
        bg="rgba(255, 255, 255, 0.99)"
        borderRadius="30px"
        maxW="680px"
        w="100%"
        p={{ base: 6, sm: 8 }}
        boxShadow="0 30px 80px -20px rgba(0, 0, 0, 0.45)"
        border="1px solid rgba(212, 175, 55, 0.45)"
        position="relative"
        maxH="92vh"
        overflowY="auto"
        textAlign="right"
      >
        {/* Close Modal Button */}
        <Box
          as="button"
          position="absolute"
          top="20px"
          left="20px"
          onClick={resetAndClose}
          color="var(--athar-text-muted)"
          bg="rgba(0, 0, 0, 0.05)"
          borderRadius="full"
          p={2.5}
          border="none"
          cursor="pointer"
          transition="all 0.2s ease"
          _hover={{ bg: "rgba(107, 29, 40, 0.12)", color: "var(--athar-maroon)" }}
          aria-label="إغلاق نافذة الحجز"
        >
          <FaTimes />
        </Box>

        {/* STEP 4: CONFIRMATION & ORDER TRACKER DEEP-LINK */}
        {step === 4 && (
          <Flex direction="column" align="center" textAlign="center" py={6}>
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              bg="rgba(107, 29, 40, 0.1)"
              color="var(--athar-maroon)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="2.4rem"
              mb={4}
            >
              <FaCalendarCheck />
            </Box>

            <Badge
              bg="rgba(212, 175, 55, 0.22)"
              color="var(--athar-maroon)"
              border="1px solid rgba(212, 175, 55, 0.4)"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="0.88rem"
              fontWeight="800"
              mb={3}
            >
              تم استلام طلبكم وإيصال التحويل بنجاح
            </Badge>

            <Text
              fontFamily="var(--font-arabic-display)"
              fontSize={{ base: "1.9rem", md: "2.4rem" }}
              fontWeight="800"
              color="var(--athar-text-title)"
              mb={2}
            >
              مبارك مقدماً، تم تسجيل حجزكم!
            </Text>

            {/* Order Reference Badge */}
            <Box
              bg="rgba(251, 247, 242, 0.96)"
              p={4}
              borderRadius="18px"
              border="1px dashed #D4AF37"
              my={4}
              w="100%"
              maxW="480px"
            >
              <Text fontSize="0.82rem" color="var(--athar-text-muted)" fontWeight="700">
                رقم مرجع الحجز (Order Reference ID)
              </Text>
              <Text
                fontFamily="var(--font-arabic-body)"
                fontSize="1.7rem"
                fontWeight="900"
                color="var(--athar-maroon)"
                letterSpacing="0.05em"
                dir="ltr"
              >
                #{submittedOrderId || "ORD-2026"}
              </Text>

              <Badge
                mt={2}
                bg="rgba(183, 121, 31, 0.14)"
                color="#B7791F"
                border="1px solid rgba(183, 121, 31, 0.3)"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="0.8rem"
                fontWeight="700"
              >
                قيد مراجعة الدفع من الإدارة — Pending Payment Approval
              </Badge>
            </Box>

            <Text
              fontSize="1rem"
              color="var(--athar-text-muted)"
              maxW="500px"
              mb={6}
              lineHeight="1.8"
            >
              شكراً لكم، {formData.yourName} & {formData.partnerName}.
              تم حفظ إيصال التحويل وسيتم مراجعته وتأكيد التاريخ فورياً. فور الاعتماد، ستتمكنون من الدخول إلى حسابكم لرفع صور الغلاف، الإهداءات، وتنسيق الأقسام الصوتية.
            </Text>

            {/* Action Buttons */}
            <Flex direction="column" gap={3} w="100%" maxW="460px">
              <a
                href={`http://localhost:3000?orderId=${submittedOrderId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  className="btn-athar-primary"
                  w="100%"
                  py={6}
                  fontSize="1.02rem"
                  fontWeight="800"
                  borderRadius="16px"
                >
                  <FaExternalLinkAlt style={{ marginLeft: "8px", fontSize: "0.9rem" }} />
                  تتبع حالة طلبك في حساب العميل (Client Portal) →
                </Button>
              </a>

              <Button
                onClick={() => {
                  window.location.search = "?memory=mina-and-maryam";
                }}
                variant="outline"
                borderColor="rgba(212, 175, 55, 0.6)"
                color="var(--athar-maroon)"
                py={5}
                borderRadius="14px"
                fontWeight="700"
                _hover={{ bg: "rgba(212, 175, 55, 0.1)" }}
              >
                <FaHeadphones style={{ marginLeft: "8px" }} />
                معاينة صفحة الذكريات التجريبية (Mina & Maryam)
              </Button>

              <Button
                onClick={resetAndClose}
                variant="ghost"
                color="var(--athar-text-muted)"
                py={4}
                fontWeight="600"
              >
                إغلاق والعودة للرئيسية
              </Button>
            </Flex>

            <Text
              fontSize="0.84rem"
              color="var(--athar-maroon)"
              fontWeight="700"
              letterSpacing="0.08em"
              mt={6}
            >
              أَصْوَات تَصْنَع غَداً أَجْمَل.
            </Text>
          </Flex>
        )}

        {/* STEPS 1 TO 3: 4-STEP CONCIERGE BOOKING & PAYMENT ENGINE */}
        {step < 4 && (
          <Box>
            {/* Modal Header */}
            <Flex direction="column" align="center" textAlign="center" mb={6}>
              <Text
                fontFamily="var(--font-arabic-display)"
                fontSize={{ base: "1.8rem", md: "2.2rem" }}
                fontWeight="800"
                color="var(--athar-text-title)"
              >
                حجز هاتف أثر الصوتي
              </Text>
              <Text fontSize="0.95rem" color="var(--athar-text-muted)">
                الخطوة {step} من ٤:{" "}
                {step === 1 && "بيانات العروسين والمناسبة"}
                {step === 2 && "اختيار الباقة والإضافات"}
                {step === 3 && "الدفع اليدوي ورفع إيصال التحويل"}
              </Text>

              {/* Stepper Dots */}
              <HStack gap={2.5} mt={4} flexWrap="wrap" justify="center">
                {[
                  { num: 1, label: "البيانات" },
                  { num: 2, label: "الباقة" },
                  { num: 3, label: "الدفع والإيصال" },
                  { num: 4, label: "التأكيد" },
                ].map((st) => {
                  const isActive = step === st.num;
                  const isDone = step > st.num;
                  return (
                    <HStack key={st.num} gap={2}>
                      <Flex
                        w="28px"
                        h="28px"
                        borderRadius="full"
                        align="center"
                        justify="center"
                        fontSize="0.82rem"
                        fontWeight="800"
                        bg={
                          isActive
                            ? "var(--athar-maroon)"
                            : isDone
                            ? "#D4AF37"
                            : "rgba(0, 0, 0, 0.08)"
                        }
                        color={isActive || isDone ? "white" : "var(--athar-text-muted)"}
                      >
                        {isDone ? <FaCheck size={10} /> : st.num}
                      </Flex>
                      <Text
                        fontSize="0.85rem"
                        fontWeight={isActive ? "800" : "600"}
                        color={isActive ? "var(--athar-text-title)" : "var(--athar-text-muted)"}
                        display={{ base: "none", sm: "block" }}
                      >
                        {st.label}
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>
            </Flex>

            {/* Error Banner */}
            {errorMessage && (
              <Box
                mb={4}
                p={3.5}
                borderRadius="12px"
                bg="rgba(155, 44, 44, 0.1)"
                border="1px solid rgba(155, 44, 44, 0.3)"
                color="#9B2C2C"
                fontSize="0.9rem"
                fontWeight="700"
              >
                ⚠ {errorMessage}
              </Box>
            )}

            {/* STEP 1: CELEBRATION DETAILS */}
            {step === 1 && (
              <Flex direction="column" gap={4}>
                <Box>
                  <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                    الاسم بالكامل *
                  </Text>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مينا رءوف"
                    value={formData.yourName}
                    onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      direction: "rtl",
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                    اسم شريك / شريكة الحياة *
                  </Text>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مريم صبحي"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      direction: "rtl",
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                    البريد الإلكتروني للعميل * (مطلوب لربط الحساب وتتبع الطلب)
                  </Text>
                  <input
                    type="email"
                    required
                    placeholder="mina.maryam@example.com"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      direction: "ltr",
                      textAlign: "right",
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                    رقم الواتساب للتواصل *
                  </Text>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      direction: "ltr",
                      textAlign: "right",
                    }}
                  />
                </Box>

                <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                  <Box flex="1">
                    <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                      تاريخ المناسبة *
                    </Text>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(107, 29, 40, 0.2)",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontFamily: "inherit",
                      }}
                    />
                  </Box>

                  <Box flex="1">
                    <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                      القاعة / المنطقة *
                    </Text>
                    <select
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem",
                        borderRadius: "12px",
                        border: "1px solid rgba(107, 29, 40, 0.2)",
                        outline: "none",
                        fontSize: "0.95rem",
                        backgroundColor: "#FFF",
                        fontFamily: "inherit",
                      }}
                    >
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="الساحل الشمالي">الساحل الشمالي</option>
                      <option value="العجمي">العجمي</option>
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="محافظة أخرى">محافظة أخرى</option>
                    </select>
                  </Box>
                </Flex>

                <Box>
                  <Text fontSize="0.9rem" fontWeight="700" mb={1}>
                    أي ملاحظات أو تفاصيل خاصة؟ (اختياري)
                  </Text>
                  <textarea
                    rows={2}
                    placeholder="أخبرنا عن طابع الفرح أو منسق الديكور أو استفساراتكم..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(107, 29, 40, 0.2)",
                      outline: "none",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      direction: "rtl",
                    }}
                  />
                </Box>

                <Button onClick={handleNext} className="btn-athar-primary" w="100%" py={5} mt={2}>
                  التالي: اختيار الباقة والإضافات <FaArrowLeft style={{ marginRight: "6px" }} />
                </Button>
              </Flex>
            )}

            {/* STEP 2: PLAN & ADD-ONS SELECTION */}
            {step === 2 && (
              <Flex direction="column" gap={4}>
                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-text-title)">
                  اختر الباقة المناسبة:
                </Text>

                {/* Dynamic Plan Cards */}
                <SimpleGrid columns={{ base: 1, sm: plans.length > 2 ? 3 : 2 }} gap={3}>
                  {plans.map((pkg: AsarPlan) => {
                    const isSelected = formData.selectedPackage === pkg.name;
                    const pkgLimits = parsePlanLimits(pkg);
                    return (
                      <Box
                        key={pkg.$id || pkg.name}
                        p={4}
                        borderRadius="18px"
                        border="2px solid"
                        borderColor={isSelected ? "var(--athar-maroon)" : "rgba(0, 0, 0, 0.1)"}
                        bg={isSelected ? "rgba(107, 29, 40, 0.05)" : "white"}
                        boxShadow={isSelected ? "0 8px 24px -10px rgba(107, 29, 40, 0.2)" : undefined}
                        cursor="pointer"
                        position="relative"
                        onClick={() => setFormData({ ...formData, selectedPackage: pkg.name })}
                        transition="all 0.2s ease"
                      >
                        <Flex justify="space-between" align="baseline" mb={1}>
                          <Text fontFamily="var(--font-arabic-display)" fontWeight="800" fontSize="1.15rem">
                            {pkg.name}
                          </Text>
                          {isSelected && (
                            <Box
                              w="20px"
                              h="20px"
                              borderRadius="full"
                              bg="var(--athar-maroon)"
                              color="white"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="0.7rem"
                            >
                              <FaCheck />
                            </Box>
                          )}
                        </Flex>

                        <Text fontSize="1.1rem" color="var(--athar-maroon)" fontWeight="900" mb={1}>
                          {pkg.price.toLocaleString("en-US")} {pkg.currency || "ج.م"}
                        </Text>

                        <HStack fontSize="0.78rem" color="var(--athar-text-muted)" gap={2} mb={1}>
                          <FaClock size={10} />
                          <Text>{pkgLimits.coverageHours || 3} ساعات تغطية</Text>
                        </HStack>

                        <HStack fontSize="0.78rem" color="var(--athar-text-muted)" gap={2}>
                          <FaMicrophone size={10} />
                          <Text>
                            {pkgLimits.maxVoiceRecords === -1
                              ? "غير محدود"
                              : `${pkgLimits.maxVoiceRecords} تسجيل`}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>

                {/* Optional Add-ons Checklist */}
                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-text-title)" mt={2}>
                  إضافات وتفاصيل اختيارية:
                </Text>

                <Flex direction="column" gap={2}>
                  {addons.map((addon) => {
                    const isChecked =
                      formData.addons.includes(addon.id) ||
                      formData.addons.includes(addon.name);
                    return (
                      <HStack
                        key={addon.id}
                        justify="space-between"
                        p={3}
                        borderRadius="14px"
                        border="1px solid"
                        borderColor={isChecked ? "var(--athar-maroon)" : "rgba(0,0,0,0.08)"}
                        bg={isChecked ? "rgba(107, 29, 40, 0.04)" : "white"}
                        cursor="pointer"
                        onClick={() => toggleAddon(addon.id)}
                        transition="all 0.2s ease"
                      >
                        <HStack gap={3}>
                          <Box
                            w="20px"
                            h="20px"
                            borderRadius="6px"
                            border="1px solid var(--athar-maroon)"
                            bg={isChecked ? "var(--athar-maroon)" : "white"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontSize="0.7rem"
                          >
                            {isChecked && <FaCheck />}
                          </Box>
                          <Box>
                            <Text fontSize="0.92rem" fontWeight="700">
                              {addon.name}
                            </Text>
                            {addon.badge && (
                              <Text fontSize="0.75rem" color="var(--athar-text-muted)">
                                {addon.badge}
                              </Text>
                            )}
                          </Box>
                        </HStack>
                        <Text fontSize="0.88rem" color="var(--athar-maroon)" fontWeight="800">
                          {addon.price > 0 ? `+${addon.price.toLocaleString("en-US")} ج.م` : "حسب الطلب"}
                        </Text>
                      </HStack>
                    );
                  })}
                </Flex>

                {/* Total & Deposit Price Card */}
                <Box
                  p={4}
                  borderRadius="16px"
                  bg="linear-gradient(135deg, #FAF4E6 0%, #FFFFFF 100%)"
                  border="1px solid #D4AF37"
                  mt={2}
                >
                  <Flex justify="space-between" align="center" mb={1.5}>
                    <Text fontSize="0.9rem" color="var(--athar-text-muted)" fontWeight="700">
                      إجمالي الباقة والإضافات:
                    </Text>
                    <Text
                      fontFamily="var(--font-arabic-body)"
                      fontSize="1.35rem"
                      fontWeight="900"
                      color="var(--athar-maroon)"
                      dir="ltr"
                    >
                      {totalPrice.toLocaleString("en-US")} ج.م
                    </Text>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Text fontSize="0.85rem" color="var(--athar-text-muted)" fontWeight="600">
                      العربون المطلوب لتأكيد حجز التاريخ:
                    </Text>
                    <Badge
                      bg="rgba(107, 29, 40, 0.1)"
                      color="var(--athar-maroon)"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontWeight="800"
                      fontSize="0.85rem"
                    >
                      {depositAmount.toLocaleString("en-US")} ج.م
                    </Badge>
                  </Flex>
                </Box>

                <Flex gap={3} mt={3}>
                  <Button onClick={handleBack} variant="outline" flex="1" py={5} fontWeight="700">
                    <FaArrowRight style={{ marginLeft: "6px" }} /> السابق
                  </Button>
                  <Button onClick={handleNext} className="btn-athar-primary" flex="2" py={5} fontWeight="800">
                    متابعة للدفع ورفع الإيصال <FaArrowLeft style={{ marginRight: "6px" }} />
                  </Button>
                </Flex>
              </Flex>
            )}

            {/* STEP 3: MANUAL PAYMENT & SCREENSHOT UPLOAD */}
            {step === 3 && (
              <Flex direction="column" gap={4}>
                {/* Deposit vs Full Payment Option Selector */}
                <Box>
                  <Text fontSize="0.9rem" fontWeight="800" mb={2}>
                    اختر قيمة التحويل:
                  </Text>
                  <Flex gap={3}>
                    <Box
                      flex="1"
                      p={3}
                      borderRadius="14px"
                      border="2px solid"
                      borderColor={
                        formData.paymentOption === "deposit"
                          ? "var(--athar-maroon)"
                          : "rgba(0,0,0,0.1)"
                      }
                      bg={formData.paymentOption === "deposit" ? "rgba(107, 29, 40, 0.05)" : "white"}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, paymentOption: "deposit" })}
                      textAlign="center"
                    >
                      <Text fontSize="0.85rem" fontWeight="700">
                        العربون لتأكيد الحجز
                      </Text>
                      <Text fontSize="1.15rem" fontWeight="900" color="var(--athar-maroon)">
                        {depositAmount.toLocaleString("en-US")} ج.م
                      </Text>
                    </Box>

                    <Box
                      flex="1"
                      p={3}
                      borderRadius="14px"
                      border="2px solid"
                      borderColor={
                        formData.paymentOption === "full"
                          ? "var(--athar-maroon)"
                          : "rgba(0,0,0,0.1)"
                      }
                      bg={formData.paymentOption === "full" ? "rgba(107, 29, 40, 0.05)" : "white"}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, paymentOption: "full" })}
                      textAlign="center"
                    >
                      <Text fontSize="0.85rem" fontWeight="700">
                        كامل قيمة الحجز
                      </Text>
                      <Text fontSize="1.15rem" fontWeight="900" color="var(--athar-maroon)">
                        {totalPrice.toLocaleString("en-US")} ج.م
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {/* Payment Method Selector */}
                <Box>
                  <Text fontSize="0.9rem" fontWeight="800" mb={2}>
                    اختر طريقة الدفع المناسبة للتحويل:
                  </Text>
                  <Flex gap={2} mb={3} flexWrap="wrap">
                    {[
                      { key: "instapay", label: "InstaPay (إنستاباي)" },
                      { key: "vodafone_cash", label: "فودافون كاش" },
                      { key: "bank_transfer", label: "تحويل بنكي" },
                    ].map((method) => {
                      const isSelected = formData.paymentMethod === method.key;
                      return (
                        <Button
                          key={method.key}
                          size="sm"
                          variant={isSelected ? "solid" : "outline"}
                          bg={isSelected ? "var(--athar-maroon)" : "transparent"}
                          color={isSelected ? "white" : "var(--athar-text-body)"}
                          borderColor="var(--athar-maroon)"
                          borderRadius="full"
                          px={4}
                          fontWeight="700"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paymentMethod: method.key as "instapay" | "vodafone_cash" | "bank_transfer",
                            })
                          }
                        >
                          {method.label}
                        </Button>
                      );
                    })}
                  </Flex>

                  {/* Payment Details Card with Copy Button */}
                  <Box
                    p={4}
                    borderRadius="16px"
                    bg="rgba(251, 247, 242, 0.98)"
                    border="1px solid rgba(212, 175, 55, 0.5)"
                  >
                    {formData.paymentMethod === "instapay" && (
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="600">
                            عنوان إنستاباي (InstaPay Handle):
                          </Text>
                          <Text
                            fontFamily="monospace"
                            fontSize="1.1rem"
                            fontWeight="800"
                            color="var(--athar-maroon)"
                            dir="ltr"
                          >
                            athar.audio@instapay
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="#D4AF37"
                          color="var(--athar-maroon)"
                          onClick={() => handleCopy("athar.audio@instapay", "instapay")}
                        >
                          <FaCopy style={{ marginLeft: "5px" }} />
                          {copyFeedback === "instapay" ? "تم النسخ ✓" : "نسخ العنوان"}
                        </Button>
                      </Flex>
                    )}

                    {formData.paymentMethod === "vodafone_cash" && (
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="600">
                            رقم محفظة فودافون كاش:
                          </Text>
                          <Text
                            fontFamily="monospace"
                            fontSize="1.15rem"
                            fontWeight="800"
                            color="var(--athar-maroon)"
                            dir="ltr"
                          >
                            0100 000 0000
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="#D4AF37"
                          color="var(--athar-maroon)"
                          onClick={() => handleCopy("01000000000", "vodafone")}
                        >
                          <FaCopy style={{ marginLeft: "5px" }} />
                          {copyFeedback === "vodafone" ? "تم النسخ ✓" : "نسخ الرقم"}
                        </Button>
                      </Flex>
                    )}

                    {formData.paymentMethod === "bank_transfer" && (
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="600">
                            بنك CIB — حساب: 1000 4829 3012
                          </Text>
                          <Text
                            fontFamily="monospace"
                            fontSize="0.9rem"
                            fontWeight="800"
                            color="var(--athar-maroon)"
                            dir="ltr"
                          >
                            IBAN: EG38000482930129084729104
                          </Text>
                        </Box>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="#D4AF37"
                          color="var(--athar-maroon)"
                          onClick={() =>
                            handleCopy("EG38000482930129084729104", "bank")
                          }
                        >
                          <FaCopy style={{ marginLeft: "5px" }} />
                          {copyFeedback === "bank" ? "تم النسخ ✓" : "نسخ الآيبان"}
                        </Button>
                      </Flex>
                    )}
                  </Box>
                </Box>

                {/* Screenshot Upload Dropzone */}
                <Box>
                  <Text fontSize="0.9rem" fontWeight="800" mb={1.5}>
                    رفع لقطة شاشة إيصال التحويل *
                  </Text>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {receiptPreview ? (
                    /* Thumbnail Preview */
                    <Box
                      p={4}
                      borderRadius="18px"
                      border="2px solid var(--athar-maroon)"
                      bg="rgba(107, 29, 40, 0.03)"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={4}
                    >
                      <HStack gap={3}>
                        <Box
                          w="60px"
                          h="60px"
                          borderRadius="12px"
                          overflow="hidden"
                          border="1px solid rgba(0,0,0,0.1)"
                          flexShrink={0}
                        >
                          <img
                            src={receiptPreview}
                            alt="إيصال التحويل"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        <Box>
                          <Text fontSize="0.92rem" fontWeight="800" color="var(--athar-text-title)">
                            {receiptFile?.name || "إيصال التحويل.png"}
                          </Text>
                          <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                            {receiptFile
                              ? `${(receiptFile.size / (1024 * 1024)).toFixed(2)} ميجابايت`
                              : "تم إرفاق الصورة بنجاح"}
                          </Text>
                          <Badge bg="rgba(30, 111, 80, 0.12)" color="#1E6F50" mt={1}>
                            جاهز للإرسال ✓
                          </Badge>
                        </Box>
                      </HStack>

                      <Button
                        size="sm"
                        variant="outline"
                        borderColor="rgba(107, 29, 40, 0.3)"
                        color="var(--athar-maroon)"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        استبدال الصورة
                      </Button>
                    </Box>
                  ) : (
                    /* Dropzone Area */
                    <Box
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      cursor="pointer"
                      p={6}
                      borderRadius="18px"
                      border="2px dashed"
                      borderColor={isDragging ? "var(--athar-maroon)" : "#D4AF37"}
                      bg={isDragging ? "rgba(107, 29, 40, 0.06)" : "rgba(251, 247, 242, 0.7)"}
                      textAlign="center"
                      transition="all 0.2s ease"
                      _hover={{
                        bg: "rgba(251, 247, 242, 0.95)",
                        borderColor: "var(--athar-maroon)",
                      }}
                    >
                      <Flex direction="column" align="center" gap={2}>
                        <Box
                          w="46px"
                          h="46px"
                          borderRadius="full"
                          bg="rgba(107, 29, 40, 0.1)"
                          color="var(--athar-maroon)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="1.3rem"
                        >
                          <FaUpload />
                        </Box>
                        <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-text-title)">
                          اضغط لاختيار صورة الإيصال أو اسحب الملف هنا
                        </Text>
                        <Text fontSize="0.8rem" color="var(--athar-text-muted)">
                          صيغ مقبولة: JPG, PNG, WEBP (حجم أقصى: ١٠ ميجابايت)
                        </Text>
                      </Flex>
                    </Box>
                  )}
                </Box>

                {/* Submission Warning */}
                <Text fontSize="0.82rem" color="var(--athar-text-muted)" textAlign="center">
                  ✦ سيتم تسجيل حجزكم وتحويل الإيصال للإدارة للتحقق خلال ساعات قليلة وتأكيد موعدكم.
                </Text>

                {/* Buttons */}
                <Flex gap={3} mt={2}>
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    flex="1"
                    py={5}
                    fontWeight="700"
                    disabled={isSubmitting}
                  >
                    <FaArrowRight style={{ marginLeft: "6px" }} /> السابق
                  </Button>
                  <Button
                    onClick={handleSubmitBooking}
                    className="btn-athar-primary"
                    flex="2"
                    py={5}
                    fontWeight="800"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "جارٍ إرسال الطلب والإيصال..." : "تأكيد وإرسال الحجز ✓"}
                  </Button>
                </Flex>
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BookingModal;
