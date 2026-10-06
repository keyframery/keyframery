"use client"

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const START = [
  { id: 1, text: "Hey!" },
  { id: 2, text: "Are we still on for 3pm?" },
  { id: 3, text: "Yes, see you there." },
]

export function ListDemo() {
  const [items, setItems] = React.useState(START)
  const [rows, setRows] = React.useState([
    { id: 1, name: "Invoice 1042", amount: "$120.00" },
    { id: 2, name: "Invoice 1043 (a longer name)", amount: "$84.50" },
    { id: 3, name: "Invoice 1044", amount: "$1,300.00" },
  ])
  const [draft, setDraft] = React.useState("")
  const next = React.useRef(4)
  const add = (text: string) => setItems((xs) => [...xs, { id: next.current++, text }])
  return (
    <section className="grid max-w-xl gap-3" data-testid="list-demo">
      <h2 className="font-medium">ListCut</h2>
      <ListCut as="ul" className="grid gap-2" data-testid="list">
        {items.map((m) => (
          <ListCut.Item key={m.id} id={m.id} as="li" data-testid={`msg-${m.id}`} className="flex items-center justify-between rounded-md border px-3 py-2">
            <span>{m.text}</span>
            <Button size="sm" variant="ghost" data-testid={`del-${m.id}`} onClick={() => setItems((xs) => xs.filter((x) => x.id !== m.id))}>
              Delete
            </Button>
          </ListCut.Item>
        ))}
      </ListCut>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          add(draft.trim())
          setDraft("")
        }}
      >
        <Input data-testid="composer" aria-label="Message" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" />
        <Button type="submit" data-testid="send">Send</Button>
      </form>
      <div className="flex gap-2">
        <Button variant="outline" data-testid="shuffle" onClick={() => setItems((xs) => [...xs].reverse())}>Reverse</Button>
        <Button variant="outline" data-testid="add-later" onClick={() => setTimeout(() => add("Sent from another device"), 1800)}>Add in 1.8 s</Button>
      </div>
      <table className="w-full text-sm">
        <ListCut as="tbody" data-testid="table-list">
          {rows.map((r) => (
            <ListCut.Item key={r.id} id={r.id} as="tr" data-testid={`row-${r.id}`} className="border-b">
              <td className="py-2">{r.name}</td>
              <td className="py-2 text-right">{r.amount}</td>
              <td className="py-2 text-right">
                <Button size="sm" variant="ghost" data-testid={`row-del-${r.id}`} onClick={() => setRows((xs) => xs.filter((x) => x.id !== r.id))}>Remove</Button>
              </td>
            </ListCut.Item>
          ))}
        </ListCut>
      </table>
    </section>
  )
}
