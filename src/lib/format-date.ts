import { format, formatDistanceToNow } from "date-fns";

/** Ensure naive (no-tz) ISO strings from the backend are treated as UTC. */
function toDate(date: string | Date): Date {
  if (typeof date === "string" && !date.endsWith("Z") && !date.includes("+")) {
    return new Date(date + "Z");
  }
  return new Date(date);
}

export function formatDate(date: string | Date): string {
  return format(toDate(date), "MMM d, yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(toDate(date), "MMM d, yyyy h:mm a");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(toDate(date), { addSuffix: true });
}
