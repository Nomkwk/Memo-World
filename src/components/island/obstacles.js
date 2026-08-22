// Shared, deterministic obstacle layout so Trees, Lamps, and the Character
// collision system all agree on where things are.

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(7);

export const TREES = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + (rng() - 0.5) * 0.4;
  const r = 22 + rng() * 6;
  return {
    position: [Math.cos(a) * r, 0, Math.sin(a) * r],
    scale: 0.8 + rng() * 0.6,
  };
});

export const LAMPS = [
  [3.5, 0, 3.5],
  [-3.5, 0, 3.5],
  [3.5, 0, -3.5],
  [-3.5, 0, -3.5],
].map((p) => ({ position: p }));

// Flat list of circle colliders for the character.
export const OBSTACLES = [
  ...TREES.map((t) => ({ x: t.position[0], z: t.position[2], radius: 0.7 })),
  ...LAMPS.map((l) => ({ x: l.position[0], z: l.position[2], radius: 0.5 })),
];