"use client";

import styled from "styled-components";
import {
  Search,
  CalendarDays,
  MessageSquare,
  Bell,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import CalendarDropdown from "./header/CalendarDropDown";
import { UserMenuDropdown } from "./header/UserMenuDropdown";
import NotificationsDropdown from "./header/NotificationDropdown";
import MessagesDropdown from "./header/MessagesDropdown";

type DropdownType = "calendar" | "messages" | "notifications" | "user" | null;

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggle = (type: DropdownType) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <Left>
        <SearchBox>
          <Search size={18} />
          <input placeholder="Search tasks, projects..." />
        </SearchBox>
      </Left>

      <Right>
        <IconWrapper>
          <IconButton onClick={() => toggle("calendar")}>
            <CalendarDays size={20} />
          </IconButton>

          {openDropdown === "calendar" && (
            <CalendarDropdown
              events={[
                { time: "10:00", title: "Design meeting" },
                { time: "14:00", title: "Sprint planning" },
              ]}
            />
          )}
        </IconWrapper>

        <IconWrapper>
          <IconButton onClick={() => toggle("messages")}>
            <MessageSquare size={20} />
          </IconButton>

          {openDropdown === "messages" && <MessagesDropdown />}
        </IconWrapper>

        <IconWrapper>
          <IconButton onClick={() => toggle("notifications")}>
            <Bell size={20} />
          </IconButton>

          {openDropdown === "notifications" && <NotificationsDropdown />}
        </IconWrapper>

        <UserWrapper>
          <UserBox onClick={() => toggle("user")}>
            <Avatar>
              <Image
                src="/images/avatar.jpg"
                alt="avatar"
                width={36}
                height={36}
              />
            </Avatar>

            <div>
              <UserName>Dai Hoang</UserName>
              <Location>Viet Nam</Location>
            </div>

            <ChevronDown size={16} />
          </UserBox>

          {openDropdown === "user" && <UserMenuDropdown />}
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

  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const IconWrapper = styled.div`
  position: relative;
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
    background: rgba(255, 255, 255, 0.2);
  }
`;

const SearchBox = styled.div`
  width: 340px;

  display: flex;
  align-items: center;
  gap: 10px;

  background: rgba(255, 255, 255, 0.15);
  padding: 10px 14px;

  border-radius: 10px;

  input {
    border: none;
    outline: none;
    background: transparent;

    width: 100%;
    color: white;

    ::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
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

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const Location = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;
