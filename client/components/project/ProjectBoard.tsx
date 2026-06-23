"use client";

import styled from "styled-components";
import { useEffect, useState, useMemo } from "react";
import { Task, Status } from "@/types/project.type";
import Column from "./column";
import { columns } from "@/constants/columns";
import { useAuth } from "@/context/AuthContext";
import { updateTaskStatus } from "@/lib/services/projects.service";
import { createTask } from "@/lib/services/tasks.service";
import TaskDetailModal from "../modals/TaskDetailModal";
import CreateTaskModal from "../modals/CreateTaskModal";

import { 
  isToday, 
  isThisWeek, 
  isBefore, 
  startOfToday 
} from "date-fns";

interface Props {
  tasks: Task[];
  projectId: number;
  members: any[];
  onTaskCreated?: () => void;
  priorityFilter: string;
  dateFilter: string;
}

export default function ProjectBoard({ 
  tasks, 
  projectId, 
  members, 
  onTaskCreated,
  priorityFilter,
  dateFilter
}: Props) {
  const { activeCompanyId } = useAuth();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [dragTaskId, setDragTaskId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<Status | null>(null);

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return taskList.filter(task => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }

      if (dateFilter !== "all") {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        
        if (dateFilter === "today") {
          if (!isToday(dueDate)) return false;
        } else if (dateFilter === "this-week") {
          if (!isThisWeek(dueDate)) return false;
        } else if (dateFilter === "overdue") {
          if (!isBefore(dueDate, startOfToday())) return false;
        }
      }

      return true;
    });
  }, [taskList, priorityFilter, dateFilter]);

  const handleDrop = async (taskId: number, newStatus: Status) => {
    setTaskList((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setDragTaskId(null);

    const statusMap: Record<Status, string> = {
      todo: "TODO",
      progress: "IN_PROGRESS",
      review: "REVIEW",
      done: "DONE",
    };

    if (activeCompanyId) {
      try {
        await updateTaskStatus(projectId, taskId, activeCompanyId, {
          status: statusMap[newStatus] as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
        });
      } catch (err) {
        console.error("Failed to update task status:", err);
        setTaskList(tasks);
      }
    }
  };

  const handleAddTaskClick = (columnStatus: Status) => {
    setCreateModalStatus(columnStatus);
    setShowCreateModal(true);
  };

  const handleCreateTaskSubmit = async (title: string, description?: string, projId?: number, assigneeId?: number, priority?: string, dueDate?: string, status?: string) => {
    if (!activeCompanyId || !title.trim() || !projId) return;
    try {
      await createTask(activeCompanyId, {
        title,
        description,
        projectId: projId,
        assigneeId,
        priority: (priority as "LOW" | "MEDIUM" | "HIGH" | undefined),
        dueDate,
        status: (status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | undefined),
      });
      onTaskCreated?.();
    } catch (err) {
      console.error("Failed to create task:", err);
      throw err;
    }
  };

  return (
    <Board>
      {columns.map((col) => (
        <Column
          key={col.id}
          column={col}
          tasks={filteredTasks}
          dragTaskId={dragTaskId}
          setDragTaskId={setDragTaskId}
          onDropTask={handleDrop}
          onAddTaskClick={() => handleAddTaskClick(col.id)}
          onTaskClick={setSelectedTaskId}
        />
      ))}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={projectId}
          members={members}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => onTaskCreated?.()}
        />
      )}

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateModalStatus(null);
        }}
        onSubmit={handleCreateTaskSubmit}
        projects={[{ id: projectId, name: "Current Project" }]}
        defaultProjectId={projectId}
        defaultStatus={
          createModalStatus === "todo" ? "TODO" :
          createModalStatus === "progress" ? "IN_PROGRESS" :
          createModalStatus === "review" ? "REVIEW" :
          createModalStatus === "done" ? "DONE" : "TODO"
        }
      />
    </Board>
  );
}

const Board = styled.div`
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow-x: auto;
  flex: 1;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 6px;
  }
`;