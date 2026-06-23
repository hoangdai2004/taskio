import axios from "@/lib/axios";
import { Company } from "@/types/auth.type";

export interface CompanyMember {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface CompanyDetail extends Company {
  memberCount: number;
  isOwner: boolean;
  inviteCode?: string;
  inviteCodeExpiresAt?: string;
}

export const getCompanyDetail = async (
  companyId: number
): Promise<{ message: string; company: CompanyDetail }> => {
  const { data } = await axios.get(
    `/companies/${companyId}`
  );
  return data;
};

export const getCompanyMembers = async (
  companyId: number
): Promise<{ message: string; members: CompanyMember[] }> => {
  if (!companyId) {
    return { message: "Invalid company ID", members: [] };
  }
  const { data } = await axios.get(
    `/companies/${companyId}/members`
  );
  return data;
};

export const updateCompany = async (
  companyId: number,
  payload: { name?: string; slug?: string }
): Promise<{
  message: string;
  company: Company;
}> => {
  const { data } = await axios.put(
    `/companies/${companyId}`,
    payload
  );
  return data;
};

export const deleteCompany = async (
  companyId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete(
    `/companies/${companyId}`
  );
  return data;
};

export const changeMemberRole = async (
  companyId: number,
  memberId: number,
  role: "OWNER" | "ADMIN" | "MEMBER"
): Promise<{ message: string; role: string }> => {
  const { data } = await axios.put(
    `/companies/${companyId}/members/${memberId}/role`,
    { role }
  );
  return data;
};

export const removeMember = async (
  companyId: number,
  memberId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete(
    `/companies/${companyId}/members/${memberId}`
  );
  return data;
};

export const joinCompany = async (inviteCode: string): Promise<{
  message: string;
  company: Company;
}> => {
  const { data } = await axios.post("/companies/join", {
    inviteCode,
  });
  return data;
};

export const refreshCompanyInviteCode = async (
  companyId: number
): Promise<{ message: string; inviteCode: string; expiresAt: string }> => {
  const { data } = await axios.post(`/companies/${companyId}/refresh-invite`);
  return data;
};

export const setActiveCompany = async (companyId: number) => {
  const { data } = await axios.post("/auth/set-active-company", { companyId });
  return data;
};
