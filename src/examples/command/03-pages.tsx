// Nested pages
// An item with `page` opens a second list inside the palette. Backspace in an empty search goes back.
import * as React from "react"

import { Command, CommandInput, CommandItem, CommandList, CommandPage, CommandSearch } from "@/components/ui/command"

export default function CommandPages() {
  const [pages, setPages] = React.useState<string[]>([])
  return (
    <Command
      aria-label="Commands"
      pages={pages}
      onPagesChange={setPages}
      onAction={() => setPages([])}
      className="h-[260px] w-full max-w-[400px] rounded-[14px] border"
    >
      <CommandSearch>
        <CommandInput aria-label="Search" placeholder={pages.length ? "Choose a theme…" : "Type a command…"} />
      </CommandSearch>
      <CommandList>
        <CommandPage>
          <CommandItem value="theme" page="theme">
            Change theme…
          </CommandItem>
          <CommandItem value="language">Change language</CommandItem>
        </CommandPage>
        <CommandPage value="theme">
          <CommandItem value="light">Light</CommandItem>
          <CommandItem value="dark">Dark</CommandItem>
          <CommandItem value="system">Match the system</CommandItem>
        </CommandPage>
      </CommandList>
    </Command>
  )
}
