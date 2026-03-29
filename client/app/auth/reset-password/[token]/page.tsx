"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import ResetPassword from "@/public/images/resetPassword.svg";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

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
  Icon,
} from "@/styles/auth.style";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      return setError("Invalid or expired token");
    }

    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image src={ResetPassword} alt="Reset" width={400} height={400} />
        </ImageWrapper>

        <Form onSubmit={handleSubmit}>
          <Title>Reset Password</Title>

          <InputWrapper>
            <Label>New Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Icon
              onClick={() => {
                if (!loading) setShowPassword((prev) => !prev);
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Icon>
          </InputWrapper>

          <InputWrapper>
            <Label>Confirm Password</Label>
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              disabled={loading}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Icon
              onClick={() => {
                if (!loading) setShowConfirm((prev) => !prev);
              }}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </Icon>
          </InputWrapper>

          <Button disabled={loading || !password || !confirm}>
            {loading ? <LoaderCircle size={18} /> : "Reset Password"}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}
