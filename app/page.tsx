"use client";

import React, { useState } from "react";
// import { BlackHoleBackground } from "../components/background/BlackHoleBackground";
import { Navbar } from "../components/layout/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { StatsBar } from "../components/landing/StatsBar";
import { FeaturedBoxes } from "../components/landing/FeaturedBoxes";
import { EcosystemShowcase } from "../components/landing/EcosystemShowcase";
import { DocumentationPreview } from "../components/landing/DocumentationPreview";
import { Footer } from "../components/layout/Footer";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const exploreSection = document.getElementById("explore");
      if (exploreSection) {
        exploreSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-300">
      
      {/* Sticky Header */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="relative z-10 flex-1">
        {/* Hero Section avec Terminal */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Metriques et Statistiques */}
        <StatsBar />

        {/* Catalogue des Boxs */}
        <FeaturedBoxes searchQuery={searchQuery} />

        {/* The 3-Pillar Ecosystem (Rust CLI, Next.js Hub, Kotlin Mobile) */}
        <EcosystemShowcase />

        {/* Developer Documentation Section */}
        <DocumentationPreview />
      </main>

      {/* Clean Footer (GitHub Only) */}
      <Footer />

    </div>
  );
}
