"use client";

import styled from "styled-components";
import { X, Mail, Calendar, User, Shield, MessageSquare } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { CompanyMember } from "@/lib/services/companies.service";
import { useAuth } from "@/context/AuthContext";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CompanyMember | null;
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const { user: currentUser } = useAuth();
  
  if (!isOpen || !user) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>
        <ProfileContent>
          <AvatarWrapper>
            <Image
              src={user.avatarUrl || "/images/avatar-default.png"}
              alt={user.fullName}
              width={100}
              height={100}
            />
          </AvatarWrapper>
          <UserName>{user.fullName}</UserName>
          <RoleBadge $role={user.role}>
            {user.role === "OWNER" && <Shield size={14} />}
            {user.role === "ADMIN" && <Shield size={14} />}
            {user.role === "MEMBER" && <User size={14} />}
            {user.role === "OWNER" ? "Chủ sở hữu" : user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
          </RoleBadge>

          <DetailsContainer>
            <DetailItem>
              <IconWrapper><Mail size={16} /></IconWrapper>
              <DetailText>
                <span>Email</span>
                <p>{user.email}</p>
              </DetailText>
            </DetailItem>
            
            <DetailItem>
              <IconWrapper><Calendar size={16} /></IconWrapper>
              <DetailText>
                <span>Tham gia vào</span>
                <p>{format(new Date(user.joinedAt), "dd/MM/yyyy")}</p>
              </DetailText>
            </DetailItem>
          </DetailsContainer>

          {currentUser?.id !== user.id && (
            <MessageButton onClick={() => {
              window.dispatchEvent(new CustomEvent('open-direct-message', { detail: { userId: user.id } }));
              onClose();
            }}>
              <MessageSquare size={16} />
              Nhắn tin
            </MessageButton>
          )}
        </ProfileContent>
      </ModalContainer>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  width: 90%;
  max-width: 400px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;

  @keyframes modalScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const Header = styled.div`
  height: 100px;
  background: ${({ theme }) => theme.gradients.main(135)};
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const ProfileContent = styled.div`
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.surface};
  margin-top: -50px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.h2`
  margin: 16px 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RoleBadge = styled.div<{ $role: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $role, theme }) =>
    $role === "OWNER"
      ? "rgba(99, 102, 241, 0.1)"
      : $role === "ADMIN"
      ? "rgba(245, 158, 11, 0.1)"
      : "rgba(34, 197, 94, 0.1)"};
  color: ${({ $role, theme }) =>
    $role === "OWNER"
      ? "var(--color-primary)"
      : $role === "ADMIN"
      ? "var(--color-warning)"
      : "var(--color-success)"};
`;

const DetailsContainer = styled.div`
  width: 100%;
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const DetailText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textMuted};
  }

  p {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const MessageButton = styled.button`
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;
