import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Lock, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const campaigns = useQuery(api.campaigns.list) ?? [];
  const seedDemo = useMutation(api.campaigns.seedDemo);
  const resetDemo = useMutation(api.campaigns.resetDemo);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            NeuralReach
          </h1>
          <p className="text-gray-400 text-sm mt-1">Brain-scored outreach</p>
        </div>

        {/* Seed Demo state */}
        {campaigns.length === 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => seedDemo({})}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm transition-colors"
            >
              Seed Demo
            </button>
          </div>
        )}

        {/* Campaign grid */}
        {campaigns.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mt-8">
              Your Campaigns
            </h2>

            <div className="grid grid-cols-3 gap-4 mt-4 max-w-4xl mx-auto">
              {/* Card 1 - Active */}
              <div
                onClick={() =>
                  navigate({
                    to: "/campaign/$id",
                    params: { id: campaigns[0]._id },
                  })
                }
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-500 h-2 w-2 rounded-full" />
                  <span className="text-sm font-semibold text-gray-900">
                    Creative Branding Designer — Barcelona
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  3 leads &middot; 4 drafts
                </p>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full px-2 py-0.5 mt-3 inline-block">
                  ★ Best: +2.40
                </span>
              </div>

              {/* Card 2 - Locked */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    Series B CTO Hire — London
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Coming soon</p>
              </div>

              {/* Card 3 - Locked */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    ML Research Outreach — Paris
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Coming soon</p>
              </div>
            </div>

            {/* New Campaign button + Reset */}
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => {}}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Campaign
              </button>
              <button
                onClick={async () => {
                  await resetDemo({});
                  await seedDemo({});
                }}
                className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm transition-colors"
              >
                Reset &amp; Reseed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
