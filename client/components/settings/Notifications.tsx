"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { settingsService } from "@/lib/services/settings.service";

interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export default function SettingsNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    inAppNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsService.getNotificationSettings();
        setSettings(response);
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await settingsService.updateNotificationSettings(settings);
      setMessage(response.message);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      setMessage("Unable to save notification settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Wrapper>Loading notifications settings...</Wrapper>;
  }

  return (
    <Wrapper>
      <Title>Notifications</Title>

      <Card>
        <SectionTitle>Notification Preferences</SectionTitle>

        <Item>
          <Info>
            <Label>Email Notifications</Label>
            <Description>
              Receive email updates for your account and tasks.
            </Description>
          </Info>
          <Toggle
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                emailNotifications: e.target.checked,
              }))
            }
          />
        </Item>

        <Item>
          <Info>
            <Label>In-app Notifications</Label>
            <Description>
              Receive notifications inside the app.
            </Description>
          </Info>
          <Toggle
            type="checkbox"
            checked={settings.inAppNotifications}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                inAppNotifications: e.target.checked,
              }))
            }
          />
        </Item>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Notification Settings"}
        </Button>
        {message && <Message>{message}</Message>}
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

const Button = styled.button`
  margin-top: 20px;
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
