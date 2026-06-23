"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import TaskItem from "@/components/tasks/TaskItem";
import FilterPanel from "@/components/tasks/FilterPanel";
import { useAuth } from "@/context/AuthContext";
import {
  TaskItem as TaskData,
  GetTasksFilters,
  getTasks,
  createTask,
  bulkDeleteTasks,
} from "@/lib/services/tasks.service";
import { getProjects } from "@/lib/services/projects.service";
import { getCompanyMembers } from "@/lib/services/companies.service";
import CreateTaskModal from "@/components/modals/CreateTaskModal";
import TaskDetailModal from "@/components/modals/TaskDetailModal";

export default function TasksPage() {
  const { activeCompanyId } = useAuth();
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetTasksFilters>({});
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [assignees, setAssignees] = useState<Array<{ id: number; fullName: string; avatarUrl?: string }>>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!activeCompanyId) {
        setTasks([]);
        setProjects([]);
        setAssignees([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { tasks: loadedTasks, pagination: paginationData } = await getTasks(activeCompanyId, {
          ...filters,
          page: pagination.page,
        });
        setTasks(loadedTasks);
        setPagination(paginationData);

        const { projects: loadedProjects } = await getProjects(activeCompanyId);
        setProjects(loadedProjects.map(p => ({ id: p.id, name: p.name })));

        const { members } = await getCompanyMembers(activeCompanyId);
        setAssignees(members.map(m => ({ id: m.id, fullName: m.fullName, avatarUrl: m.avatarUrl })));
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeCompanyId, filters, reloadKey, pagination?.page]);

  const handleFiltersChange = (newFilters: GetTasksFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateTask = async (
    title: string,
    description?: string,
    projectId?: number,
    assigneeId?: number,
    priority?: string,
    dueDate?: string
  ) => {
    if (!activeCompanyId) return;

    if (!projectId) {
      setError("Please select a project before creating a task.");
      return;
    }

    try {
      await createTask(activeCompanyId, {
        title,
        description,
        projectId,
        assigneeId,
        priority: priority as any,
        dueDate,
      });

      const { tasks: loadedTasks } = await getTasks(activeCompanyId, filters);
      setTasks(loadedTasks);

      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Không thể tạo công việc mới.");
    }
  };

  const handleSelectTask = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(tasks.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!activeCompanyId || selectedIds.length === 0) return;

    if (!confirm(`Bạn có chắc chắn muốn xoá ${selectedIds.length} công việc đã chọn?`)) {
      return;
    }

    try {
      setDeleting(true);
      await bulkDeleteTasks(activeCompanyId, selectedIds);
      setSelectedIds([]);
      setReloadKey(prev => prev + 1);
    } catch (err) {
      console.error("Failed to bulk delete:", err);
      setError("Không thể xoá các công việc đã chọn.");
    } finally {
      setDeleting(false);
    }
  };

  const renderTaskList = (items: TaskData[]) => {
    if (items.length === 0) {
      return <EmptyState>Không có công việc nào để hiển thị.</EmptyState>;
    }

    return items.map((task) => (
      <TaskItem
        key={task.id}
        code={task.code}
        title={task.title}
        project={task.project}
        priority={task.priority}
        date={task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
          })
          : "No due date"}
        description={task.description || "Không có mô tả"}
        onClick={() => setSelectedTaskId(task.id)}
        selected={selectedIds.includes(task.id)}
        onSelect={(selected) => handleSelectTask(task.id, selected)}
      />
    ));
  };

  return (
    <Wrapper>
      <Header>
        <div>
          <Title>Tasks</Title>
          <TaskCount>
            {loading ? "..." : `${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
          </TaskCount>
        </div>
        <ActionGroup>
          {selectedIds.length > 0 && (
            <BulkDeleteButton onClick={handleBulkDelete} disabled={deleting}>
              {deleting ? "Đang xoá..." : `Xoá ${selectedIds.length} đã chọn`}
            </BulkDeleteButton>
          )}
          <NewTaskButton onClick={() => setShowCreateModal(true)}>
            + New Task
          </NewTaskButton>
        </ActionGroup>
      </Header>

      <SelectionHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={tasks.length > 0 && selectedIds.length === tasks.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
            {selectedIds.length > 0 ? `Đã chọn ${selectedIds.length}` : "Chọn tất cả"}
          </span>
        </div>
      </SelectionHeader>

      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        projects={projects}
        assignees={assignees}
      />

      {error && <Status>{error}</Status>}
      {loading ? (
        <Status>Đang tải công việc...</Status>
      ) : (
        <>
          <TaskList>{renderTaskList(tasks)}</TaskList>
          {pagination.totalPages > 1 && (
            <PaginationWrapper>
              <PageButton
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </PageButton>
              <PageInfo>
                Page {pagination.page} of {pagination.totalPages}
              </PageInfo>
              <PageButton
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </PageButton>
            </PaginationWrapper>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          projects={projects}
          assignees={assignees}
        />
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={0}
          members={assignees}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => setReloadKey((k) => k + 1)}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 30px;
  background: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

const TaskCount = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textMuted};
  background: ${({ theme }) => theme.colors.borderLight};
  padding: 6px 12px;
  border-radius: 20px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const BulkDeleteButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.danger}dd;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SelectionHeader = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
`;

const NewTaskButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.card};
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Status = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  text-align: center;
  padding: 40px;
`;

const EmptyState = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 16px;
  text-align: center;
  padding: 60px 20px;
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding-bottom: 40px;
`;

const PageButton = styled.button`
  background: ${({ theme }) => theme.colors.card};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;
