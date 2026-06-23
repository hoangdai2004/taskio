import axios from "@/lib/axios";

export const globalSearch = async (query: string) => {
  const { data } = await axios.get(`/search?q=${encodeURIComponent(query)}`);
  return data;
};