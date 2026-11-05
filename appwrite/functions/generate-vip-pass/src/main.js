import crypto from "node:crypto";

/**
 * Appwrite Serverless Function: generate-vip-pass
 * 
 * Issues and signs digital VIP passes with verifiable metadata for
 * real-time check-in and door verification, matching standards of
 * The Knot and Bliss & Bone.
 */
export default async ({ req, res, log, error }) => {
  try {
    const rawBody = req.bodyJson ?? req.bodyText ?? req.body ?? {};
    let payload = rawBody;
    if (typeof rawBody === "string") {
      try {
        payload = JSON.parse(rawBody || "{}");
      } catch (parseErr) {
        return res.json({ success: false, error: "Invalid JSON in request body." }, 400);
      }
    }
    const { rsvpId, guestName, companionsCount = 0, invitationSlug, eventTitle } = payload;

    if (!rsvpId || !guestName) {
      return res.json({
        success: false,
        error: "Missing required parameters: rsvpId and guestName.",
      }, 400);
    }

    const issuedAt = new Date().toISOString();
    const entropy = crypto.randomBytes(6).toString("hex").toUpperCase();
    const token = `ASAR-PASS-${entropy.slice(0, 4)}-${entropy.slice(4)}`;

    // Generate tamper-evident HMAC signature using project secret or internal key
    const secretKey = process.env.APPWRITE_API_KEY || "asar_internal_secret_hmac_2026";
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(`${rsvpId}:${guestName}:${token}:${issuedAt}`)
      .digest("hex")
      .slice(0, 16);

    const passPayload = {
      token,
      rsvpId,
      guestName,
      companionsCount: Number(companionsCount) || 0,
      totalGuests: (Number(companionsCount) || 0) + 1,
      invitationSlug: invitationSlug || "event",
      eventTitle: eventTitle || "Exclusive Celebration",
      signature,
      issuedAt,
      checkInUrl: `https://${invitationSlug || "asar"}.asar.me/checkin?token=${token}&sig=${signature}`,
    };

    log(`[generate-vip-pass] Generated digital pass ${token} for ${guestName} (party of ${passPayload.totalGuests})`);

    return res.json({
      success: true,
      pass: passPayload,
    });
  } catch (err) {
    error(`[generate-vip-pass] Error: ${err.message}`);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};

