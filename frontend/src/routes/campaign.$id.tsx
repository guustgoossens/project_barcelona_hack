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
  FileText,
  Brain as BrainIcon,
  Users,
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

type RightTab = "notes" | "brain" | "leads";

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
  const [rightTab, setRightTab] = useState<RightTab>("brain");
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

  const TABS: { key: RightTab; label: string; icon: React.ReactNode }[] = [
    { key: "notes", label: "Notes", icon: <FileText className="w-3.5 h-3.5" /> },
    { key: "brain", label: "Brain", icon: <BrainIcon className="w-3.5 h-3.5" /> },
    { key: "leads", label: "Leads", icon: <Users className="w-3.5 h-3.5" /> },
  ];

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
              className="absolute inset-0 bg-black/10 z-10"
              onClick={() => setWindowOpen(false)}
            />

            {/* Draggable + Resizable Window */}
            <Rnd
              default={{
                x: Math.max(40, (window.innerWidth - 900) / 2),
                y: 40,
                width: 900,
                height: 600,
              }}
              minWidth={600}
              minHeight={400}
              bounds="parent"
              dragHandleClassName="window-drag-handle"
              className="z-20"
              style={{ position: "absolute" }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
                {/* ── macOS Title Bar (drag handle) ── */}
                <div className="window-drag-handle flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0 cursor-grab active:cursor-grabbing select-none">
                  {/* Traffic lights */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setWindowOpen(false)}
                      className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
                      title="Close"
                    />
                    <button
                      className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:brightness-90 transition-all"
                      title="Minimize"
                    />
                    <button
                      className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-90 transition-all"
                      title="Maximize"
                    />
                  </div>

                  {/* Title */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-gray-900">
                      Draft Analysis
                    </span>
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

                  {/* Close */}
                  <button
                    onClick={() => setWindowOpen(false)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ── Tab Bar ── */}
                <div className="flex items-center gap-0 border-b border-gray-200 bg-gray-50/50 px-3 pt-1 shrink-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setRightTab(tab.key)}
                      className={`
                        flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative
                        ${
                          rightTab === tab.key
                            ? "bg-white text-gray-900 border border-gray-200 border-b-white -mb-px z-10"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                        }
                      `}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Tab Content ── */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {/* NOTES TAB */}
                  {rightTab === "notes" && (
                    <div className="p-6">
                      <NotesView markdown={campaign.lessonsMarkdown} />
                    </div>
                  )}

                  {/* BRAIN TAB */}
                  {rightTab === "brain" && (
                    <div className="flex flex-col h-full">
                      {/* Email preview */}
                      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                          Email Draft
                        </h4>
                        <div className="text-sm text-gray-700 leading-relaxed max-h-24 overflow-y-auto">
                          {selectedVariant.message && matrix ? (
                            <WordStream
                              message={selectedVariant.message}
                              T={matrix.T}
                              timestep={timestep}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap">{selectedVariant.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Brain + Scores side by side */}
                      <div className="flex-1 flex min-h-0">
                        {/* Brain viz */}
                        <div className="flex-1 flex flex-col min-h-0">
                          <div className="flex-1 relative bg-[#0a0a0f] min-h-[240px]">
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
                              <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
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
                            <div className="p-2.5 border-t border-gray-200">
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

                        {/* Scores sidebar */}
                        <div className="w-64 border-l border-gray-200 p-4 overflow-y-auto shrink-0">
                          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                            Brain Scores
                          </h4>
                          <ScoreBars
                            scores={scores}
                            personaScores={personaScores}
                            leadName={selectedLead?.name}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LEADS TAB */}
                  {rightTab === "leads" && (
                    <div className="p-6">
                      <LeadsView
                        leads={leads as any}
                        selectedLeadId={selectedLeadId}
                        onSelectLead={(lid) => {
                          setSelectedLeadId(lid);
                          if (lid) setRightTab("brain");
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* ── Action Bar ── */}
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
                      onClick={() =>
                        selectedVariantId && archive({ id: selectedVariantId })
                      }
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

/* ═══════════════════════════════════════════ */
/*  Tab content components                     */
/* ═══════════════════════════════════════════ */

function NotesView({ markdown }: { markdown: string }) {
  const html = simpleMarkdownToHtml(markdown);
  return (
    <div
      className={[
        "prose prose-sm max-w-none",
        "[&_h1]:text-gray-900 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mb-4",
        "[&_h2]:text-gray-800 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2",
        "[&_p]:text-gray-600 [&_p]:text-sm [&_p]:leading-relaxed",
        "[&_strong]:text-gray-900",
        "[&_code]:text-blue-700 [&_code]:bg-blue-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
        "[&_ul]:text-gray-600 [&_ul]:text-sm",
        "[&_li]:text-gray-600",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const OCEAN_LABELS = [
  { key: "o" as const, label: "Openness", color: "bg-purple-500" },
  { key: "c" as const, label: "Conscientiousness", color: "bg-blue-500" },
  { key: "e" as const, label: "Extraversion", color: "bg-amber-500" },
  { key: "a" as const, label: "Agreeableness", color: "bg-emerald-500" },
  { key: "n" as const, label: "Neuroticism", color: "bg-rose-500" },
];

function LeadsView({
  leads,
  selectedLeadId,
  onSelectLead,
}: {
  leads: {
    _id: string;
    name: string;
    role: string;
    company: string;
    ocean: { o: number; c: number; e: number; a: number; n: number };
    confidence: number;
    personalityArgs: string;
  }[];
  selectedLeadId: string | null;
  onSelectLead: (id: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Select a lead to see persona-adjusted brain scores.
      </p>
      {leads.map((lead) => {
        const isSel = selectedLeadId === lead._id;
        return (
          <div
            key={lead._id}
            onClick={() => onSelectLead(isSel ? null : lead._id)}
            className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
              isSel
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  {lead.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {lead.role} @ {lead.company}
                </div>
              </div>
              <span className="text-[11px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                {Math.round(lead.confidence * 100)}%
              </span>
            </div>

            <div className="mt-3 space-y-1.5">
              {OCEAN_LABELS.map((t) => (
                <div key={t.key} className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 font-medium w-24 shrink-0">
                    {t.label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${t.color} transition-all duration-300`}
                      style={{ width: `${lead.ocean[t.key] * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono w-6 text-right">
                    {(lead.ocean[t.key] * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              {lead.personalityArgs}
            </p>

            <p className="text-xs font-medium mt-3">
              {isSel ? (
                <span className="text-blue-600">
                  Active — switch to Brain tab for adjusted scores
                </span>
              ) : (
                <span className="text-blue-600">
                  Click to see brain reaction →
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Markdown helpers ── */

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("### "))
        return `<h3>${inlineFormat(block.slice(4))}</h3>`;
      if (block.startsWith("## "))
        return `<h2>${inlineFormat(block.slice(3))}</h2>`;
      if (block.startsWith("# "))
        return `<h1>${inlineFormat(block.slice(2))}</h1>`;
      if (block.split("\n").every((l) => l.trimStart().startsWith("- "))) {
        const items = block
          .split("\n")
          .map((l) => `<li>${inlineFormat(l.trimStart().slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${inlineFormat(block)}</p>`;
    })
    .join("\n");
}
