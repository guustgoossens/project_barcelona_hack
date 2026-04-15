// Viridis-ish cool→warm LUT, 256 entries, precomputed.
// Values are clamped activation scaled to [0,1] before indexing.
const STOPS: [number, number, number][] = [
  [68, 1, 84],
  [59, 82, 139],
  [33, 145, 140],
  [94, 201, 98],
  [253, 231, 37],
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const LUT = (() => {
  const N = 256;
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const seg = t * (STOPS.length - 1);
    const lo = Math.floor(seg);
    const hi = Math.min(STOPS.length - 1, lo + 1);
    const f = seg - lo;
    const a = STOPS[lo];
    const b = STOPS[hi];
    out[i * 3 + 0] = lerp(a[0], b[0], f) / 255;
    out[i * 3 + 1] = lerp(a[1], b[1], f) / 255;
    out[i * 3 + 2] = lerp(a[2], b[2], f) / 255;
  }
  return out;
})();

export function writeVertexColors(
  colors: Float32Array,
  activations: Float32Array,
  min: number,
  max: number,
) {
  const range = max - min || 1;
  for (let i = 0; i < activations.length; i++) {
    let t = (activations[i] - min) / range;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    const idx = (t * 255) | 0;
    const base = idx * 3;
    colors[i * 3 + 0] = LUT[base + 0];
    colors[i * 3 + 1] = LUT[base + 1];
    colors[i * 3 + 2] = LUT[base + 2];
  }
}
