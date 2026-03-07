"use client";

import styled from "styled-components";
import {
  Search,
  CalendarDays,
  MessageSquare,
  Bell,
  ChevronDown,
  Settings,
  CheckSquare,
  LogOut,
  User
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Wrapper>
      <Left>
        <SearchBox>
          <Search size={18} />
          <input placeholder="Search tasks, projects..." />
        </SearchBox>
      </Left>

      <Right>
        <IconButton>
          <CalendarDays size={20} />
        </IconButton>

        <IconButton>
          <MessageSquare size={20} />
        </IconButton>

        <IconButton>
          <Bell size={20} />
        </IconButton>

        <UserWrapper ref={menuRef}>
          <UserBox onClick={() => setOpenMenu(!openMenu)}>
            <Avatar>
              <Image
                src="/images/avatar.jpg"
                alt="avatar"
                width={36}
                height={36}
              />
            </Avatar>

            <ChevronDown size={16} />
          </UserBox>

          {openMenu && (
            <UserMenu>
              <MenuItem>
                <User size={16} />
                Profile
              </MenuItem>

              <MenuItem>
                <Settings size={16} />
                Settings
              </MenuItem>

              <MenuItem>
                <CheckSquare size={16} />
                My Tasks
              </MenuItem>

              <Divider />

              <MenuItem $danger>
                <LogOut size={16} />
                Sign out
              </MenuItem>
            </UserMenu>
          )}
        </UserWrapper>
      </Right>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  height: 77px;

  background: linear-gradient(90deg, #1e3a8a, #1e40af);

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 32px;

  color: white;

  border-bottom: 1px solid rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const SearchBox = styled.div`
  width: 340px;

  display: flex;
  align-items: center;
  gap: 10px;

  background: rgba(255,255,255,0.15);

  padding: 10px 14px;

  border-radius: 10px;

  backdrop-filter: blur(8px);

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;

    font-size: 14px;
    color: white;

    ::placeholder {
      color: rgba(255,255,255,0.7);
    }
  }
`;

const IconButton = styled.div`
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const UserWrapper = styled.div`
  position: relative;
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 4px 6px;

  border-radius: 8px;

  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const Avatar = styled.div`
  border-radius: 50%;
  overflow: hidden;
`;

const UserMenu = styled.div`
  position: absolute;

  top: 50px;
  right: 0;

  width: 200px;

  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textSecondary};

  border-radius: 10px;

  box-shadow: 0 12px 30px rgba(0,0,0,0.15);

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