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
import { useState, useEffect } from "react";
import { IUser, INotification, ISearchResult } from "@/types/header.type";
import {
  getNotifications,
  getUserInfo,
  search,
} from "@/lib/services/header.service";

export default function Header() {
  const [user, setUser] = useState<IUser | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [keyword, setKeyword] = useState<string>("");

  useEffect(() => {
    const getHeaderData = async () => {
      try {
        const [userData, notificationData] = await Promise.all([
          getUserInfo(),
          getNotifications(),
        ]);

        setUser(userData);
        setNotifications(notificationData);
      } catch (error) {
        console.error("Error fetching header data:", error);
      }
    };

    getHeaderData();
  }, []);

  useEffect(() => {
    const trimmed = keyword.trim();

    if (!trimmed) return;

    const delay = setTimeout(async () => {
      try {
        const data = await search(trimmed);
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [keyword]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Wrapper>
      <Left>
        <SearchBox>
          <Search size={18} />
          <input
            placeholder="Search for anything..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </SearchBox>

        {results.length > 0 && (
          <SearchDropdown>
            {results.map((item) => (
              <SearchItem key={item.id}>{item.title}</SearchItem>
            ))}
          </SearchDropdown>
        )}
      </Left>

      <Right>
        <Icon>
          <CalendarDays size={20} />
        </Icon>

        <Icon>
          <MessageSquare size={20} />
        </Icon>

        <Icon style={{ position: "relative" }}>
          <Bell size={20} />
          {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
        </Icon>

        <User>
          <UserInfo>
            <Name>{user?.name ?? "Guest"}</Name>
            <Location>{user?.location ?? "India"}</Location>
          </UserInfo>

          <Avatar>
            <Image
              src={user?.avatar || "/images/avatar.jpg"}
              alt="avatar"
              width={36}
              height={36}
            />
          </Avatar>

          <ChevronDown size={16} />
        </User>
      </Right>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  width: 100%;
  height: 76px;
  padding: 0 2rem;
  background: #fff;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  flex: 1;
  position: relative;
`;

const SearchBox = styled.div`
  width: 420px;
  max-width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #333;
  background: #f5f5f5;
  padding: 0.8rem 1.2rem;
  border-radius: 6px;

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
  }
`;

const SearchDropdown = styled.div`
  position: absolute;
  top: 60px;
  width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const SearchItem = styled.div`
  padding: 0.8rem 1rem;
  cursor: pointer;

  &:hover {
    background: #f1f5f9;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 1.8rem;
`;

const Icon = styled.div`
  color: #333;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    color: #2563eb;
    transform: translateY(-2px);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 999px;
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
`;

const UserInfo = styled.div`
  text-align: right;
  color: #333;
`;

const Name = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
`;

const Location = styled.p`
  font-size: 0.75rem;
  color: #333;
  margin: 0;
`;

const Avatar = styled.div`
  border-radius: 50%;
  overflow: hidden;
`;
