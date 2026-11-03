import React, { useState } from "react";

export type SectionBlockType =
  | "hero"
  | "countdown"
  | "story_timeline"
  | "gallery"
  | "venue_map"
  | "custom_highlight"
  | "rsvp_form";

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface DressCodeColor {
  hex: string;
  label: string;
}

export interface InvitationSectionBlock {
  id: string;
  type: SectionBlockType;
  title: string;
  isVisible: boolean;
  isLocked?: boolean;
  // Hero
  overline?: string;
  mainTitle?: string;
  subtitle?: string;
  coverImageUrl?: string;
  datePill?: string;
  timePill?: string;
  venuePill?: string;
  ctaText?: string;
  // Countdown
  targetDate?: string;
  countdownHeading?: string;
  // Story / Timeline
  timelineItems?: TimelineItem[];
  // Gallery
  galleryImages?: string[];
  galleryMode?: "circular-3d" | "polaroid-decay" | "bento-masonry";
  // Venue
  venueName?: string;
  venueAddress?: string;
  mapUrl?: string;
  parkingNote?: string;
  dressCodeSwatches?: DressCodeColor[];
  // Highlight
  highlightBadge?: string;
  highlightText?: string;
  highlightImageUrl?: string;
}

export const DEFAULT_SECTION_BLOCKS: InvitationSectionBlock[] = [
  {
    id: "block-hero",
    type: "hero",
    title: "Hero Showcase Block",
    isVisible: true,
    overline: "CORDIALLY INVITES YOU TO CELEBRATE",
    mainTitle: "Omar & Layla",
    subtitle: "Two souls, one timeless journey. Join us under the Mediterranean stars.",
    coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    datePill: "20 November 2026",
    timePill: "07:30 PM",
    venuePill: "Four Seasons Hotel, Alexandria",
    ctaText: "Confirm Your Attendance",
  },
  {
    id: "block-countdown",
    type: "countdown",
    title: "Live Countdown Timer",
    isVisible: true,
    countdownHeading: "Counting Down to Our Forever",
    targetDate: "2026-11-20T19:30:00",
  },
  {
    id: "block-story",
    type: "story_timeline",
    title: "Story & Program Schedule",
    isVisible: true,
    timelineItems: [
      { id: "tl-1", time: "07:00 PM", title: "Welcome Drinks & Red Carpet", description: "Arrival of guests, welcome elixirs and live string quartet in the courtyard." },
      { id: "tl-2", time: "08:15 PM", title: "Ceremony & Exchange of Vows", description: "Sunset ceremony facing the Mediterranean sea." },
      { id: "tl-3", time: "09:30 PM", title: "Royal Dinner & Celebrations", description: "Curated fine dining, toasts, and evening entertainment." },
      { id: "tl-4", time: "11:30 PM", title: "Cake Cutting & Midnight Athar", description: "Audio booth messages and dessert lounge." },
    ],
  },
  {
    id: "block-gallery",
    type: "gallery",
    title: "Photo & Memory Gallery",
    isVisible: true,
    galleryMode: "circular-3d",
    galleryImages: [
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "block-venue",
    type: "venue_map",
    title: "Venue Location & Dress Code",
    isVisible: true,
    venueName: "Four Seasons Hotel Alexandria",
    venueAddress: "Corniche Road, San Stefano, Alexandria, Egypt",
    mapUrl: "https://maps.google.com/?q=Four+Seasons+Hotel+Alexandria+at+San+Stefano",
    parkingNote: "Complimentary valet parking available at the main ballroom entrance.",
    dressCodeSwatches: [
      { hex: "#141115", label: "Black Tie / Formal" },
      { hex: "#6B1D28", label: "Deep Burgundy" },
      { hex: "#D4AF37", label: "Champagne Gold" },
      { hex: "#FBF7F2", label: "Ivory / Warm White" },
    ],
  },
  {
    id: "block-highlight",
    type: "custom_highlight",
    title: "Editorial Highlight & Verse",
    isVisible: true,
    highlightBadge: "✦ A WORD OF GRATITUDE",
    mainTitle: "Our Heartfelt Gratitude",
    highlightText: "To our beloved family and dear friends: your love, prayers, and presence make our milestone complete. We cannot wait to share an unforgettable evening with you.",
    highlightImageUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "block-rsvp",
    type: "rsvp_form",
    title: "Dynamic RSVP Form Block",
    isVisible: true,
    isLocked: true,
  },
];

export interface SectionBlocksManagerProps {
  blocks: InvitationSectionBlock[];
  onChange: (blocks: InvitationSectionBlock[]) => void;
  onNavigateToFormBuilder?: () => void;
}

export const SectionBlocksManager: React.FC<SectionBlocksManagerProps> = ({
  blocks,
  onChange,
  onNavigateToFormBuilder,
}) => {
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>("block-hero");

  const handleToggleVisible = (blockId: string) => {
    const updated = blocks.map((b) => {
      if (b.id === blockId) {
        if (b.type === "rsvp_form") return b; // locked visible
        return { ...b, isVisible: !b.isVisible };
      }
      return b;
    });
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const targetBlock = blocks[index];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const destBlock = blocks[newIndex];

    // Ensure rsvp_form stays at the bottom
    if (targetBlock.type === "rsvp_form" || destBlock.type === "rsvp_form") {
      // Don't move rsvp_form above other blocks or move other blocks below rsvp_form
      if (direction === "up" && targetBlock.type === "rsvp_form") return;
      if (direction === "down" && destBlock.type === "rsvp_form") return;
    }

    const next = [...blocks];
    next[index] = destBlock;
    next[newIndex] = targetBlock;
    onChange(next);
  };

  const handleDelete = (blockId: string) => {
    const target = blocks.find((b) => b.id === blockId);
    if (target?.type === "rsvp_form" || target?.isLocked) return;
    const filtered = blocks.filter((b) => b.id !== blockId);
    onChange(filtered);
  };

  const handleDuplicate = (block: InvitationSectionBlock) => {
    if (block.type === "rsvp_form") return;
    const clone: InvitationSectionBlock = {
      ...block,
      id: `block-${block.type}-${Date.now().toString().slice(-4)}`,
      title: `${block.title} (Copy)`,
    };
    // Insert right after current block
    const index = blocks.findIndex((b) => b.id === block.id);
    const next = [...blocks];
    next.splice(index + 1, 0, clone);
    onChange(next);
  };

  const handleAddCustomHighlight = () => {
    const newHighlight: InvitationSectionBlock = {
      id: `block-highlight-${Date.now().toString().slice(-4)}`,
      type: "custom_highlight",
      title: "Custom VIP Highlight Banner",
      isVisible: true,
      highlightBadge: "✦ SPECIAL HIGHLIGHT",
      mainTitle: "Keynote / Feature Story",
      highlightText: "Write a featured editorial note, musical guest lineup, or special instructions for your guests here.",
      highlightImageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    };
    // Insert before RSVP form
    const rsvpIndex = blocks.findIndex((b) => b.type === "rsvp_form");
    const next = [...blocks];
    if (rsvpIndex !== -1) {
      next.splice(rsvpIndex, 0, newHighlight);
    } else {
      next.push(newHighlight);
    }
    onChange(next);
    setExpandedBlockId(newHighlight.id);
  };

  const handleUpdateBlock = (blockId: string, partial: Partial<InvitationSectionBlock>) => {
    const updated = blocks.map((b) => (b.id === blockId ? { ...b, ...partial } : b));
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--athar-text-title, #231F20)" }}>
            Composable Page Sections Manager
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted, #7A6F6D)", marginTop: "0.25rem" }}>
            Reorder, toggle visibility, and configure editorial content blocks for the celebration.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCustomHighlight}
          style={{
            background: "#6B1D28",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(107, 29, 40, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          + Add Highlight Section
        </button>
      </div>

      {/* Blocks List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {blocks.map((block, index) => {
          const isExpanded = expandedBlockId === block.id;
          const isRsvp = block.type === "rsvp_form";

          return (
            <div
              key={block.id}
              style={{
                background: "#FFFFFF",
                border: isExpanded ? "1.5px solid #6B1D28" : "1px solid rgba(0,0,0,0.1)",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: isExpanded ? "0 6px 18px rgba(107, 29, 40, 0.08)" : "0 2px 6px rgba(0,0,0,0.02)",
                transition: "all 0.2s ease",
              }}
            >
              {/* Block Header Row */}
              <div
                style={{
                  padding: "0.85rem 1.1rem",
                  background: isExpanded ? "rgba(107, 29, 40, 0.03)" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#6B1D28", fontFamily: "monospace" }}>
                    #{index + 1}
                  </span>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#231F20" }}>
                        {block.title}
                      </span>
                      {isRsvp && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: "rgba(212, 175, 55, 0.2)",
                            color: "#856404",
                            border: "1px solid rgba(212, 175, 55, 0.4)",
                            borderRadius: "999px",
                            padding: "0.1rem 0.45rem",
                            fontWeight: 700,
                          }}
                        >
                          🔒 Anchored Form
                        </span>
                      )}
                      {!block.isVisible && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            background: "rgba(0,0,0,0.06)",
                            color: "#7A6F6D",
                            borderRadius: "999px",
                            padding: "0.1rem 0.45rem",
                            fontWeight: 600,
                          }}
                        >
                          Hidden on page
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "#7A6F6D", textTransform: "uppercase" }}>
                      Type: {block.type}
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Visibility toggle */}
                  {!isRsvp && (
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(block.id)}
                      style={{
                        background: block.isVisible ? "rgba(30, 111, 80, 0.1)" : "rgba(0,0,0,0.06)",
                        color: block.isVisible ? "#1E6F50" : "#7A6F6D",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "6px",
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      title="Toggle Visibility"
                    >
                      {block.isVisible ? "👁️ Visible" : "✕ Hidden"}
                    </button>
                  )}

                  {/* Move Up/Down */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0 || isRsvp}
                    style={{
                      background: "none",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "6px",
                      padding: "0.25rem 0.45rem",
                      cursor: index === 0 || isRsvp ? "not-allowed" : "pointer",
                      opacity: index === 0 || isRsvp ? 0.3 : 1,
                      fontSize: "0.75rem",
                    }}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === blocks.length - 1 || isRsvp || blocks[index + 1]?.type === "rsvp_form"}
                    style={{
                      background: "none",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "6px",
                      padding: "0.25rem 0.45rem",
                      cursor:
                        index === blocks.length - 1 || isRsvp || blocks[index + 1]?.type === "rsvp_form"
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        index === blocks.length - 1 || isRsvp || blocks[index + 1]?.type === "rsvp_form" ? 0.3 : 1,
                      fontSize: "0.75rem",
                    }}
                    title="Move Down"
                  >
                    ▼
                  </button>

                  {/* Duplicate */}
                  {!isRsvp && (
                    <button
                      type="button"
                      onClick={() => handleDuplicate(block)}
                      style={{
                        background: "none",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "6px",
                        padding: "0.25rem 0.45rem",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                      title="Duplicate Section"
                    >
                      ⎘
                    </button>
                  )}

                  {/* Delete */}
                  {!isRsvp && (
                    <button
                      type="button"
                      onClick={() => handleDelete(block.id)}
                      style={{
                        background: "rgba(155, 44, 44, 0.08)",
                        border: "1px solid rgba(155, 44, 44, 0.2)",
                        color: "#9B2C2C",
                        borderRadius: "6px",
                        padding: "0.25rem 0.45rem",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                      }}
                      title="Delete Section"
                    >
                      🗑️
                    </button>
                  )}

                  <span style={{ fontSize: "0.8rem", color: "#7A6F6D", marginLeft: "0.3rem" }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* Block Editor Content */}
              {isExpanded && (
                <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* HERO BLOCK EDITOR */}
                  {block.type === "hero" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Overline Tag</label>
                          <input
                            type="text"
                            value={block.overline || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { overline: e.target.value })}
                            placeholder="e.g. CORDIALLY INVITES YOU TO CELEBRATE"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Main Event Title</label>
                          <input
                            type="text"
                            value={block.mainTitle || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { mainTitle: e.target.value })}
                            placeholder="e.g. Omar & Layla"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Poetic Subtitle</label>
                        <textarea
                          rows={2}
                          value={block.subtitle || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { subtitle: e.target.value })}
                          placeholder="e.g. Two souls, one timeless journey..."
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem", resize: "vertical" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Cover Photo URL</label>
                        <input
                          type="text"
                          value={block.coverImageUrl || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { coverImageUrl: e.target.value })}
                          placeholder="https://..."
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Date Display Pill</label>
                          <input
                            type="text"
                            value={block.datePill || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { datePill: e.target.value })}
                            placeholder="20 November 2026"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Time Display Pill</label>
                          <input
                            type="text"
                            value={block.timePill || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { timePill: e.target.value })}
                            placeholder="07:30 PM"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Venue Display Pill</label>
                          <input
                            type="text"
                            value={block.venuePill || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { venuePill: e.target.value })}
                            placeholder="Four Seasons, Alex"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Primary Call to Action (CTA)</label>
                        <input
                          type="text"
                          value={block.ctaText || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { ctaText: e.target.value })}
                          placeholder="e.g. Confirm Your Attendance"
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* COUNTDOWN BLOCK EDITOR */}
                  {block.type === "countdown" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Countdown Heading</label>
                        <input
                          type="text"
                          value={block.countdownHeading || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { countdownHeading: e.target.value })}
                          placeholder="e.g. Doors Open In / Counting Down to Our Forever"
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Target Date & Time</label>
                        <input
                          type="datetime-local"
                          value={block.targetDate ? block.targetDate.slice(0, 16) : ""}
                          onChange={(e) => handleUpdateBlock(block.id, { targetDate: e.target.value })}
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* STORY & SCHEDULE TIMELINE */}
                  {block.type === "story_timeline" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6B1D28" }}>Timeline Milestones</span>
                        <button
                          type="button"
                          onClick={() => {
                            const items = block.timelineItems || [];
                            const newItem: TimelineItem = {
                              id: `tl-${Date.now().toString().slice(-4)}`,
                              time: "10:00 PM",
                              title: "Evening Milestone",
                              description: "Description of this program highlight.",
                            };
                            handleUpdateBlock(block.id, { timelineItems: [...items, newItem] });
                          }}
                          style={{
                            background: "rgba(107, 29, 40, 0.08)",
                            color: "#6B1D28",
                            border: "1px solid rgba(107, 29, 40, 0.2)",
                            borderRadius: "6px",
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          + Add Item
                        </button>
                      </div>

                      {(block.timelineItems || []).map((item, idx) => (
                        <div
                          key={item.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "100px 1.5fr 2fr 30px",
                            gap: "0.5rem",
                            alignItems: "center",
                            background: "rgba(0,0,0,0.02)",
                            padding: "0.5rem",
                            borderRadius: "8px",
                          }}
                        >
                          <input
                            type="text"
                            value={item.time}
                            placeholder="07:00 PM"
                            onChange={(e) => {
                              const items = [...(block.timelineItems || [])];
                              items[idx] = { ...items[idx], time: e.target.value };
                              handleUpdateBlock(block.id, { timelineItems: items });
                            }}
                            style={{ padding: "0.3rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.8rem" }}
                          />
                          <input
                            type="text"
                            value={item.title}
                            placeholder="Title"
                            onChange={(e) => {
                              const items = [...(block.timelineItems || [])];
                              items[idx] = { ...items[idx], title: e.target.value };
                              handleUpdateBlock(block.id, { timelineItems: items });
                            }}
                            style={{ padding: "0.3rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.8rem" }}
                          />
                          <input
                            type="text"
                            value={item.description}
                            placeholder="Description"
                            onChange={(e) => {
                              const items = [...(block.timelineItems || [])];
                              items[idx] = { ...items[idx], description: e.target.value };
                              handleUpdateBlock(block.id, { timelineItems: items });
                            }}
                            style={{ padding: "0.3rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.8rem" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const items = (block.timelineItems || []).filter((i) => i.id !== item.id);
                              handleUpdateBlock(block.id, { timelineItems: items });
                            }}
                            style={{ background: "none", border: "none", color: "#9B2C2C", cursor: "pointer", fontSize: "0.8rem" }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* GALLERY BLOCK */}
                  {block.type === "gallery" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Display Mode</label>
                        <select
                          value={block.galleryMode || "circular-3d"}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, {
                              galleryMode: e.target.value as "circular-3d" | "polaroid-decay" | "bento-masonry",
                            })
                          }
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        >
                          <option value="circular-3d">CircularGallery 3D Revolving Cylinder</option>
                          <option value="polaroid-decay">DecayCard Polaroid Physics Cards</option>
                          <option value="bento-masonry">Bento Luxury Editorial Masonry</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>
                          Image URLs (one per line)
                        </label>
                        <textarea
                          rows={4}
                          value={(block.galleryImages || []).join("\n")}
                          onChange={(e) => {
                            const urls = e.target.value.split("\n").map((u) => u.trim()).filter(Boolean);
                            handleUpdateBlock(block.id, { galleryImages: urls });
                          }}
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.8rem", fontFamily: "monospace" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* VENUE & MAP BLOCK */}
                  {block.type === "venue_map" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Venue Name</label>
                          <input
                            type="text"
                            value={block.venueName || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { venueName: e.target.value })}
                            placeholder="Four Seasons Alexandria"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Google Maps URL</label>
                          <input
                            type="text"
                            value={block.mapUrl || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { mapUrl: e.target.value })}
                            placeholder="https://maps.google.com/..."
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Full Address</label>
                        <input
                          type="text"
                          value={block.venueAddress || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { venueAddress: e.target.value })}
                          placeholder="Corniche Road, San Stefano, Alexandria, Egypt"
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Parking & Valet Note</label>
                        <input
                          type="text"
                          value={block.parkingNote || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { parkingNote: e.target.value })}
                          placeholder="Valet parking available at entrance..."
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CUSTOM HIGHLIGHT BLOCK */}
                  {block.type === "custom_highlight" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Badge Eyebrow</label>
                          <input
                            type="text"
                            value={block.highlightBadge || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { highlightBadge: e.target.value })}
                            placeholder="✦ SPECIAL GUEST / VERSE"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Banner Heading</label>
                          <input
                            type="text"
                            value={block.mainTitle || ""}
                            onChange={(e) => handleUpdateBlock(block.id, { mainTitle: e.target.value })}
                            placeholder="Keynote Speaker / A Word of Gratitude"
                            style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Editorial Text</label>
                        <textarea
                          rows={3}
                          value={block.highlightText || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { highlightText: e.target.value })}
                          placeholder="Write rich paragraph or poetical quote..."
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.75rem", color: "#7A6F6D", fontWeight: 600 }}>Accent Image URL (Optional)</label>
                        <input
                          type="text"
                          value={block.highlightImageUrl || ""}
                          onChange={(e) => handleUpdateBlock(block.id, { highlightImageUrl: e.target.value })}
                          placeholder="https://..."
                          style={{ width: "100%", padding: "0.45rem", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* RSVP FORM BLOCK */}
                  {block.type === "rsvp_form" && (
                    <div
                      style={{
                        background: "rgba(212, 175, 55, 0.08)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                        borderRadius: "10px",
                        padding: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#6B1D28" }}>
                          🔒 Anchored Dynamic RSVP Form
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#7A6F6D", marginTop: "0.2rem" }}>
                          This block is permanently anchored at the end of the invitation. Configure guest fields in Tab 3.
                        </div>
                      </div>
                      {onNavigateToFormBuilder && (
                        <button
                          type="button"
                          onClick={onNavigateToFormBuilder}
                          style={{
                            background: "#6B1D28",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.45rem 0.9rem",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          → Open RSVP Form Builder
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
