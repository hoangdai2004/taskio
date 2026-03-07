"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { Task, Status } from "@/types/project.type";
import Column from "./column";
import { columns } from "@/constants/columns";

interface Props {
  tasks: Task[];
}

export default function ProjectBoard({ tasks }: Props) {
  const [taskList, setTaskList] = useState<Task[]>([]);

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  const handleDrop = (taskId: number, newStatus: Status) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );
  };

  return (
    <Board>
      {columns.map((col) => (
        <Column
          key={col.id}
          column={col}
          tasks={taskList}
          onDropTask={handleDrop}
        />
      ))}
    </Board>
  );
}

const Board = styled.div`
  display: flex;

  gap: 20px;

  padding: 20px;

  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};

    border-radius: 6px;
  }
`;