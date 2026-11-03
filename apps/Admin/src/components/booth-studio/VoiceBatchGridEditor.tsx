import React, { useState, useRef, useEffect } from "react";
import type { BoothVoiceRecord } from "./BulkVoiceUploader";

export interface VoiceBatchGridEditorProps {
  records: BoothVoiceRecord[];
  categories: string[];
  onChangeRecords: (records: BoothVoiceRecord[]) => void;
  onUploadAll?: () => Promise<void>;
}

export const VoiceBatchGridEditor: React.FC<VoiceBatchGridEditorProps> = ({
  records,
  categories,
  onChangeRecords,
  onUploadAll,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>("All");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>(categories[0] || "Friends");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const filteredRecords = records.filter((r) => {
    if (activeFilterCategory === "All") return true;
    return r.category.toLowerCase() === activeFilterCategory.toLowerCase();
  });

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = records.filter((r) => r.category.toLowerCase() === cat.toLowerCase()).length;
    return acc;
  }, {} as Record<string, number>);

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredRecords.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleUpdateRecord = (id: string, updates: Partial<BoothVoiceRecord>) => {
    const updated = records.map((r) => (r.id === id ? { ...r, ...updates } : r));
    onChangeRecords(updated);
  };

  const handleDeleteRecord = (id: string) => {
    if (playingId === id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    const updated = records.filter((r) => r.id !== id);
    onChangeRecords(updated);
    const next = new Set(selectedIds);
    next.delete(id);
    setSelectedIds(next);
  };

  const handleMoveRecord = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= records.length) return;
    const cloned = [...records];
    const temp = cloned[index];
    cloned[index] = cloned[targetIndex];
    cloned[targetIndex] = temp;
    // update sort orders
    const normalized = cloned.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    onChangeRecords(normalized);
  };

  const handlePlayToggle = (record: BoothVoiceRecord) => {
    if (playingId === record.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      setPlayingId(record.id);
      if (record.audioUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => setPlayingId(null);
        }
        audioRef.current.src = record.audioUrl;
        audioRef.current.play().catch(() => {
          // Playback failed or blocked
        });
      }
    }
  };

  const handleApplyBulkCategory = () => {
    if (selectedIds.size === 0) return;
    const updated = records.map((r) => {
      if (selectedIds.has(r.id)) {
        return { ...r, category: bulkCategoryTarget };
      }
      return r;
    });
    onChangeRecords(updated);
  };

  const handleAutoFillDefaultQuotes = () => {
    const sampleBlessings: Record<string, string[]> = {
      Family: [
        "ألف مبروك يا حبايب قلبي، ربنا يتمم لكم على خير ويبارك في بيتكم",
        "فرحانين ليكم من كل قلبنا، ربنا يسعدكم ويديم المحبة بينكم",
        "بيت عامر دايماً بالخير والفرحة، أحلى عريس وأحلى عروسة",
      ],
      Friends: [
        "ألف مبروك يا غاليين، ليلة من أحلى ليالي العمر ربنا يسعدكم",
        "Mabrook ya gameela! Wishing you a lifetime of laughter and boundless love",
        "عقبال ميت سنة فرح وهنا سوا، منورين الدنيا كلها النهاردة",
      ],
      Colleagues: [
        "Congratulations! Wishing you a magnificent journey together filled with joy",
        "ألف مبروك الزواج السعيد مع أطيب التمنيات بدوام التوفيق والبركة",
      ],
      "Special Guests": [
        "بارك الله لكما وبارك عليكما وجمع بينكما في خير وسعادة دائمة",
        "أجمل التهاني القلبية بمناسبة الزفاف المبارك، ألف مبروك",
      ],
    };

    const updated = records.map((r) => {
      if (!r.quoteSnippet || r.quoteSnippet.trim() === "") {
        const pool = sampleBlessings[r.category] || sampleBlessings.Friends;
        const randomQuote = pool[Math.floor(Math.random() * pool.length)];
        return { ...r, quoteSnippet: randomQuote };
      }
      return r;
    });
    onChangeRecords(updated);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const updated = records.filter((r) => !selectedIds.has(r.id));
    onChangeRecords(updated);
    setSelectedIds(new Set());
  };

  const handleSimulateUpload = async () => {
    if (onUploadAll) {
      await onUploadAll();
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: records.length });

    // Chunking in batches of 5
    const chunkSize = 5;
    for (let i = 0; i < records.length; i += chunkSize) {
      await new Promise((res) => setTimeout(res, 250));
      const current = Math.min(i + chunkSize, records.length);
      setUploadProgress({ current, total: records.length });
    }

    setIsUploading(false);
  };

  return (
    <div
      style={{
        background: "var(--athar-card-bg)",
        border: "1px solid var(--athar-card-border)",
        borderRadius: "var(--athar-radius-lg)",
        padding: "1.5rem",
        boxShadow: "var(--athar-shadow-soft)",
      }}
    >
      {/* Category Filter Pills Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.2rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid rgba(107, 29, 40, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--athar-text-muted)" }}>
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setActiveFilterCategory("All")}
            style={{
              padding: "0.35rem 0.85rem",
              borderRadius: "9999px",
              border: activeFilterCategory === "All" ? "1px solid var(--athar-maroon)" : "1px solid rgba(107, 29, 40, 0.15)",
              background: activeFilterCategory === "All" ? "var(--athar-maroon)" : "#ffffff",
              color: activeFilterCategory === "All" ? "#ffffff" : "var(--athar-text-title)",
              fontWeight: 700,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            All ({records.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveFilterCategory(cat)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                border: activeFilterCategory === cat ? "1px solid var(--athar-maroon)" : "1px solid rgba(107, 29, 40, 0.15)",
                background: activeFilterCategory === cat ? "var(--athar-maroon)" : "#ffffff",
                color: activeFilterCategory === cat ? "#ffffff" : "var(--athar-text-title)",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {cat} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn-athar-secondary"
            onClick={handleAutoFillDefaultQuotes}
            style={{ fontSize: "0.82rem", padding: "0.45rem 0.9rem" }}
            title="Auto-fill heartfelt wedding blessings into empty quote fields"
          >
            ✨ Auto-Fill Quotes
          </button>
          <button
            type="button"
            className="btn-athar-primary"
            onClick={handleSimulateUpload}
            disabled={isUploading || records.length === 0}
            style={{ fontSize: "0.82rem", padding: "0.45rem 1.1rem" }}
          >
            {isUploading
              ? `☁️ Uploading (${uploadProgress.current}/${uploadProgress.total})...`
              : `☁️ Upload & Save All (${records.length})`}
          </button>
        </div>
      </div>

      {/* Bulk Actions Sub-Toolbar (When items are selected) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          background: selectedIds.size > 0 ? "rgba(212, 175, 55, 0.12)" : "var(--athar-bg-secondary)",
          padding: "0.6rem 1rem",
          borderRadius: "10px",
          marginBottom: "1rem",
          border: selectedIds.size > 0 ? "1px solid rgba(212, 175, 55, 0.5)" : "1px solid transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }}>
            <input
              type="checkbox"
              checked={filteredRecords.length > 0 && selectedIds.size === filteredRecords.length}
              onChange={handleSelectAll}
              style={{ accentColor: "var(--athar-maroon)" }}
            />
            <span>Select All ({filteredRecords.length})</span>
          </label>
          {selectedIds.size > 0 && (
            <span className="athar-badge-maroon" style={{ fontSize: "0.76rem" }}>
              {selectedIds.size} selected
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--athar-text-muted)" }}>Set Category:</span>
            <select
              value={bulkCategoryTarget}
              onChange={(e) => setBulkCategoryTarget(e.target.value)}
              style={{
                fontSize: "0.8rem",
                padding: "0.3rem 0.6rem",
                borderRadius: "8px",
                border: "1px solid rgba(107, 29, 40, 0.2)",
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleApplyBulkCategory}
              className="btn-athar-secondary"
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="btn-athar-secondary"
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem", color: "var(--athar-status-danger)" }}
            >
              🗑️ Delete ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {/* Spreadsheet Batch Table */}
      {filteredRecords.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "var(--athar-text-muted)",
            background: "rgba(251, 247, 242, 0.4)",
            borderRadius: "12px",
            border: "1px dashed rgba(107, 29, 40, 0.15)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎙️</div>
          <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>No Voice Tracks in this Category</div>
          <p style={{ fontSize: "0.82rem" }}>
            Drag and drop audio files above or click <strong>&quot;Simulate Bulk Drop&quot;</strong> to populate.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 6px",
              fontSize: "0.86rem",
            }}
          >
            <thead>
              <tr style={{ color: "var(--athar-text-muted)", fontSize: "0.76rem", textTransform: "uppercase" }}>
                <th style={{ width: "36px", padding: "0.4rem 0.5rem", textAlign: "center" }}>#</th>
                <th style={{ width: "42px", padding: "0.4rem 0.5rem", textAlign: "center" }}>Play</th>
                <th style={{ width: "170px", padding: "0.4rem 0.5rem", textAlign: "left" }}>Speaker Name</th>
                <th style={{ width: "130px", padding: "0.4rem 0.5rem", textAlign: "left" }}>Role / Relation</th>
                <th style={{ width: "130px", padding: "0.4rem 0.5rem", textAlign: "left" }}>Category</th>
                <th style={{ padding: "0.4rem 0.5rem", textAlign: "left" }}>Quote / Blessing (dir=&quot;auto&quot;)</th>
                <th style={{ width: "130px", padding: "0.4rem 0.5rem", textAlign: "center" }}>Waveform</th>
                <th style={{ width: "40px", padding: "0.4rem 0.5rem", textAlign: "center" }}>Fav</th>
                <th style={{ width: "65px", padding: "0.4rem 0.5rem", textAlign: "center" }}>Order</th>
                <th style={{ width: "40px", padding: "0.4rem 0.5rem", textAlign: "center" }}>Del</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => {
                const isSelected = selectedIds.has(record.id);
                const isPlaying = playingId === record.id;

                return (
                  <tr
                    key={record.id}
                    style={{
                      background: isSelected ? "rgba(212, 175, 55, 0.08)" : "#ffffff",
                      borderRadius: "8px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                      border: "1px solid rgba(107, 29, 40, 0.08)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(record.id)}
                        style={{ accentColor: "var(--athar-maroon)", cursor: "pointer" }}
                      />
                    </td>

                    {/* Inline Audition Player */}
                    <td style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => handlePlayToggle(record)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          background: isPlaying ? "var(--athar-maroon)" : "rgba(107, 29, 40, 0.08)",
                          color: isPlaying ? "#ffffff" : "var(--athar-maroon)",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          transition: "all 0.15s ease",
                        }}
                        title={isPlaying ? "Pause" : "Listen / Audition"}
                      >
                        {isPlaying ? "⏸" : "▶"}
                      </button>
                    </td>

                    {/* Speaker Name Input */}
                    <td style={{ padding: "0.6rem 0.4rem" }}>
                      <input
                        type="text"
                        value={record.speakerName}
                        onChange={(e) => handleUpdateRecord(record.id, { speakerName: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          borderRadius: "6px",
                          border: "1px solid rgba(107, 29, 40, 0.16)",
                          outline: "none",
                        }}
                        placeholder="Speaker Name"
                      />
                    </td>

                    {/* Role Input */}
                    <td style={{ padding: "0.6rem 0.4rem" }}>
                      <input
                        type="text"
                        value={record.speakerRole}
                        onChange={(e) => handleUpdateRecord(record.id, { speakerRole: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(107, 29, 40, 0.16)",
                          outline: "none",
                        }}
                        placeholder="e.g. Best Friend"
                      />
                    </td>

                    {/* Category Dropdown */}
                    <td style={{ padding: "0.6rem 0.4rem" }}>
                      <select
                        value={record.category}
                        onChange={(e) => handleUpdateRecord(record.id, { category: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.4rem",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          borderRadius: "6px",
                          border: "1px solid rgba(107, 29, 40, 0.16)",
                          background: "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Quote Input with dir="auto" */}
                    <td style={{ padding: "0.6rem 0.4rem" }}>
                      <input
                        type="text"
                        dir="auto"
                        value={record.quoteSnippet}
                        onChange={(e) => handleUpdateRecord(record.id, { quoteSnippet: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.82rem",
                          borderRadius: "6px",
                          border: "1px solid rgba(107, 29, 40, 0.16)",
                          outline: "none",
                        }}
                        placeholder="e.g. Mabrook ya gameela, ربنا يسعدكم..."
                      />
                    </td>

                    {/* Mini Waveform & Duration */}
                    <td style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1px",
                            height: "18px",
                            width: "96px",
                          }}
                        >
                          {record.waveformPeaks.slice(0, 24).map((peak, pIdx) => (
                            <div
                              key={pIdx}
                              style={{
                                flex: 1,
                                height: `${Math.max(15, peak * 100)}%`,
                                background: isPlaying ? "var(--athar-maroon)" : "var(--athar-gold)",
                                borderRadius: "1px",
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--athar-text-muted)", fontFamily: "monospace" }}>
                          {record.durationFormatted}
                        </span>
                      </div>
                    </td>

                    {/* Favorite Star Toggle */}
                    <td style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateRecord(record.id, { isFeatured: !record.isFeatured })}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "1.1rem",
                          cursor: "pointer",
                          color: record.isFeatured ? "#D4AF37" : "#CBD5E1",
                        }}
                        title={record.isFeatured ? "Featured memory" : "Mark as featured"}
                      >
                        {record.isFeatured ? "★" : "☆"}
                      </button>
                    </td>

                    {/* Up / Down Reorder */}
                    <td style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                      <div style={{ display: "inline-flex", gap: "2px" }}>
                        <button
                          type="button"
                          onClick={() => handleMoveRecord(index, "up")}
                          disabled={index === 0}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            opacity: index === 0 ? 0.3 : 1,
                            fontSize: "0.75rem",
                            padding: "2px 4px",
                          }}
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRecord(index, "down")}
                          disabled={index === filteredRecords.length - 1}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: index === filteredRecords.length - 1 ? "not-allowed" : "pointer",
                            opacity: index === filteredRecords.length - 1 ? 0.3 : 1,
                            fontSize: "0.75rem",
                            padding: "2px 4px",
                          }}
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                    </td>

                    {/* Delete Action */}
                    <td style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(record.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--athar-status-danger)",
                          fontSize: "0.95rem",
                        }}
                        title="Delete track"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
