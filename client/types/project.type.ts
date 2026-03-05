export interface User {
  id: number;
  name: string;
  avatar: string;
}

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "progress" | "done";

export interface Task {
  id: number;
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

  members: User[];

  tasks: Task[];
}