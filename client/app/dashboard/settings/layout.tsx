"use client";

import styled from "styled-components";
import SettingsSidebar from "@/components/settings/SettingSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container>
      <SettingsSidebar />
      <Content>{children}</Content>
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
`;