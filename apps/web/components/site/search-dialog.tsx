"use client"

/* ⌘K: shadcn's CommandDialog over Fumadocs' search API, so the site's own search runs on <Cuts />. */

import { useDocsSearch } from "fumadocs-core/search/client"
import type { SharedProps } from "fumadocs-ui/components/dialog/search"
import { useRouter } from "next/navigation"

import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

export function SearchDialog({ open, onOpenChange }: SharedProps) {
  const router = useRouter()
  const { search, setSearch, query } = useDocsSearch({ type: "fetch" })
  const results = query.data === "empty" || !query.data ? [] : query.data
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search the docs" description="Search Keyframery's docs">
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search the docs" value={search} onValueChange={setSearch} />
        <CommandList>
          <CommandEmpty>{search ? "Nothing matches that. Try a component name, like Dialog." : "Type to search."}</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Docs">
              {results.slice(0, 12).map((r) => (
                <CommandItem
                  key={r.id}
                  value={r.id}
                  onSelect={() => {
                    onOpenChange(false)
                    router.push(r.url)
                  }}
                >
                  <span className={r.type === "page" ? "font-medium" : "text-muted-foreground"}>{r.content.replace(/<\/?mark>/g, "")}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
