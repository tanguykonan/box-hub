"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { AdminSidebar, ADMIN_NAV_ITEMS } from "../../components/admin/AdminSidebar";
import { AdminHeader } from "../../components/admin/AdminHeader";
import { AdminUsersSection } from "../../components/admin/sections/AdminUsersSection";
import { AdminAnalyticsSection } from "../../components/admin/sections/AdminAnalyticsSection";
import { AdminAlertsSection } from "../../components/admin/sections/AdminAlertsSection";
import { AdminTeamSection } from "../../components/admin/sections/AdminTeamSection";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    } else if (status === "authenticated" && session?.user && (session.user as any).role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || (status === "authenticated" && (session?.user as any)?.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <span className="text-xs text-zinc-500 font-medium">
            Chargement de la console d'administration...
          </span>
        </div>
      </div>
    );
  }

  const currentTab =
    ADMIN_NAV_ITEMS.find((item) => item.id === activeTab) ||
    ADMIN_NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300 flex">
      
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
      }`}>
        
        {/* Sticky Header */}
        <AdminHeader
          activeTabTitle={currentTab.label}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "users" && <AdminUsersSection />}

          {activeTab === "analytics" && <AdminAnalyticsSection />}

          {activeTab === "alerts" && <AdminAlertsSection />}

          {activeTab === "admins" && <AdminTeamSection />}
        </main>
      </div>

    </div>
  );
}
