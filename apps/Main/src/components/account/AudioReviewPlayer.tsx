import React, { useState, useRef, useEffect, useMemo } from "react";
import { Box, Flex, SimpleGrid, Text, Button, Badge } from "@chakra-ui/react";
import {
  useCollection,
  ASAR_DATABASE_ID,
  ASAR_COLLECTIONS,
} from "@repo/react-appwrite";

export interface MasteredTrack {
  id: string;
  speakerName: string;
  speakerRole: string;
  category: string;
  quoteSnippet: string;
  durationFormatted: string;
  durationSeconds: number;
  waveformPeaks: number[];
  audioUrl?: string;
  isFavorite?: boolean;
}

export const DEMO_MASTERED_TRACKS: MasteredTrack[] = [
  {
    id: "track-1",
    speakerName: "نور حسن (Nour Hassan)",
    speakerRole: "الصديقة المقربة (Best Friend)",
    category: "الأصدقاء",
    quoteSnippet: "مبروك يا أجمل مريم، ربنا يسعدكم ويفرح قلوبكم دايماً يا رب...",
    durationFormatted: "0:42",
    durationSeconds: 42,
    waveformPeaks: [
      0.2, 0.45, 0.7, 0.9, 0.6, 0.85, 0.4, 0.65, 0.8, 0.95, 0.5, 0.75, 0.3, 0.6, 0.85, 0.4, 0.7, 0.9,
      0.65, 0.5, 0.8, 0.7, 0.35, 0.6, 0.8, 0.9, 0.6, 0.4, 0.75, 0.85, 0.5, 0.65, 0.4, 0.7, 0.85, 0.55,
      0.35, 0.6, 0.75, 0.9, 0.45, 0.65, 0.8, 0.5, 0.35, 0.55, 0.3, 0.2,
    ],
  },
  {
    id: "track-2",
    speakerName: "أحمد السيد (Ahmed El Sayed)",
    speakerRole: "شقيق العريس (Brother)",
    category: "العائلة",
    quoteSnippet: "ألف مبروك يا مينا يا غالي، نورت حياتنا وفرحتنا اليوم لا توصف...",
    durationFormatted: "1:12",
    durationSeconds: 72,
    waveformPeaks: [
      0.3, 0.6, 0.8, 0.95, 0.7, 0.5, 0.85, 0.65, 0.4, 0.75, 0.9, 0.6, 0.8, 0.7, 0.45, 0.65, 0.85, 0.75,
      0.5, 0.7, 0.9, 0.65, 0.4, 0.6, 0.8, 0.95, 0.7, 0.55, 0.75, 0.85, 0.6, 0.45, 0.7, 0.8, 0.55, 0.65,
      0.4, 0.6, 0.75, 0.85, 0.5, 0.4, 0.65, 0.75, 0.5, 0.35, 0.25, 0.18,
    ],
  },
  {
    id: "track-3",
    speakerName: "منى خالد (Mona Khaled)",
    speakerRole: "ابنة الخالة (Cousin)",
    category: "العائلة",
    quoteSnippet: "بحبكم جداً وفخورة بيكم، أتمنى لكم حياة كلها حب وسلام وضحك...",
    durationFormatted: "0:38",
    durationSeconds: 38,
    waveformPeaks: [
      0.25, 0.5, 0.75, 0.85, 0.6, 0.75, 0.9, 0.65, 0.45, 0.6, 0.8, 0.95, 0.7, 0.5, 0.8, 0.65, 0.4, 0.7,
      0.85, 0.6, 0.75, 0.9, 0.55, 0.4, 0.65, 0.8, 0.65, 0.5, 0.75, 0.85, 0.6, 0.45, 0.6, 0.75, 0.5, 0.65,
      0.35, 0.55, 0.7, 0.8, 0.45, 0.35, 0.55, 0.65, 0.4, 0.3, 0.2, 0.15,
    ],
  },
  {
    id: "track-4",
    speakerName: "طارق مصطفى (Tarek Mostafa)",
    speakerRole: "زميل العمل (Colleague)",
    category: "الزملاء",
    quoteSnippet: "أحلى عريس في الدنيا، ربنا يوفقكم في رحلتكم القادمة ودائماً في تألق...",
    durationFormatted: "0:55",
    durationSeconds: 55,
    waveformPeaks: [
      0.2, 0.4, 0.65, 0.8, 0.9, 0.65, 0.5, 0.75, 0.85, 0.6, 0.45, 0.7, 0.85, 0.95, 0.7, 0.55, 0.75, 0.6,
      0.45, 0.65, 0.8, 0.9, 0.6, 0.45, 0.7, 0.85, 0.65, 0.5, 0.75, 0.8, 0.6, 0.45, 0.65, 0.75, 0.5, 0.6,
      0.4, 0.55, 0.7, 0.8, 0.5, 0.4, 0.6, 0.7, 0.45, 0.3, 0.2, 0.15,
    ],
  },
  {
    id: "track-5",
    speakerName: "الجدة (Grandma)",
    speakerRole: "العائلة الكريمة (Grandmother)",
    category: "العائلة",
    quoteSnippet: "دعواتي لكم من صميم قلبي، ربنا يحفظكم ويبارك في بيتكم ويملأه نور...",
    durationFormatted: "1:08",
    durationSeconds: 68,
    waveformPeaks: [
      0.35, 0.65, 0.85, 0.95, 0.8, 0.6, 0.85, 0.7, 0.5, 0.75, 0.9, 0.75, 0.6, 0.8, 0.95, 0.7, 0.5, 0.65,
      0.8, 0.9, 0.65, 0.5, 0.7, 0.85, 0.95, 0.75, 0.6, 0.75, 0.85, 0.7, 0.55, 0.7, 0.8, 0.65, 0.5, 0.6,
      0.45, 0.65, 0.75, 0.85, 0.6, 0.45, 0.6, 0.7, 0.5, 0.35, 0.25, 0.2,
    ],
  },
];

export interface AudioReviewPlayerProps {
  orderId: string;
  tracks?: MasteredTrack[];
}

export const AudioReviewPlayer: React.FC<AudioReviewPlayerProps> = ({
  orderId,
  tracks = DEMO_MASTERED_TRACKS,
}) => {
  const [trackList, setTrackList] = useState<MasteredTrack[]>(tracks);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(tracks[0]?.id || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [continuousPlay, setContinuousPlay] = useState(false);

  // Live collection query from Appwrite
  const voiceWhere = useMemo(
    () => (orderId ? { orderId } : undefined),
    [orderId]
  );
  const { data: cloudRecords } = useCollection<Record<string, unknown>>(
    ASAR_DATABASE_ID,
    ASAR_COLLECTIONS.BOOTH_VOICE_RECORDS,
    {
      where: voiceWhere as any,
      enabled: Boolean(orderId),
      realtime: true,
    }
  );

  useEffect(() => {
    if (cloudRecords && cloudRecords.length > 0) {
      const mapped: MasteredTrack[] = cloudRecords.map((r, idx) => {
        let peaks: number[] = DEMO_MASTERED_TRACKS[0].waveformPeaks;
        if (typeof r.waveformPeaksJson === "string") {
          try {
            peaks = JSON.parse(r.waveformPeaksJson);
          } catch {
            // fallback
          }
        }
        return {
          id: (r.$id as string) || `track-${idx}`,
          speakerName:
            (r.guestName as string) ||
            (r.speakerName as string) ||
            "ضيف أثر",
          speakerRole:
            (r.guestRole as string) || (r.speakerRole as string) || "ضيف",
          category: (r.category as string) || "العائلة",
          quoteSnippet:
            (r.transcription as string) ||
            (r.quoteSnippet as string) ||
            "تسجيل صوتي من الهاتف العتيق",
          durationFormatted: (r.durationFormatted as string) || "0:45",
          durationSeconds: Number(r.durationSeconds) || 45,
          waveformPeaks: peaks,
          audioUrl: r.audioUrl as string | undefined,
          isFavorite: Boolean(r.isFavorite),
        };
      });
      setTrackList(mapped);
      if (mapped[0]?.id && !activeTrackId) {
        setActiveTrackId(mapped[0].id);
      }
    }
  }, [cloudRecords]);

  // Web Audio Context for simulated sound playback
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Categories list with counts
  const categories = ["الكل", ...Array.from(new Set(trackList.map((t) => t.category)))];

  const filteredTracks = trackList.filter((track) => {
    const matchesCat = selectedCategory === "الكل" || track.category === selectedCategory;
    const matchesSearch =
      track.speakerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.quoteSnippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeTrack = trackList.find((t) => t.id === activeTrackId) || trackList[0];

  // Stop synthetic audio
  const stopAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      oscRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play synthetic tone simulating voice track
  const startAudio = (track: MasteredTrack) => {
    stopAudio();
    setIsPlaying(true);

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        // Warm melodic chord frequency
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
      }
    } catch (e) {
      // AudioContext unavailable
    }

    // Step progress
    const stepDurationMs = 200;
    const totalSteps = (track.durationSeconds * 1000) / stepDurationMs;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const prog = Math.min(step / totalSteps, 1);
      setPlaybackProgress(prog);

      if (prog >= 1) {
        stopAudio();
        setPlaybackProgress(0);
        if (continuousPlay) {
          // Play next track
          const currentIndex = trackList.findIndex((t) => t.id === track.id);
          const nextTrack = trackList[(currentIndex + 1) % trackList.length];
          if (nextTrack) {
            setActiveTrackId(nextTrack.id);
            startAudio(nextTrack);
          }
        }
      }
    }, stepDurationMs);
  };

  const handleTogglePlay = (track: MasteredTrack) => {
    if (activeTrackId === track.id && isPlaying) {
      stopAudio();
    } else {
      setActiveTrackId(track.id);
      startAudio(track);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setTrackList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  const handleDownloadSingle = (track: MasteredTrack) => {
    // Generate simulated download
    const blob = new Blob([`ATHAR_AUDIO_MEMORY_${track.speakerName}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${track.speakerName.replace(/\s+/g, "_")}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = () => {
    const blob = new Blob([`ATHAR_COMPLETE_ZIP_ARCHIVE_${orderId}`], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Athar_Memories_Order_${orderId}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <Box>
      {/* Player Header Banner */}
      <Box className="card-luxury" p={{ base: 5, md: 7 }} mb={8}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Flex align="center" gap={2} mb={1}>
              <Badge className="badge-maroon">استوديو هندسة الصوت</Badge>
              <Badge className="badge-gold">طلب #{orderId}</Badge>
            </Flex>
            <Text
              fontSize={{ base: "1.4rem", md: "1.8rem" }}
              fontWeight="900"
              color="var(--athar-maroon)"
              className="font-arabic-display"
            >
              مراجعة التسجيلات الصوتية المعالجة
            </Text>
            <Text fontSize="0.88rem" color="var(--athar-text-muted)">
              استمع إلى أصوات أحبتكم بعد تنقيتها وفلترتها في استوديو أثر، مع إمكانية التحميل الفردي أو الجماعي (ZIP)
            </Text>
          </Box>

          <Flex gap={2.5} wrap="wrap">
            <Button
              className="btn-athar-primary"
              onClick={handleDownloadAllZip}
              fontSize="0.88rem"
              px={5}
              py={2.5}
            >
              📥 تحميل الكل كملف مضغوط (ZIP)
            </Button>
            <Button
              className="btn-athar-secondary"
              onClick={() => setContinuousPlay(!continuousPlay)}
              fontSize="0.88rem"
              px={4}
              py={2.5}
              borderColor={continuousPlay ? "var(--athar-maroon)" : "var(--athar-gold-border)"}
              bg={continuousPlay ? "var(--athar-maroon-glow)" : "white"}
            >
              {continuousPlay ? "✓ التشغيل المتتابع مفعّل" : "تشغيل متتابع"}
            </Button>
          </Flex>
        </Flex>

        {/* Currently Active Track Featured Player */}
        {activeTrack && (
          <Box
            mt={6}
            p={{ base: 4, md: 6 }}
            borderRadius="20px"
            bg="linear-gradient(135deg, rgba(107, 29, 40, 0.04), rgba(212, 175, 55, 0.08))"
            border="1px solid var(--athar-gold-border)"
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3}>
              <Flex align="center" gap={3}>
                <Button
                  onClick={() => handleTogglePlay(activeTrack)}
                  w="52px"
                  h="52px"
                  borderRadius="full"
                  bg="var(--athar-maroon)"
                  color="white"
                  fontSize="1.3rem"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="none"
                  cursor="pointer"
                  boxShadow="0 4px 14px rgba(107, 29, 40, 0.35)"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </Button>
                <Box>
                  <Text fontSize="1.15rem" fontWeight="800" color="var(--athar-text-title)">
                    {activeTrack.speakerName}
                  </Text>
                  <Text fontSize="0.8rem" color="var(--athar-text-muted)">
                    {activeTrack.speakerRole} • فئة: <strong style={{ color: "var(--athar-maroon)" }}>{activeTrack.category}</strong>
                  </Text>
                </Box>
              </Flex>

              <Flex align="center" gap={3}>
                <Text fontSize="0.95rem" fontWeight="700" color="var(--athar-maroon)">
                  {activeTrack.durationFormatted}
                </Text>
                <Button
                  variant="ghost"
                  fontSize="1.2rem"
                  onClick={() => handleToggleFavorite(activeTrack.id)}
                  cursor="pointer"
                  border="none"
                  bg="transparent"
                >
                  {activeTrack.isFavorite ? "♥" : "♡"}
                </Button>
                <Button
                  size="xs"
                  className="btn-athar-secondary"
                  onClick={() => handleDownloadSingle(activeTrack)}
                >
                  تحميل MP3 📥
                </Button>
              </Flex>
            </Flex>

            {/* 48-Bar Waveform Scrubber */}
            <Box mt={3} mb={2}>
              <Flex align="flex-end" justify="space-between" h="48px" gap="2px">
                {activeTrack.waveformPeaks.map((peak, idx) => {
                  const barProgress = idx / activeTrack.waveformPeaks.length;
                  const isPlayed = barProgress <= playbackProgress;

                  return (
                    <Box
                      key={idx}
                      flex={1}
                      h={`${Math.max(peak * 100, 15)}%`}
                      bg={isPlayed ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.22)"}
                      borderRadius="2px"
                      transition="background-color 0.15s ease"
                    />
                  );
                })}
              </Flex>
            </Box>

            <Text fontSize="0.84rem" color="var(--athar-text-body)" fontStyle="italic" mt={2} dir="auto">
              "{activeTrack.quoteSnippet}"
            </Text>
          </Box>
        )}
      </Box>

      {/* Filter and Search Bar */}
      <Box className="card-luxury" p={4} mb={6}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          {/* Category Filter Pills */}
          <Flex gap={2} wrap="wrap">
            {categories.map((cat) => {
              const count = cat === "الكل" ? trackList.length : trackList.filter((t) => t.category === cat).length;
              const isSelected = selectedCategory === cat;

              return (
                <Button
                  key={cat}
                  size="sm"
                  borderRadius="full"
                  px={3.5}
                  py={1}
                  fontSize="0.82rem"
                  fontWeight="700"
                  bg={isSelected ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.05)"}
                  color={isSelected ? "white" : "var(--athar-text-title)"}
                  border={isSelected ? "none" : "1px solid rgba(107, 29, 40, 0.1)"}
                  onClick={() => setSelectedCategory(cat)}
                  cursor="pointer"
                >
                  {cat} ({count})
                </Button>
              );
            })}
          </Flex>

          {/* Search Box */}
          <Box minW="240px">
            <input
              type="text"
              className="athar-input"
              placeholder="ابحث بالاسم أو الكلمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "0.5rem 0.9rem", fontSize: "0.85rem" }}
            />
          </Box>
        </Flex>
      </Box>

      {/* Mastered Tracks List */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={8}>
        {filteredTracks.map((track) => {
          const isThisActive = activeTrackId === track.id;

          return (
            <Box
              key={track.id}
              className="card-luxury"
              p={4}
              borderRadius="16px"
              border="1px solid"
              borderColor={isThisActive ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)"}
              bg={isThisActive ? "rgba(107, 29, 40, 0.03)" : "white"}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Flex align="center" gap={3}>
                  <Button
                    onClick={() => handleTogglePlay(track)}
                    w="40px"
                    h="40px"
                    borderRadius="full"
                    bg={isThisActive && isPlaying ? "var(--athar-gold)" : "var(--athar-maroon)"}
                    color={isThisActive && isPlaying ? "#231A1E" : "white"}
                    fontSize="1rem"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="none"
                    cursor="pointer"
                  >
                    {isThisActive && isPlaying ? "⏸" : "▶"}
                  </Button>
                  <Box>
                    <Text fontWeight="800" color="var(--athar-text-title)" fontSize="0.95rem">
                      {track.speakerName}
                    </Text>
                    <Text fontSize="0.75rem" color="var(--athar-text-muted)">
                      {track.speakerRole}
                    </Text>
                  </Box>
                </Flex>

                <Flex align="center" gap={2}>
                  <Badge className="badge-maroon" fontSize="0.72rem" px={2} py={0.5}>
                    {track.category}
                  </Badge>
                  <Text fontSize="0.8rem" fontWeight="700" color="var(--athar-text-muted)">
                    {track.durationFormatted}
                  </Text>
                  <Button
                    variant="ghost"
                    fontSize="1.1rem"
                    onClick={() => handleToggleFavorite(track.id)}
                    cursor="pointer"
                    border="none"
                    bg="transparent"
                    p={1}
                  >
                    {track.isFavorite ? "♥" : "♡"}
                  </Button>
                </Flex>
              </Flex>

              <Text
                fontSize="0.82rem"
                color="var(--athar-text-body)"
                fontStyle="italic"
                mt={2}
                dir="auto"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                "{track.quoteSnippet}"
              </Text>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};

export default AudioReviewPlayer;
