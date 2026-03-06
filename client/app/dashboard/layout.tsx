"use client";

import styled from "styled-components";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Wrapper>
      <Sidebar />
      <RightSection>
        <Header />
        <Main>{children}</Main>
      </RightSection>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Main = styled.main`
  flex: 1;
  background-color: #fff;
  color: #000;
  overflow-y: auto;
`;