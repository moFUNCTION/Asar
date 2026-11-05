// =============================================================
// ASAR (Athar / أثر) — Private Heirloom PIN Padlock Modal
// Gates private memories with 4-digit PIN verification
// =============================================================

import React, { useState, useRef } from "react";
import { FiLock, FiKey, FiAlertCircle } from "react-icons/fi";

export interface BoothPinPadlockModalProps {
  coupleTitle: string;
  expectedPin?: string;
  isOpen: boolean;
  onUnlock: () => void;
  onClose?: () => void;
}

export const BoothPinPadlockModal: React.FC<BoothPinPadlockModalProps> = ({
  coupleTitle,
  expectedPin = "1234",
  isOpen,
  onUnlock,
  onClose,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(false);

    // Auto-advance
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-check on 4th digit
    if (char && index === 3) {
      const entered = newDigits.join("");
      if (entered === expectedPin) {
        onUnlock();
      } else {
        setError(true);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleUseDemoPin = () => {
    const demoArray = expectedPin.split("").slice(0, 4);
    setDigits(demoArray);
    setError(false);
    onUnlock();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(35, 31, 32, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 1000,
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: "460px",
          width: "100%",
          backgroundColor: "#FBF7F2",
          borderRadius: "28px",
          padding: "2.5rem 2rem",
          textAlign: "center",
          border: "1.5px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 24px 64px -12px rgba(107, 29, 40, 0.28)",
          position: "relative",
        }}
      >
        {/* Padlock Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--athar-maroon)",
            color: "#F1E5D1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.2rem auto",
            fontSize: "1.6rem",
            boxShadow: "0 8px 24px rgba(107, 29, 40, 0.25)",
          }}
        >
          <FiLock />
        </div>

        <h2
          className="font-arabic-display"
          style={{
            fontSize: "1.75rem",
            color: "var(--athar-maroon)",
            fontWeight: 700,
            marginBottom: "0.4rem",
          }}
        >
          أرشيف عائلي خاص ومحمي
        </h2>

        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--athar-text-body)",
            marginBottom: "1.8rem",
            lineHeight: 1.6,
          }}
        >
          هذه الصفحة مخصصة لعائلة وأحباء <strong>{coupleTitle}</strong>.
          <br />
          يرجى إدخال رمز الحماية (PIN Code) المكون من 4 أرقام للوصول إلى الذكريات
          والرسائل الصوتية.
        </p>

        {/* 4-Digit Inputs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.85rem",
            marginBottom: "1.5rem",
            direction: "ltr",
          }}
        >
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              style={{
                width: "56px",
                height: "64px",
                borderRadius: "14px",
                textAlign: "center",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--athar-maroon)",
                backgroundColor: "#ffffff",
                border: error
                  ? "2px solid #DC2626"
                  : digit
                    ? "2px solid var(--athar-gold)"
                    : "1.5px solid rgba(107, 29, 40, 0.18)",
                boxShadow: digit
                  ? "0 4px 12px rgba(212, 175, 55, 0.2)"
                  : "none",
                outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              color: "#DC2626",
              fontSize: "0.88rem",
              fontWeight: 600,
              marginBottom: "1.2rem",
            }}
          >
            <FiAlertCircle />
            <span>رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى</span>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={handleUseDemoPin}
            className="btn-athar-primary"
            style={{ width: "100%" }}
          >
            <FiKey />
            <span>استخدام الرمز الافتراضي للتجربة ({expectedPin})</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--athar-text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "0.4rem",
              }}
            >
              إلغاء والعودة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoothPinPadlockModal;
