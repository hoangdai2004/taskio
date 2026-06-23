"use client";

import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { AppThemeProvider } from "@/context/ThemeContext";
import { theme } from "@/styles/theme";

export default function ThemeProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppThemeProvider>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </AppThemeProvider>
  );
}