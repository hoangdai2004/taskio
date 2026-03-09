"use client";

import styled from "styled-components";

interface Props {
  title: string;
  project: string;
  priority: "High" | "Medium" | "Low";
  date: string;
}

export default function TaskItem({
  title,
  project,
  priority,
  date,
}: Props) {
  return (
    <Card>
      <Left>
        <Checkbox type="checkbox" />

        <Info>
          <TaskTitle>
            {title}
            <ProjectTag>{project}</ProjectTag>
          </TaskTitle>

          <Desc>Build login API</Desc>
        </Info>
      </Left>

      <Right>
        <Date>{date}</Date>
        <Priority priority={priority}>{priority}</Priority>
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

  &:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
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

const Priority = styled.div<{ priority: string }>`
  font-size: 12px;

  padding: 4px 8px;

  border-radius: 6px;

  background: ${({ priority, theme }) =>
    priority === "High"
      ? `${theme.colors.danger}20`
      : priority === "Medium"
      ? `${theme.colors.warning}20`
      : `${theme.colors.success}20`};

  color: ${({ priority, theme }) =>
    priority === "High"
      ? theme.colors.danger
      : priority === "Medium"
      ? theme.colors.warning
      : theme.colors.success};
`;

const Avatar = styled.div`
  width: 32px;

  height: 32px;

  border-radius: 50%;

  background: ${({ theme }) => theme.colors.borderLight};
`;