import axios from "@/lib/axios";
import { SignInRequest, SignUpRequest } from "@/types/auth.type";

export const signIn = async (payload: SignInRequest) => {
  const { data } = await axios.post("/auth/signin", payload);

  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  
  return data;
};

export const signUp = async (payload: SignUpRequest) => {
  const { data } = await axios.post("/auth/signup", payload);
  return data;
};

export const forgotPassword = async (payload: { email: string }) => {
  const { data } = await axios.post("/auth/forgot-password", payload);
  return data;
};

export const resetPassword = async (payload: {token: string, password: string}) => {
  const { data } = await axios.post("/auth/reset-password", payload);
  return data;
}

