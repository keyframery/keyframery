/* How Backroom writes money, dates and counts. Dates are read in UTC so the server and the
   browser print the same thing; swap these for your own locale and time zone. */

import { type Cents, type Iso, NOW } from "./data"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const euros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })
const wholeEuros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
const whole = new Intl.NumberFormat("en-IE")

/** €1,284.50 */
export const money = (cents: Cents) => euros.format(cents / 100)
/** €1,285, for headline figures and axes. */
export const moneyWhole = (cents: Cents) => wholeEuros.format(Math.round(cents / 100))
/** €1.3k, for chart ticks. */
export const moneyShort = (cents: Cents) => {
  const e = cents / 100
  return e >= 1000 ? `€${(e / 1000).toFixed(e >= 10_000 ? 0 : 1)}k` : `€${Math.round(e)}`
}
export const count = (n: number) => whole.format(Math.round(n))
/** 3.4% */
export const percent = (share: number, digits = 1) => `${(share * 100).toFixed(digits)}%`

const at = (value: Iso | number) => new Date(typeof value === "number" ? value : Date.parse(value))

/** 19 Nov */
export const day = (value: Iso | number) => {
  const d = at(value)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}
/** 19 Nov 2026 */
export const date = (value: Iso | number) => `${day(value)} ${at(value).getUTCFullYear()}`
/** 14:30 */
export const time = (value: Iso | number) => {
  const d = at(value)
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
}
/** Thu */
export const weekday = (value: Iso | number) => WEEKDAYS[at(value).getUTCDay()]

/** "4 min ago", "3 h ago", "Yesterday", "16 Nov". Against the template's fixed today. */
export function ago(value: Iso | number) {
  const minutes = Math.round((NOW - at(value).getTime()) / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  if (hours < 48) return "Yesterday"
  return day(value)
}

/** "Today, 14:30", "Yesterday, 09:12", "16 Nov, 18:40" */
export function when(value: Iso | number) {
  const d = at(value)
  const today = new Date(NOW)
  const sameDay = (a: Date, b: Date) => a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate()
  const yesterday = new Date(NOW - 86_400_000)
  const prefix = sameDay(d, today) ? "Today" : sameDay(d, yesterday) ? "Yesterday" : day(value)
  return `${prefix}, ${time(value)}`
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((part) => /^\p{Lu}/u.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

export const plural = (n: number, one: string, many = `${one}s`) => `${count(n)} ${n === 1 ? one : many}`
