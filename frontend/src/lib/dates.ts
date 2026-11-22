import { siteConfig } from "@/config/site";

const DAY_MS = 86_400_000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "Today", "Yesterday", "Tuesday" (within a week) or "4 Nov 2026". */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(siteConfig.locale, { weekday: "long" });
  }
  return date.toLocaleDateString(siteConfig.locale, {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(siteConfig.locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(siteConfig.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export interface DayGroup<T> {
  key: string;
  label: string;
  items: T[];
}

/** Groups items (already sorted newest first) by calendar day. */
export function groupByDay<T extends { createdAt: string }>(
  items: T[],
  now: Date = new Date(),
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const date = new Date(item.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const current = groups.at(-1);
    if (current?.key === key) current.items.push(item);
    else groups.push({ key, label: formatDayLabel(item.createdAt, now), items: [item] });
  }
  return groups;
}

/** "Just now", "12 min ago", "3 hr ago", "Yesterday", or a short date. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const minutes = Math.round((now.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24 && new Date(iso).getDate() === now.getDate()) return `${hours} hr ago`;
  return formatDayLabel(iso, now);
}

/** `datetime-local` inputs want local time without a zone: "2026-11-10T14:30". */
export function toLocalInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
