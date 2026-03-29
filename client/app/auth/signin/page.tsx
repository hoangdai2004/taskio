"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Signin from "@/public/images/signin.svg";
import Image from "next/image";
import { signIn } from "../../../lib/services/auth.service";
import { AxiosError } from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import {
  Wrapper,
  Container,
  ImageWrapper,
  Form,
  Title,
  Input,
  PasswordWrapper,
  Icon,
  FormOptions,
  Button,
  AuthRedirect,
  ErrorMessage,
  Label,
  InputWrapper,
} from "@/styles/auth.style";

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);
    if (error) setError("");

    try {
      const response = await signIn({
        email: email.trim(),
        password: password,
      });

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("auth_token", response.token);
      storage.setItem("user", JSON.stringify(response.user));

      router.replace("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image src={Signin} alt="Signin Image" width={400} height={400} />
        </ImageWrapper>
        <Form onSubmit={handleSignin}>
          <Title>Sign In</Title>
          <InputWrapper>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              disabled={loading}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </InputWrapper>

          <PasswordWrapper>
            <InputWrapper>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                disabled={loading}
                autoComplete="current-password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              <Icon
                onClick={() => {
                  if (!loading) setShowPassword((prev) => !prev);
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Icon>
            </InputWrapper>
          </PasswordWrapper>
          <FormOptions>
            <div>
              <label>
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Forgot password?
            </button>
          </FormOptions>
          <Button type="submit" disabled={loading || !email || !password}>
            {loading ? <LoaderCircle size={18} /> : "Sign In"}
          </Button>
          <AuthRedirect>
            Don`t have an account?
            <button type="button" onClick={() => router.push("/auth/signup")}>
              Sign Up
            </button>
          </AuthRedirect>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}

