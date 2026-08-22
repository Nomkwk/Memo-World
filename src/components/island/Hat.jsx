import React from "react";

// Hats sit on top of the character's head (head center y=1.4, top ~1.6),
// built from primitives in the low-poly toy style. Rendered inside the
// character's bob group so they move with the head.
export default function Hat({ hat, color }) {
  if (hat === "cap") {
    return (
      <group position={[0, 1.6, 0]}>
        <mesh castShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[0.42, 0.16, 0.42]} />
          <meshLambertMaterial color={color} flatShading />
        </mesh>
        <mesh castShadow position={[0, 0.04, 0.26]}>
          <boxGeometry args={[0.42, 0.06, 0.2]} />
          <meshLambertMaterial color={color} flatShading />
        </mesh>
      </group>
    );
  }
  if (hat === "crown") {
    const gold = "#FFB703";
    return (
      <group position={[0, 1.6, 0]}>
        <mesh castShadow position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.14, 8]} />
          <meshLambertMaterial color={gold} flatShading emissive={gold} emissiveIntensity={0.25} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              castShadow
              position={[Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2]}
            >
              <coneGeometry args={[0.06, 0.16, 4]} />
              <meshLambertMaterial color={gold} flatShading emissive={gold} emissiveIntensity={0.25} />
            </mesh>
          );
        })}
      </group>
    );
  }
  if (hat === "flower") {
    return (
      <group position={[0, 1.64, 0]}>
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} castShadow position={[Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1]}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshLambertMaterial color="#F2A2B4" flatShading />
            </mesh>
          );
        })}
        <mesh castShadow>
          <sphereGeometry args={[0.08, 8, 6]} />
          <meshLambertMaterial color="#FFB703" flatShading emissive="#FFB703" emissiveIntensity={0.2} />
        </mesh>
      </group>
    );
  }
  return null;
}