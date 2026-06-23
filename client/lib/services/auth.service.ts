import axios from "@/lib/axios";
import {
  SignInRequest,
  SignUpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SignInResponse,
  SignUpResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  User,
  Company,
} from "@/types/auth.type";

export const signIn = async (
  payload: SignInRequest
): Promise<SignInResponse> => {
  const { data } = await axios.post<SignInResponse>(
    "/auth/signin",
    payload
  );
  return data;
};

export const signUp = async (
  payload: SignUpRequest
): Promise<SignUpResponse> => {
  const { data } = await axios.post<SignUpResponse>(
    "/auth/signup",
    payload
  );
  return data;
};

export const forgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const { data } = await axios.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    payload
  );
  return data;
};

export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> => {
  const { data } = await axios.post<ResetPasswordResponse>(
    "/auth/reset-password",
    payload
  );
  return data;
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await axios.get<{ message: string; user: User }>(
    "/auth/me"
  );
  return data.user;
};

export const getUserCompanies = async (): Promise<Company[]> => {
  const { data } = await axios.get<{
    message: string;
    companies: Company[];
  }>("/auth/companies");
  return data.companies;
};

export const setActiveCompany = async (
  companyId: number
): Promise<{ message: string; activeCompanyId: number }> => {
  const { data } = await axios.post<{
    message: string;
    activeCompanyId: number;
  }>("/auth/set-active-company", {
    companyId,
  });
  return data;
};

export const signOut = () => {
  if (typeof window !== "undefined") {
    axios.post("/auth/signout").catch(() => null);
    localStorage.clear();
    sessionStorage.clear();
  }
};

export const googleSignIn = async (payload: { email: string; fullName: string; avatarUrl: string }) => {
  const { data } = await axios.post("/auth/google", payload);
  return data;
};
