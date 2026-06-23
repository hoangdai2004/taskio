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
  GoogleButton,
  Divider,
} from "@/styles/auth.style";
import { googleSignIn } from "@/lib/services/auth.service";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { setUser: setAuthUser, setActiveCompanyId, setCompanies } = useAuth();

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

    if (loading) return;

    const first = firstName.trim();
    const last = lastName.trim();
    const mail = email.trim().toLowerCase();

    const fullName = `${first} ${last}`;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!first || !last || !mail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (!emailRegex.test(mail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signUp({
        fullName: fullName,
        email: mail,
        password: password,
      });

      router.push("/auth/signin");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.status === 409) {
        setError("Email already exists.");
      } else {
        setError(err.response?.data?.message || "Signup failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await googleSignIn({
        email: "demo@google.com",
        fullName: "Demo User",
        avatarUrl: ""
      });

      const user = response.user;
      const companies = user?.companies ?? [];

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("companies", JSON.stringify(companies));

      setAuthUser(user);
      setCompanies(companies);

      if (companies.length > 0) {
        const defaultCompanyId = companies[0].id;
        localStorage.setItem("activeCompanyId", String(defaultCompanyId));
        setActiveCompanyId(defaultCompanyId);
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding/create-company");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Google Sign in failed.");
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
              <Icon
                type="button"
                onClick={() => !loading && setShowPassword(!showPassword)}
              >
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
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
              />
              <Icon
                type="button"
                onClick={() =>
                  !loading && setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </Icon>
            </InputWrapper>
          </PasswordWrapper>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button
            type="submit"
            disabled={
              loading ||
              !firstName.trim() ||
              !lastName.trim() ||
              !email.trim() ||
              !password.trim() ||
              !confirmPassword.trim()
            }
          >
            {loading ? <LoaderCircle className="spin" size={18} /> : "Sign Up"}
          </Button>

          <Divider>or</Divider>

          <GoogleButton type="button" onClick={handleGoogleSignin} disabled={loading}>
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </GoogleButton>

          <AuthRedirect>
            Already have an account?
            <button type="button" onClick={() => router.push("/auth/signin")}>
              Sign In
            </button>
          </AuthRedirect>
        </Form>
      </Container>
    </Wrapper>
  );
}