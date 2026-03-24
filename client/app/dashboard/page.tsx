"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getDashboard } from "@/lib/services/dashboadr.service";
import { useAuth } from "@/context/AuthContext";

import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";

import DonutChart from "@/components/home/DonutChart";
import StatCard from "@/components/home/StartCard";
import { colors } from "@/styles/colors";

type Stats = {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

type ChartItem = {
  label: string;
  value: number;
  color: string;
};

type Task = {
  id: number;
  title: string;
  due_date: string;
  project: string;
};

type Activity = {
  user: string;
  action: string;
  target_type: string;
  created_at: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [upcoming, setUpcoming] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard();

        setStats(res.stats);
        setChartData(res.chart);
        setUpcoming(res.upcoming);
        setActivity(res.activity);
      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  if (loading) {
    return <Wrapper>Loading dashboard...</Wrapper>;
  }

  return (
    <Wrapper>
      <Main>
        <Header>
          <div>
            <Title>
              {greeting}, {user?.name}
            </Title>
            <Subtitle>Here’s what’s happening today.</Subtitle>
          </div>

          <ButtonGroup>
            <PrimaryButton>+ New Task</PrimaryButton>
            <OutlineButton>+ New Project</OutlineButton>
          </ButtonGroup>
        </Header>

        <CardGrid>
          <StatCard
            title="Total Tasks"
            value={stats?.total || 0}
            icon={<BarChart3 size={18} />}
            color="#6366f1"
          />

          <StatCard
            title="In Progress"
            value={stats?.inProgress || 0}
            icon={<Clock size={18} />}
            color="#0ea5e9"
          />

          <StatCard
            title="Completed"
            value={stats?.completed || 0}
            icon={<CheckCircle2 size={18} />}
            color="#10b981"
          />

          <StatCard
            title="Overdue"
            value={stats?.overdue || 0}
            icon={<AlertTriangle size={18} />}
            color="#ef4444"
          />
        </CardGrid>

        <SectionGrid>
          <Panel>
            <PanelHeader>
              <PanelTitle>Task Overview</PanelTitle>
              <FilterButton>This Week</FilterButton>
            </PanelHeader>

            <DonutChart data={chartData} />
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Upcoming Deadlines</PanelTitle>
              <ViewAll>View all</ViewAll>
            </PanelHeader>

            {upcoming.length === 0 ? (
              <Empty>No upcoming deadlines</Empty>
            ) : (
              upcoming.map((task) => (
                <TaskItem key={task.id}>
                  <User size={18} />

                  <div>
                    <strong>{task.title}</strong>

                    <small>
                      {task.project} •{" "}
                      {new Date(task.due_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </small>
                  </div>

                  <Badge>Upcoming</Badge>
                </TaskItem>
              ))
            )}
          </Panel>
        </SectionGrid>

        <Panel>
          <PanelHeader>
            <PanelTitle>Recent Activity</PanelTitle>
            <ViewAll>View all</ViewAll>
          </PanelHeader>

          {activity.length === 0 ? (
            <Empty>No activity yet</Empty>
          ) : (
            activity.map((item, i) => (
              <ActivityItem key={i}>
                <ActivityAvatar />

                <ActivityContent>
                  <strong>{item.user}</strong>

                  <p>
                    {item.action} {item.target_type}
                  </p>

                  <small>
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </ActivityContent>
              </ActivityItem>
            ))
          )}
        </Panel>
      </Main>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 32px;

  background: ${colors.background};
`;

const Main = styled.main`
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;

  color: ${colors.textPrimary};
`;

const Subtitle = styled.p`
  margin-top: 4px;

  color: ${colors.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 14px;
`;

const PrimaryButton = styled.button`
  background: ${colors.primary};
  color: white;

  padding: 10px 18px;

  border-radius: 8px;
  border: none;

  font-weight: 500;

  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.primaryHover};
  }
`;

const OutlineButton = styled.button`
  background: ${colors.card};
  color: ${colors.textPrimary};

  padding: 10px 18px;

  border-radius: 8px;
  border: 1px solid ${colors.border};

  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.primaryLight};
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

  gap: 24px;
  margin-bottom: 40px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;

  gap: 24px;
  margin-bottom: 24px;
`;

const Panel = styled.div`
  background: ${colors.card};
  color: ${colors.textPrimary};

  padding: 28px;

  border-radius: 16px;
  border: 1px solid ${colors.border};

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 20px;
`;

const PanelTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
`;

const FilterButton = styled.button`
  background: ${colors.primaryLight};
  color: ${colors.primary};

  border: none;

  padding: 6px 12px;

  border-radius: 8px;

  font-size: 12px;
  font-weight: 500;

  cursor: pointer;
`;

const ViewAll = styled.span`
  font-size: 12px;

  color: ${colors.primary};

  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;

  gap: 12px;
  margin-bottom: 18px;

  div {
    flex: 1;
  }

  strong {
    font-size: 14px;
  }

  small {
    display: block;

    font-size: 12px;
    margin-top: 2px;

    color: ${colors.textMuted};
  }
`;

const Badge = styled.div<{ $danger?: boolean }>`
  padding: 6px 10px;

  border-radius: 8px;

  font-size: 12px;
  font-weight: 500;

  background: ${({ $danger }) =>
    $danger ? colors.danger + "20" : colors.primaryLight};

  color: ${({ $danger }) => ($danger ? colors.danger : colors.primary)};
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 14px;

  margin-bottom: 18px;

  align-items: flex-start;
`;

const ActivityAvatar = styled.div`
  width: 36px;
  height: 36px;

  border-radius: 50%;

  background: ${colors.borderLight};
`;

const ActivityContent = styled.div`
  flex: 1;

  strong {
    font-size: 14px;
    display: block;

    color: ${colors.textPrimary};
  }

  p {
    margin: 0;

    font-size: 13px;

    color: ${colors.textSecondary};
  }

  small {
    font-size: 12px;

    color: ${colors.textMuted};
  }
`;

const Empty = styled.div`
  text-align: center;
  padding: 20px;
  color: ${colors.primary};
`;