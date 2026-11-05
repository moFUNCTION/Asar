// =============================================================
// ASAR (Athar / أثر) — E2E Test Harness & Execution Utilities
// =============================================================

import crypto from "node:crypto";
import generateVipPassHandler from "../../../appwrite/functions/generate-vip-pass/src/main.js";

/**
 * OpenRuntimes Context Interface for Appwrite Cloud Functions
 */
export interface OpenRuntimesContext {
  req: {
    body: any;
    headers?: Record<string, string>;
    method?: string;
  };
  res: {
    json: (data: any, statusCode?: number) => { statusCode: number; data: any };
    send: (data: any, statusCode?: number) => { statusCode: number; data: any };
  };
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface ExecutionResult {
  statusCode: number;
  data: any;
  logs: string[];
  errors: string[];
}

/**
 * Creates a mock OpenRuntimes invocation context capturing output, logs, and errors
 */
export function createMockOpenRuntimesContext(
  body: any,
  options?: {
    headers?: Record<string, string>;
    method?: string;
  }
): { context: OpenRuntimesContext; getResult: () => ExecutionResult } {
  let responseData: any = null;
  let responseCode = 200;
  const logs: string[] = [];
  const errors: string[] = [];

  const context: OpenRuntimesContext = {
    req: {
      body,
      headers: options?.headers || { "content-type": "application/json" },
      method: options?.method || "POST",
    },
    res: {
      json: (data: any, statusCode = 200) => {
        responseData = data;
        responseCode = statusCode;
        return { statusCode, data };
      },
      send: (data: any, statusCode = 200) => {
        responseData = data;
        responseCode = statusCode;
        return { statusCode, data };
      },
    },
    log: (...args: any[]) => {
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
    },
    error: (...args: any[]) => {
      errors.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
    },
  };

  return {
    context,
    getResult: () => ({
      statusCode: responseCode,
      data: responseData,
      logs,
      errors,
    }),
  };
}

/**
 * Executes generate-vip-pass cloud function with mock context
 */
export async function executeGenerateVipPass(body: any): Promise<ExecutionResult> {
  const { context, getResult } = createMockOpenRuntimesContext(body);
  await (generateVipPassHandler as any)(context);
  return getResult();
}

/**
 * Contract evaluator for process-rsvp-action (conforming strictly to PROJECT.md § Interface Contracts: 1)
 */
export async function evaluateProcessRsvpActionContract(
  body: any,
  mockDatabase?: Map<string, any>
): Promise<ExecutionResult> {
  const { context, getResult } = createMockOpenRuntimesContext(body);

  let payload: any = {};
  if (typeof context.req.body === "string") {
    const trimmed = context.req.body.trim();
    if (!trimmed) {
      context.res.json({ success: false, error: "Empty request body" }, 400);
      return getResult();
    }
    try {
      payload = JSON.parse(trimmed);
    } catch {
      context.res.json({ success: false, error: "Malformed JSON payload" }, 400);
      return getResult();
    }
  } else {
    payload = context.req.body || {};
  }
  const { rsvpId, action, rejectionReason } = payload;

  if (!rsvpId || !action) {
    context.res.json({
      success: false,
      error: "Missing required fields: rsvpId and action ('approve' | 'decline')",
    }, 400);
    return getResult();
  }

  if (action !== "approve" && action !== "decline") {
    context.res.json({
      success: false,
      error: "Invalid action. Must be 'approve' or 'decline'.",
    }, 400);
    return getResult();
  }

  if (mockDatabase && !mockDatabase.has(rsvpId)) {
    context.res.json({ success: false, error: "RSVP document not found." }, 404);
    return getResult();
  }

  const existingDoc = mockDatabase ? mockDatabase.get(rsvpId) : { guestEmail: "guest@example.com", guestName: "ضيف تجريبي", companionsCount: 1 };
  const respondedAt = new Date().toISOString();

  if (action === "approve") {
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const timeComponent = Date.now().toString(36).toUpperCase().slice(-4);
    const passToken = `VIP-${timeComponent}-${randomSuffix}`;
    const qrCodeUrl = `https://asar.me/checkin?token=${passToken}&rsvp=${rsvpId}`;

    if (mockDatabase) {
      mockDatabase.set(rsvpId, {
        ...existingDoc,
        status: "approved",
        passToken,
        qrCodeUrl,
        respondedAt,
        emailSent: true,
      });
    }

    context.res.json({
      success: true,
      action: "approve",
      status: "approved",
      rsvpId,
      passToken,
      qrCodeUrl,
      guestEmail: existingDoc.guestEmail,
      guestName: existingDoc.guestName,
      companionsCount: existingDoc.companionsCount,
      respondedAt,
    }, 200);
  } else {
    if (mockDatabase) {
      mockDatabase.set(rsvpId, {
        ...existingDoc,
        status: "declined",
        respondedAt,
        rejectionReason: rejectionReason || "Event venue capacity limit reached",
        emailSent: true,
      });
    }

    context.res.json({
      success: true,
      action: "decline",
      status: "declined",
      rsvpId,
      guestEmail: existingDoc.guestEmail,
      guestName: existingDoc.guestName,
      rejectionReason: rejectionReason || "Event venue capacity limit reached",
      respondedAt,
    }, 200);
  }

  return getResult();
}

/**
 * Fixture: Sample 11 Modular Section definitions conforming to ASAR Section catalog
 */
export const SAMPLE_MODULAR_SECTIONS = [
  { id: "sec_hero", type: "cover_hero", title: "غلاف الحفل الترحيبي", enabled: true, order: 1 },
  { id: "sec_story", type: "couple_story", title: "قصة اللقاء والأثر", enabled: true, order: 2 },
  { id: "sec_schedule", type: "event_schedule", title: "جدول فقرات الحفل", enabled: true, order: 3 },
  { id: "sec_gallery", type: "photo_gallery", title: "معرض الصور الملكي", enabled: true, order: 4 },
  { id: "sec_wishing", type: "wishing_wall", title: "جدار الأمنيات والتهاني", enabled: true, order: 5 },
  { id: "sec_gift", type: "digital_gift_registry", title: "صندوق الهدايا الرقمي", enabled: true, order: 6 },
  { id: "sec_audio", type: "background_audio", title: "الموسيقى التصويرية", enabled: true, order: 7 },
  { id: "sec_venue", type: "venue_location", title: "موقع القاعة ومخطط الوصول", enabled: true, order: 8 },
  { id: "sec_countdown", type: "live_countdown", title: "العد التنازلي للحدث", enabled: true, order: 9 },
  { id: "sec_highlight", type: "custom_highlight", title: "إضاءة خاصة", enabled: true, order: 10 },
  { id: "sec_rsvp", type: "dynamic_rsvp", title: "تأكيد الحضور الذكي", enabled: true, order: 11 },
];
