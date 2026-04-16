import { GitBranch, Scissors } from "lucide-react";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type Variant = Doc<"variants">;

type Node = Variant & { children: Node[] };

function buildTree(variants: Variant[]): Node[] {
  const byId = new Map<string, Node>();
  for (const v of variants) byId.set(v._id, { ...v, children: [] });
  const roots: Node[] = [];
  for (const v of byId.values()) {
    if (v.parentId && byId.has(v.parentId)) {
      byId.get(v.parentId)!.children.push(v);
    } else {
      roots.push(v);
    }
  }
  return roots;
}

const STATUS_PILL: Record<string, string> = {
  done: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  scoring: "bg-blue-50 text-blue-700",
  failed: "bg-rose-50 text-rose-700",
  archived: "bg-gray-100 text-gray-500",
};

export default function BranchTree({
  variants,
  selectedId,
  onSelect,
  onArchive,
  onMutate,
}: {
  variants: Variant[];
  selectedId: Id<"variants"> | null;
  onSelect: (id: Id<"variants">) => void;
  onArchive: (id: Id<"variants">) => void;
  onMutate: (parentId: Id<"variants">) => void;
}) {
  const roots = buildTree(variants);
  return (
    <div className="space-y-2">
      {roots.map((r) => (
        <NodeView
          key={r._id}
          node={r}
          selectedId={selectedId}
          onSelect={onSelect}
          onArchive={onArchive}
          onMutate={onMutate}
          depth={0}
        />
      ))}
    </div>
  );
}

function NodeView({
  node,
  selectedId,
  onSelect,
  onArchive,
  onMutate,
  depth,
}: {
  node: Node;
  selectedId: Id<"variants"> | null;
  onSelect: (id: Id<"variants">) => void;
  onArchive: (id: Id<"variants">) => void;
  onMutate: (parentId: Id<"variants">) => void;
  depth: number;
}) {
  const isSel = selectedId === node._id;
  const isArchived = node.status === "archived";
  const pillClass = STATUS_PILL[node.status] ?? "bg-gray-100 text-gray-500";

  return (
    <div
      style={{ marginLeft: depth * 16 }}
      className={depth > 0 ? "border-l-2 border-gray-200 ml-3 pl-3" : ""}
    >
      <div
        onClick={() => onSelect(node._id)}
        className={`bg-white border border-gray-200 shadow-sm rounded-xl p-3 cursor-pointer transition-all duration-200 ${
          isSel
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "hover:border-gray-300 hover:shadow-md"
        } ${isArchived ? "opacity-40" : ""}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pillClass}`}
          >
            {node.status}
          </span>
          {node.scores && (
            <span className="text-xs font-mono text-emerald-600">
              {node.scores.overall.toFixed(2)}
            </span>
          )}
        </div>
        <div className="text-[13px] text-gray-500 line-clamp-2 mt-1">
          {node.message}
        </div>
        <div className="flex gap-3 mt-2">
          <button
            className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-blue-600 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onMutate(node._id);
            }}
          >
            <GitBranch className="w-3 h-3" />
            + variant
          </button>
          {!isArchived && (
            <button
              className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-rose-500 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(node._id);
              }}
            >
              <Scissors className="w-3 h-3" />
              prune
            </button>
          )}
        </div>
      </div>
      {node.children.map((c) => (
        <NodeView
          key={c._id}
          node={c}
          selectedId={selectedId}
          onSelect={onSelect}
          onArchive={onArchive}
          onMutate={onMutate}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
