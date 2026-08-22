import React, { useRef, useEffect, useState } from "react";

// On-screen virtual joystick shown only under 768px wide. Writes a normalized
// vector into input.current.joy (x = strafe, y = forward).
export default function MobileJoystick({ input }) {
  const [show, setShow] = useState(false);
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  const active = useRef(false);
  const center = useRef({ x: 0, y: 0 });
  const RADIUS = 48;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setShow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!show && input.current) input.current.joy = { x: 0, y: 0 };
  }, [show, input]);

  const setKnob = (dx, dy) => {
    const mag = Math.hypot(dx, dy);
    const clamped = Math.min(mag, RADIUS);
    const a = Math.atan2(dy, dx);
    const kx = Math.cos(a) * clamped;
    const ky = Math.sin(a) * clamped;
    if (knobRef.current)
      knobRef.current.style.transform = `translate(${kx}px, ${ky}px)`;
    if (input.current)
      input.current.joy = { x: kx / RADIUS, y: -ky / RADIUS };
  };

  const onDown = (e) => {
    active.current = true;
    const t = e.touches ? e.touches[0] : e;
    const rect = baseRef.current.getBoundingClientRect();
    center.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setKnob(t.clientX - center.current.x, t.clientY - center.current.y);
  };
  const onMove = (e) => {
    if (!active.current) return;
    const t = e.touches ? e.touches[0] : e;
    setKnob(t.clientX - center.current.x, t.clientY - center.current.y);
    if (e.cancelable) e.preventDefault();
  };
  const onUp = () => {
    active.current = false;
    setKnob(0, 0);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        bottom: 24,
        width: 120,
        height: 120,
        touchAction: "none",
        zIndex: 10,
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div
        ref={baseRef}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          border: "2px solid rgba(255,255,255,0.35)",
        }}
      />
      <div
        ref={knobRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 48,
          height: 48,
          marginLeft: -24,
          marginTop: -24,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.6)",
          transform: "translate(0,0)",
        }}
      />
    </div>
  );
}