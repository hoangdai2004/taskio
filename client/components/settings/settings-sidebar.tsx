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
  background: white;
  border-right: 1px solid #eee;
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

  background: ${(p) => (p.active ? "#eef3ff" : "transparent")};
  color: ${(p) => (p.active ? "#3b82f6" : "#555")};

  &:hover {
    background: #f3f4f6;
  }
`;