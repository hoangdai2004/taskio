import axios from "@/lib/axios";

export interface TaskItem {
  id: number;
  code: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  projectId: number;
  project: string;
  assignee?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  createdBy: string;
  comments: number;
  files: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDetail extends TaskItem {
  commentsDetail: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId: number;
  assigneeId?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  assigneeId?: number | null;
}

export interface GetTasksFilters {
  projectId?: number;
  status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: number;
  dueDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getTasks = async (
  companyId: number,
  filters?: GetTasksFilters
): Promise<{ 
  message: string; 
  tasks: TaskItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const queryParams = new URLSearchParams({
    companyId: String(companyId),
    ...(filters?.projectId && { projectId: String(filters.projectId) }),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.priority && { priority: filters.priority }),
    ...(filters?.assigneeId && { assigneeId: String(filters.assigneeId) }),
    ...(filters?.dueDate && { dueDate: filters.dueDate }),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.page && { page: String(filters.page) }),
    ...(filters?.limit && { limit: String(filters.limit) }),
  });

  const { data } = await axios.get(`/tasks?${queryParams}`);
  return data;
};

export const getTaskDetail = async (
  taskId: number,
  companyId: number
): Promise<{ message: string; task: TaskDetail }> => {
  const { data } = await axios.get(`/tasks/${taskId}?companyId=${companyId}`);
  return data;
};

export const createTask = async (
  companyId: number,
  payload: CreateTaskPayload
): Promise<{ id: number; title: string; message: string }> => {
  const { data } = await axios.post(`/tasks?companyId=${companyId}`, payload);
  return data;
};

export const updateTask = async (
  taskId: number,
  companyId: number,
  payload: UpdateTaskPayload
): Promise<{
  id: number;
  title: string;
  assignee?: any;
  message: string;
}> => {
  const { data } = await axios.put(
    `/tasks/${taskId}?companyId=${companyId}`,
    payload
  );
  return data;
};

export const deleteTask = async (
  taskId: number,
  companyId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete(
    `/tasks/${taskId}?companyId=${companyId}`
  );
  return data;
};

export const addComment = async (
  taskId: number,
  companyId: number,
  content: string
): Promise<{
  id: number;
  content: string;
  user: any;
  createdAt: string;
  message: string;
}> => {
  const { data } = await axios.post(
    `/tasks/${taskId}/comments?companyId=${companyId}`,
    { content }
  );
  return data;
};

export const assignTask = async (
  taskId: number,
  companyId: number,
  assigneeId: number
): Promise<{
  id: number;
  assignee: any;
  message: string;
}> => {
  const { data } = await axios.post(
    `/tasks/${taskId}/assign?companyId=${companyId}`,
    { assigneeId }
  );
  return data;
};

export const bulkDeleteTasks = async (
  companyId: number,
  taskIds: number[]
): Promise<{ message: string; count: number }> => {
  const { data } = await axios.delete(`/tasks/bulk?companyId=${companyId}`, {
    data: { taskIds },
  });
  return data;
};
