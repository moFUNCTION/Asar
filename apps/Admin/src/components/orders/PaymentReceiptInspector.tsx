import React, { useState } from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import type { AsarOrder } from "../dashboard/AdminOverview";

export interface AsarPayment {
  $id: string;
  orderId: string;
  clientId: string;
  amount: number;
  paymentMethod: "instapay" | "vodafone_cash" | "bank_transfer";
  screenshotFileId?: string;
  screenshotUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  submittedAt?: string;
}

export interface PaymentReceiptInspectorProps {
  isOpen: boolean;
  order: AsarOrder | null;
  payment: AsarPayment | null;
  onClose: () => void;
  onApprove: (orderId: string, paymentId: string) => Promise<void> | void;
  onReject: (orderId: string, paymentId: string, reason: string) => Promise<void> | void;
}

const COMMON_REJECTION_REASONS = [
  "صورة الإيصال غير واضحة / البيانات مطموسة",
  "المبلغ المحول غير مكتمل أو غير مطابق للعربون المطلوب",
  "رقم الحساب أو المحفظة المحول منها لا يتطابق مع بيانات الحاجز",
  "تاريخ التحويل قديم أو المعاملة ملغاة من جهة البنك",
];

export const PaymentReceiptInspector: React.FC<PaymentReceiptInspectorProps> = ({
  isOpen,
  order,
  payment,
  onClose,
  onApprove,
  onReject,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showRejectBox, setShowRejectBox] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const paymentMethodLabels: Record<string, { label: string; icon: string }> = {
    instapay: { label: "InstaPay (إنستاباي)", icon: "⚡" },
    vodafone_cash: { label: "Vodafone Cash (فودافون كاش)", icon: "📱" },
    bank_transfer: { label: "تحويل بنكي مباشر (CIB / NBE)", icon: "🏦" },
  };

  const methodInfo = payment
    ? paymentMethodLabels[payment.paymentMethod] || { label: payment.paymentMethod, icon: "💳" }
    : { label: "InstaPay (إنستاباي)", icon: "⚡" };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.35, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.35, 0.7));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleApproveClick = async () => {
    if (!payment) return;
    setIsSubmitting(true);
    try {
      await onApprove(order.$id, payment.$id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectClick = async () => {
    if (!payment) return;
    if (!rejectionReason.trim()) {
      alert("يرجى كتابة أو اختيار سبب الرفض لتوجيه العميل لإعادة الرفع بشكل صحيح.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject(order.$id, payment.$id, rejectionReason.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Realistic mock receipt URL fallback if no image provided
  const receiptSrc =
    payment?.screenshotUrl ||
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80";

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={2000}
      bg="rgba(24, 20, 22, 0.78)"
      backdropFilter="blur(10px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: 3, md: 6 }}
    >
      <Box
        bg="#ffffff"
        w="100%"
        maxW="1100px"
        maxH="92vh"
        borderRadius="24px"
        boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.4)"
        border="1px solid var(--athar-gold)"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        className="animate-fade-in"
      >
        {/* Modal Top Bar */}
        <Box
          p={5}
          borderBottom="1px solid rgba(107, 29, 40, 0.1)"
          bg="var(--athar-bg-secondary)"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack gap={3}>
              <Box
                w="42px"
                h="42px"
                borderRadius="12px"
                bg="var(--athar-maroon)"
                color="#ffffff"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="1.2rem"
              >
                🔍
              </Box>
              <Box>
                <HStack gap={2}>
                  <Text
                    fontSize="1.25rem"
                    fontWeight="800"
                    color="var(--athar-maroon)"
                    fontFamily="var(--font-arabic-display)"
                  >
                    فحص ومطابقة إيصال الدفع اليدوي
                  </Text>
                  <Badge className="athar-badge-warning" fontSize="0.75rem">
                    طلب رقم: {order.$id}
                  </Badge>
                </HStack>
                <Text fontSize="0.8rem" color="var(--athar-text-muted)">
                  العميل: <strong>{order.clientName}</strong> ({order.partnerOrOrgName}) &bull; {order.clientPhone}
                </Text>
              </Box>
            </HStack>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "1.6rem",
                cursor: "pointer",
                color: "var(--athar-text-muted)",
                padding: "0.2rem 0.6rem",
              }}
            >
              ✕
            </button>
          </Flex>
        </Box>

        {/* Main Content Area (Split Screen: Details Left/Top, Lightbox Image Right) */}
        <Box
          flex={1}
          overflowY="auto"
          p={{ base: 4, md: 6 }}
          display="grid"
          gridTemplateColumns={{ base: "1fr", lg: "420px 1fr" }}
          gap={6}
        >
          {/* Left Column: Transaction Metadata & Decision Controls */}
          <VStack align="stretch" gap={5}>
            {/* Payment Details Card */}
            <Box
              p={4}
              borderRadius="16px"
              bg="rgba(251, 247, 242, 0.9)"
              border="1px solid rgba(107, 29, 40, 0.08)"
            >
              <Text fontSize="0.8rem" fontWeight="800" color="var(--athar-maroon)" textTransform="uppercase" mb={3}>
                بيانات المعاملة المالية:
              </Text>

              <VStack align="stretch" gap={2.5} fontSize="0.88rem">
                <Flex justify="space-between" pb={2} borderBottom="1px dashed rgba(107, 29, 40, 0.1)">
                  <Text color="var(--athar-text-muted)">طريقة التحويل:</Text>
                  <Text fontWeight="800" color="var(--athar-text-title)">
                    {methodInfo.icon} {methodInfo.label}
                  </Text>
                </Flex>

                <Flex justify="space-between" pb={2} borderBottom="1px dashed rgba(107, 29, 40, 0.1)">
                  <Text color="var(--athar-text-muted)">المبلغ المسدد بالإيصال:</Text>
                  <Text fontWeight="800" fontSize="1.1rem" color="var(--athar-maroon)">
                    {(payment?.amount || order.totalAmount * 0.3).toLocaleString()} EGP
                  </Text>
                </Flex>

                <Flex justify="space-between" pb={2} borderBottom="1px dashed rgba(107, 29, 40, 0.1)">
                  <Text color="var(--athar-text-muted)">إجمالي قيمة الطلب:</Text>
                  <Text fontWeight="700">{order.totalAmount.toLocaleString()} EGP</Text>
                </Flex>

                <Flex justify="space-between" pb={2} borderBottom="1px dashed rgba(107, 29, 40, 0.1)">
                  <Text color="var(--athar-text-muted)">وقت رفع الإيصال:</Text>
                  <Text fontWeight="600">
                    {payment?.submittedAt || "اليوم، منذ قليل"}
                  </Text>
                </Flex>

                <Flex justify="space-between">
                  <Text color="var(--athar-text-muted)">الباقة المختارة:</Text>
                  <Badge className="athar-badge-gold">{order.planName}</Badge>
                </Flex>
              </VStack>
            </Box>

            {/* Event Context Card */}
            <Box
              p={4}
              borderRadius="16px"
              bg="#ffffff"
              border="1px solid rgba(107, 29, 40, 0.08)"
            >
              <Text fontSize="0.8rem" fontWeight="800" color="var(--athar-maroon)" textTransform="uppercase" mb={2}>
                تفاصيل المناسبة:
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-body)">
                📅 تاريخ المناسبة: <strong>{order.eventDate}</strong>
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-body)" mt={1}>
                📍 المكان والقاعة: <strong>{order.eventVenue}</strong>
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-body)" mt={1}>
                ✉️ بريد العميل: <strong>{order.clientEmail}</strong>
              </Text>
            </Box>

            {/* Rejection Input Box (Revealed when clicking Reject) */}
            {showRejectBox && (
              <Box
                p={4}
                borderRadius="16px"
                bg="rgba(155, 44, 44, 0.06)"
                border="1.5px solid var(--athar-status-danger)"
                className="animate-fade-in"
              >
                <Text fontSize="0.88rem" fontWeight="800" color="var(--athar-status-danger)" mb={2}>
                  حدد سبب رفض الإيصال (سيظهر للعميل في حسابه فوراً):
                </Text>

                <VStack align="stretch" gap={1.5} mb={3}>
                  {COMMON_REJECTION_REASONS.map((reason, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRejectionReason(reason)}
                      style={{
                        textAlign: "right",
                        fontSize: "0.78rem",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "8px",
                        border: rejectionReason === reason ? "1px solid var(--athar-status-danger)" : "1px solid rgba(155, 44, 44, 0.18)",
                        backgroundColor: rejectionReason === reason ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
                        color: "var(--athar-status-danger)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      &bull; {reason}
                    </button>
                  ))}
                </VStack>

                <textarea
                  className="athar-textarea"
                  placeholder="أو اكتب سبباً مخصصاً للعميل..."
                  style={{ minHeight: "70px", fontSize: "0.85rem" }}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />

                <HStack gap={2} mt={3}>
                  <Button
                    size="sm"
                    bg="var(--athar-status-danger)"
                    color="#ffffff"
                    fontWeight="800"
                    onClick={handleRejectClick}
                    loading={isSubmitting}
                    _hover={{ filter: "brightness(1.1)" }}
                  >
                    تأكيد رفض الإيصال ✕
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowRejectBox(false)}
                  >
                    إلغاء
                  </Button>
                </HStack>
              </Box>
            )}

            {/* Primary Action Buttons */}
            {!showRejectBox && (
              <VStack align="stretch" gap={2.5}>
                <button
                  className="btn-athar-primary"
                  onClick={handleApproveClick}
                  disabled={isSubmitting}
                  style={{
                    padding: "0.85rem 1.5rem",
                    fontSize: "0.95rem",
                    background: "var(--athar-status-success)",
                    boxShadow: "0 4px 14px rgba(30, 111, 80, 0.25)",
                  }}
                >
                  ✓ اعتماد الدفع وفتح إرسال الذكريات للعميل
                </button>

                <button
                  className="btn-athar-secondary"
                  onClick={() => setShowRejectBox(true)}
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.9rem",
                    color: "var(--athar-status-danger)",
                    borderColor: "rgba(155, 44, 44, 0.35)",
                  }}
                >
                  ✕ رفض الإيصال مع إرسال الملاحظات
                </button>
              </VStack>
            )}
          </VStack>

          {/* Right Column: High-Resolution Zoomable Screenshot Viewer */}
          <Box
            bg="#161214"
            borderRadius="18px"
            p={4}
            display="flex"
            flexDirection="column"
            overflow="hidden"
            border="1px solid rgba(212, 175, 55, 0.3)"
            position="relative"
            minH={{ base: "380px", lg: "520px" }}
          >
            {/* Viewer Controls Toolbar */}
            <Flex
              justify="space-between"
              align="center"
              bg="rgba(35, 31, 32, 0.85)"
              p={2.5}
              borderRadius="12px"
              mb={3}
              border="1px solid rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(6px)"
            >
              <HStack gap={2}>
                <Button size="xs" variant="outline" color="#ffffff" onClick={handleZoomIn} title="تكبير">
                  🔍+ تكبير
                </Button>
                <Button size="xs" variant="outline" color="#ffffff" onClick={handleZoomOut} title="تصغير">
                  🔍- تصغير
                </Button>
                <Button size="xs" variant="outline" color="#ffffff" onClick={handleResetZoom}>
                  إعادة ضبط
                </Button>
                <Button size="xs" variant="outline" color="#ffffff" onClick={handleRotate} title="تدوير 90 درجة">
                  ↻ تدوير
                </Button>
              </HStack>

              <HStack gap={2}>
                <Text fontSize="0.75rem" color="rgba(255, 255, 255, 0.7)">
                  التقريب: {Math.round(zoomLevel * 100)}%
                </Text>
                <a
                  href={receiptSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-athar-gold"
                  style={{
                    textDecoration: "none",
                    fontSize: "0.72rem",
                    padding: "0.25rem 0.6rem",
                  }}
                >
                  فتح بالحجم الكامل ↗
                </a>
              </HStack>
            </Flex>

            {/* Image Canvas Box */}
            <Box
              flex={1}
              overflow="auto"
              display="flex"
              alignItems="center"
              justifyContent="center"
              p={2}
              position="relative"
              cursor="grab"
            >
              <img
                src={receiptSrc}
                alt="Payment Receipt Screenshot"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  borderRadius: "10px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
                }}
              />
            </Box>

            {/* Bottom Disclaimer */}
            <Text
              fontSize="0.72rem"
              color="rgba(255, 255, 255, 0.55)"
              textAlign="center"
              mt={2}
            >
              تأكد من رقم العملية المصرفية، اسم المحول، ومطابقة المبلغ قبل الضغط على زر الاعتماد.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentReceiptInspector;
