import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, HStack, Text, Button } from "@chakra-ui/react";
import { FaHeart, FaDownload, FaCheck } from "react-icons/fa";
import { useSubdomain, useAppwrite, ASAR_COLLECTIONS, ASAR_DATABASE_ID, Query } from "@repo/react-appwrite";
import {
  MemoryHeader,
  MemoryHero,
  MemoryTabs,
  VoiceCard,
  AudioPlayerBar,
  PhotoGalleryGrid,
  VideoHighlightCard,
  GuestBookFeed,
  MemoryActionBar,
  LeaveLoveModal,
  ShareSheetModal,
  MemoryPinLockGate,
  DEMO_BOOTH_MEMORY,
  DEMO_BOOTH_VOICE_RECORDS,
} from "../components/memory";
import type {
  BoothMemoryData,
  VoiceRecord,
  GuestBookNote,
  MemoryTabType,
} from "../components/memory";

export interface BoothMemoryPageProps {
  slug?: string;
  onBackToLanding?: () => void;
}

export const BoothMemoryPage: React.FC<BoothMemoryPageProps> = ({
  slug: propSlug,
  onBackToLanding: propOnBackToLanding,
}) => {
  const routeParams = useParams<{ slug?: string }>();
  const { subdomain } = useSubdomain({
    searchParams: typeof window !== "undefined" ? window.location.search : undefined,
  });
  const navigate = useNavigate();
  const { databases, config } = useAppwrite();
  const dbId = config?.databaseId || ASAR_DATABASE_ID;

  // Seamless 4-tier slug resolution: prop -> routeParam -> subdomain -> fallback
  const slug = propSlug || routeParams.slug || subdomain || "mina-and-maryam";

  const onBackToLanding = propOnBackToLanding || (() => navigate("/"));

  const [memory, setMemory] = useState<BoothMemoryData>(() => {
    // Check localStorage cache first
    try {
      const cached = localStorage.getItem("asar_booth_memories_cache");
      if (cached) {
        const list: BoothMemoryData[] = JSON.parse(cached);
        const found = list.find((m) => m.slug === slug || m.id === slug);
        if (found) return found;
      }
    } catch {
      // Fallback
    }

    if (slug === "mina-and-maryam" || !slug) {
      return DEMO_BOOTH_MEMORY;
    }

    const formattedTitle = slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" & ");

    return {
      ...DEMO_BOOTH_MEMORY,
      id: slug,
      slug,
      coupleTitle: formattedTitle,
    };
  });

  const [voiceRecords, setVoiceRecords] = useState<VoiceRecord[]>(() => {
    return memory.voiceRecords || DEMO_BOOTH_VOICE_RECORDS;
  });

  const [guestBookNotes, setGuestBookNotes] = useState<GuestBookNote[]>(() => {
    return memory.guestBookNotes || DEMO_BOOTH_MEMORY.guestBookNotes;
  });

  // Hydrate memory from Appwrite database or local cache
  useEffect(() => {
    let isMounted = true;

    const hydrateMemory = async () => {
      // 1. Check localStorage cache
      try {
        const cached = localStorage.getItem("asar_booth_memories_cache");
        if (cached) {
          const list: BoothMemoryData[] = JSON.parse(cached);
          const found = list.find((m) => m.slug === slug || m.id === slug);
          if (found && isMounted) {
            setMemory(found);
            setVoiceRecords(found.voiceRecords || DEMO_BOOTH_VOICE_RECORDS);
            setGuestBookNotes(found.guestBookNotes || DEMO_BOOTH_MEMORY.guestBookNotes);
            return;
          }
        }
      } catch {
        // Fallback
      }

      // 2. Try Appwrite database query
      try {
        if (databases && dbId) {
          const response = await databases.listDocuments(
            dbId,
            ASAR_COLLECTIONS.BOOTH_MEMORIES,
            [Query.equal("slug", slug), Query.limit(1)]
          );
          if (response.documents.length > 0 && isMounted) {
            const doc = response.documents[0] as unknown as BoothMemoryData;
            setMemory(doc);
            if (doc.voiceRecords) setVoiceRecords(doc.voiceRecords);
            if (doc.guestBookNotes) setGuestBookNotes(doc.guestBookNotes);
            return;
          }
        }
      } catch {
        // Appwrite query fallback
      }

      // 3. Fallback to demo or customized base
      if (isMounted) {
        if (slug === "mina-and-maryam" || !slug) {
          setMemory(DEMO_BOOTH_MEMORY);
          setVoiceRecords(DEMO_BOOTH_VOICE_RECORDS);
          setGuestBookNotes(DEMO_BOOTH_MEMORY.guestBookNotes);
        } else {
          const formattedTitle = slug
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" & ");
          setMemory((prev) => ({
            ...prev,
            slug,
            coupleTitle: formattedTitle,
          }));
        }
      }
    };

    hydrateMemory();

    return () => {
      isMounted = false;
    };
  }, [slug, databases, dbId]);

  // Navigation & Interactive Tabs
  const [activeTab, setActiveTab] = useState<MemoryTabType>("audio");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLocked, setIsLocked] = useState<boolean>(memory.isPrivateLocked || false);

  // Audio Playback Engine State
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(42);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLeaveLoveModalOpen, setIsLeaveLoveModalOpen] = useState(false);
  const [downloadKeepsakeDone, setDownloadKeepsakeDone] = useState(false);

  // Stop timer and audio stream on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
          audioElementRef.current.src = "";
          audioElementRef.current.ontimeupdate = null;
          audioElementRef.current.onloadedmetadata = null;
          audioElementRef.current.onended = null;
          audioElementRef.current.onerror = null;
        } catch {
          // ignore
        }
        audioElementRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Soft Web Audio API vintage telephone harmonic chime
  const playTelephoneChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      // Warm analog dual-frequency dial-tone pulse
      [440, 480].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {
      // AudioContext fallback
    }
  };

  // Helper to run timer animation (for fallback / simulated audio)
  const startTimerSimulation = (recDuration: number, initialTime: number = 0) => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    const startTime = initialTime >= recDuration ? 0 : initialTime;
    setCurrentTime(startTime);

    let runningTime = startTime;
    playbackTimerRef.current = setInterval(() => {
      runningTime += 0.2;
      if (runningTime >= recDuration) {
        if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
        setCurrentTime(0);
        setPlayingVoiceId(null);
      } else {
        setCurrentTime(Number(runningTime.toFixed(1)));
      }
    }, 200);
  };

  // Play / Pause voice record with real HTMLAudioElement streaming & chime intro
  const handleTogglePlayVoice = (record: VoiceRecord) => {
    if (playingVoiceId === record.id) {
      // Pause
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
        } catch {
          // ignore
        }
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    // Switch or start new track
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      } catch {
        // ignore
      }
    }
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    playTelephoneChime();
    setPlayingVoiceId(record.id);
    const recDuration = record.durationSeconds || 42;
    setDuration(recDuration);

    const hasAudioUrl = Boolean(record.audioUrl && record.audioUrl.trim().length > 0);

    if (hasAudioUrl && typeof window !== "undefined" && typeof Audio !== "undefined") {
      try {
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
        }
        const audio = audioElementRef.current;
        audio.preload = "auto";
        audio.src = record.audioUrl!;

        audio.ontimeupdate = () => {
          if (!audio.paused && Number.isFinite(audio.currentTime)) {
            setCurrentTime(Number(audio.currentTime.toFixed(1)));
          }
        };

        audio.onloadedmetadata = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setDuration(Math.round(audio.duration));
          }
        };

        audio.onended = () => {
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
          setCurrentTime(0);
          setPlayingVoiceId(null);
        };

        audio.onerror = () => {
          console.warn(`[BoothMemoryPage] Audio failed to load: ${record.audioUrl}. Falling back to visual simulation.`);
          startTimerSimulation(recDuration);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("[BoothMemoryPage] Audio autoplay restricted or resource unavailable:", err);
            startTimerSimulation(recDuration);
          });
        }
      } catch (err) {
        console.warn("[BoothMemoryPage] Audio instantiation error:", err);
        startTimerSimulation(recDuration);
      }
    } else {
      startTimerSimulation(recDuration);
    }
  };

  // Seek current playback to specific timestamp
  const handleSeekVoice = (seconds: number) => {
    setCurrentTime(seconds);
    if (audioElementRef.current && Number.isFinite(seconds)) {
      try {
        audioElementRef.current.currentTime = seconds;
      } catch {
        // ignore
      }
    }
  };

  // Favorite Heart Toggle on Voice Record
  const handleToggleLikeVoice = (id: string) => {
    setVoiceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const isLiked = !rec.isLiked;
          return {
            ...rec,
            isLiked,
            likesCount: isLiked ? rec.likesCount + 1 : Math.max(0, rec.likesCount - 1),
          };
        }
        return rec;
      })
    );
  };

  // Add new guest note from modal
  const handleAddNote = (newNote: GuestBookNote) => {
    setGuestBookNotes((prev) => [newNote, ...prev]);
  };

  // Toggle Like on Guest Note
  const handleToggleLikeNote = (id: string) => {
    setGuestBookNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const isLiked = !n.isLiked;
          return {
            ...n,
            isLiked,
            likes: isLiked ? n.likes + 1 : Math.max(0, n.likes - 1),
          };
        }
        return n;
      })
    );
  };

  // Download Keepsake Card simulation
  const handleDownloadKeepsake = () => {
    setDownloadKeepsakeDone(true);
    setTimeout(() => setDownloadKeepsakeDone(false), 3500);
  };

  // Filter voices by category
  const filteredVoices = voiceRecords.filter((rec) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "family") return rec.category === "Family";
    if (selectedCategory === "friends") return rec.category === "Friends";
    if (selectedCategory === "colleagues") return rec.category === "Colleagues";
    if (selectedCategory === "special") return rec.category === "Special Guests";
    return true;
  });

  const activeRecord = voiceRecords.find((r) => r.id === playingVoiceId) || null;

  // If memory is locked by PIN code, display security gate
  if (isLocked) {
    return (
      <Box minH="100vh" bg="#FBF7F2" color="var(--athar-text-body, #4A4240)">
        <MemoryHeader
          coupleTitle={memory.coupleTitle}
          totalAudioCount={memory.totalAudioCount}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onBackToLanding={onBackToLanding}
          isPrivateLocked={true}
          onToggleLock={() => setIsLocked(false)}
        />
        <MemoryPinLockGate
          coupleTitle={memory.coupleTitle}
          expectedPin={memory.accessPinCode || "1234"}
          onUnlock={() => setIsLocked(false)}
          onBackToLanding={onBackToLanding}
        />
      </Box>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="#FBF7F2"
      color="var(--athar-text-body, #4A4240)"
      position="relative"
      pb={12}
    >
      {/* 1. Frosted Sticky Top Bar */}
      <MemoryHeader
        coupleTitle={memory.coupleTitle}
        totalAudioCount={memory.totalAudioCount}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onBackToLanding={onBackToLanding}
        isPrivateLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
      />

      {/* 2. Editorial Romantic Hero Card */}
      <MemoryHero
        coupleTitle={memory.coupleTitle}
        eventHeaderTag={memory.eventHeaderTag}
        eventDateDisplay={memory.eventDateDisplay}
        eventLocationDisplay={memory.eventLocationDisplay}
        highlightBadge={memory.highlightBadge}
        coupleQuote={memory.coupleQuote}
        quoteAuthor={memory.quoteAuthor}
        taglineLine1={memory.taglineLine1}
        taglineLine2={memory.taglineLine2}
        heroImageUrl={memory.heroImageUrl}
      />

      {/* 3. Five Luxury Tactile Navigation Tabs */}
      <MemoryTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 4. Tab View Content */}
      {activeTab === "audio" && (
        <Box w="100%" maxW="1100px" mx="auto" px={{ base: 3, sm: 6 }} py={2}>
          {/* Audio Section Header */}
          <Flex direction="column" align="center" textAlign="center" mb={6}>
            <Text
              fontSize={{ base: "1.3rem", sm: "1.6rem" }}
              letterSpacing="0.14em"
              fontWeight="800"
              color="var(--athar-maroon-dark, #5B1621)"
              textTransform="uppercase"
            >
              AUDIO MESSAGES
            </Text>

            {/* Acoustic Waveform Divider */}
            <Flex align="center" justify="center" gap={3} my={2}>
              <Box h="1px" w={{ base: "40px", sm: "60px" }} bg="linear-gradient(90deg, transparent, #D4AF37)" />
              <svg width="34" height="16" viewBox="0 0 36 18" fill="none">
                <path
                  d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
                  stroke="#6B1D28"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Box h="1px" w={{ base: "40px", sm: "60px" }} bg="linear-gradient(90deg, #D4AF37, transparent)" />
            </Flex>

            <Text fontSize="0.9rem" color="var(--athar-text-muted, #7A6F6D)" maxW="600px">
              Listen to the love, laughter and blessings from the people who matter most.
            </Text>

            {/* Category Filter Pills Row Matching Visual Reference #1 */}
            <HStack gap={{ base: 2, sm: 3 }} mt={5} flexWrap="wrap" justify="center">
              {memory.categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <Button
                    key={cat.id}
                    size="sm"
                    borderRadius="full"
                    px={{ base: 3.5, sm: 4.5 }}
                    py={2.5}
                    fontSize="0.86rem"
                    fontWeight="700"
                    bg={isActive ? "var(--athar-maroon, #6B1D28)" : "#FFFFFF"}
                    color={isActive ? "white" : "var(--athar-text-body, #4A4240)"}
                    border="1px solid"
                    borderColor={isActive ? "var(--athar-maroon, #6B1D28)" : "rgba(107, 29, 40, 0.12)"}
                    boxShadow={
                      isActive
                        ? "0 4px 14px rgba(107, 29, 40, 0.28)"
                        : "0 2px 6px rgba(0, 0, 0, 0.02)"
                    }
                    onClick={() => setSelectedCategory(cat.id)}
                    _hover={{
                      bg: isActive ? "var(--athar-maroon-dark, #5B1621)" : "#FBF7F2",
                    }}
                    transition="all 0.2s ease"
                  >
                    {cat.label} ({cat.count})
                  </Button>
                );
              })}
            </HStack>
          </Flex>

          {/* Voice Cards Stack */}
          <Flex direction="column" gap={3.5}>
            {filteredVoices.map((record) => (
              <VoiceCard
                key={record.id}
                record={record}
                isPlaying={playingVoiceId === record.id}
                currentTime={currentTime}
                onPlayPause={() => handleTogglePlayVoice(record)}
                onSeek={handleSeekVoice}
                onToggleLike={handleToggleLikeVoice}
              />
            ))}
          </Flex>

          {/* Video Highlight Banner Card Matching Image #1 directly beneath voices */}
          <VideoHighlightCard
            mode="banner"
            thumbnailUrl={memory.videoThumbnailUrl}
            videoTitle={memory.videoTitle}
            videoSubtitle={memory.videoSubtitle}
            onClickBanner={() => setActiveTab("video")}
          />
        </Box>
      )}

      {/* Photos Tab */}
      {activeTab === "photos" && <PhotoGalleryGrid photos={memory.photos} />}

      {/* Video Highlights Tab */}
      {activeTab === "video" && (
        <VideoHighlightCard
          mode="full"
          thumbnailUrl={memory.videoThumbnailUrl}
          videoTitle={memory.videoTitle}
          videoSubtitle={memory.videoSubtitle}
          coupleTitle={memory.coupleTitle}
        />
      )}

      {/* Guest Book Tab */}
      {activeTab === "guestbook" && (
        <GuestBookFeed
          notes={guestBookNotes}
          onOpenLeaveModal={() => setIsLeaveLoveModalOpen(true)}
          onToggleLikeNote={handleToggleLikeNote}
        />
      )}

      {/* Thank You Tab */}
      {activeTab === "thankyou" && (
        <Box w="100%" maxW="840px" mx="auto" px={{ base: 4, sm: 6 }} py={6}>
          <Box
            bg="#FFFFFF"
            borderRadius="32px"
            p={{ base: 6, sm: 10 }}
            border="1px solid rgba(212, 175, 55, 0.45)"
            boxShadow="0 18px 48px -12px rgba(107, 29, 40, 0.12)"
            textAlign="center"
            position="relative"
          >
            <Flex
              w="56px"
              h="56px"
              borderRadius="full"
              bg="rgba(107, 29, 40, 0.06)"
              color="var(--athar-maroon, #6B1D28)"
              align="center"
              justify="center"
              mx="auto"
              mb={4}
            >
              <FaHeart size={24} />
            </Flex>

            <Text
              fontSize="0.82rem"
              fontWeight="700"
              letterSpacing="0.2em"
              color="#D4AF37"
              textTransform="uppercase"
              mb={2}
            >
              A MESSAGE OF GRATITUDE
            </Text>

            <Text
              as="h2"
              fontFamily="'Playfair Display', 'Amiri', serif"
              fontSize={{ base: "1.8rem", sm: "2.4rem" }}
              fontWeight="700"
              color="var(--athar-maroon-dark, #5B1621)"
              mb={5}
            >
              Thank You for Leaving Your Athar
            </Text>

            <Box maxW="640px" mx="auto" mb={8}>
              {memory.thankYouMessage.split("\n\n").map((para, i) => (
                <Text
                  key={i}
                  fontSize="1rem"
                  lineHeight="1.8"
                  color="var(--athar-text-body, #4A4240)"
                  mb={4}
                  dir="auto"
                >
                  {para}
                </Text>
              ))}
            </Box>

            <Button
              onClick={handleDownloadKeepsake}
              bg="var(--athar-maroon, #6B1D28)"
              color="white"
              borderRadius="full"
              px={8}
              py={4}
              fontSize="0.95rem"
              fontWeight="700"
              boxShadow="0 6px 20px rgba(107, 29, 40, 0.25)"
              _hover={{
                bg: "var(--athar-maroon-dark, #5B1621)",
                transform: "translateY(-2px)",
              }}
            >
              <FaDownload style={{ marginRight: "8px" }} />
              Download Keepsake Card (PDF)
            </Button>

            {downloadKeepsakeDone && (
              <Flex align="center" justify="center" gap={2} mt={4} color="#2E7D32" fontSize="0.9rem">
                <FaCheck />
                <Text fontWeight="600">Keepsake card downloaded!</Text>
              </Flex>
            )}
          </Box>
        </Box>
      )}

      {/* 5. Dual Action Buttons Bar (Sticky at bottom) */}
      <MemoryActionBar
        onOpenShareModal={() => setIsShareModalOpen(true)}
        totalAudioCount={memory.totalAudioCount}
      />

      {/* 6. Sticky Floating Mini Audio Player Bar */}
      <AudioPlayerBar
        currentRecord={activeRecord}
        isPlaying={!!playingVoiceId}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={() => activeRecord && handleTogglePlayVoice(activeRecord)}
        onSeek={handleSeekVoice}
        onClose={() => {
          if (audioElementRef.current) {
            try {
              audioElementRef.current.pause();
            } catch {
              // ignore
            }
          }
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
          setPlayingVoiceId(null);
        }}
      />

      {/* 7. Footer Branding Line Matching Image #1 */}
      <Box mt={10} mb={6} textAlign="center">
        <Flex align="center" justify="center" gap={3} my={2}>
          <Text fontSize="0.75rem" fontWeight="700" letterSpacing="0.12em" color="#7A6F6D">
            ATHAR AUDIO MEMORIES
          </Text>
          <Box h="1px" w="40px" bg="#D4AF37" />
          <svg width="24" height="12" viewBox="0 0 36 18" fill="none">
            <path
              d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
              stroke="#6B1D28"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <Box h="1px" w="40px" bg="#D4AF37" />
          <Text fontSize="0.75rem" fontWeight="600" color="#7A6F6D" fontStyle="italic">
            Voices Create a Kinder Tomorrow.
          </Text>
        </Flex>
      </Box>

      {/* Modals */}
      <ShareSheetModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        coupleTitle={memory.coupleTitle}
        slug={memory.slug}
      />

      <LeaveLoveModal
        isOpen={isLeaveLoveModalOpen}
        onClose={() => setIsLeaveLoveModalOpen(false)}
        coupleTitle={memory.coupleTitle}
        onAddNote={handleAddNote}
      />
    </Box>
  );
};

export default BoothMemoryPage;
