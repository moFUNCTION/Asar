import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { EcosystemHome } from "./components/home/EcosystemHome";
import { ClientAccountShell } from "./components/account/ClientAccountShell";
import { AuthModal } from "./components/auth/AuthModal";

export type ActiveView = "gateway" | "account";

export const App: React.FC = () => {
  const [view, setView] = useState<ActiveView>("gateway");
  const [accountTab, setAccountTab] = useState<string>("orders");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Check URL parameters & local session on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get("view");
      const urlTab = params.get("tab");

      if (urlView === "account") {
        setView("account");
        if (urlTab) setAccountTab(urlTab);
      } else if (urlTab === "mailbox") {
        setView("account");
        setAccountTab("mailbox");
      }

      // Restore saved demo user or session
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

  const handleOpenAccount = (tab = "orders") => {
    setAccountTab(tab);
    setView("account");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToHome = () => {
    setView("gateway");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    // After login, transition smoothly to account view
    setView("account");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("asar_active_client");
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setView("gateway");
  };

  return (
    <Box minH="100vh" bg="var(--athar-bg-primary)">
      {view === "gateway" ? (
        <EcosystemHome
          onOpenAccount={handleOpenAccount}
          onOpenAuth={() => setIsAuthOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      ) : (
        <ClientAccountShell
          initialTab={accountTab}
          onBackToHome={handleBackToHome}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      )}

      {/* Global Customer Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
};

export default App;
