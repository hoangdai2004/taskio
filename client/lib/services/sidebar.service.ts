import axios from "@/lib/axios";
import {IProject} from "@/types/sidebar.type"

export const getProject = async (): Promise<IProject[]> => {
    const { data } = await axios.get<IProject[]>("api/project")

    return data;
}