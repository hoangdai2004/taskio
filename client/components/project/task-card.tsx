"use client";

import styled from "styled-components";
import { Task, Priority as PriorityType } from "@/types/project.type";

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", String(task.id));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card draggable onDragStart={handleDragStart}>
      <Priority $type={task.priority}>{task.priority}</Priority>

      <Title>{task.title}</Title>
      <Desc>{task.desc}</Desc>

      <Bottom>
        <Info>
          💬 {task.comments} | 📁 {task.files}
        </Info>

        <Users>
          {task.assignees.map((u) => (
            <Avatar key={u.id} src={u.avatar} alt={u.name} />
          ))}
        </Users>
      </Bottom>
    </Card>
  );
}

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 14px;
  cursor: grab;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);

  &:active {
    cursor: grabbing;
  }
`;

const Title = styled.h4`
  margin: 6px 0;
  font-size: 14px;
`;

const Desc = styled.p`
  font-size: 13px;
  color: #666;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const Info = styled.div`
  font-size: 12px;
  color: #777;
`;

const Users = styled.div`
  display: flex;
`;

const Avatar = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  margin-left: -5px;
  border: 2px solid white;
`;

const Priority = styled.span<{ $type: PriorityType }>`
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;

  background: ${({ $type }) =>
    $type === "high"
      ? "#ffd6d6"
      : $type === "medium"
      ? "#fff0c2"
      : "#e6f5e6"};
`;