import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  Home,
  Medal,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  Trophy,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SplineScene } from "./SplineScene";
import {
  ActionCapsule,
  AchievementsCapsule,
  TodayTodoCapsule,
  ProfileCapsule,
  CompetitionsCapsule,
} from "./ActionCapsules";
import { TasksDashboard } from "./TasksDashboard";
import { AcademicCalendarDashboard } from "./AcademicCalendarDashboard";
import { SpatialCreationStudio } from "./SpatialCreationStudio";
import { GoalsDiscoveryDashboard } from "./GoalsDiscoveryDashboard";

export type Task = { id: number; title: string; done: boolean; time: string };

const initialTasks: Task[] = [
  { id: 1, title: "Review organic chemistry mechanisms", done: true, time: "08:30" },
  { id: 2, title: "Complete algorithmic complexity problem set", done: false, time: "10:15" },
  { id: 3, title: "Draft literature review introduction", done: false, time: "14:00" },
];

export type PlannerContextType = {
  tasks: Task[];
  addTask: (title: string, time: string) => void;
  toggleTask: (id: number) => void;
  activeTab: number;
  setActiveTab: (index: number) => void;
};

export const PlannerContext = createContext<PlannerContextType>({
  tasks: [],
  addTask: () => {},
  toggleTask: () => {},
  activeTab: 0,
  setActiveTab: () => {},
});

export const destinations = [
  { label: "Home", tab: 0, icon: Home },
  { label: "Tasks", tab: 1, icon: CheckSquare },
  { label: "Calendar", tab: 2, icon: CalendarDays },
  { label: "Chat", tab: 3, icon: MessageSquare },
  { label: "Goals", tab: 4, icon: Target },
] as const;

export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 56" fill="none" aria-hidden="true">
      <path
        d="M24 3C22 22 19 25 3 28C19 30 22 34 24 53C27 34 30 30 45 28C30 25 27 22 24 3Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function FocusFlowDashboard({ initialTab = 0 }: { initialTab?: number }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = (title: string, time: string) => {
    setTasks((old) => [...old, { id: Date.now(), title, time, done: false }]);
  };

  const toggleTask = (id: number) => {
    setTasks((old) =>
      old.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  if (activeTab === 1) {
    return (
      <PlannerContext.Provider
        value={{
          tasks,
          addTask,
          toggleTask,
          activeTab,
          setActiveTab,
        }}
      >
        <div key="tab-tasks" className="ff-tab-pane w-full min-h-screen">
          <TasksDashboard onNavigateHome={() => setActiveTab(0)} />
        </div>
      </PlannerContext.Provider>
    );
  }

  if (activeTab === 3) {
    return (
      <PlannerContext.Provider
        value={{
          tasks,
          addTask,
          toggleTask,
          activeTab,
          setActiveTab,
        }}
      >
        <div key="tab-chat" className="ff-tab-pane w-full min-h-screen">
          <SpatialCreationStudio />
        </div>
      </PlannerContext.Provider>
    );
  }

  if (activeTab === 4) {
    return (
      <PlannerContext.Provider
        value={{
          tasks,
          addTask,
          toggleTask,
          activeTab,
          setActiveTab,
        }}
      >
        <div key="tab-goals" className="ff-tab-pane w-full min-h-screen">
          <GoalsDiscoveryDashboard />
        </div>
      </PlannerContext.Provider>
    );
  }

  return (
    <PlannerContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        activeTab,
        setActiveTab,
      }}
    >
      <div
        key={`tab-${activeTab}`}
        className={`ff-app ff-tab-pane ${activeTab === 0 ? "ff-is-home" : "ff-is-workspace"}`}
      >
        <SplineScene isWorkspace={activeTab !== 0} />

        <header className="ff-header">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" onClick={() => setActiveTab(0)} className="ff-brand" aria-label="FocusFlow dashboard">
              <Sparkle />
              <span>
                Focus<span className="text-primary">Flow</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="ff-back-link"
              title="Return to Landing Page"
            >
              <ArrowLeft className="size-3.5" />
              <span>Landing Page</span>
            </Link>

            <div className="ff-profile-wrap">
              <Button
                variant="profile"
                className="ff-avatar"
                aria-label="Open profile menu"
                aria-expanded={profile}
                onClick={() => setProfile(!profile)}
              >
                <span className="ff-avatar-landscape" />
              </Button>
              {profile && (
                <div className="ff-profile-menu">
                  <strong>Karthik</strong>
                  <span>My FocusFlow space</span>
                  <div className="ff-profile-divider" />
                  <Link to="/" className="ff-menu-link">
                    Return to Showcase
                  </Link>
                  <Button variant="ghost" onClick={() => setProfile(false)}>
                    <X className="size-4" /> Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ff-main">
          {activeTab === 0 && <HomePage onPlanClick={() => setActiveTab(1)} />}
          {activeTab === 1 && <TasksPage />}
          {activeTab === 2 && <CalendarPage />}
          {activeTab === 3 && <ResourcesPage />}
          {activeTab === 4 && <GoalsPage />}
          {activeTab === 5 && <AchievementsPage />}
          {activeTab === 6 && <ProfilePage />}
          {activeTab === 7 && <CompetitionsPage />}
        </main>

        <nav className="ff-dock" aria-label="Main navigation" data-active={activeTab}>
          <span className="ff-dock-indicator" />
          {destinations.map(({ label, tab, icon: Icon }) => (
            <Button
              variant="navigation"
              key={label}
              className={`ff-nav-button${activeTab === tab ? " is-active" : ""}`}
              aria-current={activeTab === tab ? "page" : undefined}
              onClick={() => setActiveTab(tab)}
            >
              <Icon strokeWidth={1.8} />
              <span>{label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </PlannerContext.Provider>
  );
}

export function HomePage({ onPlanClick }: { onPlanClick?: () => void }) {
  const { setActiveTab, tasks } = useContext(PlannerContext);
  const handlePlan = onPlanClick || (() => setActiveTab(1));

  return (
    <>
      <section className="ff-greeting">
        <p className="ff-hello">Good morning,</p>
        <h1>Karthik</h1>
        <p className="ff-tagline">Same dreams. Better plans.</p>
      </section>

      <div className="ff-dashboard-capsules-bar">
        <div className="ff-capsules-group ff-capsules-group--left">
          <AchievementsCapsule
            onViewAll={() => setActiveTab(5)}
          />
          <TodayTodoCapsule
            tasks={tasks}
            onViewAll={() => setActiveTab(1)}
          />
        </div>

        <Button
          type="button"
          variant="glass"
          className="ff-plan-cta"
          onClick={handlePlan}
        >
          <span>PLAN MY DAY</span>
          <ArrowRight />
        </Button>

        <div className="ff-capsules-group ff-capsules-group--right">
          <ProfileCapsule
            onViewAll={() => setActiveTab(6)}
          />
          <CompetitionsCapsule
            onViewAll={() => setActiveTab(7)}
          />
        </div>
      </div>
    </>
  );
}

export function TasksPage() {
  const { tasks, addTask, toggleTask } = useContext(PlannerContext);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), time);
    setTitle("");
  };

  return (
    <Workspace
      eyebrow="MAKE ROOM FOR WHAT MATTERS"
      title="Plan your day"
      subtitle="One thing at a time, Karthik."
    >
      <form onSubmit={submit} className="ff-task-form">
        <label className="ff-field">
          <span>What’s on your mind?</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task"
            required
            maxLength={160}
          />
        </label>
        <label className="ff-field ff-time">
          <span>Start time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>
        <Button type="submit" variant="default">
          <Plus /> Add task
        </Button>
      </form>
      <div className="ff-list-heading">
        <h2>Today’s focus</h2>
        <span>
          {tasks.filter((t) => t.done).length} / {tasks.length} complete
        </span>
      </div>
      {tasks.length === 0 ? (
        <div className="ff-empty">
          <CheckSquare />
          <p>A fresh start.</p>
          <span>Your day is yours to shape.</span>
        </div>
      ) : (
        <ul className="ff-task-list">
          {tasks.map((task) => (
            <li key={task.id} data-complete={task.done}>
              <Button
                variant="outline"
                size="icon"
                aria-label={`${task.done ? "Uncomplete" : "Complete"} ${task.title}`}
                onClick={() => toggleTask(task.id)}
              >
                {task.done && <Check />}
              </Button>
              <span>{task.title}</span>
              <time>{task.time}</time>
            </li>
          ))}
        </ul>
      )}
    </Workspace>
  );
}

function Workspace({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="ff-workspace">
      <p className="ff-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="ff-subtitle">{subtitle}</p>
      {children}
    </section>
  );
}

export function CalendarPage() {
  return <AcademicCalendarDashboard />;
}

export function ResourcesPage() {
  const [items, setItems] = useState<{ title: string; url: string }[]>([
    { title: "MIT OpenCourseWare — Computer Science & Biology", url: "https://ocw.mit.edu" },
    { title: "PubMed Central Biomedical Literature Database", url: "https://pmc.ncbi.nlm.nih.gov" },
    { title: "Stanford Encyclopedia of Philosophy", url: "https://plato.stanford.edu" },
  ]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  return (
    <Workspace
      eyebrow="KEEP YOUR IDEAS CLOSE"
      title="Resources"
      subtitle="A home for the links you come back to."
    >
      <form
        className="ff-resource-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
            if (!["http:", "https:"].includes(parsed.protocol)) return;
            setItems((old) => [...old, { title, url: parsed.href }]);
            setTitle("");
            setUrl("");
          } catch {
            // invalid URL
          }
        }}
      >
        <label className="ff-field">
          <span>Name</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource name"
          />
        </label>
        <label className="ff-field">
          <span>Link</span>
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
          />
        </label>
        <Button type="submit">
          <Plus /> Save link
        </Button>
      </form>
      {items.length === 0 ? (
        <div className="ff-empty">
          <BookOpen />
          <p>Your personal library.</p>
          <span>Keep something worth revisiting.</span>
        </div>
      ) : (
        items.map((item, i) => (
          <a
            className="ff-resource-link"
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen className="size-4 text-primary" />
            <span>{item.title}</span>
            <ArrowRight className="size-4 ml-auto opacity-70" />
          </a>
        ))
      )}
    </Workspace>
  );
}

export function GoalsPage() {
  return <GoalsDiscoveryDashboard />;
}

export function AchievementsPage() {
  return (
    <Workspace
      eyebrow="CELEBRATE YOUR MILESTONES"
      title="Achievements & Wins"
      subtitle="Track your hard-earned victories, badges, and academic accomplishments."
    >
      <div className="ff-stats-grid">
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--gold">
            <Trophy className="size-5" />
          </span>
          <div>
            <strong>2</strong>
            <span>Recent Wins</span>
          </div>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--blue">
            <Medal className="size-5" />
          </span>
          <div>
            <strong>#14</strong>
            <span>Global Rank</span>
          </div>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--purple">
            <Flame className="size-5" />
          </span>
          <div>
            <strong>14 Days</strong>
            <span>Active Streak</span>
          </div>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--green">
            <Sparkles className="size-5" />
          </span>
          <div>
            <strong>3,450 XP</strong>
            <span>Total Points</span>
          </div>
        </div>
      </div>

      <div className="ff-list-heading">
        <h2>Recent Wins</h2>
        <span>2 verified awards</span>
      </div>

      <div className="ff-achievements-list">
        <div className="ff-achievement-card">
          <div className="ff-popover-badge ff-popover-badge--gold" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
              <circle cx="12" cy="8" r="6" fill="#f59e0b" fillOpacity="0.25" stroke="#d97706" strokeWidth="1.6" />
              <path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11" stroke="#dc2626" fill="#ef4444" fillOpacity="0.9" strokeWidth="1.2" />
              <text x="12" y="10.5" textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#b45309" stroke="none">W</text>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Hackathon 2026</h3>
              <span className="text-xs text-slate-500 font-medium">12 Oct 2026 • 4:30 PM</span>
            </div>
            <p className="text-xs font-semibold text-amber-600 mt-0.5">Winner • 1st Place Overall</p>
            <p className="text-xs text-slate-600 mt-1">Built AI-driven student flow optimizer in 48-hour build sprint.</p>
          </div>
        </div>

        <div className="ff-achievement-card">
          <div className="ff-popover-badge ff-popover-badge--blue" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
              <circle cx="12" cy="14" r="6.5" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.6" />
              <path d="M7.5 2h9l-1.8 6.5H9.3L7.5 2z" stroke="#4f46e5" fill="#818cf8" fillOpacity="0.85" strokeWidth="1.2" />
              <text x="12" y="16.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#3730a3" stroke="none">2</text>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Coding Challenge</h3>
              <span className="text-xs text-slate-500 font-medium">08 Oct 2026 • 2:15 PM</span>
            </div>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">1st Place • Algorithmic Speed</p>
            <p className="text-xs text-slate-600 mt-1">Solved all 6 advanced dynamic programming and graph problems under 45 minutes.</p>
          </div>
        </div>
      </div>

      <div className="ff-list-heading">
        <h2>Unlocked Badges</h2>
      </div>

      <div className="ff-badges-grid">
        <div className="ff-badge-item">
          <span className="text-2xl">🌅</span>
          <strong>Early Riser</strong>
          <span>Complete 5 tasks before 9 AM</span>
        </div>
        <div className="ff-badge-item">
          <span className="text-2xl">⚡</span>
          <strong>Deep Focus</strong>
          <span>35-hour monthly focus streak</span>
        </div>
        <div className="ff-badge-item">
          <span className="text-2xl">🏆</span>
          <strong>Hackathon Hero</strong>
          <span>Win a student competition</span>
        </div>
        <div className="ff-badge-item">
          <span className="text-2xl">🎯</span>
          <strong>Goal Smasher</strong>
          <span>Complete 10 primary targets</span>
        </div>
      </div>
    </Workspace>
  );
}

export function ProfilePage() {
  return (
    <Workspace
      eyebrow="YOUR FOCUSFLOW IDENTITY"
      title="Student Profile"
      subtitle="Manage your academic workspace, study preferences, and stats."
    >
      <div className="ff-profile-card">
        <div className="ff-avatar-large">
          <span className="ff-avatar-landscape" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Karthik</h2>
            <span className="ff-pro-badge">PRO STUDENT</span>
          </div>
          <p className="text-sm text-slate-600 mt-0.5">Computer Science & AI • Year 3</p>
          <p className="text-xs text-slate-400 mt-1">Student ID: FF-2026-9812 • FocusFlow member since 2024</p>
        </div>
      </div>

      <div className="ff-stats-grid">
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--blue">
            <Clock className="size-5" />
          </span>
          <div>
            <strong>142 hrs</strong>
            <span>Deep Focus Time</span>
          </div>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--green">
            <Check className="size-5" />
          </span>
          <div>
            <strong>86 Tasks</strong>
            <span>Completed</span>
          </div>
        </div>
        <div className="ff-stat-card">
          <span className="ff-stat-icon ff-stat-icon--purple">
            <Sparkles className="size-5" />
          </span>
          <div>
            <strong>94%</strong>
            <span>Focus Flow Score</span>
          </div>
        </div>
      </div>

      <div className="ff-list-heading">
        <h2>Study Preferences</h2>
      </div>

      <div className="ff-preferences-list">
        <div className="ff-preference-row">
          <div>
            <strong>Daily Focus Target</strong>
            <span>Target hours per day for uninterrupted work</span>
          </div>
          <span className="ff-pill-stat">4.5 hours</span>
        </div>
        <div className="ff-preference-row">
          <div>
            <strong>Pomodoro Interval</strong>
            <span>Default deep work session duration</span>
          </div>
          <span className="ff-pill-stat">45 min</span>
        </div>
        <div className="ff-preference-row">
          <div>
            <strong>3D Mascot Companion</strong>
            <span>Interactive robot on homepage dashboard</span>
          </div>
          <span className="ff-pill-stat text-emerald-600 font-semibold">Active</span>
        </div>
      </div>
    </Workspace>
  );
}

export function CompetitionsPage() {
  return (
    <Workspace
      eyebrow="TEST YOUR SKILLS"
      title="Competitions & Challenges"
      subtitle="Compete with students, solve complex challenges, and earn recognition."
    >
      <div className="ff-list-heading">
        <h2>Active & Upcoming Challenges</h2>
        <span>3 opportunities</span>
      </div>

      <div className="ff-competitions-list">
        <div className="ff-competition-card">
          <div className="ff-competition-icon ff-competition-icon--gold">
            <Trophy className="size-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Campus Hackathon 2026</h3>
              <span className="ff-badge-completed">Completed • Winner</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">48-hour prototype challenge building AI utilities for students.</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span>Prize: $5,000 + Trophy</span>
              <span>120 Teams</span>
            </div>
          </div>
        </div>

        <div className="ff-competition-card">
          <div className="ff-competition-icon ff-competition-icon--green">
            <Flame className="size-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Global Algorithmic Duel</h3>
              <span className="ff-badge-live">LIVE NOW • 2d 14h left</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Real-time competitive programming round covering trees, graphs & DP.</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span>Top prize: Fellowship Award</span>
              <span>1,420 Competitors</span>
            </div>
          </div>
        </div>

        <div className="ff-competition-card">
          <div className="ff-competition-icon ff-competition-icon--purple">
            <Award className="size-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm">UI/UX Student Design Sprint</h3>
              <span className="ff-badge-upcoming">Starts Oct 24</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">Design the next generation of academic productivity interfaces.</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span>Prize: Studio Mentorship</span>
              <span>Open Registration</span>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
