// Interactive
// `interactive` makes the whole card pressable: it lifts on hover and sinks on press. `spotlight` adds a soft light that follows the pointer.
import * as React from "react"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sections = [
  { id: "billing", title: "Billing", about: "Cards, invoices and tax details" },
  { id: "team", title: "Team", about: "Invite people and set roles" },
]

export default function CardInteractive() {
  const [opened, setOpened] = React.useState<string | null>(null)
  return (
    <div className="flex w-full max-w-[520px] flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Card
            key={s.id}
            interactive
            spotlight
            role="button"
            tabIndex={0}
            onClick={() => setOpened(s.title)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpened(s.title)}
          >
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>{s.about}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <span className="text-[12px] text-muted-foreground">{opened ? `Opened ${opened}` : "Press a card"}</span>
    </div>
  )
}
