import axios from "@/lib/axios";

export interface ProfileData {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export interface AppearanceSettings {
  theme: string;
}

export const getProfile = async (): Promise<ProfileData> => {
  const { data } = await axios.get<{
    message: string;
    profile: ProfileData;
  }>("/settings/profile");
  return data.profile;
};

export const updateProfile = async (profileData: {
  fullName?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<{ message: string; profile: ProfileData }> => {
  const { data } = await axios.put<{
    message: string;
    profile: ProfileData;
  }>("/settings/profile", profileData);
  return data;
};

export interface AccountResponseUser {
  id: number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  [key: string]: unknown;
}

export const updateAccount = async (accountData: {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ message: string; user: AccountResponseUser }> => {
  const { data } = await axios.put<{
    message: string;
    user: AccountResponseUser;
  }>("/settings/account", accountData);
  return data;
};

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const { data } = await axios.get<{
    message: string;
    settings: NotificationSettings;
  }>("/settings/notifications");
  return data.settings;
};

export const updateNotificationSettings = async (
  settings: NotificationSettings
): Promise<{ message: string }> => {
  const { data } = await axios.put<{
    message: string;
  }>("/settings/notifications", settings);
  return data;
};

export const getAppearanceSettings = async (): Promise<AppearanceSettings> => {
  const { data } = await axios.get<{
    message: string;
    settings: AppearanceSettings;
  }>("/settings/appearance");
  return data.settings;
};

export const updateAppearanceSettings = async (
  settings: AppearanceSettings
): Promise<{ message: string }> => {
  const { data } = await axios.put<{
    message: string;
  }>("/settings/appearance", settings);
  return data;
};

export const settingsService = {
  getProfile,
  updateProfile,
  updateAccount,
  getNotificationSettings,
  updateNotificationSettings,
  getAppearanceSettings,
  updateAppearanceSettings,
};