"use client";

import styled from "styled-components";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { getProjects, joinProject } from "@/lib/services/projects.service";
import { createProject } from "@/lib/services/projects.service";
import { joinCompany } from "@/lib/services/companies.service";
import { colors } from "@/styles/colors";
import { Folder, Plus, X, Building2 } from "lucide-react";

interface ProjectItem {
  id: number;
  name: string;
  description?: string;
  taskCount: number;
  createdAt: string;
  color: string;
  slug: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { activeCompanyId } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectInviteCode, setProjectInviteCode] = useState("");
  const [companyInviteCode, setCompanyInviteCode] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [joiningProject, setJoiningProject] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      if (!activeCompanyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { projects } = await getProjects(activeCompanyId);
        setProjects(projects);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [activeCompanyId]);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !activeCompanyId) return;

    try {
      setCreatingProject(true);
      await createProject(activeCompanyId, {
        name: projectName,
        description: projectDesc,
      });
      setProjectName("");
      setProjectDesc("");
      setShowModal(false);
      const { projects } = await getProjects(activeCompanyId);
      setProjects(projects);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleJoinProject = async () => {
    if (!projectInviteCode.trim() || !activeCompanyId) {
      setJoinError("Please enter a project invite code.");
      return;
    }

    setJoinError("");
    setJoiningProject(true);

    try {
      await joinProject(activeCompanyId, projectInviteCode.trim().toUpperCase());
      setProjectInviteCode("");
      setShowJoinModal(false);
      const { projects } = await getProjects(activeCompanyId);
      setProjects(projects);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      setJoinError(
        err.response?.data?.message || "Could not join project with that code."
      );
    } finally {
      setJoiningProject(false);
    }
  };

  if (loading) {
    return <Wrapper><LoadingMessage>Loading projects...</LoadingMessage></Wrapper>;
  }

  return (
    <Wrapper>
      <Header>
        <div>
          <Title>Projects</Title>
          <Subtitle>Manage all your projects</Subtitle>
        </div>

        <ActionGroup>

          <SecondaryButton onClick={() => setShowJoinModal(true)}>
            Join Project
          </SecondaryButton>
          <CreateButton onClick={() => setShowModal(true)}>
            <Plus size={18} />
            New Project
          </CreateButton>
        </ActionGroup>
      </Header>

      {projects.length === 0 ? (
        <EmptyState>
          <Folder size={48} />
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <EmptyButton onClick={() => setShowModal(true)}>
            Create Project
          </EmptyButton>
        </EmptyState>
      ) : (
        <ProjectGrid>
          {projects.map((project) => (
            <ProjectCard key={project.id}>
              <ProjectColorBar style={{ background: project.color }} />

              <ProjectContent>
                <Link href={`/dashboard/projects/${project.slug}`}>
                  <ProjectName>{project.name}</ProjectName>
                </Link>

                {project.description && (
                  <ProjectDescription>{project.description}</ProjectDescription>
                )}

                <ProjectMeta>
                  <span>{project.taskCount} tasks</span>
                  <span>
                    Created{" "}
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </ProjectMeta>
              </ProjectContent>
            </ProjectCard>
          ))}
        </ProjectGrid>
      )}

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create New Project</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label>Project Name *</Label>
                <Input
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder="Enter project description (optional)"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  rows={4}
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowModal(false)}>
                Cancel
              </CancelButton>
              <SubmitButton
                onClick={handleCreateProject}
                disabled={!projectName.trim() || creatingProject}
              >
                {creatingProject ? "Creating..." : "Create Project"}
              </SubmitButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {showJoinModal && (
        <ModalOverlay onClick={() => setShowJoinModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Join Project</ModalTitle>
              <CloseButton onClick={() => setShowJoinModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label>Project Invite Code *</Label>
                <Input
                  placeholder="Enter invite code..."
                  value={projectInviteCode}
                  onChange={(e) => setProjectInviteCode(e.target.value.toUpperCase())}
                />
                {joinError && <ErrorText>{joinError}</ErrorText>}
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={() => setShowJoinModal(false)}>
                Cancel
              </CancelButton>
              <SubmitButton
                onClick={handleJoinProject}
                disabled={!projectInviteCode.trim() || joiningProject}
              >
                {joiningProject ? "Joining..." : "Join Project"}
              </SubmitButton>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 32px;
  background: ${colors.background};
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.textSecondary};
  margin: 8px 0 0 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.primaryHover};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: ${colors.card};
  color: ${colors.textPrimary};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.borderLight};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.div`
  background: ${colors.card};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  a {
    text-decoration: none;
  }
`;

const ProjectColorBar = styled.div`
  height: 4px;
  width: 100%;
`;

const ProjectContent = styled.div`
  padding: 20px;
`;

const ProjectName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0 0 8px 0;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${colors.primary};
  }
`;

const ProjectDescription = styled.p`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin: 0 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProjectMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: ${colors.textMuted};

  span {
    display: flex;
    align-items: center;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${colors.textSecondary};

  h3 {
    font-size: 20px;
    font-weight: 600;
    margin: 16px 0 8px 0;
  }

  p {
    margin: 0 0 24px 0;
  }
`;

const EmptyButton = styled.button`
  padding: 10px 18px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.primaryHover};
  }
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: ${colors.textSecondary};
`;

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
  background: ${colors.surface};
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${colors.border};
`;

const ModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: ${colors.textPrimary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
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
  color: ${colors.textPrimary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${colors.surface};
  color: ${colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: ${colors.surface};
  color: ${colors.textPrimary};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ErrorText = styled.p`
  color: ${colors.danger};
  font-size: 13px;
  margin-top: 8px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid ${colors.border};
`;

const CancelButton = styled.button`
  padding: 10px 18px;
  border: 1px solid ${colors.border};
  background: transparent;
  color: ${colors.textPrimary};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${colors.borderLight};
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
