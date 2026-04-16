import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

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
    <div className="p-2.5 flex items-center gap-3 bg-white border border-gray-200 rounded-xl">
      <button
        className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-200 flex items-center justify-center"
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(0, T - 1)}
        value={timestep}
        onChange={(e) => setTimestep(parseInt(e.target.value))}
        className="flex-1 accent-blue-600"
      />
      <span className="text-[11px] text-gray-400 font-mono min-w-[80px] text-right">
        t={seconds.toFixed(1)}s
      </span>
    </div>
  );
}
