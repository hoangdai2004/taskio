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
          <input placeholder="Search..." />
        </SearchBox>
      </Left>

      <Right>
        <Icon>
          <CalendarDays size={20} />
        </Icon>

        <Icon>
          <MessageSquare size={20} />
        </Icon>

        <Icon>
          <Bell size={20} />
        </Icon>

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
  height: 76px;
  background: white;
  border-bottom: 1px solid #ccc;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 30px;
`;

const Left = styled.div`
  flex: 1;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
`;

const SearchBox = styled.div`
  width: 350px;
  display: flex;
  align-items: center;
  gap: 10px;

  background: #f3f4f6;
  padding: 10px 14px;
  border-radius: 8px;

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
  }
`;

const Icon = styled.div`
  cursor: pointer;

  &:hover {
    color: #2563eb;
  }
`;

const UserWrapper = styled.div`
  position: relative;
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Avatar = styled.div`
  border-radius: 50%;
  overflow: hidden;
`;

const UserMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;

  width: 180px;
  background: white;
  border-radius: 10px;

  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  padding: 6px;

  z-index: 10;
`;

const MenuItem = styled.div<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;
  font-size: 14px;
  border-radius: 6px;

  cursor: pointer;

  color: ${(p) => (p.$danger ? "#ef4444" : "#333")};

  &:hover {
    background: #f3f4f6;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 6px 0;
`;