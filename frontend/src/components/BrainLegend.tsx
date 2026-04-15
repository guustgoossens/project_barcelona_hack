export default function BrainLegend() {
  // Gradient matches LUT in colormap.ts:
  // teal #14648c → green #28b464 → yellow #fadc32 → orange #ff6414 → red #ff3232 → white #ffdddc
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Activation</span>
      <div className="w-4 h-32 rounded-sm" style={{
        background: "linear-gradient(to bottom, #ffdddc, #ff3232, #ff6414, #fadc32, #28b464, #14648c, #0a0814)"
      }} />
      <div className="flex flex-col justify-between h-32 text-[10px] text-neutral-500 -mt-32 ml-7">
        <span>High</span>
        <span>Mid</span>
        <span>Off</span>
      </div>
    </div>
  );
}
