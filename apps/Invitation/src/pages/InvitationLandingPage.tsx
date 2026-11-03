import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import {
  InvitationHeader,
  InvitationLandingHero,
  InvitationThemesGallery,
  InvitationFeaturesShowcase,
  InvitationPackagesSection,
  InvitationAddonsSection,
  InvitationBookingModal,
  InvitationFooter,
} from "../components/landing";
import type { InvitationPlan } from "../components/landing";

export interface InvitationLandingPageProps {
  onPreviewEvent?: (slug: string) => void;
  onPreviewPass?: (rsvpId: string) => void;
  onSelectPackage?: (pkg: InvitationPlan) => void;
}

export const InvitationLandingPage: React.FC<InvitationLandingPageProps> = ({
  onPreviewEvent,
  onPreviewPass,
  onSelectPackage,
}) => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<InvitationPlan | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const handleOpenBooking = (pkg?: InvitationPlan, addons?: string[]) => {
    if (pkg) {
      setSelectedPackage(pkg);
      if (onSelectPackage) {
        onSelectPackage(pkg);
      }
    }
    if (addons) {
      setSelectedAddons(addons);
    }
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <Box
      dir="rtl"
      minH="100vh"
      bg="var(--athar-bg-primary, #FBF7F2)"
      color="var(--athar-text-title, #231F20)"
      fontFamily="var(--font-body, 'Cairo', sans-serif)"
      position="relative"
    >
      {/* 1. Frosted Sticky Header */}
      <InvitationHeader
        onOpenBooking={() => handleOpenBooking()}
        onPreviewEvent={onPreviewEvent}
      />

      {/* 2. Hero Showcase with Waves Shader & Animated Headlines */}
      <InvitationLandingHero
        onOpenBooking={() => handleOpenBooking()}
        onPreviewEvent={onPreviewEvent}
      />

      {/* 3. Occasions & Themes Gallery (Weddings, Festivals, Galas, Graduations) */}
      <InvitationThemesGallery
        onPreviewEvent={onPreviewEvent}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 4. Feature Showcase & Mailbox / QR Journey */}
      <InvitationFeaturesShowcase
        onOpenBooking={() => handleOpenBooking()}
        onPreviewPass={onPreviewPass}
      />

      {/* 5. Dynamic Packages & Pricing (Appwrite Sync / Defaults) */}
      <InvitationPackagesSection
        onSelectPackage={(pkg) => handleOpenBooking(pkg)}
      />

      {/* 6. Selectable Luxury Addons */}
      <InvitationAddonsSection
        onOpenBooking={(addons) => handleOpenBooking(undefined, addons)}
      />

      {/* 7. Footer */}
      <InvitationFooter />

      {/* 8. 4-Step Booking & Payment Screenshot Wizard Modal */}
      <InvitationBookingModal
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
        initialPackage={selectedPackage}
        initialAddons={selectedAddons}
      />
    </Box>
  );
};

export default InvitationLandingPage;
