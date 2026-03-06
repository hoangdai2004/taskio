"use client";

import styled from "styled-components";
import { useParams } from "next/navigation";

import { Project } from "@/types/project.type";
import ProjectHeader from "@/components/project/project-header";
import ProjectBoard from "@/components/project/project-board";

const mockProjects: Project[] = [
  {
    id: 1,
    slug: "mobile-app",
    name: "Mobile App",

    members: [
      { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
      { id: 2, name: "John", avatar: "https://i.pravatar.cc/40?img=2" },
    ],

    tasks: [
      {
        id: 1,
        title: "Design Login Screen",
        desc: "Create UI for login screen",
        status: "todo",
        priority: "high",
        comments: 2,
        files: 1,
        assignees: [
          { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
        ],
      },
      {
        id: 2,
        title: "Create Auth API",
        desc: "Build login API",
        status: "progress",
        priority: "high",
        comments: 3,
        files: 0,
        assignees: [
          { id: 2, name: "John", avatar: "https://i.pravatar.cc/40?img=2" },
        ],
      },
      {
        id: 3,
        title: "Setup Firebase",
        desc: "Setup push notification",
        status: "todo",
        priority: "medium",
        comments: 1,
        files: 2,
        assignees: [
          { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
        ],
      },
      {
        id: 4,
        title: "Deploy Test Build",
        desc: "Deploy to staging",
        status: "done",
        priority: "low",
        comments: 0,
        files: 1,
        assignees: [
          { id: 2, name: "John", avatar: "https://i.pravatar.cc/40?img=2" },
        ],
      },
    ],
  },

  {
    id: 2,
    slug: "website-redesign",
    name: "Website Redesign",

    members: [
      { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
    ],

    tasks: [
      {
        id: 5,
        title: "Design Landing Page",
        desc: "Create new landing UI",
        status: "todo",
        priority: "high",
        comments: 4,
        files: 2,
        assignees: [
          { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
        ],
      },
      {
        id: 6,
        title: "Build Navbar",
        desc: "Implement responsive navbar",
        status: "progress",
        priority: "medium",
        comments: 1,
        files: 0,
        assignees: [
          { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
        ],
      },
      {
        id: 7,
        title: "SEO Optimization",
        desc: "Improve SEO score",
        status: "done",
        priority: "low",
        comments: 0,
        files: 0,
        assignees: [
          { id: 1, name: "Alex", avatar: "https://i.pravatar.cc/40?img=1" },
        ],
      },
    ],
  },
];

export default function ProjectPage() {
  const { slug } = useParams();

  const project = mockProjects.find((p) => p.slug === slug);

  if (!project) {
    return <div>Project not found</div>;
  }

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