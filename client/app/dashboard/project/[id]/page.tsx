"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

import { Project } from "@/types/project.type";
import ProjectHeader from "@/components/project/project-header";
import ProjectBoard from "@/components/project/project-board";

export default function ProjectPage() {
  const [project] = useState<Project>(() => ({
    id: 1,
    name: "Taskio Website",
    members: [
      {
        id: 1,
        name: "Alex",
        avatar: "https://i.pravatar.cc/40?img=1",
      },
      {
        id: 2,
        name: "John",
        avatar: "https://i.pravatar.cc/40?img=2",
      },
    ],

    tasks: [
      {
        id: 1,
        title: "Design Landing Page",
        desc: "Create landing UI",
        status: "todo",
        priority: "high",
        comments: 3,
        files: 1,
        assignees: [
          {
            id: 1,
            name: "Alex",
            avatar: "https://i.pravatar.cc/40?img=1",
          },
        ],
      },
      {
        id: 2,
        title: "Build API",
        desc: "Create backend API",
        status: "progress",
        priority: "medium",
        comments: 2,
        files: 0,
        assignees: [
          {
            id: 2,
            name: "John",
            avatar: "https://i.pravatar.cc/40?img=2",
          },
        ],
      },
      {
        id: 3,
        title: "Deploy Project",
        desc: "Deploy to server",
        status: "done",
        priority: "low",
        comments: 1,
        files: 2,
        assignees: [
          {
            id: 1,
            name: "Alex",
            avatar: "https://i.pravatar.cc/40?img=1",
          },
        ],
      },
    ],
  }));

  return (
    <Wrapper>
      <ProjectHeader project={project} />
      <ProjectBoard tasks={project.tasks} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;