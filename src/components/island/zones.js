// Five zone regions on the island, each a centre point [x, z] and radius.
// Used to place generated memory objects inside the matching zone.
// All centres sit well inside the island radius (28).
export const ZONES = {
  beach: { centre: [20, 0], radius: 5 },
  forest: { centre: [-16, -14], radius: 5 },
  hilltop: { centre: [9, 5], radius: 5 },
  shoreline: { centre: [-15, 15], radius: 5 },
  meadow: { centre: [0, -18], radius: 5 },
};