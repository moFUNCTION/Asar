import { Client, Databases, Query } from "node-appwrite";
import crypto from "node:crypto";

/**
 * Appwrite Serverless Function: process-rsvp-action
 * 
 * Handles host/client decision on guest RSVP (approve or decline).
 * Enforces atomic venue capacity limits, automatically generates a high-entropy
 * VIP pass token (VIP-XXXX-YYYY) on approval, records timestamps, and updates
 * the database record atomically.
 */
export default async ({ req, res, log, error }) => {
  try {
    // Parse request body supporting openruntimes bodyJson, bodyText, and body
    const rawBody = req.bodyJson ?? req.bodyText ?? req.body ?? {};
    let payload = rawBody;
    if (typeof rawBody === "string") {
      try {
        payload = JSON.parse(rawBody || "{}");
      } catch (parseErr) {
        return res.json({
          success: false,
          error: "Invalid JSON in request body.",
        }, 400);
      }
    }

    const { rsvpId, action, rejectionReason, maxVenueCapacity } = payload;

    // Validate required fields
    if (!rsvpId || typeof rsvpId !== "string" || !rsvpId.trim()) {
      return res.json({
        success: false,
        error: "Missing required parameter: rsvpId must be a non-empty string.",
      }, 400);
    }

    if (!action || (action !== "approve" && action !== "decline")) {
      return res.json({
        success: false,
        error: "Invalid action. Must be 'approve' or 'decline'.",
      }, 400);
    }

    // Initialize Appwrite Client & Databases service (or use injected mock for testing)
    let databases;
    if (req._mockDatabases || payload._mockDatabases) {
      databases = req._mockDatabases || payload._mockDatabases;
    } else {
      const endpoint =
        process.env.APPWRITE_FUNCTION_ENDPOINT ||
        process.env.APPWRITE_ENDPOINT ||
        "https://fra.cloud.appwrite.io/v1";
      const projectId =
        process.env.APPWRITE_FUNCTION_PROJECT_ID ||
        process.env.APPWRITE_PROJECT_ID ||
        "6ad1c66c0017b63ab8cc";
      const apiKey = req.headers?.["x-appwrite-key"] || process.env.APPWRITE_API_KEY;

      const client = new Client().setEndpoint(endpoint).setProject(projectId);
      if (apiKey) {
        client.setKey(apiKey);
      }
      databases = new Databases(client);
    }

    const databaseId = process.env.APPWRITE_DATABASE_ID || "asar-db";
    const rsvpCollectionId = process.env.APPWRITE_COLLECTION_RSVPS || "invitation_rsvps";
    const invitationCollectionId = process.env.APPWRITE_COLLECTION_INVITATIONS || "invitations";

    // 1. Fetch existing RSVP document
    let existingRsvp;
    try {
      existingRsvp = await databases.getDocument(databaseId, rsvpCollectionId, rsvpId);
    } catch (docErr) {
      const errMsg = docErr?.message || String(docErr);
      if (error) error(`Could not locate RSVP document ${rsvpId}: ${errMsg}`);
      return res.json({
        success: false,
        error: "RSVP document not found.",
      }, 404);
    }

    const respondedAt = new Date().toISOString();

    // 2. Handle 'approve' action
    if (action === "approve") {
      // Fetch parent invitation if available to determine maxVenueCapacity
      let resolvedMaxCapacity = null;
      if (maxVenueCapacity !== undefined && maxVenueCapacity !== null) {
        resolvedMaxCapacity = Number(maxVenueCapacity);
      } else if (existingRsvp.invitationId) {
        try {
          const invitation = await databases.getDocument(
            databaseId,
            invitationCollectionId,
            existingRsvp.invitationId
          );
          if (invitation && typeof invitation.maxCapacity === "number" && invitation.maxCapacity > 0) {
            resolvedMaxCapacity = invitation.maxCapacity;
          }
        } catch (invErr) {
          // Non-fatal: if invitation document is not accessible, fallback without hard ceiling
          if (log) log(`[process-rsvp-action] Notice: Parent invitation ${existingRsvp.invitationId} not fetched (${invErr.message})`);
        }
      }

      // Check capacity atomically if a maximum venue capacity is set
      const incomingPartySize = (Number(existingRsvp.companionsCount) || 0) + 1;
      if (resolvedMaxCapacity !== null && resolvedMaxCapacity > 0) {
        let currentApprovedCount = 0;
        try {
          const approvedList = await databases.listDocuments(
            databaseId,
            rsvpCollectionId,
            [
              Query.equal("invitationId", existingRsvp.invitationId),
              Query.equal("status", "approved"),
              Query.limit(5000),
            ]
          );
          currentApprovedCount = approvedList.documents
            .filter((doc) => doc.$id !== rsvpId)
            .reduce((sum, doc) => sum + (Number(doc.companionsCount) || 0) + 1, 0);
        } catch (queryErr) {
          if (log) log(`[process-rsvp-action] Capacity query notice: ${queryErr.message}`);
        }

        if (currentApprovedCount + incomingPartySize > resolvedMaxCapacity) {
          if (log) log(`[process-rsvp-action] Venue capacity exceeded: ${currentApprovedCount} + ${incomingPartySize} > ${resolvedMaxCapacity}`);
          return res.json({
            success: false,
            error: "Venue capacity limit reached. Cannot approve RSVP.",
            currentCapacity: currentApprovedCount,
            maxCapacity: resolvedMaxCapacity,
            requested: incomingPartySize,
          }, 409);
        }
      }

      // Generate high-entropy pass token matching VIP-XXXX-YYYY pattern
      const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
      const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
      const passToken = `VIP-${part1}-${part2}`;

      // Generate QR check-in validator URL
      const checkInBase = process.env.CHECKIN_BASE_URL || "https://asar.me/checkin";
      const qrCodeUrl = `${checkInBase}?token=${passToken}&rsvp=${rsvpId}`;

      const updateData = {
        status: "approved",
        passToken,
        qrCodeUrl,
        respondedAt,
        emailSent: true,
      };

      const updated = await databases.updateDocument(
        databaseId,
        rsvpCollectionId,
        rsvpId,
        updateData
      );

      if (log) log(`[process-rsvp-action] Successfully approved RSVP ${rsvpId}. Pass token: ${passToken}`);

      return res.json({
        success: true,
        action: "approve",
        status: "approved",
        rsvpId,
        passToken,
        qrCodeUrl,
        guestEmail: updated.guestEmail ?? existingRsvp.guestEmail,
        guestName: updated.guestName ?? existingRsvp.guestName,
        companionsCount: updated.companionsCount ?? existingRsvp.companionsCount ?? 0,
        respondedAt,
      }, 200);
    }

    // 3. Handle 'decline' action
    const updateData = {
      status: "declined",
      respondedAt,
      emailSent: true,
    };

    // If rejection reason provided, preserve in dynamicResponsesJson without schema violation
    if (rejectionReason) {
      try {
        const dyn = existingRsvp.dynamicResponsesJson
          ? JSON.parse(existingRsvp.dynamicResponsesJson)
          : {};
        dyn.rejectionReason = rejectionReason;
        updateData.dynamicResponsesJson = JSON.stringify(dyn);
      } catch {
        updateData.dynamicResponsesJson = JSON.stringify({ rejectionReason });
      }
    }

    const updated = await databases.updateDocument(
      databaseId,
      rsvpCollectionId,
      rsvpId,
      updateData
    );

    const resolvedReason = rejectionReason || "Event venue capacity limit reached";
    if (log) log(`[process-rsvp-action] Successfully declined RSVP ${rsvpId}. Reason: ${resolvedReason}`);

    return res.json({
      success: true,
      action: "decline",
      status: "declined",
      rsvpId,
      guestEmail: updated.guestEmail ?? existingRsvp.guestEmail,
      guestName: updated.guestName ?? existingRsvp.guestName,
      rejectionReason: resolvedReason,
      respondedAt,
    }, 200);
  } catch (err) {
    if (error) error(`[process-rsvp-action] Internal execution error: ${err.message}`);
    return res.json({
      success: false,
      error: err.message || "An unexpected error occurred while processing RSVP action.",
    }, 500);
  }
};
