"use client"

import * as React from "react"

import { joinWaitlist, type WaitlistState } from "@/app/(home)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function WaitlistForm({ source }: { source: string }) {
  const [state, action, pending] = React.useActionState<WaitlistState, FormData>(joinWaitlist, { status: "idle", message: "" })
  return (
    <form action={action} className="grid max-w-md gap-2">
      <Label htmlFor={`email-${source}`}>Email</Label>
      <div className="flex gap-2">
        <Input id={`email-${source}`} name="email" type="email" autoComplete="email" required placeholder="you@studio.dev" />
        <Button type="submit" disabled={pending}>Join the waitlist</Button>
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input type="hidden" name="source" value={source} />
      <p role="status" className={state.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
        {state.message}
      </p>
    </form>
  )
}
