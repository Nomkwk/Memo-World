import React, { useMemo } from "react";
import * as THREE from "three";
import { RADIUS, getHeightAt } from "./terrain";
import { PATCHES } from "./patches";

const SIZE = 100;
const SEG = 160;
const SAND = new THREE.Color("#F0A868");
const GRASS = new THREE.Color("#6E7D2E");
const BEACH = new THREE.Color("#F5D9A8");
const CLIFF = new THREE.Color("#C97F45");
const BEACH_WIDTH = 4;

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// Single displaced terrain mesh. One 100x100 PlaneGeometry (160x160 segments)
// rotated flat; every vertex height is set from getHeightAt in JS, and a per-
// vertex colour attribute paints:
//   - grass patches: sand → grass by distance to the nearest patch centre,
//     smoothstepped and perturbed with noise for an irregular edge,
//   - beach: pale sand in the outer BEACH_WIDTH units before the cliff,
//   - cliff: the band past RADIUS dropping to -6.
// One material (meshLambertMaterial, flatShading, vertexColors, base color
// white). No textures, no separate coloured discs, no dashed props.
export default function Ground() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.sqrt(x * x + z * z);

      // grass patch blend: nearest patch, 1 at centre → 0 at edge, noisy edge
      let best = Infinity;
      let bestR = 1;
      for (const p of PATCHES) {
        const pd = Math.hypot(x - p.x, z - p.z);
        if (pd < best) {
          best = pd;
          bestR = p.r;
        }
      }
      let gBlend = clamp01(1 - best / bestR);
      gBlend = gBlend * gBlend * (3 - 2 * gBlend);
      const noise =
        Math.sin(x * 2.3) * Math.cos(z * 1.9) * 0.5 +
        Math.sin(x * 5.1 + 1.3) * Math.cos(z * 4.7) * 0.25;
      gBlend = clamp01(gBlend + noise * 0.18);

      c.copy(SAND).lerp(GRASS, gBlend);

      // beach blend: pale sand in the outer BEACH_WIDTH units before the cliff
      const bRaw = clamp01((d - (RADIUS - BEACH_WIDTH)) / BEACH_WIDTH);
      const bBlend = bRaw * bRaw * (3 - 2 * bRaw);
      c.lerp(BEACH, bBlend);

      // height + cliff band
      let h = getHeightAt(x, z);
      if (d > RADIUS) {
        const cliffT = Math.min(1, (d - RADIUS) / 2);
        h = THREE.MathUtils.lerp(h, -6, cliffT);
        c.lerp(CLIFF, cliffT);
      }

      pos.setY(i, h);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} receiveShadow castShadow>
      <meshLambertMaterial vertexColors flatShading color="#ffffff" />
    </mesh>
  );
}