import React from "react";
import { Box, Flex, HStack, VStack, Text, Badge } from "@chakra-ui/react";
import type { InvitationRsvp } from "@repo/react-appwrite";

export interface CapacityStats {
  confirmedSeats: number;
  pendingSeats: number;
  declinedSeats: number;
  totalRequestedSeats: number;
  maxCapacity: number;
  percentage: number;
  remainingSeats: number;
  isNearCapacity: boolean;
  isAtCapacity: boolean;
  statusColor: "emerald" | "amber" | "maroon";
}

/**
 * Calculates seat allocation and capacity metrics based on guest submissions and max capacity.
 * Each guest reservation occupies (1 + companionsCount) seats.
 */
export function calculateCapacityStats(params: {
  rsvps: Partial<InvitationRsvp>[];
  maxCapacity?: number;
}): CapacityStats {
  const { rsvps, maxCapacity = 150 } = params;
  const safeCapacity = Math.max(1, maxCapacity);

  let confirmedSeats = 0;
  let pendingSeats = 0;
  let declinedSeats = 0;

  for (const rsvp of rsvps) {
    const companions = Math.max(0, Number(rsvp.companionsCount) || 0);
    const guestSeats = 1 + companions;

    if (rsvp.status === "approved") {
      confirmedSeats += guestSeats;
    } else if (rsvp.status === "declined") {
      declinedSeats += guestSeats;
    } else {
      // Pending or any other status
      pendingSeats += guestSeats;
    }
  }

  const totalRequestedSeats = confirmedSeats + pendingSeats + declinedSeats;
  const rawPercentage = (confirmedSeats / safeCapacity) * 100;
  const percentage = Math.round(rawPercentage);
  const remainingSeats = Math.max(0, safeCapacity - confirmedSeats);
  const isNearCapacity = percentage >= 80 && percentage < 100;
  const isAtCapacity = percentage >= 100;

  let statusColor: "emerald" | "amber" | "maroon" = "emerald";
  if (isAtCapacity) {
    statusColor = "maroon";
  } else if (isNearCapacity) {
    statusColor = "amber";
  }

  return {
    confirmedSeats,
    pendingSeats,
    declinedSeats,
    totalRequestedSeats,
    maxCapacity: safeCapacity,
    percentage,
    remainingSeats,
    isNearCapacity,
    isAtCapacity,
    statusColor,
  };
}

export interface CapacityProgressBarProps {
  rsvps?: Partial<InvitationRsvp>[];
  maxCapacity?: number;
  venueName?: string;
}

export const CapacityProgressBar: React.FC<CapacityProgressBarProps> = ({
  rsvps = [],
  maxCapacity = 150,
  venueName = "قاعة الحفل الرئيسية — Grand Ballroom",
}) => {
  const stats = calculateCapacityStats({ rsvps, maxCapacity });

  // Determine progress bar fill gradient and shadow based on status
  let barGradient = "linear-gradient(90deg, #1E6F50 0%, #D4AF37 100%)";
  let barColor = "#1E6F50";
  let statusBadgeLabel = "سعة مريحة (أقل من 80%)";
  let badgeBorder = "rgba(30, 111, 80, 0.4)";
  let badgeColor = "#1E6F50";
  let badgeBg = "rgba(30, 111, 80, 0.1)";

  if (stats.isAtCapacity) {
    barGradient = "linear-gradient(90deg, #9B2C2C 0%, #6B1D28 100%)";
    barColor = "#6B1D28";
    statusBadgeLabel = "السعة مكتملة بالكامل (100%+)";
    badgeBorder = "rgba(107, 29, 40, 0.4)";
    badgeColor = "#6B1D28";
    badgeBg = "rgba(107, 29, 40, 0.12)";
  } else if (stats.isNearCapacity) {
    barGradient = "linear-gradient(90deg, #D4AF37 0%, #B7791F 100%)";
    barColor = "#B7791F";
    statusBadgeLabel = "اقتراب اكتمال السعة (80% - 99%)";
    badgeBorder = "rgba(183, 121, 31, 0.4)";
    badgeColor = "#B7791F";
    badgeBg = "rgba(212, 175, 55, 0.18)";
  }

  const clampedWidth = Math.min(100, Math.max(0, stats.percentage));

  return (
    <Box
      bg="rgba(255, 255, 255, 0.95)"
      borderRadius="24px"
      p={{ base: 4, md: 6 }}
      border="1px solid rgba(107, 29, 40, 0.1)"
      boxShadow="0 10px 30px -10px rgba(107, 29, 40, 0.06)"
      dir="rtl"
    >
      {/* Top Header Row */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap={3}
        mb={4}
      >
        <VStack align="flex-start" gap={1}>
          <HStack gap={2}>
            <Text
              fontSize="1.1rem"
              fontWeight="800"
              color="var(--athar-text-title, #231F20)"
              fontFamily="var(--font-body, 'Cairo', sans-serif)"
            >
              مؤشر الطاقة الاستيعابية للقاعة
            </Text>
            <Badge
              variant="outline"
              borderColor={badgeBorder}
              bg={badgeBg}
              color={badgeColor}
              px={3}
              py={0.5}
              borderRadius="full"
              fontSize="0.75rem"
              fontWeight="700"
            >
              {statusBadgeLabel}
            </Badge>
          </HStack>
          <Text
            fontSize="0.85rem"
            color="var(--athar-text-muted, #7A6F6D)"
            fontFamily="var(--font-body, 'Cairo', sans-serif)"
          >
            {venueName} • السعة القصوى: {stats.maxCapacity} مقعد
          </Text>
        </VStack>

        {/* Live Numerals Summary */}
        <HStack gap={3}>
          <Box textAlign="center" px={3} py={1.5} bg="rgba(244, 239, 234, 0.7)" borderRadius="12px">
            <Text fontSize="0.72rem" color="var(--athar-text-muted, #7A6F6D)" fontWeight="600">
              المقاعد المؤكدة
            </Text>
            <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
              {stats.confirmedSeats} <Text as="span" fontSize="0.8rem" color="#7A6F6D">/ {stats.maxCapacity}</Text>
            </Text>
          </Box>

          <Box textAlign="center" px={3} py={1.5} bg="rgba(244, 239, 234, 0.7)" borderRadius="12px">
            <Text fontSize="0.72rem" color="var(--athar-text-muted, #7A6F6D)" fontWeight="600">
              النسبة
            </Text>
            <Text fontSize="1.15rem" fontWeight="800" color={barColor}>
              {stats.percentage}%
            </Text>
          </Box>
        </HStack>
      </Flex>

      {/* Visual Meter Bar */}
      <Box
        w="100%"
        h="14px"
        bg="rgba(107, 29, 40, 0.08)"
        borderRadius="full"
        overflow="hidden"
        position="relative"
        boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.1)"
        mb={4}
      >
        <Box
          h="100%"
          w={`${clampedWidth}%`}
          bg={barGradient}
          borderRadius="full"
          transition="width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
          position="relative"
        />
      </Box>

      {/* Bottom Metrics Details */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={3}
        pt={2}
        borderTop="1px solid rgba(107, 29, 40, 0.06)"
      >
        <HStack gap={4} flexWrap="wrap">
          <HStack gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg="#1E6F50" />
            <Text fontSize="0.82rem" color="var(--athar-text-body, #4A4240)">
              مؤكد: <strong>{stats.confirmedSeats} مقعد</strong>
            </Text>
          </HStack>

          <HStack gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg="#B7791F" />
            <Text fontSize="0.82rem" color="var(--athar-text-body, #4A4240)">
              قيد المراجعة: <strong>{stats.pendingSeats} مقعد مطلوب</strong>
            </Text>
          </HStack>

          <HStack gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg="#7A6F6D" />
            <Text fontSize="0.82rem" color="var(--athar-text-body, #4A4240)">
              المقاعد الشاغرة: <strong>{stats.remainingSeats} مقعد</strong>
            </Text>
          </HStack>
        </HStack>

        {stats.isAtCapacity && (
          <Text
            fontSize="0.8rem"
            color="var(--athar-maroon, #6B1D28)"
            fontWeight="700"
            bg="rgba(107, 29, 40, 0.08)"
            px={3}
            py={1}
            borderRadius="full"
          >
            ⚠️ تنبيه: تم الوصول للطاقة الاستيعابية، الاعتذار للمزيد سيرسل رسالة السعة تلقائياً
          </Text>
        )}
      </Flex>
    </Box>
  );
};

// Also export CapacityMeterBar as alias for architectural compatibility
export const CapacityMeterBar = CapacityProgressBar;
