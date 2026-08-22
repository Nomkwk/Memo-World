import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Tall transparent light beam rising from a memory so it can be spotted from
// anywhere on the island. Fades toward the top; brightens when it's nearest.
const VERT = `
  varying float vY;
  void main() {
    vY = position.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uBright;
  varying float vY;
  void main() {
    float n = (vY + 3.0) / 6.0;
    float fade = 1.0 - smoothstep(0.55, 1.0, n);
    gl_FragColor = vec4(uColor, uOpacity * fade * uBright);
  }
`;

export default function MemoryBeam({ memory, nearestId, color = "#ffffff" }) {
  const mat = useRef();
  const bright = useRef(1.0);
  const matArgs = useMemo(
    () => [
      {
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: 0.25 },
          uBright: { value: 1.0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      },
    ],
    [color]
  );

  useFrame(() => {
    const near = nearestId && nearestId.current === memory.id;
    const target = near ? 1.8 : 1.0;
    bright.current += (target - bright.current) * 0.1;
    if (mat.current) mat.current.uniforms.uBright.value = bright.current;
  });

  return (
    <mesh position={[0, 3, 0]}>
      <cylinderGeometry args={[0.15, 0.15, 6, 8, 1, true]} />
      <shaderMaterial ref={mat} args={matArgs} />
    </mesh>
  );
}