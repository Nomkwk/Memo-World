import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import MemoryObject from "./MemoryObject";
import SpawnBurst from "./SpawnBurst";
import MemoryBubble from "./MemoryBubble";
import { getHeightAt } from "./terrain";

// Ease-out bounce used for the spawn-in scale animation.
function bounceOut(p) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (p < 1 / d1) return n1 * p * p;
  if (p < 2 / d1) {
    p -= 1.5 / d1;
    return n1 * p * p + 0.75;
  }
  if (p < 2.5 / d1) {
    p -= 2.25 / d1;
    return n1 * p * p + 0.9375;
  }
  p -= 2.625 / d1;
  return n1 * p * p + 0.984375;
}

// One memory in the world: the sculpted object (with spawn animation + burst for
// newly added ones), a tall light beam, an invisible click-catcher, and the
// floating near marker above it.
function MemoryItem({ memory, nearestId, onOpen, spawn, activeMemoryId, onClose }) {
  const group = useRef();
  const t = useRef(0);

  useFrame((_, dt) => {
    if (!spawn || !group.current) return;
    t.current += dt;
    const p = Math.min(t.current / 0.6, 1);
    group.current.scale.setScalar(bounceOut(p));
  });

  const tryOpen = (e) => {
    e.stopPropagation();
    if (nearestId.current !== memory.id) return;
    onOpen(memory);
  };

  return (
    <group
      position={[memory.position_x, getHeightAt(memory.position_x, memory.position_z), memory.position_z]}
      rotation={[0, memory.rotation_y || 0, 0]}
    >
      <group ref={group} scale={spawn ? 0.001 : 1}>
        <MemoryObject object_json={memory.object_json} />
      </group>
      {spawn && <SpawnBurst />}
      {/* DIAGNOSTIC: MemoryBeam disabled */}
      {/* <MemoryBeam memory={memory} nearestId={nearestId} color={moodColor} /> */}
      {/* Invisible click-catcher so clicking the object opens the memory. */}
      <mesh
        position={[0, 1.2, 0]}
        onClick={tryOpen}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <cylinderGeometry args={[1.1, 1.1, 2.6, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* DIAGNOSTIC: MemoryDiamond disabled */}
      {/* <MemoryDiamond memory={memory} nearestId={nearestId} onOpen={onOpen} /> */}
      {memory.id === activeMemoryId && (
        <MemoryBubble memory={memory} onClose={onClose} />
      )}
    </group>
  );
}

export default React.memo(MemoryItem);
