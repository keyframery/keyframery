// Streaming
// Pass the text as it arrives and set `streaming` until it ends. Finished blocks stay exactly where they are, an unclosed `**` or fence reads as it will once closed, and a caret marks the end.
import * as React from "react"

import { Markdown } from "@/components/ui/markdown"

const reply = `Here is the plan for **Sunday morning**:

1. Pastéis de Belém opens at 08:00, so go first.
2. Walk ten minutes to the Jerónimos Monastery.

> Tickets sell out by 10:00 in summer.`

const words = reply.match(/\s*\S+/g) ?? []

export default function MarkdownStreaming() {
  const [at, setAt] = React.useState(0)
  React.useEffect(() => {
    /* A word every 70ms, then a pause, then again. */
    const timer = setInterval(() => setAt((n) => (n >= words.length + 25 ? 0 : n + 1)), 70)
    return () => clearInterval(timer)
  }, [])
  return (
    <Markdown className="w-full max-w-[380px]" streaming={at < words.length}>
      {words.slice(0, at).join("")}
    </Markdown>
  )
}
