import React from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
} from "@chakra-ui/react";
import type { AdminTab } from "../layout/AdminShell";
import { ORDER_PIPELINE_STAGES } from "@repo/react-appwrite";

export type AsarOrderStatus =
  | "pending_payment"
  | "payment_rejected"
  | "awaiting_client_assets"
  | "event_scheduled"
  | "audio_mastering"
  | "studio_curation"
  | "published";

export interface AsarOrder {
  $id: string;
  clientId: string;
  clientName: string;
  partnerOrOrgName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: "booth" | "invitation";
  planId: string;
  planName: string;
  selectedAddonsJson?: string;
  totalAmount: number;
  orderStatus: AsarOrderStatus;
  eventDate: string;
  eventVenue: string;
  clientSubmittedAssetsJson?: string;
  quotaOverridesJson?: string;
  adminNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminOverviewProps {
  orders: AsarOrder[];
  plansCount: number;
  onNavigateTab: (tab: AdminTab) => void;
  onSelectOrderForStudio: (
    orderId: string,
    serviceType: "booth" | "invitation",
  ) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  plansCount,
  onNavigateTab,
  onSelectOrderForStudio,
}) => {
  // Aggregate stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingPayments = orders.filter(
    (o) => o.orderStatus === "pending_payment",
  );
  const awaitingAssets = orders.filter(
    (o) => o.orderStatus === "awaiting_client_assets",
  );
  const inProduction = orders.filter((o) =>
    ["event_scheduled", "audio_mastering", "studio_curation"].includes(
      o.orderStatus,
    ),
  );
  const publishedMemories = orders.filter((o) => o.orderStatus === "published");

  const boothOrders = orders.filter((o) => o.serviceType === "booth");
  const invitationOrders = orders.filter((o) => o.serviceType === "invitation");

  const stageLabels: {
    key: AsarOrderStatus;
    label: string;
    color: string;
    count: number;
  }[] = [
    {
      key: "pending_payment",
      label:
        ORDER_PIPELINE_STAGES.pending_payment?.titleAr ||
        "التحقق من إيصال الدفع",
      color: "var(--athar-status-warning)",
      count: orders.filter((o) => o.orderStatus === "pending_payment").length,
    },
    {
      key: "payment_rejected",
      label:
        ORDER_PIPELINE_STAGES.payment_rejected?.titleAr ||
        "مطلوب إجراء: إعادة رفع إيصال الدفع",
      color: "var(--athar-status-danger)",
      count: orders.filter((o) => o.orderStatus === "payment_rejected").length,
    },
    {
      key: "awaiting_client_assets",
      label:
        ORDER_PIPELINE_STAGES.awaiting_client_assets?.titleAr ||
        "تخصيص صفحة الذكريات وإرسال الوسائط",
      color: "#8C6D46",
      count: orders.filter((o) => o.orderStatus === "awaiting_client_assets")
        .length,
    },
    {
      key: "event_scheduled",
      label:
        ORDER_PIPELINE_STAGES.event_scheduled?.titleAr ||
        "تأكيد موعد الحفل وتجهيز المحطة",
      color: "var(--athar-maroon)",
      count: orders.filter((o) => o.orderStatus === "event_scheduled").length,
    },
    {
      key: "audio_mastering",
      label:
        ORDER_PIPELINE_STAGES.audio_mastering?.titleAr ||
        "هندسة ومعالجة التسجيلات الصوتية",
      color: "#944D59",
      count: orders.filter((o) => o.orderStatus === "audio_mastering").length,
    },
    {
      key: "studio_curation",
      label:
        ORDER_PIPELINE_STAGES.studio_curation?.titleAr ||
        "بناء وتنسيق موقع الذكريات الخاص بكم",
      color: "var(--athar-gold)",
      count: orders.filter((o) => o.orderStatus === "studio_curation").length,
    },
    {
      key: "published",
      label:
        ORDER_PIPELINE_STAGES.published?.titleAr ||
        "موقع ذكرياتكم متاح الآن! 🎉",
      color: "var(--athar-status-success)",
      count: orders.filter((o) => o.orderStatus === "published").length,
    },
  ];

  return (
    <Box className="animate-fade-in" dir="rtl">
      {/* Editorial Header */}
      <Box mb={8}>
        <HStack gap={2} mb={2} wrap="wrap">
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            color="var(--athar-maroon)"
            bg="rgba(255, 255, 255, 0.95)"
            px={3.5}
            py={1}
            borderRadius="full"
            fontSize="0.8rem"
            fontWeight="800"
            letterSpacing="0.05em"
          >
            ✦ لوحة الإدارة التنفيذية • {plansCount} باقات مفعلة
          </Badge>
          <Text fontSize="0.85rem" color="var(--athar-text-muted)">
            المتابعة اللحظية وطابور العمليات ({awaitingAssets.length} بانتظار
            تسليم المواد)
          </Text>
        </HStack>
        <Text
          fontSize={{ base: "1.8rem", md: "2.4rem" }}
          fontWeight="700"
          fontFamily="var(--font-arabic-display)"
          color="var(--athar-maroon)"
          lineHeight="1.2"
        >
          لوحة العمليات والملخص الإداري
        </Text>
        <Text fontSize="0.95rem" color="var(--athar-text-muted)" mt={1}>
          متابعة وتدقيق إيصالات الدفع يدوياً، ومسار المعالجة المكون من 7 مراحل،
          وإدارة استوديوهات الإنتاج.
        </Text>
      </Box>

      {/* KPI Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
        {/* Total Bookings Revenue */}
        <Box className="athar-card" p={5}>
          <HStack justify="space-between" mb={2}>
            <Text
              fontSize="0.82rem"
              color="var(--athar-text-muted)"
              fontWeight="700"
            >
              إجمالي الحجوزات
            </Text>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg="rgba(212, 175, 55, 0.15)"
              color="#8C6F12"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="0.85rem"
              fontWeight="800"
            >
              ج.م
            </Box>
          </HStack>
          <Text
            fontSize="1.85rem"
            fontWeight="800"
            color="var(--athar-text-title)"
            fontFamily="var(--font-body)"
          >
            {totalRevenue.toLocaleString()}{" "}
            <span style={{ fontSize: "1rem", fontWeight: 700 }}>ج.م</span>
          </Text>
          <Text
            fontSize="0.78rem"
            color="var(--athar-status-success)"
            fontWeight="600"
            mt={1}
          >
            من واقع {orders.length} طلب مناسبة مسجل
          </Text>
        </Box>

        {/* Pending Payment Verification Alert */}
        <Box
          className="athar-card"
          p={5}
          border={
            pendingPayments.length > 0 ? "1.5px solid #D4AF37" : undefined
          }
          bg={
            pendingPayments.length > 0 ? "rgba(255, 250, 240, 0.95)" : undefined
          }
        >
          <HStack justify="space-between" mb={2}>
            <Text
              fontSize="0.82rem"
              color="var(--athar-text-muted)"
              fontWeight="700"
            >
              إيصالات بانتظار المراجعة
            </Text>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg={
                pendingPayments.length > 0
                  ? "rgba(183, 121, 31, 0.2)"
                  : "rgba(107, 29, 40, 0.08)"
              }
              color={
                pendingPayments.length > 0
                  ? "var(--athar-status-warning)"
                  : "var(--athar-maroon)"
              }
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="0.95rem"
            >
              💳
            </Box>
          </HStack>
          <HStack align="baseline" gap={2}>
            <Text
              fontSize="1.85rem"
              fontWeight="800"
              color={
                pendingPayments.length > 0
                  ? "var(--athar-status-warning)"
                  : "var(--athar-text-title)"
              }
            >
              {pendingPayments.length}
            </Text>
            {pendingPayments.length > 0 && (
              <Badge className="athar-badge-warning" fontSize="0.7rem">
                مطلوب إجراء فوري
              </Badge>
            )}
          </HStack>
          <Button
            size="xs"
            variant="ghost"
            color="var(--athar-maroon)"
            fontWeight="700"
            p={0}
            mt={1}
            onClick={() => onNavigateTab("orders")}
            _hover={{ textDecoration: "underline" }}
          >
            فتح طابور المدفوعات ←
          </Button>
        </Box>

        {/* Active Studio Sessions */}
        <Box className="athar-card" p={5}>
          <HStack justify="space-between" mb={2}>
            <Text
              fontSize="0.82rem"
              color="var(--athar-text-muted)"
              fontWeight="700"
            >
              جلسات الاستوديو النشطة
            </Text>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg="rgba(107, 29, 40, 0.1)"
              color="var(--athar-maroon)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="0.95rem"
            >
              🎙️
            </Box>
          </HStack>
          <Text
            fontSize="1.85rem"
            fontWeight="800"
            color="var(--athar-text-title)"
          >
            {inProduction.length}
          </Text>
          <Text fontSize="0.78rem" color="var(--athar-text-muted)" mt={1}>
            معالجة الصوتيات وتنسيق صفحات المناسبات
          </Text>
        </Box>

        {/* Published Heirlooms */}
        <Box className="athar-card" p={5}>
          <HStack justify="space-between" mb={2}>
            <Text
              fontSize="0.82rem"
              color="var(--athar-text-muted)"
              fontWeight="700"
            >
              صفحات الذكريات المنشورة
            </Text>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg="rgba(30, 111, 80, 0.1)"
              color="var(--athar-status-success)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="0.95rem"
            >
              ✦
            </Box>
          </HStack>
          <Text
            fontSize="1.85rem"
            fontWeight="800"
            color="var(--athar-status-success)"
          >
            {publishedMemories.length}
          </Text>
          <Text fontSize="0.78rem" color="var(--athar-text-muted)" mt={1}>
            مواقع وتذكارات رقمية حية ومتاحة للضيوف
          </Text>
        </Box>
      </SimpleGrid>

      {/* 7-Stage Pipeline Visual Breakdown */}
      <Box className="athar-card" p={{ base: 5, md: 6 }} mb={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={5}>
          <Box>
            <Text
              fontSize="1.15rem"
              fontWeight="800"
              color="var(--athar-text-title)"
            >
              متابعة مراحل التنفيذ السبعة (Pipeline Health)
            </Text>
            <Text fontSize="0.82rem" color="var(--athar-text-muted)">
              توزيع فوري لحالات الطلبات عبر مراحل الإنتاج والخدمة المتكاملة
            </Text>
          </Box>
          <Button
            className="btn-athar-secondary"
            onClick={() => onNavigateTab("orders")}
            style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
          >
            إدارة طابور الطلبات ←
          </Button>
        </Flex>

        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 7 }} gap={3}>
          {stageLabels.map((s, idx) => (
            <Box
              key={s.key}
              p={3.5}
              borderRadius="16px"
              bg="rgba(251, 247, 242, 0.85)"
              border="1px solid rgba(107, 29, 40, 0.08)"
              textAlign="center"
              transition="all 0.2s ease"
              _hover={{
                transform: "translateY(-2px)",
                borderColor: "var(--athar-gold)",
              }}
            >
              <Text
                fontSize="0.72rem"
                fontWeight="700"
                color="var(--athar-text-muted)"
              >
                المرحلة {idx + 1}
              </Text>
              <Text fontSize="1.6rem" fontWeight="800" color={s.color} my={1}>
                {s.count}
              </Text>
              <Text
                fontSize="0.78rem"
                fontWeight="600"
                color="var(--athar-text-title)"
                lineHeight="1.3"
              >
                {s.label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Quick Launch Studios & Services Breakdown */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mb={8}>
        {/* Booth Memory Studio Launcher */}
        <Box
          className="athar-card"
          p={6}
          borderRight="4px solid var(--athar-maroon)"
          bg="rgba(255, 255, 255, 0.95)"
        >
          <HStack justify="space-between" mb={3}>
            <HStack gap={2.5}>
              <Box
                w="38px"
                h="38px"
                borderRadius="10px"
                bg="var(--athar-maroon-subtle)"
                color="var(--athar-maroon)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="1.1rem"
              >
                🎙️
              </Box>
              <Box>
                <Text
                  fontSize="1.05rem"
                  fontWeight="800"
                  color="var(--athar-maroon)"
                >
                  عمليات هاتف أثر الصوتي
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                  هاتف أثر الكلاسيكي واستخراج الموجات الصوتية التفاعلية
                </Text>
              </Box>
            </HStack>
            <Badge className="athar-badge-maroon">
              {boothOrders.length} طلبات نشطة
            </Badge>
          </HStack>

          <Text fontSize="0.88rem" color="var(--athar-text-body)" mb={4}>
            رفع ومعالجة التسجيلات الصوتية دفعة واحدة، واستخراج أشكال الموجات
            48-peak، وتنسيق أسماء الضيوف، ومعاينة موقع الذكريات للجوال لحظياً.
          </Text>

          <HStack gap={3}>
            <button
              className="btn-athar-primary"
              onClick={() => onNavigateTab("booth-studio")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.2rem" }}
            >
              🎙️ فتح استوديو هاتف أثر ←
            </button>
            <button
              className="btn-athar-secondary"
              onClick={() => onNavigateTab("plans")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
            >
              إدارة باقات هاتف أثر
            </button>
          </HStack>
        </Box>

        {/* Invitation Studio Launcher */}
        <Box
          className="athar-card"
          p={6}
          borderRight="4px solid var(--athar-gold)"
          bg="rgba(255, 255, 255, 0.95)"
        >
          <HStack justify="space-between" mb={3}>
            <HStack gap={2.5}>
              <Box
                w="38px"
                h="38px"
                borderRadius="10px"
                bg="rgba(212, 175, 55, 0.15)"
                color="#8C6F12"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="1.1rem"
              >
                ✉️
              </Box>
              <Box>
                <Text fontSize="1.05rem" fontWeight="800" color="#8C6F12">
                  استوديو تصميم الدعوات الفاخرة
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                  مواقع مناسبات مخصصة ونظام بناء استمارات تأكيد الحضور
                  الديناميكية
                </Text>
              </Box>
            </HStack>
            <Badge className="athar-badge-gold">
              {invitationOrders.length} طلبات نشطة
            </Badge>
          </HStack>

          <Text fontSize="0.88rem" color="var(--athar-text-body)" mb={4}>
            تنسيق مواقع المناسبات الفاخرة، وتخصيص حقول استمارة تأكيد الحضور (مع
            إلزام البريد الإلكتروني)، وإدارة بطاقات الدخول الرقمية.
          </Text>

          <HStack gap={3}>
            <button
              className="btn-athar-primary"
              onClick={() => onNavigateTab("invitation-studio")}
              style={{
                fontSize: "0.85rem",
                padding: "0.55rem 1.2rem",
                background: "#8C6F12",
              }}
            >
              ✉️ فتح استوديو الدعوات ←
            </button>
            <button
              className="btn-athar-secondary"
              onClick={() => onNavigateTab("plans")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
            >
              إدارة باقات الدعوات
            </button>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Recent Orders Spotlight */}
      <Box className="athar-card" p={{ base: 5, md: 6 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
          <Box>
            <Text
              fontSize="1.15rem"
              fontWeight="800"
              color="var(--athar-text-title)"
            >
              أحدث طلبات المناسبات
            </Text>
            <Text fontSize="0.82rem" color="var(--athar-text-muted)">
              عرض أحدث حجوزات العملاء بانتظار المراجعة أو التنسيق في الاستوديو
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            borderColor="rgba(107, 29, 40, 0.2)"
            color="var(--athar-maroon)"
            borderRadius="full"
            fontWeight="700"
            onClick={() => onNavigateTab("orders")}
          >
            عرض كافة الطلبات ({orders.length}) ←
          </Button>
        </Flex>

        <VStack gap={3} align="stretch">
          {orders.length === 0 ? (
            <Box
              p={8}
              textAlign="center"
              bg="#ffffff"
              borderRadius="14px"
              border="1px dashed rgba(212, 175, 55, 0.4)"
            >
              <Text
                fontSize="0.95rem"
                fontWeight="600"
                color="var(--athar-text-muted)"
              >
                لا توجد طلبات مناسبات في الطابور حالياً.
              </Text>
            </Box>
          ) : (
            orders.slice(0, 5).map((order) => {
              const isBooth = order.serviceType === "booth";
              const stageInfo = ORDER_PIPELINE_STAGES[order.orderStatus];
              return (
                <Box
                  key={order.$id}
                  p={4}
                  borderRadius="14px"
                  border="1px solid rgba(107, 29, 40, 0.08)"
                  bg="#ffffff"
                  transition="all 0.2s ease"
                  _hover={{
                    borderColor: "rgba(212, 175, 55, 0.5)",
                    transform: "translateX(-4px)",
                  }}
                >
                  <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={3}
                  >
                    <HStack gap={3.5}>
                      <Box
                        w="36px"
                        h="36px"
                        borderRadius="full"
                        bg={
                          isBooth
                            ? "var(--athar-maroon-subtle)"
                            : "rgba(212, 175, 55, 0.15)"
                        }
                        color={isBooth ? "var(--athar-maroon)" : "#8C6F12"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="1rem"
                      >
                        {isBooth ? "🎙️" : "✉️"}
                      </Box>
                      <Box>
                        <HStack gap={2}>
                          <Text
                            fontWeight="800"
                            fontSize="0.95rem"
                            color="var(--athar-text-title)"
                          >
                            {order.clientName}
                          </Text>
                          <Text
                            fontSize="0.82rem"
                            color="var(--athar-text-muted)"
                          >
                            • {order.partnerOrOrgName}
                          </Text>
                          <Badge
                            variant="subtle"
                            fontSize="0.7rem"
                            bg={
                              isBooth
                                ? "rgba(107, 29, 40, 0.08)"
                                : "rgba(212, 175, 55, 0.12)"
                            }
                            color={isBooth ? "var(--athar-maroon)" : "#8C6F12"}
                            borderRadius="full"
                            px={2}
                          >
                            {isBooth ? "هاتف أثر" : "دعوة رقمية"}
                          </Badge>
                        </HStack>
                        <Text
                          fontSize="0.78rem"
                          color="var(--athar-text-muted)"
                        >
                          {order.planName} • {order.eventDate} •{" "}
                          {order.eventVenue}
                        </Text>
                      </Box>
                    </HStack>

                    <HStack gap={3}>
                      <Box textAlign="left">
                        <Text
                          fontSize="0.92rem"
                          fontWeight="800"
                          color="var(--athar-text-title)"
                        >
                          {order.totalAmount.toLocaleString()} ج.م
                        </Text>
                        <Badge
                          className={
                            order.orderStatus === "published"
                              ? "athar-badge-success"
                              : order.orderStatus === "pending_payment"
                                ? "athar-badge-warning"
                                : order.orderStatus === "payment_rejected"
                                  ? "athar-badge-danger"
                                  : "athar-badge-maroon"
                          }
                          fontSize="0.72rem"
                        >
                          {stageInfo?.titleAr || order.orderStatus}
                        </Badge>
                      </Box>

                      <Button
                        size="xs"
                        className="btn-athar-secondary"
                        onClick={() =>
                          onSelectOrderForStudio(order.$id, order.serviceType)
                        }
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.35rem 0.8rem",
                        }}
                      >
                        فتح الاستوديو ←
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
              );
            })
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminOverview;
