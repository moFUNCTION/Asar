import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiCompass,
  FiPhoneCall,
  FiMail,
  FiExternalLink,
  FiLayers,
  FiCheckCircle,
  FiArrowLeft,
  FiSend,
  FiKey,
} from "react-icons/fi";

// =============================================================
// ASAR (Athar / أثر) — Storefront Showcase Portal
// Rendered at bare apex (localhost:3004/) to preview and test storefronts
// =============================================================

export const StorefrontShowcasePortal: React.FC = () => {
  const navigate = useNavigate();
  const [customSlug, setCustomSlug] = useState("");

  const currentHost =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const currentPort =
    typeof window !== "undefined" ? window.location.port || "3004" : "3004";

  const handleLaunchSlug = (type: "universal" | "booth" | "invitation" | "query") => {
    const slug = customSlug.trim().toLowerCase();
    if (!slug) return;

    if (type === "universal") {
      navigate(`/s/${slug}`);
    } else if (type === "booth") {
      navigate(`/booth/${slug}`);
    } else if (type === "invitation") {
      navigate(`/invitation/${slug}`);
    } else {
      navigate(`/?subdomain=${slug}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary)",
        color: "var(--athar-text-body)",
        padding: "3rem 1.5rem 5rem 1.5rem",
        position: "relative",
        backgroundImage: `
          radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.12) 0px, transparent 65%),
          radial-gradient(at 10% 85%, rgba(107, 29, 40, 0.08) 0px, transparent 55%),
          radial-gradient(at 90% 90%, rgba(212, 175, 55, 0.06) 0px, transparent 50%)
        `,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header / Brand Banner */}
        <header style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 1.3rem",
              borderRadius: "var(--athar-radius-full)",
              backgroundColor: "rgba(107, 29, 40, 0.08)",
              color: "var(--athar-maroon)",
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "1.2rem",
              border: "1px solid rgba(107, 29, 40, 0.14)",
            }}
          >
            <FiLayers />
            <span>محرك واجهات الذكريات السحابية · ASAR DEDICATED RENDERER (PORT 3004)</span>
          </div>

          <h1
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              color: "var(--athar-maroon)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            بوابة واجهات الذكريات الحصرية
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--athar-text-muted)",
              maxWidth: "760px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            التطبيق المخصص لإطلاق واستضافة واجهات الذكريات الصوتية وهواتف الزوار
            العتيقة والدعوات الرقمية الملكية. يدعم النطاقات الفرعية التلقائية{" "}
            <code style={{ direction: "ltr", display: "inline-block" }}>*.localhost:3004</code>{" "}
            وروابط التوجيه المباشرة والمسارات السريعة.
          </p>
        </header>

        {/* Runtime Diagnostics Card */}
        <div
          className="glass-panel"
          style={{
            padding: "1.5rem 2rem",
            borderRadius: "var(--athar-radius-md)",
            marginBottom: "3rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--athar-radius-sm)",
                backgroundColor: "rgba(212, 175, 55, 0.16)",
                color: "var(--athar-maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
              }}
            >
              <FiCompass />
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)" }}>
                حالة البيئة الحالية (Current Hostname & Runtime)
              </div>
              <div
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--athar-text-title)",
                  direction: "ltr",
                  textAlign: "right",
                }}
              >
                {currentHost}:{currentPort} · Bare Apex Storefront Portal
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--athar-radius-sm)",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(107, 29, 40, 0.1)",
                fontSize: "0.82rem",
                color: "var(--athar-text-muted)",
              }}
            >
              التوجيه: <strong style={{ color: "var(--athar-maroon)" }}>4-Tier Resolution</strong>
            </div>
            <div
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "var(--athar-radius-sm)",
                backgroundColor: "#ffffff",
                border: "1px solid rgba(107, 29, 40, 0.1)",
                fontSize: "0.82rem",
                color: "var(--athar-text-muted)",
              }}
            >
              المعيار: <strong style={{ color: "var(--athar-maroon)" }}>RFC 6761 Loopback</strong>
            </div>
          </div>
        </div>

        {/* Live Slug Interactive Tester Bar */}
        <div
          className="glass-panel"
          style={{
            padding: "2rem",
            borderRadius: "var(--athar-radius-md)",
            marginBottom: "3.5rem",
            border: "1px solid rgba(107, 29, 40, 0.12)",
          }}
        >
          <h3
            className="font-arabic-display"
            style={{
              fontSize: "1.3rem",
              color: "var(--athar-maroon)",
              marginBottom: "0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FiSend />
            <span>اختبار وتجربة أي رابط أو نطاق مخصص (Live Slug Resolver)</span>
          </h3>
          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--athar-text-muted)",
              marginBottom: "1.2rem",
            }}
          >
            أدخل معرف الواجهة أو النطاق لتجربة محرك التوجيه فائق السرعة عبر المسار العام أو المتخصص:
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.8rem",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="مثال: mina-and-maryam أو omar-and-layla"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              style={{
                flex: "1 1 260px",
                padding: "0.75rem 1.2rem",
                borderRadius: "var(--athar-radius-sm)",
                border: "1px solid rgba(107, 29, 40, 0.2)",
                backgroundColor: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
                direction: "ltr",
              }}
            />

            <button
              onClick={() => handleLaunchSlug("universal")}
              className="btn-athar-primary"
              style={{ padding: "0.75rem 1.4rem", fontSize: "0.9rem" }}
            >
              مسار عام (/s/:slug)
            </button>

            <button
              onClick={() => handleLaunchSlug("booth")}
              className="btn-athar-secondary"
              style={{ padding: "0.75rem 1.4rem", fontSize: "0.9rem" }}
            >
              مسار هاتف (/booth/:slug)
            </button>

            <button
              onClick={() => handleLaunchSlug("invitation")}
              className="btn-athar-secondary"
              style={{ padding: "0.75rem 1.4rem", fontSize: "0.9rem" }}
            >
              مسار دعوة (/invitation/:slug)
            </button>

            <button
              onClick={() => handleLaunchSlug("query")}
              className="btn-athar-secondary"
              style={{ padding: "0.75rem 1.4rem", fontSize: "0.9rem" }}
            >
              معامل (?subdomain=)
            </button>
          </div>
        </div>

        {/* Primary Showcase Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "2rem",
            marginBottom: "4rem",
          }}
        >
          {/* Card 1: Booth Memory Showcase */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "var(--athar-radius-lg)",
              padding: "2.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(107, 29, 40, 0.15)",
              boxShadow: "var(--athar-shadow-soft)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0.9rem",
                  borderRadius: "var(--athar-radius-full)",
                  backgroundColor: "rgba(107, 29, 40, 0.08)",
                  color: "var(--athar-maroon)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "1.2rem",
                }}
              >
                <FiPhoneCall />
                <span>هاتف أثر العتيق للذكريات الصوتية · BOOTH STOREFRONT</span>
              </div>

              <h2
                className="font-arabic-display"
                style={{
                  fontSize: "1.85rem",
                  color: "var(--athar-maroon)",
                  marginBottom: "0.4rem",
                }}
              >
                مينا ومريم — Mina & Maryam
              </h2>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--athar-gold)",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                12 July 2026 · Alexandria, Egypt
              </p>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--athar-text-body)",
                  lineHeight: 1.7,
                  marginBottom: "1.8rem",
                }}
              >
                واجهة ذكريات متكاملة تعرض رسائل الضيوف المسجلة بصوت نقي على هاتف أثر
                العتيق، مع مشغل موجات صوتية تفاعلي (Waveform Player) ومعرض صور وسجل
                تهاني وتبريكات.
              </p>

              {/* Specs checklist */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "var(--athar-radius-md)",
                  padding: "1rem 1.2rem",
                  marginBottom: "2rem",
                  border: "1px solid rgba(107, 29, 40, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <FiCheckCircle color="#6B1D28" />
                  <span>5 تسجيلات صوتية حقيقية مفهرسة (العائلة، الأصدقاء، زملاء العمل)</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <FiCheckCircle color="#6B1D28" />
                  <span>مشغل موجات صوتية احترافي بـ 48 قمة ترددية</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <FiCheckCircle color="#6B1D28" />
                  <span>معرض صور الذكريات وسجل تهاني الضيوف</span>
                </div>
              </div>
            </div>

            {/* Launch Links */}
            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--athar-text-muted)",
                  marginBottom: "0.8rem",
                }}
              >
                خيارات التشغيل السريع:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <Link
                  to="/s/mina-and-maryam"
                  className="btn-athar-primary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>عرض الواجهة (المسار المباشر)</span>
                  <FiArrowLeft />
                </Link>

                <Link
                  to="/?subdomain=mina-and-maryam"
                  className="btn-athar-secondary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>تجربة المعامل (?subdomain=)</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>
                    Tier 1
                  </span>
                </Link>

                <a
                  href={`http://mina-and-maryam.localhost:${currentPort}/`}
                  className="btn-athar-secondary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ direction: "ltr", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <FiExternalLink />
                    mina-and-maryam.localhost:{currentPort}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>
                    RFC 6761
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Invitation Memory Showcase */}
          <div
            className="glass-panel"
            style={{
              borderRadius: "var(--athar-radius-lg)",
              padding: "2.5rem 2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              boxShadow: "var(--athar-shadow-soft)",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0.9rem",
                  borderRadius: "var(--athar-radius-full)",
                  backgroundColor: "rgba(212, 175, 55, 0.15)",
                  color: "var(--athar-maroon)",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginBottom: "1.2rem",
                }}
              >
                <FiMail />
                <span>دعوات أثر الرقمية التفاعلية · INVITATION STOREFRONT</span>
              </div>

              <h2
                className="font-arabic-display"
                style={{
                  fontSize: "1.85rem",
                  color: "var(--athar-maroon)",
                  marginBottom: "0.4rem",
                }}
              >
                عمر وليلى — Omar & Layla
              </h2>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--athar-gold)",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                18 September 2026 · Four Seasons Ballroom, Cairo
              </p>

              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--athar-text-body)",
                  lineHeight: 1.7,
                  marginBottom: "1.8rem",
                }}
              >
                منظومة الدعوة التفاعلية الملكية المزودة بعد تنازلي حي، وخريطة الموقع،
                وجدول فقرات الحفل، ونموذج تأكيد حضور ديناميكي (Dynamic RSVP) مع إصدار
                بطاقات الدخول الذكية QR Pass.
              </p>

              {/* Specs checklist */}
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "var(--athar-radius-md)",
                  padding: "1rem 1.2rem",
                  marginBottom: "2rem",
                  border: "1px solid rgba(107, 29, 40, 0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <FiCheckCircle color="#6B1D28" />
                  <span>عداد تنازلي رقمي حي للمناسبة وخريطة الوصول</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  <FiCheckCircle color="#6B1D28" />
                  <span>نموذج تأكيد الحضور المعتمد مع بريد التذاكر</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <FiCheckCircle color="#6B1D28" />
                  <span>إصدار بطاقة ضيف VIP رقمية مشفرة بـ QR Code</span>
                </div>
              </div>
            </div>

            {/* Launch Links */}
            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "var(--athar-text-muted)",
                  marginBottom: "0.8rem",
                }}
              >
                خيارات التشغيل السريع:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <Link
                  to="/s/omar-and-layla"
                  className="btn-athar-primary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>عرض الدعوة (المسار المباشر)</span>
                  <FiArrowLeft />
                </Link>

                <Link
                  to="/?subdomain=omar-and-layla"
                  className="btn-athar-secondary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>تجربة المعامل (?subdomain=)</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>
                    Tier 1
                  </span>
                </Link>

                <a
                  href={`http://omar-and-layla.localhost:${currentPort}/`}
                  className="btn-athar-secondary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ direction: "ltr", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <FiExternalLink />
                    omar-and-layla.localhost:{currentPort}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>
                    RFC 6761
                  </span>
                </a>

                <Link
                  to="/pass/rsvp-demo-001"
                  className="btn-athar-secondary"
                  style={{ justifyContent: "space-between" }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <FiKey />
                    بطاقة تصريح دخول الضيف (VIP Pass)
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>
                    /pass/:id
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <footer
          style={{
            textAlign: "center",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(107, 29, 40, 0.1)",
            fontSize: "0.88rem",
            color: "var(--athar-text-muted)",
          }}
        >
          منظومة أثر (Athar) · حلول توثيق الذكريات الفاخرة وهواتف الزوار العتيقة والدعوات الرقمية
        </footer>
      </div>
    </div>
  );
};

export default StorefrontShowcasePortal;
