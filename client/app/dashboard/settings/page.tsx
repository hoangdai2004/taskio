"use client";

import styled from "styled-components";
import SettingsSidebar from "@/components/settings/settings-sidebar"

export default function SettingsPage() {
  return (
    <Container>
      <SettingsSidebar />

      <Content>
        <Title>Profile Settings</Title>

        <Form>
          <Field>
            <label>Name</label>
            <input placeholder="Your name" />
          </Field>

          <Field>
            <label>Email</label>
            <input placeholder="email@example.com" />
          </Field>

          <Field>
            <label>Bio</label>
            <textarea placeholder="Tell something about yourself..." />
          </Field>

          <SaveButton>Save Changes</SaveButton>
        </Form>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  display: flex;

  height: 100%;
`;

const Content = styled.div`
  flex: 1;

  padding: 40px;

  background: ${({ theme }) => theme.colors.background};
`;

const Title = styled.h2`
  font-size: 22px;

  margin-bottom: 30px;

  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Form = styled.div`
  max-width: 500px;
`;

const Field = styled.div`
  display: flex;

  flex-direction: column;

  margin-bottom: 20px;

  label {
    font-size: 13px;

    margin-bottom: 6px;

    color: ${({ theme }) => theme.colors.textSecondary};
  }

  input,
  textarea {
    padding: 10px 12px;

    border-radius: 8px;

    border: 1px solid ${({ theme }) => theme.colors.border};

    font-size: 14px;

    background: ${({ theme }) => theme.colors.card};

    color: ${({ theme }) => theme.colors.textPrimary};

    transition: border 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;

      border-color: ${({ theme }) => theme.colors.primary};

      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }

  textarea {
    min-height: 100px;
  }
`;

const SaveButton = styled.button`
  padding: 10px 16px;

  border-radius: 8px;

  border: none;

  background: ${({ theme }) => theme.colors.primary};

  color: ${({ theme }) => theme.colors.card};

  font-size: 14px;

  font-weight: 500;

  cursor: pointer;

  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;