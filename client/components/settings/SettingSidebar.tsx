"use client";

import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Settings, Bell, Palette, Building2, Users, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsSidebar() {
  const pathname = usePathname();
  const { companies, activeCompanyId } = useAuth();

  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  const isAdmin = activeCompany?.role === "ADMIN";

  const baseMenus = [
    {
      label: "Profile",
      href: "/dashboard/settings/profile",
      icon: User,
    },
    {
      label: "Account",
      href: "/dashboard/settings/account",
      icon: Settings,
    },
    {
      label: "Notifications",
      href: "/dashboard/settings/notifications",
      icon: Bell,
    },
    {
      label: "Appearance",
      href: "/dashboard/settings/appearance",
      icon: Palette,
    },
  ];

  const adminMenus = [
    {
      label: "Admin Dashboard",
      href: "/dashboard/settings/admin",
      icon: LayoutDashboard,
    },
  ];

  const allMenus = isAdmin ? [...baseMenus, ...adminMenus] : baseMenus;

  return (
    <Sidebar>
      {allMenus.map((menu) => {
        const Icon = menu.icon;

        return (
          <Item
            key={menu.href}
            href={menu.href}
            $active={pathname.startsWith(menu.href)}
          >
            <Icon size={18} />
            {menu.label}
          </Item>
        );
      })}
    </Sidebar>
  );
}

const Sidebar = styled.div`
  width: 220px;
  background: ${({ theme }) => theme.colors.card};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
`;

const Item = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;
  border-radius: 8px;

  margin-bottom: 6px;

  font-size: 14px;
  text-decoration: none;

  background: ${({ $active, theme }) =>
    $active ? theme.colors.primaryLight : "transparent"};

  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};

  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;