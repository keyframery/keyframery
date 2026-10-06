"use client"

import * as React from "react"

import { ListCut } from "@/components/keyframery/list-cut"
import { MatchCut } from "@/components/keyframery/match-cut"
import { Button } from "@/components/ui/button"

import { Screen } from "../screen"

const MAIL = [
  { id: 1, from: "Priya", subject: "Weekly numbers", preview: "Signups are up 14% after the docs launch." },
  { id: 2, from: "Leo", subject: "Design review on Thursday", preview: "Can we look at the onboarding flow together?" },
  { id: 3, from: "Billing", subject: "Invoice 1044 is due", preview: "$1,300.00 is due on 14 October." },
]

export function Inbox({ className }: { className?: string }) {
  const [mail, setMail] = React.useState(MAIL)
  const [open, setOpen] = React.useState<number | null>(null)
  const current = mail.find((m) => m.id === open)
  return (
    <Screen name="inbox" title="Inbox" className={className}>
      {current ? (
        <MatchCut id={`mail-${current.id}`} className="flex flex-1 flex-col rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">{current.from}</p>
          <p className="mt-1 font-medium">{current.subject}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{current.preview} Let me know what works for you, and I&apos;ll send an invite.</p>
          <Button variant="outline" size="sm" className="mt-auto w-fit" data-director="mail-back" onClick={() => setOpen(null)}>Back to inbox</Button>
        </MatchCut>
      ) : (
        <ListCut as="ul" className="grid gap-1.5">
          {mail.map((m) => (
            <ListCut.Item key={m.id} id={m.id} as="li" className="group flex min-w-0 items-center gap-2">
              <MatchCut id={`mail-${m.id}`} className="min-w-0 flex-1 rounded-lg border">
                <button type="button" className="w-full px-3 py-2 text-left" data-director={`mail-open-${m.id}`} onClick={() => setOpen(m.id)} aria-label={`${m.subject}, from ${m.from}`}>
                  <span className="block truncate text-sm font-medium">{m.subject}</span>
                  <span className="block truncate text-sm text-muted-foreground">{m.from}: {m.preview}</span>
                </button>
              </MatchCut>
              <Button variant="ghost" size="sm" aria-label={`Archive ${m.subject}`} data-director={`mail-archive-${m.id}`} onClick={() => setMail((xs) => xs.filter((x) => x.id !== m.id))}>
                Archive
              </Button>
            </ListCut.Item>
          ))}
        </ListCut>
      )}
      {mail.length === 0 && !current && (
        <div className="grid flex-1 place-items-center text-center text-sm text-muted-foreground">
          <div>
            <p>Inbox zero.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setMail(MAIL)}>Bring the emails back</Button>
          </div>
        </div>
      )}
    </Screen>
  )
}
