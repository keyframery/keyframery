// After a search
// `announce` reads the title and description to screen readers when the empty state appears, so a search that finds nothing is heard, not only seen.
import * as React from "react"
import { SearchX } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function EmptySearch() {
  const [query, setQuery] = React.useState("velvet")
  if (!query) return <p className="text-[13px] text-muted-foreground">All 112 fabrics</p>
  return (
    <Empty announce className="max-w-[420px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No fabrics match “{query}”</EmptyTitle>
        <EmptyDescription>Check the spelling, or look through the swatch book by colour.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" onClick={() => setQuery("")}>Clear search</Button>
      </EmptyContent>
    </Empty>
  )
}
