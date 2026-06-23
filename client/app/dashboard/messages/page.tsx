"use client";

import styled from "styled-components";
import FloatingChat from "@/components/messages/FloatingChat";

export default function MessagesPage() {
  return (
    <PageContainer>
      <FloatingChat isFullScreen={true} />
    </PageContainer>
  );
}

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background: ${({ theme }) => theme.colors.background};
`;
