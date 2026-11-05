import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { SplashCursor } from "@repo/ui-components";
import { useSubdomain, extractSubdomain } from "@repo/react-appwrite";

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

// Export extractSubdomain helper for seamless inter-module usage
export { extractSubdomain };

export interface BoothLandingViewProps {
  autoOpenBooking?: boolean;
}

/**
 * Standard Booth Marketing Landing Page & Booking Flow
 * Rendered when no custom subdomain or memory slug is detected on apex host.
 */
export const BoothLandingView: React.FC<BoothLandingViewProps> = ({
  autoOpenBooking = false,
}) => {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(autoOpenBooking);
  const [selectedPackage, setSelectedPackage] = useState("Athar Moment");

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
        onClick={() => navigate("/memory/mina-and-maryam")}
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

      {/* 02. Stats & Metrics Counter (Proof of Trust) */}
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

/**
 * Luxury 404 Fallback Screen
 * Displayed when an unknown memory heirloom path is navigated.
 */
export const BoothLuxuryNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      bg="var(--athar-bg-primary, #FDFBF7)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={6}
      py={12}
      position="relative"
    >
      <Box
        maxW="540px"
        w="100%"
        bg="#FFFFFF"
        borderRadius="24px"
        border="1px solid rgba(212, 175, 55, 0.4)"
        boxShadow="0 20px 50px -10px rgba(107, 29, 40, 0.12)"
        p={{ base: 8, md: 12 }}
        textAlign="center"
      >
        <Flex
          w="64px"
          h="64px"
          borderRadius="full"
          bg="rgba(107, 29, 40, 0.08)"
          color="#6B1D28"
          align="center"
          justify="center"
          mx="auto"
          mb={6}
          fontSize="1.75rem"
        >
          ✦
        </Flex>

        <Text
          fontSize="0.75rem"
          fontWeight="700"
          letterSpacing="0.16em"
          color="#8C6F12"
          textTransform="uppercase"
          mb={2}
        >
          ATHAR AUDIO HEIRLOOM · 404
        </Text>

        <Text
          fontFamily="'Playfair Display', serif"
          fontSize={{ base: "1.6rem", md: "2rem" }}
          fontWeight="800"
          color="#6B1D28"
          mb={3}
          lineHeight={1.25}
        >
          Memory Heirloom Not Found
        </Text>

        <Text
          fontSize="1.05rem"
          fontWeight="600"
          color="#4A4240"
          fontFamily="var(--font-arabic-display, sans-serif)"
          mb={4}
        >
          لم يتم العثور على الذكرى الصوتية الأثرية
        </Text>

        <Box h="1px" w="60px" bg="#D4AF37" mx="auto" mb={5} />

        <Text
          fontSize="0.92rem"
          color="#7A6F6D"
          lineHeight={1.7}
          mb={8}
        >
          عذراً، لم نتمكن من العثور على سجل الذكريات الصوتية المطلوب. قد يكون الرابط غير صحيح أو تم نقله.
        </Text>

        <Button
          onClick={() => navigate("/")}
          bg="#6B1D28"
          color="#FFFFFF"
          px={8}
          py={6}
          borderRadius="full"
          fontSize="0.95rem"
          fontWeight="700"
          boxShadow="0 8px 24px rgba(107, 29, 40, 0.35)"
          border="1px solid #D4AF37"
          _hover={{
            bg: "#55141E",
            transform: "translateY(-2px)",
            boxShadow: "0 12px 28px rgba(107, 29, 40, 0.45)",
          }}
          transition="all 0.25s ease"
        >
          Return to Asar · العودة لمنصة أثر
        </Button>
      </Box>
    </Box>
  );
};

/**
 * Dynamic Storefront Index for Root `/`
 * 1. Checks 4-tier subdomain resolver (hostname *.localhost / *.asar.me or ?subdomain= / ?memory=).
 * 2. If a slug is detected, renders BoothMemoryPage with that slug.
 * 3. If no subdomain is detected, renders standard Booth landing page and booking flow.
 */
export const DynamicBoothStorefrontIndex: React.FC = () => {
  const navigate = useNavigate();
  const { subdomain } = useSubdomain({
    searchParams: typeof window !== "undefined" ? window.location.search : undefined,
  });

  if (subdomain) {
    return (
      <BoothMemoryPage
        slug={subdomain}
        onBackToLanding={() => navigate("/", { replace: true })}
      />
    );
  }

  return <BoothLandingView />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* 1. Dynamic Storefront Index (apex landing or subdomain memory) */}
      <Route path="/" element={<DynamicBoothStorefrontIndex />} />

      {/* 2. Direct route to booking wizard on landing page */}
      <Route path="/book" element={<BoothLandingView autoOpenBooking={true} />} />

      {/* 3. Explicit memory routes with param */}
      <Route path="/memory/:slug" element={<BoothMemoryPage />} />
      <Route path="/m/:slug" element={<BoothMemoryPage />} />

      {/* 4. Luxury 404 Fallback */}
      <Route path="*" element={<BoothLuxuryNotFound />} />
    </Routes>
  );
};

export default App;

