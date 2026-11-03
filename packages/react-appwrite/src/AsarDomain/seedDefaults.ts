// =============================================================
// ASAR (Athar / أثر) — Luxury Fallback & Demo Seed Data
// =============================================================

import type {
  AsarPlan,
  BoothMemory,
  BoothVoiceRecord,
  AsarInvitation,
  InvitationRsvp,
} from "./models";

function createDemoPeaks(seedStr: string, count = 48): number[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash) || 12345;
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 1664525 + 1013904223) >>> 0;
    const rnd = (hash % 1000) / 1000;
    const progress = i / (count - 1);
    const env = Math.sin(progress * Math.PI);
    const val = env * (0.45 + rnd * 0.55);
    peaks.push(Number(Math.max(0.15, Math.min(1.0, val)).toFixed(2)));
  }
  return peaks;
}

// 1. Default Dynamic Booth Plans
export const DEFAULT_BOOTH_PLANS: AsarPlan[] = [
  {
    $id: "plan-booth-moment",
    serviceType: "booth",
    name: "لحظة أثر — Athar Moment",
    subtitle: "الباقة الكلاسيكية الأنيقة",
    badge: "الأكثر طلباً",
    subBadge: "عرض الإطلاق الحصري",
    price: 5500,
    currency: "EGP",
    themeVariant: "ivory-royal",
    imageUrl: "/assets/booth-hero-photo.webp",
    featuresJson: JSON.stringify([
      "تغطية الحفل لمدة 3 ساعات كاملة مع مشرف ومضيف متخصص",
      "هاتف أثر العتيق الفاخر (Vintage Audio Telephone) بألوان مخصصة",
      "تسجيل ما يصل إلى 80 رسالة صوتية نقية من ضيوفكم وأحبائكم",
      "معرض صور رقمي يتسع لـ 20 صورة تذكارية عالية الجودة",
      "4 فئات مرنة لتصنيف التسجيلات (الأهل، الأصدقاء، زملاء العمل، ضيوف مميزون)",
      "تفعيل دفتر الذكريات الرقمي للتهاني والرسائل الكتابية (Guest Book)",
      "تحميل مجمع ZIP لجميع التسجيلات الصوتية عالية الدقة بنقرة واحدة",
      "استضافة سحابية خاصة لموقع الذكريات تدوم لمدة 365 يوماً كاملة",
    ]),
    addonsJson: JSON.stringify([
      {
        id: "addon-extra-hour",
        name: "ساعة تغطية إضافية",
        price: 1000,
        description: "ساعة إضافية لتواجد محطة أثر مع المشرف",
        badge: "مرونة كاملة",
      },
      {
        id: "addon-wooden-sign",
        name: "لوحة طاولة خشبية محفورة بالليزر",
        price: 650,
        description: "لوحة إرشادية خشبية فاخرة مصممة لطاولة الهاتف العتيق",
      },
      {
        id: "addon-leather-box",
        name: "حقيبة أثر الجلدية التذكارية",
        price: 850,
        description: "صندوق جلدي فاخر لحفظ فلاشة الصوتيات والبطاقات",
      },
    ]),
    limitsJson: JSON.stringify({
      coverageHours: 3,
      maxVoiceRecords: 80,
      maxGalleryPhotos: 20,
      maxCustomCategories: 4,
      hasVideoHighlight: false,
      hasGuestBookTab: true,
      allowBulkZipDownload: true,
      hostingDurationDays: 365,
    }),
    isActive: true,
    sortOrder: 1,
  },
  {
    $id: "plan-booth-story",
    serviceType: "booth",
    name: "حكاية أثر — Athar Story",
    subtitle: "الباقة الملكية المتكاملة",
    badge: "VIP Royal Suite",
    subBadge: "الخيار الأرقى للزفاف",
    price: 7000,
    currency: "EGP",
    themeVariant: "noir-obsidian",
    imageUrl: "/assets/love-wedding.jpg",
    featuresJson: JSON.stringify([
      "تغطية الحفل لمدة 6 ساعات متواصلة طوال مراسم وسهرة الزفاف",
      "محطة هاتفين عتيقين مع مضيفين من فريق أثر لاستقبال الضيوف",
      "تسجيل ما يصل إلى 150 رسالة صوتية بأعلى دقة هندسة صوتية",
      "معرض صور وسائط موسع يتسع لـ 100 صورة ومقطع مميز",
      "شريط فيديو سينمائي مخصص 30 ثانية (Video Highlight Reel)",
      "10 فئات لتصنيف وفهرسة أصوات المعازيم وتوثيق لحظاتهم",
      "تفعيل تبويب دفتر الذكريات المكتوبة وتوثيق تبريكات الحضور",
      "تحميل مجمع ZIP لجميع الملفات وبطاقات QR مطبوعة لطاولات المعازيم",
      "استضافة سحابية VIP خاصة ومحمية برمز PIN مخصص لمدة عامين",
    ]),
    addonsJson: JSON.stringify([
      {
        id: "addon-crystal-usb",
        name: "فلاشة كريستالية محفورة بالأسماء",
        price: 950,
        description: "وحدة تخزين USB 3.0 كريستالية مع علبة مخملية أنيقة",
        badge: "تذكار دائم",
      },
      {
        id: "addon-vinyl-record",
        name: "أسطوانة فينيل كلاسيكية حقيقية",
        price: 1800,
        description: "أسطوانة فينيل مسجل عليها أهم الرسائل مع غلاف مطبوع",
      },
    ]),
    limitsJson: JSON.stringify({
      coverageHours: 6,
      maxVoiceRecords: 150,
      maxGalleryPhotos: 100,
      maxCustomCategories: 10,
      hasVideoHighlight: true,
      hasGuestBookTab: true,
      allowBulkZipDownload: true,
      hostingDurationDays: 730,
    }),
    isActive: true,
    sortOrder: 2,
  },
];

// 2. Default Dynamic Invitation Plans
export const DEFAULT_INVITATION_PLANS: AsarPlan[] = [
  {
    $id: "plan-invite-classic",
    serviceType: "invitation",
    name: "دعوة أثر الكلاسيكية — Athar Classic Invite",
    subtitle: "الدعوة الرقمية الراقية مع إدارة الحضور",
    badge: "الأكثر شعبية",
    price: 2500,
    currency: "EGP",
    themeVariant: "ivory-royal",
    imageUrl: "/assets/love-wedding.jpg",
    featuresJson: JSON.stringify([
      "تصميم تحريري فاخر متوافق تماماً مع الهواتف الذكية",
      "نموذج تأكيد حضور تفاعلي (Dynamic RSVP) مع صندوق بريد في حسابك",
      "تخصيص أسئلة الحضور ومرافقي الضيوف والملاحظات الغذائية",
      "خريطة القاعة التفاعلية والعد التنازلي لموعد المناسبة",
      "سعة تأكيد حضور تصل إلى 150 مدعواً",
      "استضافة سحابية خاصة للدعوة لمدة 180 يوماً",
    ]),
    addonsJson: JSON.stringify([
      {
        id: "addon-sms-dispatch",
        name: "خدمة إرسال رسائل SMS للضيوف",
        price: 750,
        description: "إرسال رابط الدعوة ورمز الدخول عبر رسائل SMS موثقة",
      },
    ]),
    limitsJson: JSON.stringify({
      maxRsvpCapacity: 150,
      allowCustomSections: false,
      hostingDurationDays: 180,
    }),
    isActive: true,
    sortOrder: 1,
  },
  {
    $id: "plan-invite-bespoke",
    serviceType: "invitation",
    name: "دعوة أثر الملكية — Athar Bespoke Gala",
    subtitle: "منظومة الدعوات المخصصة وبطاقات QR الذكية",
    badge: "VIP Custom",
    price: 4500,
    currency: "EGP",
    themeVariant: "noir-obsidian",
    imageUrl: "/assets/wedding2.jpg",
    featuresJson: JSON.stringify([
      "تخصيص كامل للألوان والخلفيات التفاعلية ثلاثية الأبعاد (WebGL)",
      "إصدار بطاقة دخول رقمية ذكية لكل ضيف برمز QR Pass فريد",
      "إرسال بريد تأكيد الحضور التلقائي عبر EmailJS مع بطاقة الدخول",
      "أداة ماسح رمز QR لبوابة القاعة للتحقق من الضيوف ومنع التكرار",
      "سعة غير محدودة للمدعوين (حتى 500+ ضيف)",
      "إمكانية إضافة مقاطع فيديو وموسيقى خلفية تعمل تلقائياً",
    ]),
    addonsJson: JSON.stringify([
      {
        id: "addon-table-seating",
        name: "نظام توزيع مقاعد وطاولات الضيوف",
        price: 1200,
        description: "تحديد رقم الطاولة واسم المقعد على بطاقة الـ QR لكل ضيف",
      },
    ]),
    limitsJson: JSON.stringify({
      maxRsvpCapacity: 500,
      allowCustomSections: true,
      hostingDurationDays: 365,
    }),
    isActive: true,
    sortOrder: 2,
  },
];

// 3. Demo Booth Memory (Image #1 Reference: Mina & Maryam)
export const DEMO_BOOTH_MEMORY: BoothMemory = {
  $id: "memory-mina-and-maryam",
  orderId: "order-demo-001",
  clientId: "client-mina",
  slug: "mina-and-maryam",
  eventHeaderTag: "THE WEDDING OF",
  coupleTitle: "Mina & Maryam",
  tagline: "Same People. Different Voices. A Lasting Athar.",
  eventDateDisplay: "12 July 2026",
  eventLocationDisplay: "Alexandria, Egypt",
  highlightBadge: "Together Always",
  coupleQuote: "Every voice here is a piece of our forever ...",
  heroImageFileId: "hero-mina-maryam",
  heroImageUrl: "/assets/love-wedding.jpg",
  videoHighlightFileId: "video-highlight-001",
  videoHighlightThumbnailId: "/assets/booth-hero-photo.webp",
  videoHighlightTitle: "30 Seconds of Your Day",
  thankYouTitle: "With Love & Eternal Gratitude",
  thankYouMessage:
    "Thank you to our beloved family and wonderful friends for making our night pure magic. Listening back to these voice notes brings tears and smiles to our eyes. You are our forever treasure.",
  categoriesJson: JSON.stringify([
    "Family",
    "Friends",
    "Colleagues",
    "Special Guests",
  ]),
  isPrivateLocked: false,
  accessPinCode: "1234",
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=6B1D28&bgcolor=FBF7F2&data=https%3A%2F%2Fasar.audio%2Fmemory%2Fmina-and-maryam",
  isPublished: true,
};

// 4. Demo Voice Records (Exact 5 Speakers from Image #1)
export const DEMO_BOOTH_VOICE_RECORDS: BoothVoiceRecord[] = [
  {
    $id: "voice-rec-001",
    memoryId: "memory-mina-and-maryam",
    audioFileId: "audio-nour-hassan",
    audioFileUrl: "/assets/demo-audio-1.mp3",
    speakerName: "Nour Hassan",
    speakerRole: "Best Friend",
    category: "Friends",
    quoteSnippet:
      "Mabrook ya gameela, ربنا يسعدكم دايماً وأشوفكم أسعد اتنين في الدنيا كلها يا أحلى عروسة في الكون...",
    avatarFileId: "",
    durationFormatted: "0:42",
    durationSeconds: 42,
    waveformPeaksJson: JSON.stringify(
      createDemoPeaks("Nour Hassan_Friends_042", 48)
    ),
    likesCount: 34,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    $id: "voice-rec-002",
    memoryId: "memory-mina-and-maryam",
    audioFileId: "audio-ahmed-el-sayed",
    audioFileUrl: "/assets/demo-audio-2.mp3",
    speakerName: "Ahmed El Sayed",
    speakerRole: "Brother",
    category: "Family",
    quoteSnippet:
      "منورين الدنيا كلها وفخور بيك يا أخويا، ربنا يجعل أيامكم كلها فرح وهنا وسرور ويحفظكم لبعض...",
    avatarFileId: "",
    durationFormatted: "1:12",
    durationSeconds: 72,
    waveformPeaksJson: JSON.stringify(
      createDemoPeaks("Ahmed El Sayed_Family_112", 48)
    ),
    likesCount: 28,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    $id: "voice-rec-003",
    memoryId: "memory-mina-and-maryam",
    audioFileId: "audio-mona-khaled",
    audioFileUrl: "/assets/demo-audio-3.mp3",
    speakerName: "Mona Khaled",
    speakerRole: "Cousin",
    category: "Family",
    quoteSnippet:
      "أحلى عروسين في مصر كلها! الفرح كان يجنن وعقبال ما نحتفل بأول بيبي يارب، بنحبكم جداً...",
    avatarFileId: "",
    durationFormatted: "0:38",
    durationSeconds: 38,
    waveformPeaksJson: JSON.stringify(
      createDemoPeaks("Mona Khaled_Family_038", 48)
    ),
    likesCount: 19,
    isFeatured: false,
    sortOrder: 3,
  },
  {
    $id: "voice-rec-004",
    memoryId: "memory-mina-and-maryam",
    audioFileId: "audio-tarek-mostafa",
    audioFileUrl: "/assets/demo-audio-4.mp3",
    speakerName: "Tarek Mostafa",
    speakerRole: "Colleague",
    category: "Colleagues",
    quoteSnippet:
      "ألف مبروك يا مينا ومن نجاح لنجاح دايماً في الشغل والبيت، أحلى تمنياتي لكم بحياة زوجية سعيدة...",
    avatarFileId: "",
    durationFormatted: "0:55",
    durationSeconds: 55,
    waveformPeaksJson: JSON.stringify(
      createDemoPeaks("Tarek Mostafa_Colleagues_055", 48)
    ),
    likesCount: 14,
    isFeatured: false,
    sortOrder: 4,
  },
  {
    $id: "voice-rec-005",
    memoryId: "memory-mina-and-maryam",
    audioFileId: "audio-grandma",
    audioFileUrl: "/assets/demo-audio-5.mp3",
    speakerName: "Grandma",
    speakerRole: "Grandmother",
    category: "Special Guests",
    quoteSnippet:
      "يا حبايب قلبي ربنا يحفظكم من كل عين ويهنيكم ويجمع بينكم دايماً في خير وبركة وصحة وسعادة...",
    avatarFileId: "",
    durationFormatted: "1:08",
    durationSeconds: 68,
    waveformPeaksJson: JSON.stringify(
      createDemoPeaks("Grandma_Special_108", 48)
    ),
    likesCount: 52,
    isFeatured: true,
    sortOrder: 5,
  },
];

// 5. Demo Invitation
export const DEMO_INVITATION: AsarInvitation = {
  $id: "invitation-omar-and-layla",
  orderId: "order-invite-demo",
  clientId: "client-omar",
  slug: "omar-and-layla",
  eventTitle: "The Wedding Celebration of Omar & Layla",
  occasionType: "wedding",
  eventDate: "2026-09-18",
  eventTime: "07:30 PM",
  venueName: "Four Seasons Hotel Ballroom",
  venueAddress: "1089 Corniche El Nil, Garden City, Cairo",
  venueMapUrl: "https://maps.google.com",
  maxCapacity: 250,
  themeConfigJson: JSON.stringify({
    primaryColor: "#6B1D28",
    secondaryColor: "#D4AF37",
    backgroundColor: "#FBF7F2",
    surfaceColor: "#F4EFEA",
    direction: "rtl",
    webGlEffect: "waves",
    enableMusic: true,
  }),
  sectionsConfigJson: JSON.stringify([
    {
      id: "sec-hero",
      type: "hero",
      titleEn: "Welcome Hero",
      titleAr: "شاشة الاستقبال الملكية",
      enabled: true,
      order: 1,
    },
    {
      id: "sec-countdown",
      type: "countdown",
      titleEn: "Countdown",
      titleAr: "العد التنازلي للزفاف",
      enabled: true,
      order: 2,
    },
    {
      id: "sec-schedule",
      type: "schedule",
      titleEn: "Program & Schedule",
      titleAr: "جدول فقرات الحفل",
      enabled: true,
      order: 3,
    },
    {
      id: "sec-location",
      type: "location_map",
      titleEn: "Location & Directions",
      titleAr: "موقع القاعة ومسار الوصول",
      enabled: true,
      order: 4,
    },
    {
      id: "sec-rsvp",
      type: "rsvp_form",
      titleEn: "RSVP & Attendance",
      titleAr: "تأكيد الحضور وبطاقة الدخول",
      enabled: true,
      order: 5,
    },
  ]),
  formSchemaJson: JSON.stringify([
    {
      id: "field-name",
      name: "guestName",
      labelEn: "Full Name",
      labelAr: "الاسم الكريم",
      type: "text",
      required: true,
      locked: false,
      placeholderAr: "الاسم ثلاثي أو ثنائي كما تحبون كتابته",
    },
    {
      id: "field-email",
      name: "guestEmail",
      labelEn: "Email Address (Mandatory for QR Pass)",
      labelAr: "البريد الإلكتروني (إلزامي لاستلام بطاقة الدخول QR)",
      type: "email",
      required: true,
      locked: true, // Strictly locked by ASAR architectural specification
      placeholderAr: "name@example.com",
      helperTextAr: "سيتم إرسال بطاقة وتصريح الدخول الرسمية إلى هذا البريد فور اعتماد الحضور",
    },
    {
      id: "field-phone",
      name: "guestPhone",
      labelEn: "WhatsApp Number",
      labelAr: "رقم الواتساب للتواصل والتذكير",
      type: "phone",
      required: false,
      locked: false,
      placeholderAr: "+20 100 000 0000",
    },
    {
      id: "field-companions",
      name: "companionsCount",
      labelEn: "Number of Companions",
      labelAr: "عدد المرافقين بصحبتكم",
      type: "number",
      required: false,
      locked: false,
      defaultValue: 0,
    },
    {
      id: "field-notes",
      name: "dietaryRequirements",
      labelEn: "Special Wishes or Dietary Notes",
      labelAr: "كلمة للعروسين أو ملاحظات خاصة",
      type: "textarea",
      required: false,
      locked: false,
      placeholderAr: "شاركنا تهنئتكم أو أي متطلبات خاصة...",
    },
  ]),
  qrCodeUrl:
    "https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=6B1D28&bgcolor=FBF7F2&data=https%3A%2F%2Fasar.audio%2Fe%2Fomar-and-layla",
  isPublished: true,
};

// 6. Demo Invitation RSVPs for Client Account Mailbox
export const DEMO_INVITATION_RSVPS: InvitationRsvp[] = [
  {
    $id: "rsvp-demo-001",
    invitationId: "invitation-omar-and-layla",
    clientId: "client-omar",
    guestName: "د. شريف عبد المنعم",
    guestEmail: "sherif.abdelmonem@example.com",
    guestPhone: "+20 101 234 5678",
    companionsCount: 1,
    dynamicResponsesJson: JSON.stringify({
      dietaryRequirements: "نباتي — خالص التهاني لأجمل عائلة",
    }),
    status: "approved",
    passToken: "pass-token-abc-789",
    qrCodeUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=6B1D28&bgcolor=FBF7F2&data=https%3A%2F%2Fasar.audio%2Fpass%2Frsvp-demo-001%3Ftoken%3Dpass-token-abc-789",
    emailSent: true,
    isCheckedInAtVenue: false,
    respondedAt: "2026-08-01T14:32:00Z",
  },
  {
    $id: "rsvp-demo-002",
    invitationId: "invitation-omar-and-layla",
    clientId: "client-omar",
    guestName: "م. كريم والي",
    guestEmail: "karim.waly@example.com",
    guestPhone: "+20 112 987 6543",
    companionsCount: 0,
    dynamicResponsesJson: JSON.stringify({
      dietaryRequirements: "ألف مبروك وبالرفاء والبنين!",
    }),
    status: "pending",
    emailSent: false,
    isCheckedInAtVenue: false,
    respondedAt: "2026-08-03T18:15:00Z",
  },
  {
    $id: "rsvp-demo-003",
    invitationId: "invitation-omar-and-layla",
    clientId: "client-omar",
    guestName: "أحمد سليم وعائلته",
    guestEmail: "ahmed.selim@example.com",
    guestPhone: "+20 120 555 4321",
    companionsCount: 4,
    dynamicResponsesJson: JSON.stringify({
      dietaryRequirements: "نعتذر لطلب مقاعد إضافية ونتمنى لكم السعادة",
    }),
    status: "declined",
    emailSent: true,
    isCheckedInAtVenue: false,
    respondedAt: "2026-08-04T10:05:00Z",
  },
];
