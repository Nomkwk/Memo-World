import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, toggleMuted } from "@/lib/audio";

// Persisted mute toggle for the ambient audio. Bottom-left of the screen.
export default function AudioToggle() {
  const [muted, setMuted] = useState(isMuted());
  return (
    <button
      onClick={() => setMuted(toggleMuted())}
      aria-label={muted ? "Unmute audio" : "Mute audio"}
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 15,
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "none",
        background: "rgba(251,243,224,0.92)",
        color: "#2a1a3a",
        boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
}