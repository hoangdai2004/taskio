"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Signin from "@/public/images/signin.svg";
import Image from "next/image";
import { signIn } from "@/lib/services/auth.service";
import { AxiosError } from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  GoogleButton,
  Divider,
} from "@/styles/auth.style";
import { googleSignIn } from "@/lib/services/auth.service";

export default function SigninPage() {
  const router = useRouter();
  const { setUser: setAuthUser, setActiveCompanyId, setCompanies } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    const mail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!mail || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!emailRegex.test(mail)) {
      setError("Invalid email format.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await signIn({
        email: mail,
        password: password,
        rememberMe,
      });

      if (rememberMe) {
        sessionStorage.clear();
      } else {
        localStorage.clear();
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      const user = response.user;
      const companies = user?.companies ?? [];

      storage.setItem("user", JSON.stringify(user));
      storage.setItem("companies", JSON.stringify(companies));

      setAuthUser(user);
      setCompanies(companies);

      if (companies.length === 0) {
        router.replace("/onboarding/create-company");
        return;
      }

      if (companies.length === 1) {
        const companyId = companies[0].id;
        storage.setItem("activeCompanyId", String(companyId));
        setActiveCompanyId(companyId);
        router.replace("/dashboard");
        return;
      }

      const storedActiveCompanyId = storage.getItem("activeCompanyId");
      const hasValidActiveCompany =
        storedActiveCompanyId &&
        companies.some((c) => String(c.id) === storedActiveCompanyId);

      if (hasValidActiveCompany) {
        router.replace("/dashboard");
        return;
      }

      const defaultCompanyId = companies[0].id;
      storage.setItem("activeCompanyId", String(defaultCompanyId));
      setActiveCompanyId(defaultCompanyId);
      router.replace("/dashboard");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;

      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(err.response?.data?.message || "Sign in failed.");
      }
      
      setEmail("");
      setPassword("");
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
          <Image src={Signin} alt="Signin Image" width={400} height={400} />
        </ImageWrapper>

        <Form onSubmit={handleSignin}>
          <Title>Sign In</Title>

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
                autoComplete="current-password"
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
                onClick={() => !loading && setShowPassword((prev) => !prev)}
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

          <Button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              !password.trim()
            }
          >
            {loading ? <LoaderCircle size={18} /> : "Sign In"}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Divider>or</Divider>
          
          <GoogleButton type="button" onClick={handleGoogleSignin} disabled={loading}>
            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </GoogleButton>

          <AuthRedirect>
            Don’t have an account?
            <button
              type="button"
              onClick={() => router.push("/auth/signup")}
            >
              Sign Up
            </button>
          </AuthRedirect>
        </Form>
      </Container>
    </Wrapper>
  );
}