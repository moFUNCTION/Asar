import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, HStack, Button, Badge, SimpleGrid, Image } from "@chakra-ui/react";
import { FaPlay, FaPause, FaVolumeUp, FaExpand, FaVideo } from "react-icons/fa";
import { FadeContent, SplitText, BlurText } from "@repo/ui-components";

export const VideoSection: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1.6;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      if (!isPlaying) {
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm harmonic chord
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsPlaying(true);
      } else {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
        setIsPlaying(false);
      }
    } catch {
      setIsPlaying(!isPlaying);
    }
  };

  const currentSeconds = Math.floor((progress / 100) * 30);
  const formattedSeconds = currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds;

  return (
    <Box
      as="section"
      id="video"
      py={{ base: 24, md: 32 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-secondary)"
      position="relative"
      scrollMarginTop="130px"
      dir="rtl"
    >
      <Box maxW="1100px" mx="auto">
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
            لَقَطَـــات سِينِمَائِيَّـــة
          </Badge>
          <SplitText
            text="فيديو هايلايت المناسبة"
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
          <BlurText
            text="٣٠ ثانية ... تدوم مشاعرها عمراً كاملاً."
            delay={40}
            animateBy="words"
            direction="top"
            once={false}
            paragraphStyles={{
              fontSize: "1.1rem",
              color: "var(--athar-text-muted)",
              justifyContent: "center",
            }}
          />
        </Flex>

        {/* Static Luxury Video Player Card (Screen 08 in screens-booth.jpeg) */}
        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          <Box
            w="100%"
            h={{ base: "360px", sm: "440px", md: "520px" }}
            borderRadius="30px"
            overflow="hidden"
            boxShadow="0 25px 60px -15px rgba(107, 29, 40, 0.28)"
            border="1.5px solid rgba(212, 175, 55, 0.45)"
            bg="#181214"
            position="relative"
          >
            {/* Poster / Video Background */}
            <Image
              src="/assets/love-wedding.jpg"
              alt="فيديو أثر السينمائي"
              w="100%"
              h="100%"
              objectFit="cover"
              filter="contrast(1.06) brightness(0.72)"
              display="block"
              transition="transform 0.5s ease"
              _hover={{ transform: "scale(1.02)" }}
            />

            {/* Dark Luxury Vignette Overlay */}
            <Box
              position="absolute"
              inset="0"
              bg="linear-gradient(180deg, rgba(20, 14, 16, 0.55) 0%, rgba(20, 14, 16, 0.3) 50%, rgba(20, 14, 16, 0.88) 100%)"
              pointerEvents="none"
            />

            {/* Center Play Button & Title */}
            <Flex
              position="absolute"
              inset="0"
              direction="column"
              align="center"
              justify="center"
              gap={4}
              zIndex="10"
              cursor="pointer"
              onClick={togglePlay}
            >
              <Flex
                w={{ base: "74px", md: "92px" }}
                h={{ base: "74px", md: "92px" }}
                borderRadius="full"
                bg={isPlaying ? "var(--athar-maroon)" : "rgba(255, 255, 255, 0.92)"}
                color={isPlaying ? "#FFFFFF" : "var(--athar-maroon)"}
                align="center"
                justify="center"
                boxShadow="0 0 35px rgba(212, 175, 55, 0.5)"
                border="2px solid #D4AF37"
                transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                _hover={{
                  transform: "scale(1.1)",
                  boxShadow: "0 0 45px rgba(212, 175, 55, 0.7)",
                }}
              >
                {isPlaying ? (
                  <FaPause size={28} />
                ) : (
                  <FaPlay size={28} style={{ marginRight: "4px" }} />
                )}
              </Flex>

              <Box textAlign="center" color="white" textShadow="0 2px 10px rgba(0,0,0,0.8)">
                <Text
                  fontFamily="var(--font-arabic-display)"
                  fontSize={{ base: "1.4rem", md: "1.8rem" }}
                  fontWeight="800"
                >
                  نفس الأشخاص... مشاعر وأصوات مختلفة.
                </Text>
                <Text
                  fontSize="0.95rem"
                  color="#E6C875"
                  fontWeight="600"
                  mt={0.5}
                >
                  أصوات تدوم عمراً، وذكريات تسمعونها معاً للأبد.
                </Text>
              </Box>
            </Flex>

            {/* Bottom Media Player Bar (from Screen 08) */}
            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              bg="rgba(20, 14, 16, 0.9)"
              backdropFilter="blur(16px)"
              px={{ base: 4, md: 6 }}
              py={3.5}
              borderTop="1px solid rgba(212, 175, 55, 0.25)"
              zIndex="20"
              dir="ltr"
            >
              <HStack gap={4} align="center">
                <Box
                  as="button"
                  onClick={togglePlay}
                  color="#D4AF37"
                  _hover={{ color: "white" }}
                  aria-label="تشغيل"
                >
                  {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
                </Box>

                <Text fontSize="0.82rem" color="white" fontWeight="700" fontFamily="monospace">
                  0:{formattedSeconds} / 0:30
                </Text>

                {/* Timeline Progress Track */}
                <Box
                  flex="1"
                  h="4px"
                  bg="rgba(255, 255, 255, 0.25)"
                  borderRadius="full"
                  position="relative"
                  cursor="pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPct = (clickX / rect.width) * 100;
                    setProgress(Math.max(0, Math.min(100, newPct)));
                  }}
                >
                  <Box
                    h="100%"
                    w={`${progress}%`}
                    bg="linear-gradient(90deg, #D4AF37, #FFFFFF)"
                    borderRadius="full"
                    transition="width 0.2s linear"
                  />
                </Box>

                <HStack gap={3} color="rgba(255, 255, 255, 0.8)">
                  <FaVolumeUp size={14} />
                  <FaExpand size={14} />
                </HStack>
              </HStack>
            </Box>
          </Box>
        </FadeContent>

        {/* 3 Video Thumbnails & CTA Button from Screen 08 */}
        <Box mt={8}>
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={5}>
            {[
              {
                title: "فرح يوسف ونور",
                location: "فورسيزونز الإسكندرية",
                img: "/assets/wedding2.jpg",
                time: "0:30",
              },
              {
                title: "سهرة كريم ومريم",
                location: "هاسيندا باي - الساحل الشمالي",
                img: "/assets/booth-hero-photo.webp",
                time: "0:30",
              },
              {
                title: "دعوات وبركات الأهل",
                location: "قصر البارون - القاهرة",
                img: "/assets/landing-booth.jpeg",
                time: "0:30",
              },
            ].map((v, i) => (
              <FadeContent key={i} blur={true} duration={700} initialOpacity={0}>
                <HStack
                  p={3.5}
                  bg="white"
                  borderRadius="18px"
                  border="1px solid rgba(107, 29, 40, 0.08)"
                  boxShadow="0 4px 15px rgba(0, 0, 0, 0.04)"
                  gap={3.5}
                  cursor="pointer"
                  transition="all 0.3s ease"
                  _hover={{
                    borderColor: "var(--athar-maroon)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 25px -5px rgba(107, 29, 40, 0.15)",
                  }}
                  onClick={togglePlay}
                >
                  <Box
                    w="72px"
                    h="56px"
                    borderRadius="12px"
                    overflow="hidden"
                    position="relative"
                    flexShrink={0}
                  >
                    <Image
                      src={v.img}
                      alt={v.title}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                    <Flex
                      position="absolute"
                      inset="0"
                      bg="rgba(0, 0, 0, 0.35)"
                      align="center"
                      justify="center"
                      color="white"
                    >
                      <FaPlay size={12} />
                    </Flex>
                  </Box>
                  <Box flex="1" textAlign="right">
                    <Text
                      fontFamily="var(--font-arabic-display)"
                      fontSize="1.05rem"
                      fontWeight="700"
                      color="var(--athar-text-title)"
                    >
                      {v.title}
                    </Text>
                    <Text fontSize="0.82rem" color="var(--athar-text-muted)" mt={0.5}>
                      {v.location}
                    </Text>
                  </Box>
                </HStack>
              </FadeContent>
            ))}
          </SimpleGrid>

          <Flex justify="center" mt={8}>
            <Button
              className="btn-athar-secondary"
              size="lg"
              px={8}
              borderRadius="full"
              fontSize="1.05rem"
              onClick={togglePlay}
            >
              <FaVideo style={{ marginLeft: "8px", color: "var(--athar-maroon)" }} />
              مشاهدة المزيد من الفيديوهات
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
