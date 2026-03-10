'use client'

import styled from "styled-components";
import { User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export const UserMenuDropdown = () => {
  const router = useRouter()

  return (
    <UserMenu>
      <MenuItem onClick={() => router.push('/dashboard/settings')}>
        <User size={16} />
        Profile
      </MenuItem>

      {/* <MenuItem onClick={() => router.push('/dashboard/settings')}>
        <Settings size={16} />
        Settings
      </MenuItem> */}

      <Divider />

      <MenuItem $danger onClick={() => router.replace("/auth/signin")}>
        <LogOut size={16}/>
        Sign out
      </MenuItem>
    </UserMenu>
  );
};

const UserMenu = styled.div`
  position: absolute;

  top: 50px;
  right: 0;

  width: 200px;

  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textSecondary};

  border-radius: 10px;

  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);

  padding: 6px;

  z-index: 100;
`;

const MenuItem = styled.div<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;

  border-radius: 6px;

  font-size: 14px;
  cursor: pointer;

  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.danger : theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 6px 0;
`;
