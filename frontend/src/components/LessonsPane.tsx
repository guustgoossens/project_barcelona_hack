import { BookOpen } from "lucide-react";

type Props = {
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
      if (block.startsWith("### ")) return `<h3>${inlineFormat(block.slice(4))}</h3>`;
      if (block.startsWith("## ")) return `<h2>${inlineFormat(block.slice(3))}</h2>`;
      if (block.startsWith("# ")) return `<h1>${inlineFormat(block.slice(2))}</h1>`;
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

/** Rendered markdown panel for campaign lessons. */
export default function LessonsPane({ markdown }: Props) {
  const html = simpleMarkdownToHtml(markdown);

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="border-b border-gray-200 px-5 py-3 flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
        <h2 className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
          Campaign Lessons
        </h2>
      </div>
      <div
        className={[
          "p-5 prose prose-sm max-w-none",
          "[&_h1]:text-gray-900 [&_h1]:text-sm [&_h1]:font-semibold [&_h1]:mb-4",
          "[&_h2]:text-gray-800 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2",
          "[&_p]:text-gray-600 [&_p]:text-[13px] [&_p]:leading-relaxed",
          "[&_strong]:text-gray-900 [&_strong]:font-semibold",
          "[&_code]:text-blue-700 [&_code]:bg-blue-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
          "[&_ul]:text-gray-600 [&_ul]:text-[13px]",
          "[&_li]:text-gray-600",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
