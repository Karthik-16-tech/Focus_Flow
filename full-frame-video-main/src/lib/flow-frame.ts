/** Shared geometry for the image mask and its single outer contour. */
export function flowFramePath(phase = 0, energy = 0): string {
  const amplitude = 24 + Math.min(Math.abs(energy), 30);
  const points = Array.from({ length: 13 }, (_, index) => {
    const x = index * 100;
    return {
      x,
      top: 70 + Math.sin(((index / 12) * Math.PI * 2) + phase) * amplitude,
      bottom: 535 + Math.sin(((index / 12) * Math.PI * 2) + phase + 1.3) * amplitude,
    };
  });
  const curve = (key: "top" | "bottom", reverse: boolean) => {
    const ordered = reverse ? [...points].reverse() : points;
    return ordered
      .slice(1)
      .map((point, index) => {
        const previous = ordered[index];
        const before = ordered[Math.max(0, index - 1)];
        const after = ordered[Math.min(ordered.length - 1, index + 2)];
        if (!previous || !before || !after) return "";
        return `C${previous.x + (point.x - before.x) / 6} ${previous[key] + (point[key] - before[key]) / 6} ${point.x - (after.x - previous.x) / 6} ${point[key] - (after[key] - previous[key]) / 6} ${point.x} ${point[key]}`;
      })
      .join(" ");
  };
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return "";
  return `M0 ${first.top} ${curve("top", false)} L1200 ${last.bottom} ${curve("bottom", true)} Z`;
}
