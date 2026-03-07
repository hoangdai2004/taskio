import React from "react";
import styled from "styled-components";
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

const chartData = [
  { label: "Completed", value: 12, color: "#22c55e" },
  { label: "In Progress", value: 8, color: "#0ea5e9" },
  { label: "Pending", value: 3, color: "#f59e0b" },
  { label: "Overdue", value: 4, color: "#ef4444" },
];

export default function Dashboard() {
  return (
    <Wrapper>
      <Main>
        <Header>
          <div>
            <Title>Good morning, Dai 👋</Title>
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
            value="24"
            icon={<BarChart3 size={18} />}
            color="#6366f1"
          />
          <StatCard
            title="In Progress"
            value="8"
            icon={<Clock size={18} />}
            color="#0ea5e9"
          />
          <StatCard
            title="Completed"
            value="12"
            icon={<CheckCircle2 size={18} />}
            color="#10b981"
          />
          <StatCard
            title="Overdue"
            value="4"
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

            <TaskItem>
              <User size={18} />
              <div>
                <strong>Design meeting</strong>
                <small>Apr 26</small>
              </div>
              <Badge $danger>Today</Badge>
            </TaskItem>

            <TaskItem>
              <User size={18} />
              <div>
                <strong>Launch campaign</strong>
                <small>Apr 27</small>
              </div>
              <Badge $danger>Overdue</Badge>
            </TaskItem>

            <TaskItem>
              <User size={18} />
              <div>
                <strong>Sprint planning</strong>
                <small>Apr 30</small>
              </div>
              <Badge>Upcoming</Badge>
            </TaskItem>
          </Panel>
        </SectionGrid>

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
              <PanelTitle>Recent Activity</PanelTitle>
              <ViewAll>View all</ViewAll>
            </PanelHeader>

            <ActivityItem>
              <ActivityAvatar />
              <ActivityContent>
                <strong>Anima completed</strong>
                <p>Mobile App Design</p>
                <small>2h ago</small>
              </ActivityContent>
            </ActivityItem>

            <ActivityItem>
              <ActivityAvatar />
              <ActivityContent>
                <strong>An commented on</strong>
                <p>User Research</p>
                <small>5h ago</small>
              </ActivityContent>
            </ActivityItem>

            <ActivityItem>
              <ActivityAvatar />
              <ActivityContent>
                <strong>Dai created a new task</strong>
                <p>Update homepage</p>
                <small>Yesterday</small>
              </ActivityContent>
            </ActivityItem>

            <ActivityItem>
              <ActivityAvatar />
              <ActivityContent>
                <strong>Duy attached file to</strong>
                <p>Website Redesign</p>
                <small>Yesterday</small>
              </ActivityContent>
            </ActivityItem>
          </Panel>
        </SectionGrid>
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