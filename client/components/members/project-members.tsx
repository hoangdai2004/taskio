"use client";

import styled from "styled-components";
import { ChevronLeft } from "lucide-react";

interface Member {
  id: number;
  name: string;
  avatar: string;
}

interface Project {
  id: number;
  name: string;
  members: Member[];
}

export default function ProjectMembers({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  return (
    <Wrapper>
      <Top>
        <Back onClick={onBack}><ChevronLeft size={16}/></Back>
        <h2>{project.name} Members</h2>
      </Top>

      <MemberList>
        {project.members.map((member) => (
          <MemberCard key={member.id}>
            <img src={member.avatar} />
            <span>{member.name}</span>
          </MemberCard>
        ))}
      </MemberList>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-top: 20px;
`;

const Top = styled.div`
  display: flex;

  align-items: center;

  gap: 20px;

  margin-bottom: 20px;

  h2 {
    color: ${({ theme }) => theme.colors.textPrimary};

    font-size: 20px;

    font-weight: 600;
  }
`;

const Back = styled.button`
  border: none;

  background: none;

  cursor: pointer;

  color: ${({ theme }) => theme.colors.primary};

  font-size: 14px;

  font-weight: 500;

  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const MemberList = styled.div`
  display: grid;

  grid-template-columns: repeat(auto-fill, 180px);

  gap: 16px;
`;

const MemberCard = styled.div`
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 12px;

  border-radius: 10px;

  background: ${({ theme }) => theme.colors.card};

  border: 1px solid ${({ theme }) => theme.colors.border};

  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0,0,0,0.05);
  }

  span {
    color: ${({ theme }) => theme.colors.textPrimary};

    font-size: 14px;

    font-weight: 500;
  }

  img {
    width: 36px;

    height: 36px;

    border-radius: 50%;

    border: 2px solid ${({ theme }) => theme.colors.borderLight};
  }
`;