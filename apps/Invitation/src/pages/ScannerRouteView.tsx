import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { VenueQrScanner } from "../components/pass";
import type { InvitationRsvpDocument } from "../components/renderer/types";
import { DEMO_APPROVED_PASS } from "./GuestPassPage";

export interface ScannerRouteViewProps {
  invitationId?: string;
  initialToken?: string;
  onClose?: () => void;
}

export interface TokenValidationResult {
  isValid: boolean;
  normalizedToken: string;
  status: "valid" | "empty" | "malformed" | "unregistered";
  message: string;
}

/**
 * Safely extracts raw token or pass ID from input strings, URLs, or query parameters.
 * Never throws runtime exceptions on null, undefined, or unexpected types.
 */
export function extractTokenOrId(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  // 1. Extract from query string token=
  if (trimmed.includes("token=")) {
    const match = trimmed.match(/[?&]token=([A-Za-z0-9_-]+)/i);
    if (match?.[1]) return match[1];
  }

  // 2. Extract from query string pass=
  if (trimmed.includes("pass=")) {
    const match = trimmed.match(/[?&]pass=([A-Za-z0-9_-]+)/i);
    if (match?.[1]) return match[1];
  }

  // 3. Extract from path /pass/:id
  if (trimmed.includes("/pass/")) {
    const match = trimmed.match(/\/pass\/([A-Za-z0-9_-]+)/i);
    if (match?.[1]) return match[1];
  }

  // 4. Return clean trimmed token
  return trimmed;
}

/**
 * Validates a pass token format defensively.
 * Rejects empty strings, whitespace, control characters, or unparseable inputs.
 */
export function validatePassTokenFormat(tokenInput: unknown): TokenValidationResult {
  const token = extractTokenOrId(tokenInput);

  if (!token) {
    return {
      isValid: false,
      normalizedToken: "",
      status: "empty",
      message: "لم يتم تقديم رمز تحقق أو بطاقة دعوة (رمز فارغ) · Empty or missing pass token",
    };
  }

  // Minimum length and valid character set check (alphanumeric, dashes, underscores)
  const isValidFormat = /^[A-Za-z0-9_-]{3,64}$/.test(token);
  if (!isValidFormat) {
    return {
      isValid: false,
      normalizedToken: token,
      status: "malformed",
      message: `صيغة الرمز غير صالحة أو تحتوي على أحرف غير مقبولة (${token}) · Malformed pass token format`,
    };
  }

  return {
    isValid: true,
    normalizedToken: token,
    status: "valid",
    message: "صيغة الرمز صالحة وجاهزة للتحقق · Valid pass token format",
  };
}

/**
 * Looks up RSVP in localStorage cache or fallback without throwing exceptions.
 */
export function lookupRsvpRecord(tokenOrId: string): InvitationRsvpDocument | null {
  if (!tokenOrId) return null;
  const clean = tokenOrId.trim();

  // Try local storage cache
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const cache = localStorage.getItem("asar_invitation_rsvps_cache");
      if (cache) {
        const parsed = JSON.parse(cache);
        if (Array.isArray(parsed)) {
          const match = parsed.find(
            (r: InvitationRsvpDocument) =>
              r &&
              (r.passToken === clean ||
                r.$id === clean ||
                r.id === clean ||
                (typeof r.passToken === "string" && r.passToken.toLowerCase() === clean.toLowerCase()))
          );
          if (match) return match;
        }
      }
    } catch {
      // Ignore JSON parse or storage access exceptions
    }
  }

  // Match demo pass
  if (
    clean === DEMO_APPROVED_PASS.$id ||
    clean === DEMO_APPROVED_PASS.id ||
    clean === DEMO_APPROVED_PASS.passToken ||
    clean.toUpperCase() === "INV-PASS-7701-X"
  ) {
    return DEMO_APPROVED_PASS;
  }

  return null;
}

/**
 * Resilient Venue QR Scanner Route View
 * Renders on-site verification with defensive token parsing, luxury error badges,
 * and high-contrast feedback for attendants.
 */
export const ScannerRouteView: React.FC<ScannerRouteViewProps> = ({
  invitationId: propInvitationId,
  initialToken: propInitialToken,
  onClose: propOnClose,
}) => {
  const navigate = useNavigate();
  const routeParams = useParams<{ invitationId?: string }>();
  const [searchParams] = useSearchParams();

  const handleClose = propOnClose || (() => navigate("/"));

  // Resolve URL / query parameters safely
  const invitationId = propInvitationId || routeParams.invitationId || "omar-and-layla";
  const queryToken =
    propInitialToken ||
    searchParams.get("token") ||
    searchParams.get("pass") ||
    searchParams.get("rsvpId") ||
    searchParams.get("rsvp") ||
    "";

  // Validate initial token format
  const validationResult = useMemo(() => {
    if (!queryToken) return null;
    return validatePassTokenFormat(queryToken);
  }, [queryToken]);

  // Lookup associated RSVP if token was supplied in URL
  const [matchedRsvp, setMatchedRsvp] = useState<InvitationRsvpDocument | undefined>(() => {
    if (!queryToken) return undefined;
    const clean = extractTokenOrId(queryToken);
    return lookupRsvpRecord(clean) || undefined;
  });

  const [lastCheckInTime, setLastCheckInTime] = useState<string | null>(null);

  const handleCheckInSuccess = useCallback((updated: InvitationRsvpDocument) => {
    setMatchedRsvp(updated);
    setLastCheckInTime(updated.checkedInAt || new Date().toISOString());
  }, []);

  return (
    <div
      className="scanner-route-view"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary, #FBF7F2)",
        backgroundImage: `
          radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.08) 0px, transparent 65%),
          radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.05) 0px, transparent 50%)
        `,
        padding: "2rem 1.25rem 4rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top Banner Navigation & Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          direction: "rtl",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          className="btn-athar-secondary"
          style={{
            padding: "0.45rem 1.1rem",
            fontSize: "0.85rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>→</span>
          <span>العودة للرئيسية · Exit</span>
        </button>

        <div
          style={{
            fontSize: "0.78rem",
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#8C6F12",
            textTransform: "uppercase",
          }}
        >
          ATHAR VENUE GATE SCANNER
        </div>
      </div>

      {/* Luxury Editorial Alert Badge for Malformed or Empty Passes */}
      {validationResult && !validationResult.isValid && (
        <div
          role="alert"
          aria-live="polite"
          style={{
            width: "100%",
            maxWidth: "540px",
            marginBottom: "1.25rem",
            padding: "1.1rem 1.25rem",
            borderRadius: "16px",
            backgroundColor: "#FFF5F5",
            border: "1.5px solid #FEB2B2",
            boxShadow: "0 6px 18px rgba(155, 44, 44, 0.08)",
            direction: "rtl",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.35rem", lineHeight: 1 }}>⚠️</span>
            <div>
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  color: "#9B2C2C",
                  marginBottom: "0.25rem",
                }}
              >
                تنبيه: رمز الدخول غير صالح أو غير مكتمل
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "#742A2A",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {validationResult.message}. يُرجى التأكد من مسح رمز الـ QR الرسمي الصادر من منصة أثر أو مراجعة المشرف المسؤول عن الاستقبال.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checked-in Confirmation Banner */}
      {lastCheckInTime && (
        <div
          role="status"
          style={{
            width: "100%",
            maxWidth: "540px",
            marginBottom: "1.25rem",
            padding: "1rem 1.25rem",
            borderRadius: "16px",
            backgroundColor: "#F0FDF4",
            border: "1.5px solid #86EFAC",
            color: "#166534",
            fontSize: "0.86rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            direction: "rtl",
          }}
        >
          <span>✓</span>
          <span>
            تم تسجيل الدخول وتحديث السجل بنجاح عند {new Date(lastCheckInTime).toLocaleTimeString("ar-EG")}.
          </span>
        </div>
      )}

      {/* Venue QR Scanner Component */}
      <div style={{ width: "100%", maxWidth: "540px" }}>
        <VenueQrScanner
          currentRsvp={matchedRsvp}
          onCheckInSuccess={handleCheckInSuccess}
          onClose={handleClose}
        />
      </div>

      {/* Attendant Context Footer */}
      <div
        style={{
          marginTop: "1.75rem",
          textAlign: "center",
          fontSize: "0.78rem",
          color: "var(--athar-text-muted, #7A6F6D)",
          maxWidth: "480px",
          direction: "rtl",
        }}
      >
        <span>معرف الفعالية النشط: </span>
        <code
          style={{
            color: "var(--athar-maroon, #6B1D28)",
            fontWeight: 700,
            backgroundColor: "rgba(107, 29, 40, 0.06)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {invitationId}
        </code>
        <div style={{ marginTop: "0.35rem" }}>
          نظام التحقق الآمن من أثر · Athar Gate Access Verification System
        </div>
      </div>
    </div>
  );
};

export default ScannerRouteView;
