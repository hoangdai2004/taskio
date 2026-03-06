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
  background: white;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  border: 1px solid #eee;
  transition: 0.2s;

  &:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  }
`;

const Left = styled.div`
  display: flex;
  gap: 12px;
`;

const Checkbox = styled.input`
  width: 18px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
`;

const TaskTitle = styled.div`
  font-weight: 600;
  font-size: 15px;
`;

const ProjectTag = styled.span`
  margin-left: 10px;
  font-size: 12px;
  background: #eef0ff;
  padding: 3px 8px;
  border-radius: 6px;
`;

const Desc = styled.div`
  font-size: 13px;
  color: #777;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Date = styled.div`
  font-size: 13px;
  color: #777;
`;

const Priority = styled.div<{ priority: string }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;

  background: ${({ priority }) =>
    priority === "High"
      ? "#ffe5e5"
      : priority === "Medium"
      ? "#fff4db"
      : "#e6f7ed"};

  color: ${({ priority }) =>
    priority === "High"
      ? "#e03131"
      : priority === "Medium"
      ? "#d97706"
      : "#2f9e44"};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
`;