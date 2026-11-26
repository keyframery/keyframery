// Send and Stop
// Pass the chat's `status`: "submitted" turns Send into a spinner and "streaming" into Stop, which calls `onStop`. A model picker shows when you pass `models`.
import * as React from "react"

import { PromptComposer, type PromptComposerStatus } from "@/components/ui/prompt-composer"

const models = [
  { value: "fast", label: "Fast", description: "Quick lookups" },
  { value: "thorough", label: "Thorough", description: "Checks every order it names" },
]

export default function PromptComposerStreaming() {
  const [status, setStatus] = React.useState<PromptComposerStatus>("ready")
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <PromptComposer
      className="max-w-[480px]"
      status={status}
      models={models}
      onSubmit={() => {
        setStatus("submitted")
        timer.current = setTimeout(() => {
          setStatus("streaming")
          timer.current = setTimeout(() => setStatus("ready"), 4000)
        }, 800)
      }}
      onStop={() => {
        clearTimeout(timer.current)
        setStatus("ready")
      }}
    />
  )
}
