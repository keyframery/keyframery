// While it thinks
// Set `streaming` while the model thinks: the trigger reads "Thinking…" with a light passing through it, and the thinking opens on its own. When `streaming` ends it closes and reads "Thought for 6s", timed for you unless you pass `duration`. A reader who toggles it keeps their choice.
import * as React from "react"

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ui/reasoning"

const thinking = `The parcel left **Leeds on Tuesday** and has had no scan since.

- Royal Mail treats 10 working days as lost
- it has been 7, so a resend is quicker than a claim`

const words = thinking.match(/\s*\S+/g) ?? []

export default function ReasoningStreaming() {
  const [at, setAt] = React.useState(0)
  React.useEffect(() => {
    const timer = setInterval(() => setAt((n) => (n >= words.length + 40 ? 0 : n + 1)), 90)
    return () => clearInterval(timer)
  }, [])
  return (
    <Reasoning className="max-w-[380px]" streaming={at < words.length}>
      <ReasoningTrigger />
      <ReasoningContent>{words.slice(0, at).join("")}</ReasoningContent>
    </Reasoning>
  )
}
