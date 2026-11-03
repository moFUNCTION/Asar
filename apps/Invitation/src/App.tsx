import React, { useState, useEffect } from "react";
import { InvitationLandingPage } from "./pages/InvitationLandingPage";
import { CustomEventPage } from "./pages/CustomEventPage";
import { GuestPassPage } from "./pages/GuestPassPage";

export type AppViewMode = "landing" | "event" | "pass";

export interface AppViewState {
  mode: AppViewMode;
  slug: string;
  rsvpId: string;
}

export const App: React.FC = () => {
  // Parse initial route from URL search params or pathname
  const parseInitialRoute = (): AppViewState => {
    try {
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const eventParam = urlParams.get("event") || urlParams.get("e");
        const passParam = urlParams.get("pass") || urlParams.get("p");

        if (eventParam) {
          return { mode: "event", slug: eventParam, rsvpId: "rsvp-approved-1" };
        }
        if (passParam) {
          return { mode: "pass", slug: "omar-and-layla", rsvpId: passParam };
        }

        const path = window.location.pathname;
        if (path.startsWith("/e/")) {
          const pathSlug = path.replace(/^\/e\//, "").split("/")[0];
          if (pathSlug) return { mode: "event", slug: pathSlug, rsvpId: "rsvp-approved-1" };
        }
        if (path.startsWith("/pass/")) {
          const pathPass = path.replace(/^\/pass\//, "").split("/")[0];
          if (pathPass) return { mode: "pass", slug: "omar-and-layla", rsvpId: pathPass };
        }
      }
    } catch {
      // Ignore
    }
    return { mode: "landing", slug: "omar-and-layla", rsvpId: "rsvp-approved-1" };
  };

  const [view, setView] = useState<AppViewState>(parseInitialRoute);

  // Sync browser URL parameters on view change (without reloading)
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && typeof window.history.pushState === "function") {
        let newUrl = window.location.pathname;
        if (view.mode === "event") {
          newUrl = `?event=${encodeURIComponent(view.slug)}`;
        } else if (view.mode === "pass") {
          newUrl = `?pass=${encodeURIComponent(view.rsvpId)}`;
        } else {
          newUrl = window.location.pathname;
        }
        window.history.replaceState(null, "", newUrl);
      }
    } catch {
      // Ignore
    }
  }, [view]);

  return (
    <div className="athar-invitation-app" style={{ minHeight: "100vh", position: "relative" }}>
      {/* 1. Main View Rendering */}
      {view.mode === "landing" && (
        <InvitationLandingPage
          onPreviewEvent={(slug) => setView((prev) => ({ ...prev, mode: "event", slug }))}
          onPreviewPass={(rsvpId) => setView((prev) => ({ ...prev, mode: "pass", rsvpId }))}
        />
      )}

      {view.mode === "event" && (
        <CustomEventPage
          slug={view.slug}
          onBack={() => setView((prev) => ({ ...prev, mode: "landing" }))}
          onOpenPass={(rsvpId) => setView((prev) => ({ ...prev, mode: "pass", rsvpId }))}
        />
      )}

      {view.mode === "pass" && (
        <GuestPassPage
          passId={view.rsvpId}
          onBack={() => setView((prev) => ({ ...prev, mode: "event" }))}
        />
      )}

      {/* 2. Floating Reviewer Navigation Pill (Fixed Bottom-Left) */}
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
          onClick={() => setView((prev) => ({ ...prev, mode: "landing" }))}
          style={{
            padding: "6px 14px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor:
              view.mode === "landing" ? "var(--athar-maroon)" : "transparent",
            color: view.mode === "landing" ? "#FFFFFF" : "#D1D5DB",
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
          onClick={() =>
            setView((prev) => ({ ...prev, mode: "event", slug: "omar-and-layla" }))
          }
          style={{
            padding: "6px 14px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor:
              view.mode === "event" ? "var(--athar-maroon)" : "transparent",
            color: view.mode === "event" ? "#FFFFFF" : "#D1D5DB",
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
          onClick={() =>
            setView((prev) => ({ ...prev, mode: "pass", rsvpId: "rsvp-approved-1" }))
          }
          style={{
            padding: "6px 14px",
            borderRadius: "9999px",
            border: "none",
            backgroundColor:
              view.mode === "pass" ? "var(--athar-maroon)" : "transparent",
            color: view.mode === "pass" ? "#FFFFFF" : "#D1D5DB",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          3. بطاقة الدخول (VIP QR Pass)
        </button>
      </aside>
    </div>
  );
};

export default App;
