# Athar Booth (Asar) — Complete UI/UX Design & Architecture Specification

> **Workspace:** `apps/Booth` within the `asar` monorepo  
> **Platform Language:** Arabic (اللغة العربية — RTL by default, powered by Cairo & Amiri typography)  
> **Design Standard:** Awwwards-Level Experiential Audio Guestbook Platform  
> **Component System:** `@repo/ui-components` + Chakra UI v3 (`@chakra-ui/react: ^3.32.0`)  
> **Visual References:** `packages/assets-shared/src/screens-booth.jpeg` & `landing-booth.jpeg`  
> **Document Status:** Production-Ready Architectural & Design Specification  
> **Updated:** October 2026

---

## 1. Executive Vision & Brand Concept

### 1.1. Core Narrative
**Athar (أثر) — Audio Guestbook Memories**  
Athar transforms traditional, often-forgotten paper guestbooks into an interactive, multi-sensory luxury installation. Guests at weddings, engagements, anniversaries, and celebratory galas pick up an authentic vintage rotary telephone to hear a personalized greeting from the couple and leave raw, heartfelt voice messages, blessings, and spontaneous bursts of laughter. These recordings are professionally mastered into an everlasting digital and acoustic time capsule.

### 1.2. Editorial Slogans & Micro-Copy (from Visual Assets)
* **Main Hero Headline:** *"More Than A Wedding. A Lasting Athar."*
* **Core Brand Identity:** *"Same People. Different Voices. A Lasting Athar."*
* **Micro-Taglines:**
  * *"Leave a voice. Create a memory."*
  * *"Voices of today ... memories of tomorrow."*
  * *"خلي صوتهم أثر في حكايتكم."*
  * *"Your story sounds more beautiful with the people you love."*
  * *"Voices Create a Kinder Tomorrow."*
  * *"Thirty seconds. A lifetime of feeling."*

---

## 2. Global Design System, Color Tokens & Typography

The design language embodies **Warm Vintage Editorial Luxury** — evoking the tactile intimacy of handwritten stationery, warm candlelit receptions, polished ivory and brass rotary telephones, and high-fashion editorial typography.

### 2.1. Color Tokens & CSS Variables

| Token Name | Hex Code | Visual Application | Emotional Impact |
| :--- | :--- | :--- | :--- |
| **Royal Maroon** | `#6B1D28` | Primary CTA buttons, brand badges, active accents | Passion, gravitas, regal luxury |
| **Deep Burgundy** | `#5B1621` | Button hover states, drawer backgrounds, headings | Rich, grounding depth |
| **Burgundy Glow** | `rgba(107, 29, 40, 0.16)` | Ambient backdrops, card halos, focus rings | Subtle warmth and optical elevation |
| **Warm Alabaster** | `#FBF7F2` | Global page background | Soft on the eyes, feels like handmade cotton rag paper |
| **Linen Cream** | `#F4EFEA` / `#EDE6DC` | Secondary card fills, timeline tracks, subtle borders | Natural warmth without harsh contrasts |
| **Champagne Gold** | `#D4AF37` / `#C5A059` | Audio visualizer waves, icon highlights, VIP tags | Celebratory elegance, precious memories |
| **Deep Espresso** | `#231F20` | Primary headlines and high-emphasis body text | Editorial contrast superior to stark pitch-black |
| **Soft Truffle** | `#7A6F6D` / `#8C817E` | Metadata, captions, step numerals, timestamps | Harmonious secondary optical hierarchy |
| **Frosted Glass** | `rgba(255, 255, 255, 0.85)` | Sticky header, floating `CardNav`, modal sheets | Modern translucency with physical presence |

```css
:root {
  --athar-maroon: #6B1D28;
  --athar-maroon-dark: #5B1621;
  --athar-maroon-glow: rgba(107, 29, 40, 0.16);
  --athar-gold: #D4AF37;
  --athar-gold-light: #F1E5D1;
  --athar-bg-primary: #FBF7F2;
  --athar-bg-secondary: #F4EFEA;
  --athar-card-bg: rgba(255, 255, 255, 0.85);
  --athar-card-border: rgba(107, 29, 40, 0.08);
  --athar-text-title: #231F20;
  --athar-text-body: #4A4240;
  --athar-text-muted: #7A6F6D;
  --athar-radius-sm: 8px;
  --athar-radius-md: 16px;
  --athar-radius-lg: 24px;
  --athar-radius-full: 9999px;
  --athar-shadow-soft: 0 10px 30px -10px rgba(107, 29, 40, 0.06);
  --athar-shadow-elevated: 0 24px 48px -12px rgba(107, 29, 40, 0.12);
}
```

### 2.2. Typography System (Arabic Luxury Editorial)
* **Primary Editorial & Classical Display Font:** **`Amiri`** / **`Aref Ruqaa`** (Weights: 400 Regular, 700 Bold, Italic) for Arabic headlines, hero statements, and poetic accents.
* **Modern Interface & Body Arabic Sans-Serif Font:** **`Cairo`** (Weights: 400 Regular, 500 Medium, 600 SemiBold, 700 Bold, 800 ExtraBold, 900 Black) for clean, legible Arabic micro-copy, navigation, and cards.
* **Secondary Latin Display Accent Font:** **`Playfair Display`** (Weights: 600 SemiBold, 700 Bold) for English brand marks.

---

## 3. Structural Landing Page Architecture

The landing page follows a continuous, experiential narrative flow built with **Chakra UI v3** layout components and animated with interactive components from **`@repo/ui-components`**:

```
[00. Adaptive Dual Header: Static Top Bar  ──(on scroll)──>  Floating CardNav]
                                     ↓
[01. Fullscreen Hero Section (100vh) with BlurText & FadeContent (mist)]
                                     ↓
[02. Counters & Proof Metrics with CountUp & SplitText (from Screen 1)]
                                     ↓
[03. "More Than A Phone" Narrative with DitherVeil (wander, reverse) & SplitText]
                                     ↓
[04. "Why Choose Us" with Sticky CircularGallery & Chakra Accordion]
                                     ↓
[04.5. Romantic Ghazal Poetic Verse with BlurText Interlude]
                                     ↓
[05. Our Packages Showcase with FadeContent (mist) & TiltedCard]
                                     ↓
[06. Bespoke Add-ons & Custom Styling Matrix ("Make It Yours")]
                                     ↓
[07. How It Works: 5-Step Journey & Interactive PaperCrumple]
                                     ↓
[08. Real Voices: Audio Waveform Player with FadeContent Filter Pills]
                                     ↓
[09. Moments Around The Phone: Photo Masonry with DecayCard Physics]
                                     ↓
[10. Video Highlights: 30-Second Cinematic Reel with ScrollExpand]
                                     ↓
[11. Frequently Asked Questions: Chakra UI Accordion]
                                     ↓
[12. Multi-Step Interactive Booking Engine (Details → Package → Confirm)]
                                     ↓
[13. Booking Confirmation & Celebration Modal ("Your Request Has Been Sent!")]
                                     ↓
[14. Contact Hub, Regional Coverage Map (Alexandria, Cairo) & Socials]
                                     ↓
[15. Privacy & Cloud Vault Guarantee ("Your Memories Are Yours")]
                                     ↓
[16. Emotional Poetic 404 Experience]
```

---

## 4. In-Depth Section Specifications

### Header & Navigation: Adaptive Dual-State System

#### State A: Top-of-Page Static Header
* **Initial State:** Static navbar positioned at the top of the viewport over the warm alabaster hero background (`position: absolute; top: 0; left: 0; width: 100%; z-index: 40;`).
* **Layout Structure (`Chakra Flex`):**
  * **Left (Brand Anchor):** High-resolution logo mark (`logo-main.png` / `logo.jpeg`) accompanied by delicate typography (`ATHAR AUDIO MEMORIES`).
  * **Center (Editorial Nav Links):** Inline navigation links (`About`, `Why Us`, `Packages`, `How It Works`, `Real Voices`, `Gallery`, `FAQ`) styled with `Plus Jakarta Sans`, subtle hover underlines, and smooth opacity transitions.
  * **Right (Action Group):**
    * **WhatsApp Direct Button:** Soft gold border outline with telephone icon, linking directly to the Athar concierge.
    * **"Book Date" Button:** Signature Royal Maroon pill button (`bg="#6B1D28"`, `color="#FFF"`, `borderRadius="full"`) with micro-spring hover scaling (`transform: translateY(-2px)`).

#### State B: Scrolled Floating `CardNav`
* **Trigger:** When the user scrolls past `120px`, the static header smoothly fades out via CSS transition, and the **`CardNav`** component animates into view.
* **Component:** **`CardNav`** from `@repo/ui-components`.
* **Dock Design:**
  * Floating island container docked near the top (`top: 24px`) or floating bottom center, featuring frosted glassmorphism (`background: rgba(255, 255, 255, 0.88)`, `backdropFilter: blur(16px)`, `border: 1px solid rgba(107, 29, 40, 0.12)`, `boxShadow: 0 20px 40px -10px rgba(107, 29, 40, 0.15)`).
  * Contains compact icon + text links to primary sections, active section indicator, and a mini `"Book Date"` button.
  * Responsive collapsing: On mobile viewports (`< 768px`), collapses to a clean pill bar with brand logo, WhatsApp icon, and a slide-over mobile drawer matching Screen 13 of `screens-booth.jpeg`.

---

### Section 01: Hero Section (100vh Fullscreen Showcase)

```
+--------------------------------------------------------------------------+
|  [Static Top Header / Logo / Links / WhatsApp & Book CTA]               |
+--------------------------------------------------------------------------+
|                                                                          |
|   TAG (Badge): "AUDIO GUESTBOOK FOR MEANINGFUL CELEBRATIONS"             |
|                                                                          |
|   TITLE (BlurText):                                                      |
|   "More Than A Wedding. A Lasting Athar."                                |
|                                                                          |
|   DESCRIPTION (BlurText):                                                |
|   "An audio guestbook experience that captures the voices, laughter,     |
|    and blessings of the people you love."                                |
|                                                                          |
|   FLEX OF TWO BUTTONS:                                                   |
|   [ Book Your Date -> (Magnet) ]    [ Watch Video |> (Glass) ]           |
|                                                                          |
|   HERO IMAGE (FadeContent once={false} effect="mist"):                   |
|   +------------------------------------------------------------------+   |
|   |  booth-hero-photo.webp (Ivory vintage phone, candle, roses)      |   |
|   |  [CircularText: • LEAVE A VOICE • CREATE A MEMORY •]             |   |
|   +------------------------------------------------------------------+   |
+--------------------------------------------------------------------------+
```

* **Chakra Container:** `<Box as="section" h="100vh" w="100%" position="relative" display="flex" alignItems="center" justifyContent="center" bg="var(--athar-bg-primary)" overflow="hidden">`.
* **Atmospheric Wave Background:** Subtle background gradient waves (**`GradientWaves`**) simulating warm acoustic frequencies in champagne gold (`#D4AF37`) and deep maroon (`#6B1D28`).
* **Hero Title & Description (via `BlurText`):**
  * Title: *"More Than A Wedding. A Lasting Athar."* (Rendered with **`BlurText`**, `delay={120}`, `animateBy="words"`, `direction="top"`).
  * Description: *"An audio guestbook experience that captures the voices, laughter, and blessings of the people you love."* (Rendered with **`BlurText`**, `delay={80}`, `animateBy="words"`).
* **Flex of Two Buttons:**
  * Chakra `<HStack gap={4} justify="center">`:
    * **Button 1 (Primary):** `"Book Your Date →"` styled with Royal Maroon fill (`bg="#6B1D28"`, `color="#FFFFFF"`, `px={8}`, `py={4}`, `borderRadius="full"`) wrapped in **`Magnet`** for physical cursor pull.
    * **Button 2 (Secondary):** `"Watch Video ▷"` styled with frosted linen border (`border="1px solid rgba(107,29,40,0.2)"`, `bg="rgba(255,255,255,0.7)"`, `color="#231F20"`, `borderRadius="full"`).
* **Hero Image Presentation (via `FadeContent`):**
  * Asset: `packages/assets-shared/src/booth-hero-photo.webp` (high-res image showing the cream vintage rotary telephone, candle pillars, dried floral runner, and warm ambiance).
  * Wrapped in **`FadeContent`** with props:
    * `once={false}`
    * `effect="mist"`
    * `duration={1.2}`
  * An ethereal mist/cloud reveal activates whenever the image scrolls into the viewport.
  * Overlaid with spinning **`CircularText`** badge in the corner: `• LEAVE A VOICE • CREATE A MEMORY • ATHAR AUDIO •`.

---

### Section 02: Flex of Counters (Proof of Trust & Emotion)

```
+--------------------------------------------------------------------------+
|  SECTION TITLE (SplitText once={false}):                                 |
|  "Voices of Today ... Memories of Tomorrow"                              |
|                                                                          |
|  SECTION SUBTITLE (SplitText once={false}):                              |
|  "Real people, unfiltered tears of joy, and blessings captured for a      |
|   lifetime across unforgettable celebrations."                           |
|                                                                          |
|  FLEX OF COUNTERS (CountUp once={false}):                                |
|  +-----------------------+ +-----------------------+ +-----------------+ |
|  |       100+            | |        5,000+         | |      100%       | |
|  |   Happy Couples       | |  Real Voices Recorded | | A Kinder        | |
|  |                       | |                       | |   Tomorrow      | |
|  +-----------------------+ +-----------------------+ +-----------------+ |
+--------------------------------------------------------------------------+
```

* **Data Sourced Directly from `screens-booth.jpeg` (Screen 1):**
  1. `+ 100+ Happy Couples`
  2. `+ 5,000+ Real Voices Recorded` (Screen 1: `Real Voices`)
  3. `+ 100% Meaningful Memories` (Screen 1: `A Kinder Tomorrow`)
* **Chakra Container:** `<Box as="section" py={{ base: 16, md: 24 }} px={{ base: 6, lg: 16 }} bg="var(--athar-bg-secondary)">`.
* **Title & Description (via `SplitText` with `once={false}`):**
  * Title: *"Voices of Today ... Memories of Tomorrow"*
  * Description: *"Real people, unfiltered tears of joy, and blessings captured for a lifetime across unforgettable celebrations."*
  * Animation: Staggered spring letter/word ascent that re-animates smoothly on re-entry (`once={false}`).
* **Counters Flex Container:**
  * Chakra `<SimpleGrid columns={{ base: 1, md: 3 }} gap={8} maxW="1100px" mx="auto">`:
    * **Counter Card 1:**
      * Component: **`CountUp`** with `to={100}`, `plus={true}`, `once={false}`, `duration={2.5}`.
      * Label: *"Happy Couples Who Trusted Athar"*
    * **Counter Card 2:**
      * Component: **`CountUp`** with `to={5400}`, `plus={true}`, `once={false}`, `duration={3}`.
      * Label: *"Real Voice Messages Recorded"*
    * **Counter Card 3:**
      * Component: **`CountUp`** with `to={100}`, `suffix="%"`, `once={false}`, `duration={2}`.
      * Label: *"Meaningful Memories & A Kinder Tomorrow"*
  * **Card Styling:** Soft ivory fill (`bg="white"`), delicate border (`1px solid rgba(107, 29, 40, 0.08)`), rounded corners (`borderRadius="24px"`), and subtle elevation shadow.

---

### Section 03: "More Than A Phone" Narrative Section

```
+--------------------------------------------------------------------------+
|  GRID: TWO COLUMNS (50% / 50% on Desktop, Stacked on Mobile)             |
|                                                                          |
|  LEFT COLUMN:                               RIGHT COLUMN:                |
|  +--------------------------------+         +--------------------------+ |
|  | IMAGE: love-wedding.jpg        |         | TAG: ABOUT ATHAR         | |
|  |                                |         |                          | |
|  | COMPONENT: DitherVeil          |         | HEADLINE (SplitText):    | |
|  | - wander={true}                |         | "More Than A Phone"      | |
|  | - reverse={true}               |         |                          | |
|  | - pattern="floyd"              |         | BODY (SplitText):        | |
|  | - inkColor="#1F1A1C"           |         | "Athar is a heartfelt    | |
|  | - paperColor="#FBF7F2"         |         |  experience that         | |
|  | - rimColor="#D4AF37"           |         |  captures the voices..." | |
|  |                                |         |                          | |
|  | (1-bit retro dither stipple    |         | 3 PILLARS:               | |
|  |  dissolves to full color photo |         | ♥ Human Stories          | |
|  |  on hover/cursor interaction)  |         | 👏 Meaningful Memories    | |
|  +--------------------------------+         | 🪷 Egyptian at Heart     | |
|                                             |                          | |
|                                             | QUOTE CARD:              | |
|                                             | "Your story sounds more  | |
|                                             |  beautiful with the      | |
|                                             |  people you love."       | |
|                                             +--------------------------+ |
+--------------------------------------------------------------------------+
```

* **Chakra Container:** `<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 12, lg: 16 }} alignItems="center" maxW="1280px" mx="auto" py={{ base: 16, md: 24 }} px={{ base: 6, lg: 12 }}>`.
* **Left Column (Visual Centerpiece via `DitherVeil`):**
  * **Asset:** `packages/assets-shared/src/love-wedding.jpg` (romantic couple holding the ivory rotary phone).
  * **Component:** **`DitherVeil`** from `@repo/ui-components`.
  * **Configuration Props:**
    * `wander={true}`
    * `reverse={true}`
    * `pattern="floyd"`
    * `inkColor="#1F1A1C"`
    * `paperColor="#FBF7F2"`
    * `rimColor="#D4AF37"`
    * `noise={0.15}`
  * **User Experience:** The image begins rendered in an artistic 1-bit vintage dithered stipple pattern. As the visitor moves their mouse or drags their finger across the canvas, the dither dissolves ("burns through") to reveal the rich, warm wedding photograph in full color, gracefully re-stippling back into position when the cursor leaves.
* **Right Column (Editorial Storytelling via `SplitText`):**
  * Headline: *"More Than A Phone"* (Screen 02 / About).
  * Narrative Body (animated with **`SplitText`**):
    > *"Athar is a heartfelt experience that captures the voices, laughter and blessings of your loved ones, turning moments into memories you can hear forever."*
  * **3 Core Emotional Pillars (from Screen 02):**
    1. **Human Stories:** Real, candid voice recordings filled with humor, warmth, and heartfelt prayers.
    2. **Meaningful Memories:** Preserving how loved ones sounded at this exact chapter of life.
    3. **Egyptian at Heart:** Warm Egyptian hospitality, tailored to modern cultural celebrations.
  * **Quote Card:**
    > *"Your story sounds more beautiful with the people you love."*
    Rendered with Cormorant Garamond italic serif and champagne gold quotation marks.

---

### Section 04: "Why Choose Us" (Sticky Circular Gallery + Interactive Accordion)

```
+--------------------------------------------------------------------------+
|  SECTION: "Why Choose Athar"                                             |
|                                                                          |
|  +--------------------------------+  +--------------------------------+  |
|  | LEFT COLUMN: STICKY            |  | RIGHT COLUMN: SCROLLABLE       |  |
|  | (position: sticky; top: 120px) |  |                                |  |
|  |                                |  | Accordion Item 1:              |  |
|  | [ CircularGallery ]            |  | Raw Emotion Over Stiff Words   |  |
|  | Rotating 3D wedding images     |  |                                |  |
|  | (online wedding photos +       |  | Accordion Item 2:              |  |
|  |  wedding2.jpg) with romantic   |  | White-Glove On-Site Host       |  |
|  |  love badges                   |  |                                |  |
|  |                                |  | Accordion Item 3:              |  |
|  | * Sticky strictly for the      |  | Studio-Grade Audio Mastering   |  |
|  |   duration of the right column |  |                                |  |
|  |   accordion scrolling! *       |  | Accordion Item 4:              |  |
|  |                                |  | Bespoke Vintage Styling        |  |
|  |                                |  |                                |  |
|  |                                |  | Accordion Item 5:              |  |
|  |                                |  | Private Cloud Memory Vault     |  |
|  +--------------------------------+  +--------------------------------+  |
+--------------------------------------------------------------------------+
|                                                                          |
|  POETIC GHAZAL INTERLUDE (BlurText):                                     |
|  "صوتُكِ رَوْضٌ إذا ما نَسيمُهُ هَبَّ، انْجَلَتْ عَن فُؤادي كُلُّ أشْجانِهِ"           |
|  "Your voice is a sanctuary; when its melody echoes,                      |
|   every sorrow within my heart dissolves into beauty."                    |
|                                                                          |
+--------------------------------------------------------------------------+
```

* **Layout & Sticky Mechanic (`Chakra Grid`):**
  * `<Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={{ base: 10, lg: 16 }} position="relative" alignItems="start">`.
  * **Left Column:** Styled with `position="sticky"`, `top="120px"`, `alignSelf="start"`.
  * **Sticky Lifetime Rule:** Because the parent grid container's height is determined by the total height of the Right Column accordion items, the sticky `CircularGallery` remains locked in the user's viewport **exclusively from the moment the right column starts until the user scrolls past the 5th accordion item**. When the accordion ends, the gallery scrolls away naturally with the page.
* **Left Column Component (`CircularGallery`):**
  * Component: **`CircularGallery`** from `@repo/ui-components`.
  * **Image Sourcing:** Curated collection of high-fashion editorial wedding photographs (combining local `packages/assets-shared/src/wedding2.jpg` and online curated wedding photography: candid laughing brides, rotary phone close-ups, romantic candlelit vows, and grandparent hugs).
  * **Interactive Experience:** Smooth 3D circular cylinder carousel rotating gently on auto-drift, allowing the user to drag horizontally to inspect different wedding memories. Overlaid with floating love badges:
    * *"• Hear Their Smile •"*
    * *"• Thirty Seconds. A Lifetime of Feeling. •"*
    * *"• Pure Spontaneous Joy •"*
* **Right Column (Chakra UI v3 Accordion):**
  * Expandable accordion items with smooth height transitions, gold borders, and chevron animations:
    1. **Raw Emotion Over Stiff Signatures:** Unlike traditional paper guestbooks where guests struggle to write formal well-wishes, picking up an authentic rotary telephone elicits unscripted humor, singing, emotional tears, and blessings.
    2. **Dedicated On-Site Concierge Host:** An Athar representative is stationed at the table throughout your celebration to welcome guests, explain the phone, assist older relatives, and ensure seamless recordings.
    3. **Studio-Grade Acoustic Mastering:** Every single recording is cleaned by professional sound engineers to remove loud venue music, reverberation, and room noise while preserving warm analog telephone tone.
    4. **Bespoke Vintage Aesthetics & Custom Signage:** Not just a phone — a full luxury centerpiece tailored to your wedding decor with antique lace runners, ivory candle pillars, brass frames, and personalized welcome signage.
    5. **Forever Private Cloud Memory Vault:** Enjoy 1 full year of private encrypted cloud hosting, instant audio streaming, lossless high-res file downloads, and shareable social sound bites for family and friends.

#### Poetic Ghazal Interlude (شعر عربي فيه غزل)
* Positioned directly beneath Section 04 as an emotional and visual pause.
* **Component:** Rendered using **`BlurText`** (`animateBy="words"`, `direction="bottom"`, `delay={100}`).
* **Classical Arabic Verse:**
  > *«صوتُكِ رَوْضٌ إذا ما نَسيمُهُ هَبَّ، انْجَلَتْ عَن فُؤادي كُلُّ أشْجانِهِ»*
* **English Translation:**
  > *"Your voice is a sanctuary; when its melody echoes, every sorrow within my heart dissolves into beauty."*
* **Visual Treatment:** Set in classical Arabic calligraphy font (`Amiri` / `Aref Ruqaa`, 28px) paired with Cormorant Garamond italic serif, flanked by thin champagne gold ornamental flourishes (`#D4AF37`) over a warm alabaster background.

---

### Section 05: Our Packages (Thoughtfully Designed for Your Special Day)

```
+--------------------------------------------------------------------------+
|  SECTION: "Our Packages"                                                 |
|  SUBTITLE: "Thoughtfully designed for your special day."                 |
|                                                                          |
|  WRAPPER: FadeContent (once={false}, effect="mist")                      |
|                                                                          |
|  +--------------------------------+  +--------------------------------+  |
|  | PACKAGE 1: ATHAR MOMENT        |  | PACKAGE 2: ATHAR STORY         |  |
|  | BADGE: [ Most Popular ]        |  | BADGE: [ Complete Experience ] |  |
|  | PRICE: 5,500 EGP               |  | PRICE: 7,000 EGP               |  |
|  |                                |  |                                |  |
|  | COMPONENT: TiltedCard          |  | COMPONENT: TiltedCard          |  |
|  |                                |  |                                |  |
|  | ✓ 3 hours (launch offer)       |  | ✓ 6 hours (all evening)        |  |
|  | ✓ Audio phone & styled setup   |  | ✓ Premium setup & styling      |  |
|  | ✓ Athar representative         |  | ✓ QR Code for guests           |  |
|  | ✓ Transport (Zone A)           |  | ✓ 30-sec highlight video       |  |
|  | ✓ Edited audio memories        |  | ✓ Edited audio memories        |  |
|  | ✓ Digital invitation (Gift)    |  | ✓ Digital invitation (Gift)    |  |
|  | ✓ Private memory page (1 year) |  | ✓ Private memory page (1 year) |  |
|  |                                |  |                                |  |
|  | [ Choose This Package -> ]     |  | [ Choose This Package -> ]     |  |
|  +--------------------------------+  +--------------------------------+  |
|                                                                          |
|  [ Compare Packages Detailed Breakdown -> ]                             |
+--------------------------------------------------------------------------+
```

* **Visual Asset Match:** Faithfully represents Screen 03 of `screens-booth.jpeg` and Screen 04 of `landing-booth.jpeg`.
* **Presentation Wrapper:** Wrapped in **`FadeContent`** with `once={false}` and `effect="mist"`, generating an ethereal cloud-like entrance whenever the package grid enters the viewport.
* **Layout (`Chakra SimpleGrid`):** `<SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} maxW="1100px" mx="auto">`.
* **Card Interactivity:** Each package card is wrapped in **`TiltedCard`** from `@repo/ui-components`, providing 3D mouse parallax tilt with smooth perspective glare.

#### Package 1: "Athar Moment" (لحظة أثر) — *Most Popular Choice*
* **Price:** `5,500 EGP`
* **Badge:** `"Most Popular"` in gold lettering on Royal Maroon pill.
* **Feature Inclusions (from Screen 03):**
  * ✓ 3 hours of active celebration coverage (launch offer)
  * ✓ Vintage rotary audio telephone & styled station setup
  * ✓ Dedicated Athar representative on-site throughout the celebration
  * ✓ Transportation & setup included (Zone A: Alexandria, Agami, North Coast)
  * ✓ Professionally mastered and noise-filtered audio memories
  * ✓ Digital invitation audio gift
  * ✓ Private online memory page (1 full year)
* **Action Button:** `"Choose This Package →"` (Royal Maroon button).

#### Package 2: "Athar Story" (حكاية أثر) — *The Complete Experience*
* **Price:** `7,000 EGP`
* **Badge:** `"The Full Story"` in deep burgundy on gold outline.
* **Feature Inclusions (from Screen 03):**
  * ✓ 6 hours of full celebration coverage (all evening)
  * ✓ Premium bespoke setup & styling with custom dried florals & candle pillars
  * ✓ Custom QR code cards for guest tables
  * ✓ 30-second cinematic highlight video combining footage + guest voiceovers
  * ✓ Professionally mastered and noise-filtered audio memories
  * ✓ Digital invitation audio gift
  * ✓ Private online memory vault with high-res lossless downloads
* **Action Button:** `"Choose This Package →"` (Deep Burgundy button).

---

### Section 06: Bespoke Add-ons & Custom Styling ("Make It Yours")

* **Visual Asset Match:** Screen 04 of `screens-booth.jpeg`.
* **Heading:** *"Make It Yours"* | **Subtitle:** *"Add little touches to create a bigger feeling."*
* **Chakra Responsive Grid:** `<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={6}>`.
* **Add-on Catalog Items:**
  1. **First Extra Hour:** `1,500 EGP` (Extended celebration time).
  2. **Subsequent Extra Hours:** `500 EGP / hour` (For late-night afterparties).
  3. **Express Audio Delivery:** `500 EGP` (Mastered files delivered within 48 hours).
  4. **Custom Calligraphy Welcome Sign:** `500 EGP` (Personalized keepsake sign with couple's names).
  5. **Custom Floral runner & Neon Accents:** Contact Us (Bespoke styling tailored to event floral designer).
* **WhatsApp Concierge Banner:**
  * Box banner: *"Need Something Special? We'll be happy to create a custom setup for you."*
  * Button: `"Chat With Us →"` triggering WhatsApp direct concierge.

---

### Section 07: How It Works (Simple Steps. A Lifetime of Memories.)

* **Visual Asset Match:** Screen 05 of `screens-booth.jpeg` and Screen 07 of `landing-booth.jpeg`.
* **5-Step Numbered Journey:**
  1. **Book Your Date:** Tell us your date, venue, and package.
  2. **We Set Up:** We handle transport, complete setup, and vintage station styling.
  3. **Guests Record:** Your loved ones pick up the phone and leave voice messages after the tone.
  4. **We Organize:** Audio engineers edit, filter background noise, and prepare your audio memories.
  5. **You Receive:** Get your private online memory vault within 10–14 days.
* **Interactive Contrast Component (`PaperCrumple`):**
  * Embedded below the 5-step journey: **`PaperCrumple`** from `@repo/ui-components`.
  * Allows visitors to click, drag, and crumple a realistic 3D paper guestbook sheet.
  * Editorial takeaway: *"Paper guestbooks tear, stain, and get forgotten in drawers. Spoken voices last forever."*

---

### Section 08: Real Voices (Waveform Audio Showcase)

* **Visual Asset Match:** Screen 06 of `screens-booth.jpeg` and Screen 08 of `landing-booth.jpeg`.
* **Filter Pills (via `FadeContent`):** `All` · `Couples` · `Family` · `Friends`.
* **Real Voice Audio Cards (with Interactive Waveform):**
  1. **Nour (Best Friend):** `0:42` — *"Mabrook ya gameela... It felt like having everyone with us again."*
  2. **Ahmed (Brother):** `1:12` — *"Stay this happy always..."*
  3. **Mona (Cousin):** `0:38` — *"...بنحبكم جدا وألف مبروك"*
  4. **Tarek (Colleague):** `0:55` — *"It was an honor to celebrate with you both."*
  5. **Grandma (Family):** `1:08` — *"...ربنا يسعدكم ويحفظكم يا رب"*
* **Player UI:** Vintage rotary phone sound effect plays upon pressing Play, followed by real voice playback with animated champagne gold waveform frequencies.

---

### Section 09: Moments Around The Phone (Candid Photo Gallery)

* **Visual Asset Match:** Screen 07 of `screens-booth.jpeg` and Screen 06 of `landing-booth.jpeg`.
* **Heading:** *"Moments Around The Phone"* | **Subtitle:** *"Real photos from our events."*
* **Bento / Masonry Grid:** Authentic photos of guests laughing, crying, hugging, and dialing the phone.
* **Physics Component (`DecayCard`):**
  * Select photos are rendered as interactive polaroids via **`DecayCard`** from `@repo/ui-components`.
  * Visitors can grab, drag, and fling the photos across the section with realistic inertia and friction physics.

---

### Section 10: Video Highlights (30 Seconds. A Lifetime of Feeling.)

* **Visual Asset Match:** Screen 08 of `screens-booth.jpeg`.
* **Headline:** *"30 seconds. A lifetime of feeling."*
* **Video Showcase Reel:** High-definition cinematic reel merging visual wedding video portraits with real recorded guest voiceovers (*"Same People. Different Voices."*).
* **Scroll-Bound Expansion Component (`ScrollExpand`):**
  * The video player starts as a centered card (600px wide) and expands smoothly to 100% viewport width as the user scrolls into the section.

---

### Section 11: Frequently Asked Questions (FAQ)

* **Visual Asset Match:** Screen 09 of `screens-booth.jpeg`.
* **Chakra UI v3 Accordion Items:**
  1. **What is Athar?** (An interactive vintage audio guestbook telephone where guests leave spoken messages).
  2. **How many messages will we get?** (Unlimited recording capacity throughout your booking duration).
  3. **How long is the setup?** (Our team arrives 1.5 to 2 hours prior to guest arrival).
  4. **Do you cover my area?** (Alexandria, Agami, North Coast, Cairo, Giza, and destination celebrations).
  5. **When will we receive the recordings?** (10–14 days standard; 48 hours with Express Delivery).
  6. **Can we customize the design?** (Yes, custom welcome signs, floral styling, and telephone color options).
  7. **Is our privacy protected?** (100% encrypted cloud vault; audio is never shared publicly without written consent).
* **Help Desk Card:** *"Still have a question? We're here to help."* → `"Chat on WhatsApp →"`.

---

### Section 12: Multi-Step Interactive Booking Engine ("Book Your Date")

* **Visual Asset Match:** Screen 10 of `screens-booth.jpeg`.
* **Chakra Multi-Step Stepper (3 Stages):**
  * **Stage 1 (Details):** Your Name, Partner's Name, WhatsApp Phone Number, Event Date, Venue / Area (Alexandria, North Coast, Cairo), Special Notes.
  * **Stage 2 (Package):** Select Package (Athar Moment vs. Athar Story) + Add-ons checklist.
  * **Stage 3 (Confirm):** Pricing breakdown summary & submission to Appwrite Database.

---

### Section 13: Booking Confirmation & Celebration Modal

* **Visual Asset Match:** Screen 11 of `screens-booth.jpeg`.
* **State Trigger:** Displays upon successful form submission.
* **Content:**
  * Animated calendar checkmark icon.
  * Headline: *"Your Request Has Been Sent!"*
  * Message: *"Thank you, Mina & Maryam. We'll get back to you shortly to confirm your date. We can't wait to be part of your special day."*
  * Button: `"Back to Home"`.
  * Slogan Footer: *"Voices Create a Kinder Tomorrow."*

---

### Section 14: Contact Hub & Regional Coverage Map ("Get in Touch")

* **Visual Asset Match:** Screen 12 of `screens-booth.jpeg`.
* **Contact Details:**
  * Phone & WhatsApp hotline: `0100 000 0000`
  * Email: `hello@athar.audio`
  * Regional Coverage: Alexandria, Egypt · Agami · North Coast · Cairo
* **Visual Map Card:** Styled regional map with glowing Alexandria pin.
* **Social Links:** Instagram, Facebook, TikTok, YouTube.

---

### Section 15: Privacy & Cloud Vault Guarantee ("Your Memories Are Yours")

* **Visual Asset Match:** Screen 14 of `screens-booth.jpeg`.
* **Icon:** Security padlock in champagne gold.
* **Heading:** *"Your Memories Are Yours"*
* **Statement:** *"Your recordings, photos and videos are private and will never be shared without your explicit permission."*
* **Links:** Privacy Policy, Terms of Service, Data & Security.

---

### Section 16: Emotional Poetic 404 Experience

* **Visual Asset Match:** Screen 15 of `screens-booth.jpeg`.
* **Artwork:** Large vintage 404 serif lettering with delicate floral botanical wreath.
* **Copy:** *"This Page Seems Lost... But beautiful memories are always found."*
* **Action:** `"Back to Home →"`.

---

## 5. Comprehensive `@repo/ui-components` Mapping Matrix

| # | Component | Target Section | Interaction & Functional Role | Props Configuration |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **`CardNav`** | Global Navigation | Floating island nav dock appearing on scroll past hero with quick section links and Book CTA. | `items={navLinks}`, `activeSection`, `onBookClick` |
| **2** | **`BlurText`** | Hero Section & Ghazal Interlude | Staggered blur-in word reveal for the hero headline, subtitle, and classical Arabic love poetry. | `animateBy="words"`, `direction="top"`, `delay={100}` |
| **3** | **`FadeContent`** | Hero Image & Packages | Ethereal mist/cloud reveal for `booth-hero-photo.webp` and package cards. | `once={false}`, `effect="mist"`, `duration={1.2}` |
| **4** | **`CountUp`** | Section 02: Stats Counter | Fluid numeric counter for `100+`, `5,000+`, and `100%` metrics from Screen 1. | `to={value}`, `plus={true}`, `once={false}` |
| **5** | **`SplitText`** | Section 02 & Section 03 | Splits headlines and narrative copy with spring letter reveals on viewport entry. | `once={false}`, `stagger={0.03}` |
| **6** | **`DitherVeil`** | Section 03: "More Than A Phone" | 1-bit vintage dither pattern on `love-wedding.jpg` dissolving to full color on cursor touch. | `wander={true}`, `reverse={true}`, `pattern="floyd"` |
| **7** | **`CircularGallery`** | Section 04: "Why Choose Us" | Sticky rotating 3D wedding image carousel anchored beside the scrollable accordion items. | `images={weddingImages}`, `bend={3}`, `textColor="#D4AF37"` |
| **8** | **`TiltedCard`** | Section 05: Packages | 3D perspective mouse-tracking tilt with glossy surface reflection. | `maxTilt={12}`, `glare={true}`, `scale={1.02}` |
| **9** | **`PaperCrumple`** | Section 07: How It Works | Interactive 3D paper sheet that users can crumple, contrasting paper with voice permanence. | `texture="rag-paper"`, `crumpleStrength={0.8}` |
| **10** | **`DecayCard`** | Section 09: Photo Gallery | Draggable polaroid-style photos with physical inertial decay and fling physics. | `decay={0.92}`, `boundary={true}` |
| **11** | **`ScrollExpand`** | Section 10: Video Highlights | Cinematic video card expanding to full viewport width on scroll. | `startWidth="600px"`, `endWidth="100%"` |
| **12** | **`CircularText`** | Hero Phone Badge | Continuously spinning circular badge around the hero telephone. | `text="• LEAVE A VOICE • CREATE A MEMORY •"`, `spinDuration={18}` |
| **13** | **`Magnet`** | Primary CTAs & Play Triggers | Cursor attraction physics pulling primary action buttons toward the pointer. | `strength={0.25}`, `radius={80}` |
| **14** | **`GradientWaves`** | Atmospheric Backgrounds | Smooth acoustic waveform simulation in champagne gold and royal maroon. | `colors={["#6B1D28", "#D4AF37", "#FBF7F2"]}` |
| **15** | **`RotatingText`** | Hero Sub-features | Dynamic cycling words: *"Capturing [voices \| laughter \| blessings \| happy tears]"*. | `words={["voices", "laughter", "blessings"]}` |
| **16** | **`GlowCursor`** | Desktop Global Cursor | Subtle warm champagne halo trailing the pointer and expanding over interactive audio buttons. | `color="rgba(212, 175, 55, 0.25)"`, `size={32}` |

---

## 6. Technical Component Hierarchy & Folder Architecture (`apps/Booth`)

```
apps/Booth/src/
├── assets/
│   ├── booth-hero-photo.webp        # Hero telephone centerpiece
│   ├── love-wedding.jpg             # DitherVeil wedding couple portrait
│   ├── wedding2.jpg                 # CircularGallery rotating asset
│   ├── logo-main.png / logo.jpeg    # High-resolution brand marks
│   ├── screens-booth.jpeg           # Full UX reference
│   └── landing-booth.jpeg           # Visual landing reference
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # Static navbar with scroll-switch to CardNav
│   │   ├── FloatingCardNav.tsx      # Floating CardNav dock on scroll
│   │   ├── MobileDrawer.tsx         # Mobile menu sheet matching Screen 13
│   │   └── Footer.tsx               # Editorial footer with brand links & social icons
│   ├── sections/
│   │   ├── HeroSection.tsx          # 100vh hero with BlurText, Magnet & FadeContent (mist)
│   │   ├── StatsSection.tsx         # CountUp counters with SplitText title (once={false})
│   │   ├── MoreThanPhoneSection.tsx # DitherVeil (wander, reverse) + SplitText narrative
│   │   ├── WhyChooseUsSection.tsx   # Sticky CircularGallery + Chakra Accordion
│   │   ├── GhazalPoeticVerse.tsx    # Arabic ghazal verse via BlurText
│   │   ├── PackagesSection.tsx      # FadeContent (effect="mist") + TiltedCard tiers
│   │   ├── AddonsSection.tsx        # "Make It Yours" add-on cards & WhatsApp trigger
│   │   ├── HowItWorksSection.tsx    # 5-step numbered journey + PaperCrumple
│   │   ├── RealVoicesSection.tsx    # Waveform audio player with category filter pills
│   │   ├── GallerySection.tsx       # Photo masonry wall with DecayCard polaroid physics
│   │   ├── VideoSection.tsx         # ScrollExpand cinematic reel (30s)
│   │   ├── FAQSection.tsx           # Chakra UI accordion with 7 core answers
│   │   ├── BookingModal.tsx         # 3-step interactive booking form (Appwrite synced)
│   │   ├── ConfirmationModal.tsx    # Screen 11 celebration confirmation
│   │   └── ContactSection.tsx       # Regional map card & WhatsApp hotline
│   └── ui/
│       ├── AudioWaveform.tsx        # Custom audio waveform visualizer
│       └── StatBadge.tsx            # Trust metric badge
├── hooks/
│   ├── useAudioPlayer.ts            # Audio playback state & waveform sync
│   └── useBookingForm.ts            # Appwrite database booking integration
├── styles/
│   ├── index.css                    # CSS tokens & typography
│   └── animations.css               # Easing curves & spring physics
├── App.tsx                          # Assembles all sections in sequence
└── main.tsx                         # Root entry with ChakraProvider & AppwriteProvider
```

---

## 7. Responsive Breakpoints & Chakra UI Layout Specifications

Every section is engineered for seamless visual hierarchy across mobile, tablet, desktop, and ultrawide viewports:

| Breakpoint | Viewport Range | Layout Behavior & Chakra Grid Specification |
| :--- | :--- | :--- |
| **Mobile (`base`)** | `< 768px` | • Matches `screens-booth.jpeg` 1-to-1 with single-column vertical card stacks.<br>• Header collapses to logo + WhatsApp + mobile menu icon (triggering Screen 13 drawer).<br>• Hero buttons stack vertically with touch targets $\ge 48\text{px}$.<br>• `CircularGallery` in Section 04 renders inline above the accordion items.<br>• Fixed bottom booking bar on mobile. |
| **Tablet (`md`)** | `768px - 1024px` | • 2-column grids for packages and add-ons (`SimpleGrid columns={2}`).<br>• Counters flex horizontally (`SimpleGrid columns={3}`).<br>• Hero content centered with balanced typography scaling. |
| **Desktop (`lg` / `xl`)** | `> 1024px` | • Dual-state header: static editorial bar transitioning to floating `CardNav`.<br>• Section 03 ("More Than A Phone"): 50/50 asymmetric 2-column grid (`DitherVeil` left, `SplitText` right).<br>• Section 04 ("Why Choose Us"): Left column `position="sticky"` `top="120px"`, anchored exclusively while right column accordion items scroll.<br>• Packages: 2-column grid with `TiltedCard` 3D parallax mouse tilt. |

---

## 8. Awwwards Quality Standards & Polish Checklist

1. **60 FPS Performance Guarantee:**
   * All animations utilize GPU-accelerated CSS properties (`transform`, `opacity`, `filter`). Heavy WebGL canvases (`DitherVeil`, `CircularGallery`, `GradientWaves`) pause rendering when offscreen via `IntersectionObserver`.
2. **Accessible Contrast & Readability:**
   * High contrast between Deep Espresso (`#231F20`) and Warm Alabaster (`#FBF7F2`) exceeding WCAG 2.1 AA standards.
   * `prefers-reduced-motion` media queries gracefully disable intensive 3D physics and tilt for users who request reduced motion.
3. **Sound Design & Micro-interactions:**
   * Authentic analog rotary dial tone and mechanical click when interacting with voice previews.
   * Soft magnetic pull on primary buttons via **`Magnet`**.
4. **Appwrite Cloud Backend Integration:**
   * Submissions from the 3-step booking engine sync directly to Appwrite Databases with automatic date formatting, validation, and real-time alerts.
