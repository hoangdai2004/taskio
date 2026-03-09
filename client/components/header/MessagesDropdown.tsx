"use client";

import styled from "styled-components";

const messages = [
  {
    id: 1,
    name: "Sarah Johnson",
    text: "Can you review the design?",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    name: "David Kim",
    text: "New task assigned to you",
    time: "10m",
    unread: true,
  },
  {
    id: 3,
    name: "Anna Lee",
    text: "Project updated",
    time: "1h",
    unread: false,
  },
];

export default function MessagesDropdown() {
  return (
    <Dropdown>
      <Header>Messages</Header>

      <List>
        {messages.map((msg) => (
          <Item key={msg.id} $unread={msg.unread}>
            <Avatar />

            <Content>
              <Name>{msg.name}</Name>
              <Message>{msg.text}</Message>
            </Content>

            <Time>{msg.time}</Time>
          </Item>
        ))}
      </List>

      <Footer>View all messages</Footer>
    </Dropdown>
  );
}

const Dropdown = styled.div`
  position: absolute;
  top: 46px;
  right: 0;
  z-index: 50;

  width: 320px;

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
  align-items: center;
  gap: 12px;

  padding: 12px 16px;
  cursor: pointer;

  background: ${({ $unread, theme }) =>
    $unread ? theme.colors.primaryLight : "transparent"};

  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ddd;
`;

const Content = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-size: 14px;
  font-weight: 500;
`;

const Message = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Time = styled.div`
  font-size: 12px;
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