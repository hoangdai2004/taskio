"use client";

import styled from "styled-components";

const notifications = [
  {
    id: 1,
    text: (
      <>
        <b>David</b> assigned you a task
      </>
    ),
    time: "5 minutes ago",
    unread: true,
  },
  {
    id: 2,
    text: (
      <>
        New comment on <b>Design System</b>
      </>
    ),
    time: "20 minutes ago",
    unread: true,
  },
  {
    id: 3,
    text: (
      <>
        <b>Sarah</b> mentioned you
      </>
    ),
    time: "1 hour ago",
    unread: false,
  },
];

export default function NotificationsDropdown() {
  return (
    <Dropdown>
      <Header>Notifications</Header>

      <List>
        {notifications.map((item) => (
          <Item key={item.id} $unread={item.unread}>
            {item.unread && <Dot />}

            <Content>
              <Text>{item.text}</Text>
              <Time>{item.time}</Time>
            </Content>
          </Item>
        ))}
      </List>

      <Footer>View all notifications</Footer>
    </Dropdown>
  );
}

const Dropdown = styled.div`
  position: absolute;
  top: 46px;
  right: 0;
  z-index: 50;

  width: 340px;

  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;

  box-shadow: 0 12px 30px rgba(0,0,0,0.12);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 14px 16px;
  font-weight: 600;

  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const List = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const Item = styled.div<{ $unread?: boolean }>`
  display: flex;
  gap: 10px;

  padding: 12px 16px;

  cursor: pointer;

  background: ${({ $unread, theme }) =>
    $unread ? theme.colors.primaryLight : "transparent"};

  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;

  margin-top: 6px;

  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
`;

const Content = styled.div`
  flex: 1;
`;

const Text = styled.div`
  font-size: 14px;
`;

const Time = styled.div`
  font-size: 12px;
  margin-top: 2px;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Footer = styled.div`
  padding: 12px 16px;

  text-align: center;
  font-size: 13px;

  border-top: 1px solid ${({ theme }) => theme.colors.border};

  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;