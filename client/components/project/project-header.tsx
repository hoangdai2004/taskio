"use client";

import styled from "styled-components";
import { Project } from "@/types/project.type";
import {
  Pencil,
  Link2,
  Filter,
  Calendar,
  Plus,
  Share2,
  LayoutGrid,
  MoreHorizontal,
} from "lucide-react";

interface Props {
  project: Project;
}

export default function ProjectHeader({ project }: Props) {
  return (
    <Wrapper>
      <Top>
        <Left>
          <Title>{project.name}</Title>

          <IconBtn>
            <Pencil size={16} />
          </IconBtn>

          <IconBtn>
            <Link2 size={16} />
          </IconBtn>
        </Left>

        <Right>
          <Invite>
            <Plus size={14} />
            Invite
          </Invite>

          <Members>
            {project.members.map((m) => (
              <Avatar key={m.id} src={m.avatar} />
            ))}
          </Members>
        </Right>
      </Top>

      <Bottom>
        <Left>
          <Button>
            <Filter size={14} />
            Filter
          </Button>

          <Button>
            <Calendar size={14} />
            Today
          </Button>
        </Left>

        <Right>
          <Button>
            <Share2 size={14} />
            Share
          </Button>

          <Divider />

          <IconSquare>
            <LayoutGrid size={16} />
          </IconSquare>

          <IconBtn>
            <MoreHorizontal size={16} />
          </IconBtn>
        </Right>
      </Bottom>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px 24px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const IconBtn = styled.div`
  width: 28px;
  height: 28px;

  background: ${({ theme }) => theme.colors.borderLight};

  color: ${({ theme }) => theme.colors.primary};

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

const Invite = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;

  background: transparent;
  border: none;

  font-weight: 500;

  color: ${({ theme }) => theme.colors.primary};

  cursor: pointer;
`;

const Members = styled.div`
  display: flex;
`;

const Avatar = styled.img`
  width: 30px;
  height: 30px;

  border-radius: 50%;

  border: 2px solid ${({ theme }) => theme.colors.card};

  margin-left: -6px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;

  background: ${({ theme }) => theme.colors.card};

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 8px;

  padding: 6px 12px;

  font-size: 13px;

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;

  background: ${({ theme }) => theme.colors.border};
`;

const IconSquare = styled.div`
  width: 32px;
  height: 32px;

  background: ${({ theme }) => theme.colors.primary};

  color: white;

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;
`;