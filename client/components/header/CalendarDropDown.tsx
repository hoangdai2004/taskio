"use client";

import styled from "styled-components";

type EventItem = {
  time: string;
  title: string;
};

type Props = {
  events?: EventItem[];
};

export default function CalendarDropdown({ events = [] }: Props) {
  return (
    <Container role="menu" aria-label="Calendar events">
      <Header>Calendar</Header>

      <Section>
        <Title>Today</Title>

        {events.length === 0 && (
          <Empty>No events today</Empty>
        )}

        {events.map((event, index) => (
          <Event key={index}>
            <Time>{event.time}</Time>
            <EventTitle>{event.title}</EventTitle>
          </Event>
        ))}
      </Section>

      <Footer>
        <Button type="button">View full calendar</Button>
      </Footer>
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  top: 46px;
  right: 0;

  width: 320px;
  min-width: 280px;

  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};

  box-shadow: 0 12px 32px rgba(0,0,0,0.08);

  padding: 16px;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Header = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textPrimary};

  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  max-height: 220px;
  overflow-y: auto;

  scrollbar-width: thin;
`;

const Title = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const EventTitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: color 0.2s;
`;

const Event = styled.div`
  display: flex;
  gap: 10px;

  padding: 8px;
  border-radius: 6px;

  cursor: pointer;

  transition: background 0.2s, transform 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    transform: translateX(2px);
  }

  &:hover ${EventTitle} {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Time = styled.div`
  font-size: 13px;
  font-weight: 600;

  color: ${({ theme }) => theme.colors.primary};

  min-width: 50px;
`;

const Footer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 10px;

  display: flex;
  justify-content: center;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;

  border: none;
  padding: 8px 16px;

  border-radius: 6px;

  font-size: 13px;
  font-weight: 500;

  cursor: pointer;

  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.1);
  }
`;

const Empty = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 8px 4px;
`;