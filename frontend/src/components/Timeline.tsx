import { useEffect, useRef, useState } from "react";

type Props = {
  T: number;
  fps: number;
  hemodynamicOffsetS: number;
  timestep: number;
  setTimestep: (t: number) => void;
};

export default function Timeline({
  T,
  fps,
  hemodynamicOffsetS,
  timestep,
  setTimestep,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);
  const last = useRef<number>(0);

  useEffect(() => {
    if (!playing) return;
    const step = (now: number) => {
      if (now - last.current > 1000 / fps) {
        last.current = now;
        if (timestep >= T - 1) {
          setPlaying(false);
          return;
        }
        setTimestep(timestep + 1);
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, timestep, T, fps, setTimestep]);

  const seconds = timestep / fps - hemodynamicOffsetS;
  return (
    <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded">
      <button
        className="px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-white text-sm"
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? "⏸" : "▶"}
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(0, T - 1)}
        value={timestep}
        onChange={(e) => setTimestep(parseInt(e.target.value))}
        className="flex-1"
      />
      <span className="text-xs text-neutral-300 font-mono min-w-[80px] text-right">
        t={seconds.toFixed(1)}s
      </span>
    </div>
  );
}
