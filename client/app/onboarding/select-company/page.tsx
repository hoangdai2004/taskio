"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SelectCompanyImage from "@/public/images/selectCompany.svg";
import { LoaderCircle, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { setActiveCompany } from "@/lib/services/company.service";

export default function SelectCompanyPage() {
  const router = useRouter();
  const { user, setActiveCompanyId } = useAuth();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const companies = user?.companies || [];

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCompany = async (companyId: number) => {
    setLoading(true);
    try {
      await setActiveCompany(companyId);
      setActiveCompanyId(companyId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error selecting company:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image
            src={SelectCompanyImage}
            alt="Select company illustration"
            width={400}
            height={400}
          />
        </ImageWrapper>

        <Card>
          <Title>Select Your Company</Title>
          <Subtitle>Choose which company you want to work with</Subtitle>

          {companies.length > 5 && (
            <SearchBox>
              <Search size={18} />
              <input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchBox>
          )}

          <CompanyList>
            {filteredCompanies.map((company) => (
              <CompanyItem key={company.id}>
                <CompanyInfo>
                  <CompanyName>{company.name}</CompanyName>
                </CompanyInfo>
                <SelectButton
                  onClick={() => handleSelectCompany(company.id)}
                  disabled={loading}
                >
                  {loading ? <LoaderCircle size={16} /> : "Select"}
                </SelectButton>
              </CompanyItem>
            ))}
          </CompanyList>

          <Actions>
            <ActionLink onClick={() => router.push("/onboarding/create-company")}>
              Create New Company
            </ActionLink>
            <ActionLink onClick={() => router.push("/onboarding/join-company")}>
              Join Company
            </ActionLink>
          </Actions>
        </Card>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 60px;
  max-width: 1000px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const ImageWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Card = styled.div`
  flex: 1;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  margin-bottom: 32px;
  text-align: center;
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 24px;

  input {
    width: 100%;
    padding: 12px 16px 12px 44px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    outline: none;

    &:focus {
      border-color: #3b82f6;
    }
  }

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
  }
`;

const CompanyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
`;

const CompanyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
`;

const CompanyInfo = styled.div`
  flex: 1;
`;

const CompanyName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
`;

const SelectButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
`;

const ActionLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: #2563eb;
  }
`;