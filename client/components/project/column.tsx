"use client";

import styled from "styled-components";
import { Column as ColumnType, Task, Status } from "@/types/project.type";
import TaskCard from "./task-card";
import { Dot  } from "lucide-react";

interface Props {
  column: ColumnType;
  tasks: Task[];
  onDropTask: (taskId: number, status: Status) => void;
}

export default function Column({ column, tasks, onDropTask }: Props) {
  const columnTasks = tasks.filter((task) => task.status === column.id);

  const handleDrop = (e: React.DragEvent) => {
    const taskId = Number(e.dataTransfer.getData("taskId"));
    onDropTask(taskId, column.id);
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
          <TaskCard key={task.id} task={task} />
        ))}
      </TaskList>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 300px;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;

  display: flex;
  flex-direction: column;
  max-height: 80vh;
`;

const Header = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #000;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 3px solid
    ${({ $status }) =>
      $status === "todo"
        ? "#2563eb"
        : $status === "progress"
          ? "#f5a623"
          : "#34c759"};
`;

const IDot = styled(Dot)<{ $status: string }>`
  color: ${({ $status }) =>
    $status === "todo"
      ? "#2563eb"
      : $status === "progress"
        ? "#f5a623"
        : "#34c759"};
`;

const TotalTask = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ccc;
`;

const TaskList = styled.div`
  display: flex;  
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
`;
