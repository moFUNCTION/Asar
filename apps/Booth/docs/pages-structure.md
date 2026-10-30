# هَيْكَلَة وَبِنْيَة صَفَحَات وَمُكَوِّنَات مَوْقِع أَثَـــر (Booth App)
**Athar Audio Guestbook — Website Pages & Architectural Structure Documentation**

---

## 1. نَظْرَة عَامَّة عَلَى التَّطْبِيق (Overview)
تطبيق **`Booth`** هو الموقع التعريفي والتسويقي التفاعلي الفاخر لمشروع **"أَثَـــر — ذكريات هاتف الزوار الصوتي للأفراح والمناسبات الراقية"** في مصر (الإسكندرية، الساحل الشمالي، القاهرة، والجيزة).

* **نمط الموقع (Architecture Pattern):** صفحة هبوط رئيسية متكاملة ذات تمرير انسيابي فائق الفخامة (**Luxury Single-Page Application with Smooth Section Snapping & Deep Linking**)، مدعومة بنافذة حجز تفاعلية متعددة المراحل (**Interactive Multi-Step Booking Modal**)، وقائمة تنقل ذكية ذات حالتين (**Dual-State Adaptive Header**).
* **اللغة والاتجاه:** لغة عربية فصحى وجدانية شاعريّة بنسبة 100% مع دعم كامل لاتجاه القراءة من اليمين إلى اليسار (`dir="rtl"`).
* **التقنيات المستخدمة (Tech Stack):**
  * **Frontend Core:** React 18, TypeScript, Vite.
  * **UI Framework:** Chakra UI (v2) مع نظام تصميم مخصص بالألوان الترابية الملكية.
  * **Animations & 3D Shaders:** حزمة `@repo/ui-components` (المبنية على OGL WebGL2, Framer Motion, Canvas, Web Audio API).
  * **Typography:** خطوط عربية فاخرة (`Alexandria` للعناوين والخطوط الحديثة، `Marhey` للّمسات الشاعرية، و`Amiri` للأشعار والغزل الكلاسيكي).

---

## 2. هَرَمِيَّة تَرْكِيب المَوْقِع (Component Hierarchy)

```
apps/Booth/
├── index.html                         # إعدادات الـ SEO، الخطوط والوسوم الوصفية
├── src/
│   ├── main.tsx                       # نقطة البداية ومزود ChakraProvider
│   ├── App.tsx                        # المكون الجذري والمتحكم في تسلسل الأقسام والمودال
│   ├── index.css                      # المتغيرات اللونية (CSS Variables) والتأثيرات العالمية
│   └── components/
│       ├── layout/
│       │   ├── Header.tsx             # الترويسة المزدوجة (Static Header + Floating CardNav + Mobile Drawer)
│       │   └── Footer.tsx             # التذييل التحريري الفاخر
│       └── sections/
│           ├── HeroSection.tsx        # 01. واجهة الهيرو الترحيبية وتدفق الأمواج الحريرية
│           ├── StatsSection.tsx       # 02. عدادات الثقة والأرقام التراكمية
│           ├── MoreThanPhoneSection.tsx # 03. فلسفة "أكثر من مجرد هاتف" والركائز الوجدانية
│           ├── WhyChooseUsSection.tsx # 04. مميزات أثر، المعرض الدائري المتفاعل وبيت الغزل
│           ├── PackagesSection.tsx    # 05. استعراض الباقات والأسعار (لحظة أثر & حكاية أثر)
│           ├── AddonsSection.tsx      # 06. الإضافات التخصيصية وبانر الاستقبال
│           ├── HowItWorksSection.tsx  # 07. خطوات التجربة الخمس وبطاقة المقارنة التفاعلية
│           ├── RealVoicesSection.tsx  # 08. عينات صوتية حية مشغلة عبر Web Audio API
│           ├── GallerySection.tsx     # 09. معرض بينتو للحظات الواقعية حول الهاتف
│           ├── VideoSection.tsx       # 10. مشغل فيديو الهايلايت السينمائي (٣٠ ثانية)
│           ├── FAQSection.tsx         # 11. الأسئلة الشائعة بنظام الأكورديون
│           ├── ContactSection.tsx     # 12. مركز الاتصال المباشر وقنوات التواصل ومناطق الخدمة
│           ├── PrivacySection.tsx     # 13. ضمان الأمان والخزانة السحابية المشفرة
│           └── BookingModal.tsx       # نافذة الحجز التفاعلية (٣ خطوات + تأكيد الطلب)
```

---

## 3. تَفْصِيل أَقْسَام المَوْقِع (Detailed Section Breakdown)

### 00. الترويسة المزدوجة التكيفية (Adaptive Dual Header)
* **الملف:** [`src/components/layout/Header.tsx`](file:///d:/asar/apps/Booth/src/components/layout/Header.tsx)
* **الحالة الأولى (Static Top Header):**
  * تظهر في أعلى الصفحة فوق قسم الهيرو مباشرة بخلفية شفافة وتدرج ناعم.
  * تتضمن شعار "أثر" العنابي الذهبي، روابط التنقل السريعة، زر التواصل عبر واتساب، وزر "احجز موعدك".
  * تختفي تدريجياً (`fade-out translateY`) عند التمرير لأسفل أكثر من `120px`.
* **الحالة الثانية (Floating CardNav):**
  * مكون [`CardNav`](file:///d:/asar/packages/UI-components/src/CardNav/CardNav.tsx) يطفو في أعلى الشاشة عند التمرير ليمنح المستخدم تجربة تصفح تفاعلية.
  * مقسم إلى ٣ بطاقات رئيسية ثرية بالروابط:
    1. **استكشف أثر:** أكثر من مجرد هاتف، ليه تختار أثر؟، كيف يعمل الهاتف؟
    2. **الباقات والعروض:** لحظة أثر (٥,٥٠٠ ج.م)، حكاية أثر (٧,٠٠٠ ج.م)، إضافات وديكور مخصص.
    3. **الذكريات والتواصل:** تسجيلات صوتية حية، معرض لحظات الفرح، الأسئلة الشائعة والتواصل.
  * زر دعوة لاتخاذ إجراء مباشر مدمج بالبطاقة: `احجز موعدك`.
* **القائمة المتجاوبة للهواتف (Mobile Menu Drawer):**
  * نافذة كاملة الشاشة تفتح بزر الهامبرغر، بخلفية عكارة ضبابية فاخرة بدرجة العنابي الملكي `rgba(91, 22, 33, 0.98)` وروابط مكبرة بخط عربي فخم مع محول اللغات.

---

### 01. قسم الهيرو الرئيسي (Hero Section)
* **المعرف والأيقونة:** `id="hero"`
* **الملف:** [`src/components/sections/HeroSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/HeroSection.tsx)
* **الارتفاع والتخطيط:** `minH="100vh"`, `w="100%"`, Flexbox عمودي محاذى للمنتصف.
* **الخلفية ثلاثية الأبعاد التفاعلية:**
  * تموجات حريرية سائلة حية عبر مكون [`GradientWaves`](file:///d:/asar/packages/UI-components/src/GradientWaves/GradientWaves.tsx) المشغل بـ WebGL2 Raymarching.
  * ألوان الباليتة: عاجي دافئ للأفق (`#FBF7F2`)، عنابي مخملي للأمواج (`#8A2E3B`)، وحرير لؤلؤي للقمم (`#F7EFE6`)، لتمنح إحساساً ملكياً دون أي ألوان فاقعة.
* **المحتوى والنصوص التفاعلية:**
  * **الشارة الترحيبية:** `✦ هاتف الذكريات الصوتي للمناسبات والأفراح الراقية`.
  * **العنوان الرئيسي المتحرك:** مكون [`BlurText`](file:///d:/asar/packages/UI-components/src/BlurText/BlurText.tsx) بجملة: *"خلي صوتهم أثر في حكايتكم."* مع `once={false}`.
  * **العنوان الفرعي:** مكون [`SplitText`](file:///d:/asar/packages/UI-components/src/SplitText/SplitText.tsx) مع `animation="fadeUp"`: *"سِجِلُّ ضُيُوفٍ صَوْتِيٌّ لِلَّيَالِي وَالمُنَاسَبَاتِ الاسْتِثْنَائِيَّةِ"*.
  * **الفقرة الوصفية:** مكون [`BlurText`](file:///d:/asar/packages/UI-components/src/BlurText/BlurText.tsx) لوصف التقاط دموع الفرح وضحكات الأحباب.
  * **الأزرار:**
    * الزر الأساسي: *"احجز موعدك الآن"* ملفوف داخل مكون [`Magnet`](file:///d:/asar/packages/UI-components/src/Magnet/Magnet.tsx) بتأثير مغناطيسي ناعم وهادئ للمؤشر (`magnetStrength={25}`, `maxOffset=5px`).
    * الزر الثانوي: *"شاهد التجربة بالفيديو"* للتمرير السلس نحو قسم الفيديو.

---

### 02. قسم مؤشرات الثقة والأرقام (Stats & Counters Section)
* **المعرف:** `id="stats"`
* **الملف:** [`src/components/sections/StatsSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/StatsSection.tsx)
* **المكونات المميزة:** [`CountUp`](file:///d:/asar/packages/UI-components/src/CountUp/CountUp.tsx)، [`SplitText`](file:///d:/asar/packages/UI-components/src/SplitText/SplitText.tsx)، [`FadeContent`](file:///d:/asar/packages/UI-components/src/FadeContent/FadeContent.tsx).
* **البطاقات الثلاث:**
  1. **100+** أعراس وعائلات وثقت بنا (في الإسكندرية والساحل والقاهرة).
  2. **5,400+** رسالة صوتية حقيقية (دموع فرح، مباركات صادقة، وضحكات عفوية).
  3. **100%** ذكريات تصنع غداً أجمل (خزانة سحابية مشفرة تحفظ الصوت للأبد).

---

### 03. قسم "أكثر من مجرد هاتف" (More Than A Phone Section)
* **المعرف:** `id="about"`
* **الملف:** [`src/components/sections/MoreThanPhoneSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/MoreThanPhoneSection.tsx)
* **التخطيط:** شبكة من عمودين متوازنين (نص سردي شاعري في اليمين، وصورة فوتوغرافية سينمائية نقية في اليسار).
* **الركائز الثلاث:**
  * **قصص إنسانية حية:** ضحكات عفوية ودعوات صادقة لا يمكن للأوراق كتابتها.
  * **ذكريات ذات معنى:** حفظ نبرة صوت الأحباب في هذه المرحلة من العمر.
  * **هوية وروح مصرية:** ضيافة دافئة لتقاليد الفرح المصري الأصيل.
* **البطاقة الرومانسية المقتبسة:** *«كل كلمة قيلت في ليلتكم، ستصبح غداً أغلى ما تملكون... صوتهم هو الأثر الذي لا يزول.»*

---

### 04. قسم "ليه تختار أثر؟" (Why Choose Us Section)
* **المعرف:** `id="why-us"`
* **الملف:** [`src/components/sections/WhyChooseUsSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/WhyChooseUsSection.tsx)
* **التخطيط:**
  * **العمود الأيسر (Showcase):** معرض صور تفاعلي مثبت بالتمرير (`position: sticky`) يتنقل تلقائياً مع مؤشرات دائرية وشارات فخمة ونصوص توضيحية.
  * **العمود الأيمن (Accordion):** أكورديون تفاعلي من 5 ميزات تنافسية رئيسية:
    1. مشاعر عفوية صادقة بدون تكلف (مقارنة مع دفاتر الزوار الورقية).
    2. مضيف وممثل خاص من أثر طوال الحفل لمساعدة المعازيم.
    3. هندسة صوتية احترافية وفلترة للضوضاء وصدى القاعة.
    4. ركن كلاسيكي وديكور يزين قاعة الفرح بشموع وزهور.
    5. خزانة سحابية مشفرة وتحميل بجودة استوديو Lossless.
* **الفاصل الشاعري للغزل الكلاسيكي:**
  * بيت شعري معروض بمكون [`BlurText`](file:///d:/asar/packages/UI-components/src/BlurText/BlurText.tsx):
    > *"صوتُكِ رَوْضٌ إذا ما نَسيمُهُ هَبَّ ، انْجَلَتْ عَن فُؤادي كُلُّ أشْجانِهِ"*
  * مع زخرفة نباتية ذهبية ملوكية `❦`.

---

### 05. قسم باقات وعروض أثر (Packages & Pricing Section)
* **المعرف:** `id="packages"`
* **الملف:** [`src/components/sections/PackagesSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/PackagesSection.tsx)
* **المكونات المميزة:** [`TiltedCard`](file:///d:/asar/packages/UI-components/src/TiltedCard/TiltedCard.tsx) ثلاثي الأبعاد المتفاعل مع حركة الماوس، و[`FadeContent`](file:///d:/asar/packages/UI-components/src/FadeContent/FadeContent.tsx).
* **الباقات المعروضة:**
  * **الباقة 1: لحظة أثر (الباقة الأكثر طلباً)**
    * السعر: **5,500 جنيه مصري**.
    * المزايا: ٣ ساعات تغطية حية، هاتف كلاسيكي وركن ديكور كامل، ممثل خاص طوال الفرح، توصيل وتركيب مجاني (منطقة أ)، هندسة صوت وفلترة، دعوة صوتية رقمية، صفحة ذكريات مشفرة لعام كامل.
  * **الباقة 2: حكاية أثر (الباقة الشاملة الملكية)**
    * السعر: **7,000 جنيه مصري**.
    * المزايا: ٦ ساعات تغطية شاملة طوال السهرة، ديكور VIP مخصص بزهور وشموع، كروت QR كود لطاولات الضيوف، فيديو هايلايت سينمائي ٣٠ ثانية مدمج بالصوتيات، خزانة سحابية مع تنزيل بجودة Lossless.

---

### 06. قسم اللمسات الإضافية المخصصة (Addons Section)
* **المعرف:** `id="addons"`
* **الملف:** [`src/components/sections/AddonsSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/AddonsSection.tsx)
* **العناصر المعروضة:**
  1. ساعة إضافية أولى (1,500 ج.م).
  2. كل ساعة إضافية تالية (500 ج.م / ساعة).
  3. تسليم فوري سريع خلال ٤٨ ساعة (500 ج.م).
  4. لافتة ترحيبية بخط يدوي مخصص (500 ج.م).
  5. تنسيق ديكور وزهور مخصص (حسب الطلب).
* **بانر الاستقبال عبر واتساب:** بطاقة ذات إطار ذهبي منقط للتواصل مع منظمي الحفل لتصميم طابع مخصص.

---

### 07. قسم "كيف يعمل أثر؟" (How It Works Section)
* **المعرف:** `id="how-it-works"`
* **الملف:** [`src/components/sections/HowItWorksSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/HowItWorksSection.tsx)
* **التخطيط:**
  * **خطوات الرحلة الخمس (Right Column):**
    1. احجز موعدك.
    2. التجهيز والتركيب.
    3. المعازيم يسجلون.
    4. الهندسة والتنظيم.
    5. الاستلام والاحتفاظ.
  * **البطاقة التفاعلية المثبتة (Left Column):** مكون [`DecayCard`](file:///d:/asar/packages/UI-components/src/DecayCard/DecayCard.tsx) يتفاعل مع الماوس ويبرز عبارة: *"دفتر الضيوف الورقي يتجعد ويتلف... أما صوت أحبائكم فيبقى حياً ونابضاً للأبد"*.

---

### 08. قسم الأصوات الحقيقية (Real Voices Audio Showcase)
* **المعرف:** `id="voices"`
* **الملف:** [`src/components/sections/RealVoicesSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/RealVoicesSection.tsx)
* **آلية العمل:**
  * فلترة تبويبية حسب الفئة: ("الكل"، "العروسين"، "العائلة"، "الأصدقاء").
  * مشغل صوت نغمي مدمج بواسطة **Web Audio API Harmonic Synthesizer** (يعزف تآلفات نغمية دافئة عند النقر على أي تسجيل صوتي لمحاكاة الاستماع للرسائل في الهاتف).
  * 6 بطاقات واقعية تتضمن أسماء، مدة المقطع، وصور رمزية وعبارات مؤثرة.

---

### 09. قسم المعرض الفوتوغرافي (Gallery Section)
* **المعرف:** `id="gallery"`
* **الملف:** [`src/components/sections/GallerySection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/GallerySection.tsx)
* **التخطيط:** شبكة **Bento Grid** متوازنة تضم صوراً عالية الدقة لزوايا الركن وتفاعل المعازيم مع الهاتف، تتوسطها بطاقة الهوية الملكية العنابية:
  * *"نَاس طَيِّبِين ... أَصْوَات جَمِيلَة ... أَثَـــر يَدُوم"*.

---

### 10. قسم فيديو الهايلايت السينمائي (Video Highlights Section)
* **المعرف:** `id="video"`
* **الملف:** [`src/components/sections/VideoSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/VideoSection.tsx)
* **المزايا:**
  * بطاقة مشغل سينمائي متكامل مع زر تشغيل تفاعلي، شريط تقدم زمني، وعداد ٣٠ ثانية مدمج بنغمات سينمائية عبر Web Audio API.
  * شارات توضيحية لدقة 4K وهندسة الصوت المحيطي المدمج مع تسجيلات الهاتف الحقيقية.

---

### 11. قسم الأسئلة الشائعة (FAQ Section)
* **المعرف:** `id="faq"`
* **الملف:** [`src/components/sections/FAQSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/FAQSection.tsx)
* **الهيكل:** نظام أكورديون تفاعلي يحتوي على 7 أسئلة تفصيلية تشمل آلية التسجيل، سعة الهاتف، توقيت التركيب، مناطق التغطية الجغرافية، مواعيد التسليم، وإجراءات الخصوصية والأمان.

---

### 12. قسم التواصل ومناطق الخدمة (Contact Hub Section)
* **المعرف:** `id="contact"`
* **الملف:** [`src/components/sections/ContactSection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/ContactSection.tsx)
* **المحتوى:**
  * أرقام الخط الساخن والاتصال الهاتفي.
  * البريد الإلكتروني الرسمي.
  * قائمة المحافظات والمناطق المشمولة (الإسكندرية، الساحل الشمالي، العجمي، القاهرة، الجيزة).
  * قنوات التواصل الاجتماعي (إنستغرام، تيك توك، فيسبوك).

---

### 13. قسم ضمان الخصوصية (Privacy Guarantee Banner)
* **الملف:** [`src/components/sections/PrivacySection.tsx`](file:///d:/asar/apps/Booth/src/components/sections/PrivacySection.tsx)
* **الهدف:** توفير طمأنينة كاملة للعروسين والعائلات بأن جميع التسجيلات الصوتية والصور تحفظ في خزانة سحابية خاصة ومشفرة ولا تُنشر أو تُشارك نهائياً إلا بموافقة كتابية مسبقة.

---

### 14. التذييل الفاخر (Editorial Luxury Footer)
* **الملف:** [`src/components/layout/Footer.tsx`](file:///d:/asar/apps/Booth/src/components/layout/Footer.tsx)
* **المظهر:** خلفية فحمية عميقة فاخرة (`#1F1A1C`)، شعار أثر المضيء، الشعار اللفظي *"نفس الأشخاص. أصوات مختلفة. أثر يدوم."*، 8 روابط وصول سريع، والسطر الحقوقي *"أَصْوَات تَصْنَع غَداً أَجْمَل. © ٢٠٢٦ أثر. جميع الحقوق محفوظة."*

---

## 4. نافذة الحجز التفاعلية المتعددة المراحل (Booking Modal)
* **الملف:** [`src/components/sections/BookingModal.tsx`](file:///d:/asar/apps/Booth/src/components/sections/BookingModal.tsx)
* **التحكم والحالة:** يتم إدارتها مركزياً عبر `isBookingOpen` و`selectedPackage` في `App.tsx`.
* **مراحل الحجز (3-Step State Machine):**
  1. **الخطوة 1 — بيانات المناسبة:**
     * اسم العميل، اسم شريك/شريكة الحياة، رقم الواتساب، تاريخ المناسبة، القاعة/المنطقة، وملاحظات خاصة.
  2. **الخطوة 2 — اختيار الباقة والإضافات:**
     * تحديد الباقة ("لحظة أثر" أو "حكاية أثر") مع بطاقات اختيار الإضافات التخصيصية (تسليم سريع، لافتة ترحيبية، ساعات إضافية).
  3. **الخطوة 3 — المراجعة والتأكيد:**
     * جدول ملخص بكافة التفاصيل قبل الإرسال النهائي.
  4. **شاشة التأكيد والنجاح (Confirmation View):**
     * أيقونة التأكيد الخضراء وشارة *"تم استلام طلبكم بنجاح"* مع رسالة التهنئة بالأسماء الشخصية.

---

## 5. جَدْوَل رَبْط مُكَوِّنَات `@repo/ui-components`

| المكون (Component) | موقعه في الموقع (Section) | الدور الوظيفي والتأثير البصري | الخصائص المفتاحية (Key Props) |
| :--- | :--- | :--- | :--- |
| **`CardNav`** | الترويسة المتحركة (Header) | شريط تنقل ذكي يطفو مع التمرير مقسم إلى كروت فاخرة | `items`, `baseColor`, `buttonBgColor`, `menuColor` |
| **`GradientWaves`** | واجهة الهيرو (Hero) | أمواج سائلة ثلاثية الأبعاد بـ WebGL2 تحاكي انسياب الذكريات الصوتية | `horizonColor`, `waveColor`, `crestColor`, `fogDepth={45}`, `height={3.8}` |
| **`Magnet`** | زر الحجز الرئيسي بالهيرو | جذب مغناطيسي ناعم وخفيف للمؤشر يعزز النقر | `magnetStrength={25}`, `padding={25}`, `maxOffset=5` |
| **`CountUp`** | عدادات الإحصائيات (Stats) | عد تصاعدي تراكمي سلس عند وصول المستخدم للقسم | `to`, `duration={2.5}`, `separator=","`, `once={false}` |
| **`SplitText`** | عناوين الأقسام الرئيسية | ظهور متتابع وجميل للكلمات للأعلى لتعزيز القراءة | `animation="fadeUp"`, `splitType="words"`, `once={false}` |
| **`BlurText`** | العنوان الرئيسي والنصوص الشاعرية | تلاشي تدريجي من الضباب إلى الوضوح التام | `animateBy="words"`, `direction="top"`, `once={false}` |
| **`FadeContent`** | حاويات الأقسام والبطاقات | تأثير ضباب خفيف فاخر يزول بانسيابية عند الظهور | `blur={true}`, `duration={1800}`, `once={false}` |
| **`TiltedCard`** | بطاقات الباقات (Packages) | إمالة ثلاثية الأبعاد بصرية متفاعلة مع زوايا الماوس | `scaleOnHover={1.05}`, `rotateAmplitude={8}` |
| **`DecayCard`** | قسم كيف يعمل أثر (How It Works) | بطاقة ذات ملمس ورقي تفاعلي تحاكي الفرق بين الورق والصوت | `width`, `height={500}`, `image` |
| **`GlowCursor`** | مؤشر الشاشة لسطح المكتب | هالة ضوئية دافئة تتبع حركة المؤشر على الشاشات الكبيرة | تفعيل تلقائي على شاشات `lg+` |

---

## 6. نِظَام الأَلْوَان وَالرُّمُوز التَّصْمِيمِيَّة (Design Tokens)

* **الألوان الأساسية للهوية:**
  * **العنابي الملكي (Royal Maroon):** `--athar-maroon: #6B1D28` (الأزرار الرئيسية، الشارات، العناوين الفرعية).
  * **العنابي الداكن (Deep Wine):** `--athar-maroon-dark: #4A0E17` (التدرجات الملكية والأبيات الشعرية).
  * **العاجي الكتاني (Ivory Linen):** `--athar-bg-primary: #FBF7F2` (الخلفية العامة الفاخرة للواجهة).
  * **العاجي الدافئ (Secondary Warm Ivory):** `--athar-bg-secondary: #F5EBE1` (خلفية الأقسام المتبادلة).
  * **الذهب الكلاسيكي (Champagne Gold):** `--athar-gold: #D4AF37` (الأطر الدقيقة، اللمسات الزخرفية، وشارات التميز).
  * **الفحمي الملكي (Dark Espresso):** `--athar-text-title: #231F20` (العناوين الداكنة المقروءة بوضوح).
  * **البني الدافئ الهادئ (Warm Umber):** `--athar-text-muted: #6E6259` (النصوص والفقرات الوصفية).

---

## 7. المَلَفَّات المَصْدَرِيَّة وَالمَرَاجِع (Source References)
1. محتوى الموقع المكتوب كاملاً بصيغة JSON: [`docs/website-content.json`](file:///d:/asar/apps/Booth/docs/website-content.json)
2. مواصفات التصميم الأصلية: [`docs/ASAR_BOOTH_DESIGN_SPEC.md`](file:///d:/asar/docs/ASAR_BOOTH_DESIGN_SPEC.md)
3. ملف التنسيقات العامة: [`src/index.css`](file:///d:/asar/apps/Booth/src/index.css)
4. ملف التطبيق الجذري: [`src/App.tsx`](file:///d:/asar/apps/Booth/src/App.tsx)
