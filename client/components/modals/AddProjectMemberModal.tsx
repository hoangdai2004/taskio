"use client";

import styled from "styled-components";
import { X, Search, Check, Plus, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { getCompanyMembers, CompanyMember } from "@/lib/services/companies.service";
import { addProjectMember } from "@/lib/services/projects.service";
import { useAuth } from "@/context/AuthContext";
import { ProjectMember } from "@/lib/services/projects.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectMembers: ProjectMember[];
  onMemberAdded?: () => void;
}

export default function AddProjectMemberModal({
  isOpen,
  onClose,
  projectId,
  projectMembers,
  onMemberAdded,
}: Props) {
  const { activeCompanyId } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && activeCompanyId) {
      fetchMembers();
    }
  }, [isOpen, activeCompanyId]);

  const fetchMembers = async () => {
    if (!activeCompanyId) return;
    try {
      setLoading(true);
      setError("");
      const res = await getCompanyMembers(activeCompanyId);
      setMembers(res.members || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load company members.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberId: number) => {
    if (!activeCompanyId || !projectId) return;
    try {
      setAddingId(memberId);
      setError("");
      await addProjectMember(projectId, activeCompanyId, memberId);
      onMemberAdded?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add member to project.");
    } finally {
      setAddingId(null);
    }
  };

  if (!isOpen) return null;

  const projectMemberIds = new Set(projectMembers.map((m) => m.id));

  // Filter out members who are already in the project, then apply search term
  const availableMembers = members
    .filter((m) => !projectMemberIds.has(m.id))
    .filter((m) => m.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Add Member to Project</Title>
          <CloseBtn onClick={onClose}>
            <X size={20} />
          </CloseBtn>
        </Header>

        <Body>
          <SearchBox>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search members by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          {error && <ErrorText>{error}</ErrorText>}

          <ListContainer>
            {loading ? (
              <EmptyState>Loading members...</EmptyState>
            ) : availableMembers.length > 0 ? (
              availableMembers.map((member) => (
                <MemberItem key={member.id}>
                  <MemberInfo>
                    <Avatar
                      src={member.avatarUrl || "https://www.svgrepo.com/show/475656/google-color.svg"}
                      alt={member.fullName}
                    />
                    <MemberDetails>
                      <Name>{member.fullName}</Name>
                      <Email>{member.email}</Email>
                    </MemberDetails>
                  </MemberInfo>
                  <AddBtn
                    disabled={addingId === member.id}
                    onClick={() => handleAddMember(member.id)}
                  >
                    {addingId === member.id ? (
                      <span className="spin">⟳</span>
                    ) : (
                      <>
                        <Plus size={14} /> Add
                      </>
                    )}
                  </AddBtn>
                </MemberItem>
              ))
            ) : (
              <EmptyState>
                {searchTerm
                  ? "No matching members found."
                  : "All company members are already in this project."}
              </EmptyState>
            )}
          </ListContainer>
        </Body>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Body = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};

  input {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textPrimary};

    &::placeholder {
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 400px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.card};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.borderLight};
`;

const MemberDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Email = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spin {
    display: inline-block;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger || "#ef4444"};
  font-size: 13px;
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 6px;
`;
