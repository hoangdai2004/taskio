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
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";

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

          <Button variant="icon" onClick={() => setShowEditModal(true)} title="Edit Project">
            <Pencil size={16} />
          </Button>
        </Left>

        <Right>
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setShowAddMember(true)} hideTextOnMobile>Add Member</Button>

          <InviteContainer>
            <Button variant="outline" icon={<Plus size={14} />} onClick={() => setShowInvite(!showInvite)} hideTextOnMobile>Invite Code</Button>

            {showInvite && project.inviteCode && (
              <InvitePopup>
                <PopupHeader>
                  <span>Project Invite</span>
                  <Button variant="ghost" size="icon" onClick={handleRefreshInvite} disabled={isRefreshing}>
                    <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
                  </Button>
                </PopupHeader>
                <InviteCode style={{ opacity: isExpired ? 0.5 : 1 }}>
                  {isExpired ? 'EXPIRED' : project.inviteCode}
                </InviteCode>
                {project.inviteCodeExpiresAt && (
                  <ExpireInfo $expired={isExpired}>
                    {isExpired ? 'Code expired' : `Expires: ${new Date(project.inviteCodeExpiresAt).toLocaleDateString()}`}
                  </ExpireInfo>
                )}
                <Button variant="primary" size="sm" icon={copied ? <Check size={14} /> : <Copy size={14} />} disabled={isExpired} onClick={handleCopyInvite}>{copied ? "Copied!" : "Copy Code"}</Button>
              </InvitePopup>
            )}
          </InviteContainer>

          <Members>
            {project.members.slice(0, 4).map((m) => (
              <Avatar key={m.id} src={m.avatarUrl} title={`${m.fullName} • ${m.role.toLowerCase()}`} size="md" />
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
            <Avatar src={member.avatarUrl} alt={member.fullName} size="md" />
            <MemberInfo>
              <MemberName>{member.fullName}</MemberName>
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
            <Button variant="icon" onClick={() => setShowOptionsMenu(!showOptionsMenu)} title="More options">
              <MoreHorizontal size={16} />
            </Button>

            {showOptionsMenu && (
              <OptionsMenu>
                <OptionItem $danger onClick={() => { setShowDeleteConfirm(true); setShowOptionsMenu(false); }}>
                  <MoreHorizontal size={14} /> Delete Project
                </OptionItem>
              </OptionsMenu>
            )}

            <Modal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              title="Delete Project"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteProject}>Delete Project</Button>
                </>
              }
            >
              <DeleteWarning>
                Are you sure you want to delete <strong>{project.name}</strong>? 
                This will permanently remove all tasks and data associated with this project.
              </DeleteWarning>
            </Modal>
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

const InviteContainer = styled.div`
  position: relative;
`;

const RelativeContainer = styled.div`
  position: relative;
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

const DeleteWarning = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.4;
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
