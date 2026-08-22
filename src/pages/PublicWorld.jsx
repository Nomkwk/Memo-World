import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import IslandScene from "@/components/island/IslandScene";
import MobileJoystick from "@/components/island/MobileJoystick";
import WorldNameLabel from "@/components/island/WorldNameLabel";
import SceneErrorBoundary from "@/components/island/SceneErrorBoundary";
import { base44 } from "@/api/base44Client";

const NIGHT_BG = "#1A0B2E";
const GRADIENT =
  "radial-gradient(circle at 82% 18%, #3D1F4D 0%, #2C1745 42%, #1A0B2E 82%)";

// Public, no-auth exploration of a shared world. Loads world + memories via
// the getPublicWorld backend function. Fully explorable (walk, proximity
// markers, read memories) but has no add button or customiser.
export default function PublicWorld() {
  const { slug } = useParams();
  const input = useRef({ keys: {}, joy: { x: 0, y: 0 } });
  const nearestId = useRef(null);
  const cameraFocus = useRef(null);
  const downPos = useRef(null);
  const [state, setState] = useState({
    loading: true,
    world: null,
    memories: [],
    notFound: false,
  });
  const [activeMemory, setActiveMemory] = useState(null);
  const closeMemory = useCallback(() => setActiveMemory(null), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.functions.invoke("getPublicWorld", { slug });
        if (cancelled) return;
        const data = res && res.data;
        if (!data || !data.world) {
          setState({ loading: false, world: null, memories: [], notFound: true });
          return;
        }
        setState({
          loading: false,
          world: data.world,
          memories: data.memories || [],
          notFound: false,
        });
      } catch {
        if (cancelled) return;
        setState({ loading: false, world: null, memories: [], notFound: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "KeyE" || activeMemory) return;
      const id = nearestId.current;
      if (!id) return;
      const m = state.memories.find((x) => x.id === id);
      if (m) setActiveMemory(m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMemory, state.memories]);

  // Disable movement while a memory card is open.
  useEffect(() => {
    input.current.disabled = !!activeMemory;
  }, [activeMemory]);

  if (state.loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: GRADIENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        Loading world…
      </div>
    );
  }

  if (state.notFound || !state.world) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: GRADIENT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div className="font-caveat" style={{ fontSize: 48, lineHeight: 1 }}>
          This world is private
        </div>
        <p style={{ marginTop: 12, opacity: 0.7, maxWidth: 380 }}>
          The world you're looking for doesn't exist or hasn't been shared
          publicly.
        </p>
      </div>
    );
  }

  const w = state.world;
  return (
    <div style={{ position: "fixed", inset: 0, background: NIGHT_BG }}>
      <SceneErrorBoundary>
      <Canvas
        shadows
        camera={{ fov: 35, position: [40, 40, 40], near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        onPointerDown={(e) => {
          downPos.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMissed={(e) => {
          if (!downPos.current) return;
          const dx = e.clientX - downPos.current.x;
          const dy = e.clientY - downPos.current.y;
          downPos.current = null;
          if (Math.hypot(dx, dy) < 6) closeMemory();
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setClearColor(NIGHT_BG);
        }}
      >
        <IslandScene
          input={input}
          memories={state.memories}
          nearestId={nearestId}
          onOpenMemory={setActiveMemory}
          cameraFocus={cameraFocus}
          characterColor={w.character_color || "#E24B4B"}
          characterHat={w.character_hat || "none"}
          activeMemoryId={activeMemory ? activeMemory.id : null}
          onCloseMemory={closeMemory}
        />
      </Canvas>
      </SceneErrorBoundary>
      <MobileJoystick input={input} />
      <WorldNameLabel name={w.name} />
    </div>
  );
}
