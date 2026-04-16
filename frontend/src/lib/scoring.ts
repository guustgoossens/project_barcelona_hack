// Display multiplier: raw z-scores are small, so we amplify for readability.
// Applied only on the rendering side — stored data is untouched.
export const DISPLAY_SCALE = 2.5;

// Raw overall = sum of 4 positive z-scores minus 1× resistance.
// Practical range ≈ [-2, +2]. Map to 0–100 for display, then scale.
export function toScore100(raw: number): number {
  return Math.round(Math.max(0, Math.min(100, ((raw + 2) / 4) * 100 * DISPLAY_SCALE)));
}

// Scale an individual sub-score (attention, curiosity, etc.) for display.
export function displayScore(raw: number): number {
  return raw * DISPLAY_SCALE;
}
