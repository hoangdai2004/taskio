"use client";

import styled from "styled-components";

export default function SettingsProfile() {
  return (
    <Wrapper>
      <Title>Settings</Title>

      <Card>
        <SectionTitle>Profile</SectionTitle>

        <AvatarRow>
          <Avatar />
          <UploadBtn>Upload Photo</UploadBtn>
        </AvatarRow>

        <InputGroup>
          <label>Full Name</label>
          <input placeholder="Nguyen Van A" />
        </InputGroup>

        <InputGroup>
          <label>Email</label>
          <input placeholder="email@gmail.com" />
        </InputGroup>

        <InputGroup>
          <label>Role</label>
          <select>
            <option>Developer</option>
            <option>Manager</option>
          </select>
        </InputGroup>

        <Button>Save Changes</Button>
      </Card>

      <Card>
        <SectionTitle>Change Password</SectionTitle>

        <InputGroup>
          <label>Current Password</label>
          <input type="password" />
        </InputGroup>

        <InputGroup>
          <label>New Password</label>
          <input type="password" />
        </InputGroup>

        <InputGroup>
          <label>Confirm Password</label>
          <input type="password" />
        </InputGroup>

        <Button dark>Update Password</Button>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 700px;
`;

const Title = styled.h1`
  font-size: 28px;

  margin-bottom: 20px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};

  padding: 24px;

  border-radius: 10px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;

  margin-bottom: 20px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const AvatarRow = styled.div`
  display: flex;

  align-items: center;

  gap: 16px;

  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 64px;

  height: 64px;

  background: ${({ theme }) => theme.colors.borderLight};

  border-radius: 50%;

  border: 2px solid ${({ theme }) => theme.colors.border};
`;

const UploadBtn = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};

  padding: 8px 14px;

  border-radius: 6px;

  background: ${({ theme }) => theme.colors.card};

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;

  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const InputGroup = styled.div`
  display: flex;

  flex-direction: column;

  margin-bottom: 16px;

  label {
    font-size: 14px;

    margin-bottom: 6px;

    color: ${({ theme }) => theme.colors.textSecondary};
  }

  input,
  select {
    padding: 10px;

    border-radius: 6px;

    border: 1px solid ${({ theme }) => theme.colors.border};

    background: ${({ theme }) => theme.colors.card};

    color: ${({ theme }) => theme.colors.textPrimary};

    font-size: 14px;

    transition: border 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;

      border-color: ${({ theme }) => theme.colors.primary};

      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }
`;

const Button = styled.button<{ dark?: boolean }>`
  margin-top: 10px;

  padding: 10px 16px;

  border-radius: 6px;

  border: none;

  background: ${({ dark, theme }) =>
    dark ? theme.colors.textPrimary : theme.colors.primary};

  color: ${({ theme }) => theme.colors.card};

  font-weight: 500;

  cursor: pointer;

  transition: background 0.2s ease;

  &:hover {
    background: ${({ dark, theme }) =>
      dark ? theme.colors.textSecondary : theme.colors.primaryHover};
  }
`;