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
  background: #fafafa;
`;

const Title = styled.h2`
  font-size: 22px;
  margin-bottom: 30px;
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
    color: #666;
  }

  input,
  textarea {
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 14px;
  }

  textarea {
    min-height: 100px;
  }
`;

const SaveButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;