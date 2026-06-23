import axios from "@/lib/axios";
import axiosRaw from "axios";

export interface Channel {
  id: number;
  name: string;
  type: "project" | "direct";
  project?: {
    id: number;
    name: string;
  };
  members: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  }[];
  messageCount: number;
  lastMessage?: Message;
  createdAt: string;
}

export interface Message {
  id: number;
  content: string;
  channelId: number;
  parentId?: number | null;
  sender: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  reactions: {
    id: number;
    emoji: string;
    userId: number;
    user: {
      id: number;
      fullName: string;
    };
  }[];
  _count?: {
    replies: number;
  };
  attachments?: {
    url: string;
    name: string;
    type: string;
    size?: number;
  }[];
  createdAt: string;
}

export const getChannels = async (companyId: number): Promise<Channel[]> => {
  const { data } = await axios.get<{
    message: string;
    channels: Channel[];
  }>(`/messages/channels?companyId=${companyId}`);
  return data.channels;
};

export const createChannel = async (
  companyId: number,
  channelData: {
    name?: string;
    projectId?: number;
    memberIds?: number[];
  }
): Promise<{ message: string; channel: Channel }> => {
  const { data } = await axios.post<{
    message: string;
    channel: Channel;
  }>(`/messages/channels?companyId=${companyId}`, channelData);
  return data;
};

export const createDirectChannel = async (
  companyId: number,
  targetUserId: number
): Promise<{ message: string; channel: Channel }> => {
  const { data } = await axios.post<{ message: string; channel: Channel }>(
    `/messages/channels/direct?companyId=${companyId}`,
    { targetUserId }
  );
  return data;
};

export const getChannelMessages = async (
  companyId: number,
  channelId: number
): Promise<Message[]> => {
  const { data } = await axios.get<{
    message: string;
    messages: Message[];
  }>(`/messages/channels/${channelId}/messages?companyId=${companyId}`);
  return data.messages;
};

export const sendMessage = async (
  companyId: number,
  channelId: number,
  content: string,
  parentId?: number,
  attachments?: any[]
): Promise<{ message: string; data: Message }> => {
  const { data } = await axios.post<{
    message: string;
    data: Message;
  }>(`/messages/channels/${channelId}/messages?companyId=${companyId}`, {
    content,
    parentId,
    attachments,
  });
  return data;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const { data } = await axiosRaw.post(`${baseUrl}/uploads`, formData, {
    withCredentials: true,
  });
  return data;
};

export const getThreadMessages = async (
  companyId: number,
  messageId: number
): Promise<Message[]> => {
  const { data } = await axios.get<{
    message: string;
    thread: Message[];
  }>(`/messages/${messageId}/thread?companyId=${companyId}`);
  return data.thread;
};

export const getMessages = async (): Promise<Message[]> => {
  const { data } = await axios.get<{
    message: string;
    messages: Message[];
  }>("/messages");
  return data.messages;
};

export const toggleReaction = async (
  messageId: number,
  emoji: string
): Promise<{ message: string; action: "added" | "removed" }> => {
  const { data } = await axios.post<{
    message: string;
    action: "added" | "removed";
  }>(`/messages/${messageId}/reactions`, { emoji });
  return data;
};

export const deleteMessage = async (
  messageId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete<{ message: string }>(
    `/messages/${messageId}`
  );
  return data;
};

export const deleteChannel = async (
  channelId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete<{ message: string }>(
    `/messages/channels/${channelId}`
  );
  return data;
};