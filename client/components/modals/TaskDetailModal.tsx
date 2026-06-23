"use client";

import styled from "styled-components";
import { X, Trash2, MessageSquare, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { colors } from "@/styles/colors";
import { useAuth } from "@/context/AuthContext";
import { 
  getTaskDetail, 
  updateTask, 
  deleteTask, 
  addComment, 
  TaskDetail 
} from "@/lib/services/tasks.service";

interface TaskDetailModalProps {
  taskId: number;
  projectId: number;
  members: any[];
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskDetailModal({
  taskId,
  projectId,
  members,
  onClose,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const { activeCompanyId } = useAuth();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("TODO");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState<string>("");

  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    if (!activeCompanyId) return;

    const loadTask = async () => {
      try {
        setLoading(true);
        const { task: data } = await getTaskDetail(taskId, activeCompanyId);
        setTask(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setStatus(data.status);
        setPriority(data.priority);
        setAssigneeId(data.assignee?.id || null);
        if (data.dueDate) {
          setDueDate(new Date(data.dueDate).toISOString().split("T")[0]);
        }
      } catch (err) {
        console.error("Failed to load task details:", err);
        setFormError("Could not load task details.");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId, activeCompanyId]);

  const handleUpdateTask = async () => {
    if (!title.trim() || !activeCompanyId) {
      setFormError("Task title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await updateTask(taskId, activeCompanyId, {
        title,
        description,
        status: status as "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE",
        priority: priority as "LOW" | "MEDIUM" | "HIGH",
        assigneeId: assigneeId,
        dueDate: dueDate || undefined,
      });
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update task:", err);
      setFormError("Unable to update task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!activeCompanyId) return;
    if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) return;

    try {
      setIsSubmitting(true);
      await deleteTask(taskId, activeCompanyId);
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to delete task:", err);
      setFormError("Unable to delete task.");
      setIsSubmitting(false);
    }
  };

  const isAddingCommentRef = useRef(false);

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeCompanyId || !task || isAddingCommentRef.current) return;

    try {
      isAddingCommentRef.current = true;
      setIsAddingComment(true);
      const { id, content, user, createdAt } = await addComment(taskId, activeCompanyId, commentText);
      setTask((prevTask) => {
        if (!prevTask) return prevTask;
        return {
          ...prevTask,
          commentsDetail: [{ id, content, user, createdAt }, ...(prevTask.commentsDetail || [])]
        };
      });
      setCommentText("");
      onTaskUpdated();
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      isAddingCommentRef.current = false;
      setIsAddingComment(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{task?.code || 'Task Detail'}</ModalTitle>
          <HeaderActions>
            {!loading && (
              <DeleteIcon onClick={handleDeleteTask} title="Delete Task">
                <Trash2 size={18} />
              </DeleteIcon>
            )}
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </HeaderActions>
        </ModalHeader>

        {loading ? (
          <LoadingWrapper>Loading task details...</LoadingWrapper>
        ) : (
          <ModalContent>
            <LeftSection>
              <FormGroup>
                <Label>Task Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                />
              </FormGroup>

              <FormRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Status</Label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </Select>
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                  <Label>Priority</Label>
                  <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Assignee</Label>
                  <Select
                    value={assigneeId ?? ""}
                    onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name || m.fullName || "User"}</option>
                    ))}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  rows={5}
                />
              </FormGroup>

              {formError && <ErrorText>{formError}</ErrorText>}

              <UpdateBtn 
                onClick={handleUpdateTask} 
                disabled={!title.trim() || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </UpdateBtn>
            </LeftSection>

            <RightSection>
              <SectionTitle>
                <MessageSquare size={16} /> Comments
              </SectionTitle>
              
              <CommentsList>
                {task?.commentsDetail?.map((comment) => (
                  <CommentItem key={comment.id}>
                    <CommentAvatar src={comment.user.avatarUrl || "/images/avatar-default.png"} />
                    <CommentBody>
                      <CommentMeta>
                        <CommentAuthor>{comment.user.fullName || "User"}</CommentAuthor>
                        <CommentTime>{new Date(comment.createdAt).toLocaleDateString()}</CommentTime>
                      </CommentMeta>
                      <CommentText>{comment.content}</CommentText>
                    </CommentBody>
                  </CommentItem>
                ))}
                {(!task?.commentsDetail || task.commentsDetail.length === 0) && (
                  <NoComments>No comments yet. Be the first to start the discussion!</NoComments>
                )}
              </CommentsList>

              <AddCommentBox>
                <CommentInput
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <SendButton 
                  onClick={handleAddComment} 
                  disabled={!commentText.trim() || isAddingComment}
                >
                  <Send size={16} />
                </SendButton>
              </AddCommentBox>
            </RightSection>
          </ModalContent>
        )}
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
  background: ${colors.surface};
  border-radius: 12px;
  max-width: 900px;
  width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: ${colors.background};
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${colors.textPrimary};
  font-family: monospace;
  background: ${colors.borderLight};
  padding: 4px 8px;
  border-radius: 6px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DeleteIcon = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${colors.danger};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1f2937;
  }
`;

const LoadingWrapper = styled.div`
  padding: 40px;
  text-align: center;
  color: ${colors.textSecondary};
`;

const ModalContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    overflow-y: auto;
  }
`;

const LeftSection = styled.div`
  flex: 3;
  padding: 24px;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
`;

const RightSection = styled.div`
  flex: 2;
  background: ${colors.background};
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: ${colors.textSecondary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: ${colors.textPrimary};
  background: ${colors.surface};

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  background: ${colors.surface};
  color: ${colors.textPrimary};
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
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: ${colors.textPrimary};
  background: ${colors.surface};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ErrorText = styled.div`
  color: ${colors.danger};
  font-size: 13px;
  margin-top: 12px;
`;

const UpdateBtn = styled.button`
  padding: 10px 20px;
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  width: 100%;
  margin-top: 12px;

  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h4`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.textPrimary};
  padding: 20px 24px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
`;

const CommentsList = styled.div`
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
`;

const CommentAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  background: ${colors.borderLight};
`;

const CommentBody = styled.div`
  flex: 1;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  padding: 12px;
  border-radius: 8px;
  border-top-left-radius: 0;
`;

const CommentMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: ${colors.textPrimary};
`;

const CommentTime = styled.span`
  font-size: 11px;
  color: ${colors.textSecondary};
`;

const CommentText = styled.p`
  font-size: 13px;
  color: ${colors.textSecondary};
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const NoComments = styled.div`
  text-align: center;
  color: ${colors.textSecondary};
  font-size: 13px;
  margin-top: 40px;
`;

const AddCommentBox = styled.div`
  padding: 20px 24px;
  border-top: 1px solid ${colors.border};
  background: ${colors.surface};
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  color: ${colors.textPrimary};
  background: ${colors.surface};
  resize: none;
  min-height: 40px;
  max-height: 120px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SendButton = styled.button`
  background: ${colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: ${colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
