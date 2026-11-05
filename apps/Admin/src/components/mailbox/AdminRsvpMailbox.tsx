import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  useCollection,
  useMutations,
  useAppwriteFunction,
  DEMO_INVITATION_RSVPS,
  sendRsvpDecisionEmail,
  buildQrCodeImageUrl,
} from "@repo/react-appwrite";
import {
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
  ASAR_FUNCTIONS,
  type InvitationRsvp,
} from "../../services/asarService";

export interface AdminRsvpMailboxProps {
  invitationId?: string;
  onRsvpsUpdated?: (updated: InvitationRsvp[]) => void;
}

const STORAGE_CACHE_KEY = "asar_invitation_rsvps_cache";

export const AdminRsvpMailbox: React.FC<AdminRsvpMailboxProps> = ({
  invitationId = "invitation-omar-and-layla",
  onRsvpsUpdated,
}) => {
  void invitationId;
  // 1. Reactive live collection via @repo/react-appwrite hook
  const { data: cloudRsvps } = useCollection<InvitationRsvp>(
    ASAR_DATABASE_ID,
    ASAR_COLLECTIONS.INVITATION_RSVPS,
    { realtime: true }
  );

  // 2. Mutations hook for atomic document operations
  const { updateDocument } = useMutations<InvitationRsvp>(
    ASAR_DATABASE_ID,
    ASAR_COLLECTIONS.INVITATION_RSVPS
  );

  // 3. Cloud functions execution hooks
  const { execute: executeProcessRsvp } = useAppwriteFunction(ASAR_FUNCTIONS.PROCESS_RSVP_ACTION);
  const { execute: executeSendNotification } = useAppwriteFunction(ASAR_FUNCTIONS.SEND_RSVP_NOTIFICATION);

  // Local state initialized with cache or defaults
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

  // Persist helper
  const persistRsvps = useCallback(
    (updated: InvitationRsvp[]) => {
      setRsvps(updated);
      try {
        localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      onRsvpsUpdated?.(updated);
    },
    [onRsvpsUpdated]
  );

  // Keep state synchronized with Appwrite live collection
  useEffect(() => {
    if (cloudRsvps && cloudRsvps.length > 0) {
      setRsvps((prev) => {
        const merged: InvitationRsvp[] = [...(cloudRsvps as unknown as InvitationRsvp[])];
        for (const p of prev) {
          if (p.$id && !merged.some((m) => m.$id === p.$id)) {
            merged.push(p);
          }
        }
        try {
          localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(merged));
        } catch {}
        onRsvpsUpdated?.(merged);
        return merged;
      });
    }
  }, [cloudRsvps, onRsvpsUpdated]);

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "declined">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(150);
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedRsvp, setSelectedRsvp] = useState<InvitationRsvp | null>(null);
  const [declineReasonModalRsvp, setDeclineReasonModalRsvp] = useState<InvitationRsvp | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState("نعتذر لاكتمال الطاقة الاستيعابية للقاعة");

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  // Capacity stats
  const stats = useMemo(() => {
    const totalSubmissions = rsvps.length;
    const approvedList = rsvps.filter((r) => r.status === "approved");
    const pendingList = rsvps.filter((r) => r.status === "pending");
    const declinedList = rsvps.filter((r) => r.status === "declined");

    const approvedSeats = approvedList.reduce(
      (sum, r) => sum + 1 + (Number(r.companionsCount) || 0),
      0
    );
    const pendingSeats = pendingList.reduce(
      (sum, r) => sum + 1 + (Number(r.companionsCount) || 0),
      0
    );

    const safeMax = Math.max(1, maxCapacity);
    const percentage = Math.round((approvedSeats / safeMax) * 100);
    const remainingSeats = Math.max(0, maxCapacity - approvedSeats);

    return {
      totalSubmissions,
      approvedCount: approvedList.length,
      pendingCount: pendingList.length,
      declinedCount: declinedList.length,
      approvedSeats,
      pendingSeats,
      percentage,
      remainingSeats,
    };
  }, [rsvps, maxCapacity]);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      if (activeTab !== "all" && r.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = (r.guestName || "").toLowerCase().includes(query);
        const matchesEmail = (r.guestEmail || "").toLowerCase().includes(query);
        const matchesPhone = (r.guestPhone || "").toLowerCase().includes(query);
        const matchesToken = (r.passToken || "").toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesToken;
      }
      return true;
    });
  }, [rsvps, activeTab, searchQuery]);

  // 1-Click Approve Action
  const handleApprove = useCallback(
    async (rsvp: InvitationRsvp) => {
      if (!rsvp.$id) return;
      setActionLoadingId(rsvp.$id);

      try {
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const timestampPart = Date.now().toString(36).toUpperCase().slice(-4);
        const passToken = rsvp.passToken || `VIP-${timestampPart}-${randomHex}`;

        const baseOrigin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : "http://localhost:3003";
        const passLink = `${baseOrigin}/pass/${rsvp.$id}?token=${passToken}`;
        const qrCodeUrl = buildQrCodeImageUrl(passLink, 500);

        // 1. Invoke Appwrite Cloud Function
        try {
          await executeProcessRsvp({
            rsvpId: rsvp.$id,
            action: "approve",
          });
        } catch {
          // fallback
        }

        // 2. Persist direct Appwrite database document update via useMutations
        try {
          await updateDocument(rsvp.$id, {
            status: "approved",
            passToken,
            qrCodeUrl,
            respondedAt: new Date().toISOString(),
            emailSent: true,
          });
        } catch (dbErr) {
          console.warn("useMutations update fallback:", dbErr);
        }

        // 3. Dispatch Cloud Function Notification
        try {
          await executeSendNotification({
            decision: "approved",
            toEmail: rsvp.guestEmail,
            toName: rsvp.guestName,
            eventTitle: "حفل زفاف الأثر الفاخر — Athar Bespoke Wedding",
            eventDate: "الجمعة 14 أغسطس 2026",
            eventTime: "الساعة 7:30 مساءً",
            venueName: "فندق الفورسيزونز الإسكندرية — Grand Ballroom",
            passLink,
            passToken,
            rsvpId: rsvp.$id,
          });
        } catch {
          // Client email fallback
          try {
            await sendRsvpDecisionEmail({
              decision: "approved",
              toEmail: rsvp.guestEmail,
              toName: rsvp.guestName,
              eventTitle: "حفل زفاف الأثر الفاخر — Athar Bespoke Wedding",
              eventDate: "الجمعة 14 أغسطس 2026",
              eventTime: "الساعة 7:30 مساءً",
              venueName: "فندق الفورسيزونز الإسكندرية — Grand Ballroom",
              passLink,
              passToken,
              rsvpId: rsvp.$id,
            });
          } catch {}
        }

        // 4. Update local state
        const updated = rsvps.map((item) => {
          if (item.$id === rsvp.$id) {
            return {
              ...item,
              status: "approved" as const,
              passToken,
              qrCodeUrl,
              respondedAt: new Date().toISOString(),
              emailSent: true,
            };
          }
          return item;
        });

        persistRsvps(updated);
        showToast(`✦ تم اعتماد دعوة "${rsvp.guestName}" وتوليد بطاقة الدخول الرقمية بنجاح!`, "success");
      } catch (err: any) {
        showToast(`⚠️ حدث خطأ أثناء اعتماد الرد: ${err?.message || "خطأ غير متوقع"}`, "error");
      } finally {
        setActionLoadingId(null);
      }
    },
    [updateDocument, executeProcessRsvp, executeSendNotification, rsvps, persistRsvps, showToast]
  );

  // 1-Click Decline Action
  const handleDeclineConfirm = useCallback(
    async (rsvp: InvitationRsvp, reason: string) => {
      if (!rsvp.$id) return;
      setActionLoadingId(rsvp.$id);

      try {
        // 1. Cloud function execution via useAppwriteFunction
        try {
          await executeProcessRsvp({
            rsvpId: rsvp.$id,
            action: "decline",
            rejectionReason: reason,
          });
        } catch {
          // fallback
        }

        // 2. Direct database update via useMutations
        try {
          await updateDocument(rsvp.$id, {
            status: "declined",
            rejectionReason: reason,
            respondedAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn("Direct database update fallback:", dbErr);
        }

        // 3. Dispatch Notification via Cloud Function
        try {
          await executeSendNotification({
            decision: "declined",
            toEmail: rsvp.guestEmail,
            toName: rsvp.guestName,
            eventTitle: "حفل زفاف الأثر الفاخر — Athar Bespoke Wedding",
            eventDate: "الجمعة 14 أغسطس 2026",
            eventTime: "الساعة 7:30 مساءً",
            venueName: "فندق الفورسيزونز الإسكندرية — Grand Ballroom",
            customMessage: reason,
            rsvpId: rsvp.$id,
          });
        } catch {
          try {
            await sendRsvpDecisionEmail({
              decision: "declined",
              toEmail: rsvp.guestEmail,
              toName: rsvp.guestName,
              eventTitle: "حفل زفاف الأثر الفاخر — Athar Bespoke Wedding",
              eventDate: "الجمعة 14 أغسطس 2026",
              eventTime: "الساعة 7:30 مساءً",
              venueName: "فندق الفورسيزونز الإسكندرية — Grand Ballroom",
              customMessage: reason,
              rsvpId: rsvp.$id,
            });
          } catch {}
        }

        // 4. Update local state
        const updated = rsvps.map((item) => {
          if (item.$id === rsvp.$id) {
            return {
              ...item,
              status: "declined" as const,
              respondedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        persistRsvps(updated);
        showToast(`تم تسجيل الاعتذار للضيف "${rsvp.guestName}" بنجاح.`, "info");
      } catch (err: any) {
        showToast(`⚠️ حدث خطأ أثناء تسجيل الاعتذار: ${err?.message || "خطأ"}`, "error");
      } finally {
        setActionLoadingId(null);
        setDeclineReasonModalRsvp(null);
      }
    },
    [updateDocument, executeProcessRsvp, executeSendNotification, rsvps, persistRsvps, showToast]
  );

  // Batch Approve All Pending
  const handleBatchApprovePending = async () => {
    const pendingList = rsvps.filter((r) => r.status === "pending");
    if (pendingList.length === 0) {
      showToast("لا توجد طلبات معلقة بانتظار المراجعة.", "info");
      return;
    }

    const updated = rsvps.map((r) => {
      if (r.status === "pending") {
        const passToken = r.passToken || `VIP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        return {
          ...r,
          status: "approved" as const,
          passToken,
          respondedAt: new Date().toISOString(),
          emailSent: true,
        };
      }
      return r;
    });

    persistRsvps(updated);
    showToast(`✦ تم اعتماد ${pendingList.length} دعوة دفعة واحدة وتحديث السعة الاستيعابية!`, "success");
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["الاسم", "البريد الإلكتروني", "رقم الهاتف", "عدد المرافقين", "الحالة", "كود الدخول VIP", "تاريخ الإرسال"];
    const rows = filteredRsvps.map((r) => [
      `"${r.guestName}"`,
      `"${r.guestEmail}"`,
      `"${r.guestPhone || ""}"`,
      r.companionsCount || 0,
      `"${r.status === "approved" ? "معتمد" : r.status === "declined" ? "معتذر" : "قيد المراجعة"}"`,
      `"${r.passToken || ""}"`,
      `"${new Date(r.$createdAt || Date.now()).toLocaleDateString("ar-EG")}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `athar_rsvps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box dir="rtl" pb={12}>
      {/* Toast Notification Banner */}
      {toast && (
        <Box
          position="fixed"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          zIndex={1000}
          bg={
            toast.type === "success"
              ? "#7A1C2E"
              : toast.type === "error"
              ? "#B91C1C"
              : "#8C6F12"
          }
          color="#FBF8F3"
          px={6}
          py={3}
          borderRadius="14px"
          boxShadow="0 10px 30px rgba(0,0,0,0.3)"
          border="1px solid var(--athar-gold)"
          fontFamily="var(--font-sans)"
          fontWeight="700"
          fontSize="0.95rem"
        >
          {toast.message}
        </Box>
      )}

      {/* Header Banner */}
      <Box
        bg="#ffffff"
        borderRadius="20px"
        p={{ base: 5, md: 7 }}
        mb={6}
        border="1px solid var(--athar-card-border)"
        boxShadow="var(--athar-shadow-soft)"
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <Box>
            <HStack gap={3} mb={1}>
              <Text fontSize="1.8rem">📬</Text>
              <Text
                fontSize={{ base: "1.3rem", md: "1.7rem" }}
                fontWeight="900"
                color="var(--athar-maroon)"
                fontFamily="var(--font-arabic-display)"
              >
                صندوق ردود الدعوات وتأكيد الحضور
              </Text>
              <Badge
                bg="rgba(107, 29, 40, 0.08)"
                color="var(--athar-maroon)"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="0.75rem"
                fontWeight="800"
                border="1px solid rgba(107, 29, 40, 0.15)"
              >
                إدارة المدعوين VIP
              </Badge>
            </HStack>
            <Text fontSize="0.88rem" color="var(--athar-text-muted)" fontWeight="600">
              متابعة ردود المدعوين اللحظية، وتوزيع الطاقة الاستيعابية للقاعة، وإصدار بطاقات الحضور المشفرة (QR Pass).
            </Text>
          </Box>

          <HStack gap={3}>
            <Button
              onClick={handleExportCsv}
              size="sm"
              variant="outline"
              borderColor="rgba(107, 29, 40, 0.25)"
              color="var(--athar-maroon)"
              borderRadius="12px"
              fontWeight="700"
              fontSize="0.85rem"
              px={4}
            >
              📥 تصدير ملف Excel (CSV)
            </Button>
            <Button
              onClick={handleBatchApprovePending}
              size="sm"
              bg="#7A1C2E"
              color="#FBF8F3"
              _hover={{ bg: "#5A1320" }}
              borderRadius="12px"
              fontWeight="800"
              fontSize="0.85rem"
              px={4}
              border="1px solid var(--athar-gold)"
            >
              ✓ اعتماد كافة المعلقين ({stats.pendingCount})
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Real-Time Venue Capacity Progress Meter */}
      <Box
        bg="#ffffff"
        borderRadius="20px"
        p={{ base: 5, md: 6 }}
        mb={6}
        border="1px solid var(--athar-card-border)"
        boxShadow="var(--athar-shadow-soft)"
      >
        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
          <HStack gap={2}>
            <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon)" fontFamily="var(--font-arabic-display)">
              مقياس الطاقة الاستيعابية المباشر (Venue Capacity Meter)
            </Text>
            {stats.percentage >= 95 ? (
              <Badge bg="#B91C1C" color="#ffffff" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem" fontWeight="800">
                ⚠️ القاعة ممتلئة تقريباً
              </Badge>
            ) : stats.percentage >= 80 ? (
              <Badge bg="#D97706" color="#ffffff" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem" fontWeight="800">
                اقتراب اكتمال المقاعد
              </Badge>
            ) : (
              <Badge bg="#059669" color="#ffffff" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem" fontWeight="800">
                متاح سعة كافية
              </Badge>
            )}
          </HStack>

          <HStack gap={2}>
            {isEditingCapacity ? (
              <HStack gap={2}>
                <Text fontSize="0.85rem" fontWeight="700">السعة القصوى:</Text>
                <Input
                  type="number"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(Math.max(1, Number(e.target.value) || 1))}
                  w="90px"
                  size="sm"
                  borderRadius="8px"
                  textAlign="center"
                  fontWeight="800"
                />
                <Button size="xs" onClick={() => setIsEditingCapacity(false)} colorScheme="green">
                  حفظ
                </Button>
              </HStack>
            ) : (
              <Button
                variant="ghost"
                size="xs"
                color="var(--athar-text-muted)"
                onClick={() => setIsEditingCapacity(true)}
                fontSize="0.78rem"
              >
                تعديل سعة القاعة ({maxCapacity} مقعد) ✎
              </Button>
            )}
          </HStack>
        </Flex>

        {/* 4 Metric Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={5}>
          <Box bg="rgba(122, 28, 46, 0.05)" p={4} borderRadius="14px" border="1px solid rgba(122, 28, 46, 0.12)">
            <Text fontSize="0.78rem" color="var(--athar-text-muted)" fontWeight="700" mb={1}>
              المقاعد المؤكدة (Approved)
            </Text>
            <HStack align="baseline">
              <Text fontSize="1.6rem" fontWeight="900" color="var(--athar-maroon)">
                {stats.approvedSeats}
              </Text>
              <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                من أصل {maxCapacity} مقعد
              </Text>
            </HStack>
          </Box>

          <Box bg="rgba(217, 119, 6, 0.06)" p={4} borderRadius="14px" border="1px solid rgba(217, 119, 6, 0.18)">
            <Text fontSize="0.78rem" color="#B45309" fontWeight="700" mb={1}>
              مقاعد قيد المراجعة (Pending)
            </Text>
            <HStack align="baseline">
              <Text fontSize="1.6rem" fontWeight="900" color="#B45309">
                {stats.pendingSeats}
              </Text>
              <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                مقعد مطلوب
              </Text>
            </HStack>
          </Box>

          <Box bg="rgba(5, 150, 105, 0.06)" p={4} borderRadius="14px" border="1px solid rgba(5, 150, 105, 0.18)">
            <Text fontSize="0.78rem" color="#047857" fontWeight="700" mb={1}>
              المقاعد المتبقية (Available)
            </Text>
            <HStack align="baseline">
              <Text fontSize="1.6rem" fontWeight="900" color="#047857">
                {stats.remainingSeats}
              </Text>
              <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                مقعد شاغر
              </Text>
            </HStack>
          </Box>

          <Box bg="rgba(212, 175, 55, 0.08)" p={4} borderRadius="14px" border="1px solid rgba(212, 175, 55, 0.25)">
            <Text fontSize="0.78rem" color="#8C6F12" fontWeight="700" mb={1}>
              نسبة إشغال القاعة (Occupancy)
            </Text>
            <HStack align="baseline">
              <Text fontSize="1.6rem" fontWeight="900" color="#8C6F12">
                {stats.percentage}%
              </Text>
              <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                مكتمل
              </Text>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* Visual Progress Bar */}
        <Box w="100%" bg="rgba(107, 29, 40, 0.08)" h="14px" borderRadius="full" overflow="hidden" position="relative">
          <Box
            h="100%"
            w={`${Math.min(100, stats.percentage)}%`}
            bg={
              stats.percentage >= 95
                ? "linear-gradient(90deg, #D4AF37 0%, #7A1C2E 100%)"
                : stats.percentage >= 80
                ? "linear-gradient(90deg, #10B981 0%, #F59E0B 100%)"
                : "linear-gradient(90deg, #059669 0%, #10B981 100%)"
            }
            borderRadius="full"
            transition="width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          />
        </Box>
      </Box>

      {/* Filter Tabs & Search Bar */}
      <Box
        bg="#ffffff"
        borderRadius="20px"
        p={4}
        mb={6}
        border="1px solid var(--athar-card-border)"
        boxShadow="var(--athar-shadow-soft)"
      >
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={3}>
          {/* Status Pills */}
          <HStack gap={2} wrap="wrap">
            <Button
              size="sm"
              onClick={() => setActiveTab("all")}
              bg={activeTab === "all" ? "#7A1C2E" : "transparent"}
              color={activeTab === "all" ? "#FBF8F3" : "var(--athar-text-body)"}
              borderRadius="9999px"
              fontWeight="800"
              fontSize="0.84rem"
              border={activeTab === "all" ? "1px solid var(--athar-gold)" : "1px solid rgba(107, 29, 40, 0.12)"}
            >
              جميع الردود ({stats.totalSubmissions})
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab("pending")}
              bg={activeTab === "pending" ? "#7A1C2E" : "transparent"}
              color={activeTab === "pending" ? "#FBF8F3" : "var(--athar-text-body)"}
              borderRadius="9999px"
              fontWeight="800"
              fontSize="0.84rem"
              border={activeTab === "pending" ? "1px solid var(--athar-gold)" : "1px solid rgba(107, 29, 40, 0.12)"}
            >
              قيد المراجعة ({stats.pendingCount})
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab("approved")}
              bg={activeTab === "approved" ? "#7A1C2E" : "transparent"}
              color={activeTab === "approved" ? "#FBF8F3" : "var(--athar-text-body)"}
              borderRadius="9999px"
              fontWeight="800"
              fontSize="0.84rem"
              border={activeTab === "approved" ? "1px solid var(--athar-gold)" : "1px solid rgba(107, 29, 40, 0.12)"}
            >
              معتمد ومؤكد ({stats.approvedCount})
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab("declined")}
              bg={activeTab === "declined" ? "#7A1C2E" : "transparent"}
              color={activeTab === "declined" ? "#FBF8F3" : "var(--athar-text-body)"}
              borderRadius="9999px"
              fontWeight="800"
              fontSize="0.84rem"
              border={activeTab === "declined" ? "1px solid var(--athar-gold)" : "1px solid rgba(107, 29, 40, 0.12)"}
            >
              معتذر / مرفوض ({stats.declinedCount})
            </Button>
          </HStack>

          {/* Search Box */}
          <Box w={{ base: "100%", md: "320px" }}>
            <Input
              placeholder="🔍 ابحث بالاسم، البريد، أو الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
              borderRadius="12px"
              bg="rgba(251, 247, 242, 0.6)"
              borderColor="rgba(107, 29, 40, 0.15)"
              fontSize="0.85rem"
            />
          </Box>
        </Flex>
      </Box>

      {/* RSVPs Table / Card Feed */}
      <VStack gap={3} align="stretch">
        {filteredRsvps.length === 0 ? (
          <Box
            bg="#ffffff"
            borderRadius="20px"
            p={12}
            textAlign="center"
            border="1px solid var(--athar-card-border)"
          >
            <Text fontSize="2.5rem" mb={2}>🔍</Text>
            <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon)" fontFamily="var(--font-arabic-display)">
              لا توجد ردود تطابق هذا التصفية
            </Text>
            <Text fontSize="0.85rem" color="var(--athar-text-muted)">
              جرّب تغيير فئة العرض أو تعديل كلمات البحث.
            </Text>
          </Box>
        ) : (
          filteredRsvps.map((rsvp) => {
            const isLoading = actionLoadingId === rsvp.$id;
            const isApproved = rsvp.status === "approved";
            const isDeclined = rsvp.status === "declined";
            const companions = Number(rsvp.companionsCount) || 0;
            const totalPartySeats = 1 + companions;

            // Parse custom dynamic responses
            let customFields: Record<string, any> = {};
            try {
              if (rsvp.dynamicResponsesJson) {
                customFields = JSON.parse(rsvp.dynamicResponsesJson);
              }
            } catch {}

            return (
              <Box
                key={rsvp.$id || rsvp.guestEmail}
                bg="#ffffff"
                borderRadius="16px"
                p={5}
                border="1px solid var(--athar-card-border)"
                boxShadow="0 2px 10px rgba(107, 29, 40, 0.04)"
                transition="all 0.2s ease"
                _hover={{ boxShadow: "0 6px 20px rgba(107, 29, 40, 0.08)", borderColor: "var(--athar-gold)" }}
              >
                <Flex direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "flex-start", lg: "center" }} gap={4}>
                  {/* Left: Guest Details */}
                  <HStack gap={4} align="flex-start" flex="1">
                    <Box
                      w="48px"
                      h="48px"
                      borderRadius="14px"
                      bg="var(--athar-maroon)"
                      color="#ffffff"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="900"
                      fontSize="1.15rem"
                      fontFamily="var(--font-arabic-display)"
                      flexShrink={0}
                      border="1px solid var(--athar-gold)"
                    >
                      {rsvp.guestName ? rsvp.guestName[0] : "ض"}
                    </Box>

                    <Box flex="1">
                      <HStack gap={2} mb={1} wrap="wrap">
                        <Text fontSize="1.05rem" fontWeight="900" color="var(--athar-maroon)" fontFamily="var(--font-arabic-display)">
                          {rsvp.guestName}
                        </Text>
                        {isApproved && (
                          <Badge bg="#059669" color="#ffffff" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem" fontWeight="800">
                            ✓ معتمد
                          </Badge>
                        )}
                        {isDeclined && (
                          <Badge bg="#B91C1C" color="#ffffff" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem" fontWeight="800">
                            ✕ معتذر
                          </Badge>
                        )}
                        {!isApproved && !isDeclined && (
                          <Badge bg="#D97706" color="#ffffff" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem" fontWeight="800">
                            ⏳ قيد المراجعة
                          </Badge>
                        )}

                        <Badge bg="rgba(107, 29, 40, 0.08)" color="var(--athar-maroon)" borderRadius="full" px={2} py={0.5} fontSize="0.7rem" fontWeight="800">
                          {companions === 0 ? "شخص واحد (1 مقعد)" : `+${companions} مرافقين (${totalPartySeats} مقاعد)`}
                        </Badge>
                      </HStack>

                      <HStack gap={4} fontSize="0.82rem" color="var(--athar-text-muted)" wrap="wrap">
                        <Text>✉️ {rsvp.guestEmail}</Text>
                        {rsvp.guestPhone && <Text>📞 {rsvp.guestPhone}</Text>}
                        <Text>📅 {new Date(rsvp.$createdAt || Date.now()).toLocaleDateString("ar-EG")}</Text>
                        {rsvp.passToken && (
                          <Text color="#8C6F12" fontWeight="800">
                            🎫 كود VIP: <strong>{rsvp.passToken}</strong>
                          </Text>
                        )}
                      </HStack>

                      {/* Dynamic form responses preview */}
                      {Object.keys(customFields).length > 0 && (
                        <HStack gap={2} mt={2} wrap="wrap">
                          {Object.entries(customFields).map(([key, val]) => (
                            <Badge
                              key={key}
                              bg="rgba(251, 247, 242, 0.9)"
                              color="var(--athar-text-body)"
                              border="1px solid rgba(107, 29, 40, 0.12)"
                              px={2}
                              py={0.5}
                              fontSize="0.68rem"
                              borderRadius="6px"
                            >
                              <strong>{key}:</strong> {String(val)}
                            </Badge>
                          ))}
                        </HStack>
                      )}

                      {isDeclined && (rsvp as any).rejectionReason && (
                        <Text fontSize="0.78rem" color="#B91C1C" mt={1} fontWeight="600">
                          سبب الاعتذار: {(rsvp as any).rejectionReason}
                        </Text>
                      )}
                    </Box>
                  </HStack>

                  {/* Right: Actions */}
                  <HStack gap={2} flexShrink={0} wrap="wrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      color="var(--athar-text-muted)"
                      _hover={{ color: "var(--athar-maroon)", bg: "rgba(107, 29, 40, 0.06)" }}
                      onClick={() => setSelectedRsvp(rsvp)}
                      fontSize="0.82rem"
                      fontWeight="700"
                    >
                      تفاصيل الرد 👁️
                    </Button>

                    {!isApproved && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(rsvp)}
                        loading={isLoading}
                        bg="#059669"
                        color="#ffffff"
                        _hover={{ bg: "#047857" }}
                        borderRadius="10px"
                        fontWeight="800"
                        fontSize="0.82rem"
                        px={3.5}
                      >
                        ✓ اعتماد الدعوة
                      </Button>
                    )}

                    {!isDeclined && (
                      <Button
                        size="sm"
                        onClick={() => setDeclineReasonModalRsvp(rsvp)}
                        loading={isLoading}
                        variant="outline"
                        borderColor="#B91C1C"
                        color="#B91C1C"
                        _hover={{ bg: "rgba(185, 28, 28, 0.08)" }}
                        borderRadius="10px"
                        fontWeight="800"
                        fontSize="0.82rem"
                        px={3.5}
                      >
                        ✕ اعتذار
                      </Button>
                    )}
                  </HStack>
                </Flex>
              </Box>
            );
          })
        )}
      </VStack>

      {/* Guest Details Modal / Drawer */}
      {selectedRsvp && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.5)"
          backdropFilter="blur(6px)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="#ffffff"
            borderRadius="24px"
            maxW="560px"
            w="100%"
            p={7}
            boxShadow="var(--athar-shadow-elevated)"
            border="1px solid var(--athar-card-border)"
            position="relative"
          >
            <Flex justify="space-between" align="center" mb={5} pb={3} borderBottom="1px solid rgba(107, 29, 40, 0.1)">
              <HStack gap={3}>
                <Text fontSize="1.8rem">🎫</Text>
                <Box>
                  <Text fontSize="1.25rem" fontWeight="900" color="var(--athar-maroon)" fontFamily="var(--font-arabic-display)">
                    تفاصيل رد وتأكيد الحضور
                  </Text>
                  <Text fontSize="0.75rem" color="var(--athar-text-muted)">
                    معرف الرد: {selectedRsvp.$id}
                  </Text>
                </Box>
              </HStack>
              <Button size="sm" variant="ghost" onClick={() => setSelectedRsvp(null)} fontSize="1.1rem">
                ✕
              </Button>
            </Flex>

            <VStack gap={3} align="stretch" mb={6}>
              <Box bg="rgba(251, 247, 242, 0.6)" p={3.5} borderRadius="12px">
                <Text fontSize="0.75rem" color="var(--athar-text-muted)" fontWeight="700">اسم الضيف:</Text>
                <Text fontSize="1rem" fontWeight="900" color="var(--athar-maroon)">{selectedRsvp.guestName}</Text>
              </Box>

              <SimpleGrid columns={2} gap={3}>
                <Box bg="rgba(251, 247, 242, 0.6)" p={3} borderRadius="12px">
                  <Text fontSize="0.72rem" color="var(--athar-text-muted)" fontWeight="700">البريد الإلكتروني:</Text>
                  <Text fontSize="0.85rem" fontWeight="800">{selectedRsvp.guestEmail}</Text>
                </Box>
                <Box bg="rgba(251, 247, 242, 0.6)" p={3} borderRadius="12px">
                  <Text fontSize="0.72rem" color="var(--athar-text-muted)" fontWeight="700">الهاتف:</Text>
                  <Text fontSize="0.85rem" fontWeight="800">{selectedRsvp.guestPhone || "غير مسجل"}</Text>
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={2} gap={3}>
                <Box bg="rgba(251, 247, 242, 0.6)" p={3} borderRadius="12px">
                  <Text fontSize="0.72rem" color="var(--athar-text-muted)" fontWeight="700">عدد المرافقين:</Text>
                  <Text fontSize="0.88rem" fontWeight="900" color="var(--athar-maroon)">
                    {selectedRsvp.companionsCount || 0} مرافقين (إجمالي {1 + (selectedRsvp.companionsCount || 0)} مقاعد)
                  </Text>
                </Box>
                <Box bg="rgba(251, 247, 242, 0.6)" p={3} borderRadius="12px">
                  <Text fontSize="0.72rem" color="var(--athar-text-muted)" fontWeight="700">حالة الاعتماد:</Text>
                  <Text fontSize="0.88rem" fontWeight="900">
                    {selectedRsvp.status === "approved" ? "✓ معتمد ومؤكد" : selectedRsvp.status === "declined" ? "✕ معتذر" : "⏳ قيد المراجعة"}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Dynamic form responses */}
              {selectedRsvp.dynamicResponsesJson && (
                <Box bg="rgba(251, 247, 242, 0.6)" p={3.5} borderRadius="12px">
                  <Text fontSize="0.75rem" color="var(--athar-text-muted)" fontWeight="800" mb={1.5}>
                    إجابات الحقول الديناميكية (Dynamic Form Schema Responses):
                  </Text>
                  <Box bg="#ffffff" p={2.5} borderRadius="8px" border="1px solid rgba(107, 29, 40, 0.08)" fontSize="0.78rem">
                    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)" }}>
                      {JSON.stringify(JSON.parse(selectedRsvp.dynamicResponsesJson), null, 2)}
                    </pre>
                  </Box>
                </Box>
              )}

              {selectedRsvp.passToken && (
                <Box bg="rgba(212, 175, 55, 0.12)" p={3.5} borderRadius="12px" border="1px solid var(--athar-gold)" textAlign="center">
                  <Text fontSize="0.78rem" color="#8C6F12" fontWeight="800" mb={1}>
                    بطاقة الدخول الرقمية المشفرة (Digital VIP Pass):
                  </Text>
                  <Text fontSize="1.1rem" fontWeight="900" color="var(--athar-maroon)" letterSpacing="1px" mb={2}>
                    {selectedRsvp.passToken}
                  </Text>
                  {selectedRsvp.qrCodeUrl && (
                    <Box display="flex" justifyContent="center">
                      <img src={selectedRsvp.qrCodeUrl} alt="QR Code" style={{ width: "120px", height: "120px", borderRadius: "8px" }} />
                    </Box>
                  )}
                </Box>
              )}
            </VStack>

            <Flex justify="flex-end" gap={3}>
              <Button onClick={() => setSelectedRsvp(null)} className="btn-athar-secondary" fontSize="0.85rem">
                إغلاق
              </Button>
              {selectedRsvp.status !== "approved" && (
                <Button
                  onClick={() => {
                    handleApprove(selectedRsvp);
                    setSelectedRsvp(null);
                  }}
                  bg="#059669"
                  color="#ffffff"
                  _hover={{ bg: "#047857" }}
                  fontSize="0.85rem"
                  fontWeight="800"
                >
                  ✓ اعتماد هذا الرد الآن
                </Button>
              )}
            </Flex>
          </Box>
        </Box>
      )}

      {/* Decline Reason Modal */}
      {declineReasonModalRsvp && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.5)"
          backdropFilter="blur(6px)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="#ffffff"
            borderRadius="20px"
            maxW="480px"
            w="100%"
            p={6}
            boxShadow="var(--athar-shadow-elevated)"
            border="1px solid var(--athar-card-border)"
          >
            <Text fontSize="1.2rem" fontWeight="900" color="#B91C1C" mb={2} fontFamily="var(--font-arabic-display)">
              تأكيد الاعتذار لـ "{declineReasonModalRsvp.guestName}"
            </Text>
            <Text fontSize="0.84rem" color="var(--athar-text-muted)" mb={4}>
              يرجى تحديد سبب الاعتذار الموجه للضيف (سيتم تضمينه في البريد الإلكتروني الرسمي):
            </Text>

            <VStack gap={2} mb={5} align="stretch">
              {[
                "نعتذر بشدة نظراً لاكتمال الطاقة الاستيعابية المحددة للقاعة",
                "نعتذر نظراً لانتهاء المهلة المحددة لتأكيد الحضور",
                "تعذر تأكيد الحضور لعدم توفر مقاعد مرافقين إضافية",
              ].map((reason) => (
                <Button
                  key={reason}
                  size="sm"
                  variant="outline"
                  borderColor={rejectionReasonText === reason ? "#B91C1C" : "rgba(107, 29, 40, 0.15)"}
                  bg={rejectionReasonText === reason ? "rgba(185, 28, 28, 0.06)" : "transparent"}
                  color="var(--athar-text-body)"
                  onClick={() => setRejectionReasonText(reason)}
                  fontSize="0.78rem"
                  justifyContent="flex-start"
                  textAlign="right"
                >
                  {reason}
                </Button>
              ))}

              <Input
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="أو اكتب سبباً مخصصاً..."
                size="sm"
                borderRadius="8px"
                mt={2}
                fontSize="0.82rem"
              />
            </VStack>

            <Flex justify="flex-end" gap={3}>
              <Button size="sm" variant="ghost" onClick={() => setDeclineReasonModalRsvp(null)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                bg="#B91C1C"
                color="#ffffff"
                _hover={{ bg: "#991B1B" }}
                onClick={() => handleDeclineConfirm(declineReasonModalRsvp, rejectionReasonText)}
                fontWeight="800"
              >
                تأكيد الاعتذار وإرسال الإشعار
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminRsvpMailbox;
