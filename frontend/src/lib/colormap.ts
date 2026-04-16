// Brain activation colormap (jet: blue → cyan → green → yellow → orange → red).
// Below threshold = light gray/off. Above threshold = jet colormap gradient.
// Only the top activated regions light up.

const ACTIVE_STOPS: [number, number, number][] = [
  [59, 130, 246],    // blue   #3B82F6
  [6, 182, 212],     // cyan   #06B6D4
  [16, 185, 129],    // green  #10B981
  [234, 179, 8],     // yellow #EAB308
  [245, 158, 11],    // orange #F59E0B
  [239, 68, 68],     // red    #EF4444
];

// Light gray base for inactive regions
const BASE_COLOR: [number, number, number] = [0.82, 0.84, 0.86];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const LUT = (() => {
  const N = 256;
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const seg = t * (ACTIVE_STOPS.length - 1);
    const lo = Math.floor(seg);
    const hi = Math.min(ACTIVE_STOPS.length - 1, lo + 1);
    const f = seg - lo;
    const a = ACTIVE_STOPS[lo];
    const b = ACTIVE_STOPS[hi];
    out[i * 3 + 0] = lerp(a[0], b[0], f) / 255;
    out[i * 3 + 1] = lerp(a[1], b[1], f) / 255;
    out[i * 3 + 2] = lerp(a[2], b[2], f) / 255;
  }
  return out;
})();

/**
 * Compute threshold: only top N% of activations light up.
 * Everything below is dark. Default: top 20%.
 */
export function computeThreshold(data: Float32Array, topPercent = 20): { threshold: number; max: number } {
  const step = Math.max(1, Math.floor(data.length / 3000));
  const samples: number[] = [];
  for (let i = 0; i < data.length; i += step) {
    samples.push(data[i]);
  }
  samples.sort((a, b) => a - b);
  const threshold = samples[Math.floor(samples.length * (1 - topPercent / 100))];
  const max = samples[samples.length - 1];
  return { threshold, max };
}

export function writeVertexColors(
  colors: Float32Array,
  activations: Float32Array,
  threshold: number,
  max: number,
) {
  const range = max - threshold || 1;
  for (let i = 0; i < activations.length; i++) {
    const val = activations[i];
    if (val < threshold) {
      // Below threshold = dark
      colors[i * 3 + 0] = BASE_COLOR[0];
      colors[i * 3 + 1] = BASE_COLOR[1];
      colors[i * 3 + 2] = BASE_COLOR[2];
    } else {
      // Above threshold = map to color LUT
      let t = (val - threshold) / range;
      if (t > 1) t = 1;
      const idx = (t * 255) | 0;
      const base = idx * 3;
      colors[i * 3 + 0] = LUT[base + 0];
      colors[i * 3 + 1] = LUT[base + 1];
      colors[i * 3 + 2] = LUT[base + 2];
    }
  }
}
