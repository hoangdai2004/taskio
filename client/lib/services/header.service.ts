import axios from "@/lib/axios";
import { IUser, INotification, ISearchResult } from "@/types/header.type";

export const getUserInfo = async (): Promise<IUser> => {
  const { data } = await axios.get<IUser>("/api/user/me");
  return data;
};

export const getNotifications = async (): Promise<INotification[]> => {
  const { data } = await axios.get<INotification[]>("/api/notifications");
  return data;
};

export const search = async (
  keyword: string
): Promise<ISearchResult[]> => {
  const { data } = await axios.get<ISearchResult[]>("/api/search", {
    params: { q: keyword },
  });

  return data;
};