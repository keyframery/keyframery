/* The dashboard's Export: the period's orders as a CSV file, one row per order, in the currency's
   own units, ready for a spreadsheet or an accountant. */

import type { Order } from "./data"
import { CHANNEL_LABEL, customerOf, ordersIn, type Period, range, type State } from "./store"

const cell = (value: string | number) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}
const euros = (cents: number) => (cents / 100).toFixed(2)
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)

const PAYMENT: Record<string, string> = { paid: "Paid", pending: "Pending", partially_refunded: "Partly refunded", refunded: "Refunded", voided: "Voided" }

/** The CSV text for any list of orders: the Orders page exports the ones chosen or filtered. */
export function ordersToCsv(state: State, orders: Order[]) {
  const header = ["Order", "Placed (UTC)", "Customer", "Email", "Company", "Country", "Channel", "Payment", "Fulfilment", "Status", "Items", "Subtotal", "Discount", "Shipping", "VAT included", "Total", "Refunded", "Net", "Currency"]
  const rows = orders.map((o) => {
    const c = customerOf(state, o.customerId)
    return [
      `#${o.number}`,
      o.createdAt.slice(0, 16).replace("T", " "),
      c?.name ?? "",
      c?.email ?? "",
      c?.company ?? "",
      o.address.country,
      CHANNEL_LABEL[o.channel],
      PAYMENT[o.payment],
      o.fulfilment === "fulfilled" ? "Fulfilled" : "Unfulfilled",
      o.status === "cancelled" ? "Cancelled" : "Open",
      o.lines.reduce((n, l) => n + l.quantity, 0),
      euros(o.subtotal),
      euros(o.discount),
      euros(o.shipping),
      euros(o.tax),
      euros(o.total),
      euros(o.refunded),
      euros(o.status === "cancelled" ? 0 : o.total - o.refunded),
      "EUR",
    ]
  })
  return { text: [header, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n", rows: rows.length }
}

/** The file name's start: the store's name in lower case, like "tideline-prints". */
export const storeSlug = (state: State) => state.settings.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

/** The CSV text and a file name for a period's orders. */
export function ordersCsv(state: State, period: Period) {
  const { text, rows } = ordersToCsv(state, ordersIn(state, period))
  const [from, to] = range(period)
  const slug = state.settings.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  return { text, rows, name: `${slug}-orders-${isoDay(from)}-to-${isoDay(to - 1)}.csv` }
}

/** Downloads a period's orders as a CSV file and returns how many rows it holds. */
export function downloadOrdersCsv(state: State, period: Period) {
  const { text, rows, name } = ordersCsv(state, period)
  /* A byte order mark so spreadsheet apps read the € and accented names as UTF-8. */
  const url = URL.createObjectURL(new Blob(["﻿", text], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return { rows, name }
}
