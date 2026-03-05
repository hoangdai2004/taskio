"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import {
  Home,
  MessageSquare,
  CheckSquare,
  Users,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IProject } from "@/types/sidebar.type";

const menu = [
  { name: "Home", href: "/", icon: Home },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Members", href: "/members", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

const projects = [
  { name: "Mobile App", color: "#22c55e" },
  { name: "Website Redesign", color: "#eab308" },
  { name: "Design System", color: "#a855f7" },
  { name: "Wireframes", color: "#3b82f6" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [project, setProject] = useState<IProject[]>([]);

  useEffect (() => {

  }, [])

  return (
    <Container>
      <Logo>
        <h1>Taskio</h1>
      </Logo>
      <TopSection>
        <Nav>
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <NavItem key={item.name} $active={isActive}>
                <Link href={item.href}>
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </NavItem>
            );
          })}
        </Nav>

        <ProjectSection>
          <Title>MY PROJECTS</Title>

          {projects.map((project) => (
            <ProjectItem key={project.name}>
              <ProjectLeft>
                <ColorDot style={{ background: project.color }} />
                <span>{project.name}</span>
              </ProjectLeft>
              <MoreHorizontal size={16} />
            </ProjectItem>
          ))}
        </ProjectSection>
        <BottomCard>
          <LightBulb>💡</LightBulb>
          <h4>Thoughts Time</h4>
          <p>
            We don’t have any notice for you, till then you can share your
            thoughts with your peers.
          </p>
          <button>Write a message</button>
        </BottomCard>
      </TopSection>
    </Container>
  );
}

const Container = styled.aside`
  width: 260px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
`;

const TopSection = styled.div`
  padding: 16px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  padding: 24px;
  color: #333;
  border-bottom: 1px solid #ccc;

  h1 {
    font-size: 18px;
    font-weight: 600;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #ccc;
`;

const NavItem = styled.div<{ $active: boolean }>`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    font-size: 14px;
    text-decoration: none;
    color: ${({ $active }) => ($active ? "#7c3aed" : "#333")};
    background: ${({ $active }) =>
      $active ? "rgba(124, 58, 237, 0.08)" : "transparent"};
    font-weight: ${({ $active }) => ($active ? 500 : 400)};
    transition: 0.2s;
  }

  a:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const ProjectSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
`;

const Title = styled.p`
  font-size: 12px;
  color: #333;
  margin-bottom: 12px;
`;

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const ProjectLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

const BottomCard = styled.div`
  background: #f5f5f5;
  padding: 18px;
  border-radius: 14px;
  text-align: center;

  h4 {
    margin: 10px 0 6px;
    font-size: 14px;
    color: #333;
    font-weight: 600;
  }

  p {
    font-size: 12px;
    color: #ccc;
    margin-bottom: 12px;
  }

  button {
    background: #fff;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    color: #333;
    cursor: pointer;
    transition: 0.2s;
  }

  button:hover {
    background: #2563eb;
    color: white;
  }
`;

const LightBulb = styled.div`
  font-size: 22px;
  padding: 4px;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  margin: auto;
  background-color: #f5f4e8;
`;
