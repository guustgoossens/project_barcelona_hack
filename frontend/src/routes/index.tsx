import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Zap, Users, GitBranch } from "lucide-react";
import { toScore100 } from "../lib/scoring";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const campaigns = useQuery(api.campaigns.list) ?? [];
  const seedDemo = useMutation(api.campaigns.seedDemo);
  const resetDemo = useMutation(api.campaigns.resetDemo);

  // If we have a campaign, get real stats
  const firstCampaign = campaigns[0] ?? null;
  const leads =
    useQuery(
      api.campaigns.listLeads,
      firstCampaign ? { campaignId: firstCampaign._id } : "skip",
    ) ?? [];
  const variants =
    useQuery(
      api.variants.list,
      firstCampaign?.sessionId ? { sessionId: firstCampaign.sessionId } : "skip",
    ) ?? [];

  const scoredVariants = variants.filter((v: any) => v.status === "done");
  const bestVariant = scoredVariants.reduce(
    (best: any, v: any) =>
      v.scores && (!best || v.scores.overall > best.scores.overall) ? v : best,
    null,
  );

  return (
    <div className="min-h-[calc(100dvh-2.75rem)] bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#FAFAFA] flex items-center justify-center">
                <Zap className="w-2 h-2 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            NeuralReach
          </h1>
          <p className="text-gray-400 text-base mt-2 max-w-md mx-auto">
            Brain-scored outreach powered by Meta's TRIBE v2
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Don't spray and pray.{" "}
            <span className="font-semibold text-gray-700">Spray and Clay.</span>
          </p>
        </div>

        {/* Seed Demo state */}
        {campaigns.length === 0 && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => seedDemo({})}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-8 py-3 text-sm font-semibold shadow-sm transition-all hover:shadow-md"
            >
              Launch Demo Campaign
            </button>
            <p className="text-xs text-gray-400">
              Seeds 8 real leads from Clay with OCEAN personality profiles
            </p>
          </div>
        )}

        {/* Campaign card */}
        {campaigns.length > 0 && firstCampaign && (
          <>
            <div
              onClick={() =>
                navigate({
                  to: "/campaign/$id",
                  params: { id: firstCampaign._id },
                })
              }
              className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-300 cursor-pointer transition-all duration-300 overflow-hidden group"
            >
              {/* Card header */}
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-base font-bold text-gray-900">
                      {firstCampaign.name}
                    </h2>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                    Open workspace →
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="px-6 py-4 grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{leads.length}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Leads</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <GitBranch className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {variants.filter((v: any) => v.status !== "archived").length}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Variants</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {bestVariant ? toScore100(bestVariant.scores.overall) : "—"}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Best Score</div>
                  </div>
                </div>
              </div>

              {/* Clay badge */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-orange-500 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </div>
                <span className="text-[11px] text-gray-500">
                  Leads enriched via <span className="font-semibold text-gray-700">Clay</span> with OCEAN personality profiles
                </span>
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-center mt-6">
              <button
                onClick={async () => {
                  await resetDemo({});
                  await seedDemo({});
                }}
                className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 border border-gray-200 rounded-lg px-4 py-2 text-xs transition-colors"
              >
                Reset & Reseed Demo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
