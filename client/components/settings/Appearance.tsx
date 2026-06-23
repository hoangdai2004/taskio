"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppTheme } from "@/context/ThemeContext";
import { settingsService } from "@/lib/services/settings.service";

export default function SettingsAppearance() {
  const { theme: nextTheme, setTheme: setNextTheme } = useAppTheme();
  const [theme, setTheme] = useState(nextTheme || "light");
  const [osTheme, setOsTheme] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (nextTheme) {
      setTheme(nextTheme);
    }
    
    // Check OS theme
    const checkOsTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setOsTheme(isDark ? "dark" : "light");
    };
    
    checkOsTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkOsTheme);
    return () => mediaQuery.removeEventListener("change", checkOsTheme);
  }, [nextTheme]);

  const handleThemeSelect = (newTheme: string) => {
    setTheme(newTheme);
    setNextTheme(newTheme as "light" | "dark" | "system");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await settingsService.updateAppearanceSettings({ theme });
      setMessage(response.message);
    } catch (error) {
      console.error("Failed to save appearance settings:", error);
      setMessage("Unable to save appearance settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <Title>Appearance</Title>

      <Card>
        <SectionHeader>
          <SectionTitle>Theme</SectionTitle>
          <OsLabel>
            OS Detected: <strong>{osTheme === "dark" ? "Dark Mode" : "Light Mode"}</strong>
          </OsLabel>
        </SectionHeader>

        <ThemeGrid>
          <ThemeItem
            $active={theme === "light"}
            onClick={() => handleThemeSelect("light")}
          >
            <Preview $light />
            <span>Light</span>
          </ThemeItem>

          <ThemeItem
            $active={theme === "dark"}
            onClick={() => handleThemeSelect("dark")}
          >
            <Preview />
            <span>Dark</span>
          </ThemeItem>

          <ThemeItem
            $active={theme === "system"}
            onClick={() => handleThemeSelect("system")}
          >
            <Preview $system />
            <span>System</span>
          </ThemeItem>
        </ThemeGrid>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Appearance Settings"}
        </Button>
        {message && <Message>{message}</Message>}
      </Card>

      <Card>
        <SectionTitle>Interface Density</SectionTitle>

        <DensityRow>
          <DensityBtn>Comfortable</DensityBtn>
          <DensityBtn>Compact</DensityBtn>
        </DensityRow>
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const OsLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.background};
  padding: 4px 10px;
  border-radius: 6px;
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ThemeGrid = styled.div`
  display: flex;
  gap: 20px;
`;

const ThemeItem = styled.div<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.borderLight)};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
  }

  span {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Preview = styled.div<{ $light?: boolean; $system?: boolean }>`
  width: 80px;
  height: 50px;
  border-radius: 6px;
  background: ${({ $light, $system }) =>
    $light ? "#ffffff" : $system ? "linear-gradient(90deg,#fff,#111)" : "#111"};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DensityRow = styled.div`
  display: flex;
  gap: 12px;
`;

const DensityBtn = styled.button`
  padding: 10px 16px;

  border-radius: 6px;

  border: 1px solid ${({ theme }) => theme.colors.border};

  background: ${({ theme }) => theme.colors.card};

  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Button = styled.button`
  display: inline-flex;
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
