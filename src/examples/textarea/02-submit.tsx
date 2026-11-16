// Send with a shortcut
// `submitShortcut="mod+enter"` runs `onSubmit` on ⌘ Enter or Ctrl Enter, for chat and comment boxes.
import * as React from "react"

import { Textarea } from "@/components/ui/textarea"

export default function TextareaSubmit() {
  const [sent, setSent] = React.useState<string[]>([])
  const [text, setText] = React.useState("")
  return (
    <div className="flex w-full max-w-[320px] flex-col gap-2">
      <ul className="space-y-1 text-[13px]">
        {sent.map((m, i) => (
          <li key={i} className="rounded-[10px] bg-muted px-3 py-2">
            {m}
          </li>
        ))}
      </ul>
      <Textarea
        aria-label="Comment"
        placeholder="Write a comment, then press ⌘ Enter"
        value={text}
        onValueChange={setText}
        submitShortcut="mod+enter"
        onSubmit={() => {
          if (text.trim()) setSent((s) => [...s, text.trim()])
          setText("")
        }}
      />
    </div>
  )
}
