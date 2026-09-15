"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownViewerProps {
  content: string;
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!content) {
    return (
      <div className="py-8 text-center text-xs font-mono text-zinc-500">
        Aucun contenu README disponible.
      </div>
    );
  }

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Simple, robust line-by-line block parser
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        const codeText = codeBuffer.join("\n");
        const currentIdx = blockIndex++;
        const isCopied = copiedIndex === currentIdx;

        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-xl border border-black/10 dark:border-zinc-800 bg-zinc-950 text-zinc-200 overflow-hidden text-xs font-mono shadow-sm"
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400">
              <span className="text-orange-400 font-semibold">{codeLang || "bash"}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(codeText, currentIdx)}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copie</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto leading-relaxed selection:bg-orange-500/30">
              {codeText}
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={`space-${i}`} className="h-2" />);
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm font-bold text-zinc-950 dark:text-white mt-4 mb-1.5 tracking-tight"
        >
          {trimmed.replace(/^###\s+/, "")}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base font-bold text-zinc-950 dark:text-white mt-5 mb-2 pb-1 border-b border-black/8 dark:border-white/10 tracking-tight"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-lg font-bold text-zinc-950 dark:text-white mt-6 mb-2 tracking-tight"
        >
          {trimmed.replace(/^#\s+/, "")}
        </h1>
      );
      continue;
    }

    // List items
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const itemText = trimmed.replace(/^[-*]\s+/, "");
      elements.push(
        <li
          key={`li-${i}`}
          className="ml-4 list-disc text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed"
        >
          {renderInlineFormatting(itemText)}
        </li>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, "");
      elements.push(
        <li
          key={`oli-${i}`}
          className="ml-4 list-decimal text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono"
        >
          {renderInlineFormatting(itemText)}
        </li>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed"
      >
        {renderInlineFormatting(line)}
      </p>
    );
  }

  return <div className="space-y-1 font-sans">{elements}</div>;
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Split by inline code `code`
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      return (
        <code
          key={index}
          className="rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.5 text-[11px] font-mono text-orange-600 dark:text-orange-400 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
