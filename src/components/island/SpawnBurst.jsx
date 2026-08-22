import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const POOL = 16;

// One-shot particle burst played when a new memory spawns into the world.
// Particles fly outward and upward, fall with gravity, and shrink to fade.
export default function SpawnBurst() {
  const ref = useRef();
  const parts = useMemo(
    () =>
      Array.from({ length: POOL }, () => ({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        max: 0.8,
        active: true,
      })),
    []
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    for (const pt of parts) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.6 + Math.random() * 0.6;
      pt.x = Math.cos(a) * 0.2;
      pt.y = 0.4;
      pt.z = Math.sin(a) * 0.2;
      pt.vx = Math.cos(a) * r;
      pt.vz = Math.sin(a) * r;
      pt.vy = 1.6 + Math.random() * 1.6;
      pt.life = 0;
      pt.max = 0.8;
      pt.active = true;
    }
  }, [parts]);

  useFrame((_, dtRaw) => {
    if (!ref.current) return;
    const dt = Math.min(dtRaw, 0.05);
    let any = false;
    for (let i = 0; i < POOL; i++) {
      const pt = parts[i];
      if (pt.active) {
        any = true;
        pt.life += dt;
        if (pt.life >= pt.max) {
          pt.active = false;
          m.makeScale(0, 0, 0);
          ref.current.setMatrixAt(i, m);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.z += pt.vz * dt;
        pt.vy -= 5 * dt;
        const f = 1 - pt.life / pt.max;
        const s = 0.16 * f;
        p.set(pt.x, pt.y, pt.z);
        sc.set(s, s, s);
        m.compose(p, q, sc);
        ref.current.setMatrixAt(i, m);
      } else {
        m.makeScale(0, 0, 0);
        ref.current.setMatrixAt(i, m);
      }
    }
    if (any) ref.current.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#FFB703", emissive: "#FFB703", emissiveIntensity: 1, flatShading: true }), []);

  return (
    <instancedMesh ref={ref} args={[geo, mat, POOL]} />
  );
}