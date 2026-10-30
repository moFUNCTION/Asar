import React from "react";
import { Box, Flex, HStack, Button, Badge } from "@chakra-ui/react";
import { FaPlay, FaArrowLeft } from "react-icons/fa";
import {
  BlurText,
  SplitText,
  FadeContent,
  Magnet,
  GradientWaves,
} from "@repo/ui-components";

interface HeroSectionProps {
  onOpenBooking: () => void;
  onWatchVideo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onWatchVideo,
}) => {
  return (
    <Box
      as="section"
      id="hero"
      minH="100vh"
      w="100%"
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      pt={{ base: "130px", md: "155px" }}
      pb={{ base: "60px", md: "80px" }}
      bg="#FBF7F2"
      dir="rtl"
    >
      {/* 1. Background Booth Image with Light White Effect and Lower Opacity */}
      <Box
        position="absolute"
        inset="0"
        zIndex="0"
        overflow="hidden"
        pointerEvents="none"
      >
        {/* <Box
          as="img"
          src="/assets/booth-hero-photo.webp"
          alt="ركن هاتف أثر الصوتي العتيق"
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition={{ base: "center 40%", md: "center 32%" }}
          opacity="0.32"
          filter="contrast(1.05) saturate(1.1)"
          transform="scale(1.02)"
        /> */}

        {/* Soft White & Warm Ivory Luxury Gradient Overlay */}
        <Box
          position="absolute"
          inset="0"
          bg="linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(251, 247, 242, 0.6) 45%, rgba(251, 247, 242, 0.95) 100%)"
        />

        {/* Subtle Warm Gold Radial Glow */}
        <Box
          position="absolute"
          inset="0"
          bg="radial-gradient(circle at 50% 45%, rgba(212, 175, 55, 0.12) 0%, transparent 65%)"
        />

        {/* Animated Luxury Waves Layer - Velvet Wine & Ivory Silk Harmony */}
        <Box
          position="absolute"
          inset="0"
          zIndex="1"
          opacity="0.65"
          pointerEvents="none"
        >
          <GradientWaves
            horizonColor="#FBF7F2"
            waveColor="#8A2E3B"
            crestColor="#F7EFE6"
            speed={0.28}
            amplitude={2.8}
            waveScale={0.7}
            waveRatio={1.0}
            swell={26}
            turbulence={15}
            tilt={1.02}
            zoom={1.05}
            height={3.8}
            fogDepth={45}
            brightness={1.0}
            opacity={0.88}
            mouseInteraction={true}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
      </Box>

      {/* 2. Foreground Hero Content with Mist Animation (once=false) */}
      <FadeContent
        blur={true}
        duration={1800}
        threshold={0.1}
        once={false}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          gap={{ base: 4, md: 5 }}
        >
          {/* Eyebrow Badge */}
          <Badge
            variant="outline"
            borderColor="rgba(212, 175, 55, 0.45)"
            bg="rgba(255, 255, 255, 0.94)"
            color="var(--athar-maroon)"
            px={5}
            py={2}
            borderRadius="full"
            fontSize={{ base: "0.85rem", md: "0.95rem" }}
            fontWeight="700"
            letterSpacing="0.04em"
            boxShadow="0 4px 15px rgba(107, 29, 40, 0.08)"
            backdropFilter="blur(14px)"
          >
            ✦ هاتف الذكريات الصوتي للمناسبات والأفراح الراقية
          </Badge>

          {/* Hero Main Title with BlurText (once=false) */}
          <Box maxW="960px" my={1}>
            <BlurText
              text="خلي صوتهم أثر في حكايتكم."
              delay={100}
              animateBy="words"
              direction="top"
              once={false}
              className="font-arabic-display"
              paragraphStyles={{
                fontSize: "clamp(2.7rem, 6.2vw, 5.2rem)",
                fontWeight: 800,
                lineHeight: 1.25,
                color: "var(--athar-text-title)",
                justifyContent: "center",
                letterSpacing: "-0.01em",
              }}
            />
          </Box>

          {/* Poetic Arabic Subtitle with SplitText (once=false) */}
          <Box mt={-0.5} mb={1}>
            <SplitText
              text="سِجِلُّ ضُيُوفٍ صَوْتِيٌّ لِلَّيَالِي وَالمُنَاسَبَاتِ الاسْتِثْنَائِيَّةِ"
              delay={35}
              splitType="words"
              animation="fadeUp"
              once={false}
              className="font-arabic-display"
              style={{
                fontSize: "clamp(1rem, 1.8vw, 1.35rem)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "var(--athar-maroon)",
                justifyContent: "center",
              }}
            />
          </Box>

          {/* Hero Narrative Description with BlurText (once=false) */}
          <Box maxW="780px" mb={3}>
            <BlurText
              text="أصوات الضحكات، دموع الفرح الصادقة، ودعوات الأهل والأحباب من القلب... نوثقها بنقاء استثنائي عبر هاتف كلاسيكي لتتحول إلى كنز صوتي حي تسمعونه معاً طوال العمر."
              delay={40}
              animateBy="words"
              direction="top"
              once={false}
              paragraphStyles={{
                fontSize: "clamp(1.1rem, 1.8vw, 1.35rem)",
                color: "var(--athar-text-muted)",
                lineHeight: 1.85,
                justifyContent: "center",
              }}
            />
          </Box>

          {/* Flex of Two Action Buttons */}
          <HStack
            gap={{ base: 3, md: 5 }}
            justify="center"
            flexWrap="wrap"
            my={2}
          >
            <Magnet magnetStrength={25} padding={25}>
              <Button
                onClick={onOpenBooking}
                className="btn-athar-primary"
                size={{ base: "md", md: "lg" }}
                px={{ base: 8, md: 10 }}
                py={{ base: 5, md: 6 }}
                borderRadius="full"
                fontSize={{ base: "1.05rem", md: "1.15rem" }}
                fontWeight="800"
              >
                احجز موعدك الآن <FaArrowLeft style={{ marginRight: "10px" }} />
              </Button>
            </Magnet>

            <Button
              onClick={onWatchVideo}
              className="btn-athar-secondary"
              size={{ base: "md", md: "lg" }}
              px={{ base: 6, md: 8 }}
              py={{ base: 5, md: 6 }}
              borderRadius="full"
              fontSize={{ base: "1.05rem", md: "1.15rem" }}
              fontWeight="700"
              bg="rgba(255, 255, 255, 0.9)"
              color="var(--athar-text-title)"
              border="1px solid rgba(107, 29, 40, 0.16)"
              boxShadow="0 4px 15px rgba(0, 0, 0, 0.05)"
              _hover={{
                bg: "white",
                borderColor: "var(--athar-maroon)",
                transform: "translateY(-2px)",
              }}
            >
              <FaPlay
                style={{
                  fontSize: "0.85rem",
                  color: "var(--athar-maroon)",
                  marginLeft: "10px",
                }}
              />
              شاهد التجربة بالفيديو
            </Button>
          </HStack>
        </Flex>
      </FadeContent>
    </Box>
  );
};
