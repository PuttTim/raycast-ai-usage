import type { ProviderId, UsageWindow } from "./providers/types";

/**
 * Picks the one usage window shown beside an account in the compact list.
 * Prefer the five-hour window for both providers, falling back to weekly when
 * no five-hour limit is available. Unusual responses with neither known window
 * keep the previous behaviour of showing whichever limit is most constrained.
 */
export function getGlanceWindow(provider: ProviderId, windows: UsageWindow[]): UsageWindow | null {
  if (provider === "codex") {
    const fiveHour = windows.find((window) => window.id === "18000" || window.label === "5h Limit");

    if (fiveHour) {
      return fiveHour;
    }

    const weekly = windows.find((window) => window.id === "604800" || window.label === "Weekly Limit");

    if (weekly) {
      return weekly;
    }
  }

  if (provider === "claude") {
    const fiveHour = windows.find(
      (window) => window.id === "five_hour" || window.id === "session" || window.label === "Session Limit",
    );

    if (fiveHour) {
      return fiveHour;
    }

    const weekly = windows.find(
      (window) => window.id === "seven_day" || window.id === "weekly_all" || window.label === "Weekly Limit",
    );

    if (weekly) {
      return weekly;
    }
  }

  return windows.reduce<UsageWindow | null>(
    (tightest, window) => (tightest === null || getRemaining(window) < getRemaining(tightest) ? window : tightest),
    null,
  );
}

function getRemaining(window: UsageWindow): number {
  return 100 - window.usedPercent;
}
