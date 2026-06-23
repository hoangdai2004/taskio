export interface User {
  id: number;
  name: string;
  avatar: string;
}

export interface ProjectMember {
  id: number;
  name: string;
  avatar: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "progress" | "review" | "done";

export interface Task {
  id: number;
  code?: string;
  title: string;
  desc: string;

  status: Status;
  priority: Priority;

  comments: number;
  files: number;

  assignees: User[];
}

export interface Column {
  id: Status;
  title: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  slug: string;
  inviteCode?: string;
  inviteCodeExpiresAt?: string;
  members: ProjectMember[];

  tasks: Task[];
  color: string;
}