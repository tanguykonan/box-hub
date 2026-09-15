import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check, Star, Download, ShieldCheck, ArrowUpRight } from "lucide-react";

export interface BoxItem {
  id: string;
  name: string;
  author: string;
  description: string;
  runtime: {
    type: "python" | "node";
    version: string;
  };
  language?: "Python" | "JavaScript" | "TypeScript";
  protected: boolean;
  stars: number;
  pulls: string;
  size: string;
  tag: string;
  category: "bots" | "api" | "ai" | "tools";
}

export function BoxCard({ box }: { box: BoxItem }) {
  const [copied, setCopied] = useState(false);

  const command = `box run ${box.author}/${box.name}:${box.tag}`;

  const copyCommand = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRuntimeBadge = () => {
    switch (box.runtime.type) {
      case "python":
        return {
          label: `Python ${box.runtime.version}`,
        };
      case "node":
        return {
          label: `Node.js ${box.runtime.version}`,
        };
    }
  };

  const runtimeBadge = getRuntimeBadge();

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-black/30 dark:hover:border-white/30 hover:shadow-lg dark:hover:shadow-orange-950/20">
      
      {/* Top Header: Author / Name et Badges */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <Link href={`/box/${box.author}/${box.name}`} className="group/title block flex-1">
            <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-0.5">
              <span>{box.author}</span>
              <span>/</span>
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight group-hover/title:text-orange-600 dark:group-hover/title:text-orange-400 transition-colors">
                {box.name}
              </h3>
              <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
            </div>
          </Link>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {box.language === "TypeScript" && (
                <span className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 text-[9px] font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                  TS
                </span>
              )}
              <span className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                {runtimeBadge.label}
              </span>
            </div>
            {box.protected && (
              <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-mono text-white font-medium">
                <ShieldCheck className="h-3 w-3 text-white" />
                <span>Bytecode</span>
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4">
          {box.description}
        </p>
      </div>

      {/* Bottom Section: Command et Metrics */}
      <div className="space-y-3 pt-3 border-t border-black/5 dark:border-white/5">
        
        {/* CLI Run Command with Copy button */}
        <div className="group/cmd flex items-center justify-between rounded-lg border border-black/10 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-1.5 font-mono text-xs text-zinc-800 dark:text-zinc-200">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="text-orange-500 font-bold select-none">$</span>
            <span className="truncate">{command}</span>
          </div>
          <button
            onClick={copyCommand}
            className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            title="Copier la commande"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 group-hover/cmd:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>{box.stars}</span>
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              <span>{box.pulls}</span>
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {box.size}
          </span>
        </div>
      </div>
    </div>
  );
}
