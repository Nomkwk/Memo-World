import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Returns the R3F geometry element for a given primitive shape.
function geometryFor(shape) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[1, 12, 8]} />;
    case "cylinder":
      return <cylinderGeometry args={[1, 1, 1, 10]} />;
    case "cone":
      return <coneGeometry args={[1, 1, 12]} />;
    case "torus":
      return <torusGeometry args={[0.7, 0.3, 8, 16]} />;
    case "plane":
      return <planeGeometry args={[1, 1]} />;
    case "box":
    default:
      return <boxGeometry args={[1, 1, 1]} />;
  }
}

// Half-extent of a part's bounding box per axis, by shape.
function halfExtent(shape, s) {
  const ax = Math.abs(s[0]);
  const ay = Math.abs(s[1]);
  const az = Math.abs(s[2]);
  switch (shape) {
    case "torus":
      return [ax, ay * 0.3, az];
    case "plane":
      return [ax / 2, 0, az / 2];
    default:
      return [ax / 2, ay / 2, az / 2];
  }
}

// Compute a uniform scale so the largest dimension becomes 2.2, and a y
// offset so the lowest point sits at local y = 0 (so it rests on the pedestal).
function computeNorm(object_json) {
  if (
    !object_json ||
    !Array.isArray(object_json.parts) ||
    !object_json.parts.length
  ) {
    return { scaleFactor: 1, yOffset: 0 };
  }
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const p of object_json.parts) {
    const h = halfExtent(p.shape, p.scale);
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], p.pos[i] - h[i]);
      max[i] = Math.max(max[i], p.pos[i] + h[i]);
    }
  }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const largest = Math.max(size[0], size[1], size[2]) || 1;
  const scaleFactor = 2.2 / largest;
  const yOffset = -min[1] * scaleFactor;
  return { scaleFactor, yOffset };
}

function Part({ part }) {
  const emissive = !!part.emissive;
  return (
    <mesh
      position={part.pos}
      scale={part.scale}
      rotation={part.rot || [0, 0, 0]}
      castShadow
      receiveShadow
    >
      {geometryFor(part.shape)}
      {emissive ? (
        <meshLambertMaterial
          color={part.color}
          emissive={part.color}
          emissiveIntensity={0.9}
          flatShading
        />
      ) : (
        <meshLambertMaterial color={part.color} flatShading />
      )}
      {emissive && (
        <pointLight color={part.color} intensity={0.6} distance={3} />
      )}
    </mesh>
  );
}

// Renders a cached memory scene graph (object_json) normalised to a consistent
// size, resting on a code-rendered pedestal, with a very slow rotation.
function MemoryObject({ object_json, ...props }) {
  const spinRef = useRef();
  const { scaleFactor, yOffset } = useMemo(
    () => computeNorm(object_json),
    [object_json]
  );

  useFrame((_, dt) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += dt * ((Math.PI * 2) / 60);
    }
  });

  if (!object_json || !Array.isArray(object_json.parts)) return null;
  return (
    <group {...props}>
      {/* Pedestal: 12-sided cylinder, 1.6 wide, 0.15 tall, on the ground */}
      <mesh position={[0, 0.075, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.15, 12]} />
        <meshLambertMaterial color="#D98E5A" flatShading />
      </mesh>

      {/* Object on top of the pedestal, normalised + slowly rotating */}
      <group ref={spinRef} position={[0, 0.15, 0]} scale={scaleFactor}>
        <group position={[0, yOffset, 0]}>
          {object_json.parts.map((part, i) => (
            <Part key={i} part={part} />
          ))}
        </group>
      </group>
    </group>
  );
}

export default React.memo(MemoryObject);