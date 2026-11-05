import React, { useState } from "react";
import type { CoupleStorySection as CoupleStorySectionModel } from "@repo/react-appwrite";

export interface CoupleStorySectionProps {
  section: CoupleStorySectionModel;
  isNoir?: boolean;
}

export const CoupleStorySection: React.FC<CoupleStorySectionProps> = ({
  section,
  isNoir = false,
}) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const milestones = section.milestones && section.milestones.length > 0
    ? section.milestones
    : [
        {
          id: "m-1",
          yearOrDate: "2020",
          title: "The First Meeting · اللقاء الأول",
          description: "Our paths crossed at a serendipitous cafe by the sea, sparking a conversation that would last a lifetime.",
        },
        {
          id: "m-2",
          yearOrDate: "2023",
          title: "The Proposal · خطوة إلى الأبد",
          description: "Under the golden sunset of the Mediterranean, we promised each other an eternity of shared dreams.",
        },
        {
          id: "m-3",
          yearOrDate: "2026",
          title: "Our Wedding Day · ليلة العمر",
          description: "Surrounded by our most cherished families and beloved friends, we celebrate the start of our forever chapter.",
        },
      ];

  return (
    <section
      id={section.id || "couple-story-section"}
      className="athar-couple-story-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
            ✦ {section.subtitle || "The Journey of Love · قصة حبنا"} ✦
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
              fontFamily: "var(--font-arabic-display, serif)",
              color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
              margin: 0,
            }}
          >
            {section.title || "Our Story & Milestones"}
          </h2>
          {section.titleAr && (
            <div
              style={{
                fontSize: "1.15rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontFamily: "var(--font-arabic-display, serif)",
                marginTop: "0.35rem",
              }}
            >
              {section.titleAr}
            </div>
          )}
        </div>

        {/* Vertical Timeline Track */}
        <div
          style={{
            position: "relative",
            padding: "1rem 0",
          }}
        >
          {/* Golden Center Spine */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              width: "2px",
              transform: "translateX(-50%)",
              background: "linear-gradient(to bottom, transparent, var(--athar-gold, #D4AF37) 15%, var(--athar-gold, #D4AF37) 85%, transparent)",
              opacity: 0.45,
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {milestones.map((milestone, idx) => {
              const isEven = idx % 2 === 0;
              const isExpanded = !!expandedMilestones[milestone.id];
              const desc = milestone.description || "";
              const shouldTruncate = desc.length > 180 && !isExpanded;
              const displayDesc = shouldTruncate ? `${desc.slice(0, 180)}...` : desc;

              return (
                <div
                  key={milestone.id || idx}
                  style={{
                    display: "flex",
                    flexDirection: isEven ? "row" : "row-reverse",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  {/* Content Card Side */}
                  <div
                    style={{
                      width: "calc(50% - 28px)",
                      padding: "1.5rem",
                      borderRadius: "20px",
                      background: isNoir
                        ? "linear-gradient(135deg, rgba(35, 26, 30, 0.92), rgba(22, 18, 20, 0.95))"
                        : "linear-gradient(135deg, #FFFFFF, #FAF4ED)",
                      border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
                      transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    }}
                  >
                    {milestone.imageUrl && (
                      <div
                        style={{
                          width: "100%",
                          height: "180px",
                          borderRadius: "14px",
                          overflow: "hidden",
                          marginBottom: "1rem",
                        }}
                      >
                        <img
                          src={milestone.imageUrl}
                          alt={milestone.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                    <div
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        backgroundColor: isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.08)",
                        color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        marginBottom: "0.6rem",
                        border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.3))",
                      }}
                    >
                      {milestone.yearOrDate}
                    </div>

                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-arabic-display, serif)",
                        color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                        margin: "0 0 0.5rem 0",
                      }}
                    >
                      {milestone.title}
                    </h3>

                    <p
                      style={{
                        fontSize: "0.9rem",
                        lineHeight: 1.65,
                        color: isNoir ? "#D6C7B2" : "var(--athar-text-body, #4A4240)",
                        margin: 0,
                      }}
                    >
                      {displayDesc}
                    </p>

                    {desc.length > 180 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(milestone.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--athar-gold, #D4AF37)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          marginTop: "0.5rem",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        {isExpanded ? "عرض أقل · Show less" : "قراءة المزيد · Read more"}
                      </button>
                    )}
                  </div>

                  {/* Golden Center Node */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: isNoir ? "#231A1E" : "#FFFFFF",
                      border: "2px solid var(--athar-gold, #D4AF37)",
                      boxShadow: "0 0 12px rgba(212, 175, 55, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--athar-gold, #D4AF37)",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      zIndex: 2,
                    }}
                  >
                    ✦
                  </div>

                  {/* Empty Spacer Side */}
                  <div style={{ width: "calc(50% - 28px)" }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoupleStorySection;
