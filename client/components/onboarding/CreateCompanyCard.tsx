"use client";

import styled from "styled-components";
import { useRouter } from "next/navigation";

export const CreateCompanyCard = () => {
  const router = useRouter();

  return (
    <Wrapper onClick={() => router.push("/onboarding/create-company")}>
      <Plus>+</Plus>
      <Text>Create new company</Text>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Plus = styled.div`
  font-size: 28px;
`;

const Text = styled.p`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;