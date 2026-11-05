export interface RsvpDecisionEmailParams {
    decision: "approved" | "declined";
    toEmail: string;
    toName: string;
    eventTitle: string;
    eventDate?: string;
    eventTime?: string;
    venueName?: string;
    venueAddress?: string;
    venueMapUrl?: string;
    passLink?: string;
    rsvpId?: string;
    passToken?: string;
    customMessage?: string;
    serviceId?: string;
    publicKey?: string;
    templateApprovedId?: string;
    templateDeclinedId?: string;
}
export interface RsvpEmailDispatchResult {
    success: boolean;
    simulated: boolean;
    message: string;
    emailSubject: string;
    emailBodyPreview: string;
    qrCodeUrl?: string;
    error?: string;
}
/**
 * Builds a high-contrast luxury QR Code image URL matching ASAR brand styling (#6B1D28 on #FBF7F2)
 * Primary: Appwrite Avatars QR endpoint if configured
 * Fallback: Reliable public QR code generator API
 */
export declare function buildQrCodeImageUrl(targetUrl: string, size?: number, endpoint?: string, projectId?: string): string;
/**
 * Dispatches an automated RSVP decision email to a guest via EmailJS REST API
 * Handles missing configuration keys gracefully with rich simulation feedback.
 */
export declare function sendRsvpDecisionEmail(params: RsvpDecisionEmailParams): Promise<RsvpEmailDispatchResult>;
//# sourceMappingURL=emailJsService.d.ts.map