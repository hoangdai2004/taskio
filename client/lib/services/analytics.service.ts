import axios from "@/lib/axios";

export interface OverviewStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  activeMembers: number;
}

export interface ProjectProgress {
  id: number;
  name: string;
  color: string;
  total: number;
  done: number;
  inProgress: number;
  todo: number;
  progress: number;
}

export interface MemberPerformance {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  totalTasks: number;
  done: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}

export interface WeeklyTrend {
  date: string;
  label: string;
  completed: number;
}

export interface WorkloadItem {
  label: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  overviewStats: OverviewStats;
  projectProgress: ProjectProgress[];
  memberPerformance: MemberPerformance[];
  weeklyTrend: WeeklyTrend[];
  workloadDistribution: WorkloadItem[];
}

export const getAnalytics = async (
  companyId: number,
  startDate?: string,
  endDate?: string
): Promise<{ message: string; data: AnalyticsData }> => {
  let url = `/analytics?companyId=${companyId}`;
  if (startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  const { data } = await axios.get(url);
  return data;
};
