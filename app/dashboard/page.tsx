"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar, DASHBOARD_NAV_ITEMS } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { OverviewSection } from "../../components/dashboard/sections/OverviewSection";
import { MyBoxesSection } from "../../components/dashboard/sections/MyBoxesSection";
import { TokensSection } from "../../components/dashboard/sections/TokensSection";
import { AnalyticsSection } from "../../components/dashboard/sections/AnalyticsSection";
import { SettingsSection } from "../../components/dashboard/sections/SettingsSection";
import { PublishBoxModal } from "../../components/dashboard/modals/PublishBoxModal";
import { useToast } from "../../components/ui/Toast";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Détection du retour de paiement Paystack
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get("payment");
      const reference = params.get("reference");

      if (payment === "success") {
        showToast(
          reference
            ? `Paiement validé avec succès (Réf: ${reference.slice(0, 10)}...) ! Votre quota a été mis à jour.`
            : "Paiement validé avec succès ! Votre quota a été mis à niveau.",
          "success"
        );
        // Nettoyage propre de l'URL sans recharger la page
        window.history.replaceState({}, "", "/dashboard");
        window.dispatchEvent(new Event("boxhub_quota_updated"));
      } else if (payment === "cancelled" || payment === "failed") {
        showToast("Le paiement a été annulé ou n'a pas pu aboutir.", "error");
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, [showToast]);

  const currentTab =
    DASHBOARD_NAV_ITEMS.find((item) => item.id === activeTab) ||
    DASHBOARD_NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300 flex">
      
      {/* Responsive Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Sticky Header */}
        <DashboardHeader
          activeTabTitle={currentTab.label}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenPublishModal={() => setIsPublishModalOpen(true)}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewSection
              onNavigateTab={setActiveTab}
              onOpenPublishModal={() => setIsPublishModalOpen(true)}
            />
          )}

          {activeTab === "boxes" && (
            <MyBoxesSection
              onOpenPublishModal={() => setIsPublishModalOpen(true)}
            />
          )}

          {activeTab === "tokens" && <TokensSection />}

          {activeTab === "analytics" && <AnalyticsSection />}

          {activeTab === "settings" && <SettingsSection />}
        </main>
      </div>

      {/* Global Publish Box Modal */}
      <PublishBoxModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
      />
    </div>
  );
}
