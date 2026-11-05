import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Button, Badge } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppwrite, useAsarAuth, ASAR_DATABASE_ID, ASAR_COLLECTIONS, Query } from "@repo/react-appwrite";
import { OrderTrackerTimeline } from "./OrderTrackerTimeline";
import type { OrderData, OrderStageKey } from "./OrderTrackerTimeline";
import { RawAssetsManager } from "./RawAssetsManager";
import type { ClientSubmittedAssetsData } from "./RawAssetsManager";
import { AudioReviewPlayer } from "./AudioReviewPlayer";
import { QrHubManager } from "./QrHubManager";
import { ClientRsvpMailbox } from "../mailbox/ClientRsvpMailbox";

export interface ClientAccountShellProps {
  initialTab?: string;
  onBackToHome: () => void;
  onLogout?: () => void;
  currentUser?: { name?: string; email?: string } | null;
}

const DEFAULT_ORDERS: OrderData[] = [
  {
    orderId: "ORD-902",
    serviceType: "booth",
    planName: "حكاية أثر VIP (Athar Story VIP)",
    clientNames: "مينا ومريم (Mina & Maryam)",
    eventDate: "12 يوليو 2026",
    eventVenue: "الإسكندرية، مصر",
    totalAmount: 7000,
    currency: "EGP",
    currentStage: "submitted",
    paymentMethod: "InstaPay",
    paymentReceiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop",
    rejectionReason: "",
  },
  {
    orderId: "ORD-915",
    serviceType: "invitation",
    planName: "دعوة أثر الملكية (Athar Bespoke Gala)",
    clientNames: "عمر وليلى (Omar & Layla)",
    eventDate: "20 نوفمبر 2026",
    eventVenue: "فندق فور سيزونز، الإسكندرية",
    totalAmount: 4500,
    currency: "EGP",
    currentStage: "delivered",
    paymentMethod: "Bank Transfer",
    paymentReceiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop",
    rejectionReason: "",
  },
];

export const ClientAccountShell: React.FC<ClientAccountShellProps> = ({
  initialTab = "orders",
  onBackToHome,
  onLogout,
  currentUser: initialCurrentUser,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAsarAuth();
  const { databases } = useAppwrite();

  const effectiveUser = {
    name: profile?.name || user?.name || initialCurrentUser?.name || "عميل أثر",
    email: profile?.email || user?.email || initialCurrentUser?.email || "client@asar.audio",
  };

  const getActiveTab = (): string => {
    const pathname = location.pathname.replace(/\/+$/, "");
    if (pathname.endsWith("/mailbox")) return "mailbox";
    if (pathname.endsWith("/qr-hub") || pathname.endsWith("/qr_hub")) return "qr_hub";
    if (pathname.endsWith("/audio")) return "audio";
    if (pathname.endsWith("/assets")) return "assets";
    if (pathname.endsWith("/orders")) return "orders";

    // Query parameter fallback (?tab=...)
    const params = new URLSearchParams(location.search);
    const searchTab = params.get("tab");
    if (searchTab === "mailbox") return "mailbox";
    if (searchTab === "qr_hub" || searchTab === "qr-hub") return "qr_hub";
    if (searchTab === "audio") return "audio";
    if (searchTab === "assets") return "assets";
    if (searchTab === "orders") return "orders";

    return initialTab || "orders";
  };

  const activeTab = getActiveTab();

  const handleSelectTab = (tab: string) => {
    const route = tab === "qr_hub" ? "qr-hub" : tab;
    navigate(`/account/${route}`);
  };

  const [orders, setOrders] = useState<OrderData[]>(DEFAULT_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState<string>(DEFAULT_ORDERS[0].orderId);

  // Load cloud orders from Appwrite
  useEffect(() => {
    let isMounted = true;
    async function loadCloudOrders() {
      if (!databases) return;
      try {
        const queries: any[] = [];
        if (user?.$id) {
          queries.push(Query.equal("clientId", user.$id));
        } else if (effectiveUser.email && effectiveUser.email !== "client@asar.audio") {
          queries.push(Query.equal("clientEmail", effectiveUser.email));
        }

        if (queries.length > 0) {
          const res = await databases.listDocuments(ASAR_DATABASE_ID, ASAR_COLLECTIONS.ORDERS, queries);
          if (isMounted && res.documents.length > 0) {
            const cloudOrders: OrderData[] = res.documents.map((d: any) => ({
              orderId: d.$id,
              serviceType: d.serviceType || "booth",
              planName: d.planName || "باقة أثر الفاخرة",
              clientNames: d.clientName || effectiveUser.name,
              eventDate: d.eventDate || "قريباً",
              eventVenue: d.eventVenue || "القاهرة، مصر",
              totalAmount: Number(d.totalAmount) || 0,
              currency: "EGP",
              currentStage:
                d.orderStatus === "pending_payment"
                  ? "submitted"
                  : d.orderStatus === "payment_rejected"
                  ? "payment_rejected"
                  : d.orderStatus === "awaiting_client_assets"
                  ? "under_review"
                  : d.orderStatus === "published"
                  ? "delivered"
                  : "in_production",
              paymentMethod: "InstaPay",
              paymentReceiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop",
              rejectionReason: d.adminNotes || "",
            }));

            setOrders((prev) => {
              const merged = [...cloudOrders];
              for (const p of prev) {
                if (!merged.some((m) => m.orderId === p.orderId)) {
                  merged.push(p);
                }
              }
              return merged;
            });
            setActiveOrderId(cloudOrders[0].orderId);
            return;
          }
        }
      } catch (err) {
        console.warn("Using default demo orders:", err);
      }
    }

    loadCloudOrders();
    return () => {
      isMounted = false;
    };
  }, [databases, user, effectiveUser.email]);

  // Read any saved demo client or cached order from localStorage
  useEffect(() => {
    try {
      const savedClient = localStorage.getItem("asar_active_client");
      if (savedClient) {
        const parsed = JSON.parse(savedClient);
        if (parsed.orderId) {
          const matched = orders.find((o) => o.orderId === parsed.orderId);
          if (matched) {
            setActiveOrderId(matched.orderId);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [orders]);

  const activeOrder = orders.find((o) => o.orderId === activeOrderId) || orders[0];

  const handleStageChange = (newStage: OrderStageKey) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === activeOrderId ? { ...o, currentStage: newStage } : o))
    );
  };

  const handleSaveAssets = async (assets: ClientSubmittedAssetsData) => {
    if (assets && activeOrder.currentStage === "submitted") {
      handleStageChange("under_review");
    }

    if (databases && activeOrder?.orderId && !activeOrder.orderId.startsWith("ORD-9")) {
      try {
        await databases.updateDocument(ASAR_DATABASE_ID, ASAR_COLLECTIONS.ORDERS, activeOrder.orderId, {
          clientSubmittedAssetsJson: JSON.stringify(assets),
          orderStatus: "awaiting_client_assets",
        });
      } catch (e) {
        console.warn("Could not sync assets to Appwrite:", e);
      }
    }
  };

  const isAssetsLocked =
    activeOrder.currentStage === "draft" || activeOrder.currentStage === "payment_rejected";

  return (
    <Box minH="100vh" pb={16}>
      {/* Top Navigation Bar */}
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={40}
        bg="rgba(251, 247, 242, 0.94)"
        backdropFilter="blur(16px)"
        borderBottom="1px solid rgba(107, 29, 40, 0.1)"
        py={3.5}
        px={{ base: 4, md: 8 }}
      >
        <Flex
          maxW="1320px"
          mx="auto"
          align="center"
          justify="space-between"
          gap={4}
          wrap="wrap"
        >
          {/* Brand & Client Greeting */}
          <Flex align="center" gap={3}>
            <Button
              onClick={() => {
                if (onBackToHome) onBackToHome();
                navigate("/");
              }}
              className="btn-athar-secondary"
              px={3}
              py={1.5}
              fontSize="0.82rem"
            >
              ← بوابة أثر الرئيسية
            </Button>

            <Box>
              <Flex align="center" gap={2}>
                <Text
                  fontSize="1.15rem"
                  fontWeight="800"
                  color="var(--athar-maroon)"
                  className="font-arabic-display"
                >
                  حساب العميل • أثر
                </Text>
                <Badge className="badge-emerald" fontSize="0.75rem" px={2} py={0.5}>
                  {effectiveUser.name || activeOrder.clientNames}
                </Badge>
              </Flex>
              <Text fontSize="0.75rem" color="var(--athar-text-muted)">
                البريد: {effectiveUser.email || "client@asar.audio"}
              </Text>
            </Box>
          </Flex>

          {/* Order Switcher & Logout */}
          <Flex align="center" gap={3} wrap="wrap">
            <Flex align="center" gap={2} bg="white" px={3} py={1.5} borderRadius="full" border="1px solid var(--athar-gold-border)">
              <Text fontSize="0.8rem" fontWeight="700" color="var(--athar-maroon)">
                الطلب الحالي:
              </Text>
              <select
                value={activeOrderId}
                onChange={(e) => setActiveOrderId(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  color: "var(--athar-text-title)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {orders.map((o) => (
                  <option key={o.orderId} value={o.orderId}>
                    #{o.orderId} — {o.clientNames} ({o.serviceType === "booth" ? "كشك" : "دعوة"})
                  </option>
                ))}
              </select>
            </Flex>

            {onLogout && (
              <Button
                onClick={onLogout}
                variant="ghost"
                fontSize="0.82rem"
                color="var(--athar-text-muted)"
                _hover={{ color: "var(--athar-maroon)" }}
                cursor="pointer"
                bg="transparent"
                border="none"
              >
                تسجيل الخروج
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Main Body Container */}
      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} pt={8}>
        {/* Navigation Tabs Strip */}
        <Box
          className="card-luxury"
          p={2}
          mb={8}
          borderRadius="20px"
          bg="rgba(255, 255, 255, 0.95)"
        >
          <Flex gap={2} wrap="wrap" justify={{ base: "center", md: "flex-start" }}>
            <Button
              borderRadius="full"
              px={5}
              py={2.5}
              fontSize="0.88rem"
              fontWeight="800"
              bg={activeTab === "orders" ? "var(--athar-maroon)" : "transparent"}
              color={activeTab === "orders" ? "white" : "var(--athar-text-title)"}
              border="none"
              cursor="pointer"
              onClick={() => handleSelectTab("orders")}
              boxShadow={activeTab === "orders" ? "0 4px 14px rgba(107, 29, 40, 0.25)" : "none"}
              transition="all 0.2s"
            >
              ⏱️ متابعة الطلب (7 مراحل)
            </Button>

            <Button
              borderRadius="full"
              px={5}
              py={2.5}
              fontSize="0.88rem"
              fontWeight="800"
              bg={activeTab === "assets" ? "var(--athar-maroon)" : "transparent"}
              color={activeTab === "assets" ? "white" : "var(--athar-text-title)"}
              border="none"
              cursor="pointer"
              onClick={() => handleSelectTab("assets")}
              boxShadow={activeTab === "assets" ? "0 4px 14px rgba(107, 29, 40, 0.25)" : "none"}
              transition="all 0.2s"
            >
              📦 تسليم المواد والصور
            </Button>

            <Button
              borderRadius="full"
              px={5}
              py={2.5}
              fontSize="0.88rem"
              fontWeight="800"
              bg={activeTab === "audio" ? "var(--athar-maroon)" : "transparent"}
              color={activeTab === "audio" ? "white" : "var(--athar-text-title)"}
              border="none"
              cursor="pointer"
              onClick={() => handleSelectTab("audio")}
              boxShadow={activeTab === "audio" ? "0 4px 14px rgba(107, 29, 40, 0.25)" : "none"}
              transition="all 0.2s"
            >
              🎧 مراجعة التسجيلات الصوتية
            </Button>

            <Button
              borderRadius="full"
              px={5}
              py={2.5}
              fontSize="0.88rem"
              fontWeight="800"
              bg={activeTab === "qr_hub" ? "var(--athar-maroon)" : "transparent"}
              color={activeTab === "qr_hub" ? "white" : "var(--athar-text-title)"}
              border="none"
              cursor="pointer"
              onClick={() => handleSelectTab("qr_hub")}
              boxShadow={activeTab === "qr_hub" ? "0 4px 14px rgba(107, 29, 40, 0.25)" : "none"}
              transition="all 0.2s"
            >
              🖨️ مركز QR وبطاقات الطاولات
            </Button>

            <Button
              borderRadius="full"
              px={5}
              py={2.5}
              fontSize="0.88rem"
              fontWeight="800"
              bg={activeTab === "mailbox" ? "var(--athar-maroon)" : "transparent"}
              color={activeTab === "mailbox" ? "white" : "var(--athar-text-title)"}
              border="none"
              cursor="pointer"
              onClick={() => handleSelectTab("mailbox")}
              boxShadow={activeTab === "mailbox" ? "0 4px 14px rgba(107, 29, 40, 0.25)" : "none"}
              transition="all 0.2s"
            >
              ✉️ بريد ردود الدعوات (RSVP)
            </Button>
          </Flex>
        </Box>

        {/* Tab 1: Orders Pipeline Tracker */}
        {activeTab === "orders" && (
          <OrderTrackerTimeline
            order={activeOrder}
            onStageChange={handleStageChange}
            onNavigateToTab={(tab) => handleSelectTab(tab)}
          />
        )}

        {/* Tab 2: Raw Assets Manager */}
        {activeTab === "assets" && (
          <RawAssetsManager
            orderId={activeOrder.orderId}
            isLocked={isAssetsLocked}
            onSave={handleSaveAssets}
          />
        )}

        {/* Tab 3: Audio Review Player */}
        {activeTab === "audio" && (
          <AudioReviewPlayer orderId={activeOrder.orderId} />
        )}

        {/* Tab 4: QR Hub & Print Kit */}
        {activeTab === "qr_hub" && (
          <QrHubManager
            orderId={activeOrder.orderId}
            serviceType={activeOrder.serviceType}
            clientNames={activeOrder.clientNames}
            slug={activeOrder.serviceType === "booth" ? "mina-and-maryam" : "omar-and-layla"}
            eventDate={activeOrder.eventDate}
            eventLocation={activeOrder.eventVenue}
          />
        )}

        {/* Tab 5: Client RSVP Mailbox (Integrated from Agent 10) */}
        {activeTab === "mailbox" && (
          <Box className="card-luxury" p={{ base: 4, md: 6 }}>
            <Box mb={4} pb={3} borderBottom="1px solid rgba(107, 29, 40, 0.08)">
              <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                <Box>
                  <Text fontSize="1.3rem" fontWeight="800" color="var(--athar-maroon)" className="font-arabic-display">
                    صندوق بريد ردود الدعوة (Invitation RSVP Mailbox)
                  </Text>
                  <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                    إدارة قائمة ضيوف مناسبتكم ومتابعة سعة القاعة وتأكيد الحضور بضغطة زر
                  </Text>
                </Box>
                <Badge className="badge-gold">مربوط بالـ Realtime & EmailJS</Badge>
              </Flex>
            </Box>

            <ClientRsvpMailbox
              invitationId={activeOrder.serviceType === "invitation" ? "inv-915" : "inv-demo"}
              clientId={activeOrder.orderId}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ClientAccountShell;
