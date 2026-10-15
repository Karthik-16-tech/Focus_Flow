export type Task = {
  id: string;
  title: string;
  due_label: string;
  kind: string;
  completed: boolean;
};

export type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
};

export type FocusSession = {
  duration_seconds: number;
  finished_at: string;
};

export const demoTasks: Task[] = [
  { id: 'demo-1', title: 'CN Assignment', due_label: 'Due Today · 11:59 PM', kind: 'assignment', completed: false },
  { id: 'demo-2', title: 'Internship Application', due_label: 'Closes Friday', kind: 'task', completed: true },
  { id: 'demo-3', title: 'Hackathon Registration', due_label: 'Closes Sunday', kind: 'task', completed: false },
  { id: 'demo-4', title: 'Club Meeting', due_label: 'Today · 5:00 PM', kind: 'task', completed: false },
];

export const timelineSteps = [
  { title: 'Lecture', time: '9:00', hour: 9 },
  { title: 'Discussion', time: '10:00', hour: 10 },
  { title: 'Practice', time: '11:00', hour: 11 },
  { title: 'Wrap Up', time: '12:00', hour: 12 },
];

export const focusDurationSeconds = 45 * 60;

export function completionStats(tasks: Task[]) {
  const completed = tasks.filter(t => t.completed).length;
  return {
    completed,
    total: tasks.length,
    percentage: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

export function weeklyHours(sessions: FocusSession[], now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) =>
    sessions.reduce((sum, s) => {
      const d = new Date(s.finished_at);
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      return d >= day && d.getTime() < day.getTime() + 86400000 ? sum + s.duration_seconds / 3600 : sum;
    }, 0)
  );
}
