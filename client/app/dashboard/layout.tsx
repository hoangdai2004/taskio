"use client";

import styled from "styled-components";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import MobileMenu from "../../components/sidebar/MenuMobile";
import FloatingChat from "../../components/messages/FloatingChat";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProject } from "@/types/sidebar.type";
import { getProjects } from "@/lib/services/projects.service";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const { user, activeCompanyId, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isMessagesPage = pathname?.startsWith("/dashboard/messages");

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!activeCompanyId) {
      setProjects([]);
      return;
    }

    const loadProjects = async () => {
      try {
        const { projects } = await getProjects(activeCompanyId);
        setProjects(projects);
      } catch (err) {
        console.error("Failed to load sidebar projects:", err);
        setProjects([]);
      }
    };

    loadProjects();
  }, [activeCompanyId]);

  return (
    <Wrapper>
      <Sidebar projects={projects} />

      <MobileMenu
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        projects={projects}
      />

      <RightSection>
        <Header onOpenMenu={() => setOpenMenu(true)} />
        <Main>{children}</Main>
      </RightSection>

      {!isMessagesPage && <FloatingChat />}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;

  background: ${({ theme }) => theme.colors.background};
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;

  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};

  overflow-y: auto;
`;