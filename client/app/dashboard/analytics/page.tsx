"use client";

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  Crown,
  Award,
  Loader2,
  Download,
  Calendar
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  getAnalytics,
  AnalyticsData,
  ProjectProgress,
  MemberPerformance,
} from "@/lib/services/analytics.service";
import { colors } from "@/styles/colors";
import DonutChart from "@/components/home/DonutChart";

export default function AnalyticsPage() {
  const { activeCompanyId, companies } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const activeCompany = companies.find(
    (c) => Number(c.id) === Number(activeCompanyId)
  );

  useEffect(() => {
    if (!activeCompanyId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getAnalytics(activeCompanyId, startDate, endDate);
        setData(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("You don't have permission to view analytics.");
        } else {
          setError("Failed to load analytics data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [activeCompanyId, startDate, endDate]);

  const handleExportCSV = () => {
    if (!data) return;
    const { memberPerformance, overviewStats } = data;
    
    const headers = ["Member", "Done", "In Progress", "Overdue", "Completion Rate"];
    const rows = memberPerformance.map((m) => [
      `"${m.fullName}"`,
      m.done,
      m.inProgress,
      m.overdue,
      `"${m.completionRate}%"`
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Company Performance Report\n`;
    csvContent += `Total Tasks,${overviewStats.totalTasks}\n`;
    csvContent += `Completed,${overviewStats.completedTasks}\n`;
    csvContent += `Overdue,${overviewStats.overdueTasks}\n\n`;
    
    csvContent += headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${activeCompany?.slug || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Loader2 size={32} className="spin" />
        <span>Loading analytics...</span>
      </LoadingWrapper>
    );
  }

  if (error) {
    return (
      <ErrorWrapper>
        <AlertTriangle size={48} />
        <h2>Access Denied</h2>
        <p>{error}</p>
      </ErrorWrapper>
    );
  }

  if (!data) return null;

  const { overviewStats, projectProgress, memberPerformance, weeklyTrend, workloadDistribution } = data;
  const maxWeekly = Math.max(...weeklyTrend.map((d) => d.completed), 1);

  return (
    <Wrapper>
      <PageHeader>
        <div>
          <PageTitle>
            <BarChart3 size={28} />
            Company Performance
          </PageTitle>
          <PageSubtitle>
            Analytics overview for <strong>{activeCompany?.name || "your company"}</strong>
          </PageSubtitle>
        </div>
        <HeaderActions>
          <DateFilterGroup>
            <DateInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <span>-</span>
            <DateInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </DateFilterGroup>
          <ExportButton onClick={handleExportCSV}>
            <Download size={16} />
            Export CSV
          </ExportButton>
        </HeaderActions>
      </PageHeader>

      {/* Overview Stat Cards */}
      <StatsGrid>
        <StatCard $accent="#6366f1">
          <StatIcon $bg="rgba(99, 102, 241, 0.12)">
            <BarChart3 size={22} color="#6366f1" />
          </StatIcon>
          <StatInfo>
            <StatValue>{overviewStats.totalTasks}</StatValue>
            <StatLabel>Total Tasks</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard $accent="#10b981">
          <StatIcon $bg="rgba(16, 185, 129, 0.12)">
            <TrendingUp size={22} color="#10b981" />
          </StatIcon>
          <StatInfo>
            <StatValue>{overviewStats.completionRate}%</StatValue>
            <StatLabel>Completion Rate</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard $accent="#ef4444">
          <StatIcon $bg="rgba(239, 68, 68, 0.12)">
            <AlertTriangle size={22} color="#ef4444" />
          </StatIcon>
          <StatInfo>
            <StatValue>{overviewStats.overdueTasks}</StatValue>
            <StatLabel>Overdue</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard $accent="#0ea5e9">
          <StatIcon $bg="rgba(14, 165, 233, 0.12)">
            <Users size={22} color="#0ea5e9" />
          </StatIcon>
          <StatInfo>
            <StatValue>{overviewStats.activeMembers}</StatValue>
            <StatLabel>Active Members</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Main Content Grid */}
      <ContentGrid>
        {/* Project Progress */}
        <Panel>
          <PanelTitle>Project Progress</PanelTitle>
          {projectProgress.length === 0 ? (
            <EmptyState>No projects yet</EmptyState>
          ) : (
            <ProjectList>
              {projectProgress.map((project) => (
                <ProjectRow key={project.id}>
                  <ProjectHeader>
                    <ProjectName>
                      <ProjectDot $color={project.color} />
                      {project.name}
                    </ProjectName>
                    <ProjectPercent>{project.progress}%</ProjectPercent>
                  </ProjectHeader>
                  <ProgressBarTrack>
                    <ProgressBarFill
                      $percent={project.progress}
                      $color={project.color}
                    />
                  </ProgressBarTrack>
                  <ProjectMeta>
                    <span>{project.done} done</span>
                    <span>{project.inProgress} in progress</span>
                    <span>{project.todo} to do</span>
                  </ProjectMeta>
                </ProjectRow>
              ))}
            </ProjectList>
          )}
        </Panel>

        {/* Weekly Trend */}
        <Panel>
          <PanelTitle>Tasks Completed (Last 7 Days)</PanelTitle>
          <BarChartWrapper>
            {weeklyTrend.map((day, i) => (
              <BarColumn key={i}>
                <BarValue>{day.completed}</BarValue>
                <Bar
                  $height={`${Math.max((day.completed / maxWeekly) * 100, 4)}%`}
                  $delay={i * 0.08}
                />
                <BarLabel>{day.label}</BarLabel>
              </BarColumn>
            ))}
          </BarChartWrapper>
        </Panel>
      </ContentGrid>

      {/* Second Row */}
      <ContentGrid>
        {/* Workload Distribution */}
        <Panel>
          <PanelTitle>Workload Distribution</PanelTitle>
          {workloadDistribution.length === 0 ? (
            <EmptyState>No task assignments yet</EmptyState>
          ) : (
            <DonutChart data={workloadDistribution} size={220} strokeWidth={22} />
          )}
        </Panel>

        {/* Member Performance Table */}
        <Panel $wide>
          <PanelTitle>Member Performance</PanelTitle>
          {memberPerformance.length === 0 ? (
            <EmptyState>No members yet</EmptyState>
          ) : (
            <MemberTable>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Done</th>
                  <th>In Progress</th>
                  <th>Overdue</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {memberPerformance.map((member, i) => (
                  <MemberRow key={member.id}>
                    <td>
                      <Rank $top={i < 3}>
                        {i === 0 ? <Crown size={16} color="#f59e0b" /> : i + 1}
                      </Rank>
                    </td>
                    <td>
                      <MemberInfo>
                        <MemberAvatar>
                          <Image
                            src={member.avatarUrl || "/images/avatar-default.png"}
                            alt={member.fullName}
                            width={36}
                            height={36}
                          />
                        </MemberAvatar>
                        <MemberDetails>
                          <MemberName>
                            {member.fullName}
                            {member.role === "OWNER" && (
                              <RoleBadge $role="OWNER">Owner</RoleBadge>
                            )}
                          </MemberName>
                          <MemberEmail>{member.email}</MemberEmail>
                        </MemberDetails>
                      </MemberInfo>
                    </td>
                    <td>
                      <TaskCount $color="#10b981">{member.done}</TaskCount>
                    </td>
                    <td>
                      <TaskCount $color="#3b82f6">{member.inProgress}</TaskCount>
                    </td>
                    <td>
                      <TaskCount $color="#ef4444">{member.overdue}</TaskCount>
                    </td>
                    <td>
                      <RateCell>
                        <RateBar>
                          <RateBarFill $percent={member.completionRate} />
                        </RateBar>
                        <RateText>{member.completionRate}%</RateText>
                      </RateCell>
                    </td>
                  </MemberRow>
                ))}
              </tbody>
            </MemberTable>
          )}
        </Panel>
      </ContentGrid>
    </Wrapper>
  );
}

/* --- Animations --- */
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const growBar = keyframes`
  from { height: 0; }
`;

/* --- Styled Components --- */
const Wrapper = styled.div`
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeInUp} 0.4s ease;

  .spin {
    animation: ${spin} 1s linear infinite;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 16px;
  color: ${colors.textSecondary};

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 12px;
  color: ${colors.danger};
  text-align: center;

  h2 {
    font-size: 24px;
    margin: 0;
  }
  p {
    color: ${colors.textSecondary};
    font-size: 15px;
  }
`;

const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 26px;
  font-weight: 700;
  color: ${colors.textPrimary};
  margin: 0;
`;

const PageSubtitle = styled.p`
  margin: 6px 0 0;
  font-size: 14px;
  color: ${colors.textSecondary};

  strong {
    color: ${colors.primary};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DateFilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  padding: 6px 12px;
  border-radius: 8px;
  color: ${colors.textSecondary};
`;

const DateInput = styled.input`
  border: none;
  background: transparent;
  color: ${colors.textPrimary};
  font-family: inherit;
  font-size: 13px;
  outline: none;

  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.primaryHover};
  }
`;

const StatsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.article<{ $accent: string }>`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 22px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid ${(p) => p.$accent};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
`;

const StatIcon = styled.div<{ $bg: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(p) => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.textPrimary};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-top: 4px;
`;

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.article<{ $wide?: boolean }>`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);

  ${(p) => p.$wide && `grid-column: span 1;`}
`;

const PanelTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0 0 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textMuted};
  font-size: 14px;
`;

/* --- Project Progress --- */
const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ProjectRow = styled.div``;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProjectName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const ProjectDot = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(p) => p.$color};
`;

const ProjectPercent = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.primary};
`;

const ProgressBarTrack = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${colors.borderLight};
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${(p) => p.$percent}%;
  background: ${(p) => p.$color};
  border-radius: 4px;
  transition: width 0.8s ease;
`;

const ProjectMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 6px;
  font-size: 12px;
  color: ${colors.textMuted};
`;

/* --- Weekly Trend Bar Chart --- */
const BarChartWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  gap: 8px;
  padding-top: 16px;
`;

const BarColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
`;

const BarValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
`;

const Bar = styled.div<{ $height: string; $delay: number }>`
  width: 100%;
  max-width: 40px;
  height: ${(p) => p.$height};
  background: linear-gradient(180deg, #6366f1, #818cf8);
  border-radius: 6px 6px 2px 2px;
  animation: ${growBar} 0.6s ease ${(p) => p.$delay}s both;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const BarLabel = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
  margin-top: 8px;
`;

/* --- Member Performance Table --- */
const MemberTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead tr {
    border-bottom: 2px solid ${colors.borderLight};
  }

  th {
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 8px 12px 12px;
  }

  th:first-child {
    width: 40px;
    text-align: center;
  }
`;

const MemberRow = styled.tr`
  border-bottom: 1px solid ${colors.borderLight};
  transition: background 0.15s;

  &:hover {
    background: rgba(99, 102, 241, 0.03);
  }

  td {
    padding: 14px 12px;
    vertical-align: middle;
  }
`;

const Rank = styled.div<{ $top: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: ${(p) => (p.$top ? "700" : "500")};
  color: ${(p) => (p.$top ? colors.primary : colors.textSecondary)};
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MemberAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
`;

const MemberDetails = styled.div``;

const MemberName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MemberEmail = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
`;

const RoleBadge = styled.span<{ $role: string }>`
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${(p) =>
    p.$role === "OWNER"
      ? "rgba(245, 158, 11, 0.12)"
      : "rgba(99, 102, 241, 0.12)"};
  color: ${(p) => (p.$role === "OWNER" ? "#f59e0b" : "#6366f1")};
`;

const TaskCount = styled.span<{ $color: string }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => p.$color};
`;

const RateCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RateBar = styled.div`
  width: 60px;
  height: 6px;
  border-radius: 3px;
  background: ${colors.borderLight};
  overflow: hidden;
`;

const RateBarFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${(p) => p.$percent}%;
  border-radius: 3px;
  background: ${(p) =>
    p.$percent >= 75 ? "#10b981" : p.$percent >= 40 ? "#f59e0b" : "#ef4444"};
  transition: width 0.8s ease;
`;

const RateText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textPrimary};
  min-width: 36px;
`;
