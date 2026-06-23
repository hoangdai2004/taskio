import axios from "@/lib/axios";

export interface OnboardingStatus {
  status: "NEEDS_COMPANY" | "AUTO_SELECT" | "NEEDS_SELECTION" | "COMPLETED";
  message: string;
  companyId?: number;
  companies?: Array<{
    id: number;
    name: string;
    slug: string;
    role: string;
  }>;
  companyCount: number;
}

export interface CreateCompanyPayload {
  name: string;
  slug?: string;
}

export interface CreateCompanyResponse {
  message: string;
  company: {
    id: number;
    name: string;
    slug: string;
  };
  activeCompanyId: number;
}

export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  const { data } = await axios.get<OnboardingStatus>("/onboarding/status");
  return data;
};

export const createCompany = async (
  payload: CreateCompanyPayload
): Promise<CreateCompanyResponse> => {
  const { data } = await axios.post<CreateCompanyResponse>(
    "/onboarding/create-company",
    payload
  );
  return data;
};
