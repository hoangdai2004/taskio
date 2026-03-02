export interface IUser {
  id: string;
  name: string;
  location: string;
  avatar: string;
}

export interface INotification {
  id: string;
  title: string;
  isRead: boolean;
  createdAt: string;
}

export interface ISearchResult {
  id: string;
  title: string;
  type: "task" | "project";
}