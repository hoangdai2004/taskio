"use client";

import styled from "styled-components";
import { Project } from "@/types/project.type";

interface Props {
  project: Project;
}

export default function ProjectHeader({ project }: Props) {
  return (
    <Wrapper>
      <Left>
        <Title>{project.name}</Title>
        <Members>
          {project.members.map((m) => (
            <Avatar key={m.id} src={m.avatar} />
          ))}
        </Members>
      </Left>

      <Right>
        <Btn>Share</Btn>
        <Btn primary>New Task</Btn>
      </Right>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 70px;
  padding: 0 24px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #eee;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
`;

const Members = styled.div`
  display: flex;
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-left: -8px;
  border: 2px solid white;
`;

const Right = styled.div`
  display: flex;
  gap: 12px;
`;

const Btn = styled.button<{ primary?: boolean }>`
  padding: 8px 14px;
  border-radius: 8px;
  border: none;

  background: ${(p) => (p.primary ? "#4f46e5" : "#eee")};
  color: ${(p) => (p.primary ? "white" : "#333")};

  cursor: pointer;
`;