import React from "react";
import type { DigitalGiftRegistrySection, GiftAccount } from "@repo/react-appwrite";

export interface DigitalGiftRegistryInspectorProps {
  section: DigitalGiftRegistrySection;
  onChange: (updated: DigitalGiftRegistrySection) => void;
}

export const DigitalGiftRegistryInspector: React.FC<DigitalGiftRegistryInspectorProps> = ({
  section,
  onChange,
}) => {
  const update = (partial: Partial<DigitalGiftRegistrySection>) => {
    onChange({ ...section, ...partial });
  };

  const handleAddAccount = () => {
    const newAcc: GiftAccount = {
      id: `acc-${Date.now()}`,
      bankName: "InstaPay (Egypt)",
      accountNumber: "username@instapay",
      accountHolder: "Celebration Couple",
      branchName: "Direct Instant Transfer",
      qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=instapay%3Ausername%40instapay",
      transferMemo: "Wedding Gift",
      currency: "EGP",
    };
    update({ accounts: [...section.accounts, newAcc] });
  };

  const handleAddPreset = (presetType: "instapay" | "cib" | "iban") => {
    let preset: GiftAccount;
    if (presetType === "instapay") {
      preset = {
        id: `acc-instapay-${Date.now()}`,
        bankName: "InstaPay (Egypt)",
        accountNumber: "couple.wedding@instapay",
        accountHolder: "The Newlyweds",
        branchName: "Direct Instant Transfer",
        qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=instapay%3Acouple.wedding%40instapay",
        transferMemo: "Wedding Gift - Athar",
        currency: "EGP",
      };
    } else if (presetType === "cib") {
      preset = {
        id: `acc-cib-${Date.now()}`,
        bankName: "Commercial International Bank (CIB)",
        accountNumber: "100049281726",
        accountHolder: "The Newlyweds",
        branchName: "Alexandria Branch",
        qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=cib%3A100049281726",
        transferMemo: "Wedding Gift - Athar",
        currency: "EGP",
      };
    } else {
      preset = {
        id: `acc-iban-${Date.now()}`,
        bankName: "International Wire / IBAN",
        accountNumber: "EG380002000100000010004928172",
        accountHolder: "The Newlyweds",
        branchName: "SWIFT: CIBEEGCX",
        qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=iban%3AEG380002000100000010004928172",
        transferMemo: "Wedding Gift",
        currency: "USD / EGP",
      };
    }
    update({ accounts: [...section.accounts, preset] });
  };

  const handleUpdateAccount = (id: string, partial: Partial<GiftAccount>) => {
    const updated = section.accounts.map((acc) =>
      acc.id === id ? { ...acc, ...partial } : acc
    );
    update({ accounts: updated });
  };

  const handleDeleteAccount = (id: string) => {
    update({ accounts: section.accounts.filter((acc) => acc.id !== id) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div
        style={{
          borderBottom: "1px solid rgba(107, 29, 40, 0.1)",
          paddingBottom: "0.6rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#231F20" }}>
            🎁 Digital Gift Registry & Bank QR Configuration
          </h4>
          <span style={{ fontSize: "0.78rem", color: "#7A6F6D" }}>
            Direct digital banking (InstaPay Egypt, Bank Accounts, IBAN) and scannable QR.
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddAccount}
          style={{
            background: "#6B1D28",
            color: "#FFF",
            border: "none",
            borderRadius: "6px",
            padding: "0.35rem 0.75rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Account
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#FDFCFB",
          padding: "0.5rem 0.75rem",
          borderRadius: "8px",
          border: "1px dashed rgba(107, 29, 40, 0.2)",
        }}
      >
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6B1D28" }}>
          Quick Add Presets:
        </span>
        <button
          type="button"
          onClick={() => handleAddPreset("instapay")}
          style={{
            background: "rgba(107, 29, 40, 0.08)",
            border: "none",
            borderRadius: "6px",
            padding: "0.25rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#6B1D28",
            cursor: "pointer",
          }}
        >
          ⚡ InstaPay (Egypt)
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset("cib")}
          style={{
            background: "rgba(30, 64, 175, 0.08)",
            border: "none",
            borderRadius: "6px",
            padding: "0.25rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#1E40AF",
            cursor: "pointer",
          }}
        >
          🏛️ CIB Bank
        </button>
        <button
          type="button"
          onClick={() => handleAddPreset("iban")}
          style={{
            background: "rgba(4, 120, 87, 0.08)",
            border: "none",
            borderRadius: "6px",
            padding: "0.25rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#047857",
            cursor: "pointer",
          }}
        >
          🌐 IBAN Wire
        </button>
      </div>

      {/* Subtitle & Greeting Note */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Section Subtitle
          </label>
          <input
            type="text"
            value={section.subtitle || ""}
            onChange={(e) => update({ subtitle: e.target.value })}
            placeholder="e.g. Your presence is our greatest present"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>
            Greeting & Courtesy Note
          </label>
          <input
            type="text"
            value={section.greetingNote}
            onChange={(e) => update({ greetingNote: e.target.value })}
            placeholder="e.g. We are deeply grateful for your warm love and blessing."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "0.55rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              fontSize: "0.85rem",
            }}
          />
        </div>
      </div>

      {/* Bank Accounts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {section.accounts.map((acc, index) => (
          <div
            key={acc.id}
            style={{
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "10px",
              padding: "0.85rem",
              background: "#FAFAFA",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span
                  style={{
                    background: "rgba(217, 119, 6, 0.12)",
                    color: "#D97706",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "6px",
                  }}
                >
                  #{index + 1}
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#231F20" }}>
                  {acc.bankName || "Banking Account"} ({acc.accountNumber || "---"})
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteAccount(acc.id)}
                style={{
                  background: "rgba(185, 28, 28, 0.1)",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0 0.4rem",
                  height: "24px",
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  color: "#B91C1C",
                  fontWeight: 700,
                }}
              >
                Delete Account
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Bank or Provider Name
                </label>
                <input
                  type="text"
                  value={acc.bankName}
                  onChange={(e) => handleUpdateAccount(acc.id, { bankName: e.target.value })}
                  placeholder="e.g. InstaPay (Egypt) / CIB"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Account / Handle / IBAN Number
                </label>
                <input
                  type="text"
                  value={acc.accountNumber}
                  onChange={(e) => handleUpdateAccount(acc.id, { accountNumber: e.target.value })}
                  placeholder="e.g. couple@instapay or 1000..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={acc.accountHolder}
                  onChange={(e) => handleUpdateAccount(acc.id, { accountHolder: e.target.value })}
                  placeholder="e.g. Omar & Layla"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  Branch / Transfer Memo Note
                </label>
                <input
                  type="text"
                  value={acc.branchName || ""}
                  onChange={(e) => handleUpdateAccount(acc.id, { branchName: e.target.value })}
                  placeholder="e.g. Alexandria Branch or Instant Transfer"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "0.45rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    fontSize: "0.82rem",
                  }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
                  QR Code Image URL
                </label>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <input
                    type="text"
                    value={acc.qrImageUrl || ""}
                    onChange={(e) => handleUpdateAccount(acc.id, { qrImageUrl: e.target.value })}
                    placeholder="https://api.qrserver.com/v1/create-qr-code/?..."
                    style={{
                      flex: 1,
                      padding: "0.45rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      fontSize: "0.82rem",
                    }}
                  />
                  {acc.qrImageUrl && (
                    <img
                      src={acc.qrImageUrl}
                      alt="QR Preview"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "4px",
                        border: "1px solid rgba(0,0,0,0.15)",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cash Box Options */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          paddingTop: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.82rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={section.cashGiftingEnabled}
            onChange={(e) => update({ cashGiftingEnabled: e.target.checked })}
            style={{ accentColor: "#6B1D28" }}
          />
          Mention Traditional Physical Blessing Box Available at Reception
        </label>

        {section.cashGiftingEnabled && (
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.2rem" }}>
              Physical Blessing Box Instructions
            </label>
            <input
              type="text"
              value={section.cashGiftingInstructions || ""}
              onChange={(e) => update({ cashGiftingInstructions: e.target.value })}
              placeholder="e.g. A decorated traditional blessing box will also be available at the ballroom entrance."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.45rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid rgba(0,0,0,0.15)",
                fontSize: "0.82rem",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
