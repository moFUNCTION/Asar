// =============================================================
// ASAR (Athar / أثر) — Leave a Blessing Guestbook Note Modal
// =============================================================

import React, { useState } from "react";
import { FiX, FiHeart, FiUser, FiTag, FiMessageSquare } from "react-icons/fi";
import type { GuestBlessingNote } from "./types";

export interface BoothLeaveBlessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: GuestBlessingNote) => void;
  coupleTitle?: string;
}

export const BoothLeaveBlessingModal: React.FC<BoothLeaveBlessingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  coupleTitle = "Mina & Maryam",
}) => {
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("صديق مقرب · Close Friend");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setError("يرجى كتابة اسمكم الكريم");
      return;
    }
    if (!message.trim()) {
      setError("يرجى كتابة رسالة التهنئة أو الذكرى");
      return;
    }

    const newNote: GuestBlessingNote = {
      id: `gb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || "ضيف عزيز",
      message: message.trim(),
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      likes: 1,
      isLiked: true,
    };

    onSubmit(newNote);
    onClose();
  };

  const roleOptions = [
    "صديق مقرب · Close Friend",
    "الأهل والعائلة · Family",
    "زميل عمل · Colleague",
    "ضيف شرف · Special Guest",
    "رفيق الطفولة · Childhood Friend",
  ];

  return (
    <div
      onClick={onClose}
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
        zIndex: 1150,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          maxWidth: "520px",
          width: "100%",
          backgroundColor: "#FBF7F2",
          borderRadius: "28px",
          padding: "2.5rem 2rem",
          border: "1.5px solid rgba(212, 175, 55, 0.4)",
          boxShadow: "0 24px 64px -12px rgba(107, 29, 40, 0.28)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            background: "none",
            border: "none",
            color: "var(--athar-text-muted)",
            fontSize: "1.3rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiX />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(107, 29, 40, 0.1)",
              color: "var(--athar-maroon)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 1rem auto",
            }}
          >
            <FiHeart style={{ fill: "var(--athar-maroon)" }} />
          </div>

          <h2
            className="font-arabic-display"
            style={{
              fontSize: "1.75rem",
              color: "var(--athar-maroon)",
              fontWeight: 700,
              marginBottom: "0.3rem",
            }}
          >
            كتابة كلمة في دفتر الذكريات
          </h2>
          <p style={{ fontSize: "0.92rem", color: "var(--athar-text-muted)" }}>
            اترك تهنئة تلامس قلوب <strong>{coupleTitle}</strong> لتبقى خالدة في سجل
            أثر
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Author Name */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--athar-text-title)",
                marginBottom: "0.4rem",
              }}
            >
              الاسم الكريم / Your Name *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="مثال: د. كريم الألفي"
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.5rem",
                  borderRadius: "14px",
                  border: "1.5px solid rgba(107, 29, 40, 0.16)",
                  backgroundColor: "#ffffff",
                  fontSize: "0.95rem",
                  color: "var(--athar-text-title)",
                  outline: "none",
                }}
              />
              <FiUser
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--athar-gold)",
                }}
              />
            </div>
          </div>

          {/* Author Role */}
          <div style={{ marginBottom: "1.2rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--athar-text-title)",
                marginBottom: "0.4rem",
              }}
            >
              صلة القرابة أو الصفة / Relation
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.5rem",
                  borderRadius: "14px",
                  border: "1.5px solid rgba(107, 29, 40, 0.16)",
                  backgroundColor: "#ffffff",
                  fontSize: "0.92rem",
                  color: "var(--athar-text-title)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {roleOptions.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <FiTag
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--athar-gold)",
                }}
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.88rem",
                fontWeight: 700,
                color: "var(--athar-text-title)",
                marginBottom: "0.4rem",
              }}
            >
              رسالة التهنئة والدعوات / Message *
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="اكتب كلماتك الصادقة للعروسين..."
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem",
                  borderRadius: "14px",
                  border: "1.5px solid rgba(107, 29, 40, 0.16)",
                  backgroundColor: "#ffffff",
                  fontSize: "0.95rem",
                  color: "var(--athar-text-title)",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                color: "#DC2626",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-athar-primary"
            style={{ width: "100%", fontSize: "1rem" }}
          >
            <FiMessageSquare />
            <span>نشر التهنئة في دفتر الذكريات</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default BoothLeaveBlessingModal;
