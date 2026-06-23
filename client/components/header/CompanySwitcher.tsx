"use client";

import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { ChevronDown, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { setActiveCompany } from "@/lib/services/auth.service";

type Props = {
  onCompanyChanged?: () => void;
};

export default function CompanySwitcher({ onCompanyChanged }: Props) {
  const { activeCompanyId, setActiveCompanyId, companies } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCompany = companies?.find(c => c.id === activeCompanyId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCompanySelect = async (companyId: number) => {
    try {
      await setActiveCompany(companyId);

      setActiveCompanyId(companyId);

      const storage = localStorage.getItem("user")
        ? localStorage
        : sessionStorage;

      storage.setItem("activeCompanyId", String(companyId));

      setIsOpen(false);

      onCompanyChanged?.();

    } catch (err) {
      console.error(err);
    }
  };

  if (!activeCompany) return null;

  return (
    <Wrapper ref={dropdownRef}>
      <CompanyButton onClick={() => setIsOpen(!isOpen)}>
        <Building2 size={16} />
        <CompanyName>{activeCompany.name}</CompanyName>
        <ChevronDown size={14} />
      </CompanyButton>

      {isOpen && (
        <Dropdown>
          {companies?.map((company) => (
            <CompanyItem
              key={company.id}
              onClick={() => handleCompanySelect(company.id)}
              className={company.id === activeCompanyId ? "active" : ""}
            >
              <Building2 size={14} />
              <div>
                <CompanyNameItem>{company.name}</CompanyNameItem>
                <CompanyRole>{company.role}</CompanyRole>
              </div>
            </CompanyItem>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const CompanyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
  }
`;

const CompanyName = styled.span`
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 4px;
`;

const CompanyItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }

  &.active {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CompanyNameItem = styled.div`
  font-weight: 500;
  font-size: 14px;
`;

const CompanyRole = styled.div`
  font-size: 12px;
  color: #6c757d;
  text-transform: capitalize;
`;