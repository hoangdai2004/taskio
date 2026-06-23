"use client";

import styled from "styled-components";
import { User, LogOut, Check, Building, Plus, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { setActiveCompany } from "@/lib/services/companies.service";
import { signOut } from "@/lib/services/auth.service";

type Props = {
  onChanged?: () => void;
};

export default function UserMenuDropdown({ onChanged }: Props) {
  const router = useRouter();
  const { user, setUser, activeCompanyId, setActiveCompanyId: setContextActiveCompanyId } = useAuth();

  const companies = user?.companies ?? [];

  const handleSwitch = async (companyId: number) => {
    try {
      await setActiveCompany(companyId);

      setContextActiveCompanyId(companyId);

      onChanged?.();

      router.push("/dashboard");

      window.location.reload();
    } catch (err) {
      console.error("Switch company failed:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.replace("/auth/signin");
  };

  return (
    <UserMenu>
      <MenuItem onClick={() => router.push("/dashboard/settings/profile")}>
        <User size={16} />
        Profile
      </MenuItem>

      <Divider />



      <MenuItem onClick={() => router.push("/onboarding")}>
        <Building size={16} />
        Select company
      </MenuItem>

      <MenuItem onClick={() => router.push("/onboarding/create-company")}>
        <Plus size={16} />
        Create new company
      </MenuItem>

      <MenuItem onClick={() => router.push("/onboarding/join-company")}>
        <LogIn size={16} />
        Join existing company
      </MenuItem>

      <MenuItem $danger onClick={handleSignOut}>
        <LogOut size={16} />
        Sign out
      </MenuItem>
    </UserMenu>
  );
}

const UserMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 0;
  width: 200px;
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  padding: 6px;
  z-index: 100;
`;

const MenuItem = styled.div<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme, $danger }) =>
    $danger ? theme.colors.danger : theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.border};
  margin: 6px 0;
`;

const CompanySection = styled.div`
  padding: 6px 0;
`;

const CompanyItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;