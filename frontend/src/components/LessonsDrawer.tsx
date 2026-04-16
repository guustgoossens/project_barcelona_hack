import { BookOpen, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  markdown: string;
};

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

export default function LessonsDrawer({ open, onClose, markdown }: Props) {
  const html = simpleMarkdownToHtml(markdown);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">
              Campaign Lessons
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div
          className={[
            "flex-1 overflow-y-auto px-6 py-5 prose prose-sm max-w-none",
            "[&_h1]:text-gray-900 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mb-4",
            "[&_h2]:text-gray-800 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2",
            "[&_p]:text-gray-600 [&_p]:text-sm [&_p]:leading-relaxed",
            "[&_strong]:text-gray-900",
            "[&_code]:text-blue-700 [&_code]:bg-blue-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs",
            "[&_ul]:text-gray-600 [&_ul]:text-sm",
            "[&_li]:text-gray-600",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </>
  );
}
