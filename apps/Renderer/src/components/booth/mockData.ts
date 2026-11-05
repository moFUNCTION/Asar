// =============================================================
// ASAR (Athar / أثر) — Booth Memory Seed & Mock Defaults
// =============================================================

import type {
  VoiceRecordItem,
  PhotoKeepsake,
  GuestBlessingNote,
  BoothMemoryFullData,
} from "./types";

export const generateWaveformPeaks = (seed: number, count = 48): number[] => {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = i / count;
    const envelope = Math.sin(x * Math.PI);
    const noise =
      Math.sin(i * 1.7 + seed) * 0.35 + Math.cos(i * 0.9 + seed * 2) * 0.25;
    const val = Math.max(
      0.15,
      Math.min(1.0, 0.2 + envelope * 0.55 + noise * 0.3)
    );
    result.push(Number(val.toFixed(2)));
  }
  return result;
};

export const INITIAL_BOOTH_VOICE_RECORDS: VoiceRecordItem[] = [
  {
    id: "vr-1",
    speakerName: "Nour Hassan",
    speakerRole: "Best Friend",
    category: "Friends",
    quoteSnippet:
      "Mabrook ya gameela, ربنا يسعدكم دايماً وأشوفكم أسعد اتنين في الدنيا كلها يا أحلى عروسة في الكون...",
    durationFormatted: "0:42",
    durationSeconds: 42,
    waveformPeaks: generateWaveformPeaks(12),
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    likesCount: 34,
    isLiked: true,
    isFeatured: true,
  },
  {
    id: "vr-2",
    speakerName: "Ahmed El Sayed",
    speakerRole: "Brother",
    category: "Family",
    quoteSnippet:
      "منورين الدنيا كلها وفخور بيك يا أخويا، ربنا يجعل أيامكم كلها فرح وهنا وسرور ويحفظكم لبعض...",
    durationFormatted: "1:12",
    durationSeconds: 72,
    waveformPeaks: generateWaveformPeaks(42),
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    likesCount: 28,
    isLiked: false,
    isFeatured: true,
  },
  {
    id: "vr-3",
    speakerName: "Mona Khaled",
    speakerRole: "Cousin",
    category: "Family",
    quoteSnippet:
      "أحلى عروسين في مصر كلها! الفرح كان يجنن وعقبال ما نحتفل بأول بيبي يارب، بنحبكم جداً...",
    durationFormatted: "0:38",
    durationSeconds: 38,
    waveformPeaks: generateWaveformPeaks(77),
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    likesCount: 19,
    isLiked: false,
    isFeatured: true,
  },
  {
    id: "vr-4",
    speakerName: "Tarek Mostafa",
    speakerRole: "Colleague",
    category: "Colleagues",
    quoteSnippet:
      "ألف مبروك يا مينا ومن نجاح لنجاح دايماً في الشغل والبيت، أحلى تمنياتي لكم بحياة زوجية سعيدة...",
    durationFormatted: "0:55",
    durationSeconds: 55,
    waveformPeaks: generateWaveformPeaks(99),
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    likesCount: 15,
    isLiked: false,
    isFeatured: false,
  },
  {
    id: "vr-5",
    speakerName: "Grandma",
    speakerRole: "Family",
    category: "Family",
    quoteSnippet:
      "يا حبايب قلبي ربنا يحفظكم من كل عين ويهنيكم ويجمع بينكم دايماً في خير وبركة وصحة وسعادة...",
    durationFormatted: "1:08",
    durationSeconds: 68,
    waveformPeaks: generateWaveformPeaks(123),
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    likesCount: 42,
    isLiked: true,
    isFeatured: true,
  },
  {
    id: "vr-6",
    speakerName: "Uncle Hesham",
    speakerRole: "Uncle",
    category: "Special Guests",
    quoteSnippet:
      "ألف مبروك يا مينا وأجمل عروسة مريم، نورتوا الدنيا بفرحتكم وأسعدتم قلوبنا جميعاً في هذه الليلة المباركة.",
    durationFormatted: "0:48",
    durationSeconds: 48,
    waveformPeaks: generateWaveformPeaks(201),
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    likesCount: 18,
    isLiked: false,
    isFeatured: false,
  },
  {
    id: "vr-7",
    speakerName: "Laila & Omar",
    speakerRole: "Close Friends",
    category: "Friends",
    quoteSnippet:
      "You two are truly made for each other. Never stop dancing and laughing together!",
    durationFormatted: "1:25",
    durationSeconds: 85,
    waveformPeaks: generateWaveformPeaks(314),
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    likesCount: 22,
    isLiked: false,
    isFeatured: false,
  },
  {
    id: "vr-8",
    speakerName: "Farida",
    speakerRole: "Childhood Friend",
    category: "Special Guests",
    quoteSnippet:
      "من أول يوم عرفتك فيه يا مريم وكنت مستنية اليوم ده، ربنا يهنيكم ويحفظكم ويبارك في كل خطوة.",
    durationFormatted: "0:35",
    durationSeconds: 35,
    waveformPeaks: generateWaveformPeaks(405),
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    likesCount: 31,
    isLiked: false,
    isFeatured: false,
  },
];

export const INITIAL_BOOTH_PHOTOS: PhotoKeepsake[] = [
  {
    id: "p-1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    caption: "محطة هاتف أثر العتيق الفاخرة وشموع الاستقبال الدافئة",
    category: "Around The Phone",
  },
  {
    id: "p-2",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    caption: "مينا ومريم يوثقان أول رسالة صوتية بهاتف أثر العاجي",
    category: "Couple",
  },
  {
    id: "p-3",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    caption: "الجدة تهمس بدعواتها الصادقة للعروسين بعد نغمة الرنين",
    category: "Around The Phone",
  },
  {
    id: "p-4",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    caption: "الرقصة الأولى تحت أضواء الإسكندرية الساحرة وألحان السهرة",
    category: "Celebration",
  },
  {
    id: "p-5",
    url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    caption: "الأصدقاء يتناوبون على سماعة الهاتف وسط الضحكات والمشاعر الصادقة",
    category: "Around The Phone",
  },
  {
    id: "p-6",
    url: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80",
    caption: "بوفيه الاحتفال الملكي وطاولات المعازيم مع بطاقات أثر",
    category: "Celebration",
  },
];

export const INITIAL_GUESTBOOK_BLESSINGS: GuestBlessingNote[] = [
  {
    id: "gb-1",
    authorName: "Nour Hassan",
    authorRole: "Best Friend",
    message:
      "Watching you walk down the aisle today brought happy tears to my eyes. You two have an extraordinary bond that illuminates every room. Love you both to the moon and beyond!",
    date: "12 July 2026",
    likes: 24,
    isLiked: true,
  },
  {
    id: "gb-2",
    authorName: "Ahmed El Sayed",
    authorRole: "Brother",
    message:
      "مينا يا غالي، ومريم أختنا الجديدة، ربنا يديم الضحكة والبهجة دي في بيتكم دايماً. فخور بيكم وسعيد من كل قلبي بأجمل ليلة.",
    date: "12 July 2026",
    likes: 18,
  },
  {
    id: "gb-3",
    authorName: "Uncle Hesham",
    authorRole: "Uncle",
    message:
      "ليلة من ألف ليلة وليلة في إسكندرية! بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة ومحبة دائمة.",
    date: "12 July 2026",
    likes: 15,
  },
  {
    id: "gb-4",
    authorName: "Tarek Mostafa",
    authorRole: "Colleague",
    message:
      "Congratulations to the dream couple! Athar was such a unique experience, had to leave this extra note here as well.",
    date: "13 July 2026",
    likes: 9,
  },
];

export const DEFAULT_CANONICAL_BOOTH: BoothMemoryFullData = {
  id: "memory-mina-and-maryam",
  $id: "memory-mina-and-maryam",
  slug: "mina-and-maryam",
  coupleTitle: "Mina & Maryam",
  eventHeaderTag: "THE WEDDING OF",
  eventDateDisplay: "12 July 2026",
  eventLocationDisplay: "Alexandria, Egypt",
  highlightBadge: "Together Always",
  coupleQuote: "Every voice here is a piece of our forever ...",
  quoteAuthor: "Mina & Maryam",
  tagline: "Same People. Different Voices. A Lasting Athar.",
  taglineLine1: "Same People. Different Voices.",
  taglineLine2: "A Lasting Athar.",
  thankYouTitle: "With Love & Eternal Gratitude",
  thankYouMessage:
    "To our dearest family and friends,\n\nListening to your voices has moved us to tears and filled our hearts with endless gratitude. Each laugh, spontaneous joke, heartfelt prayer, and warm blessing recorded on this vintage telephone is a treasure we will keep close for all the years ahead.\n\nThank you for traveling near and far, for dancing with us until dawn, and for leaving an everlasting Athar on the first day of our forever.\n\nWith all our love and deepest blessings,\nMina & Maryam",
  heroImageUrl:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
  videoHighlightThumbnailId:
    "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
  videoHighlightTitle: "30 Seconds of Your Day",
  videoDuration: "0:30",
  isPrivateLocked: false,
  accessPinCode: "1234",
  totalAudioCount: 86,
  voiceRecords: INITIAL_BOOTH_VOICE_RECORDS,
  photos: INITIAL_BOOTH_PHOTOS,
  guestBookNotes: INITIAL_GUESTBOOK_BLESSINGS,
};
