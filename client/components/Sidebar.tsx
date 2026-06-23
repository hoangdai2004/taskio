"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import {
  Home,
  MessageSquare,
  CheckSquare,
  CalendarDays,
  Users,
  Settings,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Folder,
  BarChart3,
} from "lucide-react";
import { useMemo, useState } from "react";

import { SidebarProject } from "@/types/sidebar.type";
import { useAuth } from "@/context/AuthContext";

const baseCategories = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Projects", href: "/dashboard/projects", icon: Folder },
      { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
      { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
      { name: "Members", href: "/dashboard/members", icon: Users },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

type Props = {
  projects: SidebarProject[];
};

export default function Sidebar({ projects }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { activeCompanyId, companies } = useAuth();

  const activeCompany = useMemo(() => {
    return companies.find((company) => Number(company.id) === Number(activeCompanyId)) || null;
  }, [companies, activeCompanyId]);

  const isOwnerOrAdmin = activeCompany?.role === "OWNER" || activeCompany?.role === "ADMIN";

  const categories = useMemo(() => {
    return baseCategories.map((cat) => {
      if (cat.title === "MANAGEMENT" && isOwnerOrAdmin) {
        return {
          ...cat,
          items: [
            ...cat.items,
            { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
          ],
        };
      }
      return cat;
    });
  }, [isOwnerOrAdmin]);

  return (
    <Container $collapsed={collapsed}>
      <ToggleButton onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </ToggleButton>

      <Logo>
        {collapsed ? activeCompany?.name.charAt(0) : activeCompany?.name}
      </Logo>

      <ContentSection>
        {categories.map((category) => (
          <Section key={category.title}>
            {!collapsed && <SectionTitle>{category.title}</SectionTitle>}
            <Nav>
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <div key={item.name}>
                    <NavItem $active={isActive} $collapsed={collapsed}>
                      <Link href={item.href}>
                        <Icon size={18} />
                        {!collapsed && <span>{item.name}</span>}
                      </Link>
                    </NavItem>
                  </div>
                );
              })}
            </Nav>
          </Section>
        ))}
      </ContentSection>
    </Container>
  );
}

const Container = styled.aside<{ $collapsed: boolean }>`
  position: relative;
  width: ${(props) => (props.$collapsed ? "80px" : "260px")};
  height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  z-index: 100;

  @media (max-width: 768px) {
    display: none;
  }
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
  z-index: 10;
`;

const Logo = styled.div`
  padding: 24px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ContentSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  &::-webkit-scrollbar {
    width: 4px;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 10px 12px;
  letter-spacing: 0.5px;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavItem = styled.div<{ $active: boolean; $collapsed: boolean }>`
  a {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    justify-content: ${(props) => (props.$collapsed ? "center" : "flex-start")};
    border-radius: 8px;
    text-decoration: none;
    color: white;
    background: ${(props) => (props.$active ? "rgba(255,255,255,0.15)" : "transparent")};
    font-weight: ${(props) => (props.$active ? "600" : "400")};
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

const ProjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  margin-left: 20px;
  padding-left: 10px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProjectItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  background: ${(props) => (props.$active ? "rgba(255,255,255,0.1)" : "transparent")};

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }
`;

const ProjectLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
`;
