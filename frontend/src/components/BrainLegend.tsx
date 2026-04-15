export default function BrainLegend() {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Activation</span>
      <div className="w-4 h-32 rounded-sm" style={{
        background: "linear-gradient(to bottom, #ffdddd, #ff3232, #ff6414, #fae032, #28b464, #148ca0, #0a0308)"
      }} />
      <div className="flex flex-col justify-between h-32 text-[10px] text-neutral-500 -mt-32 ml-7">
        <span>High</span>
        <span>Mid</span>
        <span>Off</span>
      </div>
    </div>
  );
}
