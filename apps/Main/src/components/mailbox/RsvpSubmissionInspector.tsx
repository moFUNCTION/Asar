import React from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import type { InvitationRsvp } from "@repo/react-appwrite";
import { EmailNotificationStatusBadge } from "./EmailNotificationStatusBadge";

export interface RsvpSubmissionInspectorProps {
  rsvp?: InvitationRsvp | null;
  onApprove?: (rsvp: InvitationRsvp) => Promise<void> | void;
  onDecline?: (rsvp: InvitationRsvp) => Promise<void> | void;
  onViewEmailPreview?: (rsvp: InvitationRsvp) => void;
  isActionLoading?: boolean;
}

export const RsvpSubmissionInspector: React.FC<RsvpSubmissionInspectorProps> = ({
  rsvp,
  onApprove,
  onDecline,
  onViewEmailPreview,
  isActionLoading = false,
}) => {
  if (!rsvp) {
    return (
      <Box
        bg="rgba(255, 255, 255, 0.95)"
        borderRadius="24px"
        p={{ base: 8, md: 12 }}
        border="1px solid rgba(107, 29, 40, 0.08)"
        boxShadow="0 10px 30px -10px rgba(107, 29, 40, 0.06)"
        textAlign="center"
        dir="rtl"
        h="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          w="64px"
          h="64px"
          borderRadius="full"
          bg="rgba(212, 175, 55, 0.15)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="1.8rem"
          mb={4}
        >
          ✉️
        </Box>
        <Text
          fontSize="1.2rem"
          fontWeight="800"
          color="var(--athar-text-title, #231F20)"
          fontFamily="var(--font-body, 'Cairo', sans-serif)"
          mb={2}
        >
          معاينة وتفاصيل إجابات الضيف
        </Text>
        <Text
          fontSize="0.9rem"
          color="var(--athar-text-muted, #7A6F6D)"
          maxW="340px"
          lineHeight="1.6"
        >
          حدد ضيفاً من قائمة صندوق الردود على اليمين لمراجعة تفاصيل إجابات النموذج التفاعلي، واتخاذ قرار القبول أو اعتذار السعة مع إرسال إشعار EmailJS الفوري.
        </Text>
      </Box>
    );
  }

  const companions = Math.max(0, Number(rsvp.companionsCount) || 0);
  const totalSeats = 1 + companions;

  // Parse dynamic responses
  let dynamicFields: Array<{ label: string; value: string }> = [];
  if (rsvp.dynamicResponsesJson) {
    try {
      const parsed = JSON.parse(rsvp.dynamicResponsesJson);
      if (typeof parsed === "object" && parsed !== null) {
        dynamicFields = Object.entries(parsed).map(([key, val]) => {
          let label = key;
          if (key === "dietaryRequirements" || key === "dietaryNotes") {
            label = "الملاحظات الغذائية ورسالة التهنئة";
          } else if (key === "relationship" || key === "guestCategory") {
            label = "صلة القرابة / الفئة";
          } else if (key === "songRequest") {
            label = "أغنية مهداة للعروسين";
          } else if (key === "attendanceNote") {
            label = "ملاحظات الحضور";
          }
          return {
            label,
            value: typeof val === "string" ? val : JSON.stringify(val),
          };
        });
      }
    } catch {
      dynamicFields = [];
    }
  }

  // Format submission date
  let formattedDate = "اليوم";
  if (rsvp.respondedAt || rsvp.$createdAt) {
    try {
      const d = new Date(rsvp.respondedAt || rsvp.$createdAt || "");
      if (!Number.isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("ar-EG", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch {
      formattedDate = "اليوم";
    }
  }

  const isApproved = rsvp.status === "approved";
  const isDeclined = rsvp.status === "declined";

  // QR Pass URL
  const qrPassUrl =
    rsvp.passToken && rsvp.$id
      ? `http://localhost:3003?pass=${rsvp.$id}&token=${rsvp.passToken}`
      : "";

  return (
    <Box
      bg="rgba(255, 255, 255, 0.95)"
      borderRadius="24px"
      p={{ base: 5, md: 7 }}
      border="1px solid rgba(107, 29, 40, 0.1)"
      boxShadow="0 10px 30px -10px rgba(107, 29, 40, 0.08)"
      dir="rtl"
    >
      {/* 1. Header with Identity */}
      <Flex justify="space-between" align="flex-start" gap={3} mb={5} pb={4} borderBottom="1px solid rgba(107, 29, 40, 0.08)">
        <VStack align="flex-start" gap={1.5}>
          <HStack gap={2} flexWrap="wrap">
            <Text
              fontSize="1.3rem"
              fontWeight="800"
              color="var(--athar-maroon, #6B1D28)"
              fontFamily="var(--font-body, 'Cairo', sans-serif)"
            >
              {rsvp.guestName}
            </Text>
            <Badge
              variant="outline"
              borderColor="rgba(212, 175, 55, 0.4)"
              bg="rgba(212, 175, 55, 0.15)"
              color="var(--athar-text-title, #231F20)"
              px={3}
              py={0.5}
              borderRadius="full"
              fontSize="0.75rem"
              fontWeight="700"
            >
              {totalSeats} {totalSeats === 1 ? "مقعد فردي" : `مقاعد (${totalSeats})`}
            </Badge>
          </HStack>

          <Text fontSize="0.8rem" color="var(--athar-text-muted, #7A6F6D)">
            تاريخ الرد: {formattedDate}
          </Text>
        </VStack>

        <VStack align="flex-end" gap={1}>
          <EmailNotificationStatusBadge
            emailSent={rsvp.emailSent}
            status={rsvp.emailSent ? "sent" : "pending"}
            size="md"
          />
        </VStack>
      </Flex>

      {/* 2. Contact Information Cards */}
      <Box mb={5}>
        <Text fontSize="0.85rem" fontWeight="700" color="var(--athar-text-title, #231F20)" mb={2.5}>
          بيانات الاتصال المعتمدة
        </Text>
        <Flex direction={{ base: "column", sm: "row" }} gap={3}>
          {/* Verified Email Badge */}
          <Box
            flex="1"
            p={3}
            bg="rgba(244, 239, 234, 0.7)"
            borderRadius="12px"
            border="1px solid rgba(107, 29, 40, 0.08)"
          >
            <HStack justify="space-between" mb={1}>
              <Text fontSize="0.72rem" color="var(--athar-text-muted, #7A6F6D)">
                البريد الإلكتروني
              </Text>
              <Badge
                size="sm"
                variant="subtle"
                bg="rgba(30, 111, 80, 0.15)"
                color="#1E6F50"
                fontSize="0.68rem"
                borderRadius="full"
                px={2}
              >
                ✉️ معتمد للإرسال 🔒
              </Badge>
            </HStack>
            <Text fontSize="0.9rem" fontWeight="700" color="var(--athar-maroon, #6B1D28)" dir="ltr" textAlign="right">
              {rsvp.guestEmail}
            </Text>
          </Box>

          {/* Phone */}
          {rsvp.guestPhone && (
            <Box
              flex="1"
              p={3}
              bg="rgba(244, 239, 234, 0.7)"
              borderRadius="12px"
              border="1px solid rgba(107, 29, 40, 0.08)"
            >
              <Text fontSize="0.72rem" color="var(--athar-text-muted, #7A6F6D)" mb={1}>
                رقم الواتساب / الهاتف
              </Text>
              <Text fontSize="0.9rem" fontWeight="700" color="var(--athar-text-title, #231F20)" dir="ltr" textAlign="right">
                {rsvp.guestPhone}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>

      {/* 3. Dynamic Form Responses Grid */}
      <Box mb={6}>
        <Text fontSize="0.85rem" fontWeight="700" color="var(--athar-text-title, #231F20)" mb={2.5}>
          إجابات النموذج التفاعلي للدعوة
        </Text>

        {dynamicFields.length === 0 ? (
          <Box p={4} bg="rgba(244, 239, 234, 0.5)" borderRadius="12px" textAlign="center">
            <Text fontSize="0.82rem" color="var(--athar-text-muted, #7A6F6D)">
              لم يقم الضيف بإدخال إجابات إضافية في النموذج
            </Text>
          </Box>
        ) : (
          <VStack gap={2.5} align="stretch">
            {dynamicFields.map((field, idx) => (
              <Box
                key={idx}
                p={3.5}
                bg="rgba(251, 247, 242, 0.9)"
                borderRadius="12px"
                border="1px solid rgba(212, 175, 55, 0.2)"
              >
                <Text fontSize="0.75rem" fontWeight="700" color="var(--athar-text-muted, #7A6F6D)" mb={1}>
                  {field.label}
                </Text>
                <Text
                  fontSize="0.88rem"
                  fontWeight="600"
                  color="var(--athar-text-title, #231F20)"
                  lineHeight="1.5"
                  dir="auto"
                >
                  {field.value}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>

      {/* 4. Approved Details Display (QR Code & Pass Link) */}
      {isApproved && (
        <Box
          mb={6}
          p={4}
          bg="rgba(30, 111, 80, 0.06)"
          borderRadius="16px"
          border="1px solid rgba(30, 111, 80, 0.25)"
        >
          <HStack justify="space-between" align="center" mb={3}>
            <Text fontSize="0.9rem" fontWeight="800" color="#1E6F50">
              ✓ تم اعتماد الحضور وإصدار تصريح الدخول الرقمي
            </Text>
            <Badge bg="#1E6F50" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem">
              كود الدخول فعال
            </Badge>
          </HStack>

          <Flex direction={{ base: "column", sm: "row" }} gap={4} align="center">
            {/* QR Code thumbnail */}
            {rsvp.qrCodeUrl ? (
              <Box
                p={2}
                bg="white"
                borderRadius="12px"
                border="1px solid rgba(212, 175, 55, 0.4)"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.08)"
              >
                <img
                  src={rsvp.qrCodeUrl}
                  alt={`QR Code for ${rsvp.guestName}`}
                  style={{ width: "90px", height: "90px", objectFit: "contain" }}
                />
              </Box>
            ) : null}

            <VStack align="flex-start" gap={1.5} flex="1">
              {rsvp.passToken && (
                <Text fontSize="0.8rem" color="var(--athar-text-body, #4A4240)">
                  رمز التصريح:{" "}
                  <Text as="span" fontFamily="monospace" fontWeight="800" color="#1E6F50">
                    {rsvp.passToken}
                  </Text>
                </Text>
              )}
              {qrPassUrl && (
                <Text
                  fontSize="0.75rem"
                  color="var(--athar-text-muted, #7A6F6D)"
                  dir="ltr"
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "300px" }}
                >
                  {qrPassUrl}
                </Text>
              )}
              <Text fontSize="0.75rem" color="#1E6F50" fontWeight="600">
                ✓ تم إرسال رسالة القبول مع رمز QR المرفق إلى {rsvp.guestEmail}
              </Text>
            </VStack>
          </Flex>
        </Box>
      )}

      {/* 5. Declined Details Display */}
      {isDeclined && (
        <Box
          mb={6}
          p={4}
          bg="rgba(155, 44, 44, 0.06)"
          borderRadius="16px"
          border="1px solid rgba(155, 44, 44, 0.25)"
        >
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontSize="0.9rem" fontWeight="800" color="#9B2C2C">
              ✕ تم الاعتذار الدبلوماسي بسبب اكتمال الطاقة الاستيعابية
            </Text>
            <Badge bg="#9B2C2C" color="white" borderRadius="full" px={2.5} py={0.5} fontSize="0.72rem">
              اعتذار السعة
            </Badge>
          </HStack>
          <Text fontSize="0.82rem" color="var(--athar-text-body, #4A4240)" lineHeight="1.6" mb={2}>
            "نشكر لكم مشاعركم الطيبة ورغبتكم في مشاركتنا فرحتنا. نظراً لمحدودية سعة القاعة واكتمال العدد المسموح به، يَصعُب علينا للأسف تأكيد مقاعد إضافية في الوقت الحالي. نقدّر تفهمكم ومحبتكم الغالية..."
          </Text>
          <Text fontSize="0.75rem" color="#9B2C2C" fontWeight="600">
            ✓ تم إرسال خطاب الاعتذار الدبلوماسي تلقائياً إلى {rsvp.guestEmail}
          </Text>
        </Box>
      )}

      {/* 6. Action Decision Controls */}
      <Box pt={4} borderTop="1px solid rgba(107, 29, 40, 0.08)">
        <Text fontSize="0.82rem" fontWeight="700" color="var(--athar-text-title, #231F20)" mb={3}>
          إجراءات المضيف (مرتبطة تلقائياً بإرسال EmailJS):
        </Text>

        <Flex direction={{ base: "column", sm: "row" }} gap={3}>
          {/* Approve Button */}
          <Button
            flex="1"
            bg="var(--athar-status-success, #1E6F50)"
            color="white"
            py={5}
            borderRadius="full"
            fontWeight="700"
            fontSize="0.9rem"
            onClick={() => onApprove?.(rsvp)}
            disabled={isActionLoading || isApproved}
            opacity={isApproved ? 0.6 : 1}
            _hover={
              !isApproved
                ? {
                    bg: "#15523b",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 18px rgba(30, 111, 80, 0.3)",
                  }
                : undefined
            }
          >
            {isApproved ? "✓ معتمد بالفعل" : "✓ قبول الدعوة وإرسال كود QR"}
          </Button>

          {/* Decline Button */}
          <Button
            flex="1"
            bg="rgba(155, 44, 44, 0.12)"
            color="var(--athar-status-danger, #9B2C2C)"
            border="1px solid rgba(155, 44, 44, 0.3)"
            py={5}
            borderRadius="full"
            fontWeight="700"
            fontSize="0.9rem"
            onClick={() => onDecline?.(rsvp)}
            disabled={isActionLoading || isDeclined}
            opacity={isDeclined ? 0.6 : 1}
            _hover={
              !isDeclined
                ? {
                    bg: "rgba(155, 44, 44, 0.2)",
                    borderColor: "#9B2C2C",
                    transform: "translateY(-1px)",
                  }
                : undefined
            }
          >
            {isDeclined ? "✕ تم الاعتذار مسبقاً" : "✕ اعتذار لاكتمال السعة"}
          </Button>
        </Flex>

        {/* View Sent Email Preview Button */}
        <Button
          w="100%"
          mt={3}
          variant="outline"
          borderColor="rgba(212, 175, 55, 0.4)"
          bg="white"
          color="var(--athar-text-title, #231F20)"
          py={4}
          borderRadius="full"
          fontWeight="600"
          fontSize="0.85rem"
          onClick={() => onViewEmailPreview?.(rsvp)}
          _hover={{
            bg: "rgba(244, 239, 234, 0.8)",
            borderColor: "var(--athar-gold, #D4AF37)",
          }}
        >
          ⚙️ معاينة رسالة البريد الإلكتروني وإعدادات EmailJS
        </Button>
      </Box>
    </Box>
  );
};
