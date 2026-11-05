import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { EcosystemHome } from "./components/home/EcosystemHome";
import { ClientAccountShell } from "./components/account/ClientAccountShell";
import { AuthModal } from "./components/auth/AuthModal";
import { RequireAuth } from "@repo/react-appwrite";

export const PlatformGateway: React.FC<{
  initialAuthOpen?: boolean;
  onOpenAccount: (defaultTab?: string) => void;
  onOpenAuth: () => void;
  currentUser?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}> = ({ onOpenAccount, onOpenAuth, currentUser, onLogout }) => {
  return (
    <EcosystemHome
      onOpenAccount={onOpenAccount}
      onOpenAuth={onOpenAuth}
      currentUser={currentUser}
      onLogout={onLogout}
    />
  );
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Restore saved demo user or session
  useEffect(() => {
    try {
      const saved = localStorage.getItem("asar_active_client");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) {
          setCurrentUser({
            name: parsed.name || "عميل أثر",
            email: parsed.email,
          });
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Sync auth modal with /auth route
  useEffect(() => {
    if (location.pathname === "/auth") {
      setIsAuthOpen(true);
    }
  }, [location.pathname]);

  const handleOpenAccount = (tab = "orders") => {
    const route = tab === "qr_hub" ? "qr-hub" : tab;
    navigate(`/account/${route}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    navigate("/account/orders");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("asar_active_client");
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    navigate("/");
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (location.pathname === "/auth") {
      navigate("/");
    }
  };

  return (
    <Box minH="100vh" bg="var(--athar-bg-primary)">
      <Routes>
        <Route
          path="/"
          element={
            <PlatformGateway
              onOpenAccount={handleOpenAccount}
              onOpenAuth={() => setIsAuthOpen(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/auth"
          element={
            <PlatformGateway
              initialAuthOpen={true}
              onOpenAccount={handleOpenAccount}
              onOpenAuth={() => setIsAuthOpen(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth fallback={<Navigate to="/auth" replace />}>
              <ClientAccountShell
                onBackToHome={handleBackToHome}
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/account/*"
          element={
            <RequireAuth fallback={<Navigate to="/auth" replace />}>
              <ClientAccountShell
                onBackToHome={handleBackToHome}
                onLogout={handleLogout}
                currentUser={currentUser}
              />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
};

export default App;
