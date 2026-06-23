"use client";

import { useState } from "react";
import styled from "styled-components";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SelectCompanyImage from "@/public/images/selectCompany.svg";
import { joinCompany } from "@/lib/services/companies.service";
import { useAuth } from "@/context/AuthContext";

const colors2 = {
  textPrimary: "#0f172a",
  textSecondary: "#64748b",

  primary: "#2563eb",
  primaryHover: "#1e40af",

  border: "#cbd5f5",
  borderLight: "#f1f5f9",

  background: "#f8fafc",
  surface: "#ffffff",

  error: "#ef4444",
};

export default function JoinCompany() {
  const router = useRouter();
  const { setActiveCompanyId, setCompanies, companies } = useAuth();

  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");

  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!inviteCode) {
      setError("Please enter invite code");
      return;
    }

    setError("");
    setLoadingJoin(true);

    try {
      const response = await joinCompany(inviteCode);
      alert(response.message || "Joined company successfully");
      
      if (response.company) {
        setCompanies([
          ...companies,
          {
            id: response.company.id,
            name: response.company.name,
            slug: response.company.slug,
            role: "MEMBER",
          },
        ]);
        setActiveCompanyId(response.company.id);
      }
      
      router.push("/dashboard");
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      setError(
        err.response?.data?.message || "Unable to join company. Please try again."
      );
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleRequest = async () => {
    if (!email) {
      setError("Please enter email");
      return;
    }

    setError("");
    setLoadingRequest(true);

    setTimeout(() => {
      alert("Request sent!");
      setLoadingRequest(false);
    }, 1200);
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image src={SelectCompanyImage} alt="Join company illustration" width={420} height={400} />
        </ImageWrapper>

        <Card>
          <Title>Join a Company 🚀</Title>
          <Subtitle>Enter your invite code or request access</Subtitle>

          <Input
            placeholder="Enter invite code..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          />

          <Button onClick={handleJoin} disabled={loadingJoin}>
            {loadingJoin ? <LoaderCircle size={18} className="spin" /> : "Join Company"}
          </Button>

          <Divider>— OR —</Divider>

          <Input
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button variant="secondary" onClick={handleRequest} disabled={loadingRequest}>
            {loadingRequest ? <LoaderCircle size={18} className="spin" /> : "Request Access"}
          </Button>

          {error && <ErrorText>{error}</ErrorText>}

          <Divider />

          <ActionRow>
            <PrimaryOutlineButton onClick={() => router.push("/onboarding/create-company")}>Create Company</PrimaryOutlineButton>
          </ActionRow>
        </Card>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors2.background};
`;

const Container = styled.div`
  width: 100%;
  max-width: 1140px;
  padding: 40px 20px;
  display: flex;
  gap: 48px;
  align-items: center;
  justify-content: center;
`;

const ImageWrapper = styled.div`
  min-width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  width: 420px;
  padding: 32px;
  background: ${colors2.surface};
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${colors2.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors2.textSecondary};
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${colors2.border};
  margin-bottom: 12px;
  font-size: 14px;

  &:focus {
    border-color: ${colors2.primary};
    outline: none;
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin-bottom: 12px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  background: ${(p) =>
    p.variant === "secondary" ? "#e2e8f0" : colors2.primary};

  color: ${(p) =>
    p.variant === "secondary" ? colors2.textPrimary : "#fff"};

  &:hover {
    background: ${(p) =>
      p.variant === "secondary"
        ? "#cbd5f5"
        : colors2.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 16px 0;
  font-size: 12px;
  color: ${colors2.textSecondary};
`;

const ErrorText = styled.p`
  color: ${colors2.error};
  font-size: 13px;
  margin-top: 8px;
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
`;

const PrimaryOutlineButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid ${colors2.primary};
  color: ${colors2.primary};
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: ${colors2.primary};
    color: #fff;
  }
`;