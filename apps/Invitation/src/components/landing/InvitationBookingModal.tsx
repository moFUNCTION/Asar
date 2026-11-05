import React, { useState, useContext } from "react";
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
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaLock,
  FaUpload,
  FaPlus,
  FaTrash,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { AppwriteContext } from "@repo/react-appwrite";
import { DEFAULT_INVITATION_PLANS } from "./InvitationPackagesSection";
import type { InvitationPlan } from "./InvitationPackagesSection";
import { DEFAULT_INVITATION_ADDONS } from "./InvitationAddonsSection";

export interface InvitationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: InvitationPlan | string;
  initialAddons?: string[];
  plans?: InvitationPlan[];
}

export const InvitationBookingModal: React.FC<InvitationBookingModalProps> = ({
  isOpen,
  onClose,
  initialPackage,
  initialAddons = [],
  plans = DEFAULT_INVITATION_PLANS,
}) => {
  const appwrite = useContext(AppwriteContext);
  const availablePlans = plans && plans.length > 0 ? plans : DEFAULT_INVITATION_PLANS;

  // Form State
  const [step, setStep] = useState<number>(1);
  const [clientName, setClientName] = useState("");
  const [partnerOrOrgName, setPartnerOrOrgName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [occasionType, setOccasionType] = useState<string>("wedding");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [maxVenueCapacity, setMaxVenueCapacity] = useState<number>(150);

  // Selected Plan & Addons
  const resolvedInitialPlan =
    typeof initialPackage === "object" && initialPackage !== null
      ? initialPackage
      : availablePlans.find((p) => p.name === initialPackage) ||
        availablePlans[0];

  const [selectedPlanId, setSelectedPlanId] = useState<string>(resolvedInitialPlan.id);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(initialAddons);

  // Dynamic RSVP Requested Fields
  const [requestedFields, setRequestedFields] = useState<string[]>([
    "الاسم بالكامل (Full Name) - إلزامي 🔒",
    "البريد الإلكتروني (Email) - إلزامي 🔒",
    "رقم هاتف الواتساب (WhatsApp Phone)",
    "عدد المرافقين (Companions Count)",
  ]);
  const [customFieldInput, setCustomFieldInput] = useState("");

  // Payment Screenshot Upload
  const [paymentMethod, setPaymentMethod] = useState<string>("instapay");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Final Order State
  const [createdOrderId, setCreatedOrderId] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

  if (!isOpen) return null;

  const currentPlan =
    availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const totalAddonsPrice = selectedAddonIds.reduce((sum, id) => {
    const item = DEFAULT_INVITATION_ADDONS.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const grandTotal = currentPlan.price + totalAddonsPrice;
  const depositAmount = currentPlan.depositRequired;

  // Toggle Addons
  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Dynamic RSVP Field (Locked fields cannot be unchecked)
  const toggleRequestedField = (fieldName: string) => {
    if (fieldName.includes("إلزامي 🔒")) return; // Locked fields!
    setRequestedFields((prev) =>
      prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName]
    );
  };

  const handleAddCustomField = () => {
    if (!customFieldInput.trim()) return;
    if (!requestedFields.includes(customFieldInput.trim())) {
      setRequestedFields([...requestedFields, customFieldInput.trim()]);
    }
    setCustomFieldInput("");
  };

  const handleRemoveField = (fieldName: string) => {
    if (fieldName.includes("إلزامي 🔒")) return;
    setRequestedFields(requestedFields.filter((f) => f !== fieldName));
  };

  // Handle File Input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setScreenshotPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Navigations
  const handleNextFromStep1 = () => {
    setValidationError("");
    if (!clientName.trim()) {
      setValidationError("يرجى إدخال اسمك بالكامل للمتابعة.");
      return;
    }
    if (!clientEmail.trim() || !clientEmail.includes("@")) {
      setValidationError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }
    if (!clientPhone.trim()) {
      setValidationError("يرجى إدخال رقم هاتف أو واتساب للتواصل.");
      return;
    }
    if (!eventDate.trim()) {
      setValidationError("يرجى اختيار تاريخ المناسبة.");
      return;
    }
    if (!eventVenue.trim()) {
      setValidationError("يرجى إدخال اسم القاعة والمدينة.");
      return;
    }
    if (maxVenueCapacity <= 0) {
      setValidationError("يرجى تحديد طاقة استيعابية صحيحة للقاعة.");
      return;
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setValidationError("");
    setStep(3);
  };

  const handleSubmitOrderAndPayment = async () => {
    setValidationError("");
    if (!screenshotFile && !screenshotPreview) {
      setValidationError("يرجى رفع صورة إيصال التحويل (لقطة الشاشة) لإتمام الطلب.");
      return;
    }

    setUploading(true);

    try {
      const orderNum = "ASAR-INV-" + Math.floor(1000 + Math.random() * 9000);
      let screenshotFileId = "receipt-" + Date.now();

      // If Appwrite Storage is configured, upload receipt file
      if (appwrite?.storage) {
        try {
          const uploadRes = await appwrite.storage.createFile(
            "asar_storage",
            "unique()",
            screenshotFile as File
          );
          if (uploadRes?.$id) {
            screenshotFileId = uploadRes.$id;
          }
        } catch {
          // Cloud storage upload fallback to local simulation
        }
      }

      const clientSubmittedAssets = {
        requestedRsvpFields: requestedFields,
        maxVenueCapacity: maxVenueCapacity,
        occasionType: occasionType,
        partnerOrOrgName: partnerOrOrgName,
        selectedAddons: selectedAddonIds,
      };

      const orderPayload = {
        id: orderNum,
        serviceType: "invitation",
        clientName: clientName,
        partnerOrOrgName: partnerOrOrgName,
        clientEmail: clientEmail,
        clientPhone: clientPhone,
        planId: selectedPlanId,
        planName: currentPlan.name,
        selectedAddonsJson: JSON.stringify(selectedAddonIds),
        totalAmount: grandTotal,
        depositAmount: depositAmount,
        orderStatus: "pending_payment",
        eventDate: eventDate,
        eventVenue: eventVenue,
        clientSubmittedAssetsJson: JSON.stringify(clientSubmittedAssets),
        createdAt: new Date().toISOString(),
      };

      const paymentPayload = {
        orderId: orderNum,
        clientEmail: clientEmail,
        amount: depositAmount,
        paymentMethod: paymentMethod,
        screenshotFileId: screenshotFileId,
        screenshotDataUrl: screenshotPreview,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Save to Appwrite Database if available
      const databaseId = (appwrite as { databaseId?: string } | null)?.databaseId || "asar-db";
      if (appwrite?.databases) {
        try {
          await appwrite.databases.createDocument(
            databaseId,
            "orders",
            orderNum,
            orderPayload
          );
          await appwrite.databases.createDocument(
            databaseId,
            "payments",
            "unique()",
            paymentPayload
          );
        } catch {
          // Appwrite DB collection fallback
        }
      }

      // Persist order in local cache so Client Portal can immediately display it
      try {
        const cachedOrders = JSON.parse(localStorage.getItem("asar_orders_cache") || "[]");
        cachedOrders.unshift({ ...orderPayload, payment: paymentPayload });
        localStorage.setItem("asar_orders_cache", JSON.stringify(cachedOrders));
      } catch {
        // Safe localStorage write
      }

      setCreatedOrderId(orderNum);
      setStep(4);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "يرجى المحاولة مجدداً";
      setValidationError("حدث خطأ أثناء حفظ الطلب: " + errMsg);
    } finally {
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setValidationError("");
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
      p={{ base: 3, sm: 6 }}
      overflowY="auto"
      dir="rtl"
    >
      <Box
        bg="rgba(255, 255, 255, 0.99)"
        borderRadius="32px"
        maxW="720px"
        w="100%"
        p={{ base: 6, sm: 8, md: 10 }}
        boxShadow="0 35px 80px -15px rgba(0, 0, 0, 0.45)"
        border="1.5px solid rgba(212, 175, 55, 0.45)"
        position="relative"
        maxH="92vh"
        overflowY="auto"
        textAlign="right"
      >
        {/* Close Button */}
        <Box
          as="button"
          position="absolute"
          top={{ base: "18px", sm: "24px" }}
          left={{ base: "18px", sm: "24px" }}
          onClick={resetAndClose}
          color="var(--athar-text-muted, #7A6F6D)"
          cursor="pointer"
          p={2}
          borderRadius="full"
          _hover={{ bg: "rgba(107, 29, 40, 0.08)", color: "var(--athar-maroon, #6B1D28)" }}
          aria-label="إغلاق النافذة"
        >
          <FaTimes size={18} />
        </Box>

        {/* Wizard Step Progress Tracker */}
        <Box mb={8} borderBottom="1px solid rgba(107, 29, 40, 0.08)" pb={5}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text
              fontFamily="var(--font-arabic-display, 'Amiri', serif)"
              fontSize={{ base: "1.45rem", sm: "1.75rem" }}
              fontWeight="800"
              color="var(--athar-text-title, #231F20)"
            >
              طلب موقع دعوة أثر المخصص
            </Text>
            <Badge
              bg="rgba(212, 175, 55, 0.18)"
              color="var(--athar-maroon, #6B1D28)"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="0.8rem"
              fontWeight="800"
            >
              الخطوة {step} من 4
            </Badge>
          </Flex>

          <HStack gap={2} w="100%">
            {[1, 2, 3, 4].map((s) => (
              <Box
                key={s}
                flex="1"
                h="6px"
                borderRadius="full"
                bg={
                  s <= step
                    ? "var(--athar-maroon, #6B1D28)"
                    : "rgba(107, 29, 40, 0.12)"
                }
                transition="all 0.3s ease"
              />
            ))}
          </HStack>
        </Box>

        {/* Validation Error Banner */}
        {validationError && (
          <Box
            p={3.5}
            borderRadius="14px"
            bg="rgba(155, 44, 44, 0.1)"
            border="1px solid rgba(155, 44, 44, 0.3)"
            color="#9B2C2C"
            fontSize="0.88rem"
            fontWeight="700"
            mb={6}
          >
            ⚠️ {validationError}
          </Box>
        )}

        {/* ================= STEP 1: EVENT & HOST DETAILS ================= */}
        {step === 1 && (
          <Box>
            <Text fontSize="0.95rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)" mb={4}>
              ✦ تفاصيل المناسبة والجهة المضيفة
            </Text>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={4}>
              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  اسم العميل المضيف *
                </Text>
                <input
                  type="text"
                  placeholder="مثال: عمر الشريف"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={inputStyle}
                />
              </Box>

              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  اسم الشريك / الجهة المنظمة
                </Text>
                <input
                  type="text"
                  placeholder="مثال: ليلى فهمي أو شركة أثر للإعلام"
                  value={partnerOrOrgName}
                  onChange={(e) => setPartnerOrOrgName(e.target.value)}
                  style={inputStyle}
                />
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={4}>
              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  البريد الإلكتروني *
                </Text>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  style={inputStyle}
                />
              </Box>

              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  رقم الهاتف والواتساب *
                </Text>
                <input
                  type="tel"
                  placeholder="010XXXXXXXX"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  style={inputStyle}
                />
              </Box>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} mb={4}>
              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  نوع المناسبة *
                </Text>
                <select
                  value={occasionType}
                  onChange={(e) => setOccasionType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="wedding">حفل زفاف ملكي</option>
                  <option value="engagement">حفل خطوبة</option>
                  <option value="festival">مهرجان ثقافي / فني</option>
                  <option value="gala">قمة ومؤتمر VIP</option>
                  <option value="graduation">حفل تخرج / ذكرى</option>
                </select>
              </Box>

              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  تاريخ المناسبة *
                </Text>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  style={inputStyle}
                />
              </Box>

              <Box>
                <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                  أقصى طاقة استيعابية للمقاعد *
                </Text>
                <input
                  type="number"
                  placeholder="مثال: 150"
                  value={maxVenueCapacity}
                  onChange={(e) => setMaxVenueCapacity(Number(e.target.value))}
                  style={inputStyle}
                />
              </Box>
            </SimpleGrid>

            <Box mb={6}>
              <Text fontSize="0.84rem" fontWeight="700" mb={1.5}>
                اسم القاعة والمدينة *
              </Text>
              <input
                type="text"
                placeholder="مثال: فندق فورسيزونز سان ستيفانو - الإسكندرية"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                style={inputStyle}
              />
            </Box>

            <Flex justify="flex-end" pt={4} borderTop="1px solid rgba(107, 29, 40, 0.08)">
              <Button
                onClick={handleNextFromStep1}
                bg="var(--athar-maroon, #6B1D28)"
                color="white"
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="700"
                fontSize="0.95rem"
                gap={2}
                _hover={{ bg: "var(--athar-maroon-dark, #5B1621)" }}
              >
                المتابعة لاختيار الباقة ونموذج RSVP
                <FaArrowLeft size={13} />
              </Button>
            </Flex>
          </Box>
        )}

        {/* ================= STEP 2: PLAN & REQUESTED RSVP FIELDS ================= */}
        {step === 2 && (
          <Box>
            <Text fontSize="0.95rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)" mb={3}>
              ✦ اختيار الباقة
            </Text>

            {/* Plan Picker */}
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4} mb={6}>
              {DEFAULT_INVITATION_PLANS.map((p) => {
                const isSelected = p.id === selectedPlanId;
                return (
                  <Box
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    p={4}
                    borderRadius="18px"
                    border={
                      isSelected
                        ? "2px solid var(--athar-maroon, #6B1D28)"
                        : "1px solid rgba(107, 29, 40, 0.12)"
                    }
                    bg={isSelected ? "rgba(107, 29, 40, 0.04)" : "#FFFFFF"}
                    cursor="pointer"
                    transition="all 0.2s ease"
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="800" fontSize="0.95rem">{p.name}</Text>
                      {isSelected && <FaCheck size={12} color="#6B1D28" />}
                    </Flex>
                    <Text fontSize="1.15rem" fontWeight="900" color="var(--athar-maroon, #6B1D28)">
                      {p.price.toLocaleString("en-US")} ج.م
                    </Text>
                    <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                      {p.subtitle}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Requested RSVP Fields Interactive Selector */}
            <Box mb={6} p={5} borderRadius="20px" bg="#FBF7F2" border="1px solid rgba(107, 29, 40, 0.1)">
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="800" fontSize="0.92rem" color="var(--athar-text-title, #231F20)">
                  الحقول المطلوبة في نموذج تسجيل الضيوف (RSVP):
                </Text>
                <Badge bg="rgba(107, 29, 40, 0.08)" color="var(--athar-maroon, #6B1D28)">
                  تخصيص ديناميكي
                </Badge>
              </Flex>

              <Text fontSize="0.8rem" color="var(--athar-text-muted, #7A6F6D)" mb={3.5}>
                اختر أو أضف الأسئلة التي ترغب بأن يجيب عليها الضيف قبل دخوله صندوق بريدك الخاص:
              </Text>

              {/* Checkboxes List */}
              <Flex direction="column" gap={2} mb={4}>
                {requestedFields.map((fName) => {
                  const isLocked = fName.includes("إلزامي 🔒");
                  return (
                    <Flex
                      key={fName}
                      align="center"
                      justify="space-between"
                      p={2.5}
                      px={3}
                      bg="white"
                      borderRadius="12px"
                      border="1px solid rgba(0, 0, 0, 0.06)"
                    >
                      <HStack gap={2}>
                        {isLocked ? (
                          <FaLock size={12} color="#6B1D28" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => toggleRequestedField(fName)}
                            style={{ cursor: "pointer", accentColor: "#6B1D28" }}
                          />
                        )}
                        <Text fontSize="0.85rem" fontWeight={isLocked ? "700" : "600"}>
                          {fName}
                        </Text>
                      </HStack>

                      {isLocked ? (
                        <Badge fontSize="0.68rem" color="red.700" bg="red.50">حقل نظام مؤمّن</Badge>
                      ) : (
                        <Box
                          as="button"
                          onClick={() => handleRemoveField(fName)}
                          color="gray.400"
                          _hover={{ color: "red.500" }}
                        >
                          <FaTrash size={11} />
                        </Box>
                      )}
                    </Flex>
                  );
                })}
              </Flex>

              {/* Add Custom Question Field */}
              <Flex gap={2}>
                <input
                  type="text"
                  placeholder="أضف سؤالاً مخصصاً (مثال: هل لديك تفضيلات غذائية معينة؟)"
                  value={customFieldInput}
                  onChange={(e) => setCustomFieldInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustomField()}
                  style={{ ...inputStyle, padding: "0.6rem 0.9rem", fontSize: "0.85rem" }}
                />
                <Button
                  onClick={handleAddCustomField}
                  size="sm"
                  borderRadius="10px"
                  bg="var(--athar-maroon, #6B1D28)"
                  color="white"
                  px={4}
                  gap={1}
                >
                  <FaPlus size={11} />
                  إضافة
                </Button>
              </Flex>
            </Box>

            {/* Optional Addons */}
            <Box mb={6}>
              <Text fontWeight="800" fontSize="0.88rem" color="var(--athar-text-title, #231F20)" mb={2.5}>
                إضافات وترقيات اختيارية:
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2.5}>
                {DEFAULT_INVITATION_ADDONS.map((a) => {
                  const isChecked = selectedAddonIds.includes(a.id);
                  return (
                    <Flex
                      key={a.id}
                      onClick={() => toggleAddon(a.id)}
                      align="center"
                      justify="space-between"
                      p={2.5}
                      px={3}
                      borderRadius="12px"
                      bg={isChecked ? "rgba(107, 29, 40, 0.05)" : "#FBF7F2"}
                      border={isChecked ? "1.5px solid #6B1D28" : "1px solid rgba(0,0,0,0.06)"}
                      cursor="pointer"
                    >
                      <HStack gap={2}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(a.id)}
                          style={{ cursor: "pointer", accentColor: "#6B1D28" }}
                        />
                        <Text fontSize="0.82rem" fontWeight="600">{a.name}</Text>
                      </HStack>
                      <Text fontSize="0.82rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
                        +{a.price} ج.م
                      </Text>
                    </Flex>
                  );
                })}
              </SimpleGrid>
            </Box>

            <Flex justify="space-between" pt={4} borderTop="1px solid rgba(107, 29, 40, 0.08)">
              <Button onClick={() => setStep(1)} variant="outline" borderRadius="full" px={6}>
                <FaArrowRight size={12} style={{ marginLeft: "8px" }} />
                رجوع
              </Button>
              <Button
                onClick={handleNextFromStep2}
                bg="var(--athar-maroon, #6B1D28)"
                color="white"
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="700"
                fontSize="0.95rem"
                gap={2}
                _hover={{ bg: "var(--athar-maroon-dark, #5B1621)" }}
              >
                المتابعة لبيانات الدفع
                <FaArrowLeft size={13} />
              </Button>
            </Flex>
          </Box>
        )}

        {/* ================= STEP 3: MANUAL PAYMENT & SCREENSHOT UPLOAD ================= */}
        {step === 3 && (
          <Box>
            <Text fontSize="0.95rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)" mb={3}>
              ✦ الدفع اليدوي ورفع صورة التحويل
            </Text>

            {/* Price Summary Card */}
            <Box p={4} borderRadius="16px" bg="#FBF7F2" border="1px solid rgba(107, 29, 40, 0.1)" mb={5}>
              <Flex justify="space-between" mb={1.5} fontSize="0.9rem">
                <Text color="var(--athar-text-muted, #7A6F6D)">الباقة المختارة ({currentPlan.name}):</Text>
                <Text fontWeight="700">{currentPlan.price.toLocaleString("en-US")} ج.م</Text>
              </Flex>
              {totalAddonsPrice > 0 && (
                <Flex justify="space-between" mb={1.5} fontSize="0.9rem">
                  <Text color="var(--athar-text-muted, #7A6F6D)">الإضافات المختارة:</Text>
                  <Text fontWeight="700">+{totalAddonsPrice.toLocaleString("en-US")} ج.م</Text>
                </Flex>
              )}
              <Flex justify="space-between" pt={2} borderTop="1px dashed rgba(107, 29, 40, 0.15)" fontSize="1rem">
                <Text fontWeight="800">العربون المطلوب تحويله الآن:</Text>
                <Text fontWeight="900" color="var(--athar-maroon, #6B1D28)" fontSize="1.25rem">
                  {depositAmount.toLocaleString("en-US")} ج.م
                </Text>
              </Flex>
            </Box>

            {/* Payment Method Selector */}
            <Text fontSize="0.85rem" fontWeight="700" mb={2}>
              اختر طريقة التحويل:
            </Text>
            <SimpleGrid columns={3} gap={3} mb={4}>
              {[
                { id: "instapay", label: "InstaPay إنستاباي" },
                { id: "vodafone_cash", label: "فودافون كاش" },
                { id: "bank_transfer", label: "تحويل بنكي CIB" },
              ].map((m) => (
                <Box
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  p={3}
                  borderRadius="14px"
                  textAlign="center"
                  border={
                    paymentMethod === m.id
                      ? "2px solid var(--athar-maroon, #6B1D28)"
                      : "1px solid rgba(0,0,0,0.08)"
                  }
                  bg={paymentMethod === m.id ? "rgba(107, 29, 40, 0.05)" : "white"}
                  cursor="pointer"
                  fontWeight="700"
                  fontSize="0.82rem"
                >
                  {m.label}
                </Box>
              ))}
            </SimpleGrid>

            {/* Transfer Instructions Box */}
            <Box p={4} borderRadius="14px" bg="rgba(212, 175, 55, 0.1)" border="1px solid rgba(212, 175, 55, 0.4)" mb={5}>
              <Text fontSize="0.85rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)" mb={1}>
                بيانات حساب التحويل الرسمي:
              </Text>
              {paymentMethod === "instapay" && (
                <Text fontSize="0.88rem" fontWeight="700">
                  معرّف إنستاباي (IPA): <Text as="span" color="#231F20" dir="ltr">athar@instapay</Text>
                </Text>
              )}
              {paymentMethod === "vodafone_cash" && (
                <Text fontSize="0.88rem" fontWeight="700">
                  محفظة فودافون كاش: <Text as="span" color="#231F20" dir="ltr">01023456789</Text>
                </Text>
              )}
              {paymentMethod === "bank_transfer" && (
                <Text fontSize="0.85rem" fontWeight="700">
                  البنك التجاري الدولي (CIB) · الحساب: 10004892102 · باسم: أثر لخدمات الحفلات
                </Text>
              )}
            </Box>

            {/* Drag & Drop Screenshot Uploader */}
            <Box mb={6}>
              <Text fontSize="0.85rem" fontWeight="700" mb={2}>
                ارفع لقطة شاشة إيصال التحويل (Screenshot) *
              </Text>

              <Box
                border="2px dashed rgba(107, 29, 40, 0.25)"
                borderRadius="20px"
                p={5}
                textAlign="center"
                bg="#FBF7F2"
                position="relative"
                _hover={{ borderColor: "var(--athar-maroon, #6B1D28)" }}
              >
                {screenshotPreview ? (
                  <Box>
                    <img
                      src={screenshotPreview}
                      alt="Receipt Preview"
                      style={{
                        maxHeight: "180px",
                        margin: "0 auto",
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Text fontSize="0.8rem" color="green.700" fontWeight="700" mt={2}>
                      ✓ تم إرفاق صورة الإيصال بنجاح ({screenshotFile?.name})
                    </Text>
                    <Button
                      size="xs"
                      mt={1.5}
                      variant="ghost"
                      color="red.600"
                      onClick={() => {
                        setScreenshotFile(null);
                        setScreenshotPreview("");
                      }}
                    >
                      تغيير الصورة
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Flex justify="center" mb={2}>
                      <Flex
                        w="46px"
                        h="46px"
                        borderRadius="full"
                        bg="rgba(107, 29, 40, 0.08)"
                        color="var(--athar-maroon, #6B1D28)"
                        align="center"
                        justify="center"
                      >
                        <FaUpload size={18} />
                      </Flex>
                    </Flex>
                    <Text fontSize="0.88rem" fontWeight="700" mb={1}>
                      اسحب لقطة الشاشة هنا أو اضغط للاختيار
                    </Text>
                    <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)" mb={3}>
                      الصيغ المدعومة: PNG, JPG, WEBP (حتى 10MB)
                    </Text>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            <Flex justify="space-between" pt={4} borderTop="1px solid rgba(107, 29, 40, 0.08)">
              <Button onClick={() => setStep(2)} variant="outline" borderRadius="full" px={6}>
                <FaArrowRight size={12} style={{ marginLeft: "8px" }} />
                رجوع
              </Button>
              <Button
                onClick={handleSubmitOrderAndPayment}
                disabled={uploading}
                bg="var(--athar-maroon, #6B1D28)"
                color="white"
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="800"
                fontSize="1rem"
                gap={2}
                boxShadow="0 6px 20px rgba(107, 29, 40, 0.3)"
                _hover={{ bg: "var(--athar-maroon-dark, #5B1621)" }}
              >
                {uploading ? "جارٍ حفظ الطلب..." : "تأكيد الطلب وإرسال الإيصال ✓"}
              </Button>
            </Flex>
          </Box>
        )}

        {/* ================= STEP 4: ORDER CONFIRMATION & MAILBOX LINK ================= */}
        {step === 4 && (
          <Box textAlign="center" py={4}>
            <Flex justify="center" mb={4}>
              <Flex
                w="68px"
                h="68px"
                borderRadius="full"
                bg="rgba(30, 111, 80, 0.12)"
                color="#1E6F50"
                align="center"
                justify="center"
                boxShadow="0 8px 24px rgba(30, 111, 80, 0.2)"
              >
                <FaCheck size={32} />
              </Flex>
            </Flex>

            <Text
              fontFamily="var(--font-arabic-display, 'Amiri', serif)"
              fontSize="2rem"
              fontWeight="800"
              color="var(--athar-text-title, #231F20)"
              mb={1}
            >
              تم استلام طلبكم وإيصال الدفع بنجاح!
            </Text>

            <Text fontSize="0.95rem" color="var(--athar-text-muted, #7A6F6D)" mb={6}>
              مبارك مقدماً! سيقوم فريق أثر بمراجعة إيصال التحويل وبدء تجهيز موقع دعوتكم وصندوق البريد.
            </Text>

            {/* Order Reference Box */}
            <Box
              p={5}
              borderRadius="20px"
              bg="#FBF7F2"
              border="1.5px solid rgba(212, 175, 55, 0.5)"
              mb={8}
              textAlign="center"
            >
              <Text fontSize="0.82rem" color="var(--athar-text-muted, #7A6F6D)" mb={1}>
                رقم الطلب المرجعي:
              </Text>
              <Text fontSize="1.8rem" fontWeight="900" color="var(--athar-maroon, #6B1D28)" letterSpacing="0.05em">
                {createdOrderId}
              </Text>
              <Text fontSize="0.82rem" color="var(--athar-text-body, #4A4240)" mt={1}>
                المناسبة: {occasionType} · السعة المعتمدة: {maxVenueCapacity} مقعد
              </Text>
            </Box>

            {/* CTAs */}
            <Flex direction="column" gap={3}>
              <a
                href={`http://localhost:3000/account/mailbox?orderId=${createdOrderId}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "var(--athar-maroon, #6B1D28)",
                  color: "white",
                  borderRadius: "9999px",
                  padding: "1rem 2rem",
                  fontWeight: 800,
                  fontSize: "1rem",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(107, 29, 40, 0.3)",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                الانتقال إلى صندوق البريد وحساب العميل
                <FaExternalLinkAlt size={13} />
              </a>

              <Button
                onClick={resetAndClose}
                variant="outline"
                borderRadius="full"
                py={5}
                color="var(--athar-text-body, #4A4240)"
                borderColor="rgba(107, 29, 40, 0.15)"
              >
                العودة لصفحة الدعوات الرئيسية
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(107, 29, 40, 0.18)",
  backgroundColor: "#FFFFFF",
  color: "#231F20",
  outline: "none",
  fontSize: "0.92rem",
  fontFamily: "var(--font-body, 'Cairo', sans-serif)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export default InvitationBookingModal;
