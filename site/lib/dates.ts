import dates from "../../content/dates.json"

/** The day a page last changed (YYYY-MM-DD), from git via scripts/stamp-dates.mjs. Undefined for a page the script hasn't seen. */
export function lastChanged(path: string): string | undefined {
  return (dates as Record<string, string>)[path]
}

/** Every dated page. */
export const allDates = () => dates as Record<string, string>
