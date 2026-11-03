import React, { useState, useEffect } from "react";
import { Box, Text, Button } from "@chakra-ui/react";
import { AdminShell, type AdminTab } from "./components/layout/AdminShell";
import { AdminOverview, type AsarOrder } from "./components/dashboard/AdminOverview";
import { PlanBuilderStudio, DEFAULT_INITIAL_PLANS, type AsarPlan } from "./components/plans/PlanBuilderStudio";
import { OrdersQueueManager } from "./components/orders/OrdersQueueManager";
import type { AsarPayment } from "./components/orders/PaymentReceiptInspector";

declare global {
  const process: {
    env: Record<string, string | undefined>;
  };
}

// Cross-Agent Integration Contracts (Agent 05 & Agent 06)
import { BoothMemoryStudio as ImportedBoothMemoryStudio } from "./components/booth-studio";
import { InvitationStudio as ImportedInvitationStudio } from "./components/invitation-studio";

// Fallback wrappers to guarantee resilience if studios are still compiling
const FallbackBoothStudio: React.FC<{ orderId?: string | null; onBack?: () => void }> = ({
  orderId,
  onBack,
}) => (
  <Box p={8} textAlign="center" className="athar-card" bg="#ffffff">
    <Text fontSize="2rem" mb={2}>🎙️</Text>
    <Text fontSize="1.5rem" color="var(--athar-maroon)" fontWeight="800" mb={2} fontFamily="var(--font-arabic-display)">
      أستوديو هاتف أثر (Booth Memory Studio)
    </Text>
    <Text fontSize="0.95rem" color="var(--athar-text-muted)" mb={6}>
      الطلب المحدد للتحرير: <strong>{orderId || "لم يتم تحديد طلب"}</strong>
    </Text>
    <Button onClick={onBack} className="btn-athar-secondary">
      ← العودة لطابور الطلبات (Back to Orders)
    </Button>
  </Box>
);

const FallbackInvitationStudio: React.FC<{ orderId?: string | null; onBack?: () => void }> = ({
  orderId,
  onBack,
}) => (
  <Box p={8} textAlign="center" className="athar-card" bg="#ffffff">
    <Text fontSize="2rem" mb={2}>✉️</Text>
    <Text fontSize="1.5rem" color="#8C6F12" fontWeight="800" mb={2} fontFamily="var(--font-arabic-display)">
      أستوديو تصميم الدعوات الرقمية (Invitation Studio)
    </Text>
    <Text fontSize="0.95rem" color="var(--athar-text-muted)" mb={6}>
      الطلب المحدد للتحرير: <strong>{orderId || "لم يتم تحديد طلب"}</strong>
    </Text>
    <Button onClick={onBack} className="btn-athar-secondary">
      ← العودة لطابور الطلبات (Back to Orders)
    </Button>
  </Box>
);

const BoothMemoryStudio: React.FC<{ orderId?: string | null; onBack?: () => void }> =
  typeof ImportedBoothMemoryStudio !== "undefined" ? ImportedBoothMemoryStudio : FallbackBoothStudio;

const InvitationStudio: React.FC<{ orderId?: string | null; onBack?: () => void }> =
  typeof ImportedInvitationStudio !== "undefined" ? ImportedInvitationStudio : FallbackInvitationStudio;

const ORDERS_STORAGE_KEY = "asar_synced_orders";
const PAYMENTS_STORAGE_KEY = "asar_synced_payments";

const DEFAULT_INITIAL_ORDERS: AsarOrder[] = [
  {
    $id: "ORD-8821",
    clientId: "usr-mina-maryam",
    clientName: "Mina & Maryam",
    partnerOrOrgName: "حفل زفاف مينا ومريم",
    clientEmail: "mina.maryam@wedding.example.com",
    clientPhone: "+20 100 248 9912",
    serviceType: "booth",
    planId: "plan-booth-royal-vip",
    planName: "ميراث ملكي — Royal Heritage",
    totalAmount: 8500,
    orderStatus: "pending_payment",
    eventDate: "12 July 2026",
    eventVenue: "Four Seasons San Stefano, Alexandria",
    clientSubmittedAssetsJson: JSON.stringify({
      heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      coupleTitle: "Mina & Maryam",
      eventHeaderTag: "THE WEDDING OF",
      eventDateDisplay: "12 July 2026",
      eventLocationDisplay: "Alexandria, Egypt",
      coupleQuote: "Every voice here is a piece of our forever...",
      categories: ["Family", "Friends", "Colleagues", "Special Guests"],
      thankYouMessage: "Thank you for sharing our joy and leaving your voices in our Athar vault.",
    }),
    createdAt: "2026-07-01T10:15:00Z",
  },
  {
    $id: "ORD-8823",
    clientId: "usr-sherif-hania",
    clientName: "Sherif & Hania",
    partnerOrOrgName: "احتفال زفاف شريف وهانيا",
    clientEmail: "sherif.hania@example.com",
    clientPhone: "+20 111 872 3410",
    serviceType: "booth",
    planId: "plan-booth-classic",
    planName: "لحظة أثر — Athar Moment",
    totalAmount: 4500,
    orderStatus: "payment_rejected",
    adminNotes: "صورة الإيصال غير واضحة / البيانات مطموسة",
    eventDate: "10 October 2026",
    eventVenue: "Marriott Mena House, Cairo",
    createdAt: "2026-07-02T14:30:00Z",
  },
  {
    $id: "ORD-8819",
    clientId: "usr-omar-layla",
    clientName: "Omar & Layla",
    partnerOrOrgName: "عقد قران عمر وليلى",
    clientEmail: "omar.layla@example.com",
    clientPhone: "+20 122 345 6789",
    serviceType: "invitation",
    planId: "plan-invitation-prestige",
    planName: "دعوة الأثر الفاخرة — Prestige Invitation",
    totalAmount: 3200,
    orderStatus: "awaiting_client_assets",
    eventDate: "28 August 2026",
    eventVenue: "Lake House Club, New Cairo",
    clientSubmittedAssetsJson: JSON.stringify({
      heroImageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      coupleTitle: "Omar & Layla",
      eventHeaderTag: "JOIN OUR CELEBRATION",
      eventDateDisplay: "28 August 2026",
      eventLocationDisplay: "New Cairo, Egypt",
      coupleQuote: "معاً نبدأ فصلاً جديداً من المحبة...",
      requestedRsvpFields: ["Full Name", "Email Address", "WhatsApp Phone", "Companions Count", "Dietary Note"],
    }),
    createdAt: "2026-06-25T09:00:00Z",
  },
  {
    $id: "ORD-8815",
    clientId: "usr-youssef-nour",
    clientName: "Youssef & Nour",
    partnerOrOrgName: "زفاف يوسف ونور",
    clientEmail: "youssef.nour@example.com",
    clientPhone: "+20 102 998 1123",
    serviceType: "booth",
    planId: "plan-booth-royal-vip",
    planName: "ميراث ملكي — Royal Heritage",
    totalAmount: 8500,
    orderStatus: "audio_mastering",
    eventDate: "15 September 2026",
    eventVenue: "Mena House, Giza",
    createdAt: "2026-06-20T11:20:00Z",
  },
  {
    $id: "ORD-8810",
    clientId: "usr-tarek-farida",
    clientName: "Tarek & Farida",
    partnerOrOrgName: "خطوبة طارق وفريدة",
    clientEmail: "tarek.farida@example.com",
    clientPhone: "+20 114 556 7890",
    serviceType: "booth",
    planId: "plan-booth-classic",
    planName: "لحظة أثر — Athar Moment",
    totalAmount: 4500,
    orderStatus: "published",
    eventDate: "1 June 2026",
    eventVenue: "El Gouna Yacht Club, Red Sea",
    createdAt: "2026-05-15T16:00:00Z",
  },
  {
    $id: "ORD-8804",
    clientId: "usr-karim-salma",
    clientName: "Karim & Salma",
    partnerOrOrgName: "زفاف كريم وسلمى",
    clientEmail: "karim.salma@example.com",
    clientPhone: "+20 101 223 3445",
    serviceType: "invitation",
    planId: "plan-invitation-prestige",
    planName: "دعوة الأثر الفاخرة — Prestige Invitation",
    totalAmount: 3200,
    orderStatus: "published",
    eventDate: "20 May 2026",
    eventVenue: "Royal Maxim Palace Kempinski, Cairo",
    createdAt: "2026-05-10T12:00:00Z",
  },
];

const DEFAULT_INITIAL_PAYMENTS: AsarPayment[] = [
  {
    $id: "pay-ORD-8821",
    orderId: "ORD-8821",
    clientId: "usr-mina-maryam",
    amount: 2500,
    paymentMethod: "instapay",
    screenshotUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    status: "pending",
    submittedAt: "اليوم 11:42 ص",
  },
  {
    $id: "pay-ORD-8823",
    orderId: "ORD-8823",
    clientId: "usr-sherif-hania",
    amount: 1500,
    paymentMethod: "vodafone_cash",
    screenshotUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=1200&q=80",
    status: "rejected",
    rejectionReason: "صورة الإيصال غير واضحة / البيانات مطموسة",
    submittedAt: "أمس 04:15 م",
  },
  {
    $id: "pay-ORD-8819",
    orderId: "ORD-8819",
    clientId: "usr-omar-layla",
    amount: 1000,
    paymentMethod: "instapay",
    screenshotUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    status: "approved",
    submittedAt: "25 يونيو 2026",
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Synchronized persistent state for Orders
  const [orders, setOrders] = useState<AsarOrder[]>(() => {
    try {
      const cached = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_INITIAL_ORDERS;
  });

  // Synchronized persistent state for Payments
  const [payments, setPayments] = useState<AsarPayment[]>(() => {
    try {
      const cached = localStorage.getItem(PAYMENTS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_INITIAL_PAYMENTS;
  });

  // Plans state
  const [plans, setPlans] = useState<AsarPlan[]>(DEFAULT_INITIAL_PLANS);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn("Could not cache orders", e);
    }
  }, [orders]);

  // Sync payments to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
    } catch (e) {
      console.warn("Could not cache payments", e);
    }
  }, [payments]);

  // Pending payments count
  const pendingPaymentsCount = orders.filter((o) => o.orderStatus === "pending_payment").length;

  const handleOpenStudio = (orderId: string, serviceType: "booth" | "invitation") => {
    setSelectedOrderId(orderId);
    if (serviceType === "booth") {
      setActiveTab("booth-studio");
    } else {
      setActiveTab("invitation-studio");
    }
  };

  return (
    <AdminShell
      activeTab={activeTab}
      onSelectTab={(tab) => {
        setActiveTab(tab);
      }}
      pendingPaymentsCount={pendingPaymentsCount}
    >
      {/* 1. Overview Tab */}
      {activeTab === "overview" && (
        <AdminOverview
          orders={orders}
          plansCount={plans.length}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onSelectOrderForStudio={handleOpenStudio}
        />
      )}

      {/* 2. Plans & Limits Tab */}
      {activeTab === "plans" && (
        <PlanBuilderStudio
          onPlansUpdated={(updated) => setPlans(updated)}
        />
      )}

      {/* 3. Orders & Payments Tab */}
      {activeTab === "orders" && (
        <OrdersQueueManager
          orders={orders}
          payments={payments}
          onOrdersUpdated={(updated) => setOrders(updated)}
          onPaymentsUpdated={(updated) => setPayments(updated)}
          onOpenStudio={handleOpenStudio}
        />
      )}

      {/* 4. Booth Memory Studio (Agent 05 Integration) */}
      {activeTab === "booth-studio" && (
        <BoothMemoryStudio
          orderId={selectedOrderId}
          onBack={() => setActiveTab("orders")}
        />
      )}

      {/* 5. Invitation Studio (Agent 06 Integration) */}
      {activeTab === "invitation-studio" && (
        <InvitationStudio
          orderId={selectedOrderId}
          onBack={() => setActiveTab("orders")}
        />
      )}
    </AdminShell>
  );
};

export default App;
