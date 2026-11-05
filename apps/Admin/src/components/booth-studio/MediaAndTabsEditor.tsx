import React, { useRef, useState, useEffect } from "react";
import { buildMemoryUrls, validateSubdomainSlug } from "@repo/react-appwrite";
import type { BoothMemory } from "./HeroAndTextsEditor";

export interface BoothMediaItem {
  id: string;
  memoryId?: string;
  mediaType: "photo" | "guestbook_note";
  fileId?: string;
  fileUrl?: string;
  file?: File;
  authorName?: string;
  captionOrNote?: string;
  sortOrder: number;
}

export interface MediaAndTabsEditorProps {
  memory: BoothMemory;
  mediaItems: BoothMediaItem[];
  hasVideoHighlightPlan: boolean;
  maxPhotosQuota: number;
  onChangeMemory: (memory: BoothMemory) => void;
  onChangeMediaItems: (items: BoothMediaItem[]) => void;
}

export const MediaAndTabsEditor: React.FC<MediaAndTabsEditorProps> = ({
  memory,
  mediaItems,
  hasVideoHighlightPlan,
  maxPhotosQuota,
  onChangeMemory,
  onChangeMediaItems,
}) => {
  const [newNoteAuthor, setNewNoteAuthor] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isDownloadingQr, setIsDownloadingQr] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const activeObjectUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup all tracked media preview object URLs upon unmount
  useEffect(() => {
    return () => {
      activeObjectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      activeObjectUrlsRef.current.clear();
    };
  }, []);

  const photos = mediaItems.filter((m) => m.mediaType === "photo");
  const guestBookNotes = mediaItems.filter((m) => m.mediaType === "guestbook_note");

  const memoryUrls = buildMemoryUrls({
    slug: memory.slug || "mina-and-maryam",
    type: "booth",
    port: 3002,
    rendererPort: 3004,
  });
  const slugValidation = validateSubdomainSlug(memory.slug);
  const landingUrl = memoryUrls.canonicalUrl;
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=6B1D28&bgcolor=FBF7F2&data=${encodeURIComponent(
    memoryUrls.canonicalUrl
  )}`;

  // Handle Photo Upload with Object URL Tracking
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files: File[] = Array.from(e.target.files);
      const newItems: BoothMediaItem[] = files.map((file, idx) => {
        const objUrl = URL.createObjectURL(file);
        activeObjectUrlsRef.current.add(objUrl);
        return {
          id: `photo_${Date.now()}_${idx}`,
          mediaType: "photo",
          fileUrl: objUrl,
          file,
          captionOrNote: "",
          sortOrder: photos.length + idx + 1,
        };
      });
      onChangeMediaItems([...mediaItems, ...newItems]);
    }
  };

  // Handle Media Deletion with Object URL Revocation
  const handleDeleteMedia = (id: string) => {
    const itemToDelete = mediaItems.find((m) => m.id === id);
    if (itemToDelete?.fileUrl) {
      if (activeObjectUrlsRef.current.has(itemToDelete.fileUrl)) {
        try {
          URL.revokeObjectURL(itemToDelete.fileUrl);
        } catch {
          // ignore
        }
        activeObjectUrlsRef.current.delete(itemToDelete.fileUrl);
      } else if (itemToDelete.fileUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(itemToDelete.fileUrl);
        } catch {
          // ignore
        }
      }
    }
    onChangeMediaItems(mediaItems.filter((m) => m.id !== id));
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    onChangeMediaItems(
      mediaItems.map((m) => (m.id === id ? { ...m, captionOrNote: caption } : m))
    );
  };

  // Add guestbook note
  const handleAddGuestBookNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: BoothMediaItem = {
      id: `note_${Date.now()}`,
      mediaType: "guestbook_note",
      authorName: newNoteAuthor.trim() || "Loving Guest",
      captionOrNote: newNoteText.trim(),
      sortOrder: guestBookNotes.length + 1,
    };
    onChangeMediaItems([...mediaItems, newNote]);
    setNewNoteAuthor("");
    setNewNoteText("");
  };

  // Download high-res QR Card
  const handleDownloadQrCard = async () => {
    setIsDownloadingQr(true);
    try {
      const response = await fetch(qrCodeApiUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Athar_Table_QR_${memory.slug || "memory"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (_err) {
      window.open(qrCodeApiUrl, "_blank");
    } finally {
      setIsDownloadingQr(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* 1. Photo Gallery Manager */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)" }}>
              📸 Event Photo Gallery (Photos Tab)
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)" }}>
              Showcase moments from the celebration. Photos will appear in the client&apos;s second tab.
            </p>
          </div>

          <span className="athar-badge-gold">
            {photos.length} / {maxPhotosQuota === -1 ? "Unlimited" : maxPhotosQuota} Photos
          </span>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoUpload}
        />

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.2rem" }}>
          <button
            type="button"
            className="btn-athar-primary"
            onClick={() => photoInputRef.current?.click()}
            style={{ fontSize: "0.86rem", padding: "0.5rem 1.2rem" }}
          >
            + Upload Photos
          </button>
        </div>

        {photos.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              background: "rgba(251, 247, 242, 0.4)",
              borderRadius: "12px",
              border: "1px dashed rgba(107, 29, 40, 0.15)",
              color: "var(--athar-text-muted)",
              fontSize: "0.85rem",
            }}
          >
            No gallery photos added yet. Click &quot;+ Upload Photos&quot; to curate the album.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
            }}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  background: "#ffffff",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid rgba(107, 29, 40, 0.1)",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ height: "130px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={photo.fileUrl}
                    alt={photo.captionOrNote || "Gallery photo"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(photo.id)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "rgba(0,0,0,0.6)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                    title="Delete photo"
                  >
                    ×
                  </button>
                </div>
                <div style={{ padding: "0.5rem" }}>
                  <input
                    type="text"
                    value={photo.captionOrNote || ""}
                    onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                    placeholder="Add caption..."
                    style={{
                      width: "100%",
                      fontSize: "0.78rem",
                      padding: "0.3rem 0.4rem",
                      border: "1px solid rgba(107, 29, 40, 0.12)",
                      borderRadius: "6px",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. 30-Second Video Highlight */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)" }}>
            🎬 30-Second Video Highlight Reel (Video Highlights Tab)
          </h3>
          <span
            className={hasVideoHighlightPlan ? "athar-badge-success" : "athar-badge-warning"}
            style={{ fontSize: "0.78rem" }}
          >
            {hasVideoHighlightPlan ? "✓ Included in Plan" : "Requires Add-on / VIP Plan"}
          </span>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)", marginBottom: "1.2rem" }}>
          Highlight banner video featuring 30 seconds of high-energy reception footage or couple vows.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              Video Section Title
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.videoHighlightTitle || "30 Seconds of Your Day"}
              onChange={(e) => onChangeMemory({ ...memory, videoHighlightTitle: e.target.value })}
              placeholder="e.g. 30 Seconds of Your Day"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
              Video Embed URL (MP4 / Vimeo / CDN)
            </label>
            <input
              type="text"
              className="athar-input"
              value={memory.videoHighlightUrl || ""}
              onChange={(e) => onChangeMemory({ ...memory, videoHighlightUrl: e.target.value })}
              placeholder="https://cdn.example.com/videos/wedding-reel.mp4"
            />
          </div>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              if (memory.videoHighlightUrl) {
                if (activeObjectUrlsRef.current.has(memory.videoHighlightUrl)) {
                  try {
                    URL.revokeObjectURL(memory.videoHighlightUrl);
                  } catch {
                    // ignore
                  }
                  activeObjectUrlsRef.current.delete(memory.videoHighlightUrl);
                } else if (memory.videoHighlightUrl.startsWith("blob:")) {
                  try {
                    URL.revokeObjectURL(memory.videoHighlightUrl);
                  } catch {
                    // ignore
                  }
                }
              }
              const newVideoUrl = URL.createObjectURL(file);
              activeObjectUrlsRef.current.add(newVideoUrl);
              onChangeMemory({
                ...memory,
                videoHighlightUrl: newVideoUrl,
              });
            }
          }}
        />

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            type="button"
            className="btn-athar-secondary"
            onClick={() => videoInputRef.current?.click()}
            style={{ fontSize: "0.85rem", padding: "0.45rem 1rem" }}
          >
            📁 Choose Video File
          </button>
          {memory.videoHighlightUrl && (
            <span style={{ fontSize: "0.8rem", color: "var(--athar-status-success)", fontWeight: 700 }}>
              ✓ Video Linked
            </span>
          )}
        </div>
      </div>

      {/* 3. Guest Book & Thank You Message */}
      <div
        style={{
          background: "var(--athar-card-bg)",
          border: "1px solid var(--athar-card-border)",
          borderRadius: "var(--athar-radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--athar-shadow-soft)",
        }}
      >
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--athar-text-title)", marginBottom: "0.4rem" }}>
          📖 Guest Book Notes & Keepsake Thank You Message
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)", marginBottom: "1.2rem" }}>
          Written dedications left in the guest book and the couple&apos;s official thank you note.
        </p>

        <div style={{ marginBottom: "1.2rem" }}>
          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.35rem", color: "var(--athar-text-title)" }}>
            Couple&apos;s Thank You Note
          </label>
          <textarea
            className="athar-textarea"
            dir="auto"
            rows={3}
            value={memory.thankYouMessage || ""}
            onChange={(e) => onChangeMemory({ ...memory, thankYouMessage: e.target.value })}
            placeholder="Thank you from the bottom of our hearts for filling our wedding with love, laughter, and lasting memories..."
          />
        </div>

        {/* Written notes */}
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.6rem", color: "var(--athar-text-title)" }}>
          Written Guest Book Messages ({guestBookNotes.length})
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
          {guestBookNotes.map((note) => (
            <div
              key={note.id}
              style={{
                background: "var(--athar-bg-secondary)",
                borderRadius: "10px",
                padding: "0.8rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--athar-maroon)" }}>
                  {note.authorName}
                </div>
                <div dir="auto" style={{ fontSize: "0.85rem", color: "var(--athar-text-body)", marginTop: "0.2rem" }}>
                  &quot;{note.captionOrNote}&quot;
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMedia(note.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--athar-status-danger)",
                  fontSize: "0.9rem",
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <div
          style={{
            background: "rgba(251, 247, 242, 0.7)",
            padding: "1rem",
            borderRadius: "10px",
            border: "1px dashed rgba(107, 29, 40, 0.15)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: "0.75rem", alignItems: "center" }}>
            <input
              type="text"
              value={newNoteAuthor}
              onChange={(e) => setNewNoteAuthor(e.target.value)}
              placeholder="Guest Name"
              className="athar-input"
              style={{ padding: "0.45rem 0.7rem", fontSize: "0.82rem" }}
            />
            <input
              type="text"
              dir="auto"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a sweet message or wish..."
              className="athar-input"
              style={{ padding: "0.45rem 0.7rem", fontSize: "0.82rem" }}
            />
            <button
              type="button"
              className="btn-athar-secondary"
              onClick={handleAddGuestBookNote}
              style={{ fontSize: "0.82rem", padding: "0.5rem 1rem" }}
            >
              + Add Note
            </button>
          </div>
        </div>
      </div>

      {/* 4. Client Landing QR Code Generator Card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(251, 247, 242, 0.95) 0%, rgba(244, 239, 234, 0.95) 100%)",
          border: "2px solid var(--athar-gold)",
          borderRadius: "var(--athar-radius-xl)",
          padding: "1.8rem",
          boxShadow: "var(--athar-shadow-gold)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div className="athar-badge-gold" style={{ marginBottom: "0.4rem" }}>
              👑 ATHAR LUXURY GUEST ACCESS KIT
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--athar-maroon)" }}>
              Print-Ready Reception Table QR Card
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--athar-text-muted)" }}>
              Guests scan this QR code on dining tables to open the couple&apos;s Memory Vault instantly on their smartphones.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <a
              href={landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-athar-primary"
              style={{ textDecoration: "none", fontSize: "0.85rem" }}
            >
              Open Live Storefront ↗
            </a>
            <a
              href={memoryUrls.devRendererUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-athar-gold"
              style={{ textDecoration: "none", fontSize: "0.85rem" }}
            >
              Dedicated Renderer (:3004) ↗
            </a>
            <a
              href={memoryUrls.devQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-athar-secondary"
              style={{ textDecoration: "none", fontSize: "0.85rem" }}
            >
              Dev Test Link ↗
            </a>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", marginTop: "1rem" }}>
          {/* Branded QR Card Mockup */}
          <div
            style={{
              width: "180px",
              background: "#FBF7F2",
              padding: "1rem",
              borderRadius: "16px",
              border: "1.5px solid var(--athar-gold)",
              boxShadow: "var(--athar-shadow-soft)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.08em", color: "var(--athar-maroon)", marginBottom: "0.4rem" }}>
              ATHAR AUDIO VAULT
            </div>
            <img
              src={qrCodeApiUrl}
              alt="Athar Reception QR"
              style={{ width: "140px", height: "140px", borderRadius: "8px", margin: "0 auto", display: "block" }}
            />
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--athar-text-title)", marginTop: "0.4rem" }}>
              {memory.coupleTitle || "Mina & Maryam"}
            </div>
            <div style={{ fontSize: "0.62rem", color: "var(--athar-text-muted)" }}>
              Scan to Listen & Reminisce
            </div>
          </div>

          {/* Action details */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--athar-text-title)" }}>
                Canonical Storefront URL (QR Destination):
              </div>
              <code style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--athar-maroon)", wordBreak: "break-all" }}>
                {landingUrl}
              </code>
              <div style={{ fontSize: "0.78rem", color: "var(--athar-text-muted)", marginTop: "0.3rem", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                <span>Dedicated Renderer: <code style={{ color: "var(--athar-maroon)", fontWeight: 700 }}>{memoryUrls.devRendererUrl}</code></span>
                <span>Local Dev Loopback: <code style={{ color: "var(--athar-text-title)" }}>{memoryUrls.devQueryUrl}</code></span>
              </div>
              {!slugValidation.isValid && (
                <div style={{ fontSize: "0.75rem", color: "var(--athar-status-danger)", fontWeight: 700, marginTop: "0.35rem" }}>
                  ⚠️ Warning: {slugValidation.error}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-athar-gold"
                onClick={handleDownloadQrCard}
                disabled={isDownloadingQr}
                style={{ fontSize: "0.86rem", padding: "0.55rem 1.3rem" }}
              >
                {isDownloadingQr ? "⏳ Downloading..." : "📥 Download Print-Ready QR (PNG)"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
