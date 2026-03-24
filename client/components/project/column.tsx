"use client";

import styled from "styled-components";
import { Column as ColumnType, Task, Status } from "@/types/project.type";
import TaskCard from "./TaskCard";
import { Dot } from "lucide-react";
import { DefaultTheme } from "styled-components/dist/types";  

interface Props {
  column: ColumnType;
  tasks: Task[];
  dragTaskId: number | null;
  setDragTaskId: (id: number) => void;
  onDropTask: (taskId: number, status: Status) => void;
}

export default function Column({
  column,
  tasks,
  dragTaskId,
  setDragTaskId,
  onDropTask,
}: Props) {
  const columnTasks = tasks.filter((task) => task.status === column.id);

  const handleDrop = () => {
    if (!dragTaskId) return;

    onDropTask(dragTaskId, column.id);
  };

  return (
    <Wrapper onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <Header $status={column.id}>
        <IDot $status={column.id} />
        {column.title}
        <TotalTask>{columnTasks.length}</TotalTask>
      </Header>

      <TaskList>
        {columnTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={setDragTaskId}
          />
        ))}
      </TaskList>
    </Wrapper>
  );
}

const getStatusColor = (theme: DefaultTheme, status: Status) => {
  switch (status) {
    case "todo":
      return theme.colors.primary;
    case "progress":
      return theme.colors.warning;
    case "review":
      return theme.colors.review;
    case "done":
      return theme.colors.success;
    default:
      return theme.colors.primary;
  }
};

const Wrapper = styled.div`
  width: 300px;
  background: ${({ theme }) => theme.colors.card};
  padding: 16px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  display: flex;
  flex-direction: column;
  max-height: 80vh;
`;

const Header = styled.div<{ $status: Status }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 12px;
  padding-bottom: 6px;

  border-bottom: 3px solid
    ${({ theme, $status }) => getStatusColor(theme, $status)};
`;

const IDot = styled(Dot)<{ $status: Status }>`
  color: ${({ theme, $status }) => getStatusColor(theme, $status)};
`;

const TotalTask = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;

  padding: 2px 8px;
  border-radius: 12px;

  font-size: 12px;
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
`;