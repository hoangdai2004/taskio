"use client";

import { useState } from "react";
import styled from "styled-components";
import ProjectMembers from "@/components/members/project-members";
import { LogOut } from "lucide-react";

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

const projects: Project[] = [
  {
    id: 1,
    name: "Mobile App",
    members: [
      { id: 1, name: "John", avatar: "/avatar1.png" },
      { id: 2, name: "Anna", avatar: "/avatar2.png" },
      { id: 3, name: "David", avatar: "/avatar3.png" },
    ],
  },
  {
    id: 2,
    name: "Website Redesign",
    members: [
      { id: 1, name: "John", avatar: "/avatar1.png" },
      { id: 2, name: "Anna", avatar: "/avatar2.png" },
      { id: 3, name: "David", avatar: "/avatar3.png" },
      { id: 4, name: "Lisa", avatar: "/avatar4.png" },
    ],
  },
];

export default function MembersPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <Container>
      <Header>Members</Header>

      {!selectedProject && (
        <ProjectList>
          {projects.map((project) => (
            <ProjectCard key={project.id}>
              <Info>
                <h3>{project.name}</h3>

                <Avatars>
                  {project.members.slice(0, 4).map((m) => (
                    <img key={m.id} src={m.avatar} />
                  ))}
                  <span>{project.members.length} members</span>
                </Avatars>
              </Info>

              <OpenBtn onClick={() => setSelectedProject(project)}>
                <LogOut size={16}/>
              </OpenBtn>
            </ProjectCard>
          ))}
        </ProjectList>
      )}

      {selectedProject && (
        <ProjectMembers
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 30px;

  background: ${({ theme }) => theme.colors.background};

  min-height: 100vh;
`;

const Header = styled.h1`
  font-size: 24px;

  margin-bottom: 20px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProjectList = styled.div`
  display: flex;

  flex-direction: column;

  gap: 16px;
`;

const ProjectCard = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 18px;

  border-radius: 12px;

  background: ${({ theme }) => theme.colors.card};

  border: 1px solid ${({ theme }) => theme.colors.border};

  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  }
`;

const Info = styled.div`
  h3 {
    margin-bottom: 6px;

    font-size: 16px;

    font-weight: 600;

    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Avatars = styled.div`
  display: flex;

  align-items: center;

  gap: 6px;

  img {
    width: 28px;

    height: 28px;

    border-radius: 50%;

    border: 2px solid ${({ theme }) => theme.colors.card};
  }

  span {
    margin-left: 10px;

    font-size: 14px;

    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const OpenBtn = styled.button`
  border: none;

  background: none;

  color: ${({ theme }) => theme.colors.primary};

  cursor: pointer;

  font-weight: 500;

  font-size: 14px;

  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;