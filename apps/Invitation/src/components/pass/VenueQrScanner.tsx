import React, { useState } from "react";
import type { InvitationRsvpDocument } from "../renderer/types";

export interface VenueQrScannerProps {
  currentRsvp?: InvitationRsvpDocument;
  onCheckInSuccess?: (updatedRsvp: InvitationRsvpDocument) => void;
  onClose?: () => void;
}

export const VenueQrScanner: React.FC<VenueQrScannerProps> = ({
  currentRsvp,
  onCheckInSuccess,
  onClose,
}) => {
  const [inputToken, setInputToken] = useState("");
  const [scanResult, setScanResult] = useState<{
    status: "idle" | "success" | "duplicate" | "invalid";
    message: string;
    checkedInAt?: string;
  }>({ status: "idle", message: "" });

  const handleVerifyToken = (tokenToVerify: string) => {
    const trimmed = tokenToVerify.trim();
    if (!trimmed) {
      setScanResult({
        status: "invalid",
        message: "يرجى إدخال رمز التحقق أو مسح الـ QR Code",
      });
      return;
    }

    // Extract token if full URL was pasted
    let token = trimmed;
    if (trimmed.includes("token=")) {
      const match = trimmed.match(/token=([A-Za-z0-9_-]+)/);
      if (match) token = match[1];
    } else if (trimmed.includes("/pass/")) {
      const match = trimmed.match(/\/pass\/([A-Za-z0-9_-]+)/);
      if (match) token = match[1];
    }

    // Verify against current RSVP or localStorage cache
    let foundRsvp: InvitationRsvpDocument | undefined =
      currentRsvp && (currentRsvp.passToken === token || currentRsvp.$id === token || currentRsvp.id === token)
        ? currentRsvp
        : undefined;

    if (!foundRsvp) {
      try {
        const cache = localStorage.getItem("asar_invitation_rsvps_cache");
        if (cache) {
          const list: InvitationRsvpDocument[] = JSON.parse(cache);
          foundRsvp = list.find(
            (r) => r.passToken === token || r.$id === token || r.id === token
          );
        }
      } catch {
        // Ignore
      }
    }

    if (!foundRsvp) {
      setScanResult({
        status: "invalid",
        message: `✕ رمز التحقق (${token}) غير صالح أو غير مسجل في منظومة الدعوات`,
      });
      return;
    }

    // Check duplicate check-in
    if (foundRsvp.isCheckedInAtVenue) {
      const timeStr = foundRsvp.checkedInAt
        ? new Date(foundRsvp.checkedInAt).toLocaleTimeString("ar-EG")
        : "سابقاً";
      setScanResult({
        status: "duplicate",
        message: `تنبيه أمني: تم تسجيل دخول هذا الضيف مسبقاً في: ${timeStr} (${foundRsvp.guestName})`,
        checkedInAt: foundRsvp.checkedInAt,
      });
      return;
    }

    // Successful check-in
    const checkInTime = new Date().toISOString();
    const updated: InvitationRsvpDocument = {
      ...foundRsvp,
      isCheckedInAtVenue: true,
      checkedInAt: checkInTime,
    };

    // Update localStorage cache
    try {
      const cache = localStorage.getItem("asar_invitation_rsvps_cache");
      if (cache) {
        const list: InvitationRsvpDocument[] = JSON.parse(cache);
        const idx = list.findIndex(
          (r) => r.passToken === token || r.$id === token || r.id === token
        );
        if (idx !== -1) {
          list[idx] = updated;
          localStorage.setItem("asar_invitation_rsvps_cache", JSON.stringify(list));
        }
      }
    } catch {
      // Ignore
    }

    setScanResult({
      status: "success",
      message: `✓ تم التحقق بنجاح! مرحباً بالضيف الكريم: ${foundRsvp.guestName} (${foundRsvp.companionsCount + 1} مقاعد معتمدة)`,
      checkedInAt: checkInTime,
    });

    onCheckInSuccess?.(updated);
  };

  const handleSimulateQuickScan = () => {
    if (currentRsvp?.passToken) {
      setInputToken(currentRsvp.passToken);
      handleVerifyToken(currentRsvp.passToken);
    } else {
      setInputToken("INV-PASS-VIP-991");
      handleVerifyToken("INV-PASS-VIP-991");
    }
  };

  return (
    <div
      className="venue-qr-scanner-card luxury-card"
      style={{
        backgroundColor: "#FFFFFF",
        border: "2px solid var(--athar-gold)",
        borderRadius: "24px",
        padding: "2rem",
        maxWidth: "520px",
        margin: "0 auto",
        boxShadow: "var(--athar-shadow-elevated)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.4rem" }}>🛡️</span>
          <h3
            className="font-arabic-display"
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--athar-maroon)",
            }}
          >
            نظام التحقق الإلكتروني لبوابة الحفل
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق الماسح"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              color: "var(--athar-text-muted)",
            }}
          >
            ✕
          </button>
        )}
      </div>

      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--athar-text-muted)",
          marginBottom: "1.25rem",
          lineHeight: 1.5,
        }}
      >
        يتيح هذا النظام لمسؤولي الاستقبال وأمن البوابة مسح أو إدخال رمز تذكرة الضيف للتحقق من اعتمادها
        ومنع الدخول المكرر.
      </p>

      {/* Input Row */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          placeholder="أدخل رمز التذكرة (e.g. INV-PASS-...)"
          className="athar-input"
          style={{ flex: 1, direction: "ltr" }}
        />
        <button
          type="button"
          onClick={() => handleVerifyToken(inputToken)}
          className="btn-athar-primary"
          style={{ padding: "0.75rem 1.25rem" }}
        >
          فحص
        </button>
      </div>

      {/* Quick Simulate Scan Button */}
      <button
        type="button"
        onClick={handleSimulateQuickScan}
        className="btn-athar-secondary"
        style={{ width: "100%", padding: "0.65rem", fontSize: "0.88rem", marginBottom: "1.25rem" }}
      >
        <span>⚡ محاكاة مسح تذكرة هذا الضيف بنقرة واحدة</span>
      </button>

      {/* Result Alerts */}
      {scanResult.status === "success" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            backgroundColor: "var(--athar-status-success-bg)",
            border: "1.5px solid var(--athar-status-success)",
            color: "var(--athar-status-success)",
            fontSize: "0.92rem",
            fontWeight: 700,
          }}
        >
          {scanResult.message}
        </div>
      )}

      {scanResult.status === "duplicate" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            backgroundColor: "var(--athar-status-warning-bg)",
            border: "1.5px solid var(--athar-status-warning)",
            color: "var(--athar-maroon-dark)",
            fontSize: "0.92rem",
            fontWeight: 700,
          }}
        >
          ⚠️ {scanResult.message}
        </div>
      )}

      {scanResult.status === "invalid" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "14px",
            backgroundColor: "var(--athar-status-danger-bg)",
            border: "1.5px solid var(--athar-status-danger)",
            color: "var(--athar-status-danger)",
            fontSize: "0.92rem",
            fontWeight: 700,
          }}
        >
          {scanResult.message}
        </div>
      )}
    </div>
  );
};

export default VenueQrScanner;
