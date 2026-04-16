type Lead = {
  _id: string;
  name: string;
  role: string;
  company: string;
  avatarEmoji: string;
  ocean: { o: number; c: number; e: number; a: number; n: number };
  confidence: number;
  personalityArgs: string;
};

type Props = {
  lead: Lead;
  selected: boolean;
  onSelect: () => void;
};

const OCEAN_TRAITS: { key: keyof Lead["ocean"]; label: string; color: string }[] = [
  { key: "o", label: "O", color: "bg-purple-500" },
  { key: "c", label: "C", color: "bg-blue-500" },
  { key: "e", label: "E", color: "bg-amber-500" },
  { key: "a", label: "A", color: "bg-emerald-500" },
  { key: "n", label: "N", color: "bg-rose-500" },
];

const AVATAR_COLORS: Record<
  string,
  { bg: string; text: string }
> = {
  o: { bg: "bg-purple-100", text: "text-purple-700" },
  c: { bg: "bg-blue-100", text: "text-blue-700" },
  e: { bg: "bg-amber-100", text: "text-amber-700" },
  a: { bg: "bg-emerald-100", text: "text-emerald-700" },
  n: { bg: "bg-rose-100", text: "text-rose-700" },
};

function getDominantTrait(ocean: Lead["ocean"]): keyof Lead["ocean"] {
  let max: keyof Lead["ocean"] = "o";
  let maxVal = -1;
  for (const k of Object.keys(ocean) as (keyof Lead["ocean"])[]) {
    if (ocean[k] > maxVal) {
      maxVal = ocean[k];
      max = k;
    }
  }
  return max;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

/** Compact lead card displaying Big Five (OCEAN) personality profile. */
export default function LeadCard({ lead, selected, onSelect }: Props) {
  const dominant = getDominantTrait(lead.ocean);
  const avatarColor = AVATAR_COLORS[dominant];
  const initials = getInitials(lead.name);

  return (
    <div
      onClick={onSelect}
      className={`bg-white border border-gray-200 rounded-xl p-3 shadow-sm cursor-pointer transition-all duration-200 ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor.bg} ${avatarColor.text}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {lead.name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {lead.role} @ {lead.company}
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {OCEAN_TRAITS.map((t) => (
          <div key={t.key} className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400 font-medium w-3 shrink-0">
              {t.label}
            </span>
            <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
              <div
                className={`h-1 rounded-full ${t.color} transition-all duration-300`}
                style={{ width: `${lead.ocean[t.key] * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2">
        <span className="bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-[10px] font-medium">
          {Math.round(lead.confidence * 100)}% confidence
        </span>
      </div>
    </div>
  );
}

export type { Lead };
