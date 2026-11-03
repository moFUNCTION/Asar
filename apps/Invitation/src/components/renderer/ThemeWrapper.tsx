import React, { useMemo } from "react";
import type { ThemeConfig } from "./types";

export interface ThemeWrapperProps {
  themeConfig?: ThemeConfig;
  dir?: "rtl" | "ltr";
  children: React.ReactNode;
  className?: string;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  themeConfig,
  dir = "rtl",
  children,
  className = "",
}) => {
  const isNoir = themeConfig?.themeVariant === "noir-obsidian";

  const containerStyles = useMemo<React.CSSProperties>(() => {
    const primary = themeConfig?.primaryColor || (isNoir ? "#D4AF37" : "#6B1D28");
    const secondary = themeConfig?.secondaryColor || (isNoir ? "#E5C158" : "#D4AF37");
    const bg = themeConfig?.backgroundColor || (isNoir ? "#161214" : "var(--athar-bg-primary)");
    const cardBg =
      themeConfig?.cardBackground ||
      (isNoir ? "rgba(35, 26, 30, 0.95)" : "var(--athar-card-bg)");
    const fontFamily =
      themeConfig?.fontFamily === "Playfair Display"
        ? "var(--font-latin-display)"
        : themeConfig?.fontFamily === "Amiri"
          ? "var(--font-arabic-display)"
          : "var(--font-body)";

    return {
      direction: themeConfig?.direction || dir,
      fontFamily,
      backgroundColor: bg,
      color: isNoir ? "#FBF7F2" : "var(--athar-text-title)",
      minHeight: "100vh",
      position: "relative",
      overflowX: "hidden",
      // Custom CSS variables for children blocks
      ["--event-primary" as string]: primary,
      ["--event-secondary" as string]: secondary,
      ["--event-bg" as string]: bg,
      ["--event-card-bg" as string]: cardBg,
    };
  }, [themeConfig, dir, isNoir]);

  return (
    <div
      className={`athar-event-wrapper ${isNoir ? "theme-noir" : "theme-ivory"} ${className}`}
      style={containerStyles}
      dir={themeConfig?.direction || dir}
    >
      {/* Ambient luxury radial glow backgrounds */}
      {isNoir ? (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `
              radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.12) 0px, transparent 65%),
              radial-gradient(at 10% 80%, rgba(107, 29, 40, 0.22) 0px, transparent 50%),
              radial-gradient(at 90% 90%, rgba(229, 193, 88, 0.08) 0px, transparent 40%)
            `,
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            backgroundImage: `
              radial-gradient(at 50% 0%, rgba(212, 175, 55, 0.09) 0px, transparent 60%),
              radial-gradient(at 0% 100%, rgba(107, 29, 40, 0.05) 0px, transparent 50%),
              radial-gradient(at 100% 60%, rgba(212, 175, 55, 0.06) 0px, transparent 45%)
            `,
          }}
        />
      )}

      {/* Main Content Layer */}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default ThemeWrapper;
