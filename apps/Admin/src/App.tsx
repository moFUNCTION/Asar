import React, { useState } from "react";
import { useAppwrite } from "@repo/react-appwrite";

interface AttendeeRow {
  id: string;
  name: string;
  email: string;
  type: string;
  status: "Checked In" | "RSVP Confirmed" | "Pending";
  time: string;
}

const mockAttendees: AttendeeRow[] = [
  { id: "ATT-101", name: "Sami Al-Mansoor", email: "sami@example.com", type: "VIP Delegate", status: "Checked In", time: "09:42 AM" },
  { id: "ATT-102", name: "Lina Radwan", email: "lina@example.com", type: "Keynote Speaker", status: "Checked In", time: "09:50 AM" },
  { id: "ATT-103", name: "Tariq Kabbani", email: "tariq@example.com", type: "Exhibitor", status: "RSVP Confirmed", time: "—" },
  { id: "ATT-104", name: "Huda Al-Hashimi", email: "huda@example.com", type: "General Guest", status: "Pending", time: "—" },
  { id: "ATT-105", name: "Karim Zaki", email: "karim@example.com", type: "Press", status: "RSVP Confirmed", time: "—" },
];

export const App: React.FC = () => {
  const { client } = useAppwrite();
  const [filter, setFilter] = useState<string>("All");

  const attendees = filter === "All"
    ? mockAttendees
    : mockAttendees.filter((a) => a.status === filter);

  return (
    <div className="container">
      <header>
        <div className="brand">
          <div className="brand-badge">AD</div>
          <div className="brand-info">
            <h1>Asar Admin Console</h1>
            <p>Operations, Access Control & Real-time Metrics</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Appwrite ID: <strong>{client?.config?.project || "asar-admin"}</strong>
          </span>
          <a
            href="http://localhost:3000"
            className="btn-sm"
            style={{ textDecoration: "none" }}
          >
            ← Back to Main Hub
          </a>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Invitations</div>
          <div className="stat-value">1,420</div>
          <div className="stat-change">↑ 12% vs yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed RSVPs</div>
          <div className="stat-value">1,180</div>
          <div className="stat-change">83.1% conversion rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Booth Check-Ins</div>
          <div className="stat-value">642</div>
          <div className="stat-change" style={{ color: "var(--accent-primary)" }}>Active right now</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Terminals</div>
          <div className="stat-value">8 / 8</div>
          <div className="stat-change" style={{ color: "var(--accent-emerald)" }}>All stations online</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <div className="table-title">Recent Event Registrations</div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Real-time synchronization with Appwrite database collection
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["All", "Checked In", "RSVP Confirmed", "Pending"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className="btn-sm"
                style={{
                  background: filter === tab ? "var(--accent-primary)" : undefined,
                  color: filter === tab ? "#fff" : undefined,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Attendee Name</th>
              <th>Email</th>
              <th>Pass Type</th>
              <th>Status</th>
              <th>Check-in Time</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((a) => (
              <tr key={a.id}>
                <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{a.id}</td>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td style={{ color: "var(--text-secondary)" }}>{a.email}</td>
                <td>
                  <span className="badge badge-blue">{a.type}</span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      a.status === "Checked In"
                        ? "badge-green"
                        : a.status === "RSVP Confirmed"
                        ? "badge-blue"
                        : "badge-amber"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
