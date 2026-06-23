import axios from "@/lib/axios";

export interface ProjectItem {
  id: number;
  name: string;
  description?: string;
  taskCount: number;
  createdAt: string;
  color: string;
  slug: string;
}

export interface TaskCard {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignee?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  position?: number;
}

export interface ProjectTasksByStatus {
  [key: string]: TaskCard[];
}

export interface ProjectMember {
  id: number;
  fullName: string;
  avatarUrl?: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface ProjectDetail {
  id: number;
  name: string;
  description?: string;
  taskCount: number;
  inviteCode?: string;
  inviteCodeExpiresAt?: string;
  members: ProjectMember[];
  tasksByStatus: ProjectTasksByStatus;
  createdAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateTaskStatusPayload {
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  position?: number;
}

const createSlug = (name: string, id: number) =>
  `${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${id}`;

export const getProjects = async (
  companyId: number
): Promise<{ message: string; projects: ProjectItem[] }> => {
  const { data } = await axios.get(`/projects?companyId=${companyId}`);

  const projects = data.projects.map((project: ProjectItem) => ({
    ...project,
    slug: project.slug || createSlug(project.name, project.id),
  }));

  return {
    ...data,
    projects,
  };
};

export const getProjectDetail = async (
  projectId: number,
  companyId: number
): Promise<{ message: string; project: ProjectDetail }> => {
  const { data } = await axios.get(
    `/projects/${projectId}?companyId=${companyId}`
  );
  return data;
};

export const createProject = async (
  companyId: number,
  payload: CreateProjectPayload
): Promise<{ message: string; id: number; name: string; inviteCode?: string }> => {
  const { data } = await axios.post(`/projects?companyId=${companyId}`, payload);
  return data;
};

export const joinProject = async (
  companyId: number,
  inviteCode: string
): Promise<{ message: string; project: { id: number; name: string } }> => {
  const { data } = await axios.post(
    `/projects/join?companyId=${companyId}`,
    { inviteCode }
  );
  return data;
};

export const updateProject = async (
  projectId: number,
  companyId: number,
  payload: Partial<CreateProjectPayload>
): Promise<{ message: string; project: ProjectItem }> => {
  const { data } = await axios.put(
    `/projects/${projectId}?companyId=${companyId}`,
    payload
  );
  return data;
};

export const deleteProject = async (
  projectId: number,
  companyId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete(
    `/projects/${projectId}?companyId=${companyId}`
  );
  return data;
};

export const updateTaskStatus = async (
  projectId: number,
  taskId: number,
  companyId: number,
  payload: UpdateTaskStatusPayload
): Promise<{
  message: string;
  task: {
    id: number;
    title: string;
    status: string;
    position?: number;
    assignee?: any;
  };
}> => {
  const { data } = await axios.put(
    `/projects/${projectId}/tasks/${taskId}/status?companyId=${companyId}`,
    payload
  );
  return data;
};

export const refreshProjectInviteCode = async (
  projectId: number,
  companyId: number
): Promise<{ message: string; inviteCode: string; expiresAt: string }> => {
  const { data } = await axios.post(
    `/projects/${projectId}/refresh-invite?companyId=${companyId}`
  );
  return data;
};

export const addProjectMember = async (
  projectId: number,
  companyId: number,
  memberId: number
): Promise<{ message: string }> => {
  const { data } = await axios.post(
    `/projects/${projectId}/members?companyId=${companyId}`,
    { memberId }
  );
  return data;
};
