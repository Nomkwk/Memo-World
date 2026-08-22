import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

const GRID = 10; // 10x10 tiles
const TILE = 0.9;
const GAP = 0.1;
const COUNT = GRID * GRID;

// Central plaza of flat #E8935C box tiles, ~10x10 units, sitting 0.05 above ground.
// Instanced so all 100 tiles are one draw call.
export default function Path() {
  const ref = useRef();

  const matrices = useMemo(() => {
    const arr = [];
    const step = TILE + GAP;
    const start = -((GRID - 1) / 2) * step;
    for (let x = 0; x < GRID; x++) {
      for (let z = 0; z < GRID; z++) {
        const px = start + x * step;
        const pz = start + z * step;
        const matrix = new THREE.Matrix4();
        matrix.compose(
          new THREE.Vector3(px, 0.05, pz),
          new THREE.Quaternion(),
          new THREE.Vector3(TILE, 0.1, TILE)
        );
        arr.push(matrix);
      }
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    matrices.forEach((m, i) => ref.current.setMatrixAt(i, m));
    ref.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: "#E8935C", flatShading: true }),
    []
  );

  return (
    <instancedMesh ref={ref} args={[geo, mat, COUNT]} receiveShadow />
  );
}