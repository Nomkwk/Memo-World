import React from "react";
import { getHeightAt } from "./terrain";

// Deterministic placement of 7 shoreline rocks so they stay put across renders.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(77001);
const ROCKS = Array.from({ length: 7 }, () => {
  const a = rand() * Math.PI * 2;
  const r = 28 + rand() * 3; // hugging the shoreline
  const scale = 0.4 + rand() * 0.5;
  return {
    x: Math.cos(a) * r,
    z: Math.sin(a) * r,
    scale,
    rot: rand() * Math.PI * 2,
    y: -0.25, // partly sunk into the sand
  };
});

// Low-poly icosahedron rocks scattered near the shoreline.
export default function Rocks() {
  return (
    <group>
      {ROCKS.map((r, i) => (
        <mesh
          key={i}
          position={[r.x, getHeightAt(r.x, r.z) + r.y, r.z]}
          scale={[r.scale, r.scale * 0.7, r.scale]}
          rotation={[0, r.rot, 0]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshLambertMaterial color="#9B8B7E" flatShading />
        </mesh>
      ))}
    </group>
  );
}