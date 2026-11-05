import React, { useState } from "react";
import type { DigitalGiftRegistrySection as DigitalGiftRegistrySectionModel, GiftAccount } from "@repo/react-appwrite";

export interface DigitalGiftRegistrySectionProps {
  section: DigitalGiftRegistrySectionModel;
  isNoir?: boolean;
}

/**
 * Copies text to the clipboard with fallbacks.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export const DigitalGiftRegistrySection: React.FC<DigitalGiftRegistrySectionProps> = ({
  section,
  isNoir = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQrAccount, setSelectedQrAccount] = useState<GiftAccount | null>(null);

  const handleCopy = async (id: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const accounts: GiftAccount[] =
    section.accounts && section.accounts.length > 0
      ? section.accounts
      : [
          {
            id: "bank-cib",
            bankName: "Commercial International Bank (CIB)",
            accountNumber: "1000-2458-9901-4421",
            accountHolder: "Omar & Layla Wedding Fund",
            branchName: "Four Seasons San Stefano Branch",
            currency: "EGP / USD",
            transferMemo: "Wedding Gift - Omar & Layla",
            qrImageUrl:
              "https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=6B1D28&bgcolor=FFFFFF&data=CIB%3A1000245899014421%3AOmar%26Layla",
          },
          {
            id: "bank-instapay",
            bankName: "InstaPay Egypt (Instant Transfer)",
            accountNumber: "omar.layla@instapay",
            accountHolder: "Layla El-Sayed",
            currency: "EGP",
            transferMemo: "Alf Mabrook!",
            qrImageUrl:
              "https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=6B1D28&bgcolor=FFFFFF&data=INSTAPAY%3Aomar.layla%40instapay",
          },
        ];

  return (
    <section
      id={section.id || "digital-gift-registry-section"}
      className="athar-digital-gift-registry-section"
      style={{
        padding: "5rem 1.5rem",
        backgroundColor: isNoir ? "#161214" : "#FBF7F2",
        color: isNoir ? "#FBF7F2" : "var(--athar-text-title, #231F20)",
        position: "relative",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        {/* Section Header */}
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
            ✦ {section.subtitle || "Blessing Box & Gifting · صندوق التهاني والهدية"} ✦
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
            {section.title || "Digital Gift Registry & Bank QR"}
          </h2>
          {section.titleAr && (
            <div
              style={{
                fontSize: "1.15rem",
                color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                fontFamily: "var(--font-arabic-display, serif)",
                marginBottom: "1rem",
              }}
            >
              {section.titleAr}
            </div>
          )}

          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: 1.7,
              maxWidth: "600px",
              margin: "0 auto",
              color: isNoir ? "#D6C7B2" : "var(--athar-text-body, #4A4240)",
            }}
          >
            {section.greetingNote ||
              "حضوركم ودعواتكم الصادقة هي أجمل وأغلى هدية تسعد قلوبنا. ولمن رغب في تقديم هدية رقمية تبارك بداية حياتنا الجديدة، نسعد بمشاركتكم التفاصيل أدناه بكل مودة وامتنان."}
          </p>
        </div>

        {/* Bank Account Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.75rem",
            marginBottom: "2.5rem",
          }}
        >
          {accounts.map((acc) => {
            const isAccCopied = copiedId === `acc-${acc.id}`;
            const isMemoCopied = copiedId === `memo-${acc.id}`;

            return (
              <div
                key={acc.id}
                style={{
                  padding: "2rem",
                  borderRadius: "24px",
                  background: isNoir
                    ? "linear-gradient(145deg, rgba(35, 26, 30, 0.94), rgba(22, 18, 20, 0.97))"
                    : "linear-gradient(145deg, #FFFFFF, #FAF4ED)",
                  border: "1.5px solid var(--athar-gold-border, rgba(212, 175, 55, 0.4))",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "1.25rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top Bank Name & QR Icon */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.75rem",
                        color: "var(--athar-gold, #D4AF37)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {acc.currency || "EGP"}
                    </span>
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-arabic-display, serif)",
                        color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                        margin: 0,
                      }}
                    >
                      {acc.bankName}
                    </h3>
                  </div>

                  {acc.qrImageUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedQrAccount(acc)}
                      style={{
                        background: isNoir ? "rgba(212, 175, 55, 0.15)" : "rgba(107, 29, 40, 0.06)",
                        border: "1px solid var(--athar-gold-border, rgba(212, 175, 55, 0.35))",
                        borderRadius: "12px",
                        padding: "0.4rem 0.65rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                      }}
                    >
                      <span>📱</span>
                      <span>عرض QR</span>
                    </button>
                  )}
                </div>

                {/* Account Details Box */}
                <div
                  style={{
                    backgroundColor: isNoir ? "rgba(0,0,0,0.25)" : "rgba(251, 247, 242, 0.8)",
                    borderRadius: "16px",
                    padding: "1rem 1.25rem",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                  }}
                >
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", color: isNoir ? "#A8A8B7" : "var(--athar-text-muted, #7A6F6D)" }}>
                      اسم المستفيد · Account Holder
                    </div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: isNoir ? "#FFFFFF" : "var(--athar-text-title, #231F20)",
                      }}
                    >
                      {acc.accountHolder}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", color: isNoir ? "#A8A8B7" : "var(--athar-text-muted, #7A6F6D)" }}>
                      رقم الحساب / المعرّف · Account Number / IBAN
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          fontFamily: "monospace",
                          color: isNoir ? "#E5C158" : "var(--athar-maroon, #6B1D28)",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {acc.accountNumber}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCopy(`acc-${acc.id}`, acc.accountNumber)}
                        style={{
                          background: isAccCopied ? "var(--athar-status-success, #1E6F50)" : "var(--athar-gold, #D4AF37)",
                          color: isAccCopied ? "#FFFFFF" : "#1A1A1A",
                          border: "none",
                          borderRadius: "9999px",
                          padding: "0.35rem 0.85rem",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isAccCopied ? "✓ تم النسخ" : "نسخ · Copy"}
                      </button>
                    </div>
                  </div>

                  {acc.transferMemo && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        paddingTop: "0.5rem",
                        borderTop: "1px dashed rgba(212, 175, 55, 0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ fontSize: "0.75rem", color: isNoir ? "#A8A8B7" : "var(--athar-text-muted, #7A6F6D)" }}>
                        ملاحظة التحويل: <strong>{acc.transferMemo}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(`memo-${acc.id}`, acc.transferMemo || "")}
                        style={{
                          background: "none",
                          border: "none",
                          color: isMemoCopied ? "#1E6F50" : "var(--athar-gold, #D4AF37)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        {isMemoCopied ? "✓ منسوخ" : "نسخ الملاحظة"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cash Gifting Instructions */}
        {section.cashGiftingEnabled && (
          <div
            style={{
              padding: "1.5rem 2rem",
              borderRadius: "20px",
              backgroundColor: isNoir ? "rgba(35, 26, 30, 0.65)" : "rgba(255, 255, 255, 0.9)",
              border: "1px dashed var(--athar-gold, #D4AF37)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.1rem", marginBottom: "0.35rem" }}>✉️ صندوق الهدايا العيني بالصالة</div>
            <p
              style={{
                fontSize: "0.88rem",
                color: isNoir ? "#D6C7B2" : "var(--athar-text-body, #4A4240)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {section.cashGiftingInstructions ||
                "سيتوفر صندوق مباركات فاخر (Blessing Box) عند مدخل القاعة الرئيسي لاستقبال بطاقات التهنئة والمظاريف التذكارية."}
            </p>
          </div>
        )}
      </div>

      {/* Visual QR Modal Lightbox */}
      {selectedQrAccount && (
        <div
          onClick={() => setSelectedQrAccount(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "2.5rem 2rem",
              maxWidth: "380px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedQrAccount(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.3rem",
                cursor: "pointer",
                color: "#7A6F6D",
              }}
            >
              ✕
            </button>

            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#231F20",
                marginBottom: "0.25rem",
              }}
            >
              {selectedQrAccount.bankName}
            </h3>
            <div style={{ fontSize: "0.85rem", color: "#6B1D28", fontWeight: 600, marginBottom: "1.25rem" }}>
              {selectedQrAccount.accountHolder}
            </div>

            {selectedQrAccount.qrImageUrl && (
              <div
                style={{
                  width: "240px",
                  height: "240px",
                  margin: "0 auto 1.25rem auto",
                  padding: "10px",
                  borderRadius: "16px",
                  border: "2px solid #D4AF37",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <img
                  src={selectedQrAccount.qrImageUrl}
                  alt={selectedQrAccount.bankName}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            )}

            <div style={{ fontSize: "0.82rem", color: "#7A6F6D", marginBottom: "1.25rem" }}>
              امسح الكود عبر تطبيق البنك أو المحفظة الإلكترونية لإتمام التحويل مباشرة.
            </div>

            <button
              type="button"
              onClick={() => handleCopy(`modal-${selectedQrAccount.id}`, selectedQrAccount.accountNumber)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "9999px",
                backgroundColor: "#6B1D28",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.88rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              {copiedId === `modal-${selectedQrAccount.id}` ? "✓ تم نسخ رقم الحساب" : "نسخ رقم الحساب"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DigitalGiftRegistrySection;
