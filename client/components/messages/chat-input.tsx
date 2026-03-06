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
  border-top: 1px solid #eee;
  background: white;
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
`;