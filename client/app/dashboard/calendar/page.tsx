"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin } from "lucide-react";
import {
  CalendarEvent,
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/services/calendar.service";
import { getProjects } from "@/lib/services/projects.service";
import TaskDetailModal from "@/components/modals/TaskDetailModal";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const priorityColors: Record<string, string> = {
  LOW: "#10b981", MEDIUM: "#f59e0b", HIGH: "#f97316",
};

export default function CalendarPage() {
  const { activeCompanyId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [projectId, setProjectId] = useState<number | undefined>();
  const [formError, setFormError] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (!activeCompanyId) return;
    const load = async () => {
      setLoading(true);
      try {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
        const evts = await getCalendarEvents(activeCompanyId, {
          startDate: firstDay.toISOString(),
          endDate: lastDay.toISOString(),
        });
        setEvents(evts);
        const { projects: p } = await getProjects(activeCompanyId);
        setProjects(p.map((x) => ({ id: x.id, name: x.name })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeCompanyId, year, month, reloadKey]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const today = new Date().toISOString().split("T")[0];

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  const handleOpenCreate = (dateStr?: string) => {
    const base = dateStr || today;
    setTitle("");
    setDesc("");
    setStartTime(`${base}T09:00`);
    setEndTime(`${base}T10:00`);
    setLocation("");
    setProjectId(undefined);
    setFormError("");
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!title.trim()) { setFormError("Title is required"); return; }
    if (!startTime || !endTime) { setFormError("Times are required"); return; }
    if (!activeCompanyId) return;
    try {
      await createCalendarEvent(activeCompanyId, {
        title, description: desc || undefined,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        location: location || undefined,
        projectId,
      });
      setShowModal(false);
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
      const evts = await getCalendarEvents(activeCompanyId, {
        startDate: firstDay.toISOString(), endDate: lastDay.toISOString(),
      });
      setEvents(evts);
    } catch (err) {
      console.error(err);
      setFormError("Failed to create event");
    }
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (event.type !== "event" || !activeCompanyId) return;
    if (!confirm("Delete this event?")) return;
    try {
      await deleteCalendarEvent(event.entityId, activeCompanyId);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setSelectedDate(null);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  return (
    <Wrapper>
      <Header>
        <HeaderLeft>
          <Title>Calendar</Title>
          <MonthNav>
            <NavBtn onClick={prevMonth}><ChevronLeft size={18} /></NavBtn>
            <MonthLabel>{MONTHS[month]} {year}</MonthLabel>
            <NavBtn onClick={nextMonth}><ChevronRight size={18} /></NavBtn>
          </MonthNav>
          <TodayBtn onClick={goToday}>Today</TodayBtn>
        </HeaderLeft>
        <CreateBtn onClick={() => handleOpenCreate()}>
          <Plus size={16} /> New Event
        </CreateBtn>
      </Header>

      <Content>
        <CalendarGrid>
          <DaysHeader>
            {DAYS.map((d) => <DayName key={d}>{d}</DayName>)}
          </DaysHeader>
          <DaysGrid>
            {calendarDays.map((day, i) => {
              if (day === null) return <EmptyCell key={`empty-${i}`} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = getEventsForDay(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <DayCell
                  key={day}
                  $isToday={isToday}
                  $isSelected={isSelected}
                  onClick={() => setSelectedDate(dateStr)}
                  onDoubleClick={() => handleOpenCreate(dateStr)}
                >
                  <DayNumber $isToday={isToday}>{day}</DayNumber>
                  <EventDots>
                    {dayEvents.slice(0, 3).map((evt) => (
                      <EventDot key={evt.id} style={{ background: evt.color }} title={evt.title} />
                    ))}
                    {dayEvents.length > 3 && <MoreCount>+{dayEvents.length - 3}</MoreCount>}
                  </EventDots>
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarGrid>

        <Sidebar>
          <SidebarTitle>
            {selectedDate
              ? new Date(selectedDate + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
              : "Select a day"}
          </SidebarTitle>
          {selectedDate && selectedEvents.length === 0 && (
            <EmptyMsg>No events on this day</EmptyMsg>
          )}
          {selectedEvents.map((evt) => (
            <EventCard 
              key={evt.id} 
              style={{ borderLeft: `3px solid ${evt.color}`, cursor: evt.type === "task" ? "pointer" : "default" }}
              onClick={() => {
                if (evt.type === "task") setSelectedTaskId(evt.entityId);
              }}
            >
              <EventCardHeader>
                <EventType $type={evt.type}>{evt.type === "task" ? "Task" : "Event"}</EventType>
                {evt.priority && (
                  <PriorityBadge style={{ background: priorityColors[evt.priority] || "#6366f1" }}>
                    {evt.priority}
                  </PriorityBadge>
                )}
              </EventCardHeader>
              <EventCardTitle>{evt.title}</EventCardTitle>
              {evt.description && <EventCardDesc>{evt.description}</EventCardDesc>}
              <EventMeta>
                <Clock size={12} /> {evt.time}
                {evt.project && <span> · {evt.project}</span>}
              </EventMeta>
              {evt.location && (
                <EventMeta><MapPin size={12} /> {evt.location}</EventMeta>
              )}
              {evt.type === "event" && (
                <DeleteBtn onClick={() => handleDelete(evt)}>Delete</DeleteBtn>
              )}
            </EventCard>
          ))}
          {selectedDate && (
            <AddEventBtn onClick={() => handleOpenCreate(selectedDate)}>
              <Plus size={14} /> Add event
            </AddEventBtn>
          )}
        </Sidebar>
      </Content>

      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Create Event</ModalTitle>
              <CloseBtn onClick={() => setShowModal(false)}><X size={20} /></CloseBtn>
            </ModalHeader>
            <ModalBody>
              <Field>
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
              </Field>
              <FieldRow>
                <Field style={{ flex: 1 }}>
                  <Label>Start *</Label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </Field>
                <Field style={{ flex: 1 }}>
                  <Label>End *</Label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </Field>
              </FieldRow>
              <Field>
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional location" />
              </Field>
              <Field>
                <Label>Project</Label>
                <Select value={projectId ?? ""} onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}>
                  <option value="">No project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field>
                <Label>Description</Label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional description" rows={3} />
              </Field>
              {formError && <ErrorText>{formError}</ErrorText>}
            </ModalBody>
            <ModalFooter>
              <CancelBtn onClick={() => setShowModal(false)}>Cancel</CancelBtn>
              <SubmitBtn onClick={handleCreate}>Create Event</SubmitBtn>
            </ModalFooter>
          </Modal>
        </ModalOverlay>
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          projectId={0}
          members={[]}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => setReloadKey(k => k + 1)}
        />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`padding: 30px; min-height: 100vh; background: ${({ theme }) => theme.colors.background};`;
const Header = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:16px;`;
const HeaderLeft = styled.div`display:flex;align-items:center;gap:20px;flex-wrap:wrap;`;
const Title = styled.h1`font-size:28px;font-weight:700;color:${({ theme }) => theme.colors.textPrimary};margin:0;`;
const MonthNav = styled.div`display:flex;align-items:center;gap:8px;`;
const NavBtn = styled.button`width:32px;height:32px;border-radius:8px;border:1px solid ${({ theme }) => theme.colors.border};background:${({ theme }) => theme.colors.card};color:${({ theme }) => theme.colors.textPrimary};display:flex;align-items:center;justify-content:center;cursor:pointer;&:hover{background:${({ theme }) => theme.colors.borderLight};}`;
const MonthLabel = styled.span`font-size:16px;font-weight:600;min-width:160px;text-align:center;color:${({ theme }) => theme.colors.textPrimary};`;
const TodayBtn = styled.button`padding:6px 14px;border-radius:8px;border:1px solid ${({ theme }) => theme.colors.border};background:${({ theme }) => theme.colors.card};color:${({ theme }) => theme.colors.primary};font-weight:500;font-size:13px;cursor:pointer;&:hover{background:${({ theme }) => theme.colors.primaryLight};}`;
const CreateBtn = styled.button`display:flex;align-items:center;gap:6px;padding:10px 18px;border-radius:8px;border:none;background:${({ theme }) => theme.colors.primary};color:white;font-weight:500;cursor:pointer;&:hover{background:${({ theme }) => theme.colors.primaryHover};}`;
const Content = styled.div`display:flex;gap:24px;@media(max-width:900px){flex-direction:column;}`;
const CalendarGrid = styled.div`flex:1;background:${({ theme }) => theme.colors.card};border-radius:16px;border:1px solid ${({ theme }) => theme.colors.border};overflow:hidden;`;
const DaysHeader = styled.div`display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid ${({ theme }) => theme.colors.border};`;
const DayName = styled.div`padding:12px;text-align:center;font-size:12px;font-weight:600;color:${({ theme }) => theme.colors.textSecondary};text-transform:uppercase;`;
const DaysGrid = styled.div`display:grid;grid-template-columns:repeat(7,1fr);`;
const EmptyCell = styled.div`min-height:90px;border-bottom:1px solid ${({ theme }) => theme.colors.border};border-right:1px solid ${({ theme }) => theme.colors.border};`;
const DayCell = styled.div<{ $isToday: boolean; $isSelected: boolean }>`min-height:90px;padding:8px;border-bottom:1px solid ${({ theme }) => theme.colors.border};border-right:1px solid ${({ theme }) => theme.colors.border};cursor:pointer;transition:background 0.15s;background:${({ $isSelected, $isToday, theme }) => $isSelected ? theme.colors.primaryLight : $isToday ? `${theme.colors.primary}08` : "transparent"};&:hover{background:${({ theme }) => theme.colors.primaryLight};}`;
const DayNumber = styled.div<{ $isToday: boolean }>`font-size:13px;font-weight:${({ $isToday }) => $isToday ? 700 : 400};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:4px;${({ $isToday, theme }) => $isToday ? `background:${theme.colors.primary};color:white;` : `color:${theme.colors.textPrimary};`}`;
const EventDots = styled.div`display:flex;flex-wrap:wrap;gap:3px;`;
const EventDot = styled.div`width:8px;height:8px;border-radius:50%;`;
const MoreCount = styled.span`font-size:10px;color:${({ theme }) => theme.colors.textSecondary};`;

const Sidebar = styled.div`width:320px;background:${({ theme }) => theme.colors.card};border-radius:16px;border:1px solid ${({ theme }) => theme.colors.border};padding:20px;max-height:calc(100vh - 180px);overflow-y:auto;@media(max-width:900px){width:100%;}`;
const SidebarTitle = styled.h3`font-size:16px;font-weight:600;color:${({ theme }) => theme.colors.textPrimary};margin:0 0 16px;`;
const EmptyMsg = styled.p`font-size:13px;color:${({ theme }) => theme.colors.textSecondary};text-align:center;padding:20px 0;`;
const EventCard = styled.div`padding:12px;border-radius:10px;background:${({ theme }) => theme.colors.background};margin-bottom:10px;`;
const EventCardHeader = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;`;
const EventType = styled.span<{ $type: string }>`font-size:10px;font-weight:600;text-transform:uppercase;padding:2px 8px;border-radius:4px;background:${({ $type }) => $type === "task" ? "#dbeafe" : "#ede9fe"};color:${({ $type }) => $type === "task" ? "#2563eb" : "#7c3aed"};`;
const PriorityBadge = styled.span`font-size:10px;font-weight:600;color:white;padding:2px 6px;border-radius:4px;text-transform:uppercase;`;
const EventCardTitle = styled.div`font-size:14px;font-weight:600;color:${({ theme }) => theme.colors.textPrimary};margin-bottom:4px;`;
const EventCardDesc = styled.div`font-size:12px;color:${({ theme }) => theme.colors.textSecondary};margin-bottom:6px;`;
const EventMeta = styled.div`display:flex;align-items:center;gap:4px;font-size:12px;color:${({ theme }) => theme.colors.textSecondary};margin-top:4px;`;
const DeleteBtn = styled.button`margin-top:8px;font-size:12px;color:#ef4444;background:none;border:none;cursor:pointer;&:hover{text-decoration:underline;}`;
const AddEventBtn = styled.button`width:100%;padding:10px;border-radius:8px;border:1px dashed ${({ theme }) => theme.colors.border};background:transparent;color:${({ theme }) => theme.colors.primary};font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;&:hover{background:${({ theme }) => theme.colors.primaryLight};}`;

const ModalOverlay = styled.div`position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;`;
const Modal = styled.div`background:${({ theme }) => theme.colors.card};border-radius:12px;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);`;
const ModalHeader = styled.div`display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid ${({ theme }) => theme.colors.border};`;
const ModalTitle = styled.h3`font-size:18px;font-weight:600;margin:0;color:${({ theme }) => theme.colors.textPrimary};`;
const CloseBtn = styled.button`background:none;border:none;cursor:pointer;color:${({ theme }) => theme.colors.textSecondary};display:flex;&:hover{color:${({ theme }) => theme.colors.textPrimary};}`;
const ModalBody = styled.div`padding:24px;`;
const ModalFooter = styled.div`display:flex;justify-content:flex-end;gap:12px;padding:16px 24px;border-top:1px solid ${({ theme }) => theme.colors.border};`;
const Field = styled.div`margin-bottom:16px;`;
const FieldRow = styled.div`display:flex;gap:12px;`;
const Label = styled.label`display:block;font-size:13px;font-weight:500;color:${({ theme }) => theme.colors.textSecondary};margin-bottom:6px;`;
const Input = styled.input`width:100%;padding:10px 12px;border:1px solid ${({ theme }) => theme.colors.border};border-radius:8px;font-size:14px;color:${({ theme }) => theme.colors.textPrimary};background:${({ theme }) => theme.colors.background};&:focus{outline:none;border-color:${({ theme }) => theme.colors.primary};}`;
const Select = styled.select`width:100%;padding:10px 12px;border:1px solid ${({ theme }) => theme.colors.border};border-radius:8px;font-size:14px;color:${({ theme }) => theme.colors.textPrimary};background:${({ theme }) => theme.colors.background};&:focus{outline:none;border-color:${({ theme }) => theme.colors.primary};}`;
const Textarea = styled.textarea`width:100%;padding:10px 12px;border:1px solid ${({ theme }) => theme.colors.border};border-radius:8px;font-size:14px;color:${({ theme }) => theme.colors.textPrimary};background:${({ theme }) => theme.colors.background};resize:vertical;&:focus{outline:none;border-color:${({ theme }) => theme.colors.primary};}`;
const ErrorText = styled.div`color:#ef4444;font-size:13px;margin-bottom:8px;`;
const CancelBtn = styled.button`padding:10px 18px;border:1px solid ${({ theme }) => theme.colors.border};background:${({ theme }) => theme.colors.card};color:${({ theme }) => theme.colors.textPrimary};border-radius:8px;font-weight:500;cursor:pointer;&:hover{background:${({ theme }) => theme.colors.borderLight};}`;
const SubmitBtn = styled.button`padding:10px 18px;background:${({ theme }) => theme.colors.primary};color:white;border:none;border-radius:8px;font-weight:500;cursor:pointer;&:hover{background:${({ theme }) => theme.colors.primaryHover};}&:disabled{opacity:0.6;cursor:not-allowed;}`;
