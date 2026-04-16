import LeadCard from "./LeadCard";
import type { Lead } from "./LeadCard";

type Props = {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (id: string | null) => void;
};

/** Scrollable list of LeadCard items with selection management. */
export default function LeadList({ leads, selectedLeadId, onSelectLead }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
            Leads
          </span>
          <span className="bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
            {leads.length}
          </span>
        </div>
        {selectedLeadId && (
          <button
            onClick={() => onSelectLead(null)}
            className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        {leads.map((lead) => (
          <LeadCard
            key={lead._id}
            lead={lead}
            selected={selectedLeadId === lead._id}
            onSelect={() =>
              onSelectLead(selectedLeadId === lead._id ? null : lead._id)
            }
          />
        ))}
      </div>
    </div>
  );
}
