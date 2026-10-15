import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Play,
  Pause,
  MoreVertical,
  MoreHorizontal,
  Check,
  Wifi,
  Database,
  Triangle,
  Cpu,
  FileText,
  Calendar,
  CalendarDays,
  Home,
  CheckSquare,
  BookOpen,
  MessageSquare,
  Target,
  Sparkles,
  User,
  Briefcase,
  ArrowRight,
  X,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Types
export interface CalendarEventItem {
  id: string;
  day: number; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "10:00"
  subject: string;
  activity: string;
  category: "cn" | "dbms" | "algo" | "os" | "gate";
  gridRowStart: number;
  gridRowSpan: number;
}

export interface ScheduleRow {
  id: string;
  time: string;
  subject: string;
  details: string;
  color: string;
  category: "cn" | "dbms" | "algo" | "os";
}

export interface TodoItem {
  id: string;
  title: string;
  meta: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

export interface CampusEvent {
  id: string;
  title: string;
  speaker: string;
  time: string;
  location?: string;
  description?: string;
}

// Initial Data matching reference screenshot exactly
const INITIAL_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: "cal-1",
    day: 1, // Mon
    startTime: "08:00",
    endTime: "10:00",
    subject: "Computer Networks",
    activity: "Lecture",
    category: "cn",
    gridRowStart: 1,
    gridRowSpan: 2,
  },
  {
    id: "cal-2",
    day: 1, // Mon
    startTime: "11:30",
    endTime: "12:30",
    subject: "Database Systems",
    activity: "Lab",
    category: "dbms",
    gridRowStart: 4,
    gridRowSpan: 2,
  },
  {
    id: "cal-3",
    day: 1, // Mon
    startTime: "14:00",
    endTime: "15:00",
    subject: "Algorithms",
    activity: "Practice",
    category: "algo",
    gridRowStart: 6,
    gridRowSpan: 2,
  },
  {
    id: "cal-4",
    day: 1, // Mon
    startTime: "16:00",
    endTime: "17:00",
    subject: "Operating Systems",
    activity: "Notes",
    category: "os",
    gridRowStart: 8,
    gridRowSpan: 2,
  },
  {
    id: "cal-5",
    day: 2, // Tue
    startTime: "09:00",
    endTime: "11:00",
    subject: "CN Assignment",
    activity: "Work",
    category: "cn",
    gridRowStart: 2,
    gridRowSpan: 2,
  },
  {
    id: "cal-6",
    day: 3, // Wed
    startTime: "10:00",
    endTime: "12:00",
    subject: "DBMS Lab Record",
    activity: "Work",
    category: "dbms",
    gridRowStart: 3,
    gridRowSpan: 2,
  },
  {
    id: "cal-7",
    day: 4, // Thu
    startTime: "08:30",
    endTime: "10:30",
    subject: "Algorithms Analysis",
    activity: "Study",
    category: "algo",
    gridRowStart: 1,
    gridRowSpan: 2,
  },
  {
    id: "cal-8",
    day: 5, // Fri
    startTime: "14:00",
    endTime: "16:00",
    subject: "OS Reading",
    activity: "Study",
    category: "os",
    gridRowStart: 6,
    gridRowSpan: 2,
  },
  {
    id: "cal-9",
    day: 6, // Sat
    startTime: "08:00",
    endTime: "11:00",
    subject: "GATE Practice",
    activity: "Mock Test",
    category: "gate",
    gridRowStart: 1,
    gridRowSpan: 3,
  },
];

const INITIAL_SCHEDULE: ScheduleRow[] = [
  {
    id: "sch-1",
    time: "08:00 – 10:00",
    subject: "Computer Networks",
    details: "Lecture • Block 1",
    color: "#3b82f6",
    category: "cn",
  },
  {
    id: "sch-2",
    time: "11:30 – 12:30",
    subject: "Database Systems",
    details: "Lab Record",
    color: "#ec4899",
    category: "dbms",
  },
  {
    id: "sch-3",
    time: "14:00 – 15:00",
    subject: "Algorithms",
    details: "Problem Practice",
    color: "#a855f7",
    category: "algo",
  },
  {
    id: "sch-4",
    time: "16:30 – 18:00",
    subject: "Operating Systems",
    details: "Revision",
    color: "#22c55e",
    category: "os",
  },
];

const INITIAL_TODOS: TodoItem[] = [
  {
    id: "todo-1",
    title: "Graphs - BFS & DFS",
    meta: "DAA • 2 topics • ~30 min",
    priority: "High",
    completed: true,
  },
  {
    id: "todo-2",
    title: "CPU Scheduling Algorithms",
    meta: "OS • 3 topics • ~40 min",
    priority: "Medium",
    completed: false,
  },
  {
    id: "todo-3",
    title: "Normalization (BCNF)",
    meta: "DBMS • 2 topics • ~30 min",
    priority: "Medium",
    completed: false,
  },
  {
    id: "todo-4",
    title: "OSI Model",
    meta: "CN • 2 topics • ~25 min",
    priority: "Low",
    completed: false,
  },
];

const INITIAL_EVENTS: CampusEvent[] = [
  {
    id: "ev-1",
    title: "User centric design methods workshop",
    speaker: "by Ian Fiks",
    time: "16:00 – 17:00",
    location: "Auditorium C • Design Studio",
    description: "Hands-on UI/UX architecture principles, behavioral mental models, and glassmorphic micro-interaction design.",
  },
  {
    id: "ev-2",
    title: "Shutterphile club meet",
    speaker: "by Sarah",
    time: "17:00 – 19:00",
    location: "Media Lab 2",
    description: "Composition techniques, lens geometry, and post-processing showcase for campus photographers.",
  },
];

const WEEK_DAYS = [
  { name: "SUN", date: 12, dayIndex: 0 },
  { name: "MON", date: 13, dayIndex: 1 },
  { name: "TUE", date: 14, dayIndex: 2 },
  { name: "WED", date: 15, dayIndex: 3 },
  { name: "THU", date: 16, dayIndex: 4 },
  { name: "FRI", date: 17, dayIndex: 5 },
  { name: "SAT", date: 18, dayIndex: 6 },
];

const TIME_ROWS = [
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export function AcademicCalendarDashboard() {
  const navigate = useNavigate();

  // State
  const [selectedDayIndex, setSelectedDayIndex] = useState(1); // Monday default
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [schedule, setSchedule] = useState<ScheduleRow[]>(INITIAL_SCHEDULE);
  const [campusEvents, setCampusEvents] = useState<CampusEvent[]>(INITIAL_EVENTS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(INITIAL_CALENDAR_EVENTS);

  // Active playing session in schedule
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Modals
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<CampusEvent | null>(null);
  const [isViewAllEventsOpen, setIsViewAllEventsOpen] = useState(false);

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("DAA");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const [newScheduleSubject, setNewScheduleSubject] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("10:00 – 11:30");
  const [newScheduleDetails, setNewScheduleDetails] = useState("Lecture");


  // Filtered lists
  const filteredCalendarEvents = useMemo(() => {
    return calendarEvents.filter((ev) => {
      if (selectedSubjectFilter && ev.category !== selectedSubjectFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ev.subject.toLowerCase().includes(q) ||
        ev.activity.toLowerCase().includes(q)
      );
    });
  }, [calendarEvents, selectedSubjectFilter, searchQuery]);

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      if (selectedSubjectFilter && item.category !== selectedSubjectFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.subject.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q)
      );
    });
  }, [schedule, selectedSubjectFilter, searchQuery]);

  const filteredTodos = useMemo(() => {
    return todos.filter((t) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.meta.toLowerCase().includes(q);
    });
  }, [todos, searchQuery]);

  // Actions
  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    toast.success("Task status updated");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TodoItem = {
      id: `todo-${Date.now()}`,
      title: newTaskTitle.trim(),
      meta: `${newTaskSubject} • 1 topic • ~30 min`,
      priority: newTaskPriority,
      completed: false,
    };
    setTodos((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    setIsAddTaskOpen(false);
    toast.success("Task added to to-do list");
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleSubject.trim()) return;
    const newRow: ScheduleRow = {
      id: `sch-${Date.now()}`,
      time: newScheduleTime,
      subject: newScheduleSubject.trim(),
      details: newScheduleDetails,
      color: "#3b82f6",
      category: "cn",
    };
    setSchedule((prev) => [...prev, newRow]);
    setNewScheduleSubject("");
    setIsAddScheduleOpen(false);
    toast.success("Schedule item added");
  };

  const toggleFocusSession = (id: string, subject: string) => {
    if (activeSessionId === id) {
      setActiveSessionId(null);
      toast.info(`Paused focus on ${subject}`);
    } else {
      setActiveSessionId(id);
      toast.success(`Started focus session for ${subject}! ✨`);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cn":
        return <Wifi className="size-3.5" />;
      case "dbms":
        return <Database className="size-3.5" />;
      case "algo":
        return <Triangle className="size-3.5" />;
      case "os":
        return <Cpu className="size-3.5" />;
      case "gate":
        return <FileText className="size-3.5" />;
      default:
        return <BookOpen className="size-3.5" />;
    }
  };

  return (
    <div className="ff-acad-page">
      {/* Abstract Glowing Atmosphere Blobs */}
      <div className="ff-acad-blob ff-acad-blob-1" aria-hidden="true" />
      <div className="ff-acad-blob ff-acad-blob-2" aria-hidden="true" />
      <div className="ff-acad-blob ff-acad-blob-3" aria-hidden="true" />

      {/* Main Canvas Frame: 1460px max width fixed desktop layout */}
      <div className="ff-acad-container">
        {/* ========================================================= */}
        {/* TOP HEADER ROW                                           */}
        {/* ========================================================= */}
        <header className="ff-acad-header">
          {/* Brand Logo */}
          <Link to="/" className="ff-acad-brand" aria-label="FocusFlow Home">
            <svg viewBox="0 0 24 24" className="ff-acad-sparkle-icon" aria-hidden="true">
              <path
                d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z"
                fill="#2563eb"
              />
            </svg>
            <span className="ff-acad-brand-text">
              <span className="ff-acad-brand-focus">Focus</span>
              <span className="ff-acad-brand-flow">Flow</span>
            </span>
          </Link>

        </header>

        {/* Center-Up Dock Navbar matching Dashboard and Tasks */}
        <nav className="ff-dock" aria-label="Main navigation" data-active="2">
          <span className="ff-dock-indicator" />
          <Button
            variant="navigation"
            className="ff-nav-button"
            onClick={() => navigate({ to: "/" })}
          >
            <Home strokeWidth={1.8} />
            <span>Home</span>
          </Button>
          <Button
            variant="navigation"
            className="ff-nav-button"
            onClick={() => navigate({ to: "/tasks" })}
          >
            <CheckSquare strokeWidth={1.8} />
            <span>Tasks</span>
          </Button>
          <Button
            variant="navigation"
            className="ff-nav-button is-active"
            aria-current="page"
          >
            <CalendarDays strokeWidth={1.8} />
            <span>Calendar</span>
          </Button>
          <Button
            variant="navigation"
            className="ff-nav-button"
            onClick={() => navigate({ to: "/chat" })}
          >
            <MessageSquare strokeWidth={1.8} />
            <span>Chat</span>
          </Button>
          <Button
            variant="navigation"
            className="ff-nav-button"
            onClick={() => navigate({ to: "/goals" })}
          >
            <Target strokeWidth={1.8} />
            <span>Goals</span>
          </Button>
        </nav>

        {/* ========================================================= */}
        {/* MAIN THREE-COLUMN DASHBOARD LAYOUT                        */}
        {/* ========================================================= */}
        <div className="ff-acad-main-grid">
          {/* ------------------------------------------------------- */}
          {/* A. FAR-LEFT VERTICAL SEMESTER SIDEBAR                   */}
          {/* ------------------------------------------------------- */}
          <aside className="ff-acad-sidebar">
            <div className="ff-acad-sidebar-top">
              <div className="ff-acad-sem-badge">
                <span className="ff-acad-sem-s">$</span>
                <span className="ff-acad-sem-title">SEM 3</span>
              </div>
              <p className="ff-acad-sem-sub">B.Tech CSE</p>
              <div className="ff-acad-progress-line" />
            </div>

            {/* Giant Vertical Augustus Title */}
            <div className="ff-acad-vertical-month" aria-label="Month Augustus">
              <span>Augustus</span>
            </div>

            {/* Bottom Sidebar Info */}
            <div className="ff-acad-sidebar-bottom">
              <div className="ff-acad-calendar-icon-wrap">
                <Calendar className="size-4 text-blue-600" />
              </div>
              <div className="ff-acad-sidebar-date">
                <strong>Oct 2026</strong>
                <span>Week 6</span>
              </div>
            </div>
          </aside>

          {/* ------------------------------------------------------- */}
          {/* B. MAIN CENTRAL WEEKLY CALENDAR & SHORTCUT STRIP        */}
          {/* ------------------------------------------------------- */}
          <div className="ff-acad-center-column">
            {/* Main Calendar Card */}
            <section className="ff-acad-calendar-card">
              {/* Weekday Column Headers */}
              <div className="ff-acad-week-header">
                {WEEK_DAYS.map((wd) => {
                  const isSelected = selectedDayIndex === wd.dayIndex;
                  return (
                    <button
                      key={wd.name}
                      type="button"
                      className={`ff-acad-week-day-btn ${isSelected ? "is-selected" : ""}`}
                      onClick={() => setSelectedDayIndex(wd.dayIndex)}
                      aria-label={`Select ${wd.name} ${wd.date}`}
                    >
                      <span className="ff-acad-day-name">{wd.name}</span>
                      <span className="ff-acad-day-number">{wd.date}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time Grid Layout */}
              <div className="ff-acad-time-grid">
                {/* Time Axis Labels */}
                <div className="ff-acad-time-axis">
                  {TIME_ROWS.map((time) => (
                    <div key={time} className="ff-acad-time-label">
                      {time}
                    </div>
                  ))}
                </div>

                {/* 7 Day Columns with Grid Events */}
                <div className="ff-acad-grid-columns">
                  {/* Background Grid Lines */}
                  <div className="ff-acad-grid-lines" aria-hidden="true">
                    {TIME_ROWS.map((t) => (
                      <div key={t} className="ff-acad-grid-row-line" />
                    ))}
                  </div>

                  {/* Columns 0 to 6 */}
                  {WEEK_DAYS.map((wd) => {
                    const dayEvents = filteredCalendarEvents.filter(
                      (ev) => ev.day === wd.dayIndex
                    );
                    const isToday = wd.dayIndex === 1; // Mon is active today in reference

                    return (
                      <div
                        key={wd.name}
                        className={`ff-acad-day-col ${isToday ? "is-today-col" : ""}`}
                      >
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className={`ff-acad-event-card ff-acad-event-${ev.category}`}
                            style={{
                              gridRowStart: ev.gridRowStart,
                              gridRowEnd: `span ${ev.gridRowSpan}`,
                            }}
                          >
                            <span className="ff-acad-event-time">
                              {ev.startTime} – {ev.endTime}
                            </span>
                            <strong className="ff-acad-event-title">
                              {ev.subject}
                            </strong>
                            <span className="ff-acad-event-activity">
                              {ev.activity}
                            </span>
                            <span className="ff-acad-event-icon-badge">
                              {getCategoryIcon(ev.category)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Subject Shortcut Strip Beneath Calendar */}
            <div className="ff-acad-subject-strip">
              <button
                type="button"
                className={`ff-acad-subject-pill ff-acad-subject-pill-cn ${selectedSubjectFilter === "cn" ? "is-active" : ""}`}
                onClick={() =>
                  setSelectedSubjectFilter(selectedSubjectFilter === "cn" ? null : "cn")
                }
              >
                <span className="ff-acad-pill-icon ff-pill-icon-cn">
                  <Wifi size={14} />
                </span>
                <span className="ff-acad-pill-name">Computer Networks</span>
                <ChevronRight size={13} className="ff-acad-pill-chevron" />
              </button>

              <button
                type="button"
                className={`ff-acad-subject-pill ff-acad-subject-pill-dbms ${selectedSubjectFilter === "dbms" ? "is-active" : ""}`}
                onClick={() =>
                  setSelectedSubjectFilter(selectedSubjectFilter === "dbms" ? null : "dbms")
                }
              >
                <span className="ff-acad-pill-icon ff-pill-icon-dbms">
                  <Database size={14} />
                </span>
                <span className="ff-acad-pill-name">Database Systems</span>
                <ChevronRight size={13} className="ff-acad-pill-chevron" />
              </button>

              <button
                type="button"
                className={`ff-acad-subject-pill ff-acad-subject-pill-algo ${selectedSubjectFilter === "algo" ? "is-active" : ""}`}
                onClick={() =>
                  setSelectedSubjectFilter(selectedSubjectFilter === "algo" ? null : "algo")
                }
              >
                <span className="ff-acad-pill-icon ff-pill-icon-algo">
                  <Triangle size={13} />
                </span>
                <span className="ff-acad-pill-name">Algorithms</span>
                <ChevronRight size={13} className="ff-acad-pill-chevron" />
              </button>

              <button
                type="button"
                className={`ff-acad-subject-pill ff-acad-subject-pill-os ${selectedSubjectFilter === "os" ? "is-active" : ""}`}
                onClick={() =>
                  setSelectedSubjectFilter(selectedSubjectFilter === "os" ? null : "os")
                }
              >
                <span className="ff-acad-pill-icon ff-pill-icon-os">
                  <Cpu size={14} />
                </span>
                <span className="ff-acad-pill-name">Operating Systems</span>
                <ChevronRight size={13} className="ff-acad-pill-chevron" />
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* C. RIGHT COLUMN: THREE STACKED PANELS                   */}
          {/* ------------------------------------------------------- */}
          <div className="ff-acad-right-column">
            {/* Panel 1: Today's Schedule */}
            <section className="ff-acad-card ff-acad-schedule-card">
              <div className="ff-acad-card-header">
                <div>
                  <h2 className="ff-acad-card-title">Today's Schedule</h2>
                  <p className="ff-acad-card-subtitle">Mon, 13 Oct 2026</p>
                </div>
                <div className="ff-acad-header-actions">
                  <button
                    type="button"
                    className="ff-acad-circle-btn"
                    aria-label="Previous day"
                    onClick={() => toast.info("Navigated to previous day")}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="ff-acad-circle-btn"
                    aria-label="Next day"
                    onClick={() => toast.info("Navigated to next day")}
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="ff-acad-circle-btn ff-acad-circle-primary"
                    aria-label="Add schedule item"
                    onClick={() => setIsAddScheduleOpen(true)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Schedule Timeline Rows */}
              <div className="ff-acad-schedule-list">
                {filteredSchedule.map((item, idx) => {
                  const isPlaying = activeSessionId === item.id;
                  return (
                    <div key={item.id} className="ff-acad-schedule-row">
                      {/* Timeline Dot & Connector Line */}
                      <div className="ff-acad-timeline-indicator">
                        <span
                          className="ff-acad-timeline-dot"
                          style={{ backgroundColor: item.color }}
                        />
                        {idx < filteredSchedule.length - 1 && (
                          <span className="ff-acad-timeline-line" />
                        )}
                      </div>

                      {/* Time Label */}
                      <span className="ff-acad-schedule-time">{item.time}</span>

                      {/* Subject Info */}
                      <div className="ff-acad-schedule-info">
                        <strong>{item.subject}</strong>
                        <span>{item.details}</span>
                      </div>

                      {/* Actions: Play focus & More */}
                      <div className="ff-acad-schedule-actions">
                        <button
                          type="button"
                          className={`ff-acad-play-btn ${isPlaying ? "is-playing" : ""}`}
                          aria-label={`Start session for ${item.subject}`}
                          onClick={() => toggleFocusSession(item.id, item.subject)}
                        >
                          {isPlaying ? <Pause size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
                        </button>
                        <button
                          type="button"
                          className="ff-acad-more-btn"
                          aria-label="Options"
                          onClick={() => toast.info(`Options for ${item.subject}`)}
                        >
                          <MoreVertical size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Panel 2: To-do list */}
            <section className="ff-acad-card ff-acad-todo-card">
              <div className="ff-acad-card-header">
                <h2 className="ff-acad-card-title">To-do list</h2>
                <div className="ff-acad-header-actions">
                  <button
                    type="button"
                    className="ff-acad-add-task-btn"
                    onClick={() => setIsAddTaskOpen(true)}
                  >
                    <Plus size={12} /> Add task
                  </button>
                  <button
                    type="button"
                    className="ff-acad-circle-btn"
                    aria-label="To-do options"
                    onClick={() => toast.info("Task filter & sort options")}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="ff-acad-todo-list">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`ff-acad-todo-row ${todo.completed ? "is-done" : ""}`}
                  >
                    {/* Circular Checkbox */}
                    <button
                      type="button"
                      className={`ff-acad-checkbox ${todo.completed ? "is-checked" : ""}`}
                      aria-label={`Toggle ${todo.title}`}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed && <Check size={11} strokeWidth={3} />}
                    </button>

                    {/* Task Title & Meta */}
                    <div className="ff-acad-todo-info">
                      <strong className="ff-acad-todo-title">{todo.title}</strong>
                      <span className="ff-acad-todo-meta">{todo.meta}</span>
                    </div>

                    {/* Priority Badge */}
                    <span
                      className={`ff-acad-priority-badge priority-${todo.priority.toLowerCase()}`}
                    >
                      {todo.priority}
                    </span>

                    {/* Overflow menu */}
                    <button
                      type="button"
                      className="ff-acad-more-btn"
                      aria-label="Task options"
                      onClick={() => toast.info(`Manage "${todo.title}"`)}
                    >
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Panel 3: Events */}
            <section className="ff-acad-card ff-acad-events-card">
              <div className="ff-acad-card-header">
                <h2 className="ff-acad-card-title">Events</h2>
                <button
                  type="button"
                  className="ff-acad-view-all-link"
                  onClick={() => setIsViewAllEventsOpen(true)}
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              {/* Event Entries */}
              <div className="ff-acad-events-list">
                {campusEvents.map((ev) => (
                  <div key={ev.id} className="ff-acad-event-entry">
                    {/* Purple Calendar Icon */}
                    <div className="ff-acad-event-icon-box">
                      <Calendar className="size-4 text-purple-600" />
                    </div>

                    {/* Event Info */}
                    <div className="ff-acad-event-entry-info">
                      <strong className="ff-acad-event-entry-title">
                        {ev.title}
                      </strong>
                      <div className="ff-acad-event-entry-meta">
                        <span>{ev.speaker}</span>
                        <span className="ff-acad-event-entry-time">{ev.time}</span>
                      </div>
                    </div>

                    {/* Details button & overflow */}
                    <div className="ff-acad-event-actions">
                      <button
                        type="button"
                        className="ff-acad-details-btn"
                        onClick={() => setSelectedEventDetail(ev)}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className="ff-acad-more-btn"
                        aria-label="Event options"
                        onClick={() => toast.info(`Options for ${ev.title}`)}
                      >
                        <MoreVertical size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE MODAL DIALOGS                                 */}
      {/* ========================================================= */}

      {/* Add Task Modal */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="ff-acad-dialog">
          <DialogHeader>
            <DialogTitle>Add a New Task</DialogTitle>
            <DialogDescription>
              Create a targeted study task for your academic schedule.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="ff-acad-form">
            <label className="ff-acad-field">
              <span>Task Name</span>
              <input
                type="text"
                placeholder="e.g. Master Bellman-Ford Algorithm"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="ff-acad-input"
              />
            </label>
            <div className="ff-acad-form-row">
              <label className="ff-acad-field">
                <span>Subject</span>
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="ff-acad-input"
                >
                  <option value="DAA">DAA (Algorithms)</option>
                  <option value="CN">CN (Computer Networks)</option>
                  <option value="DBMS">DBMS (Databases)</option>
                  <option value="OS">OS (Operating Systems)</option>
                </select>
              </label>
              <label className="ff-acad-field">
                <span>Priority</span>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="ff-acad-input"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>
            </div>
            <div className="ff-acad-modal-actions">
              <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Schedule Item Modal */}
      <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
        <DialogContent className="ff-acad-dialog">
          <DialogHeader>
            <DialogTitle>Add to Today's Schedule</DialogTitle>
            <DialogDescription>
              Block out lecture, lab, or problem-solving hours.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSchedule} className="ff-acad-form">
            <label className="ff-acad-field">
              <span>Subject or Activity</span>
              <input
                type="text"
                placeholder="e.g. Computer Networks Lab"
                value={newScheduleSubject}
                onChange={(e) => setNewScheduleSubject(e.target.value)}
                required
                className="ff-acad-input"
              />
            </label>
            <label className="ff-acad-field">
              <span>Time Slot</span>
              <input
                type="text"
                placeholder="e.g. 10:00 – 12:00"
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                required
                className="ff-acad-input"
              />
            </label>
            <label className="ff-acad-field">
              <span>Details / Room</span>
              <input
                type="text"
                placeholder="e.g. Lecture • Hall 4"
                value={newScheduleDetails}
                onChange={(e) => setNewScheduleDetails(e.target.value)}
                className="ff-acad-input"
              />
            </label>
            <div className="ff-acad-modal-actions">
              <Button type="button" variant="outline" onClick={() => setIsAddScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Add Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog
        open={selectedEventDetail !== null}
        onOpenChange={(open) => !open && setSelectedEventDetail(null)}
      >
        <DialogContent className="ff-acad-dialog">
          {selectedEventDetail && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEventDetail.title}</DialogTitle>
                <DialogDescription>
                  Hosted {selectedEventDetail.speaker}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2 text-sm text-slate-700">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={16} className="text-blue-600" />
                  <span>{selectedEventDetail.time}</span>
                </div>
                {selectedEventDetail.location && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} className="text-purple-600" />
                    <span>{selectedEventDetail.location}</span>
                  </div>
                )}
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {selectedEventDetail.description}
                </p>
              </div>
              <div className="ff-acad-modal-actions">
                <Button
                  type="button"
                  onClick={() => {
                    toast.success("RSVP registered! Added to calendar.");
                    setSelectedEventDetail(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  RSVP for Event
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* View All Events Modal */}
      <Dialog open={isViewAllEventsOpen} onOpenChange={setIsViewAllEventsOpen}>
        <DialogContent className="ff-acad-dialog max-w-lg">
          <DialogHeader>
            <DialogTitle>Campus Academic Events</DialogTitle>
            <DialogDescription>
              Upcoming workshops, seminars, and student club meets.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {campusEvents.map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <strong className="block text-xs font-semibold text-slate-900">{ev.title}</strong>
                  <span className="block text-[11px] text-slate-500">{ev.speaker} • {ev.time}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedEventDetail(ev);
                    setIsViewAllEventsOpen(false);
                  }}
                >
                  Details
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
