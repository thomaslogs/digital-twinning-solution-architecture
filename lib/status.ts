import { ORANGE, PETROL } from "@/lib/theme";
import type { Status, StatusFilter } from "@/types/twin";

export const statusRank: Record<Status, number> = {
  ok: 0,
  warning: 1,
  critical: 2,
  offline: 3
};

export function statusColor(status: Status): string {
  if (status === "ok") return PETROL;
  return ORANGE;
}

export function statusLabel(status: Status): string {
  if (status === "ok") return "OK";
  if (status === "warning") return "Warning";
  if (status === "critical") return "Critical";
  return "Offline";
}

export function statusSymbol(status: Status): string {
  if (status === "ok") return "✓";
  if (status === "warning") return "!";
  if (status === "critical") return "!!";
  return "×";
}

export function matchesFilter(status: Status, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "warnings") return status === "warning" || status === "critical" || status === "offline";
  return status === "critical" || status === "offline";
}

export function aggregateStatus(statuses: Status[]): Status {
  let maxStatus: Status = "ok";
  for (const status of statuses) {
    if (statusRank[status] > statusRank[maxStatus]) {
      maxStatus = status;
    }
  }
  return maxStatus;
}
