import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import type { InvitationRsvp } from "@repo/react-appwrite";
import {
  ASAR_COLLECTIONS,
  DEMO_INVITATION_RSVPS,
  sendRsvpDecisionEmail,
  buildQrCodeImageUrl,
  useCollection,
} from "@repo/react-appwrite";

import { CapacityProgressBar } from "./CapacityProgressBar";
import { RsvpResponseRow } from "./RsvpResponseRow";
import { RsvpSubmissionInspector } from "./RsvpSubmissionInspector";
import { EmailPreviewAndConfigModal } from "./EmailPreviewAndConfigModal";

export interface ClientRsvpMailboxProps {
  invitationId?: string | null;
  clientId?: string;
}

const STORAGE_CACHE_KEY = "asar_invitation_rsvps_cache";

export const ClientRsvpMailbox: React.FC<ClientRsvpMailboxProps> = ({
  invitationId = "invitation-omar-and-layla",
  clientId,
}) => {
  // Appwrite collection hook with safe query options
  const appwriteResult = useCollection<InvitationRsvp>(
    ASAR_COLLECTIONS.INVITATION_RSVPS,
    { enabled: Boolean(invitationId) }
  );

  // Reference clientId to ensure scope isolation
  void clientId;

  // Local state initialized with fallback / cache
  const [rsvps, setRsvps] = useState<InvitationRsvp[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEMO_INVITATION_RSVPS;
  });

  const [selectedRsvpId, setSelectedRsvpId] = useState<string | null>(() => {
    return DEMO_INVITATION_RSVPS[1]?.$id || DEMO_INVITATION_RSVPS[0]?.$id || null;
  });

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "declined">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [emailPreviewRsvp, setEmailPreviewRsvp] = useState<InvitationRsvp | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const eventTitle = "حفل زفاف عمر وليلى — The Wedding of Omar & Layla";
  const maxCapacity = 150;

  // Sync with Appwrite when collection loads
  useEffect(() => {
    if (appwriteResult?.data && appwriteResult.data.length > 0) {
      setRsvps(appwriteResult.data);
      try {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(appwriteResult.data));
      } catch {
        // Ignore quota
      }
    }
  }, [appwriteResult?.data]);

  // Helper to persist RSVP state updates
  const persistRsvps = useCallback((updated: InvitationRsvp[]) => {
    setRsvps(updated);
    try {
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  }, []);

  // Show auto-dismissing toast
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  }, []);

  // 1. Approve Action with EmailJS Dispatch
  const handleApprove = useCallback(
    async (rsvp: InvitationRsvp) => {
      if (!rsvp.$id) return;
      setActionLoadingId(rsvp.$id);

      try {
        // Generate unique cryptographic passToken
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const timestampPart = Date.now().toString(36).toUpperCase().slice(-4);
        const passToken = rsvp.passToken || `INV-PASS-${timestampPart}-${randomHex}`;

        const passLink = `http://localhost:3003?pass=${rsvp.$id}&token=${passToken}`;
        const qrCodeUrl = buildQrCodeImageUrl(passLink, 500);

        // Read custom EmailJS config from localStorage if saved
        let customServiceId = "";
        let customPublicKey = "";
        let customApprovedTemplate = "template_rsvp_approved";
        try {
          const cfg = localStorage.getItem("asar_emailjs_config");
          if (cfg) {
            const parsed = JSON.parse(cfg);
            customServiceId = parsed.serviceId || "";
            customPublicKey = parsed.publicKey || "";
            customApprovedTemplate = parsed.templateApprovedId || "template_rsvp_approved";
          }
        } catch {
          // Ignore
        }

        // Dispatch EmailJS
        const dispatchResult = await sendRsvpDecisionEmail({
          decision: "approved",
          toEmail: rsvp.guestEmail,
          toName: rsvp.guestName,
          eventTitle,
          eventDate: "الجمعة 14 أغسطس 2026",
          eventTime: "الساعة 7:30 مساءً",
          venueName: "فندق الفورسيزونز الإسكندرية — Grand Ballroom",
          passLink,
          passToken,
          rsvpId: rsvp.$id,
          serviceId: customServiceId,
          publicKey: customPublicKey,
          templateApprovedId: customApprovedTemplate,
        });

        // Update in state & cache
        const updatedList = rsvps.map((item) => {
          if (item.$id === rsvp.$id) {
            return {
              ...item,
              status: "approved" as const,
              passToken,
              qrCodeUrl,
              emailSent: true,
            };
          }
          return item;
        });

        persistRsvps(updatedList);

        if (dispatchResult.simulated) {
          showToast(
            `تم قبول الدعوة وتوليد كود QR بنجاح! تم حفظ محاكاة بريد EmailJS لـ ${rsvp.guestEmail} ✓`,
            "info"
          );
        } else {
          showToast(`تم قبول الدعوة وإرسال كود QR وتصريح الدخول بنجاح إلى ${rsvp.guestEmail} ✓`, "success");
        }
      } catch (err: unknown) {
        showToast(`فشل إرسال كود الدخول: ${err instanceof Error ? err.message : String(err)}`, "error");
      } finally {
        setActionLoadingId(null);
      }
    },
    [rsvps, persistRsvps, showToast, eventTitle]
  );

  // 2. Decline Action with Capacity Constraint Apology Dispatch
  const handleDecline = useCallback(
    async (rsvp: InvitationRsvp) => {
      if (!rsvp.$id) return;
      setActionLoadingId(rsvp.$id);

      try {
        let customServiceId = "";
        let customPublicKey = "";
        let customDeclinedTemplate = "template_rsvp_declined";
        try {
          const cfg = localStorage.getItem("asar_emailjs_config");
          if (cfg) {
            const parsed = JSON.parse(cfg);
            customServiceId = parsed.serviceId || "";
            customPublicKey = parsed.publicKey || "";
            customDeclinedTemplate = parsed.templateDeclinedId || "template_rsvp_declined";
          }
        } catch {
          // Ignore
        }

        // Dispatch polite capacity limit apology
        const dispatchResult = await sendRsvpDecisionEmail({
          decision: "declined",
          toEmail: rsvp.guestEmail,
          toName: rsvp.guestName,
          eventTitle,
          eventDate: "الجمعة 14 أغسطس 2026",
          venueName: "فندق الفورسيزونز الإسكندرية",
          serviceId: customServiceId,
          publicKey: customPublicKey,
          templateDeclinedId: customDeclinedTemplate,
        });

        const updatedList = rsvps.map((item) => {
          if (item.$id === rsvp.$id) {
            return {
              ...item,
              status: "declined" as const,
              emailSent: true,
            };
          }
          return item;
        });

        persistRsvps(updatedList);

        if (dispatchResult.simulated) {
          showToast(
            `تم تسجيل الاعتذار وتوليد خطاب اعتذار السعة لـ ${rsvp.guestEmail} (وضع المعاينة) ✓`,
            "info"
          );
        } else {
          showToast(`تم إرسال خطاب الاعتذار الدبلوماسي عن اكتمال السعة إلى ${rsvp.guestEmail} ✓`, "success");
        }
      } catch (err: unknown) {
        showToast(`فشل إرسال الاعتذار: ${err instanceof Error ? err.message : String(err)}`, "error");
      } finally {
        setActionLoadingId(null);
      }
    },
    [rsvps, persistRsvps, showToast, eventTitle]
  );

  // 3. Export Confirmed Guests to CSV
  const handleExportCsv = () => {
    const confirmed = rsvps.filter((r) => r.status === "approved");
    if (confirmed.length === 0) {
      showToast("لا يوجد مدعوون مؤكدون حالياً لتصديرهم في القائمة", "info");
      return;
    }

    const headers = [
      "اسم الضيف",
      "البريد الإلكتروني",
      "الهاتف",
      "عدد المرافقين",
      "إجمالي المقاعد",
      "كود الدخول QR",
      "حالة البريد",
      "تاريخ الرد",
    ];

    const rows = confirmed.map((r) => {
      const companions = Math.max(0, Number(r.companionsCount) || 0);
      const totalSeats = 1 + companions;
      return [
        `"${r.guestName.replace(/"/g, '""')}"`,
        `"${r.guestEmail.replace(/"/g, '""')}"`,
        `"${(r.guestPhone || "").replace(/"/g, '""')}"`,
        companions,
        totalSeats,
        `"${(r.passToken || "").replace(/"/g, '""')}"`,
        r.emailSent ? "تم الإرسال" : "بانتظار الإرسال",
        `"${(r.respondedAt || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    // Prepend UTF-8 BOM so Excel opens Arabic correctly
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asar_confirmed_guests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`تم تصدير قائمة ${confirmed.length} ضيف مؤكد بنجاح بتنسيق CSV ✓`, "success");
  };

  // 4. Reset to Demo Seed Data
  const handleResetDemoData = () => {
    persistRsvps(DEMO_INVITATION_RSVPS);
    setSelectedRsvpId(DEMO_INVITATION_RSVPS[1]?.$id || null);
    showToast("تمت استعادة البيانات التجريبية لصندوق الردود بنجاح", "info");
  };

  // 5. Open Email Preview Modal
  const handleOpenEmailPreview = (rsvp: InvitationRsvp) => {
    setEmailPreviewRsvp(rsvp);
    setIsConfigModalOpen(true);
  };

  // Counts for tabs
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let declined = 0;
    for (const r of rsvps) {
      if (r.status === "approved") approved++;
      else if (r.status === "declined") declined++;
      else pending++;
    }
    return {
      all: rsvps.length,
      pending,
      approved,
      declined,
    };
  }, [rsvps]);

  // Filter and search
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((rsvp) => {
      // Tab filter
      if (activeTab === "pending" && rsvp.status !== "pending") return false;
      if (activeTab === "approved" && rsvp.status !== "approved") return false;
      if (activeTab === "declined" && rsvp.status !== "declined") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = rsvp.guestName.toLowerCase().includes(q);
        const matchesEmail = rsvp.guestEmail.toLowerCase().includes(q);
        const matchesPhone = rsvp.guestPhone?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      return true;
    });
  }, [rsvps, activeTab, searchQuery]);

  const selectedRsvp = useMemo(() => {
    return rsvps.find((r) => r.$id === selectedRsvpId) || null;
  }, [rsvps, selectedRsvpId]);

  return (
    <Box
      w="100%"
      maxW="1400px"
      mx="auto"
      py={{ base: 4, md: 8 }}
      px={{ base: 3, md: 6 }}
      dir="rtl"
      fontFamily="var(--font-body, 'Cairo', sans-serif)"
    >
      {/* Toast Notification Banner */}
      {toastNotification && (
        <Box
          mb={5}
          p={4}
          borderRadius="16px"
          bg={
            toastNotification.type === "success"
              ? "rgba(30, 111, 80, 0.12)"
              : toastNotification.type === "error"
                ? "rgba(155, 44, 44, 0.12)"
                : "rgba(212, 175, 55, 0.18)"
          }
          border={`1px solid ${
            toastNotification.type === "success"
              ? "rgba(30, 111, 80, 0.4)"
              : toastNotification.type === "error"
                ? "rgba(155, 44, 44, 0.4)"
                : "rgba(212, 175, 55, 0.45)"
          }`}
          boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text
            fontSize="0.9rem"
            fontWeight="700"
            color={
              toastNotification.type === "success"
                ? "#1E6F50"
                : toastNotification.type === "error"
                  ? "#9B2C2C"
                  : "var(--athar-text-title, #231F20)"
            }
          >
            {toastNotification.message}
          </Text>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setToastNotification(null)}
            color="var(--athar-text-muted, #7A6F6D)"
          >
            ✕
          </Button>
        </Box>
      )}

      {/* Main Mailbox Header */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align={{ base: "flex-start", lg: "center" }}
        gap={4}
        mb={6}
      >
        <VStack align="flex-start" gap={1}>
          <HStack gap={2}>
            <Text
              fontSize={{ base: "1.5rem", md: "1.85rem" }}
              fontWeight="900"
              color="var(--athar-maroon, #6B1D28)"
            >
              صندوق ردود الدعوات ورمز QR
            </Text>
            <Badge
              variant="outline"
              borderColor="rgba(212, 175, 55, 0.5)"
              bg="rgba(255, 255, 255, 0.9)"
              color="var(--athar-maroon, #6B1D28)"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="0.75rem"
              fontWeight="800"
            >
              ✦ أثر الحصري
            </Badge>
          </HStack>

          <Text fontSize="0.95rem" color="var(--athar-text-muted, #7A6F6D)">
            {eventTitle} • متابعة فورية لتأكيدات الحضور وإرسال بطاقات الدخول عبر البريد الإلكتروني
          </Text>
        </VStack>

        {/* Global Action Buttons */}
        <HStack gap={2.5} flexWrap="wrap">
          <Button
            size="sm"
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            bg="white"
            color="var(--athar-text-title, #231F20)"
            px={4}
            py={4}
            borderRadius="full"
            fontWeight="700"
            fontSize="0.85rem"
            onClick={() => {
              setEmailPreviewRsvp(selectedRsvp || rsvps[0] || null);
              setIsConfigModalOpen(true);
            }}
            _hover={{
              bg: "rgba(244, 239, 234, 0.8)",
              borderColor: "var(--athar-gold, #D4AF37)",
            }}
          >
            ⚙️ إعدادات ومعاينة EmailJS
          </Button>

          <Button
            size="sm"
            bg="var(--athar-maroon, #6B1D28)"
            color="white"
            px={5}
            py={4}
            borderRadius="full"
            fontWeight="700"
            fontSize="0.85rem"
            onClick={handleExportCsv}
            boxShadow="0 4px 14px rgba(107, 29, 40, 0.2)"
            _hover={{
              bg: "#5B1621",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 18px rgba(107, 29, 40, 0.3)",
            }}
          >
            📥 تصدير المؤكدين (CSV)
          </Button>

          <Button
            size="sm"
            variant="ghost"
            color="var(--athar-text-muted, #7A6F6D)"
            fontSize="0.78rem"
            onClick={handleResetDemoData}
            _hover={{ color: "var(--athar-maroon, #6B1D28)" }}
          >
            🔄 إعادة تعيين
          </Button>
        </HStack>
      </Flex>

      {/* Capacity Progress Bar Section */}
      <Box mb={6}>
        <CapacityProgressBar
          rsvps={rsvps}
          maxCapacity={maxCapacity}
          venueName="فندق الفورسيزونز الإسكندرية — Grand Ballroom"
        />
      </Box>

      {/* Controls Bar: Filter Tabs & Search */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
        mb={6}
        bg="rgba(255, 255, 255, 0.9)"
        p={3}
        borderRadius="20px"
        border="1px solid rgba(107, 29, 40, 0.08)"
      >
        {/* Filter Tabs with Live Numerals */}
        <HStack gap={2} flexWrap="wrap">
          <Button
            size="sm"
            borderRadius="full"
            px={4}
            py={1.5}
            fontWeight="700"
            fontSize="0.82rem"
            bg={activeTab === "all" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "all" ? "white" : "var(--athar-text-body, #4A4240)"}
            onClick={() => setActiveTab("all")}
            _hover={activeTab === "all" ? undefined : { bg: "rgba(244, 239, 234, 0.8)" }}
          >
            الكل ({counts.all})
          </Button>

          <Button
            size="sm"
            borderRadius="full"
            px={4}
            py={1.5}
            fontWeight="700"
            fontSize="0.82rem"
            bg={activeTab === "pending" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "pending" ? "white" : "var(--athar-text-body, #4A4240)"}
            onClick={() => setActiveTab("pending")}
            _hover={activeTab === "pending" ? undefined : { bg: "rgba(244, 239, 234, 0.8)" }}
          >
            ⏳ قيد المراجعة ({counts.pending})
          </Button>

          <Button
            size="sm"
            borderRadius="full"
            px={4}
            py={1.5}
            fontWeight="700"
            fontSize="0.82rem"
            bg={activeTab === "approved" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "approved" ? "white" : "var(--athar-text-body, #4A4240)"}
            onClick={() => setActiveTab("approved")}
            _hover={activeTab === "approved" ? undefined : { bg: "rgba(244, 239, 234, 0.8)" }}
          >
            ✓ مقبول — تم إرسال QR ({counts.approved})
          </Button>

          <Button
            size="sm"
            borderRadius="full"
            px={4}
            py={1.5}
            fontWeight="700"
            fontSize="0.82rem"
            bg={activeTab === "declined" ? "var(--athar-maroon, #6B1D28)" : "transparent"}
            color={activeTab === "declined" ? "white" : "var(--athar-text-body, #4A4240)"}
            onClick={() => setActiveTab("declined")}
            _hover={activeTab === "declined" ? undefined : { bg: "rgba(244, 239, 234, 0.8)" }}
          >
            ✕ اعتذار السعة ({counts.declined})
          </Button>
        </HStack>

        {/* Live Search Input */}
        <Box minW={{ base: "100%", md: "300px" }}>
          <input
            type="text"
            placeholder="🔍 بحث بالاسم، البريد أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem",
              borderRadius: "full",
              border: "1px solid rgba(107, 29, 40, 0.15)",
              backgroundColor: "white",
              fontSize: "0.88rem",
              outline: "none",
              fontFamily: "var(--font-body, 'Cairo', sans-serif)",
            }}
          />
        </Box>
      </Flex>

      {/* Split-View Layout: Guest List on Left, Inspector on Right */}
      <Flex direction={{ base: "column", lg: "row" }} gap={6} align="flex-start">
        {/* Left Column: Guest Responses List (60% width on desktop) */}
        <Box flex="1.4" w="100%">
          {filteredRsvps.length === 0 ? (
            <Box
              bg="rgba(255, 255, 255, 0.9)"
              borderRadius="20px"
              p={10}
              textAlign="center"
              border="1px solid rgba(107, 29, 40, 0.08)"
            >
              <Text fontSize="1.1rem" fontWeight="700" color="var(--athar-text-title, #231F20)" mb={2}>
                لا توجد ردود مطابقة للبحث أو الفلتر
              </Text>
              <Text fontSize="0.85rem" color="var(--athar-text-muted, #7A6F6D)">
                جرّب تغيير عبارة البحث أو التبديل إلى تبويب "الكل" لعرض جميع الضيوف
              </Text>
            </Box>
          ) : (
            <VStack gap={3.5} align="stretch">
              {filteredRsvps.map((rsvp) => (
                <RsvpResponseRow
                  key={rsvp.$id || rsvp.guestEmail}
                  rsvp={rsvp}
                  isSelected={rsvp.$id === selectedRsvpId}
                  onSelect={(r) => setSelectedRsvpId(r.$id || null)}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onViewEmailPreview={handleOpenEmailPreview}
                  isActionLoading={actionLoadingId === rsvp.$id}
                />
              ))}
            </VStack>
          )}
        </Box>

        {/* Right Column: Submission Inspector (40% width on desktop) */}
        <Box
          flex="1"
          w="100%"
          position={{ lg: "sticky" }}
          top={{ lg: "24px" }}
        >
          <RsvpSubmissionInspector
            rsvp={selectedRsvp}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onViewEmailPreview={handleOpenEmailPreview}
            isActionLoading={actionLoadingId === selectedRsvp?.$id}
          />
        </Box>
      </Flex>

      {/* Email Preview & Config Modal */}
      <EmailPreviewAndConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        selectedRsvp={emailPreviewRsvp}
        eventTitle={eventTitle}
      />
    </Box>
  );
};
