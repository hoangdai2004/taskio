"use client";

import styled from "styled-components";
import ChatInput from "@/components/messages/chat-input";
import ChatHeader from "@/components/messages/chat-header";
import ChatMessages from "@/components/messages/chat-messages";
import ChatSidebar from "@/components/messages/chat-sidebar";

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
  background: #f7f8fa;
`;

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
`;