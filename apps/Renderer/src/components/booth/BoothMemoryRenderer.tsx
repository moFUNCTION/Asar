// =============================================================
// ASAR (Athar / أثر) — Full Interactive Booth Memory Storefront Renderer
// =============================================================

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiPlay,
  FiPause,
  FiHeart,
  FiHome,
  FiCalendar,
  FiMapPin,
  FiLayers,
  FiLock,
  FiUnlock,
  FiShare2,
  FiFilm,
  FiImage,
  FiMic,
  FiBookOpen,
  FiMessageSquare,
  FiAward,
} from "react-icons/fi";
import {
  DEMO_BOOTH_MEMORY,
  findInCache,
  ASAR_CACHE_KEYS,
  useAppwrite,
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
  Query,
  type BoothMemory,
} from "@repo/react-appwrite";

import type {
  VoiceRecordItem,
  PhotoKeepsake,
  GuestBlessingNote,
  BoothMemoryFullData,
  BoothTabId,
  BoothCategoryFilter,
} from "./types";
import {
  DEFAULT_CANONICAL_BOOTH,
  INITIAL_BOOTH_VOICE_RECORDS,
  INITIAL_BOOTH_PHOTOS,
  INITIAL_GUESTBOOK_BLESSINGS,
} from "./mockData";
import { BoothVoiceCard } from "./BoothVoiceCard";
import { BoothPinPadlockModal } from "./BoothPinPadlockModal";
import { BoothPhotoLightbox } from "./BoothPhotoLightbox";
import { BoothVideoModal } from "./BoothVideoModal";
import { BoothLeaveBlessingModal } from "./BoothLeaveBlessingModal";
import { BoothShareModal } from "./BoothShareModal";

export interface BoothMemoryRendererProps {
  slug: string;
  source?: string | null;
  initialMemory?: Partial<BoothMemory>;
}

export const BoothMemoryRenderer: React.FC<BoothMemoryRendererProps> = ({
  slug,
  source,
  initialMemory,
}) => {
  const { databases, config } = useAppwrite();
  const dbId = config?.databaseId || ASAR_DATABASE_ID;

  // 1. Resolve Memory Data with multi-tiered fallback
  const baseMemory = useMemo<BoothMemoryFullData>(() => {
    // Priority 1: Check localStorage cache
    const cached = findInCache<BoothMemory>(ASAR_CACHE_KEYS.BOOTH_MEMORIES, slug);
    if (cached) {
      return {
        ...DEFAULT_CANONICAL_BOOTH,
        ...cached,
        id: cached.$id || cached.slug || slug,
        slug: cached.slug || slug,
        coupleTitle: cached.coupleTitle || "Mina & Maryam",
        voiceRecords: INITIAL_BOOTH_VOICE_RECORDS,
        photos: INITIAL_BOOTH_PHOTOS,
        guestBookNotes: INITIAL_GUESTBOOK_BLESSINGS,
      };
    }

    // Priority 2: Injected initialMemory prop
    if (initialMemory) {
      return {
        ...DEFAULT_CANONICAL_BOOTH,
        ...initialMemory,
        id: initialMemory.$id || initialMemory.slug || slug,
        slug: initialMemory.slug || slug,
        coupleTitle: initialMemory.coupleTitle || "Mina & Maryam",
        voiceRecords: INITIAL_BOOTH_VOICE_RECORDS,
        photos: INITIAL_BOOTH_PHOTOS,
        guestBookNotes: INITIAL_GUESTBOOK_BLESSINGS,
      };
    }

    // Priority 3: Canonical Mina & Maryam demo
    if (slug === DEMO_BOOTH_MEMORY.slug || slug === "mina-and-maryam") {
      return DEFAULT_CANONICAL_BOOTH;
    }

    // Priority 4: Dynamic Title formatting from slug
    const formattedTitle = slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" & ");

    return {
      ...DEFAULT_CANONICAL_BOOTH,
      id: slug,
      slug,
      coupleTitle: formattedTitle,
    };
  }, [slug, initialMemory]);

  const [memory, setMemory] = useState<BoothMemoryFullData>(baseMemory);
  const [voiceRecords, setVoiceRecords] = useState<VoiceRecordItem[]>(
    baseMemory.voiceRecords || INITIAL_BOOTH_VOICE_RECORDS
  );
  const [photos] = useState<PhotoKeepsake[]>(
    baseMemory.photos || INITIAL_BOOTH_PHOTOS
  );
  const [guestBookNotes, setGuestBookNotes] = useState<GuestBlessingNote[]>(
    baseMemory.guestBookNotes || INITIAL_GUESTBOOK_BLESSINGS
  );

  // Hydrate from Appwrite Database when available
  useEffect(() => {
    let isMounted = true;
    const fetchRemote = async () => {
      try {
        if (databases && dbId) {
          const res = await databases.listDocuments(
            dbId,
            ASAR_COLLECTIONS.BOOTH_MEMORIES,
            [Query.equal("slug", slug), Query.limit(1)]
          );
          if (res.documents.length > 0 && isMounted) {
            const doc = res.documents[0] as unknown as BoothMemory;
            setMemory((prev) => ({
              ...prev,
              ...doc,
              id: doc.$id || doc.slug,
              slug: doc.slug,
            }));
          }
        }
      } catch {
        // Appwrite query fallback
      }
    };
    fetchRemote();
    return () => {
      isMounted = false;
    };
  }, [slug, databases, dbId]);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<BoothTabId>("audio");
  const [categoryFilter, setCategoryFilter] =
    useState<BoothCategoryFilter>("all");
  const [photoCategoryFilter, setPhotoCategoryFilter] = useState<string>("all");

  // Private Pin Lock State
  const [isLocked, setIsLocked] = useState<boolean>(
    Boolean(memory.isPrivateLocked)
  );

  // Audio Playback Engine State
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [, setPlaybackDuration] = useState<number>(42);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Modals States
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLeaveBlessingOpen, setIsLeaveBlessingOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Clean up AudioContext & Timers on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        try {
          audioContextRef.current.close();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  // Web Audio API telephone harmonic chime on playback start
  const playTelephoneChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (
        !audioContextRef.current ||
        audioContextRef.current.state === "closed"
      ) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      // Warm analog dual-frequency dial-tone pulse (440Hz & 480Hz)
      [440, 480].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.045, now);
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

  // Toggle Voice Record Play/Pause
  const handleTogglePlay = (record: VoiceRecordItem) => {
    if (playingVoiceId === record.id) {
      // Pause
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      setPlayingVoiceId(null);
    } else {
      // Switch or Start new track
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      playTelephoneChime();
      setPlayingVoiceId(record.id);
      const recDuration = record.durationSeconds || 42;
      setPlaybackDuration(recDuration);

      const startTime = currentTime >= recDuration ? 0 : currentTime;
      setCurrentTime(startTime);

      let running = startTime;
      playbackTimerRef.current = setInterval(() => {
        running += 0.2;
        if (running >= recDuration) {
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
          setCurrentTime(0);
          setPlayingVoiceId(null);
        } else {
          setCurrentTime(Number(running.toFixed(1)));
        }
      }, 200);
    }
  };

  // Seek current playback to specific timestamp
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  // Toggle Like on Voice Record
  const handleToggleLikeVoice = (id: string) => {
    setVoiceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          const isLiked = !rec.isLiked;
          return {
            ...rec,
            isLiked,
            likesCount: isLiked
              ? rec.likesCount + 1
              : Math.max(0, rec.likesCount - 1),
          };
        }
        return rec;
      })
    );
  };

  // Add new blessing note from modal
  const handleAddBlessing = (newNote: GuestBlessingNote) => {
    setGuestBookNotes((prev) => [newNote, ...prev]);
  };

  // Toggle Like on Guest Blessing
  const handleToggleLikeBlessing = (id: string) => {
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

  // Filter Voices by Category
  const filteredVoices = useMemo(() => {
    return voiceRecords.filter((rec) => {
      if (categoryFilter === "all") return true;
      if (categoryFilter === "family") return rec.category === "Family";
      if (categoryFilter === "friends") return rec.category === "Friends";
      if (categoryFilter === "colleagues") return rec.category === "Colleagues";
      if (categoryFilter === "special")
        return (
          rec.category === "Special Guests" || rec.category === "Special"
        );
      return true;
    });
  }, [voiceRecords, categoryFilter]);

  // Filter Photos by Category
  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      if (photoCategoryFilter === "all") return true;
      return photo.category === photoCategoryFilter;
    });
  }, [photos, photoCategoryFilter]);

  // Counts for Category Tabs
  const categoryCounts = useMemo(() => {
    return {
      all: voiceRecords.length,
      family: voiceRecords.filter((r) => r.category === "Family").length,
      friends: voiceRecords.filter((r) => r.category === "Friends").length,
      colleagues: voiceRecords.filter((r) => r.category === "Colleagues").length,
      special: voiceRecords.filter(
        (r) => r.category === "Special Guests" || r.category === "Special"
      ).length,
    };
  }, [voiceRecords]);

  const activeRecord = useMemo(() => {
    return voiceRecords.find((r) => r.id === playingVoiceId) || null;
  }, [voiceRecords, playingVoiceId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--athar-bg-primary)",
        color: "var(--athar-text-body)",
        paddingBottom: activeRecord ? "7rem" : "5rem",
        position: "relative",
      }}
    >
      {/* 1. Top Floating Storefront Status Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "rgba(107, 29, 40, 0.95)",
          color: "#ffffff",
          padding: "0.55rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontWeight: 700,
            }}
          >
            <FiLayers />
            ASAR Storefront Runtime (Port 3004)
          </span>
          <span
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              padding: "0.2rem 0.65rem",
              borderRadius: "4px",
              fontFamily: "monospace",
              direction: "ltr",
            }}
          >
            booth: {slug} · tier: {source || "hostname"}
          </span>

          {/* Privacy Pin Gate Indicator Button */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            title="تبديل حالة القفل العائلي (PIN Lock)"
            style={{
              backgroundColor: isLocked
                ? "rgba(220, 38, 38, 0.85)"
                : "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              padding: "0.2rem 0.6rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
          >
            {isLocked ? <FiLock /> : <FiUnlock />}
            <span>{isLocked ? "مغلق برمز PIN" : "مفتوح"}</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setIsShareModalOpen(true)}
            style={{
              backgroundColor: "rgba(212, 175, 55, 0.2)",
              color: "#F1E5D1",
              border: "1px solid rgba(212, 175, 55, 0.4)",
              borderRadius: "var(--athar-radius-full)",
              padding: "0.3rem 0.85rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <FiShare2 />
            <span>مشاركة الرابط</span>
          </button>

          <Link
            to="/"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontWeight: 600,
            }}
          >
            <FiHome />
            <span>بوابة الواجهات</span>
          </Link>
        </div>
      </header>

      {/* 2. Editorial Romantic Hero Section */}
      <section
        style={{
          position: "relative",
          padding: "4.5rem 1.5rem 3.5rem 1.5rem",
          textAlign: "center",
          backgroundImage: `
            radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.2) 0px, transparent 65%),
            radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.09) 0px, transparent 55%)
          `,
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          {/* Header Tag */}
          <div
            style={{
              letterSpacing: "0.22em",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "var(--athar-gold)",
              textTransform: "uppercase",
              marginBottom: "0.9rem",
            }}
          >
            {memory.eventHeaderTag || "THE WEDDING OF"}
          </div>

          {/* Couple Title */}
          <h1
            className="font-arabic-display"
            style={{
              fontSize: "clamp(2.5rem, 6.5vw, 4.8rem)",
              fontWeight: 700,
              color: "var(--athar-maroon)",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}
          >
            {memory.coupleTitle}
          </h1>

          {/* Poetic Tagline */}
          <p
            className="font-poetic"
            style={{
              fontSize: "clamp(1.15rem, 2.5vw, 1.4rem)",
              color: "var(--athar-text-title)",
              marginBottom: "1.6rem",
              maxWidth: "680px",
              margin: "0 auto 1.6rem auto",
            }}
          >
            {memory.tagline ||
              "نفس الأحباب. أصوات مختلفة. أثر يدوم في الوجدان إلى الأبد."}
          </p>

          {/* Metadata Badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.2rem",
              flexWrap: "wrap",
              color: "var(--athar-text-muted)",
              fontSize: "0.95rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: "0.4rem 1rem",
                borderRadius: "var(--athar-radius-full)",
                border: "1px solid rgba(107, 29, 40, 0.08)",
              }}
            >
              <FiCalendar color="#D4AF37" />
              <span>{memory.eventDateDisplay || "12 July 2026"}</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: "0.4rem 1rem",
                borderRadius: "var(--athar-radius-full)",
                border: "1px solid rgba(107, 29, 40, 0.08)",
              }}
            >
              <FiMapPin color="#D4AF37" />
              <span>{memory.eventLocationDisplay || "Alexandria, Egypt"}</span>
            </div>

            {memory.highlightBadge && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "rgba(212, 175, 55, 0.16)",
                  color: "var(--athar-maroon)",
                  padding: "0.4rem 1rem",
                  borderRadius: "var(--athar-radius-full)",
                  fontWeight: 700,
                }}
              >
                <FiAward color="#D4AF37" />
                <span>{memory.highlightBadge}</span>
              </div>
            )}
          </div>

          {/* Couple Quote Card */}
          {memory.coupleQuote && (
            <div
              className="glass-panel"
              style={{
                maxWidth: "680px",
                margin: "0 auto 2.2rem auto",
                padding: "1.25rem 2rem",
                borderRadius: "var(--athar-radius-md)",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                fontSize: "1.05rem",
                fontStyle: "italic",
                color: "var(--athar-text-body)",
                boxShadow: "var(--athar-shadow-soft)",
              }}
            >
              "{memory.coupleQuote}"
            </div>
          )}

          {/* Quick Action Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {voiceRecords[0] && (
              <button
                onClick={() => handleTogglePlay(voiceRecords[0])}
                className="btn-athar-primary"
              >
                <FiPlay />
                <span>استماع إلى أولى التسجيلات الصوتية</span>
              </button>
            )}

            <button
              onClick={() => setIsLeaveBlessingOpen(true)}
              className="btn-athar-secondary"
            >
              <FiMessageSquare color="var(--athar-maroon)" />
              <span>كتابة كلمة في دفتر التبريكات</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Five Luxury Storefront Navigation Tabs */}
      <nav
        style={{
          maxWidth: "1020px",
          margin: "0 auto 2.5rem auto",
          padding: "0 1.5rem",
        }}
      >
        <div
          className="glass-panel"
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "0.5rem",
            borderRadius: "var(--athar-radius-full)",
            border: "1px solid rgba(107, 29, 40, 0.1)",
            overflowX: "auto",
            gap: "0.5rem",
          }}
        >
          <button
            onClick={() => setActiveTab("audio")}
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: "var(--athar-radius-full)",
              border: "none",
              backgroundColor:
                activeTab === "audio" ? "var(--athar-maroon)" : "transparent",
              color: activeTab === "audio" ? "#ffffff" : "var(--athar-text-body)",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <FiMic />
            <span>أصوات الأحباب ({voiceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("photos")}
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: "var(--athar-radius-full)",
              border: "none",
              backgroundColor:
                activeTab === "photos" ? "var(--athar-maroon)" : "transparent",
              color: activeTab === "photos" ? "#ffffff" : "var(--athar-text-body)",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <FiImage />
            <span>معرض الصور ({photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("video")}
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: "var(--athar-radius-full)",
              border: "none",
              backgroundColor:
                activeTab === "video" ? "var(--athar-maroon)" : "transparent",
              color: activeTab === "video" ? "#ffffff" : "var(--athar-text-body)",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <FiFilm />
            <span>شريط الفيديو 30s</span>
          </button>

          <button
            onClick={() => setActiveTab("guestbook")}
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: "var(--athar-radius-full)",
              border: "none",
              backgroundColor:
                activeTab === "guestbook"
                  ? "var(--athar-maroon)"
                  : "transparent",
              color:
                activeTab === "guestbook"
                  ? "#ffffff"
                  : "var(--athar-text-body)",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <FiBookOpen />
            <span>دفتر التبريكات ({guestBookNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("thankyou")}
            style={{
              padding: "0.75rem 1.4rem",
              borderRadius: "var(--athar-radius-full)",
              border: "none",
              backgroundColor:
                activeTab === "thankyou"
                  ? "var(--athar-maroon)"
                  : "transparent",
              color:
                activeTab === "thankyou"
                  ? "#ffffff"
                  : "var(--athar-text-body)",
              fontWeight: 700,
              fontSize: "0.92rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <FiHeart />
            <span>رسالة الشكر</span>
          </button>
        </div>
      </nav>

      {/* 4. Main Tab Content Container */}
      <main style={{ maxWidth: "1020px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* TAB 1: Voice Records & Category Filtering */}
        {activeTab === "audio" && (
          <div>
            {/* Category Filter Pills */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "2rem",
                borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
                paddingBottom: "1.2rem",
              }}
            >
              <div>
                <h2
                  className="font-arabic-display"
                  style={{
                    fontSize: "1.85rem",
                    color: "var(--athar-maroon)",
                    marginBottom: "0.2rem",
                  }}
                >
                  أصوات وذكريات الأحباب
                </h2>
                <p style={{ fontSize: "0.92rem", color: "var(--athar-text-muted)" }}>
                  {filteredVoices.length} رسالة صوتية مسجلة عبر هاتف أثر العتيق
                </p>
              </div>

              {/* Category Filter Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                {(
                  [
                    { id: "all", label: "الكل", count: categoryCounts.all },
                    { id: "family", label: "العائلة", count: categoryCounts.family },
                    { id: "friends", label: "الأصدقاء", count: categoryCounts.friends },
                    {
                      id: "special",
                      label: "كبار الضيوف",
                      count: categoryCounts.special,
                    },
                    {
                      id: "colleagues",
                      label: "زملاء العمل",
                      count: categoryCounts.colleagues,
                    },
                  ] as Array<{
                    id: BoothCategoryFilter;
                    label: string;
                    count: number;
                  }>
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: "var(--athar-radius-full)",
                      border:
                        categoryFilter === cat.id
                          ? "1.5px solid var(--athar-maroon)"
                          : "1px solid rgba(107, 29, 40, 0.15)",
                      backgroundColor:
                        categoryFilter === cat.id
                          ? "rgba(107, 29, 40, 0.08)"
                          : "#ffffff",
                      color:
                        categoryFilter === cat.id
                          ? "var(--athar-maroon)"
                          : "var(--athar-text-body)",
                      fontWeight: categoryFilter === cat.id ? 700 : 500,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Cards Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {filteredVoices.map((voice) => (
                <BoothVoiceCard
                  key={voice.id}
                  record={voice}
                  isPlaying={playingVoiceId === voice.id}
                  currentTime={currentTime}
                  onPlayPause={() => handleTogglePlay(voice)}
                  onSeek={handleSeek}
                  onToggleLike={handleToggleLikeVoice}
                />
              ))}

              {filteredVoices.length === 0 && (
                <div
                  className="glass-panel"
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    borderRadius: "16px",
                    color: "var(--athar-text-muted)",
                  }}
                >
                  لا توجد تسجيلات في هذه الفئة حالياً.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Keepsake Photo Gallery with Lightbox */}
        {activeTab === "photos" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "2rem",
                borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
                paddingBottom: "1.2rem",
              }}
            >
              <div>
                <h2
                  className="font-arabic-display"
                  style={{
                    fontSize: "1.85rem",
                    color: "var(--athar-maroon)",
                    marginBottom: "0.2rem",
                  }}
                >
                  معرض الصور واللحظات التذكارية
                </h2>
                <p style={{ fontSize: "0.92rem", color: "var(--athar-text-muted)" }}>
                  {filteredPhotos.length} لقطة توثق أجمل ذكريات الحفل مع الهاتف
                  العتيق
                </p>
              </div>

              {/* Photo Filter Categories */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "كافة اللقطات" },
                  { id: "Around The Phone", label: "حول الهاتف" },
                  { id: "Couple", label: "العروسين" },
                  { id: "Celebration", label: "لحظات الاحتفال" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPhotoCategoryFilter(cat.id)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: "var(--athar-radius-full)",
                      border:
                        photoCategoryFilter === cat.id
                          ? "1.5px solid var(--athar-maroon)"
                          : "1px solid rgba(107, 29, 40, 0.15)",
                      backgroundColor:
                        photoCategoryFilter === cat.id
                          ? "rgba(107, 29, 40, 0.08)"
                          : "#ffffff",
                      color:
                        photoCategoryFilter === cat.id
                          ? "var(--athar-maroon)"
                          : "var(--athar-text-body)",
                      fontWeight: photoCategoryFilter === cat.id ? 700 : 500,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos Masonry Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="glass-panel"
                  style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: "1px solid rgba(107, 29, 40, 0.1)",
                    boxShadow: "var(--athar-shadow-soft)",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 14px 30px rgba(107, 29, 40, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "var(--athar-shadow-soft)";
                  }}
                >
                  <div
                    style={{
                      height: "220px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                    />
                    {photo.category && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          backgroundColor: "rgba(0, 0, 0, 0.65)",
                          color: "#F1E5D1",
                          fontSize: "0.75rem",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "4px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {photo.category}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <p
                      style={{
                        fontSize: "0.92rem",
                        color: "var(--athar-text-title)",
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 30-Second Video Highlight Card */}
        {activeTab === "video" && (
          <div>
            <div
              className="glass-panel"
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "1.5px solid rgba(212, 175, 55, 0.4)",
                boxShadow: "var(--athar-shadow-elevated)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              }}
            >
              {/* Thumbnail with Play Trigger */}
              <div
                onClick={() => setIsVideoModalOpen(true)}
                style={{
                  position: "relative",
                  height: "360px",
                  cursor: "pointer",
                  overflow: "hidden",
                  backgroundColor: "#000000",
                }}
              >
                <img
                  src={
                    memory.videoHighlightThumbnailId ||
                    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={memory.videoHighlightTitle || "30 Seconds of Your Day"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "brightness(0.75)",
                    transition: "transform 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1.0)";
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      backgroundColor: "var(--athar-maroon)",
                      color: "#ffffff",
                      border: "2px solid #D4AF37",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      boxShadow: "0 8px 30px rgba(107, 29, 40, 0.45)",
                    }}
                  >
                    <FiPlay style={{ marginRight: "-3px" }} />
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    color: "#D4AF37",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    fontFamily: "monospace",
                  }}
                >
                  0:30 HIGHLIGHT
                </div>
              </div>

              {/* Description & Cinema Specs */}
              <div
                style={{
                  padding: "3rem 2.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    color: "var(--athar-gold)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.15em",
                    marginBottom: "0.6rem",
                  }}
                >
                  CINEMATIC HIGHLIGHT REEL
                </div>

                <h3
                  className="font-arabic-display"
                  style={{
                    fontSize: "2rem",
                    color: "var(--athar-maroon)",
                    marginBottom: "1rem",
                  }}
                >
                  {memory.videoHighlightTitle || "30 Seconds of Your Day"}
                </h3>

                <p
                  style={{
                    fontSize: "1.05rem",
                    color: "var(--athar-text-body)",
                    lineHeight: 1.8,
                    marginBottom: "1.8rem",
                  }}
                >
                  شريط سينمائي فاخر مدته 30 ثانية يختصر مشاعر الفرحة والضحكات
                  والدموع الصادقة التي وثقها هاتف أثر بين أيدي أحبابكم في هذه
                  الليلة.
                </p>

                <div>
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="btn-athar-primary"
                  >
                    <FiPlay />
                    <span>مشاهدة شريط الفيديو الكامل الآن</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Guestbook Blessings Feed */}
        {activeTab === "guestbook" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "2rem",
                borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
                paddingBottom: "1.2rem",
              }}
            >
              <div>
                <h2
                  className="font-arabic-display"
                  style={{
                    fontSize: "1.85rem",
                    color: "var(--athar-maroon)",
                    marginBottom: "0.2rem",
                  }}
                >
                  دفتر التهاني والتبريكات المكتوبة
                </h2>
                <p style={{ fontSize: "0.92rem", color: "var(--athar-text-muted)" }}>
                  {guestBookNotes.length} كلمة محبة ودعاء تخلد أثر المعازيم في
                  حياة العروسين
                </p>
              </div>

              <button
                onClick={() => setIsLeaveBlessingOpen(true)}
                className="btn-athar-primary"
              >
                <FiMessageSquare />
                <span>إضافة كلمة تهنئة جديدة</span>
              </button>
            </div>

            {/* Notes Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {guestBookNotes.map((note) => (
                <div
                  key={note.id}
                  className="glass-panel"
                  style={{
                    borderRadius: "18px",
                    padding: "1.6rem 1.8rem",
                    border: "1px solid rgba(107, 29, 40, 0.08)",
                    boxShadow: "var(--athar-shadow-soft)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "0.8rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            color: "var(--athar-text-title)",
                          }}
                        >
                          {note.authorName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            color: "var(--athar-gold)",
                            fontWeight: 600,
                          }}
                        >
                          {note.authorRole}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--athar-text-muted)",
                        }}
                      >
                        {note.date}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.98rem",
                        color: "var(--athar-text-body)",
                        lineHeight: 1.7,
                        fontStyle: "italic",
                        marginBottom: "1.2rem",
                      }}
                    >
                      "{note.message}"
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      borderTop: "1px solid rgba(107, 29, 40, 0.06)",
                      paddingTop: "0.6rem",
                    }}
                  >
                    <button
                      onClick={() => handleToggleLikeBlessing(note.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: note.isLiked
                          ? "#C53030"
                          : "var(--athar-text-muted)",
                        fontSize: "0.95rem",
                      }}
                    >
                      <FiHeart
                        style={{ fill: note.isLiked ? "#C53030" : "none" }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {note.likes}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Thank You Message */}
        {activeTab === "thankyou" && (
          <div
            className="glass-panel"
            style={{
              padding: "3.5rem 2.5rem",
              borderRadius: "28px",
              textAlign: "center",
              border: "1.5px solid rgba(212, 175, 55, 0.35)",
              boxShadow: "var(--athar-shadow-elevated)",
              maxWidth: "780px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(107, 29, 40, 0.08)",
                color: "var(--athar-maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.7rem",
                margin: "0 auto 1.5rem auto",
              }}
            >
              <FiHeart style={{ fill: "var(--athar-maroon)" }} />
            </div>

            <h3
              className="font-arabic-display"
              style={{
                fontSize: "2.2rem",
                color: "var(--athar-maroon)",
                marginBottom: "1.2rem",
              }}
            >
              {memory.thankYouTitle || "With Love & Eternal Gratitude"}
            </h3>

            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--athar-text-body)",
                lineHeight: 1.9,
                whiteSpace: "pre-line",
                marginBottom: "2rem",
              }}
            >
              {memory.thankYouMessage ||
                "شكراً من أعماق القلب لكل من شاركنا فرحة هذا اليوم وترك صوته وكلماته أثراً لا يمحوه الزمان."}
            </p>

            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--athar-maroon)",
                fontFamily: "'Amiri', serif",
              }}
            >
              {memory.coupleTitle}
            </div>
          </div>
        )}
      </main>

      {/* 5. Sticky Bottom Voice Player Bar when an Audio is Playing */}
      {activeRecord && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: "rgba(107, 29, 40, 0.96)",
            color: "#ffffff",
            padding: "0.85rem 1.5rem",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.25)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.2rem",
          }}
        >
          {/* Speaker Details */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <button
              onClick={() => handleTogglePlay(activeRecord)}
              aria-label="Play/Pause"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                color: "var(--athar-maroon)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {playingVoiceId ? <FiPause /> : <FiPlay />}
            </button>

            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {activeRecord.speakerName}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#F1E5D1" }}>
                {activeRecord.speakerRole} · {activeRecord.category}
              </div>
            </div>
          </div>

          {/* Active Audio Progress Bar */}
          <div
            style={{
              flex: "1 1 300px",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(
                  0,
                  Math.min(1, (e.clientX - rect.left) / rect.width)
                );
                handleSeek(ratio * (activeRecord.durationSeconds || 42));
              }}
              style={{
                flex: 1,
                height: "6px",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                borderRadius: "4px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (currentTime / (activeRecord.durationSeconds || 42)) * 100
                  )}%`,
                  height: "100%",
                  backgroundColor: "var(--athar-gold)",
                  borderRadius: "4px",
                  transition: "width 0.15s linear",
                }}
              />
            </div>

            <span
              style={{
                fontFamily: "monospace",
                direction: "ltr",
                fontSize: "0.82rem",
                color: "#F1E5D1",
                minWidth: "70px",
              }}
            >
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60)
                .toString()
                .padStart(2, "0")}{" "}
              / {activeRecord.durationFormatted}
            </span>
          </div>

          {/* Close audio player */}
          <button
            onClick={() => {
              if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
              setPlayingVoiceId(null);
            }}
            aria-label="Close audio player"
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontSize: "1.2rem",
              cursor: "pointer",
              padding: "0.4rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 6. PIN Padlock Verification Modal (Gates Private Heirlooms) */}
      <BoothPinPadlockModal
        coupleTitle={memory.coupleTitle}
        expectedPin={memory.accessPinCode || "1234"}
        isOpen={isLocked}
        onUnlock={() => setIsLocked(false)}
      />

      {/* 7. Keepsake Photo Lightbox Modal */}
      <BoothPhotoLightbox
        photos={photos}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      {/* 8. 30-Second Video Highlight Modal */}
      <BoothVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title={memory.videoHighlightTitle}
        thumbnailUrl={memory.videoHighlightThumbnailId}
        coupleTitle={memory.coupleTitle}
      />

      {/* 9. Leave a Blessing Guestbook Modal */}
      <BoothLeaveBlessingModal
        isOpen={isLeaveBlessingOpen}
        onClose={() => setIsLeaveBlessingOpen(false)}
        onSubmit={handleAddBlessing}
        coupleTitle={memory.coupleTitle}
      />

      {/* 10. QR Share Sheet Modal */}
      <BoothShareModal
        slug={slug}
        coupleTitle={memory.coupleTitle}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

export default BoothMemoryRenderer;
