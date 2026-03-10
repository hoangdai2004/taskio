"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/services/auth.service";
import Signup from "@/public/images/signup.svg";
import Image from "next/image";
import { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";

import {
  Wrapper,
  Container,
  Title,
  Input,
  Button,
  ImageWrapper,
  AuthRedirect,
  PasswordWrapper,
  ErrorMessage,
  Icon,
  Form,
} from "@/styles/auth.style";

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fullName = `${firstName} ${lastName}`;
    const mail = email.trim();
    const pass = password.trim();
    const confirm = confirmPassword.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName || !lastName || !mail || !pass || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (!emailRegex.test(mail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (pass.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (pass !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await signUp({
        name: fullName,
        email: mail,
        password: pass,
      });

      alert(response.message);

      router.replace("/signin");
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
            disabled={loading}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError("");
            }}
          />

          <Input
            type="text"
            placeholder="Last Name"
            value={lastName}
            disabled={loading}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
          />

          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            disabled={loading}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />

          <PasswordWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              disabled={loading}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />

            <Icon onClick={() => !loading && setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Icon>
          </PasswordWrapper>

          <PasswordWrapper>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              autoComplete="new-password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
            />

            <Icon
              onClick={() =>
                !loading && setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Icon>
          </PasswordWrapper>

          <Button
            type="submit"
            disabled={
              loading ||
              !firstName ||
              !lastName ||
              !email ||
              !password ||
              !confirmPassword
            }
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>

          <AuthRedirect>
            Already have an account?
            <button type="button" onClick={() => router.push("/auth/signin")}>
              Sign In
            </button>
          </AuthRedirect>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}