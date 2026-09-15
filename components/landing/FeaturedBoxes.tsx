"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { BoxCard, BoxItem } from "../ui/BoxCard";
import { Sparkles, Flame, Bot, Server, Wrench, BrainCircuit, Search, ChevronRight } from "lucide-react";

export function FeaturedBoxes({ searchQuery }: { searchQuery: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/v1/packages/search?sortBy=stars&limit=8");
        const data = await res.json();
        if (data.success && Array.isArray(data.packages)) {
          const mapped: BoxItem[] = data.packages.map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            author: pkg.author,
            description: pkg.description || "Paquet logiciel pour Box Hub.",
            runtime: {
              type: pkg.runtime?.type || "python",
              version: pkg.runtime?.version || "3.12",
            },
            language: pkg.language,
            protected: !!pkg.protected,
            stars: pkg.stars || 0,
            pulls: pkg.pulls || "0",
            size: pkg.size || "10 MB",
            tag: pkg.tag || "latest",
            category: (pkg.category || "tools") as any,
          }));
          setBoxes(mapped);
        }
      } catch {
        // En cas d'erreur de connexion, le registre reste vide
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    { id: "all", label: "Tous", icon: Flame },
    { id: "bots", label: "Bots et Automatisation", icon: Bot },
    { id: "api", label: "Services et APIs", icon: Server },
    { id: "tools", label: "Outils et Utilitaires", icon: Wrench },
    { id: "ai", label: "Intelligence Artificielle", icon: BrainCircuit },
  ];

  const filteredBoxes = useMemo(() => {
    return boxes.filter((box) => {
      const matchesCategory =
        selectedCategory === "all" || box.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        box.name.toLowerCase().includes(query) ||
        box.author.toLowerCase().includes(query) ||
        box.description.toLowerCase().includes(query) ||
        box.runtime.type.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [boxes, selectedCategory, searchQuery]);

  return (
    <section id="explore" className="relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="space-y-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-600 dark:text-orange-400 uppercase tracking-wider font-semibold mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Catalogue et Registre</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              Box Tendances et Recommandées
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Téléchargez et exécutez n'importe quel paquet en une seule commande.
            </p>
          </div>

          {/* Category Filter Pills - Dedicated row, full width, strict single line */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-100/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-x-auto scrollbar-none max-w-full w-fit flex-nowrap">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-black text-zinc-950 dark:text-white shadow-sm border border-black/10 dark:border-white/15 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Box Grid */}
        {filteredBoxes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBoxes.map((box) => (
              <BoxCard key={box.id} box={box} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/20 dark:border-white/20 p-12 text-center">
            <Search className="h-8 w-8 text-zinc-400 mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              {searchQuery ? `Aucune Box ne correspond à "${searchQuery}"` : "Aucune Box publiée pour le moment"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              {searchQuery
                ? "Essayez une autre recherche ou sélectionnez une autre catégorie."
                : "Soyez le premier à publier un paquet sur le registre Box Hub avec box push !"}
            </p>
          </div>
        )}

        {/* Link to Full Dedicated Catalog */}
        <div className="flex items-center justify-center pt-10">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-5 py-2.5 text-xs font-mono font-semibold text-zinc-900 dark:text-white transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <span>Explorer l'ensemble du catalogue</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
