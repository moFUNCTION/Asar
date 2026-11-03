# ASAR (Athar / أثر) — Unified Luxury Design System & UI/UX Specification

> **Mandatory Reference for All 10 Parallel AI Agents**  
> **Aesthetic Direction:** Warm Vintage Editorial Luxury (Inspired by `apps/Booth` & Visual Reference Image #1)  
> **UI Framework:** Chakra UI v3 (`@chakra-ui/react: ^3.32.0`) + `@repo/ui-components` + CSS Custom Properties  
> **Primary Languages:** Arabic (`dir="rtl"`) & Bilingual English/Arabic (`dir="auto"`)

---

## 1. Core Brand Philosophy & Visual Identity

Every screen across **`apps/Main`**, **`apps/Admin`**, **`apps/Booth`**, and **`apps/Invitation`** must feel like an **Awwwards-winning luxury editorial experience**—never like a generic SaaS template or default bootstrap dashboard.

* **Tactile Paper & Warmth:** We never use cold, sterile `#FFFFFF` or `#F8FAFC` gray backgrounds as the primary canvas. Our primary canvas is **Warm Alabaster (`#FBF7F2`)** paired with **Linen Cream (`#F4EFEA`)**, evoking handmade cotton rag wedding stationery.
* **Regal Contrast:** Primary actions, active tabs, and brand anchors use **Royal Maroon (`#6B1D28`)** and **Deep Burgundy (`#5B1621`)**, accented by **Champagne Gold (`#D4AF37`)** hairlines and badges.
* **Noir VIP Accent Tier:** For high-tier VIP packages, dark mode previews, or evening gala invitations, we use **Noir Obsidian (`linear-gradient(170deg, #231A1E 0%, #161214 100%)`)** with `#D4AF37` gold borders and `#E5C158` highlights.
* **Editorial Typography:** Classical poetic serif display headers (`Amiri` for Arabic, `Playfair Display` for Latin) paired with geometric modern sans-serif body text (`Cairo` for Arabic/Bilingual UI).

---

## 2. Global CSS Variables & Color Tokens

All four applications (`Main`, `Admin`, `Booth`, `Invitation`) must include the following root tokens in their `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

:root {
  /* Brand Primary: Royal Maroon & Burgundy */
  --athar-maroon: #6B1D28;
  --athar-maroon-dark: #5B1621;
  --athar-maroon-deep: #4A0E17;
  --athar-maroon-glow: rgba(107, 29, 40, 0.16);
  --athar-maroon-subtle: rgba(107, 29, 40, 0.06);

  /* Brand Secondary: Champagne Gold */
  --athar-gold: #D4AF37;
  --athar-gold-bright: #E5C158;
  --athar-gold-light: #F1E5D1;
  --athar-gold-border: rgba(212, 175, 55, 0.4);

  /* Editorial Surfaces: Alabaster & Linen */
  --athar-bg-primary: #FBF7F2;
  --athar-bg-secondary: #F4EFEA;
  --athar-bg-tertiary: #EDE6DC;
  --athar-card-bg: rgba(255, 255, 255, 0.94);
  --athar-card-border: rgba(107, 29, 40, 0.08);

  /* Noir VIP Surface */
  --athar-noir-bg: linear-gradient(170deg, #231A1E 0%, #161214 100%);
  --athar-noir-surface: #1F1A1C;

  /* Typography Colors */
  --athar-text-title: #231F20;
  --athar-text-body: #4A4240;
  --athar-text-muted: #7A6F6D;

  /* Status Semantic Colors (Tuned to Warm Editorial Palette) */
  --athar-status-success: #1E6F50;
  --athar-status-success-bg: rgba(30, 111, 80, 0.1);
  --athar-status-warning: #B7791F;
  --athar-status-warning-bg: rgba(212, 175, 55, 0.18);
  --athar-status-danger: #9B2C2C;
  --athar-status-danger-bg: rgba(155, 44, 44, 0.1);

  /* Font Stacks */
  --font-arabic-display: 'Amiri', 'Aref Ruqaa', 'Playfair Display', serif;
  --font-latin-display: 'Playfair Display', 'Amiri', serif;
  --font-body: 'Cairo', system-ui, -apple-system, sans-serif;

  /* Radii & Shadows */
  --athar-radius-sm: 8px;
  --athar-radius-md: 16px;
  --athar-radius-lg: 24px;
  --athar-radius-xl: 32px;
  --athar-radius-full: 9999px;
  --athar-shadow-soft: 0 10px 30px -10px rgba(107, 29, 40, 0.06);
  --athar-shadow-elevated: 0 24px 48px -12px rgba(107, 29, 40, 0.14);
  --athar-shadow-gold: 0 15px 40px -10px rgba(212, 175, 55, 0.22);
}
```

---

## 3. Typography Rules & Hierarchy

1. **Display / Hero Headlines (`.font-arabic-display`):**
   * Font Family: `'Amiri', 'Playfair Display', serif`
   * Sizes: Hero `clamp(2.4rem, 5vw, 4.5rem)`, Section Header `clamp(1.9rem, 3.5vw, 3rem)`, Card Title `1.35rem`–`1.6rem`.
   * Color: `var(--athar-text-title)` (`#231F20`) or `var(--athar-maroon)` (`#6B1D28`).
2. **UI Controls, Navigation, Tables, Forms & Body Copy:**
   * Font Family: `'Cairo', sans-serif`
   * Weights: `500` (Regular UI), `600` (Subtitles), `700` (Buttons & Labels), `800` (Badges & Price numerals).
3. **Bilingual Support (`dir="auto"`):**
   * Guest quotes, speaker names, and RSVP answers often mix Arabic and English (e.g., `"Mabrook ya gameela, ربنا يسعدكم دايماً ..."`). Always apply `dir="auto"` on user-generated text paragraphs so punctuation and alignment render naturally in both languages.

---

## 4. Standard Component Recipes (Chakra UI v3 `@chakra-ui/react: ^3.32.0`)

> [!IMPORTANT]
> **Chakra UI v3 Compatibility Rules for All Agents:**
> * This monorepo uses **Chakra UI v3 (`^3.32.0`)**.
> * Prefer core layout and primitive components (`Box`, `Flex`, `SimpleGrid`, `Grid`, `HStack`, `VStack`, `Text`, `Button`, `Badge`, `Image`) paired with native styled `<input>`, `<select>`, `<textarea>` or custom Chakra `Box` modals/drawers (just like `apps/Booth/src/components/sections/BookingModal.tsx`).
> * **Do NOT** import deprecated Chakra v2-only subcomponents like `ModalOverlay`, `FormControl`, `FormLabel`, `useToast`, or `Divider` from `@chakra-ui/react` as they do not exist as direct flat exports in Chakra v3! Use `<Box>` with CSS borders for dividers, state-driven `<Box position="fixed" inset="0">` for modals, and inline toast banners for notifications.

### 4.1. Primary & Secondary Luxury Buttons
```tsx
{/* Primary Royal Maroon Pill Button */}
<Button
  className="btn-athar-primary"
  bg="var(--athar-maroon)"
  color="white"
  px={7}
  py={5}
  borderRadius="full"
  fontWeight="700"
  fontSize="0.95rem"
  boxShadow="0 4px 14px rgba(107, 29, 40, 0.25)"
  _hover={{
    bg: "var(--athar-maroon-dark)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(107, 29, 40, 0.35)",
  }}
>
  Action Label
</Button>

{/* Secondary Alabaster & Gold Outline Button */}
<Button
  bg="rgba(255, 255, 255, 0.9)"
  color="var(--athar-text-title)"
  border="1px solid rgba(212, 175, 55, 0.45)"
  px={6}
  py={5}
  borderRadius="full"
  fontWeight="700"
  fontSize="0.95rem"
  _hover={{
    bg: "white",
    borderColor: "var(--athar-maroon)",
    transform: "translateY(-2px)",
  }}
>
  Secondary Action
</Button>
```

### 4.2. Editorial Eyebrow Badge
```tsx
<Badge
  variant="outline"
  borderColor="rgba(212, 175, 55, 0.45)"
  bg="rgba(255, 255, 255, 0.92)"
  color="var(--athar-maroon)"
  px={4}
  py={1.5}
  borderRadius="full"
  fontSize="0.82rem"
  fontWeight="700"
  letterSpacing="0.06em"
>
  ✦ BADGE TEXT
</Badge>
```

### 4.3. Luxury Card Container (Light Ivory & Noir VIP Variants)
* **Standard Ivory Card:**
  * `bg="rgba(255, 255, 255, 0.95)"`
  * `borderRadius="24px"`
  * `border="1px solid rgba(107, 29, 40, 0.08)"`
  * `boxShadow="0 10px 30px -10px rgba(107, 29, 40, 0.06)"`
  * Hover state: `borderColor="rgba(212, 175, 55, 0.5)"`, `transform="translateY(-3px)"`
* **Noir Obsidian VIP Card:**
  * `bg="linear-gradient(170deg, #231A1E 0%, #161214 100%)"`
  * `color="#FFFFFF"`
  * `borderRadius="28px"`
  * `border="1.5px solid #D4AF37"`
  * `boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.45)"`

### 4.4. Form Inputs (Consistent Across Booking, Admin Studios & Dynamic RSVP)
```tsx
<input
  type="text"
  style={{
    width: "100%",
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(107, 29, 40, 0.18)",
    backgroundColor: "#FFFFFF",
    color: "#231F20",
    outline: "none",
    fontSize: "0.95rem",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  }}
/>
```

### 4.5. Acoustic Waveform Ornament Divider (`─── ∿∿∿ ───`)
Used on the Booth Memory Website (Image #1) and section headers:
```tsx
<Flex align="center" justify="center" gap={3} my={2} opacity={0.75}>
  <Box h="1px" w="60px" bg="linear-gradient(90deg, transparent, #D4AF37)" />
  <svg width="36" height="18" viewBox="0 0 36 18" fill="none">
    <path
      d="M1 9H7L10 3L14 15L18 1L22 17L26 5L29 9H35"
      stroke="#6B1D28"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
  <Box h="1px" w="60px" bg="linear-gradient(90deg, #D4AF37, transparent)" />
</Flex>
```

---

## 5. `@repo/ui-components` Usage Guidelines

Agents should enrich user-facing pages (`Booth`, `Invitation`, `Main`) with components from `@repo/ui-components`:
* **`GradientWaves`**: Ideal for hero backgrounds (`horizonColor="#FBF7F2"`, `waveColor="#8A2E3B"`, `crestColor="#F7EFE6"`).
* **`BlurText`** & **`SplitText`**: Ideal for editorial titles and poetic subtitles (`once={false}`).
* **`FadeContent`**: Wrap section grids and cards (`blur={true}`, `duration={1400}`).
* **`TiltedCard`**: Wrap pricing packages, QR Code passes, or VIP cards.
* **`CircularGallery`** & **`DecayCard`**: Use in photo galleries for Booth and Invitation websites.
* **`Magnet`**: Wrap primary CTA buttons.
* **`CountUp`**: Use for live stats, capacity counters, and countdown metrics.

