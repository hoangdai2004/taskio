export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
}

export interface User {
  id: number;
  email: string;
  name?: string;
  fullName?: string;
  bio?: string;
  avatar?: string;
  avatarUrl?: string;
  activeCompanyId?: number | null;
  companies?: Company[];
}

export interface SignInResponse {
  message: string;
  user: User;
}

export interface SignUpResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
  code?: string;
}

export interface ResetPasswordResponse {
  message: string;
}