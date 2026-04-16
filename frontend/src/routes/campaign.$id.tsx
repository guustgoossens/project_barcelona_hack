import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { toScore100 } from "../lib/scoring";
import {
  GitBranch,
  Scissors,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  FlaskConical,
  Send,
  Check,
  BookOpen,
  Pencil,
  CornerDownRight,
  Plus,
  RotateCcw,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/campaign/$id")({
  component: Campaign,
});

const MESH_URL = "/fsaverage5.glb";
const HEMISPHERE_SPLIT = 10242;

function Campaign() {
  const { id } = Route.useParams();
  const campaignId = id as Id<"campaigns">;
  const navigate = useNavigate();

  const campaign = useQuery(api.campaigns.get, { id: campaignId });
  const leads =
    useQuery(api.campaigns.listLeads, campaign ? { campaignId } : "skip") ?? [];
  const sessionId = campaign?.sessionId;
  const variants =
    useQuery(api.variants.list, sessionId ? { sessionId } : "skip") ?? [];

  const createChild = useMutation(api.variants.createChild);
  const archive = useMutation(api.variants.archive);
  const ensureThread = useMutation(api.chat.ensureThread);
  const sendMessage = useMutation(api.chat.sendMessage);
  const updateLessons = useMutation(api.campaigns.updateLessons);
  const resetDemo = useMutation(api.campaigns.resetDemo);
  const seedDemo = useMutation(api.campaigns.seedDemo);

  const [selectedVariantId, setSelectedVariantId] =
    useState<Id<"variants"> | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [windowOpen, setWindowOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showPersonalized, setShowPersonalized] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);
  const [branchText, setBranchText] = useState("");
  const [hypothesisText, setHypothesisText] = useState("");
  const [sendToast, setSendToast] = useState<"idle" | "sending" | "sent">("idle");
  const [lessonsOpen, setLessonsOpen] = useState(false);

  // Human-in-the-loop: inline edit
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  // Human-in-the-loop: teach mode
  const [teachText, setTeachText] = useState("");
  const [teachSaving, setTeachSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSelectNode = useCallback(
    (nodeId: Id<"variants">) => {
      setSelectedVariantId(nodeId);
      setWindowOpen(true);
      setShowPersonalized(false);
      setReasoningOpen(false);
      setEditing(false);
    },
    [],
  );

  const selectedVariant = useMemo(
    () => variants.find((v: any) => v._id === selectedVariantId) ?? null,
    [variants, selectedVariantId],
  );

  const full = useQuery(
    api.variants.get,
    selectedVariantId ? { id: selectedVariantId } : "skip",
  );

  const selectedLead = useMemo(
    () => leads.find((l: any) => l._id === selectedLeadId) ?? null,
    [leads, selectedLeadId],
  );

  // Find personalized child variant for the selected lead
  const personalizedVariant = useMemo(() => {
    if (!selectedVariantId || !selectedLeadId) return null;
    return (
      variants.find(
        (v: any) =>
          v.parentId === selectedVariantId &&
          v.leadId === selectedLeadId &&
          v.status !== "archived",
      ) ?? null
    );
  }, [variants, selectedVariantId, selectedLeadId]);

  // When a personalized variant appears while optimizing, stop the spinner
  useEffect(() => {
    if (optimizing && personalizedVariant) {
      setOptimizing(false);
      setShowPersonalized(true);
    }
  }, [optimizing, personalizedVariant]);

  const [timestep, setTimestep] = useState(0);
  const [matrix, setMatrix] = useState<ActivationMatrix | null>(null);

  // Determine which variant to display in the brain viz
  const displayVariant =
    showPersonalized && personalizedVariant
      ? personalizedVariant
      : selectedVariant;

  const displayFull = useQuery(
    api.variants.get,
    displayVariant ? { id: displayVariant._id } : "skip",
  );

  useEffect(() => {
    setMatrix(null);
    setTimestep(0);
    const f = showPersonalized && personalizedVariant ? displayFull : full;
    if (!f || !f.activationsUrl || !f.shape) return;
    const [T, V] = f.shape as [number, number];
    let cancelled = false;
    fetchActivations(f.activationsUrl, [T, V])
      .then((m) => {
        if (!cancelled) setMatrix(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [displayFull?.activationsUrl, displayFull?.shape?.[0], displayFull?.shape?.[1], full?.activationsUrl, full?.shape?.[0], full?.shape?.[1], showPersonalized, personalizedVariant]);

  const scores = useMemo(() => {
    const sv = displayVariant;
    if (!sv?.scoreSeries || !matrix) return sv?.scores ?? null;
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
    const a = aggPos(sv.scoreSeries.attention);
    const c = aggPos(sv.scoreSeries.curiosity);
    const tr = aggPos(sv.scoreSeries.trust);
    const mo = aggPos(sv.scoreSeries.motivation);
    const r = aggNeg(sv.scoreSeries.resistance);
    return {
      attention: a, curiosity: c, trust: tr,
      motivation: mo, resistance: r,
      overall: a + c + tr + mo - r,
    };
  }, [displayVariant, matrix, timestep]);

  const personaScores = useMemo(() => {
    if (!scores || !selectedLead) return null;
    return applyPersonaWeights(scores, selectedLead.ocean);
  }, [scores, selectedLead]);

  function openBranch() {
    if (!selectedVariant) return;
    setBranchText(selectedVariant.message);
    setHypothesisText("");
    setBranchOpen(true);
  }

  async function submitBranch() {
    if (!selectedVariantId || !branchText.trim()) return;
    await createChild({ parentId: selectedVariantId, message: branchText.trim() });
    setBranchOpen(false);
    setBranchText("");
  }

  async function submitHypothesis() {
    if (!selectedVariantId || !selectedVariant || !hypothesisText.trim()) return;
    setBranchOpen(false);

    const scoreSummary = selectedVariant.scores
      ? `Current scores: attention ${selectedVariant.scores.attention.toFixed(2)}, curiosity ${selectedVariant.scores.curiosity.toFixed(2)}, trust ${selectedVariant.scores.trust.toFixed(2)}, motivation ${selectedVariant.scores.motivation.toFixed(2)}, resistance ${selectedVariant.scores.resistance.toFixed(2)}, overall ${toScore100(selectedVariant.scores.overall)}/100`
      : "Scores: not yet available";

    const prompt = `Run an A/B hypothesis test on this email variant.

Current email:
"${selectedVariant.message}"

${scoreSummary}

Hypothesis to test: "${hypothesisText.trim()}"

Parent Variant ID: ${selectedVariantId}
Campaign ID: ${campaignId}

Create exactly 2 new child variants from this parent:

1. **Control (null hypothesis):** Lightly polish the current email — fix awkward phrasing, tighten copy — but do NOT change its core strategy or angle. This is the baseline.

2. **Hypothesis variant:** Rewrite the email to fully incorporate and test the hypothesis: "${hypothesisText.trim()}". Make meaningful changes that truly test whether this approach improves engagement.

Look up the campaign lessons first. Create both variants using the createVariant tool with full reasoning for each. IMPORTANT: pass the hypothesis field with the exact hypothesis text "${hypothesisText.trim()}" on BOTH variants so the UI can display it. Keep your text responses brief — the reasoning fields are the deliverable.`;

    const threadId = await ensureThread({ campaignId });
    await sendMessage({ threadId, prompt });
    setHypothesisText("");
  }

  async function handleOptimize() {
    if (!selectedVariant || !selectedVariantId) return;
    setOptimizing(true);

    const scoreSummary = selectedVariant.scores
      ? `Scores: attention ${selectedVariant.scores.attention.toFixed(2)}, curiosity ${selectedVariant.scores.curiosity.toFixed(2)}, trust ${selectedVariant.scores.trust.toFixed(2)}, motivation ${selectedVariant.scores.motivation.toFixed(2)}, resistance ${selectedVariant.scores.resistance.toFixed(2)}, overall ${toScore100(selectedVariant.scores.overall)}/100`
      : "Scores: not yet available";

    let prompt: string;
    if (selectedLead) {
      prompt = `Optimize this email variant for ${selectedLead.name} (${selectedLead.role} at ${selectedLead.company}).

Current email:
"${selectedVariant.message}"

${scoreSummary}

Lead ID: ${selectedLead._id}
Variant ID: ${selectedVariantId}
Campaign ID: ${campaignId}

Look up the lead's profile and campaign lessons, then create an optimized variant targeted at this person's psychology. Include your full reasoning in the createVariant tool call.`;
    } else {
      prompt = `Optimize this email variant to maximize brain engagement.

Current email:
"${selectedVariant.message}"

${scoreSummary}

Variant ID: ${selectedVariantId}
Campaign ID: ${campaignId}

Look up the campaign lessons and create an improved variant. Include your full reasoning in the createVariant tool call.`;
    }

    const threadId = await ensureThread({ campaignId });
    await sendMessage({ threadId, prompt });
  }

  // Find the best variant for "Send via Clay"
  const bestVariant = useMemo(() => {
    let best: any = null;
    for (const v of variants) {
      if (v.status === "done" && v.scores) {
        if (!best || v.scores.overall > best.scores.overall) best = v;
      }
    }
    return best;
  }, [variants]);

  const isBestSelected = selectedVariant && bestVariant && selectedVariant._id === bestVariant._id;

  function startEditing() {
    if (!displayVariant) return;
    setEditText(displayVariant.message);
    setEditing(true);
  }

  async function submitEdit() {
    if (!selectedVariantId || !editText.trim()) return;
    // Don't create if text is identical
    if (editText.trim() === displayVariant?.message) {
      setEditing(false);
      return;
    }
    await createChild({ parentId: selectedVariantId, message: editText.trim() });
    setEditing(false);
    setEditText("");
  }

  async function handleTeachSubmit() {
    if (!teachText.trim() || !campaign) return;
    setTeachSaving(true);
    const insight = `\n\n## Human insight\n${teachText.trim()}\n`;
    await updateLessons({
      id: campaignId,
      lessonsMarkdown: campaign.lessonsMarkdown.trimEnd() + insight,
    });
    setTeachText("");
    setTeachSaving(false);
  }

  async function handleDemoReset() {
    if (resetting) return;
    setResetting(true);
    setWindowOpen(false);
    setSelectedVariantId(null);
    setSelectedLeadId(null);
    setEditing(false);
    setLessonsOpen(false);
    setSendToast("idle");
    await resetDemo({});
    const result = await seedDemo({});
    setResetting(false);
    // Navigate to new campaign (old ID is now stale)
    if (result?.campaignId) {
      navigate({ to: "/campaign/$id", params: { id: result.campaignId } });
    }
  }

  async function handleSendViaClay() {
    if (sendToast !== "idle") return;
    setSendToast("sending");
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1500));
    setSendToast("sent");
    setTimeout(() => setSendToast("idle"), 3000);
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

        {/* Live stats */}
        <div className="flex items-center gap-2 ml-2">
          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {variants.filter((v: any) => v.status === "done").length} scored
          </span>
          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {leads.length} leads
          </span>
          <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {(campaign.lessonsMarkdown.match(/^## /gm) || []).length} lessons
          </span>
          {bestVariant && (
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
              toScore100(bestVariant.scores.overall) >= 50
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}>
              best: {toScore100(bestVariant.scores.overall)}/100
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setLessonsOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${lessonsOpen ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Lessons
          </button>
          <button
            onClick={handleDemoReset}
            disabled={resetting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Reset demo — clears all data and reseeds"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 relative min-h-0">
        <div className="h-full relative">
          <div className="absolute top-4 left-6 z-10">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Draft Evolution
            </span>
            <p className="text-[11px] text-gray-400 mt-1">
              Each node is an email variant scored by TRIBE v2 (Meta's brain model)
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">
              Click a node to inspect · Scroll to zoom · Drag to pan
            </p>
          </div>

          <HorizontalTree
            variants={variants}
            selectedId={selectedVariantId}
            onSelect={handleSelectNode}
          />
        </div>

        {/* ── FLOATING WINDOW ── */}
        {windowOpen && selectedVariant && (
          <>
            <div
              className="absolute inset-0 bg-black/5 z-10"
              onClick={() => setWindowOpen(false)}
            />

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
                    {displayVariant?.scores && (
                      <span
                        className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                          toScore100(displayVariant.scores.overall) >= 50
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {toScore100(displayVariant.scores.overall)}
                        <span className="text-[9px] text-gray-400 font-medium">/100</span>
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
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Email Draft
                        </h4>
                        {/* Toggle: Original / Personalized */}
                        {personalizedVariant && (
                          <div className="flex rounded-md border border-gray-200 overflow-hidden text-[10px]">
                            <button
                              onClick={() => { setShowPersonalized(false); setReasoningOpen(false); }}
                              className={`px-2 py-0.5 font-medium transition-colors ${
                                !showPersonalized
                                  ? "bg-gray-900 text-white"
                                  : "bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              Original
                            </button>
                            <button
                              onClick={() => setShowPersonalized(true)}
                              className={`px-2 py-0.5 font-medium transition-colors ${
                                showPersonalized
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              For {selectedLead?.name.split(" ")[0]}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Optimizing spinner */}
                      {optimizing && (
                        <div className="flex items-center gap-2 mb-3 px-2.5 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                          <span className="text-[11px] text-indigo-600 font-medium">
                            Optimizing for {selectedLead?.name.split(" ")[0]}...
                          </span>
                        </div>
                      )}

                      {/* Reasoning (collapsible) */}
                      {showPersonalized && personalizedVariant?.reasoning && (
                        <div className="mb-3">
                          <button
                            onClick={() => setReasoningOpen(!reasoningOpen)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 mb-1"
                          >
                            {reasoningOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                            AI Reasoning
                          </button>
                          {reasoningOpen && (
                            <div className="text-[11px] text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-3 max-h-64 overflow-y-auto prose prose-xs">
                              <ReasoningMarkdown text={personalizedVariant.reasoning} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Email text — editable inline */}
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {editing ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              autoFocus
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={8}
                              className="w-full text-sm text-gray-700 leading-relaxed px-3 py-2.5 rounded-lg border border-blue-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none bg-blue-50/30"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={submitEdit}
                                disabled={!editText.trim() || editText.trim() === displayVariant?.message}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                <CornerDownRight className="w-3 h-3" />
                                Test this edit
                              </button>
                              <button
                                onClick={() => setEditing(false)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                Cancel
                              </button>
                              {editText.trim() !== displayVariant?.message && (
                                <span className="text-[10px] text-blue-500 ml-auto">
                                  Will create a new branch
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="group/email relative">
                            {displayVariant?.message && matrix ? (
                              <WordStream
                                message={displayVariant.message}
                                T={matrix.T}
                                timestep={timestep}
                              />
                            ) : (
                              <p className="whitespace-pre-wrap text-sm text-gray-600">
                                {displayVariant?.message}
                              </p>
                            )}
                            <button
                              onClick={startEditing}
                              className="absolute top-0 right-0 p-1.5 rounded-lg bg-white/80 border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 opacity-0 group-hover/email:opacity-100 transition-all shadow-sm"
                              title="Edit & test variant"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Lead
                        </h4>
                        <span className="flex items-center gap-1 text-[9px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full font-medium">
                          <span className="h-2.5 w-2.5 rounded-sm bg-orange-500 flex items-center justify-center shrink-0">
                            <span className="h-1 w-1 rounded-full bg-white" />
                          </span>
                          Clay
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {leads.map((lead: any) => {
                          const isSel = selectedLeadId === lead._id;
                          // Check if a personalized variant already exists for this lead
                          const hasPersonalized = selectedVariantId && variants.some(
                            (v: any) =>
                              v.parentId === selectedVariantId &&
                              v.leadId === lead._id &&
                              v.status !== "archived",
                          );
                          return (
                            <button
                              key={lead._id}
                              onClick={() => {
                                if (isSel) {
                                  setSelectedLeadId(null);
                                  setShowPersonalized(false);
                                } else {
                                  setSelectedLeadId(lead._id);
                                  // Auto-show personalized variant if one exists
                                  setShowPersonalized(!!hasPersonalized);
                                }
                                setReasoningOpen(false);
                                setEditing(false);
                              }}
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
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-1 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                              OCEAN Profile
                              <span className="group/ocean relative">
                                <Info className="w-2.5 h-2.5 text-gray-300 cursor-help" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/ocean:block w-48 bg-gray-900 text-white text-[10px] leading-relaxed p-2.5 rounded-lg shadow-xl z-50 pointer-events-none">
                                  Big Five personality traits. High O = curiosity boost. High N = resistance penalty. Scores adjust per trait.
                                </span>
                              </span>
                            </span>
                            <span className="text-[9px] text-orange-500 font-medium">Enriched via Clay</span>
                          </div>
                          <div className="flex gap-1">
                            {(["o", "c", "e", "a", "n"] as const).map((k, i) => {
                              const colors = ["bg-purple-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
                              const labels = ["O", "C", "E", "A", "N"];
                              return (
                                <div key={k} className="flex-1 text-center">
                                  <div className="text-[8px] text-gray-400 mb-0.5">{labels[i]}</div>
                                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bar-animate ${colors[i]}`}
                                      style={{ width: `${selectedLead.ocean[k] * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                          {displayVariant?.status === "failed" ? (
                            <p className="text-sm text-rose-400">
                              Error: {displayVariant?.error}
                            </p>
                          ) : (
                            <>
                              {/* Pulsing brain silhouette */}
                              <div className="relative w-16 h-16">
                                <div className="absolute inset-0 rounded-full bg-gray-200/60 animate-ping" style={{ animationDuration: "2s" }} />
                                <div className="absolute inset-1 rounded-full bg-gray-200/80 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
                                <div className="relative w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                    <path d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2 .5 3.5 1 4.5.5 1 .5 2 0 3-.3.6-.5 1.5 0 2.5.5 1.5 2 2.5 3.5 3 1 .3 1.5 1 1.5 1h2s.5-.7 1.5-1c1.5-.5 3-1.5 3.5-3 .5-1 .3-1.9 0-2.5-.5-1-.5-2 0-3 .5-1 1.3-2.5 1-4.5C18.5 4.5 15.5 2 12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 13c0 0 1.5 1 3 1s3-1 3-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-1.5">
                                <span className="text-sm font-medium text-gray-500">
                                  {displayVariant?.status === "scoring"
                                    ? "Scoring on GPU"
                                    : displayVariant?.status === "pending"
                                      ? "Queued for scoring"
                                      : "Waiting for data"}
                                </span>
                                {/* Dot animation */}
                                <div className="flex gap-1.5">
                                  {[0, 1, 2].map((i) => (
                                    <div
                                      key={i}
                                      className="w-1.5 h-1.5 rounded-full bg-gray-400"
                                      style={{
                                        animation: "dot-pulse 1.4s ease-in-out infinite",
                                        animationDelay: `${i * 0.2}s`,
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {matrix && displayFull?.fps && (
                      <div className="p-2 border-t border-gray-200 shrink-0">
                        <Timeline
                          T={matrix.T}
                          fps={displayFull.fps}
                          hemodynamicOffsetS={displayFull.hemodynamicOffsetS ?? 5}
                          timestep={timestep}
                          setTimestep={setTimestep}
                        />
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Scores */}
                  <div className="w-[22%] border-l border-gray-200 p-4 overflow-y-auto shrink-0">
                    <div className="flex items-center gap-1 mb-3">
                      <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Brain Scores
                      </h4>
                      <div className="group/tip relative">
                        <Info className="w-3 h-3 text-gray-300 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/tip:block w-52 bg-gray-900 text-white text-[10px] leading-relaxed p-2.5 rounded-lg shadow-xl z-50 pointer-events-none">
                          Predicted by Meta's TRIBE v2 from fMRI data. Scored using Kahneman's peak-end rule: 40% mean + 20% first + 20% worst + 20% last impression.
                        </div>
                      </div>
                    </div>
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
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit &amp; Test
                  </button>
                  <button
                    onClick={openBranch}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    Branch
                  </button>
                  <button
                    onClick={handleOptimize}
                    disabled={optimizing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {optimizing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {selectedLead
                      ? `Optimize for ${selectedLead.name.split(" ")[0]}`
                      : "Optimize"}
                  </button>
                  {selectedLead && selectedVariant.status === "done" && (
                    <button
                      onClick={handleSendViaClay}
                      disabled={sendToast !== "idle"}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white rounded-lg text-sm font-semibold transition-colors ml-auto"
                    >
                      {sendToast === "sending" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : sendToast === "sent" ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {sendToast === "sending"
                        ? "Sending..."
                        : sendToast === "sent"
                          ? `Sent to ${selectedLead.name.split(" ")[0]}!`
                          : `Send to ${selectedLead.name.split(" ")[0]} via Clay`}
                    </button>
                  )}
                  {!(selectedLead && selectedVariant.status === "done") && selectedVariant.status !== "archived" && (
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

        {/* ── LESSONS WINDOW ── */}
        {lessonsOpen && (
          <Rnd
            default={{
              x: window.innerWidth - 440,
              y: 20,
              width: 410,
              height: Math.min(window.innerHeight - 80, 700),
            }}
            minWidth={280}
            minHeight={400}
            bounds="parent"
            dragHandleClassName="lessons-drag-handle"
            className="z-20"
            style={{ position: "absolute" }}
          >
            <div className="w-full h-full bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
              {/* Title Bar */}
              <div className="lessons-drag-handle flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 shrink-0 cursor-grab active:cursor-grabbing select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLessonsOpen(false)}
                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
                    title="Close"
                  />
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Campaign Lessons</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono px-1.5 py-0.5 rounded-full">
                    auto-updating
                  </span>
                </div>
                <div className="w-[52px]" />
              </div>

              {/* Info banner */}
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 shrink-0">
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Lessons update automatically after each TRIBE v2 scoring. Patterns compound across iterations.
                </p>
              </div>

              {/* Lessons content */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <div className="prose prose-sm max-w-none text-gray-700 text-xs">
                  <LessonsMarkdown text={campaign.lessonsMarkdown} />
                </div>
              </div>

              {/* Teach — human writes a lesson */}
              <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Plus className="w-3 h-3 text-gray-400" />
                  <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                    Teach the AI
                  </span>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={teachText}
                    onChange={(e) => setTeachText(e.target.value)}
                    rows={2}
                    className="flex-1 text-[11px] text-gray-700 leading-relaxed px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
                    placeholder="e.g. For architects, mention specific projects over awards..."
                  />
                  <button
                    onClick={handleTeachSubmit}
                    disabled={!teachText.trim() || teachSaving}
                    className="self-end px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-semibold rounded-lg transition-colors shrink-0"
                  >
                    {teachSaving ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 shrink-0">
                <p className="text-[9px] text-gray-400">
                  {(campaign.lessonsMarkdown.match(/^## /gm) || []).length} insights ·
                  AI + human lessons compound
                </p>
              </div>
            </div>
          </Rnd>
        )}

        {/* ── SEND TOAST ── */}
        {sendToast === "sent" && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 toast-enter">
            <div className="flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl">
              <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">
                  Email sent via Clay
                </div>
                <div className="text-xs text-gray-400">
                  Delivered to {selectedLead?.name} at {selectedLead?.company}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BRANCH MODAL ── */}
        {branchOpen && (
          <>
            <div
              className="absolute inset-0 bg-black/20 z-30"
              onClick={() => setBranchOpen(false)}
            />
            <div className="absolute inset-0 z-30 flex items-center justify-center p-8">
              <div
                className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg flex flex-col overflow-hidden rise-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-gray-900" />
                    <span className="text-sm font-semibold text-gray-900">
                      New variant
                    </span>
                  </div>
                  <button
                    onClick={() => setBranchOpen(false)}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* ── Section 1: Edit draft ── */}
                <div className="p-5 pb-3">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    Edit draft
                  </label>
                  <textarea
                    autoFocus
                    value={branchText}
                    onChange={(e) => setBranchText(e.target.value)}
                    rows={6}
                    className="mt-2 w-full text-sm text-gray-700 leading-relaxed px-3.5 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 resize-none"
                    placeholder="Write your variant..."
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={submitBranch}
                      disabled={!branchText.trim()}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Create variant
                    </button>
                  </div>
                </div>

                {/* ── OR divider ── */}
                <div className="flex items-center gap-3 px-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs font-medium text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* ── Section 2: Hypothesis ── */}
                <div className="p-5 pt-3">
                  <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-3 h-3" />
                    Test a hypothesis
                  </label>
                  <textarea
                    value={hypothesisText}
                    onChange={(e) => setHypothesisText(e.target.value)}
                    rows={2}
                    className="mt-2 w-full text-sm text-gray-700 leading-relaxed px-3.5 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
                    placeholder={'e.g. "Focus on their recent achievement..."'}
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                    AI writes a control draft and a hypothesis draft so you can compare brain scores.
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={submitHypothesis}
                      disabled={!hypothesisText.trim()}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Test hypothesis
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-start px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                  <button
                    onClick={() => setBranchOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Simple markdown-to-elements renderer
function renderMarkdownLine(line: string, i: number) {
  if (line.startsWith("### ")) return <h3 key={i} className="font-bold text-gray-800 mt-2 mb-1">{line.slice(4)}</h3>;
  if (line.startsWith("## ")) return <h2 key={i} className="font-bold text-gray-900 mt-3 mb-1">{line.slice(3)}</h2>;
  if (line.startsWith("# ")) return <h1 key={i} className="font-bold text-gray-900 mt-3 mb-1">{line.slice(2)}</h1>;
  if (line.startsWith("- ")) return <li key={i} className="ml-3 list-disc">{renderInline(line.slice(2))}</li>;
  if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-gray-800">{line.slice(2, -2)}</p>;
  if (line.trim() === "") return <br key={i} />;
  return <p key={i}>{renderInline(line)}</p>;
}

function renderInline(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function ReasoningMarkdown({ text }: { text: string }) {
  return <>{text.split("\n").map(renderMarkdownLine)}</>;
}

function LessonsMarkdown({ text }: { text: string }) {
  return <>{text.split("\n").map(renderMarkdownLine)}</>;
}
