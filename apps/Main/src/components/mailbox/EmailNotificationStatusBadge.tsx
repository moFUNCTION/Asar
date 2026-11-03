import React from "react";
import { Badge, HStack, Box, Text } from "@chakra-ui/react";

export type EmailDeliveryStatus = "sent" | "simulated" | "pending" | "failed";

export interface EmailNotificationStatusBadgeProps {
  status?: EmailDeliveryStatus;
  emailSent?: boolean;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export const EmailNotificationStatusBadge: React.FC<EmailNotificationStatusBadgeProps> = ({
  status,
  emailSent,
  size = "sm",
  showIcon = true,
}) => {
  // Infer status from emailSent flag if status is not explicitly provided
  let resolvedStatus: EmailDeliveryStatus = "pending";
  if (status) {
    resolvedStatus = status;
  } else if (emailSent) {
    resolvedStatus = "sent";
  }

  let label = "بانتظار الإرسال";
  let icon = "⏳";
  let bg = "rgba(122, 111, 109, 0.1)";
  let color = "var(--athar-text-muted, #7A6F6D)";
  let borderColor = "rgba(122, 111, 109, 0.3)";

  switch (resolvedStatus) {
    case "sent":
      label = "تم الإرسال (EmailJS)";
      icon = "✓";
      bg = "rgba(30, 111, 80, 0.12)";
      color = "#1E6F50";
      borderColor = "rgba(30, 111, 80, 0.4)";
      break;
    case "simulated":
      label = "محاكاة العرض (Simulated)";
      icon = "✦";
      bg = "rgba(212, 175, 55, 0.18)";
      color = "#B7791F";
      borderColor = "rgba(212, 175, 55, 0.45)";
      break;
    case "failed":
      label = "تعذر الإرسال";
      icon = "✕";
      bg = "rgba(155, 44, 44, 0.12)";
      color = "#9B2C2C";
      borderColor = "rgba(155, 44, 44, 0.4)";
      break;
    case "pending":
    default:
      label = "بانتظار القرار والإرسال";
      icon = "⏳";
      bg = "rgba(122, 111, 109, 0.08)";
      color = "#7A6F6D";
      borderColor = "rgba(122, 111, 109, 0.25)";
      break;
  }

  const isSmall = size === "sm";

  return (
    <Badge
      variant="outline"
      borderColor={borderColor}
      bg={bg}
      color={color}
      px={isSmall ? 2.5 : 3.5}
      py={isSmall ? 0.5 : 1}
      borderRadius="full"
      fontSize={isSmall ? "0.72rem" : "0.82rem"}
      fontWeight="700"
      fontFamily="var(--font-body, 'Cairo', sans-serif)"
      display="inline-flex"
      alignItems="center"
    >
      <HStack gap={1.5} align="center">
        {showIcon && (
          <Box as="span" fontSize={isSmall ? "0.7rem" : "0.8rem"} lineHeight="1">
            {icon}
          </Box>
        )}
        <Text as="span" lineHeight="1">
          {label}
        </Text>
      </HStack>
    </Badge>
  );
};
