import React, { useMemo } from "react";
import { TREES } from "./obstacles";
import { getHeightAt } from "./terrain";

const TRUNK_COLOR = "#7a5230";
const FOLIAGE_COLORS = ["#F06292", "#F8A5C2"];

// One blossom tree: brown cylinder trunk + 3-4 overlapping low-poly icospheres.
function Tree({ position, scale }) {
  const foliage = useMemo(() => {
    const arr = [];
    const count = 3 + Math.floor(Math.random() * 2); // 3-4
    for (let i = 0; i < count; i++) {
      arr.push({
        position: [
          (Math.random() - 0.5) * 1.4,
          1.6 + Math.random() * 0.9,
          (Math.random() - 0.5) * 1.4,
        ],
        color: FOLIAGE_COLORS[Math.floor(Math.random() * FOLIAGE_COLORS.length)],
        radius: 1 + Math.random() * 0.6,
      });
    }
    return arr;
  }, []);

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, 1.5, 6]} />
        <meshLambertMaterial color={TRUNK_COLOR} flatShading />
      </mesh>
      {foliage.map((f, i) => (
        <mesh key={i} position={f.position} castShadow>
          <icosahedronGeometry args={[f.radius, 0]} />
          <meshLambertMaterial color={f.color} flatShading />
        </mesh>
      ))}
    </group>
  );
}

// 8 blossom trees scattered around the island edges.
export default function Trees() {
  const trees = TREES;

  return (
    <group>
      {trees.map((t, i) => {
        const y = getHeightAt(t.position[0], t.position[2]);
        return (
          <Tree key={i} position={[t.position[0], y, t.position[2]]} scale={t.scale} />
        );
      })}
    </group>
  );
}