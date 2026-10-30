import React from "react";
import { useAppwrite } from "@repo/react-appwrite";

interface EcosystemApp {
  name: string;
  description: string;
  port: number;
  badge: string;
  url: string;
  icon: string;
}

const apps: EcosystemApp[] = [
  {
    name: "Admin",
    description: "Centralized control console for attendee analytics, invitation quotas, and system settings.",
    port: 3001,
    badge: "Operations",
    url: "http://localhost:3001",
    icon: "⚡",
  },
  {
    name: "Booth",
    description: "Self-service on-site check-in terminal with badge printing and fast attendee verification.",
    port: 3002,
    badge: "On-Site Station",
    url: "http://localhost:3002",
    icon: "🎫",
  },
  {
    name: "Invitation",
    description: "Personalized guest invitation flows, instant RSVP confirmations, and dynamic QR passes.",
    port: 3003,
    badge: "Guest Facing",
    url: "http://localhost:3003",
    icon: "✉️",
  },
];

export const App: React.FC = () => {
  const { client } = useAppwrite();
  const endpoint = client?.config?.endpoint || "Configured via .env";
  const project = client?.config?.project || "Initialized";

  return (
    <div className="container">
      <header>
        <div className="brand">
          <div className="brand-badge">A</div>
          <div className="brand-info">
            <h1>Asar Platform</h1>
            <p>Unified Event & Hospitality Ecosystem</p>
          </div>
        </div>

        <div className="status-pill">
          <div className="status-dot"></div>
          <span>Appwrite SDK Ready</span>
        </div>
      </header>

      <main>
        <div className="hero">
          <div className="hero-tag">Turborepo Micro-Frontend Architecture</div>
          <h2 className="hero-title">Unified Experience Engine</h2>
          <p className="hero-subtitle">
            Welcome to the Asar monorepo. Connected through shared Appwrite state fusion,
            type-safe configuration, and rapid Vite workstations.
          </p>
        </div>

        <div className="grid">
          {apps.map((app) => (
            <div key={app.name} className="card">
              <div className="card-top">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="card-badge">{app.badge}</span>
                  <span style={{ fontSize: "1.5rem" }}>{app.icon}</span>
                </div>
                <h3 className="card-title">{app.name}</h3>
                <p className="card-desc">{app.description}</p>
              </div>

              <div className="card-footer">
                <span className="card-port">Port :{app.port}</span>
                <a
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-link"
                >
                  Launch App →
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="info-banner">
          <div>
            <h3>Ecosystem Configuration</h3>
            <p>Shared packages active: <code>@repo/react-appwrite</code>, <code>@repo/typescript-config</code>, <code>@repo/eslint-config</code></p>
            <p style={{ marginTop: "0.25rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Endpoint: {endpoint} | Project: {project}
            </p>
          </div>

          <div className="pill-group">
            <span className="tech-tag">Turborepo v2</span>
            <span className="tech-tag">React 18</span>
            <span className="tech-tag">Vite 5</span>
            <span className="tech-tag">Appwrite 17</span>
            <span className="tech-tag">TypeScript 5</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
