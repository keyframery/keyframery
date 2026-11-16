// With a character count
// Pair `maxLength` with a count so people see how much room is left.
import * as React from "react"

import { Textarea } from "@/components/ui/textarea"

const limit = 160

export default function TextareaCount() {
  const [bio, setBio] = React.useState("")
  return (
    <div className="flex w-full max-w-[320px] flex-col gap-1.5">
      <Textarea aria-label="Bio" value={bio} onValueChange={setBio} maxLength={limit} placeholder="A line or two about you" />
      <span className="self-end text-[12px] text-muted-foreground tabular-nums">
        {bio.length} / {limit}
      </span>
    </div>
  )
}
