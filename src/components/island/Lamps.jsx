import React from "react";
import { LAMPS } from "./obstacles";
import { getHeightAt } from "./terrain";

// One lamp post: thin dark cylinder + glowing box on top + warm pointLight.
function Lamp({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 2, 6]} />
        <meshLambertMaterial color="#2a2a2a" flatShading />
      </mesh>
      <mesh position={[0, 2.08, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshLambertMaterial color="#FFB703" emissive="#FFB703" emissiveIntensity={1} flatShading />
      </mesh>
      <pointLight
        position={[0, 2.1, 0]}
        color="#FFB703"
        intensity={0.8}
        distance={8}
      />
    </group>
  );
}

// 4 lamp posts around the plaza, each grounded on the terrain.
export default function Lamps() {
  const positions = LAMPS.map((l) => l.position);
  return (
    <group>
      {positions.map((p, i) => {
        const y = getHeightAt(p[0], p[2]);
        return (
          <Lamp key={i} position={[p[0], y, p[2]]} />
        );
      })}
    </group>
  );
}