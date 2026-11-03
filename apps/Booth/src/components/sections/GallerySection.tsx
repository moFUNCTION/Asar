import React from "react";
import { Box, Flex, SimpleGrid, Text, Badge, Image } from "@chakra-ui/react";
import { FadeContent, SplitText } from "@repo/ui-components";

export const GallerySection: React.FC = () => {
  const galleryItems = [
    {
      src: "/assets/wedding2.jpg",
      caption: "ركن الهاتف العاجي وسط الشموع والزهور الطبيعية",
      type: "image",
    },
    {
      type: "brand-card",
      title1: "نَاس طَيِّبِين",
      title2: "أَصْوَات جَمِيلَة",
      title3: "أَثَـــر يَدُوم",
      sub: "سِجِلُّ الذِّكْرَيَاتِ الصَّوْتِيُّ لِلأَفْرَاحِ",
    },
    {
      src: "/assets/love-wedding.jpg",
      caption: "ضحكات عفوية وصادقة تدوم للأبد",
      type: "image",
    },
    {
      src: "/assets/booth-hero-photo.webp",
      caption: "أناقة وتصميم كلاسيكي يضفي فخامة لكل زاوية",
      type: "image",
    },
    {
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      caption: "لحظات فرح واحتفال الأصحاب حول الهاتف",
      type: "image",
    },
    {
      src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      caption: "بركة الوالدين ودعوات محفورة في الوجدان",
      type: "image",
    },
  ];

  return (
    <Box
      as="section"
      id="gallery"
      py={{ base: 24, md: 32 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-primary)"
      position="relative"
      scrollMarginTop="130px"
      dir="rtl"
    >
      <Box maxW="1240px" mx="auto">
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 12, md: 16 }}>
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            bg="rgba(255, 255, 255, 0.85)"
            color="var(--athar-maroon)"
            px={4}
            py={1.5}
            borderRadius="full"
            fontSize="0.82rem"
            fontWeight="700"
            letterSpacing="0.08em"
            mb={2}
          >
            ذِكْرَيَـــات مُصَـــوَّرَة
          </Badge>
          <SplitText
            text="لحظات حول الهاتف"
            delay={50}
            splitType="words"
            animation="fadeUp"
            once={false}
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
              fontWeight: 800,
              color: "var(--athar-text-title)",
              marginBottom: "0.5rem",
            }}
          />
          <SplitText
            text="صور حقيقية توثق عفوية وجمال ضيوفنا في مختلف المناسبات."
            delay={25}
            splitType="words"
            animation="fadeUp"
            once={false}
            style={{
              fontSize: "1.08rem",
              color: "var(--athar-text-muted)",
              marginTop: "4px",
              justifyContent: "center",
            }}
          />
        </Flex>

        {/* Static Luxury Bento Photowall (Clean, crisp, no distorted effects) */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>
          {galleryItems.map((item, idx) => {
            if (item.type === "brand-card") {
              return (
                <FadeContent key={idx} blur={true} duration={1800} threshold={0.1} once={false}>
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    bg="linear-gradient(145deg, #5B1621 0%, #350A10 100%)"
                    borderRadius="24px"
                    p={8}
                    textAlign="center"
                    color="white"
                    border="1.5px solid rgba(212, 175, 55, 0.55)"
                    boxShadow="0 16px 40px -10px rgba(91, 22, 33, 0.45)"
                    h="330px"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      inset="0"
                      bg="radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 70%)"
                      pointerEvents="none"
                    />
                    <Text
                      fontFamily="var(--font-arabic-display)"
                      fontSize="2.2rem"
                      fontWeight="800"
                      color="#FFFFFF"
                      lineHeight="1.3"
                    >
                      {item.title1}
                    </Text>
                    <Text
                      fontFamily="var(--font-arabic-display)"
                      fontSize="1.9rem"
                      fontWeight="800"
                      color="#D4AF37"
                      lineHeight="1.3"
                      my={1}
                    >
                      {item.title2}
                    </Text>
                    <Text
                      fontFamily="var(--font-arabic-display)"
                      fontSize="2.2rem"
                      fontWeight="800"
                      color="#FFFFFF"
                      lineHeight="1.3"
                    >
                      {item.title3}
                    </Text>
                    <Text
                      fontSize="0.82rem"
                      letterSpacing="0.16em"
                      color="#E6C875"
                      mt={4}
                      fontWeight="700"
                      textTransform="uppercase"
                    >
                      {item.sub}
                    </Text>
                  </Flex>
                </FadeContent>
              );
            }

            return (
              <FadeContent key={idx} blur={true} duration={1800} threshold={0.1} once={false}>
                <Box
                  borderRadius="24px"
                  overflow="hidden"
                  boxShadow="0 15px 35px -10px rgba(107, 29, 40, 0.14)"
                  border="1px solid rgba(212, 175, 55, 0.3)"
                  position="relative"
                  h="330px"
                  bg="var(--athar-bg-secondary)"
                  transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                  _hover={{
                    transform: "translateY(-6px)",
                    boxShadow: "0 22px 45px -10px rgba(107, 29, 40, 0.22)",
                    borderColor: "rgba(212, 175, 55, 0.6)",
                  }}
                >
                  <Image
                    src={item.src}
                    alt={item.caption}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    display="block"
                    transition="transform 0.5s ease"
                    _hover={{ transform: "scale(1.04)" }}
                  />
                  {/* Frosted Caption Glass Tag */}
                  <Box
                    position="absolute"
                    bottom="14px"
                    left="14px"
                    right="14px"
                    bg="rgba(255, 255, 255, 0.94)"
                    backdropFilter="blur(14px)"
                    px={4}
                    py={2.5}
                    borderRadius="16px"
                    border="1px solid rgba(212, 175, 55, 0.35)"
                    boxShadow="0 4px 15px rgba(0, 0, 0, 0.08)"
                    textAlign="center"
                  >
                    <Text fontSize="0.88rem" fontWeight="700" color="var(--athar-maroon-dark)">
                      {item.caption}
                    </Text>
                  </Box>
                </Box>
              </FadeContent>
            );
          })}
        </SimpleGrid>
      </Box>
    </Box>
  );
};
