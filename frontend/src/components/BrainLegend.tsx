export default function BrainLegend() {
  return (
    <div className="flex flex-col items-center gap-1 py-2 pr-2">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Activation</span>
      <div className="w-3 h-28 rounded-sm" style={{
        background: "linear-gradient(to bottom, #EF4444, #F59E0B, #EAB308, #10B981, #06B6D4, #3B82F6)"
      }} />
      <div className="flex flex-col justify-between h-28 text-[9px] text-gray-400 -mt-28 ml-5">
        <span>High</span>
        <span>Mid</span>
        <span>Low</span>
      </div>
    </div>
  );
}
