import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const ACTIVE_COLOR = new THREE.Color("#FFB703");
const IDLE_COLOR = new THREE.Color("#ffffff");

// Near marker: a white octahedron 1.2 units above the object that rotates and
// bobs. When it's the nearest memory it scales up 1.5x, turns gold, and shows a
// Caveat title label with a "press E" hint. Clicking it (when nearest) opens.
export default function MemoryDiamond({ memory, nearestId, onOpen }) {
  const group = useRef();
  const mat = useRef();
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);
  const phase = useRef(Math.random() * Math.PI * 2);
  const color = useRef(IDLE_COLOR.clone());

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const isNearest = nearestId.current === memory.id;
    if (isNearest !== activeRef.current) {
      activeRef.current = isNearest;
      setActive(isNearest);
    }
    const targetScale = isNearest ? 1.5 : 1.0;
    const s = group.current.scale.x + (targetScale - group.current.scale.x) * 0.15;
    group.current.scale.setScalar(s);
    group.current.rotation.y = t * 1.5;
    group.current.position.y = 1.2 + Math.sin(t * 2 + phase.current) * 0.12;
    color.current.lerp(isNearest ? ACTIVE_COLOR : IDLE_COLOR, 0.15);
    if (mat.current) {
      mat.current.color.copy(color.current);
      mat.current.emissive.copy(color.current);
      mat.current.emissiveIntensity = isNearest ? 0.6 : 0.12;
    }
  });

  const tryOpen = (e) => {
    e.stopPropagation();
    if (nearestId.current !== memory.id) return;
    onOpen(memory);
  };

  return (
    <group position={[memory.position_x, 0, memory.position_z]}>
      <group ref={group} position={[0, 1.2, 0]}>
        <mesh
          onClick={tryOpen}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "default")}
        >
          <octahedronGeometry args={[0.3, 0]} />
          <meshLambertMaterial
            ref={mat}
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.12}
            flatShading
          />
        </mesh>
      </group>
      {active && (
        <Html position={[0, 2.2, 0]} center distanceFactor={9} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
            <div
              style={{
                fontFamily: "Caveat, cursive",
                fontSize: 20,
                color: "#fff",
                textShadow: "0 2px 6px rgba(0,0,0,0.85)",
                lineHeight: 1,
              }}
            >
              {memory.title}
            </div>
            <div
              style={{
                fontFamily: "Poppins, sans-serif",
                fontSize: 11,
                color: "#FFB703",
                marginTop: 2,
                letterSpacing: 0.5,
              }}
            >
              press E
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}