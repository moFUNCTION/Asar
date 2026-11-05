// =============================================================
// ASAR (Athar / أثر) — Canonical Invitation Presets & Fallbacks
// =============================================================

import type { InvitationStorefrontData, DynamicFormFieldConfig } from "./types";

export const DEFAULT_RSVP_FORM_SCHEMA: DynamicFormFieldConfig[] = [
  {
    id: "f-name",
    name: "guestName",
    label: "الاسم الكريم · Full Name",
    type: "text",
    placeholder: "مثال: د. كريم الألفي",
    required: true,
    isLocked: true, // Mandatory
  },
  {
    id: "f-email",
    name: "guestEmail",
    label: "البريد الإلكتروني · Email Address (مطلوب لإرسال بطاقة وتصريح QR)",
    type: "email",
    placeholder: "your.name@example.com",
    required: true,
    isLocked: true, // Mandatory locked by ASAR specification
    helperText:
      "سيتم إرسال بطاقة الدعوة الخاصة بك (QR Code) وتصريح الدخول الرسمي فوراً إلى هذا البريد.",
  },
  {
    id: "f-phone",
    name: "guestPhone",
    label: "رقم الهاتف / واتساب · WhatsApp Number",
    type: "tel",
    placeholder: "010xxxxxxxx",
    required: false,
  },
  {
    id: "f-companions",
    name: "companionsCount",
    label: "عدد المرافقين الإضافيين · Additional Companions",
    type: "select",
    required: false,
    options: [
      "بدون مرافقين (شخص واحد فقط)",
      "+1 مرافق (شخصان)",
      "+2 مرافقين (3 أشخاص)",
    ],
    defaultValue: "0",
  },
  {
    id: "f-dietary",
    name: "dietaryNotes",
    label: "الملاحظات الغذائية أو الصحية · Dietary Preferences",
    type: "text",
    placeholder: "نباتي / حساسية معينة / بدون ملاحظات خاصة",
    required: false,
  },
  {
    id: "f-message",
    name: "blessingMessage",
    label: "رسالة تهنئة أو كلمة للذكرى · Memory & Wishes",
    type: "textarea",
    placeholder: "شاركنا تهنئتكم أو أي متطلبات خاصة بهذه المناسبة...",
    required: false,
  },
];

export const INVITATION_PRESETS: Record<string, InvitationStorefrontData> = {
  "omar-and-layla": {
    id: "invitation-omar-and-layla",
    $id: "invitation-omar-and-layla",
    slug: "omar-and-layla",
    eventTitle: "حفل زفاف عمر وليلى · The Wedding of Omar & Layla",
    occasionType: "wedding",
    eventDate: "2026-11-20",
    eventTime: "19:30 AST",
    venueName: "فندق فورسيزونز سان ستيفانو - الإسكندرية",
    venueAddress: "طريق الجيش، سان ستيفانو، الإسكندرية، جمهورية مصر العربية",
    venueMapUrl: "https://maps.google.com",
    tagline:
      "يتشرفان بدعوة سيادتكم لمشاركتهما فرحة العمر في ليلة لا تُنسى على ضفاف البحر الأبيض المتوسط.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    maxCapacity: 250,
    themeConfigJson: {
      primaryColor: "#6B1D28",
      secondaryColor: "#D4AF37",
      backgroundColor: "#FBF7F2",
      cardBackground: "rgba(255, 255, 255, 0.94)",
      themeVariant: "ivory-royal",
      fontFamily: "Amiri",
      direction: "rtl",
    },
    scheduleJson: [
      {
        timeOrYear: "19:30",
        title: "استقبال الضيوف والمشروبات الترحيبية",
        description:
          "نبدأ الأمسية بلقاء الأحبة وعزف موسيقي هادئ مع مشروبات الكوكتيل الفاخرة.",
        badge: "Welcome",
      },
      {
        timeOrYear: "20:30",
        title: "المراسم الرسمية ودخول العروسين",
        description:
          "دخول العروسين وتوثيق اللحظات الأيقونية والتقاط الصور التذكارية.",
        badge: "Key Moment",
      },
      {
        timeOrYear: "21:30",
        title: "مأدبة العشاء الملكية",
        description:
          "بوفيه عشاء فاخر مصمم خصيصاً للمناسبة من كبار طهاة الفندق.",
        badge: "Dinner",
      },
      {
        timeOrYear: "23:00",
        title: "سهرة الحفل والموسيقى",
        description:
          "استمرار الأمسية بأجواء مفعمة بالبهجة والمفاجآت وتوثيق الذكريات.",
        badge: "Celebration",
      },
    ],
    dressCodeJson: {
      title: "أزياء السهرة الرسمية الفاخرة · Black Tie & Evening Glamour",
      description:
        "يسعدنا تألقكم بأزياء السهرة الرسمية التي تليق بهذه الليلة الاستثنائية. نفضل درجات الألوان الملكية المتناسقة أدناه.",
      swatches: [
        { name: "العنابي الملكي", hex: "#6B1D28" },
        { name: "الذهب الشامباني", hex: "#D4AF37" },
        { name: "الأسود الأوبسيديان", hex: "#1F1A1C" },
        { name: "الزمردي الراقي", hex: "#1E6F50" },
        { name: "الألباستر الدافئ", hex: "#FBF7F2" },
      ],
      notes:
        "خدمة صف السيارات (Valet Parking) متوفرة مجاناً لجميع السادة الضيوف عند المدخل الرئيسي.",
    },
    formSchemaJson: DEFAULT_RSVP_FORM_SCHEMA,
    qrCodeUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=6B1D28&bgcolor=FBF7F2&data=https%3A%2F%2Fomar-and-layla.asar.me",
    isPublished: true,
  },

  "cairo-jazz-festival": {
    id: "invitation-cairo-jazz",
    $id: "invitation-cairo-jazz",
    slug: "cairo-jazz-festival",
    eventTitle: "مهرجان القاهرة الدولي للجاز · Cairo Jazz Festival 2026",
    occasionType: "festival",
    eventDate: "2026-12-05",
    eventTime: "18:00 CLT",
    venueName: "The Greek Campus - وسط البلد، القاهرة",
    venueAddress: "28 شارع الفلكي، باب اللوق، وسط البلد، القاهرة",
    venueMapUrl: "https://maps.google.com",
    tagline:
      "ملتقى كبار الموسيقيين والفنانين المستقلين في أسبوع من الإبداع والشغف في قلب القاهرة التاريخية.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    maxCapacity: 400,
    themeConfigJson: {
      primaryColor: "#B7791F",
      secondaryColor: "#D4AF37",
      backgroundColor: "#FAF5EE",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      themeVariant: "ivory-royal",
      fontFamily: "Cairo",
      direction: "rtl",
    },
    scheduleJson: [
      {
        timeOrYear: "18:00",
        title: "حفل الافتتاح ومعرض الفنون التشكيلية",
        description:
          "استقبال الحضور وجولة بين المعارض الفنية المستقلة وعروض العزف الحي.",
        badge: "Opening",
      },
      {
        timeOrYear: "19:30",
        title: "الفرقة الرئيسية: إيقاعات الجاز الشرقي",
        description:
          "عرض موسيقي ساحر يدمج المقامات الشرقية الأصيلة مع إيقاعات الجاز العالمي.",
        badge: "Main Stage",
      },
      {
        timeOrYear: "21:30",
        title: "جلسة العزف الارتجالي الحرة (Jam Session)",
        description:
          "جلسة تفاعلية مفتوحة يشارك فيها نخبة من عازفي الساكسفون والبيانو والدرامز.",
        badge: "Jam Session",
      },
    ],
    dressCodeJson: {
      title: "أزياء عصرية أنيقة · Creative Smart Casual",
      description:
        "نرحب بإطلالاتكم الإبداعية المريحة التي تعبر عن الروح الفنية للمهرجان.",
      swatches: [
        { name: "الذهب الدافئ", hex: "#B7791F" },
        { name: "الأزرق الليلي", hex: "#1E3A8A" },
        { name: "الكريمي الهادئ", hex: "#F4EFEA" },
      ],
      notes:
        "يُرجى إبراز بطاقة الدخول الرقمية (QR Code) عند بوابات التذاكر الإلكترونية.",
    },
    formSchemaJson: DEFAULT_RSVP_FORM_SCHEMA,
    qrCodeUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=B7791F&bgcolor=FAF5EE&data=https%3A%2F%2Fcairo-jazz-festival.asar.me",
    isPublished: true,
  },

  "asar-leadership-gala": {
    id: "invitation-asar-gala",
    $id: "invitation-asar-gala",
    slug: "asar-leadership-gala",
    eventTitle: "قمة أثر السنوية للقيادة والابتكار · Asar Leadership Gala",
    occasionType: "gala",
    eventDate: "2026-11-12",
    eventTime: "19:30 AST",
    venueName: "The Grand Pavilion, St. Regis Almasa Hotel",
    venueAddress: "Al Masa Capital, New Administrative Capital, Cairo",
    venueMapUrl: "https://maps.google.com",
    tagline:
      "أمسية استثنائية تحتفي برواد الأعمال والمبتكرين وصناع القرار في الوطن العربي في أجواء ملكية راقية.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    maxCapacity: 300,
    themeConfigJson: {
      primaryColor: "#D4AF37",
      secondaryColor: "#E5C158",
      backgroundColor: "#161214",
      cardBackground: "rgba(35, 26, 30, 0.95)",
      themeVariant: "noir-obsidian",
      fontFamily: "Playfair Display",
      direction: "rtl",
    },
    scheduleJson: [
      {
        timeOrYear: "19:30",
        title: "الاستقبال الملكي والسجادة الحمراء VIP Red Carpet",
        description:
          "وصول كبار الضيوف والتقاط الصور التذكارية الرسمية أمام جدارية الرعاة.",
        badge: "Red Carpet",
      },
      {
        timeOrYear: "20:30",
        title: "الخطاب الافتتاحي وتكريم رواد الابتكار",
        description:
          "كلمات رئيسية ملهمة وتوزيع جوائز أثر السنوية للتميز القيادي.",
        badge: "Keynote",
      },
      {
        timeOrYear: "21:45",
        title: "مأدبة العشاء الفاخرة وجلسات التواصل",
        description:
          "عشاء استثنائي وجلسات حوارية ونقاشية بين قادة الصناعة ورواد الأعمال.",
        badge: "Gala Dinner",
      },
    ],
    dressCodeJson: {
      title: "أزياء السهرة الرسمية السوداء VIP · Black Tie VIP",
      description:
        "الأمسية تتطلب بدلات رسمية كاملة (Black Tie Tuxedo) وفساتين سهرة راقية.",
      swatches: [
        { name: "الأسود الأوبسيديان", hex: "#161214" },
        { name: "الذهب الملكي", hex: "#D4AF37" },
        { name: "الرمادي الفحمي", hex: "#2B282A" },
      ],
      notes:
        "الدخول حصري لحاملي بطاقات VIP المعتمدة مسبقاً مع مقاعد مخصصة بالاسم.",
    },
    formSchemaJson: DEFAULT_RSVP_FORM_SCHEMA,
    qrCodeUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=D4AF37&bgcolor=161214&data=https%3A%2F%2Fasar-leadership-gala.asar.me",
    isPublished: true,
  },
};

export const DEFAULT_CANONICAL_INVITATION =
  INVITATION_PRESETS["omar-and-layla"];
