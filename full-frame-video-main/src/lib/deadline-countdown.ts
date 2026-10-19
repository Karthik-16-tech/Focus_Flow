const DAY_IN_MS = 86_400_000;

export function getDeadlineLabel(deadline: string, now = new Date()): string {
  const [year, month, day] = deadline.split("-").map(Number);
  const target = Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const difference = Math.round((target - today) / DAY_IN_MS);

  if (difference === 0) return "Today";
  if (difference < 0) return `${Math.abs(difference)} days ago`;
  return `${difference} days left`;
}
