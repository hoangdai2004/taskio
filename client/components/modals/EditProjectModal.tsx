"use client";

import styled from "styled-components";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateProject } from "@/lib/services/projects.service";
import { Project } from "@/types/project.type";
import Button from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProjectUpdated: () => void;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}: EditProjectModalProps) {
  const { activeCompanyId } = useAuth();
  const [projectName, setProjectName] = useState(project.name);
  const [projectDesc, setProjectDesc] = useState(project.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectName(project.name);
      setProjectDesc(project.description || "");
      setFormError(null);
    }
  }, [isOpen, project]);

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      setFormError("Project name is required.");
      return;
    }

    if (!activeCompanyId) {
      setFormError("No active company context.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await updateProject(project.id, activeCompanyId, {
        name: projectName,
        description: projectDesc,
      });
      onProjectUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
      setFormError("Unable to update the project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        isLoading={isSubmitting}
        disabled={!projectName.trim()}
      >
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project" footer={footer}>
      <FormGroup>
        <Input
          label="Project Name *"
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </FormGroup>

      <FormGroup>
        <TextArea
          label="Description"
          placeholder="Enter project description (optional)"
          value={projectDesc}
          onChange={(e) => setProjectDesc(e.target.value)}
          rows={4}
        />
      </FormGroup>

      {formError && <ErrorText>{formError}</ErrorText>}
    </Modal>
  );
}

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
  margin-top: 16px;
`;
