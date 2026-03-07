"use client";

import styled from "styled-components";

const messages = [
  {
    id: 1,
    user: "Minh",
    text: "Fix login bug xong rồi",
  },
  {
    id: 2,
    user: "Nam",
    text: "Ok push lên repo nhé",
  },
];

export default function ChatMessages() {
  return (
    <Container>
      {messages.map((m) => (
        <Message key={m.id}>
          <User>{m.user}</User>
          <Text>{m.text}</Text>
        </Message>
      ))}
    </Container>
  );
}

const Container = styled.div`
  flex: 1;

  padding: 20px;

  overflow-y: auto;

  background: ${({ theme }) => theme.colors.card};
`;

const Message = styled.div`
  margin-bottom: 15px;
`;

const User = styled.div`
  font-weight: 600;

  margin-bottom: 3px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Text = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;