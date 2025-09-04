// ANCHOR: HEADER-COMPONENT — START
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useState } from "react";
import Modal from "./Modal";

const theme = {
  bg: "#0b1220",       // match page background
  border: "#334155",   // match --gyr-border
  text: "#e5e7eb",     // primary text
  textMute: "#bcd0f7", // muted text
};

const linkStyle = (active = false) => ({
  padding: "10px 14px",
  borderRadius: "10px",
  textDecoration: "none",
  color: active ? theme.text : theme.textMute,
  background: active ? "rgba(255,255,255,0.06)" : "transparent",
  border: active ? `1px solid ${theme.border}` : "1px solid transparent",
  transition: "background 120ms ease, border 120ms ease, color 120ms ease",
});

export default function Header() {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  const [showAccess, setShowAccess] = useState(false);
  const [showAPI, setShowAPI] = useState(false);
  const [showMode, setShowMode] = useState(false);

  return (
    <header
      style={{
        background: theme.bg,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          gap: 14,
        }}
      >
        {/* Left: Logo + wordmark + controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image
            src="/gyrilogic-logo.png"
            alt="Gyrilogic logo"
            width={160}
            height={64}
            priority
            style={{ borderRadius: 8, height: "auto", width: "auto", maxWidth: "40vw" }}
          />
          <span
            style={{
              color: theme.text,
              fontWeight: 700,
              letterSpacing: "0.3px",
              fontSize: 18,
            }}
          >
            Gyrilogic — Default Human Logic Layer (Public)
          </span>

          {/* CONTROL BUTTONS START */}
          <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
            <button
              onClick={() => setShowAccess(true)}
              aria-haspopup="dialog"
              aria-controls="access-modal"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: "transparent",
                color: theme.text,
                cursor: "pointer",
              }}
            >
              Access
            </button>

            <button
              onClick={() => setShowAPI(true)}
              aria-haspopup="dialog"
              aria-controls="api-modal"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: "transparent",
                color: theme.text,
                cursor: "pointer",
              }}
            >
              API
            </button>

            <button
              onClick={() => setShowMode(true)}
              aria-haspopup="dialog"
              aria-controls="mode-modal"
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: "rgba(16,185,129,0.15)",
                color: "#34d399",
                fontWeight: 600,
                cursor: "pointer",
              }}
              title="Current plan"
            >
              Free Mode ●
            </button>
          </div>
          {/* CONTROL BUTTONS END */}
        </div>

        {/* Right: Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <nav style={{ display: "flex", gap: 8 }}>
            <Link href="/" legacyBehavior>
              <a style={linkStyle(isActive("/"))}>Home</a>
            </Link>
            <Link href="/about" legacyBehavior>
              <a style={linkStyle(isActive("/about"))}>About</a>
            </Link>
          </nav>
        </div>
      </div>

      {/* MODALS */}
      <Modal id="access-modal" open={showAccess} onClose={() => setShowAccess(false)} title="Access">
        <p>Sign-in and role controls will appear here.</p>
        <ul style={{ marginTop: 8 }}>
          <li>Viewer (default, anonymous)</li>
          <li>Pro (login required)</li>
          <li>Admin (invite only)</li>
        </ul>
      </Modal>

      <Modal id="api-modal" open={showAPI} onClose={() => setShowAPI(false)} title="API">
        <p>Quick cURL + endpoint info.</p>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
{`POST ${
  typeof window !== "undefined"
    ? (localStorage.getItem("dhll_api_base") || process.env.NEXT_PUBLIC_API_BASE || "")
    : "/api"
}/enhance
Body: { text, mode, culture, options }`}
        </pre>
        <p style={{ opacity: 0.8, marginTop: 6 }}>
          Set a custom base via <code>localStorage.dhll_api_base</code>.
        </p>
      </Modal>

      <Modal id="mode-modal" open={showMode} onClose={() => setShowMode(false)} title="Current Mode">
        <p>You are on <strong>Free Mode</strong>.</p>
        <p style={{ opacity: 0.85 }}>
          Pro tiers will unlock unlimited runs, advanced tones, and team features.
        </p>
      </Modal>
    </header>
  );
}
// ANCHOR: HEADER-COMPONENT — END
