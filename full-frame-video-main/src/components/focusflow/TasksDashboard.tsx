import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  Laptop,
  MessageCircle,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mascot } from './mascot';
import { Timeline } from './timeline';
import {
  completionStats,
  demoTasks,
  focusDurationSeconds,
  timelineSteps,
  weeklyHours,
  type Task,
  type CalendarEvent,
  type FocusSession,
} from './data';

type Modal = 'task' | 'assignment' | 'event' | 'tasks' | 'plan' | 'notifications' | null;

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Sparkle() {
  return (
    <svg viewBox="0 0 24 30" width="24" height="30" fill="none" aria-hidden="true">
      <path
        d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z"
        fill="url(#ff-star-gradient-tasks)"
      />
      <path
        d="M19 19 C19 21.209 17.209 23 15 23 C17.209 23 19 24.791 19 27 C19 24.791 20.791 23 23 23 C20.791 23 19 21.209 19 19 Z"
        fill="url(#ff-star-gradient-tasks)"
        opacity="0.8"
      />
      <defs>
        <linearGradient id="ff-star-gradient-tasks" x1="0" y1="0" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--focusflow-blue)" />
          <stop offset="1" stopColor="var(--focusflow-violet)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TasksDashboard({ onNavigateHome }: { onNavigateHome?: () => void }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(() => {
    return demoTasks.map(t => ({ ...t }));
  });
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'demo-ev-1',
      title: 'Computer Networks',
      starts_at: new Date().toISOString(),
      duration_minutes: 180,
    },
    {
      id: 'demo-ev-2',
      title: 'Operating Systems Lab',
      starts_at: new Date(Date.now() + 86400000).toISOString(),
      duration_minutes: 120,
    },
  ]);
  const [sessions, setSessions] = useState<FocusSession[]>([
    { duration_seconds: 3600, finished_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { duration_seconds: 2700, finished_at: new Date(Date.now() - 86400000).toISOString() },
    { duration_seconds: 3600, finished_at: new Date().toISOString() },
  ]);

  const [now, setNow] = useState<Date | null>(null);
  const [active, setActive] = useState(0);
  const manualUntil = useRef(0);
  const [tab, setTab] = useState<'Today' | 'Week'>('Today');
  const [modal, setModal] = useState<Modal>(null);

  const [remaining, setRemaining] = useState(focusDurationSeconds);
  const [running, setRunning] = useState(false);
  const deadline = useRef(0);
  const [focusMinutes, setFocusMinutes] = useState(45);
  const [metric, setMetric] = useState('Study Time');

  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!now || Date.now() < manualUntil.current) return;
    setActive(Math.floor(now.getTime() / 7000) % 4);
  }, [now]);

  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        setFocusMinutes(v => v + 45);
        setSessions(s => [
          ...s,
          { duration_seconds: focusDurationSeconds, finished_at: new Date().toISOString() },
        ]);
        toast.success('Focus complete. Time for a well-earned break.');
      }
    }, 250);
    return () => clearInterval(tick);
  }, [running]);

  function toggleFocus() {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      setRunning(false);
      toast.info('Focus paused.');
    } else {
      const seconds = remaining || focusDurationSeconds;
      setRemaining(seconds);
      deadline.current = Date.now() + seconds * 1000;
      setRunning(true);
      toast.success('Focus session started. Stay in flow!');
    }
  }

  function open(next: Modal) {
    setTitle('');
    setDue('');
    setModal(next);
  }

  function toggleTask(task: Task) {
    setTasks(old =>
      old.map(row => (row.id === task.id ? { ...row, completed: !task.completed } : row))
    );
    if (!task.completed) {
      toast.success(`Completed: ${task.title}`);
    }
  }

  function saveRecord(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);

    try {
      if (modal === 'event') {
        if (!due) throw new Error('Choose an event date and time.');
        setEvents(old => [
          ...old,
          {
            id: crypto.randomUUID(),
            title: title.trim(),
            starts_at: new Date(due).toISOString(),
            duration_minutes: 60,
          },
        ]);
        toast.success('Event scheduled for today');
      } else {
        const record: Task = {
          id: crypto.randomUUID(),
          title: title.trim(),
          due_label: due || 'Today · 5:00 PM',
          kind: modal === 'assignment' ? 'assignment' : 'task',
          completed: false,
        };
        setTasks(old => [record, ...old]);
        toast.success(modal === 'assignment' ? 'Assignment added' : 'Task added');
      }
      setModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  const stats = completionStats(tasks);
  const studyHours = [3.5, 2.8, 4.3, 5.6, 3.6, 4.2, 5.1];
  const values =
    metric === 'Study Time'
      ? studyHours
      : days.map((_, i) => [3, 2, 4, 5, 3, 4, 6][i] ?? 0);

  const currentEvent = events[0];
  const clock =
    now?.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }) ??
    '9:00';
  const timer = `${Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`;
  const hours = sessions.reduce((s, r) => s + r.duration_seconds / 3600, 0);
  const date =
    now?.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }) ?? 'Your day';

  function handleHomeClick() {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate({ to: '/dashboard' });
    }
  }

  function taskRows(all = false) {
    const list = all ? tasks : tasks.slice(0, 4);
    return (
      <div className="task-list">
        {list.map((task, i) => (
          <div key={task.id} className={`task-row ${task.completed ? 'completed' : ''}`}>
            <span className="task-number">
              {task.completed ? <Check size={11} strokeWidth={3} /> : i + 1}
            </span>
            <div className="task-copy">
              <strong>{task.title}</strong>
              <small>{task.due_label}</small>
            </div>
            <input
              type="checkbox"
              aria-label={`Complete ${task.title}`}
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
          </div>
        ))}
        {!tasks.length && (
          <p className="empty-state">
            A fresh start.
            <br />
            Add your first task for today.
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="app-shell">
      {/* FocusFlow Top Header with Brand */}
      <header className="app-header">
        <Link
          to="/dashboard"
          onClick={handleHomeClick}
          className="ff-brand"
          aria-label="FocusFlow dashboard"
        >
          <Sparkle />
          <span>
            Focus<span className="text-primary">Flow</span>
          </span>
        </Link>
      </header>

      {/* Center-Up Dock Navbar matching dashboard */}
      <nav className="ff-dock" aria-label="Main navigation" data-active="1">
        <span className="ff-dock-indicator" />
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={handleHomeClick}
        >
          <Home strokeWidth={1.8} />
          <span>Home</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button is-active"
          aria-current="page"
        >
          <CheckSquare strokeWidth={1.8} />
          <span>Tasks</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: '/calendar' })}
        >
          <CalendarDays strokeWidth={1.8} />
          <span>Calendar</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: '/chat' })}
        >
          <MessageSquare strokeWidth={1.8} />
          <span>Chat</span>
        </Button>
        <Button
          variant="navigation"
          className="ff-nav-button"
          onClick={() => navigate({ to: '/goals' })}
        >
          <Target strokeWidth={1.8} />
          <span>Goals</span>
        </Button>
      </nav>

      {/* Main Two-Column Glass Dashboard */}
      <div className="dashboard">
        {/* Left Column */}
        <div className="left-column">
          <section className="greeting">
            <p className="eyebrow">Good morning,</p>
            <h1>Karthik</h1>
            <p className="tagline">Same dreams. Better plans.</p>
          </section>

          <section className="mascot-stage">
            <Mascot />
            <div className="mascot-caption">
              <form
                className="chat-pill-box"
                onSubmit={e => {
                  e.preventDefault();
                  if (chatInput.trim()) {
                    toast.success(`Message sent: "${chatInput}"`);
                    setChatInput('');
                  }
                  open('plan');
                }}
              >
                <MessageCircle className="chat-pill-icon" size={17} />
                <input
                  type="text"
                  className="chat-pill-input"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  aria-label="Type a message to assistant"
                />
                <button
                  type="button"
                  className="chat-pill-mic"
                  aria-label="Voice input or plan day"
                  onClick={() => open('plan')}
                >
                  <Mic size={15} />
                </button>
              </form>
            </div>
          </section>

          <div className="left-bottom">
            <section className="glass focus-panel">
              <div className="panel-header">
                <h2>
                  <Timer />
                  Study Focus
                </h2>
                <Sun size={13} className="text-primary" />
              </div>
              <div className="focus-content">
                <div className="timer-ring">
                  <svg viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="44" className="ring-track" />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      className="ring-value"
                      strokeDasharray="276.46"
                      strokeDashoffset={276.46 * (1 - remaining / focusDurationSeconds)}
                    />
                  </svg>
                  <div className="timer-text">
                    {timer}
                    <small>{running ? 'In the zone' : 'Focus time'}</small>
                  </div>
                </div>
                <div className="focus-meta">
                  <strong>Database Systems</strong>
                  <p>{running ? 'One thing at a time.' : 'A little focus goes a long way.'}</p>
                  <Button className="soft-button" onClick={toggleFocus}>
                    {running ? <Pause /> : <Play />}
                    {running ? 'Pause Focus' : 'Start Focus'}
                  </Button>
                </div>
              </div>
              <div className="focus-footer">
                <span>
                  {running ? 'Your focus is on.' : `${focusMinutes} min focused today`}
                </span>
                <Button
                  variant="ghost"
                  title="Reset focus timer"
                  aria-label="Reset focus timer"
                  className="section-link"
                  onClick={() => {
                    setRunning(false);
                    setRemaining(focusDurationSeconds);
                    toast.info('Timer reset.');
                  }}
                >
                  <RotateCcw />
                </Button>
              </div>
            </section>

            <section className="glass progress-panel">
              <div className="panel-header">
                <h2>
                  <TrendingUp />
                  Your Progress
                </h2>
                <span className="text-muted-foreground text-[8px] font-semibold">This week</span>
              </div>
              <svg viewBox="0 0 220 70" className="progress-chart" aria-label="Study progress">
                <defs>
                  <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="var(--violet)" stopOpacity=".15" />
                    <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 53 C15 51 18 19 35 25 S60 61 77 42 S98 16 116 25 S133 37 147 20 S167 7 182 21 S205 31 220 9 L220 70 L0 70 Z"
                  fill="url(#progress-fill)"
                />
                <path
                  d="M0 53 C15 51 18 19 35 25 S60 61 77 42 S98 16 116 25 S133 37 147 20 S167 7 182 21 S205 31 220 9"
                  className="progress-line"
                />
              </svg>
              <div className="progress-stats">
                <div>
                  <strong>{hours ? `${hours.toFixed(1)}h` : '18h 40m'}</strong>
                  <small>Study time</small>
                </div>
                <div>
                  <strong>
                    {stats.completed}/{stats.total}
                  </strong>
                  <small>Completed</small>
                </div>
                <div>
                  <strong className="positive">{stats.percentage}%</strong>
                  <small>Task progress</small>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <section className="glass schedule-panel">
            <div className="schedule-info">
              <div className="schedule-tabs">
                {(['Today', 'Week'] as const).map(t => (
                  <Button
                    key={t}
                    variant="ghost"
                    className={`schedule-tab ${tab === t ? 'selected' : ''}`}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              {tab === 'Today' ? (
                <>
                  <Button
                    variant="ghost"
                    className="class-tile"
                    onClick={() => open('plan')}
                  >
                    <span className="class-icon">
                      <Laptop />
                    </span>
                    <span>
                      <strong>{currentEvent?.title ?? 'Computer Networks'}</strong>
                      <small>Class · Block 1</small>
                    </span>
                    <ChevronRight className="tile-chevron" />
                  </Button>
                  <p className="class-time">
                    <Clock3 />
                    9:00 – 12:00
                  </p>
                  <p className="class-subtitle">{timelineSteps[active]?.title || 'Lecture'}</p>
                </>
              ) : (
                <div className="week-agenda">
                  <div>
                    <span>Mon · Computer Networks</span>
                    <small>9:00 AM</small>
                  </div>
                  <div>
                    <span>Tue · Database Systems</span>
                    <small>10:15 AM</small>
                  </div>
                  <div>
                    <span>Wed · Software Engineering</span>
                    <small>1:30 PM</small>
                  </div>
                  <div>
                    <span>Thu · Design Lab</span>
                    <small>11:00 AM</small>
                  </div>
                </div>
              )}
            </div>
            <Timeline
              active={active}
              time={clock}
              onSelect={i => {
                manualUntil.current = Date.now() + 20000;
                setActive(i);
              }}
            />
          </section>

          <div className="middle-row">
            <section className="glass actions-panel">
              <div className="panel-header">
                <h2>Quick Actions</h2>
                <Button variant="ghost" className="section-link" onClick={() => open('plan')}>
                  See all <ArrowRight />
                </Button>
              </div>
              <div className="actions-grid">
                <Button variant="ghost" className="action-button" onClick={() => open('task')}>
                  <Plus />
                  Add Task
                </Button>
                <Button
                  variant="ghost"
                  className="action-button"
                  onClick={() => open('assignment')}
                >
                  <FileText />
                  Add Assignment
                </Button>
                <Button variant="ghost" className="action-button" onClick={() => open('event')}>
                  <CalendarDays />
                  Create Event
                </Button>
                <Button variant="ghost" className="action-button" onClick={toggleFocus}>
                  {running ? <Pause /> : <Play />}
                  {running ? 'Pause Focus' : 'Start Focus'}
                </Button>
              </div>
            </section>

            <section className="glass tasks-panel">
              <div className="panel-header">
                <h2>Today's Tasks</h2>
                <Button variant="ghost" className="section-link" onClick={() => open('tasks')}>
                  View all <ArrowRight />
                </Button>
              </div>
              {taskRows()}
            </section>
          </div>

          <section className="glass weekly-panel">
            <div className="panel-header">
              <h2 className="display">This Week</h2>
              <select
                className="metric-select"
                aria-label="Weekly chart metric"
                value={metric}
                onChange={e => setMetric(e.target.value)}
              >
                <option>Study Time</option>
                <option>Completed Tasks</option>
              </select>
            </div>
            <div className="weekly-chart">
              <div className="chart-grid" />
              {days.map((day, i) => (
                <div className="bar-column" key={day}>
                  <div
                    className="chart-bar"
                    tabIndex={0}
                    aria-label={`${day}: ${(values[i] ?? 0).toFixed(1)} ${metric === 'Study Time' ? 'hours' : 'tasks'}`}
                    style={{
                      height: `${Math.max(12, Math.min(92, ((values[i] ?? 0) / Math.max(6, ...values)) * 92))}px`,
                    }}
                  >
                    <span className="bar-tooltip">
                      {(values[i] ?? 0).toFixed(1)}
                      {metric === 'Study Time' ? 'h' : ' tasks'}
                    </span>
                  </div>
                  <small>{day}</small>
                </div>
              ))}
              <div className="axis-labels">
                {[6, 4, 2, 0].map(n => (
                  <span key={n}>
                    {n}
                    {metric === 'Study Time' ? 'h' : ''}
                  </span>
                ))}
              </div>
            </div>
            <p className="weekly-quote">
              <Sparkles />
              Small steps every day lead to big results.
            </p>
            <svg className="quote-wave" viewBox="0 0 250 65" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 65 Q60 70 110 35 T200 25 T250 0 V65Z" fill="var(--accent)" />
              <path d="M0 57 C55 63 65 29 115 30 S195 56 250 13" stroke="var(--violet)" strokeWidth="1.5" fill="none" />
            </svg>
          </section>
        </div>
      </div>

      {/* Interactive Modal Dialogs */}
      <Dialog open={modal !== null} onOpenChange={val => !val && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === 'task'
                ? 'Add a task'
                : modal === 'assignment'
                  ? 'Add an assignment'
                  : modal === 'event'
                    ? 'Create an event'
                    : modal === 'tasks'
                      ? "Today's tasks"
                      : modal === 'notifications'
                        ? 'Your updates'
                        : 'Plan your day'}
            </DialogTitle>
            <DialogDescription>
              {modal === 'notifications'
                ? 'Stay up to date with your academic schedule.'
                : 'One small step, then the next.'}
            </DialogDescription>
          </DialogHeader>

          {['task', 'assignment', 'event'].includes(modal ?? '') && (
            <form className="modal-form" onSubmit={saveRecord}>
              <label className="form-field">
                {modal === 'event' ? 'Event title' : 'Task title'}
                <input
                  autoFocus
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={
                    modal === 'event' ? 'e.g. Design study group' : 'e.g. Finish network assignment'
                  }
                />
              </label>
              <label className="form-field">
                {modal === 'event' ? 'Date and time' : 'Due time or deadline'}
                <input
                  type={modal === 'event' ? 'datetime-local' : 'text'}
                  required={modal === 'event'}
                  value={due}
                  onChange={e => setDue(e.target.value)}
                  placeholder="Today · 5:00 PM"
                />
              </label>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save'}
                <ArrowRight />
              </Button>
            </form>
          )}

          {modal === 'tasks' && (
            <>
              {taskRows(true)}
              <Button onClick={() => open('task')} className="mt-4">
                <Plus /> Add Task
              </Button>
            </>
          )}

          {modal === 'plan' && (
            <>
              <div className="modal-tabs mb-4">
                <Button onClick={() => open('task')}>
                  <Plus /> Add Task
                </Button>
                <Button variant="secondary" onClick={() => open('event')}>
                  <CalendarDays /> Create Event
                </Button>
              </div>
              {taskRows(true)}
              {events.map(e => (
                <p key={e.id} className="text-muted-foreground text-xs my-1">
                  {e.title} · {new Date(e.starts_at).toLocaleString()}
                </p>
              ))}
              <Button
                className="soft-button w-full mt-4"
                onClick={() => {
                  toggleFocus();
                  setModal(null);
                }}
              >
                <Play /> Begin a focus session
              </Button>
            </>
          )}

          {modal === 'notifications' && (
            <p className="empty-state">
              {tasks.filter(t => !t.completed).length
                ? `${tasks.filter(t => !t.completed).length} tasks are waiting for your next small step.`
                : 'All caught up. Enjoy a little breathing room.'}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

export const Dashboard = TasksDashboard;
