"use client";

import styled from "styled-components";
import { Column as ColumnType, Task, Status } from "@/types/project.type";
import TaskCard from "./task-card";

interface Props {
  column: ColumnType;
  tasks: Task[];
  onDropTask: (taskId: number, status: Status) => void;
}

export default function Column({ column, tasks, onDropTask }: Props) {
  const columnTasks = tasks.filter(
    (task) => task.status === column.id
  );

  const handleDrop = (e: React.DragEvent) => {
    const taskId = Number(e.dataTransfer.getData("taskId"));
    onDropTask(taskId, column.id);
  };

  return (
    <Wrapper
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Header>
        {column.title} ({columnTasks.length})
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
  background: #f4f5f7;
  padding: 16px;
  border-radius: 12px;
`;

const Header = styled.h3`
  margin-bottom: 12px;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;