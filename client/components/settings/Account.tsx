"use client";

import styled from "styled-components";

export default function SettingsAccount() {
  return (
    <Wrapper>
      <Title>Account Settings</Title>

      <Card>
        <SectionTitle>Account Information</SectionTitle>

        <Field>
          <label>Username</label>
          <input placeholder="username123" />
        </Field>

        <Field>
          <label>Email</label>
          <input placeholder="email@example.com" />
        </Field>

        <Button>Update Account</Button>
      </Card>

      <Card>
        <SectionTitle>Change Password</SectionTitle>

        <Field>
          <label>Current Password</label>
          <input type="password" />
        </Field>

        <Field>
          <label>New Password</label>
          <input type="password" />
        </Field>

        <Field>
          <label>Confirm Password</label>
          <input type="password" />
        </Field>

        <Button>Update Password</Button>
      </Card>

      <DangerCard>
        <SectionTitle>Danger Zone</SectionTitle>

        <p>Permanently delete your account.</p>

        <DeleteButton>Delete Account</DeleteButton>
      </DangerCard>
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

const DangerCard = styled(Card)`
  border: 1px solid #ff4d4f;
`;

const SectionTitle = styled.h3`
  font-size: 16px;

  margin-bottom: 18px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Field = styled.div`
  display: flex;

  flex-direction: column;

  margin-bottom: 16px;

  label {
    font-size: 13px;

    margin-bottom: 6px;

    color: ${({ theme }) => theme.colors.textSecondary};
  }

  input {
    padding: 10px 12px;

    border-radius: 6px;

    border: 1px solid ${({ theme }) => theme.colors.border};

    background: ${({ theme }) => theme.colors.card};

    color: ${({ theme }) => theme.colors.textPrimary};

    font-size: 14px;

    &:focus {
      outline: none;

      border-color: ${({ theme }) => theme.colors.primary};

      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;

const Button = styled.button`
  margin-top: 10px;

  padding: 10px 16px;

  border-radius: 6px;

  border: none;

  background: ${({ theme }) => theme.colors.primary};

  color: white;

  font-size: 14px;

  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const DeleteButton = styled.button`
  margin-top: 10px;

  padding: 10px 16px;

  border-radius: 6px;

  border: none;

  background: #ff4d4f;

  color: white;

  font-size: 14px;

  cursor: pointer;

  &:hover {
    background: #d9363e;
  }
`;