import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge } from "@chakra-ui/react";
import { FaGlobe, FaWhatsapp, FaPalette, FaGem, FaCheck, FaPlus, FaCrown } from "react-icons/fa";

export interface InvitationAddon {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  badge?: string;
}

export const DEFAULT_INVITATION_ADDONS: InvitationAddon[] = [
  {
    id: "custom-domain",
    name: "دومين خاص مخصص (Custom Domain)",
    nameEn: "Branded Domain (e.g. omar-and-layla.com)",
    price: 500,
    description:
      "عنوان ويب حصري ومستقل باسمكم الشخصي أو شعار الفعالية؛ يسهل مشاركته وطباعته في كروت الهدايا والمظاريف.",
    icon: <FaGlobe size={22} />,
    badge: "الأكثر طلباً",
  },
  {
    id: "whatsapp-rsvp",
    name: "تأكيد الحضور عبر واتساب (WhatsApp RSVP)",
    nameEn: "Direct WhatsApp Bot & Notifications",
    price: 750,
    description:
      "ربط مباشر بمنظومة واتساب لإرسال بطاقات QR وتنبيهات تذكيرية بموعد الحفل قبل 48 ساعة من الفعالية.",
    icon: <FaWhatsapp size={22} />,
    badge: "مريح وفعال",
  },
  {
    id: "motion-video",
    name: "موشن جرافيكس وفيديو سينمائي 4K",
    nameEn: "Bespoke Motion Graphics Video Invitation",
    price: 1200,
    description:
      "تصميم دعوة فيديو متحركة بمؤثرات صوتية وموسيقى ملكية، ملائمة للنشر عبر Instagram Reels و TikTok وقصص واتساب.",
    icon: <FaPalette size={22} />,
    badge: "إبهار بصري",
  },
  {
    id: "vip-concierge",
    name: "فريق تأكيد هاتفي ملكي للـ VIP",
    nameEn: "White-Glove VIP Concierge Calling",
    price: 1500,
    description:
      "فريق ضيافة بروتوكولي متخصص يتواصل مع كبار الضيوف هاتفياً لتأكيد حضورهم وتنسيق استقبالهم بالصالة الملكية.",
    icon: <FaGem size={22} />,
    badge: "خدمة كبار الشخصيات",
  },
];

export interface InvitationAddonsSectionProps {
  onOpenBooking?: (selectedAddonIds?: string[]) => void;
}

export const InvitationAddonsSection: React.FC<InvitationAddonsSectionProps> = ({
  onOpenBooking,
}) => {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalAddonsPrice = selectedAddons.reduce((acc, id) => {
    const found = DEFAULT_INVITATION_ADDONS.find((a) => a.id === id);
    return acc + (found ? found.price : 0);
  }, 0);

  return (
    <Box
      as="section"
      id="addons"
      py={{ base: 20, md: 28 }}
      px={{ base: 4, sm: 6, lg: 8 }}
      bg="var(--athar-bg-secondary, #F4EFEA)"
      position="relative"
      scrollMarginTop="90px"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
        {/* Section Header */}
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 14, md: 18 }}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.5)"
            bg="rgba(255, 255, 255, 0.9)"
            color="var(--athar-maroon, #6B1D28)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="0.82rem"
            fontWeight="700"
            letterSpacing="0.06em"
            mb={3}
          >
            ✦ ترقيات وإضافات حصرية
          </Badge>

          <Text
            as="h2"
            fontFamily="var(--font-arabic-display, 'Amiri', serif)"
            fontSize="clamp(2rem, 3.8vw, 3.2rem)"
            fontWeight="800"
            color="var(--athar-text-title, #231F20)"
            lineHeight="1.25"
            mb={3}
          >
            ارتقِ بتجربة ضيوفك مع لمسات مخصصة
          </Text>

          <Text
            maxW="680px"
            fontSize={{ base: "0.98rem", md: "1.12rem" }}
            color="var(--athar-text-body, #4A4240)"
            lineHeight="1.8"
          >
            يمكنك دمج أي من هذه الخدمات الإضافية مع باقتك المختارة لتوفير تجربة استثنائية لضيوفك.
          </Text>
        </Flex>

        {/* 4 Addons Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 6, lg: 8 }} mb={10}>
          {DEFAULT_INVITATION_ADDONS.map((addon) => {
            const isSelected = selectedAddons.includes(addon.id);

            return (
              <Box
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                bg="rgba(255, 255, 255, 0.96)"
                borderRadius="24px"
                p={{ base: 6, sm: 7 }}
                border={
                  isSelected
                    ? "2px solid var(--athar-maroon, #6B1D28)"
                    : "1.5px solid rgba(107, 29, 40, 0.08)"
                }
                boxShadow={
                  isSelected
                    ? "0 18px 40px -10px rgba(107, 29, 40, 0.2)"
                    : "0 8px 24px -10px rgba(107, 29, 40, 0.05)"
                }
                cursor="pointer"
                transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                position="relative"
                _hover={{
                  transform: "translateY(-4px)",
                  borderColor: "var(--athar-maroon, #6B1D28)",
                }}
              >
                <Flex justify="space-between" align="flex-start" mb={4}>
                  <HStack gap={3.5}>
                    <Flex
                      w="50px"
                      h="50px"
                      borderRadius="16px"
                      bg={isSelected ? "var(--athar-maroon, #6B1D28)" : "rgba(107, 29, 40, 0.06)"}
                      color={isSelected ? "#D4AF37" : "var(--athar-maroon, #6B1D28)"}
                      align="center"
                      justify="center"
                      transition="all 0.2s ease"
                    >
                      {addon.icon}
                    </Flex>
                    <Box>
                      <Text fontWeight="800" fontSize="1.05rem" color="var(--athar-text-title, #231F20)">
                        {addon.name}
                      </Text>
                      <Text fontSize="0.75rem" color="var(--athar-text-muted, #7A6F6D)">
                        {addon.nameEn}
                      </Text>
                    </Box>
                  </HStack>

                  <Flex
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    bg={isSelected ? "var(--athar-maroon, #6B1D28)" : "rgba(107, 29, 40, 0.06)"}
                    color={isSelected ? "white" : "rgba(107, 29, 40, 0.35)"}
                    align="center"
                    justify="center"
                    border={isSelected ? "none" : "1px solid rgba(107, 29, 40, 0.15)"}
                  >
                    {isSelected ? <FaCheck size={12} /> : <FaPlus size={10} />}
                  </Flex>
                </Flex>

                <Text
                  fontSize="0.9rem"
                  color="var(--athar-text-body, #4A4240)"
                  lineHeight="1.7"
                  mb={5}
                >
                  {addon.description}
                </Text>

                <Flex justify="space-between" align="center" pt={3} borderTop="1px solid rgba(107, 29, 40, 0.06)">
                  {addon.badge && (
                    <Badge
                      variant="subtle"
                      bg="rgba(212, 175, 55, 0.15)"
                      color="#B7791F"
                      px={3}
                      py={0.8}
                      borderRadius="full"
                      fontSize="0.75rem"
                      fontWeight="700"
                    >
                      ✦ {addon.badge}
                    </Badge>
                  )}

                  <HStack gap={1}>
                    <Text
                      fontSize="1.3rem"
                      fontWeight="900"
                      color="var(--athar-maroon, #6B1D28)"
                      fontFamily="var(--font-arabic-display, serif)"
                    >
                      +{addon.price.toLocaleString("en-US")}
                    </Text>
                    <Text fontSize="0.82rem" fontWeight="600" color="var(--athar-text-muted, #7A6F6D)">
                      ج.م
                    </Text>
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Bottom Bar: Selected Addons Summary */}
        {selectedAddons.length > 0 && (
          <Box
            bg="white"
            borderRadius="24px"
            p={{ base: 5, sm: 6 }}
            border="1.5px solid rgba(212, 175, 55, 0.5)"
            boxShadow="0 14px 35px -8px rgba(107, 29, 40, 0.12)"
          >
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align="center"
              gap={4}
            >
              <Box textAlign={{ base: "center", sm: "right" }}>
                <Text fontWeight="800" fontSize="1.05rem" color="var(--athar-text-title, #231F20)">
                  تم اختيار ({selectedAddons.length}) إضافات حصرية
                </Text>
                <Text fontSize="0.85rem" color="var(--athar-text-muted, #7A6F6D)">
                  إجمالي الإضافات:{" "}
                  <Text as="span" fontWeight="800" color="var(--athar-maroon, #6B1D28)">
                    +{totalAddonsPrice.toLocaleString("en-US")} ج.م
                  </Text>{" "}
                  (تُضاف لباقتكم عند إتمام الحجز)
                </Text>
              </Box>

              <Button
                onClick={() => onOpenBooking?.(selectedAddons)}
                bg="var(--athar-maroon, #6B1D28)"
                color="white"
                borderRadius="full"
                px={7}
                py={5}
                fontWeight="700"
                fontSize="0.95rem"
                gap={2}
                boxShadow="0 4px 18px rgba(107, 29, 40, 0.25)"
                _hover={{
                  bg: "var(--athar-maroon-dark, #5B1621)",
                  transform: "translateY(-2px)",
                }}
              >
                <FaCrown color="#D4AF37" size={13} />
                احجز باقتك مع هذه الإضافات
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InvitationAddonsSection;
