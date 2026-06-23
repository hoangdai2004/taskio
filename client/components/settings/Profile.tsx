"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";
import { settingsService } from "@/lib/services/settings.service";
import { uploadFile } from "@/lib/services/messages.service";
import { Upload } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

export default function SettingsProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.fullName || user?.name || "",
    email: user?.email || "",
    bio: "",
    avatar: user?.avatar || user?.avatarUrl || "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await settingsService.getProfile();
        setProfile({
          name: profileData.fullName || profileData.email || "",
          email: profileData.email || "",
          bio: "",
          avatar: profileData.avatarUrl || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await settingsService.updateProfile({
        fullName: profile.name,
        avatarUrl: profile.avatar,
      });

      if (user?.email !== profile.email) {
        try {
          const accountResponse = await settingsService.updateAccount({
            email: profile.email,
          });
          if (user && setUser) {
            setUser({
              ...user,
              email: accountResponse.user.email,
              fullName: response.profile.fullName,
              avatarUrl: response.profile.avatarUrl,
            });
          }
        } catch (accountError) {
          console.error("Failed to update email:", accountError);
        }
      } else if (user && setUser) {
        setUser({
          ...user,
          fullName: response.profile.fullName,
          avatarUrl: response.profile.avatarUrl,
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      setProfile((prev) => ({ ...prev, avatar: response.url }));
    } catch (error) {
      console.error("Failed to upload avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Wrapper>
      <Title>Profile Settings</Title>

      <Card>
        <AvatarSection>
          <AvatarPreview>
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" />
            ) : (
              <div className="placeholder">{profile.name?.charAt(0) || "U"}</div>
            )}
          </AvatarPreview>
          <Field style={{ flex: 1 }}>
            <label>Upload Avatar</label>
            <UploadButton as="label">
              <Upload size={16} />
              {isUploading ? "Uploading..." : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploading}
                style={{ display: "none" }}
              />
            </UploadButton>
          </Field>
        </AvatarSection>

        <Field>
          <label>Name</label>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Your name"
          />
        </Field>

        <Field>
          <label>Email</label>
          <input
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="email@example.com"
          />
        </Field>

        <Field>
          <label>Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Tell something about yourself..."
          />
        </Field>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.card};
  padding: 24px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
`;

const AvatarPreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 32px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 13px;
    margin-bottom: 6px;
  }

  input,
  textarea {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  textarea {
    min-height: 100px;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  border: none;

  background: ${({ theme }) => theme.colors.primary};
  color: white;

  cursor: pointer;
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  cursor: pointer;
  width: max-content;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;