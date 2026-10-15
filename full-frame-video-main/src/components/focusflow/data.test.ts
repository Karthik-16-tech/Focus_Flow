import { describe, it, expect } from 'vitest';
import { completionStats, demoTasks, weeklyHours } from './data';

describe('FocusFlow records', () => {
  it('updates concrete completion counts from task state', () => {
    expect(completionStats(demoTasks)).toEqual({ completed: 1, total: 4, percentage: 25 });
    expect(completionStats(demoTasks.map(t => t.id === 'demo-1' ? { ...t, completed: true } : t))).toEqual({ completed: 2, total: 4, percentage: 50 });
  });

  it('keeps study values based on completed sessions and excludes other weeks', () => {
    expect(weeklyHours([
      { duration_seconds: 3600, finished_at: '2026-10-12T12:00:00' },
      { duration_seconds: 1800, finished_at: '2026-10-14T12:00:00' },
      { duration_seconds: 7200, finished_at: '2026-10-04T12:00:00' }
    ], new Date('2026-10-14T15:00:00'))).toEqual([1, 0, .5, 0, 0, 0, 0]);
  });

  it('does not mark tasks complete when timeline selection changes', () => {
    const copy = demoTasks.map(t => ({ ...t }));
    expect(copy.filter(t => t.completed).map(t => t.id)).toEqual(['demo-2']);
    expect(copy.filter(t => !t.completed).length).toBe(3);
  });
});
