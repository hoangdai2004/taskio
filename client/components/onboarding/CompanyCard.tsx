"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";

export const CompanyCard = ({ company }: any) => {
  const router = useRouter();

  return (
    <Card onClick={() => router.push("/dashboard")}>
      <Top>
        <Avatar>{company.name[0]}</Avatar>

        <Info>
          <Name>{company.name}</Name>
          <Members>{company.members} members</Members>
        </Info>
      </Top>

      <OpenButton>Open</OpenButton>
    </Card>
  );
};

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }
`;

const Top = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const Info = styled.div``;

const Name = styled.h3`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Members = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const OpenButton = styled.button`
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;