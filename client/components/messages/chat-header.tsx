"use client";

import styled from "styled-components";

export default function ChatHeader() {
  return (
    <Container>
      <Title>Mobile App</Title>
      <Members>3 members</Members>
    </Container>
  );
}

const Container = styled.div`
  padding: 16px 20px;

  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  background: ${({ theme }) => theme.colors.card};
`;

const Title = styled.div`
  font-weight: 600;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Members = styled.div`
  font-size: 13px;

  color: ${({ theme }) => theme.colors.textMuted};
`;