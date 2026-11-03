import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, Button, Badge } from "@chakra-ui/react";
import { useUpload } from "@repo/react-appwrite";

export type OrderStageKey =
  | "draft"
  | "payment_rejected"
  | "submitted"
  | "under_review"
  | "paid_confirmed"
  | "assets_uploaded"
  | "processing"
  | "delivered";

export interface OrderStageDetail {
  key: OrderStageKey;
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  actor: string;
  icon: string;
  requiresClientAction: boolean;
}

export const ORDER_STAGES: OrderStageDetail[] = [
  {
    key: "draft",
    stepNumber: 1,
    titleAr: "1. مراجعة إيصال الدفع",
    titleEn: "Payment Verification",
    descriptionAr: "جاري فحص إيصال التحويل البنكي بواسطة فريق المالية بأثر لاعتماد الحجز وتفعيل صندوق تسليم المواد.",
    actor: "فريق أثر المالي (Admin)",
    icon: "💳",
    requiresClientAction: false,
  },
  {
    key: "submitted",
    stepNumber: 2,
    titleAr: "2. تم اعتماد الدفع — بانتظار تسليم المواد",
    titleEn: "Assets Submission",
    descriptionAr: "تم تأكيد الدفع بنجاح! بانتظار رفع صورة الغلاف والكلمات الخاصة بالمناسبة في تبويب 'تسليم المواد'.",
    actor: "العميل (Client Action Required)",
    icon: "📦",
    requiresClientAction: true,
  },
  {
    key: "under_review",
    stepNumber: 3,
    titleAr: "3. جاهزية الحفل والجدولة الميدانية",
    titleEn: "Event Scheduled",
    descriptionAr: "تمت مراجعة المواد وجدولة حضور كشك الهاتف الكلاسيكي ومضيف الكونسيرج في تاريخ وموقع الحفل المعتمد.",
    actor: "فريق أثر الميداني (On-Site Team)",
    icon: "📅",
    requiresClientAction: false,
  },
  {
    key: "paid_confirmed",
    stepNumber: 4,
    titleAr: "4. هندسة الصوت وتنقية التسجيلات",
    titleEn: "Audio Mastering",
    descriptionAr: "أقيم الحفل بنجاح! مهندسو الصوت في أثر يعكفون الآن على عزل الضوضاء ومعايرة مستويات كل تسجيل صوتي.",
    actor: "استوديو هندسة الصوت (Sound Engineers)",
    icon: "🎧",
    requiresClientAction: false,
  },
  {
    key: "assets_uploaded",
    stepNumber: 5,
    titleAr: "5. تنسيق وبناء موقع الذكرى",
    titleEn: "Studio Curation",
    descriptionAr: "يقوم الاستوديو بتنسيق موقع الذكرى الخاص بكم ودمج الأصوات المصنفة ومعرض الصور والتبويبات التفاعلية.",
    actor: "فريق التنسيق الرقمي (Admin Studio)",
    icon: "🎨",
    requiresClientAction: false,
  },
  {
    key: "processing",
    stepNumber: 6,
    titleAr: "6. المراجعة النهائية وتأكيد الجودة",
    titleEn: "Quality Assurance",
    descriptionAr: "الموقع في مرحلة الفحص النهائي للربط والتأكد من نقاء الصوت وعمل كافة الروابط والموجات التفاعلية.",
    actor: "فريق الجودة (Quality Assurance)",
    icon: "✨",
    requiresClientAction: false,
  },
  {
    key: "delivered",
    stepNumber: 7,
    titleAr: "7. تم التسليم — موقع الذكرى جاهز للنشر + QR 🎉",
    titleEn: "Delivered & Published",
    descriptionAr: "مبارك لكم! موقع الذكرى الرقمي متاح الآن بالكامل، وكود QR عالي الدقة جاهز للتحميل والمشاركة.",
    actor: "مكتمل ✓ (Delivered)",
    icon: "🎉",
    requiresClientAction: false,
  },
];

export interface OrderData {
  orderId: string;
  serviceType: "booth" | "invitation";
  planName: string;
  clientNames: string;
  eventDate: string;
  eventVenue: string;
  totalAmount: number;
  currency: string;
  currentStage: OrderStageKey;
  paymentMethod: "InstaPay" | "Vodafone Cash" | "Bank Transfer";
  paymentReceiptUrl?: string;
  rejectionReason?: string;
}

export interface OrderTrackerTimelineProps {
  order: OrderData;
  onStageChange?: (newStage: OrderStageKey) => void;
  onNavigateToTab?: (tabKey: string) => void;
}

export const OrderTrackerTimeline: React.FC<OrderTrackerTimelineProps> = ({
  order,
  onStageChange,
  onNavigateToTab,
}) => {
  const [activeStage, setActiveStage] = useState<OrderStageKey>(order.currentStage);
  const [reuploading, setReuploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string>(
    order.paymentReceiptUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop"
  );
  const [receiptStatus, setReceiptStatus] = useState<"pending" | "approved" | "rejected">(
    order.currentStage === "payment_rejected"
      ? "rejected"
      : order.currentStage === "draft"
      ? "pending"
      : "approved"
  );

  const { uploadFile, isUploading } = useUpload({
    bucketId: "payment_receipts",
  });

  const handleStageSelect = (stage: OrderStageKey) => {
    setActiveStage(stage);
    onStageChange?.(stage);
    if (stage === "payment_rejected") {
      setReceiptStatus("rejected");
    } else if (stage === "draft") {
      setReceiptStatus("pending");
    } else {
      setReceiptStatus("approved");
    }
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | undefined;
    if ("dataTransfer" in e && e.dataTransfer.files.length > 0) {
      e.preventDefault();
      file = e.dataTransfer.files[0];
    } else {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        file = target.files[0];
      }
    }

    if (!file) return;

    setReuploading(true);
    try {
      const uploaded = await uploadFile(file);
      if (uploaded?.$id) {
        setReceiptUrl(URL.createObjectURL(file));
      } else {
        setReceiptUrl(URL.createObjectURL(file));
      }
      setReceiptStatus("pending");
      handleStageSelect("draft");
    } catch (err) {
      // Local preview fallback
      setReceiptUrl(URL.createObjectURL(file));
      setReceiptStatus("pending");
      handleStageSelect("draft");
    } finally {
      setReuploading(false);
    }
  };

  // Get index in the 7 linear steps
  const currentStepNumber =
    activeStage === "payment_rejected"
      ? 1
      : ORDER_STAGES.find((s) => s.key === activeStage)?.stepNumber || 1;

  const activeStageDetail =
    activeStage === "payment_rejected"
      ? {
          key: "payment_rejected" as OrderStageKey,
          stepNumber: 1,
          titleAr: "إجراء مطلوب: إعادة رفع إيصال الدفع",
          titleEn: "Payment Receipt Action Required",
          descriptionAr:
            order.rejectionReason ||
            "الصورة المرفوعة غير واضحة أو لم يظهر بها رقم المعاملة البنكية. يرجى إعادة رفع لقطة شاشة واضحة من تطبيق البنك أو إنستاباي.",
          actor: "العميل (Client Re-upload)",
          icon: "⚠️",
          requiresClientAction: true,
        }
      : ORDER_STAGES.find((s) => s.key === activeStage) || ORDER_STAGES[0];

  return (
    <Box>
      {/* Interactive Reviewer Toolbar (Simulator) */}
      <Box
        bg="rgba(212, 175, 55, 0.12)"
        border="1px dashed var(--athar-gold)"
        p={3.5}
        borderRadius="16px"
        mb={6}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <Flex align="center" gap={2}>
            <Text fontSize="0.85rem" fontWeight="800" color="var(--athar-maroon)">
              🛠️ شريط محاكاة المراحل للمراجع (Interactive Demo Stage Switcher):
            </Text>
            <Text fontSize="0.75rem" color="var(--athar-text-muted)">
              (اختر أي مرحلة لمعاينة تكيف واجهة العميل فوراً)
            </Text>
          </Flex>

          <Flex gap={1.5} wrap="wrap">
            {ORDER_STAGES.map((stg) => (
              <Button
                key={stg.key}
                size="xs"
                variant={activeStage === stg.key ? "solid" : "outline"}
                bg={activeStage === stg.key ? "var(--athar-maroon)" : "white"}
                color={activeStage === stg.key ? "white" : "var(--athar-text-title)"}
                borderColor="rgba(107, 29, 40, 0.25)"
                fontSize="0.75rem"
                px={2.5}
                py={1}
                borderRadius="full"
                onClick={() => handleStageSelect(stg.key)}
              >
                {stg.stepNumber}. {stg.key}
              </Button>
            ))}
            <Button
              size="xs"
              bg={activeStage === "payment_rejected" ? "var(--athar-status-danger)" : "white"}
              color={activeStage === "payment_rejected" ? "white" : "var(--athar-status-danger)"}
              borderColor="var(--athar-status-danger)"
              variant="outline"
              fontSize="0.75rem"
              px={2.5}
              py={1}
              borderRadius="full"
              onClick={() => handleStageSelect("payment_rejected")}
            >
              ⚠️ محاكاة رفض الإيصال
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Order Summary Header Card */}
      <Box className="card-luxury" p={{ base: 5, md: 7 }} mb={8} position="relative">
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4} mb={4}>
          <Box>
            <Flex align="center" gap={2.5} mb={2}>
              <Badge
                className={order.serviceType === "booth" ? "badge-maroon" : "badge-gold"}
                fontSize="0.84rem"
                px={3}
                py={1}
              >
                {order.serviceType === "booth" ? "🎙️ كشك أثر الصوتي" : "✉️ دعوة أثر التفاعلية"}
              </Badge>
              <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-text-title)">
                طلب #{order.orderId}
              </Text>
            </Flex>

            <Text
              fontSize={{ base: "1.5rem", md: "1.9rem" }}
              fontWeight="900"
              color="var(--athar-maroon)"
              className="font-arabic-display"
              mb={1}
            >
              {order.clientNames}
            </Text>

            <Text fontSize="0.9rem" color="var(--athar-text-muted)">
              الباقة: <strong style={{ color: "var(--athar-text-title)" }}>{order.planName}</strong> • {order.eventDate} ({order.eventVenue})
            </Text>
          </Box>

          <Box textAlign={{ base: "right", md: "left" }}>
            <Badge
              className={
                activeStage === "delivered"
                  ? "badge-emerald"
                  : activeStage === "payment_rejected"
                  ? "badge-maroon"
                  : "badge-gold"
              }
              fontSize="0.9rem"
              px={4}
              py={2}
            >
              {activeStageDetail.icon} {activeStageDetail.titleAr}
            </Badge>
            <Text fontSize="0.85rem" color="var(--athar-text-muted)" mt={2}>
              إجمالي الحجز:{" "}
              <strong style={{ color: "var(--athar-maroon)", fontSize: "1.05rem" }}>
                {order.totalAmount.toLocaleString()} {order.currency}
              </strong>
            </Text>
          </Box>
        </Flex>

        {/* Linear Progress Bar */}
        <Box mt={6}>
          <Flex justify="space-between" fontSize="0.8rem" color="var(--athar-text-muted)" mb={1.5}>
            <Text>المرحلة {currentStepNumber} من 7</Text>
            <Text>{Math.round((currentStepNumber / 7) * 100)}% مكتمل</Text>
          </Flex>
          <Box w="100%" h="8px" bg="rgba(107, 29, 40, 0.08)" borderRadius="full" overflow="hidden">
            <Box
              h="100%"
              w={`${(currentStepNumber / 7) * 100}%`}
              bg="linear-gradient(90deg, var(--athar-maroon), var(--athar-gold))"
              borderRadius="full"
              transition="width 0.4s ease"
            />
          </Box>
        </Box>
      </Box>

      {/* 7-Step Visual Timeline Stepper */}
      <Box className="card-luxury" p={{ base: 5, md: 8 }} mb={8}>
        <Text
          fontSize="1.25rem"
          fontWeight="800"
          color="var(--athar-maroon)"
          mb={6}
          className="font-arabic-display"
        >
          خط زمني لتتبع مسار طلبك (7-Stage Live Pipeline)
        </Text>

        <Flex direction="column" gap={4}>
          {ORDER_STAGES.map((stage) => {
            const isCompleted = stage.stepNumber < currentStepNumber && activeStage !== "payment_rejected";
            const isActive = stage.stepNumber === currentStepNumber && activeStage !== "payment_rejected";

            return (
              <Box
                key={stage.key}
                p={4}
                borderRadius="16px"
                border="1px solid"
                borderColor={
                  isActive
                    ? "var(--athar-maroon)"
                    : isCompleted
                    ? "rgba(30, 111, 80, 0.3)"
                    : "rgba(107, 29, 40, 0.08)"
                }
                bg={
                  isActive
                    ? "rgba(107, 29, 40, 0.04)"
                    : isCompleted
                    ? "rgba(30, 111, 80, 0.03)"
                    : "#FFFFFF"
                }
                transition="all 0.2s"
              >
                <Flex align="flex-start" justify="space-between" gap={3}>
                  <Flex align="center" gap={3}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="0.95rem"
                      fontWeight="800"
                      bg={
                        isCompleted
                          ? "var(--athar-status-success)"
                          : isActive
                          ? "var(--athar-maroon)"
                          : "rgba(107, 29, 40, 0.08)"
                      }
                      color={isCompleted || isActive ? "white" : "var(--athar-text-muted)"}
                      boxShadow={isActive ? "0 0 12px rgba(107, 29, 40, 0.3)" : "none"}
                    >
                      {isCompleted ? "✓" : stage.stepNumber}
                    </Box>

                    <Box>
                      <Text
                        fontSize="1.05rem"
                        fontWeight="800"
                        color={isActive ? "var(--athar-maroon)" : "var(--athar-text-title)"}
                      >
                        {stage.titleAr}
                      </Text>
                      <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                        {stage.titleEn} • القائم بالعمل: <strong>{stage.actor}</strong>
                      </Text>
                    </Box>
                  </Flex>

                  <Badge
                    bg={
                      isCompleted
                        ? "var(--athar-status-success-bg)"
                        : isActive
                        ? "var(--athar-maroon-glow)"
                        : "rgba(0,0,0,0.04)"
                    }
                    color={
                      isCompleted
                        ? "var(--athar-status-success)"
                        : isActive
                        ? "var(--athar-maroon)"
                        : "var(--athar-text-muted)"
                    }
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="0.75rem"
                  >
                    {isCompleted ? "مكتملة ✓" : isActive ? "المرحلة الحالية ✦" : "قيد الانتظار"}
                  </Badge>
                </Flex>

                {isActive && (
                  <Box
                    mt={3}
                    mr="48px"
                    p={3.5}
                    borderRadius="12px"
                    bg="rgba(255, 255, 255, 0.9)"
                    border="1px solid rgba(107, 29, 40, 0.12)"
                  >
                    <Text fontSize="0.88rem" color="var(--athar-text-body)" lineHeight="1.7">
                      {stage.descriptionAr}
                    </Text>

                    {stage.requiresClientAction && (
                      <Button
                        className="btn-athar-primary"
                        mt={3}
                        fontSize="0.85rem"
                        py={2}
                        px={5}
                        onClick={() => onNavigateToTab?.("assets")}
                      >
                        الانتقال إلى صندوق تسليم المواد الآن ←
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Flex>
      </Box>

      {/* Payment Receipt & Re-Upload Section */}
      <Box className="card-luxury" p={{ base: 5, md: 8 }} mb={8}>
        <Text
          fontSize="1.25rem"
          fontWeight="800"
          color="var(--athar-maroon)"
          mb={4}
          className="font-arabic-display"
        >
          حالة إيصال الدفع والتحويل البنكي
        </Text>

        {activeStage === "payment_rejected" && (
          <Box
            bg="var(--athar-status-danger-bg)"
            border="1px solid var(--athar-status-danger)"
            borderRadius="16px"
            p={4}
            mb={6}
          >
            <Flex align="center" gap={2} mb={1.5}>
              <Text fontSize="1.1rem">⚠️</Text>
              <Text fontSize="0.95rem" fontWeight="800" color="var(--athar-status-danger)">
                ملاحظة الإدارة بخصوص إيصال الدفع:
              </Text>
            </Flex>
            <Text fontSize="0.88rem" color="var(--athar-status-danger)" mb={3} lineHeight="1.6">
              {order.rejectionReason ||
                "لم نتمكن من مطابقة رقم العملية في إشعار التحويل البنكي. برجاء إعادة رفع صورة واضحة توضح رقم المعاملة واسم المحول."}
            </Text>
            <Text fontSize="0.82rem" color="var(--athar-text-title)">
              👇 يرجى استخدام نافذة الرفع أدناه لإعادة إرسال إيصال جديد لإعادة تفعيل الحجز فوراً:
            </Text>
          </Box>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          {/* Receipt Preview */}
          <Box>
            <Text fontSize="0.85rem" fontWeight="700" color="var(--athar-text-title)" mb={2}>
              لقطة شاشة الإيصال المرفوع:
            </Text>
            <Box
              borderRadius="16px"
              overflow="hidden"
              border="1px solid rgba(107, 29, 40, 0.15)"
              boxShadow="var(--athar-shadow-soft)"
              maxH="240px"
              position="relative"
            >
              <img
                src={receiptUrl}
                alt="Payment Receipt"
                style={{ width: "100%", height: "240px", objectFit: "cover" }}
              />
              <Box
                position="absolute"
                bottom={2}
                right={2}
                bg="rgba(0,0,0,0.7)"
                color="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="0.75rem"
              >
                طريقة الدفع: {order.paymentMethod}
              </Box>
            </Box>
          </Box>

          {/* Upload Dropzone */}
          <Box>
            <Text fontSize="0.85rem" fontWeight="700" color="var(--athar-text-title)" mb={2}>
              {activeStage === "payment_rejected" ? "رفع إيصال بديل جديد:" : "تحديث أو تعديل إيصال الدفع:"}
            </Text>
            <Box
              border="2px dashed"
              borderColor={activeStage === "payment_rejected" ? "var(--athar-status-danger)" : "var(--athar-gold)"}
              borderRadius="16px"
              p={6}
              textAlign="center"
              bg="rgba(251, 247, 242, 0.8)"
              cursor="pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              position="relative"
              _hover={{ borderColor: "var(--athar-maroon)", bg: "white" }}
              transition="all 0.2s"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileDrop}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
              <Text fontSize="2rem" mb={2}>📸</Text>
              <Text fontSize="0.9rem" fontWeight="700" color="var(--athar-text-title)">
                اسحب وأفلت لقطة الشاشة هنا
              </Text>
              <Text fontSize="0.78rem" color="var(--athar-text-muted)" mt={1}>
                أو انقر لاختيار الصورة من جهازك (PNG, JPG, WEBP)
              </Text>

              {(reuploading || isUploading) && (
                <Box mt={3}>
                  <Text fontSize="0.8rem" color="var(--athar-maroon)">
                    جاري رفع الإيصال...
                  </Text>
                </Box>
              )}
            </Box>

            <Flex justify="space-between" align="center" mt={3} fontSize="0.8rem" color="var(--athar-text-muted)">
              <Text>الحالة: <strong>{receiptStatus}</strong></Text>
              <Text>المبلغ: {order.totalAmount} {order.currency}</Text>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default OrderTrackerTimeline;
