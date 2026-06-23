import axios from "@/lib/axios";

export interface Notification {
  id: number;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const { data } = await axios.get<{
    message: string;
    notifications: Notification[];
  }>("/notifications");
  return data.notifications;
};

export const markAsRead = async (
  notificationId: number
): Promise<{ message: string }> => {
  const { data } = await axios.put<{
    message: string;
  }>(`/notifications/${notificationId}/read`);
  return data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
  const { data } = await axios.put<{
    message: string;
  }>("/notifications/read-all");
  return data;
};