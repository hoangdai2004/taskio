"use client";

import styled from "styled-components";

interface Props {
  code: string;
  title: string;
  project: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  date: string;
  description?: string;
  onClick?: () => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export default function TaskItem({
  code,
  title,
  project,
  priority,
  date,
  description,
  onClick,
  selected = false,
  onSelect,
}: Props) {
  const label =
    priority === "HIGH"
      ? "High"
      : priority === "MEDIUM"
      ? "Medium"
      : "Low";

  return (
    <Card onClick={onClick}>
      <Left>
        <Checkbox 
          type="checkbox" 
          checked={selected}
          onChange={(e) => onSelect?.(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />

        <Info>
          <TaskTitle>
            {code}-{title}
            <ProjectTag>{project}</ProjectTag>
          </TaskTitle>

          <Desc>{description || "No description"}</Desc>
        </Info>
      </Left>

      <Right>
        <Date>{date}</Date>
        <Priority $priority={priority}>{label}</Priority>
        <Avatar />
      </Right>
    </Card>
  );
}

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};

  border-radius: 12px;

  padding: 16px 18px;

  display: flex;

  justify-content: space-between;

  border: 1px solid ${({ theme }) => theme.colors.border};

  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
    transform: translateY(-2px);
  }
`;

const Left = styled.div`
  display: flex;

  gap: 12px;

  align-items: flex-start;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;

  margin-top: 2px;

  cursor: pointer;
`;

const Info = styled.div`
  display: flex;

  flex-direction: column;
`;

const TaskTitle = styled.div`
  font-weight: 600;

  font-size: 15px;

  color: ${({ theme }) => theme.colors.textPrimary};

  display: flex;

  align-items: center;

  gap: 10px;
`;

const ProjectTag = styled.span`
  font-size: 12px;

  background: ${({ theme }) => theme.colors.primaryLight};

  color: ${({ theme }) => theme.colors.primary};

  padding: 3px 8px;

  border-radius: 6px;
`;

const Desc = styled.div`
  font-size: 13px;

  color: ${({ theme }) => theme.colors.textMuted};
`;

const Right = styled.div`
  display: flex;

  align-items: center;

  gap: 14px;
`;

const Date = styled.div`
  font-size: 13px;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Priority = styled.div<{ $priority: string }>`
  font-size: 12px;

  padding: 4px 8px;

  border-radius: 6px;

  color: ${({ $priority, theme }) =>
    $priority === "HIGH"
      ? theme.colors.warning
      : $priority === "MEDIUM"
      ? theme.colors.primary
      : theme.colors.success};
  background: ${({ $priority, theme }) =>
    $priority === "HIGH"
      ? "rgba(245, 158, 11, 0.1)"
      : $priority === "MEDIUM"
      ? "rgba(99, 102, 241, 0.1)"
      : "rgba(34, 197, 94, 0.1)"};
`;

const Avatar = styled.div`
  width: 32px;

  height: 32px;

  border-radius: 50%;

  background: ${({ theme }) => theme.colors.borderLight};
`;
