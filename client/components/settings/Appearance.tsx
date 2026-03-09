"use client";

import styled from "styled-components";
import { useState } from "react";

export default function SettingsAppearance() {
  const [theme, setTheme] = useState("light");

  return (
    <Wrapper>
      <Title>Appearance</Title>

      <Card>
        <SectionTitle>Theme</SectionTitle>

        <ThemeGrid>
          <ThemeItem
            active={theme === "light"}
            onClick={() => setTheme("light")}
          >
            <Preview light />
            <span>Light</span>
          </ThemeItem>

          <ThemeItem
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            <Preview />
            <span>Dark</span>
          </ThemeItem>

          <ThemeItem
            active={theme === "system"}
            onClick={() => setTheme("system")}
          >
            <Preview system />
            <span>System</span>
          </ThemeItem>
        </ThemeGrid>
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

const SectionTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 20px;
`;

const ThemeGrid = styled.div`
  display: flex;
  gap: 20px;
`;

const ThemeItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  padding: 12px;

  border-radius: 8px;

  cursor: pointer;

  border: 2px solid
    ${({ active, theme }) =>
      active ? theme.colors.primary : theme.colors.border};
`;

const Preview = styled.div<{ light?: boolean; system?: boolean }>`
  width: 80px;
  height: 50px;

  border-radius: 6px;

  background: ${({ light, system }) =>
    light ? "#ffffff" : system ? "linear-gradient(90deg,#fff,#111)" : "#111"};
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