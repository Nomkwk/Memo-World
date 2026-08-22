import React, { useState, useEffect } from "react";
import { X, Share2, Check } from "lucide-react";

const COLORS = ["#E24B4B", "#4B7FE2", "#4BE297", "#E2C84B", "#A24BE2", "#EFE6F5"];
const HATS = [
  { key: "none", label: "None" },
  { key: "cap", label: "Cap" },
  { key: "crown", label: "Crown" },
  { key: "flower", label: "Flower" },
];

// Compact slide-in panel: character colour swatches, hat selector, world name
// field, and a "Share my world" action that publishes the world + copies a link.
export default function CustomiserPanel({
  open,
  onClose,
  world,
  onColor,
  onHat,
  onName,
  onShare,
  sharing,
}) {
  const [name, setName] = useState(world ? world.name : "");

  useEffect(() => {
    if (world) setName(world.name || "");
  }, [world && world.id, world && world.name, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const commitName = () => {
    const v = name.trim();
    if (v && world && v !== world.name) onName(v);
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
          width: "min(320px, calc(100vw - 24px))",
          background: "#FBF3E0",
          borderRadius: "20px 0 0 20px",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.25)",
          transform: open ? "translateX(0)" : "translateX(110%)",
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 30,
          padding: 22,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#2a1a3a", margin: 0 }}>
            Customise
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "rgba(0,0,0,0.06)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2a1a3a",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <section>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#5a4a3a", marginBottom: 10 }}>
            Character colour
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {COLORS.map((c) => {
              const active = world && world.character_color === c;
              return (
                <button
                  key={c}
                  onClick={() => onColor(c)}
                  aria-label={`Colour ${c}`}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    border: active ? "3px solid #2a1a3a" : "3px solid transparent",
                    background: c,
                    cursor: "pointer",
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                  }}
                />
              );
            })}
          </div>
        </section>

        <section>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#5a4a3a", marginBottom: 10 }}>
            Hat
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {HATS.map((h) => {
              const active = world && world.character_hat === h.key;
              return (
                <button
                  key={h.key}
                  onClick={() => onHat(h.key)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: 10,
                    border: active ? "2px solid #2a1a3a" : "2px solid rgba(0,0,0,0.1)",
                    background: active ? "#2a1a3a" : "#fff",
                    color: active ? "#fff" : "#2a1a3a",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#5a4a3a", marginBottom: 8 }}>
            World name
          </div>
          <input
            type="text"
            value={name}
            maxLength={28}
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.target.blur();
              }
            }}
            placeholder="Name your world"
            style={{
              padding: "10px 12px",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 10,
              fontSize: 15,
              background: "#fff",
              outline: "none",
              fontFamily: "inherit",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
          <div style={{ fontSize: 11, color: "#8a7a6a", marginTop: 6 }}>
            The name appears as floating 3D letters near the plaza.
          </div>
        </section>

        <section>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#5a4a3a", marginBottom: 10 }}>
            Sharing
          </div>
          <button
            onClick={onShare}
            disabled={sharing}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: 10,
              background: world && world.is_public ? "#4BE297" : "#E24B4B",
              color: world && world.is_public ? "#1A0B2E" : "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: sharing ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {world && world.is_public ? <Check size={18} /> : <Share2 size={18} />}
            {world && world.is_public ? "World is public" : "Share my world"}
          </button>
          {world && world.is_public && world.slug && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "#5a4a3a",
                background: "rgba(0,0,0,0.05)",
                padding: "8px 10px",
                borderRadius: 8,
                wordBreak: "break-all",
              }}
            >
              {window.location.origin}/w/{world.slug}
            </div>
          )}
        </section>
      </div>
    </>
  );
}