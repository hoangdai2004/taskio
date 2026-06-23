"use client";

import styled from "styled-components";
import { SidebarProject } from "@/types/sidebar.type";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  CheckSquare,
  Users,
  Settings,
  X,
  CalendarDays,
  Folder,
  MoreHorizontal,
} from "lucide-react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  projects: SidebarProject[];
};

const categories = [
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

export default function MobileMenu({ open, onClose, projects }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) onClose(); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onClose]);

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <>
      <Overlay $open={open} onClick={onClose} />
      <Drawer $open={open}>
        <Header>
          <LogoText>TaskFlow</LogoText>
          <CloseBtn onClick={onClose}>
            <X size={24} />
          </CloseBtn>
        </Header>

        <Content>
          {categories.map((category) => (
            <Section key={category.title}>
              <SectionTitle>{category.title}</SectionTitle>
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <div key={item.name}>
                    <Item
                      $active={isActive}
                      onClick={() => handleNavigate(item.href)}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Item>
                  </div>
                );
              })}
            </Section>
          ))}
        </Content>
      </Drawer>
    </>
  );
}

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  transition: 0.3s;
  z-index: 998;
`;

const Drawer = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  color: white;
`;

const Header = styled.div`
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const LogoText = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  margin: 0 0 12px 12px;
  letter-spacing: 1px;
`;

const Item = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "rgba(255,255,255,0.15)" : "transparent")};
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  margin-bottom: 4px;
  transition: 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  span {
    font-size: 15px;
  }
`;

const ProjectList = styled.div`
  margin-left: 24px;
  margin-bottom: 12px;
  border-left: 1px solid rgba(255,255,255,0.1);
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProjectItem = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  background: ${({ $active }) => ($active ? "rgba(255,255,255,0.1)" : "transparent")};

  &:hover {
    background: rgba(255,255,255,0.05);
    color: white;
  }
`;

const ColorDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;