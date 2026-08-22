import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const POOL = 24;
const DUST = "#d8c9a3";

// Cheap dust puffs kicked up behind the character while it moves. Pool of tiny
// boxes that fall with gravity and scale down to fade out.
export default function Particles({ charState }) {
  const ref = useRef();
  const pool = useMemo(
    () =>
      Array.from({ length: POOL }, () => ({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        max: 1,
        active: false,
      })),
    []
  );
  const cursor = useRef(0);
  const spawnTimer = useRef(0);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const p = useMemo(() => new THREE.Vector3(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!ref.current) return;
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < POOL; i++) ref.current.setMatrixAt(i, zero);
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const cs = charState.current;

    if (cs.moving) {
      spawnTimer.current += dt;
      if (spawnTimer.current > 0.04) {
        spawnTimer.current = 0;
        const pt = pool[cursor.current];
        cursor.current = (cursor.current + 1) % POOL;
        const back = cs.dir;
        pt.x = cs.pos.x - back.x * 0.3 + (Math.random() - 0.5) * 0.2;
        pt.y = 0.1;
        pt.z = cs.pos.z - back.z * 0.3 + (Math.random() - 0.5) * 0.2;
        pt.vx = -back.x * 0.6 + (Math.random() - 0.5) * 0.4;
        pt.vy = 1.2 + Math.random() * 0.6;
        pt.vz = -back.z * 0.6 + (Math.random() - 0.5) * 0.4;
        pt.life = 0;
        pt.max = 0.6;
        pt.active = true;
      }
    }

    const zero = m.makeScale(0, 0, 0);
    for (let i = 0; i < POOL; i++) {
      const pt = pool[i];
      if (pt.active) {
        pt.life += dt;
        if (pt.life >= pt.max) {
          pt.active = false;
          ref.current.setMatrixAt(i, zero);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.z += pt.vz * dt;
        pt.vy -= 4 * dt;
        const f = 1 - pt.life / pt.max;
        const sz = 0.12 * f;
        p.set(pt.x, pt.y, pt.z);
        sc.set(sz, sz, sz);
        m.compose(p, q, sc);
        ref.current.setMatrixAt(i, m);
      } else {
        ref.current.setMatrixAt(i, zero);
      }
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: DUST, flatShading: true }),
    []
  );

  return (
    <instancedMesh ref={ref} args={[geo, mat, POOL]} />
  );
}