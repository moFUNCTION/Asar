import React from "react";

export type OccasionPreset =
  | "royal-wedding"
  | "midnight-gala"
  | "mediterranean-garden"
  | "cultural-festival";

export interface InvitationThemeConfig {
  preset: OccasionPreset;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontDisplay: string;
  fontBody: string;
  direction: "rtl" | "ltr" | "bilingual";
  heroShader: "GradientWaves" | "DitherVeil" | "MinimalEditorial";
  cursorEffect: "SplashCursor" | "GlowCursor" | "None";
  enableParticles: boolean;
}

export const THEME_PRESETS: Record<
  OccasionPreset,
  {
    name: string;
    nameAr: string;
    description: string;
    config: InvitationThemeConfig;
  }
> = {
  "royal-wedding": {
    name: "Royal Wedding Editorial",
    nameAr: "زفاف ملكي فاخر",
    description: "Warm Alabaster (#FBF7F2), Royal Maroon (#6B1D28), Champagne Gold (#D4AF37)",
    config: {
      preset: "royal-wedding",
      primaryColor: "#6B1D28",
      secondaryColor: "#D4AF37",
      backgroundColor: "#FBF7F2",
      textColor: "#231F20",
      accentColor: "#5B1621",
      fontDisplay: "'Amiri', 'Playfair Display', serif",
      fontBody: "'Cairo', sans-serif",
      direction: "bilingual",
      heroShader: "GradientWaves",
      cursorEffect: "GlowCursor",
      enableParticles: true,
    },
  },
  "midnight-gala": {
    name: "Midnight Gala & Summit (Noir VIP)",
    nameAr: "حفل المساء ونوار لكجري",
    description: "Obsidian (#141115), Gold (#E5C158), Ivory text (#FBF7F2), Cairo + Playfair",
    config: {
      preset: "midnight-gala",
      primaryColor: "#E5C158",
      secondaryColor: "#D4AF37",
      backgroundColor: "#141115",
      textColor: "#FBF7F2",
      accentColor: "#F4EFEA",
      fontDisplay: "'Cairo', 'Playfair Display', serif",
      fontBody: "'Cairo', sans-serif",
      direction: "rtl",
      heroShader: "DitherVeil",
      cursorEffect: "SplashCursor",
      enableParticles: true,
    },
  },
  "mediterranean-garden": {
    name: "Mediterranean Garden & Engagement",
    nameAr: "حديقة البحر المتوسط والخطوبة",
    description: "Sage Olive (#2D4A3E), Sand Linen (#F7F4EE), Terracotta Gold (#C89D54)",
    config: {
      preset: "mediterranean-garden",
      primaryColor: "#2D4A3E",
      secondaryColor: "#C89D54",
      backgroundColor: "#F7F4EE",
      textColor: "#2D2825",
      accentColor: "#A66D38",
      fontDisplay: "'Amiri', 'Playfair Display', serif",
      fontBody: "'Cairo', sans-serif",
      direction: "bilingual",
      heroShader: "GradientWaves",
      cursorEffect: "None",
      enableParticles: false,
    },
  },
  "cultural-festival": {
    name: "Cultural & Music Festival",
    nameAr: "مهرجان ثقافي وموسيقي",
    description: "Deep Indigo/Crimson (#2B123A), Sunset Coral (#E06D53), Warm Cream (#FFF9F2)",
    config: {
      preset: "cultural-festival",
      primaryColor: "#E06D53",
      secondaryColor: "#F4C430",
      backgroundColor: "#2B123A",
      textColor: "#FFF9F2",
      accentColor: "#E06D53",
      fontDisplay: "'Cairo', sans-serif",
      fontBody: "'Cairo', sans-serif",
      direction: "rtl",
      heroShader: "GradientWaves",
      cursorEffect: "SplashCursor",
      enableParticles: true,
    },
  },
};

export interface ThemeAndEffectsPanelProps {
  themeConfig: InvitationThemeConfig;
  onChange: (config: InvitationThemeConfig) => void;
}

export const ThemeAndEffectsPanel: React.FC<ThemeAndEffectsPanelProps> = ({
  themeConfig,
  onChange,
}) => {
  const handleApplyPreset = (presetKey: OccasionPreset) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      onChange({ ...preset.config });
    }
  };

  const handleUpdate = <K extends keyof InvitationThemeConfig>(
    key: K,
    val: InvitationThemeConfig[K]
  ) => {
    onChange({
      ...themeConfig,
      [key]: val,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--athar-text-title, #231F20)" }}>
          Occasion Theme, Palette & WebGL Shaders
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted, #7A6F6D)", marginTop: "0.25rem" }}>
          Tailor the digital aesthetic of this celebration. Changes immediately reflect in the live interactive preview.
        </p>
      </div>

      {/* 1. Curated Occasion Presets */}
      <div>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6B1D28", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
          ✦ 1-Click Occasion Presets
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0.75rem" }}>
          {(Object.keys(THEME_PRESETS) as OccasionPreset[]).map((key) => {
            const p = THEME_PRESETS[key];
            const isSelected = themeConfig.preset === key;

            return (
              <div
                key={key}
                onClick={() => handleApplyPreset(key)}
                style={{
                  cursor: "pointer",
                  borderRadius: "14px",
                  padding: "0.9rem",
                  border: isSelected ? "2px solid #6B1D28" : "1px solid rgba(0,0,0,0.1)",
                  background: isSelected ? "rgba(107, 29, 40, 0.04)" : "#FFFFFF",
                  boxShadow: isSelected ? "0 4px 14px rgba(107, 29, 40, 0.12)" : "0 2px 6px rgba(0,0,0,0.02)",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#231F20" }}>{p.name}</span>
                  {isSelected && (
                    <span style={{ fontSize: "0.72rem", background: "#6B1D28", color: "#FFF", borderRadius: "999px", padding: "0.1rem 0.5rem", fontWeight: 700 }}>
                      Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#7A6F6D" }}>{p.description}</div>
                {/* Palette preview chips */}
                <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.25rem" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.config.backgroundColor, border: "1px solid rgba(0,0,0,0.15)" }} title="Background" />
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.config.primaryColor, border: "1px solid rgba(0,0,0,0.15)" }} title="Primary Color" />
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.config.secondaryColor, border: "1px solid rgba(0,0,0,0.15)" }} title="Secondary Color" />
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: p.config.textColor, border: "1px solid rgba(0,0,0,0.15)" }} title="Text Color" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Custom Color Pickers */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(107, 29, 40, 0.12)",
          borderRadius: "14px",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6B1D28", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🎨 Custom Color Palette
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
              Primary Brand
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="color"
                value={themeConfig.primaryColor}
                onChange={(e) => handleUpdate("primaryColor", e.target.value)}
                style={{ width: 36, height: 36, borderRadius: "8px", border: "none", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#231F20" }}>
                {themeConfig.primaryColor}
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
              Secondary / Gold
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="color"
                value={themeConfig.secondaryColor}
                onChange={(e) => handleUpdate("secondaryColor", e.target.value)}
                style={{ width: 36, height: 36, borderRadius: "8px", border: "none", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#231F20" }}>
                {themeConfig.secondaryColor}
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
              Canvas Background
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="color"
                value={themeConfig.backgroundColor}
                onChange={(e) => handleUpdate("backgroundColor", e.target.value)}
                style={{ width: 36, height: 36, borderRadius: "8px", border: "none", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#231F20" }}>
                {themeConfig.backgroundColor}
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>
              Text & Headings
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="color"
                value={themeConfig.textColor}
                onChange={(e) => handleUpdate("textColor", e.target.value)}
                style={{ width: 36, height: 36, borderRadius: "8px", border: "none", cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#231F20" }}>
                {themeConfig.textColor}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Direction, Typography & Language */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(107, 29, 40, 0.12)",
          borderRadius: "14px",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6B1D28", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ✒️ Direction & Typography Stack
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Language / Text Direction</label>
            <select
              value={themeConfig.direction}
              onChange={(e) => handleUpdate("direction", e.target.value as "rtl" | "ltr" | "bilingual")}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
                outline: "none",
                background: "#FFF",
              }}
            >
              <option value="bilingual">Bilingual (Arabic / English)</option>
              <option value="rtl">RTL (Arabic Primary)</option>
              <option value="ltr">LTR (English Primary)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Display Font Family</label>
            <select
              value={themeConfig.fontDisplay}
              onChange={(e) => handleUpdate("fontDisplay", e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
                outline: "none",
                background: "#FFF",
              }}
            >
              <option value="'Amiri', 'Playfair Display', serif">Amiri & Playfair Display (Luxury Serif)</option>
              <option value="'Cairo', 'Playfair Display', serif">Cairo & Playfair Display (Modern VIP)</option>
              <option value="'Aref Ruqaa', 'Cinzel', serif">Aref Ruqaa & Cinzel (Classical Calligraphy)</option>
              <option value="'Cairo', sans-serif">Cairo Geometric (Festival Bold)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. WebGL Shaders & Cursor Effects */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(107, 29, 40, 0.12)",
          borderRadius: "14px",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6B1D28", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          ✨ Interactive @repo/ui-components Effects & Shaders
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Hero Background Shader</label>
            <select
              value={themeConfig.heroShader}
              onChange={(e) =>
                handleUpdate("heroShader", e.target.value as "GradientWaves" | "DitherVeil" | "MinimalEditorial")
              }
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
                outline: "none",
                background: "#FFF",
              }}
            >
              <option value="GradientWaves">GradientWaves (Fluid Silken Waves)</option>
              <option value="DitherVeil">DitherVeil (Retro Fine-Art Dither)</option>
              <option value="MinimalEditorial">MinimalEditorial (Clean Alabaster Grain)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Interactive Cursor Effect</label>
            <select
              value={themeConfig.cursorEffect}
              onChange={(e) =>
                handleUpdate("cursorEffect", e.target.value as "SplashCursor" | "GlowCursor" | "None")
              }
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
                outline: "none",
                background: "#FFF",
              }}
            >
              <option value="GlowCursor">GlowCursor (Soft Golden Halo)</option>
              <option value="SplashCursor">SplashCursor (Interactive Liquid Splash)</option>
              <option value="None">None (Standard Pointer)</option>
            </select>
          </div>
        </div>

        {/* Background Particle Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#231F20" }}>
              Ambient Particle Stardust
            </div>
            <div style={{ fontSize: "0.75rem", color: "#7A6F6D" }}>
              Renders floating golden or pearlescent micro-particles over the invitation canvas.
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={themeConfig.enableParticles}
              onChange={(e) => handleUpdate("enableParticles", e.target.checked)}
              style={{ width: 20, height: 20, cursor: "pointer", accentColor: "#6B1D28" }}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
