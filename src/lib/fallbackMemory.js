// Minimal fallback scene used when LLM generation fails, so the user's
// written memory is never lost. A simple stacked marker sculpture in the
// core palette.
export function makeFallbackScene() {
  return {
    mood: "warm",
    zone: "meadow",
    palette: ["#E24B4B", "#FFB703", "#6EC1D4"],
    tags: [],
    parts: [
      { shape: "box", pos: [0, 0.3, 0], scale: [0.8, 0.6, 0.8], color: "#E24B4B" },
      { shape: "box", pos: [0, 0.75, 0], scale: [0.6, 0.3, 0.6], color: "#FFB703" },
      { shape: "cone", pos: [0, 1.2, 0], scale: [0.4, 0.6, 0.4], color: "#6EC1D4" },
    ],
  };
}