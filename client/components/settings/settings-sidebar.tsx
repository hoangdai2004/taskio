"use client";

import styled from "styled-components";
import { User, Bell, Settings, Globe, Palette } from "lucide-react";

export default function SettingsSidebar() {
  return (
    <Sidebar>
      <Item active>
        <User size={18} />
        Profile
      </Item>

      <Item>
        <Settings size={18} />
        Account
      </Item>

      <Item>
        <Bell size={18} />
        Notifications
      </Item>

      <Item>
        <Palette size={18} />
        Appearance
      </Item>

      <Item>
        <Globe size={18} />
        Language
      </Item>
    </Sidebar>
  );
}

const Sidebar = styled.div`
  width: 240px;

  background: ${({ theme }) => theme.colors.card};

  border-right: 1px solid ${({ theme }) => theme.colors.border};

  padding: 20px;
`;

const Item = styled.div<{ active?: boolean }>`
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 10px 12px;

  border-radius: 8px;

  margin-bottom: 6px;

  font-size: 14px;

  cursor: pointer;

  transition: all 0.2s ease;

  background: ${({ active, theme }) =>
    active ? theme.colors.primaryLight : "transparent"};

  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }

  svg {
    color: ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.textMuted};
  }
`;