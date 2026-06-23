"use client";

import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { colors } from "@/styles/colors";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  MoreHorizontal,
  LayoutDashboard
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useRouter } from "next/navigation";

const lineData = [
  { name: "01/05", new: 400, completed: 240, overdue: 100 },
  { name: "05/05", new: 300, completed: 139, overdue: 80 },
  { name: "10/05", new: 200, completed: 980, overdue: 120 },
  { name: "15/05", new: 278, completed: 390, overdue: 150 },
  { name: "20/05", new: 189, completed: 480, overdue: 90 },
  { name: "25/05", new: 239, completed: 380, overdue: 110 },
  { name: "31/05", new: 349, completed: 430, overdue: 130 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { activeCompanyId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeCompanyId) return;
      try {
        setLoading(true);
        const res = await axios.get(`/companies/${activeCompanyId}/stats`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeCompanyId]);

  if (loading || !data) return <Wrapper>Loading admin data...</Wrapper>;

  const { totalUsers, totalProjects, totalTasks, completedTasks, overdueTasks, tasksByStatus, recentProjects } = data;
  
  const statusColors: Record<string, string> = {
    'TODO': '#94a3b8',
    'IN_PROGRESS': '#3b82f6',
    'REVIEW': '#f59e0b',
    'DONE': '#10b981'
  };

  const formattedPieData = tasksByStatus.map((s: any) => ({
    name: s.name,
    value: s.value,
    color: statusColors[s.name] || '#cbd5e1'
  }));

  return (
    <Wrapper>
      <Title>System Overview</Title>
      
      <StatsGrid>
        <StatCard>
          <IconBox color="#6366f120" iconColor="#6366f1">
            <Users size={24} />
          </IconBox>
          <StatInfo>
            <StatLabel>Total Users</StatLabel>
            <StatValue>{totalUsers.toLocaleString()}</StatValue>
            <StatTrend $up={true}>
              <TrendingUp size={12} /> 12.5% vs last month
            </StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconBox color="#10b98120" iconColor="#10b981">
            <FolderKanban size={24} />
          </IconBox>
          <StatInfo>
            <StatLabel>Total Projects</StatLabel>
            <StatValue>{totalProjects}</StatValue>
            <StatTrend $up={true}>
              <TrendingUp size={12} /> 8.2% vs last month
            </StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconBox color="#3b82f620" iconColor="#3b82f6">
            <CheckCircle2 size={24} />
          </IconBox>
          <StatInfo>
            <StatLabel>Total Tasks</StatLabel>
            <StatValue>{totalTasks.toLocaleString()}</StatValue>
            <StatTrend $up={true}>
              <TrendingUp size={12} /> 15.3% vs last month
            </StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconBox color="#f59e0b20" iconColor="#f59e0b">
            <CheckCircle2 size={24} />
          </IconBox>
          <StatInfo>
            <StatLabel>Completed</StatLabel>
            <StatValue>{completedTasks.toLocaleString()}</StatValue>
            <StatTrend $up={true}>
              <TrendingUp size={12} /> 18.7% vs last month
            </StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard>
          <IconBox color="#ef444420" iconColor="#ef4444">
            <AlertCircle size={24} />
          </IconBox>
          <StatInfo>
            <StatLabel>Overdue</StatLabel>
            <StatValue>{overdueTasks}</StatValue>
            <StatTrend $up={false}>
              <TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} /> 5.4% vs last month
            </StatTrend>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ChartsRow>
        <LineChartCard>
          <CardHeader>
            <CardTitle>Task Statistics</CardTitle>
            <TimeSelect>Last 30 days</TimeSelect>
          </CardHeader>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="new" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="overdue" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </LineChartCard>

        <PieChartCard>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formattedPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formattedPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <LegendGrid>
            {formattedPieData.map((item: any) => (
              <LegendItem key={item.name}>
                <Dot color={item.color} />
                <span>{item.name}</span>
                <span className="val">{item.value}</span>
              </LegendItem>
            ))}
          </LegendGrid>
        </PieChartCard>
      </ChartsRow>

      <TableSection>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <ViewAll onClick={() => router.push("/dashboard/projects")}>View all projects</ViewAll>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Owner</th>
              <th>Tasks</th>
              <th>Progress</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recentProjects.map((proj: any, idx: number) => (
              <tr key={idx}>
                <td>
                  <ProjectName>
                    <ProjectIcon color={proj.color} />
                    {proj.name}
                  </ProjectName>
                </td>
                <td>{proj.owner}</td>
                <td>{proj.tasks}</td>
                <td>
                  <ProgressWrapper>
                    <ProgressBar><ProgressFill $width={proj.progress} $color={proj.color} /></ProgressBar>
                    <span>{proj.progress}%</span>
                  </ProgressWrapper>
                </td>
                <td><MoreHorizontal size={16} color="#94a3b8" cursor="pointer" /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableSection>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textPrimary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const IconBox = styled.div<{ color: string; iconColor: string }>`
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: ${props => props.color};
  color: ${props => props.iconColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 13px;
  color: ${colors.textSecondary};
  font-weight: 500;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 4px 0;
`;

const StatTrend = styled.span<{ $up: boolean }>`
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.$up ? "#10b981" : "#ef4444"};
  font-weight: 600;
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const BaseCard = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
`;

const LineChartCard = styled(BaseCard)``;
const PieChartCard = styled(BaseCard)`
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const TimeSelect = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  padding: 6px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  cursor: pointer;
`;

const ChartWrapper = styled.div`
  width: 100%;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${colors.textSecondary};

  .val {
    margin-left: auto;
    font-weight: 600;
    color: ${colors.textPrimary};
  }
`;

const Dot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const TableSection = styled(BaseCard)``;

const ViewAll = styled.span`
  font-size: 12px;
  color: ${colors.primary};
  font-weight: 600;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    font-size: 12px;
    color: ${colors.textSecondary};
    font-weight: 500;
    padding: 12px 16px;
    border-bottom: 1px solid ${colors.border};
  }

  td {
    padding: 16px;
    font-size: 14px;
    color: ${colors.textPrimary};
    border-bottom: 1px solid ${colors.borderLight};
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const ProjectName = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
`;

const ProjectIcon = styled.div<{ color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => props.color};
`;

const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 150px;

  span {
    font-size: 12px;
    font-weight: 600;
    color: ${colors.textSecondary};
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: ${colors.borderLight};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  width: ${props => props.$width}%;
  height: 100%;
  background: ${props => props.$color};
`;
