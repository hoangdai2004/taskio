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
  ChevronLeft,
  ChevronRight,
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

const mockProjects: IProject[] = [
  { id: "1", name: "Mobile App", color: "#22c55e", href: "/dashboard/project/1" },
  { id: "2", name: "Website Redesign", color: "#eab308", href: "/project/2" },
  { id: "3", name: "Design System", color: "#a855f7", href: "/projects/3" },
  { id: "4", name: "Wireframes", color: "#3b82f6", href: "/projects/4" },
  { id: "5", name: "AAA", color: "#f43f5e", href: "/projects/5" },
  { id: "6", name: "BBB", color: "#0ea5e9", href: "/projects/6" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // const response = await getProject();
        setProjects(mockProjects);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProject();
  }, []);

  return (
    <Container $collapsed={collapsed}>
      <ToggleButton onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </ToggleButton>

      <Logo>{collapsed ? "T" : "Taskio"}</Logo>

      <TopSection>

        <Nav>
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <NavItem key={item.name} $active={isActive}>
                <Link href={item.href}>
                  <Icon size={18} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </NavItem>
            );
          })}
        </Nav>

        {!collapsed && (
          <ProjectSection>
            <Title>MY PROJECTS</Title>

            <ProjectList>
              {projects.map((project) => (
                <Link key={project.id} href={project.href}>
                  <ProjectItem>
                    <ProjectLeft>
                      <ColorDot style={{ background: project.color }} />
                      <span>{project.name}</span>
                    </ProjectLeft>

                    <MoreHorizontal size={16} />
                  </ProjectItem>
                </Link>
              ))}
            </ProjectList>
          </ProjectSection>
        )}

        {!collapsed && (
          <BottomCard>
            <LightBulb>💡</LightBulb>
            <h4>Thoughts Time</h4>
            <p>
              We don’t have any notice for you, till then you can share your
              thoughts with your peers.
            </p>
            <button>Write a message</button>
          </BottomCard>
        )}
      </TopSection>
    </Container>
  );
}

const Container = styled.aside<{ $collapsed: boolean }>`
  width: ${(props) => (props.$collapsed ? "80px" : "260px")};
  height: 100vh;
  background: white;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.25s ease;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 22px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.div`
  padding: 24px;
  font-size: 18px;
  font-weight: 600;
  color: #000;
  border-bottom: 1px solid #ccc;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  min-height: 0;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

const NavItem = styled.div<{ $active: boolean }>`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    font-size: 14px;
    border-radius: 6px;
    text-decoration: none;

    color: ${({ $active }) => ($active ? "#7c3aed" : "#333")};
    background: ${({ $active }) =>
      $active ? "rgba(124,58,237,0.08)" : "transparent"};
  }

  a:hover {
    background: #f5f5f5;
  }
`;

const ProjectSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const Title = styled.p`
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
`;

const ProjectList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #000;

  &::-webkit-scrollbar {
    width: 0px;
  }

  scrollbar-width: none;
`;

const ProjectItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

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
  margin-top: auto;

  h4 {
    margin: 10px 0 6px;
    font-size: 14px;
  }

  p {
    font-size: 12px;
    color: #888;
    margin-bottom: 12px;
  }

  button {
    background: white;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
  }

  button:hover {
    background: #2563eb;
    color: white;
  }
`;

const LightBulb = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 6px;
  background: #f5f4e8;
`;
