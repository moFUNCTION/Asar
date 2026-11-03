// Ambient declaration for browser Vite compatibility with packages referencing process.env
declare global {
  const process:
    | {
        env?: Record<string, string | undefined>;
      }
    | undefined;
}

export { ClientRsvpMailbox, type ClientRsvpMailboxProps } from "./ClientRsvpMailbox";
export { RsvpResponseRow, type RsvpResponseRowProps } from "./RsvpResponseRow";
export {
  CapacityProgressBar,
  CapacityMeterBar,
  calculateCapacityStats,
  type CapacityProgressBarProps,
  type CapacityStats,
} from "./CapacityProgressBar";
export {
  EmailNotificationStatusBadge,
  type EmailNotificationStatusBadgeProps,
  type EmailDeliveryStatus,
} from "./EmailNotificationStatusBadge";
export {
  RsvpSubmissionInspector,
  type RsvpSubmissionInspectorProps,
} from "./RsvpSubmissionInspector";
export {
  EmailPreviewAndConfigModal,
  type EmailPreviewAndConfigModalProps,
  type EmailJsConfig,
} from "./EmailPreviewAndConfigModal";
