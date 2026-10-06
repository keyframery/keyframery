"use client"

import { Button } from "@/components/ui/button"
import { toast, Toaster } from "@/components/ui/toast"

export function FixtureToaster() {
  return <Toaster />
}

export function BaseToastButton() {
  return (
    <Button variant="outline" data-testid="base-toast-trigger" onClick={() => toast.add({ title: "Copied", description: "Link copied to clipboard." })}>
      Copy link
    </Button>
  )
}
