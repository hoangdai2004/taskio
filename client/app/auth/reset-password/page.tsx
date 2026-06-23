"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ForgotPassword from "@/public/images/forgotPassword.svg";
import { LoaderCircle } from "lucide-react";
import { resetPassword } from "@/lib/services/auth.service";

import {
  Wrapper,
  Container,
  ImageWrapper,
  Form,
  Title,
  Input,
  Button,
  ErrorMessage,
  Label,
  InputWrapper,
  AuthRedirect,
} from "@/styles/auth.style";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const codeParam = searchParams.get("code") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(codeParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [emailParam, codeParam]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!code) {
      setError("Please enter the verification code (OTP).");
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword({ email, code, password });
      setSuccess("Password has been reset successfully. Redirecting to sign in...");

      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image
            src={ForgotPassword}
            alt="Reset password illustration"
            width={400}
            height={400}
          />
        </ImageWrapper>

        <Form onSubmit={handleSubmit}>
          <Title>Reset Password</Title>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <div style={{ color: "green", marginBottom: "16px" }}>{success}</div>}

          <InputWrapper>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="code">Verification Code (OTP)</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={code}
              disabled={loading}
              onChange={(e) => setCode(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </InputWrapper>

          <Button type="submit" disabled={loading || !email || !code || !password}>
            {loading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>

          <AuthRedirect>
            Remember your password?{" "}
            <a href="/auth/signin" style={{ color: "#3b82f6" }}>
              Sign in
            </a>
          </AuthRedirect>
        </Form>
      </Container>
    </Wrapper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}