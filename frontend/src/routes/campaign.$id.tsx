import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Brain from "../components/Brain";
import Timeline from "../components/Timeline";
import ScoreBars from "../components/ScoreBars";
import WordStream from "../components/WordStream";
import BrainLegend from "../components/BrainLegend";
import HorizontalTree from "../components/HorizontalTree";
import { fetchActivations, type ActivationMatrix } from "../lib/activations";
import { applyPersonaWeights } from "../lib/persona";
import {
  GitBranch,
  RefreshCw,
  Scissors,
  X,
} from "lucide-react";

export const Route = createFileRoute("/campaign/$id")({
  component: Campaign,
});

const MESH_URL = "/fsaverage5.glb";
const HEMISPHERE_SPLIT = 10242;

function Campaign() {
  const { id } = Route.useParams();
  const campaignId = id as Id<"campaigns">;

  const campaign = useQuery(api.campaigns.get, { id: campaignId });
  const leads =
    useQuery(api.campaigns.listLeads, campaign ? { campaignId } : "skip") ?? [];
  const sessionId = campaign?.sessionId;
  const variants =
    useQuery(api.variants.list, sessionId ? { sessionId } : "skip") ?? [];

  const createChild = useMutation(api.variants.createChild);
  const archive = useMutation(api.variants.archive);

  const [selectedVariantId, setSelectedVariantId] =
    useState<Id<"variants"> | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [windowOpen, setWindowOpen] = useState(false);

  // Click a node → open window
  const handleSelectNode = useCallback(
    (nodeId: Id<"variants">) => {
      setSelectedVariantId(nodeId);
      setWindowOpen(true);
    },
    [],
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v._id === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  );

  const full = useQuery(
    api.variants.get,
    selectedVariantId ? { id: selectedVariantId } : "skip",
  );

  const selectedLead = useMemo(
    () => leads.find((l) => l._id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  const [timestep, setTimestep] = useState(0);
  const [matrix, setMatrix] = useState<ActivationMatrix | null>(null);

  useEffect(() => {
    setMatrix(null);
    setTimestep(0);
    if (!full || !full.activationsUrl || !full.shape) return;
    const [T, V] = full.shape as [number, number];
    let cancelled = false;
    fetchActivations(full.activationsUrl, [T, V])
      .then((m) => {
        if (!cancelled) setMatrix(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [full?.activationsUrl, full?.shape?.[0], full?.shape?.[1]]);

  const scores = useMemo(() => {
    if (!selectedVariant?.scoreSeries || !matrix)
      return selectedVariant?.scores ?? null;
    const t = Math.min(timestep, matrix.T - 1);
    const aggPos = (arr: number[]) => {
      const s = arr.slice(0, t + 1);
      if (!s.length) return 0;
      const m = s.reduce((a, b) => a + b, 0) / s.length;
      return 0.4 * m + 0.2 * s[0] + 0.2 * Math.min(...s) + 0.2 * s[s.length - 1];
    };
    const aggNeg = (arr: number[]) => {
      const s = arr.slice(0, t + 1);
      if (!s.length) return 0;
      const m = s.reduce((a, b) => a + b, 0) / s.length;
      return 0.4 * m + 0.2 * s[0] + 0.2 * Math.max(...s) + 0.2 * s[s.length - 1];
    };
    const a = aggPos(selectedVariant.scoreSeries.attention);
    const c = aggPos(selectedVariant.scoreSeries.curiosity);
    const tr = aggPos(selectedVariant.scoreSeries.trust);
    const mo = aggPos(selectedVariant.scoreSeries.motivation);
    const r = aggNeg(selectedVariant.scoreSeries.resistance);
    return {
      attention: a, curiosity: c, trust: tr,
      motivation: mo, resistance: r,
      overall: a + c + tr + mo - 2 * r,
    };
  }, [selectedVariant, matrix, timestep]);

  const personaScores = useMemo(() => {
    if (!scores || !selectedLead) return null;
    return applyPersonaWeights(scores, selectedLead.ocean);
  }, [scores, selectedLead]);

  async function mutate(parentId: Id<"variants">) {
    const parent = variants.find((v) => v._id === parentId);
    if (!parent) return;
    const next = window.prompt("New variant message:", parent.message);
    if (!next) return;
    await createChild({ parentId, message: next });
  }

  if (!campaign) {
    return (
      <div className="h-[calc(100dvh-2.75rem)] flex items-center justify-center bg-[#FAFAFA]">
        <p className="text-gray-400 text-sm">Loading campaign...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-2.75rem)] bg-[#FAFAFA] flex flex-col">
      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-3 shrink-0">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <h1 className="text-sm font-bold text-gray-900">{campaign.name}</h1>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-400">
          {variants.filter((v) => v.status === "done").length} scored · {leads.length} leads
        </span>
      </div>

      {/* ── MAIN AREA: Tree fills everything ── */}
      <div className="flex-1 relative min-h-0">
        {/* Full-screen tree */}
        <div className="h-full relative">
          {/* Label overlay */}
          <div className="absolute top-4 left-6 z-10">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Draft Evolution
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Click a node to inspect · Scroll to zoom · Drag to pan
            </p>
          </div>

          {/* React Flow tree fills this */}
          <HorizontalTree
            variants={variants}
            selectedId={selectedVariantId}
            onSelect={handleSelectNode}
          />
        </div>

        {/* ── FLOATING WINDOW (macOS style) ── */}
        {windowOpen && selectedVariant && (
          <>
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/5 z-10"
              onClick={() => setWindowOpen(false)}
            />

            {/* Draggable + Resizable Window */}
            <Rnd
              default={{
                x: Math.max(20, (window.innerWidth - 1050) / 2),
                y: 30,
                width: 1050,
                height: 650,
              }}
              minWidth={800}
              minHeight={450}
              bounds="parent"
              dragHandleClassName="window-drag-handle"
              className="z-20"
              style={{ position: "absolute" }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
                {/* macOS Title Bar */}
                <div className="window-drag-handle flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0 cursor-grab active:cursor-grabbing select-none">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setWindowOpen(false)}
                      className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
                    />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900">Draft Analysis</span>
                    {selectedVariant.scores && (
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                          selectedVariant.scores.overall >= 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {selectedVariant.scores.overall >= 0 ? "+" : ""}
                        {selectedVariant.scores.overall.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setWindowOpen(false)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 3-Column Layout */}
                <div className="flex-1 flex min-h-0">
                  {/* LEFT: Email + Lead */}
                  <div className="w-[32%] border-r border-gray-200 overflow-y-auto shrink-0">
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Email Draft
                      </h4>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {selectedVariant.message && matrix ? (
                          <WordStream
                            message={selectedVariant.message}
                            T={matrix.T}
                            timestep={timestep}
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm text-gray-600">
                            {selectedVariant.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Lead
                      </h4>
                      <div className="flex flex-col gap-2">
                        {leads.map((lead) => {
                          const isSel = selectedLeadId === lead._id;
                          return (
                            <button
                              key={lead._id}
                              onClick={() => setSelectedLeadId(isSel ? null : lead._id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                                isSel
                                  ? "bg-blue-50 border border-blue-200"
                                  : "bg-gray-50 border border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="w-7 h-7 rounded-full bg-gray-200 text-[10px] font-semibold text-gray-500 flex items-center justify-center shrink-0">
                                {lead.name.split(" ").map((n: string) => n[0]).join("")}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-semibold text-gray-900 truncate">{lead.name}</div>
                                <div className="text-[10px] text-gray-400 truncate">{lead.role}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {selectedLead && (
                        <div className="mt-3 flex gap-1">
                          {(["o", "c", "e", "a", "n"] as const).map((k, i) => {
                            const colors = ["bg-purple-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
                            const labels = ["O", "C", "E", "A", "N"];
                            return (
                              <div key={k} className="flex-1 text-center">
                                <div className="text-[8px] text-gray-400 mb-0.5">{labels[i]}</div>
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${colors[i]}`}
                                    style={{ width: `${selectedLead.ocean[k] * 100}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CENTER: Brain + Timeline */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 relative bg-[#F3F4F6] min-h-[240px]">
                      {matrix ? (
                        <div className="w-full h-full flex">
                          <div className="flex-1">
                            <Brain
                              meshUrl={MESH_URL}
                              activations={matrix}
                              timestep={timestep}
                              showLeft={true}
                              showRight={true}
                              hemisphereSplit={HEMISPHERE_SPLIT}
                            />
                          </div>
                          <BrainLegend />
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                          {selectedVariant.status === "scoring"
                            ? "Scoring on GPU..."
                            : selectedVariant.status === "pending"
                              ? "Queued..."
                              : selectedVariant.status === "failed"
                                ? `Error: ${selectedVariant.error}`
                                : "Waiting for data..."}
                        </div>
                      )}
                    </div>
                    {matrix && full?.fps && (
                      <div className="p-2 border-t border-gray-200 shrink-0">
                        <Timeline
                          T={matrix.T}
                          fps={full.fps}
                          hemodynamicOffsetS={full.hemodynamicOffsetS ?? 5}
                          timestep={timestep}
                          setTimestep={setTimestep}
                        />
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Scores */}
                  <div className="w-[22%] border-l border-gray-200 p-4 overflow-y-auto shrink-0">
                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Brain Scores
                    </h4>
                    <ScoreBars
                      scores={scores}
                      personaScores={personaScores}
                      leadName={selectedLead?.name}
                    />
                  </div>
                </div>

                {/* Action Bar */}
                <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-2 bg-gray-50/50 shrink-0">
                  <button
                    onClick={() => selectedVariantId && mutate(selectedVariantId)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    Branch
                  </button>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Optimize
                  </button>
                  {selectedVariant.status !== "archived" && (
                    <button
                      onClick={() => selectedVariantId && archive({ id: selectedVariantId })}
                      className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg text-sm transition-colors ml-auto"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      Prune
                    </button>
                  )}
                </div>
              </div>
            </Rnd>
          </>
        )}
      </div>
    </div>
  );
}

