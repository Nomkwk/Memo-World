import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Deep water plane (large, far edge hidden by fog), a shallow-water ring just
// outside the island edge, and a thin foam line at the waterline.
export default function Water() {
  const waterRef = useRef();

  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.position.y =
        -0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group>
      {/* Deep water: large plane, far edge beyond fog far so it never shows */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.6, 0]}
        receiveShadow
      >
        <planeGeometry args={[500, 500]} />
        <meshLambertMaterial color="#1FA8A0" flatShading />
      </mesh>

      {/* Shallow water ring just outside the island edge (30-34) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <ringGeometry args={[30, 34, 64]} />
        <meshLambertMaterial
          color="#7FD4C1"
          flatShading
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Thin foam line exactly at the waterline (radius 30) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <ringGeometry args={[29.8, 30.3, 64]} />
        <meshLambertMaterial
          color="#FDF6E8"
          flatShading
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}