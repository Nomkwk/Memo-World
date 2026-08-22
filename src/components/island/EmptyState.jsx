import React from "react";
import { Html } from "@react-three/drei";

// Shown when a world has no memories: a handwritten Caveat label floating at
// the centre of the plaza with an arrow nudging toward the + button.
export default function EmptyState() {
  return (
    <Html position={[0, 1.7, 0]} center style={{ pointerEvents: "none" }}>
      <div
        style={{
          textAlign: "center",
          color: "#FBF3E0",
          userSelect: "none",
          minWidth: 320
        }}
      >
        <div
          className="font-caveat"
          style={{
            fontSize: 34,
            lineHeight: 1.15,
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          this world is empty — add your first memory
        </div>
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          style={{ marginTop: 6, marginLeft: 100, transform: "rotate(-32deg)" }}
        >
          <path
            d="M12 52 L52 12 M52 12 L36 12 M52 12 L52 28"
            stroke="#FFB703"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Html>
  );
}