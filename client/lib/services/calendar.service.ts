import axios from "@/lib/axios";

export interface CalendarEvent {
  id: string;
  entityId: number;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  type: "task" | "event";
  priority?: string | null;
  status?: string | null;
  color: string;
  project?: string | null;
  projectId?: number | null;
  location?: string | null;
  assignee?: string;
  createdBy?: string;
  attendees?: {
    id: number;
    fullName: string;
    avatarUrl?: string;
    status: string;
  }[];
  fullDate: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  projectId?: number;
  attendeeIds?: number[];
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  projectId?: number | null;
}

export const getCalendarEvents = async (
  companyId: number,
  filters?: { startDate?: string; endDate?: string }
): Promise<CalendarEvent[]> => {
  const params = new URLSearchParams({ companyId: String(companyId) });
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const { data } = await axios.get<{
    message: string;
    events: CalendarEvent[];
  }>(`/calendar/events?${params}`);
  return data.events;
};

export const getTodayEvents = async (
  companyId: number
): Promise<CalendarEvent[]> => {
  const { data } = await axios.get<{
    message: string;
    events: CalendarEvent[];
  }>(`/calendar/today?companyId=${companyId}`);
  return data.events;
};

export const createCalendarEvent = async (
  companyId: number,
  payload: CreateEventPayload
): Promise<{ message: string; event: { id: number; title: string } }> => {
  const { data } = await axios.post(
    `/calendar/events?companyId=${companyId}`,
    payload
  );
  return data;
};

export const updateCalendarEvent = async (
  eventId: number,
  companyId: number,
  payload: UpdateEventPayload
): Promise<{ message: string }> => {
  const { data } = await axios.put(
    `/calendar/events/${eventId}?companyId=${companyId}`,
    payload
  );
  return data;
};

export const deleteCalendarEvent = async (
  eventId: number,
  companyId: number
): Promise<{ message: string }> => {
  const { data } = await axios.delete(
    `/calendar/events/${eventId}?companyId=${companyId}`
  );
  return data;
};