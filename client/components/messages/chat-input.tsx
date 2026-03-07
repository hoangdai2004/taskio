"use client";

import styled from "styled-components";

export default function ChatInput() {
  return (
    <Container>
      <Input placeholder="Write message..." />
      <Button>Send</Button>
    </Container>
  );
}

const Container = styled.div`
  padding: 15px;

  border-top: 1px solid ${({ theme }) => theme.colors.border};

  background: ${({ theme }) => theme.colors.card};

  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;

  padding: 10px;

  border-radius: 8px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  color: ${({ theme }) => theme.colors.textPrimary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 10px 16px;

  border: none;

  border-radius: 8px;

  background: ${({ theme }) => theme.colors.primary};

  color: white;

  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;