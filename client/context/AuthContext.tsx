"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/lib/axios";
import { User, Company } from "@/types/auth.type";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  activeCompanyId: number | null;
  setActiveCompanyId: (companyId: number | null) => void;
  companies: Company[];
  setCompanies: (companies: Company[]) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          const storedCompanies =
            localStorage.getItem("companies") ||
            sessionStorage.getItem("companies");

          if (storedCompanies) {
            setCompanies(JSON.parse(storedCompanies));
          }

          const storedCompanyId =
            localStorage.getItem("activeCompanyId") ||
            sessionStorage.getItem("activeCompanyId");

          if (storedCompanyId) {
            setActiveCompanyId(Number(storedCompanyId));
          } else if (parsedUser.activeCompanyId) {
            setActiveCompanyId(parsedUser.activeCompanyId);
          }

          return;
        }

        const res = await axios.get("/auth/me", {
          withCredentials: true,
        });

        const userData = res.data?.user;

        if (userData) {
          setUser(userData);

          const storage = sessionStorage;

          storage.setItem("user", JSON.stringify(userData));

          if (userData.activeCompanyId) {
            setActiveCompanyId(userData.activeCompanyId);
            storage.setItem(
              "activeCompanyId",
              String(userData.activeCompanyId)
            );
          }

          if (userData.companies) {
            setCompanies(userData.companies);
            storage.setItem(
              "companies",
              JSON.stringify(userData.companies)
            );
          }
        }
      } catch (err) {
        setUser(null);
        setActiveCompanyId(null);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        if (e.newValue) {
          const parsedNewUser = JSON.parse(e.newValue);
          setUser((prevUser) => {
            if (prevUser && prevUser.id !== parsedNewUser.id) {
              window.location.reload();
            }
            return parsedNewUser;
          });
        } else {
          window.location.reload();
        }
      }
      if (e.key === "activeCompanyId") {
        setActiveCompanyId(e.newValue ? Number(e.newValue) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);

    if (newUser) {
      const storage = localStorage;

      storage.setItem("user", JSON.stringify(newUser));

      if (newUser.companies) {
        setCompanies(newUser.companies);
        storage.setItem(
          "companies",
          JSON.stringify(newUser.companies)
        );
      }

      if (newUser.activeCompanyId) {
        setActiveCompanyId(newUser.activeCompanyId);
        storage.setItem(
          "activeCompanyId",
          String(newUser.activeCompanyId)
        );
      }
    } else {
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const updateActiveCompanyId = (companyId: number | null) => {
    setActiveCompanyId(companyId);

    if (companyId) {
      localStorage.setItem("activeCompanyId", String(companyId));
    } else {
      localStorage.removeItem("activeCompanyId");
    }
  };

  const updateCompanies = (newCompanies: Company[]) => {
    setCompanies(newCompanies);
    localStorage.setItem("companies", JSON.stringify(newCompanies));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        activeCompanyId,
        setActiveCompanyId: updateActiveCompanyId,
        companies,
        setCompanies: updateCompanies,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};