"use client";

import styled from "styled-components";

const channels = [
 {id: 1, name: "Mobile App"},
 {id: 2, name: "Website Redesign"}
];

export default function ChatSidebar() {
  return (
    <Container>
      <Title>Channels</Title>

      {channels.map((c) => (
        <Channel key={c.id}># {c.name}</Channel>
      ))}
    </Container>
  );
}

const Container = styled.div`
  border-right: 1px solid #eee;
  background: white;
  padding: 20px;
`;

const Title = styled.h3`
  margin-bottom: 15px;
`;

const Channel = styled.div`
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }
`;