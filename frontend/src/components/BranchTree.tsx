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
  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => onSelect(node._id)}
        className={`rounded border p-2 cursor-pointer transition-all ${
          isSel
            ? "border-emerald-500 bg-emerald-950/40"
            : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
        } ${isArchived ? "opacity-40" : ""}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wide text-neutral-500">
            {node.status}
          </span>
          {node.scores && (
            <span className="text-xs font-mono text-emerald-400">
              {node.scores.overall.toFixed(2)}
            </span>
          )}
        </div>
        <div className="text-sm text-neutral-200 line-clamp-2 mt-1">
          {node.message}
        </div>
        <div className="flex gap-2 mt-2 text-[11px]">
          <button
            className="text-neutral-400 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onMutate(node._id);
            }}
          >
            + variant
          </button>
          {!isArchived && (
            <button
              className="text-rose-400 hover:text-rose-300"
              onClick={(e) => {
                e.stopPropagation();
                onArchive(node._id);
              }}
            >
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
