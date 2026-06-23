"use client";

import { useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CreateCompanyImage from "@/public/images/createCompany.svg";
import { createCompany } from "@/lib/services/onboarding.service";
import { useAuth } from "@/context/AuthContext";

export default function CreateCompanyPage() {
  const router = useRouter();
  const { setActiveCompanyId, setCompanies, companies } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    const generated = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    setSlug(generated);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError("Company name is required");
      return;
    }

    if (!slug) {
      setError("Company URL slug is required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await createCompany({ name, slug });

      setCompanies([
        ...companies,
        {
          id: result.company.id,
          name: result.company.name,
          slug: result.company.slug,
          role: "OWNER",
        },
      ]);
      setActiveCompanyId(result.activeCompanyId);

      router.push("/dashboard");
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      setError(
        err.response?.data?.message ||
          "Unable to create company. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image src={CreateCompanyImage} alt="Create company illustration" width={400} height={400} />
        </ImageWrapper>

        <Card>
          <CardHeader>
            <div>
              <Title>Create your company</Title>
              <Subtitle>Start managing your team in seconds</Subtitle>
            </div>
          </CardHeader>

          <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Company Name</Label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Startup"
            />
          </Field>

          <Field>
            <Label>Company URL</Label>
            <SlugWrapper>
              <Prefix>app.com/</Prefix>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-startup"
              />
            </SlugWrapper>
            <HelperText>
              This will be your workspace URL
            </HelperText>
          </Field>

          {error && <ErrorText>{error}</ErrorText>}

          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Company 🚀"}
          </Button>
          <JoinButton
            type="button"
            onClick={() => router.push("/onboarding/join-company")}
          >
            Join Company
          </JoinButton>
        </Form>
      </Card>
    </Container>
  </Wrapper>
  );
}

export const Wrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Container = styled.div`
  max-width: 1120px;
  width: 100%;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  gap: 48px;
  justify-content: center;
`;

export const ImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 400px;
`;

export const Card = styled.div`
  width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 32px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Input = styled.input`
  height: 44px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

export const SlugWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  overflow: hidden;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

export const Prefix = styled.span`
  padding: 0 12px;
  background: ${({ theme }) => theme.colors.borderLight};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const HelperText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ErrorText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.danger};
`;

export const Button = styled.button`
  margin-top: 8px;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const JoinButton = styled.button`
  margin-top: 8px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }

  &:active {
    transform: scale(0.98);
  }
`;