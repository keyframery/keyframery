"use client"

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { LoadCut } from "@/components/keyframery/load-cut"
import { MatchCut } from "@/components/keyframery/match-cut"
import { ValueCut } from "@/components/keyframery/value-cut"
import { Button } from "@/components/ui/button"

export function MatchCutDemo() {
  const [open, setOpen] = React.useState(false)
  return open ? (
    <MatchCut key="detail" id="docs-order" className="w-full max-w-sm rounded-2xl border bg-background p-5">
      <p className="text-sm text-muted-foreground">Order 1044</p>
      <p className="mt-1 text-lg font-semibold">Northwind Studio</p>
      <p className="mt-3 text-sm text-muted-foreground">3 items, $1,300.00. Shipped on 2 October.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(false)}>Back to orders</Button>
    </MatchCut>
  ) : (
    <MatchCut key="card" id="docs-order" className="w-56 rounded-xl border bg-background">
      <button type="button" className="w-full p-3 text-left" onClick={() => setOpen(true)}>
        <span className="block text-sm font-medium">Northwind Studio</span>
        <span className="block text-sm text-muted-foreground">Order 1044, $1,300.00</span>
      </button>
    </MatchCut>
  )
}

export function ListCutDemo() {
  const [tasks, setTasks] = React.useState([
    { id: 1, text: "Write the release notes" },
    { id: 2, text: "Review the onboarding flow" },
    { id: 3, text: "Reply to Priya" },
  ])
  const next = React.useRef(4)
  const names = ["Book the design review", "Update the pricing page", "Send the invoice", "Fix the login redirect"]
  return (
    <div className="grid w-full max-w-sm gap-3">
      <ListCut as="ul" className="grid gap-1.5">
        {tasks.map((t) => (
          <ListCut.Item key={t.id} id={t.id} as="li" className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
            {t.text}
            <Button variant="ghost" size="sm" aria-label={`Done: ${t.text}`} onClick={() => setTasks((ts) => ts.filter((x) => x.id !== t.id))}>Done</Button>
          </ListCut.Item>
        ))}
      </ListCut>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setTasks((ts) => [...ts, { id: next.current, text: names[next.current++ % names.length] }])}>Add a task</Button>
        <Button size="sm" variant="outline" onClick={() => setTasks((ts) => [...ts].reverse())}>Reverse</Button>
      </div>
    </div>
  )
}

export function ValueCutDemo() {
  const [n, setN] = React.useState(1284)
  const [status, setStatus] = React.useState("Pending")
  return (
    <div className="grid gap-4 text-center">
      <p className="text-4xl font-semibold tracking-tight"><ValueCut value={n} locale="en-US" /></p>
      <div className="flex justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setN((v) => v - 7)}>Down by 7</Button>
        <Button size="sm" variant="outline" onClick={() => setN((v) => v + 19)}>Up by 19</Button>
      </div>
      <p className="text-sm">Status: <ValueCut value={status} announce /></p>
      <Button size="sm" variant="outline" onClick={() => setStatus((s) => (s === "Pending" ? "Paid" : "Pending"))}>Change the status</Button>
    </div>
  )
}

export function LoadCutDemo() {
  const [loading, setLoading] = React.useState(false)
  const [rows, setRows] = React.useState(3)
  const load = (ms: number) => {
    setLoading(true)
    setTimeout(() => {
      setRows((r) => (r === 3 ? 5 : 3))
      setLoading(false)
    }, ms)
  }
  return (
    <div className="grid w-full max-w-sm gap-3">
      <LoadCut loading={loading} skeleton={<div className="grid gap-1.5">{Array.from({ length: rows }, (_, i) => <div key={i} className="h-8 rounded-md bg-muted" />)}</div>}>
        <ul className="grid gap-1.5">
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} className="flex h-8 items-center justify-between rounded-md border px-3 text-sm">Invoice {1040 + i}<span className="text-muted-foreground">Paid</span></li>
          ))}
        </ul>
      </LoadCut>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => load(1200)}>Load slowly</Button>
        <Button size="sm" variant="outline" onClick={() => load(150)}>Load fast</Button>
      </div>
    </div>
  )
}
