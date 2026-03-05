import axios from "@/lib/axios";
import { Project } from "@/types/project.type";

export const getProject = async (): Promise<Project[]> => {
  const res = await axios.get("api/projects");

  return res.data;
};