import React, { useState } from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge, SimpleGrid } from "@chakra-ui/react";
import { useAppwrite } from "@repo/react-appwrite";
import type { AsarOrder, AsarOrderStatus } from "../dashboard/AdminOverview";
import { PaymentReceiptInspector, type AsarPayment } from "./PaymentReceiptInspector";

export interface ClientSubmittedAssets {
  heroImageUrl?: string;
  coupleTitle?: string;
  eventHeaderTag?: string;
  eventDateDisplay?: string;
  eventLocationDisplay?: string;
  coupleQuote?: string;
  categories?: string[];
  thankYouMessage?: string;
  requestedRsvpFields?: string[];
}

export interface OrdersQueueManagerProps {
  orders: AsarOrder[];
  payments: AsarPayment[];
  onOrdersUpdated: (orders: AsarOrder[]) => void;
  onPaymentsUpdated: (payments: AsarPayment[]) => void;
  onOpenStudio: (orderId: string, serviceType: "booth" | "invitation") => void;
}

const STAGE_ORDER: AsarOrderStatus[] = [
  "pending_payment",
  "payment_rejected",
  "awaiting_client_assets",
  "event_scheduled",
  "audio_mastering",
  "studio_curation",
  "published",
];

const STAGE_CONFIG: Record<
  AsarOrderStatus,
  { label: string; badgeClass: string; stepNumber: number; description: string }
> = {
  pending_payment: {
    label: "قيد فحص الإيصال",
    badgeClass: "athar-badge-warning",
    stepNumber: 1,
    description: "بانتظار مطابقة إيصال التحويل البنكي أو المحفظة الإلكترونية",
  },
  payment_rejected: {
    label: "إيصال مرفوض",
    badgeClass: "athar-badge-danger",
    stepNumber: 2,
    description: "تم إخطار العميل لإعادة رفع إيصال واضح وصحيح",
  },
  awaiting_client_assets: {
    label: "بانتظار ذكريات العميل",
    badgeClass: "athar-badge-gold",
    stepNumber: 3,
    description: "الدفع معتمد! بانتظار رفع العميل للصورة الرئيسية والعبارات والتصنيفات",
  },
  event_scheduled: {
    label: "المناسبة مجدولة",
    badgeClass: "athar-badge-maroon",
    stepNumber: 4,
    description: "فريق أثر جاهز ومجدول في موقع الحفل مع محطة الهاتف العتيق",
  },
  audio_mastering: {
    label: "معالجة وهندسة الصوت",
    badgeClass: "athar-badge-maroon",
    stepNumber: 5,
    description: "مهندسو الصوت يعالجون التسجيلات ويزيلون الضوضاء الخلفية",
  },
  studio_curation: {
    label: "بناء صفحة الذكريات",
    badgeClass: "athar-badge-gold",
    stepNumber: 6,
    description: "يتم تنسيق التسجيلات والصور في أستوديو أثر وتعيين التصنيفات",
  },
  published: {
    label: "تم النشر والتسليم 🎉",
    badgeClass: "athar-badge-success",
    stepNumber: 7,
    description: "صفحة الذكريات حية وخاصة، والعميل تسلم بطاقة رمز QR",
  },
};

export const OrdersQueueManager: React.FC<OrdersQueueManagerProps> = ({
  orders,
  payments,
  onOrdersUpdated,
  onPaymentsUpdated,
  onOpenStudio,
}) => {
  const { databases } = useAppwrite();
  const [selectedService, setSelectedService] = useState<"all" | "booth" | "invitation">("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Inspect Modal State
  const [inspectingOrder, setInspectingOrder] = useState<AsarOrder | null>(null);
  const [inspectingPayment, setInspectingPayment] = useState<AsarPayment | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  // Expanded assets view state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Notification Banner
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 3500);
  };

  // Open inspector for an order
  const handleOpenInspector = (order: AsarOrder) => {
    const payment = payments.find((p) => p.orderId === order.$id) || {
      $id: `pay-${order.$id}`,
      orderId: order.$id,
      clientId: order.clientId,
      amount: Math.round(order.totalAmount * 0.3),
      paymentMethod: "instapay" as const,
      screenshotUrl:
        order.serviceType === "booth"
          ? "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
      status: "pending" as const,
      submittedAt: "اليوم 11:42 ص",
    };

    setInspectingOrder(order);
    setInspectingPayment(payment);
    setIsInspectorOpen(true);
  };

  // Approve Payment Callback
  const handleApprovePayment = async (orderId: string, paymentId: string) => {
    // 1. Update Payment status
    const updatedPayments = payments.map((p) =>
      p.$id === paymentId || p.orderId === orderId
        ? {
            ...p,
            status: "approved" as const,
            reviewedAt: new Date().toISOString(),
          }
        : p
    );
    onPaymentsUpdated(updatedPayments);

    // 2. Advance Order status to "awaiting_client_assets"
    const updatedOrders = orders.map((o) =>
      o.$id === orderId
        ? {
            ...o,
            orderStatus: "awaiting_client_assets" as AsarOrderStatus,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    onOrdersUpdated(updatedOrders);

    // 3. Sync to Appwrite if available
    if (databases) {
      try {
        await databases.updateDocument("asar-db", "orders", orderId, {
          orderStatus: "awaiting_client_assets",
        });
      } catch (e) {
        console.warn("Appwrite order status update fallback:", e);
      }
    }

    showAlert(`✓ تم اعتماد الدفع للطلب ${orderId} وتحويل الحالة إلى "بانتظار ذكريات العميل"!`);
  };

  // Reject Payment Callback
  const handleRejectPayment = async (orderId: string, paymentId: string, reason: string) => {
    // 1. Update Payment status & reason
    const updatedPayments = payments.map((p) =>
      p.$id === paymentId || p.orderId === orderId
        ? {
            ...p,
            status: "rejected" as const,
            rejectionReason: reason,
            reviewedAt: new Date().toISOString(),
          }
        : p
    );
    onPaymentsUpdated(updatedPayments);

    // 2. Update Order status to "payment_rejected"
    const updatedOrders = orders.map((o) =>
      o.$id === orderId
        ? {
            ...o,
            orderStatus: "payment_rejected" as AsarOrderStatus,
            adminNotes: reason,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    onOrdersUpdated(updatedOrders);

    // 3. Sync to Appwrite if available
    if (databases) {
      try {
        await databases.updateDocument("asar-db", "orders", orderId, {
          orderStatus: "payment_rejected",
          adminNotes: reason,
        });
      } catch (e) {
        console.warn("Appwrite order status update fallback:", e);
      }
    }

    showAlert(`✕ تم رفض الإيصال للطلب ${orderId} وإرسال التنبيه للعميل لإعادة الرفع.`);
  };

  // Quick Advance Stage
  const handleAdvanceStage = async (orderId: string, nextStage: AsarOrderStatus) => {
    const updated = orders.map((o) =>
      o.$id === orderId ? { ...o, orderStatus: nextStage, updatedAt: new Date().toISOString() } : o
    );
    onOrdersUpdated(updated);

    if (databases) {
      try {
        await databases.updateDocument("asar-db", "orders", orderId, {
          orderStatus: nextStage,
        });
      } catch (e) {
        console.warn("Appwrite sync fallback:", e);
      }
    }

    showAlert(`✦ تم تحديث مرحلة الطلب ${orderId} إلى: ${STAGE_CONFIG[nextStage]?.label || nextStage}`);
  };

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    // Service filter
    if (selectedService !== "all" && order.serviceType !== selectedService) return false;
    // Stage filter
    if (selectedStage !== "all" && order.orderStatus !== selectedStage) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.$id.toLowerCase().includes(q);
      const matchName = order.clientName.toLowerCase().includes(q);
      const matchPartner = order.partnerOrOrgName.toLowerCase().includes(q);
      const matchEmail = order.clientEmail.toLowerCase().includes(q);
      const matchVenue = order.eventVenue.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPartner && !matchEmail && !matchVenue) return false;
    }
    return true;
  });

  return (
    <Box className="animate-fade-in">
      {/* Action Toast Alert */}
      {actionAlert && (
        <Box
          position="fixed"
          top={20}
          right={6}
          zIndex={9999}
          bg="var(--athar-maroon)"
          color="#ffffff"
          px={5}
          py={3}
          borderRadius="14px"
          boxShadow="var(--athar-shadow-elevated)"
          border="1px solid var(--athar-gold)"
          className="animate-fade-in"
        >
          <HStack gap={2}>
            <Text fontWeight="800" fontSize="0.92rem">
              {actionAlert}
            </Text>
          </HStack>
        </Box>
      )}

      {/* Header and Controls */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4} mb={6}>
        <Box>
          <HStack gap={2} mb={1}>
            <Badge className="athar-badge-gold">✦ 7-STAGE PIPELINE MANAGER</Badge>
            <Text fontSize="0.85rem" color="var(--athar-text-muted)">
              Concierge Order Queue & Payment Verification
            </Text>
          </HStack>
          <Text
            fontSize={{ base: "1.8rem", md: "2.2rem" }}
            fontWeight="700"
            fontFamily="var(--font-arabic-display)"
            color="var(--athar-maroon)"
          >
            طابور الطلبات والتحقق من المدفوعات
          </Text>
          <Text fontSize="0.9rem" color="var(--athar-text-muted)">
            متابعة مراحل التنفيذ السبعة غير المؤتمتة، مراجعة إيصالات الدفع اليدوية، وفتح الاستوديوهات المتخصصة.
          </Text>
        </Box>

        {/* Search Input */}
        <Box w={{ base: "100%", md: "340px" }}>
          <input
            type="text"
            className="athar-input"
            placeholder="🔍 بحث بالاسم، البريد، القاعة، أو رقم الطلب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
      </Flex>

      {/* Service Type Switcher Strip */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={5}>
        <HStack gap={2}>
          {[
            { id: "all", label: `كل الخدمات (${orders.length})` },
            { id: "booth", label: `🎙️ هاتف أثر (${orders.filter((o) => o.serviceType === "booth").length})` },
            {
              id: "invitation",
              label: `✉️ الدعوات الرقمية (${orders.filter((o) => o.serviceType === "invitation").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedService(tab.id as "all" | "booth" | "invitation")}
              style={{
                padding: "0.45rem 1.15rem",
                borderRadius: "9999px",
                fontSize: "0.85rem",
                fontWeight: 700,
                border: selectedService === tab.id ? "1px solid var(--athar-maroon)" : "1px solid rgba(107, 29, 40, 0.12)",
                backgroundColor: selectedService === tab.id ? "var(--athar-maroon)" : "rgba(255, 255, 255, 0.9)",
                color: selectedService === tab.id ? "#ffffff" : "var(--athar-text-title)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {tab.label}
            </button>
          ))}
        </HStack>

        <Text fontSize="0.82rem" color="var(--athar-text-muted)">
          المعروض: <strong>{filteredOrders.length}</strong> من إجمالي {orders.length} طلب
        </Text>
      </Flex>

      {/* 7-Stage Filter Pills */}
      <Box mb={6} overflowX="auto" pb={2} css={{ "&::-webkit-scrollbar": { height: "4px" } }}>
        <HStack gap={2}>
          <button
            onClick={() => setSelectedStage("all")}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: "9999px",
              fontSize: "0.8rem",
              fontWeight: 700,
              backgroundColor: selectedStage === "all" ? "var(--athar-text-title)" : "rgba(255, 255, 255, 0.8)",
              color: selectedStage === "all" ? "#ffffff" : "var(--athar-text-muted)",
              border: "1px solid rgba(107, 29, 40, 0.1)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            كل المراحل ({orders.length})
          </button>

          {STAGE_ORDER.map((stageKey) => {
            const config = STAGE_CONFIG[stageKey];
            const count = orders.filter((o) => o.orderStatus === stageKey).length;
            const isSelected = selectedStage === stageKey;
            return (
              <button
                key={stageKey}
                onClick={() => setSelectedStage(stageKey)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.35rem 0.9rem",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  backgroundColor: isSelected ? "var(--athar-maroon)" : "rgba(255, 255, 255, 0.8)",
                  color: isSelected ? "#ffffff" : "var(--athar-text-body)",
                  border: isSelected ? "1px solid var(--athar-maroon)" : "1px solid rgba(107, 29, 40, 0.1)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
              >
                <span>
                  {config.stepNumber}. {config.label}
                </span>
                <span
                  style={{
                    backgroundColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "rgba(107, 29, 40, 0.08)",
                    padding: "0.1rem 0.45rem",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </HStack>
      </Box>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <Box
          className="athar-card"
          p={12}
          textAlign="center"
          borderRadius="24px"
          border="1px dashed rgba(107, 29, 40, 0.2)"
        >
          <Text fontSize="2.5rem" mb={2}>
            📂
          </Text>
          <Text fontSize="1.2rem" fontWeight="800" color="var(--athar-maroon)">
            لا توجد طلبات مطابقة للمعايير المحددة
          </Text>
          <Text fontSize="0.85rem" color="var(--athar-text-muted)" mt={1}>
            جرب تغيير الفلتر أو مسح كلمة البحث لرؤية بقية الطلبات في المنظومة.
          </Text>
        </Box>
      ) : (
        <VStack align="stretch" gap={4}>
          {filteredOrders.map((order) => {
            const isBooth = order.serviceType === "booth";
            const stageConfig = STAGE_CONFIG[order.orderStatus] || {
              label: order.orderStatus,
              badgeClass: "athar-badge-maroon",
              stepNumber: 0,
              description: "",
            };

            const isPendingPayment = order.orderStatus === "pending_payment";
            const isRejectedPayment = order.orderStatus === "payment_rejected";

            // Parse submitted assets if any
            let assets: ClientSubmittedAssets | null = null;
            if (order.clientSubmittedAssetsJson) {
              try {
                assets = JSON.parse(order.clientSubmittedAssetsJson);
              } catch {
                assets = null;
              }
            }

            const isExpanded = expandedOrderId === order.$id;

            return (
              <Box
                key={order.$id}
                className="athar-card"
                p={{ base: 5, md: 6 }}
                borderLeft={isBooth ? "5px solid var(--athar-maroon)" : "5px solid var(--athar-gold)"}
                bg="#ffffff"
                position="relative"
              >
                {/* Order Top Bar */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
                  <HStack gap={3}>
                    <Box
                      w="42px"
                      h="42px"
                      borderRadius="12px"
                      bg={isBooth ? "var(--athar-maroon-subtle)" : "rgba(212, 175, 55, 0.15)"}
                      color={isBooth ? "var(--athar-maroon)" : "#8C6F12"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="1.2rem"
                      fontWeight="800"
                    >
                      {isBooth ? "🎙️" : "✉️"}
                    </Box>

                    <Box>
                      <HStack gap={2}>
                        <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-text-title)">
                          {order.clientName}
                        </Text>
                        <Text fontSize="0.95rem" color="var(--athar-text-muted)">
                          &bull; {order.partnerOrOrgName}
                        </Text>
                        <Badge
                          variant="subtle"
                          fontSize="0.72rem"
                          fontWeight="800"
                          bg={isBooth ? "rgba(107, 29, 40, 0.08)" : "rgba(212, 175, 55, 0.15)"}
                          color={isBooth ? "var(--athar-maroon)" : "#8C6F12"}
                          borderRadius="full"
                          px={2.5}
                        >
                          {isBooth ? "هاتف أثر" : "دعوة رقمية"}
                        </Badge>
                      </HStack>

                      <HStack gap={3} mt={0.5}>
                        <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                          رقم الطلب: <strong style={{ fontFamily: "monospace" }}>{order.$id}</strong>
                        </Text>
                        <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                          الباقة: <strong>{order.planName}</strong>
                        </Text>
                        <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                          📅 {order.eventDate} &bull; 📍 {order.eventVenue}
                        </Text>
                      </HStack>
                    </Box>
                  </HStack>

                  {/* Stage Badge & Total Amount */}
                  <Box textAlign={{ base: "left", md: "right" }}>
                    <HStack justify={{ base: "flex-start", md: "flex-end" }} gap={2} mb={1}>
                      <Badge className={stageConfig.badgeClass} fontSize="0.78rem" px={3} py={1}>
                        مرحلة {stageConfig.stepNumber}: {stageConfig.label}
                      </Badge>
                    </HStack>
                    <Text fontSize="1.25rem" fontWeight="900" color="var(--athar-maroon)">
                      {order.totalAmount.toLocaleString()} <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>EGP</span>
                    </Text>
                  </Box>
                </Flex>

                {/* Rejection Note Alert if rejected */}
                {isRejectedPayment && order.adminNotes && (
                  <Box
                    p={3.5}
                    borderRadius="12px"
                    bg="rgba(155, 44, 44, 0.08)"
                    border="1px solid rgba(155, 44, 44, 0.25)"
                    mb={4}
                  >
                    <Text fontSize="0.82rem" color="var(--athar-status-danger)" fontWeight="700">
                      ملاحظة الرفض الموجهة للعميل: <strong>{order.adminNotes}</strong>
                    </Text>
                  </Box>
                )}

                {/* 7-Stage Pipeline Stepper Bar */}
                <Box
                  p={3}
                  borderRadius="14px"
                  bg="var(--athar-bg-secondary)"
                  border="1px solid rgba(107, 29, 40, 0.06)"
                  mb={4}
                >
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                    <HStack gap={1.5} wrap="wrap">
                      {STAGE_ORDER.map((stageKey, idx) => {
                        const isCurrent = order.orderStatus === stageKey;
                        const currentIndex = STAGE_ORDER.indexOf(order.orderStatus);
                        const isPast = idx < currentIndex;
                        return (
                          <HStack key={stageKey} gap={1}>
                            <Box
                              w="22px"
                              h="22px"
                              borderRadius="full"
                              bg={
                                isCurrent
                                  ? "var(--athar-maroon)"
                                  : isPast
                                  ? "var(--athar-status-success)"
                                  : "rgba(107, 29, 40, 0.12)"
                              }
                              color="#ffffff"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="0.7rem"
                              fontWeight="800"
                            >
                              {isPast ? "✓" : idx + 1}
                            </Box>
                            <Text
                              fontSize="0.74rem"
                              fontWeight={isCurrent ? 800 : 500}
                              color={isCurrent ? "var(--athar-maroon)" : "var(--athar-text-muted)"}
                            >
                              {STAGE_CONFIG[stageKey]?.label.split(" ")[0]}
                            </Text>
                            {idx < STAGE_ORDER.length - 1 && (
                              <Text fontSize="0.7rem" color="rgba(107, 29, 40, 0.2)" mx={0.5}>
                                &gt;
                              </Text>
                            )}
                          </HStack>
                        );
                      })}
                    </HStack>

                    {/* Stage Transition Dropdown */}
                    <HStack gap={2}>
                      <Text fontSize="0.75rem" color="var(--athar-text-muted)" fontWeight="600">
                        تغيير المرحلة:
                      </Text>
                      <select
                        className="athar-select"
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem", width: "auto" }}
                        value={order.orderStatus}
                        onChange={(e) => handleAdvanceStage(order.$id, e.target.value as AsarOrderStatus)}
                      >
                        {STAGE_ORDER.map((st) => (
                          <option key={st} value={st}>
                            {STAGE_CONFIG[st].stepNumber}. {STAGE_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </HStack>
                  </Flex>
                </Box>

                {/* Expandable Client Submitted Assets Preview */}
                {assets && (
                  <Box mb={4}>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="var(--athar-maroon)"
                      fontWeight="700"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.$id)}
                      mb={2}
                    >
                      {isExpanded ? "▲ إخفاء الذكريات المرفوعة من العميل" : "▼ معاينة الذكريات المرفوعة من العميل (Stage 3 Assets)"}
                    </Button>

                    {isExpanded && (
                      <Box
                        p={4}
                        borderRadius="14px"
                        bg="rgba(251, 247, 242, 0.95)"
                        border="1px solid var(--athar-gold)"
                        className="animate-fade-in"
                      >
                        <Text fontSize="0.82rem" fontWeight="800" color="var(--athar-maroon)" mb={3}>
                          محتوى الحزمة المرفوع من العميل:
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                          {assets.heroImageUrl && (
                            <Box>
                              <Text fontSize="0.72rem" color="var(--athar-text-muted)" mb={1}>
                                صورة الغلاف الرئيسية:
                              </Text>
                              <img
                                src={assets.heroImageUrl}
                                alt="Hero Cover"
                                style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px" }}
                              />
                            </Box>
                          )}
                          <Box>
                            <Text fontSize="0.72rem" color="var(--athar-text-muted)" mb={1}>
                              عنوان العروسين والعبارة الشخصية:
                            </Text>
                            <Text fontWeight="800" fontSize="1rem" color="var(--athar-text-title)">
                              {assets.coupleTitle || order.partnerOrOrgName}
                            </Text>
                            <Text fontSize="0.82rem" color="var(--athar-maroon)" fontStyle="italic" mt={1}>
                              "{assets.coupleQuote || "ذكريات لا تغيب مع أصوات من نحب..."}"
                            </Text>
                            {assets.thankYouMessage && (
                              <Text fontSize="0.75rem" color="var(--athar-text-muted)" mt={2}>
                                رسالة الشكر: {assets.thankYouMessage}
                              </Text>
                            )}
                          </Box>
                          <Box>
                            <Text fontSize="0.72rem" color="var(--athar-text-muted)" mb={1}>
                              {isBooth ? "التصنيفات المقترحة للرسائل:" : "حقول الـ RSVP المطلوبة:"}
                            </Text>
                            <HStack wrap="wrap" gap={1.5}>
                              {(assets.categories || assets.requestedRsvpFields || [
                                "العائلة",
                                "الأصدقاء",
                                "الزملاء",
                                "كبار الزوار",
                              ]).map((cat, idx) => (
                                <Badge key={idx} className="athar-badge-gold" fontSize="0.72rem">
                                  {cat}
                                </Badge>
                              ))}
                            </HStack>
                          </Box>
                        </SimpleGrid>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Bottom Row Actions */}
                <Flex justify="space-between" align="center" wrap="wrap" gap={3} pt={2}>
                  {/* Left: Contact Info */}
                  <HStack gap={3}>
                    <Text fontSize="0.8rem" color="var(--athar-text-body)">
                      📞 {order.clientPhone}
                    </Text>
                    <Text fontSize="0.8rem" color="var(--athar-text-muted)">
                      ✉️ {order.clientEmail}
                    </Text>
                  </HStack>

                  {/* Right: Studio Launch & Payment Verification Buttons */}
                  <HStack gap={2.5}>
                    {/* Payment Receipt Button */}
                    <button
                      className="btn-athar-secondary"
                      onClick={() => handleOpenInspector(order)}
                      style={{
                        padding: "0.45rem 1rem",
                        fontSize: "0.84rem",
                        borderColor: isPendingPayment ? "var(--athar-gold)" : undefined,
                        backgroundColor: isPendingPayment ? "rgba(212, 175, 55, 0.15)" : undefined,
                        fontWeight: 700,
                      }}
                    >
                      {isPendingPayment ? "⚠️ فحص إيصال الدفع" : "🔍 معاينة الإيصال"}
                    </button>

                    {/* Direct Studio Launch Button */}
                    {isBooth ? (
                      <button
                        className="btn-athar-primary"
                        onClick={() => onOpenStudio(order.$id, "booth")}
                        style={{ padding: "0.45rem 1.2rem", fontSize: "0.85rem" }}
                      >
                        🎙️ فتح في أستوديو هاتف أثر →
                      </button>
                    ) : (
                      <button
                        className="btn-athar-primary"
                        onClick={() => onOpenStudio(order.$id, "invitation")}
                        style={{ padding: "0.45rem 1.2rem", fontSize: "0.85rem", background: "#8C6F12" }}
                      >
                        ✉️ فتح في أستوديو الدعوات →
                      </button>
                    )}
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Payment Receipt Inspector Modal */}
      <PaymentReceiptInspector
        isOpen={isInspectorOpen}
        order={inspectingOrder}
        payment={inspectingPayment}
        onClose={() => setIsInspectorOpen(false)}
        onApprove={handleApprovePayment}
        onReject={handleRejectPayment}
      />
    </Box>
  );
};

export default OrdersQueueManager;
