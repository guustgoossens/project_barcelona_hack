import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Brain, Zap, Users, GitBranch, ArrowRight } from "lucide-react";
import { toScore100 } from "../lib/scoring";
import NeuralBackground from "../components/ui/flow-field-background";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const campaigns = useQuery(api.campaigns.list) ?? [];
  const seedDemo = useMutation(api.campaigns.seedDemo);
  const resetDemo = useMutation(api.campaigns.resetDemo);

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

  const bestVariant = variants
    .filter((v: any) => v.status === "done" && v.scores)
    .reduce(
      (best: any, v: any) =>
        !best || v.scores.overall > best.scores.overall ? v : best,
      null,
    );

  async function handleLaunch() {
    const result = await seedDemo({});
    if (result?.campaignId) {
      navigate({ to: "/campaign/$id", params: { id: result.campaignId } });
    }
  }

  return (
    <div className="min-h-[calc(100dvh-2.75rem)] flex flex-col">
      {/* ── HERO with neural background ── */}
      <div className="relative h-[420px] shrink-0 overflow-hidden">
        <NeuralBackground
          color="#818cf8"
          trailOpacity={0.08}
          particleCount={500}
          speed={0.6}
          className="absolute inset-0"
        />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            NeuralReach
          </h1>
          <p className="text-indigo-200/80 text-lg mt-3 max-w-lg mx-auto font-medium">
            Brain-scored outreach powered by Meta's TRIBE v2
          </p>
          <p className="text-sm text-white/40 mt-2">
            Don't spray and pray.{" "}
            <span className="font-semibold text-orange-400">Spray and Clay.</span>
          </p>

          {/* Seed button */}
          {campaigns.length === 0 && (
            <button
              onClick={handleLaunch}
              className="mt-8 flex items-center gap-2 bg-white text-gray-900 hover:bg-indigo-50 rounded-xl px-7 py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
            >
              Launch Demo Campaign
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {campaigns.length > 0 && (
            <button
              onClick={() =>
                firstCampaign &&
                navigate({
                  to: "/campaign/$id",
                  params: { id: firstCampaign._id },
                })
              }
              className="mt-8 flex items-center gap-2 bg-white text-gray-900 hover:bg-indigo-50 rounded-xl px-7 py-3 text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Tech badges */}
          <div className="flex items-center gap-3 mt-6">
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-white/10">
              TRIBE v2
            </span>
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-white/10">
              Claude Sonnet 4.6
            </span>
            <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-white/10">
              B200 GPU
            </span>
            <span className="text-[10px] text-orange-400/50 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-orange-400/20">
              Clay
            </span>
          </div>
        </div>
      </div>

      {/* ── CAMPAIGN CARD (below hero) ── */}
      {campaigns.length > 0 && firstCampaign && (
        <div className="flex-1 bg-[#FAFAFA] px-6 py-8">
          <div className="max-w-2xl mx-auto">
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
          </div>
        </div>
      )}

      {/* Seed state - no campaign yet */}
      {campaigns.length === 0 && (
        <div className="flex-1 bg-[#FAFAFA] flex items-center justify-center">
          <p className="text-xs text-gray-400">
            Seeds 8 real leads from Clay with OCEAN personality profiles
          </p>
        </div>
      )}
    </div>
  );
}
