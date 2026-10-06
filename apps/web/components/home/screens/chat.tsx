"use client"

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Screen } from "../wall"

type Message = { id: number; from: "me" | "them"; text: string }

const START: Message[] = [
  { id: 1, from: "them", text: "Is the release branch green?" },
  { id: 2, from: "me", text: "All checks passed a minute ago." },
  { id: 3, from: "them", text: "Great. Can you merge after the review?" },
]

export function Chat({ className }: { className?: string }) {
  const [messages, setMessages] = React.useState(START)
  const [draft, setDraft] = React.useState("")
  const next = React.useRef(4)
  const send = (text: string) => {
    setMessages((m) => [...m, { id: next.current++, from: "me", text }])
    setTimeout(() => setMessages((m) => [...m, { id: next.current++, from: "them", text: "On it. Merging now." }]), 1200)
  }
  return (
    <Screen name="chat" title="Chat" className={className}>
      <ListCut as="ol" aria-label="Messages" className="flex flex-1 flex-col justify-end gap-2 overflow-hidden">
        {messages.slice(-6).map((m) => (
          <ListCut.Item
            key={m.id}
            id={m.id}
            as="li"
            className={m.from === "me" ? "max-w-[80%] self-end rounded-2xl rounded-br-md bg-foreground px-3 py-2 text-sm text-background" : "max-w-[80%] self-start rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm"}
          >
            {m.text}
          </ListCut.Item>
        ))}
      </ListCut>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          send(draft.trim())
          setDraft("")
        }}
      >
        <Input aria-label="Message" placeholder="Write a message" value={draft} onChange={(e) => setDraft(e.target.value)} data-director="composer" />
        <Button type="submit" data-director="send">Send</Button>
      </form>
    </Screen>
  )
}
