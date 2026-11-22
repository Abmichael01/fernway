/** Decorative emerald and forest green triangle grid used on the hero's right edge. Deterministic, so it renders identically everywhere. */
export function TrianglePattern({ className }: { className?: string }) {
  const size = 120;
  const columns = 6;
  const rows = 8;
  const shades = ["#10b981", "#065f46", "#059669", "#047857", "#34d399"];
  const triangles: Array<{ points: string; fill: string; opacity: number }> = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * size;
      const y = row * (size * 0.866);
      const offset = row % 2 === 0 ? 0 : size / 2;
      const seed = (row * 7 + col * 13) % 17;
      if ((col + row) % 5 === 0 && col < 2) continue;
      triangles.push({
        points: `${x + offset},${y + size * 0.866} ${x + offset + size / 2},${y} ${x + offset + size},${y + size * 0.866}`,
        fill: shades[seed % shades.length],
        opacity: col < 2 ? 0.35 + (seed % 4) * 0.1 : 0.55 + (seed % 5) * 0.09,
      });
      triangles.push({
        points: `${x + offset + size / 2},${y} ${x + offset + size},${y + size * 0.866} ${x + offset + size * 1.5},${y}`,
        fill: shades[(seed + 2) % shades.length],
        opacity: col < 2 ? 0.25 + (seed % 3) * 0.1 : 0.45 + (seed % 4) * 0.12,
      });
    }
  }

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${size * columns} ${rows * size * 0.866}`} preserveAspectRatio="xMaxYMid slice" className={className}>
      {triangles.map((triangle, index) => (
        <polygon key={index} points={triangle.points} fill={triangle.fill} opacity={triangle.opacity} />
      ))}
    </svg>
  );
}
