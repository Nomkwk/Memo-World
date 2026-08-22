import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";
import MiniIsland from "@/components/landing/MiniIsland";

const X_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cg stroke='%236B4FA8' stroke-width='1.4' stroke-linecap='round' opacity='0.5'%3E%3Cline x1='22' y1='22' x2='36' y2='36'/%3E%3Cline x1='36' y1='22' x2='22' y2='36'/%3E%3C/g%3E%3C/svg%3E")`;

export default function Landing() {
  const navigate = useNavigate();
  const [fading, setFading] = useState(false);

  const handleClick = () => {
    if (fading) return;
    setFading(true);
    setTimeout(() => navigate("/world"), 600);
  };

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 overflow-hidden"
      style={{ cursor: "pointer" }}
    >
      {/* Radial gradient base: bright upper-right to dark edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 82% 18%, #3D1F4D 0%, #2C1745 42%, #1A0B2E 82%)",
        }}
      />

      {/* Tiled x marks + faint diagonal lines, receding toward edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `${X_PATTERN}, repeating-linear-gradient(48deg, transparent 0 240px, rgba(107,79,168,0.10) 240px 241px, transparent 241px 480px), repeating-linear-gradient(132deg, transparent 0 320px, rgba(107,79,168,0.08) 320px 321px, transparent 321px 640px)`,
          backgroundSize: "90px 90px, 100% 100%, 100% 100%",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 46%, black 0%, black 30%, transparent 78%)",
          maskImage:
            "radial-gradient(circle at 50% 46%, black 0%, black 30%, transparent 78%)",
        }}
      />

      {/* Floating mini island, centred slightly above the middle */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "48%",
          width: "clamp(300px, 40vw, 460px)",
          height: "clamp(300px, 40vw, 460px)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <MiniIsland />
      </div>

      {/* CLICK TO START, to the right of the island */}
      <div
        className="absolute flex flex-col items-start"
        style={{
          left: "calc(50% + clamp(150px, 21vw, 230px))",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <div
          className="font-caveat text-white"
          style={{ fontSize: "clamp(1.9rem, 3.1vw, 2.8rem)", lineHeight: 1 }}
        >
          CLICK TO START
        </div>
        <svg
          width="150"
          height="92"
          viewBox="0 0 150 92"
          fill="none"
          style={{ marginTop: 6 }}
        >
          <path
            d="M140 14 C 92 14, 56 56, 22 62"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M22 62 L 35 52 M22 62 L 33 73"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <Volume2 size={22} className="text-white/80" style={{ marginTop: 10 }} />
      </div>

      {/* Title, bottom left */}
      <div className="absolute bottom-7 left-9">
        <div className="text-white/90 uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.35em", fontWeight: 600 }}>
          MEMORY WORLD
        </div>
        <div className="font-caveat text-white/55" style={{ fontSize: "1.15rem", marginTop: 4 }}>
          your memories, as a place you can walk through.
        </div>
      </div>

      {/* Fade to black on click */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: fading ? 1 : 0,
          transition: "opacity 600ms ease",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}