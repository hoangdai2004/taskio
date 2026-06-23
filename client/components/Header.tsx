"use client";

import styled from "styled-components";
import {
  Search,
  X,
  CalendarDays,
  Bell,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import CalendarDropdown from "./header/CalendarDropDown";
import UserMenuDropdown from "./header/UserMenuDropdown";
import NotificationsDropdown from "./header/NotificationDropdown";

import { useAuth } from "@/context/AuthContext";
import { getTodayEvents } from "@/lib/services/calendar.service";
import { getNotifications } from "@/lib/services/notifications.service";
import { globalSearch } from "@/lib/services/search.service";
import { socket } from "@/lib/socket";
import { CalendarEvent } from "@/lib/services/calendar.service";
import { Notification } from "@/lib/services/notifications.service";
import { useAppTheme } from "@/context/ThemeContext";
import UserProfileModal from "./modals/UserProfileModal";
import { getCompanyMembers, CompanyMember } from "@/lib/services/companies.service";

type Props = {
  onOpenMenu: () => void;
};

type DropdownType = "calendar" | "notifications" | "user" | null;

export default function Header({ onOpenMenu }: Props) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { user, activeCompanyId } = useAuth();
  const { theme, setTheme } = useAppTheme();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    tasks: any[];
    projects: any[];
    users: any[];
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<CompanyMember | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCompanyId) return;

    const loadHeaderData = async () => {
      try {
        const [events, notifs] = await Promise.all([
          getTodayEvents(activeCompanyId),
          getNotifications(),
        ]);
        setCalendarEvents(events);
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load header data:", err);
      }
    };

    loadHeaderData();

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => {
        if (prev.find(n => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [activeCompanyId]);

  const reloadAllData = async () => {
    if (!activeCompanyId) return;

    try {
      const [calendar, notifs] = await Promise.all([
        getTodayEvents(activeCompanyId),
        getNotifications(),
      ]);

      setCalendarEvents(calendar);
      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    }
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Wrapper ref={wrapperRef}>
      <MenuButton aria-label="Open menu" onClick={onOpenMenu}>☰</MenuButton>

      <Left>
        <SearchBox>
          <Search size={18} />
          <input
            placeholder="Search tasks, projects..."
            value={searchQuery}
            onChange={async (e) => {
              const value = e.target.value;
              setSearchQuery(value);

              if (value.trim()) {
                setIsSearching(true);
                try {
                  const results = await globalSearch(value);
                  console.log("Search results:", results);
                  setSearchResults(results);
                } catch (err) {
                  console.error("Search error:", err);
                } finally {
                  setIsSearching(false);
                }
              } else {
                setSearchResults(null);
              }
            }}
          />
          {isSearching && (
            <SearchDropdown>
              <NoResults>Searching for "{searchQuery}"...</NoResults>
            </SearchDropdown>
          )}
          {!isSearching && searchResults && (
            <SearchDropdown>
              {searchResults.tasks.length > 0 && (
                <SearchSection>
                  <SectionTitle>Tasks</SectionTitle>
                  {searchResults.tasks.map((task) => (
                    <SearchItem key={task.id} onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchResults(null);
                      setSearchQuery("");
                      router.push(`/dashboard/tasks?taskId=${task.id}`);
                    }}>
                      <div className="title">{task.title}</div>
                      <div className="meta">{task.project.name} • {task.status}</div>
                    </SearchItem>
                  ))}
                </SearchSection>
              )}
              {searchResults.projects.length > 0 && (
                <SearchSection>
                  <SectionTitle>Projects</SectionTitle>
                  {searchResults.projects.map((project) => (
                    <SearchItem key={project.id} onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchResults(null);
                      setSearchQuery("");
                      router.push(`/dashboard/projects/${project.slug}`);
                    }}>
                      <div className="title">{project.name}</div>
                    </SearchItem>
                  ))}
                </SearchSection>
              )}
              {searchResults.users.length > 0 && (
                <SearchSection>
                  <SectionTitle>People</SectionTitle>
                  {searchResults.users.map((user) => (
                    <SearchItem key={user.id} onMouseDown={async (e) => {
                      e.preventDefault();
                      try {
                        const members = await getCompanyMembers(activeCompanyId!);
                        const member = members.find(m => m.id === user.id);
                        if (member) {
                          setSelectedUserForProfile(member);
                          setIsProfileModalOpen(true);
                          setSearchResults(null);
                          setSearchQuery("");
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}>
                      <div className="title">{user.fullName}</div>
                      <div className="meta">{user.email}</div>
                    </SearchItem>
                  ))}
                </SearchSection>
              )}
              {searchResults.tasks.length === 0 && searchResults.projects.length === 0 && searchResults.users.length === 0 && (
                <NoResults>No results found for "{searchQuery}"</NoResults>
              )}
            </SearchDropdown>
          )}
        </SearchBox>
      </Left>

      <Right $searchOpen={isSearchOpen}>
        {!isSearchOpen && (
          <MobileSearchToggle aria-label="Open search" onClick={() => setIsSearchOpen(true)}>
            <Search size={20} />
          </MobileSearchToggle>
        )}
        <IconWrapper>
          <IconButton
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
        </IconWrapper>

        <IconWrapper>
          <IconButton aria-label="Toggle calendar" onClick={() => toggle("calendar")}>
            <CalendarDays size={20} />
          </IconButton>

          {openDropdown === "calendar" && (
            <CalendarDropdown events={calendarEvents} />
          )}
        </IconWrapper>

        <IconWrapper>
          <IconButton aria-label="Toggle notifications" onClick={() => toggle("notifications")}>
            <Bell size={20} />
            {notifications.some(n => !n.isRead) && <UnreadBadge />}
          </IconButton>

          {openDropdown === "notifications" && (
            <NotificationsDropdown notifications={notifications} onNotificationRead={reloadAllData} />
          )}
        </IconWrapper>

        <UserWrapper>
          <UserBox onClick={() => toggle("user")}>
            <Avatar>
              <Image
                src={user?.avatarUrl || "/images/avatar-default.png"}
                alt="avatar"
                width={36}
                height={36}
              />
            </Avatar>

            <UserName>{user?.fullName || user?.email || "User"}</UserName>

            <ChevronDown size={16} />
          </UserBox>

          {openDropdown === "user" && (
            <UserMenuDropdown onChanged={reloadAllData} />
          )}
        </UserWrapper>
      </Right>

      {isSearchOpen && (
        <MobileSearchInline>
          <Search size={18} />
          <MobileSearchInput
            placeholder="Search tasks, projects..."
            value={searchQuery}
            autoFocus
            onChange={async (e) => {
              const value = e.target.value;
              setSearchQuery(value);

              if (value.trim()) {
                setIsSearching(true);
                try {
                  const results = await globalSearch(value);
                  setSearchResults(results);
                } catch (err) {
                  console.error("Search error:", err);
                } finally {
                  setIsSearching(false);
                }
              } else {
                setSearchResults(null);
              }
            }}
          />
          <IconButton aria-label="Close search" onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
            setSearchResults(null);
          }}>
            <X size={20} />
          </IconButton>
        </MobileSearchInline>
      )}
      
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUserForProfile}
      />
    </Wrapper>
  );
}

const Wrapper = styled.header`
  position: relative;
  height: 77px;
  background: ${({ theme }) => theme.colors.primary};

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 32px;
  color: white;

  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`;

const MenuButton = styled.button`
  display: none;

  font-size: 20px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div<{ $searchOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 768px) {
    ${({ $searchOpen }) => $searchOpen && "display: none;"}
  }
`;

const MobileSearchToggle = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: white;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileSearchInline = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 77px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(30, 61, 157, 0.98);
  z-index: 10;

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileSearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.14);
  color: white;
  padding: 10px 12px;
  border-radius: 10px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.16);
  color: white;
  cursor: pointer;
`;

const IconWrapper = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const UnreadBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.danger || "#ef4444"};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.surface || "#1f2937"};
`;

const SearchBox = styled.div`
  position: relative;
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

  @media (max-width: 768px) {
    display: none;
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

const SearchDropdown = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  color: #1f2937;
`;

const SearchSection = styled.div`
  padding: 8px 0;
  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const SectionTitle = styled.div`
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.05em;
`;

const SearchItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  .title {
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: 2px;
  }

  .desc {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #6b7280;
  font-size: 14px;
`;
