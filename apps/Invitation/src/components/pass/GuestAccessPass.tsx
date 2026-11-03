import React, { useState } from "react";
import type { InvitationRsvpDocument, InvitationDocument } from "../renderer/types";
import { PassQrCode } from "./PassQrCode";
import { VenueQrScanner } from "./VenueQrScanner";

export interface GuestAccessPassProps {
  rsvp: InvitationRsvpDocument;
  invitation?: InvitationDocument;
  onBack?: () => void;
}

export const GuestAccessPass: React.FC<GuestAccessPassProps> = ({
  rsvp,
  invitation,
  onBack,
}) => {
  const [currentRsvp, setCurrentRsvp] = useState<InvitationRsvpDocument>(rsvp);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const eventTitle = invitation?.eventTitle || "The Wedding of Omar & Layla";
  const eventDate = invitation?.eventDate || "2026-11-20";
  const eventTime = invitation?.eventTime || "19:30 AST";
  const venueName =
    invitation?.venueName || "Four Seasons Hotel Alexandria at San Stefano";
  const venueAddress =
    invitation?.venueAddress || "399 El Geish Rd, San Stefano, Alexandria";

  const totalSeats = (currentRsvp.companionsCount || 0) + 1;
  const isApproved = currentRsvp.status === "approved";
  const isDeclined = currentRsvp.status === "declined";

  // Construct verification URL
  const passUrl = `http://localhost:3003?pass=${currentRsvp.$id || currentRsvp.id}&token=${currentRsvp.passToken}`;

  const handlePrint = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(eventTitle);
    const details = encodeURIComponent(
      `تذكرة دخول معتمدة لحضور ${eventTitle}. رقم التذكرة: ${currentRsvp.passToken}`
    );
    const location = encodeURIComponent(`${venueName}, ${venueAddress}`);
    const dateClean = eventDate.replace(/-/g, "");
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateClean}T160000Z/${dateClean}T220000Z`;
    window.open(calendarUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="guest-access-pass-page"
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "2.5rem 1.25rem 4rem",
      }}
    >
      {/* Top Navigation & Controls */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="btn-athar-secondary"
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.88rem" }}
          >
            ← العودة إلى صفحة الدعوة
          </button>
        ) : (
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--athar-maroon)" }}>
            ✦ أثر لخدمات كبار الشخصيات
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setShowScannerModal(true)}
            className="btn-athar-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
          >
            🛡️ محاكاة فحص البوابة
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-athar-primary print-keep"
            style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
          >
            🖨️ طباعة التذكرة
          </button>
        </div>
      </div>

      {/* Luxury Digital Ticket Card */}
      <div className="pass-ticket-card">
        {/* Ticket Perforation Cutouts */}
        <div className="pass-ticket-cutout-left" aria-hidden="true" />
        <div className="pass-ticket-cutout-right" aria-hidden="true" />
        <div className="pass-ticket-dashline" aria-hidden="true" />

        {/* Top Header Banner */}
        <div
          style={{
            backgroundColor: "var(--athar-maroon)",
            color: "#FFFFFF",
            padding: "2rem 2.25rem 1.5rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle gold watermark pattern */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "2px solid rgba(212, 175, 55, 0.2)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.82rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--athar-gold-bright)",
                fontWeight: 700,
              }}
            >
              ASAR EXCLUSIVE VIP PASS · بطاقة دخول رسمية
            </div>

            {/* Status Badge */}
            {isApproved ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.85rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(30, 111, 80, 0.25)",
                  border: "1px solid var(--athar-gold-bright)",
                  color: "#A7F3D0",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                ✓ CONFIRMED ENTRY PASS
              </span>
            ) : isDeclined ? (
              <span
                style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(155, 44, 44, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#FECACA",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                ✕ CAPACITY LIMIT REACHED
              </span>
            ) : (
              <span
                style={{
                  padding: "0.3rem 0.85rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(212, 175, 55, 0.25)",
                  border: "1px solid var(--athar-gold)",
                  color: "#FEF08A",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                ⏳ PENDING HOST APPROVAL
              </span>
            )}
          </div>

          <h1
            className="font-arabic-display"
            style={{
              fontSize: "clamp(1.75rem, 4.5vw, 2.4rem)",
              fontWeight: 700,
              lineHeight: 1.25,
              color: "#FFFFFF",
              marginBottom: "0.5rem",
            }}
          >
            {eventTitle}
          </h1>

          <div
            style={{
              fontSize: "0.95rem",
              color: "var(--athar-gold-light)",
            }}
          >
            {venueName}
          </div>
        </div>

        {/* Middle Section: Guest Name & Key Event Data */}
        <div style={{ padding: "2.25rem 2.25rem 1.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.75rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  color: "var(--athar-text-muted)",
                  letterSpacing: "0.05em",
                  marginBottom: "0.3rem",
                }}
              >
                اسم الضيف الكريم / Guest Name
              </div>
              <div
                className="font-arabic-display"
                style={{
                  fontSize: "1.65rem",
                  fontWeight: 700,
                  color: "var(--athar-maroon)",
                }}
              >
                {currentRsvp.guestName}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  color: "var(--athar-text-muted)",
                  letterSpacing: "0.05em",
                  marginBottom: "0.3rem",
                }}
              >
                المقاعد المعتمدة / Approved Seats
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--athar-text-title)",
                }}
              >
                {totalSeats} {totalSeats === 1 ? "مقعد مخصص (فردي)" : "مقاعد مخصصة"}
              </div>
            </div>
          </div>

          {/* Time & Venue Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              padding: "1rem 0",
              borderTop: "1px solid rgba(107, 29, 40, 0.1)",
              borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
              textAlign: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--athar-text-muted)", marginBottom: "0.2rem" }}>
                التاريخ / Date
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--athar-text-title)" }}>
                {eventDate}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--athar-text-muted)", marginBottom: "0.2rem" }}>
                التوقيت / Time
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--athar-text-title)" }}>
                {eventTime}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--athar-text-muted)", marginBottom: "0.2rem" }}>
                التحقق / Status
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: currentRsvp.isCheckedInAtVenue
                    ? "var(--athar-status-success)"
                    : isApproved
                      ? "var(--athar-maroon)"
                      : "var(--athar-text-muted)",
                }}
              >
                {currentRsvp.isCheckedInAtVenue ? "تم الدخول ✓" : isApproved ? "جاهز للدخول" : "قيد المراجعة"}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Ticket Stub: QR Code & Security Token */}
        <div
          style={{
            backgroundColor: "var(--athar-bg-primary)",
            padding: "2rem 2.25rem",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "1.25rem" }}>
            <PassQrCode
              data={passUrl}
              size={180}
              color="#6B1D28"
              bgColor="#FFFFFF"
            />
          </div>

          <div
            style={{
              fontSize: "0.85rem",
              fontFamily: "monospace",
              color: "var(--athar-maroon)",
              fontWeight: 700,
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}
          >
            TOKEN: {currentRsvp.passToken || "INV-PASS-VIP-001"}
          </div>

          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--athar-text-muted)",
              maxWidth: "460px",
              margin: "0 auto",
            }}
          >
            يرجى إبراز هذا الرمز عند البوابة الرئيسية لمسحه بواسطة فريق الاستقبال والتوجيه إلى طاولتكم المخصصة.
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons (Calendar, Share, etc.) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "2rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={handleAddToCalendar}
          className="btn-athar-primary"
          style={{ padding: "0.85rem 1.8rem" }}
        >
          <span>إضافة إلى تقويم Google</span>
          <span>📅</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="btn-athar-secondary"
          style={{ padding: "0.85rem 1.8rem" }}
        >
          <span>حفظ كملف PDF / طباعة</span>
          <span>📄</span>
        </button>
      </div>

      {/* Simulated Venue Scanner Modal */}
      {showScannerModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowScannerModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <VenueQrScanner
              currentRsvp={currentRsvp}
              onCheckInSuccess={(updated) => setCurrentRsvp(updated)}
              onClose={() => setShowScannerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const GuestQrPassCard = GuestAccessPass;
export default GuestAccessPass;
