import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isAuthPage = window.location.pathname.startsWith("/auth");

        localStorage.removeItem("user");
        localStorage.removeItem("companies");
        localStorage.removeItem("activeCompanyId");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("companies");
        sessionStorage.removeItem("activeCompanyId");

        if (!isAuthPage) {
          window.location.href = "/auth/signin";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default instance;