"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getDashboard } from "@/lib/services/dashboard.service";
import { createProject, getProjects, ProjectItem } from "@/lib/services/projects.service";
import { createTask } from "@/lib/services/tasks.service";
import { getCompanyMembers } from "@/lib/services/companies.service";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  X,
} from "lucide-react";

import DonutChart from "@/components/home/DonutChart";
import StatCard from "@/components/home/StartCard";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import { colors } from "@/styles/colors";

type Stats = {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueTodayCount: number;
};

type ChartItem = {
  label: string;
  value: number;
  color: string;
};

type UpcomingTask = {
  id: number;
  title: string;
  dueDate: string;
  priority: string;
  project: string;
};

type ActivityItem = {
  id: number;
  action: string;
  target: string;
  assignee: string;
  avatar?: string;
  createdAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingTask[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [taskAssignees, setTaskAssignees] = useState<Array<{ id: number; fullName: string; avatarUrl?: string }>>([]);
  const [taskProjects, setTaskProjects] = useState<ProjectItem[]>([]);
  const [timeRange, setTimeRange] = useState("all");
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  const { user, activeCompanyId } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!activeCompanyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getDashboard(activeCompanyId, timeRange);
        setStats(res.data.stats);
        setChartData(res.data.chartData);
        setUpcoming(res.data.upcoming);
        setActivity(res.data.activity);
      } catch (error) {
        console.error("Dashboard error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [activeCompanyId, timeRange]);

  useEffect(() => {
    const fetchAssignees = async () => {
      if (!activeCompanyId) {
        setTaskAssignees([]);
        return;
      }

      try {
        const { members } = await getCompanyMembers(activeCompanyId);
        setTaskAssignees(members.map(m => ({ id: m.id, fullName: m.fullName, avatarUrl: m.avatarUrl })));
      } catch (error) {
        console.error("Failed to load assignees:", error);
        setTaskAssignees([]);
      }
    };

    fetchAssignees();
  }, [activeCompanyId]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!activeCompanyId) {
        setTaskProjects([]);
        return;
      }

      try {
        const { projects } = await getProjects(activeCompanyId);
        setTaskProjects(projects);
      } catch (error) {
        console.error("Failed to load projects:", error);
        setTaskProjects([]);
      }
    };

    fetchProjects();
  }, [activeCompanyId]);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : "Good evening";

  const handleNewTask = () => {
    setShowTaskModal(true);
  };

  const handleNewProject = () => {
    setShowProjectModal(true);
  };

  const handleCreateTask = async (title: string, description?: string, projectId?: number, assigneeId?: number, priority?: string, dueDate?: string, status?: string) => {
    if (!title.trim() || !activeCompanyId || !projectId) return;

    try {
      await createTask(activeCompanyId, {
        title,
        description,
        projectId,
        assigneeId,
        priority: (priority as "LOW" | "MEDIUM" | "HIGH" | undefined),
        dueDate,
        status: (status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | undefined),
      });
      setShowTaskModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || !activeCompanyId) return;

    try {
      setCreatingProject(true);
      await createProject(activeCompanyId, {
        name: projectName,
        description: projectDesc,
      });
      setProjectName("");
      setProjectDesc("");
      setShowProjectModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreatingProject(false);
    }
  };

  const [activityLimit, setActivityLimit] = useState(5);

  const visibleActivity = activity.slice(0, activityLimit);

  return (
    <Wrapper>
      <Main>
        <Header>
          <div>
            <Title>
              {greeting}, {user?.fullName || user?.email || "User"}
            </Title>
            <Subtitle>Here’s what’s happening today.</Subtitle>
          </div>

          <ButtonGroup>
            <PrimaryButton onClick={handleNewTask}>+ New Task</PrimaryButton>
            <OutlineButton onClick={handleNewProject}>+ New Project</OutlineButton>
          </ButtonGroup>
          <CreateTaskModal
            isOpen={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSubmit={handleCreateTask}
            projects={taskProjects.map(p => ({ id: p.id, name: p.name }))}
          />
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
            value={stats?.done || 0}
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
              <div style={{ position: "relative" }}>
                <FilterButton onClick={() => setShowTimeFilter(!showTimeFilter)}>
                  {timeRange === "week" ? "This Week" : timeRange === "month" ? "This Month" : "All Time"}
                </FilterButton>
                {showTimeFilter && (
                  <FilterDropdown>
                    <FilterOption onClick={() => { setTimeRange("all"); setShowTimeFilter(false); }}>All Time</FilterOption>
                    <FilterOption onClick={() => { setTimeRange("week"); setShowTimeFilter(false); }}>This Week</FilterOption>
                    <FilterOption onClick={() => { setTimeRange("month"); setShowTimeFilter(false); }}>This Month</FilterOption>
                  </FilterDropdown>
                )}
              </div>
            </PanelHeader>

            <DonutChart data={chartData} />
          </Panel>

          <Panel>
            <PanelHeader>
              <PanelTitle>Upcoming Deadlines</PanelTitle>
              <ViewAll onClick={() => router.push("/dashboard/tasks")}>View all</ViewAll>
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
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
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
          </PanelHeader>

          {activity.length === 0 ? (
            <Empty>No activity yet</Empty>
          ) : (
            <>
              {visibleActivity.map((item, i) => (
                <ActivityItem key={i}>
                  <ActivityAvatar />

                  <ActivityContent>
                    <strong>{item.assignee || "Someone"}</strong>

                    <p>
                      {item.action}
                    </p>

                    <small>
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </ActivityContent>
                </ActivityItem>
              ))}

              {activity.length > activityLimit && (
                <ShowMoreWrapper>
                  <ShowMoreButton onClick={() => setActivityLimit(prev => prev + 5)}>
                    Show more activities
                  </ShowMoreButton>
                </ShowMoreWrapper>
              )}
            </>
          )}
        </Panel>
      </Main>

      {showProjectModal && (
        <ModalOverlay onClick={() => setShowProjectModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New Project</ModalTitle>
              <CloseButton onClick={() => setShowProjectModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label>Project Name *</Label>
                <Input
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Enter project description (optional)"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  rows={4}
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowProjectModal(false)}>
                Cancel
              </CancelButton>
              <SubmitButton
                onClick={handleCreateProject}
                disabled={!projectName.trim() || creatingProject}
              >
                {creatingProject ? "Creating..." : "Create Project"}
              </SubmitButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
  padding: 32px;

  background: ${colors.background};

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Main = styled.main`
  width: 100%;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
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

  @media (max-width: 768px) {
    width: 100%;
    gap: 10px;

    button {
      flex: 1;
    }
  }
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
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textPrimary};

  padding: 10px 18px;

  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  cursor: pointer;
  transition: 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SectionGrid = styled.section`
  display: grid;
  grid-template-columns: 2fr 1fr;

  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.article`
  background: ${colors.card};
  color: ${colors.textPrimary};

  padding: 28px;

  border-radius: 16px;
  border: 1px solid ${colors.border};

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);
`;

const PanelHeader = styled.header`
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
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};

  border: 1px solid transparent;

  padding: 6px 12px;

  border-radius: 8px;

  font-size: 12px;
  font-weight: 500;

  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}25;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;
  min-width: 120px;
  overflow: hidden;
`;

const FilterOption = styled.div`
  padding: 10px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const ViewAll = styled.button`
  background: ${({ theme }) => theme.colors.primary}15;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid transparent;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}25;
    border-color: ${({ theme }) => theme.colors.primary};
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${colors.surface};
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${colors.border};
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: ${colors.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textPrimary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${colors.surface};
  color: ${colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${colors.surface};
  color: ${colors.textPrimary};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid ${colors.border};
`;

const CancelButton = styled.button`
  padding: 10px 18px;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.textPrimary};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    border-color: ${colors.textSecondary};
    background: ${colors.borderLight};
  }
`;

const ShowMoreButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid transparent;
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary}15;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SubmitButton = styled.button`
  padding: 10px 18px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ShowMoreWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${colors.borderLight};
`;
