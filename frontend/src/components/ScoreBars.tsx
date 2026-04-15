type Scores = {
  attention: number;
  curiosity: number;
  trust: number;
  motivation: number;
  resistance: number;
  overall: number;
};

const ROWS: { key: keyof Scores; label: string; tone: "good" | "bad" | "neutral" }[] = [
  { key: "attention", label: "Attention", tone: "good" },
  { key: "curiosity", label: "Curiosity", tone: "good" },
  { key: "trust", label: "Trust", tone: "good" },
  { key: "motivation", label: "Motivation", tone: "good" },
  { key: "resistance", label: "Resistance", tone: "bad" },
];

function bar(v: number, tone: "good" | "bad" | "neutral") {
  const pct = Math.max(0, Math.min(1, (v + 1) / 2)) * 100;
  const color =
    tone === "good" ? "bg-emerald-500" : tone === "bad" ? "bg-rose-500" : "bg-sky-500";
  return (
    <div className="h-2 rounded bg-neutral-800 overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function ScoreBars({ scores }: { scores: Scores | null }) {
  if (!scores) {
    return <div className="text-xs text-neutral-500">awaiting scores…</div>;
  }
  return (
    <div className="space-y-2">
      {ROWS.map((r) => (
        <div key={r.key}>
          <div className="flex justify-between text-xs text-neutral-400 mb-0.5">
            <span>{r.label}</span>
            <span className="font-mono">{(scores[r.key] as number).toFixed(2)}</span>
          </div>
          {bar(scores[r.key] as number, r.tone)}
        </div>
      ))}
      <div className="pt-1 mt-1 border-t border-neutral-800 text-xs text-neutral-400 flex justify-between">
        <span>Overall</span>
        <span className="font-mono text-neutral-200">{scores.overall.toFixed(2)}</span>
      </div>
    </div>
  );
}
