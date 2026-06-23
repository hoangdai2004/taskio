"use client";

import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { colors } from "@/styles/colors";
import { Building2, Save } from "lucide-react";

export default function CompanySettingsPage() {
  const { activeCompanyId, companies, setCompanies } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeCompany = companies.find(c => c.id === activeCompanyId);

  useEffect(() => {
    if (activeCompany) {
      setName(activeCompany.name);
      setSlug(activeCompany.slug);
    }
  }, [activeCompany]);

  const handleSave = async () => {
    if (!activeCompanyId || !name.trim()) return;

    try {
      setSaving(true);
      const res = await axios.patch(`/companies/${activeCompanyId}`, {
        name,
        slug
      });

      const updatedCompanies = companies.map(c => 
        c.id === activeCompanyId ? { ...c, name, slug } : c
      );
      setCompanies(updatedCompanies);
      alert("Company settings updated successfully!");
    } catch (err) {
      console.error("Failed to update company:", err);
      alert("Failed to update company settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!activeCompany) return <div>Loading...</div>;

  return (
    <Wrapper>
      <Header>
        <Building2 size={24} color={colors.primary} />
        <Title>Company Settings</Title>
      </Header>

      <Card>
        <Section>
          <Label>Company Name</Label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter company name"
          />
          <Description>This is your company's visible name.</Description>
        </Section>

        <Section>
          <Label>Company Slug (URL)</Label>
          <Input 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)} 
            placeholder="company-slug"
          />
          <Description>The unique identifier used in your company's URL.</Description>
        </Section>

        <Footer>
          <SaveButton onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </SaveButton>
        </Footer>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  max-width: 600px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const Card = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
`;

const Section = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${colors.border};

  &:last-of-type {
    border-bottom: none;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${colors.background};
  color: ${colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primary}20;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-top: 8px;
`;

const Footer = styled.div`
  padding: 16px 24px;
  background: ${colors.borderLight}40;
  display: flex;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
