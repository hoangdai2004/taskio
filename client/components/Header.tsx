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
import { useState } from "react";
import { IUser, INotification, ISearchResult } from "@/types/header.type";

export default function Header() {
  const [user, setUser] = useState<IUser | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [results, setResults] = useState<ISearchResult[]>([]);

  

  return (
    <Wrapper>
      <Left>
        <SearchBox>
          <Search size={18} />
          <input placeholder="Search for anything..." />
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

        <User>
          <UserInfo>
            <Name>Anima Agrawal</Name>
            <Location>U.P, India</Location>
          </UserInfo>

          <Avatar>
            <Image
              src="/images/avatar.jpg"
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
  height: 80px;
  padding: 0 2rem;

  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Left = styled.div`
  flex: 1;
`;

const SearchBox = styled.div`
  width: 420px;
  max-width: 100%;

  display: flex;
  align-items: center;
  gap: 0.7rem;

  background: #eef2f7;
  padding: 0.8rem 1.2rem;
  border-radius: 16px;

  transition: 0.2s ease;

  input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #1e293b;

    &::placeholder {
      color: #94a3b8;
    }
  }

  svg {
    color: #94a3b8;
  }

  &:focus-within {
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 1.8rem;
`;

const Icon = styled.div`
  color: #64748b;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    color: #6366f1;
    transform: translateY(-2px);
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
`;

const UserInfo = styled.div`
  text-align: right;
`;

const Name = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
`;

const Location = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
`;

const Avatar = styled.div`
  border-radius: 50%;
  overflow: hidden;
`;
