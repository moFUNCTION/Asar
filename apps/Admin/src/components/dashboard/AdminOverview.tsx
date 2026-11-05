import React from "react";
import { Box, Flex, SimpleGrid, HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import type { AdminTab } from "../layout/AdminShell";

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
  onSelectOrderForStudio: (orderId: string, serviceType: "booth" | "invitation") => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  orders,
  plansCount,
  onNavigateTab,
  onSelectOrderForStudio,
}) => {
  // Aggregate stats
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingPayments = orders.filter((o) => o.orderStatus === "pending_payment");
  const awaitingAssets = orders.filter((o) => o.orderStatus === "awaiting_client_assets");
  const inProduction = orders.filter((o) =>
    ["event_scheduled", "audio_mastering", "studio_curation"].includes(o.orderStatus)
  );
  const publishedMemories = orders.filter((o) => o.orderStatus === "published");

  const boothOrders = orders.filter((o) => o.serviceType === "booth");
  const invitationOrders = orders.filter((o) => o.serviceType === "invitation");

  const stageLabels: { key: AsarOrderStatus; label: string; color: string; count: number }[] = [
    {
      key: "pending_payment",
      label: "Pending Payment",
      color: "var(--athar-status-warning)",
      count: orders.filter((o) => o.orderStatus === "pending_payment").length,
    },
    {
      key: "payment_rejected",
      label: "Payment Rejected",
      color: "var(--athar-status-danger)",
      count: orders.filter((o) => o.orderStatus === "payment_rejected").length,
    },
    {
      key: "awaiting_client_assets",
      label: "Awaiting Client Assets",
      color: "#8C6D46",
      count: orders.filter((o) => o.orderStatus === "awaiting_client_assets").length,
    },
    {
      key: "event_scheduled",
      label: "Event Scheduled",
      color: "var(--athar-maroon)",
      count: orders.filter((o) => o.orderStatus === "event_scheduled").length,
    },
    {
      key: "audio_mastering",
      label: "Audio Mastering",
      color: "#944D59",
      count: orders.filter((o) => o.orderStatus === "audio_mastering").length,
    },
    {
      key: "studio_curation",
      label: "Studio Curation",
      color: "var(--athar-gold)",
      count: orders.filter((o) => o.orderStatus === "studio_curation").length,
    },
    {
      key: "published",
      label: "Published Heirloom",
      color: "var(--athar-status-success)",
      count: orders.filter((o) => o.orderStatus === "published").length,
    },
  ];

  return (
    <Box className="animate-fade-in">
      {/* Editorial Header */}
      <Box mb={8}>
        <HStack gap={2} mb={2}>
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
            ✦ EXECUTIVE CONSOLE &bull; {plansCount} ACTIVE PLANS
          </Badge>
          <Text fontSize="0.85rem" color="var(--athar-text-muted)">
            Live Status & Concierge Queue ({awaitingAssets.length} awaiting assets)
          </Text>
        </HStack>
        <Text
          fontSize={{ base: "1.8rem", md: "2.4rem" }}
          fontWeight="700"
          fontFamily="var(--font-arabic-display)"
          color="var(--athar-maroon)"
          lineHeight="1.2"
        >
          Operations & Curation Overview
        </Text>
        <Text fontSize="0.95rem" color="var(--athar-text-muted)" mt={1}>
          Monitor manual payment verifications, 7-stage concierge progression, and active studio sessions.
        </Text>
      </Box>

      {/* KPI Stats Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
        {/* Total Bookings Revenue */}
        <Box className="athar-card" p={5}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="700" textTransform="uppercase">
              Total Booked Volume
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
              fontSize="0.9rem"
            >
              EGP
            </Box>
          </HStack>
          <Text fontSize="1.85rem" fontWeight="800" color="var(--athar-text-title)" fontFamily="var(--font-body)">
            {totalRevenue.toLocaleString()} <span style={{ fontSize: "1rem", fontWeight: 600 }}>EGP</span>
          </Text>
          <Text fontSize="0.78rem" color="var(--athar-status-success)" fontWeight="600" mt={1}>
            Across {orders.length} registered event orders
          </Text>
        </Box>

        {/* Pending Payment Verification Alert */}
        <Box
          className="athar-card"
          p={5}
          border={pendingPayments.length > 0 ? "1.5px solid #D4AF37" : undefined}
          bg={pendingPayments.length > 0 ? "rgba(255, 250, 240, 0.95)" : undefined}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="700" textTransform="uppercase">
              Pending Receipts
            </Text>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg={pendingPayments.length > 0 ? "rgba(183, 121, 31, 0.2)" : "rgba(107, 29, 40, 0.08)"}
              color={pendingPayments.length > 0 ? "var(--athar-status-warning)" : "var(--athar-maroon)"}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="0.95rem"
            >
              💳
            </Box>
          </HStack>
          <HStack align="baseline" gap={2}>
            <Text fontSize="1.85rem" fontWeight="800" color={pendingPayments.length > 0 ? "var(--athar-status-warning)" : "var(--athar-text-title)"}>
              {pendingPayments.length}
            </Text>
            {pendingPayments.length > 0 && (
              <Badge className="athar-badge-warning" fontSize="0.7rem">
                Action Required
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
            Open Payment Queue →
          </Button>
        </Box>

        {/* Active In-Production Orders */}
        <Box className="athar-card" p={5}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="700" textTransform="uppercase">
              In Studio Curation
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
          <Text fontSize="1.85rem" fontWeight="800" color="var(--athar-text-title)">
            {inProduction.length}
          </Text>
          <Text fontSize="0.78rem" color="var(--athar-text-muted)" mt={1}>
            Audio mastering & website assembly
          </Text>
        </Box>

        {/* Published Heirlooms */}
        <Box className="athar-card" p={5}>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="0.8rem" color="var(--athar-text-muted)" fontWeight="700" textTransform="uppercase">
              Published Heirlooms
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
          <Text fontSize="1.85rem" fontWeight="800" color="var(--athar-status-success)">
            {publishedMemories.length}
          </Text>
          <Text fontSize="0.78rem" color="var(--athar-text-muted)" mt={1}>
            Live memory pages delivering joy
          </Text>
        </Box>
      </SimpleGrid>

      {/* 7-Stage Pipeline Visual Breakdown */}
      <Box className="athar-card" p={{ base: 5, md: 6 }} mb={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={5}>
          <Box>
            <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-text-title)">
              7-Stage Concierge Pipeline Health
            </Text>
            <Text fontSize="0.82rem" color="var(--athar-text-muted)">
              Real-time distribution of orders across the non-automated fulfillment workflow
            </Text>
          </Box>
          <Button
            className="btn-athar-secondary"
            onClick={() => onNavigateTab("orders")}
            style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}
          >
            Manage Pipeline Queue →
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
              _hover={{ transform: "translateY(-2px)", borderColor: "var(--athar-gold)" }}
            >
              <Text fontSize="0.72rem" fontWeight="700" color="var(--athar-text-muted)" textTransform="uppercase">
                Stage {idx + 1}
              </Text>
              <Text fontSize="1.6rem" fontWeight="800" color={s.color} my={1}>
                {s.count}
              </Text>
              <Text fontSize="0.78rem" fontWeight="600" color="var(--athar-text-title)" lineHeight="1.3">
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
          borderLeft="4px solid var(--athar-maroon)"
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
                <Text fontSize="1.05rem" fontWeight="800" color="var(--athar-maroon)">
                  ASAR Booth Operations
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                  Vintage audio guestbook & interactive waveform memories
                </Text>
              </Box>
            </HStack>
            <Badge className="athar-badge-maroon">{boothOrders.length} Active Orders</Badge>
          </HStack>

          <Text fontSize="0.88rem" color="var(--athar-text-body)" mb={4}>
            Upload and master bulk audio recordings, auto-extract 48-peak waveforms, parse speaker metadata,
            and preview the private mobile memory website in real time.
          </Text>

          <HStack gap={3}>
            <button
              className="btn-athar-primary"
              onClick={() => onNavigateTab("booth-studio")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.2rem" }}
            >
              🎙️ Open Booth Studio →
            </button>
            <button
              className="btn-athar-secondary"
              onClick={() => onNavigateTab("plans")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
            >
              Manage Booth Plans
            </button>
          </HStack>
        </Box>

        {/* Invitation Studio Launcher */}
        <Box
          className="athar-card"
          p={6}
          borderLeft="4px solid var(--athar-gold)"
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
                  ASAR Invitation Studio
                </Text>
                <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                  Bespoke event websites & dynamic RSVP form builder
                </Text>
              </Box>
            </HStack>
            <Badge className="athar-badge-gold">{invitationOrders.length} Active Orders</Badge>
          </HStack>

          <Text fontSize="0.88rem" color="var(--athar-text-body)" mb={4}>
            Assemble luxury multi-occasion websites, configure dynamic RSVP field schemas (with locked mandatory email),
            and manage guest entry passes.
          </Text>

          <HStack gap={3}>
            <button
              className="btn-athar-primary"
              onClick={() => onNavigateTab("invitation-studio")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.2rem", background: "#8C6F12" }}
            >
              ✉️ Open Invitation Studio →
            </button>
            <button
              className="btn-athar-secondary"
              onClick={() => onNavigateTab("plans")}
              style={{ fontSize: "0.85rem", padding: "0.55rem 1.1rem" }}
            >
              Manage Invitation Plans
            </button>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Recent Orders Spotlight */}
      <Box className="athar-card" p={{ base: 5, md: 6 }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={4}>
          <Box>
            <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-text-title)">
              Recent Event Orders
            </Text>
            <Text fontSize="0.82rem" color="var(--athar-text-muted)">
              Showing latest client bookings awaiting curation or review
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
            View All ({orders.length}) →
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
              <Text fontSize="0.95rem" fontWeight="600" color="var(--athar-text-muted)">
                No event orders in the queue yet.
              </Text>
            </Box>
          ) : (
            orders.slice(0, 5).map((order) => {
            const isBooth = order.serviceType === "booth";
            return (
              <Box
                key={order.$id}
                p={4}
                borderRadius="14px"
                border="1px solid rgba(107, 29, 40, 0.08)"
                bg="#ffffff"
                transition="all 0.2s ease"
                _hover={{ borderColor: "rgba(212, 175, 55, 0.5)", transform: "translateX(4px)" }}
              >
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                  <HStack gap={3.5}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      bg={isBooth ? "var(--athar-maroon-subtle)" : "rgba(212, 175, 55, 0.15)"}
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
                        <Text fontWeight="800" fontSize="0.95rem" color="var(--athar-text-title)">
                          {order.clientName}
                        </Text>
                        <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                          &bull; {order.partnerOrOrgName}
                        </Text>
                        <Badge
                          variant="subtle"
                          fontSize="0.7rem"
                          bg={isBooth ? "rgba(107, 29, 40, 0.08)" : "rgba(212, 175, 55, 0.12)"}
                          color={isBooth ? "var(--athar-maroon)" : "#8C6F12"}
                          borderRadius="full"
                          px={2}
                        >
                          {order.serviceType.toUpperCase()}
                        </Badge>
                      </HStack>
                      <Text fontSize="0.78rem" color="var(--athar-text-muted)">
                        {order.planName} &bull; {order.eventDate} &bull; {order.eventVenue}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack gap={3}>
                    <Box textAlign="right">
                      <Text fontSize="0.92rem" fontWeight="800" color="var(--athar-text-title)">
                        {order.totalAmount.toLocaleString()} EGP
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
                        {order.orderStatus.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </Box>

                    <Button
                      size="xs"
                      className="btn-athar-secondary"
                      onClick={() => onSelectOrderForStudio(order.$id, order.serviceType)}
                      style={{ fontSize: "0.78rem", padding: "0.35rem 0.8rem" }}
                    >
                      Launch Studio →
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
