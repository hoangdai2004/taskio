"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Signin from "../../public/images/signin.svg";
import Image from "next/image";
import { signIn } from "../../lib/services/auth.service";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
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
    setLoading(true);
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }
    try {
      const response = await signIn({
        email,
        password,
      });
      alert(response.message);
      const token = response.token;
      if (rememberMe) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }
      router.push("/dashboard");
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
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Icon onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Icon>
          </PasswordWrapper>
          <FormOptions>
            <div>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </button>
          </FormOptions>
          <Button type="submit" disabled={loading || !email || !password}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <AuthRedirect>
            Don`t have an account?
            <button type="button" onClick={() => router.push("/signup")}>
              Sign Up
            </button>
          </AuthRedirect>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}