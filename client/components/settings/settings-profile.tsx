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
`;

const Card = styled.div`
  background: white;
  padding: 24px;
  border-radius: 10px;
  border: 1px solid #eee;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
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
  background: #ddd;
  border-radius: 50%;
`;

const UploadBtn = styled.button`
  border: 1px solid #ddd;
  padding: 8px 14px;
  border-radius: 6px;
  background: white;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    margin-bottom: 6px;
  }

  input,
  select {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ddd;
  }
`;

const Button = styled.button<{ dark?: boolean }>`
  margin-top: 10px;
  padding: 10px 16px;
  border-radius: 6px;

  background: ${(p) => (p.dark ? "#111" : "#2563eb")};
  color: white;
`;