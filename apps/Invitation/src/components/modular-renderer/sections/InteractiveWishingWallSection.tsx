import React, { useState, useEffect, useMemo } from "react";
import type { WishingWallSection as WishingWallSectionModel } from "@repo/react-appwrite";
import {
  useAppwrite,
  useCollection,
  useMutations,
  ASAR_COLLECTIONS,
  ASAR_DATABASE_ID,
} from "@repo/react-appwrite";

export interface InteractiveWishingWallSectionProps {
  section: WishingWallSectionModel;
  invitationId?: string;
  isNoir?: boolean;
}

export interface WishEntry {
  id: string;
  author: string;
  role: string;
  message: string;
  date: string;
  likes: number;
  hasLiked?: boolean;
  color?: string;
}

const AVATAR_COLORS = [
  "radial-gradient(circle at 35% 35%, #D4AF37, #8A6D1E)",
  "radial-gradient(circle at 35% 35%, #6B1D28, #3E0C15)",
  "radial-gradient(circle at 35% 35%, #1E6F50, #0E3E2B)",
  "radial-gradient(circle at 35% 35%, #B7791F, #6B4610)",
  "radial-gradient(circle at 35% 35%, #2B3A67, #131B33)",
];

export const InteractiveWishingWallSection: React.FC<
  InteractiveWishingWallSectionProps
> = ({ section, invitationId, isNoir = false }) => {
  const maxMessageLength = section.maxMessageLength || 280;
  const { config } = useAppwrite();
  const dbId = config?.databaseId || ASAR_DATABASE_ID;

  // Initial wishes
  const defaultWishes: WishEntry[] = [
    {
      id: "w-1",
      author: "د. طارق ومنى منصور",
      role: "العائلة · Family",
      message:
        "ألف مبارك لأجمل عروسين! بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة لا تنتهي. ❤️✨",
      date: "منذ ساعتين",
      likes: 14,
      color: AVATAR_COLORS[0],
    },
    {
      id: "w-2",
      author: "نوران الشناوي",
      role: "صديقة العروس · Best Friend",
      message:
        "Can't wait to dance and celebrate under the Alexandria stars! You two are pure magic together. Congratulations! 💐🎉",
      date: "منذ 4 ساعات",
      likes: 9,
      color: AVATAR_COLORS[1],
    },
    {
      id: "w-3",
      author: "كريم وياسمين",
      role: "الأصدقاء · Friends",
      message:
        "نسأل الله أن يجعل أيامكم القادمة كلها مودة ورحمة وتوفيق. في انتظار الليلة الكبيرة بكل شغف! 🥂",
      date: "أمس",
      likes: 12,
      color: AVATAR_COLORS[2],
    },
  ];

  const [wishes, setWishes] = useState<WishEntry[]>(defaultWishes);
  const [authorName, setAuthorName] = useState("");
  const [guestRole, setGuestRole] = useState("الأصدقاء · Friend");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const cacheKey = invitationId
    ? `asar_wishing_wall_${invitationId}`
    : "asar_wishing_wall_cache";

  // Load cached wishes on mount
  useEffect(() => {
    try {
      const cached =
        localStorage.getItem(cacheKey) ||
        localStorage.getItem("asar_wishing_wall_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with default wishes avoiding duplicates
          const seen = new Set<string>();
          const combined: WishEntry[] = [];
          for (const item of [...parsed, ...defaultWishes]) {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              combined.push(item);
            }
          }
          setWishes(combined);
        }
      }
    } catch {
      // fallback to defaults
    }
  }, [cacheKey]);

  // Reactive Wishing Wall collection via useCollection hook
  const wishWhere = useMemo(() => {
    return invitationId ? { invitationId } : undefined;
  }, [invitationId]);

  const { data: cloudWishes } = useCollection(
    dbId,
    ASAR_COLLECTIONS.WISHING_WALL_MESSAGES,
    {
      where: wishWhere as any,
      realtime: true,
    },
  );

  const { createDocument, updateDocument } = useMutations(
    dbId,
    ASAR_COLLECTIONS.WISHING_WALL_MESSAGES,
  );

  useEffect(() => {
    if (cloudWishes && cloudWishes.length > 0) {
      const remoteWishes: WishEntry[] = cloudWishes.map((doc: any) => ({
        id: doc.$id,
        author: doc.author,
        role: doc.role || "ضيف الحفل · Guest",
        message: doc.message,
        date: doc.$createdAt
          ? new Date(doc.$createdAt).toLocaleDateString("ar-EG", {
              month: "short",
              day: "numeric",
            })
          : "الآن",
        likes: doc.likes || 0,
        color: doc.color || AVATAR_COLORS[0],
      }));
      setWishes((prev) => {
        const seen = new Set<string>();
        const merged: WishEntry[] = [];
        for (const item of [...remoteWishes, ...prev]) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        }
        return merged;
      });
    }
  }, [cloudWishes]);

  // Post new wish (Optimistic Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorName.trim()) {
      setFormError("يرجى كتابة اسمك الكريم / Please enter your name");
      return;
    }

    if (!message.trim()) {
      setFormError(
        "يرجى كتابة رسالة التهنئة / Please write your blessing message",
      );
      return;
    }

    if (message.length > maxMessageLength) {
      setFormError(`الرسالة تتجاوز الحد المسموح (${maxMessageLength} حرف)`);
      return;
    }

    const randomColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const newWish: WishEntry = {
      id: `w-${Date.now()}`,
      author: authorName.trim(),
      role: guestRole,
      message: message.trim(),
      date: "الآن · Just now",
      likes: 1,
      hasLiked: true,
      color: randomColor,
    };

    // Optimistic state update
    const updated = [newWish, ...wishes];
    setWishes(updated);
    setAuthorName("");
    setMessage("");
    setFormError("");

    // Save to localStorage cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to Appwrite Cloud via useMutations
    try {
      createDocument({
        invitationId: invitationId || "invitation-omar-and-layla",
        author: authorName.trim(),
        role: guestRole,
        message: message.trim(),
        likes: 1,
        color: randomColor,
        isApproved: true,
      }).catch(() => {});
    } catch {
      // Optimistic cache intact
    }

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 4000);
  };

  // Heart Reaction Toggle
  const handleToggleLike = (id: string) => {
    if (!section.allowReactions) return;

    setWishes((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.hasLiked;
          const newLikes = nextLiked
            ? item.likes + 1
            : Math.max(0, item.likes - 1);

          // Update in Appwrite Cloud via useMutations
          if (!id.startsWith("w-")) {
            try {
              updateDocument(id, { likes: newLikes }).catch(() => {});
            } catch {
              // ignore
            }
          }

          return {
            ...item,
            hasLiked: nextLiked,
            likes: newLikes,
          };
        }
        return item;
      }),
    );
  };

  return (
    <section
      id={section.id || "wishing-wall-section"}
      className="athar-interactive-wishing-wall-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#F4EFEA",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "3px",
              color: "var(--athar-gold, #D4AF37)",
              fontWeight: 700,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            ✦ {section.subtitle || "Love & Blessings · سجل التهاني والأمنيات"} ✦
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              fontFamily: "var(--font-arabic-display, serif)",
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
              margin: "0 0 0.5rem 0",
            }}
          >
            {section.title || "Wishing Wall & Guestbook"}
          </h2>
          {section.titleAr && (
            <div
              style={{
                fontSize: "1.15rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontFamily: "var(--font-arabic-display, serif)",
                marginBottom: "0.75rem",
              }}
            >
              {section.titleAr}
            </div>
          )}
          <p
            style={{
              fontSize: "0.95rem",
              color: isNoir ? "#D6C7B2" : "var(--athar-text-muted, #7A6F6D)",
              maxWidth: "540px",
              margin: "0 auto",
            }}
          >
            {section.greetingPrompt ||
              "شاركونا دعواتكم الصادقة وكلماتكم الطيبة لتبقى ذكرى خالدة في قلوبنا."}
          </p>
        </div>

        {/* Celebration Notification */}
        {showCelebration && (
          <div
            style={{
              backgroundColor: "var(--athar-status-success, #1E6F50)",
              color: "#FFFFFF",
              padding: "0.85rem 1.5rem",
              borderRadius: "16px",
              textAlign: "center",
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 24px rgba(30, 111, 80, 0.25)",
              animation: "fadeInDown 0.3s ease",
            }}
          >
            🎉 ألف مبروك! نُشرت مباركتك بنجاح وأضيفت إلى جدار الأمنيات.
          </div>
        )}

        {/* New Wish Submission Form */}
        <div
          style={{
            padding: "2rem",
            borderRadius: "24px",
            background: isNoir
              ? "linear-gradient(145deg, rgba(35, 26, 30, 0.94), rgba(22, 18, 20, 0.97))"
              : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
            border:
              "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            marginBottom: "3rem",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                    color: isNoir
                      ? "#FFFFFF"
                      : "var(--athar-text-title, #231F20)",
                  }}
                >
                  الاسم الكريم · Your Name *
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => {
                    setAuthorName(e.target.value);
                    if (formError) setFormError("");
                  }}
                  placeholder="مثال: د. ماجد حسني"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    border:
                      "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                    backgroundColor: isNoir
                      ? "rgba(20, 15, 17, 0.7)"
                      : "#FFFFFF",
                    color: isNoir ? "#FFFFFF" : "#231F20",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    marginBottom: "0.35rem",
                    color: isNoir
                      ? "#FFFFFF"
                      : "var(--athar-text-title, #231F20)",
                  }}
                >
                  صلة القرابة · Relationship
                </label>
                <select
                  value={guestRole}
                  onChange={(e) => setGuestRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    border:
                      "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                    backgroundColor: isNoir ? "#231A1E" : "#FFFFFF",
                    color: isNoir ? "#FFFFFF" : "#231F20",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                >
                  <option value="العائلة · Family">العائلة · Family</option>
                  <option value="صديق مقرب · Best Friend">
                    صديق مقرب · Best Friend
                  </option>
                  <option value="الأصدقاء · Friend">الأصدقاء · Friend</option>
                  <option value="الزملاء · Colleague">
                    الزملاء · Colleague
                  </option>
                  <option value="ضيف خاص · Special Guest">
                    ضيف خاص · Special Guest
                  </option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.35rem",
                }}
              >
                <label
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: isNoir
                      ? "#FFFFFF"
                      : "var(--athar-text-title, #231F20)",
                  }}
                >
                  رسالة التهنئة والدعاء · Blessing Message *
                </label>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color:
                      message.length > maxMessageLength
                        ? "#E53E3E"
                        : "var(--athar-gold, #D4AF37)",
                    fontWeight: 600,
                  }}
                >
                  {message.length} / {maxMessageLength}
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (formError) setFormError("");
                }}
                rows={3}
                placeholder={
                  section.placeholder ||
                  "اكتب كلمات دافئة تخلد ذكرى هذه الليلة السعيدة..."
                }
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border:
                    "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  backgroundColor: isNoir ? "rgba(20, 15, 17, 0.7)" : "#FFFFFF",
                  color: isNoir ? "#FFFFFF" : "#231F20",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {formError && (
              <div
                style={{
                  color: "#E53E3E",
                  fontSize: "0.82rem",
                  marginBottom: "0.85rem",
                }}
              >
                {formError}
              </div>
            )}

            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                borderRadius: "9999px",
                background: isNoir
                  ? "linear-gradient(135deg, #D4AF37, #E5C158)"
                  : "linear-gradient(135deg, var(--athar-maroon, #6B1D28), #50131D)",
                color: isNoir ? "#161214" : "#FFFFFF",
                fontSize: "0.92rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(107, 29, 40, 0.2)",
              }}
            >
              <span>✍️</span>
              <span>نشر التهنئة · Post Blessing</span>
            </button>
          </form>
        </div>

        {/* Wishes Stream Feed */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {wishes.map((wish) => {
            const initial = wish.author.trim().charAt(0) || "أ";

            return (
              <div
                key={wish.id}
                style={{
                  padding: "1.5rem 1.75rem",
                  borderRadius: "20px",
                  background: isNoir
                    ? "linear-gradient(145deg, rgba(35, 26, 30, 0.88), rgba(22, 18, 20, 0.94))"
                    : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
                  border:
                    "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.03)",
                  transition: "transform 0.2s ease, border-color 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  {/* Guest Avatar & Identity */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: wish.color || AVATAR_COLORS[0],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        fontFamily: "var(--font-arabic-display, serif)",
                        border: "1.5px solid rgba(255,255,255,0.4)",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        flexShrink: 0,
                      }}
                    >
                      {initial}
                    </div>

                    <div>
                      <div
                        dir="auto"
                        style={{
                          fontSize: "0.98rem",
                          fontWeight: 700,
                          color: isNoir
                            ? "#FFFFFF"
                            : "var(--athar-text-title, #231F20)",
                        }}
                      >
                        {wish.author}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--athar-gold, #D4AF37)",
                            fontWeight: 700,
                          }}
                        >
                          {wish.role}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: isNoir
                              ? "#A8A8B7"
                              : "var(--athar-text-muted, #7A6F6D)",
                          }}
                        >
                          • {wish.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reaction Heart Button */}
                  {section.allowReactions && (
                    <button
                      type="button"
                      onClick={() => handleToggleLike(wish.id)}
                      style={{
                        background: wish.hasLiked
                          ? isNoir
                            ? "rgba(229, 62, 62, 0.25)"
                            : "rgba(107, 29, 40, 0.08)"
                          : "transparent",
                        border: wish.hasLiked
                          ? "1px solid #E53E3E"
                          : "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "9999px",
                        padding: "0.35rem 0.75rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.82rem",
                        color: wish.hasLiked
                          ? "#E53E3E"
                          : isNoir
                            ? "#D6C7B2"
                            : "var(--athar-text-muted, #7A6F6D)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{wish.hasLiked ? "❤️" : "🤍"}</span>
                      <span style={{ fontWeight: 700 }}>{wish.likes}</span>
                    </button>
                  )}
                </div>

                {/* Blessing Message Text */}
                <p
                  dir="auto"
                  style={{
                    fontSize: "0.95rem",
                    lineHeight: 1.65,
                    color: isNoir
                      ? "#E6DACB"
                      : "var(--athar-text-body, #4A4240)",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {wish.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default InteractiveWishingWallSection;
