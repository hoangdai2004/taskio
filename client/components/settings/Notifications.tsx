"use client";

import styled from "styled-components";

export default function SettingsNotifications() {
  return (
    <Wrapper>
      <Title>Notifications</Title>

      <Card>
        <SectionTitle>Email Notifications</SectionTitle>

        <Item>
          <Info>
            <Label>Task Updates</Label>
            <Description>
              Receive email when a task is updated.
            </Description>
          </Info>
          <Toggle type="checkbox" />
        </Item>

        <Item>
          <Info>
            <Label>Project Invites</Label>
            <Description>
              Get notified when someone invites you to a project.
            </Description>
          </Info>
          <Toggle type="checkbox" />
        </Item>

        <Item>
          <Info>
            <Label>Comments</Label>
            <Description>
              Receive notifications when someone comments on your task.
            </Description>
          </Info>
          <Toggle type="checkbox" />
        </Item>
      </Card>

      <Card>
        <SectionTitle>Push Notifications</SectionTitle>

        <Item>
          <Info>
            <Label>Task Assigned</Label>
            <Description>
              Notify when a task is assigned to you.
            </Description>
          </Info>
          <Toggle type="checkbox" />
        </Item>

        <Item>
          <Info>
            <Label>Deadline Reminder</Label>
            <Description>
              Get reminder before task deadline.
            </Description>
          </Info>
          <Toggle type="checkbox" />
        </Item>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 650px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 10px;

  padding: 24px;

  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;

  margin-bottom: 20px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Item = styled.div`
  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 12px 0;

  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Info = styled.div`
  max-width: 420px;
`;

const Label = styled.div`
  font-size: 14px;

  font-weight: 500;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Description = styled.div`
  font-size: 12px;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Toggle = styled.input`
  width: 40px;

  height: 20px;

  cursor: pointer;
`;