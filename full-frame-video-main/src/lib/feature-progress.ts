export const FEATURE_COUNT = 6;

export function featureFromProgress(progress: number): number {
  const bounded = Math.min(1, Math.max(0, progress));
  return Math.round(bounded * (FEATURE_COUNT - 1));
}

export function featureFromKey(key: string, current: number): number {
  if (key === "Home") return 0;
  if (key === "End") return FEATURE_COUNT - 1;
  if (key === "ArrowDown" || key === "ArrowRight") return Math.min(FEATURE_COUNT - 1, current + 1);
  if (key === "ArrowUp" || key === "ArrowLeft") return Math.max(0, current - 1);
  return current;
}
