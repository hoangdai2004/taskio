"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ForgotPassword from "@/public/images/forgotPassword.svg";
import { LoaderCircle } from "lucide-react";

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
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("")

    const mail = email.trim()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(mail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!mail) {
      setError("Please fill in all fields.");
      return;
    }
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image src={ForgotPassword} alt="Forgot" width={400} height={400} />
        </ImageWrapper>

        <Form onSubmit={handleSubmit}>
          <Title>Forgot Password</Title>

          <InputWrapper>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputWrapper>

          <Button disabled={loading || !email}>
            {loading ? <LoaderCircle size={18} /> : "Send Reset Link"}
          </Button>

          <AuthRedirect>
            Back to
            <button onClick={() => router.push("/auth/signin")}>
              Sign In
            </button>
          </AuthRedirect>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}