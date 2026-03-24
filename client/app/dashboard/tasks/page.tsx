"use client";

import styled from "styled-components";
import TaskItem from "@/components/tasks/TaskItem";

export default function TasksPage() {
  return (
    <Wrapper>
  <Header>
        <Left>
          <Title>My Tasks</Title>

          <Tabs>
            <Tab>All</Tab>
            <Tab>Today</Tab>
            <Tab>Completed</Tab>
          </Tabs>
        </Left>

        <Actions>
          <Filter>All</Filter>
          <Filter>Priority</Filter>
          <Filter>All Projects</Filter>

          <NewTask>New Task</NewTask>
        </Actions>
      </Header>

      <SectionTitle>Today</SectionTitle>

      <TaskList>
        <TaskItem
          title="Design Login Screen"
          project="Mobile App"
          priority="High"
          date="Today"
        />

        <TaskItem
          title="Fix Auth API"
          project="Mobile App"
          priority="High"
          date="Today"
        />

        <TaskItem
          title="Write homepage copy"
          project="Website Redesign"
          priority="Medium"
          date="Today"
        />
      </TaskList>

      <SectionTitle>Upcoming</SectionTitle>

      <TaskList>
        <TaskItem
          title="Setup Firebase"
          project="Mobile App"
          priority="Medium"
          date="Tomorrow"
        />

        <TaskItem
          title="Create pricing page"
          project="Design System"
          priority="Low"
          date="April 18"
        />
      </TaskList>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 30px;

  background: ${({ theme }) => theme.colors.background};

  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  margin-bottom: 30px;
`;

const Left = styled.div`
  display: flex;

  flex-direction: column;
`;

const Actions = styled.div`
  display: flex;

  gap: 10px;
`;

const Filter = styled.button`
  padding: 8px 14px;

  border-radius: 8px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  background: ${({ theme }) => theme.colors.card};

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;

  font-size: 14px;

  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const NewTask = styled.button`
  background: ${({ theme }) => theme.colors.primary};

  color: ${({ theme }) => theme.colors.card};

  padding: 8px 16px;

  border-radius: 8px;

  border: none;

  font-weight: 500;

  font-size: 14px;

  cursor: pointer;

  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const Title = styled.h1`
  font-size: 28px;

  font-weight: 600;

  color: ${({ theme }) => theme.colors.textPrimary};

  margin-bottom: 20px;
`;

const Tabs = styled.div`
  display: flex;

  gap: 10px;

  margin-bottom: 25px;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 8px 14px;

  border-radius: 8px;

  border: none;

  font-size: 14px;

  cursor: pointer;

  transition: all 0.2s ease;

  background: ${({ active, theme }) =>
    active ? theme.colors.primaryLight : theme.colors.borderLight};

  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const SectionTitle = styled.h3`
  margin: 20px 0 12px 0;

  font-size: 16px;

  font-weight: 600;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TaskList = styled.div`
  display: flex;

  flex-direction: column;

  gap: 12px;
`;