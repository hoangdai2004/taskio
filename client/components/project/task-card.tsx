"use client";

import styled from "styled-components";
import { Task, Priority as PriorityType } from "@/types/project.type";
import { MessageSquareMore, FileMinus, Ellipsis } from "lucide-react";

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
      <Header>
        <Priority $type={task.priority}>{task.priority}</Priority>
        <IconEllipsis />
      </Header>

      <Title>{task.title}</Title>
      <Desc>{task.desc}</Desc>

      <Bottom>
        <Users>
          {task.assignees.map((u) => (
            <Avatar key={u.id} src={u.avatar} alt={u.name} />
          ))}
        </Users>

        <Info>
          <Item>
            <IconMessage />
            {task.comments}
          </Item>

          <Item>
            <IconFile />
            {task.files}
          </Item>
        </Info>
      </Bottom>
    </Card>
  );
}

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const IconEllipsis = styled(Ellipsis)`
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};

  border-radius: 6px;

  padding: 14px;

  cursor: grab;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  border: 1px solid ${({ theme }) => theme.colors.border};

  &:active {
    cursor: grabbing;
  }
`;

const Title = styled.h4`
  color: ${({ theme }) => theme.colors.textPrimary};

  margin: 6px 0;

  font-size: 14px;
`;

const Desc = styled.p`
  font-size: 13px;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Bottom = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-top: 12px;
`;

const Info = styled.div`
  display: flex;

  gap: 12px;

  font-size: 12px;

  color: ${({ theme }) => theme.colors.textMuted};
`;

const Item = styled.div`
  display: flex;

  align-items: center;

  gap: 4px;
`;

const IconMessage = styled(MessageSquareMore)`
  width: 14px;
  height: 14px;
`;

const IconFile = styled(FileMinus)`
  width: 14px;
  height: 14px;
`;

const Users = styled.div`
  display: flex;
`;

const Avatar = styled.img`
  width: 22px;
  height: 22px;

  border-radius: 50%;

  margin-left: -5px;

  border: 2px solid ${({ theme }) => theme.colors.card};
`;

const Priority = styled.span<{ $type: PriorityType }>`
  font-size: 11px;

  padding: 3px 8px;

  border-radius: 6px;

  color: ${({ $type }) =>
    $type === "high" ? "#d92d20" : $type === "medium" ? "#b54708" : "#067647"};

  background: ${({ $type }) =>
    $type === "high" ? "#ffe4e4" : $type === "medium" ? "#fff3d6" : "#e8f8ef"};
`;