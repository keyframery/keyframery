"use client"

/* ⌘K: shadcn's CommandDialog over Fumadocs' search API, so the site's own search runs on <Cuts />. */

import { useDocsSearch } from "fumadocs-core/search/client"
import type { SharedProps } from "fumadocs-ui/components/dialog/search"
import { useRouter } from "next/navigation"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { COMPONENT_OF, plain, rankResults } from "./search-results"

export function SearchDialogContent({ onOpenChange }: Pick<SharedProps, "onOpenChange">) {
  const router = useRouter()
  const { search, setSearch, query } = useDocsSearch({ type: "fetch" })
  const results = query.data === "empty" || !query.data ? [] : rankResults(query.data, search)
  // "empty" with text typed means the request hasn't gone out yet (the input is debounced).
  const searching = query.isLoading || (search.trim() !== "" && query.data === "empty")
  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>Search the docs</DialogTitle>
        <DialogDescription>Search Keyframery&apos;s docs</DialogDescription>
      </DialogHeader>
      <DialogContent className="top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0 sm:max-w-xl" showCloseButton={false}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search the docs" value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>{!search ? "Type to search." : searching ? "Searching…" : "Nothing matches that. Try a component name, like Dialog."}</CommandEmpty>
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
                    <span className={r.type === "page" ? "font-medium" : "line-clamp-2 pl-3 text-muted-foreground"}>{plain(r.content)}</span>
                    {r.type === "page" && COMPONENT_OF[r.url] && <span className="ml-auto font-mono text-xs text-muted-foreground">{COMPONENT_OF[r.url]}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </>
  )
}
