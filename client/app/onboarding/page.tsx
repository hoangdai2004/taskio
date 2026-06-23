"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Image from "next/image";
import SelectCompanyImage from "@/public/images/createCompany.svg";
import { setActiveCompany } from "@/lib/services/companies.service";
import { getCurrentUser } from "@/lib/services/auth.service";
import { Building, Plus, LogIn, ChevronRight } from "lucide-react";

export default function SelectCompanyPage() {
  const router = useRouter();
  const { setUser, companies, activeCompanyId, setActiveCompanyId } = useAuth();

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };
    fetchLatestUser();
  }, []);

  const handleSelect = async (companyId: number) => {
    try {
      await setActiveCompany(companyId);
      setActiveCompanyId(companyId);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Select company failed:", err);
    }
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image
            src={SelectCompanyImage}
            alt="Select company illustration"
            width={400}
            height={400}
            priority
          />
        </ImageWrapper>

        <Card>
          <CardHeader>
            <Title>Select Company</Title>
            <Subtitle>Choose a workspace to continue working</Subtitle>
          </CardHeader>

          <CompanyList>
            {companies.map((c) => (
              <CompanyItem
                key={c.id}
                onClick={() => handleSelect(c.id)}
                $isActive={activeCompanyId === c.id}
              >
                <CompanyInfo>
                  <IconWrapper $isActive={activeCompanyId === c.id}>
                    <Building size={20} />
                  </IconWrapper>
                  <div>
                    <CompanyName>{c.name}</CompanyName>
                    <CompanyRole>
                      {c.role ? c.role.toLowerCase() : "member"}
                    </CompanyRole>
                  </div>
                </CompanyInfo>
                <ChevronRight size={18} />
              </CompanyItem>
            ))}
          </CompanyList>

          <ActionDivider />

          <ActionButtons>
            <CreateButton onClick={() => router.push("/onboarding/create-company")}>
              <Plus size={18} />
              Create new company
            </CreateButton>
            <JoinButton onClick={() => router.push("/onboarding/join-company")}>
              <LogIn size={18} />
              Join existing company
            </JoinButton>
          </ActionButtons>
        </Card>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  max-width: 1120px;
  width: 100%;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 48px;
  justify-content: center;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const ImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 400px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Card = styled.div`
  width: 420px;
  max-width: 100%;
  background: ${({ theme }) => theme.colors.surface};
  padding: 32px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0;
`;

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const CompanyItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.borderLight};
  background: ${({ theme, $isActive }) =>
    $isActive ? `${theme.colors.primary}08` : "transparent"};
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ theme }) => theme.colors.textPrimary};

  svg {
    color: ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : theme.colors.textSecondary};
    transition: all 0.2s ease;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}08`};
    transform: translateY(-1px);

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconWrapper = styled.div<{ $isActive: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ theme, $isActive }) =>
    $isActive ? `${theme.colors.primary}15` : theme.colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompanyName = styled.div`
  font-weight: 500;
  font-size: 14px;
`;

const CompanyRole = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
`;

const ActionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.borderLight};
  margin: 20px 0;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CreateButton = styled.button`
  height: 46px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const JoinButton = styled.button`
  height: 46px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;
