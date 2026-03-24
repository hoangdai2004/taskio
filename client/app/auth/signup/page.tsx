"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/services/auth.service";
import Signup from "@/public/images/signup.svg";
import Image from "next/image";
import { AxiosError } from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

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
  InputWrapper,
  Label,
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
    const pass = password;
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
          <Image
            src={Signup}
            alt="User registration illustration"
            width={400}
            height={400}
          />
        </ImageWrapper>

        <Form onSubmit={handleSignup}>
          <Title>Sign Up</Title>

          <InputWrapper>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              disabled={loading}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError("");
              }}
            />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={lastName}
              disabled={loading}
              onChange={(e) => {
                setLastName(e.target.value);
                setError("");
              }}
            />
          </InputWrapper>

          <InputWrapper>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              disabled={loading}
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
                autoComplete="new-password"
                placeholder="Enter your password"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
              />
              <Icon type="button" onClick={() => !loading && setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Icon>
            </InputWrapper>
          </PasswordWrapper>

          <PasswordWrapper>
            <InputWrapper>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your confirm password"
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
            </InputWrapper>
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
            {loading ? <LoaderCircle size={18} /> : "Sign Up"}
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
