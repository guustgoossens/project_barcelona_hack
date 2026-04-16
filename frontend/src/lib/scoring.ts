// Raw overall = sum of 4 positive z-scores minus 1× resistance.
// Practical range ≈ [-2, +2]. Map to 0–100 for display.
export function toScore100(raw: number): number {
  return Math.round(Math.max(0, Math.min(100, ((raw + 2) / 4) * 100)));
}
