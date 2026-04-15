// Fetch the raw fp16 activation blob from a Convex storage URL and decode
// into a Float32Array of length T * 20484.

export type ActivationMatrix = {
  data: Float32Array;
  T: number;
  V: number;
};

export async function fetchActivations(
  url: string,
  shape: [number, number],
): Promise<ActivationMatrix> {
  const [T, V] = shape;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`activation fetch ${res.status}`);
  const buf = await res.arrayBuffer();
  const fp16 = new Uint16Array(buf);
  if (fp16.length !== T * V) {
    throw new Error(`size mismatch: got ${fp16.length}, want ${T * V}`);
  }
  const out = new Float32Array(T * V);
  for (let i = 0; i < fp16.length; i++) out[i] = fp16ToFloat(fp16[i]);
  return { data: out, T, V };
}

// IEEE-754 binary16 → float32.
function fp16ToFloat(h: number): number {
  const s = (h & 0x8000) >> 15;
  const e = (h & 0x7c00) >> 10;
  const f = h & 0x03ff;
  if (e === 0) {
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
  }
  if (e === 0x1f) {
    return f ? NaN : (s ? -Infinity : Infinity);
  }
  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
}
