"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";
import { CalendarEvent } from "@/lib/services/calendar.service";

type Props = {
  events?: CalendarEvent[];
};

export default function CalendarDropdown({ events = [] }: Props) {
  const router = useRouter();

  return (
    <Container role="menu" aria-label="Calendar events">
      <Header>Today&apos;s Schedule</Header>

      <Section>
        {events.length === 0 && (
          <Empty>No events today</Empty>
        )}

        {events.map((event) => (
          <Event key={event.id}>
            <Time>{event.time}</Time>
            <EventInfo>
              <EventTitle>{event.title}</EventTitle>
              {event.project && <EventProject>{event.project}</EventProject>}
            </EventInfo>
            <TypeBadge $type={event.type}>
              {event.type === "task" ? "Task" : "Event"}
            </TypeBadge>
          </Event>
        ))}
      </Section>

      <Footer>
        <Button type="button" onClick={() => router.push("/dashboard/calendar")}>
          View full calendar
        </Button>
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
  z-index: 100;
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

const EventTitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: color 0.2s;
`;

const EventProject = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 1px;
`;

const Event = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
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

const EventInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Time = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  min-width: 50px;
`;

const TypeBadge = styled.span<{ $type: string }>`
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $type }) => $type === "task" ? "#dbeafe" : "#ede9fe"};
  color: ${({ $type }) => $type === "task" ? "#2563eb" : "#7c3aed"};
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