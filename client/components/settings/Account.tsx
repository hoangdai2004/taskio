"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";
import { settingsService } from "@/lib/services/settings.service";

export default function SettingsAccount() {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setEmail(user?.email || "");
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await settingsService.updateAccount({
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (user && setUser) {
        setUser({
          ...user,
          email: response.user.email,
          fullName: response.user.fullName || user.fullName,
        });
      }

      setMessage(response.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Failed to update account:", error);
      setMessage("Unable to update account settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <Title>Account Settings</Title>

      <Card>
        <SectionTitle>Account Information</SectionTitle>

        <Field>
          <label>Username</label>
          <input value={user?.name || user?.fullName || ""} disabled />
        </Field>

        <Field>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
          />
        </Field>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Update Account"}
        </Button>
        {message && <Message>{message}</Message>}
      </Card>

      <Card>
        <SectionTitle>Change Password</SectionTitle>

        <Field>
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>

        <Field>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>

        <Button onClick={handleSave} disabled={saving || !currentPassword || !newPassword}>
          {saving ? "Saving..." : "Change Password"}
        </Button>
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

const Message = styled.p`
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
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