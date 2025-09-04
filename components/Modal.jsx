// ANCHOR: MODAL-COMPONENT — START

import { useEffect, useRef } from "react";

export default function Modal({ id, open, onClose, title, children }) {
  const dialogRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "Tab") {
        // Simple focus trap
        const focusable = dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (e.shiftKey) {
          if (active === first || !dialogRef.current.contains(active)) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (active === last || !dialogRef.current.contains(active)) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Focus the first focusable element when opening
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const first = dialogRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  // Scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      id={id}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 12,
      }}
      onClick={onClose} // backdrop click closes
    >
<div
  ref={dialogRef}
  style={{
    background: "#fff",
    borderRadius: 12,
    padding: "20px 24px",
    maxWidth: 560,
    width: "100%",
    maxHeight: "90vh",        // keep modal within viewport
    overflowY: "auto",        // scroll inside modal if needed
    color: "#111827",
    position: "relative",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",

    /* Scrollbar styling */
      }}
  onClick={(e) => e.stopPropagation()} // prevent backdrop close on content click
>
        <h2 id={`${id}-title`} style={{ margin: 0, marginBottom: 12 }}>
  {title}
</h2>
<div style={{ lineHeight: 1.55 }}>
  {children}
</div>

<button
  type="button"
  onClick={onClose}
  style={{
    position: "absolute",
    top: 10,
    right: 12,
    background: "transparent",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: "2px 8px",
    fontSize: 18,
    lineHeight: 1,
    cursor: "pointer",
    transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#f3f4f6";
    e.currentTarget.style.color = "#111827";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.color = "inherit";
    e.currentTarget.style.boxShadow = "none";
  }}
  onFocus={(e) => {
    e.currentTarget.style.boxShadow = "0 0 0 2px #3b82f6"; // blue focus ring
    e.currentTarget.style.outline = "none";
  }}
  onBlur={(e) => {
    e.currentTarget.style.boxShadow = "none";
  }}
  aria-label="Close"
>
  ×
</button>
      </div>
    </div>
  );
}
// ANCHOR: MODAL-COMPONENT — END
