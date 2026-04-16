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
    <div className="relative min-h-[calc(100dvh-2.75rem)]">
      {/* ── Full-screen flow field background ── */}
      <NeuralBackground
        color="#94A3B8"
        bgRgb="250,250,250"
        trailOpacity={0.1}
        particleCount={450}
        speed={0.5}
        className="!absolute inset-0 z-0"
      />

      {/* ── Content floating on top ── */}
      <div className="relative z-10 min-h-[calc(100dvh-2.75rem)] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#FAFAFA] flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              NeuralReach
            </h1>
            <p className="text-gray-500 text-lg mt-3 max-w-lg mx-auto">
              Brain-scored outreach powered by Meta's TRIBE v2
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Don't spray and pray.{" "}
              <span className="font-semibold text-gray-700">Spray and Clay.</span>
            </p>

            {/* Tech badges */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm">
                TRIBE v2
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm">
                Claude Sonnet 4.6
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-gray-200 bg-white/60 backdrop-blur-sm">
                B200 GPU
              </span>
              <span className="text-[10px] text-orange-500 uppercase tracking-wider font-medium px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50/60 backdrop-blur-sm">
                Clay
              </span>
            </div>
          </div>

          {/* Seed state */}
          {campaigns.length === 0 && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleLaunch}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-8 py-3.5 text-sm font-bold shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                Launch Demo Campaign
                <ArrowRight className="w-4 h-4" />
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
                className="bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-gray-300 cursor-pointer transition-all duration-300 overflow-hidden group"
              >
                {/* Card header */}
                <div className="px-6 py-5 border-b border-gray-100/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h2 className="text-base font-bold text-gray-900">
                        {firstCampaign.name}
                      </h2>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                      Open workspace
                      <ArrowRight className="w-3 h-3" />
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
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100/80 flex items-center gap-2">
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
                  className="text-gray-400 hover:text-rose-500 hover:bg-white/60 border border-gray-200 rounded-lg px-4 py-2 text-xs transition-colors backdrop-blur-sm"
                >
                  Reset & Reseed Demo
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
