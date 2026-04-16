import { useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeProps,
  type EdgeProps,
  Handle,
  Position,
  Background,
  BackgroundVariant,
  BaseEdge,
  getSmoothStepPath,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { toScore100 } from "../lib/scoring";

type Variant = Doc<"variants">;

type Props = {
  variants: Variant[];
  selectedId: Id<"variants"> | null;
  onSelect: (id: Id<"variants">) => void;
};

/* ---------- utilities ---------- */

/** Map 0–100 brain score to a color: red (#EF4444) → yellow (#F59E0B) → green (#10B981) */
function scoreToColor(raw: number | undefined): string {
  if (raw === undefined) return "#D1D5DB";
  const s = toScore100(raw);
  const t = Math.max(0, Math.min(1, s / 100));
  if (t < 0.5) {
    const f = t / 0.5;
    const r = Math.round(239 + (245 - 239) * f);
    const g = Math.round(68 + (158 - 68) * f);
    const b = Math.round(68 + (11 - 68) * f);
    return `rgb(${r},${g},${b})`;
  }
  const f = (t - 0.5) / 0.5;
  const r = Math.round(245 + (16 - 245) * f);
  const g = Math.round(158 + (185 - 158) * f);
  const b = Math.round(11 + (129 - 11) * f);
  return `rgb(${r},${g},${b})`;
}

/* ---------- layout helpers ---------- */

let variantScoreMap: Map<string, number | undefined> = new Map();

function variantsToFlow(variants: Variant[], selectedId: string | null) {
  const byId = new Map<string, Variant & { children: string[] }>();
  for (const v of variants) byId.set(v._id, { ...v, children: [] });

  const roots: string[] = [];
  for (const v of variants) {
    if (v.parentId && byId.has(v.parentId)) {
      byId.get(v.parentId)!.children.push(v._id);
    } else {
      roots.push(v._id);
    }
  }

  let bestId: string | null = null;
  let bestScore = -Infinity;
  for (const v of variants) {
    if (v.scores && v.status === "done" && v.scores.overall > bestScore) {
      bestScore = v.scores.overall;
      bestId = v._id;
    }
  }

  variantScoreMap = new Map();
  for (const v of variants) {
    variantScoreMap.set(v._id, v.scores?.overall);
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const X_GAP = 300;
  const Y_GAP = 140;

  function layoutNode(id: string, depth: number, yOffset: number): number {
    const v = byId.get(id)!;
    const children = v.children;

    if (children.length === 0) {
      nodes.push({
        id: v._id,
        type: "variantNode",
        position: { x: depth * X_GAP, y: yOffset * Y_GAP },
        data: { variant: v, selected: v._id === selectedId, isBest: v._id === bestId },
      });
      return 1;
    }

    let childRowsUsed = 0;
    const childYPositions: number[] = [];
    for (const childId of children) {
      const startRow = yOffset + childRowsUsed;
      childYPositions.push(startRow);
      const rows = layoutNode(childId, depth + 1, startRow);
      childRowsUsed += rows;

      edges.push({
        id: `${v._id}-${childId}`,
        source: v._id,
        target: childId,
        type: "gradientEdge",
      });
    }

    const centerY =
      (childYPositions[0] + childYPositions[childYPositions.length - 1]) / 2;

    nodes.push({
      id: v._id,
      type: "variantNode",
      position: { x: depth * X_GAP, y: centerY * Y_GAP },
      data: { variant: v, selected: v._id === selectedId, isBest: v._id === bestId },
    });

    return childRowsUsed;
  }

  let totalOffset = 0;
  for (const rootId of roots) {
    totalOffset += layoutNode(rootId, 0, totalOffset);
  }

  return { nodes, edges };
}

/* ---------- custom edge ---------- */

function GradientEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, source, target }: EdgeProps) {
  const [edgePath] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  const sourceColor = scoreToColor(variantScoreMap.get(source));
  const targetColor = scoreToColor(variantScoreMap.get(target));
  const gradientId = `grad-${id}`;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceColor} />
          <stop offset="100%" stopColor={targetColor} />
        </linearGradient>
      </defs>
      <BaseEdge path={edgePath} style={{ stroke: `url(#${gradientId})`, strokeWidth: 2 }} />
    </>
  );
}

/* ---------- custom node ---------- */

function VariantNode({ data }: NodeProps) {
  const { variant, selected, isBest } = data as {
    variant: Variant;
    selected: boolean;
    isBest: boolean;
  };
  const isArchived = variant.status === "archived";
  const rawScore = variant.scores?.overall;
  const score = rawScore !== undefined ? toScore100(rawScore) : undefined;
  const isPositive = score !== undefined && score >= 50;

  const norm = (v: number) => Math.max(0, Math.min(1, (v + 1) / 2));

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-300 !border-gray-300 !w-2 !h-2"
      />
      <div
        className={`
          w-60 rounded-xl border bg-white overflow-hidden transition-all cursor-pointer
          ${selected
            ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
            : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
          }
          ${isArchived ? "opacity-40" : ""}
        `}
      >
        {/* Score band */}
        <div
          className="px-3 py-2 flex items-center justify-between"
          style={{
            background: score === undefined
              ? "#F9FAFB"
              : isPositive
                ? "linear-gradient(135deg, #ECFDF5, #D1FAE5)"
                : "linear-gradient(135deg, #FEF2F2, #FECACA)",
          }}
        >
          {score !== undefined ? (
            <span className="flex items-baseline gap-0.5">
              <span
                className={`text-xl font-extrabold font-mono ${isPositive ? "text-emerald-600" : "text-red-600"}`}
              >
                {score}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">/100</span>
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-400">
              {variant.status === "scoring" ? "Scoring..." : variant.status === "pending" ? "Queued" : "—"}
            </span>
          )}
          {isBest && (
            <span className="text-[10px] bg-white text-emerald-600 px-2 py-0.5 rounded-full font-semibold shadow-sm">
              BEST
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-3 py-2">
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-snug">
            {variant.message.slice(0, 90)}{variant.message.length > 90 ? "\u2026" : ""}
          </p>
        </div>

        {/* Mini score bars */}
        {variant.scores && (
          <div className="px-3 pb-2.5 flex gap-1">
            <div className="flex-1 h-[3px] rounded-full bg-emerald-500" style={{ opacity: norm(variant.scores.attention) }} title="Attention" />
            <div className="flex-1 h-[3px] rounded-full bg-emerald-500" style={{ opacity: norm(variant.scores.curiosity) }} title="Curiosity" />
            <div className="flex-1 h-[3px] rounded-full bg-emerald-500" style={{ opacity: norm(variant.scores.trust) }} title="Trust" />
            <div className="flex-1 h-[3px] rounded-full bg-emerald-500" style={{ opacity: norm(variant.scores.motivation) }} title="Motivation" />
            <div className="flex-1 h-[3px] rounded-full bg-red-400" style={{ opacity: norm(variant.scores.resistance) }} title="Resistance" />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-300 !border-gray-300 !w-2 !h-2"
      />
    </>
  );
}

/* ---------- main component ---------- */

const nodeTypes: NodeTypes = { variantNode: VariantNode };
const edgeTypes: EdgeTypes = { gradientEdge: GradientEdge };

export default function HorizontalTree({
  variants,
  selectedId,
  onSelect,
}: Props) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => variantsToFlow(variants, selectedId),
    [variants, selectedId],
  );

  if (variants.length === 0) return null;

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => onSelect(node.id as Id<"variants">)}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  );
}
