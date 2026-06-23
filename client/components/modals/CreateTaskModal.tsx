"use client";

import styled from "styled-components";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { colors } from "@/styles/colors";
import { getProjects, getProjectDetail } from "@/lib/services/projects.service";
import { useAuth } from "@/context/AuthContext";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description?: string, projectId?: number, assigneeId?: number, priority?: string, dueDate?: string, status?: string) => Promise<void>;
  projects: { id: number; name: string }[];
  defaultStatus?: string;
  defaultProjectId?: number;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projects: initialProjects,
  defaultStatus,
  defaultProjectId,
}: CreateTaskModalProps) {
  const { activeCompanyId } = useAuth();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(defaultProjectId);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | undefined>();
  const [status, setStatus] = useState<string>(defaultStatus || "TODO");
  const [priority, setPriority] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [projects, setProjects] = useState(initialProjects);

  const [projectMembers, setProjectMembers] = useState<{ id: number; fullName: string; avatarUrl?: string }[]>([]);

  useEffect(() => {
    if (isOpen && activeCompanyId) {
      const loadProjects = async () => {
        try {
          const { projects: loadedProjects } = await getProjects(activeCompanyId);
          const list = loadedProjects.map((p) => ({ id: p.id, name: p.name }));
          setProjects(list);
          if (!selectedProjectId && list.length > 0) {
            setSelectedProjectId(list[0].id);
          }
        } catch (error) {
          console.error("Failed to load projects:", error);
          setProjects([]);
        }
      };
      loadProjects();
    }
  }, [isOpen, activeCompanyId]);

  useEffect(() => {
    if (projects.length > 0 && selectedProjectId === undefined) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId && activeCompanyId) {
      const loadMembers = async () => {
        try {
          const { project } = await getProjectDetail(selectedProjectId, activeCompanyId);
          setProjectMembers(project.members);
          setSelectedAssigneeId(undefined); // Reset assignee when project changes
        } catch (error) {
          console.error("Failed to load project members", error);
          setProjectMembers([]);
        }
      };
      loadMembers();
    } else {
      setProjectMembers([]);
    }
  }, [selectedProjectId, activeCompanyId]);

  const handleSubmit = async () => {
    if (!taskTitle.trim()) {
      setFormError("Task title is required.");
      return;
    }

    if (!selectedProjectId) {
      setFormError("Please choose a project for this task.");
      return;
    }

    if (!selectedAssigneeId) {
      setFormError("Please assign this task to a member.");
      return;
    }

    if (!priority) {
      setFormError("Please select a priority.");
      return;
    }

    if (!dueDate) {
      setFormError("Please set a due date.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onSubmit(taskTitle, taskDesc, selectedProjectId, selectedAssigneeId, priority, dueDate, status);
      setTaskTitle("");
      setTaskDesc("");
      setPriority("");
      setDueDate("");
      setSelectedAssigneeId(undefined);
      setSelectedProjectId(defaultProjectId);
      setStatus(defaultStatus || "TODO");
      onClose();
    } catch (error: any) {
      console.error("Failed to create task:", error);
      setFormError("Unable to create the task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Create New Task</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FormGroup>
            <Label>Task Title *</Label>
            <Input
              placeholder="Enter task title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Project</Label>
            <Select
              value={selectedProjectId ?? ""}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Choose a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          {formError && <ErrorText>{formError}</ErrorText>}

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </Select>
            </FormGroup>

            <FormGroup style={{ flex: 1 }}>
              <Label>Assignee</Label>
              <Select
                value={selectedAssigneeId ?? ""}
                onChange={(e) => setSelectedAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
                disabled={!selectedProjectId}
              >
                <option value="">Choose an assignee</option>
                {projectMembers.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.fullName || "User"}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup style={{ flex: 1 }}>
              <Label>Priority</Label>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="">Select priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </FormGroup>

            <FormGroup style={{ flex: 1 }}>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              placeholder="Enter task description (optional)"
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              rows={4}
            />
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SubmitButton
            onClick={handleSubmit}
            disabled={!taskTitle.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </SubmitButton>
        </ModalFooter>
      </Modal>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const CancelButton = styled.button`
  padding: 10px 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const SubmitButton = styled.button`
  padding: 10px 18px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
