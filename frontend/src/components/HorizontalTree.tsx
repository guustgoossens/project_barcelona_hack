import { useMemo } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Handle,
  Position,
  Background,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type Variant = Doc<"variants">;

type Props = {
  variants: Variant[];
  selectedId: Id<"variants"> | null;
  onSelect: (id: Id<"variants">) => void;
};

/* ---------- layout helpers ---------- */

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

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const X_GAP = 280;
  const Y_GAP = 120;

  function layoutNode(id: string, depth: number, yOffset: number): number {
    const v = byId.get(id)!;
    const children = v.children;

    if (children.length === 0) {
      nodes.push({
        id: v._id,
        type: "variantNode",
        position: { x: depth * X_GAP, y: yOffset * Y_GAP },
        data: { variant: v, selected: v._id === selectedId },
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
        type: "smoothstep",
        style: { stroke: "#d1d5db", strokeWidth: 2 },
      });
    }

    const centerY =
      (childYPositions[0] + childYPositions[childYPositions.length - 1]) / 2;

    nodes.push({
      id: v._id,
      type: "variantNode",
      position: { x: depth * X_GAP, y: centerY * Y_GAP },
      data: { variant: v, selected: v._id === selectedId },
    });

    return childRowsUsed;
  }

  let totalOffset = 0;
  for (const rootId of roots) {
    totalOffset += layoutNode(rootId, 0, totalOffset);
  }

  return { nodes, edges };
}

/* ---------- custom node ---------- */

const STATUS_STYLES: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  scoring: "bg-blue-50 text-blue-700",
  failed: "bg-rose-50 text-rose-700",
  archived: "bg-gray-100 text-gray-400",
};

function VariantNode({ data }: NodeProps) {
  const { variant, selected } = data as {
    variant: Variant;
    selected: boolean;
  };
  const isArchived = variant.status === "archived";

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-300 !border-gray-300 !w-2 !h-2"
      />
      <div
        className={`
          w-52 rounded-xl border p-3 bg-white shadow-sm transition-all cursor-pointer
          ${
            selected
              ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
              : "border-gray-200 hover:shadow-md hover:border-gray-300"
          }
          ${isArchived ? "opacity-40" : ""}
        `}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${
              STATUS_STYLES[variant.status] ?? "bg-gray-100 text-gray-400"
            }`}
          >
            {variant.status}
          </span>
          {variant.scores && (
            <span
              className={`text-xs font-mono font-bold ${
                variant.scores.overall >= 0
                  ? "text-emerald-600"
                  : "text-rose-500"
              }`}
            >
              {variant.scores.overall >= 0 ? "+" : ""}
              {variant.scores.overall.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug">
          {variant.message.slice(0, 70)}
          {variant.message.length > 70 ? "\u2026" : ""}
        </p>
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
