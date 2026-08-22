import React from "react";

// Fallback world-name label: a small Caveat-font label in the bottom-left
// corner (DOM, not 3D) so we avoid drei <Text>'s async font texture entirely.
export default function WorldNameLabel({ name }) {
  return (
    <div
      className="font-caveat"
      style={{
        position: "fixed",
        bottom: 26,
        left: 76,
        zIndex: 15,
        fontSize: 18,
        color: "#FDF6E8",
        opacity: 0.7,
        lineHeight: 1,
        pointerEvents: "none",
        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
      }}
    >
      {(name || "My World").slice(0, 28)}
    </div>
  );
}