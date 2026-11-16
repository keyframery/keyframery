// Stick to the end
// `stickToEnd` keeps a chat or a log at the newest line as it grows, unless you scroll up. `ScrollAreaScrollToEnd` brings you back.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaScrollToEnd, ScrollAreaThumb, ScrollAreaViewport } from "@/components/ui/scroll-area"

export default function ScrollAreaChat() {
  const [lines, setLines] = React.useState(() => Array.from({ length: 8 }, (_, i) => `Build step ${i + 1} done`))
  return (
    <div className="flex w-full max-w-[320px] flex-col gap-2">
      <ScrollArea stickToEnd className="h-[180px] rounded-[12px] border">
        <ScrollAreaViewport role="log" aria-label="Build log">
          <ScrollAreaContent className="p-3 font-mono text-[12px]">
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
        <ScrollAreaScrollToEnd />
      </ScrollArea>
      <Button size="sm" className="self-start" onClick={() => setLines((l) => [...l, `Build step ${l.length + 1} done`])}>
        Add a line
      </Button>
    </div>
  )
}
