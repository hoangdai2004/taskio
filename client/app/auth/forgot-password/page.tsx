"use client";

import { useState } from "react";
import styled from "styled-components";
import { forgotPassword } from "@/lib/services/auth.service";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter()

const handleSubmit = async () => {
  const res = await forgotPassword({ email });

  alert("Reset link created");

  router.push(res.resetLink);
};

  return (
    <Container>
      <Card>
        <Title>Forgot password</Title>

        <Description>
          Enter your email and we will send you a reset link.
        </Description>

        <Input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={handleSubmit}>Send Reset Link</Button>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  width: 400px;
  background: ${({ theme }) => theme.colors.card};
  padding: 32px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;
