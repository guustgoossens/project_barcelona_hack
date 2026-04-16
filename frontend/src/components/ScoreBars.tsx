import { toScore100, displayScore } from "../lib/scoring";

export type Scores = {
  attention: number;
  curiosity: number;
  trust: number;
  motivation: number;
  resistance: number;
  overall: number;
};

const ROWS: { key: keyof Scores; label: string; tone: "good" | "bad"; tip: string }[] = [
  { key: "attention", label: "Attention", tone: "good", tip: "Parietal + frontal: Will they stop scrolling?" },
  { key: "curiosity", label: "Curiosity", tone: "good", tip: "Anterior cingulate: Will they read the whole thing?" },
  { key: "trust", label: "Trust", tone: "good", tip: "TPJ + angular gyrus: Will they trust the sender?" },
  { key: "motivation", label: "Motivation", tone: "good", tip: "vmPFC reward circuit: Will they want to reply?" },
  { key: "resistance", label: "Resistance", tone: "bad", tip: "Anterior insula: Will their brain shut down?" },
];

function bar(v: number, tone: "good" | "bad") {
  const pct = Math.min(100, Math.max(0, Math.min(1, (v + 1) / 2)) * 100 * 2.5);
  const gradient =
    tone === "good"
      ? "linear-gradient(to right, #10B981, #34D399)"
      : "linear-gradient(to right, #F87171, #EF4444)";
  return (
    <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full bar-animate"
        style={{ width: `${pct}%`, background: gradient }}
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
        const raw = personaScores ? personaScores[r.key] : scores[r.key];
        const displayed = displayScore(raw);
        const rawDelta = personaScores ? personaScores[r.key] - scores[r.key] : null;
        const delta = rawDelta !== null ? displayScore(rawDelta) : null;
        return (
          <div key={r.key}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[11px] text-gray-500 font-medium cursor-help" title={r.tip}>{r.label}</span>
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
            {bar(raw, r.tone)}
          </div>
        );
      })}
      {(() => {
        const rawOverall = personaScores ? personaScores.overall : scores.overall;
        const display100 = toScore100(rawOverall);
        const rawDelta = personaScores ? toScore100(personaScores.overall) - toScore100(scores.overall) : null;
        return (
          <>
            <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="text-[11px] text-gray-500 font-medium" title="attention + curiosity + trust + motivation − resistance, scaled 0–100">Overall</span>
              <span className="flex items-baseline gap-0.5">
                <span
                  className={`text-base font-mono font-extrabold score-pop-in ${display100 >= 50 ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {display100}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">/100</span>
              </span>
            </div>
            {leadName && rawDelta !== null && (
              <div className="mt-2 px-2.5 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="text-[10px] font-semibold text-blue-600">Adjusted for {leadName}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {ROWS.map((r) => {
                    const d = personaScores ? displayScore(personaScores[r.key] - scores[r.key]) : 0;
                    if (Math.abs(d) < 0.025) return null;
                    return (
                      <span key={r.key} className="mr-2">
                        {r.label}{" "}
                        <span className={d > 0 ? "text-emerald-600 font-semibold" : "text-rose-500 font-semibold"}>
                          {d > 0 ? "+" : ""}{d.toFixed(2)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}
