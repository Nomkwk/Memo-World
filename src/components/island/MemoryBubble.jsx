import React, { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { X } from "lucide-react";
import { MOOD_COLORS } from "./moodColors";
import { PAPER, BORDER, INK, MUTED, SHADOW } from "./scrapbook";

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

// A short strip of washi tape overlapping a top corner of the card.
function WashiTape({ side }) {
  const base = {
    position: "absolute",
    top: -12,
    width: 72,
    height: 24,
    borderRadius: 3,
    boxShadow: "0 1px 3px rgba(120,80,40,0.18)",
    pointerEvents: "none",
  };
  if (side === "left") {
    return (
      <div
        style={{
          ...base,
          left: -16,
          background: "rgba(226,180,120,0.55)",
          transform: "rotate(-34deg)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        ...base,
        right: -16,
        background: "rgba(242,166,90,0.5)",
        transform: "rotate(34deg)",
      }}
    />
  );
}

// Floating speech-bubble card attached above a memory object in the 3D scene.
// Warm scrapbook paper, hand-placed tilt, washi-tape corners, dashed divider.
// drei <Html> with center + distanceFactor; no occlude, no textures.
export default function MemoryBubble({ memory, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(false);
    const t = requestAnimationFrame(() => setShow(true));
    const onKey = (e) => {
      if (e.code === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [memory, onClose]);

  const moodColor = MOOD_COLORS[memory.mood] || "#888";

  return (
    <Html position={[0, 5.3, 0]} center distanceFactor={9}>
      <div
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="font-poppins"
        style={{
          pointerEvents: "auto",
          width: 320,
          maxHeight: 320,
          overflowY: "auto",
          background: PAPER,
          border: `2px solid ${BORDER}`,
          borderRadius: 20,
          padding: 22,
          boxShadow: SHADOW,
          position: "relative",
          opacity: show ? 1 : 0,
          transform: show
            ? "rotate(-1.5deg) scale(1)"
            : "rotate(-1.5deg) scale(0.9)",
          transformOrigin: "center bottom",
          transition: "opacity 180ms ease, transform 180ms ease",
          color: INK,
        }}
      >
        <WashiTape side="left" />
        <WashiTape side="right" />

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            border: `2px solid ${BORDER}`,
            background: PAPER,
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: INK,
          }}
        >
          <X size={15} />
        </button>

        <h2
          className="font-caveat"
          style={{
            fontSize: 26,
            lineHeight: 1.1,
            color: INK,
            margin: 0,
            paddingRight: 30,
          }}
        >
          {memory.title}
        </h2>

        <div
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: 11,
            color: MUTED,
            marginTop: 4,
            textTransform: "uppercase",
            letterSpacing: 1.4,
            fontWeight: 500,
          }}
        >
          {formatDate(memory.memory_date)}
        </div>

        <div style={{ borderTop: `1.5px dashed ${BORDER}`, margin: "14px 0" }} />

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: INK,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {memory.body}
        </p>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginTop: 16,
            alignItems: "center",
          }}
        >
          <span
            style={{
              background: moodColor,
              color: "#fff",
              fontSize: 11,
              padding: "4px 12px",
              borderRadius: 999,
              textTransform: "capitalize",
              fontWeight: 600,
            }}
          >
            {memory.mood}
          </span>
          {memory.tags &&
            memory.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "transparent",
                  border: `1px solid ${BORDER}`,
                  color: MUTED,
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                }}
              >
                #{t}
              </span>
            ))}
        </div>

        {/* downward-pointing speech-bubble tail (bordered via two triangles) */}
        <div
          style={{
            position: "absolute",
            bottom: -11,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: `12px solid ${BORDER}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -11,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderTop: `10px solid ${PAPER}`,
          }}
        />
      </div>
    </Html>
  );
}