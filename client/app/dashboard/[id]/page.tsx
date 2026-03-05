"use client";

import { useEffect, useState } from "react";
import ProjectHeader from "@/components/project/project-header";
import ProjectBoard from "@/components/project/project-board";
import { Project } from "@/types/project.type";

interface Props {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // MOCK API
    const mockProject: Project = {
      id: Number(params.id),
      name: "Mobile App",

      members: [
        {
          id: 1,
          name: "Alex",
          avatar: "/avatars/a1.png",
        },
        {
          id: 2,
          name: "Jane",
          avatar: "/avatars/a2.png",
        },
        {
          id: 3,
          name: "John",
          avatar: "/avatars/a3.png",
        },
      ],

      columns: [
        {
          id: 1,
          title: "To Do",
          tasks: [
            {
              id: 1,
              title: "Brainstorming",
              desc: "Discuss ideas with team",
              priority: "low",
              comments: 12,
              files: 0,
              assignees: [],
            },
            {
              id: 2,
              title: "Research",
              desc: "User research",
              priority: "high",
              comments: 10,
              files: 3,
              assignees: [],
            },
          ],
        },

        {
          id: 2,
          title: "In Progress",
          tasks: [
            {
              id: 3,
              title: "Onboarding Illustrations",
              desc: "Design onboarding UI",
              priority: "medium",
              comments: 14,
              files: 15,
              assignees: [],
            },
          ],
        },

        {
          id: 3,
          title: "Done",
          tasks: [
            {
              id: 4,
              title: "Mobile App Design",
              desc: "Final mobile UI",
              priority: "low",
              comments: 12,
              files: 15,
              assignees: [],
            },
          ],
        },
      ],
    };

    // giả lập API delay
    setTimeout(() => {
      setProject(mockProject);
    }, 500);
  }, [params.id]);

  if (!project) return <div>Loading...</div>;

  return (
    <>
      <ProjectHeader project={project} />
      <ProjectBoard columns={project.columns} />
    </>
  );
}