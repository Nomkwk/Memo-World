import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A miniature of the main island: faceted disc, glowing rim, lamp, blossom
// tree, bench, instanced grass, and the standing character. Rotates + bobs.
const DISC_R = 3;

function Disc() {
  return (
    <mesh position={[0, -0.3, 0]}>
      <cylinderGeometry args={[DISC_R, DISC_R, 0.6, 12]} />
      <meshLambertMaterial color="#F0A868" flatShading />
    </mesh>
  );
}

// Bright glowing rim so the disc reads as a lit stage floating in the dark.
function RimGlow() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <torusGeometry args={[DISC_R, 0.06, 8, 18]} />
        <meshLambertMaterial color="#FFD08A" emissive="#FFD08A" emissiveIntensity={1} flatShading toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <torusGeometry args={[DISC_R + 0.16, 0.14, 8, 18]} />
        <meshLambertMaterial
          color="#FFB05A"
          emissive="#FFB05A"
          emissiveIntensity={1}
          flatShading
          transparent
          opacity={0.35}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[0, -0.2, 0]} color="#FFB05A" intensity={0.5} distance={6} />
    </group>
  );
}

function Lamp() {
  return (
    <group position={[1.6, 0, 0.1]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 1, 6]} />
        <meshLambertMaterial color="#2a2a2a" flatShading />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshLambertMaterial color="#FFB703" emissive="#FFB703" emissiveIntensity={1} flatShading />
      </mesh>
      <pointLight position={[0, 1.05, 0]} color="#FFB703" intensity={0.8} distance={3.2} />
    </group>
  );
}

function Tree() {
  const blobs = [
    [0, 0.55, 0, 0.32, "#F06292"],
    [0.18, 0.62, 0.05, 0.26, "#F8A5C2"],
    [-0.15, 0.6, -0.1, 0.24, "#F06292"],
  ];
  return (
    <group position={[-1.5, 0, 0.4]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 6]} />
        <meshLambertMaterial color="#7a5230" flatShading />
      </mesh>
      {blobs.map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]}>
          <icosahedronGeometry args={[b[3], 0]} />
          <meshLambertMaterial color={b[4]} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Bench() {
  return (
    <group position={[0.5, 0, -1.4]} rotation={[0, 0.6, 0]}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.18]} />
        <meshLambertMaterial color="#7a5230" flatShading />
      </mesh>
      <mesh position={[0, 0.45, -0.07]}>
        <boxGeometry args={[0.5, 0.18, 0.04]} />
        <meshLambertMaterial color="#7a5230" flatShading />
      </mesh>
      <mesh position={[-0.2, 0.14, 0]}>
        <boxGeometry args={[0.04, 0.28, 0.18]} />
        <meshLambertMaterial color="#5a3d24" flatShading />
      </mesh>
      <mesh position={[0.2, 0.14, 0]}>
        <boxGeometry args={[0.04, 0.28, 0.18]} />
        <meshLambertMaterial color="#5a3d24" flatShading />
      </mesh>
    </group>
  );
}

function Grass() {
  const ref = useRef();
  const COUNT = 130;
  const geo = useMemo(() => new THREE.ConeGeometry(0.04, 0.25, 4), []);
  const mat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: "#8B9A3D", flatShading: true }),
    []
  );
  const matrices = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++) {
      const r = 0.8 + Math.random() * 2.0;
      const a = Math.random() * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const rotY = Math.random() * Math.PI * 2;
      const s = 0.5 + Math.random() * 0.5;
      const m = new THREE.Matrix4();
      m.compose(
        new THREE.Vector3(x, 0.12 * s, z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY, 0)),
        new THREE.Vector3(s, s, s)
      );
      arr.push(m);
    }
    return arr;
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return <instancedMesh ref={ref} args={[geo, mat, COUNT]} />;
}

function Character() {
  const bob = useRef();
  useFrame((s) => {
    if (bob.current) bob.current.position.y = Math.sin(s.clock.elapsedTime * 2) * 0.02;
  });
  const c = "#E24B4B";
  const limb = "#3a2a22";
  return (
    <group position={[0, 0, 0.9]}>
      <group ref={bob}>
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.18, 0.21, 0.12]} />
          <meshLambertMaterial color={c} flatShading />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshLambertMaterial color={c} flatShading />
        </mesh>
        <mesh position={[-0.095, 0.33, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.15, 6]} />
          <meshLambertMaterial color={limb} flatShading />
        </mesh>
        <mesh position={[0.095, 0.33, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.15, 6]} />
          <meshLambertMaterial color={limb} flatShading />
        </mesh>
      </group>
      <mesh position={[-0.045, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
        <meshLambertMaterial color={limb} flatShading />
      </mesh>
      <mesh position={[0.045, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 6]} />
        <meshLambertMaterial color={limb} flatShading />
      </mesh>
    </group>
  );
}

function Scene() {
  const g = useRef();
  useFrame((s) => {
    if (g.current) {
      g.current.rotation.y = s.clock.elapsedTime * 0.12;
      g.current.position.y = Math.sin(s.clock.elapsedTime * 0.8) * 0.08;
    }
  });
  return (
    <>
      <ambientLight intensity={0.25} />
      <hemisphereLight args={["#ffffff", "#3D1F4D", 0.35]} />
      <directionalLight position={[3, 5, 2]} intensity={0.9} color="#fff5e0" />
      <group ref={g}>
        <Disc />
        <RimGlow />
        <Lamp />
        <Tree />
        <Bench />
        <Grass />
        <Character />
      </group>
    </>
  );
}

export default function MiniIsland() {
  return (
    <Canvas
      camera={{ position: [4.6, 3.1, 4.6], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={({ camera }) => camera.lookAt(0, 0.2, 0)}
    >
      <Scene />
    </Canvas>
  );
}