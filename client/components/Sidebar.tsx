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
import { SidebarProject } from "@/types/sidebar.type";
import { getProject } from "@/lib/services/project.service";

const menu = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const mockProjects: SidebarProject[] = [
  { id: 1, name: "Mobile App", slug: "mobile-app", color: "#22c55e" },
  { id: 2, name: "Website Redesign", slug: "website-redesign", color: "#eab308" },
  { id: 3, name: "Design System", slug: "design-system", color: "#a855f7" },
  { id: 4, name: "Wireframes", slug: "wireframes", color: "#3b82f6" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // const fetchProject = async () => {
    //   try {
    //     const response = await getProject();
    //     setProjects(mockProjects);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    // fetchProject();
    setProjects(mockProjects);
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
              {projects.map((project) => {
                const href = `/dashboard/projects/${project.slug}`;
                const isActive = pathname === href;

                return (
                  <Link key={project.id} href={href}>
                    <ProjectItem $active={isActive}>
                      <ProjectLeft>
                        <ColorDot style={{ background: project.color }} />
                        <span>{project.name}</span>
                      </ProjectLeft>

                      <MoreHorizontal size={16} />
                    </ProjectItem>
                  </Link>
                );
              })}
            </ProjectList>
          </ProjectSection>
        )}

        {!collapsed && (
          <BottomCard>
            <LightBulb>💡</LightBulb>
            <h4>Thoughts Time</h4>
            <p>Share ideas with your teammates.</p>
            <button>Write message</button>
          </BottomCard>
        )}
      </TopSection>
    </Container>
  );
}

const Container = styled.aside<{ $collapsed: boolean }>`
  width: ${(props) => (props.$collapsed ? "80px" : "260px")};
  height: 100vh;

  background: linear-gradient(180deg, #1e3a8a, #1e40af);

  color: white; 

  display: flex;
  flex-direction: column;

  position: relative;

  transition: width 0.25s ease;
`;

const ToggleButton = styled.button`
  position: absolute;

  top: 22px;
  right: 10px;

  width: 26px;
  height: 26px;

  border-radius: 6px;

  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.primaryHover};

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  padding: 24px;

  font-size: 18px;
  font-weight: 700;

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const NavItem = styled.div<{ $active: boolean }>`
  a {
    display: flex;
    align-items: center;

    gap: 12px;

    padding: 10px 12px;

    border-radius: 8px;

    text-decoration: none;

    color: white;

    background: ${({ $active }) =>
      $active ? "rgba(255,255,255,0.15)" : "transparent"};
  }

  a:hover {
    background: rgba(255, 255, 255, 0.1);
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

  color: rgba(255, 255, 255, 0.6);

  margin-bottom: 10px;
`;

const ProjectList = styled.div`
  flex: 1;

  overflow-y: auto;

  display: flex;
  flex-direction: column;

  gap: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
`;

const ProjectItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;

  justify-content: space-between;

  padding: 8px 10px;

  border-radius: 6px;

  font-size: 14px;

  cursor: pointer;

  background: ${({ $active }) =>
    $active ? "rgba(255,255,255,0.15)" : "transparent"};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
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
  background: rgba(255, 255, 255, 0.1);

  padding: 16px;

  border-radius: 12px;

  text-align: center;

  margin-top: auto;

  h4 {
    margin: 8px 0 4px;

    font-size: 14px;
  }

  p {
    font-size: 12px;

    color: rgba(255, 255, 255, 0.7);

    margin-bottom: 10px;
  }

  button {
    background: ${({ theme }) => theme.colors.card};

    color: ${({ theme }) => theme.colors.primaryHover};

    padding: 6px 12px;

    border-radius: 6px;

    font-size: 12px;

    cursor: pointer;
  }
`;

const LightBulb = styled.div`
  width: 44px;
  height: 44px;

  border-radius: 50%;

  font-size: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto;

  background: rgba(255, 255, 255, 0.2);
`;