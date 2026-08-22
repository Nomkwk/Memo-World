import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { PATCHES, GRASS_COLORS } from "./patches";
import { getHeightAt } from "./terrain";

const COUNT = 9000;
const ISLAND_CLAMP = 25; // keep blades off the beach ring

// InstancedMesh of 9000 small cones (r0.05, h0.3) placed only inside the 14
// shared patches, denser toward each patch centre. Per-blade colour varies
// across three greens. Single draw call.
export default function Grass() {
  const ref = useRef();

  const geo = useMemo(() => new THREE.ConeGeometry(0.05, 0.3, 4), []);
  const mat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: "#ffffff", flatShading: true }),
    []
  );

  const { matrices, colors } = useMemo(() => {
    const matrices = [];
    const colors = [];
    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scl = new THREE.Vector3();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < COUNT; i++) {
      const patch = PATCHES[Math.floor(Math.random() * PATCHES.length)];
      const r = patch.r * Math.random(); // denser toward centre
      const a = Math.random() * Math.PI * 2;
      const x = patch.x + Math.cos(a) * r;
      const z = patch.z + Math.sin(a) * r;
      if (Math.hypot(x, z) > ISLAND_CLAMP) {
        matrices.push(zero);
        colors.push(new THREE.Color("#8B9A3D"));
        continue;
      }
      const rotY = Math.random() * Math.PI * 2;
      const s = 0.7 + Math.random() * 0.7;
      pos.set(x, getHeightAt(x, z) + 0.15 * s, z); // cone height 0.3, half = 0.15
      quat.setFromEuler(euler.set(0, rotY, 0));
      scl.set(s, s, s);
      m.compose(pos, quat, scl);
      matrices.push(m.clone());
      colors.push(
        new THREE.Color(
          GRASS_COLORS[Math.floor(Math.random() * GRASS_COLORS.length)]
        )
      );
    }
    return { matrices, colors };
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m));
    ref.current.instanceMatrix.needsUpdate = true;
    colors.forEach((c, i) => ref.current.setColorAt(i, c));
    ref.current.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  return <instancedMesh ref={ref} args={[geo, mat, COUNT]} />;
}