import React from "react";
import { Box, Flex, HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import type { InvitationRsvp } from "@repo/react-appwrite";
import { EmailNotificationStatusBadge } from "./EmailNotificationStatusBadge";

export interface RsvpResponseRowProps {
  rsvp: InvitationRsvp;
  isSelected?: boolean;
  onSelect?: (rsvp: InvitationRsvp) => void;
  onApprove?: (rsvp: InvitationRsvp) => Promise<void> | void;
  onDecline?: (rsvp: InvitationRsvp) => Promise<void> | void;
  onViewEmailPreview?: (rsvp: InvitationRsvp) => void;
  isActionLoading?: boolean;
}

export const RsvpResponseRow: React.FC<RsvpResponseRowProps> = ({
  rsvp,
  isSelected = false,
  onSelect,
  onApprove,
  onDecline,
  onViewEmailPreview,
  isActionLoading = false,
}) => {
  const companions = Math.max(0, Number(rsvp.companionsCount) || 0);
  const totalSeats = 1 + companions;

  // Parse dynamic responses snippet (e.g. dietary notes or blessing)
  let customAnswerSnippet = "";
  if (rsvp.dynamicResponsesJson) {
    try {
      const parsed = JSON.parse(rsvp.dynamicResponsesJson);
      if (typeof parsed === "object" && parsed !== null) {
        const values = Object.values(parsed).filter(
          (v) => typeof v === "string" && (v as string).trim()
        );
        if (values.length > 0) {
          customAnswerSnippet = String(values[0]);
        }
      }
    } catch {
      // Fallback
      customAnswerSnippet = "";
    }
  }

  // Attendance status badge styling
  let statusBadgeColor = "#B7791F";
  let statusBadgeBg = "rgba(212, 175, 55, 0.15)";
  let statusBadgeBorder = "rgba(212, 175, 55, 0.4)";
  let statusBadgeLabel = "⏳ قيد المراجعة";

  if (rsvp.status === "approved") {
    statusBadgeColor = "#1E6F50";
    statusBadgeBg = "rgba(30, 111, 80, 0.12)";
    statusBadgeBorder = "rgba(30, 111, 80, 0.4)";
    statusBadgeLabel = "✓ مقبول — تم إصدار QR";
  } else if (rsvp.status === "declined") {
    statusBadgeColor = "#9B2C2C";
    statusBadgeBg = "rgba(155, 44, 44, 0.12)";
    statusBadgeBorder = "rgba(155, 44, 44, 0.4)";
    statusBadgeLabel = "✕ اعتذار السعة";
  }

  const handleRowClick = () => {
    onSelect?.(rsvp);
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApprove?.(rsvp);
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.(rsvp);
  };

  const handlePreviewEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewEmailPreview?.(rsvp);
  };

  return (
    <Box
      bg={isSelected ? "rgba(251, 247, 242, 0.98)" : "rgba(255, 255, 255, 0.95)"}
      borderRadius="18px"
      p={{ base: 4, md: 5 }}
      border={isSelected ? "2px solid var(--athar-gold, #D4AF37)" : "1px solid rgba(107, 29, 40, 0.08)"}
      boxShadow={isSelected ? "0 12px 30px -10px rgba(212, 175, 55, 0.25)" : "0 4px 15px -4px rgba(107, 29, 40, 0.04)"}
      transition="all 0.2s ease"
      cursor="pointer"
      onClick={handleRowClick}
      _hover={{
        borderColor: isSelected ? "var(--athar-gold, #D4AF37)" : "rgba(212, 175, 55, 0.5)",
        transform: "translateY(-1px)",
        boxShadow: "0 8px 24px -8px rgba(107, 29, 40, 0.08)",
      }}
      dir="rtl"
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        align={{ base: "flex-start", lg: "center" }}
        gap={4}
      >
        {/* Guest Primary Details */}
        <VStack align="flex-start" gap={1.5} flex="1">
          <HStack gap={2} flexWrap="wrap">
            <Text
              fontSize="1.05rem"
              fontWeight="800"
              color="var(--athar-text-title, #231F20)"
              fontFamily="var(--font-body, 'Cairo', sans-serif)"
            >
              {rsvp.guestName}
            </Text>

            {/* Attendance Status Badge */}
            <Badge
              variant="outline"
              borderColor={statusBadgeBorder}
              bg={statusBadgeBg}
              color={statusBadgeColor}
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontSize="0.75rem"
              fontWeight="700"
            >
              {statusBadgeLabel}
            </Badge>

            {/* Email Notification Status */}
            <EmailNotificationStatusBadge
              emailSent={rsvp.emailSent}
              status={rsvp.emailSent ? "sent" : "pending"}
              size="sm"
            />
          </HStack>

          {/* Contact and Seat Counts */}
          <HStack gap={3} flexWrap="wrap" fontSize="0.85rem" color="var(--athar-text-muted, #7A6F6D)">
            <HStack gap={1}>
              <Box as="span">✉️</Box>
              <Text dir="ltr" fontWeight="600" color="var(--athar-maroon, #6B1D28)">
                {rsvp.guestEmail}
              </Text>
            </HStack>

            {rsvp.guestPhone && (
              <HStack gap={1}>
                <Box as="span">📞</Box>
                <Text dir="ltr">{rsvp.guestPhone}</Text>
              </HStack>
            )}

            <HStack gap={1}>
              <Box as="span">👥</Box>
              <Text fontWeight="700" color="var(--athar-text-body, #4A4240)">
                {totalSeats} {totalSeats === 1 ? "مقعد (ضيف مفرد)" : `مقاعد (ضيف + ${companions} مرافق)`}
              </Text>
            </HStack>
          </HStack>

          {/* Dynamic Answer Snippet */}
          {customAnswerSnippet && (
            <Text
              fontSize="0.82rem"
              color="var(--athar-text-body, #4A4240)"
              fontStyle="italic"
              bg="rgba(244, 239, 234, 0.6)"
              px={2.5}
              py={1}
              borderRadius="8px"
              maxW="100%"
              style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              💭 "{customAnswerSnippet}"
            </Text>
          )}

          {/* Pass Token indicator if approved */}
          {rsvp.passToken && (
            <HStack gap={2} fontSize="0.75rem" color="var(--athar-status-success, #1E6F50)">
              <Text fontWeight="700">رمز الدخول الرقمي:</Text>
              <Text fontFamily="monospace" bg="rgba(30, 111, 80, 0.08)" px={2} py={0.5} borderRadius="6px">
                {rsvp.passToken}
              </Text>
            </HStack>
          )}
        </VStack>

        {/* Action Buttons Column */}
        <HStack gap={2} flexWrap="wrap" alignSelf={{ base: "stretch", lg: "center" }}>
          {/* Email Preview button */}
          <Button
            size="sm"
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.4)"
            bg="white"
            color="var(--athar-text-body, #4A4240)"
            fontSize="0.8rem"
            fontWeight="600"
            borderRadius="full"
            px={3}
            py={1}
            onClick={handlePreviewEmail}
            _hover={{
              bg: "rgba(244, 239, 234, 0.8)",
              borderColor: "var(--athar-gold, #D4AF37)",
            }}
          >
            ✉️ معاينة البريد
          </Button>

          {/* Approve Button */}
          <Button
            size="sm"
            bg="var(--athar-status-success, #1E6F50)"
            color="white"
            fontSize="0.8rem"
            fontWeight="700"
            borderRadius="full"
            px={4}
            py={1}
            onClick={handleApprove}
            disabled={isActionLoading || rsvp.status === "approved"}
            opacity={rsvp.status === "approved" ? 0.6 : 1}
            cursor={rsvp.status === "approved" ? "default" : "pointer"}
            _hover={
              rsvp.status !== "approved"
                ? {
                    bg: "#15523b",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(30, 111, 80, 0.3)",
                  }
                : undefined
            }
          >
            {rsvp.status === "approved" ? "✓ تم القبول" : "✓ قبول وإرسال QR"}
          </Button>

          {/* Decline Button */}
          <Button
            size="sm"
            bg="rgba(155, 44, 44, 0.12)"
            color="var(--athar-status-danger, #9B2C2C)"
            border="1px solid rgba(155, 44, 44, 0.3)"
            fontSize="0.8rem"
            fontWeight="700"
            borderRadius="full"
            px={4}
            py={1}
            onClick={handleDecline}
            disabled={isActionLoading || rsvp.status === "declined"}
            opacity={rsvp.status === "declined" ? 0.6 : 1}
            cursor={rsvp.status === "declined" ? "default" : "pointer"}
            _hover={
              rsvp.status !== "declined"
                ? {
                    bg: "rgba(155, 44, 44, 0.2)",
                    borderColor: "#9B2C2C",
                  }
                : undefined
            }
          >
            {rsvp.status === "declined" ? "✕ تم الاعتذار" : "✕ اعتذار السعة"}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};
