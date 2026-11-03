import React, { useState } from "react";
import { Box, Flex, SimpleGrid, Text, HStack, Button, Badge, Image } from "@chakra-ui/react";
import { FaPlay, FaPause, FaVolumeUp } from "react-icons/fa";
import { FadeContent, SplitText } from "@repo/ui-components";

export const RealVoicesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [playingId, setPlayingId] = useState<number | null>(null);

  const categories = ["الكل", "العروسين", "العائلة", "الأصدقاء"];

  const voices = [
    {
      id: 1,
      name: "نور",
      role: "الصديقة المقربة",
      category: "الأصدقاء",
      duration: "0:42",
      quote: "مبروك يا جميلة... كان إحساس عظيم كأننا كلنا عايشين الفرح تاني سوا.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 2,
      name: "أحمد",
      role: "الأخ",
      category: "العائلة",
      duration: "1:12",
      quote: "خليكم مبسوطين كدا دايماً، ربنا يجعل بيتكم مليان دفء وبركة وسعادة يا غاليين.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 3,
      name: "منى",
      role: "بنت الخال",
      category: "العائلة",
      duration: "0:38",
      quote: "بنحبكم جداً وألف ألف مبروك يا أحلى عرايس في الدنيا، منورين الفرح كله!",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 4,
      name: "طارق",
      role: "زميل العمل",
      category: "الأصدقاء",
      duration: "0:55",
      quote: "كان لي عظيم الشرف أكون متواجد وأشارككم الليلة دي، فكرة الهاتف بجد عبقرية!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 5,
      name: "الجدة (ماما نادية)",
      role: "بركة العائلة",
      category: "العائلة",
      duration: "1:08",
      quote: "ربنا يسعدكم يا حبايب قلبي ويجعل أيامكم كلها خير وبركة وفرح دائم يا رب.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    },
    {
      id: 6,
      name: "مينا ومريم",
      role: "العروسين (شهادة حية)",
      category: "العروسين",
      duration: "1:30",
      quote: "سمعنا رسائل صحابنا وتيتي تاني يوم الصبح وبجد دمعنا من كتر المشاعر الصادقة.",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    },
  ];

  const filteredVoices =
    activeCategory === "الكل"
      ? voices
      : voices.filter((v) => v.category === activeCategory);

  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.1, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.5);
      });
    } catch {
      // AudioContext fallback
    }
  };

  const togglePlay = (id: number) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      playChime();
    }
  };

  return (
    <Box
      as="section"
      id="voices"
      py={{ base: 20, md: 28 }}
      px={{ base: 5, md: 10, lg: 16 }}
      bg="var(--athar-bg-secondary)"
      position="relative"
      scrollMarginTop="120px"
      dir="rtl"
    >
      <Box maxW="1200px" mx="auto">
        <Flex direction="column" align="center" textAlign="center" mb={{ base: 10, md: 14 }}>
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
            اسْتَمِـــع لِلْمَشَاعِـــر
          </Badge>
          <SplitText
            text="أصوات حقيقية"
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
            text="من عرسان أثر وأحبائهم ومعازيمهم في أجمل الليالي"
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

          {/* Filter Pills */}
          <HStack gap={2.5} mt={6} flexWrap="wrap" justify="center">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                borderRadius="full"
                px={5}
                py={2.5}
                fontSize="0.92rem"
                fontWeight="700"
                bg={activeCategory === cat ? "var(--athar-maroon)" : "white"}
                color={activeCategory === cat ? "white" : "var(--athar-text-body)"}
                border="1px solid"
                borderColor={
                  activeCategory === cat
                    ? "var(--athar-maroon)"
                    : "rgba(107, 29, 40, 0.12)"
                }
                boxShadow={
                  activeCategory === cat
                    ? "0 4px 12px rgba(107, 29, 40, 0.2)"
                    : "0 2px 6px rgba(0, 0, 0, 0.02)"
                }
                onClick={() => setActiveCategory(cat)}
                _hover={{
                  bg: activeCategory === cat ? "var(--athar-maroon)" : "#FBF7F2",
                }}
              >
                {cat}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* Audio Voice Cards Grid */}
        <FadeContent blur={true} duration={1800} threshold={0.1} once={false}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {filteredVoices.map((item) => {
              const isPlaying = playingId === item.id;
              return (
                <Box
                  key={item.id}
                  p={6}
                  bg="rgba(255, 255, 255, 0.94)"
                  borderRadius="24px"
                  border="1px solid"
                  borderColor={isPlaying ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
                  boxShadow={
                    isPlaying
                      ? "0 14px 35px -10px rgba(107, 29, 40, 0.2)"
                      : "0 6px 20px -8px rgba(0, 0, 0, 0.04)"
                  }
                  transition="all 0.3s ease"
                >
                  <Flex justify="space-between" align="center" mb={4}>
                    <HStack gap={3}>
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        w="50px"
                        h="50px"
                        borderRadius="full"
                        objectFit="cover"
                        border="2px solid #D4AF37"
                      />
                      <Box>
                        <Text
                          fontFamily="var(--font-arabic-display)"
                          fontSize="1.2rem"
                          fontWeight="700"
                          color="var(--athar-text-title)"
                        >
                          {item.name}
                        </Text>
                        <Text fontSize="0.82rem" color="var(--athar-text-muted)">
                          {item.role}
                        </Text>
                      </Box>
                    </HStack>

                    <Button
                      size="sm"
                      borderRadius="full"
                      w="42px"
                      h="42px"
                      p={0}
                      bg={isPlaying ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
                      color={isPlaying ? "white" : "var(--athar-maroon)"}
                      onClick={() => togglePlay(item.id)}
                      _hover={{
                        bg: "var(--athar-maroon)",
                        color: "white",
                        transform: "scale(1.05)",
                      }}
                      aria-label="تشغيل التسجيل الصوتي"
                    >
                      {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} style={{ marginRight: "3px" }} />}
                    </Button>
                  </Flex>

                  {/* Waveform Visualizer Simulation */}
                  <Box
                    py={3}
                    px={4}
                    bg="rgba(251, 247, 242, 0.95)"
                    borderRadius="14px"
                    border="1px solid rgba(212, 175, 55, 0.3)"
                    mb={4}
                  >
                    <Flex align="center" justify="space-between" gap={1} dir="ltr">
                      {[14, 22, 16, 28, 20, 32, 18, 24, 30, 26, 18, 14, 26, 32, 22, 16, 24, 28, 18, 12].map((height, i) => (
                        <Box
                          key={i}
                          w="3px"
                          h={`${isPlaying ? Math.max(8, (height * (i % 2 === 0 ? 1.2 : 0.8))) : height * 0.6}px`}
                          bg={isPlaying ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.35)"}
                          borderRadius="full"
                          transition="height 0.2s ease"
                        />
                      ))}
                      <Text fontSize="0.8rem" fontWeight="700" color="var(--athar-text-muted)" ml={2}>
                        {item.duration}
                      </Text>
                    </Flex>
                  </Box>

                  <Text
                    fontSize="0.95rem"
                    color="var(--athar-text-body)"
                    lineHeight="1.7"
                    fontStyle="italic"
                  >
                    "{item.quote}"
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </FadeContent>

        <Flex justify="center" mt={10}>
          <HStack gap={2} fontSize="0.92rem" color="var(--athar-maroon)" fontWeight="700">
            <FaVolumeUp />
            <Text>جميع التسجيلات الصوتية تخضع لفلترة ومعالجة في استوديو متخصص لضمان النقاء.</Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
