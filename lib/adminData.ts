export interface AdminUser {
  id: string;
  username: string;
  email: string;
  tier: "free" | "tier_5" | "tier_10" | "tier_20";
  tierName: string;
  boxesCount: number;
  storageUsedMB: number;
  storageLimitMB: number;
  status: "active" | "suspended";
  joinedAt: string;
  lastLogin: string;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: "Propriétaire" | "Administrateur";
  addedAt: string;
  lastActive: string;
}

export interface DailyMetricPoint {
  date: string;
  pulls: number;
  signups: number;
  bandwidthGB: number;
}

export interface CategoryDistributionItem {
  key: "bots" | "api" | "ai" | "tools";
  category: string;
  boxesCount: number;
  percentage: number;
  color: string;
}

export interface PlatformAnalytics {
  totalPulls: number;
  pullsGrowthPct: number;
  totalUsers: number;
  usersGrowthPct: number;
  bandwidthConsumedTB: number;
  dauMauRatio: number;
  storageUsedGB: number;
  storageLimitGB: number;
  runtimeDistribution: {
    name: string;
    percentage: number;
    count: number;
    color: string;
  }[];
  categoryDistribution: CategoryDistributionItem[];
  weeklyHistory: DailyMetricPoint[];
}


