"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";
import { 
  CompanyMember, 
  getCompanyMembers, 
  getCompanyDetail,
  CompanyDetail,
  refreshCompanyInviteCode,
  changeMemberRole,
  removeMember
} from "@/lib/services/companies.service";
import { Copy, Check, RefreshCw, MoreVertical, ShieldAlert, Shield, UserMinus } from "lucide-react";
import UserProfileModal from "@/components/modals/UserProfileModal";

export default function MembersPage() {
  const { activeCompanyId, user } = useAuth();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CompanyMember | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const currentUserMembership = members.find(m => m.id === user?.id);
  const currentUserRole = currentUserMembership?.role || "MEMBER";
  const canManageRoles = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  useEffect(() => {
    const loadMembers = async () => {
      if (!activeCompanyId) {
        setMembers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [membersRes, companyRes] = await Promise.all([
          getCompanyMembers(activeCompanyId),
          getCompanyDetail(activeCompanyId)
        ]);
        setMembers(membersRes.members);
        setCompany(companyRes.company);
      } catch (err) {
        console.error(err);
        setError("Unable to load company data.");
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [activeCompanyId]);

  const handleRefreshCode = async () => {
    if (!activeCompanyId) return;

    try {
      setRefreshing(true);
      const res = await refreshCompanyInviteCode(activeCompanyId);
      setCompany(prev => prev ? { 
        ...prev, 
        inviteCode: res.inviteCode, 
        inviteCodeExpiresAt: res.expiresAt 
      } : null);
    } catch (err) {
      console.error(err);
      alert("Failed to refresh invite code.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: "OWNER" | "ADMIN" | "MEMBER") => {
    if (!activeCompanyId) return;
    try {
      await changeMemberRole(activeCompanyId, memberId, newRole);
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    } catch (err) {
      console.error(err);
      alert("Failed to change role.");
    }
    setMenuOpenId(null);
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!activeCompanyId) return;
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMember(activeCompanyId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove member.");
    }
    setMenuOpenId(null);
  };

  const isExpired = !!(company?.inviteCodeExpiresAt && new Date() > new Date(company.inviteCodeExpiresAt));

  return (
    <Container>
      <HeaderSection>
        <div>
          <Header>Company Members</Header>
          <SubHeader>Manage people in your organization</SubHeader>
        </div>

        {company?.inviteCode && (
          <InviteBox>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InviteLabel>Invite Code</InviteLabel>
              {company.isOwner && (
                <RefreshButton onClick={handleRefreshCode} disabled={refreshing}>
                  <RefreshCw size={12} className={refreshing ? 'spin' : ''} />
                </RefreshButton>
              )}
            </div>
            <InviteValue>
              <code style={{ opacity: isExpired ? 0.5 : 1 }}>
                {isExpired ? 'EXPIRED' : company.inviteCode}
              </code>
              <CopyButton 
                disabled={isExpired}
                onClick={() => {
                  if (isExpired) return;
                  navigator.clipboard.writeText(company.inviteCode!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              </CopyButton>
            </InviteValue>
            {company.inviteCodeExpiresAt && (
              <ExpireText $expired={isExpired}>
                {isExpired ? 'Expired' : `Expires: ${new Date(company.inviteCodeExpiresAt).toLocaleDateString()}`}
              </ExpireText>
            )}
          </InviteBox>
        )}
      </HeaderSection>

      {loading && <Status>Loading members...</Status>}
      {error && <Status>{error}</Status>}

      {!loading && !error && members.length === 0 && (
        <Status>No members found.</Status>
      )}

      {!loading && !error && members.length > 0 && (
        <MemberGrid>
          {members.map((member) => (
            <MemberCard key={member.id}>
              {member.avatarUrl ? (
                <Avatar 
                  src={member.avatarUrl} 
                  alt={member.fullName} 
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedMember(member)}
                />
              ) : (
                <Initials
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedMember(member)}
                >
                  {(member.fullName || member.email || "User")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </Initials>
              )}

              <MemberInfo>
                <Name>{member.fullName || member.email || "User"}</Name>
                <Meta>{member.email}</Meta>
              </MemberInfo>

              <RoleTag>{member.role.toLowerCase()}</RoleTag>
              
              {canManageRoles && member.id !== user?.id && (
                <div style={{ position: "relative" }}>
                  <ActionBtn onClick={() => setMenuOpenId(menuOpenId === member.id ? null : member.id)}>
                    <MoreVertical size={18} />
                  </ActionBtn>
                  {menuOpenId === member.id && (
                    <MenuDropdown>
                      {member.role === "MEMBER" && (
                        <MenuItem onClick={() => handleRoleChange(member.id, "ADMIN")}>
                          <Shield size={14} /> Cấp quyền Admin
                        </MenuItem>
                      )}
                      {member.role === "ADMIN" && (
                        <MenuItem onClick={() => handleRoleChange(member.id, "MEMBER")}>
                          <ShieldAlert size={14} /> Bỏ quyền Admin
                        </MenuItem>
                      )}
                      <MenuItem $danger onClick={() => handleRemoveMember(member.id)}>
                        <UserMinus size={14} /> Xóa khỏi công ty
                      </MenuItem>
                    </MenuDropdown>
                  )}
                </div>
              )}
            </MemberCard>
          ))}
        </MemberGrid>
      )}

      <UserProfileModal 
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        user={selectedMember}
      />
    </Container>
  );
}

const Container = styled.div`
  padding: 30px;

  background: ${({ theme }) => theme.colors.background};

  min-height: 100vh;
`;

const Header = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SubHeader = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin: 4px 0 0 0;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const InviteBox = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
`;

const InviteLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const InviteValue = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.borderLight};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textMuted};
  border-radius: 4px;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.primary};
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ExpireText = styled.div<{ $expired?: boolean }>`
  font-size: 11px;
  color: ${({ $expired, theme }) => $expired ? theme.colors.danger : theme.colors.textMuted};
  font-weight: 500;
`;

const Status = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
`;

const MemberGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  object-fit: cover;
  border-radius: 50%;
`;

const Initials = styled.div`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const Name = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Meta = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const RoleTag = styled.div`
  padding: 6px 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  text-transform: capitalize;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 4px 0;
  min-width: 180px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  z-index: 10;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: transparent;
  border: none;
  font-size: 13px;
  color: ${({ $danger, theme }) => $danger ? theme.colors.danger : theme.colors.textPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${({ $danger, theme }) => $danger ? theme.colors.danger + '15' : theme.colors.borderLight};
  }
`;
