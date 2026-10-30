import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  HStack,
  Button,
  Badge,
} from "@chakra-ui/react";
import { FaCalendarCheck, FaTimes, FaCheck, FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    yourName: "",
    partnerName: "",
    phone: "",
    eventDate: "",
    venue: "الإسكندرية",
    notes: "",
    selectedPackage: initialPackage,
    addons: [] as string[],
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const toggleAddon = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.includes(name)
        ? prev.addons.filter((a) => a !== name)
        : [...prev.addons, name],
    }));
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setStep(1);
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
      bg="rgba(15, 10, 12, 0.78)"
      backdropFilter="blur(14px)"
      p={4}
      overflowY="auto"
      dir="rtl"
    >
      <Box
        bg="rgba(255, 255, 255, 0.98)"
        borderRadius="30px"
        maxW="600px"
        w="100%"
        p={{ base: 6, sm: 8 }}
        boxShadow="0 30px 80px -20px rgba(0, 0, 0, 0.35)"
        border="1px solid rgba(212, 175, 55, 0.4)"
        position="relative"
        maxH="90vh"
        overflowY="auto"
        textAlign="right"
      >
        {/* Close Button */}
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
          _hover={{ bg: "rgba(0, 0, 0, 0.1)", color: "#000" }}
          aria-label="إغلاق نافذة الحجز"
        >
          <FaTimes />
        </Box>

        {isSubmitted ? (
          /* SCREEN 11: CONFIRMATION MODAL */
          <Flex direction="column" align="center" textAlign="center" py={8}>
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
              bg="rgba(212, 175, 55, 0.2)"
              color="var(--athar-maroon)"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="0.85rem"
              fontWeight="800"
              mb={3}
            >
              تم استلام طلبكم بنجاح
            </Badge>

            <Text
              fontFamily="var(--font-arabic-display)"
              fontSize={{ base: "1.9rem", md: "2.3rem" }}
              fontWeight="800"
              color="var(--athar-text-title)"
              mb={2}
            >
              تم إرسال طلبكم بنجاح!
            </Text>

            <Text fontSize="1.05rem" color="var(--athar-text-muted)" maxW="460px" mb={6} lineHeight="1.8">
              شكراً لكم، {formData.yourName || "مينا"} & {formData.partnerName || "مريم"}.
              سيتواصل معكم فريق أثر عبر واتساب خلال ساعات قليلة لتأكيد توافر التاريخ وتنسيق كل تفاصيل يومكم الجميل.
            </Text>

            <Button onClick={resetAndClose} className="btn-athar-primary" py={5} px={8} fontSize="1rem">
              العودة للرئيسية
            </Button>

            <Text
              fontSize="0.85rem"
              color="var(--athar-maroon)"
              fontWeight="700"
              letterSpacing="0.08em"
              mt={8}
            >
              أَصْوَات تَصْنَع غَداً أَجْمَل.
            </Text>
          </Flex>
        ) : (
          /* SCREEN 10: 3-STEP BOOKING FORM */
          <Box>
            {/* Header */}
            <Flex direction="column" align="center" textAlign="center" mb={6}>
              <Text
                fontFamily="var(--font-arabic-display)"
                fontSize={{ base: "1.8rem", md: "2.2rem" }}
                fontWeight="800"
                color="var(--athar-text-title)"
              >
                احجز موعدك
              </Text>
              <Text fontSize="0.95rem" color="var(--athar-text-muted)">
                يسعدنا أن نكون جزءاً من فرحتكم. الخطوة {step} من ٣
              </Text>

              {/* Stepper Dots */}
              <HStack gap={3} mt={4}>
                {["البيانات", "الباقة", "التأكيد"].map((stName, idx) => {
                  const stepNumber = idx + 1;
                  const isActive = step === stepNumber;
                  const isDone = step > stepNumber;
                  return (
                    <HStack key={stName} gap={2}>
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
                        {isDone ? <FaCheck size={10} /> : stepNumber}
                      </Flex>
                      <Text
                        fontSize="0.85rem"
                        fontWeight={isActive ? "800" : "600"}
                        color={isActive ? "var(--athar-text-title)" : "var(--athar-text-muted)"}
                        display={{ base: "none", sm: "block" }}
                      >
                        {stName}
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>
            </Flex>

            {/* Step 1: Details */}
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
                  التالي: اختيار الباقة <FaArrowLeft style={{ marginRight: "6px" }} />
                </Button>
              </Flex>
            )}

            {/* Step 2: Package & Add-ons */}
            {step === 2 && (
              <Flex direction="column" gap={4}>
                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-text-title)">
                  اختر الباقة المناسبة:
                </Text>
                <Flex gap={3} direction={{ base: "column", sm: "row" }}>
                  {[
                    { name: "لحظة أثر", price: "٥,٥٠٠ ج.م", hours: "٣ ساعات تغطية" },
                    { name: "حكاية أثر", price: "٧,٠٠٠ ج.م", hours: "٦ ساعات كاملة" },
                  ].map((pkg) => (
                    <Box
                      key={pkg.name}
                      flex="1"
                      p={4}
                      borderRadius="16px"
                      border="2px solid"
                      borderColor={
                        formData.selectedPackage === pkg.name
                          ? "var(--athar-maroon)"
                          : "rgba(0, 0, 0, 0.1)"
                      }
                      bg={
                        formData.selectedPackage === pkg.name
                          ? "rgba(107, 29, 40, 0.05)"
                          : "white"
                      }
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, selectedPackage: pkg.name })}
                    >
                      <Text fontFamily="var(--font-arabic-display)" fontWeight="800" fontSize="1.15rem">
                        {pkg.name}
                      </Text>
                      <Text fontSize="0.92rem" color="var(--athar-maroon)" fontWeight="800">
                        {pkg.price}
                      </Text>
                      <Text fontSize="0.8rem" color="var(--athar-text-muted)">
                        {pkg.hours}
                      </Text>
                    </Box>
                  ))}
                </Flex>

                <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-text-title)" mt={2}>
                  إضافات اختيارية:
                </Text>
                {[
                  { name: "تسليم سريع للملفات (خلال ٤٨ ساعة)", price: "+٥٠٠ ج.م" },
                  { name: "لافتة ترحيبية بخط يدوي مخصص بأسماء العروسين", price: "+٥٠٠ ج.م" },
                  { name: "ساعة تغطية إضافية", price: "+٥٠٠ ج.م / ساعة" },
                ].map((addon) => {
                  const isChecked = formData.addons.includes(addon.name);
                  return (
                    <HStack
                      key={addon.name}
                      justify="space-between"
                      p={3}
                      borderRadius="12px"
                      border="1px solid"
                      borderColor={isChecked ? "var(--athar-maroon)" : "rgba(0,0,0,0.08)"}
                      bg={isChecked ? "rgba(107, 29, 40, 0.04)" : "white"}
                      cursor="pointer"
                      onClick={() => toggleAddon(addon.name)}
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
                        <Text fontSize="0.92rem" fontWeight="700">
                          {addon.name}
                        </Text>
                      </HStack>
                      <Text fontSize="0.88rem" color="var(--athar-maroon)" fontWeight="800">
                        {addon.price}
                      </Text>
                    </HStack>
                  );
                })}

                <Flex gap={3} mt={4}>
                  <Button onClick={handleBack} variant="outline" flex="1" py={5} fontWeight="700">
                    <FaArrowRight style={{ marginLeft: "6px" }} /> السابق
                  </Button>
                  <Button onClick={handleNext} className="btn-athar-primary" flex="2" py={5} fontWeight="800">
                    مراجعة الطلب <FaArrowLeft style={{ marginRight: "6px" }} />
                  </Button>
                </Flex>
              </Flex>
            )}

            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <Flex direction="column" gap={4}>
                <Box p={5} bg="rgba(251, 247, 242, 0.95)" borderRadius="16px" border="1px solid rgba(212, 175, 55, 0.35)">
                  <Text fontFamily="var(--font-arabic-display)" fontSize="1.25rem" fontWeight="800" mb={3}>
                    ملخص تفاصيل الحجز
                  </Text>
                  <Flex direction="column" gap={2} fontSize="0.95rem">
                    <Flex justify="space-between">
                      <Text color="var(--athar-text-muted)">العروسين:</Text>
                      <Text fontWeight="700">{formData.yourName || "—"} & {formData.partnerName || "—"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="var(--athar-text-muted)">تاريخ الفرح:</Text>
                      <Text fontWeight="700">{formData.eventDate || "يحدد لاحقاً"}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="var(--athar-text-muted)">المكان والقاعة:</Text>
                      <Text fontWeight="700">{formData.venue}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="var(--athar-text-muted)">الباقة المختارة:</Text>
                      <Text fontWeight="800" color="var(--athar-maroon)">{formData.selectedPackage}</Text>
                    </Flex>
                    {formData.addons.length > 0 && (
                      <Flex justify="space-between">
                        <Text color="var(--athar-text-muted)">الإضافات:</Text>
                        <Text fontWeight="700">{formData.addons.join("، ")}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>

                <Text fontSize="0.85rem" color="var(--athar-text-muted)" textAlign="center">
                  ✦ عند إرسال الطلب، سيتواصل معكم فريق الاستقبال لتأكيد الحجز وتفاصيل العربون.
                </Text>

                <Flex gap={3} mt={2}>
                  <Button onClick={handleBack} variant="outline" flex="1" py={5} fontWeight="700">
                    <FaArrowRight style={{ marginLeft: "6px" }} /> السابق
                  </Button>
                  <Button onClick={handleSubmit} className="btn-athar-primary" flex="2" py={5} fontWeight="800">
                    تأكيد وإرسال الطلب ✓
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
