import React from "react";

// Dark gradient loading screen: a spinning low-poly cube and a progress
// percentage in the Caveat font. Fades out when `fading` is true.
export default function LoadingScreen({ progress = 0, fading = false }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background:
          "radial-gradient(circle at 50% 38%, #2a1a3a 0%, #1A0B2E 72%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.6s ease",
        pointerEvents: fading ? "none" : "auto",
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
      <div
        className="font-caveat"
        style={{ fontSize: 40, color: "#FBF3E0", lineHeight: 1 }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  );
}