"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import { Search, Filter, X } from "lucide-react";
import { GetTasksFilters } from "@/lib/services/tasks.service";

interface FilterPanelProps {
  filters: GetTasksFilters;
  onFiltersChange: (filters: GetTasksFilters) => void;
  projects: Array<{ id: number; name: string }>;
  assignees: Array<{ id: number; fullName: string; avatarUrl?: string }>;
}

export default function FilterPanel({
  filters,
  onFiltersChange,
  projects,
  assignees,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<GetTasksFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof GetTasksFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== null && value !== ""
  );

  return (
    <Container>
      <TopRow>
        <SearchBox>
          <SearchIcon size={18} />
          <SearchInput
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </SearchBox>

        <FilterToggle onClick={() => setIsExpanded(!isExpanded)}>
          <FilterIcon size={18} />
          Filters
          {hasActiveFilters && <ActiveIndicator />}
        </FilterToggle>

        {hasActiveFilters && (
          <ClearButton onClick={clearFilters}>
            <X size={16} />
            Clear
          </ClearButton>
        )}
      </TopRow>

      {isExpanded && (
        <ExpandedFilters>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Status</FilterLabel>
              <Select
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
              >
                <option value="">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Priority</FilterLabel>
              <Select
                value={filters.priority || ""}
                onChange={(e) => handleFilterChange("priority", e.target.value || undefined)}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>
            </FilterGroup>
          </FilterRow>

          <FilterRow>
            <FilterGroup>
              <FilterLabel>Project</FilterLabel>
              <Select
                value={filters.projectId || ""}
                onChange={(e) => handleFilterChange("projectId", e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Assignee</FilterLabel>
              <Select
                value={filters.assigneeId || ""}
                onChange={(e) => handleFilterChange("assigneeId", e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">All Assignees</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.fullName || "User"}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </FilterRow>

          <FilterRow>
            <FilterGroup>
              <FilterLabel>Due Date</FilterLabel>
              <DateInput
                type="date"
                value={filters.dueDate || ""}
                onChange={(e) => handleFilterChange("dueDate", e.target.value || undefined)}
              />
            </FilterGroup>
          </FilterRow>
        </ExpandedFilters>
      )}
    </Container>
  );
}

const Container = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: ${props => props.theme ? "16px" : "0"};
`;

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SearchIcon = styled(Search)`
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${({ theme }) => theme.colors.borderLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }
`;

const FilterIcon = styled(Filter)`
  flex-shrink: 0;
`;

const ActiveIndicator = styled.div`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.card};
  }
`;

const ExpandedFilters = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 20px;
  margin-top: 16px;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  option {
    background: ${({ theme }) => theme.colors.card};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const DateInput = styled.input`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::-webkit-calendar-picker-indicator {
    color: ${({ theme }) => theme.colors.textMuted};
    cursor: pointer;
  }
`;