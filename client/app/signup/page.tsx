"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/services/auth.service";
import styled from "styled-components";
import Signup from "../../public/images/signup.svg";
import Image from "next/image";
import { AxiosError } from "axios";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }
    try {
      const response = await signUp({
        firstName,
        lastName,
        email,
        password,
      });
      alert(response.data.message);

      router.push("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Container>
        <ImageWrapper>
          <Image src={Signup} alt="Signup Image" width={400} height={400} />
        </ImageWrapper>
        <Form onSubmit={handleSignup}>
          <Title>Sign Up</Title>
          <Input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
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
          <Button
            type="submit"
            disabled={loading || !firstName || !lastName || !email || !password}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
          <AuthRedirect>
            Already have an account?
            <button type="button" onClick={() => router.push("/signin")}>
              Sign In
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
