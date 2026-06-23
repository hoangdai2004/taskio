"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ForgotPassword from "@/public/images/forgotPassword.svg";
import { LoaderCircle } from "lucide-react";
import { forgotPassword } from "@/lib/services/auth.service";

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

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const mail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!mail) {
      setError("Please enter your email.");
      return;
    }

    if (!emailRegex.test(mail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setOtpCode("");

    try {
      const response = await forgotPassword({ email: mail });

      setSuccess("A 6-digit verification code has been sent to your email.");

      if (response?.code) {
        setOtpCode(response.code);
      }
    } catch {
      setError("Unable to process your request. Please try again.");
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
            alt="Forgot password illustration"
            width={400}
            height={400}
          />
        </ImageWrapper>

        <Form onSubmit={handleSubmit}>
          <Title>Forgot Password</Title>

          <InputWrapper>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
            />
          </InputWrapper>

          <Button
            type="submit"
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <LoaderCircle size={18} />
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <AuthRedirect>
            Back to
            <button
              type="button"
              onClick={() => router.push("/auth/signin")}
            >
              Sign In
            </button>
          </AuthRedirect>

          {success && (
            <div style={{ marginTop: 12 }}>
              <p style={{ color: "#16a34a", fontWeight: 500 }}>
                {success}
              </p>
              <button
                type="button"
                onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}${otpCode ? `&code=${otpCode}` : ""}`)}
                style={{
                  marginTop: 10,
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  width: "100%",
                  textAlign: "center"
                }}
              >
                Enter Verification Code to Reset Password
              </button>
            </div>
          )}

          {otpCode && (
            <p style={{ marginTop: 12, fontSize: "14px", color: "#6b7280" }}>
              Verification Code (Dev mode): <strong style={{ color: "#2563eb", fontSize: "16px" }}>{otpCode}</strong>
            </p>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}