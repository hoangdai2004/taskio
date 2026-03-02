"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";
import Signin from "../../public/images/signin.svg";
import Image from "next/image";
import { signIn } from "../../lib/services/auth.service";
import { AxiosError } from "axios";

export default function SigninPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

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
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
        </Form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  background: url("/images/background.jpg") no-repeat center fixed;
  background-size: cover;

  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;

  .dark & {
    background:
      linear-gradient(rgba(5, 8, 22, 0.8), rgba(5, 8, 22, 0.8)),
      url("/images/background.jpg") no-repeat center fixed;
    background-size: cover;
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Title = styled.h1`
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
`;

const Input = styled.input`
  padding: 0.6rem;
  border: 1px solid #000;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  background: #fff;
  color: #000;

  &:focus {
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.6rem;
  background: #2563eb;
  color: #fff;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #fff;

  div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #fff;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }
`;

const ImageWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const AuthRedirect = styled.div`
  margin: 1rem auto 0;
  font-size: 0.9rem;
  color: #fff;
  gap: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #fff;
    text-decoration: underline;

    &:hover {
      opacity: 0.7;
    }
  }
`;
