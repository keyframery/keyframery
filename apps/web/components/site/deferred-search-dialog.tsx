"use client"

import { Dialog } from "@base-ui/react/dialog"
import type { SharedProps } from "fumadocs-ui/components/dialog/search"
import { lazy, Suspense, useState } from "react"

const SearchDialogContent = lazy(() => import("./search-dialog").then((module) => ({ default: module.SearchDialogContent })))

export function SearchDialog({ open, onOpenChange, dialogHandle }: SharedProps) {
  const [hasOpened, setHasOpened] = useState(open)

  if (open && !hasOpened) setHasOpened(true)

  // Fumadocs' detached search buttons need the dialog root registered before the first click.
  // Keep the search UI and client out of the initial bundle, then retain the query across opens.
  return (
    <Dialog.Root handle={dialogHandle} open={open} onOpenChange={onOpenChange}>
      {(open || hasOpened) && (
        <Suspense fallback={null}>
          <SearchDialogContent onOpenChange={onOpenChange} />
        </Suspense>
      )}
    </Dialog.Root>
  )
}
