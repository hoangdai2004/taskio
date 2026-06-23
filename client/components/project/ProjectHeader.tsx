"use client";

import styled from "styled-components";
import { Project } from "@/types/project.type";
import {
  Pencil,
  Calendar,
  Plus,
  MoreHorizontal,
  Copy,
  Check,
  RefreshCw,
  Filter,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { deleteProject, refreshProjectInviteCode } from "@/lib/services/projects.service";
import EditProjectModal from "@/components/modals/EditProjectModal";
import AddProjectMemberModal from "@/components/modals/AddProjectMemberModal";

interface Props {
  project: Project;
  onProjectUpdated?: () => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
}

export default function ProjectHeader({ 
  project, 
  onProjectUpdated,
  priorityFilter,
  setPriorityFilter,
  dateFilter,
  setDateFilter
}: Props) {
  const router = useRouter();
  const { activeCompanyId } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const handleCopyInvite = async () => {
    if (!project.inviteCode) return;
    try {
      await navigator.clipboard.writeText(project.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeCompanyId) return;
    try {
      setIsDeleting(true);
      await deleteProject(project.id, activeCompanyId);
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  const handleRefreshInvite = async () => {
    if (!activeCompanyId) return;
    try {
      setIsRefreshing(true);
      await refreshProjectInviteCode(project.id, activeCompanyId);
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error("Failed to refresh invite:", err);
      alert("Failed to refresh invite code");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isExpired = !!(project.inviteCodeExpiresAt && new Date() > new Date(project.inviteCodeExpiresAt));

  return (
    <Wrapper>
      <Top>
        <Left>
          <Title>{project.name}</Title>

          <IconBtn onClick={() => setShowEditModal(true)} title="Edit Project">
            <Pencil size={16} />
          </IconBtn>
        </Left>

        <Right>
          <AddMemberButton onClick={() => setShowAddMember(true)}>
            <Plus size={14} />
            Add Member
          </AddMemberButton>

          <InviteContainer>
            <InviteButton onClick={() => setShowInvite(!showInvite)}>
              <Plus size={14} />
              Invite Code
            </InviteButton>

            {showInvite && project.inviteCode && (
              <InvitePopup>
                <PopupHeader>
                  <span>Project Invite</span>
                  <RefreshBtn onClick={handleRefreshInvite} disabled={isRefreshing}>
                    <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
                  </RefreshBtn>
                </PopupHeader>
                <InviteCode style={{ opacity: isExpired ? 0.5 : 1 }}>
                  {isExpired ? 'EXPIRED' : project.inviteCode}
                </InviteCode>
                {project.inviteCodeExpiresAt && (
                  <ExpireInfo $expired={isExpired}>
                    {isExpired ? 'Code expired' : `Expires: ${new Date(project.inviteCodeExpiresAt).toLocaleDateString()}`}
                  </ExpireInfo>
                )}
                <CopyButton disabled={isExpired} onClick={handleCopyInvite}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Code"}
                </CopyButton>
              </InvitePopup>
            )}
          </InviteContainer>

          <Members>
            {project.members.slice(0, 4).map((m) => (
              <Avatar key={m.id} src={m.avatar} title={`${m.name} • ${m.role.toLowerCase()}`} />
            ))}
            {project.members.length > 4 && (
              <MoreCount>+{project.members.length - 4}</MoreCount>
            )}
          </Members>
        </Right>
      </Top>

      <Team id="project-team">
        {project.members.map((member) => (
          <MemberCard key={member.id}>
            <AvatarSmall src={member.avatar} alt={member.name} />
            <MemberInfo>
              <MemberName>{member.name}</MemberName>
              <RoleTag>{member.role.toLowerCase()}</RoleTag>
            </MemberInfo>
          </MemberCard>
        ))}
      </Team>

      <Bottom>
        <Left>
          <FilterWrapper>
            <Filter size={14} color="#64748b" />
            <Select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FilterWrapper>

          <FilterWrapper>
            <Clock size={14} color="#64748b" />
            <Select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="overdue">Overdue</option>
            </Select>
          </FilterWrapper>
        </Left>

        <Right>
          <RelativeContainer>
            <IconBtn onClick={() => setShowOptionsMenu(!showOptionsMenu)} title="More options">
              <MoreHorizontal size={16} />
            </IconBtn>

            {showOptionsMenu && (
              <OptionsMenu>
                <OptionItem $danger onClick={() => { setShowDeleteConfirm(true); setShowOptionsMenu(false); }}>
                  <MoreHorizontal size={14} /> Delete Project
                </OptionItem>
              </OptionsMenu>
            )}

            {showDeleteConfirm && (
              <ModalOverlay onClick={() => setShowDeleteConfirm(false)}>
                <DeletePopup onClick={(e) => e.stopPropagation()}>
                  <DeleteWarningTitle>Delete Project</DeleteWarningTitle>
                  <DeleteWarning>
                    Are you sure you want to delete <strong>{project.name}</strong>? 
                    This will permanently remove all tasks and data associated with this project.
                  </DeleteWarning>
                  <DeleteActions>
                    <CancelBtn onClick={() => setShowDeleteConfirm(false)}>Cancel</CancelBtn>
                    <ConfirmDeleteBtn onClick={handleDeleteProject} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Project"}
                    </ConfirmDeleteBtn>
                  </DeleteActions>
                </DeletePopup>
              </ModalOverlay>
            )}
          </RelativeContainer>
        </Right>
      </Bottom>

      <EditProjectModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={project}
        onProjectUpdated={() => {
          if (onProjectUpdated) onProjectUpdated();
        }}
      />

      <AddProjectMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        projectId={project.id}
        projectMembers={project.members}
        onMemberAdded={() => {
          if (onProjectUpdated) onProjectUpdated();
        }}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px 24px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Bottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 18px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    > * {
      flex: 1;
      min-width: 140px;
    }
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const IconBtn = styled.div`
  width: 28px;
  height: 28px;

  background: ${({ theme }) => theme.colors.borderLight};

  color: ${({ theme }) => theme.colors.primary};

  border-radius: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
`;

const InviteContainer = styled.div`
  position: relative;
`;

const RelativeContainer = styled.div`
  position: relative;
`;

const AddMemberButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  font-size: 13px;
  padding: 8px 14px;
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const InviteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  font-size: 13px;
  padding: 8px 14px;
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const InvitePopup = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
  z-index: 10;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: -4px;

  span {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const RefreshBtn = styled.button`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
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

const InviteCode = styled.div`
  font-family: monospace;
  background: ${({ theme }) => theme.colors.borderLight};
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  letter-spacing: 1px;
`;

const ExpireInfo = styled.div<{ $expired?: boolean }>`
  font-size: 11px;
  color: ${({ $expired, theme }) => $expired ? "#dc2626" : theme.colors.textMuted};
  text-align: center;
  margin-top: -4px;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Members = styled.div`
  display: flex;
  align-items: center;
`;

const MoreCount = styled.div`
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  margin-left: -6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  border: 2px solid ${({ theme }) => theme.colors.card};
`;

const Avatar = styled.img`
  width: 30px;
  height: 30px;

  border-radius: 50%;

  border: 2px solid ${({ theme }) => theme.colors.card};

  margin-left: -6px;
`;

const Team = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
`;

const MemberCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 10px 12px;
`;

const AvatarSmall = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: ${({ theme }) => theme.colors.border};
`;

const MemberInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RoleTag = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: capitalize;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;

  background: ${({ theme }) => theme.colors.card};

  border: 1px solid ${({ theme }) => theme.colors.border};

  border-radius: 8px;

  padding: 6px 12px;

  font-size: 13px;

  color: ${({ theme }) => theme.colors.textSecondary};

  cursor: pointer;
`;

const DeletePopup = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 400px;
  max-width: 90vw;
  z-index: 1001;
`;

const DeleteWarningTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const OptionsMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 100;
`;

const OptionItem = styled.div<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  color: ${({ $danger, theme }) => $danger ? "#dc2626" : theme.colors.textPrimary};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${({ $danger, theme }) => $danger ? "#fef2f2" : theme.colors.borderLight};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteWarning = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
`;

const DeleteActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelBtn = styled.button`
  padding: 6px 10px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const ConfirmDeleteBtn = styled.button`
  padding: 6px 10px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #b91c1c;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 6px 12px;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Select = styled.select`
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  outline: none;
  padding-right: 4px;
`;
