// =============================================================
// ASAR (Athar / أثر) — EmailJS Dispatcher & QR Code URL Helper
// =============================================================
const getEnv = (key) => {
    if (typeof globalThis !== "undefined" && globalThis.process?.env) {
        return globalThis.process.env[key] || "";
    }
    return "";
};
/**
 * Builds a high-contrast luxury QR Code image URL matching ASAR brand styling (#6B1D28 on #FBF7F2)
 * Primary: Appwrite Avatars QR endpoint if configured
 * Fallback: Reliable public QR code generator API
 */
export function buildQrCodeImageUrl(targetUrl, size = 500, endpoint, projectId) {
    const cleanTarget = (targetUrl || "https://asar.audio").trim();
    const encodedUrl = encodeURIComponent(cleanTarget);
    // Check passed endpoint or environment variable
    const resolvedEndpoint = endpoint || getEnv("VITE_APPWRITE_ENDPOINT");
    const resolvedProject = projectId || getEnv("VITE_APPWRITE_PROJECT_ID");
    if (resolvedEndpoint && resolvedProject) {
        const base = resolvedEndpoint.replace(/\/+$/, "");
        return `${base}/avatars/qr?text=${encodedUrl}&size=${size}&margin=2&project=${resolvedProject}`;
    }
    // High-contrast luxury fallback using ASAR Brand Colors (Maroon #6B1D28 on Alabaster #FBF7F2)
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=6B1D28&bgcolor=FBF7F2&data=${encodedUrl}`;
}
/**
 * Dispatches an automated RSVP decision email to a guest via EmailJS REST API
 * Handles missing configuration keys gracefully with rich simulation feedback.
 */
export async function sendRsvpDecisionEmail(params) {
    const { decision, toEmail, toName, eventTitle, eventDate = "TBD", eventTime = "", venueName = "Grand Ballroom", venueAddress = "", venueMapUrl = "", passLink = "", rsvpId = "", passToken = "", customMessage, } = params;
    // Determine QR code URL for approved passes
    const finalPassLink = passLink ||
        (rsvpId ? `https://asar.audio/pass/${rsvpId}?token=${passToken}` : "https://asar.audio");
    const qrCodeUrl = decision === "approved" ? buildQrCodeImageUrl(finalPassLink, 500) : undefined;
    // Construct standard diplomatic messaging
    const isApproved = decision === "approved";
    const emailSubject = isApproved
        ? `تأكيد حضوركم ودعوتكم الرسمية — ${eventTitle}`
        : `بخصوص دعوتكم لحضور — ${eventTitle}`;
    const defaultApprovedMessage = `يسعدنا ويشرفنا تأكيد حضوركم الكريم في "${eventTitle}". ` +
        `مرفق بطاقة الدعوة ورمز الدخول الرقمي (QR Code) الخاص بكم وبمرافقيكم. نتطلع لرؤيتكم ومشاركتكم أسعد اللحظات!`;
    const defaultDeclinedMessage = `نعتذر بشدة ونحيطكم علماً بأنه نظراً لمحدودية السعة الاستيعابية المتاحة بالقاعة والالتزام الصارم بالطاقة المحددة، ` +
        `يتعذر علينا تأكيد مقاعد إضافية في الوقت الحالي. نقدر محبتكم الصادقة وتفهمكم، وخالص أمنياتنا بدوام الأفراح والمحبة.`;
    const finalMessage = customMessage?.trim() ||
        (isApproved ? defaultApprovedMessage : defaultDeclinedMessage);
    const emailBodyPreview = `
=====================================================
[ASAR INVITATIONS — EMAILJS DISPATCH]
To: ${toName} <${toEmail}>
Subject: ${emailSubject}
Event: ${eventTitle} (${eventDate}${eventTime ? " " + eventTime : ""})
Venue: ${venueName}
Decision: ${decision.toUpperCase()}
-----------------------------------------------------
Message:
${finalMessage}
${qrCodeUrl ? `\nQR Pass URL: ${qrCodeUrl}\nDirect Mobile Pass: ${finalPassLink}` : ""}
=====================================================
`.trim();
    // Resolve EmailJS credentials from params or environment
    const serviceId = params.serviceId || getEnv("VITE_EMAILJS_SERVICE_ID");
    const publicKey = params.publicKey || getEnv("VITE_EMAILJS_PUBLIC_KEY");
    const templateId = isApproved
        ? params.templateApprovedId ||
            getEnv("VITE_EMAILJS_TEMPLATE_RSVP_APPROVED") ||
            "template_rsvp_approved"
        : params.templateDeclinedId ||
            getEnv("VITE_EMAILJS_TEMPLATE_RSVP_DECLINED") ||
            "template_rsvp_declined";
    // If EmailJS credentials are not configured, simulate successful delivery cleanly
    if (!serviceId || !publicKey) {
        if (typeof console !== "undefined" && console.info) {
            console.info("[EmailJS Service] Notice: VITE_EMAILJS_SERVICE_ID or VITE_EMAILJS_PUBLIC_KEY not set. Running in simulation mode.");
            console.info(emailBodyPreview);
        }
        return {
            success: true,
            simulated: true,
            message: isApproved
                ? `تم إرسال بطاقة الدعوة ورمز QR بنجاح إلى ${toEmail} (وضع المعاينة)`
                : `تم إرسال رسالة الاعتذار الدبلوماسية بنجاح إلى ${toEmail} (وضع المعاينة)`,
            emailSubject,
            emailBodyPreview,
            qrCodeUrl,
        };
    }
    // Live REST API dispatch
    try {
        const payload = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: {
                to_email: toEmail,
                to_name: toName,
                event_title: eventTitle,
                event_date: eventDate,
                event_time: eventTime,
                venue_name: venueName,
                venue_address: venueAddress,
                venue_map_url: venueMapUrl,
                pass_link: finalPassLink,
                qr_code_url: qrCodeUrl || "",
                message: finalMessage,
            },
        };
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            return {
                success: true,
                simulated: false,
                message: isApproved
                    ? `تم إرسال بطاقة الدعوة بنجاح إلى ${toEmail}`
                    : `تم إرسال رسالة الاعتذار بنجاح إلى ${toEmail}`,
                emailSubject,
                emailBodyPreview,
                qrCodeUrl,
            };
        }
        const responseText = await response.text().catch(() => "");
        const errorMsg = `EmailJS API error (${response.status}): ${responseText || response.statusText}`;
        return {
            success: false,
            simulated: false,
            message: `فشل إرسال البريد: ${errorMsg}`,
            emailSubject,
            emailBodyPreview,
            qrCodeUrl,
            error: errorMsg,
        };
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            simulated: false,
            message: `حدث خطأ أثناء الاتصال بخدمة البريد: ${errorMsg}`,
            emailSubject,
            emailBodyPreview,
            qrCodeUrl,
            error: errorMsg,
        };
    }
}
