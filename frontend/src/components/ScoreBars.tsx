export type Scores = {
  attention: number;
  curiosity: number;
  trust: number;
  motivation: number;
  resistance: number;
  overall: number;
};

const ROWS: { key: keyof Scores; label: string; tone: "good" | "bad" }[] = [
  { key: "attention", label: "Attention", tone: "good" },
  { key: "curiosity", label: "Curiosity", tone: "good" },
  { key: "trust", label: "Trust", tone: "good" },
  { key: "motivation", label: "Motivation", tone: "good" },
  { key: "resistance", label: "Resistance", tone: "bad" },
];

function bar(v: number, tone: "good" | "bad") {
  // Map score from [-1, 1] range to [0%, 100%]
  const pct = Math.max(0, Math.min(1, (v + 1) / 2)) * 100;
  const color =
    tone === "good"
      ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
      : "bg-gradient-to-r from-rose-500 to-rose-400";
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-300`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

type Props = {
  scores: Scores | null;
  personaScores?: Scores | null;
  leadName?: string;
};

export default function ScoreBars({ scores, personaScores, leadName }: Props) {
  if (!scores) {
    return <div className="text-xs text-gray-400">awaiting scores…</div>;
  }
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-medium">
        {leadName ? (
          <span className="text-blue-600">Adjusted for {leadName}</span>
        ) : (
          <span className="text-gray-400">Raw brain scores</span>
        )}
      </div>
      {ROWS.map((r) => {
        const displayed = personaScores ? personaScores[r.key] : scores[r.key];
        const delta = personaScores ? personaScores[r.key] - scores[r.key] : null;
        return (
          <div key={r.key}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[11px] text-gray-500 font-medium">{r.label}</span>
              <span className="flex items-center gap-1">
                <span className="text-[11px] font-mono text-gray-700">{displayed.toFixed(2)}</span>
                {delta !== null && delta !== 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${delta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(2)}
                  </span>
                )}
              </span>
            </div>
            {bar(displayed, r.tone)}
          </div>
        );
      })}
      {(() => {
        const displayedOverall = personaScores ? personaScores.overall : scores.overall;
        const overallDelta = personaScores ? personaScores.overall - scores.overall : null;
        return (
          <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Overall</span>
            <span className="flex items-center gap-1">
              <span
                className={`text-[11px] font-mono ${displayedOverall >= 0 ? "text-emerald-600" : "text-rose-500"}`}
              >
                {displayedOverall.toFixed(2)}
              </span>
              {overallDelta !== null && overallDelta !== 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${overallDelta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                >
                  {overallDelta > 0 ? "+" : ""}
                  {overallDelta.toFixed(2)}
                </span>
              )}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
