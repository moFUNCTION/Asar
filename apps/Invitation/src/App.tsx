import React, { useState } from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import { useSubdomain, extractSubdomain } from "@repo/react-appwrite";

import { InvitationLandingPage } from "./pages/InvitationLandingPage";
import { CustomEventPage } from "./pages/CustomEventPage";
import { GuestPassPage } from "./pages/GuestPassPage";
import { InvitationBookingModal } from "./components/landing";
import { VenueQrScanner } from "./components/pass";

// Export extractSubdomain helper for seamless inter-module usage
export { extractSubdomain };

/**
 * VIP QR Pass Screen
 * Resolves rsvpId from route parameter or prop.
 */
export const QrPassPage: React.FC<{ rsvpId?: string }> = ({ rsvpId: propRsvpId }) => {
  const params = useParams<{ rsvpId?: string }>();
  const navigate = useNavigate();
  return (
    <GuestPassPage
      rsvpId={propRsvpId || params.rsvpId || "rsvp-approved-1"}
      onBack={() => navigate("/")}
    />
  );
};

/**
 * Venue QR Scanner Screen
 * For on-site check-in attendants scanning QR codes.
 */
export const ScannerRouteView: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--athar-bg-primary, #FBF7F2)",
      }}
    >
      <VenueQrScanner onClose={() => navigate("/")} />
    </div>
  );
};

/**
 * Direct Booking Route View
 * Displays landing page with booking wizard automatically opened.
 */
export const InvitationBookingRouteView: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <InvitationLandingPage
        onPreviewEvent={(slug) => navigate(`/e/${slug}`)}
        onPreviewPass={(rsvpId) => navigate(`/pass/${rsvpId}`)}
      />
      <InvitationBookingModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          navigate("/");
        }}
      />
    </>
  );
};

/**
 * Luxury 404 Fallback Screen
 * Displayed when an unknown invitation route or slug is navigated.
 */
export const InvitationLuxuryNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--athar-bg-primary, #FBF7F2)",
        padding: "2rem",
        textAlign: "center",
        direction: "rtl",
      }}
    >
      <div
        className="luxury-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "3.5rem 2.5rem",
          border: "1.5px solid var(--athar-gold-border, #EAD8C7)",
          borderRadius: "28px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 20px 48px rgba(107, 29, 40, 0.08)",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(107, 29, 40, 0.06)",
            color: "var(--athar-maroon, #6B1D28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "1.75rem",
          }}
        >
          ✦
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "#8C6F12",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          ATHAR LUXURY INVITATION · 404
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "var(--athar-maroon, #6B1D28)",
            marginBottom: "0.5rem",
          }}
        >
          Invitation Not Found
        </h1>

        <h2
          style={{
            fontFamily: "var(--font-arabic-display, 'Cairo', sans-serif)",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--athar-text-title, #231F20)",
            marginBottom: "1rem",
          }}
        >
          لم يتم العثور على الدعوة المطلوبة
        </h2>

        <div
          style={{
            width: "48px",
            height: "1px",
            backgroundColor: "var(--athar-gold, #D4AF37)",
            margin: "0 auto 1.25rem",
          }}
        />

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--athar-text-muted, #7A6F6D)",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          عذراً، لم نتمكن من العثور على موقع الدعوة الإلكترونية المطلوب. قد يكون الرابط منتهياً أو تم نقله.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "var(--athar-maroon, #6B1D28)",
            color: "#FFFFFF",
            padding: "0.85rem 2rem",
            borderRadius: "9999px",
            border: "1px solid var(--athar-gold, #D4AF37)",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(107, 29, 40, 0.3)",
            transition: "all 0.2s ease",
          }}
        >
          Return to Asar · العودة لمنصة أثر
        </button>
      </div>
    </div>
  );
};

/**
 * Dynamic Storefront Index for Root `/`
 * 1. Checks 4-tier subdomain resolver (hostname *.localhost / *.asar.me or ?subdomain= / ?event=).
 * 2. If a slug is detected, renders CustomEventPage with that slug!
 * 3. If no subdomain is detected (bare localhost:3003 or bare apex host), renders standard Invitation landing page.
 */
export const DynamicInvitationStorefrontIndex: React.FC = () => {
  const navigate = useNavigate();
  const { subdomain } = useSubdomain({
    searchParams: typeof window !== "undefined" ? window.location.search : undefined,
  });

  if (subdomain) {
    return (
      <CustomEventPage
        slug={subdomain}
        onBack={() => navigate("/", { replace: true })}
        onOpenPass={(rsvpId) => navigate(`/pass/${rsvpId}`)}
      />
    );
  }

  return (
    <InvitationLandingPage
      onPreviewEvent={(slug) => navigate(`/e/${slug}`)}
      onPreviewPass={(rsvpId) => navigate(`/pass/${rsvpId}`)}
    />
  );
};

/**
 * Floating Reviewer Navigation Pill (Fixed Bottom-Left)
 */
const ReviewerNavPill: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === "/" || location.pathname === "/book";
  const isEvent = location.pathname.startsWith("/e");
  const isPass = location.pathname.startsWith("/pass");

  return (
    <aside
      className="no-print reviewer-nav-pill"
      aria-label="مفتاح التبديل السريع للمراجعين"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 8px",
        borderRadius: "9999px",
        backgroundColor: "rgba(22, 18, 20, 0.92)",
        backdropFilter: "blur(14px)",
        border: "1.5px solid var(--athar-gold)",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.45)",
        direction: "rtl",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 800,
          color: "var(--athar-gold-bright)",
          padding: "0 8px",
          letterSpacing: "0.05em",
        }}
      >
        ✦ العرض:
      </span>

      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          padding: "6px 14px",
          borderRadius: "9999px",
          border: "none",
          backgroundColor: isLanding ? "var(--athar-maroon)" : "transparent",
          color: isLanding ? "#FFFFFF" : "#D1D5DB",
          fontSize: "0.78rem",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        1. منصة الدعوات (Landing)
      </button>

      <button
        type="button"
        onClick={() => navigate("/e/omar-and-layla")}
        style={{
          padding: "6px 14px",
          borderRadius: "9999px",
          border: "none",
          backgroundColor: isEvent ? "var(--athar-maroon)" : "transparent",
          color: isEvent ? "#FFFFFF" : "#D1D5DB",
          fontSize: "0.78rem",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        2. موقع دعوة حي (Custom Event)
      </button>

      <button
        type="button"
        onClick={() => navigate("/pass/rsvp-approved-1")}
        style={{
          padding: "6px 14px",
          borderRadius: "9999px",
          border: "none",
          backgroundColor: isPass ? "var(--athar-maroon)" : "transparent",
          color: isPass ? "#FFFFFF" : "#D1D5DB",
          fontSize: "0.78rem",
          fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        3. بطاقة الدخول (VIP QR Pass)
      </button>
    </aside>
  );
};

export const App: React.FC = () => {
  return (
    <div className="athar-invitation-app" style={{ minHeight: "100vh", position: "relative" }}>
      <Routes>
        {/* 1. Dynamic Storefront Index (apex landing or subdomain custom event) */}
        <Route path="/" element={<DynamicInvitationStorefrontIndex />} />

        {/* 2. Direct route to booking wizard on landing page */}
        <Route path="/book" element={<InvitationBookingRouteView />} />

        {/* 3. Explicit custom event route with slug */}
        <Route path="/e/:slug" element={<CustomEventPage />} />

        {/* 4. Explicit VIP guest pass route with rsvpId */}
        <Route path="/pass/:rsvpId" element={<QrPassPage />} />

        {/* 5. Venue scanner route */}
        <Route path="/scanner/:invitationId" element={<ScannerRouteView />} />
        <Route path="/scanner" element={<ScannerRouteView />} />

        {/* 6. Luxury 404 Fallback */}
        <Route path="*" element={<InvitationLuxuryNotFound />} />
      </Routes>

      {/* Floating Reviewer Navigation Pill */}
      <ReviewerNavPill />
    </div>
  );
};

export default App;
