"use client";

import { useState } from "react";
import styled from "styled-components";
import { LoaderCircle } from "lucide-react";

type Props = {
  onJoin: (code: string) => Promise<void>;
  onRequest: (email: string) => Promise<void>;
  onSelectCompany?: () => void;
  onCreateCompany?: () => void;
};

export default function JoinCompanyCard({
  onJoin,
  onRequest,
  onSelectCompany,
  onCreateCompany,
}: Props) {
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

    try {
      setError("");
      setLoadingJoin(true);
      await onJoin(inviteCode);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(err.response?.data?.message || err.message || "Join failed");
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleRequest = async () => {
    if (!email) {
      setError("Please enter email");
      return;
    }

    try {
      setError("");
      setLoadingRequest(true);
      await onRequest(email);
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(err.response?.data?.message || err.message || "Request failed");
    } finally {
      setLoadingRequest(false);
    }
  };

  return (
    <Card>
      <Title>Join a Company 🚀</Title>
      <Subtitle>
        Enter your invite code or request access
      </Subtitle>

      <Input
        placeholder="Enter invite code..."
        value={inviteCode}
        onChange={(e) =>
          setInviteCode(e.target.value.toUpperCase())
        }
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

      <Button
        variant="secondary"
        onClick={handleRequest}
        disabled={loadingRequest}
      >
        {loadingRequest ? <LoaderCircle size={18} className="spin" /> : "Request Access"}
      </Button>

      {error && <ErrorText>{error}</ErrorText>}

      {(onSelectCompany || onCreateCompany) && (
        <>
          <Divider />
          <ActionRow>
            {onSelectCompany && (
              <GhostButton onClick={onSelectCompany}>
                Select Company
              </GhostButton>
            )}

            {onCreateCompany && (
              <PrimaryOutlineButton onClick={onCreateCompany}>
                Create Company
              </PrimaryOutlineButton>
            )}
          </ActionRow>
        </>
      )}
    </Card>
  );
}

const colors2 = {
  textPrimary: "#0f172a",
  textSecondary: "#64748b",

  primary: "#2563eb",
  primaryHover: "#1e40af",

  border: "#cbd5f5",
  borderLight: "#f1f5f9",

  surface: "#ffffff",
  error: "#ef4444",
};

const Card = styled.div`
  width: 420px;
  padding: 32px;
  background: ${colors2.surface};
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
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
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-bottom: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: ${(p) =>
    p.variant === "secondary" ? "#e2e8f0" : colors2.primary};

  color: ${(p) =>
    p.variant === "secondary" ? colors2.textPrimary : "#fff"};
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
`;

const ActionRow = styled.div`
  display: flex;
  gap: 10px;
`;

const GhostButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${colors2.border};
  background: transparent;
`;

const PrimaryOutlineButton = styled.button`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${colors2.primary};
  color: ${colors2.primary};
  background: transparent;
`;