import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiHome, FiCompass } from "react-icons/fi";

// =============================================================
// ASAR (Athar / أثر) — Luxury Storefront 404 Screen
// Rendered when a memory slug is invalid, reserved, or not found
// =============================================================

export interface StorefrontNotFoundProps {
  requestedSlug?: string | null;
  reason?: "not-found" | "reserved" | "invalid" | "unknown";
  source?: string | null;
}

export const StorefrontNotFound: React.FC<StorefrontNotFoundProps> = ({
  requestedSlug,
  reason = "not-found",
  source,
}) => {
  const location = useLocation();

  // If no slug passed as prop, inspect pathname
  const displaySlug =
    requestedSlug ||
    (location.pathname !== "/" ? location.pathname.replace(/^\//, "") : null);

  const getReasonMessage = () => {
    switch (reason) {
      case "reserved":
        return `النطاق الفرعي "${displaySlug}" محجوز داخلياً لمنظومة أثر ولا يمكن تخصيصه كواجهة ذكريات للعملاء.`;
      case "invalid":
        return `اسم الرابط أو النطاق "${displaySlug}" غير متوافق مع معايير التسمية القياسية (RFC 1123).`;
      case "not-found":
      default:
        return displaySlug
          ? `لم يتم العثور على ذكريات مسجلة أو منشورة باسم "${displaySlug}". يرجى التأكد من صحة الرابط أو رمز المناسبة.`
          : "الرابط المطلوب غير موجود أو تم نقله.";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary)",
        color: "var(--athar-text-title)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        position: "relative",
        backgroundImage: `
          radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.12) 0px, transparent 60%),
          radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.08) 0px, transparent 50%)
        `,
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: "680px",
          width: "100%",
          padding: "3.5rem 2.5rem",
          borderRadius: "var(--athar-radius-lg)",
          textAlign: "center",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "var(--athar-shadow-elevated)",
        }}
      >
        {/* Athar Editorial Brand Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 1.2rem",
            borderRadius: "var(--athar-radius-full)",
            backgroundColor: "rgba(107, 29, 40, 0.08)",
            color: "var(--athar-maroon)",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            letterSpacing: "0.05em",
          }}
        >
          <FiAlertCircle />
          <span>منصة واجهات الذكريات السحابية · ASAR STOREFRONT</span>
        </div>

        {/* 404 Title */}
        <h1
          className="font-arabic-display"
          style={{
            fontSize: " clamp(2.5rem, 6vw, 4.2rem)",
            fontWeight: 700,
            color: "var(--athar-maroon)",
            lineHeight: 1.1,
            marginBottom: "0.5rem",
          }}
        >
          ٤٠٤
        </h1>

        <h2
          className="font-arabic-display"
          style={{
            fontSize: "1.6rem",
            color: "var(--athar-text-title)",
            marginBottom: "1rem",
          }}
        >
          واجهة الذكريات غير متوفرة
        </h2>

        {/* Reason Description */}
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--athar-text-body)",
            lineHeight: 1.7,
            maxWidth: "520px",
            margin: "0 auto 2rem auto",
          }}
        >
          {getReasonMessage()}
        </p>

        {/* Metadata Pill */}
        {displaySlug && (
          <div
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: "var(--athar-radius-sm)",
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              border: "1px dashed rgba(107, 29, 40, 0.2)",
              fontSize: "0.85rem",
              color: "var(--athar-text-muted)",
              marginBottom: "2.5rem",
              direction: "ltr",
              fontFamily: "monospace",
            }}
          >
            target: {displaySlug} {source ? `(${source})` : ""}
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <Link to="/" className="btn-athar-primary">
            <FiHome />
            <span>بوابة واجهات الذكريات</span>
          </Link>

          <Link to="/s/mina-and-maryam" className="btn-athar-secondary">
            <FiCompass />
            <span>ذكريات مينا ومريم</span>
          </Link>

          <Link to="/s/omar-and-layla" className="btn-athar-secondary">
            <FiArrowRight />
            <span>دعوة عمر وليلى</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StorefrontNotFound;
