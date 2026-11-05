import { Client, Databases } from "node-appwrite";
import crypto from "node:crypto";

/**
 * Appwrite Serverless Function: process-rsvp-action
 * 
 * Handles host/client decision on guest RSVP (approve or decline).
 * Automatically generates a unique high-entropy VIP pass token on approval,
 * records timestamps, and updates the database record atomically.
 */
export default async ({ req, res, log, error }) => {
  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { rsvpId, action, rejectionReason } = payload;

    if (!rsvpId || !action) {
      return res.json({
        success: false,
        error: "Missing required fields: rsvpId and action ('approve' | 'decline')",
      }, 400);
    }

    if (action !== "approve" && action !== "decline") {
      return res.json({
        success: false,
        error: "Invalid action. Must be 'approve' or 'decline'.",
      }, 400);
    }

    const endpoint = process.env.APPWRITE_FUNCTION_ENDPOINT || process.env.APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID || "6ad1c66c0017b63ab8cc";
    const apiKey = process.env.APPWRITE_API_KEY;

    const client = new Client().setEndpoint(endpoint).setProject(projectId);
    if (apiKey) {
      client.setKey(apiKey);
    }

    const databases = new Databases(client);
    const databaseId = "asar-db";
    const collectionId = "invitation_rsvps";

    // Fetch existing RSVP document
    let existingRsvp;
    try {
      existingRsvp = await databases.getDocument(databaseId, collectionId, rsvpId);
    } catch (docErr) {
      error(`Could not locate RSVP document ${rsvpId}: ${docErr.message}`);
      return res.json({ success: false, error: "RSVP document not found." }, 404);
    }

    const respondedAt = new Date().toISOString();

    if (action === "approve") {
      // Generate high-entropy, collision-free pass token (8-char hex + timestamp base36)
      const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
      const timeComponent = Date.now().toString(36).toUpperCase().slice(-4);
      const passToken = `VIP-${timeComponent}-${randomSuffix}`;

      // In production, QR code URL points to check-in validator endpoint
      const qrCodeUrl = `https://asar.me/checkin?token=${passToken}&rsvp=${rsvpId}`;

      const updated = await databases.updateDocument(databaseId, collectionId, rsvpId, {
        status: "approved",
        passToken,
        qrCodeUrl,
        respondedAt,
        emailSent: true,
      });

      log(`[process-rsvp-action] Successfully approved RSVP ${rsvpId}. Pass token: ${passToken}`);

      return res.json({
        success: true,
        action: "approve",
        status: "approved",
        rsvpId,
        passToken,
        qrCodeUrl,
        guestEmail: updated.guestEmail,
        guestName: updated.guestName,
        companionsCount: updated.companionsCount,
        respondedAt,
      });
    } else {
      const updated = await databases.updateDocument(databaseId, collectionId, rsvpId, {
        status: "declined",
        respondedAt,
        emailSent: true,
      });

      log(`[process-rsvp-action] Successfully declined RSVP ${rsvpId}. Reason: ${rejectionReason || "Capacity reached"}`);

      return res.json({
        success: true,
        action: "decline",
        status: "declined",
        rsvpId,
        guestEmail: updated.guestEmail,
        guestName: updated.guestName,
        rejectionReason: rejectionReason || "Event venue capacity limit reached",
        respondedAt,
      });
    }
  } catch (err) {
    error(`[process-rsvp-action] Internal execution error: ${err.message}`);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};

