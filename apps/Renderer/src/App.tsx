import React from "react";
import { Routes, Route } from "react-router-dom";
import { DynamicStorefrontIndex } from "./pages/DynamicStorefrontIndex";
import { StorefrontNotFound } from "./pages/StorefrontNotFound";
import { GuestPassStorefrontPage } from "./pages/GuestPassStorefrontPage";

// =============================================================
// ASAR (Athar / أثر) — Dedicated Dynamic Storefront Renderer Route Tree
// Master React Router v6 Configuration (Port 3004)
// =============================================================

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Dynamic Storefront Root: resolves *.localhost, ?subdomain=, or bare apex portal */}
      <Route path="/" element={<DynamicStorefrontIndex />} />

      {/* 2. Universal Memory Path: automatically classifies Booth vs Invitation */}
      <Route path="/s/:slug" element={<DynamicStorefrontIndex />} />

      {/* 3. Explicit Booth Memory Routes */}
      <Route
        path="/booth/:slug"
        element={<DynamicStorefrontIndex forcedType="booth" />}
      />
      <Route
        path="/memory/:slug"
        element={<DynamicStorefrontIndex forcedType="booth" />}
      />
      <Route
        path="/m/:slug"
        element={<DynamicStorefrontIndex forcedType="booth" />}
      />

      {/* 4. Explicit Invitation Memory Routes */}
      <Route
        path="/invitation/:slug"
        element={<DynamicStorefrontIndex forcedType="invitation" />}
      />
      <Route
        path="/event/:slug"
        element={<DynamicStorefrontIndex forcedType="invitation" />}
      />
      <Route
        path="/e/:slug"
        element={<DynamicStorefrontIndex forcedType="invitation" />}
      />

      {/* 5. VIP Guest QR Pass Route */}
      <Route path="/pass/:rsvpId" element={<GuestPassStorefrontPage />} />

      {/* 6. Branded Luxury 404 Catch-All Screen */}
      <Route path="*" element={<StorefrontNotFound />} />
    </Routes>
  );
};

export default App;
