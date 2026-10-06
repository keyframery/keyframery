"use client"

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"

const ROWS = Array.from({ length: 500 }, (_, i) => i)

export default function Page() {
  const [rows, setRows] = React.useState(ROWS)
  return (
    <main className="p-8">
      <button data-testid="perf-reverse" className="mb-4 rounded border px-3 py-1" onClick={() => setRows((r) => [...r].reverse())}>
        Reverse 500 rows
      </button>
      <ListCut as="ul">
        {rows.map((n) => (
          <ListCut.Item key={n} id={n} as="li" className="border-b py-1 text-sm">
            Row {n}
          </ListCut.Item>
        ))}
      </ListCut>
    </main>
  )
}
