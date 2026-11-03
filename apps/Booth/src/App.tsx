import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { SplashCursor } from "@repo/ui-components";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { HeroSection } from "./components/sections/HeroSection";
import { StatsSection } from "./components/sections/StatsSection";
import { MoreThanPhoneSection } from "./components/sections/MoreThanPhoneSection";
import { WhyChooseUsSection } from "./components/sections/WhyChooseUsSection";
import { PackagesSection } from "./components/sections/PackagesSection";
import { AddonsSection } from "./components/sections/AddonsSection";
import { HowItWorksSection } from "./components/sections/HowItWorksSection";
import { RealVoicesSection } from "./components/sections/RealVoicesSection";
import { GallerySection } from "./components/sections/GallerySection";
import { VideoSection } from "./components/sections/VideoSection";
import { FAQSection } from "./components/sections/FAQSection";
import { ContactSection } from "./components/sections/ContactSection";
import { PrivacySection } from "./components/sections/PrivacySection";
import { BookingModal } from "./components/sections/BookingModal";
import { BoothMemoryPage } from "./pages/BoothMemoryPage";

const getMemorySlugFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname;
  if (path.startsWith("/memory/")) {
    const slug = path.replace("/memory/", "").split("/")[0].trim();
    if (slug) return slug;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const memoryParam = searchParams.get("memory");
  if (memoryParam && memoryParam.trim()) {
    return memoryParam.trim();
  }
  return null;
};

export const App: React.FC = () => {
  const [currentMemorySlug, setCurrentMemorySlug] = useState<string | null>(getMemorySlugFromUrl);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState("Athar Moment");

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentMemorySlug(getMemorySlugFromUrl());
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const handleNavigateToMemory = (slug: string) => {
    const newUrl = `${window.location.pathname}?memory=${slug}`;
    window.history.pushState({}, "", newUrl);
    setCurrentMemorySlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToLanding = () => {
    const cleanUrl = window.location.pathname.startsWith("/memory") ? "/" : window.location.pathname;
    window.history.pushState({}, "", cleanUrl);
    setCurrentMemorySlug(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenBooking = (pkgName?: string) => {
    if (pkgName) {
      setSelectedPackage(pkgName);
    }
    setIsBookingOpen(true);
  };

  const handleWatchVideo = () => {
    const videoEl = document.getElementById("video");
    if (videoEl) {
      videoEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // If a memory slug is active, render the generated Booth Memory Presentation Page
  if (currentMemorySlug) {
    return (
      <BoothMemoryPage
        slug={currentMemorySlug}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  // Otherwise, render the standard marketing landing page
  return (
    <Box
      minH="100vh"
      bg="var(--athar-bg-primary)"
      color="var(--athar-text-body)"
      position="relative"
    >
      {/* Interactive Fluid Splash Cursor */}
      <SplashCursor
        rainbow={false}
        colors={["#6B1D28", "#8A2E3B", "#D4AF37", "#C5A059"]}
        theme="light"
        glow={0}
        intensity={0.3}
        force={1.1}
        size={1.0}
        trail={1.2}
        zIndex={99}
      />

      {/* Floating pill in bottom-left corner to preview Mina & Maryam memory page */}
      <Box
        position="fixed"
        bottom={{ base: "18px", md: "24px" }}
        left={{ base: "18px", md: "24px" }}
        zIndex="90"
        as="button"
        onClick={() => handleNavigateToMemory("mina-and-maryam")}
        bg="var(--athar-maroon, #6B1D28)"
        color="white"
        px={{ base: 3.5, md: 5 }}
        py={{ base: 2.5, md: 3 }}
        borderRadius="full"
        boxShadow="0 10px 28px rgba(107, 29, 40, 0.4)"
        border="1.5px solid #D4AF37"
        display="flex"
        alignItems="center"
        gap={2.5}
        cursor="pointer"
        fontWeight="700"
        fontSize={{ base: "0.82rem", md: "0.9rem" }}
        transition="all 0.25s ease"
        _hover={{
          transform: "translateY(-3px) scale(1.02)",
          boxShadow: "0 14px 34px rgba(107, 29, 40, 0.5)",
          bg: "var(--athar-maroon-dark, #5B1621)",
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>🎧</span>
        <span>معاينة صفحة ذكريات العروسين (Mina & Maryam)</span>
      </Box>

      {/* 00. Dual-State Adaptive Header (Static -> Floating CardNav on Scroll) */}
      <Header onOpenBooking={() => handleOpenBooking()} />

      {/* 01. Fullscreen Hero Section (100vh) */}
      <HeroSection
        onOpenBooking={() => handleOpenBooking()}
        onWatchVideo={handleWatchVideo}
      />

      {/* 02. Stats & Metrics Counter (Proof of Trust from Screen 1) */}
      <StatsSection />

      {/* 03. "More Than A Phone" Narrative Section */}
      <MoreThanPhoneSection />

      {/* 04. "Why Choose Us" (Sticky CircularGallery + Accordion + Ghazal Verse) */}
      <WhyChooseUsSection />

      {/* 05. Our Packages Showcase (FadeContent mist + TiltedCard) */}
      <PackagesSection onSelectPackage={(pkg) => handleOpenBooking(pkg)} />

      {/* 06. Bespoke Add-ons & Custom Styling ("Make It Yours") */}
      <AddonsSection />

      {/* 07. How It Works (5-Step Numbered Journey + PaperCrumple) */}
      <HowItWorksSection />

      {/* 08. Real Voices (Waveform Audio Showcase) */}
      <RealVoicesSection />

      {/* 09. Moments Around The Phone (Candid Gallery + DecayCard) */}
      <GallerySection />

      {/* 10. Video Highlights (30 Seconds Reel + ScrollExpand) */}
      <VideoSection />

      {/* 11. Frequently Asked Questions (Chakra Accordion) */}
      <FAQSection />

      {/* 12. Contact Hub & Regional Coverage Map */}
      <ContactSection />

      {/* 13. Privacy & Security Guarantee */}
      <PrivacySection />

      {/* 14. Editorial Luxury Footer */}
      <Footer />

      {/* Interactive Multi-Step Booking Modal & Confirmation State */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialPackage={selectedPackage}
      />
    </Box>
  );
};

export default App;

