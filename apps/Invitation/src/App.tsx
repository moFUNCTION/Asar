import React, { useState } from "react";
import { useAppwrite } from "@repo/react-appwrite";

export const App: React.FC = () => {
  const { client } = useAppwrite();
  const [rsvpState, setRsvpState] = useState<"pending" | "accepted" | "declined">("pending");

  return (
    <div className="invitation-wrapper">
      <header>
        <div className="brand">
          <div className="brand-crest">A</div>
          <div>
            <h1 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Asar Privé</h1>
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Official Guest Service</p>
          </div>
        </div>

        <a
          href="http://localhost:3000"
          style={{
            color: "var(--text-muted)",
            textDecoration: "none",
            fontSize: "0.85rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "0.4rem 0.8rem",
            borderRadius: "8px",
          }}
        >
          ← Main Hub
        </a>
      </header>

      <div className="invite-card">
        <div className="monogram">✦</div>
        <div className="invitation-to">Cordially Invites</div>
        <div className="guest-name">H.E. Yousef Al-Ghamdi</div>

        <p className="event-details">
          To the Inaugural Gala & Leadership Summit of <strong>Project Asar</strong>. Join distinguished
          innovators and partners for an evening of visionary keynote addresses and networking.
        </p>

        <div className="time-grid">
          <div className="time-item">
            <span className="time-label">Date</span>
            <span className="time-val">Thursday, Nov 12</span>
          </div>
          <div className="time-item">
            <span className="time-label">Time</span>
            <span className="time-val">19:30 AST</span>
          </div>
          <div className="time-item">
            <span className="time-label">Venue</span>
            <span className="time-val">The Grand Pavilion</span>
          </div>
        </div>

        {rsvpState === "pending" && (
          <div>
            <p style={{ marginBottom: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Please respond by November 1st to reserve your assigned delegate seat and security badge.
            </p>
            <div className="rsvp-actions">
              <button
                onClick={() => setRsvpState("accepted")}
                className="btn-rsvp-accept"
              >
                Accept Invitation
              </button>
              <button
                onClick={() => setRsvpState("declined")}
                className="btn-rsvp-decline"
              >
                Decline with Regrets
              </button>
            </div>
          </div>
        )}

        {rsvpState === "accepted" && (
          <div style={{
            padding: "1.5rem",
            borderRadius: "16px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid var(--accent-emerald)",
            color: "var(--accent-emerald)"
          }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>✓ RSVP Confirmed</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Your seat is confirmed and your digital pass has been generated in Appwrite!
            </p>
            <button
              onClick={() => setRsvpState("pending")}
              style={{
                marginTop: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              Change response
            </button>
          </div>
        )}

        {rsvpState === "declined" && (
          <div style={{
            padding: "1.5rem",
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              Thank you for notifying us. We hope to welcome you at future Asar events.
            </p>
            <button
              onClick={() => setRsvpState("pending")}
              style={{
                marginTop: "1rem",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.8rem",
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              Change response
            </button>
          </div>
        )}

        <div style={{ marginTop: "2.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Powered by Appwrite SDK ({client?.config?.project || "asar-invitation"}) · Pass #INV-7702-X
        </div>
      </div>
    </div>
  );
};

export default App;
