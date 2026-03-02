import axios from "@/lib/axios";
import { SignInRequest, SignUpRequest } from "@/types/auth.type";

export const signIn = async (payload: SignInRequest) => {
  const { data } = await axios.post("/api/auth/signin", payload);

  return data;
};

export const signUp = async (payload: SignUpRequest) => {
  const { data } = await axios.post("/api/auth/signup", payload);

  return data;
};
