export const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
export function daysFromToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return iso(date)
}
/* The next Friday, or the one after if today is Friday. */
export function nextFriday() {
  const date = new Date()
  date.setDate(date.getDate() + (((5 - date.getDay() + 7) % 7) || 7))
  return iso(date)
}
