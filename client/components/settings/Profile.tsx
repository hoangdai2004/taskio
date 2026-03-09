"use client";

import styled from "styled-components";

export default function SettingsProfile() {
  return (
    <Wrapper>
      <Title>Profile Settings</Title>

      <Card>
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

        <Button>Save Changes</Button>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  padding: 24px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 13px;
    margin-bottom: 6px;
  }

  input,
  textarea {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  textarea {
    min-height: 100px;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  border: none;

  background: ${({ theme }) => theme.colors.primary};
  color: white;

  cursor: pointer;
`;