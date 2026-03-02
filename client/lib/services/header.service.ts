import axios from "@/lib/axios";

export const getHeaderData = async () => {
  const response = await axios.get("/api/header");
  return response.data;
};