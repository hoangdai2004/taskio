"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/services/auth.service";
import Signup from "../../public/images/signup.svg";
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
  Form
} from "@/styles/auth.style";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

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
          <PasswordWrapper>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Icon onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </Icon>
          </PasswordWrapper>
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
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>
      </Container>
    </Wrapper>
  );
}
