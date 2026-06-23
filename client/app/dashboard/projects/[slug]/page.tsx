"use client";

import styled from "styled-components";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Project } from "@/types/project.type";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectBoard from "@/components/project/ProjectBoard";
import { getProjects, getProjectDetail } from "@/lib/services/projects.service";
import { useAuth } from "@/context/AuthContext";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { activeCompanyId } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    const loadProject = async () => {
      if (!activeCompanyId || !slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { projects } = await getProjects(activeCompanyId);
        const projectData = projects.find((p) => p.slug === slug);

        if (!projectData) {
          setError("Project not found");
          setProject(null);
          return;
        }

        try {
          const { project: detailedProject } = await getProjectDetail(
            projectData.id,
            activeCompanyId
          );

          const mapStatus = (s: string): "todo" | "progress" | "review" | "done" => {
            const map: Record<string, "todo" | "progress" | "review" | "done"> = {
              TODO: "todo",
              IN_PROGRESS: "progress",
              REVIEW: "review",
              DONE: "done",
            };
            return map[s] || "todo";
          };

          const mapPriority = (p: string): "low" | "medium" | "high" => {
            const map: Record<string, "low" | "medium" | "high"> = {
              LOW: "low",
              MEDIUM: "medium",
              HIGH: "high",
            };
            return map[p] || "medium";
          };

          const mappedTasks = Object.entries(detailedProject.tasksByStatus || {}).flatMap(
            ([status, tasks]) =>
              tasks.map((task: any) => ({
                id: task.id,
                code: task.code,
                title: task.title,
                desc: task.description || "",
                status: mapStatus(status),
                priority: mapPriority(task.priority),
                comments: task.comments || 0,
                files: task.files || 0,
                assignees: task.assignee
                  ? [
                    {
                      id: task.assignee.id,
                      fullName: task.assignee.fullName,
                      avatarUrl: task.assignee.avatarUrl || "/images/avatar-default.png",
                    },
                  ]
                  : [],
              }))
          );

          const mappedProject: Project = {
            id: detailedProject.id,
            name: detailedProject.name,
            description: detailedProject.description,
            slug: projectData.slug,
            color: projectData.color,
            inviteCode: detailedProject.inviteCode,
            members: detailedProject.members.map((member) => ({
              id: member.id,
              fullName: member.fullName,
              avatarUrl: member.avatarUrl || "/images/avatar-default.png",
              role: member.role,
            })),
            tasks: mappedTasks,
          };

          setProject(mappedProject);
        } catch (detailErr) {
          console.warn("Failed to fetch project detail, using basic info:", detailErr);
          const mappedProject: Project = {
            id: projectData.id,
            name: projectData.name,
            description: projectData.description,
            slug: projectData.slug,
            color: projectData.color,
            members: [],
            tasks: [],
          };
          setProject(mappedProject);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("Failed to load project");
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [activeCompanyId, slug, reloadKey]);

  if (loading) {
    return <Wrapper><LoadingMessage>Loading project...</LoadingMessage></Wrapper>;
  }

  if (error || !project) {
    return <Wrapper><ErrorMessage>{error || "Project not found"}</ErrorMessage></Wrapper>;
  }

  return (
    <Wrapper>
      <ProjectHeader
        project={project}
        onProjectUpdated={() => setReloadKey((k) => k + 1)}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
      <ProjectBoard
        tasks={project.tasks}
        projectId={project.id}
        members={project.members}
        onTaskCreated={() => setReloadKey((k) => k + 1)}
        priorityFilter={priorityFilter}
        dateFilter={dateFilter}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  overflow-x: hidden;
`;

const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #666;
`;

const ErrorMessage = styled.div`
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: #d32f2f;
`;
