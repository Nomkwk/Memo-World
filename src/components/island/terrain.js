// Single source of truth for island terrain height. Every object that sits on
// the ground — the terrain mesh, character, memories, trees, lamps, rocks and
// grass — must read its Y from getHeightAt(x, z). Nothing else may compute
// terrain height.

const RADIUS = 40;

function getHeightAt(x, z) {
  let h =
    1.6 * Math.sin(x * 0.06) * Math.cos(z * 0.055) +
    0.9 * Math.sin(x * 0.11 + 1.7) * Math.cos(z * 0.09 + 0.4) +
    0.5 * Math.sin((x + z) * 0.15);
  const d = Math.sqrt(x * x + z * z);
  // flatten the central plaza
  const plaza = Math.min(1, Math.max(0, (d - 7) / 4));
  h *= plaza * plaza * (3 - 2 * plaza);
  // fall away to zero at the shoreline
  const edge = Math.min(1, Math.max(0, (RADIUS - d) / 8));
  h *= edge * edge * (3 - 2 * edge);
  return h;
}

export { RADIUS, getHeightAt };