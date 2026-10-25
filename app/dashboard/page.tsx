"use client";

import React, { useState } from "react";
import { DashboardSidebar, DASHBOARD_NAV_ITEMS } from "../../components/dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { OverviewSection } from "../../components/dashboard/sections/OverviewSection";
import { MyBoxesSection } from "../../components/dashboard/sections/MyBoxesSection";
import { TokensSection } from "../../components/dashboard/sections/TokensSection";
import { AnalyticsSection } from "../../components/dashboard/sections/AnalyticsSection";
import { SettingsSection } from "../../components/dashboard/sections/SettingsSection";
import { PublishBoxModal } from "../../components/dashboard/modals/PublishBoxModal";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

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
