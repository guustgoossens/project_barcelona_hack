type Lead = {
  _id: string;
  name: string;
  role: string;
  company: string;
  ocean: { o: number; c: number; e: number; a: number; n: number };
};

type Props = {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string | null) => void;
};

const OCEAN_COLORS: Record<string, string> = {
  o: "bg-purple-500",
  c: "bg-blue-500",
  e: "bg-amber-500",
  a: "bg-emerald-500",
  n: "bg-rose-500",
};

function getDominantTrait(ocean: Lead["ocean"]): string {
  const entries = Object.entries(ocean) as [string, number][];
  return entries.reduce((best, curr) => (curr[1] > best[1] ? curr : best))[0];
}

function getFirstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export default function LeadTabs({
  leads,
  selectedLeadId,
  onSelectLead,
}: Props) {
  if (leads.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      {/* All leads tab */}
      <button
        onClick={() => onSelectLead(null)}
        className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 cursor-pointer ${
          selectedLeadId === null
            ? "font-semibold bg-gray-100 text-gray-900"
            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
        }`}
      >
        All leads
      </button>

      {/* Individual lead tabs */}
      {leads.map((lead) => {
        const isSelected = selectedLeadId === lead._id;
        const dominant = getDominantTrait(lead.ocean);
        const dotColor = OCEAN_COLORS[dominant] ?? "bg-gray-400";

        return (
          <button
            key={lead._id}
            onClick={() => onSelectLead(isSelected ? null : lead._id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 cursor-pointer flex items-center ${
              isSelected
                ? "font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${dotColor}`}
            />
            {getFirstName(lead.name)}
          </button>
        );
      })}
    </div>
  );
}
