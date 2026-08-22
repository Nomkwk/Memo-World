import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { PAPER, BORDER, INK, MUTED, ACCENT, SHADOW } from "./scrapbook";

// Slide-in panel for writing a new memory. Warm scrapbook paper styling,
// cream inputs with a warm focus ring, full-width rounded submit that lifts
// on hover. Shows a "Building your memory…" loading state with a spinning
// low-poly cube while the object is generated.
export default function AddMemoryPanel({ open, onClose, onSubmit, loading, notice }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Clear the text fields when the panel closes after a successful submit.
  useEffect(() => {
    if (!open) {
      setTitle("");
      setBody("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || loading) return;
    onSubmit({ title: title.trim(), body: body.trim(), memory_date: date });
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 500,
    color: MUTED,
    fontFamily: "Poppins, sans-serif",
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 20 }}
        />
      )}
      <div
        className="font-poppins"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(380px, calc(100vw - 24px))",
          background: PAPER,
          border: `2px solid ${BORDER}`,
          borderRight: "none",
          borderRadius: "20px 0 0 20px",
          boxShadow: SHADOW,
          transform: open ? "translateX(0)" : "translateX(110%)",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 30,
          padding: 24,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          color: INK,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <h2 className="font-caveat" style={{ fontSize: 30, color: INK, margin: 0 }}>
            New memory
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="scrap-btn"
            style={{
              border: `2px solid ${BORDER}`,
              background: PAPER,
              borderRadius: "50%",
              width: 34,
              height: 34,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: INK,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              color: INK,
            }}
          >
            <div className="spin-cube">
              <div className="face f1" />
              <div className="face f2" />
              <div className="face f3" />
              <div className="face f4" />
              <div className="face f5" />
              <div className="face f6" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 500 }}>Building your memory…</p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}
          >
            {notice && (
              <div
                style={{
                  background: "#FFE9C2",
                  border: `1px solid ${BORDER}`,
                  color: "#5a3a1a",
                  fontSize: 13,
                  padding: "10px 12px",
                  borderRadius: 12,
                  lineHeight: 1.4,
                }}
              >
                {notice}
              </div>
            )}
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={labelStyle}>Title</span>
              <input
                className="scrap-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A short name"
                maxLength={60}
                style={{ padding: "10px 12px", fontSize: 15 }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <span style={labelStyle}>What happened?</span>
              <textarea
                className="scrap-input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell the story…"
                style={{
                  padding: "12px",
                  fontSize: 15,
                  resize: "vertical",
                  minHeight: 180,
                  flex: 1,
                }}
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={labelStyle}>Date</span>
              <input
                className="scrap-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ padding: "10px 12px", fontSize: 15 }}
              />
            </label>

            <button
              type="submit"
              disabled={!!notice}
              className="scrap-submit"
              style={{
                marginTop: 4,
                padding: "13px",
                border: "none",
                borderRadius: 999,
                background: notice ? "#BBA88A" : ACCENT,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: notice ? "default" : "pointer",
                boxShadow: SHADOW,
              }}
            >
              {notice ? "Saved" : "Create memory"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}