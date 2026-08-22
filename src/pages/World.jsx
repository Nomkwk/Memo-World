import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { Plus, Palette } from "lucide-react";
import IslandScene from "@/components/island/IslandScene";
import MobileJoystick from "@/components/island/MobileJoystick";
import AddMemoryPanel from "@/components/island/AddMemoryPanel";
import CustomiserPanel from "@/components/island/CustomiserPanel";
import { useToast } from "@/components/ui/use-toast";
import useWorld from "@/components/island/useWorld";
import { ZONES } from "@/components/island/zones";
import { OBSTACLES } from "@/components/island/obstacles";
import { base44 } from "@/api/base44Client";
import LoadingScreen from "@/components/island/LoadingScreen";
import AudioToggle from "@/components/island/AudioToggle";
import WorldNameLabel from "@/components/island/WorldNameLabel";
import SceneErrorBoundary from "@/components/island/SceneErrorBoundary";
import { makeFallbackScene } from "@/lib/fallbackMemory";
import * as audio from "@/lib/audio";

const NIGHT_BG = "#1A0B2E";
const ISLAND_LIMIT = 27;

// Pick a position inside the memory's zone, rejecting spots within 4 units of
// an existing memory or obstacle. Retries up to 20 times.
function computePlacement(zone, existing) {
  const z = ZONES[zone] || ZONES.meadow;
  const blockers = [
    ...OBSTACLES.map((o) => ({ x: o.x, z: o.z })),
    ...existing.map((m) => ({ x: m.position_x, z: m.position_z })),
  ];
  for (let i = 0; i < 20; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * z.radius;
    const x = z.centre[0] + Math.cos(a) * r;
    const zp = z.centre[1] + Math.sin(a) * r;
    if (Math.hypot(x, zp) > ISLAND_LIMIT) continue;
    if (blockers.some((o) => Math.hypot(x - o.x, zp - o.z) < 4)) continue;
    return { x, z: zp, rot: Math.random() * Math.PI * 2 };
  }
  return { x: z.centre[0], z: z.centre[1], rot: Math.random() * Math.PI * 2 };
}

export default function World() {
  const input = useRef({ keys: {}, joy: { x: 0, y: 0 } });
  const { world, memories, setMemories, setWorld, loading, error } = useWorld();
  const { toast } = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeMemory, setActiveMemory] = useState(null);
  const [newMemoryId, setNewMemoryId] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const nearestId = useRef(null);
  const cameraFocus = useRef(null);
  const downPos = useRef(null);
  const memoriesRef = useRef([]);
  memoriesRef.current = memories;

  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const [addNotice, setAddNotice] = useState(null);

  const openMemory = useCallback((m) => {
    audio.pageTurn();
    setActiveMemory(m);
  }, []);
  const closeMemory = useCallback(() => setActiveMemory(null), []);

  // Simulated loading progress while data loads, then fade out.
  useEffect(() => {
    if (loading) return;
    setProgress(100);
    const t = setTimeout(() => setShowLoader(false), 700);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (!showLoader || !loading) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const e = (now - start) / 1000;
      setProgress(Math.min(90, e * 35));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading, showLoader]);

  // Disable keyboard movement while any panel is open.
  useEffect(() => {
    input.current.disabled = panelOpen || customOpen || !!activeMemory;
  }, [panelOpen, customOpen, activeMemory]);

  // Start ambient audio on the first user gesture (autoplay policy).
  useEffect(() => {
    const onFirst = () => {
      audio.resume();
      audio.startPad();
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
    window.addEventListener("pointerdown", onFirst);
    window.addEventListener("keydown", onFirst);
    return () => {
      window.removeEventListener("pointerdown", onFirst);
      window.removeEventListener("keydown", onFirst);
    };
  }, []);

  // Press E to open the nearest memory.
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "KeyE") return;
      if (panelOpen || activeMemory || submitting) return;
      const id = nearestId.current;
      if (!id) return;
      const m = memoriesRef.current.find((x) => x.id === id);
      if (m) openMemory(m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, activeMemory, submitting]);

  const handleAdd = async ({ title, body, memory_date }) => {
    if (!world) return;
    setSubmitting(true);
    setAddNotice(null);
    let scene;
    let notice = null;
    try {
      const res = await base44.functions.invoke("generateMemoryObject", {
        title,
        body,
        memory_date,
      });
      scene = res.data;
    } catch (e) {
      console.error(e);
      scene = makeFallbackScene();
      notice =
        "We couldn't craft a custom sculpture — your memory is saved with a simple marker instead.";
    }
    try {
      const pos = computePlacement(scene.zone, memoriesRef.current);
      const mem = await base44.entities.Memory.create({
        world_id: world.id,
        title,
        body,
        memory_date,
        mood: scene.mood,
        tags: scene.tags || [],
        zone: scene.zone,
        position_x: pos.x,
        position_z: pos.z,
        rotation_y: pos.rot,
        object_json: scene,
      });
      setMemories((prev) => [...prev, mem]);
      setNewMemoryId(mem.id);
      cameraFocus.current = { pos: [mem.position_x, 1, mem.position_z], time: 2.5 };
      audio.chime();
      setTimeout(() => setNewMemoryId(null), 1200);
      if (notice) {
        setAddNotice(notice);
      } else {
        setPanelOpen(false);
      }
    } catch (e) {
      console.error(e);
      setAddNotice("Couldn't save your memory. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleColor = async (hex) => {
    if (!world) return;
    setWorld({ ...world, character_color: hex });
    try {
      await base44.entities.World.update(world.id, { character_color: hex });
    } catch (e) {
      console.error(e);
    }
  };

  const handleHat = async (hat) => {
    if (!world) return;
    setWorld({ ...world, character_hat: hat });
    try {
      await base44.entities.World.update(world.id, { character_hat: hat });
    } catch (e) {
      console.error(e);
    }
  };

  const handleName = async (name) => {
    if (!world) return;
    setWorld({ ...world, name });
    try {
      await base44.entities.World.update(world.id, { name });
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    if (!world) return;
    setSharing(true);
    try {
      const base = (world.name || "world").toLowerCase().trim();
      const core = base.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "world";
      const slug = `${core}-${String(world.id || "").slice(-6)}`;
      await base44.entities.World.update(world.id, { is_public: true, slug });
      setWorld({ ...world, is_public: true, slug });
      const link = `${window.location.origin}/w/${slug}`;
      try {
        await navigator.clipboard.writeText(link);
      } catch {}
      toast({ title: "Link copied to clipboard", description: link });
    } catch (e) {
      console.error(e);
       
      alert("Could not share: " + (e && e.message ? e.message : e));
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return <LoadingScreen progress={progress} />;
  }
  if (!world) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: NIGHT_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontFamily: "Poppins, sans-serif",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 560,
            background: "rgba(253, 246, 232, 0.96)",
            color: "#3A2A1F",
            border: "2px solid #E0BC8B",
            borderRadius: 16,
            padding: 24,
            boxShadow: "0 18px 48px rgba(0,0,0,0.35)",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Could not load world
          </h1>
          <p style={{ color: "#6B4F3F", lineHeight: 1.55, marginBottom: 16 }}>
            {error ||
              "The app could not reach Base44 or could not load your World entity."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              style={{
                background: "#E24B4B",
                color: "#fff",
                border: 0,
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "#FDF6E8",
                color: "#3A2A1F",
                border: "1px solid #E0BC8B",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          memories={memories}
          nearestId={nearestId}
          onOpenMemory={openMemory}
          cameraFocus={cameraFocus}
          newMemoryId={newMemoryId}
          characterColor={world.character_color || "#E24B4B"}
          characterHat={world.character_hat || "none"}
          activeMemoryId={activeMemory ? activeMemory.id : null}
          onCloseMemory={closeMemory}
        />
      </Canvas>
      </SceneErrorBoundary>

      <button
        onClick={() => setPanelOpen(true)}
        className="font-poppins scrap-btn"
        aria-label="Add memory"
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 15,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#E24B4B",
          color: "#fff",
          border: "2px solid #E0BC8B",
          boxShadow: "0 10px 24px rgba(120,80,40,0.28)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 140ms ease, box-shadow 140ms ease",
        }}
      >
        <Plus size={26} />
      </button>

      <button
        onClick={() => setCustomOpen(true)}
        className="scrap-btn"
        aria-label="Customise"
        style={{
          position: "fixed",
          top: 20,
          right: 84,
          zIndex: 15,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "#F2A65A",
          color: "#3A2A1F",
          border: "2px solid #E0BC8B",
          boxShadow: "0 10px 24px rgba(120,80,40,0.28)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 140ms ease, box-shadow 140ms ease",
        }}
      >
        <Palette size={24} />
      </button>

      <AddMemoryPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setAddNotice(null);
        }}
        onSubmit={handleAdd}
        loading={submitting}
        notice={addNotice}
      />
      <MobileJoystick input={input} />
      <CustomiserPanel
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        world={world}
        onColor={handleColor}
        onHat={handleHat}
        onName={handleName}
        onShare={handleShare}
        sharing={sharing}
      />
      {showLoader && <LoadingScreen progress={progress} fading />}
      <AudioToggle />
      <WorldNameLabel name={world.name} />
    </div>
  );
}
