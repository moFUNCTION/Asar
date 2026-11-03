import React, { useState } from "react";

export interface PassQrCodeProps {
  data: string;
  size?: number;
  color?: string;
  bgColor?: string;
  appwriteEndpoint?: string;
  appwriteProject?: string;
  className?: string;
  showMonogram?: boolean;
}

export function buildQrCodeImageUrl(
  data: string,
  size = 240,
  options?: {
    endpoint?: string;
    project?: string;
    color?: string;
    bgColor?: string;
  }
): string {
  if (options?.endpoint && options?.project) {
    const cleanEndpoint = options.endpoint.replace(/\/+$/, "");
    return `${cleanEndpoint}/avatars/qr?text=${encodeURIComponent(data)}&size=${size}&margin=1&project=${encodeURIComponent(options.project)}`;
  }
  const color = (options?.color || "6B1D28").replace("#", "");
  const bgColor = (options?.bgColor || "FFFFFF").replace("#", "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=${color}&bgcolor=${bgColor}&data=${encodeURIComponent(data)}`;
}

export const PassQrCode: React.FC<PassQrCodeProps> = ({
  data,
  size = 200,
  color = "#6B1D28",
  bgColor = "#FFFFFF",
  appwriteEndpoint,
  appwriteProject,
  className = "",
  showMonogram = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const qrImageUrl = buildQrCodeImageUrl(data, size * 2, {
    endpoint: appwriteEndpoint,
    project: appwriteProject,
    color,
    bgColor,
  });

  return (
    <div
      className={`pass-qr-code-container ${className}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: bgColor,
        borderRadius: "20px",
        border: "2px solid var(--athar-gold)",
        boxShadow: "0 10px 25px -5px rgba(212, 175, 55, 0.35)",
        position: "relative",
      }}
    >
      {/* 4 Luxury Gold Corner Accents */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "4px",
          left: "4px",
          width: "12px",
          height: "12px",
          borderTop: "2px solid var(--athar-maroon)",
          borderLeft: "2px solid var(--athar-maroon)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          width: "12px",
          height: "12px",
          borderTop: "2px solid var(--athar-maroon)",
          borderRight: "2px solid var(--athar-maroon)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "4px",
          left: "4px",
          width: "12px",
          height: "12px",
          borderBottom: "2px solid var(--athar-maroon)",
          borderLeft: "2px solid var(--athar-maroon)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "4px",
          right: "4px",
          width: "12px",
          height: "12px",
          borderBottom: "2px solid var(--athar-maroon)",
          borderRight: "2px solid var(--athar-maroon)",
        }}
      />

      {/* QR Image or Fallback */}
      {!imageError ? (
        <img
          src={qrImageUrl}
          alt="Guest Pass QR Code"
          width={size}
          height={size}
          onError={() => setImageError(true)}
          style={{
            display: "block",
            borderRadius: "10px",
            imageRendering: "pixelated",
          }}
        />
      ) : (
        /* Standalone High-Contrast SVG QR Pattern Fallback */
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <rect width="200" height="200" fill={bgColor} rx="8" />
          {/* Top-Left Finder */}
          <rect x="15" y="15" width="50" height="50" fill={color} rx="4" />
          <rect x="23" y="23" width="34" height="34" fill={bgColor} rx="2" />
          <rect x="31" y="31" width="18" height="18" fill={color} rx="2" />

          {/* Top-Right Finder */}
          <rect x="135" y="15" width="50" height="50" fill={color} rx="4" />
          <rect x="143" y="23" width="34" height="34" fill={bgColor} rx="2" />
          <rect x="151" y="31" width="18" height="18" fill={color} rx="2" />

          {/* Bottom-Left Finder */}
          <rect x="15" y="135" width="50" height="50" fill={color} rx="4" />
          <rect x="23" y="143" width="34" height="34" fill={bgColor} rx="2" />
          <rect x="31" y="151" width="18" height="18" fill={color} rx="2" />

          {/* Timing & Data Matrix Elements */}
          <g fill={color} opacity="0.9">
            <rect x="75" y="20" width="10" height="10" />
            <rect x="95" y="20" width="10" height="10" />
            <rect x="115" y="20" width="10" height="10" />

            <rect x="20" y="75" width="10" height="10" />
            <rect x="20" y="95" width="10" height="10" />
            <rect x="20" y="115" width="10" height="10" />

            {/* Center Data blocks */}
            <rect x="75" y="75" width="20" height="20" rx="3" />
            <rect x="105" y="75" width="20" height="20" rx="3" />
            <rect x="75" y="105" width="20" height="20" rx="3" />
            <rect x="105" y="105" width="20" height="20" rx="3" />
            <rect x="135" y="75" width="15" height="15" />
            <rect x="75" y="135" width="15" height="15" />
            <rect x="155" y="105" width="15" height="15" />
            <rect x="105" y="145" width="15" height="15" />
            <rect x="135" y="135" width="35" height="35" rx="3" />
          </g>
        </svg>
      )}

      {/* Monogram Brand Crest in Center */}
      {showMonogram && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--athar-maroon)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "var(--font-arabic-display)",
          }}
        >
          ✦ أثر VIP ACCESS ✦
        </div>
      )}
    </div>
  );
};

export default PassQrCode;
