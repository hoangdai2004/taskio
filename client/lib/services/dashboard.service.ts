import axios from "@/lib/axios";

export interface DashboardStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueTodayCount: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface UpcomingTask {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  project: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  target: string;
  assignee: string;
  avatar?: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  upcoming: UpcomingTask[];
  activity: ActivityItem[];
}

export const getDashboard = async (
  companyId: number,
  timeRange: string = "all"
): Promise<{ message: string; data: DashboardData }> => {
  const { data } = await axios.get(`/dashboard?companyId=${companyId}&timeRange=${timeRange}`);
  return data;
};
