"use client";

import styled from "styled-components";
import type { Notification } from "@/lib/services/notifications.service";
import { markAsRead, markAllAsRead } from "@/lib/services/notifications.service";

type Props = {
  notifications?: Notification[];
  onNotificationRead?: () => void;
};

export default function NotificationsDropdown({ notifications = [], onNotificationRead }: Props) {
  const handleMarkAsRead = async (item: Notification) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id);
        onNotificationRead?.();
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      onNotificationRead?.();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <Container>
      <Header>
        Notifications
        {notifications.some(n => !n.isRead) && (
          <MarkAllButton onClick={handleMarkAllAsRead}>Mark all as read</MarkAllButton>
        )}
      </Header>

      <List>
        {notifications.length === 0 && (
          <Empty>No notifications</Empty>
        )}

        {notifications.map((item) => (
          <Item key={item.id} $unread={!item.isRead} onClick={() => handleMarkAsRead(item)}>
            {!item.isRead && <Dot />}

            <Content>
              <Text>
                <b>{item.type}</b>: {item.content}
              </Text>
              <Time>{new Date(item.createdAt).toLocaleString()}</Time>
            </Content>
          </Item>
        ))}
      </List>
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  top: 46px;
  right: 0;
  width: 320px;
  min-width: 280px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const MarkAllButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
`;

const Item = styled.div<{ $unread?: boolean }>`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $unread, theme }) =>
    $unread ? "rgba(99, 102, 241, 0.04)" : "transparent"};
  transition: background 0.2s, transform 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    transform: translateX(2px);
  }
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Text = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.4;
`;

const Time = styled.div`
  font-size: 11px;
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Empty = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 8px 4px;
  text-align: center;
`;
