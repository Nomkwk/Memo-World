// Deterministic grass-patch centres so the Grass blades and the darker Ground
// discs beneath them line up exactly. Seeded so the layout is stable across
// renders and between the two components.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240822);
export const PATCHES = Array.from({ length: 14 }, () => {
  const angle = rand() * Math.PI * 2;
  const dist = 12 + rand() * 8; // 12-20 from island centre
  const r = 4 + rand() * 5; // 4-9 patch radius
  return { x: Math.cos(angle) * dist, z: Math.sin(angle) * dist, r };
});

export const GRASS_COLORS = ["#7A8A35", "#8B9A3D", "#A3AF4A"];