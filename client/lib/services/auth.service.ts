import axios from "@/lib/axios";
import { SignInRequest, SignUpRequest } from "@/types/auth.type";

export const signIn = async (payload: SignInRequest) => {
  const response = await axios.post("/api/auth/signin", payload);

  return response.data;
};

export const signUp = async (payload: SignUpRequest) => {
  const response = await axios.post("/api/auth/signup", payload);

  return response.data;
};
