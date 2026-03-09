"use client";

import styled from "styled-components";
import ChatInput from "@/components/messages/ChatInput";
import ChatHeader from "@/components/messages/ChatHeader";
import ChatMessages from "@/components/messages/ChatMessages";
import ChatSidebar from "@/components/messages/ChatSidebar";

export default function MessagesPage() {
  return (
    <Container>
      <ChatSidebar />

      <ChatArea>
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </ChatArea>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  height: 100%;

  background: ${({ theme }) => theme.colors.borderLight};
`;

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;

  background: ${({ theme }) => theme.colors.card};
`;