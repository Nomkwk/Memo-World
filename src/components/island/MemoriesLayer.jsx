import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import MemoryItem from "./MemoryItem";

// Renders every memory and tracks which one is nearest to the character
// (within 4 units), writing its id into nearestId each frame.
export default function MemoriesLayer({
  memories,
  charState,
  nearestId,
  onOpenMemory,
  newMemoryId,
  activeMemoryId,
  onCloseMemory,
}) {
  const closeGuard = useRef(false);

  useFrame(() => {
    const cp = charState.current.pos;
    let nearest = null;
    let nd = Infinity;
    for (const m of memories) {
      const d = Math.hypot(cp.x - m.position_x, cp.z - m.position_z);
      if (d < 5 && d < nd) {
        nd = d;
        nearest = m;
      }
    }
    nearestId.current = nearest ? nearest.id : null;
    // walking away from the open memory closes it
    if (activeMemoryId) {
      const stillNear = nearest && nearest.id === activeMemoryId;
      if (!stillNear && !closeGuard.current) {
        closeGuard.current = true;
        onCloseMemory();
      }
    } else {
      closeGuard.current = false;
    }
  });

  return (
    <group>
      {memories.map((m) => (
        <MemoryItem
          key={m.id}
          memory={m}
          nearestId={nearestId}
          onOpen={onOpenMemory}
          spawn={m.id === newMemoryId}
          activeMemoryId={activeMemoryId}
          onClose={onCloseMemory}
        />
      ))}
    </group>
  );
}